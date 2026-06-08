/* ============================================================
   RecallOps Command — Views (part 1)
   PageHeader · CommandView · IntakeView · BlastRadiusView · ActionsView
   ============================================================ */

function PageHeader({ eyebrow, title, sub, icon, right }) {
  return (
    <div className="rise" style={{ "--dur": "0.4s", display: "flex", alignItems: "flex-end", justifyContent: "space-between", gap: 16, flexWrap: "wrap", marginBottom: 20 }}>
      <div style={{ minWidth: 0 }}>
        <div style={{ display: "flex", alignItems: "center", gap: 9, marginBottom: 8 }}>
          <span style={{ color: "var(--cyan)", display: "flex" }}><Icon name={icon} size={16} /></span>
          <span className="mono" style={{ fontSize: 11, letterSpacing: ".12em", textTransform: "uppercase", color: "var(--cyan)", fontWeight: 600 }}>{eyebrow}</span>
        </div>
        <h1 style={{ margin: 0, fontFamily: "var(--f-display)", fontSize: "clamp(25px, 3.2vw, 34px)", fontWeight: 600, letterSpacing: "-.025em", color: "var(--t1)", lineHeight: 1.05 }}>{title}</h1>
        {sub && <p style={{ margin: "10px 0 0", fontSize: 14, color: "var(--t2)", maxWidth: 720, lineHeight: 1.55 }}>{sub}</p>}
      </div>
      {right}
    </div>
  );
}

/* ============================================================
   Command center
   ============================================================ */
