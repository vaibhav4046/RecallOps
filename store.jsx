/* ============================================================
   RecallOps Command — Shell + global containment store
   ============================================================ */
const ROContext = React.createContext(null);
const useRO = () => React.useContext(ROContext);

/* ---- Tweakable feel: presets applied to CSS vars + body data-attrs ---- */
const TWEAK_DEFAULTS = /*EDITMODE-BEGIN*/{
  "signal": "cyan",
  "atmosphere": "balanced",
  "density": "comfortable"
}/*EDITMODE-END*/;
function applyTweaks(t) {
  const root = document.documentElement;
  const P = {
    cyan:    { c: "#06B6D4", b: "#3B82F6", g: "rgba(6,182,212",  d: "rgba(6,182,212,0.14)",  l: "rgba(6,182,212,0.34)" },
    amber:   { c: "#F5A524", b: "#F97316", g: "rgba(245,165,36", d: "rgba(245,165,36,0.15)", l: "rgba(245,165,36,0.36)" },
    emerald: { c: "#10B981", b: "#06B6D4", g: "rgba(16,185,129", d: "rgba(16,185,129,0.14)", l: "rgba(16,185,129,0.34)" },
  }[t.signal];
  if (P) {
    root.style.setProperty("--cyan", P.c);
    root.style.setProperty("--blue", P.b);
    root.style.setProperty("--accent-grad", "linear-gradient(135deg, " + P.c + ", " + P.b + ")");
    root.style.setProperty("--cyan-dim", P.d);
    root.style.setProperty("--cyan-line", P.l);
    root.style.setProperty("--glow-cyan", "0 0 0 1px " + P.l + ", 0 0 30px -6px " + P.g + ",0.45)");
  }
  document.body.dataset.atmo = t.atmosphere || "balanced";
  document.body.dataset.density = t.density || "comfortable";
}

/* ---------------- Logo ---------------- */
function Logo({ size = 28, showWord = true }) {
  return (
    <div style={{ display: "flex", alignItems: "center", gap: 11 }}>
      <svg width={size} height={size} viewBox="0 0 40 40" fill="none" style={{ flex: "none", filter: "drop-shadow(0 3px 6px rgba(6,182,212,0.28))" }}>
        <defs>
          <linearGradient id="ro-metalL" x1="4" y1="3" x2="34" y2="37" gradientUnits="userSpaceOnUse">
            <stop offset="0" stopColor="#A6DDF3" /><stop offset="0.5" stopColor="#3B82F6" /><stop offset="1" stopColor="#0C2A4A" />
          </linearGradient>
          <linearGradient id="ro-metalD" x1="20" y1="12" x2="26" y2="28" gradientUnits="userSpaceOnUse">
            <stop offset="0" stopColor="#1B2940" /><stop offset="1" stopColor="#080C14" />
          </linearGradient>
          <linearGradient id="ro-ring" x1="6" y1="4" x2="34" y2="37" gradientUnits="userSpaceOnUse">
            <stop offset="0" stopColor="#8FCDEC" /><stop offset="1" stopColor="#2A63C8" />
          </linearGradient>
          <linearGradient id="ro-arrow" x1="20" y1="13" x2="20" y2="27" gradientUnits="userSpaceOnUse">
            <stop offset="0" stopColor="#CFF3FF" /><stop offset="1" stopColor="#06B6D4" />
          </linearGradient>
        </defs>
        {/* echo shields */}
        <path d="M20 3 L34 8 V20 C34 29 28 34 20 37 C12 34 6 29 6 20 V8 Z" stroke="url(#ro-ring)" strokeWidth="1.5" opacity="0.42" />
        <path d="M20 8 L29 11.5 V20 C29 26 25 29.5 20 32 C15 29.5 11 26 11 20 V11.5 Z" stroke="url(#ro-ring)" strokeWidth="1.4" opacity="0.72" />
        {/* core shield — split metal */}
        <path d="M20 12.5 L20 28 C16.5 26.5 14 24 14 20.5 V15 Z" fill="url(#ro-metalL)" />
        <path d="M20 12.5 L26 15 V20.5 C26 24 23.5 26.5 20 28 Z" fill="url(#ro-metalD)" />
        <path d="M20 12.5 L26 15 V20.5 C26 24 23.5 26.5 20 28 C16.5 26.5 14 24 14 20.5 V15 Z" stroke="url(#ro-ring)" strokeWidth="1.1" />
        {/* upward arrow + gem */}
        <path d="M20 26.5 V19.5" stroke="url(#ro-arrow)" strokeWidth="1.8" strokeLinecap="round" />
        <path d="M16.4 21.4 L20 17 L23.6 21.4" stroke="url(#ro-arrow)" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
        <path d="M20 13 L22 15.6 L20 18.2 L18 15.6 Z" fill="#BFefff" stroke="#06B6D4" strokeWidth="0.6" />
      </svg>
      {showWord && (
        <div style={{ lineHeight: 1.05 }}>
          <div style={{ fontFamily: "var(--f-display)", fontWeight: 600, fontSize: 15.5, letterSpacing: "-.01em", color: "var(--t1)" }}>RecallOps</div>
          <div className="mono" style={{ fontSize: 9, letterSpacing: ".22em", color: "var(--cyan)", marginTop: 2 }}>CORTEX</div>
        </div>
      )}
    </div>
  );
}

