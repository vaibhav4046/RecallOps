/* ============================================================
   RecallOps Command — Sections (part 3)
   PipelineViz · ComplianceTimeline · FinalReport · ArchitectureDiagram
   ============================================================ */

/* ---------------- Mini live pipeline (hero) ---------------- */
const PIPE = [
  { id: "openfda", label: "openFDA", icon: "external", phaseAt: 0 },
  { id: "mcp", label: "Fivetran MCP", icon: "refresh", phaseAt: 1 },
  { id: "bq", label: "BigQuery", icon: "database", phaseAt: 2 },
  { id: "gemini", label: "Gemini Agent", icon: "brain", phaseAt: 3 },
  { id: "human", label: "Human Approval", icon: "shield", phaseAt: 4 },
  { id: "report", label: "Compliance Report", icon: "fileCheck", phaseAt: 5 },
];
function phaseRank(phase, actionsOn, approvedCount) {
  if (phase === "idle") return -1;
  if (phase === "syncing") return 1;
  if (phase === "reasoning") return 3;
  if (phase === "review") return 4;
  if (phase === "contained") return 6;
  return 0;
}
function PipelineViz() {
  const { phase, actionsOn, approvedCount } = useRO();
  const rank = phaseRank(phase, actionsOn, approvedCount);
  return (
    <div className="panel" style={{ padding: "16px 16px 18px" }}>
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 14 }}>
        <span className="label">Live pipeline</span>
        <span style={{ display: "inline-flex", alignItems: "center", gap: 6, fontSize: 11, fontFamily: "var(--f-mono)", color: phase === "idle" ? "var(--t3)" : phase === "contained" ? "var(--success)" : "var(--cyan)" }}>
          <StatusDot tone={phase === "idle" ? "muted" : phase === "contained" ? "success" : "cyan"} live={phase !== "idle" && phase !== "contained"} /> {phase}
        </span>
      </div>
      <div style={{ display: "flex", flexDirection: "column", gap: 9 }}>
        {PIPE.map((p, i) => {
          const done = rank > p.phaseAt;
          const active = rank === p.phaseAt || (phase === "syncing" && p.id === "mcp") || (phase === "reasoning" && p.id === "gemini") || (phase === "review" && p.id === "human");
          const c = done ? "var(--success)" : active ? "var(--cyan)" : "var(--t3)";
          const bg = done ? "var(--success-dim)" : active ? "var(--cyan-dim)" : "var(--panel-2)";
          const bd = done ? "rgba(16,185,129,.3)" : active ? "var(--cyan-line)" : "var(--border)";
          return (
            <div key={p.id} style={{ display: "flex", alignItems: "center", gap: 11 }}>
              <div style={{ width: 32, height: 32, borderRadius: "var(--r-sm)", flex: "none", display: "grid", placeItems: "center", background: bg, border: "1px solid " + bd, color: c, transition: "all .4s", boxShadow: active ? "0 0 18px -6px var(--cyan)" : "none", position: "relative", overflow: "hidden" }}>
                {active && <span style={{ position: "absolute", left: "50%", top: -6, width: 4, height: 4, marginLeft: -2, borderRadius: "50%", background: "var(--cyan)", boxShadow: "0 0 8px var(--cyan)", animation: "ro-flowdown 1.3s ease-in-out infinite" }} />}
                {done ? <Icon name="check" size={15} /> : active ? <span className="spin" style={{ display: "flex" }}><Icon name="refresh" size={13} /></span> : <Icon name={p.icon} size={15} />}
              </div>
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ fontSize: 12.5, fontWeight: 600, color: done || active ? "var(--t1)" : "var(--t2)" }}>{p.label}</div>
                {active && <div style={{ height: 2, marginTop: 5, borderRadius: 999, background: "var(--bg-2)", overflow: "hidden" }}><span style={{ display: "block", width: "40%", height: "100%", background: "var(--accent-grad)", borderRadius: 999, animation: "ro-sweep 1.4s ease-in-out infinite" }} /></div>}
              </div>
              {i < PIPE.length - 1 && <span style={{ color: "var(--t4)", flex: "none" }}><Icon name="chevronDown" size={13} /></span>}
            </div>
          );
        })}
      </div>
    </div>
  );
}

