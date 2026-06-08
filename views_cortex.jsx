/* ============================================================
   RecallOps Cortex — Cortex command center (Phase 2) + Placeholder
   ============================================================ */

function GraphPreview() {
  const { navigate } = useRO();
  return (
    <div className="panel" style={{ padding: 0, overflow: "hidden", position: "relative", height: 320 }}>
      <div style={{ position: "absolute", top: 0, left: 0, right: 0, zIndex: 3, display: "flex", alignItems: "center", justifyContent: "space-between", padding: "12px 16px", borderBottom: "1px solid var(--border)", background: "linear-gradient(180deg, rgba(13,19,32,0.9), transparent)" }}>
        <div style={{ display: "flex", alignItems: "center", gap: 9 }}>
          <Icon name="graph" size={15} style={{ color: "var(--cyan)" }} />
          <span style={{ fontSize: 13, fontWeight: 600, fontFamily: "var(--f-display)", color: "var(--t1)" }}>RecallGraph memory</span>
        </div>
        <Button variant="ghost" size="sm" iconRight="maximize" onClick={() => navigate("graph")}>Open</Button>
      </div>
      <RecallGraph mini />
      <div onClick={() => navigate("graph")} style={{ position: "absolute", inset: 0, zIndex: 2, cursor: "pointer" }} title="Open RecallGraph" />
    </div>
  );
}

function RiskConfidencePanel() {
  const m = window.RO.entityMatches;
  const det = m.filter(x => x.confidence >= 0.9);
  const fuzzy = m.filter(x => x.confidence >= 0.7 && x.confidence < 0.9);
  const low = m.filter(x => x.confidence < 0.7);
  const Row = ({ x }) => (
    <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: 10, padding: "9px 11px", background: "var(--panel-2)", border: "1px solid var(--border)", borderRadius: "var(--r-sm)" }}>
      <div style={{ minWidth: 0 }}>
        <div className="mono" style={{ fontSize: 11.5, color: "var(--t1)", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>{x.from}</div>
        <div className="mono" style={{ fontSize: 10, color: "var(--t3)", marginTop: 2 }}>→ {x.to}</div>
      </div>
      <span className="mono" style={{ fontSize: 12, fontWeight: 600, flex: "none", color: x.confidence >= 0.9 ? "var(--success)" : x.confidence >= 0.7 ? "var(--class-2)" : "var(--class-1)" }}>{x.confidence.toFixed(2)}</span>
    </div>
  );
  return (
    <div className="panel" style={{ padding: 20 }}>
      <SectionTitle icon="target" title="Risk & confidence" sub="Deterministic vs fuzzy entity matches — explainable scoring." />
      <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
        <div>
          <div style={{ display: "flex", alignItems: "center", gap: 7, marginBottom: 8 }}><StatusDot tone="success" live={false} /><span className="label" style={{ color: "var(--success)" }}>Deterministic · auto-applied ({det.length})</span></div>
          <div style={{ display: "flex", flexDirection: "column", gap: 7 }}>{det.map(x => <Row key={x.id} x={x} />)}</div>
        </div>
        <div>
          <div style={{ display: "flex", alignItems: "center", gap: 7, marginBottom: 8 }}><StatusDot tone="warning" live={false} /><span className="label" style={{ color: "var(--class-2)" }}>Fuzzy · review suggested ({fuzzy.length})</span></div>
          <div style={{ display: "flex", flexDirection: "column", gap: 7 }}>{fuzzy.map(x => <Row key={x.id} x={x} />)}</div>
        </div>
        {low.length > 0 && (
          <div>
            <div style={{ display: "flex", alignItems: "center", gap: 7, marginBottom: 8 }}><StatusDot tone="danger" live={false} /><span className="label" style={{ color: "var(--class-1)" }}>Low confidence · human review required ({low.length})</span></div>
            <div style={{ display: "flex", flexDirection: "column", gap: 7 }}>{low.map(x => <Row key={x.id} x={x} />)}</div>
          </div>
        )}
        <div style={{ display: "flex", alignItems: "center", gap: 10, padding: "11px 13px", background: "var(--success-dim)", border: "1px solid rgba(16,185,129,.25)", borderRadius: "var(--r-sm)" }}>
          <Icon name="shieldCheck" size={16} style={{ color: "var(--success)" }} />
          <span style={{ fontSize: 12.5, color: "var(--t1)" }}>Residual risk <strong style={{ color: "var(--success)" }}>low</strong> — every low-confidence match is gated behind human review.</span>
        </div>
      </div>
    </div>
  );
}

