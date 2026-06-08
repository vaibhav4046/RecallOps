# RecallOps Cortex — Product Research & Architectural Enhancements

> **Author:** Product / AI Solutions Architecture review · **Date:** 2026-06-08
> **Scope:** Competitive product research and a prioritized enhancement roadmap for
> RecallOps Cortex — the AI-powered FDA recall containment command center
> (React frontend · FastAPI · BigQuery via Fivetran · Gemini 3 reasoning ·
> human-in-the-loop approval gate · sha256 hash-chain audit).

This document analyzes the current data flow and architecture, then proposes
high-impact features, UI / data-visualization upgrades, and backend performance
work. Items are tagged **P0 / P1 / P2** (priority) and **S / M / L** (effort).

---

## 1. Executive summary

RecallOps Cortex already nails the hard, differentiated parts of the category: a
**real** openFDA recall source, a genuine blast-radius aggregation over an
operational warehouse, a **server-enforced human approval gate**, an
append-only **sha256 hash-chain audit**, and honest **Live / Fallback** badging.
That is a strong spine.

To become *significantly more competitive*, the platform should evolve from a
**single-recall demo** into a **continuous, multi-recall operations product**
with three strategic moves:

1. **From one recall → a triage queue.** Real food-safety teams juggle many
   concurrent recalls. A prioritized, risk-scored multi-recall command queue is
   the single biggest jump in perceived product maturity.
2. **From "draft actions" → "safely execute approved actions."** Today actions
   are drafted and an approval only flips a status field. The defensible next
   step is **real, sandboxed, fully-gated execution** (customer notices,
   supplier holds, replacement POs) through integration adapters — still behind
   the same approval gate, now with proof-of-delivery in the audit chain.
3. **From in-memory demo → durable, anchored system of record.** Persist state
   and the audit chain (and externally anchor the chain head) so the
   tamper-evidence and "operational memory" claims hold up under real scrutiny.

The features below are ordered so that each one increases either **trust**
(auditability, accuracy) or **leverage** (more recalls handled per operator),
which are the two axes buyers and judges actually evaluate.

---

## 2. Current data flow & architecture (as-built analysis)

```
openFDA (live)  ─▶ FastAPI intake ─▶ build_warehouse(recall)  [seeded, bound to real lots]
                                          │
Fivetran ─▶ BigQuery (live mode) ◀────────┘  blast_radius()  ─▶ stats + evidence
                                          │
                                          ▼
                              Gemini 3 draft_plan(context)  ─▶ deterministic action skeletons
                                          │                      + LLM reasoning trace
                                          ▼
                              Human approval gate (state.approve_action)
                                          │
                                          ▼
                              Audit hash-chain (in-process) ─▶ Compliance report
```

**Strengths to preserve**
- **Honest degradation.** Every integration runs live-or-fallback and is badged;
  the demo never hard-breaks. This is a real trust asset — keep it as a design
  principle for every new integration.
- **Deterministic action skeletons + LLM narration.** Action *types* are fixed
  for a stable, auditable UI while Gemini writes the human-readable rationale.
  This is the right separation of concerns for a regulated workflow and should
  be the template for any new agent capability.
- **Evidence-linked reasoning.** Every action cites `evidenceIds`; the structural
  eval rewards that. Good foundation for explainability features.

**Structural limits that shape the roadmap** (see the QA report for severities)
- **Single global in-memory state** (`APP = AppState()`): one shared recall, no
  per-session/per-tenant isolation, lost on restart, and not safe across Cloud
  Run instances. Blocks multi-recall, multi-user, and durability.
- **The audit chain lives only in a Python list.** `audit.py` claims BigQuery
  persistence in live mode but no code writes it. Tamper-evidence is only as
  strong as "an attacker who can edit the list can also recompute it" — there is
  no external anchor or signature.
- **Approval gate has no authn/authz.** Any caller can approve/reject. Fine for a
  demo, blocking for production and for the "cannot be bypassed" claim.
- **The agent only drafts; nothing executes externally.** The approval gate
  currently guards a status flip, not a real side effect — so the *gate* is
  safe, but the *product value* of "containment" is not yet realized.
- **Blast-radius matching is heuristic.** `_parse_lot_codes` regex-extracts lot
  fragments from free text and pads with demo defaults when none parse — so the
  "real" blast radius can silently scope to seeded lots. Accuracy is the
  foundation everything else rests on.