/* ============================================================
   Containment store (state machine)
   ============================================================ */
function useContainmentStore() {
  const initSync = () => Object.fromEntries(window.RO.syncRuns.map(s => [s.id, "pending"]));
  const initActions = () => Object.fromEntries(window.RO.actions.map(a => [a.id, { approvalState: "pending", status: "drafted" }]));
  const [phase, setPhase] = useState("idle");          // idle|syncing|reasoning|review|contained
  const [sync, setSync] = useState(initSync);
  const [reasoningOn, setReasoningOn] = useState(false);
  const [analyzeOn, setAnalyzeOn] = useState(false);
  const [actionsOn, setActionsOn] = useState(false);
  const [actionState, setActionState] = useState(initActions);
  const [running, setRunning] = useState(false);
  const [busy, setBusy] = useState(false);             // agent orb speed
  const timers = useRef([]);
  const clear = () => { timers.current.forEach(clearTimeout); timers.current = []; };
  const at = (ms, fn) => timers.current.push(setTimeout(fn, ms));

  const reset = useCallback(() => {
    clear(); window.RO_ACTIVE = false;
    setPhase("idle"); setSync(initSync()); setReasoningOn(false); setAnalyzeOn(false);
    setActionsOn(false); setActionState(initActions()); setRunning(false); setBusy(false);
  }, []);

  const triggerContainment = useCallback(() => {
    clear();
    window.RO_ACTIVE = true;
    if (window.ROAPI) { window.ROAPI.triggerFivetranSync().then(() => window.ROAPI.runAgent()).catch(() => {}); }
    setPhase("syncing"); setRunning(true); setBusy(true);
    setSync(initSync()); setReasoningOn(false); setAnalyzeOn(false); setActionsOn(false);
    setActionState(initActions());
    const runs = window.RO.syncRuns;
    let t = 350;
    runs.forEach((r, i) => {
      at(t, () => setSync(s => ({ ...s, [r.id]: "syncing" })));
      t += 360;
      at(t, () => setSync(s => ({ ...s, [r.id]: "success" })));
      t += 130;
    });
    // sync complete → analyze + reason
    at(t + 250, () => { setPhase("reasoning"); setAnalyzeOn(true); setReasoningOn(true); });
    // The workflow must advance even when the reasoning trace is not mounted on the current route.
    at(t + 5200, () => {
      setActionsOn(true);
      setPhase(p => p === "contained" ? p : "review");
      setRunning(false);
      setBusy(false);
    });
  }, []);

  // called by ReasoningTrace when typing completes
  const onReasoningDone = useCallback(() => {
    setActionsOn(true); setPhase(p => p === "contained" ? p : "review"); setRunning(false); setBusy(false);
  }, []);

  // Optimistic update for snappy UX, then reconcile with the backend. If the
  // call fell back (server unreachable/errored), flag the action as NOT recorded
  // so the UI never claims an unlogged approval was "audit-logged".
  const approveAction = useCallback((id) => {
    setActionState(prev => ({ ...prev, [id]: { approvalState: "approved", status: "executed", executedAt: new Date().toISOString(), recorded: true } }));
    const unrec = () => setActionState(prev => prev[id] ? { ...prev, [id]: { ...prev[id], recorded: false } } : prev);
    if (window.ROAPI) window.ROAPI.approveAction(id).then(r => { if (r && r._fallback) unrec(); }).catch(unrec);
  }, []);
  const rejectAction = useCallback((id) => {
    setActionState(prev => ({ ...prev, [id]: { approvalState: "rejected", status: "drafted", recorded: true } }));
    const unrec = () => setActionState(prev => prev[id] ? { ...prev, [id]: { ...prev[id], recorded: false } } : prev);
    if (window.ROAPI) window.ROAPI.rejectAction(id).then(r => { if (r && r._fallback) unrec(); }).catch(unrec);
  }, []);

  useEffect(() => {
    if (!actionsOn || phase === "contained") return;
    const allApproved = window.RO.actions.every(a => actionState[a.id]?.approvalState === "approved");
    if (allApproved) {
      setPhase("contained");
      setRunning(false);
      setBusy(false);
      window.RO_ACTIVE = false;
    }
  }, [actionsOn, actionState, phase]);

  useEffect(() => () => clear(), []);

  const approvedCount = window.RO.actions.filter(a => actionState[a.id]?.approvalState === "approved").length;
  const allActionsApproved = actionsOn && approvedCount === window.RO.actions.length;
  const effectivePhase = allActionsApproved ? "contained" : phase;

  return {
    phase: effectivePhase, sync, reasoningOn, analyzeOn, actionsOn, actionState, running: allActionsApproved ? false : running, busy: allActionsApproved ? false : busy,
    approvedCount, contained: effectivePhase === "contained",
    triggerContainment, onReasoningDone, approveAction, rejectAction, reset, setBusy,
  };
}

