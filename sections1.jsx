/* ============================================================
   RecallOps Command — Sections (part 1)
   RecallIntakeCard · FivetranSyncStrip · ReasoningTrace · MetricTile
   ============================================================ */

/* ---------------- Recall intake card ---------------- */
function RecallIntakeCard({ onTrigger, started }) {
  const r = window.RO.recall;
  return (
    <div className="panel" style={{ padding: 20, display: "flex", flexDirection: "column", gap: 16 }}>
      <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", gap: 14, flexWrap: "wrap" }}>
        <div style={{ minWidth: 0 }}>
          <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 9, flexWrap: "wrap" }}>
            <ClassBadge classification={r.classification} size="lg" />
            <span style={{ display: "inline-flex", alignItems: "center", gap: 6, fontSize: 11, fontFamily: "var(--f-mono)", color: "var(--t3)" }}>
              <Icon name="external" size={12} /> Source: openFDA
            </span>
          </div>
          <h3 style={{ margin: 0, fontSize: 19, fontWeight: 600, fontFamily: "var(--f-display)", letterSpacing: "-.01em", color: "var(--t1)", lineHeight: 1.2 }}>{r.productDescription}</h3>
          <div className="mono" style={{ fontSize: 11.5, color: "var(--cyan)", marginTop: 6 }}>{r.recallId} · {r.recallingFirm}</div>
        </div>
        <div style={{ flex: "none" }}>
          {!started
            ? <Button variant="primary" size="lg" icon="zap" onClick={onTrigger}>Trigger Containment</Button>
            : <Badge tone="success"><Icon name="check" size={11} /> Containment running</Badge>}
        </div>
      </div>

      <div style={{ height: 1, background: "var(--border)" }} />

      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))", gap: 14 }}>
        <IntakeField label="Reason" value={r.reason} />
        <IntakeField label="Distribution pattern" value={r.distributionPattern} />
      </div>

      <div style={{ display: "flex", flexWrap: "wrap", gap: 20 }}>
        <IntakeMeta label="Event date" value={r.eventDate} mono />
        <IntakeMeta label="Recalling firm" value={r.recallingFirm} />
        <IntakeMeta label="Matched SKUs" value={r.skuMatches.length + " internal"} mono />
      </div>

      <div style={{ display: "flex", flexWrap: "wrap", gap: 16 }}>
        <ChipRow label="Lot codes" items={r.lotCodes} tone="class1" />
        <ChipRow label="UPCs" items={r.upcs} tone="muted" />
      </div>
    </div>
  );
}
function IntakeField({ label, value }) {
  return (<div><div className="label" style={{ marginBottom: 5 }}>{label}</div><p style={{ margin: 0, fontSize: 13, color: "var(--t2)", lineHeight: 1.5 }}>{value}</p></div>);
}
function IntakeMeta({ label, value, mono }) {
  return (<div><div className="label" style={{ marginBottom: 4 }}>{label}</div><div className={mono ? "mono" : ""} style={{ fontSize: 13, color: "var(--t1)", fontWeight: 500 }}>{value}</div></div>);
}
function ChipRow({ label, items, tone }) {
  return (
    <div>
      <div className="label" style={{ marginBottom: 6 }}>{label}</div>
      <div style={{ display: "flex", gap: 7, flexWrap: "wrap" }}>
        {items.map((it, i) => (
          <span key={i} className="mono" style={{ fontSize: 11.5, padding: "3px 9px", borderRadius: "var(--r-xs)", color: tone === "class1" ? "var(--class-1)" : "var(--t2)",
            background: tone === "class1" ? "var(--class-1-dim)" : "var(--panel-3)", border: "1px solid " + (tone === "class1" ? "rgba(239,68,68,.3)" : "var(--border-2)") }}>{it}</span>
        ))}
      </div>
    </div>
  );
}

