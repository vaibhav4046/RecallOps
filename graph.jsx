/* ============================================================
   RecallOps Cortex — RecallGraph (3D operational memory graph)
   Uses global ForceGraph3D (3d-force-graph UMD, bundles three).
   Falls back gracefully if the CDN is unavailable.
   ============================================================ */

const GRAPH_TYPE_LABEL = {
  recall: "Recall", product: "Product", sku: "SKU", lot: "Lot", supplier: "Supplier",
  shipment: "Shipment", location: "Location", customer_segment: "Customer segment",
  containment_action: "Action", evidence: "Evidence", audit_event: "Audit", playbook_memory: "Memory",
  eval_case: "Eval case", improvement_proposal: "Improvement",
};

function buildGraphData() {
  // clone so force-graph can mutate link endpoints safely
  const nodes = window.RO.graph.nodes.map(n => ({ ...n }));
  const links = window.RO.graph.edges.map(e => ({ ...e }));
  return { nodes, links };
}

const GRAPH_MODES = {
  all: { label: "Full graph", icon: "graph", set: () => null },
  blast: { label: "Trace blast radius", icon: "radar", set: (n) => ["recall", "product", "sku", "lot", "location", "customer_segment"].includes(n.type) },
  context: { label: "Context pack", icon: "layers", set: (n) => ["recall", "product", "sku", "lot", "location", "shipment", "customer_segment", "evidence"].includes(n.type) },
  memory: { label: "Show memory", icon: "sparkles", set: (n) => ["recall", "playbook_memory"].includes(n.type) },
  lowconf: { label: "Low-confidence", icon: "alert", set: (n) => n.confidence < 0.78 },
  actions: { label: "Approved actions", icon: "shield", set: (n) => ["containment_action", "audit_event"].includes(n.type) },
};

function DockBtn({ icon, text, title, active, onClick }) {
  return (
    <button onClick={onClick} title={title} aria-label={title} style={{ width: 32, height: 32, borderRadius: "var(--r-sm)", display: "grid", placeItems: "center", cursor: "pointer", padding: 0,
      background: active ? "var(--cyan-dim)" : "transparent", border: "1px solid " + (active ? "var(--cyan-line)" : "transparent"),
      color: active ? "var(--cyan)" : "var(--t2)", fontFamily: "var(--f-mono)", fontSize: 16, fontWeight: 600, transition: "all .14s" }}
      onMouseEnter={e => { if (!active) e.currentTarget.style.background = "var(--panel-3)"; }}
      onMouseLeave={e => { if (!active) e.currentTarget.style.background = "transparent"; }}>
      {icon ? <Icon name={icon} size={15} /> : text}
    </button>
  );
}