/* ---------------- Agent orb ---------------- */
function AgentOrb({ busy }) {
  return (
    <div title={busy ? "Agent reasoning" : "Agent ready"} style={{ position: "relative", width: 22, height: 22, display: "grid", placeItems: "center", flex: "none" }}>
      <span style={{ position: "absolute", inset: 0, borderRadius: "50%", background: "var(--accent-grad)", filter: "blur(5px)", opacity: 0.6,
        animation: "ro-orb " + (busy ? "0.7s" : "2.4s") + " ease-in-out infinite" }} />
      <span style={{ position: "relative", width: 11, height: 11, borderRadius: "50%", background: "var(--accent-grad)",
        animation: "ro-orb " + (busy ? "0.7s" : "2.4s") + " ease-in-out infinite" }} />
    </div>
  );
}

/* ---------------- Live clock ---------------- */
function LiveClock() {
  const [now, setNow] = useState(new Date());
  useEffect(() => { const i = setInterval(() => setNow(new Date()), 1000); return () => clearInterval(i); }, []);
  const z = (n) => String(n).padStart(2, "0");
  return (
    <span className="mono" style={{ fontSize: 12, color: "var(--t1)", letterSpacing: ".04em", fontVariantNumeric: "tabular-nums" }}>
      {z(now.getUTCHours())}:{z(now.getUTCMinutes())}:{z(now.getUTCSeconds())} <span style={{ color: "var(--t3)" }}>UTC</span>
    </span>
  );
}