function CortexView() {
  const store = useRO();
  const { triggerContainment, judgeMode, navigate, phase, analyzeOn, actionsOn } = store;
  const [modal, setModal] = useState(null);
  const started = phase !== "idle";
  const s = window.RO.stats;
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 22 }}>
      {/* crisis header */}
      <section className="rise" style={{ "--dur": "0.45s" }}>
        <div style={{ display: "grid", gridTemplateColumns: "1.25fr 0.75fr", gap: 18 }} className="ro-hero">
          <div className="panel" style={{ padding: "24px 24px", display: "flex", flexDirection: "column", justifyContent: "center", position: "relative", overflow: "hidden" }}>
            <div style={{ position: "absolute", inset: 0, background: "radial-gradient(110% 80% at 0% 0%, rgba(6,182,212,.08), transparent 58%)", pointerEvents: "none" }} />
            <div style={{ position: "relative" }}>
              <div style={{ display: "inline-flex", alignItems: "center", gap: 8, padding: "5px 11px", borderRadius: "var(--r-pill)", background: store.contained ? "var(--success-dim)" : "var(--class-1-dim)", border: "1px solid " + (store.contained ? "rgba(16,185,129,.34)" : "rgba(239,68,68,.34)"), marginBottom: 16 }}>
                <StatusDot tone={store.contained ? "success" : "danger"} live={started && !store.contained} />
                <span className="mono" style={{ fontSize: 11, letterSpacing: ".08em", textTransform: "uppercase", color: store.contained ? "var(--success)" : "var(--class-1)", fontWeight: 600 }}>{store.contained ? "Recall contained" : started ? "Containment in progress" : "Class I recall · operational memory online"}</span>
              </div>
              <h1 style={{ margin: 0, fontFamily: "var(--f-display)", fontSize: "clamp(30px, 4.4vw, 46px)", fontWeight: 600, letterSpacing: "-.02em", lineHeight: 1.02, color: "var(--t1)" }}>RecallOps Cortex</h1>
              <p style={{ margin: "13px 0 0", fontSize: "clamp(14px,1.6vw,16px)", color: "var(--t2)", maxWidth: 540, lineHeight: 1.55 }}>Operational memory and human-approved recall containment.</p>
              <div style={{ display: "flex", gap: 10, marginTop: 22, flexWrap: "wrap" }}>
                {!started ? <Button variant="primary" size="lg" icon="zap" onClick={triggerContainment}>Run Containment</Button>
                  : store.contained ? <Button variant="success" size="lg" icon="refresh" onClick={store.reset}>Reset scenario</Button>
                  : <Button variant="primary" size="lg" disabled icon="refresh">Running…</Button>}
                <Button variant="secondary" size="lg" icon="gavel" onClick={judgeMode}>Judge Mode</Button>
                <Button variant="ghost" size="lg" icon="fileCheck" onClick={() => navigate("report")}>View Report</Button>
                <Button variant="ghost" size="lg" icon="cpu" onClick={() => navigate("architecture")}>Inspect Architecture</Button>
              </div>
            </div>
          </div>
          <PipelineViz />
        </div>
      </section>

      {/* recall intake */}
      <section>
        <SectionTitle num="01" icon="inbox" title="Recall intake" sub="Live openFDA enforcement record, matched to internal SKUs." />
        <RecallIntakeCard onTrigger={triggerContainment} started={started} />
      </section>

      {/* fivetran */}
      <section>
        <SectionTitle num="02" icon="refresh" title="Fivetran-synced operational data" sub="The agent cannot scope a recall without fresh synced data in BigQuery." />
        <FivetranSyncStrip />
      </section>

      {/* blast radius */}
      <section>
        <SectionTitle num="03" icon="radar" title="Blast radius" sub="BigQuery blast-radius analysis across inventory, sales, shipments, suppliers, and customers."
          right={<Button variant="ghost" size="sm" iconRight="arrowRight" onClick={() => navigate("graph")}>Graph</Button>} />
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(150px,1fr))", gap: 12 }}>
          <MetricTile big icon="pin" label="Locations affected" value={s.locationsAffected} tone="danger" animate={analyzeOn} sub="14 critical" />
          <MetricTile big icon="package" label="Inventory units" value={s.unitsInventory} tone="cyan" animate={analyzeOn} sub="to quarantine" />
          <MetricTile icon="store" label="Units sold" value={s.unitsSold} tone="warning" animate={analyzeOn} sub="exposure" />
          <MetricTile icon="truck" label="Shipments" value={s.shipmentsInTransit} tone="class3" animate={analyzeOn} sub="in transit" />
          <MetricTile icon="users" label="Customers" value={s.customersToNotify} tone="blue" animate={analyzeOn} sub="to notify" />
          <MetricTile icon="shield" label="Stop-sale actions" value={6} tone="success" animate={analyzeOn} sub="drafted" />
        </div>
      </section>

      {/* graph + reasoning */}
      <section>
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 18 }} className="ro-blast">
          <GraphPreview />
          <div style={{ minHeight: 320 }}><ReasoningTrace /></div>
        </div>
      </section>

      {/* actions */}
      <section>
        <SectionTitle num="04" icon="shield" title="Containment action queue" sub="No external action executes without approval."
          right={<Button variant="ghost" size="sm" iconRight="arrowRight" onClick={() => navigate("actions")}>Workbench</Button>} />
        {actionsOn ? (
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 13 }} className="ro-actions-grid">
            {window.RO.actions.map((a, i) => <ActionCard key={a.id} action={a} state={store.actionState[a.id]} onApprove={setModal} onReject={store.rejectAction} delay={i * 60} />)}
          </div>
        ) : <ActionsPlaceholder started={started} onTrigger={triggerContainment} />}
      </section>

      {/* risk + confidence */}
      <section>
        <SectionTitle num="05" icon="target" title="Risk & confidence" sub="Explainable entity resolution behind every action." />
        <RiskConfidencePanel />
      </section>

      {modal && <ApprovalModal action={modal} onApprove={(id) => { store.approveAction(id); setModal(null); }} onCancel={() => setModal(null)} />}
    </div>
  );
}

