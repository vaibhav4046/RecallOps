# RecallOps Cortex — Architecture, API Contract & Environment

## Data & control flow
```
openFDA API
  → Recall Intake Service
  → Fivetran MCP Server → Fivetran Connectors
  → BigQuery Operational Warehouse
  → RecallGraph Memory
  → Gemini Agent (Agent Builder / ADK)
  → Eval Suite
  → Human Approval Gate
  → Action Executors
  → Audit Log
  → Compliance Report
```

## Cloud deployment
| Concern | Service |
|---|---|
| Frontend | Cloud Run / Vercel |
| Backend / API | Cloud Run |
| Agent runtime | Vertex AI Agent Builder / Google ADK |
| Warehouse | BigQuery |
| Data sync | Fivetran + Fivetran MCP server |
| Recall source | openFDA Food Enforcement API |
| Secrets | Google Secret Manager |
| Logs | Cloud Logging |
| State (optional) | Firestore |
| Reports | Cloud Storage (server-side PDF) |

## Environment variables
```
OPENFDA_BASE_URL=https://api.fda.gov/food/enforcement.json
FIVETRAN_API_BASE=https://api.fivetran.com/v1
FIVETRAN_API_KEY=***          # Secret Manager
FIVETRAN_API_SECRET=***       # Secret Manager
FIVETRAN_MCP_TRANSPORT=stdio://fivetran-mcp
BIGQUERY_PROJECT=recallops-cortex
BIGQUERY_DATASET=recallops_cortex.operational
GEMINI_MODEL=gemini-3-pro
GOOGLE_CLOUD_REGION=us-central1
CLOUD_RUN_API_BASE=https://recallops-cortex-xxxx.run.app
USE_CACHED_FALLBACK=true       # clearly labels cached demo data in the UI
```

## Backend API contract
```
GET  /api/recalls/live
GET  /api/recalls/:id
POST /api/containment/start
GET  /api/fivetran/connectors
POST /api/fivetran/connectors/:id/sync
GET  /api/fivetran/sync-runs
POST /api/bigquery/evidence
GET  /api/graph/:recallId
GET  /api/graph/node/:nodeId
GET  /api/graph/evidence-path/:nodeId
POST /api/context/generate
GET  /api/agent/runs
GET  /api/agent/runs/:id
GET  /api/agent/runs/:id/tools
POST /api/actions/:id/approve
POST /api/actions/:id/reject
POST /api/actions/:id/execute
GET  /api/audit/:recallId
POST /api/evals/run
GET  /api/evals/:runId
GET  /api/improvements
POST /api/improvements/:id/approve
POST /api/improvements/:id/reject
GET  /api/report/:recallId
GET  /api/replay/:recallId
```
The frontend's `lib/api.js` mirrors these exactly with mock implementations.

## BigQuery tables
`recall_events · inventory · sales · shipments · locations · suppliers ·
customers · graph_nodes · graph_edges · agent_runs · agent_memory_episodes ·
eval_cases · improvement_proposals · containment_actions · audit_log`
(full column definitions in the build spec; `lib/data.js` is shaped to match).

## Why no fake claims
- openFDA records are real and public.
- Operational data is synced through Fivetran from a controlled source
  (Google Sheets / Cloud SQL / Postgres / CSV-in-Drive) into BigQuery.
- Any cached/offline data is surfaced with a `cached` label.
- The agent brain is Gemini only — no non-Google AI APIs in the running product.