/* ---------------- Nav rail ---------------- */
function NavRail({ open, onClose }) {
  const { route, navigate, phase } = useRO();
  const routes = window.RO.routes;
  return (
    <>
      {open && <div onClick={onClose} className="ro-rail-scrim" style={{ position: "fixed", inset: 0, zIndex: 70, background: "rgba(3,6,12,0.6)", backdropFilter: "blur(2px)" }} />}
      <aside className={"ro-rail" + (open ? " ro-rail-open" : "")} style={{
        width: "var(--rail-w)", flex: "none", borderRight: "1px solid var(--border)", background: "var(--bg-2)",
        display: "flex", flexDirection: "column", position: "sticky", top: 0, height: "100vh", zIndex: 75,
      }}>
        <div style={{ height: "var(--topbar-h)", display: "flex", alignItems: "center", padding: "0 16px", borderBottom: "1px solid var(--border)" }}>
          <button onClick={() => { navigate("cortex"); onClose && onClose(); }} style={{ background: "none", border: "none", padding: 0, cursor: "pointer" }} aria-label="RecallOps Cortex home"><Logo /></button>
        </div>
        <nav style={{ padding: "12px 10px", display: "flex", flexDirection: "column", gap: 3, flex: 1, overflowY: "auto" }} className="no-sb">
          <div className="ro-rail-label label" style={{ padding: "6px 10px 4px" }}>Operations</div>
          {routes.map(r => {
            const active = route === r.id;
            return (
              <button key={r.id} onClick={() => { navigate(r.id); onClose && onClose(); }} title={r.label} style={{
                display: "flex", alignItems: "center", gap: 11, padding: "9px 11px", borderRadius: "var(--r-sm)",
                background: active ? "var(--panel-3)" : "transparent",
                border: "1px solid " + (active ? "var(--border-2)" : "transparent"),
                color: active ? "var(--t1)" : "var(--t2)", cursor: "pointer", textAlign: "left", width: "100%",
                fontFamily: "var(--f-sans)", fontSize: 13.5, fontWeight: active ? 600 : 500, transition: "all .14s", position: "relative",
              }}
              onMouseEnter={e => { if (!active) e.currentTarget.style.background = "var(--panel)"; }}
              onMouseLeave={e => { if (!active) e.currentTarget.style.background = "transparent"; }}>
                {active && <span style={{ position: "absolute", left: -10, top: 8, bottom: 8, width: 3, borderRadius: 999, background: "var(--accent-grad)" }} />}
                <span style={{ color: active ? "var(--cyan)" : "var(--t3)", display: "flex" }}><Icon name={r.icon} size={17} /></span>
                <span className="ro-rail-text">{r.label}</span>
              </button>
            );
          })}
        </nav>
        <div className="ro-rail-foot" style={{ padding: 12, borderTop: "1px solid var(--border)" }}>
          <div style={{ padding: "10px 11px", background: "var(--panel)", border: "1px solid var(--border)", borderRadius: "var(--r-sm)" }}>
            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: 8 }}>
              <span className="label">Active recall</span>
              <StatusDot tone={phase === "contained" ? "success" : "danger"} live={phase !== "idle" && phase !== "contained"} />
            </div>
            <div className="mono" style={{ fontSize: 12, color: "var(--t1)", marginTop: 6 }}>{window.RO.recall.recallId}</div>
            <div style={{ marginTop: 7 }}><ClassBadge classification={window.RO.recall.classification} /></div>
          </div>
        </div>
      </aside>
    </>
  );
}

/* ---------------- Top status bar ---------------- */
function TopStatusBar({ onMenu }) {
  const { busy, phase, statusChips, judgeMode, openPalette } = useRO();
  const sysContained = phase === "contained";
  const sysActive = phase !== "idle" && !sysContained;
  return (
    <header className="ro-topbar" style={{
      height: "var(--topbar-h)", flex: "none", borderBottom: "1px solid var(--border)", background: "rgba(10,14,22,0.72)",
      backdropFilter: "blur(14px)", display: "flex", alignItems: "center", gap: 14, padding: "0 16px", position: "sticky", top: 0, zIndex: 60,
    }}>
      <button className="ro-menu-btn" onClick={onMenu} aria-label="Menu" style={{
        width: 34, height: 34, display: "none", placeItems: "center", flex: "none",
        background: "var(--panel-3)", border: "1px solid var(--border-2)", borderRadius: "var(--r-sm)", color: "var(--t1)", cursor: "pointer",
      }}><Icon name="menu" size={18} /></button>

      <div style={{ display: "flex", alignItems: "center", gap: 9 }}>
        <StatusDot tone={sysContained ? "success" : sysActive ? "success" : "muted"} live={sysActive} />
        <span className="mono" style={{ fontSize: 11.5, letterSpacing: ".08em", color: sysContained || sysActive ? "var(--success)" : "var(--t3)", fontWeight: 600 }}>
          SYSTEM: {sysContained ? "CONTAINED" : sysActive ? "ACTIVE" : "STANDBY"}
        </span>
      </div>
      <span className="ro-topbar-recall mono" style={{ fontSize: 11.5, color: "var(--t3)" }}>· {window.RO.recall.recallId}</span>

      <div style={{ flex: 1 }} />

      <div className="ro-topbar-chips" style={{ display: "flex", alignItems: "center", gap: 7 }}>
        {statusChips.map(c => (
          <div key={c.label} style={{ display: "inline-flex", alignItems: "center", gap: 6, padding: "4px 9px", borderRadius: "var(--r-pill)", background: "var(--panel)", border: "1px solid var(--border)", fontSize: 11, fontFamily: "var(--f-mono)", whiteSpace: "nowrap" }}>
            <StatusDot tone={c.tone} live={c.tone !== "muted"} size={6} />
            <span style={{ color: "var(--t2)" }}>{c.label}</span>
          </div>
        ))}
      </div>
      <button onClick={openPalette} aria-label="Command palette" className="ro-kbtn" style={{ display: "inline-flex", alignItems: "center", gap: 6, padding: "5px 9px", borderRadius: "var(--r-sm)", background: "var(--panel)", border: "1px solid var(--border-2)", color: "var(--t3)", cursor: "pointer", fontFamily: "var(--f-mono)", fontSize: 11 }}>
        <Icon name="search" size={13} /> <kbd style={{ fontFamily: "var(--f-mono)" }}>⌘K</kbd>
      </button>
      <button onClick={judgeMode} title="Judge Mode — cinematic 90s run" style={{ display: "inline-flex", alignItems: "center", gap: 6, padding: "6px 12px", borderRadius: "var(--r-sm)", background: "var(--accent-grad)", border: "1px solid rgba(6,182,212,.5)", color: "#04121d", cursor: "pointer", fontFamily: "var(--f-sans)", fontWeight: 700, fontSize: 12.5, whiteSpace: "nowrap" }}>
        <Icon name="gavel" size={14} /> <span className="ro-judge-text">Judge Mode</span>
      </button>
      <div style={{ width: 1, height: 22, background: "var(--border-2)" }} className="ro-topbar-div" />
      <LiveClock />
      <AgentOrb busy={busy} />
    </header>
  );
}

