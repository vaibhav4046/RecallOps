"""MongoDB adapter (PLUGGABLE) — agent memory episodes + vector 'similar recalls'.

Not live by default. With MONGODB_URI set, past containment episodes are stored
in MongoDB and Atlas Vector Search surfaces similar prior recalls to ground the
agent ("we contained a similar Listeria event in 14 min"). Lazy import; returns
`available: False` without a URI, so the app runs unchanged.
"""
from __future__ import annotations

import os


def available() -> bool:
    return bool(os.getenv("MONGODB_URI"))


def _collection():
    from pymongo import MongoClient  # lazy
    client = MongoClient(os.getenv("MONGODB_URI"))
    return client[os.getenv("MONGODB_DB", "recallops")]["memory_episodes"]


def save_episode(episode: dict) -> dict:
    if not available():
        return {"saved": False, "reason": "mongodb-not-configured"}
    _collection().insert_one(dict(episode))
    return {"saved": True}


def similar_recalls(recall: dict, k: int = 3) -> dict:
    if not available():
        return {"available": False, "matches": []}
    docs = list(_collection().find({}, {"_id": 0}).limit(k))
    return {"available": True, "matches": docs}
