# Free deploy — no credit card (Hugging Face Spaces)

Google Cloud needs billing (a card). This path makes the **live URL show real data**
(real openFDA recall + live Gemini) for **$0, no card**, by hosting the backend on a
Hugging Face Docker Space.

### 1. Create the Space (free)
- Sign up at <https://huggingface.co> (no card).
- **New → Space → SDK: Docker → Public**, name it e.g. `recallops-api`.

### 2. Push the backend to it
The `backend/` folder already has a `Dockerfile` + HF metadata in `backend/README.md`.
```bash
git clone https://huggingface.co/spaces/<you>/recallops-api
cp -r cortex/backend/* recallops-api/
cd recallops-api && git add -A && git commit -m "RecallOps Cortex API" && git push
```

### 3. Add the Gemini key as a Space secret
Space → **Settings → Variables and secrets** → add:
- `GOOGLE_API_KEY` = your AI Studio key
- `USE_VERTEX` = `false`
- `GEMINI_MODEL` = `gemini-2.5-flash` (or `gemini-3-pro-preview` once you have GCP billing/credits)

The Space builds and serves at **`https://<you>-recallops-api.hf.space`** — your live backend.

### 4. Point the hosted frontend at it
In `index.html`:
```html
<script>window.RO_CONFIG = { apiBase: "https://<you>-recallops-api.hf.space" };</script>
```
Commit + push → Vercel redeploys → **https://recall-ops.vercel.app is now fully live**
(real recall, live Gemini, real audit hashes). That closes judge complaint #2.

> CORS is already open (`*`), so the Vercel frontend can call the HF backend directly.
> Note: free Spaces sleep after long inactivity and wake on first visit (~30s) — warm it
> right before the demo/video.
