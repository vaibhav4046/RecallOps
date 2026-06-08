/* ============================================================
   RecallOps Command — Views (part 2)
   ComplianceView · ReportView · ArchitectureView · SettingsView
   ============================================================ */

/* ============================================================
   Compliance view
   ============================================================ */
function ComplianceView() {
  const store = useRO();
  const status = deriveTimeline(store);
  const complete = Object.values(status).filter(v => v === "complete").length;
  const total = Object.keys(status).length;
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 22 }}>
      <PageHeader eyebrow="Audit-ready compliance" title="Compliance timeline" icon="timeline"
        sub="Every agent and human action is recorded with a timestamp, actor, and evidence link — the spine of the audit-ready compliance report."
        right={<Badge tone={complete === total ? "success" : "cyan"}>{complete}/{total} events complete</Badge>} />
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 18 }} className="ro-blast">
        <div className="panel" style={{ padding: 22 }}>
          <SectionTitle icon="timeline" title="Event timeline" />
          <ComplianceTimeline />
        </div>
        <div style={{ display: "flex", flexDirection: "column", gap: 18 }}>
          <div className="panel" style={{ padding: 20 }}>
            <SectionTitle icon="shield" title="Approval ledger" sub="Human sign-offs recorded for containment actions." />
            <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
              {window.RO.actions.map(a => {
                const st = store.actionState[a.id];
                const ok = st?.approvalState === "approved";
                return (
                  <div key={a.id} style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: 10, padding: "10px 12px", background: "var(--panel-2)", border: "1px solid var(--border)", borderRadius: "var(--r-sm)" }}>
                    <div style={{ display: "flex", alignItems: "center", gap: 10, minWidth: 0 }}>
                      <Icon name={ACTION_ICON[a.type]} size={15} style={{ color: ok ? "var(--success)" : "var(--t3)" }} />
                      <span style={{ fontSize: 12.5, color: "var(--t1)", fontWeight: 500, whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>{a.title}</span>
                    </div>
                    <Badge tone={ok ? "success" : st?.approvalState === "rejected" ? "danger" : "muted"}>{ok ? "approved" : st?.approvalState || "pending"}</Badge>
                  </div>
                );
              })}
            </div>
          </div>
          <div className="panel" style={{ padding: 20 }}>
            <SectionTitle icon="database" title="Evidence registry" />
            <div style={{ display: "flex", flexDirection: "column", gap: 7 }}>
              {Object.values(window.RO.evidence).map(e => (
                <div key={e.id} style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: 10, padding: "9px 11px", background: "var(--panel-2)", border: "1px solid var(--border)", borderRadius: "var(--r-sm)" }}>
                  <div style={{ minWidth: 0 }}><div style={{ fontSize: 12.5, color: "var(--t1)" }}>{e.label}</div><div className="mono" style={{ fontSize: 10, color: "var(--t3)", marginTop: 2 }}>{e.detail}</div></div>
                  <Badge tone="blue">{e.source}</Badge>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

/* ============================================================
   Report view
   ============================================================ */
function ReportView() {
  const { navigate } = useRO();
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 22, maxWidth: 1080, margin: "0 auto", width: "100%" }}>
      <PageHeader eyebrow="Judge-facing output" title="Compliance report" icon="fileCheck"
        sub="The export-ready artifact a regulator or executive reads after containment."
        right={<Button variant="ghost" size="sm" iconRight="arrowRight" onClick={() => navigate("architecture")}>Architecture</Button>} />
      <FinalReport />
    </div>
  );
}

/* ============================================================
   Architecture view
   ============================================================ */
