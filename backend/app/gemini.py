"""RecallOps Cortex — Gemini 3 reasoning adapter.

Live mode calls Gemini via google-genai (Vertex AI or API-key). Fallback mode
(no credentials) returns a deterministic, clearly-labelled plan so the whole
flow stays demoable offline. The OUTPUT SHAPE is identical in both modes.

Hard rule: the agent only ever DRAFTS actions. Nothing executes without human
approval — enforced in state.py, not here.
"""
from __future__ import annotations

import json
import time

from .config import get_settings

SYSTEM_PROMPT = (
    "You are RecallOps Cortex, a recall-containment agent. You reason over a "
    "REAL openFDA recall plus the retailer's operational warehouse to scope a "
    "blast radius and DRAFT containment actions. Rules: prefer exact lot/UPC "
    "matches; lower confidence for fuzzy product-description matches; cite "
    "evidence IDs for every recommendation; never execute external actions "
    "(everything is drafted for human approval); output strict JSON only."
)

# Canonical containment actions. The TYPES are fixed for a stable command-center
# UI; Gemini (or the fallback) writes the human-readable draft + rationale.
_ACTION_SPECS = [
    {"type": "STOP_SALE", "title": "Stop-sale on affected lots", "owner": "Store Operations",
     "priority": "critical", "risk": "high", "evidence_ids": ["ev_inv", "ev_recall"]},
    {"type": "SHELF_PULL", "title": "Shelf pull & quarantine", "owner": "Store Managers",
     "priority": "critical", "risk": "medium", "evidence_ids": ["ev_inv", "ev_loc"]},
    {"type": "SUPPLIER_HOLD", "title": "Supplier hold & shipment divert", "owner": "Procurement",
     "priority": "high", "risk": "medium", "evidence_ids": ["ev_ship", "ev_recall"]},
    {"type": "CUSTOMER_NOTICE", "title": "Customer notification (consented only)", "owner": "Customer Care",
     "priority": "high", "risk": "high", "evidence_ids": ["ev_sales", "ev_cust"]},
    {"type": "REPLACEMENT_PO", "title": "Replacement procurement", "owner": "Procurement",
     "priority": "medium", "risk": "low", "evidence_ids": ["ev_inv"]},
    {"type": "COMPLIANCE_REPORT", "title": "Audit-ready compliance report", "owner": "Compliance",
     "priority": "medium", "risk": "low", "evidence_ids": ["ev_recall", "ev_inv", "ev_sales", "ev_ship"]},
]


def _scope(spec_type: str, st: dict) -> str:
    s = st
    return {
        "STOP_SALE": f'{s["locationsAffected"]} locations · {s["skuCount"]} SKUs · {s["unitsInventory"]} units',
        "SHELF_PULL": f'{s["criticalStores"]} critical stores first · then {s["locationsAffected"] - s["criticalStores"]} remaining',
        "SUPPLIER_HOLD": f'{s["supplierHolds"]} suppliers · {s["shipmentsInTransit"]} shipments · {s["unitsInTransit"]} units',
        "CUSTOMER_NOTICE": f'{s["customersToNotify"]} customers · email/SMS · opt-in only ({s["customersSuppressed"]} suppressed)',
        "REPLACEMENT_PO": f'alternate supplier · backfill {s["criticalStores"]} critical sites first',
        "COMPLIANCE_REPORT": "Full recall · evidence bundle · timeline",
    }[spec_type]


def _draft_text(spec_type: str, recall: dict, st: dict) -> str:
    lots = ", ".join(recall.get("lotCodes") or []) or "affected lots"
    firm = recall.get("recallingFirm") or "the recalling firm"
    return {
        "STOP_SALE": (
            f"Block point-of-sale for the {st['skuCount']} affected SKUs (lots {lots}) "
            f"across all {st['locationsAffected']} locations immediately. Registers reject "
            f"scans of the listed lots; {st['unitsInventory']} units are in scope."),
        "SHELF_PULL": (
            f"Assign shelf-pull tasks to {st['locationsAffected']} store managers, prioritising "
            f"{st['criticalStores']} critical-tier locations. Move units to quarantine and "
            f"photograph lot codes for audit."),
        "SUPPLIER_HOLD": (
            f"Place a receiving hold on {firm} and divert {st['shipmentsInTransit']} in-transit "
            f"shipments ({st['unitsInTransit']} units) to quarantine docks. Notify supplier contacts."),
        "CUSTOMER_NOTICE": (
            f"Notify {st['customersToNotify']} customers who purchased affected lots AND consented "
            f"to contact, via preferred channel. Suppress {st['customersSuppressed']} non-consented "
            f"records. Recall + refund instructions only — no marketing."),
        "REPLACEMENT_PO": (
            f"Raise replacement purchase orders with an alternate supplier to backfill pulled "
            f"inventory at the {st['criticalStores']} critical locations first."),
        "COMPLIANCE_REPORT": (
            f"Assemble an audit-ready report: openFDA source {recall.get('recallId','')}, Fivetran "
            f"sync evidence, BigQuery blast-radius queries, approved actions, and the full timeline."),
    }[spec_type]