/* ---------------- Compliance timeline ---------------- */
function deriveTimeline(store) {
  const { phase, sync, actionsOn, actionState } = store;
  const started = phase !== "idle";
  const syncDone = window.RO.syncRuns.every(r => sync[r.id] === "success");
  const map = {
    au_1: started ? "complete" : "pending",
    au_2: started ? "complete" : "pending",
    au_3: syncDone ? "complete" : started ? "pending" : "pending",
    au_4: actionsOn ? "complete" : "pending",
    au_5: actionState.act_1?.approvalState === "approved" ? "complete" : "pending",
    au_6: actionState.act_2?.approvalState === "approved" ? "complete" : "pending",
    au_7: actionState.act_3?.approvalState === "approved" ? "complete" : "pending",
    au_8: actionsOn ? (actionState.act_4?.approvalState === "approved" ? "complete" : "pending") : "pending",
    au_9: actionState.act_6?.approvalState === "approved" ? "complete" : "pending",
  };
  return map;
}
const ACTOR = { agent: { c: "var(--cyan)", label: "Agent", icon: "brain" }, human: { c: "var(--blue)", label: "Human", icon: "shield" }, system: { c: "var(--t3)", label: "System", icon: "cpu" } };
function ComplianceTimeline({ compact }) {
  const store = useRO();
  const status = deriveTimeline(store);
  const events = window.RO.audit;
  const liveAudit = events.some(e => e.hash);  // real backend events are completed facts
  const base = new Date(); base.setSeconds(0);
  return (
    <div style={{ display: "flex", flexDirection: "column" }}>
      {events.map((e, i) => {
        const st = liveAudit ? "complete" : status[e.id];
        const actor = ACTOR[e.actorType];
        const done = st === "complete";
        const last = i === events.length - 1;
        const c = done ? "var(--success)" : "var(--t4)";
        const t = new Date(base.getTime() - (events.length - i) * 47000);
        const z = (n) => String(n).padStart(2, "0");
        return (
          <div key={e.id} style={{ display: "flex", gap: 13 }}>
            <div style={{ display: "flex", flexDirection: "column", alignItems: "center", flex: "none", width: 22 }}>
              <div style={{ width: 20, height: 20, borderRadius: "50%", display: "grid", placeItems: "center", flex: "none", zIndex: 1,
                background: done ? "var(--success-dim)" : "var(--panel-2)", border: "1px solid " + (done ? "var(--success)" : "var(--border-2)"), color: c, transition: "all .3s" }}>
                {done ? <Icon name="check" size={11} stroke={2.4} /> : <span style={{ width: 5, height: 5, borderRadius: "50%", background: "var(--t4)" }} />}
              </div>
              {!last && <div style={{ width: 2, flex: 1, minHeight: compact ? 18 : 24, background: done ? "var(--success)" : "var(--border-2)", opacity: done ? 0.4 : 1, transition: "background .4s" }} />}
            </div>
            <div style={{ flex: 1, paddingBottom: last ? 0 : (compact ? 14 : 18), minWidth: 0, opacity: done ? 1 : 0.6, transition: "opacity .3s" }}>
              <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: 10, flexWrap: "wrap" }}>
                <span style={{ fontSize: 13.5, fontWeight: 600, color: done ? "var(--t1)" : "var(--t2)" }}>{e.label}</span>
                <span className="mono" style={{ fontSize: 10.5, color: "var(--t3)", flex: "none" }}>{z(t.getUTCHours())}:{z(t.getUTCMinutes())}:{z(t.getUTCSeconds())} UTC</span>
              </div>
              <div style={{ display: "flex", alignItems: "center", gap: 10, marginTop: 5, flexWrap: "wrap" }}>
                <span style={{ display: "inline-flex", alignItems: "center", gap: 5, fontSize: 11, fontFamily: "var(--f-mono)", color: actor.c }}>
                  <Icon name={actor.icon} size={11} /> {actor.label} · {e.actorName}
                </span>
                <a href="#" onClick={ev => ev.preventDefault()} className="mono" style={{ fontSize: 11, color: "var(--t3)", textDecoration: "none", display: "inline-flex", alignItems: "center", gap: 4 }}>
                  <Icon name="link" size={10} /> {e.evidence}
                </a>
                <Badge tone={done ? "success" : "muted"}>{done ? "complete" : "pending"}</Badge>
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
}

/* ---------------- Final report ---------------- */
function FinalReport() {
  const store = useRO();
  const { actionState, contained, approvedCount } = store;
  const s = window.RO.stats;
  const [toast, setToast] = useState(null);
  const flash = (msg) => { setToast(msg); setTimeout(() => setToast(null), 2600); };
  const executed = window.RO.actions.filter(a => actionState[a.id]?.status === "executed");
  const pending = window.RO.actions.filter(a => actionState[a.id]?.status !== "executed");
  const statusLabel = contained ? "CONTAINED" : approvedCount > 0 ? "CONTAINING" : "DRAFT";
  const statusTone = contained ? "var(--success)" : approvedCount > 0 ? "var(--cyan)" : "var(--t3)";

  const copySummary = () => {
    const text = `RecallOps Command — Recall Containment Report\nRecall: ${window.RO.recall.recallId} (${window.RO.recall.classification})\nStatus: ${statusLabel}\nActions approved: ${executed.length}/6\nLocations: ${s.locationsAffected} · Units: ${s.unitsInventory} · Customers notified: ${s.customersToNotify}`;
    if (navigator.clipboard) navigator.clipboard.writeText(text).then(() => flash("Audit summary copied")).catch(() => flash("Copy blocked by browser"));
    else flash("Audit summary copied");
  };

  return (
    <div className="panel" style={{ padding: 24, position: "relative", overflow: "hidden" }}>
      <div style={{ position: "absolute", inset: 0, background: contained ? "radial-gradient(90% 60% at 100% 0%, rgba(16,185,129,.08), transparent 55%)" : "none", pointerEvents: "none" }} />
      <div style={{ position: "relative" }}>
        <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", gap: 16, flexWrap: "wrap", marginBottom: 20 }}>
          <div style={{ minWidth: 0 }}>
            <div className="label" style={{ marginBottom: 8 }}>Audit-ready compliance report</div>
            <h2 style={{ margin: 0, fontFamily: "var(--f-display)", fontSize: "clamp(24px,3vw,32px)", fontWeight: 600, letterSpacing: "-.02em", color: "var(--t1)" }}>Recall Containment Report</h2>
            <div className="mono" style={{ fontSize: 12, color: "var(--t3)", marginTop: 7 }}>{window.RO.recall.recallId} · {window.RO.recall.recallingFirm}</div>
          </div>
          <div style={{ display: "flex", alignItems: "center", gap: 11, padding: "10px 16px", borderRadius: "var(--r-md)", background: "color-mix(in srgb," + statusTone + " 12%, transparent)", border: "1px solid color-mix(in srgb," + statusTone + " 40%, transparent)" }}>
            <span style={{ width: 9, height: 9, borderRadius: "50%", background: statusTone, boxShadow: "0 0 12px " + statusTone }} className={contained ? "" : "pulse-dot"} />
            <span style={{ fontFamily: "var(--f-display)", fontWeight: 600, fontSize: 18, letterSpacing: ".03em", color: statusTone }}>{statusLabel}</span>
          </div>
        </div>

        <p style={{ margin: "0 0 20px", fontSize: 14, color: "var(--t2)", lineHeight: 1.6, maxWidth: 760 }}>
          RecallOps identified affected inventory, sales, shipments, and customer exposure from Fivetran-synced operational data. Human-approved actions were recorded into the audit timeline (drafted for approval — no external dispatch in this demo).
        </p>

        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(150px,1fr))", gap: 12, marginBottom: 20 }}>
          <ReportStat k="Locations" v={s.locationsAffected} />
          <ReportStat k="Units quarantined" v={s.unitsInventory.toLocaleString()} />
          <ReportStat k="Units sold" v={s.unitsSold} tone="var(--class-2)" />
          <ReportStat k="Customers notified" v={s.customersToNotify} />
          <ReportStat k="Actions approved" v={executed.length + " / 6"} tone={contained ? "var(--success)" : "var(--t1)"} />
        </div>

        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 18, marginBottom: 20 }} className="ro-report-cols">
          <ReportBlock title="Actions approved" icon="shieldCheck" tone="var(--success)">
            {executed.length ? executed.map(a => <ReportLine key={a.id} ok label={a.title} />) : <Empty>None approved yet — approve actions to populate.</Empty>}
          </ReportBlock>
          <ReportBlock title="Actions pending" icon="clock" tone="var(--warning)">
            {pending.length ? pending.map(a => <ReportLine key={a.id} label={a.title} />) : <Empty>All actions executed.</Empty>}
          </ReportBlock>
        </div>

        <div style={{ marginBottom: 20 }}>
          <ReportBlock title="Evidence sources" icon="database" tone="var(--cyan)">
            <div style={{ display: "flex", flexWrap: "wrap", gap: 8 }}>
              {Object.values(window.RO.evidence).map(e => (
                <span key={e.id} className="mono" style={{ fontSize: 11, padding: "4px 10px", borderRadius: "var(--r-xs)", background: "var(--panel-2)", border: "1px solid var(--border-2)", color: "var(--t2)" }}>
                  {e.label} <span style={{ color: "var(--t4)" }}>· {e.source}</span>
                </span>
              ))}
            </div>
          </ReportBlock>
        </div>

        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: 14, flexWrap: "wrap", padding: "14px 16px", background: "var(--bg-2)", borderRadius: "var(--r-sm)", border: "1px solid var(--border)", marginBottom: 18 }}>
          <div style={{ display: "flex", gap: 22, flexWrap: "wrap" }}>
            <Signed k="Generated by" v="RecallOps Command" icon="cpu" />
            <Signed k="Approved by" v={approvedCount > 0 ? "Human operator" : "— pending —"} icon="shield" tone={approvedCount > 0 ? "var(--blue)" : "var(--t3)"} />
            <Signed k="Residual risk" v={contained ? "Low — contained" : "Elevated — in progress"} icon="activity" tone={contained ? "var(--success)" : "var(--warning)"} />
          </div>
        </div>

        <div style={{ display: "flex", gap: 10, flexWrap: "wrap" }}>
          <Button variant="primary" icon="download" onClick={() => flash("Report export queued (PDF)")}>Download PDF</Button>
          <Button variant="secondary" icon="copy" onClick={copySummary}>Copy Audit Summary</Button>
          <Button variant="ghost" icon="layers" onClick={() => flash("Evidence bundle opened")}>Open Evidence Bundle</Button>
        </div>
      </div>

      {toast && (
        <div style={{ position: "fixed", bottom: 24, left: "50%", transform: "translateX(-50%)", zIndex: 120, display: "flex", alignItems: "center", gap: 9, padding: "11px 16px", background: "var(--panel)", border: "1px solid var(--success)", borderRadius: "var(--r-sm)", boxShadow: "var(--sh-2)" }}>
          <Icon name="checkCircle" size={16} style={{ color: "var(--success)" }} /><span style={{ fontSize: 13, color: "var(--t1)" }}>{toast}</span>
        </div>
      )}
    </div>
  );
}
function ReportStat({ k, v, tone }) {
  return (<div style={{ padding: "13px 14px", background: "var(--panel-2)", border: "1px solid var(--border)", borderRadius: "var(--r-sm)" }}>
    <div className="label">{k}</div><div className="mono" style={{ fontSize: 24, fontWeight: 600, color: tone || "var(--t1)", marginTop: 5 }}>{v}</div></div>);
}
function ReportBlock({ title, icon, tone, children }) {
  return (<div style={{ padding: "14px 15px", background: "var(--panel-2)", border: "1px solid var(--border)", borderRadius: "var(--r-sm)" }}>
    <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 11 }}><Icon name={icon} size={14} style={{ color: tone }} /><span className="label" style={{ color: "var(--t2)" }}>{title}</span></div>
    <div style={{ display: "flex", flexDirection: "column", gap: 7 }}>{children}</div></div>);
}
function ReportLine({ ok, label }) {
  return (<div style={{ display: "flex", alignItems: "center", gap: 8, fontSize: 12.5, color: "var(--t2)" }}>
    <Icon name={ok ? "check" : "dot"} size={ok ? 13 : 8} fill={!ok} style={{ color: ok ? "var(--success)" : "var(--t4)" }} /> {label}</div>);
}
function Empty({ children }) { return <span style={{ fontSize: 12, color: "var(--t3)", fontStyle: "italic" }}>{children}</span>; }
function Signed({ k, v, icon, tone }) {
  return (<div><div className="label" style={{ fontSize: 9.5 }}>{k}</div><div style={{ display: "flex", alignItems: "center", gap: 6, marginTop: 3, fontSize: 12.5, color: tone || "var(--t1)", fontWeight: 500 }}><Icon name={icon} size={12} /> {v}</div></div>);
}

