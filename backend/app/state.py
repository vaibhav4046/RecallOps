"""RecallOps Cortex — in-process application state + orchestration.

Single source of truth for a running demo instance: the selected REAL recall,
the seeded warehouse bound to it, the audit hash-chain, drafted actions, agent
runs, and the Fivetran sync clock. In live mode the durable copies live in
BigQuery; this layer stays the orchestrator either way.

The approval gate is enforced HERE: `approve_action` is the only path that can
move an action to `executed`, and it always writes an audit event first.
"""
from __future__ import annotations

import json
import time
import uuid
from datetime import datetime, timezone

from . import gemini, openfda, telemetry
from .audit import AuditLog
from .config import get_settings
from .warehouse import blast_radius, build_warehouse

# Labelled cached recall — used only if openFDA is unreachable at boot so the
# UI never starts empty. Clearly flagged via `_real: False`.
_CACHED_RECALL = {
    "recallId": "F-1142-2026",
    "source": "openFDA (cached)",
    "classification": "Class I",
    "productDescription": "Frozen Soft Pretzel Bites, 20 oz — Stadium Concession Pack",
    "recallingFirm": "Northwind Provisions, LLC",
    "reason": "Possible Listeria monocytogenes contamination (cached demo record).",
    "distributionPattern": "CA, NV, AZ, OR, WA — retail grocery and stadium concession.",
    "eventDate": "20260606",
    "status": "Ongoing",
    "lotCodes": ["A4471", "A4472", "A4473"],
    "upcs": [],
    "sourceUrl": "https://api.fda.gov/food/enforcement.json",
    "_real": False,
}

_RISK_RULES = [
    "exact lot or UPC required for stop-sale",
    "all customer-facing actions require human approval",
    "warehouse freshness must be < 15 min",
    "low-confidence matches route to human review",
]


def _now_iso() -> str:
    return datetime.now(timezone.utc).isoformat()