function CommandView() {
  const store = useRO();
  const { phase, analyzeOn, actionsOn, contained, triggerContainment, reset, navigate } = store;
  const [modal, setModal] = useState(null);
  const started = phase !== "idle";
  const s = window.RO.stats;

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 22 }}>
      {/* hero */}
      <section className="rise" style={{ "--dur": "0.45s" }}>
        <div style={{ display: "grid", gridTemplateColumns: "1.25fr 0.75fr", gap: 18 }} className="ro-hero">
          <div className="panel" style={{ padding: "24px 24px", display: "flex", flexDirection: "column", justifyContent: "center", position: "relative", overflow: "hidden" }}>
            <div style={{ position: "absolute", inset: 0, background: "radial-gradient(110% 80% at 0% 0%, rgba(6,182,212,.08), transparent 58%)", pointerEvents: "none" }} />
            <div style={{ position: "relative" }}>
              <div style={{ display: "inline-flex", alignItems: "center", gap: 8, padding: "5px 11px", borderRadius: "var(--r-pill)", background: contained ? "var(--success-dim)" : "var(--class-1-dim)", border: "1px solid " + (contained ? "rgba(16,185,129,.34)" : "rgba(239,68,68,.34)"), marginBottom: 16 }}>
                <StatusDot tone={contained ? "success" : "danger"} live={started && !contained} />
                <span className="mono" style={{ fontSize: 11, letterSpacing: ".08em", textTransform: "uppercase", color: contained ? "var(--success)" : "var(--class-1)", fontWeight: 600 }}>
                  {contained ? "Recall contained" : started ? "Containment in progress" : "Class I recall · standby"}
                </span>
              </div>
              <h1 style={{ margin: 0, fontFamily: "var(--f-display)", fontSize: "clamp(30px, 4.4vw, 46px)", fontWeight: 600, letterSpacing: "-.03em", lineHeight: 1.02, color: "var(--t1)" }}>RecallOps Command</h1>
              <p style={{ margin: "13px 0 0", fontSize: "clamp(14px,1.6vw,16px)", color: "var(--t2)", maxWidth: 520, lineHeight: 1.55 }}>
                Human-approved recall containment powered by Gemini, Fivetran, and BigQuery.
              </p>
              <div style={{ display: "flex", gap: 10, marginTop: 22, flexWrap: "wrap" }}>
                {!started
                  ? <Button variant="primary" size="lg" icon="zap" onClick={triggerContainment}>Trigger Containment</Button>
                  : contained
                    ? <Button variant="success" size="lg" icon="refresh" onClick={reset}>Reset scenario</Button>
                    : <Button variant="primary" size="lg" disabled icon="refresh">Containment running…</Button>}
                <Button variant="ghost" size="lg" icon="fileCheck" onClick={() => navigate("report")}>View Audit Report</Button>
                <Button variant="ghost" size="lg" icon="cpu" onClick={() => navigate("architecture")}>Inspect Architecture</Button>
              </div>
            </div>
          </div>
          <PipelineViz />
        </div>
      </section>

      {/* recall intake */}
      <section>
        <SectionTitle num="01" icon="inbox" title="Recall intake" sub="Live openFDA food enforcement record matched to internal SKUs." />
        <RecallIntakeCard onTrigger={triggerContainment} started={started} />
      </section>

      {/* fivetran sync */}
      <section>
        <SectionTitle num="02" icon="refresh" title="Operational data sync" sub="Fivetran is the operational data foundation — the agent cannot scope a recall without fresh synced data." />
        <FivetranSyncStrip />
      </section>

      {/* blast radius */}
      <section>
        <SectionTitle num="03" icon="radar" title="Blast radius" sub="BigQuery blast-radius analysis across inventory, sales, shipments, and customers."
          right={<Button variant="ghost" size="sm" iconRight="arrowRight" onClick={() => navigate("blast")}>Expand</Button>} />
        <div style={{ display: "grid", gridTemplateColumns: "1.5fr 1fr", gap: 16 }} className="ro-blast">
          <BlastRadiusMap height={420} />
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12, alignContent: "start" }}>
            <MetricTile big icon="pin" label="Locations affected" value={s.locationsAffected} tone="danger" animate={analyzeOn} sub="14 critical" />
            <MetricTile big icon="package" label="Units in inventory" value={s.unitsInventory} tone="cyan" animate={analyzeOn} sub="to quarantine" />
            <MetricTile icon="store" label="Units already sold" value={s.unitsSold} tone="warning" animate={analyzeOn} sub="customer exposure" />
            <MetricTile icon="truck" label="Shipments in transit" value={s.shipmentsInTransit} tone="class3" animate={analyzeOn} sub="divert to hold" />
            <MetricTile icon="users" label="Customers to notify" value={s.customersToNotify} tone="blue" animate={analyzeOn} sub="consented only" />
            <MetricTile icon="clock" label="Est. containment" value={s.estContainmentMin} suffix=" min" tone="success" animate={analyzeOn} sub="projected" />
          </div>
        </div>
      </section>

      {/* reasoning */}
      <section>
        <SectionTitle num="04" icon="brain" title="Agent reasoning trace" sub="The Gemini agent narrates how it scoped the recall from synced data — not a chat window." />
        <div style={{ minHeight: 280 }}><ReasoningTrace /></div>
      </section>

      {/* actions */}
      <section>
        <SectionTitle num="05" icon="shield" title="Containment action queue"
          sub="No external action executes without approval."
          right={<Button variant="ghost" size="sm" iconRight="arrowRight" onClick={() => navigate("actions")}>Open queue</Button>} />
        {actionsOn ? (
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 13 }} className="ro-actions-grid">
            {window.RO.actions.map((a, i) => (
              <ActionCard key={a.id} action={a} state={store.actionState[a.id]} onApprove={setModal} onReject={store.rejectAction} delay={i * 60} />
            ))}
          </div>
        ) : <ActionsPlaceholder started={started} onTrigger={triggerContainment} />}
      </section>

      {/* timeline + report cta */}
      <section>
        <div style={{ display: "grid", gridTemplateColumns: "1.1fr 0.9fr", gap: 18 }} className="ro-blast">
          <div className="panel" style={{ padding: 20 }}>
            <SectionTitle num="06" icon="timeline" title="Compliance timeline"
              right={<Button variant="ghost" size="sm" iconRight="arrowRight" onClick={() => navigate("compliance")}>Audit log</Button>} />
            <ComplianceTimeline compact />
          </div>
          <ContainSummaryCard store={store} navigate={navigate} />
        </div>
      </section>

      {modal && <ApprovalModal action={modal} onApprove={(id) => { store.approveAction(id); setModal(null); }} onCancel={() => setModal(null)} />}
    </div>
  );
}