/* ---------------- Command palette (⌘K) ---------------- */
function CommandPalette({ open, onClose, navigate, judge }) {
  const [q, setQ] = useState("");
  const [idx, setIdx] = useState(0);
  const inputRef = useRef(null);
  useEffect(() => { if (open) { setQ(""); setIdx(0); setTimeout(() => inputRef.current && inputRef.current.focus(), 30); } }, [open]);
  if (!open) return null;
  const items = [
    { id: "__judge", label: "Run Judge Mode", icon: "play", kind: "Action", run: () => { onClose(); judge(); } },
    ...window.RO.routes.map(r => ({ id: r.id, label: r.label, icon: r.icon, kind: "Navigate", run: () => { onClose(); navigate(r.id); } })),
  ];
  const filtered = items.filter(it => it.label.toLowerCase().includes(q.toLowerCase()));
  const onKey = (e) => {
    if (e.key === "ArrowDown") { e.preventDefault(); setIdx(i => Math.min(filtered.length - 1, i + 1)); }
    else if (e.key === "ArrowUp") { e.preventDefault(); setIdx(i => Math.max(0, i - 1)); }
    else if (e.key === "Enter") { e.preventDefault(); filtered[idx] && filtered[idx].run(); }
  };
  return (
    <div onClick={onClose} style={{ position: "fixed", inset: 0, zIndex: 140, background: "rgba(4,7,13,0.66)", backdropFilter: "blur(5px)", display: "flex", justifyContent: "center", alignItems: "flex-start", paddingTop: "12vh" }}>
      <div onClick={e => e.stopPropagation()} className="rise" style={{ "--dur": ".22s", width: "min(560px,92%)", background: "var(--panel)", border: "1px solid var(--border-3)", borderRadius: "var(--r-md)", boxShadow: "var(--sh-2)", overflow: "hidden" }}>
        <div style={{ display: "flex", alignItems: "center", gap: 11, padding: "13px 16px", borderBottom: "1px solid var(--border)" }}>
          <Icon name="search" size={17} style={{ color: "var(--t3)" }} />
          <input ref={inputRef} value={q} onChange={e => { setQ(e.target.value); setIdx(0); }} onKeyDown={onKey} placeholder="Search routes and actions…" style={{ flex: 1, background: "none", border: "none", outline: "none", color: "var(--t1)", fontSize: 14.5, fontFamily: "var(--f-sans)" }} />
          <kbd className="mono" style={{ fontSize: 10, color: "var(--t3)", border: "1px solid var(--border-2)", borderRadius: 4, padding: "2px 6px" }}>ESC</kbd>
        </div>
        <div className="no-sb" style={{ maxHeight: 360, overflowY: "auto", padding: 7 }}>
          {filtered.map((it, i) => (
            <button key={it.id} onMouseEnter={() => setIdx(i)} onClick={it.run} style={{
              display: "flex", alignItems: "center", gap: 11, width: "100%", padding: "10px 12px", textAlign: "left", cursor: "pointer",
              background: i === idx ? "var(--panel-3)" : "transparent", border: "1px solid " + (i === idx ? "var(--border-2)" : "transparent"),
              borderRadius: "var(--r-sm)", color: "var(--t1)", fontFamily: "var(--f-sans)", fontSize: 13.5,
            }}>
              <span style={{ color: it.kind === "Action" ? "var(--cyan)" : "var(--t3)", display: "flex" }}><Icon name={it.icon} size={16} /></span>
              {it.label}
              <span className="mono" style={{ marginLeft: "auto", fontSize: 10, color: "var(--t4)" }}>{it.kind}</span>
            </button>
          ))}
          {!filtered.length && <div style={{ padding: "18px 14px", color: "var(--t3)", fontSize: 13 }}>No matches.</div>}
        </div>
      </div>
    </div>
  );
}

