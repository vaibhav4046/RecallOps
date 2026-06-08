/* ============================================================
   RecallOps Cortex — LLMOps · Improvement · Replay (Phase 6/7)
   ============================================================ */

function LineChart({ values, color = "var(--cyan)", height = 132, fmt = v => v, max, min }) {
  const mx = max != null ? max : Math.max(...values), mn = min != null ? min : Math.min(...values);
  const pad = (mx - mn) * 0.14 || 0.1, hi = mx + pad, lo = mn - pad, range = (hi - lo) || 1;
  const n = values.length, X = i => n > 1 ? 3 + i / (n - 1) * 94 : 50, Y = v => 100 - ((v - lo) / range) * 100;
  const pts = values.map((v, i) => [X(i), Y(v)]);
  const d = pts.map((p, i) => (i ? "L" : "M") + p[0].toFixed(2) + " " + p[1].toFixed(2)).join(" ");
  const id = "lc" + color.replace(/\W/g, "");
  return (
    <div style={{ position: "relative" }}>
      <svg viewBox="0 0 100 100" preserveAspectRatio="none" style={{ width: "100%", height, display: "block", overflow: "visible" }}>
        <defs><linearGradient id={id} x1="0" y1="0" x2="0" y2="1"><stop offset="0" stopColor={color} stopOpacity="0.32" /><stop offset="1" stopColor={color} stopOpacity="0" /></linearGradient></defs>
        {[0, 25, 50, 75, 100].map(y => <line key={y} x1="0" y1={y} x2="100" y2={y} stroke="rgba(255,255,255,0.05)" strokeWidth="0.5" vectorEffect="non-scaling-stroke" />)}
        <path d={d + " L97 100 L3 100 Z"} fill={"url(#" + id + ")"} />
        <path d={d} fill="none" stroke={color} strokeWidth="2.2" vectorEffect="non-scaling-stroke" strokeLinejoin="round" strokeLinecap="round" style={{ filter: "drop-shadow(0 1px 5px " + color + "66)" }} />
        {pts.map((p, i) => (
          <g key={i}>
            {i === n - 1 && <circle cx={p[0]} cy={p[1]} r="3.4" fill="none" stroke={color} strokeWidth="1.2" opacity="0.55" vectorEffect="non-scaling-stroke"><animate attributeName="r" values="3;8;3" dur="2.4s" repeatCount="indefinite" /><animate attributeName="opacity" values="0.55;0;0.55" dur="2.4s" repeatCount="indefinite" /></circle>}
            <circle cx={p[0]} cy={p[1]} r={i === n - 1 ? 3.2 : 1.7} fill={i === n - 1 ? color : "var(--panel)"} stroke={color} strokeWidth={i === n - 1 ? 0 : 1.4} vectorEffect="non-scaling-stroke" />
          </g>
        ))}
      </svg>
      <span className="mono" style={{ position: "absolute", top: -3, left: 0, fontSize: 9, color: "var(--t4)" }}>{fmt(mx)}</span>
      <span className="mono" style={{ position: "absolute", bottom: 13, left: 0, fontSize: 9, color: "var(--t4)" }}>{fmt(mn)}</span>
    </div>
  );
}

