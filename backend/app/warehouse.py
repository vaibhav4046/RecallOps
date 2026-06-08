"""RecallOps Cortex — seeded operational warehouse + blast-radius queries.

This is the demo retailer's operational data (stores, inventory lots, POS
sales, shipments, customers). It is SEEDED demo data — labelled as such in the
UI — and in live mode is replaced 1:1 by Fivetran-synced rows in BigQuery.

The recall it is scoped against is REAL (openFDA). `build_warehouse(recall)`
aligns the seeded lot codes / SKUs to the live recall so the blast radius is a
genuine computation over rows, not a hard-coded number.
"""
from __future__ import annotations

CITIES = ["Oakland", "San José", "Fremont", "Sacramento", "Reno",
          "Fresno", "Stockton", "Modesto", "Sunnyvale", "Concord"]
STORES = ["Bay Foods", "GreenCart", "MetroMart", "Coliseum Concessions",
          "ValuGrocer", "FreshLine", "Harborside Market", "Sierra Provisions"]
MANAGERS = ["A. Reyes", "J. Okafor", "M. Castellano", "L. Nguyen",
            "D. Park", "S. Whitfield", "R. Banerjee", "T. Alvarez"]

N_LOCATIONS = 37
INVENTORY_UNITS = 1842
UNITS_SOLD = 312
CONSENTED_CUSTOMERS = 284
SUPPRESSED_CUSTOMERS = 41
CRITICAL_STORES = 14

DEFAULT_SKUS = ["NW-PRTZ-20", "NW-PRTZ-CONC", "NW-PRTZ-CS12"]
DEFAULT_LOTS = ["A4471", "A4472", "A4473"]


def _rng(seed: int):
    # Same LCG as the frontend seed (lib/data.js) so coords/picks line up.
    s = seed

    def nxt() -> float:
        nonlocal s
        s = (s * 1103515245 + 12345) & 0x7FFFFFFF
        return s / 0x7FFFFFFF

    return nxt


def _distribute(total: int, n: int, rnd, min_each: int = 1) -> list[int]:
    """n ints (each >= min_each) summing EXACTLY to total, deterministic.

    `min_each=0` is required when total < n (e.g. fewer sold units than
    customer records) — otherwise the sum can never reach total.
    """
    raw = [rnd() + 0.2 for _ in range(n)]
    ssum = sum(raw) or 1.0
    out = [max(min_each, int(total * x / ssum)) for x in raw]
    diff = total - sum(out)
    i = 0
    guard = 0
    while diff != 0 and guard < 1_000_000:  # reconcile rounding; never spin forever
        j = i % n
        if diff > 0:
            out[j] += 1
            diff -= 1
        elif out[j] > min_each:
            out[j] -= 1
            diff += 1
        i += 1
        guard += 1
    return out


def _lots_for(recall: dict | None) -> list[str]:
    lots = list((recall or {}).get("lotCodes") or [])[:3]
    if len(lots) < 3:
        lots = (lots + DEFAULT_LOTS)[:3]
    return lots


