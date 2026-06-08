/* ============================================================
   RecallOps Command — Sections (part 2)
   BlastRadiusMap · ActionCard · ActionQueue · ApprovalModal
   ============================================================ */

const TIER = {
  critical: { c: "var(--class-1)", label: "Critical" },
  high: { c: "var(--class-2)", label: "High" },
  medium: { c: "var(--class-3)", label: "Medium" },
  low: { c: "var(--t3)", label: "Low" },
};
const LOC_ICON = { stadium_concession: "users", store: "store", warehouse: "building" };

/* ---------------- Blast radius map ---------------- */
function BlastRadiusMap({ height = 380 }) {
  const { analyzeOn } = useRO();
  const locs = window.RO.locations;
  const [lit, setLit] = useState(analyzeOn ? locs.length : 0);
  const timer = useRef(0);
  useEffect(() => {
    if (!analyzeOn) { setLit(0); return; }
    let n = 0;
    const tick = () => {
      n += 1; setLit(n);
      if (n < locs.length) timer.current = setTimeout(tick, 55);
    };
    tick();
    return () => clearTimeout(timer.current);
  }, [analyzeOn]);

  return (
    <div className="panel" style={{ padding: 0, overflow: "hidden", position: "relative" }}>
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "12px 16px", borderBottom: "1px solid var(--border)", position: "relative", zIndex: 2 }}>
        <div style={{ display: "flex", alignItems: "center", gap: 9 }}>
          <Icon name="radar" size={15} style={{ color: "var(--cyan)" }} />
          <span style={{ fontSize: 13, fontWeight: 600, fontFamily: "var(--f-display)", color: "var(--t1)" }}>BigQuery blast-radius analysis</span>
        </div>
        <span className="mono" style={{ fontSize: 11, color: analyzeOn ? "var(--class-1)" : "var(--t3)" }}>{analyzeOn ? lit + " / " + locs.length + " locations" : "standby"}</span>
      </div>

      <div style={{ position: "relative", height, background: "radial-gradient(120% 100% at 30% 20%, rgba(6,182,212,0.05), transparent 55%), radial-gradient(120% 100% at 80% 90%, rgba(239,68,68,0.05), transparent 55%), var(--bg-2)", overflow: "hidden" }}>
        {/* grid */}
        <svg width="100%" height="100%" style={{ position: "absolute", inset: 0, opacity: 0.5 }} preserveAspectRatio="none">
          <defs>
            <pattern id="rogrid" width="44" height="44" patternUnits="userSpaceOnUse">
              <path d="M44 0H0V44" fill="none" stroke="rgba(138,153,176,0.08)" strokeWidth="1" />
            </pattern>
          </defs>
          <rect width="100%" height="100%" fill="url(#rogrid)" />
        </svg>

        {/* markers */}
        {locs.map((l, i) => {
          const on = i < lit;
          const tier = TIER[l.riskTier];
          const sz = l.type === "warehouse" ? 13 : l.riskTier === "critical" ? 11 : 8;
          return (
            <div key={l.id} title={l.name + " · " + tier.label} style={{ position: "absolute", left: l.mx * 100 + "%", top: l.my * 100 + "%", transform: "translate(-50%,-50%)", zIndex: 1 }}>
              {on && l.riskTier === "critical" && (
                <span style={{ position: "absolute", left: "50%", top: "50%", width: sz * 3, height: sz * 3, borderRadius: "50%", border: "1.5px solid " + tier.c, animation: "ro-ripple 2.4s ease-out infinite", animationDelay: (i % 6) * 0.3 + "s" }} />
              )}
              <span style={{
                display: "block", width: sz, height: sz, borderRadius: "50%", flex: "none",
                background: on ? tier.c : "var(--t4)", border: "1.5px solid " + (on ? "color-mix(in srgb," + tier.c + " 60%, #fff)" : "var(--border-2)"),
                boxShadow: on ? "0 0 12px -1px " + tier.c : "none", transition: "all .3s", opacity: on ? 1 : 0.3,
              }} />
            </div>
          );
        })}

        {!analyzeOn && (
          <div style={{ position: "absolute", inset: 0, display: "grid", placeItems: "center", zIndex: 2 }}>
            <div style={{ textAlign: "center", color: "var(--t3)" }}>
              <Icon name="radar" size={28} style={{ color: "var(--t4)", margin: "0 auto 10px" }} />
              <div style={{ fontSize: 13, color: "var(--t2)" }}>Blast radius not yet computed</div>
              <div className="mono" style={{ fontSize: 11, marginTop: 4 }}>trigger containment to map affected locations</div>
            </div>
          </div>
        )}

        {/* legend */}
        <div style={{ position: "absolute", left: 14, bottom: 12, display: "flex", gap: 12, flexWrap: "wrap", zIndex: 3, background: "rgba(13,19,32,0.7)", padding: "7px 11px", borderRadius: "var(--r-sm)", border: "1px solid var(--border)", backdropFilter: "blur(6px)" }}>
          {Object.entries(TIER).map(([k, v]) => (
            <span key={k} style={{ display: "inline-flex", alignItems: "center", gap: 6, fontSize: 10.5, fontFamily: "var(--f-mono)", color: "var(--t2)" }}>
              <span style={{ width: 8, height: 8, borderRadius: "50%", background: v.c }} /> {v.label}
            </span>
          ))}
        </div>
      </div>
    </div>
  );
}

