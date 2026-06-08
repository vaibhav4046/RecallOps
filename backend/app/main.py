"""RecallOps Cortex — Cloud Run API (FastAPI).

One service exposing the structured endpoints the frontend calls. The recall
source (openFDA) is live immediately; cloud integrations (Gemini 3, BigQuery,
Fivetran) activate when credentials are present and otherwise fall back to
clearly-labelled seeded data. Every response carries a trace id.
"""
from __future__ import annotations

import time
import uuid
from contextlib import asynccontextmanager
from datetime import datetime, timezone

from fastapi import FastAPI, Request
from fastapi.concurrency import run_in_threadpool
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse

from . import openfda, telemetry
from .config import get_settings
from .state import APP


@asynccontextmanager
async def lifespan(app: FastAPI):
    # Pull a REAL openFDA recall at boot, sync, and draft an initial plan so the
    # frontend hydrates a fully-populated, real state on first paint.
    telemetry.init()
    await APP.ensure_recall()
    try:
        APP.trigger_sync()
        APP.run_agent()
    except Exception:
        pass
    yield


app = FastAPI(title="RecallOps Cortex API", version="0.1.0", lifespan=lifespan)

_settings = get_settings()
_origins = (
    ["*"]
    if _settings.cors_origins.strip() == "*"
    else [o.strip() for o in _settings.cors_origins.split(",")]
)
app.add_middleware(
    CORSMiddleware,
    allow_origins=_origins,
    allow_methods=["*"],
    allow_headers=["*"],
    expose_headers=["x-trace-id", "x-elapsed-ms"],
)


def _now_iso() -> str:
    return datetime.now(timezone.utc).isoformat()


def _tid(request: Request) -> str:
    return getattr(request.state, "trace_id", "tr_unknown")


def _ok(request: Request, **payload) -> dict:
    return {"ok": True, "trace_id": _tid(request), "ts": _now_iso(), **payload}


@app.middleware("http")
async def trace_mw(request: Request, call_next):
    trace_id = "tr_" + uuid.uuid4().hex[:12]
    request.state.trace_id = trace_id
    start = time.perf_counter()
    response = await call_next(request)
    response.headers["x-trace-id"] = trace_id
    response.headers["x-elapsed-ms"] = str(round((time.perf_counter() - start) * 1000, 1))
    return response


# --------------------------------------------------------------------------- #
# Health + recall intake
# --------------------------------------------------------------------------- #
@app.get("/api/health")
async def health(request: Request):
    s = get_settings()
    return _ok(
        request,
        service="recallops-cortex-api",
        version=app.version,
        mode=s.mode,
        integrations=APP.live_integrations(),
        gemini_model=s.gemini_model if s.gemini_ready else None,
        recall_id=APP.recall["recallId"] if APP.recall else None,
        recall_live=bool(APP.recall and APP.recall.get("_real")),
        freshness_sec=APP.fivetran_status()["freshnessSec"],
    )


@app.get("/api/recalls/latest")
async def recalls_latest(request: Request, classification: str = "Class I"):
    try:
        recall = await openfda.get_latest_recall(classification=classification)
    except Exception as e:
        return JSONResponse(status_code=502, content={
            "ok": False, "error": f"openFDA fetch failed: {e}", "trace_id": _tid(request)})
    return _ok(request, recall=recall, source="openFDA", live=True, fetched_at=_now_iso())


@app.post("/api/recalls/select")
async def recalls_select(request: Request):
    body = {}
    try:
        body = await request.json()
    except Exception:
        pass
    classification = body.get("classification", "Class I")
    if body.get("recall"):
        rec = body["recall"]
        if not rec.get("recallId"):
            return JSONResponse(status_code=422, content={
                "ok": False, "error": "recall.recallId is required", "trace_id": _tid(request)})
        APP.set_recall(rec, trace_id=_tid(request))
    else:
        try:
            recall = await openfda.get_latest_recall(classification=classification)
        except Exception as e:
            return JSONResponse(status_code=502, content={
                "ok": False, "error": f"openFDA fetch failed: {e}", "trace_id": _tid(request)})
        if not recall:
            return JSONResponse(status_code=404, content={
                "ok": False, "error": f"no {classification} recall found", "trace_id": _tid(request)})
        APP.set_recall(recall, trace_id=_tid(request))
    stats = (await run_in_threadpool(APP.blast))["stats"]
    return _ok(request, recall=APP.recall, stats=stats)


