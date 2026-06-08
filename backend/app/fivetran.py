"""Lazy Fivetran REST adapter — real connector status + sync trigger.

Active when FIVETRAN_API_KEY / FIVETRAN_API_SECRET are set; the caller falls
back to seeded sync runs otherwise. This is the partner integration for the
Fivetran track (the Fivetran MCP server wires the same operations as agent
tools — see docs/setup.md §5). API: https://fivetran.com/docs/rest-api
"""
from __future__ import annotations

import base64

import httpx

from .config import get_settings

BASE = "https://api.fivetran.com/v1"


def _auth_header() -> str:
    s = get_settings()
    raw = f"{s.fivetran_api_key}:{s.fivetran_api_secret}".encode()
    return "Basic " + base64.b64encode(raw).decode()


def _map(c: dict) -> dict:
    status = c.get("status") or {}
    return {
        "id": c.get("id"),
        "connector": c.get("service"),
        "source": c.get("schema") or c.get("service"),
        "destination": "BigQuery",
        "status": status.get("sync_state") or status.get("setup_state") or "unknown",
        "syncedAt": c.get("succeeded_at"),
        "recordsSynced": None,
    }


async def list_connectors() -> list[dict]:
    s = get_settings()
    headers = {"Authorization": _auth_header(), "Accept": "application/json"}
    url = (f"{BASE}/groups/{s.fivetran_group_id}/connectors"
           if s.fivetran_group_id else f"{BASE}/connectors")
    async with httpx.AsyncClient(timeout=20) as client:
        r = await client.get(url, headers=headers)
        r.raise_for_status()
        data = r.json()
    items = (data.get("data") or {}).get("items") or []
    return [_map(c) for c in items]


async def trigger_sync(connector_id: str) -> dict:
    headers = {"Authorization": _auth_header(), "Accept": "application/json"}
    async with httpx.AsyncClient(timeout=20) as client:
        r = await client.post(f"{BASE}/connectors/{connector_id}/sync",
                              headers=headers, json={"force": True})
        r.raise_for_status()
        return r.json()


async def sync_all() -> list[dict]:
    """Force-sync every connector, then return fresh status."""
    connectors = await list_connectors()
    for c in connectors:
        if c.get("id"):
            try:
                await trigger_sync(c["id"])
            except Exception:
                pass
    return await list_connectors()
