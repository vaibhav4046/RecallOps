/* ============================================================
   RecallOps Command — UI primitives (lucide-style)
   ============================================================ */
const { useState, useEffect, useRef, useMemo, useCallback } = React;

const RICONS = {
  command: "M9 3H5a2 2 0 0 0-2 2v4M15 3h4a2 2 0 0 1 2 2v4M9 21H5a2 2 0 0 1-2-2v-4M15 21h4a2 2 0 0 0 2-2v-4M9 9h6v6H9z",
  inbox: "M22 12h-6l-2 3h-4l-2-3H2M5.5 5.1 2 12v6a2 2 0 0 0 2 2h16a2 2 0 0 0 2-2v-6l-3.5-6.9A2 2 0 0 0 16.8 4H7.2a2 2 0 0 0-1.7 1.1z",
  radar: "M19.07 4.93A10 10 0 1 1 12 2v10l6 3M12 12l5.66-5.66",
  shield: "M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z",
  shieldCheck: "M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10zM9 12l2 2 4-4",
  timeline: "M8 6h13M8 12h13M8 18h13M3 6h.01M3 12h.01M3 18h.01",
  file: "M14 3H6a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V9zM14 3v6h6M9 13h6M9 17h6",
  fileCheck: "M14 3H6a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V9zM14 3v6h6M9 15l2 2 4-4",
  cpu: "M16 4H8a4 4 0 0 0-4 4v8a4 4 0 0 0 4 4h8a4 4 0 0 0 4-4V8a4 4 0 0 0-4-4zM9 9h6v6H9zM9 1v3M15 1v3M9 20v3M15 20v3M20 9h3M20 14h3M1 9h3M1 14h3",
  settings: "M12 15a3 3 0 1 0 0-6 3 3 0 0 0 0 6zM19.4 15a1.6 1.6 0 0 0 .3 1.8l.1.1a2 2 0 1 1-2.8 2.8l-.1-.1a1.6 1.6 0 0 0-2.7 1.1V21a2 2 0 0 1-4 0v-.1A1.6 1.6 0 0 0 7 19.4a1.6 1.6 0 0 0-1.8.3l-.1.1a2 2 0 1 1-2.8-2.8l.1-.1a1.6 1.6 0 0 0-1.1-2.7H1a2 2 0 0 1 0-4h.1A1.6 1.6 0 0 0 2.6 7a1.6 1.6 0 0 0-.3-1.8l-.1-.1a2 2 0 1 1 2.8-2.8l.1.1a1.6 1.6 0 0 0 1.8.3H7a1.6 1.6 0 0 0 1-1.5V1a2 2 0 0 1 4 0v.1A1.6 1.6 0 0 0 17 2.6a1.6 1.6 0 0 0 1.8-.3l.1-.1a2 2 0 1 1 2.8 2.8l-.1.1a1.6 1.6 0 0 0-.3 1.8V7a1.6 1.6 0 0 0 1.5 1H23a2 2 0 0 1 0 4h-.1a1.6 1.6 0 0 0-1.5 1z",
  play: "M6 4l14 8-14 8V4z",
  check: "M20 6 9 17l-5-5",
  checkCircle: "M22 11.08V12a10 10 0 1 1-5.93-9.14M22 4 12 14.01l-3-3",
  x: "M18 6 6 18M6 6l12 12",
  alert: "M10.3 3.9 1.8 18a2 2 0 0 0 1.7 3h17a2 2 0 0 0 1.7-3L13.7 3.9a2 2 0 0 0-3.4 0zM12 9v4M12 17h.01",
  arrowRight: "M5 12h14M13 6l6 6-6 6",
  arrowUpRight: "M7 17 17 7M7 7h10v10",
  chevronRight: "M9 6l6 6-6 6",
  chevronDown: "M6 9l6 6 6-6",
  chevronLeft: "M15 6l-6 6 6 6",
  clock: "M12 22a10 10 0 1 0 0-20 10 10 0 0 0 0 20zM12 6v6l4 2",
  database: "M12 8c4.4 0 8-1.3 8-3s-3.6-3-8-3-8 1.3-8 3 3.6 3 8 3zM4 5v6c0 1.7 3.6 3 8 3s8-1.3 8-3V5M4 11v6c0 1.7 3.6 3 8 3s8-1.3 8-3v-6",
  zap: "M13 2 3 14h9l-1 8 10-12h-9l1-8z",
  refresh: "M3 12a9 9 0 0 1 15-6.7L21 8M21 3v5h-5M21 12a9 9 0 0 1-15 6.7L3 16M3 21v-5h5",
  lock: "M5 11h14a2 2 0 0 1 2 2v7a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-7a2 2 0 0 1 2-2zM8 11V7a4 4 0 0 1 8 0v4",
  pin: "M20 10c0 6-8 12-8 12s-8-6-8-12a8 8 0 0 1 16 0zM12 10a2 2 0 1 0 0-4 2 2 0 0 0 0 4z",
  package: "M16.5 9.4 7.5 4.2M21 16V8a2 2 0 0 0-1-1.7l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.7l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16zM3.3 7 12 12l8.7-5M12 22V12",
  truck: "M14 18V6a1 1 0 0 0-1-1H2a1 1 0 0 0-1 1v11a1 1 0 0 0 1 1h1M14 9h4l3 3v5a1 1 0 0 1-1 1h-1M7.5 18a2 2 0 1 0 0 .1M17.5 18a2 2 0 1 0 0 .1",
  users: "M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2M9 11a4 4 0 1 0 0-8 4 4 0 0 0 0 8zM22 21v-2a4 4 0 0 0-3-3.9M16 3.1a4 4 0 0 1 0 7.8",
  store: "M3 9 4 4h16l1 5M4 9v10a1 1 0 0 0 1 1h14a1 1 0 0 0 1-1V9M3 9h18M9 20v-5h6v5",
  building: "M6 22V4a2 2 0 0 1 2-2h8a2 2 0 0 1 2 2v18ZM9 6h.01M15 6h.01M9 10h.01M15 10h.01M9 14h.01M15 14h.01M9 22v-4h6v4",
  activity: "M22 12h-4l-3 9L9 3l-3 9H2",
  search: "M11 19a8 8 0 1 0 0-16 8 8 0 0 0 0 16zM21 21l-4.3-4.3",
  download: "M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4M7 10l5 5 5-5M12 15V3",
  copy: "M9 9h10a2 2 0 0 1 2 2v8a2 2 0 0 1-2 2h-8a2 2 0 0 1-2-2zM5 15a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h8a2 2 0 0 1 2 2",
  external: "M15 3h6v6M10 14 21 3M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6",
  sparkles: "M12 3l1.9 5.6L19.5 10l-5.6 1.4L12 17l-1.9-5.6L4.5 10l5.6-1.4zM19 15l.8 2.2L22 18l-2.2.8L19 21l-.8-2.2L16 18l2.2-.8zM5 14l.6 1.6L7 16l-1.4.4L5 18l-.6-1.6L3 16l1.4-.4z",
  brain: "M9.5 2a3 3 0 0 0-3 3 3 3 0 0 0-2 5 3 3 0 0 0 1 5.5A3 3 0 0 0 9.5 22a2.5 2.5 0 0 0 2.5-2.5v-15A2.5 2.5 0 0 0 9.5 2zM14.5 2a3 3 0 0 1 3 3 3 3 0 0 1 2 5 3 3 0 0 1-1 5.5A3 3 0 0 1 14.5 22a2.5 2.5 0 0 1-2.5-2.5",
  dot: "M12 12m-3 0a3 3 0 1 0 6 0 3 3 0 1 0-6 0",
  send: "M22 2 11 13M22 2l-7 20-4-9-9-4z",
  menu: "M3 6h18M3 12h18M3 18h18",
  layers: "M12 2 2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5",
  target: "M12 22a10 10 0 1 0 0-20 10 10 0 0 0 0 20zM12 18a6 6 0 1 0 0-12 6 6 0 0 0 0 12zM12 14a2 2 0 1 0 0-4 2 2 0 0 0 0 4z",
  flask: "M9 3h6M10 3v6.5L5 18a2 2 0 0 0 1.8 3h10.4A2 2 0 0 0 19 18l-5-8.5V3M7.5 14h9",
  link: "M10 13a5 5 0 0 0 7 0l3-3a5 5 0 0 0-7-7l-1 1M14 11a5 5 0 0 0-7 0l-3 3a5 5 0 0 0 7 7l1-1",
  route: "M6 19a3 3 0 1 0 0-6 3 3 0 0 0 0 6zM18 11a3 3 0 1 0 0-6 3 3 0 0 0 0 6zM9 16h6a3 3 0 0 0 3-3V8M6 13V8",
  bell: "M18 8a6 6 0 0 0-12 0c0 7-3 9-3 9h18s-3-2-3-9M13.7 21a2 2 0 0 1-3.4 0",
  graph: "M5 4m-2 0a2 2 0 1 0 4 0 2 2 0 1 0-4 0M19 6m-2 0a2 2 0 1 0 4 0 2 2 0 1 0-4 0M12 19m-2 0a2 2 0 1 0 4 0 2 2 0 1 0-4 0M7 4.7 17 5.7M6.4 5.8 11 17M17.4 7.7 13 17.3",
  maximize: "M8 3H5a2 2 0 0 0-2 2v3M21 8V5a2 2 0 0 0-2-2h-3M3 16v3a2 2 0 0 0 2 2h3M16 21h3a2 2 0 0 0 2-2v-3",
  sliders: "M4 21v-7M4 10V3M12 21v-9M12 8V3M20 21v-5M20 12V3M1 14h6M9 8h6M17 16h6",
  gavel: "M14 13l-8 8M6 21l-3-3M5 17l4-4M3 21h6M15 4l5 5M13 6l5 5 3-3-5-5zM9 10l5 5",
  scale: "M12 3v18M7 21h10M5 7l-3 6a3 3 0 0 0 6 0L5 7zM19 7l-3 6a3 3 0 0 0 6 0l-3-6zM5 7l7-2 7 2",
};