function ActionsPlaceholder({ started, onTrigger }) {
  return (
    <div className="panel" style={{ padding: "34px 20px", textAlign: "center", display: "flex", flexDirection: "column", alignItems: "center", gap: 14, border: "1px dashed var(--border-2)" }}>
      <div style={{ width: 46, height: 46, borderRadius: "var(--r-sm)", background: "var(--panel-3)", border: "1px solid var(--border-2)", display: "grid", placeItems: "center", color: "var(--t3)" }}>
        <Icon name={started ? "refresh" : "shield"} size={20} className={started ? "spin" : ""} />
      </div>
      <div>
        <div style={{ fontSize: 14.5, fontWeight: 600, color: "var(--t1)" }}>{started ? "Drafting containment actions…" : "No actions drafted"}</div>
        <p style={{ margin: "5px 0 0", fontSize: 12.5, color: "var(--t3)", maxWidth: 380 }}>
          {started ? "The agent is scoping the recall and will populate the approval queue shortly." : "Trigger containment to generate the Gemini-drafted action queue."}
        </p>
      </div>
      {!started && <Button variant="primary" icon="zap" onClick={onTrigger}>Trigger Containment</Button>}
    </div>
  );
}

function ContainSummaryCard({ store, navigate }) {
  const { approvedCount, contained, phase } = store;
  const total = window.RO.actions.length;
  const pct = Math.round((approvedCount / total) * 100);
  return (
    <div className="panel" style={{ padding: 20, display: "flex", flexDirection: "column" }}>
      <SectionTitle num="07" icon="target" title="Containment status" />
      <div style={{ display: "flex", alignItems: "baseline", gap: 10, marginBottom: 6 }}>
        <span className="mono" style={{ fontSize: 44, fontWeight: 600, color: contained ? "var(--success)" : "var(--t1)", letterSpacing: "-.02em", lineHeight: 1 }}>{pct}%</span>
        <span className="label">{approvedCount} / {total} actions approved</span>
      </div>
      <div style={{ height: 8, background: "var(--bg-2)", borderRadius: 999, overflow: "hidden", margin: "10px 0 16px", position: "relative" }}>
        <div style={{ width: pct + "%", height: "100%", background: contained ? "var(--success)" : "var(--accent-grad)", borderRadius: 999, transition: "width .6s cubic-bezier(.22,.61,.36,1)" }} />
      </div>
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10, marginBottom: 16 }}>
        <MiniKpi k="Critical stores" v={window.RO.stats.criticalStores} />
        <MiniKpi k="Supplier holds" v={window.RO.stats.supplierHolds} />
        <MiniKpi k="Replacement POs" v={window.RO.stats.replacementPOs} />
        <MiniKpi k="Customers" v={window.RO.stats.customersToNotify} />
      </div>
      <div style={{ marginTop: "auto" }}>
        <Button variant={contained ? "success" : "primary"} full icon="fileCheck" onClick={() => navigate("report")}>
          {contained ? "Open compliance report" : "View draft report"}
        </Button>
      </div>
    </div>
  );
}
function MiniKpi({ k, v }) {
  return (<div style={{ padding: "10px 12px", background: "var(--panel-2)", border: "1px solid var(--border)", borderRadius: "var(--r-sm)" }}>
    <div className="label" style={{ fontSize: 9.5 }}>{k}</div><div className="mono" style={{ fontSize: 18, fontWeight: 600, color: "var(--t1)", marginTop: 3 }}>{v}</div></div>);
}

/* ============================================================
   Intake view
   ============================================================ */
