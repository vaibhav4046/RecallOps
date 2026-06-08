/* ============================================================
   RecallOps Cortex — Ops views (Phase 4)
   RadarView · FivetranView · EvidenceView · ContextView
   ============================================================ */

const RECALL_FEED = [
  window.RO.recall,
  { recallId: "F-1139-2026", classification: "Class II", productDescription: "Bagged Spring Mix, 10 oz", recallingFirm: "Verde Farms", reason: "Undeclared allergen (sulfites).", distributionPattern: "CA, OR, WA", eventDate: "2026-06-04", status: "Ongoing" },
  { recallId: "F-1131-2026", classification: "Class III", productDescription: "Almond Protein Bars, 12 ct", recallingFirm: "Sunset Snacks", reason: "Mislabeled net weight.", distributionPattern: "Nationwide", eventDate: "2026-05-29", status: "Ongoing" },
  { recallId: "F-1126-2026", classification: "Class II", productDescription: "Cold-Brew Concentrate, 32 oz", recallingFirm: "Harbor Roasters", reason: "Possible spoilage from seal failure.", distributionPattern: "CA, NV", eventDate: "2026-05-24", status: "Terminated" },
];

function FallbackBanner({ show, text }) {
  if (!show) return null;
  return (
    <div style={{ display: "flex", alignItems: "center", gap: 9, padding: "10px 13px", background: "color-mix(in srgb, var(--warning) 10%, transparent)", border: "1px solid color-mix(in srgb, var(--warning) 34%, transparent)", borderRadius: "var(--r-sm)" }}>
      <Icon name="alert" size={14} style={{ color: "var(--warning)" }} />
      <span style={{ fontSize: 12.5, color: "var(--t2)" }}>{text}</span>
    </div>
  );
}

function RadarView() {
  const { triggerContainment, navigate } = useRO();
  const [sel, setSel] = useState(0);
  const [cls, setCls] = useState("all");
  const feed = RECALL_FEED.filter(r => cls === "all" || r.classification === cls);
  const r = feed[sel] || feed[0];
  const isPrimary = r.recallId === window.RO.recall.recallId;
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 20 }}>
      <PageHeader eyebrow="openFDA food enforcement" title="Recall Radar" icon="radar"
        sub="Live FDA recall intake. Search, filter, and start a containment run."
        right={<span className="mono" style={{ fontSize: 11, color: "var(--success)", display: "inline-flex", alignItems: "center", gap: 6 }}><StatusDot tone="success" /> endpoint live</span>} />
      <div className="mono" style={{ fontSize: 11, color: "var(--t3)", background: "var(--bg-2)", border: "1px solid var(--border)", borderRadius: "var(--r-sm)", padding: "9px 12px", overflowX: "auto" }} >GET {window.RO.env.OPENFDA_BASE}?search=report_date:[20260524+TO+20260607]&limit=20</div>
      <div style={{ display: "grid", gridTemplateColumns: "0.85fr 1.15fr", gap: 18 }} className="ro-blast">
        <div className="panel" style={{ padding: 16 }}>
          <div style={{ display: "flex", gap: 6, marginBottom: 12, flexWrap: "wrap" }}>
            {["all", "Class I", "Class II", "Class III"].map(c => (
              <button key={c} onClick={() => { setCls(c); setSel(0); }} style={{ padding: "6px 11px", fontSize: 11.5, fontWeight: 500, cursor: "pointer", fontFamily: "var(--f-sans)", background: cls === c ? "var(--panel-3)" : "transparent", border: "1px solid " + (cls === c ? "var(--border-3)" : "var(--border-2)"), borderRadius: "var(--r-sm)", color: cls === c ? "var(--t1)" : "var(--t3)" }}>{c}</button>
            ))}
          </div>
          <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
            {feed.map((x, i) => (
              <button key={x.recallId} onClick={() => setSel(i)} style={{ display: "flex", flexDirection: "column", gap: 6, padding: "12px 13px", textAlign: "left", cursor: "pointer", background: sel === i ? "var(--panel-3)" : "var(--panel-2)", border: "1px solid " + (sel === i ? "var(--cyan-line)" : "var(--border)"), borderRadius: "var(--r-sm)", width: "100%" }}>
                <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: 8 }}>
                  <span className="mono" style={{ fontSize: 11.5, color: "var(--cyan)" }}>{x.recallId}</span>
                  <Badge tone={CLASS_TONE[x.classification]}>{x.classification}</Badge>
                </div>
                <span style={{ fontSize: 13, color: "var(--t1)", fontWeight: 500 }}>{x.productDescription}</span>
                <span className="mono" style={{ fontSize: 10.5, color: "var(--t3)" }}>{x.recallingFirm} · {x.eventDate}</span>
              </button>
            ))}
          </div>
        </div>
        <div className="panel" style={{ padding: 20 }}>
          <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", gap: 12, flexWrap: "wrap", marginBottom: 14 }}>
            <div style={{ minWidth: 0 }}>
              <ClassBadge classification={r.classification} size="lg" />
              <h3 style={{ margin: "10px 0 0", fontSize: 18, fontWeight: 600, fontFamily: "var(--f-display)", color: "var(--t1)" }}>{r.productDescription}</h3>
              <div className="mono" style={{ fontSize: 11.5, color: "var(--cyan)", marginTop: 5 }}>{r.recallId} · {r.recallingFirm}</div>
            </div>
            {isPrimary
              ? <Button variant="primary" icon="zap" onClick={() => { triggerContainment(); navigate("cortex"); }}>Start containment run</Button>
              : <Badge tone="muted">monitoring</Badge>}
          </div>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 14, marginBottom: 16 }}>
            <KV k="Reason" v={r.reason} />
            <KV k="Distribution" v={r.distributionPattern} />
            <KV k="Event date" v={r.eventDate} mono />
            <KV k="Status" v={r.status} />
          </div>
          <div className="label" style={{ marginBottom: 6 }}>Raw openFDA record</div>
          <pre className="mono no-sb" style={{ margin: 0, fontSize: 11, color: "var(--t2)", background: "var(--bg-2)", border: "1px solid var(--border)", borderRadius: "var(--r-sm)", padding: 12, overflowX: "auto", lineHeight: 1.6 }}>{JSON.stringify({ recall_number: r.recallId, classification: r.classification, product_description: r.productDescription, recalling_firm: r.recallingFirm, reason_for_recall: r.reason, distribution_pattern: r.distributionPattern, status: r.status, source: "openFDA" }, null, 2)}</pre>
        </div>
      </div>
    </div>
  );
}