/* ---------------- Inspector drawer (right contextual) ---------------- */
function InspectorDrawer({ node, onClose }) {
  useEffect(() => { if (node) document.body.style.overflow = "hidden"; return () => { document.body.style.overflow = ""; }; }, [node]);
  if (!node) return null;
  const fields = node.fields || [];
  return (
    <div onClick={onClose} style={{ position: "fixed", inset: 0, zIndex: 95, background: "rgba(4,7,13,0.55)", backdropFilter: "blur(3px)" }}>
      <div onClick={e => e.stopPropagation()} style={{ position: "absolute", top: 0, right: 0, height: "100%", width: "min(440px,100%)", background: "var(--panel)", borderLeft: "1px solid var(--border-3)", boxShadow: "-30px 0 60px -30px rgba(0,0,0,.8)", display: "flex", flexDirection: "column", animation: "ro-rise .3s ease" }}>
        <div style={{ padding: "16px 20px", borderBottom: "1px solid var(--border)", display: "flex", alignItems: "flex-start", justifyContent: "space-between", gap: 12 }}>
          <div style={{ minWidth: 0 }}>
            {node.kind && <div className="label" style={{ color: node.accent || "var(--cyan)", marginBottom: 6 }}>{node.kind}</div>}
            <h3 style={{ margin: 0, fontSize: 17, fontWeight: 600, fontFamily: "var(--f-display)", color: "var(--t1)" }}>{node.title}</h3>
            {node.subtitle && <div className="mono" style={{ fontSize: 11.5, color: "var(--t3)", marginTop: 6 }}>{node.subtitle}</div>}
          </div>
          <button onClick={onClose} aria-label="Close" style={{ width: 32, height: 32, borderRadius: "var(--r-sm)", background: "var(--panel-3)", border: "1px solid var(--border-2)", color: "var(--t2)", cursor: "pointer", display: "grid", placeItems: "center", flex: "none" }}><Icon name="x" size={16} /></button>
        </div>
        <div className="no-sb" style={{ overflowY: "auto", padding: "16px 20px", display: "flex", flexDirection: "column", gap: 14 }}>
          {fields.map((f, i) => (
            <div key={i}>
              <div className="label" style={{ marginBottom: 4 }}>{f.k}</div>
              <div className={f.mono ? "mono" : ""} style={{ fontSize: f.mono ? 12 : 13, color: f.tone || "var(--t1)", lineHeight: 1.5, wordBreak: "break-word" }}>{f.v}</div>
            </div>
          ))}
          {node.json && (
            <div>
              <div className="label" style={{ marginBottom: 6 }}>Raw JSON</div>
              <pre className="mono no-sb" style={{ margin: 0, fontSize: 11, color: "var(--t2)", background: "var(--bg-2)", border: "1px solid var(--border)", borderRadius: "var(--r-sm)", padding: 12, overflowX: "auto", lineHeight: 1.6 }}>{JSON.stringify(node.json, null, 2)}</pre>
            </div>
          )}
          {node.extra}
        </div>
      </div>
    </div>
  );
}

/* ---------------- Error boundary (never blank the whole shell) ---------------- */
class ViewErrorBoundary extends React.Component {
  constructor(p) { super(p); this.state = { err: null }; }
  static getDerivedStateFromError(e) { return { err: e }; }
  componentDidCatch() {}
  render() {
    if (this.state.err) {
      return (
        <div style={{ display: "grid", placeItems: "center", padding: "60px 24px", textAlign: "center" }}>
          <div>
            <div style={{ width: 52, height: 52, borderRadius: "var(--r-md)", background: "var(--panel-3)", border: "1px solid var(--border-2)", display: "grid", placeItems: "center", color: "var(--warning)", margin: "0 auto 14px" }}>
              <Icon name="alert" size={24} />
            </div>
            <div style={{ fontSize: 15, fontWeight: 600, color: "var(--t1)", fontFamily: "var(--f-display)" }}>This view hit an error</div>
            <p style={{ margin: "8px auto 0", fontSize: 13, color: "var(--t3)", maxWidth: 380 }}>The rest of RecallOps Cortex is still running — pick another module from the rail or command palette.</p>
          </div>
        </div>
      );
    }
    return this.props.children;
  }
}

