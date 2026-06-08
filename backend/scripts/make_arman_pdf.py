"""Generate the RecallOps Cortex build-brief PDF for Arman (reportlab)."""
import os

from reportlab.lib import colors
from reportlab.lib.enums import TA_LEFT
from reportlab.lib.pagesizes import LETTER
from reportlab.lib.styles import ParagraphStyle, getSampleStyleSheet
from reportlab.lib.units import inch
from reportlab.platypus import (HRFlowable, ListFlowable, ListItem, Paragraph,
                                Preformatted, SimpleDocTemplate, Spacer, Table,
                                TableStyle)

OUT = os.path.join(os.path.dirname(os.path.dirname(os.path.dirname(os.path.abspath(__file__)))),
                   "docs", "RecallOps-Cortex-Arman-Brief.pdf")

CYAN = colors.HexColor("#0891B2")
INK = colors.HexColor("#0F172A")
MUTE = colors.HexColor("#475569")
AMBER = colors.HexColor("#B45309")
GREEN = colors.HexColor("#047857")
CODEBG = colors.HexColor("#F1F5F9")
LINE = colors.HexColor("#CBD5E1")

ss = getSampleStyleSheet()
TITLE = ParagraphStyle("T", parent=ss["Title"], textColor=INK, fontSize=22, spaceAfter=2)
SUB = ParagraphStyle("S", parent=ss["Normal"], textColor=CYAN, fontSize=11, spaceAfter=10)
H1 = ParagraphStyle("H1", parent=ss["Heading1"], textColor=CYAN, fontSize=14, spaceBefore=14, spaceAfter=5)
H2 = ParagraphStyle("H2", parent=ss["Heading2"], textColor=INK, fontSize=11.5, spaceBefore=9, spaceAfter=3)
BODY = ParagraphStyle("B", parent=ss["Normal"], textColor=INK, fontSize=10, leading=15, alignment=TA_LEFT)
SMALL = ParagraphStyle("Sm", parent=ss["Normal"], textColor=MUTE, fontSize=8.5, leading=12)
CODE = ParagraphStyle("C", parent=ss["Code"], fontName="Courier", fontSize=8.5, leading=12, textColor=INK)


def codebox(txt):
    t = Table([[Preformatted(txt, CODE)]], colWidths=[6.6 * inch])
    t.setStyle(TableStyle([
        ("BACKGROUND", (0, 0), (-1, -1), CODEBG),
        ("BOX", (0, 0), (-1, -1), 0.5, LINE),
        ("LEFTPADDING", (0, 0), (-1, -1), 8), ("RIGHTPADDING", (0, 0), (-1, -1), 8),
        ("TOPPADDING", (0, 0), (-1, -1), 6), ("BOTTOMPADDING", (0, 0), (-1, -1), 6),
    ]))
    return t


def callout(title, body, border, bg):
    t = Table([[Paragraph(f"<b>{title}</b> &nbsp; {body}", BODY)]], colWidths=[6.6 * inch])
    t.setStyle(TableStyle([
        ("BACKGROUND", (0, 0), (-1, -1), bg),
        ("BOX", (0, 0), (-1, -1), 0.9, border),
        ("LEFTPADDING", (0, 0), (-1, -1), 10), ("RIGHTPADDING", (0, 0), (-1, -1), 10),
        ("TOPPADDING", (0, 0), (-1, -1), 8), ("BOTTOMPADDING", (0, 0), (-1, -1), 8),
    ]))
    return t


def bullets(items):
    return ListFlowable([ListItem(Paragraph(x, BODY), leftIndent=10) for x in items],
                        bulletType="bullet", start="•", leftIndent=14)


S = []
S.append(Paragraph("RecallOps Cortex", TITLE))
S.append(Paragraph("Build brief for Arman &nbsp;·&nbsp; Google Cloud Rapid Agent Hackathon &nbsp;·&nbsp; Fivetran track", SUB))
S.append(HRFlowable(width="100%", color=LINE, thickness=1, spaceAfter=10))

S.append(callout("STATUS —",
                 "Product built &amp; verified. <b>openFDA + Gemini are LIVE.</b> 14 routes render clean, "
                 "human-approval → <b>CONTAINED</b> → audit hash-chain verified. What's left is cloud "
                 "provisioning — your tasks below.", GREEN, colors.HexColor("#D1FAE5")))
S.append(Spacer(1, 8))

S.append(Paragraph("What it is", H1))
S.append(Paragraph(
    "An agent that turns a <b>real openFDA food recall</b> into a scoped blast radius, a Gemini-drafted "
    "containment plan, human approvals, and an audit-ready compliance report. Operational data syncs via "
    "<b>Fivetran → BigQuery</b>; <b>Gemini 3</b> reasons over it; every action is <b>human-approved</b> "
    "(nothing auto-executes) and written to a tamper-evident <b>sha256 audit chain</b>.", BODY))