function RecallGraph({ mini = false, mode = "all", onModeMeta }) {
  const wrapRef = useRef(null);
  const gRef = useRef(null);
  const modeRef = useRef(mode);
  const hoverRef = useRef(null);
  const partsRef = useRef(true);
  const { openInspector } = useRO();
  const [ready, setReady] = useState(false);
  const [err, setErr] = useState(false);
  const [spin, setSpin] = useState(true);
  const [parts, setParts] = useState(true);
  const adj = useMemo(() => {
    const m = {}; window.RO.graph.edges.forEach(e => { (m[e.source] = m[e.source] || new Set()).add(e.target); (m[e.target] = m[e.target] || new Set()).add(e.source); });
    return m;
  }, []);

  useEffect(() => { modeRef.current = mode; if (gRef.current) refreshStyle(); }, [mode]);

  const lid = (x) => typeof x === "object" ? x.id : x;
  const highlighted = (n) => { const f = (GRAPH_MODES[modeRef.current] || GRAPH_MODES.all).set; return modeRef.current === "all" ? true : !!f(n); };

  const refreshStyle = () => {
    const g = gRef.current; if (!g) return;
    const h = hoverRef.current;
    const hset = h ? new Set([h.id, ...(adj[h.id] || [])]) : null;
    g.nodeColor(n => {
      if (hset) return hset.has(n.id) ? n.color : hexA(n.color, 0.05);
      return highlighted(n) ? n.color : dim(n.color);
    });
    g.linkColor(l => {
      const s = lid(l.source), t = lid(l.target);
      if (hset) { return (s === h.id || t === h.id) ? hexA(h.color, 0.7) : "rgba(148,163,184,0.04)"; }
      const on = modeRef.current === "all" || (highlighted(getNode(s)) && highlighted(getNode(t)));
      return on ? (modeRef.current === "lowconf" && l.confidence < 0.78 ? "rgba(245,158,11,0.6)" : "rgba(148,163,184,0.32)") : "rgba(148,163,184,0.05)";
    });
    g.linkWidth(l => {
      const s = lid(l.source), t = lid(l.target);
      if (hset && (s === h.id || t === h.id)) return 1.6;
      return 0.4 + (l.weight || 1) * 0.4;
    });
    g.linkDirectionalParticles(l => {
      if (!partsRef.current) return 0;
      const s = lid(l.source), t = lid(l.target);
      if (hset) return (s === h.id || t === h.id) ? 4 : 0;
      const on = modeRef.current === "all" || (highlighted(getNode(s)) && highlighted(getNode(t)));
      return on ? 2 : 0;
    });
  };
  const nodeMap = useMemo(() => Object.fromEntries(window.RO.graph.nodes.map(n => [n.id, n])), []);
  const getNode = (id) => nodeMap[id] || { type: "" };

  function dim(hex) { return hexA(hex, 0.12); }
  function hexA(hex, a) {
    const h = hex.replace("#", ""); const r = parseInt(h.slice(0, 2), 16), g = parseInt(h.slice(2, 4), 16), b = parseInt(h.slice(4, 6), 16);
    return `rgba(${r},${g},${b},${a})`;
  }

  useEffect(() => {
    if (!window.ForceGraph3D) { setErr(true); return; }
    try { const tc = document.createElement("canvas"); if (!(tc.getContext("webgl") || tc.getContext("webgl2") || tc.getContext("experimental-webgl"))) { setErr(true); return; } } catch (e) { setErr(true); return; }
    const el = wrapRef.current; if (!el) return;
    const data = buildGraphData();
    let g;
    try {
    g = window.ForceGraph3D({ controlType: "orbit", rendererConfig: { antialias: true, alpha: true, preserveDrawingBuffer: true } })(el)
      .graphData(data)
      .backgroundColor("rgba(0,0,0,0)")
      .showNavInfo(false)
      .nodeRelSize(mini ? 2.4 : 3.2)
      .nodeVal(n => Math.min(n.val || 3, 7))
      .nodeColor(n => n.color)
      .nodeOpacity(0.92)
      .nodeResolution(12)
      .linkColor(() => "rgba(148,163,184,0.34)")
      .linkWidth(l => 0.4 + (l.weight || 1) * 0.4)
      .linkDirectionalParticles(2)
      .linkDirectionalParticleWidth(mini ? 1.4 : 2)
      .linkDirectionalParticleSpeed(0.005)
      .linkDirectionalParticleColor(() => "rgba(150,200,255,0.9)")
      .linkCurvature(mini ? 0.12 : 0.2)
      .nodeLabel(n => `<div style="font-family:Inter,sans-serif;background:#0D1320;border:1px solid #28384F;border-radius:6px;padding:7px 10px;color:#E8EEF7;font-size:12px;box-shadow:0 8px 24px rgba(0,0,0,.6)">
        <div style="font-size:9px;letter-spacing:.1em;text-transform:uppercase;color:${n.color};margin-bottom:3px">${GRAPH_TYPE_LABEL[n.type] || n.type}</div>
        <div style="font-weight:600">${n.label}</div>
        <div style="font-family:'JetBrains Mono',monospace;font-size:10px;color:#8A99B0;margin-top:3px">conf ${(n.confidence ?? 1).toFixed(2)} · ${n.source || "BigQuery"}</div></div>`)
      .width(el.clientWidth).height(el.clientHeight);
    } catch (e) { setErr(true); return; }

    if (!mini) {
      g.onNodeClick(n => {
        openInspector({
          kind: GRAPH_TYPE_LABEL[n.type] || n.type, accent: n.color, title: n.label,
          subtitle: n.id + " · " + (n.source || "BigQuery"),
          fields: [
            { k: "Node type", v: GRAPH_TYPE_LABEL[n.type] || n.type },
            { k: "Confidence", v: (n.confidence ?? 1).toFixed(2), tone: n.confidence < 0.78 ? "var(--warning)" : "var(--success)", mono: true },
            { k: "Source system", v: n.source || "BigQuery", mono: true },
            { k: "Severity", v: n.severity || "—" },
            { k: "Connections", v: window.RO.graph.edges.filter(e => e.source === n.id || e.target === n.id).length + " edges", mono: true },
          ],
          json: { id: n.id, type: n.type, label: n.label, confidence: n.confidence, source: n.source, severity: n.severity },
        });
        const dist = 90; const r = 1 + dist / Math.hypot(n.x || 1, n.y || 1, n.z || 1);
        g.cameraPosition({ x: (n.x || 0) * r, y: (n.y || 0) * r, z: (n.z || 0) * r }, n, 1200);
      });
    }
    // gentle auto-rotate
    g.cooldownTicks(mini ? 90 : 240);
    g.cameraPosition({ x: 0, y: 0, z: mini ? 175 : 150 });
    g.onEngineStop(() => { try { g.zoomToFit(600, mini ? 45 : 70); } catch (e) {} refreshStyle(); });
    try {
      g.d3Force("charge").strength(mini ? -62 : -98);
      const lf = g.d3Force("link"); if (lf) lf.distance(l => l.edge_type === "similar_to" ? 82 : l.edge_type === "triggers" ? 54 : 34);
    } catch (e) {}
    if (!mini) {
      g.onNodeHover(n => { hoverRef.current = n || null; if (el) el.style.cursor = n ? "pointer" : "grab"; refreshStyle(); });
    }
    const ctr = g.controls(); if (ctr) { ctr.autoRotate = true; ctr.autoRotateSpeed = mini ? 0.8 : 0.4; ctr.enableZoom = !mini; ctr.enableDamping = true; ctr.dampingFactor = 0.12; }
    gRef.current = g;
    window.__g = g;
    setReady(true);
    setTimeout(() => { refreshStyle(); }, 800);

    const onResize = () => { if (el) g.width(el.clientWidth).height(el.clientHeight); };
    const ro = new ResizeObserver(onResize); ro.observe(el);
    return () => { ro.disconnect(); try { g._destructor && g._destructor(); } catch (e) {} gRef.current = null; };
  }, []);

  const zoomFit = () => { try { gRef.current && gRef.current.zoomToFit(800, mini ? 40 : 80); } catch (e) {} };
  const zoomBy = (f) => { const g = gRef.current; if (!g) return; const c = g.camera(); c.position.multiplyScalar(f); };
  const toggleSpin = () => setSpin(s => { const ns = !s; const c = gRef.current && gRef.current.controls(); if (c) c.autoRotate = ns; return ns; });
  const toggleParts = () => setParts(p => { const np = !p; partsRef.current = np; refreshStyle(); return np; });

  if (err) {
    return (
      <div ref={wrapRef} style={{ width: "100%", height: "100%", display: "grid", placeItems: "center", color: "var(--t3)", textAlign: "center" }}>
        <div>
          <Icon name="graph" size={28} style={{ color: "var(--t4)", margin: "0 auto 10px" }} />
          <div style={{ fontSize: 13, color: "var(--t2)" }}>3D graph engine offline</div>
          <div className="mono" style={{ fontSize: 11, marginTop: 4 }}>cached graph: {window.RO.graph.nodes.length} nodes · {window.RO.graph.edges.length} edges</div>
        </div>
      </div>
    );
  }
  return (
    <div style={{ position: "relative", width: "100%", height: "100%" }}>
      <div ref={wrapRef} style={{ width: "100%", height: "100%" }} />
      {!ready && <div style={{ position: "absolute", inset: 0, display: "grid", placeItems: "center", color: "var(--t3)" }}><span className="spin" style={{ display: "inline-flex" }}><Icon name="refresh" size={20} /></span></div>}
      {!mini && ready && (
        <div style={{ position: "absolute", right: 12, bottom: 12, display: "flex", flexDirection: "column", gap: 6, background: "rgba(13,19,32,0.78)", border: "1px solid var(--border-2)", borderRadius: "var(--r-md)", padding: 6, backdropFilter: "blur(8px)" }}>
          <DockBtn icon="refresh" title="Auto-rotate" active={spin} onClick={toggleSpin} />
          <DockBtn icon="zap" title="Span particles" active={parts} onClick={toggleParts} />
          <div style={{ height: 1, background: "var(--border)", margin: "1px 4px" }} />
          <DockBtn text="+" title="Zoom in" onClick={() => zoomBy(0.8)} />
          <DockBtn text="−" title="Zoom out" onClick={() => zoomBy(1.25)} />
          <DockBtn icon="maximize" title="Fit graph" onClick={zoomFit} />
        </div>
      )}
    </div>
  );
}