/* ---------------- Architecture diagram ---------------- */
function ArchitectureDiagram() {
  const stages = [
    { t: "openFDA API", g: "source", ic: "external" },
    { t: "Recall Intake Service", g: "service", ic: "inbox" },
    { t: "Fivetran MCP Server", g: "fivetran", ic: "refresh" },
    { t: "Fivetran Connectors", g: "fivetran", ic: "route" },
    { t: "BigQuery Warehouse", g: "data", ic: "database" },
    { t: "Gemini Agent (Agent Builder / ADK)", g: "agent", ic: "brain" },
    { t: "Containment Planner", g: "agent", ic: "target" },
    { t: "Human Approval Gate", g: "human", ic: "shield" },
    { t: "Action Executors", g: "service", ic: "zap" },
    { t: "Audit Log", g: "data", ic: "timeline" },
    { t: "Compliance Report", g: "out", ic: "fileCheck" },
  ];
  const GC = { source: "var(--t2)", service: "var(--blue)", fivetran: "var(--cyan)", data: "var(--blue)", agent: "var(--cyan)", human: "var(--warning)", out: "var(--success)" };
  return (
    <div>
      <div style={{ display: "flex", flexWrap: "wrap", gap: 8, alignItems: "center" }}>
        {stages.map((s, i) => (
          <React.Fragment key={i}>
            <div style={{ display: "flex", alignItems: "center", gap: 8, padding: "9px 13px", background: "color-mix(in srgb," + GC[s.g] + " 9%, var(--panel-2))", border: "1px solid color-mix(in srgb," + GC[s.g] + " 30%, transparent)", borderRadius: "var(--r-sm)" }}>
              <Icon name={s.ic} size={14} style={{ color: GC[s.g] }} />
              <span style={{ fontSize: 12, fontWeight: 600, color: "var(--t1)", whiteSpace: "nowrap" }}>{s.t}</span>
            </div>
            {i < stages.length - 1 && <Icon name="arrowRight" size={14} style={{ color: "var(--t4)", flex: "none" }} />}
          </React.Fragment>
        ))}
      </div>
      <div style={{ display: "flex", flexWrap: "wrap", gap: 16, marginTop: 18, paddingTop: 16, borderTop: "1px solid var(--border)" }}>
        {[["fivetran", "Fivetran (partner)"], ["agent", "Gemini agent"], ["data", "BigQuery / data"], ["human", "Human gate"], ["out", "Output"]].map(([g, l]) => (
          <span key={g} style={{ display: "inline-flex", alignItems: "center", gap: 7, fontSize: 11.5, color: "var(--t3)", fontFamily: "var(--f-mono)" }}>
            <span style={{ width: 10, height: 10, borderRadius: 3, background: GC[g] }} /> {l}
          </span>
        ))}
      </div>
    </div>
  );
}

Object.assign(window, { PipelineViz, ComplianceTimeline, FinalReport, ArchitectureDiagram, deriveTimeline });