function Icon({ name, size = 16, stroke = 1.7, fill = false, style, className }) {
  const d = RICONS[name] || RICONS.dot;
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill={fill ? "currentColor" : "none"}
      stroke="currentColor" strokeWidth={stroke} strokeLinecap="round" strokeLinejoin="round"
      style={{ display: "block", flex: "none", ...style }} className={className} aria-hidden="true">
      {d.split("M").filter(Boolean).map((seg, i) => <path key={i} d={"M" + seg} />)}
    </svg>
  );
}

const RTONE = {
  cyan: "var(--cyan)", blue: "var(--blue)", success: "var(--success)",
  warning: "var(--warning)", danger: "var(--danger)", muted: "var(--t3)",
  class1: "var(--class-1)", class2: "var(--class-2)", class3: "var(--class-3)",
};

function Button({ children, variant = "secondary", size = "md", icon, iconRight, onClick, disabled, title, full, type = "button" }) {
  const pad = size === "sm" ? "7px 12px" : size === "lg" ? "12px 22px" : "9px 16px";
  const fs = size === "sm" ? 12.5 : size === "lg" ? 14.5 : 13.5;
  const [hov, setHov] = useState(false);
  const base = {
    display: "inline-flex", alignItems: "center", justifyContent: "center", gap: 8,
    padding: pad, fontSize: fs, fontWeight: 600, fontFamily: "var(--f-sans)",
    borderRadius: "var(--r-sm)", cursor: disabled ? "not-allowed" : "pointer",
    border: "1px solid transparent", transition: "all .16s cubic-bezier(.22,.61,.36,1)",
    whiteSpace: "nowrap", width: full ? "100%" : "auto", opacity: disabled ? 0.45 : 1, userSelect: "none",
  };
  const V = {
    primary: { background: "var(--accent-grad)", color: "#04121d", borderColor: "transparent", boxShadow: "inset 0 1px 0 rgba(255,255,255,0.38), 0 6px 18px -8px " + "color-mix(in srgb, var(--cyan) 55%, transparent)" },
    secondary: { background: "var(--panel-3)", color: "var(--t1)", borderColor: "var(--border-2)", boxShadow: "inset 0 1px 0 rgba(255,255,255,0.05)" },
    ghost: { background: "transparent", color: "var(--t2)", borderColor: "var(--border-2)" },
    danger: { background: "var(--class-1-dim)", color: "var(--class-1)", borderColor: "rgba(239,68,68,.34)" },
    success: { background: "var(--success-dim)", color: "var(--success)", borderColor: "rgba(16,185,129,.34)" },
  };
  const HV = {
    primary: { boxShadow: "var(--glow-cyan)", filter: "brightness(1.07)" },
    secondary: { background: "var(--raised)", borderColor: "var(--border-3)" },
    ghost: { background: "var(--panel-3)", color: "var(--t1)" },
    danger: { background: "rgba(239,68,68,.2)" },
    success: { background: "rgba(16,185,129,.2)" },
  };
  return (
    <button type={type} title={title} disabled={disabled} onClick={onClick}
      onMouseEnter={() => setHov(true)} onMouseLeave={() => setHov(false)}
      style={{ ...base, ...V[variant], ...(hov && !disabled ? HV[variant] : {}), transform: hov && !disabled ? "translateY(-1px)" : "none" }}>
      {icon && <Icon name={icon} size={size === "sm" ? 14 : 16} />}
      {children}
      {iconRight && <Icon name={iconRight} size={size === "sm" ? 14 : 16} />}
    </button>
  );
}

