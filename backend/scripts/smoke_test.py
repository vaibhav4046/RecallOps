"""End-to-end smoke test against a running RecallOps Cortex API.

Drives the whole containment flow and prints the proof points a judge cares
about: a REAL openFDA recall id, live sync/query timestamps, trace ids, the
agent run, the human-approval gate, and a verified audit hash-chain.
"""
import json
import sys
import time
import urllib.error
import urllib.request

try:  # Windows consoles default to cp1252; force utf-8 for ·, ✅ etc.
    sys.stdout.reconfigure(encoding="utf-8")
except Exception:
    pass

BASE = "http://127.0.0.1:8099"


def call(method: str, path: str, body=None):
    data = json.dumps(body).encode() if body is not None else None
    req = urllib.request.Request(
        BASE + path, data=data, method=method,
        headers={"Content-Type": "application/json"})
    with urllib.request.urlopen(req, timeout=40) as r:
        return r.status, json.load(r), dict(r.headers)


def wait_health(n: int = 40) -> bool:
    for _ in range(n):
        try:
            s, _, _ = call("GET", "/api/health")
            if s == 200:
                return True
        except Exception:
            pass
        time.sleep(0.75)
    return False


def main() -> int:
    if not wait_health():
        print("FAIL: server did not come up")
        return 1

    _, h, _ = call("GET", "/api/health")
    print(f"[health]   mode={h['mode']} recall={h['recall_id']} live={h['recall_live']} "
          f"integrations={h['integrations']} trace={h['trace_id']}")

    _, latest, _ = call("GET", "/api/recalls/latest")
    rc = latest["recall"]
    print(f"[recall]   {rc['recallId']} · {rc['classification']} · {rc['recallingFirm']} "
          f"· lots={rc['lotCodes']} real={rc.get('_real')}")

    _, sync, _ = call("POST", "/api/fivetran/sync")
    print(f"[fivetran] synced_at={sync['syncedAt']} freshness={sync['freshnessSec']}s "
          f"records={sync['recordsTotal']}")

    _, blast, _ = call("POST", "/api/blast-radius")
    print(f"[blast]    {blast['stats']}")

    _, run, _ = call("POST", "/api/agent/run")
    print(f"[agent]    model={run['run']['model']} live={run['run']['live']} "
          f"latency={run['run']['latency_ms']}ms actions={len(run['actions'])} "
          f"eval={run['run']['eval_score']}")
    print(f"           reasoning[0]={run['reasoning'][0]['t']!r}")

    actions = run["actions"]
    contained = False
    for a in actions:
        _, res, _ = call("POST", f"/api/actions/{a['id']}/approve")
        contained = res["contained"]
    print(f"[approve]  approved {len(actions)} actions · contained={contained}")

    _, rep, _ = call("POST", f"/api/report/{rc['recallId']}")
    r = rep["report"]
    print(f"[report]   contained={r['contained']} approved={r['approvedCount']} "
          f"audit_events={len(r['audit'])} integrity={r['auditIntegrity']['intact']}")

    _, au, _ = call("GET", f"/api/audit/{rc['recallId']}")
    print(f"[audit]    {len(au['events'])} events · intact={au['integrity']['intact']} "
          f"head={au['integrity'].get('head','')[:16]}…")

    ok = (h["integrations"]["openfda"] == "live" and contained
          and r["auditIntegrity"]["intact"])
    print("RESULT:", "PASS" if ok else "FAIL")
    return 0 if ok else 1


if __name__ == "__main__":
    raise SystemExit(main())
