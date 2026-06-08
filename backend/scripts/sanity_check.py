"""Fast sanity check for the core backend modules (no cloud imports)."""
import os
import sys

sys.path.insert(0, os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

from app import audit, config, warehouse  # noqa: E402


def main() -> int:
    s = config.get_settings()
    print("mode:", s.mode, "| integrations:", s.integration_status(), "| model:", s.gemini_model)

    recall = {
        "recallId": "H-0814-2026",
        "lotCodes": ["2026-51127"],
        "recallingFirm": "PS Seasoning & Spices, Inc.",
    }
    wh = warehouse.build_warehouse(recall)
    st = warehouse.blast_radius(wh, recall)["stats"]
    print("stats:", {k: st[k] for k in (
        "locationsAffected", "unitsInventory", "unitsSold",
        "shipmentsInTransit", "customersToNotify", "criticalStores", "supplierHolds")})
    assert st["unitsInventory"] == 1842, st["unitsInventory"]
    assert st["unitsSold"] == 312, st["unitsSold"]
    assert st["customersToNotify"] == 284, st["customersToNotify"]
    assert st["locationsAffected"] == 37, st["locationsAffected"]

    log = audit.AuditLog()
    log.append(recall_id="H-0814-2026", actor_type="system", actor_name="poller",
               event_type="RECALL_DETECTED", label="Recall detected")
    log.append(recall_id="H-0814-2026", actor_type="agent", actor_name="Gemini",
               event_type="QUERY_RUN", label="Blast radius computed")
    v = log.verify()
    print("audit verify:", v)
    assert v["intact"] is True
    log._events[0]["label"] = "HACKED"
    tampered = log.verify()
    print("after tamper intact:", tampered["intact"])
    assert tampered["intact"] is False

    print("ALL OK")
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
