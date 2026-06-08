"""Tamper-evidence proof for the RecallOps Cortex audit chain.

Demonstrates that the signed hash-chain catches BOTH:
  1. a naive edit (no recompute)                 -> broken at the hash-chain layer
  2. a sophisticated edit + full chain recompute -> broken at the SIGNATURE layer

(2) is the property a plain hash chain does NOT have: an attacker who can reach
the store and knows the public hash formula can recompute every hash — but
cannot forge the HMAC signatures without the server signing key. Run offline:

    python backend/scripts/tamper_test.py    ->  TAMPER TEST: PASS
"""
import hashlib
import hmac
import os
import sys

sys.path.insert(0, os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

from app import audit  # noqa: E402


def build_chain() -> audit.AuditLog:
    log = audit.AuditLog()
    log.append(recall_id="F-1142-2026", actor_type="system", actor_name="openFDA poller",
               event_type="RECALL_DETECTED", label="Recall F-1142-2026 ingested (live)")
    log.append(recall_id="F-1142-2026", actor_type="agent", actor_name="Gemini Agent",
               event_type="PLAN_DRAFTED", label="6 actions drafted")
    log.append(recall_id="F-1142-2026", actor_type="human", actor_name="Operator",
               event_type="ACTION_APPROVED", label="Approved: Stop-sale on affected lots")
    return log


def attacker_recompute(events, wrong_key=b"attacker-guessed-key"):
    """Simulate an attacker WITHOUT the signing key: recompute every hash after
    an edit (they know the public formula) and re-sign with a guessed key."""
    prev = audit.AuditLog.GENESIS
    for e in events:
        e["prev_hash"] = prev
        e["hash"] = audit.event_hash(prev, e)
        e["sig"] = hmac.new(wrong_key, e["hash"].encode(), hashlib.sha256).hexdigest()
        prev = e["hash"]


def main() -> int:
    # 0) clean chain verifies
    log = build_chain()
    v = log.verify()
    print(f"[clean]            intact={v['intact']} signed={v['signed']} key_id={v['key_id']} head={v['head'][:16]}…")
    assert v["intact"] is True and v["signed"] is True

    # 1) naive tamper — edit a label, do not recompute
    log1 = build_chain()
    log1._events[2]["label"] = "Approved: SECRETLY DOUBLED THE PAYOUT"
    v1 = log1.verify()
    print(f"[naive tamper]     intact={v1['intact']} broken_at={v1.get('broken_at')} reason={v1.get('reason')}")
    assert v1["intact"] is False and v1["reason"] == "hash-chain"

    # 2) sophisticated tamper — edit + full hash recompute, but no signing key
    log2 = build_chain()
    log2._events[2]["label"] = "Approved: SECRETLY DOUBLED THE PAYOUT"
    attacker_recompute(log2._events)
    v2 = log2.verify()
    print(f"[recompute tamper] intact={v2['intact']} broken_at={v2.get('broken_at')} reason={v2.get('reason')}")
    assert v2["intact"] is False and v2["reason"] == "signature"

    print("TAMPER TEST: PASS — naive edits caught by the chain, recomputed forgeries caught by the signature")
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
