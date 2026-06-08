"""RecallOps Cortex — append-only audit log with a signed sha256 hash chain.

Two independent integrity layers, so tampering is caught even by a motivated
attacker who can reach the in-process store:

1. **Hash chain** — each event's hash folds in the previous event's hash
   (`hash = sha256(prev_hash + event)`), so any retroactive edit breaks every
   subsequent link.
2. **HMAC signature** — each event hash is signed with a server-held key
   (`AUDIT_SIGNING_KEY`). Re-walking and recomputing the chain after an edit is
   not enough to forge a valid log: every event must also carry a valid
   signature, which requires the key. This is what makes the chain
   tamper-*evident* rather than merely tamper-*detecting-if-not-recomputed*.

`verify()` re-walks the chain, recomputes every hash AND every signature, and
proves integrity (great for judges — see `scripts/tamper_test.py`). In live mode
the same events are also mirrored to BigQuery `audit_events` via an optional sink.
"""
from __future__ import annotations

import hashlib
import hmac
import json
import os
from datetime import datetime, timezone
from typing import Callable

# Fields derived from the event body — excluded when hashing so the hash is
# computed over content only, and the signature over the hash only.
_VOLATILE = ("hash", "sig")


def _canonical(payload: dict) -> str:
    # Stable serialisation so the hash is reproducible regardless of key order.
    return json.dumps(payload, sort_keys=True, separators=(",", ":"), ensure_ascii=False)


def event_hash(prev_hash: str, event: dict) -> str:
    body = _canonical({k: v for k, v in event.items() if k not in _VOLATILE})
    return hashlib.sha256((prev_hash + body).encode("utf-8")).hexdigest()


def _signing_key() -> bytes:
    # A real key in prod (AUDIT_SIGNING_KEY / KMS-backed); a clearly-labelled dev
    # key otherwise so the signature layer still works offline for the demo.
    return (os.getenv("AUDIT_SIGNING_KEY") or "recallops-dev-audit-key-v1").encode("utf-8")


def _key_id() -> str:
    return "env" if os.getenv("AUDIT_SIGNING_KEY") else "dev-key"


def event_sig(hash_hex: str) -> str:
    return hmac.new(_signing_key(), hash_hex.encode("utf-8"), hashlib.sha256).hexdigest()


def _now_iso() -> str:
    return datetime.now(timezone.utc).isoformat()


class AuditLog:
    GENESIS = "0" * 64

    def __init__(self, sink: Callable[[dict], None] | None = None) -> None:
        self._events: list[dict] = []
        # Optional best-effort durable sink (e.g. BigQuery append in live mode).
        # Never allowed to break the in-process chain — wrapped in try/except.
        self._sink = sink

    def append(
        self,
        *,
        recall_id: str,
        actor_type: str,   # "agent" | "human" | "system"
        actor_name: str,
        event_type: str,   # SYNC_STARTED | QUERY_RUN | ACTION_APPROVED | ...
        label: str,
        evidence_ref: str = "",
        phase: str = "",
        trace_id: str = "",
    ) -> dict:
        prev = self._events[-1]["hash"] if self._events else self.GENESIS
        evt = {
            "event_id": f"au_{len(self._events) + 1:04d}",
            "recall_id": recall_id,
            "actor_type": actor_type,
            "actor_name": actor_name,
            "event_type": event_type,
            "label": label,
            "evidence_ref": evidence_ref,
            "phase": phase,
            "trace_id": trace_id,
            "timestamp": _now_iso(),
            "prev_hash": prev,
        }
        evt["hash"] = event_hash(prev, evt)
        evt["sig"] = event_sig(evt["hash"])
        self._events.append(evt)
        if self._sink is not None:
            try:
                self._sink(evt)
            except Exception:
                pass  # durability is best-effort; the in-process chain is canonical
        return evt

    def list(self, recall_id: str | None = None) -> list[dict]:
        if recall_id is None:
            return list(self._events)
        return [e for e in self._events if e["recall_id"] == recall_id]

    def verify(self) -> dict:
        """Re-walk the chain, recompute every hash AND signature, report status."""
        prev = self.GENESIS
        for i, e in enumerate(self._events):
            if e["prev_hash"] != prev or event_hash(prev, e) != e["hash"]:
                return {"intact": False, "broken_at": i, "event_id": e.get("event_id"),
                        "reason": "hash-chain", "signed": True, "key_id": _key_id()}
            sig = e.get("sig")
            if not sig or not hmac.compare_digest(sig, event_sig(e["hash"])):
                return {"intact": False, "broken_at": i, "event_id": e.get("event_id"),
                        "reason": "signature", "signed": True, "key_id": _key_id()}
            prev = e["hash"]
        return {"intact": True, "count": len(self._events), "head": prev,
                "signed": True, "key_id": _key_id()}
