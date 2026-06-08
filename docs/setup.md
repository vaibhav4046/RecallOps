# RecallOps Cortex — Setup & Deployment Runbook

This is the copy-paste path from "clone" to "live, judged submission". Commands
are Windows PowerShell unless noted. The app degrades gracefully: every cloud
integration is optional and the service runs in clearly-labelled **fallback**
mode without it. Only the openFDA recall is always live.

```
openFDA (recall, public)  ─┐
Fivetran → BigQuery (ops)  ├─►  Cloud Run API (FastAPI)  ──►  Frontend (static)
Gemini 3 (reasoning)      ─┘         │ audit hash-chain · approval gate
```

---

## 0. Prerequisites

| Tool | Why | Check |
|---|---|---|
| Python 3.11+ | backend | `python --version` |
| Node (optional) | only if you switch the frontend to a bundler | `node --version` |
| Google Cloud SDK | BigQuery + Cloud Run deploy | `gcloud --version` |
| git | the public repo requirement | `git --version` |

Install gcloud: https://cloud.google.com/sdk/docs/install (Docker is **not**
required — Cloud Run builds from source).

---

## 1. Run locally (no accounts — works right now)

```powershell
# from the repo root (cortex/)
python -m venv .venv
.\.venv\Scripts\python -m pip install -r backend\requirements.txt

# terminal 1 — backend API on :8099
.\.venv\Scripts\python -m uvicorn app.main:app --app-dir backend --host 127.0.0.1 --port 8099

# terminal 2 — static frontend on :8790
python -m http.server 8790
```

Open http://127.0.0.1:8790 . Health check: http://127.0.0.1:8099/api/health →
`mode: partial`, `openfda: live`. Smoke test the whole flow:

```powershell
.\.venv\Scripts\python backend\scripts\smoke_test.py   # expect RESULT: PASS
```

---

## 2. Gemini 3 — the agent brain (REQUIRED)

**Fastest (free, no billing): Google AI Studio key**
1. Get a key: https://aistudio.google.com/apikey
2. Confirm the exact Gemini 3 model id from the hackathon resources page.
3. Create `backend/.env` from `backend/.env.example`:
   ```
   GOOGLE_API_KEY=ya29....
   USE_VERTEX=false
   GEMINI_MODEL=gemini-3-pro        # ← exact id from hackathon resources
   ```
4. Restart the backend. `/api/health` now shows `gemini: live`; LLMOps shows the
   real model + token counts.

**Or via Vertex AI (needs the GCP project from §3):**
```
gcloud auth application-default login
```
```
GOOGLE_CLOUD_PROJECT=<project-id>
USE_VERTEX=true
GEMINI_MODEL=gemini-3-pro
```

---

## 3. Google Cloud project (for BigQuery + Cloud Run)

```powershell
# after installing the SDK
gcloud init
gcloud auth login
gcloud config set project <PROJECT_ID>
gcloud services enable run.googleapis.com bigquery.googleapis.com aiplatform.googleapis.com
```
The free $300 trial covers everything here for the hackathon.

---

## 4. BigQuery warehouse (REQUIRED for the Fivetran track)

```powershell
bq --location=US mk -d <PROJECT_ID>:recallops_cortex
.\.venv\Scripts\python backend\scripts\load_bigquery.py   # creates tables + loads the seed  [provided once §3 is done]
```
`.env`: `GOOGLE_CLOUD_PROJECT=<id>`, `BIGQUERY_DATASET=recallops_cortex`.
With this set, blast-radius runs as real BigQuery jobs and logs job IDs (proof).

---

## 5. Fivetran (the partner requirement for this track)

1. Sign up: https://fivetran.com (free trial).
2. Create a connector — a **Google Sheet** of the seed ops data is the quickest —
   with **destination = the BigQuery dataset** `recallops_cortex`.
3. Grab API creds: Account → API key/secret; note your group/destination id.
4. `.env`:
   ```
   FIVETRAN_API_KEY=...
   FIVETRAN_API_SECRET=...
   FIVETRAN_GROUP_ID=...
   ```
5. Fivetran MCP: connect the Fivetran MCP server so the agent can read connector
   status / trigger syncs as a tool. (Wiring lands with task #5.)

The `/fivetran` route then shows real connector status + live sync timestamps.

---

## 6. Deploy the backend to Cloud Run (no Docker)

```powershell
gcloud run deploy recallops-cortex-api `
  --source backend `
  --region us-central1 `
  --allow-unauthenticated `
  --set-env-vars "GEMINI_MODEL=gemini-3-pro,USE_VERTEX=true,GOOGLE_CLOUD_PROJECT=<id>,BIGQUERY_DATASET=recallops_cortex"
```
Cloud Run uses `backend/Procfile` to start uvicorn on `$PORT`. Copy the printed
**service URL**.

> Secrets (Fivetran keys, AI Studio key): prefer `--set-secrets` with Secret
> Manager over `--set-env-vars`. Never commit `.env`.

---

## 7. Host the frontend

Set the API base in `index.html`:
```html
<script>window.RO_CONFIG = { apiBase: "https://recallops-cortex-api-XXXX.run.app" };</script>
```
Then host the static `cortex/` folder — Firebase Hosting, Vercel, Netlify, or a
second Cloud Run service. That hosted URL is the Devpost "Project URL".

---

## 8. Verify (the proof judges want)

- `GET /api/health` → `mode: live`, every integration `live`, a `trace_id`.
- `/llmops` → real Gemini 3 model id, real token counts per run.
- `/fivetran` → connector status + live sync timestamp.
- BigQuery query **job IDs** in the Cloud Run logs for blast-radius.
- `/compliance` → audit hash-chain `intact: true`.
- openFDA record id + retrieval timestamp visible in logs.
- **No secrets** in the repo, frontend, logs, or screenshots.