/* ---------------- Graph page ---------------- */
function GraphView() {
  const [mode, setMode] = useState("all");
  const counts = window.RO.graph.nodes.reduce((a, n) => { a[n.type] = (a[n.type] || 0) + 1; return a; }, {});
  const legend = Object.entries(window.RO.graph.colors);
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 16, height: "calc(100vh - var(--topbar-h) - 64px)" }}>
      <PageHeader eyebrow="Operational memory · 3D" title="RecallGraph" icon="graph"
        sub="Every entity in the incident — recall, SKUs, lots, locations, shipments, customers, actions, evidence, memory — as one queryable graph."
        right={<Badge tone="cyan">{window.RO.graph.nodes.length} nodes · {window.RO.graph.edges.length} edges</Badge>} />

      <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
        {Object.entries(GRAPH_MODES).map(([k, m]) => (
          <button key={k} onClick={() => setMode(k)} style={{
            display: "inline-flex", alignItems: "center", gap: 7, padding: "8px 13px", fontSize: 12.5, fontWeight: 600, cursor: "pointer", fontFamily: "var(--f-sans)",
            background: mode === k ? "var(--panel-3)" : "var(--panel)", border: "1px solid " + (mode === k ? "var(--cyan-line)" : "var(--border-2)"),
            borderRadius: "var(--r-sm)", color: mode === k ? "var(--t1)" : "var(--t2)",
          }}>
            <Icon name={m.icon} size={14} style={{ color: mode === k ? "var(--cyan)" : "var(--t3)" }} /> {m.label}
          </button>
        ))}
      </div>

      <div className="panel" style={{ flex: 1, minHeight: 420, position: "relative", overfl: "hidden", overflow: "hidden", padding: 0 }}>
        <RecallGraph mode={mode} />
        {/* legend overlay */}
        <div className="no-sb" style={{ position: "absolute", left: 12, top: 12, display: "flex", flexDirection: "column", gap: 5, background: "rgba(13,19,32,0.74)", border: "1px solid var(--border)", borderRadius: "var(--r-sm)", padding: "10px 12px", backdropFilter: "blur(8px)", maxHeight: "70%", overflowY: "auto" }}>
          <div className="label" style={{ marginBottom: 3 }}>Node types</div>
          {legend.map(([t, c]) => (
            <span key={t} style={{ display: "inline-flex", alignItems: "center", gap: 7, fontSize: 10.5, fontFamily: "var(--f-mono)", color: "var(--t2)" }}>
              <span style={{ width: 8, height: 8, borderRadius: "50%", background: c, flex: "none" }} /> {GRAPH_TYPE_LABEL[t]} <span style={{ color: "var(--t4)" }}>{counts[t] || 0}</span>
            </span>
          ))}
        </div>
        <div style={{ position: "absolute", right: 12, top: 12, fontSize: 10.5, fontFamily: "var(--f-mono)", color: "var(--t3)", background: "rgba(13,19,32,0.74)", border: "1px solid var(--border)", borderRadius: "var(--r-sm)", padding: "6px 10px", backdropFilter: "blur(8px)" }}>
          click a node → inspector · drag to orbit
        </div>
      </div>
    </div>
  );
}

window.RecallGraph = RecallGraph;
window.GraphView = GraphView;
window.GRAPH_TYPE_LABEL = GRAPH_TYPE_LABEL;