function StatusDot({ tone = "success", live = true, size = 7 }) {
  return <span className={live ? "pulse-dot" : ""} style={{ width: size, height: size, borderRadius: "50%", flex: "none", background: RTONE[tone] || tone, color: RTONE[tone] || tone, display: "inline-block" }} />;
}

function Badge({ children, tone = "muted", solid }) {
  const c = RTONE[tone] || "var(--t3)";
  return (
    <span style={{
      display: "inline-flex", alignItems: "center", gap: 5, padding: "3px 9px", borderRadius: "var(--r-pill)",
      fontSize: 10.5, fontFamily: "var(--f-mono)", letterSpacing: ".06em", textTransform: "uppercase", fontWeight: 600,
      color: solid ? "#06101c" : c, background: solid ? c : "color-mix(in srgb," + c + " 14%, transparent)",
      border: "1px solid " + (solid ? c : "color-mix(in srgb," + c + " 30%, transparent)"),
    }}>{children}</span>
  );
}

const CLASS_TONE = { "Class I": "class1", "Class II": "class2", "Class III": "class3", "Unknown": "muted" };
function ClassBadge({ classification, size = "md" }) {
  const tone = CLASS_TONE[classification] || "muted";
  const c = RTONE[tone];
  const big = size === "lg";
  return (
    <span style={{
      display: "inline-flex", alignItems: "center", gap: 7, padding: big ? "6px 13px" : "4px 10px", borderRadius: "var(--r-sm)",
      fontSize: big ? 13 : 11, fontFamily: "var(--f-display)", fontWeight: 600, letterSpacing: ".02em",
      color: c, background: "color-mix(in srgb," + c + " 14%, transparent)", border: "1px solid color-mix(in srgb," + c + " 40%, transparent)",
    }}>
      <Icon name="alert" size={big ? 15 : 12} /> {classification} Recall
    </span>
  );
}