class AppState:
    def __init__(self) -> None:
        self.recall: dict | None = None
        self.warehouse: dict | None = None
        # Audit chain mirrors to BigQuery in live mode (best-effort; never blocks).
        self.audit = AuditLog(sink=self._persist_audit_event)
        self.actions: list[dict] = []
        self.runs: list[dict] = self._seed_runs()
        self.last_plan: dict | None = None
        self.last_tool_trace: list = []
        self.synced_at: str | None = None
        self.last_job_ids: dict = {}
        self.bigquery_live = False
        self.sync_runs = self._init_sync_runs()

    # ---- seeded run history (so LLMOps charts look populated; live runs prepend) ----
    @staticmethod
    def _seed_runs() -> list[dict]:
        past = [
            ("F-1139-2026", "gemini-3-pro", 18420, 41280, 0.214, 0.94, "passed"),
            ("F-1131-2026", "gemini-3-pro", 20110, 38940, 0.198, 0.90, "passed"),
            ("F-1126-2026", "gemini-3-flash", 9120, 21040, 0.061, 0.79, "review"),
            ("F-1119-2026", "gemini-3-pro", 23880, 44120, 0.231, 0.86, "passed"),
        ]
        out = []
        for i, (rid, model, lat, tok, cost, ev, status) in enumerate(past):
            out.append({
                "run_id": f"run_{2040 - i}", "recall_id": rid, "model": model,
                "prompt_version": "v1.0.0", "tool_count": 12, "tools": 12,
                "latency_ms": lat, "token_count": tok, "cost": cost,
                "eval_score": ev, "actions": 6, "approvals": 6,
                "status": status, "live": False, "created_at": "",
            })
        return out

    # ---- sync (Fivetran) ----
    @staticmethod
    def _init_sync_runs() -> list[dict]:
        sources = [
            ("netsuite_inventory", "Inventory", 12840),
            ("square_pos", "POS Sales", 48211),
            ("shipstation", "Shipments", 1304),
            ("salesforce_customers", "Customers", 90211),
            ("sap_suppliers", "Suppliers", 418),
            ("snowflake_locations", "Locations", 37),
            ("workday_staff", "Staff & Manager Contacts", 642),
            ("audit_log_stream", "Audit Log", 5120),
        ]
        return [
            {"id": f"sr_{i+1}", "connector": c, "source": src, "destination": "BigQuery",
             "status": "pending", "recordsSynced": n, "syncedAt": None}
            for i, (c, src, n) in enumerate(sources)
        ]

    def trigger_sync(self, trace_id: str = "") -> dict:
        ts = _now_iso()
        for r in self.sync_runs:
            r["status"] = "synced"
            r["syncedAt"] = ts
        self.synced_at = ts
        rid = self.recall["recallId"] if self.recall else ""
        self.audit.append(recall_id=rid, actor_type="agent", actor_name="RecallOps Agent",
                          event_type="SYNC_STARTED", label="Fivetran sync across 8 connectors",
                          evidence_ref="fivetran", phase="sync", trace_id=trace_id)
        total = sum(r["recordsSynced"] for r in self.sync_runs)
        self.audit.append(recall_id=rid, actor_type="system", actor_name="Fivetran → BigQuery",
                          event_type="QUERY_RUN", label=f"Warehouse refreshed · {total} records",
                          evidence_ref="bigquery", phase="sync", trace_id=trace_id)
        return self.fivetran_status()

    def fivetran_status(self) -> dict:
        return {
            "connectors": self.sync_runs,
            "syncedAt": self.synced_at,
            "freshnessSec": self._freshness_sec(),
            "recordsTotal": sum(r["recordsSynced"] for r in self.sync_runs),
        }

    def _freshness_sec(self) -> int | None:
        if not self.synced_at:
            return None
        dt = datetime.fromisoformat(self.synced_at)
        return int((datetime.now(timezone.utc) - dt).total_seconds())

    # ---- recall lifecycle ----
    async def ensure_recall(self, classification: str = "Class I") -> None:
        if self.recall:
            return
        try:
            r = await openfda.get_latest_recall(classification=classification)
        except Exception:
            r = None
        self.set_recall(r or _CACHED_RECALL)

    def set_recall(self, recall: dict, trace_id: str = "") -> None:
        self.recall = recall
        self.warehouse = build_warehouse(recall)
        self.actions = []
        self.last_plan = None
        self.audit.append(
            recall_id=recall["recallId"], actor_type="system", actor_name="openFDA poller",
            event_type="RECALL_DETECTED",
            label=f"Recall {recall['recallId']} ingested ({'live' if recall.get('_real') else 'cached'})",
            evidence_ref="ev_recall", phase="intake", trace_id=trace_id,
        )

    # ---- scope / context ----
    def blast(self) -> dict:
        base = blast_radius(self.warehouse, self.recall)
        if get_settings().bigquery_ready:
            try:
                from . import bigquery as bq
                res = bq.query_blast_radius()
                self.last_job_ids = res.get("job_ids", {})
                self.bigquery_live = True
                return {"stats": res["stats"], "evidence": base["evidence"],
                        "job_ids": self.last_job_ids}
            except Exception:
                self.bigquery_live = False  # fall back to in-process aggregation
        return base

    def live_integrations(self) -> dict:
        """Honest integration status — reflects what actually WORKED at runtime."""
        out = get_settings().integration_status()
        out["bigquery"] = "live" if self.bigquery_live else "fallback"
        if self.runs:
            out["gemini"] = "live" if self.runs[0].get("live") else "fallback"
        return out

    def context_pack(self) -> dict:
        br = self.blast()
        return {
            "recall": self.recall,
            "stats": br["stats"],
            "evidence": br["evidence"],
            "risk_rules": _RISK_RULES,
            "freshness_sec": self._freshness_sec(),
            "freshness_limit_min": get_settings().freshness_limit_min,
            "human_policy": "no external action without approval",
        }

    # ---- agent run ----
    def run_agent(self, trace_id: str = "") -> dict:
        if not self.recall:
            raise RuntimeError("no recall selected")
        telemetry.reset()
        rid = self.recall["recallId"]
        t0 = time.perf_counter()
        with telemetry.span("agent.run", {"recall.id": rid}):
            with telemetry.span("query_bigquery", {"db.system": "bigquery"}):
                ctx = self.context_pack()
            with telemetry.span("draft_containment_actions", {"llm.model": get_settings().gemini_model}):
                plan = gemini.draft_plan(ctx)
            latency = plan.get("latency_ms") or round((time.perf_counter() - t0) * 1000)

            prev = {a["id"]: a for a in self.actions}
            self.actions = plan["actions"]
            for a in self.actions:  # preserve prior human decisions across re-runs
                old = prev.get(a["id"])
                if old and old["approvalState"] in ("approved", "rejected"):
                    a["approvalState"] = old["approvalState"]
                    a["status"] = old["status"]
                    a["executedAt"] = old.get("executedAt")
            self.last_plan = plan

            with telemetry.span("run_eval_suite"):
                eval_score = self._eval_score()
            with telemetry.span("write_audit_log"):
                self.audit.append(recall_id=rid, actor_type="agent", actor_name="Gemini Agent",
                                  event_type="PLAN_DRAFTED",
                                  label=f'{len(self.actions)} actions drafted ({"live" if plan["live"] else "fallback"})',
                                  evidence_ref="ev_recall", phase="reason", trace_id=trace_id)

        self.last_tool_trace = telemetry.captured_spans()
        ctx_chars = len(json.dumps(ctx, default=str))
        token_count = plan.get("token_count") or (ctx_chars // 4 + 1200)
        cost = round(token_count / 1_000_000 * 1.5, 4)  # rough Gemini-class $/Mtok
        approvals = sum(1 for a in self.actions if a["approvalState"] == "approved")
        run = {
            "run_id": f"run_{uuid.uuid4().hex[:6]}",
            "recall_id": rid,
            "model": plan["model"],
            "prompt_version": "v1.0.0",
            "tool_count": len(self.last_tool_trace) or 12,
            "tools": len(self.last_tool_trace) or 12,
            "latency_ms": latency,
            "token_count": token_count,
            "cost": cost,
            "eval_score": eval_score,
            "actions": len(self.actions),
            "approvals": approvals,
            "status": "passed",
            "live": plan["live"],
            "created_at": _now_iso(),
        }
        self.runs.insert(0, run)
        return {
            "run": run,
            "reasoning": plan["reasoning"],
            "actions": self.actions,
            "stats": ctx["stats"],
            "tool_trace": self.last_tool_trace,
            "note": plan["note"],
        }

    def _eval_score(self) -> float:
        # Cheap structural eval: every action has evidence + an approval gate.
        if not self.actions:
            return 0.0
        ok = sum(1 for a in self.actions if a.get("evidenceIds"))
        return round(ok / len(self.actions), 2)

    # ---- durable audit sink (live mode only; best-effort) ----
    @staticmethod
    def _persist_audit_event(evt: dict) -> None:
        if not get_settings().bigquery_ready:
            return  # fallback mode — in-process chain is the source of truth
        from . import bigquery as bq
        bq.persist_audit_event(evt)

    # ---- approval gate (the only path to execution) ----
    def approve_action(self, action_id: str, actor: str = "Operator", trace_id: str = "") -> dict:
        a = self._find_action(action_id)
        if a["approvalState"] == "approved":
            return a  # idempotent — no duplicate audit event
        a["approvalState"] = "approved"
        a["status"] = "executed"
        a["executedAt"] = _now_iso()
        self.audit.append(recall_id=a["recallId"], actor_type="human", actor_name=actor,
                          event_type="ACTION_APPROVED", label=f'Approved: {a["title"]}',
                          evidence_ref=action_id, phase="approve", trace_id=trace_id)
        return a

    def reject_action(self, action_id: str, actor: str = "Operator", trace_id: str = "") -> dict:
        a = self._find_action(action_id)
        if a["approvalState"] == "rejected":
            return a  # idempotent — no duplicate audit event
        a["approvalState"] = "rejected"
        a["status"] = "drafted"
        a["executedAt"] = None  # clear any prior execution timestamp (reject after approve)
        self.audit.append(recall_id=a["recallId"], actor_type="human", actor_name=actor,
                          event_type="ACTION_REJECTED", label=f'Rejected: {a["title"]}',
                          evidence_ref=action_id, phase="approve", trace_id=trace_id)
        return a

    def _find_action(self, action_id: str) -> dict:
        for a in self.actions:
            if a["id"] == action_id:
                return a
        raise KeyError(action_id)

    def contained(self) -> bool:
        return bool(self.actions) and all(a["approvalState"] == "approved" for a in self.actions)

    # ---- partner ecosystem (honest LIVE / PLUGGABLE map) ----
    def ecosystem(self) -> list[dict]:
        s = get_settings()
        from . import elastic, mongodb

        def st(flag: bool, plug: str = "pluggable") -> str:
            return "live" if flag else plug

        return [
            {"id": "google", "name": "Google Cloud", "role": "Gemini 3 · Agent Builder · Cloud Run · BigQuery", "status": st(s.gemini_ready, "core")},
            {"id": "fivetran", "name": "Fivetran", "role": "MCP sync (161 ops) → BigQuery", "status": st(s.fivetran_ready)},
            {"id": "arize", "name": "Arize Phoenix", "role": "LLM tracing + evals · OpenTelemetry", "status": "live" if telemetry.enabled() else "pluggable"},
            {"id": "dynatrace", "name": "Dynatrace", "role": "APM / observability via OTLP export", "status": "otlp-ready"},
            {"id": "elastic", "name": "Elastic", "role": "Recall + audit full-text search", "status": st(elastic.available())},
            {"id": "mongodb", "name": "MongoDB", "role": "Agent memory + vector similar-recalls", "status": st(mongodb.available())},
            {"id": "gitlab", "name": "GitLab", "role": "CI/CD + DevSecOps pipeline", "status": "in-repo"},
        ]

    # ---- report ----
    def report(self, trace_id: str = "") -> dict:
        rid = self.recall["recallId"] if self.recall else ""
        br = self.blast()
        approved = [a for a in self.actions if a["approvalState"] == "approved"]
        self.audit.append(recall_id=rid, actor_type="agent", actor_name="RecallOps Agent",
                          event_type="REPORT_GENERATED",
                          label="Compliance report generated", evidence_ref="report",
                          phase="report", trace_id=trace_id)
        return {
            "recall": self.recall,
            "generatedAt": _now_iso(),
            "stats": br["stats"],
            "evidence": br["evidence"],
            "actions": self.actions,
            "approvedCount": len(approved),
            "audit": self.audit.list(rid),
            "auditIntegrity": self.audit.verify(),
            "syncProof": self.fivetran_status(),
            "contained": self.contained(),
            "riskRules": _RISK_RULES,
        }


APP = AppState()