def build_actions(recall: dict, stats: dict) -> list[dict]:
    """Deterministic canonical action skeletons with computed scope + drafts."""
    actions = []
    for i, spec in enumerate(_ACTION_SPECS, start=1):
        actions.append({
            "id": f"act_{i}",
            "recallId": recall.get("recallId", ""),
            "type": spec["type"],
            "title": spec["title"],
            "owner": spec["owner"],
            "priority": spec["priority"],
            "risk": spec["risk"],
            "scope": _scope(spec["type"], stats),
            "evidenceIds": spec["evidence_ids"],
            "draft": _draft_text(spec["type"], recall, stats),
            "approvalState": "pending",
            "status": "drafted",
            "executedAt": None,
        })
    return actions


def _freshness_line(context: dict) -> dict:
    """Honest freshness line — reflects the REAL sync clock, not a fixed claim."""
    limit_min = context.get("freshness_limit_min", 15)
    fresh = context.get("freshness_sec")
    if fresh is None:
        return {"t": "Warehouse not yet synced — reasoning on last-known data (freshness unknown)", "tone": "warn"}
    if fresh <= limit_min * 60:
        return {"t": f"Confirmed Fivetran freshness {fresh}s — within {limit_min}-min limit", "tone": "ok"}
    return {"t": f"WARNING: warehouse freshness {fresh}s exceeds {limit_min}-min limit — flagged for review", "tone": "warn"}


def _lots_line(recall: dict, stats: dict) -> dict:
    if stats.get("lotsSynthetic"):
        return {"t": f"No internal lot match for recalled codes — scoped to demo lots ({stats['skuCount']} SKUs)", "tone": "warn"}
    return {"t": f"Matched recalled lots to {stats['skuCount']} internal SKUs", "tone": "dim"}


def _fallback_reasoning(recall: dict, stats: dict, note: str, context: dict | None = None) -> list[dict]:
    context = context or {}
    return [
        {"t": f"Parsed openFDA recall {recall.get('recallId','')} — {recall.get('classification','')}", "tone": "cyan"},
        {"t": f"Product: {(recall.get('productDescription') or '')[:70]}", "tone": "dim"},
        {"t": f"Recalling firm {recall.get('recallingFirm','')} — reason: {(recall.get('reason') or '')[:60]}", "tone": "dim"},
        _freshness_line(context),
        _lots_line(recall, stats),
        {"t": f"Inventory: {stats['unitsInventory']} units across {stats['locationsAffected']} locations", "tone": "warn"},
        {"t": f"POS: {stats['unitsSold']} units sold · {stats['customersToNotify']} consented customers", "tone": "warn"},
        {"t": f"Shipments: {stats['shipmentsInTransit']} in transit ({stats['unitsInTransit']} units)", "tone": "warn"},
        {"t": "Drafted 6 containment actions — all require human approval", "tone": "cyan"},
        {"t": "Awaiting human approval", "tone": "ok"},
    ]


def _client():
    from google import genai  # lazy import — only needed in live mode
    s = get_settings()
    if s.use_vertex and s.google_cloud_project:
        return genai.Client(vertexai=True, project=s.google_cloud_project, location=s.google_cloud_region)
    return genai.Client(api_key=s.google_api_key)


def draft_plan(context: dict) -> dict:
    """Return {reasoning, actions, model, latency_ms, live, note}.

    `context` carries the REAL recall, computed blast-radius stats, evidence,
    and risk rules. Live mode asks Gemini to write the reasoning trace; the
    action skeletons stay deterministic so the UI is stable and auditable.
    """
    s = get_settings()
    recall = context["recall"]
    stats = context["stats"]
    actions = build_actions(recall, stats)

    if not s.gemini_ready:
        return {
            "reasoning": _fallback_reasoning(recall, stats, "gemini-not-configured", context),
            "actions": actions,
            "model": "deterministic-fallback",
            "latency_ms": 0,
            "live": False,
            "note": "Gemini not configured — deterministic reasoning (clearly labelled).",
        }

    try:
        client = _client()
        prompt = (
            f"{SYSTEM_PROMPT}\n\nCONTEXT:\n{json.dumps(context, ensure_ascii=False)[:12000]}\n\n"
            "Return JSON: {\"reasoning\":[{\"t\":str,\"tone\":\"cyan|dim|ok|warn\"}]}. "
            "8-11 concise trace lines describing how you scoped this REAL recall over the warehouse."
        )
        t0 = time.perf_counter()
        resp = client.models.generate_content(
            model=s.gemini_model,
            contents=prompt,
            config={"response_mime_type": "application/json", "temperature": 0.4},
        )
        latency = round((time.perf_counter() - t0) * 1000)
        data = json.loads(resp.text)
        reasoning = data.get("reasoning") or _fallback_reasoning(recall, stats, "empty", context)
        return {
            "reasoning": reasoning,
            "actions": actions,
            "model": s.gemini_model,
            "latency_ms": latency,
            "live": True,
            "note": f"Live {s.gemini_model} reasoning over the real recall + blast radius.",
        }
    except Exception as e:  # never break the demo on an LLM hiccup
        return {
            "reasoning": _fallback_reasoning(recall, stats, f"gemini-error: {e}", context),
            "actions": actions,
            "model": "deterministic-fallback",
            "latency_ms": 0,
            "live": False,
            "note": f"Gemini call failed, used fallback: {e}",
        }
