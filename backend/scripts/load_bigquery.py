"""Create the BigQuery dataset + tables and load the seed, bound to the live recall.

Prereq: GOOGLE_CLOUD_PROJECT set and `gcloud auth application-default login` done.
Run:  python backend/scripts/load_bigquery.py
"""
import asyncio
import os
import sys

sys.path.insert(0, os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

from app import openfda, warehouse  # noqa: E402
from app import bigquery as bq  # noqa: E402
from app.config import get_settings  # noqa: E402


async def main() -> int:
    s = get_settings()
    if not s.bigquery_ready:
        print("Set GOOGLE_CLOUD_PROJECT (and authenticate) first.")
        return 1
    recall = await openfda.get_latest_recall() or {}
    wh = warehouse.build_warehouse(recall)

    print(f"[1/3] Ensuring dataset + tables in {bq.dataset()} ...")
    bq.ensure_tables()
    print(f"[2/3] Loading seed for recall {recall.get('recallId', '?')} ...")
    bq.load_warehouse(wh, recall)
    print("[3/3] Running blast-radius query ...")
    res = bq.query_blast_radius()
    print("stats:", res["stats"])
    print("job ids:", res["job_ids"])
    print("DONE — these job IDs are your BigQuery proof.")
    return 0


if __name__ == "__main__":
    raise SystemExit(asyncio.run(main()))