- **Freshness is displayed but never enforced.** The "warehouse freshness < 15
  min" rule is shown and asserted in the reasoning trace but not gated in code.

---

## 3. High-impact features

### P0-1 · Multi-recall triage queue & command center  ·  effort **L**
**Problem.** The product handles exactly one recall at a time (global `APP.recall`).
Real teams triage many simultaneous Class I/II/III events.

**Proposal.** Introduce a first-class **Recall** entity with its own isolated
state, warehouse binding, action set, and audit sub-chain. Add a `/queue` route:
a sortable, filterable command board of active recalls with risk score, blast
radius, containment %, SLA countdown, and owner.

**Architecture / data model**
- Refactor `AppState` into a `RecallCase` object keyed by `recall_id`; `APP`
  becomes a registry (`cases: dict[str, RecallCase]`) + an active-case pointer.
- New endpoints: `GET /api/recalls` (list+status), `POST /api/recalls/{id}/activate`.
- Poll openFDA on a schedule (Cloud Scheduler → `/api/poll`) to auto-ingest new
  Class I events into the queue instead of only at boot.
- BigQuery: add a `recall_cases` table (status, severity, opened_at, contained_at,
  owner, sla_due) so the queue survives restarts.

**Why it wins.** Converts a one-shot demo into a daily-driver operations tool —
the clearest signal of product maturity.

---

### P0-2 · Durable + externally-anchored audit (system of record)  ·  effort **M**
**Problem.** The audit chain is in-memory and recomputable; the BigQuery
persistence promised in `audit.py` does not exist. This undercuts the core
"immutable, tamper-evident" claim.

**Proposal.**
1. **Persist** every `audit_events` row to BigQuery (and/or Postgres) on append —
   make the docstring true. Add the `audit_events` and `agent_runs` tables to the
   BigQuery schema (currently missing from `bigquery.py`).
2. **Anchor the chain head.** Periodically publish the latest `hash` to an
   append-only, write-once sink the app cannot rewrite (GCS Bucket Lock / object
   versioning, a managed ledger, or even a daily hash emailed/committed). Now a
   verifier can detect a fully-recomputed chain, which today they cannot.
3. **Sign events.** HMAC or asymmetric-sign each event with a KMS-held key so
   integrity does not depend solely on the chain. Expose `signature` in
   `verify()`.

**Why it wins.** Moves "tamper-evident" from *demo-true* to *audit-true* — the
exact property the compliance buyer is paying for.

---

### P0-3 · Real, sandboxed, fully-gated action execution  ·  effort **L**
**Problem.** Approving an action only sets `status = "executed"`; no external
effect occurs, so "containment" is asserted, not performed.

**Proposal.** Add an **execution layer** that runs *only after* approval and
*only* through sandbox/test credentials by default, with results written back
into the audit chain as `ACTION_EXECUTED` events carrying provider receipts.

| Action type | Sandbox integration | Proof captured |
|---|---|---|
| `CUSTOMER_NOTICE` | Twilio test SMS · SendGrid sandbox email | message SIDs, delivery webhooks |
| `SUPPLIER_HOLD` | Email/API to supplier (sandbox) | ticket id / 202 receipt |
| `REPLACEMENT_PO` | NetSuite/SAP sandbox PO create | PO number |
| `STOP_SALE` / `SHELF_PULL` | POS/task webhook (mock) | task ids per store |
| `COMPLIANCE_REPORT` | already real | report hash |

**Architecture**
- `executors/` package, one adapter per action type, each `available()`-gated
  exactly like the existing partner adapters; default = **dry-run**, labelled.
- Execution is invoked by `approve_action` *after* the audit write, never before,
  and never by the agent. Add an idempotency key per action to prevent
  double-send on retries.
- New `ACTION_EXECUTED` / `ACTION_FAILED` audit event types with provider refs.

**Guardrails.** Live (non-sandbox) execution requires an explicit env flag *and*
a second approver (see P1-2). The agent path can never reach executors.

**Why it wins.** Turns the approval gate from a UI state into a real,
provable containment action — the product's reason to exist — without
sacrificing safety.

---

### P1-1 · Predictive risk & blast-radius scoring  ·  effort **M**
**Problem.** Severity is currently driven by the FDA classification label and raw
counts. There is no forward-looking prioritization.