# --------------------------------------------------------------------------- #
# Fivetran sync
# --------------------------------------------------------------------------- #
@app.post("/api/fivetran/sync")
async def fivetran_sync(request: Request):
    s = get_settings()
    if s.fivetran_ready:
        try:
            from . import fivetran
            connectors = await fivetran.sync_all()
            APP.synced_at = _now_iso()
            return _ok(request, connectors=connectors, syncedAt=APP.synced_at, live=True)
        except Exception as e:
            return _ok(request, live=False, note=f"fivetran live failed: {e}",
                       **APP.trigger_sync(trace_id=_tid(request)))
    return _ok(request, **APP.trigger_sync(trace_id=_tid(request)))


@app.get("/api/fivetran/status")
async def fivetran_status(request: Request):
    s = get_settings()
    if s.fivetran_ready:
        try:
            from . import fivetran
            connectors = await fivetran.list_connectors()
            return _ok(request, connectors=connectors, syncedAt=APP.synced_at, live=True)
        except Exception as e:
            return _ok(request, live=False, note=f"fivetran live failed: {e}", **APP.fivetran_status())
    return _ok(request, **APP.fivetran_status())


# --------------------------------------------------------------------------- #
# Scope / agent / actions
# --------------------------------------------------------------------------- #
@app.post("/api/blast-radius")
async def blast_radius_ep(request: Request):
    br = await run_in_threadpool(APP.blast)
    return _ok(request, stats=br["stats"], evidence=br["evidence"],
               job_ids=br.get("job_ids"),
               recall_id=APP.recall["recallId"] if APP.recall else None)


@app.post("/api/agent/run")
async def agent_run(request: Request):
    try:
        result = await run_in_threadpool(lambda: APP.run_agent(trace_id=_tid(request)))
    except RuntimeError as e:
        return JSONResponse(status_code=409, content={
            "ok": False, "error": str(e), "trace_id": _tid(request)})
    return _ok(request, **result)


@app.get("/api/agent/runs")
async def agent_runs(request: Request):
    return _ok(request, runs=APP.runs)


@app.post("/api/actions/{action_id}/approve")
async def approve(action_id: str, request: Request):
    try:
        a = APP.approve_action(action_id, trace_id=_tid(request))
    except KeyError:
        return JSONResponse(status_code=404, content={
            "ok": False, "error": f"unknown action {action_id}", "trace_id": _tid(request)})
    return _ok(request, action=a, contained=APP.contained())


@app.post("/api/actions/{action_id}/reject")
async def reject(action_id: str, request: Request):
    try:
        a = APP.reject_action(action_id, trace_id=_tid(request))
    except KeyError:
        return JSONResponse(status_code=404, content={
            "ok": False, "error": f"unknown action {action_id}", "trace_id": _tid(request)})
    return _ok(request, action=a, contained=APP.contained())


# --------------------------------------------------------------------------- #
# Audit + report + full state hydration
# --------------------------------------------------------------------------- #
@app.get("/api/audit/{recall_id}")
async def audit_timeline(recall_id: str, request: Request):
    return _ok(request, events=APP.audit.list(recall_id), integrity=APP.audit.verify())


@app.post("/api/report/{recall_id}")
async def report(recall_id: str, request: Request):
    rep = await run_in_threadpool(lambda: APP.report(trace_id=_tid(request)))
    return _ok(request, report=rep)


@app.get("/api/ecosystem")
async def ecosystem(request: Request):
    return _ok(request, partners=APP.ecosystem())


@app.get("/api/state")
async def full_state(request: Request):
    """One-shot hydration snapshot for the frontend."""
    s = get_settings()
    br = await run_in_threadpool(APP.blast)
    return _ok(
        request,
        mode=s.mode,
        integrations=APP.live_integrations(),
        recall=APP.recall,
        stats=br["stats"],
        evidence=br["evidence"],
        actions=APP.actions,
        runs=APP.runs,
        toolTrace=APP.last_tool_trace,
        ecosystem=APP.ecosystem(),
        fivetran=APP.fivetran_status(),
        audit=APP.audit.list(APP.recall["recallId"] if APP.recall else None),
        auditIntegrity=APP.audit.verify(),
        contained=APP.contained(),
    )