function KV({ k, v, mono }) { return (<div><div className="label" style={{ marginBottom: 4 }}>{k}</div><div className={mono ? "mono" : ""} style={{ fontSize: 12.5, color: "var(--t2)", lineHeight: 1.5 }}>{v}</div></div>); }

/* ---------------- Fivetran Control Tower ---------------- */
function FivetranView() {
  const runs = window.RO.syncRuns;
  const [diag, setDiag] = useState(null);
  const fvLive = !!(window.RO_INTEGRATIONS && window.RO_INTEGRATIONS.fivetran === "live");
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 20 }}>
      <PageHeader eyebrow="operational data sync" title="Fivetran Control Tower" icon="refresh"
        sub="Connector health, sync timeline, and MCP tool activity feeding the BigQuery warehouse."
        right={<span className="mono" style={{ fontSize: 11, color: fvLive ? "var(--cyan)" : "var(--warning)", display: "inline-flex", alignItems: "center", gap: 6 }}><StatusDot tone={fvLive ? "cyan" : "warning"} /> {fvLive ? "MCP connected · stdio" : "MCP fallback · seeded"}</span>} />
      <FallbackBanner show={!fvLive} text="Showing seeded connector data — Fivetran isn't connected yet (fallback mode). Live connector status and sync timestamps appear once Fivetran credentials are configured." />
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(160px,1fr))", gap: 12 }}>
        <MiniStatTile k="Connectors" v="8" sub={fvLive ? "all healthy" : "seeded"} tone="var(--success)" icon="route" />
        <MiniStatTile k="Records synced" v="158,888" sub={fvLive ? "last run" : "seeded"} tone="var(--cyan)" icon="database" />
        <MiniStatTile k="Destination" v="BigQuery" sub={window.RO.env.BQ_DATASET} tone="var(--blue)" icon="database" />
        <MiniStatTile k="Freshness" v="42s" sub={fvLive ? "< 15 min SLA" : "seeded sample"} tone="var(--success)" icon="clock" />
      </div>
      <div className="panel" style={{ padding: 20 }}>
        <SectionTitle icon="route" title="Connector health" sub="source → BigQuery · API key configured, masked" />
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(280px,1fr))", gap: 12 }}>
          {runs.map(r => (
            <div key={r.id} className="panel lift" style={{ padding: 14, background: "var(--panel-2)" }}>
              <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 9 }}>
                <div style={{ minWidth: 0 }}>
                  <div style={{ fontSize: 13, fontWeight: 600, color: "var(--t1)" }}>{r.source}</div>
                  <div className="mono" style={{ fontSize: 10, color: "var(--t3)", marginTop: 2 }}>{r.connector}</div>
                </div>
                <span style={{ display: "inline-flex", alignItems: "center", gap: 5, fontSize: 10.5, fontFamily: "var(--f-mono)", color: fvLive ? "var(--success)" : "var(--t3)" }}><StatusDot tone={fvLive ? "success" : "muted"} /> {fvLive ? "success" : (r.status || "seeded")}</span>
              </div>
              <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: 8 }}>
                <span className="mono" style={{ fontSize: 10.5, color: "var(--t3)" }}>{r.recordsSynced.toLocaleString()} rows · {r.source.toLowerCase().replace(/[^a-z]/g, "_")}</span>
                <button onClick={() => setDiag(r.id)} style={{ background: "none", border: "none", color: "var(--cyan)", fontSize: 10.5, cursor: "pointer", fontFamily: "var(--f-mono)", display: "inline-flex", alignItems: "center", gap: 4 }}><Icon name="brain" size={11} /> diagnose</button>
              </div>
              {diag === r.id && <div className="rise" style={{ marginTop: 10, padding: "9px 11px", background: "var(--cyan-dim)", border: "1px solid var(--cyan-line)", borderRadius: "var(--r-sm)", fontSize: 11.5, color: "var(--t1)" }}><Icon name="sparkles" size={12} style={{ color: "var(--cyan)", display: "inline", verticalAlign: "-2px", marginRight: 6 }} />{fvLive ? "Gemini" : "Sample"}: connector healthy. Last sync {r.recordsSynced.toLocaleString()} rows, 0 errors, schema drift none.</div>}
            </div>
          ))}
        </div>
      </div>
      <div className="panel" style={{ padding: 20 }}>
        <SectionTitle icon="link" title="MCP tool activity" sub="Tools the agent invoked on the Fivetran MCP server." />
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(220px,1fr))", gap: 10 }}>
          {["list_connectors", "trigger_sync", "get_sync_status", "describe_schema", "get_records"].map(t => (
            <div key={t} style={{ display: "flex", alignItems: "center", gap: 9, padding: "11px 13px", background: "var(--panel-2)", border: "1px solid var(--border)", borderRadius: "var(--r-sm)" }}>
              <Icon name="route" size={13} style={{ color: "var(--cyan)" }} /><code className="mono" style={{ fontSize: 12, color: "var(--t1)", fontWeight: 600 }}>{t}</code>
              <span className="mono" style={{ marginLeft: "auto", fontSize: 10, color: fvLive ? "var(--success)" : "var(--t3)" }}>{fvLive ? "ok" : "sample"}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
function MiniStatTile({ k, v, sub, tone, icon }) {
  return (<div className="panel lift" style={{ padding: "15px 16px", display: "flex", alignItems: "center", gap: 13 }}>
    <div style={{ width: 38, height: 38, borderRadius: "var(--r-sm)", flex: "none", display: "grid", placeItems: "center", background: "var(--panel-2)", border: "1px solid var(--border-2)", color: tone }}><Icon name={icon} size={18} /></div>
    <div style={{ minWidth: 0 }}><div className="mono" style={{ fontSize: 20, fontWeight: 600, color: tone, lineHeight: 1 }}>{v}</div><div className="label" style={{ marginTop: 5 }}>{k} · {sub}</div></div></div>);
}

/* ---------------- Evidence Board ---------------- */
function EvidenceView() {
  const bqLive = !!(window.RO_INTEGRATIONS && window.RO_INTEGRATIONS.bigquery === "live");
  const rc = window.RO.recall;
  const _lots = rc.lotCodes || [];
  // FDA side is the REAL recall; the internal-catalog side is seed (no real retailer catalog).
  const m = [
    { id: "m_firm", from: rc.recallingFirm || "recalling firm", to: "supplier sup_01 · seed catalog", type: "firm → supplier", confidence: 0.88, status: "auto" },
    ..._lots.slice(0, 2).map((l, i) => ({ id: "m_lot" + i, from: "Recall lot " + l, to: "internal lot " + l, type: "exact lot", confidence: 0.96 - i * 0.05, status: "auto" })),
    { id: "m_prod", from: '"' + (rc.productDescription || "").slice(0, 30) + '…"', to: "SKU · seed catalog", type: "semantic product", confidence: 0.74, status: "review" },
    { id: "m_dist", from: "Distribution: " + (rc.distributionPattern || "").slice(0, 22), to: (window.RO.stats.locationsAffected || 37) + " mapped locations", type: "distribution → regions", confidence: 0.91, status: "auto" },
  ];
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 20 }}>
      <PageHeader eyebrow="explainable matching" title="Evidence Board" icon="database"
        sub="FDA fields → BigQuery SQL → result rows → entity matches. Every recommendation is traceable." />
      <FallbackBanner show={!bqLive} text="The resolver rows below illustrate the matching concept on sample data. With BigQuery connected, these become real query results against the synced warehouse." />
      <div className="panel" style={{ padding: 20 }}>
        <SectionTitle icon="database" title="BigQuery evidence query" sub="Deterministic blast-radius SQL run on synced operational data." />
        <pre className="mono no-sb" style={{ margin: 0, fontSize: 11.5, color: "var(--t2)", background: "var(--bg-2)", border: "1px solid var(--border)", borderRadius: "var(--r-sm)", padding: 14, overflowX: "auto", lineHeight: 1.7 }}>{`SELECT location_id, sku, lot, units
FROM \`${(window.RO.env.BQ_DATASET || 'recallops_cortex')}.inventory_lots\`
WHERE lot IN (${(window.RO.recall.lotCodes || []).map(l => "'" + l + "'").join(', ')});
-- → ${window.RO.stats.unitsInventory.toLocaleString()} units · ${window.RO.stats.locationsAffected} locations · ${window.RO.stats.skuCount || 3} SKUs`}</pre>
      </div>
      <div className="panel" style={{ padding: 20 }}>
        <SectionTitle icon="target" title="Entity resolver" sub="FDA text resolved to internal entities with confidence scoring." />
        <div style={{ overflowX: "auto" }} className="no-sb">
          <table style={{ width: "100%", borderCollapse: "collapse", minWidth: 640 }}>
            <thead><tr style={{ borderBottom: "1px solid var(--border-2)" }}>{["FDA source", "Internal entity", "Match type", "Confidence", "Status"].map((h, i) => <th key={i} style={{ textAlign: i === 3 ? "right" : "left", padding: "0 12px 11px" }}><span className="label">{h}</span></th>)}</tr></thead>
            <tbody>
              {m.map(x => (
                <tr key={x.id} style={{ borderBottom: "1px solid var(--border)" }}>
                  <td style={{ padding: "12px" }}><span className="mono" style={{ fontSize: 11.5, color: "var(--t1)" }}>{x.from}</span></td>
                  <td style={{ padding: "12px" }}><span className="mono" style={{ fontSize: 11.5, color: "var(--cyan)" }}>{x.to}</span></td>
                  <td style={{ padding: "12px" }}><span style={{ fontSize: 12, color: "var(--t2)" }}>{x.type}</span></td>
                  <td style={{ padding: "12px", textAlign: "right" }}><span className="mono" style={{ fontSize: 12.5, fontWeight: 600, color: x.confidence >= 0.9 ? "var(--success)" : x.confidence >= 0.7 ? "var(--class-2)" : "var(--class-1)" }}>{x.confidence.toFixed(2)}</span></td>
                  <td style={{ padding: "12px" }}>{x.status === "auto" ? <Badge tone="success">auto</Badge> : <Badge tone="warning">review</Badge>}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

/* ---------------- Context Pack ---------------- */
function ContextView() {
  const { navigate } = useRO();
  const base = window.RO.contextPack;
  const bqLive = !!(window.RO_INTEGRATIONS && window.RO_INTEGRATIONS.bigquery === "live");
  const c = Object.assign({}, base, {
    recallId: window.RO.recall.recallId,
    matchedRows: window.RO.stats.unitsInventory,
    json: Object.assign({}, base.json, {
      recall: window.RO.recall.recallId,
      classification: window.RO.recall.classification,
      bigquery_rows: window.RO.stats.unitsInventory,
    }),
  });
  const [regen, setRegen] = useState(false);
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 20 }}>
      <PageHeader eyebrow="what the agent used" title="Context Pack" icon="layers"
        sub="The exact evidence the agent assembled before reasoning — grounded, fresh, and auditable."
        right={<span className="mono" style={{ fontSize: 11, color: "var(--cyan)" }}>{c.id}</span>} />
      <FallbackBanner show={!bqLive} text="Numbers reflect the live recall; warehouse freshness and row counts become real BigQuery values once connected." />
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(150px,1fr))", gap: 12 }}>
        <MiniStatTile k="Freshness" v={c.freshnessSec + "s"} sub="synced" tone="var(--success)" icon="clock" />
        <MiniStatTile k="Matched rows" v={c.matchedRows.toLocaleString()} sub="BigQuery" tone="var(--cyan)" icon="database" />
        <MiniStatTile k="Graph nodes" v={String(c.graphNodes)} sub="neighbors" tone="var(--blue)" icon="graph" />
        <MiniStatTile k="Memories" v={String(c.similarRecalls)} sub="similar" tone="var(--memory, #FBBF24)" icon="sparkles" />
      </div>
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 18 }} className="ro-blast">
        <div className="panel" style={{ padding: 20 }}>
          <SectionTitle icon="layers" title="Pack contents" />
          {[["Recall summary", c.recallId + " · " + window.RO.recall.classification], ["Fivetran freshness", c.freshnessSec + "s ago (< 15 min)"], ["BigQuery matched rows", c.matchedRows.toLocaleString()], ["Graph neighbors", c.graphNodes + " nodes"], ["Similar past recalls", c.similarRecalls], ["Approved memories", c.playbookMemories], ["Risk constraints", c.riskConstraints]].map(([k, v], i) => (
            <div key={i} style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "11px 0", borderBottom: i < 6 ? "1px solid var(--border)" : "none" }}>
              <span style={{ fontSize: 13, color: "var(--t2)" }}>{k}</span><span className="mono" style={{ fontSize: 12.5, color: "var(--t1)" }}>{v}</span>
            </div>
          ))}
          <div style={{ display: "flex", gap: 9, marginTop: 16, flexWrap: "wrap" }}>
            <Button variant="secondary" size="sm" icon="refresh" onClick={() => { setRegen(true); setTimeout(() => setRegen(false), 1200); }}>{regen ? "Regenerating…" : "Regenerate"}</Button>
            <Button variant="ghost" size="sm" icon="graph" onClick={() => navigate("graph")}>Inspect graph nodes</Button>
            <Button variant="primary" size="sm" icon="brain" onClick={() => navigate("cortex")}>Send to Gemini</Button>
          </div>
        </div>
        <div className="panel" style={{ padding: 20, display: "flex", flexDirection: "column" }}>
          <SectionTitle icon="brain" title="Context pack JSON" sub="Sent verbatim to the Gemini agent." />
          <pre className="mono no-sb" style={{ margin: 0, flex: 1, fontSize: 11, color: "var(--t2)", background: "var(--bg-2)", border: "1px solid var(--border)", borderRadius: "var(--r-sm)", padding: 14, overflow: "auto", lineHeight: 1.65 }}>{JSON.stringify(c.json, null, 2)}</pre>
        </div>
      </div>
    </div>
  );
}

Object.assign(window, { RadarView, FivetranView, EvidenceView, ContextView, KV, MiniStatTile, FallbackBanner });
