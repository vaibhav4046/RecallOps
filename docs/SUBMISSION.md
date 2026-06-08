# RecallOps Cortex — Devpost Submission Pack

Google Cloud **Rapid Agent Hackathon** · **Fivetran track**. Edit the
`<PLACEHOLDER>`s after deploy, then paste into Devpost.

---

## Elevator pitch (≤ 200 chars)
A recall-containment command center: a real FDA recall → blast radius across
Fivetran/BigQuery ops data → Gemini 3 action plan → human approval → tamper-proof
audit report.

## Inspiration
A Class I food recall is chaos: which stores, which lots, how many units sold, which
shipments to divert, which customers to notify — scattered across POS, inventory,
shipping, and CRM systems, under a clock. We wanted an agent that turns a public FDA
recall into a **verified containment plan** an operator can approve, with a paper
trail that survives an audit.

## What it does
1. Pulls a **real openFDA** Class I food-enforcement recall (live, no key).
2. Treats Fivetran-synced **BigQuery** operational data as the warehouse and computes
   the **blast radius**: locations, SKUs, lots, inventory, units sold, in-transit
   shipments, and the consented customer notification scope.
3. **Gemini 3** drafts six containment actions (stop-sale, shelf-pull, supplier-hold,
   customer-notice, replacement-PO, compliance-report), each citing evidence IDs.
4. **Nothing executes without human approval** — each approval is gated behind a
   pre-execution checklist and writes an **append-only sha256 hash-chain** audit event.
5. Generates an **audit-ready compliance report**; the timeline ends at
   `SYSTEM: CONTAINED`.

## How we built it
- **Backend:** FastAPI on **Cloud Run** — structured endpoints, trace IDs on every
  response, an in-process orchestrator with the approval gate enforced server-side.
- **Recall:** openFDA Food Enforcement API (always live).
- **Warehouse:** **BigQuery**, loaded via **Fivetran**; blast-radius runs as real
  BigQuery jobs and surfaces **query job IDs** as proof.
- **Agent:** **Gemini 3** (Vertex AI / AI Studio) over a context pack of the real
  recall + computed blast radius + risk rules; drafts only, never executes.
- **Audit:** sha256 hash chain — altering any event breaks every later link.
- **Frontend:** a 14-route command center (React via CDN) that hydrates real backend
  state on load and **badges every integration Live vs Fallback** — no fake green lights.
- **Observability & partner ecosystem:** the agent pipeline is instrumented with
  **OpenTelemetry** — real spans per tool call, viewable in **Arize Phoenix**
  (open-source, local) and OTLP-exportable to **Dynatrace**. A **GitLab** CI/CD
  pipeline (`.gitlab-ci.yml`) gates deploys behind manual approval. **Elastic**
  (recall/audit search) and **MongoDB** (agent memory + vector similar-recalls) ship
  as pluggable adapters. The `/architecture` page maps every partner as LIVE or
  PLUGGABLE from real config — no fake integrations.

## Challenges we ran into
- Keeping it **honest**: a real openFDA recall won't match a scripted demo, so the
  operational warehouse is clearly-labelled seed data *bound to the live recall's lot
  codes*, and the UI never claims an integration is live unless it is.
- A graceful **fallback** so the demo never breaks when a credential is missing, while
  the live path produces real proof (job IDs, sync timestamps, model + token counts).

## Accomplishments we're proud of
- End-to-end verified: real recall → 6 approvals → `CONTAINED` → **audit chain intact**.
- Verifiability everywhere: openFDA record id, live sync timestamps, BigQuery job IDs,
  per-run model + token counts, tamper-evident audit.

## What we learned
- For agents in regulated workflows, **provenance beats autonomy** — the win is the
  human-approval gate plus an immutable trail, not full automation.

## What's next
- Multi-recall triage, real notification sandbox integrations, and richer self-improving
  playbooks (already scaffolded under `/improvement`).

## Built with
`gemini-3` · `google-cloud-run` · `agent-builder` · `bigquery` · `fivetran` ·
`fivetran-mcp` · `vertex-ai` · `opentelemetry` · `arize-phoenix` · `dynatrace` ·
`elasticsearch` · `mongodb` · `gitlab-ci` · `fastapi` · `python` · `react` · `openfda`

## Links
- **Hosted:** `<CLOUD_RUN_OR_HOSTING_URL>`
- **Repo:** `<PUBLIC_GITHUB_URL>` (MIT)
- **Video:** `<YOUTUBE_URL>`

---

## 3-minute video script (shot-by-shot)

| Time | Screen | Say |
|---|---|---|
| 0:00–0:20 | `/` command center, `SYSTEM: STANDBY` | "A Class I food recall just dropped. RecallOps Cortex turns it into a contained, audit-ready response." |
| 0:20–0:40 | `/radar` + the live openFDA record id/timestamp | "This is a **real** openFDA recall — pulled live, not seeded. Here's the record and retrieval time." |
| 0:40–1:00 | `/fivetran` connector status + sync timestamps | "Operational data syncs through Fivetran into BigQuery. The agent won't reason on stale data." |
| 1:00–1:25 | `/graph` 3D RecallGraph | "It expands one recall into SKUs, lots, stores, shipments, customers — the blast radius." |
| 1:25–1:50 | `/` blast-radius tiles + `/llmops` | "Gemini 3 scopes it: 37 locations, 1,842 units, 312 sold. Every run is instrumented — model, tools, tokens, eval score." |
| 1:50–2:25 | `/actions` → approve a card via the checklist modal | "Nothing fires automatically. Each action is gated behind a human approval — and every approval writes an immutable audit event." |
| 2:25–2:45 | top bar flips to `SYSTEM: CONTAINED` + `/compliance` | "Six approvals, contained. Here's the full timeline." |
| 2:45–3:00 | `/report` + audit `intact: true` | "An audit-ready report, with a tamper-evident hash chain. That's RecallOps Cortex." |

---

## Pre-submission checklist
- [ ] Gemini 3 live (model id confirmed from hackathon resources) — `/llmops` shows it
- [ ] Fivetran connector live + **MCP server** wired — `/fivetran` shows real status
- [ ] BigQuery job IDs visible in Cloud Run logs
- [ ] Backend deployed to Cloud Run; frontend hosted; `apiBase` set in `index.html`
- [ ] Public repo + **LICENSE** (done) + README (done) pushed
- [ ] 14-route smoke (done) · desktop 1440×900 no overflow (done) · mobile 390×844 (verify on device)
- [ ] `Ctrl+K` palette · Judge Mode · approval → `CONTAINED` (done)
- [ ] **No secrets** in repo/frontend/logs/screenshots
- [ ] 3-min video recorded + uploaded · Devpost form complete · Fivetran track selected