const PRIORITY_TONE = { critical: "danger", high: "warning", medium: "class3", low: "muted" };

function useCountUp(target, { duration = 1100, decimals = 0, animate = true } = {}) {
  const [val, setVal] = useState(animate ? 0 : target);
  const ref = useRef(animate ? 0 : target);
  const raf = useRef(0);
  useEffect(() => {
    if (!animate) { ref.current = target; setVal(target); return; }
    const a = ref.current, b = target;
    if (a === b) return;
    const start = performance.now();
    const tick = (now) => {
      const p = Math.min(1, (now - start) / duration);
      const e = 1 - Math.pow(1 - p, 3);
      const v = a + (b - a) * e; ref.current = v; setVal(v);
      if (p < 1) raf.current = requestAnimationFrame(tick); else { ref.current = b; setVal(b); }
    };
    raf.current = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf.current);
  }, [target, animate, duration]);
  const f = Math.pow(10, decimals);
  return Math.round(val * f) / f;
}

function SectionTitle({ icon, title, sub, right, num, accent = "var(--cyan)" }) {
  return (
    <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", gap: 16, marginBottom: 16 }}>
      <div style={{ display: "flex", gap: 12, alignItems: "center", minWidth: 0 }}>
        {icon && (
          <div style={{ width: 32, height: 32, borderRadius: "var(--r-sm)", flex: "none", background: "var(--panel-3)", border: "1px solid var(--border-2)", display: "grid", placeItems: "center", color: accent }}>
            <Icon name={icon} size={16} />
          </div>
        )}
        <div style={{ minWidth: 0 }}>
          <div style={{ display: "flex", alignItems: "center", gap: 9 }}>
            {num && <span className="mono" style={{ fontSize: 11, color: "var(--t4)" }}>{num}</span>}
            <h2 style={{ margin: 0, fontSize: 17, fontWeight: 600, fontFamily: "var(--f-display)", letterSpacing: "-.01em", color: "var(--t1)" }}>{title}</h2>
          </div>
          {sub && <p style={{ margin: "3px 0 0", fontSize: 12.5, color: "var(--t3)", maxWidth: 620 }}>{sub}</p>}
        </div>
      </div>
      {right && <div style={{ flex: "none" }}>{right}</div>}
    </div>
  );
}

Object.assign(window, {
  Icon, RICONS, Button, StatusDot, Badge, ClassBadge, useCountUp, SectionTitle,
  RTONE, CLASS_TONE, PRIORITY_TONE, useState, useEffect, useRef, useMemo, useCallback,
});