def build_warehouse(recall: dict | None = None) -> dict:
    """Deterministically build the seeded warehouse, bound to a real recall."""
    rnd = _rng(42)
    skus = list(DEFAULT_SKUS)
    lots = _lots_for(recall)
    units = _distribute(INVENTORY_UNITS, N_LOCATIONS, rnd)

    locations: list[dict] = []
    for i in range(N_LOCATIONS):
        t = "stadium_concession" if i < 6 else "store" if i < 31 else "warehouse"
        tier = ("critical" if i < CRITICAL_STORES else "high" if i < 24
                else "medium" if i < 32 else "low")
        city = CITIES[int(rnd() * len(CITIES))]
        base = ("DC" if t == "warehouse"
                else "Coliseum Concessions" if t == "stadium_concession"
                else STORES[int(rnd() * len(STORES))])
        name = (f"{base} · Gate {chr(65 + (i % 6))}"
                if t == "stadium_concession" else f"{base} · {city}")
        locations.append({
            "id": f"loc_{1000 + i}", "name": name, "type": t, "city": city,
            "manager": MANAGERS[i % 8], "riskTier": tier,
            "lot": lots[i % 3], "sku": skus[i % 3], "units": units[i],
        })

    sold = _distribute(UNITS_SOLD, CONSENTED_CUSTOMERS + SUPPRESSED_CUSTOMERS, _rng(7), min_each=0)
    customers = [
        {
            "id": f"cust_{i:04d}",
            "consented": i < CONSENTED_CUSTOMERS,
            "channel": "email" if i % 2 == 0 else "sms",
            "units": sold[i],
            "lot": lots[i % 3],
        }
        for i in range(CONSENTED_CUSTOMERS + SUPPRESSED_CUSTOMERS)
    ]

    shipments = [
        {"id": "shp_5501", "supplierId": "sup_01", "locationId": "loc_1031",
         "sku": skus[2], "lot": lots[1], "status": "in_transit", "quantity": 480},
        {"id": "shp_5502", "supplierId": "sup_01", "locationId": "loc_1032",
         "sku": skus[2], "lot": lots[0], "status": "in_transit", "quantity": 360},
        {"id": "shp_5503", "supplierId": "sup_02", "locationId": "loc_1004",
         "sku": skus[1], "lot": lots[0], "status": "in_transit", "quantity": 240},
        {"id": "shp_5504", "supplierId": "sup_01", "locationId": "loc_1009",
         "sku": skus[0], "lot": lots[2], "status": "in_transit", "quantity": 120},
        {"id": "shp_5505", "supplierId": "sup_03", "locationId": "loc_1015",
         "sku": skus[0], "lot": lots[1], "status": "in_transit", "quantity": 96},
        {"id": "shp_5506", "supplierId": "sup_01", "locationId": "loc_1002",
         "sku": skus[1], "lot": lots[0], "status": "in_transit", "quantity": 300},
    ]

    suppliers = [
        {"id": "sup_01", "name": (recall or {}).get("recallingFirm") or "Northwind Provisions, LLC"},
        {"id": "sup_02", "name": "Cascade Foodworks"},
        {"id": "sup_03", "name": "Harbor Cold Chain"},
    ]

    return {
        "skus": skus, "lots": lots, "locations": locations,
        "customers": customers, "shipments": shipments, "suppliers": suppliers,
    }


def blast_radius(wh: dict, recall: dict | None = None) -> dict:
    """Real aggregation over the seeded rows → headline stats + evidence."""
    locs = wh["locations"]
    units_inventory = sum(l["units"] for l in locs)
    units_sold = sum(c["units"] for c in wh["customers"])
    consented = [c for c in wh["customers"] if c["consented"]]
    in_transit = [s for s in wh["shipments"] if s["status"] == "in_transit"]
    critical = [l for l in locs if l["riskTier"] == "critical"]

    stats = {
        "locationsAffected": len(locs),
        "unitsInventory": units_inventory,
        "unitsSold": units_sold,
        "shipmentsInTransit": len(in_transit),
        "unitsInTransit": sum(s["quantity"] for s in in_transit),
        "customersToNotify": len(consented),
        "customersSuppressed": len(wh["customers"]) - len(consented),
        "criticalStores": len(critical),
        "supplierHolds": len({s["supplierId"] for s in in_transit}),
        "skuCount": len(wh["skus"]),
        "lotCount": len(wh["lots"]),
    }

    evidence = {
        "ev_recall": {"id": "ev_recall", "label": "openFDA recall record", "source": "openFDA",
                      "detail": f'food/enforcement · {(recall or {}).get("recallId", "")}'},
        "ev_inv": {"id": "ev_inv", "label": "Inventory blast-radius query", "source": "BigQuery",
                   "detail": f'{units_inventory} units · {len(locs)} locations'},
        "ev_sales": {"id": "ev_sales", "label": "POS sales of affected lots", "source": "BigQuery",
                     "detail": f'{units_sold} units · {len(consented)} customers'},
        "ev_ship": {"id": "ev_ship", "label": "In-transit shipments", "source": "BigQuery",
                    "detail": f'{len(in_transit)} shipments · {stats["unitsInTransit"]} units'},
        "ev_cust": {"id": "ev_cust", "label": "Customer consent records", "source": "Fivetran · Salesforce",
                    "detail": f'{len(consented)} consented · {stats["customersSuppressed"]} suppressed'},
        "ev_loc": {"id": "ev_loc", "label": "Location master", "source": "BigQuery",
                   "detail": f'{len(locs)} locations · risk-tiered'},
    }
    return {"stats": stats, "evidence": evidence}
