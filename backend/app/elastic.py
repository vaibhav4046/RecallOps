"""Elastic adapter (PLUGGABLE) — full-text search over recalls + audit trail.

Not live by default. With ELASTIC_CLOUD_ID + ELASTIC_API_KEY set, recalls and
audit events are indexed into Elasticsearch so an analyst (or the agent's
`search_recall_history` tool) can search across historical recalls and the
compliance trail. Lazy import; returns `available: False` and a no-op without
credentials, so the app runs unchanged.
"""
from __future__ import annotations

import os


def available() -> bool:
    return bool(os.getenv("ELASTIC_CLOUD_ID") and os.getenv("ELASTIC_API_KEY"))


def _client():
    from elasticsearch import Elasticsearch  # lazy
    return Elasticsearch(cloud_id=os.getenv("ELASTIC_CLOUD_ID"), api_key=os.getenv("ELASTIC_API_KEY"))


def index_recall(recall: dict) -> dict:
    if not available():
        return {"indexed": False, "reason": "elastic-not-configured"}
    _client().index(index="recalls", id=recall.get("recallId"), document=recall)
    return {"indexed": True, "index": "recalls"}


def search(query: str, index: str = "recalls", size: int = 10) -> dict:
    if not available():
        return {"available": False, "hits": []}
    res = _client().search(
        index=index, size=size,
        query={"multi_match": {"query": query,
                               "fields": ["productDescription", "reason", "recallingFirm", "distributionPattern"]}},
    )
    return {"available": True, "hits": [h["_source"] for h in res["hits"]["hits"]]}