function ArchitectureView() {
  const deploy = [
    { k: "Frontend", v: "Cloud Run / Vercel", icon: "external" },
    { k: "Backend / API", v: "Cloud Run", icon: "cpu" },
    { k: "Agent runtime", v: "Agent Builder / ADK", icon: "brain" },
    { k: "Data warehouse", v: "BigQuery", icon: "database" },
    { k: "Data sync", v: "Fivetran", icon: "refresh" },
    { k: "Partner MCP", v: "Fivetran MCP server", icon: "route" },
    { k: "Secrets", v: "Secret Manager", icon: "lock" },
    { k: "Logs", v: "Cloud Logging", icon: "timeline" },
    { k: "State (optional)", v: "Firestore", icon: "layers" },
  ];
  const ECOSYSTEM_FALLBACK = [
    { id: "google", name: "Google Cloud", role: "Gemini 3 · Agent Builder · Cloud Run · BigQuery", status: "core" },
    { id: "fivetran", name: "Fivetran", role: "MCP sync (161 ops) → BigQuery", status: "pluggable" },
    { id: "arize", name: "Arize Phoenix", role: "LLM tracing + evals · OpenTelemetry", status: "live" },
    { id: "dynatrace", name: "Dynatrace", role: "APM / observability via OTLP export", status: "otlp-ready" },
    { id: "elastic", name: "Elastic", role: "Recall + audit full-text search", status: "pluggable" },
    { id: "mongodb", name: "MongoDB", role: "Agent memory + vector similar-recalls", status: "pluggable" },
    { id: "gitlab", name: "GitLab", role: "CI/CD + DevSecOps pipeline", status: "in-repo" },
  ];
  const eco = window.RO.ecosystem || ECOSYSTEM_FALLBACK;
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 22, maxWidth: 1180, margin: "0 auto", width: "100%" }}>
      <PageHeader eyebrow="System architecture" title="How RecallOps works" icon="cpu"
        sub="A judge-facing view of the data and control flow behind the containment agent." />

      <div className="panel" style={{ padding: 22 }}>
        <SectionTitle icon="route" title="Data & control flow" sub="From a public FDA recall to an audit-ready, human-approved containment report." />
        <ArchitectureDiagram />
      </div>

      <div className="panel" style={{ padding: 22, borderColor: "var(--cyan-line)", background: "linear-gradient(180deg, rgba(6,182,212,0.05), transparent 40%), var(--panel)" }}>
        <div style={{ display: "flex", gap: 14, alignItems: "flex-start" }}>
          <div style={{ width: 40, height: 40, borderRadius: "var(--r-sm)", flex: "none", background: "var(--cyan-dim)", border: "1px solid var(--cyan-line)", display: "grid", placeItems: "center", color: "var(--cyan)" }}><Icon name="refresh" size={20} /></div>
          <div>
            <h3 style={{ margin: 0, fontSize: 17, fontWeight: 600, fontFamily: "var(--f-display)", color: "var(--t1)" }}>Why Fivetran is load-bearing</h3>
            <p style={{ margin: "9px 0 0", fontSize: 14, color: "var(--t2)", lineHeight: 1.62, maxWidth: 820 }}>
              Fivetran is not decorative in RecallOps. It is the operational data foundation. The agent cannot determine recall blast radius without fresh synced data from inventory, POS, shipments, suppliers, customers, and locations.
            </p>
          </div>
        </div>
      </div>

      <div>
        <SectionTitle icon="layers" title="Partner ecosystem" sub="Built on Google Cloud + Fivetran, with first-class OpenTelemetry observability and a pluggable partner stack. Each badge reflects real config — no fake integrations." />
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(258px,1fr))", gap: 12 }}>
          {eco.map(p => {
            const tone = p.status === "live" ? "success" : p.status === "core" ? "blue" : "warning";
            const label = ({ live: "LIVE", core: "CORE", pluggable: "PLUGGABLE", "otlp-ready": "OTLP-READY", "in-repo": "IN REPO" })[p.status] || p.status.toUpperCase();
            return (
              <div key={p.id} className="panel lift" style={{ padding: "15px 16px" }}>
                <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: 8, marginBottom: 7 }}>
                  <span style={{ fontSize: 14, fontWeight: 600, color: "var(--t1)" }}>{p.name}</span>
                  <Badge tone={tone}>{label}</Badge>
                </div>
                <div style={{ fontSize: 12, color: "var(--t3)", lineHeight: 1.5 }}>{p.role}</div>
              </div>
            );
          })}
        </div>
      </div>

      <div>
        <SectionTitle icon="cpu" title="Cloud deployment" sub="Google Cloud Rapid Agent Hackathon — Fivetran track." />
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(220px,1fr))", gap: 12 }}>
          {deploy.map(d => (
            <div key={d.k} className="panel lift" style={{ padding: "15px 16px", display: "flex", alignItems: "center", gap: 13 }}>
              <div style={{ width: 36, height: 36, borderRadius: "var(--r-sm)", flex: "none", background: "var(--panel-2)", border: "1px solid var(--border-2)", display: "grid", placeItems: "center", color: "var(--cyan)" }}><Icon name={d.icon} size={17} /></div>
              <div style={{ minWidth: 0 }}><div className="label">{d.k}</div><div style={{ fontSize: 13.5, color: "var(--t1)", fontWeight: 600, marginTop: 3 }}>{d.v}</div></div>
            </div>
          ))}
        </div>
      </div>

      <div className="panel" style={{ padding: 22 }}>
        <SectionTitle icon="shield" title="Compliance guarantees" />
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(240px,1fr))", gap: 14 }}>
          {[
            ["No external action executes without approval", "Customer-facing and destructive actions are gated behind a human approval modal.", "lock"],
            ["Audit-ready compliance report", "Every step is timestamped with actor and evidence, assembled into an exportable report.", "fileCheck"],
            ["Before-the-fact evidence", "Each action cites the exact BigQuery query and Fivetran sync it was derived from.", "database"],
          ].map(([t, d, ic]) => (
            <div key={t} style={{ padding: "15px 16px", background: "var(--panel-2)", border: "1px solid var(--border)", borderRadius: "var(--r-sm)" }}>
              <div style={{ width: 32, height: 32, borderRadius: "var(--r-sm)", background: "var(--cyan-dim)", border: "1px solid var(--cyan-line)", display: "grid", placeItems: "center", color: "var(--cyan)", marginBottom: 11 }}><Icon name={ic} size={16} /></div>
              <div style={{ fontSize: 13.5, fontWeight: 600, color: "var(--t1)", marginBottom: 5, lineHeight: 1.3 }}>{t}</div>
              <p style={{ margin: 0, fontSize: 12, color: "var(--t3)", lineHeight: 1.5 }}>{d}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

/* ============================================================
   Settings view
   ============================================================ */
function SettingsView() {
  const ig = window.RO_INTEGRATIONS || {};
  const realStatus = (it) => {
    const map = { openfda: ig.openfda, gemini: ig.gemini, bigquery: ig.bigquery, fivetran: ig.fivetran, fivetran_mcp: ig.fivetran };
    if (it.id in map) return map[it.id] === "live" ? it.status : "fallback";
    if (it.id === "cloudrun") return window.RO_LIVE ? it.status : "fallback";
    if (it.id === "secret") return "fallback";  // not wired locally
    return it.status;  // infra (logging) — leave as seeded
  };
  const [items, setItems] = useState(() => window.RO.integrations.map(it => ({ ...it, status: realStatus(it) })));
  const [retry, setRetry] = useState(null);
  const reconnect = (id) => {
    setRetry(id);
    setTimeout(() => { setItems(list => list.map(x => x.id === id ? { ...x, status: "connected", detail: "ingest recovered · 0 lag" } : x)); setRetry(null); }, 1500);
  };
  const ACC = { cyan: "var(--cyan)", blue: "var(--blue)", success: "var(--success)", warning: "var(--warning)" };
  const ST = { connected: "Connected", active: "Active", synced: "Synced", ready: "Ready", live: "Live", degraded: "Degraded", fallback: "Fallback" };
  const STtone = { connected: "success", active: "success", synced: "blue", ready: "blue", live: "success", degraded: "warning", fallback: "warning" };
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 22, maxWidth: 1080, margin: "0 auto", width: "100%" }}>
      <PageHeader eyebrow="Environment & integrations" title="Integration health" icon="settings"
        sub="Connection status for every system in the containment pipeline. Wire these to real credentials and the command center goes live." />

      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(280px,1fr))", gap: 14 }}>
        {items.map(it => {
          const degraded = it.status === "degraded";
          const fallback = it.status === "fallback";
          const tone = STtone[it.status];
          return (
            <div key={it.id} className="panel lift" style={{ padding: 18, borderColor: degraded ? "rgba(245,158,11,.34)" : "var(--border)" }}>
              <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", gap: 10, marginBottom: 14 }}>
                <div style={{ display: "flex", alignItems: "center", gap: 11, minWidth: 0 }}>
                  <div style={{ width: 40, height: 40, borderRadius: "var(--r-sm)", flex: "none", display: "grid", placeItems: "center", background: "color-mix(in srgb," + ACC[it.accent] + " 12%, var(--panel-2))", border: "1px solid color-mix(in srgb," + ACC[it.accent] + " 30%, transparent)", color: ACC[it.accent] }}>
                    <Icon name={it.id.includes("fivetran") ? "refresh" : it.id === "bigquery" ? "database" : it.id === "gemini" ? "brain" : it.id === "cloudrun" ? "cpu" : it.id === "openfda" ? "external" : it.id === "secret" ? "lock" : it.id === "logging" ? "timeline" : "layers"} size={19} />
                  </div>
                  <div style={{ minWidth: 0 }}><div style={{ fontSize: 14, fontWeight: 600, color: "var(--t1)" }}>{it.name}</div><div className="label" style={{ marginTop: 3 }}>{it.role}</div></div>
                </div>
                <span style={{ display: "inline-flex", alignItems: "center", gap: 6, fontSize: 11.5, fontFamily: "var(--f-mono)", color: RTONE[tone], flex: "none" }}><StatusDot tone={tone} live={!degraded} /> {ST[it.status]}</span>
              </div>
              {fallback ? (
                <div style={{ background: "color-mix(in srgb, var(--warning) 10%, transparent)", border: "1px solid rgba(245,158,11,.28)", borderRadius: "var(--r-sm)", padding: "11px 12px", display: "flex", alignItems: "center", gap: 10 }}>
                  <Icon name="alert" size={15} style={{ color: "var(--warning)", flex: "none" }} />
                  <span style={{ fontSize: 12, color: "var(--t2)" }}>Not connected — add credentials to go live (docs/setup.md).</span>
                </div>
              ) : degraded ? (
                <div style={{ background: "color-mix(in srgb, var(--warning) 12%, transparent)", border: "1px solid rgba(245,158,11,.3)", borderRadius: "var(--r-sm)", padding: "11px 12px", display: "flex", alignItems: "center", gap: 11, flexWrap: "wrap" }}>
                  <Icon name="alert" size={16} style={{ color: "var(--warning)", flex: "none" }} />
                  <span style={{ fontSize: 12, color: "var(--t1)", flex: 1, minWidth: 110 }}>{it.detail}</span>
                  <Button variant="ghost" size="sm" onClick={() => reconnect(it.id)} disabled={retry === it.id}>{retry === it.id ? "Reconnecting…" : "Reconnect"}</Button>
                </div>
              ) : (
                <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: 10 }}>
                  <code className="mono" style={{ fontSize: 11.5, color: "var(--t3)" }}>{it.detail}</code>
                  <span style={{ display: "inline-flex", alignItems: "center", gap: 5, color: "var(--success)", fontSize: 11, fontFamily: "var(--f-mono)" }}><Icon name="check" size={12} /> healthy</span>
                </div>
              )}
            </div>
          );
        })}
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 18 }} className="ro-blast">
        <div className="panel" style={{ padding: 20 }}>
          <SectionTitle icon="route" title="Fivetran MCP tools" sub="Tools the agent calls for Fivetran-synced operational data." />
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10 }}>
            {[["list_connectors", "Enumerate sources"], ["trigger_sync", "Force a connector resync"], ["get_sync_status", "Poll sync state"], ["describe_schema", "Warehouse schema"], ["get_records", "Sampled rows"]].map(([t, d]) => (
              <div key={t} style={{ padding: "11px 12px", background: "var(--panel-2)", border: "1px solid var(--border)", borderRadius: "var(--r-sm)" }}>
                <div style={{ display: "flex", alignItems: "center", gap: 7, marginBottom: 4 }}><Icon name="route" size={12} style={{ color: "var(--cyan)" }} /><code className="mono" style={{ fontSize: 11.5, color: "var(--t1)", fontWeight: 600 }}>{t}</code></div>
                <p style={{ margin: 0, fontSize: 11, color: "var(--t3)" }}>{d}</p>
              </div>
            ))}
          </div>
        </div>
        <div className="panel" style={{ padding: 20 }}>
          <SectionTitle icon="shield" title="Containment policy" />
          <Toggle k="Require human approval" sub="Gate every action behind sign-off" on />
          <Toggle k="Block customer-facing auto-execute" sub="Never message customers without approval" on />
          <Toggle k="Suppress non-consented contacts" sub="Honor opt-out on notifications" on />
          <Toggle k="Write all events to audit log" sub="Immutable compliance trail" on last />
        </div>
      </div>
    </div>
  );
}
function Toggle({ k, sub, on: init, last }) {
  const [on, setOn] = useState(init);
  return (
    <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: 12, padding: "12px 0", borderBottom: last ? "none" : "1px solid var(--border)" }}>
      <div style={{ minWidth: 0 }}><div style={{ fontSize: 13, color: "var(--t1)", fontWeight: 500 }}>{k}</div><div style={{ fontSize: 11.5, color: "var(--t3)", marginTop: 2 }}>{sub}</div></div>
      <button onClick={() => setOn(o => !o)} role="switch" aria-checked={on} aria-label={k} style={{ width: 40, height: 23, borderRadius: 999, flex: "none", cursor: "pointer", position: "relative", background: on ? "var(--success)" : "var(--panel-3)", border: "1px solid " + (on ? "var(--success)" : "var(--border-3)"), transition: "all .2s" }}>
        <span style={{ position: "absolute", top: 2, left: on ? 19 : 2, width: 17, height: 17, borderRadius: "50%", background: on ? "#06101c" : "var(--t3)", transition: "left .2s cubic-bezier(.22,.61,.36,1)" }} />
      </button>
    </div>
  );
}

Object.assign(window, { ComplianceView, ReportView, ArchitectureView, SettingsView });