/* ---------------- Action card ---------------- */
const ACTION_ICON = { STOP_SALE: "lock", SHELF_PULL: "package", SUPPLIER_HOLD: "truck", CUSTOMER_NOTICE: "bell", REPLACEMENT_PO: "refresh", COMPLIANCE_REPORT: "fileCheck" };

function ActionCard({ action, state, onApprove, onReject, delay = 0 }) {
  const [showEv, setShowEv] = useState(false);
  const executed = state.status === "executed";
  const rejected = state.approvalState === "rejected";
  const pt = PRIORITY_TONE[action.priority];
  const evReg = window.RO.evidence;
  return (
    <div className="rise panel lift" style={{
      "--dur": "0.5s", animationDelay: delay + "ms", padding: 17,
      borderColor: executed ? "rgba(16,185,129,.5)" : rejected ? "rgba(239,68,68,.4)" : "var(--border)",
      boxShadow: executed ? "var(--glow-emerald)" : "var(--sh-1)", transition: "border-color .4s, box-shadow .4s",
      animationName: executed ? "ro-exec" : undefined, animationDuration: executed ? "0.6s" : undefined, animationIterationCount: 1,
    }}>
      <div style={{ display: "flex", alignItems: "flex-start", gap: 13 }}>
        <div style={{ width: 38, height: 38, borderRadius: "var(--r-sm)", flex: "none", display: "grid", placeItems: "center",
          background: executed ? "var(--success-dim)" : "var(--panel-3)", border: "1px solid " + (executed ? "rgba(16,185,129,.35)" : "var(--border-2)"),
          color: executed ? "var(--success)" : "var(--cyan)" }}>
          <Icon name={executed ? "shieldCheck" : ACTION_ICON[action.type]} size={19} />
        </div>
        <div style={{ flex: 1, minWidth: 0 }}>
          <div style={{ display: "flex", alignItems: "center", gap: 8, flexWrap: "wrap", marginBottom: 5 }}>
            <Badge tone={pt}>{action.priority}</Badge>
            <span className="mono" style={{ fontSize: 10.5, color: "var(--t3)" }}>{action.type.replace(/_/g, " ")}</span>
            {executed && <Badge tone="success">Approved</Badge>}
            {rejected && <Badge tone="danger">Rejected</Badge>}
          </div>
          <h4 style={{ margin: 0, fontSize: 15, fontWeight: 600, color: "var(--t1)", letterSpacing: "-.01em" }}>{action.title}</h4>
          <div style={{ display: "flex", gap: 14, flexWrap: "wrap", marginTop: 7 }}>
            <Meta label="Owner" value={action.owner} />
            <Meta label="Scope" value={action.scope} />
            <Meta label="Risk" value={action.risk} tone={action.risk === "high" ? "var(--class-1)" : action.risk === "medium" ? "var(--class-2)" : "var(--success)"} />
          </div>
        </div>
      </div>

      <p style={{ margin: "13px 0 0", fontSize: 12.5, color: "var(--t2)", lineHeight: 1.55, background: "var(--bg-2)", padding: "11px 13px", borderRadius: "var(--r-sm)", border: "1px solid var(--border)" }}>{action.draft}</p>

      <div style={{ display: "flex", alignItems: "center", gap: 8, marginTop: 11, flexWrap: "wrap" }}>
        <span className="label" style={{ marginRight: 2 }}>Evidence</span>
        {action.evidenceIds.map(eid => (
          <span key={eid} className="mono" style={{ fontSize: 10.5, padding: "3px 8px", borderRadius: "var(--r-xs)", color: "var(--cyan)", background: "var(--cyan-dim)", border: "1px solid var(--cyan-line)" }}>{evReg[eid]?.label || eid}</span>
        ))}
      </div>

      {showEv && (
        <div style={{ marginTop: 11, display: "flex", flexDirection: "column", gap: 7 }}>
          {action.evidenceIds.map(eid => {
            const e = evReg[eid]; if (!e) return null;
            return (
              <div key={eid} style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: 10, padding: "9px 11px", background: "var(--bg-2)", borderRadius: "var(--r-sm)", border: "1px solid var(--border)" }}>
                <div style={{ minWidth: 0 }}>
                  <div style={{ fontSize: 12.5, color: "var(--t1)", fontWeight: 500 }}>{e.label}</div>
                  <div className="mono" style={{ fontSize: 10.5, color: "var(--t3)", marginTop: 2 }}>{e.detail}</div>
                </div>
                <Badge tone="blue">{e.source}</Badge>
              </div>
            );
          })}
        </div>
      )}

      <div style={{ display: "flex", alignItems: "center", gap: 8, marginTop: 14, flexWrap: "wrap" }}>
        {!executed && !rejected ? (
          <>
            <Button variant="success" size="sm" icon="check" onClick={() => onApprove(action)}>Approve</Button>
            <Button variant="ghost" size="sm" onClick={() => onReject(action.id)}>Reject</Button>
          </>
        ) : executed ? (
          <span style={{ display: "inline-flex", alignItems: "center", gap: 7, fontSize: 12.5, color: "var(--success)", fontWeight: 600 }}>
            <Icon name="shieldCheck" size={15} /> Approved · audit-logged (no external dispatch)
          </span>
        ) : (
          <Button variant="ghost" size="sm" icon="refresh" onClick={() => onReject(action.id)}>Re-draft</Button>
        )}
        <button onClick={() => setShowEv(v => !v)} style={{ marginLeft: "auto", background: "none", border: "none", color: "var(--t3)", fontSize: 12, cursor: "pointer", display: "inline-flex", alignItems: "center", gap: 5, fontFamily: "var(--f-mono)" }}>
          Inspect evidence <Icon name="chevronDown" size={13} style={{ transform: showEv ? "rotate(180deg)" : "none", transition: "transform .2s" }} />
        </button>
      </div>
    </div>
  );
}
function Meta({ label, value, tone }) {
  return (<div style={{ minWidth: 0 }}><div className="label" style={{ fontSize: 9.5 }}>{label}</div><div style={{ fontSize: 12, color: tone || "var(--t2)", fontWeight: 500, marginTop: 2, textTransform: tone ? "capitalize" : "none" }}>{value}</div></div>);
}