function ChartCard({ icon, title, sub, values, color, unit = "", fmt = v => v, max, min, goodUp = true }) {
  const last = values[values.length - 1], first = values[0], delta = last - first;
  const good = goodUp ? delta >= 0 : delta <= 0;
  const accent = good ? "var(--success)" : "var(--class-1)";
  return (
    <div className="panel lift" style={{ padding: 20 }}>
      <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", gap: 12, marginBottom: 16 }}>
        <div style={{ display: "flex", alignItems: "center", gap: 11, minWidth: 0 }}>
          <div style={{ width: 32, height: 32, borderRadius: "var(--r-sm)", flex: "none", background: "color-mix(in srgb," + color + " 13%, transparent)", border: "1px solid color-mix(in srgb," + color + " 30%, transparent)", display: "grid", placeItems: "center", color }}><Icon name={icon} size={16} /></div>
          <div style={{ minWidth: 0 }}>
            <div className="label" style={{ whiteSpace: "nowrap" }}>{title}</div>
            <div className="mono num-grad" style={{ fontSize: 26, fontWeight: 700, letterSpacing: "-.02em", marginTop: 2 }}>{fmt(last)}{unit}</div>
          </div>
        </div>
        <span style={{ display: "inline-flex", alignItems: "center", gap: 4, flex: "none", fontSize: 11.5, fontFamily: "var(--f-mono)", fontWeight: 600, color: accent, background: "color-mix(in srgb," + accent + " 13%, transparent)", border: "1px solid color-mix(in srgb," + accent + " 30%, transparent)", borderRadius: "var(--r-pill)", padding: "4px 9px" }}>
          <span style={{ display: "inline-flex", transform: delta >= 0 ? "none" : "scaleY(-1)" }}><Icon name="arrowUpRight" size={12} /></span>
          {(delta >= 0 ? "+" : "−") + fmt(Math.abs(delta))}{unit}
        </span>
      </div>
      <LineChart values={values} color={color} max={max} min={min} fmt={fmt} />
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginTop: 10, paddingTop: 10, borderTop: "1px solid var(--border)" }}>
        <span className="mono" style={{ fontSize: 10, color: "var(--t4)" }}>oldest</span>
        <span className="mono" style={{ fontSize: 10, color: "var(--t3)" }}>{values.length} runs</span>
        <span className="mono" style={{ fontSize: 10, color: "var(--t4)" }}>latest</span>
      </div>
    </div>
  );
}

