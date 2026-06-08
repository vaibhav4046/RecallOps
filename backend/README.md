---
title: RecallOps Cortex API
emoji: 🛡️
colorFrom: blue
colorTo: indigo
sdk: docker
app_port: 7860
pinned: false
---

# RecallOps Cortex — API

FastAPI backend: live **openFDA** recall → blast radius → **Gemini** agent (drafts only)
→ **human-approval gate** → tamper-evident **sha256 audit chain** → compliance report.
Every response carries a trace id.

openFDA is always live; Gemini activates with `GOOGLE_API_KEY`; BigQuery/Fivetran
activate with their creds, else clearly-labelled fallback.

Main repo: <https://github.com/vaibhav4046/RecallOps>

> The frontmatter above also configures this as a **Hugging Face Docker Space**
> (free hosting, no card). See `docs/deploy-free.md`.