**Proposal.** A composite **Recall Risk Score (0–100)** combining:
- **Exposure** — units sold to consented customers, in-transit quantity,
  critical-tier store count (already computed in `blast_radius`).
- **Hazard** — pathogen/allergen severity parsed from `reason_for_recall`
  (Listeria/E. coli/undeclared allergen weighting), Class I/II/III.
- **Velocity** — sales recency and distribution breadth (states in
  `distribution_pattern`).
- **Time decay** — days since `recall_initiation_date` (older = wider spread).

Phase 1: transparent weighted rubric (explainable, auditable). Phase 2: train a
gradient-boosted model on historical openFDA + outcome data once enough cases
accrue. Surface the score on the queue, and **route low-confidence lot matches to
human review** (the risk rule that exists in policy but not in code).

**Data model.** `recall_cases.risk_score`, `risk_factors JSON`; feed the score
into queue ordering and SLA defaults.

---

### P1-2 · Role-based access + multi-operator approvals (4-eyes)  ·  effort **M**
**Problem.** No authn/authz; `actor` is hardcoded `"Operator"`; one click
"executes." For a compliance product this is the headline gap.

**Proposal.**
- Add identity (Google IAP / OAuth / API keys for service calls) and capture the
  *real* approver identity into the audit `actor_name`.
- **Roles:** Viewer, Operator (approve drafts), Approver (release high-risk /
  live execution), Admin. Map `risk: "high"` actions (e.g. `CUSTOMER_NOTICE`) to
  a **dual-approval** requirement.
- Rate-limit and CSRF/CORS-harden mutating endpoints (today CORS is `*` + all
  methods).

**Why it wins.** Directly substantiates "the approval gate cannot be bypassed"
and unlocks enterprise/regulated buyers.

---

### P1-3 · Cross-recall operational memory & "similar recalls"  ·  effort **M**
**Problem.** The MongoDB "agent memory + vector similar-recalls" partner is
pluggable but unused; each recall is handled with no institutional memory.

**Proposal.** On intake, embed the recall (product, firm, hazard, distribution)
and retrieve the **k most similar past recalls** + their approved action sets and
outcomes. Show "Last time a Listeria pretzel recall hit, here's what was
approved and how long containment took." Pre-populate drafts from precedent;
feed precedent into the risk score.

**Architecture.** MongoDB Atlas Vector Search (or pgvector) holds recall
embeddings + action outcomes; a `memory.recall_neighbors(recall)` tool the agent
can cite as evidence (`ev_memory`). This finally activates the `/graph` "memory"
and "improvement proposals" nodes with real data.

---

### P1-4 · Supply-chain diversion & alternate-sourcing optimizer  ·  effort **M**
**Problem.** `SUPPLIER_HOLD` / `REPLACEMENT_PO` are single drafted lines; there is
no optimization of where to divert or re-source.

**Proposal.** Given in-transit shipments and critical-store backfill needs,
compute a **diversion plan**: which shipments to reroute to quarantine docks,
which alternate suppliers can cover the gap fastest/cheapest, and a
store-prioritized backfill schedule (critical tier first). Visualize as a
Sankey/flow over the shipment graph. Phase 1: greedy heuristic; Phase 2:
constraint solver (OR-Tools) over lead time, cost, and capacity.

---

### P2-1 · Regulatory auto-drafting (FDA 806 / Reportable Food Registry)  ·  effort **M**
Generate pre-filled regulatory artifacts (FDA 21 CFR 806 correction/removal
report, RFR submission draft, customer recall press notice) from the case data,
each requiring human approval and landing in the audit chain. High value for
compliance teams; natural extension of `COMPLIANCE_REPORT`.

### P2-2 · Real-time collaboration & notifications  ·  effort **M**
WebSocket/SSE push so multiple operators see live state changes; Slack/Teams/
PagerDuty alerts when a new Class I lands or an SLA is at risk. Removes the
current poll-and-refresh model.

### P2-3 · Live agent reasoning (tool-calling) instead of fixed skeletons  ·  effort **L**
Today Gemini only narrates; actions are deterministic. Optionally let the agent
*propose* scope refinements and additional actions via constrained tool-calling
(read-only BigQuery tools), still emitting only drafts. Keep the deterministic
path as the safe fallback. Improves adaptability without weakening the gate.

---

## 4. UI / data-visualization enhancements