/* ---------------- Fivetran sync strip ---------------- */
function FivetranSyncStrip() {
  const { sync, analyzeOn, phase } = useRO();
  const runs = window.RO.syncRuns;
  const done = runs.every(r => sync[r.id] === "success");
  const active = runs.some(r => sync[r.id] === "syncing");
  const total = runs.length;
  const completed = runs.filter(r => sync[r.id] === "success").length;
  return (
    <div className="panel" style={{ padding: 20 }}>
      <SectionTitle icon="refresh" title="Fivetran-synced operational data"
        sub="Partner MCP triggers connector syncs into the BigQuery operational warehouse."
        right={
          <span style={{ display: "inline-flex", alignItems: "center", gap: 8, fontSize: 11.5, fontFamily: "var(--f-mono)", color: done ? "var(--success)" : active ? "var(--cyan)" : "var(--t3)" }}>
            <StatusDot tone={done ? "success" : active ? "cyan" : "muted"} live={active} />
            {phase === "idle" ? "8 sources idle" : done ? "8 sources synced" : "SYNCING " + completed + "/" + total + " SOURCES…"}
          </span>
        } />
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(250px, 1fr))", gap: 10 }}>
        {runs.map(r => {
          const st = sync[r.id];
          const pct = st === "success" ? 100 : st === "syncing" ? 66 : 0;
          const c = st === "success" ? "var(--success)" : st === "syncing" ? "var(--cyan)" : "var(--t4)";
          return (
            <div key={r.id} style={{ padding: "12px 13px", background: "var(--panel-2)", border: "1px solid var(--border)", borderRadius: "var(--r-sm)" }}>
              <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: 8, marginBottom: 8 }}>
                <div style={{ minWidth: 0 }}>
                  <div style={{ fontSize: 12.5, fontWeight: 600, color: "var(--t1)", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>{r.source}</div>
                  <div className="mono" style={{ fontSize: 10, color: "var(--t3)", marginTop: 2 }}>{r.connector}</div>
                </div>
                <span style={{ display: "inline-flex", color: c, flex: "none" }}>
                  {st === "success" ? <Icon name="check" size={15} /> : st === "syncing" ? <span className="spin" style={{ display: "flex" }}><Icon name="refresh" size={13} /></span> : <Icon name="dot" size={13} fill />}
                </span>
              </div>
              <div style={{ height: 4, background: "var(--bg-2)", borderRadius: 999, overflow: "hidden" }}>
                <div style={{ width: pct + "%", height: "100%", background: st === "success" ? "var(--success)" : "var(--accent-grad)", borderRadius: 999, transition: "width .5s cubic-bezier(.22,.61,.36,1)" }} />
              </div>
              <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginTop: 7 }}>
                <span className="mono" style={{ fontSize: 10, color: "var(--t3)" }}>{st === "pending" ? "queued" : r.recordsSynced.toLocaleString() + " rows"}</span>
                <span className="mono" style={{ fontSize: 10, color: "var(--t4)", display: "inline-flex", alignItems: "center", gap: 4 }}>→ <Icon name="database" size={10} /> BigQuery</span>
              </div>
            </div>
          );
        })}
      </div>
      {done && (
        <div className="rise" style={{ marginTop: 14, padding: "11px 14px", background: "var(--success-dim)", border: "1px solid rgba(16,185,129,.3)", borderRadius: "var(--r-sm)", display: "flex", alignItems: "center", gap: 10 }}>
          <Icon name="database" size={16} style={{ color: "var(--success)" }} />
          <span style={{ fontSize: 13, color: "var(--t1)" }}>BigQuery operational warehouse refreshed — <span className="mono" style={{ color: "var(--success)" }}>158,888 rows</span> across 8 sources.</span>
        </div>
      )}
    </div>
  );
}