function IntakeView() {
  const { phase, triggerContainment, navigate } = useRO();
  const started = phase !== "idle";
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 22 }}>
      <PageHeader eyebrow="openFDA food enforcement" title="Recall intake" icon="inbox"
        sub="Inbound recall records from the openFDA food enforcement endpoint, matched against internal SKUs before containment." />
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(160px,1fr))", gap: 12 }}>
        <IntakeSum k="Open recalls" v="1" icon="alert" tone="var(--class-1)" sub="Class I" />
        <IntakeSum k="SKU matches" v="3" icon="package" tone="var(--cyan)" sub="internal" />
        <IntakeSum k="Lot codes" v="3" icon="route" tone="var(--class-2)" sub="affected" />
        <IntakeSum k="Source latency" v="42s" icon="clock" tone="var(--success)" sub="openFDA poll" />
      </div>
      <RecallIntakeCard onTrigger={triggerContainment} started={started} />
      <div className="panel" style={{ padding: 20 }}>
        <SectionTitle icon="search" title="Recall feed" sub="Most recent records polled from openFDA." />
        <div style={{ overflowX: "auto" }} className="no-sb">
          <table style={{ width: "100%", borderCollapse: "collapse", minWidth: 640 }}>
            <thead><tr style={{ borderBottom: "1px solid var(--border-2)" }}>
              {["Recall ID", "Product", "Class", "Firm", "Status", ""].map((h, i) => <th key={i} style={{ textAlign: i === 5 ? "right" : "left", padding: "0 12px 11px" }}><span className="label">{h}</span></th>)}
            </tr></thead>
            <tbody>
              <FeedRow rec={window.RO.recall} active onSelect={() => navigate("command")} />
              <FeedRow rec={{ recallId: "F-1139-2026", productDescription: "Bagged Spring Mix, 10 oz", classification: "Class II", recallingFirm: "Verde Farms", }} />
              <FeedRow rec={{ recallId: "F-1131-2026", productDescription: "Almond Protein Bars, 12 ct", classification: "Class III", recallingFirm: "Sunset Snacks", }} />
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
function IntakeSum({ k, v, icon, tone, sub }) {
  return (<div className="panel lift" style={{ padding: "15px 16px", display: "flex", alignItems: "center", gap: 13 }}>
    <div style={{ width: 38, height: 38, borderRadius: "var(--r-sm)", flex: "none", display: "grid", placeItems: "center", background: "var(--panel-2)", border: "1px solid var(--border-2)", color: tone }}><Icon name={icon} size={18} /></div>
    <div><div style={{ display: "flex", alignItems: "baseline", gap: 6 }}><span className="mono" style={{ fontSize: 22, fontWeight: 600, color: tone, lineHeight: 1 }}>{v}</span><span className="mono" style={{ fontSize: 10, color: "var(--t4)" }}>{sub}</span></div><div className="label" style={{ marginTop: 5 }}>{k}</div></div></div>);
}
function FeedRow({ rec, active, onSelect }) {
  return (
    <tr onClick={active ? onSelect : undefined} style={{ borderBottom: "1px solid var(--border)", cursor: active ? "pointer" : "default", opacity: active ? 1 : 0.6 }}>
      <td style={{ padding: "13px 12px" }}><span className="mono" style={{ fontSize: 12.5, color: active ? "var(--cyan)" : "var(--t3)" }}>{rec.recallId}</span></td>
      <td style={{ padding: "13px 12px", fontSize: 13, color: "var(--t1)", fontWeight: 500, whiteSpace: "nowrap" }}>{rec.productDescription}</td>
      <td style={{ padding: "13px 12px" }}><Badge tone={CLASS_TONE[rec.classification]}>{rec.classification}</Badge></td>
      <td style={{ padding: "13px 12px", fontSize: 12.5, color: "var(--t2)", whiteSpace: "nowrap" }}>{rec.recallingFirm}</td>
      <td style={{ padding: "13px 12px" }}>{active ? <Badge tone="danger">Active</Badge> : <span className="mono" style={{ fontSize: 11, color: "var(--t3)" }}>monitoring</span>}</td>
      <td style={{ padding: "13px 12px", textAlign: "right" }}>{active && <span style={{ color: "var(--t3)", display: "inline-flex" }}><Icon name="chevronRight" size={16} /></span>}</td>
    </tr>
  );
}

/* ============================================================
   Blast radius view
   ============================================================ */
