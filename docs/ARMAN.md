# Workstream — Arman

The product + agent are built and verified. These are the cloud-provisioning
tasks (the parts that need account access / billing). Full commands are in
[`setup.md`](setup.md); this is the ordered checklist.

> Status today: openFDA **live**, Gemini **live** (gemini-2.5-flash). Pending below.

### 1. Enable billing → unlock Gemini 3  *(required model)*
- GCP project: **681822930558**. Console → Billing → link a billing account
  (the $300 free trial covers it).
- Gemini 3 (`gemini-3-pro-preview`) is verified available on the key but the
  **free tier quota is 0** — billing is the only blocker.
- Then set `backend/.env` → `GEMINI_MODEL=gemini-3-pro-preview`, restart, verify
  `/api/agent/run` returns `live: true` with the gemini-3 model.

### 2. BigQuery — real query job IDs
```
gcloud auth application-default login
bq --location=US mk -d 681822930558:recallops_cortex
python backend/scripts/load_bigquery.py     # creates tables + loads seed, prints job IDs
```
- Confirm the printed stats match the UI: **1842** units · **312** sold · **37**
  locations · **284** customers. `/api/health` should then show `bigquery: live`.

### 3. Fivetran connector  *(partner-track requirement)*
- fivetran.com → add one connector (a Google Sheet of the seed is quickest) →
  **destination = BigQuery dataset `recallops_cortex`**.
- API key/secret + group id → `backend/.env` (`FIVETRAN_API_KEY/SECRET/GROUP_ID`).
- `/fivetran` then shows real connector status + sync timestamps.

### 4. Deploy + host
```
gcloud run deploy recallops-cortex-api --source backend --region us-central1 --allow-unauthenticated
```
- Put the printed URL in `index.html` → `window.RO_CONFIG.apiBase`.
- Host the static `cortex/` folder (Firebase / Vercel / Netlify). That's the
  Devpost "Project URL".

### 5. Validate (the proof judges want)
- `python backend/scripts/smoke_test.py` → `RESULT: PASS`.
- `/api/health` → all integrations `live`.
- Capture: openFDA record id, BigQuery job IDs, Fivetran sync timestamps,
  Gemini 3 model + token counts. See the checklist in [`SUBMISSION.md`](SUBMISSION.md).

### Security
- The Gemini key currently in `.env` was exposed in chat — **revoke it and
  generate a fresh one** before deploying or pushing publicly.
- Never commit `.env` (already in `.gitignore`). Prefer Secret Manager in prod.