/* ---------------- Action queue ---------------- */
function ActionQueue({ onApprove }) {
  const { actionState, rejectAction } = useRO();
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 13 }}>
      {window.RO.actions.map((a, i) => (
        <ActionCard key={a.id} action={a} state={actionState[a.id]} onApprove={onApprove} onReject={rejectAction} delay={i * 60} />
      ))}
    </div>
  );
}

/* ---------------- Approval modal ---------------- */
function ApprovalModal({ action, onApprove, onCancel }) {
  const checklist = [
    "FDA recall source attached",
    "Fivetran sync completed",
    "BigQuery evidence attached",
    "Customer-facing impact reviewed",
    "Rollback / correction path available",
    "Audit log entry will be written",
  ];
  const [checks, setChecks] = useState(checklist.map(() => true));
  useEffect(() => {
    const onKey = (e) => { if (e.key === "Escape") onCancel(); };
    window.addEventListener("keydown", onKey); document.body.style.overflow = "hidden";
    return () => { window.removeEventListener("keydown", onKey); document.body.style.overflow = ""; };
  }, []);
  const all = checks.every(Boolean);
  return (
    <div role="dialog" aria-modal="true" aria-label="Approve containment action" onClick={onCancel} style={{ position: "fixed", inset: 0, zIndex: 100, background: "rgba(4,7,13,0.76)", backdropFilter: "blur(6px)", display: "grid", placeItems: "center", padding: 18 }}>
      <div onClick={e => e.stopPropagation()} className="rise" style={{ "--dur": "0.26s", width: "min(520px,100%)", background: "var(--panel)", border: "1px solid var(--border-3)", borderRadius: "var(--r-md)", boxShadow: "var(--sh-2)", overflow: "hidden", maxHeight: "92vh", display: "flex", flexDirection: "column" }}>
        <div style={{ padding: "18px 20px", borderBottom: "1px solid var(--border)", display: "flex", gap: 13, alignItems: "flex-start" }}>
          <div style={{ width: 38, height: 38, borderRadius: "var(--r-sm)", background: "var(--cyan-dim)", border: "1px solid var(--cyan-line)", display: "grid", placeItems: "center", color: "var(--cyan)", flex: "none" }}><Icon name="shield" size={19} /></div>
          <div style={{ minWidth: 0 }}>
            <h2 style={{ margin: 0, fontSize: 17, fontWeight: 600, fontFamily: "var(--f-display)", color: "var(--t1)" }}>Approve containment action?</h2>
            <p style={{ margin: "5px 0 0", fontSize: 12.5, color: "var(--t3)", lineHeight: 1.5 }}>No external action executes without approval. This entry will be written to the audit timeline.</p>
          </div>
        </div>
        <div style={{ padding: "16px 20px", overflowY: "auto" }}>
          <div style={{ display: "flex", alignItems: "center", gap: 9, marginBottom: 14, flexWrap: "wrap" }}>
            <Badge tone={PRIORITY_TONE[action.priority]}>{action.priority}</Badge>
            <span className="mono" style={{ fontSize: 12, color: "var(--cyan)" }}>{action.type.replace(/_/g, " ")}</span>
            <span style={{ fontSize: 13, color: "var(--t1)", fontWeight: 500 }}>{action.title}</span>
          </div>
          <div className="label" style={{ marginBottom: 10 }}>Pre-execution checklist</div>
          <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
            {checklist.map((c, i) => (
              <button key={i} onClick={() => setChecks(cs => cs.map((v, j) => j === i ? !v : v))} style={{
                display: "flex", alignItems: "center", gap: 11, padding: "10px 12px", textAlign: "left", cursor: "pointer",
                background: checks[i] ? "var(--success-dim)" : "var(--panel-2)", border: "1px solid " + (checks[i] ? "rgba(16,185,129,.3)" : "var(--border-2)"),
                borderRadius: "var(--r-sm)", color: "var(--t1)", fontFamily: "var(--f-sans)", fontSize: 13,
              }}>
                <span style={{ width: 18, height: 18, borderRadius: "var(--r-xs)", flex: "none", display: "grid", placeItems: "center",
                  background: checks[i] ? "var(--success)" : "transparent", border: "1px solid " + (checks[i] ? "var(--success)" : "var(--border-3)"), color: "#06101c" }}>
                  {checks[i] && <Icon name="check" size={12} stroke={2.6} />}
                </span>{c}
              </button>
            ))}
          </div>
        </div>
        <div style={{ padding: "14px 20px", borderTop: "1px solid var(--border)", display: "flex", gap: 10, justifyContent: "flex-end", alignItems: "center" }}>
          {!all && <span className="mono" style={{ fontSize: 11, color: "var(--warning)", marginRight: "auto" }}>complete checklist to execute</span>}
          <Button variant="ghost" onClick={onCancel}>Cancel</Button>
          <Button variant="primary" icon="zap" disabled={!all} onClick={() => onApprove(action.id)}>Approve and Execute</Button>
        </div>
      </div>
    </div>
  );
}

Object.assign(window, { BlastRadiusMap, ActionCard, ActionQueue, ApprovalModal, TIER, LOC_ICON, ACTION_ICON, Meta });