function BlastRadiusView() {
  const { analyzeOn, phase, triggerContainment } = useRO();
  const s = window.RO.stats;
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 22 }}>
      <PageHeader eyebrow="BigQuery blast-radius analysis" title="Blast radius" icon="radar"
        sub="Affected stores, warehouses, in-transit shipments, and customer notification zones computed from Fivetran-synced operational data in BigQuery."
        right={phase === "idle" ? <Button variant="primary" icon="zap" onClick={triggerContainment}>Trigger Containment</Button> : null} />
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(160px,1fr))", gap: 12 }}>
        <MetricTile big icon="pin" label="Locations affected" value={s.locationsAffected} tone="danger" animate={analyzeOn} sub="14 critical" />
        <MetricTile big icon="package" label="Units in inventory" value={s.unitsInventory} tone="cyan" animate={analyzeOn} sub="to quarantine" />
        <MetricTile big icon="store" label="Units already sold" value={s.unitsSold} tone="warning" animate={analyzeOn} sub="exposure" />
        <MetricTile big icon="truck" label="Shipments in transit" value={s.shipmentsInTransit} tone="class3" animate={analyzeOn} sub="divert" />
        <MetricTile big icon="users" label="Customers to notify" value={s.customersToNotify} tone="blue" animate={analyzeOn} sub="consented" />
      </div>
      <BlastRadiusMap height={460} />
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 18 }} className="ro-blast">
        <div className="panel" style={{ padding: 20 }}>
          <SectionTitle icon="truck" title="In-transit shipments" sub="Diverted to quarantine docks under supplier hold." />
          <div style={{ display: "flex", flexDirection: "column", gap: 9 }}>
            {window.RO.shipments.map(sh => (
              <div key={sh.id} style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: 10, padding: "11px 13px", background: "var(--panel-2)", border: "1px solid var(--border)", borderRadius: "var(--r-sm)" }}>
                <div style={{ minWidth: 0 }}>
                  <div className="mono" style={{ fontSize: 12, color: "var(--t1)" }}>{sh.id} <span style={{ color: "var(--t3)" }}>· {sh.sku}</span></div>
                  <div className="mono" style={{ fontSize: 10.5, color: "var(--t3)", marginTop: 2 }}>lot {sh.lotCode} · {sh.quantity} units</div>
                </div>
                <Badge tone="class2">{sh.status.replace("_", " ")}</Badge>
              </div>
            ))}
          </div>
        </div>
        <div className="panel" style={{ padding: 20 }}>
          <SectionTitle icon="building" title="Critical locations" sub="Highest-risk tier — prioritized for shelf pull." />
          <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
            {window.RO.locations.filter(l => l.riskTier === "critical").slice(0, 7).map(l => (
              <div key={l.id} style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: 10, padding: "10px 12px", background: "var(--panel-2)", border: "1px solid var(--border)", borderRadius: "var(--r-sm)" }}>
                <div style={{ display: "flex", alignItems: "center", gap: 10, minWidth: 0 }}>
                  <span style={{ color: "var(--class-1)", display: "flex" }}><Icon name={LOC_ICON[l.type]} size={15} /></span>
                  <div style={{ minWidth: 0 }}>
                    <div style={{ fontSize: 12.5, color: "var(--t1)", fontWeight: 500, whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>{l.name}</div>
                    <div className="mono" style={{ fontSize: 10, color: "var(--t3)" }}>mgr {l.manager} · {l.units} units</div>
                  </div>
                </div>
                <Badge tone="danger">Critical</Badge>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

/* ============================================================
   Actions view
   ============================================================ */
function ActionsView() {
  const store = useRO();
  const { actionsOn, phase, triggerContainment, approvedCount } = store;
  const [modal, setModal] = useState(null);
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 22 }}>
      <PageHeader eyebrow="Human approval queue" title="Containment actions" icon="shield"
        sub="Gemini-generated containment plan. No external action executes without approval — every approval is written to the audit log."
        right={<Badge tone={approvedCount === 6 ? "success" : "warning"}>{approvedCount}/6 approved</Badge>} />
      {actionsOn ? (
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 13 }} className="ro-actions-grid">
          {window.RO.actions.map((a, i) => (
            <ActionCard key={a.id} action={a} state={store.actionState[a.id]} onApprove={setModal} onReject={store.rejectAction} delay={i * 50} />
          ))}
        </div>
      ) : <ActionsPlaceholder started={phase !== "idle"} onTrigger={triggerContainment} />}
      {modal && <ApprovalModal action={modal} onApprove={(id) => { store.approveAction(id); setModal(null); }} onCancel={() => setModal(null)} />}
    </div>
  );
}

Object.assign(window, { PageHeader, CommandView, IntakeView, BlastRadiusView, ActionsView, ActionsPlaceholder });