/* ---------------- App shell + router ---------------- */
function App() {
  const [route, setRoute] = useState(() => {
    const h = (location.hash || "#/").replace("#", "");
    const r = window.RO.routes.find(x => x.path === h);
    return r ? r.id : "cortex";
  });
  const [drawer, setDrawer] = useState(false);
  const store = useContainmentStore();
  const bgRef = useRef(null);
  const [briefPct, setBriefPct] = useState(0);
  const [briefing, setBriefing] = useState(false);
  const briefTimers = useRef([]);
  const [inspector, setInspector] = useState(null);
  const [palette, setPalette] = useState(false);
  const [tw, setTweak] = useTweaks(TWEAK_DEFAULTS);
  useEffect(() => { applyTweaks(tw); }, [tw]);

  const playBriefing = useCallback(() => {
    briefTimers.current.forEach(clearTimeout); briefTimers.current = [];
    if ((location.hash.replace('#','') || '/') !== '/') { location.hash = '/'; setRoute('cortex'); }
    store.reset();
    setBriefing(true); setBriefPct(0);
    const total = 15000, t0 = performance.now();
    const prog = setInterval(() => { const p = Math.min(100, (performance.now() - t0) / total * 100); setBriefPct(p); if (p >= 100) clearInterval(prog); }, 60);
    briefTimers.current.push(prog);
    const sec = (i) => { const els = document.querySelectorAll('main section'); return els[i]; };
    const to = (i, ms) => briefTimers.current.push(setTimeout(() => { const el = sec(i); if (el) window.scrollTo({ top: el.getBoundingClientRect().top + window.scrollY - 74, behavior: 'smooth' }); }, ms));
    setTimeout(() => store.triggerContainment(), 350);
    window.scrollTo({ top: 0, behavior: 'smooth' });
    to(2, 1400); to(3, 5600); to(4, 8400); to(5, 11600);
    briefTimers.current.push(setTimeout(() => { setBriefing(false); setBriefPct(0); }, 15200));
  }, [store]);

  const navigate = useCallback((id) => {
    const r = window.RO.routes.find(x => x.id === id);
    if (r) { location.hash = r.path; setRoute(id); window.scrollTo({ top: 0, behavior: "smooth" }); }
  }, []);
  useEffect(() => {
    const onHash = () => { const h = location.hash.replace("#", "") || "/"; const r = window.RO.routes.find(x => x.path === h); if (r) setRoute(r.id); };
    window.addEventListener("hashchange", onHash); return () => window.removeEventListener("hashchange", onHash);
  }, []);
  useEffect(() => { if (bgRef.current && window.startCommandBackground) window.startCommandBackground(bgRef.current); }, []);

  // command palette (⌘K) + inspector escape
  useEffect(() => {
    const onKey = (e) => {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === "k") { e.preventDefault(); setPalette(p => !p); }
      if (e.key === "Escape") { setPalette(false); setInspector(null); }
    };
    window.addEventListener("keydown", onKey); return () => window.removeEventListener("keydown", onKey);
  }, []);

  // organic scroll-reveal — only hide content that starts below the fold
  useEffect(() => {
    const targets = Array.from(document.querySelectorAll('main section'));
    const io = new IntersectionObserver((entries) => {
      entries.forEach(e => { if (e.isIntersecting) { e.target.classList.add('in'); io.unobserve(e.target); } });
    }, { threshold: 0.08, rootMargin: '0px 0px -6% 0px' });
    const vh = window.innerHeight;
    targets.forEach((el, i) => {
      if (el.getBoundingClientRect().top > vh * 0.92) {
        el.classList.add('reveal-up'); el.style.transitionDelay = (Math.min(i, 4) * 40) + 'ms'; io.observe(el);
      }
    });
    const safety = setTimeout(() => targets.forEach(el => el.classList.add('in')), 1600);
    return () => { io.disconnect(); clearTimeout(safety); };
  }, [route]);

  const ctx = { route, navigate, statusChips: window.RO.statusChips, briefing, playBriefing,
    judgeMode: playBriefing, openPalette: () => setPalette(true),
    inspector, openInspector: setInspector, closeInspector: () => setInspector(null), ...store };
  const VIEWS = {
    cortex: window.CortexView, radar: window.RadarView, fivetran: window.FivetranView,
    graph: window.GraphView, context: window.ContextView, evidence: window.EvidenceView,
    actions: window.ActionsView, llmops: window.LLMOpsView, improvement: window.ImprovementView,
    replay: window.ReplayView, compliance: window.ComplianceView, report: window.ReportView,
    architecture: window.ArchitectureView, settings: window.SettingsView,
  };
  const ViewComp = VIEWS[route];

  return (
    <ROContext.Provider value={ctx}>
      <canvas ref={bgRef} style={{ position: "fixed", inset: 0, width: "100%", height: "100%", zIndex: 0, pointerEvents: "none" }} />
      <div id="ro-aurora"><span className="a1" /><span className="a2" /></div>
      <div id="ro-grain" />
      {briefing && <div id="ro-brief-bar" style={{ width: briefPct + "%" }} />}
      <div style={{ position: "relative", zIndex: 1, display: "flex", minHeight: "100vh" }}>
        <NavRail open={drawer} onClose={() => setDrawer(false)} />
        <div style={{ flex: 1, minWidth: 0, display: "flex", flexDirection: "column" }}>
          <TopStatusBar onMenu={() => setDrawer(true)} />
          <main style={{ flex: 1, padding: "20px clamp(14px, 2.2vw, 28px) 64px", maxWidth: 1500, width: "100%", margin: "0 auto" }}>
            {ViewComp ? <ViewErrorBoundary key={route}><ViewComp /></ViewErrorBoundary> : (window.Placeholder ? <window.Placeholder key={route} routeId={route} /> : null)}
          </main>
        </div>
      </div>
      {route === "cortex" && (
        <button onClick={playBriefing} disabled={briefing} aria-label="Play auto briefing" style={{
          position: "fixed", right: 22, bottom: 22, zIndex: 120, display: "inline-flex", alignItems: "center", gap: 9,
          padding: "12px 18px", borderRadius: "var(--r-pill)", border: "1px solid rgba(6,182,212,.5)",
          background: "linear-gradient(135deg, rgba(6,182,212,.92), rgba(59,130,246,.92))", color: "#04121d",
          fontFamily: "var(--f-sans)", fontWeight: 700, fontSize: 13.5, cursor: briefing ? "default" : "pointer",
          boxShadow: "0 10px 30px -8px rgba(6,182,212,.6), 0 0 0 1px rgba(255,255,255,.06) inset", overflow: "hidden",
          opacity: briefing ? 0.85 : 1, transition: "transform .2s, box-shadow .2s",
        }}
          onMouseEnter={e => { if (!briefing) { e.currentTarget.style.transform = "translateY(-2px)"; e.currentTarget.style.boxShadow = "0 16px 40px -8px rgba(6,182,212,.75)"; } }}
          onMouseLeave={e => { e.currentTarget.style.transform = "none"; e.currentTarget.style.boxShadow = "0 10px 30px -8px rgba(6,182,212,.6), 0 0 0 1px rgba(255,255,255,.06) inset"; }}>
          <span style={{ position: "absolute", top: 0, bottom: 0, width: 40, left: 0, background: "linear-gradient(90deg, transparent, rgba(255,255,255,.5), transparent)", animation: briefing ? "none" : "ro-sheen 3.4s ease-in-out infinite", pointerEvents: "none" }} />
          <Icon name={briefing ? "activity" : "play"} size={16} fill={!briefing} />
          {briefing ? "Playing briefing…" : "Play briefing"}
        </button>
      )}
      <CommandPalette open={palette} onClose={() => setPalette(false)} navigate={navigate} judge={playBriefing} />
      <InspectorDrawer node={inspector} onClose={() => setInspector(null)} />
      <TweaksPanel title="Tweaks">
        <TweakSection label="Signal palette" />
        <TweakRadio label="Agent accent" value={tw.signal} options={["cyan", "amber", "emerald"]} onChange={(v) => setTweak("signal", v)} />
        <TweakSection label="Atmosphere" />
        <TweakRadio label="Command mood" value={tw.atmosphere} options={["focus", "balanced", "cinematic"]} onChange={(v) => setTweak("atmosphere", v)} />
        <TweakSection label="Console density" />
        <TweakRadio label="Density" value={tw.density} options={["compact", "comfortable", "spacious"]} onChange={(v) => setTweak("density", v)} />
      </TweaksPanel>
    </ROContext.Provider>
  );
}

window.App = App;
window.useRO = useRO;
window.Logo = Logo;
window.AgentOrb = AgentOrb;