function LLMOpsView() {
  const runs = window.RO.agentRuns;
  const trace = window.RO.toolTrace;
  const avgEval = (runs.reduce((a, r) => a + r.eval_score, 0) / runs.length);
  const avgLat = (runs.reduce((a, r) => a + r.latency_ms, 0) / runs.length / 1000);
  const cost = runs.reduce((a, r) => a + r.cost, 0);
  const ev = [...runs].reverse().map(r => r.eval_score);
  const lat = [...runs].reverse().map(r => r.latency_ms / 1000);
  const maxLat = Math.max(...trace.map(t => t.latencyMs));
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 20 }}>
      <PageHeader eyebrow="agent observability" title="LLMOps Tower" icon="activity"
        sub="Every Gemini run, instrumented — prompt versions, tool calls, latency, token spend, and eval scores." />
      {window.FallbackBanner && <window.FallbackBanner show={!(window.RO_INTEGRATIONS && window.RO_INTEGRATIONS.gemini === "live")} text="Includes seeded run history. Live Gemini 3 runs populate real model, token, latency, and eval telemetry once a key is configured." />}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(160px,1fr))", gap: 12 }}>
        <MiniStatTile k="Agent runs" v={String(runs.length)} sub="last 24h" tone="var(--cyan)" icon="activity" />
        <MiniStatTile k="Avg eval" v={avgEval.toFixed(2)} sub="suite score" tone="var(--success)" icon="flask" />
        <MiniStatTile k="Avg latency" v={avgLat.toFixed(1) + "s"} sub="per run" tone="var(--class-2)" icon="clock" />
        <MiniStatTile k="Token spend" v={"$" + cost.toFixed(2)} sub="total" tone="var(--blue)" icon="zap" />
      </div>
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 18 }} className="ro-blast">
        <ChartCard icon="flask" title="Eval score over runs" values={ev} color="#10B981" max={1} min={0.6} fmt={v => v.toFixed(2)} goodUp />
        <ChartCard icon="clock" title="Latency over runs" values={lat} color="#06B6D4" unit="s" fmt={v => v.toFixed(1)} goodUp={false} />
      </div>
      <div className="panel" style={{ padding: 20 }}>
        <SectionTitle icon="activity" title="Agent runs" />
        <div className="no-sb scroll-contain">
          <table style={{ width: "100%", borderCollapse: "collapse", minWidth: 760 }}>
            <thead><tr style={{ borderBottom: "1px solid var(--border-2)" }}>{["Run", "Prompt", "Model", "Tools", "Latency", "Tokens", "Cost", "Eval", "Status"].map((h, i) => <th key={i} style={{ textAlign: i >= 3 && i <= 7 ? "right" : "left", padding: "0 12px 11px", whiteSpace: "nowrap" }}><span className="label">{h}</span></th>)}</tr></thead>
            <tbody>{runs.map(r => (
              <tr key={r.run_id} style={{ borderBottom: "1px solid var(--border)" }}>
                <td style={{ padding: "11px 12px" }}><span className="mono" style={{ fontSize: 12, color: "var(--cyan)" }}>{r.run_id}</span></td>
                <td style={{ padding: "11px 12px" }}><span className="mono" style={{ fontSize: 11.5, color: "var(--t2)" }}>{r.prompt_version}</span></td>
                <td style={{ padding: "11px 12px" }}><span className="mono" style={{ fontSize: 11, color: "var(--t3)" }}>{r.model}</span></td>
                <td style={{ padding: "11px 12px", textAlign: "right" }}><span className="mono" style={{ fontSize: 12, color: "var(--t2)" }}>{r.tools}</span></td>
                <td style={{ padding: "11px 12px", textAlign: "right" }}><span className="mono" style={{ fontSize: 12, color: "var(--t2)" }}>{(r.latency_ms / 1000).toFixed(1)}s</span></td>
                <td style={{ padding: "11px 12px", textAlign: "right" }}><span className="mono" style={{ fontSize: 12, color: "var(--t2)" }}>{r.token_count.toLocaleString()}</span></td>
                <td style={{ padding: "11px 12px", textAlign: "right" }}><span className="mono" style={{ fontSize: 12, color: "var(--t2)" }}>${r.cost.toFixed(3)}</span></td>
                <td style={{ padding: "11px 12px", textAlign: "right" }}><span className="mono" style={{ fontSize: 12, fontWeight: 600, color: r.eval_score >= 0.85 ? "var(--success)" : r.eval_score >= 0.75 ? "var(--class-2)" : "var(--class-1)" }}>{r.eval_score.toFixed(2)}</span></td>
                <td style={{ padding: "11px 12px" }}><Badge tone={r.status === "passed" ? "success" : r.status === "review" ? "warning" : "danger"}>{r.status}</Badge></td>
              </tr>
            ))}</tbody>
          </table>
        </div>
      </div>
      <div className="panel" style={{ padding: 20 }}>
        <SectionTitle icon="route" title="Tool-call timeline" sub={(runs[0] ? runs[0].run_id : "latest") + " · " + trace.length + " OpenTelemetry spans"} />
        <div style={{ display: "flex", flexDirection: "column", gap: 7 }}>
          {trace.map((t, i) => (
            <div key={i} style={{ display: "flex", alignItems: "center", gap: 11, flexWrap: "wrap" }}>
              <span className="mono" style={{ fontSize: 11, color: "var(--t2)", flex: "1 1 150px", maxWidth: 200, minWidth: 0, whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>{t.name}</span>
              <div style={{ flex: "10 1 90px", minWidth: 80, height: 16, background: "var(--bg-2)", borderRadius: 4, overflow: "hidden", position: "relative" }}>
                <div style={{ width: (t.latencyMs / maxLat * 100) + "%", height: "100%", background: "var(--accent-grad)", borderRadius: 4, opacity: 0.85 }} />
              </div>
              <span className="mono" style={{ fontSize: 10.5, color: "var(--t3)", width: 58, textAlign: "right", flex: "none" }}>{t.latencyMs}ms</span>
              <span className="mono" style={{ fontSize: 10.5, color: "var(--t3)", flex: "1 1 110px", maxWidth: 130, minWidth: 0, whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>{t.detail}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

/* ---------------- Self-Improvement Center ---------------- */
const IMP_TYPE = { matching_rule: "Matching rule", playbook_rule: "Playbook rule", memory_update: "Memory update", tool_policy: "Tool policy", prompt_patch: "Prompt patch" };
function ImprovementView() {
  const [states, setStates] = useState(() => Object.fromEntries(window.RO.improvements.map(p => [p.id, p.state])));
  const [toast, setToast] = useState(null);
  const flash = (m, t) => { setToast({ m, t }); setTimeout(() => setToast(null), 2600); };
  const set = (id, st, label) => { setStates(s => ({ ...s, [id]: st })); flash(id + " " + label, st === "approved" ? "success" : "danger"); };
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 20 }}>
      <PageHeader eyebrow="human-approved learning" title="Self-Improvement Center" icon="sparkles"
        sub="Eval failures become improvement proposals. Nothing changes production behavior without human approval — no silent edits to memory or playbooks." />
      <div className="panel" style={{ padding: "14px 16px", display: "flex", alignItems: "center", gap: 11, borderColor: "rgba(16,185,129,.3)" }}>
        <Icon name="shieldCheck" size={16} style={{ color: "var(--success)" }} />
        <span style={{ fontSize: 13, color: "var(--t2)" }}>Eval run completed → <strong style={{ color: "var(--t1)" }}>9/10 passed</strong>. 1 low-confidence area generated {window.RO.improvements.length} proposals for review.</span>
      </div>
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16 }} className="ro-actions-grid">
        {window.RO.improvements.map(p => {
          const st = states[p.id];
          return (
            <div key={p.id} className="panel lift" style={{ padding: 17, borderColor: st === "approved" ? "rgba(16,185,129,.4)" : st === "rejected" ? "rgba(239,68,68,.35)" : "var(--border)" }}>
              <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 9, flexWrap: "wrap" }}>
                <Badge tone={p.risk === "low" ? "success" : p.risk === "medium" ? "warning" : "danger"}>{p.risk} risk</Badge>
                <span className="mono" style={{ fontSize: 10.5, color: "var(--t3)" }}>{IMP_TYPE[p.type]}</span>
                {st === "approved" && <Badge tone="success">approved</Badge>}
                {st === "rejected" && <Badge tone="danger">rejected</Badge>}
              </div>
              <h4 style={{ margin: 0, fontSize: 14.5, fontWeight: 600, color: "var(--t1)" }}>{p.title}</h4>
              <div style={{ marginTop: 11, borderRadius: "var(--r-sm)", overflow: "hidden", border: "1px solid var(--border)" }}>
                <div style={{ padding: "9px 11px", background: "rgba(239,68,68,0.05)", display: "flex", gap: 8 }}><span className="mono" style={{ color: "var(--class-1)", fontSize: 11 }}>−</span><span style={{ fontSize: 11.5, color: "var(--t2)", lineHeight: 1.5 }}>{p.before}</span></div>
                <div style={{ padding: "9px 11px", background: "rgba(16,185,129,0.06)", display: "flex", gap: 8, borderTop: "1px solid var(--border)" }}><span className="mono" style={{ color: "var(--success)", fontSize: 11 }}>+</span><span style={{ fontSize: 11.5, color: "var(--t1)", lineHeight: 1.5 }}>{p.after}</span></div>
              </div>
              <div style={{ display: "flex", alignItems: "center", gap: 14, marginTop: 12 }}>
                <div><div className="label" style={{ fontSize: 9.5 }}>Eval before</div><div className="mono" style={{ fontSize: 14, fontWeight: 600, color: "var(--class-1)", marginTop: 2 }}>{p.evalBefore.toFixed(2)}</div></div>
                <Icon name="arrowRight" size={15} style={{ color: "var(--t4)" }} />
                <div><div className="label" style={{ fontSize: 9.5 }}>Eval after</div><div className="mono" style={{ fontSize: 14, fontWeight: 600, color: "var(--success)", marginTop: 2 }}>{p.evalAfter.toFixed(2)}</div></div>
                {!st || st === "pending" ? (
                  <div style={{ marginLeft: "auto", display: "flex", gap: 8 }}>
                    <Button variant="ghost" size="sm" onClick={() => set(p.id, "rejected", "rejected")}>Reject</Button>
                    <Button variant="success" size="sm" icon="check" onClick={() => set(p.id, "approved", "approved → future context")}>Approve</Button>
                  </div>
                ) : <span style={{ marginLeft: "auto", fontSize: 11.5, color: st === "approved" ? "var(--success)" : "var(--t3)", fontFamily: "var(--f-mono)" }}>{st === "approved" ? "→ promoted to memory" : "discarded"}</span>}
              </div>
            </div>
          );
        })}
      </div>
      <div className="panel" style={{ padding: 20 }}>
        <SectionTitle icon="sparkles" title="Memory episodes" sub="Past incidents the agent can recall — approved for future use." />
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(280px,1fr))", gap: 12 }}>
          {window.RO.memory.map(m => (
            <div key={m.id} style={{ padding: 14, background: "var(--panel-2)", border: "1px solid var(--border)", borderRadius: "var(--r-sm)" }}>
              <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 7 }}>
                <span style={{ fontSize: 13, fontWeight: 600, color: "var(--t1)" }}>{m.title}</span>
                <span className="mono" style={{ fontSize: 11, color: "#FBBF24" }}>{m.similarity.toFixed(2)}</span>
              </div>
              <p style={{ margin: "0 0 9px", fontSize: 11.5, color: "var(--t3)", lineHeight: 1.5 }}>{m.lesson}</p>
              <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
                <span className="mono" style={{ fontSize: 10.5, color: "var(--t3)" }}>{m.outcome}</span>
                <Badge tone={m.approved ? "success" : "muted"}>{m.approved ? "approved" : "pending"}</Badge>
              </div>
            </div>
          ))}
        </div>
      </div>
      {toast && <div style={{ position: "fixed", bottom: 24, left: "50%", transform: "translateX(-50%)", zIndex: 120, display: "flex", alignItems: "center", gap: 9, padding: "11px 16px", background: "var(--panel)", border: "1px solid " + (toast.t === "success" ? "var(--success)" : "var(--class-1)"), borderRadius: "var(--r-sm)", boxShadow: "var(--sh-2)" }}><Icon name={toast.t === "success" ? "checkCircle" : "x"} size={16} style={{ color: toast.t === "success" ? "var(--success)" : "var(--class-1)" }} /><span style={{ fontSize: 13, color: "var(--t1)" }}>{toast.m}</span></div>}
    </div>
  );
}