/* ---------------- Reasoning trace (typewriter terminal) ---------------- */
function ReasoningTrace() {
  const { reasoningOn, onReasoningDone } = useRO();
  const lines = window.RO.reasoning;
  const [revealed, setRevealed] = useState([]);   // array of {text,tone,full}
  const [done, setDone] = useState(false);
  const startedRef = useRef(false);
  const interval = useRef(0);
  const firedDone = useRef(false);
  const scrollRef = useRef(null);

  useEffect(() => {
    if (!reasoningOn || startedRef.current) return;
    startedRef.current = true;
    const tone = { cyan: "var(--cyan)", dim: "var(--t2)", ok: "var(--success)", warn: "var(--warning)" };
    const MS_CHAR = 7, GAP = 120;
    // precompute cumulative timing windows so a single (possibly throttled) tick
    // can "catch up" to the correct position based on elapsed wall-clock time.
    let acc = 0;
    const windows = lines.map(l => { const start = acc; const type = l.t.length * MS_CHAR; acc += type + GAP; return { start, type }; });
    const total = acc;
    const t0 = performance.now();
    const render = () => {
      const E = performance.now() - t0;
      const out = lines.map((l, i) => {
        const w = windows[i];
        if (E < w.start) return null;
        const chars = Math.min(l.t.length, Math.floor((E - w.start) / MS_CHAR));
        return { text: l.t.slice(0, chars), tone: tone[l.tone] || "var(--t2)", full: chars >= l.t.length };
      });
      setRevealed(out);
      if (scrollRef.current) scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
      if (E >= total) {
        clearInterval(interval.current);
        setDone(true);
        if (!firedDone.current) { firedDone.current = true; setTimeout(() => onReasoningDone(), 350); }
      }
    };
    render();
    interval.current = setInterval(render, 28);
    return () => clearInterval(interval.current);
  }, [reasoningOn]);

  return (
    <div className="panel" style={{ padding: 0, overflow: "hidden", display: "flex", flexDirection: "column", height: "100%" }}>
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "11px 16px", borderBottom: "1px solid var(--border)", background: "var(--bg-2)" }}>
        <div style={{ display: "flex", alignItems: "center", gap: 9 }}>
          <Icon name="brain" size={15} style={{ color: "var(--cyan)" }} />
          <span style={{ fontSize: 13, fontWeight: 600, fontFamily: "var(--f-display)", color: "var(--t1)" }}>Gemini-generated containment plan</span>
        </div>
        <span style={{ display: "inline-flex", alignItems: "center", gap: 6, fontSize: 11, fontFamily: "var(--f-mono)", color: done ? "var(--success)" : reasoningOn ? "var(--cyan)" : "var(--t3)" }}>
          <StatusDot tone={done ? "success" : reasoningOn ? "cyan" : "muted"} live={reasoningOn && !done} /> {done ? "plan ready" : reasoningOn ? "reasoning" : "idle"}
        </span>
      </div>
      <div ref={scrollRef} className="no-sb" style={{ padding: "14px 16px", fontFamily: "var(--f-mono)", fontSize: 12.5, lineHeight: 1.85, flex: 1, overflowY: "auto", minHeight: 240 }}>
        {!reasoningOn && (
          <div style={{ color: "var(--t3)", display: "flex", alignItems: "center", gap: 8, height: "100%" }}>
            <span className="mono" style={{ color: "var(--t4)" }}>$</span> awaiting trigger — agent will narrate its reasoning here.
          </div>
        )}
        {revealed.map((l, i) => l && (
          <div key={i} style={{ display: "flex", gap: 9, color: l.tone }}>
            <span style={{ color: "var(--t4)", flex: "none" }}>&gt;</span>
            <span style={{ wordBreak: "break-word" }}>{l.text}{!l.full && <span className="caret" style={{ color: "var(--cyan)" }}>▋</span>}</span>
          </div>
        ))}
      </div>
    </div>
  );
}

/* ---------------- Metric tile ---------------- */
function MetricTile({ icon, label, value, sub, tone = "cyan", animate, decimals = 0, big, suffix = "", delay = 0 }) {
  const v = useCountUp(value, { animate, decimals, duration: 1300 });
  const c = RTONE[tone] || "var(--cyan)";
  const done = !animate || v >= value - (decimals ? 0.01 : 0.5);
  const [pinged, setPinged] = useState(false);
  useEffect(() => { if (animate && done && !pinged) setPinged(true); }, [done, animate]);
  return (
    <div className="rise panel lift" style={{ "--dur": "0.45s", animationDelay: delay + "ms", padding: big ? "18px 18px" : "15px 16px", display: "flex", flexDirection: "column", gap: 9, minWidth: 0, position: "relative", overflow: "hidden" }}>
      <div style={{ position: "absolute", inset: 0, background: "radial-gradient(120% 80% at 100% 0%, color-mix(in srgb," + c + " 9%, transparent), transparent 60%)", pointerEvents: "none", opacity: animate ? 1 : 0.4 }} />
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", position: "relative" }}>
        <span className="label" style={{ whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>{label}</span>
        <span className={pinged ? "ping" : ""} style={{ width: 27, height: 27, borderRadius: "var(--r-xs)", flex: "none", background: "color-mix(in srgb," + c + " 14%, transparent)", border: "1px solid color-mix(in srgb," + c + " 30%, transparent)", display: "grid", placeItems: "center", color: c }}><Icon name={icon} size={14} /></span>
      </div>
      <div className={"mono num-grad"} style={{ fontSize: big ? "clamp(34px, 4.6vw, 58px)" : "clamp(25px, 3.1vw, 36px)", fontWeight: 700, letterSpacing: "-.025em", lineHeight: 1, position: "relative", fontVariantNumeric: "tabular-nums" }}>
        {animate ? (decimals ? v.toFixed(decimals) : Math.round(v).toLocaleString()) : (decimals ? value.toFixed(decimals) : value.toLocaleString())}{suffix}
      </div>
      <div className="spark" style={{ position: "relative" }}><i style={{ background: "linear-gradient(90deg, " + c + ", color-mix(in srgb," + c + " 40%, transparent))", transform: "scaleX(" + (animate ? 1 : 0.08) + ")", boxShadow: animate ? "0 0 10px -1px " + c : "none" }} /></div>
      {sub && <div className="label" style={{ color: "color-mix(in srgb," + c + " 80%, var(--t3))", position: "relative" }}>{sub}</div>}
    </div>
  );
}

Object.assign(window, { RecallIntakeCard, FivetranSyncStrip, ReasoningTrace, MetricTile, IntakeField, IntakeMeta, ChipRow });