S.append(Paragraph("Your tasks (in order)", H1))

S.append(Paragraph("1 · Enable billing → unlock Gemini 3 (required model)", H2))
S.append(Paragraph(
    "Gemini is already live on <font face='Courier'>gemini-2.5-flash</font>. <b>gemini-3-pro-preview</b> "
    "is verified available on the key, but the free-tier quota is 0 — billing is the only blocker "
    "(the $300 trial covers it). GCP project: <b>681822930558</b>.", BODY))
S.append(bullets([
    "Console → Billing → link a billing account.",
    "Then set <font face='Courier'>backend/.env</font> → <font face='Courier'>GEMINI_MODEL=gemini-3-pro-preview</font>, restart.",
    "Verify <font face='Courier'>POST /api/agent/run</font> returns <font face='Courier'>live: true</font> with the gemini-3 model.",
]))

S.append(Paragraph("2 · BigQuery — real query job IDs", H2))
S.append(codebox(
    "gcloud auth application-default login\n"
    "bq --location=US mk -d 681822930558:recallops_cortex\n"
    "python backend/scripts/load_bigquery.py   # loads seed, prints job IDs"))
S.append(Paragraph("Confirm the printed stats match the UI: <b>1842</b> units · <b>312</b> sold · "
                   "<b>37</b> locations · <b>284</b> customers. Then <font face='Courier'>/api/health</font> "
                   "shows <font face='Courier'>bigquery: live</font>.", BODY))

S.append(Paragraph("3 · Fivetran connector (partner-track requirement)", H2))
S.append(bullets([
    "fivetran.com → add one connector (a Google Sheet of the seed is quickest) → destination = BigQuery dataset <font face='Courier'>recallops_cortex</font>.",
    "API key/secret + group id → <font face='Courier'>backend/.env</font> (FIVETRAN_API_KEY / SECRET / GROUP_ID).",
    "<font face='Courier'>/fivetran</font> then shows real connector status + sync timestamps.",
]))

S.append(Paragraph("4 · Deploy + host", H2))
S.append(codebox(
    "gcloud run deploy recallops-cortex-api \\\n"
    "  --source backend --region us-central1 --allow-unauthenticated"))
S.append(Paragraph("Put the printed URL in <font face='Courier'>index.html</font> → "
                   "<font face='Courier'>window.RO_CONFIG.apiBase</font>. Host the static "
                   "<font face='Courier'>cortex/</font> folder (Firebase / Vercel / Netlify) — that's the "
                   "Devpost Project URL.", BODY))

S.append(Paragraph("5 · Validate (the proof judges want)", H2))
S.append(bullets([
    "<font face='Courier'>python backend/scripts/smoke_test.py</font> → RESULT: PASS.",
    "<font face='Courier'>/api/health</font> → all integrations live.",
    "Capture: openFDA record id · BigQuery job IDs · Fivetran sync timestamps · Gemini 3 model + tokens.",
]))

S.append(Paragraph("Run it locally", H1))
S.append(codebox(
    "python -m venv .venv\n"
    ".venv/Scripts/python -m pip install -r backend/requirements.txt\n"
    ".venv/Scripts/python -m uvicorn app.main:app --app-dir backend --port 8099\n"
    "python -m http.server 8790      # second terminal → open http://127.0.0.1:8790"))

S.append(Paragraph("Repo &amp; commits", H1))
S.append(Paragraph("Repo: <b>github.com/SyedArmanAli2003/ResQNet</b>. You have <b>Write</b> access — "
                   "commit directly, no PRs needed. First push:", BODY))
S.append(codebox(
    "git add -A && git commit -m \"...\"\n"
    "git branch -M main\n"
    "git remote add origin https://github.com/SyedArmanAli2003/ResQNet.git\n"
    "git push -u origin main"))
S.append(Paragraph("Full details: <font face='Courier'>docs/ARMAN.md</font> · "
                   "<font face='Courier'>docs/setup.md</font> · <font face='Courier'>docs/SUBMISSION.md</font> "
                   "(Devpost text + 3-min video script).", SMALL))

S.append(Spacer(1, 8))
S.append(callout("SECURITY —",
                 "The Gemini key currently in <font face='Courier'>.env</font> was exposed in chat — "
                 "<b>revoke it and generate a fresh one</b> before deploying or pushing publicly. "
                 "Never commit <font face='Courier'>.env</font> (already in .gitignore).",
                 AMBER, colors.HexColor("#FEF3C7")))

doc = SimpleDocTemplate(OUT, pagesize=LETTER, leftMargin=0.9 * inch, rightMargin=0.9 * inch,
                        topMargin=0.8 * inch, bottomMargin=0.8 * inch,
                        title="RecallOps Cortex — Build Brief for Arman", author="RecallOps Cortex")
doc.build(S)
print("WROTE", OUT)