/* ---------------- Crisis Replay ---------------- */
const REPLAY_PHASES = { intake: "FDA intake", sync: "Fivetran sync", graph: "Graph build", context: "Context pack", reason: "Gemini reasoning", approve: "Human approval", eval: "Eval suite", report: "Report" };
function ReplayView() {
  const { judgeMode, navigate } = useRO();
  const events = window.RO.replayEvents;
  const END = 90;
  const [t, setT] = useState(0);
  const [playing, setPlaying] = useState(false);
  const [speed, setSpeed] = useState(1);
  const timer = useRef(0);
  useEffect(() => {
    if (!playing) return;
    timer.current = setInterval(() => setT(v => { const nv = v + 0.4 * speed; if (nv >= END) { clearInterval(timer.current); setPlaying(false); return END; } return nv; }), 100);
    return () => clearInterval(timer.current);
  }, [playing, speed]);
  const curIdx = events.reduce((acc, e, i) => t >= e.t ? i : acc, 0);
  const cur = events[curIdx];
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 20 }}>
      <PageHeader eyebrow="watch the incident" title="Crisis Replay" icon="play"
        sub="Scrub the entire containment from FDA intake to CONTAINED."
        right={<Button variant="primary" size="sm" icon="gavel" onClick={judgeMode}>Run live (Judge Mode)</Button>} />
      <div className="panel" style={{ padding: 24 }}>
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: 14, flexWrap: "wrap", marginBottom: 18 }}>
          <div>
            <div className="label">Now showing</div>
            <div style={{ fontSize: 20, fontWeight: 600, fontFamily: "var(--f-display)", color: "var(--cyan)", marginTop: 4 }}>{REPLAY_PHASES[cur.phase]}</div>
            <div style={{ fontSize: 13, color: "var(--t2)", marginTop: 3 }}>{cur.label}</div>
          </div>
          <div className="mono" style={{ fontSize: 34, fontWeight: 600, color: "var(--t1)" }}>{Math.floor(t)}<span style={{ fontSize: 16, color: "var(--t3)" }}>s / {END}s</span></div>
        </div>
        {/* timeline track */}
        <div style={{ position: "relative", height: 40, marginBottom: 18 }}>
          <div style={{ position: "absolute", top: 18, left: 0, right: 0, height: 4, background: "var(--bg-2)", borderRadius: 999 }} />
          <div style={{ position: "absolute", top: 18, left: 0, width: (t / END * 100) + "%", height: 4, background: "var(--accent-grad)", borderRadius: 999, boxShadow: "0 0 10px var(--cyan)" }} />
          {events.map((e, i) => (
            <button key={i} onClick={() => setT(e.t)} title={e.label} style={{ position: "absolute", top: 11, left: (e.t / END * 100) + "%", transform: "translateX(-50%)", width: 18, height: 18, borderRadius: "50%", border: "2px solid " + (t >= e.t ? "var(--cyan)" : "var(--border-3)"), background: t >= e.t ? "var(--cyan)" : "var(--panel)", cursor: "pointer", padding: 0 }} />
          ))}
        </div>
        {/* controls */}
        <div style={{ display: "flex", alignItems: "center", gap: 12, flexWrap: "wrap" }}>
          <Button variant="primary" icon={playing ? "activity" : "play"} onClick={() => { if (t >= END) setT(0); setPlaying(p => !p); }}>{playing ? "Pause" : "Play"}</Button>
          <Button variant="ghost" size="sm" icon="refresh" onClick={() => { setT(0); setPlaying(false); }}>Reset</Button>
          <input type="range" min="0" max={END} step="0.5" value={t} onChange={e => setT(parseFloat(e.target.value))} style={{ flex: 1, minWidth: 160, accentColor: "var(--cyan)" }} />
          <div style={{ display: "flex", gap: 6 }}>
            {[0.5, 1, 2].map(s => <button key={s} onClick={() => setSpeed(s)} style={{ padding: "5px 10px", fontSize: 11.5, fontFamily: "var(--f-mono)", cursor: "pointer", background: speed === s ? "var(--panel-3)" : "transparent", border: "1px solid " + (speed === s ? "var(--cyan-line)" : "var(--border-2)"), borderRadius: "var(--r-sm)", color: speed === s ? "var(--cyan)" : "var(--t3)" }}>{s}×</button>)}
          </div>
        </div>
      </div>
      <div className="panel" style={{ padding: 20 }}>
        <SectionTitle icon="timeline" title="Incident events" />
        <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
          {events.map((e, i) => (
            <button key={i} onClick={() => setT(e.t)} style={{ display: "flex", alignItems: "center", gap: 12, padding: "10px 12px", textAlign: "left", cursor: "pointer", background: i === curIdx ? "var(--panel-3)" : "var(--panel-2)", border: "1px solid " + (i === curIdx ? "var(--cyan-line)" : "var(--border)"), borderRadius: "var(--r-sm)", width: "100%" }}>
              <span className="mono" style={{ fontSize: 11, color: t >= e.t ? "var(--cyan)" : "var(--t4)", width: 38, flex: "none" }}>{e.t}s</span>
              <Icon name={t >= e.t ? "checkCircle" : "dot"} size={14} style={{ color: t >= e.t ? "var(--success)" : "var(--t4)", flex: "none" }} fill={t < e.t} />
              <span style={{ fontSize: 13, color: i === curIdx ? "var(--t1)" : "var(--t2)", fontWeight: i === curIdx ? 600 : 400 }}>{e.label}</span>
              <Badge tone="muted">{REPLAY_PHASES[e.phase]}</Badge>
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}

Object.assign(window, { LLMOpsView, ImprovementView, ReplayView, LineChart, ChartCard });
