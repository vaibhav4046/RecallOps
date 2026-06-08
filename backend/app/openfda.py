"""RecallOps Cortex — openFDA Food Enforcement client (REAL data).

openFDA is public and needs no account, so this is live from day one. We
fetch genuine FDA food-enforcement recalls and normalise them into the
RecallEvent shape the frontend already consumes (window.RO.recall).

Docs: https://open.fda.gov/apis/food/enforcement/
"""
from __future__ import annotations

import re
from urllib.parse import quote

import httpx

from .config import get_settings

# Lot/UPC-like fragments inside the free-text `code_info` field.
_LOT_RE = re.compile(r"[A-Z0-9][A-Z0-9\-\/]{2,}")


def _parse_lot_codes(code_info: str) -> list[str]:
    if not code_info:
        return []
    seen: set[str] = set()
    out: list[str] = []
    for tok in _LOT_RE.findall(code_info.upper()):
        if tok in seen or tok.isalpha():  # skip pure words like "LOT", "BEST"
            continue
        seen.add(tok)
        out.append(tok)
        if len(out) >= 8:
            break
    return out


def normalize(rec: dict) -> dict:
    """openFDA enforcement record -> UI RecallEvent shape."""
    num = rec.get("recall_number", "")
    base = get_settings().openfda_base_url
    return {
        "recallId": num,
        "source": "openFDA",
        "classification": rec.get("classification", ""),
        "productDescription": (rec.get("product_description", "") or "").strip(),
        "recallingFirm": rec.get("recalling_firm", ""),
        "reason": rec.get("reason_for_recall", ""),
        "distributionPattern": rec.get("distribution_pattern", ""),
        "eventDate": rec.get("recall_initiation_date", "") or rec.get("report_date", ""),
        "status": rec.get("status", ""),
        "lotCodes": _parse_lot_codes(rec.get("code_info", "")),
        "upcs": [],  # openFDA rarely structures UPCs; resolved in the matching step
        "city": rec.get("city", ""),
        "state": rec.get("state", ""),
        "country": rec.get("country", ""),
        "sourceUrl": f'{base}?search=recall_number:"{num}"',
        "_event_id": rec.get("event_id", ""),
        "_real": True,
    }


def _clause(field: str, value: str, phrase: bool = True) -> str:
    v = f'"{value}"' if phrase else value
    return f"{field}:{quote(v, safe='')}"


async def search_recalls(
    classification: str = "Class I",
    limit: int = 5,
    term: str = "",
) -> list[dict]:
    s = get_settings()
    clauses: list[str] = []
    if classification:
        clauses.append(_clause("classification", classification))
    if term:
        clauses.append(_clause("product_description", term, phrase=False))

    parts: list[str] = []
    if clauses:
        parts.append("search=" + "+AND+".join(clauses))  # openFDA uses +AND+
    parts.append("sort=report_date:desc")
    parts.append(f"limit={limit}")
    if s.openfda_api_key:
        parts.append(f"api_key={s.openfda_api_key}")

    url = f"{s.openfda_base_url}?{'&'.join(parts)}"
    async with httpx.AsyncClient(timeout=15) as client:
        r = await client.get(url)
        r.raise_for_status()
        data = r.json()
    return [normalize(x) for x in data.get("results", [])]


async def get_latest_recall(classification: str = "Class I") -> dict | None:
    items = await search_recalls(classification=classification, limit=1)
    return items[0] if items else None
