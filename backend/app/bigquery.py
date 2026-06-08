"""Lazy BigQuery adapter — real query **job IDs** for the blast radius.

Active only when GOOGLE_CLOUD_PROJECT is set. Tables are loaded from the same
seed the fallback uses, so live and fallback produce identical numbers — the
difference is that live mode runs real BigQuery jobs and surfaces their job IDs
as proof (the verifiability edge for judging). Loading is done by
backend/scripts/load_bigquery.py.
"""
from __future__ import annotations

from .config import get_settings


def _bq():
    from google.cloud import bigquery  # lazy
    return bigquery.Client(project=get_settings().google_cloud_project)


def dataset() -> str:
    s = get_settings()
    return f"{s.google_cloud_project}.{s.bigquery_dataset}"


TABLES = {
    "store_locations": ("id STRING, name STRING, type STRING, city STRING, manager STRING, "
                        "risk_tier STRING, lot STRING, sku STRING, units INT64"),
    "inventory_lots": "location_id STRING, sku STRING, lot STRING, units INT64",
    "pos_sales": "customer_id STRING, sku STRING, lot STRING, units INT64, consented BOOL, channel STRING",
    "shipments": ("id STRING, supplier_id STRING, location_id STRING, sku STRING, lot STRING, "
                  "status STRING, quantity INT64"),
    "recalls_raw": ("recall_id STRING, classification STRING, product_description STRING, "
                    "recalling_firm STRING, reason STRING, distribution_pattern STRING, "
                    "event_date STRING, source_url STRING"),
}


def ensure_tables() -> None:
    from google.cloud import bigquery
    client = _bq()
    ds = bigquery.Dataset(dataset())
    ds.location = "US"
    client.create_dataset(ds, exists_ok=True)
    for name, cols in TABLES.items():
        client.query(f"CREATE TABLE IF NOT EXISTS `{dataset()}.{name}` ({cols})").result()


def load_warehouse(wh: dict, recall: dict) -> None:
    """Truncate + load the seed rows into BigQuery (idempotent)."""
    from google.cloud import bigquery
    client = _bq()
    sku0 = wh["skus"][0]
    rows = {
        "store_locations": [
            {"id": l["id"], "name": l["name"], "type": l["type"], "city": l["city"],
             "manager": l["manager"], "risk_tier": l["riskTier"], "lot": l["lot"],
             "sku": l["sku"], "units": l["units"]} for l in wh["locations"]
        ],
        "inventory_lots": [
            {"location_id": l["id"], "sku": l["sku"], "lot": l["lot"], "units": l["units"]}
            for l in wh["locations"]
        ],
        "pos_sales": [
            {"customer_id": c["id"], "sku": sku0, "lot": c["lot"], "units": c["units"],
             "consented": c["consented"], "channel": c["channel"]} for c in wh["customers"]
        ],
        "shipments": [
            {"id": s["id"], "supplier_id": s["supplierId"], "location_id": s["locationId"],
             "sku": s["sku"], "lot": s["lot"], "status": s["status"], "quantity": s["quantity"]}
            for s in wh["shipments"]
        ],
        "recalls_raw": [{
            "recall_id": recall.get("recallId", ""), "classification": recall.get("classification", ""),
            "product_description": recall.get("productDescription", ""),
            "recalling_firm": recall.get("recallingFirm", ""), "reason": recall.get("reason", ""),
            "distribution_pattern": recall.get("distributionPattern", ""),
            "event_date": recall.get("eventDate", ""), "source_url": recall.get("sourceUrl", ""),
        }],
    }
    for name, data in rows.items():
        job = client.load_table_from_json(
            data, f"{dataset()}.{name}",
            job_config=bigquery.LoadJobConfig(write_disposition="WRITE_TRUNCATE"),
        )
        job.result()


def query_blast_radius() -> dict:
    """Run the blast-radius aggregations as real BigQuery jobs; return job IDs."""
    client = _bq()
    d = dataset()
    jobs: dict[str, str] = {}

    def one(key: str, sql: str) -> dict:
        job = client.query(sql)
        rows = list(job.result())
        jobs[key] = job.job_id
        return dict(rows[0]) if rows else {}

    inv = one("inventory", f"SELECT COUNT(DISTINCT location_id) locs, SUM(units) units, "
                           f"COUNT(DISTINCT sku) skus, COUNT(DISTINCT lot) lots FROM `{d}.inventory_lots`")
    sold = one("pos", f"SELECT SUM(units) units, COUNTIF(consented) consented, "
                      f"COUNTIF(NOT consented) suppressed FROM `{d}.pos_sales`")
    ship = one("shipments", f"SELECT COUNT(*) n, SUM(quantity) units, COUNT(DISTINCT supplier_id) suppliers "
                            f"FROM `{d}.shipments` WHERE status='in_transit'")
    loc = one("locations", f"SELECT COUNTIF(risk_tier='critical') critical, COUNT(*) total FROM `{d}.store_locations`")

    stats = {
        "locationsAffected": int(inv.get("locs") or 0),
        "unitsInventory": int(inv.get("units") or 0),
        "unitsSold": int(sold.get("units") or 0),
        "shipmentsInTransit": int(ship.get("n") or 0),
        "unitsInTransit": int(ship.get("units") or 0),
        "customersToNotify": int(sold.get("consented") or 0),
        "customersSuppressed": int(sold.get("suppressed") or 0),
        "criticalStores": int(loc.get("critical") or 0),
        "supplierHolds": int(ship.get("suppliers") or 0),
        "skuCount": int(inv.get("skus") or 0),
        "lotCount": int(inv.get("lots") or 0),
    }
    return {"stats": stats, "job_ids": jobs}