- **RecallGraph 3D — make it the analytical centerpiece, not just a showpiece.**
  - **Time-scrubber:** replay how the blast radius and approvals expanded over
    the incident timeline (ties to `/replay`).
  - **Severity-weighted layout:** node size = units at risk, edge thickness =
    flow volume; color by risk tier; highlight the critical-path subgraph.
  - **Click-to-act:** select a store/shipment node → open the relevant action in
    the approval workbench (graph becomes an operations surface).
  - **Performance:** level-of-detail / clustering for large graphs; lazy-load the
    `3d-force-graph` bundle and fall back to a 2D canvas on low-power/mobile.
- **Geospatial recall map.** Plot affected stores/customers/distribution states
  on a map with a heat layer — the most intuitive "blast radius" view for execs.
- **Containment funnel & SLA dashboard.** Drafted → approved → executed →
  confirmed, per recall and aggregate; time-to-containment trend.
- **Mobile honesty fix.** The Live/Fallback status chips are `display:none`
  below 1280px, so the integrity badges vanish on tablets/phones. Move a compact
  status indicator into the top bar / nav so honest badging survives at every
  breakpoint.
- **Surface the `_fallback` flag.** The API client already returns `_fallback`
  on every degraded call but nothing reads it — bind it to a per-panel "cached"
  ribbon so partial degradation is visible, not just whole-app mode.
- **Approval diff & evidence preview.** Before approving, show the exact rows /
  job IDs the action will affect (expand the evidence drawer inline).

---

## 5. Backend performance, reliability & data platform

- **Per-case state + persistence (prerequisite for everything).** Replace the
  single global `AppState` with persisted `RecallCase` records (Postgres for hot
  state, BigQuery for analytics/audit). Eliminates restart data loss and makes
  the service horizontally scalable on Cloud Run.
- **Concurrency safety.** Mutating endpoints touch shared lists without locking;
  `run_agent` replaces `self.actions` wholesale while approvals mutate it. Add
  per-case locks / optimistic versioning and idempotency keys on approve/execute.
- **Enforce the freshness gate.** Block (or visibly downgrade confidence on) an
  agent run when `freshness_sec` exceeds the limit, instead of asserting freshness
  unconditionally in the reasoning trace.
- **Harden blast-radius accuracy.** Replace the free-text lot regex with a
  structured matcher (UPC/lot normalization, fuzzy match with a confidence score,
  explicit "no internal match" state) and **never silently pad with demo lots** —
  label unmatched recalls honestly and route to human review.
- **Caching & cost.** Cache openFDA results with ETag/short TTL; cache Gemini
  reasoning per `(recall_id, prompt_version, stats_hash)`; track real token usage
  rather than estimating `chars/4`.
- **Observability to production.** The OpenTelemetry spans are real — wire the
  OTLP export to a hosted collector (Phoenix/Dynatrace) by default in deployed
  envs and add eval-score alerting and a per-run cost budget.
- **CI/CD & supply chain.** Use React production builds (currently `*.development.js`
  from unpkg) in prod; add SRI to all CDN scripts; pin/audit the
  `3d-force-graph` dependency; keep the GitLab SAST gate.

---

## 6. Suggested phasing

| Phase | Theme | Items |
|---|---|---|
| **1 — Trust** | Make the core claims unimpeachable | P0-2 (durable/anchored audit), P1-2 (authz + 4-eyes), freshness gate, blast-radius accuracy, `_fallback`/mobile badging |
| **2 — Leverage** | Handle many recalls, end to end | P0-1 (triage queue), P0-3 (sandboxed gated execution), persistence/concurrency |
| **3 — Intelligence** | Get smarter per recall | P1-1 (risk score), P1-3 (memory/similar-recalls), P1-4 (diversion optimizer) |
| **4 — Reach** | Expand surface & polish | P2-1 (regulatory drafts), P2-2 (realtime/alerts), P2-3 (tool-calling agent), RecallGraph + map upgrades |

## 7. Success metrics
- **Time-to-containment** (recall detected → all actions approved/executed).
- **Operator leverage** (concurrent recalls handled per operator).
- **Match accuracy** (lots correctly matched vs human-verified) and
  false-suppression rate on customer notices.
- **Audit assurance** (chain verified + externally anchored 100% of the time).
- **Execution reliability** (approved → confirmed-delivered %, with receipts).
```