/* ---------------- Polished route placeholder (fallback) ---------------- */
const PLACEHOLDER_META = {
  replay: { title: "Crisis Replay", eyebrow: "watch the incident", icon: "play", phase: 7, lines: ["Play / pause / scrub / speed", "Pipeline, graph, stats, trace animate", "Jump to any incident phase"] },
};
function Placeholder({ routeId }) {
  const m = PLACEHOLDER_META[routeId] || { title: routeId, eyebrow: "module", icon: "command", phase: "—", lines: [] };
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 22 }}>
      <PageHeader eyebrow={m.eyebrow} title={m.title} icon={m.icon} sub="Phased build." right={<Badge tone="cyan">Phase {m.phase}</Badge>} />
      <div className="panel" style={{ padding: "40px 28px", display: "flex", flexDirection: "column", alignItems: "center", gap: 16, textAlign: "center" }}>
        <div style={{ width: 54, height: 54, borderRadius: "var(--r-md)", background: "var(--panel-3)", border: "1px solid var(--border-2)", display: "grid", placeItems: "center", color: "var(--cyan)" }}><Icon name={m.icon} size={26} /></div>
        <div style={{ fontSize: 16, fontWeight: 600, color: "var(--t1)", fontFamily: "var(--f-display)" }}>{m.title}</div>
      </div>
    </div>
  );
}

window.CortexView = CortexView;
window.Placeholder = Placeholder;
window.GraphPreview = GraphPreview;
window.RiskConfidencePanel = RiskConfidencePanel;
