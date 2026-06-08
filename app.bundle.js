
/* ===== ui.jsx ===== */
const {
  useState,
  useEffect,
  useRef,
  useMemo,
  useCallback
} = React;
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
  scale: "M12 3v18M7 21h10M5 7l-3 6a3 3 0 0 0 6 0L5 7zM19 7l-3 6a3 3 0 0 0 6 0l-3-6zM5 7l7-2 7 2"
};
function Icon({
  name,
  size = 16,
  stroke = 1.7,
  fill = false,
  style,
  className
}) {
  const d = RICONS[name] || RICONS.dot;
  return React.createElement("svg", {
    width: size,
    height: size,
    viewBox: "0 0 24 24",
    fill: fill ? "currentColor" : "none",
    stroke: "currentColor",
    strokeWidth: stroke,
    strokeLinecap: "round",
    strokeLinejoin: "round",
    style: {
      display: "block",
      flex: "none",
      ...style
    },
    className: className,
    "aria-hidden": "true"
  }, d.split("M").filter(Boolean).map((seg, i) => React.createElement("path", {
    key: i,
    d: "M" + seg
  })));
}
const RTONE = {
  cyan: "var(--cyan)",
  blue: "var(--blue)",
  success: "var(--success)",
  warning: "var(--warning)",
  danger: "var(--danger)",
  muted: "var(--t3)",
  class1: "var(--class-1)",
  class2: "var(--class-2)",
  class3: "var(--class-3)"
};
function Button({
  children,
  variant = "secondary",
  size = "md",
  icon,
  iconRight,
  onClick,
  disabled,
  title,
  full,
  type = "button"
}) {
  const pad = size === "sm" ? "7px 12px" : size === "lg" ? "12px 22px" : "9px 16px";
  const fs = size === "sm" ? 12.5 : size === "lg" ? 14.5 : 13.5;
  const [hov, setHov] = useState(false);
  const base = {
    display: "inline-flex",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
    padding: pad,
    fontSize: fs,
    fontWeight: 600,
    fontFamily: "var(--f-sans)",
    borderRadius: "var(--r-sm)",
    cursor: disabled ? "not-allowed" : "pointer",
    border: "1px solid transparent",
    transition: "all .16s cubic-bezier(.22,.61,.36,1)",
    whiteSpace: "nowrap",
    width: full ? "100%" : "auto",
    opacity: disabled ? 0.45 : 1,
    userSelect: "none"
  };
  const V = {
    primary: {
      background: "var(--accent-grad)",
      color: "#04121d",
      borderColor: "transparent",
      boxShadow: "inset 0 1px 0 rgba(255,255,255,0.38), 0 6px 18px -8px " + "color-mix(in srgb, var(--cyan) 55%, transparent)"
    },
    secondary: {
      background: "var(--panel-3)",
      color: "var(--t1)",
      borderColor: "var(--border-2)",
      boxShadow: "inset 0 1px 0 rgba(255,255,255,0.05)"
    },
    ghost: {
      background: "transparent",
      color: "var(--t2)",
      borderColor: "var(--border-2)"
    },
    danger: {
      background: "var(--class-1-dim)",
      color: "var(--class-1)",
      borderColor: "rgba(239,68,68,.34)"
    },
    success: {
      background: "var(--success-dim)",
      color: "var(--success)",
      borderColor: "rgba(16,185,129,.34)"
    }
  };
  const HV = {
    primary: {
      boxShadow: "var(--glow-cyan)",
      filter: "brightness(1.07)"
    },
    secondary: {
      background: "var(--raised)",
      borderColor: "var(--border-3)"
    },
    ghost: {
      background: "var(--panel-3)",
      color: "var(--t1)"
    },
    danger: {
      background: "rgba(239,68,68,.2)"
    },
    success: {
      background: "rgba(16,185,129,.2)"
    }
  };
  return React.createElement("button", {
    type: type,
    title: title,
    disabled: disabled,
    onClick: onClick,
    onMouseEnter: () => setHov(true),
    onMouseLeave: () => setHov(false),
    style: {
      ...base,
      ...V[variant],
      ...(hov && !disabled ? HV[variant] : {}),
      transform: hov && !disabled ? "translateY(-1px)" : "none"
    }
  }, icon && React.createElement(Icon, {
    name: icon,
    size: size === "sm" ? 14 : 16
  }), children, iconRight && React.createElement(Icon, {
    name: iconRight,
    size: size === "sm" ? 14 : 16
  }));
}
function StatusDot({
  tone = "success",
  live = true,
  size = 7
}) {
  return React.createElement("span", {
    className: live ? "pulse-dot" : "",
    style: {
      width: size,
      height: size,
      borderRadius: "50%",
      flex: "none",
      background: RTONE[tone] || tone,
      color: RTONE[tone] || tone,
      display: "inline-block"
    }
  });
}
function Badge({
  children,
  tone = "muted",
  solid
}) {
  const c = RTONE[tone] || "var(--t3)";
  return React.createElement("span", {
    style: {
      display: "inline-flex",
      alignItems: "center",
      gap: 5,
      padding: "3px 9px",
      borderRadius: "var(--r-pill)",
      fontSize: 10.5,
      fontFamily: "var(--f-mono)",
      letterSpacing: ".06em",
      textTransform: "uppercase",
      fontWeight: 600,
      color: solid ? "#06101c" : c,
      background: solid ? c : "color-mix(in srgb," + c + " 14%, transparent)",
      border: "1px solid " + (solid ? c : "color-mix(in srgb," + c + " 30%, transparent)")
    }
  }, children);
}
const CLASS_TONE = {
  "Class I": "class1",
  "Class II": "class2",
  "Class III": "class3",
  "Unknown": "muted"
};
function ClassBadge({
  classification,
  size = "md"
}) {
  const tone = CLASS_TONE[classification] || "muted";
  const c = RTONE[tone];
  const big = size === "lg";
  return React.createElement("span", {
    style: {
      display: "inline-flex",
      alignItems: "center",
      gap: 7,
      padding: big ? "6px 13px" : "4px 10px",
      borderRadius: "var(--r-sm)",
      fontSize: big ? 13 : 11,
      fontFamily: "var(--f-display)",
      fontWeight: 600,
      letterSpacing: ".02em",
      color: c,
      background: "color-mix(in srgb," + c + " 14%, transparent)",
      border: "1px solid color-mix(in srgb," + c + " 40%, transparent)"
    }
  }, React.createElement(Icon, {
    name: "alert",
    size: big ? 15 : 12
  }), " ", classification, " Recall");
}
const PRIORITY_TONE = {
  critical: "danger",
  high: "warning",
  medium: "class3",
  low: "muted"
};
function useCountUp(target, {
  duration = 1100,
  decimals = 0,
  animate = true
} = {}) {
  const [val, setVal] = useState(animate ? 0 : target);
  const ref = useRef(animate ? 0 : target);
  const raf = useRef(0);
  useEffect(() => {
    if (!animate) {
      ref.current = target;
      setVal(target);
      return;
    }
    const a = ref.current,
      b = target;
    if (a === b) return;
    const start = performance.now();
    const tick = now => {
      const p = Math.min(1, (now - start) / duration);
      const e = 1 - Math.pow(1 - p, 3);
      const v = a + (b - a) * e;
      ref.current = v;
      setVal(v);
      if (p < 1) raf.current = requestAnimationFrame(tick);else {
        ref.current = b;
        setVal(b);
      }
    };
    raf.current = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf.current);
  }, [target, animate, duration]);
  const f = Math.pow(10, decimals);
  return Math.round(val * f) / f;
}
function SectionTitle({
  icon,
  title,
  sub,
  right,
  num,
  accent = "var(--cyan)"
}) {
  return React.createElement("div", {
    style: {
      display: "flex",
      alignItems: "flex-start",
      justifyContent: "space-between",
      gap: 16,
      marginBottom: 16
    }
  }, React.createElement("div", {
    style: {
      display: "flex",
      gap: 12,
      alignItems: "center",
      minWidth: 0
    }
  }, icon && React.createElement("div", {
    style: {
      width: 32,
      height: 32,
      borderRadius: "var(--r-sm)",
      flex: "none",
      background: "var(--panel-3)",
      border: "1px solid var(--border-2)",
      display: "grid",
      placeItems: "center",
      color: accent
    }
  }, React.createElement(Icon, {
    name: icon,
    size: 16
  })), React.createElement("div", {
    style: {
      minWidth: 0
    }
  }, React.createElement("div", {
    style: {
      display: "flex",
      alignItems: "center",
      gap: 9
    }
  }, num && React.createElement("span", {
    className: "mono",
    style: {
      fontSize: 11,
      color: "var(--t4)"
    }
  }, num), React.createElement("h2", {
    style: {
      margin: 0,
      fontSize: 17,
      fontWeight: 600,
      fontFamily: "var(--f-display)",
      letterSpacing: "-.01em",
      color: "var(--t1)"
    }
  }, title)), sub && React.createElement("p", {
    style: {
      margin: "3px 0 0",
      fontSize: 12.5,
      color: "var(--t3)",
      maxWidth: 620
    }
  }, sub))), right && React.createElement("div", {
    style: {
      flex: "none"
    }
  }, right));
}
Object.assign(window, {
  Icon,
  RICONS,
  Button,
  StatusDot,
  Badge,
  ClassBadge,
  useCountUp,
  SectionTitle,
  RTONE,
  CLASS_TONE,
  PRIORITY_TONE,
  useState,
  useEffect,
  useRef,
  useMemo,
  useCallback
});

/* ===== tweaks-panel.jsx ===== */
const __TWEAKS_STYLE = `
  .twk-panel{position:fixed;right:16px;bottom:16px;z-index:2147483646;width:280px;
    max-height:calc(100vh - 32px);display:flex;flex-direction:column;
    transform:scale(var(--dc-inv-zoom,1));transform-origin:bottom right;
    background:rgba(250,249,247,.78);color:#29261b;
    -webkit-backdrop-filter:blur(24px) saturate(160%);backdrop-filter:blur(24px) saturate(160%);
    border:.5px solid rgba(255,255,255,.6);border-radius:14px;
    box-shadow:0 1px 0 rgba(255,255,255,.5) inset,0 12px 40px rgba(0,0,0,.18);
    font:11.5px/1.4 ui-sans-serif,system-ui,-apple-system,sans-serif;overflow:hidden}
  .twk-hd{display:flex;align-items:center;justify-content:space-between;
    padding:10px 8px 10px 14px;cursor:move;user-select:none}
  .twk-hd b{font-size:12px;font-weight:600;letter-spacing:.01em}
  .twk-x{appearance:none;border:0;background:transparent;color:rgba(41,38,27,.55);
    width:22px;height:22px;border-radius:6px;cursor:default;font-size:13px;line-height:1}
  .twk-x:hover{background:rgba(0,0,0,.06);color:#29261b}
  .twk-body{padding:2px 14px 14px;display:flex;flex-direction:column;gap:10px;
    overflow-y:auto;overflow-x:hidden;min-height:0;
    scrollbar-width:thin;scrollbar-color:rgba(0,0,0,.15) transparent}
  .twk-body::-webkit-scrollbar{width:8px}
  .twk-body::-webkit-scrollbar-track{background:transparent;margin:2px}
  .twk-body::-webkit-scrollbar-thumb{background:rgba(0,0,0,.15);border-radius:4px;
    border:2px solid transparent;background-clip:content-box}
  .twk-body::-webkit-scrollbar-thumb:hover{background:rgba(0,0,0,.25);
    border:2px solid transparent;background-clip:content-box}
  .twk-row{display:flex;flex-direction:column;gap:5px}
  .twk-row-h{flex-direction:row;align-items:center;justify-content:space-between;gap:10px}
  .twk-lbl{display:flex;justify-content:space-between;align-items:baseline;
    color:rgba(41,38,27,.72)}
  .twk-lbl>span:first-child{font-weight:500}
  .twk-val{color:rgba(41,38,27,.5);font-variant-numeric:tabular-nums}

  .twk-sect{font-size:10px;font-weight:600;letter-spacing:.06em;text-transform:uppercase;
    color:rgba(41,38,27,.45);padding:10px 0 0}
  .twk-sect:first-child{padding-top:0}

  .twk-field{appearance:none;box-sizing:border-box;width:100%;min-width:0;height:26px;padding:0 8px;
    border:.5px solid rgba(0,0,0,.1);border-radius:7px;
    background:rgba(255,255,255,.6);color:inherit;font:inherit;outline:none}
  .twk-field:focus{border-color:rgba(0,0,0,.25);background:rgba(255,255,255,.85)}
  select.twk-field{padding-right:22px;
    background-image:url("data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' width='10' height='6' viewBox='0 0 10 6'><path fill='rgba(0,0,0,.5)' d='M0 0h10L5 6z'/></svg>");
    background-repeat:no-repeat;background-position:right 8px center}

  .twk-slider{appearance:none;-webkit-appearance:none;width:100%;height:4px;margin:6px 0;
    border-radius:999px;background:rgba(0,0,0,.12);outline:none}
  .twk-slider::-webkit-slider-thumb{-webkit-appearance:none;appearance:none;
    width:14px;height:14px;border-radius:50%;background:#fff;
    border:.5px solid rgba(0,0,0,.12);box-shadow:0 1px 3px rgba(0,0,0,.2);cursor:default}
  .twk-slider::-moz-range-thumb{width:14px;height:14px;border-radius:50%;
    background:#fff;border:.5px solid rgba(0,0,0,.12);box-shadow:0 1px 3px rgba(0,0,0,.2);cursor:default}

  .twk-seg{position:relative;display:flex;padding:2px;border-radius:8px;
    background:rgba(0,0,0,.06);user-select:none}
  .twk-seg-thumb{position:absolute;top:2px;bottom:2px;border-radius:6px;
    background:rgba(255,255,255,.9);box-shadow:0 1px 2px rgba(0,0,0,.12);
    transition:left .15s cubic-bezier(.3,.7,.4,1),width .15s}
  .twk-seg.dragging .twk-seg-thumb{transition:none}
  .twk-seg button{appearance:none;position:relative;z-index:1;flex:1;border:0;
    background:transparent;color:inherit;font:inherit;font-weight:500;min-height:22px;
    border-radius:6px;cursor:default;padding:4px 6px;line-height:1.2;
    overflow-wrap:anywhere}

  .twk-toggle{position:relative;width:32px;height:18px;border:0;border-radius:999px;
    background:rgba(0,0,0,.15);transition:background .15s;cursor:default;padding:0}
  .twk-toggle[data-on="1"]{background:#34c759}
  .twk-toggle i{position:absolute;top:2px;left:2px;width:14px;height:14px;border-radius:50%;
    background:#fff;box-shadow:0 1px 2px rgba(0,0,0,.25);transition:transform .15s}
  .twk-toggle[data-on="1"] i{transform:translateX(14px)}

  .twk-num{display:flex;align-items:center;box-sizing:border-box;min-width:0;height:26px;padding:0 0 0 8px;
    border:.5px solid rgba(0,0,0,.1);border-radius:7px;background:rgba(255,255,255,.6)}
  .twk-num-lbl{font-weight:500;color:rgba(41,38,27,.6);cursor:ew-resize;
    user-select:none;padding-right:8px}
  .twk-num input{flex:1;min-width:0;height:100%;border:0;background:transparent;
    font:inherit;font-variant-numeric:tabular-nums;text-align:right;padding:0 8px 0 0;
    outline:none;color:inherit;-moz-appearance:textfield}
  .twk-num input::-webkit-inner-spin-button,.twk-num input::-webkit-outer-spin-button{
    -webkit-appearance:none;margin:0}
  .twk-num-unit{padding-right:8px;color:rgba(41,38,27,.45)}

  .twk-btn{appearance:none;height:26px;padding:0 12px;border:0;border-radius:7px;
    background:rgba(0,0,0,.78);color:#fff;font:inherit;font-weight:500;cursor:default}
  .twk-btn:hover{background:rgba(0,0,0,.88)}
  .twk-btn.secondary{background:rgba(0,0,0,.06);color:inherit}
  .twk-btn.secondary:hover{background:rgba(0,0,0,.1)}

  .twk-swatch{appearance:none;-webkit-appearance:none;width:56px;height:22px;
    border:.5px solid rgba(0,0,0,.1);border-radius:6px;padding:0;cursor:default;
    background:transparent;flex-shrink:0}
  .twk-swatch::-webkit-color-swatch-wrapper{padding:0}
  .twk-swatch::-webkit-color-swatch{border:0;border-radius:5.5px}
  .twk-swatch::-moz-color-swatch{border:0;border-radius:5.5px}

  .twk-chips{display:flex;gap:6px}
  .twk-chip{position:relative;appearance:none;flex:1;min-width:0;height:46px;
    padding:0;border:0;border-radius:6px;overflow:hidden;cursor:default;
    box-shadow:0 0 0 .5px rgba(0,0,0,.12),0 1px 2px rgba(0,0,0,.06);
    transition:transform .12s cubic-bezier(.3,.7,.4,1),box-shadow .12s}
  .twk-chip:hover{transform:translateY(-1px);
    box-shadow:0 0 0 .5px rgba(0,0,0,.18),0 4px 10px rgba(0,0,0,.12)}
  .twk-chip[data-on="1"]{box-shadow:0 0 0 1.5px rgba(0,0,0,.85),
    0 2px 6px rgba(0,0,0,.15)}
  .twk-chip>span{position:absolute;top:0;bottom:0;right:0;width:34%;
    display:flex;flex-direction:column;box-shadow:-1px 0 0 rgba(0,0,0,.1)}
  .twk-chip>span>i{flex:1;box-shadow:0 -1px 0 rgba(0,0,0,.1)}
  .twk-chip>span>i:first-child{box-shadow:none}
  .twk-chip svg{position:absolute;top:6px;left:6px;width:13px;height:13px;
    filter:drop-shadow(0 1px 1px rgba(0,0,0,.3))}
`;
function useTweaks(defaults) {
  const [values, setValues] = React.useState(defaults);
  const setTweak = React.useCallback((keyOrEdits, val) => {
    const edits = typeof keyOrEdits === 'object' && keyOrEdits !== null ? keyOrEdits : {
      [keyOrEdits]: val
    };
    setValues(prev => ({
      ...prev,
      ...edits
    }));
    window.parent.postMessage({
      type: '__edit_mode_set_keys',
      edits
    }, '*');
    window.dispatchEvent(new CustomEvent('tweakchange', {
      detail: edits
    }));
  }, []);
  return [values, setTweak];
}
function TweaksPanel({
  title = 'Tweaks',
  children
}) {
  const [open, setOpen] = React.useState(false);
  const dragRef = React.useRef(null);
  const offsetRef = React.useRef({
    x: 16,
    y: 16
  });
  const PAD = 16;
  const clampToViewport = React.useCallback(() => {
    const panel = dragRef.current;
    if (!panel) return;
    const w = panel.offsetWidth,
      h = panel.offsetHeight;
    const maxRight = Math.max(PAD, window.innerWidth - w - PAD);
    const maxBottom = Math.max(PAD, window.innerHeight - h - PAD);
    offsetRef.current = {
      x: Math.min(maxRight, Math.max(PAD, offsetRef.current.x)),
      y: Math.min(maxBottom, Math.max(PAD, offsetRef.current.y))
    };
    panel.style.right = offsetRef.current.x + 'px';
    panel.style.bottom = offsetRef.current.y + 'px';
  }, []);
  React.useEffect(() => {
    if (!open) return;
    clampToViewport();
    if (typeof ResizeObserver === 'undefined') {
      window.addEventListener('resize', clampToViewport);
      return () => window.removeEventListener('resize', clampToViewport);
    }
    const ro = new ResizeObserver(clampToViewport);
    ro.observe(document.documentElement);
    return () => ro.disconnect();
  }, [open, clampToViewport]);
  React.useEffect(() => {
    const onMsg = e => {
      const t = e?.data?.type;
      if (t === '__activate_edit_mode') setOpen(true);else if (t === '__deactivate_edit_mode') setOpen(false);
    };
    window.addEventListener('message', onMsg);
    window.parent.postMessage({
      type: '__edit_mode_available'
    }, '*');
    return () => window.removeEventListener('message', onMsg);
  }, []);
  const dismiss = () => {
    setOpen(false);
    window.parent.postMessage({
      type: '__edit_mode_dismissed'
    }, '*');
  };
  const onDragStart = e => {
    const panel = dragRef.current;
    if (!panel) return;
    const r = panel.getBoundingClientRect();
    const sx = e.clientX,
      sy = e.clientY;
    const startRight = window.innerWidth - r.right;
    const startBottom = window.innerHeight - r.bottom;
    const move = ev => {
      offsetRef.current = {
        x: startRight - (ev.clientX - sx),
        y: startBottom - (ev.clientY - sy)
      };
      clampToViewport();
    };
    const up = () => {
      window.removeEventListener('mousemove', move);
      window.removeEventListener('mouseup', up);
    };
    window.addEventListener('mousemove', move);
    window.addEventListener('mouseup', up);
  };
  if (!open) return null;
  return React.createElement(React.Fragment, null, React.createElement("style", null, __TWEAKS_STYLE), React.createElement("div", {
    ref: dragRef,
    className: "twk-panel",
    "data-omelette-chrome": "",
    style: {
      right: offsetRef.current.x,
      bottom: offsetRef.current.y
    }
  }, React.createElement("div", {
    className: "twk-hd",
    onMouseDown: onDragStart
  }, React.createElement("b", null, title), React.createElement("button", {
    className: "twk-x",
    "aria-label": "Close tweaks",
    onMouseDown: e => e.stopPropagation(),
    onClick: dismiss
  }, "\u2715")), React.createElement("div", {
    className: "twk-body"
  }, children)));
}
function TweakSection({
  label,
  children
}) {
  return React.createElement(React.Fragment, null, React.createElement("div", {
    className: "twk-sect"
  }, label), children);
}
function TweakRow({
  label,
  value,
  children,
  inline = false
}) {
  return React.createElement("div", {
    className: inline ? 'twk-row twk-row-h' : 'twk-row'
  }, React.createElement("div", {
    className: "twk-lbl"
  }, React.createElement("span", null, label), value != null && React.createElement("span", {
    className: "twk-val"
  }, value)), children);
}
function TweakSlider({
  label,
  value,
  min = 0,
  max = 100,
  step = 1,
  unit = '',
  onChange
}) {
  return React.createElement(TweakRow, {
    label: label,
    value: `${value}${unit}`
  }, React.createElement("input", {
    type: "range",
    className: "twk-slider",
    min: min,
    max: max,
    step: step,
    value: value,
    onChange: e => onChange(Number(e.target.value))
  }));
}
function TweakToggle({
  label,
  value,
  onChange
}) {
  return React.createElement("div", {
    className: "twk-row twk-row-h"
  }, React.createElement("div", {
    className: "twk-lbl"
  }, React.createElement("span", null, label)), React.createElement("button", {
    type: "button",
    className: "twk-toggle",
    "data-on": value ? '1' : '0',
    role: "switch",
    "aria-checked": !!value,
    onClick: () => onChange(!value)
  }, React.createElement("i", null)));
}
function TweakRadio({
  label,
  value,
  options,
  onChange
}) {
  const trackRef = React.useRef(null);
  const [dragging, setDragging] = React.useState(false);
  const valueRef = React.useRef(value);
  valueRef.current = value;
  const labelLen = o => String(typeof o === 'object' ? o.label : o).length;
  const maxLen = options.reduce((m, o) => Math.max(m, labelLen(o)), 0);
  const fitsAsSegments = maxLen <= ({
    2: 16,
    3: 10
  }[options.length] ?? 0);
  if (!fitsAsSegments) {
    const resolve = s => {
      const m = options.find(o => String(typeof o === 'object' ? o.value : o) === s);
      return m === undefined ? s : typeof m === 'object' ? m.value : m;
    };
    return React.createElement(TweakSelect, {
      label: label,
      value: value,
      options: options,
      onChange: s => onChange(resolve(s))
    });
  }
  const opts = options.map(o => typeof o === 'object' ? o : {
    value: o,
    label: o
  });
  const idx = Math.max(0, opts.findIndex(o => o.value === value));
  const n = opts.length;
  const segAt = clientX => {
    const r = trackRef.current.getBoundingClientRect();
    const inner = r.width - 4;
    const i = Math.floor((clientX - r.left - 2) / inner * n);
    return opts[Math.max(0, Math.min(n - 1, i))].value;
  };
  const onPointerDown = e => {
    setDragging(true);
    const v0 = segAt(e.clientX);
    if (v0 !== valueRef.current) onChange(v0);
    const move = ev => {
      if (!trackRef.current) return;
      const v = segAt(ev.clientX);
      if (v !== valueRef.current) onChange(v);
    };
    const up = () => {
      setDragging(false);
      window.removeEventListener('pointermove', move);
      window.removeEventListener('pointerup', up);
    };
    window.addEventListener('pointermove', move);
    window.addEventListener('pointerup', up);
  };
  return React.createElement(TweakRow, {
    label: label
  }, React.createElement("div", {
    ref: trackRef,
    role: "radiogroup",
    onPointerDown: onPointerDown,
    className: dragging ? 'twk-seg dragging' : 'twk-seg'
  }, React.createElement("div", {
    className: "twk-seg-thumb",
    style: {
      left: `calc(2px + ${idx} * (100% - 4px) / ${n})`,
      width: `calc((100% - 4px) / ${n})`
    }
  }), opts.map(o => React.createElement("button", {
    key: o.value,
    type: "button",
    role: "radio",
    "aria-checked": o.value === value
  }, o.label))));
}
function TweakSelect({
  label,
  value,
  options,
  onChange
}) {
  return React.createElement(TweakRow, {
    label: label
  }, React.createElement("select", {
    className: "twk-field",
    value: value,
    onChange: e => onChange(e.target.value)
  }, options.map(o => {
    const v = typeof o === 'object' ? o.value : o;
    const l = typeof o === 'object' ? o.label : o;
    return React.createElement("option", {
      key: v,
      value: v
    }, l);
  })));
}
function TweakText({
  label,
  value,
  placeholder,
  onChange
}) {
  return React.createElement(TweakRow, {
    label: label
  }, React.createElement("input", {
    className: "twk-field",
    type: "text",
    value: value,
    placeholder: placeholder,
    onChange: e => onChange(e.target.value)
  }));
}
function TweakNumber({
  label,
  value,
  min,
  max,
  step = 1,
  unit = '',
  onChange
}) {
  const clamp = n => {
    if (min != null && n < min) return min;
    if (max != null && n > max) return max;
    return n;
  };
  const startRef = React.useRef({
    x: 0,
    val: 0
  });
  const onScrubStart = e => {
    e.preventDefault();
    startRef.current = {
      x: e.clientX,
      val: value
    };
    const decimals = (String(step).split('.')[1] || '').length;
    const move = ev => {
      const dx = ev.clientX - startRef.current.x;
      const raw = startRef.current.val + dx * step;
      const snapped = Math.round(raw / step) * step;
      onChange(clamp(Number(snapped.toFixed(decimals))));
    };
    const up = () => {
      window.removeEventListener('pointermove', move);
      window.removeEventListener('pointerup', up);
    };
    window.addEventListener('pointermove', move);
    window.addEventListener('pointerup', up);
  };
  return React.createElement("div", {
    className: "twk-num"
  }, React.createElement("span", {
    className: "twk-num-lbl",
    onPointerDown: onScrubStart
  }, label), React.createElement("input", {
    type: "number",
    value: value,
    min: min,
    max: max,
    step: step,
    onChange: e => onChange(clamp(Number(e.target.value)))
  }), unit && React.createElement("span", {
    className: "twk-num-unit"
  }, unit));
}
function __twkIsLight(hex) {
  const h = String(hex).replace('#', '');
  const x = h.length === 3 ? h.replace(/./g, c => c + c) : h.padEnd(6, '0');
  const n = parseInt(x.slice(0, 6), 16);
  if (Number.isNaN(n)) return true;
  const r = n >> 16 & 255,
    g = n >> 8 & 255,
    b = n & 255;
  return r * 299 + g * 587 + b * 114 > 148000;
}
const __TwkCheck = ({
  light
}) => React.createElement("svg", {
  viewBox: "0 0 14 14",
  "aria-hidden": "true"
}, React.createElement("path", {
  d: "M3 7.2 5.8 10 11 4.2",
  fill: "none",
  strokeWidth: "2.2",
  strokeLinecap: "round",
  strokeLinejoin: "round",
  stroke: light ? 'rgba(0,0,0,.78)' : '#fff'
}));
function TweakColor({
  label,
  value,
  options,
  onChange
}) {
  if (!options || !options.length) {
    return React.createElement("div", {
      className: "twk-row twk-row-h"
    }, React.createElement("div", {
      className: "twk-lbl"
    }, React.createElement("span", null, label)), React.createElement("input", {
      type: "color",
      className: "twk-swatch",
      value: value,
      onChange: e => onChange(e.target.value)
    }));
  }
  const key = o => String(JSON.stringify(o)).toLowerCase();
  const cur = key(value);
  return React.createElement(TweakRow, {
    label: label
  }, React.createElement("div", {
    className: "twk-chips",
    role: "radiogroup"
  }, options.map((o, i) => {
    const colors = Array.isArray(o) ? o : [o];
    const [hero, ...rest] = colors;
    const sup = rest.slice(0, 4);
    const on = key(o) === cur;
    return React.createElement("button", {
      key: i,
      type: "button",
      className: "twk-chip",
      role: "radio",
      "aria-checked": on,
      "data-on": on ? '1' : '0',
      "aria-label": colors.join(', '),
      title: colors.join(' · '),
      style: {
        background: hero
      },
      onClick: () => onChange(o)
    }, sup.length > 0 && React.createElement("span", null, sup.map((c, j) => React.createElement("i", {
      key: j,
      style: {
        background: c
      }
    }))), on && React.createElement(__TwkCheck, {
      light: __twkIsLight(hero)
    }));
  })));
}
function TweakButton({
  label,
  onClick,
  secondary = false
}) {
  return React.createElement("button", {
    type: "button",
    className: secondary ? 'twk-btn secondary' : 'twk-btn',
    onClick: onClick
  }, label);
}
Object.assign(window, {
  useTweaks,
  TweaksPanel,
  TweakSection,
  TweakRow,
  TweakSlider,
  TweakToggle,
  TweakRadio,
  TweakSelect,
  TweakText,
  TweakNumber,
  TweakColor,
  TweakButton
});

/* ===== store.jsx ===== */
const ROContext = React.createContext(null);
const useRO = () => React.useContext(ROContext);
const TWEAK_DEFAULTS = {
  "signal": "cyan",
  "atmosphere": "balanced",
  "density": "comfortable"
};
function applyTweaks(t) {
  const root = document.documentElement;
  const P = {
    cyan: {
      c: "#06B6D4",
      b: "#3B82F6",
      g: "rgba(6,182,212",
      d: "rgba(6,182,212,0.14)",
      l: "rgba(6,182,212,0.34)"
    },
    amber: {
      c: "#F5A524",
      b: "#F97316",
      g: "rgba(245,165,36",
      d: "rgba(245,165,36,0.15)",
      l: "rgba(245,165,36,0.36)"
    },
    emerald: {
      c: "#10B981",
      b: "#06B6D4",
      g: "rgba(16,185,129",
      d: "rgba(16,185,129,0.14)",
      l: "rgba(16,185,129,0.34)"
    }
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
function Logo({
  size = 28,
  showWord = true
}) {
  return React.createElement("div", {
    style: {
      display: "flex",
      alignItems: "center",
      gap: 11
    }
  }, React.createElement("svg", {
    width: size,
    height: size,
    viewBox: "0 0 40 40",
    fill: "none",
    style: {
      flex: "none",
      filter: "drop-shadow(0 3px 6px rgba(6,182,212,0.28))"
    }
  }, React.createElement("defs", null, React.createElement("linearGradient", {
    id: "ro-metalL",
    x1: "4",
    y1: "3",
    x2: "34",
    y2: "37",
    gradientUnits: "userSpaceOnUse"
  }, React.createElement("stop", {
    offset: "0",
    stopColor: "#A6DDF3"
  }), React.createElement("stop", {
    offset: "0.5",
    stopColor: "#3B82F6"
  }), React.createElement("stop", {
    offset: "1",
    stopColor: "#0C2A4A"
  })), React.createElement("linearGradient", {
    id: "ro-metalD",
    x1: "20",
    y1: "12",
    x2: "26",
    y2: "28",
    gradientUnits: "userSpaceOnUse"
  }, React.createElement("stop", {
    offset: "0",
    stopColor: "#1B2940"
  }), React.createElement("stop", {
    offset: "1",
    stopColor: "#080C14"
  })), React.createElement("linearGradient", {
    id: "ro-ring",
    x1: "6",
    y1: "4",
    x2: "34",
    y2: "37",
    gradientUnits: "userSpaceOnUse"
  }, React.createElement("stop", {
    offset: "0",
    stopColor: "#8FCDEC"
  }), React.createElement("stop", {
    offset: "1",
    stopColor: "#2A63C8"
  })), React.createElement("linearGradient", {
    id: "ro-arrow",
    x1: "20",
    y1: "13",
    x2: "20",
    y2: "27",
    gradientUnits: "userSpaceOnUse"
  }, React.createElement("stop", {
    offset: "0",
    stopColor: "#CFF3FF"
  }), React.createElement("stop", {
    offset: "1",
    stopColor: "#06B6D4"
  }))), React.createElement("path", {
    d: "M20 3 L34 8 V20 C34 29 28 34 20 37 C12 34 6 29 6 20 V8 Z",
    stroke: "url(#ro-ring)",
    strokeWidth: "1.5",
    opacity: "0.42"
  }), React.createElement("path", {
    d: "M20 8 L29 11.5 V20 C29 26 25 29.5 20 32 C15 29.5 11 26 11 20 V11.5 Z",
    stroke: "url(#ro-ring)",
    strokeWidth: "1.4",
    opacity: "0.72"
  }), React.createElement("path", {
    d: "M20 12.5 L20 28 C16.5 26.5 14 24 14 20.5 V15 Z",
    fill: "url(#ro-metalL)"
  }), React.createElement("path", {
    d: "M20 12.5 L26 15 V20.5 C26 24 23.5 26.5 20 28 Z",
    fill: "url(#ro-metalD)"
  }), React.createElement("path", {
    d: "M20 12.5 L26 15 V20.5 C26 24 23.5 26.5 20 28 C16.5 26.5 14 24 14 20.5 V15 Z",
    stroke: "url(#ro-ring)",
    strokeWidth: "1.1"
  }), React.createElement("path", {
    d: "M20 26.5 V19.5",
    stroke: "url(#ro-arrow)",
    strokeWidth: "1.8",
    strokeLinecap: "round"
  }), React.createElement("path", {
    d: "M16.4 21.4 L20 17 L23.6 21.4",
    stroke: "url(#ro-arrow)",
    strokeWidth: "1.8",
    strokeLinecap: "round",
    strokeLinejoin: "round"
  }), React.createElement("path", {
    d: "M20 13 L22 15.6 L20 18.2 L18 15.6 Z",
    fill: "#BFefff",
    stroke: "#06B6D4",
    strokeWidth: "0.6"
  })), showWord && React.createElement("div", {
    style: {
      lineHeight: 1.05
    }
  }, React.createElement("div", {
    style: {
      fontFamily: "var(--f-display)",
      fontWeight: 600,
      fontSize: 15.5,
      letterSpacing: "-.01em",
      color: "var(--t1)"
    }
  }, "RecallOps"), React.createElement("div", {
    className: "mono",
    style: {
      fontSize: 9,
      letterSpacing: ".22em",
      color: "var(--cyan)",
      marginTop: 2
    }
  }, "CORTEX")));
}
function useContainmentStore() {
  const initSync = () => Object.fromEntries(window.RO.syncRuns.map(s => [s.id, "pending"]));
  const initActions = () => Object.fromEntries(window.RO.actions.map(a => [a.id, {
    approvalState: "pending",
    status: "drafted"
  }]));
  const [phase, setPhase] = useState("idle");
  const [sync, setSync] = useState(initSync);
  const [reasoningOn, setReasoningOn] = useState(false);
  const [analyzeOn, setAnalyzeOn] = useState(false);
  const [actionsOn, setActionsOn] = useState(false);
  const [actionState, setActionState] = useState(initActions);
  const [running, setRunning] = useState(false);
  const [busy, setBusy] = useState(false);
  const timers = useRef([]);
  const clear = () => {
    timers.current.forEach(clearTimeout);
    timers.current = [];
  };
  const at = (ms, fn) => timers.current.push(setTimeout(fn, ms));
  const reset = useCallback(() => {
    clear();
    window.RO_ACTIVE = false;
    setPhase("idle");
    setSync(initSync());
    setReasoningOn(false);
    setAnalyzeOn(false);
    setActionsOn(false);
    setActionState(initActions());
    setRunning(false);
    setBusy(false);
  }, []);
  const triggerContainment = useCallback(() => {
    clear();
    window.RO_ACTIVE = true;
    if (window.ROAPI) {
      window.ROAPI.triggerFivetranSync().then(() => window.ROAPI.runAgent()).catch(() => {});
    }
    setPhase("syncing");
    setRunning(true);
    setBusy(true);
    setSync(initSync());
    setReasoningOn(false);
    setAnalyzeOn(false);
    setActionsOn(false);
    setActionState(initActions());
    const runs = window.RO.syncRuns;
    let t = 350;
    runs.forEach((r, i) => {
      at(t, () => setSync(s => ({
        ...s,
        [r.id]: "syncing"
      })));
      t += 360;
      at(t, () => setSync(s => ({
        ...s,
        [r.id]: "success"
      })));
      t += 130;
    });
    at(t + 250, () => {
      setPhase("reasoning");
      setAnalyzeOn(true);
      setReasoningOn(true);
    });
    at(t + 5200, () => {
      setActionsOn(true);
      setPhase(p => p === "contained" ? p : "review");
      setRunning(false);
      setBusy(false);
    });
  }, []);
  const onReasoningDone = useCallback(() => {
    setActionsOn(true);
    setPhase(p => p === "contained" ? p : "review");
    setRunning(false);
    setBusy(false);
  }, []);
  const approveAction = useCallback(id => {
    setActionState(prev => ({
      ...prev,
      [id]: {
        approvalState: "approved",
        status: "executed",
        executedAt: new Date().toISOString(),
        recorded: true
      }
    }));
    const unrec = () => setActionState(prev => prev[id] ? {
      ...prev,
      [id]: {
        ...prev[id],
        recorded: false
      }
    } : prev);
    if (window.ROAPI) window.ROAPI.approveAction(id).then(r => {
      if (r && r._fallback) unrec();
    }).catch(unrec);
  }, []);
  const rejectAction = useCallback(id => {
    setActionState(prev => ({
      ...prev,
      [id]: {
        approvalState: "rejected",
        status: "drafted",
        recorded: true
      }
    }));
    const unrec = () => setActionState(prev => prev[id] ? {
      ...prev,
      [id]: {
        ...prev[id],
        recorded: false
      }
    } : prev);
    if (window.ROAPI) window.ROAPI.rejectAction(id).then(r => {
      if (r && r._fallback) unrec();
    }).catch(unrec);
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
    phase: effectivePhase,
    sync,
    reasoningOn,
    analyzeOn,
    actionsOn,
    actionState,
    running: allActionsApproved ? false : running,
    busy: allActionsApproved ? false : busy,
    approvedCount,
    contained: effectivePhase === "contained",
    triggerContainment,
    onReasoningDone,
    approveAction,
    rejectAction,
    reset,
    setBusy
  };
}
function AgentOrb({
  busy
}) {
  return React.createElement("div", {
    title: busy ? "Agent reasoning" : "Agent ready",
    style: {
      position: "relative",
      width: 22,
      height: 22,
      display: "grid",
      placeItems: "center",
      flex: "none"
    }
  }, React.createElement("span", {
    style: {
      position: "absolute",
      inset: 0,
      borderRadius: "50%",
      background: "var(--accent-grad)",
      filter: "blur(5px)",
      opacity: 0.6,
      animation: "ro-orb " + (busy ? "0.7s" : "2.4s") + " ease-in-out infinite"
    }
  }), React.createElement("span", {
    style: {
      position: "relative",
      width: 11,
      height: 11,
      borderRadius: "50%",
      background: "var(--accent-grad)",
      animation: "ro-orb " + (busy ? "0.7s" : "2.4s") + " ease-in-out infinite"
    }
  }));
}
function LiveClock() {
  const [now, setNow] = useState(new Date());
  useEffect(() => {
    const i = setInterval(() => setNow(new Date()), 1000);
    return () => clearInterval(i);
  }, []);
  const z = n => String(n).padStart(2, "0");
  return React.createElement("span", {
    className: "mono",
    style: {
      fontSize: 12,
      color: "var(--t1)",
      letterSpacing: ".04em",
      fontVariantNumeric: "tabular-nums"
    }
  }, z(now.getUTCHours()), ":", z(now.getUTCMinutes()), ":", z(now.getUTCSeconds()), " ", React.createElement("span", {
    style: {
      color: "var(--t3)"
    }
  }, "UTC"));
}
function NavRail({
  open,
  onClose
}) {
  const {
    route,
    navigate,
    phase
  } = useRO();
  const routes = window.RO.routes;
  return React.createElement(React.Fragment, null, open && React.createElement("div", {
    onClick: onClose,
    className: "ro-rail-scrim",
    style: {
      position: "fixed",
      inset: 0,
      zIndex: 70,
      background: "rgba(3,6,12,0.6)",
      backdropFilter: "blur(2px)"
    }
  }), React.createElement("aside", {
    className: "ro-rail" + (open ? " ro-rail-open" : ""),
    style: {
      width: "var(--rail-w)",
      flex: "none",
      borderRight: "1px solid var(--border)",
      background: "var(--bg-2)",
      display: "flex",
      flexDirection: "column",
      position: "sticky",
      top: 0,
      height: "100vh",
      zIndex: 75
    }
  }, React.createElement("div", {
    style: {
      height: "var(--topbar-h)",
      display: "flex",
      alignItems: "center",
      padding: "0 16px",
      borderBottom: "1px solid var(--border)"
    }
  }, React.createElement("button", {
    onClick: () => {
      navigate("cortex");
      onClose && onClose();
    },
    style: {
      background: "none",
      border: "none",
      padding: 0,
      cursor: "pointer"
    },
    "aria-label": "RecallOps Cortex home"
  }, React.createElement(Logo, null))), React.createElement("nav", {
    style: {
      padding: "12px 10px",
      display: "flex",
      flexDirection: "column",
      gap: 3,
      flex: 1,
      overflowY: "auto"
    },
    className: "no-sb"
  }, React.createElement("div", {
    className: "ro-rail-label label",
    style: {
      padding: "6px 10px 4px"
    }
  }, "Operations"), routes.map(r => {
    const active = route === r.id;
    return React.createElement("button", {
      key: r.id,
      onClick: () => {
        navigate(r.id);
        onClose && onClose();
      },
      title: r.label,
      style: {
        display: "flex",
        alignItems: "center",
        gap: 11,
        padding: "9px 11px",
        borderRadius: "var(--r-sm)",
        background: active ? "var(--panel-3)" : "transparent",
        border: "1px solid " + (active ? "var(--border-2)" : "transparent"),
        color: active ? "var(--t1)" : "var(--t2)",
        cursor: "pointer",
        textAlign: "left",
        width: "100%",
        fontFamily: "var(--f-sans)",
        fontSize: 13.5,
        fontWeight: active ? 600 : 500,
        transition: "all .14s",
        position: "relative"
      },
      onMouseEnter: e => {
        if (!active) e.currentTarget.style.background = "var(--panel)";
      },
      onMouseLeave: e => {
        if (!active) e.currentTarget.style.background = "transparent";
      }
    }, active && React.createElement("span", {
      style: {
        position: "absolute",
        left: -10,
        top: 8,
        bottom: 8,
        width: 3,
        borderRadius: 999,
        background: "var(--accent-grad)"
      }
    }), React.createElement("span", {
      style: {
        color: active ? "var(--cyan)" : "var(--t3)",
        display: "flex"
      }
    }, React.createElement(Icon, {
      name: r.icon,
      size: 17
    })), React.createElement("span", {
      className: "ro-rail-text"
    }, r.label));
  })), React.createElement("div", {
    className: "ro-rail-foot",
    style: {
      padding: 12,
      borderTop: "1px solid var(--border)"
    }
  }, React.createElement("div", {
    style: {
      padding: "10px 11px",
      background: "var(--panel)",
      border: "1px solid var(--border)",
      borderRadius: "var(--r-sm)"
    }
  }, React.createElement("div", {
    style: {
      display: "flex",
      alignItems: "center",
      justifyContent: "space-between",
      gap: 8
    }
  }, React.createElement("span", {
    className: "label"
  }, "Active recall"), React.createElement(StatusDot, {
    tone: phase === "contained" ? "success" : "danger",
    live: phase !== "idle" && phase !== "contained"
  })), React.createElement("div", {
    className: "mono",
    style: {
      fontSize: 12,
      color: "var(--t1)",
      marginTop: 6
    }
  }, window.RO.recall.recallId), React.createElement("div", {
    style: {
      marginTop: 7
    }
  }, React.createElement(ClassBadge, {
    classification: window.RO.recall.classification
  }))))));
}
function TopStatusBar({
  onMenu
}) {
  const {
    busy,
    phase,
    statusChips,
    judgeMode,
    openPalette
  } = useRO();
  const sysContained = phase === "contained";
  const sysActive = phase !== "idle" && !sysContained;
  return React.createElement("header", {
    className: "ro-topbar",
    style: {
      height: "var(--topbar-h)",
      flex: "none",
      borderBottom: "1px solid var(--border)",
      background: "rgba(10,14,22,0.72)",
      backdropFilter: "blur(14px)",
      display: "flex",
      alignItems: "center",
      gap: 14,
      padding: "0 16px",
      position: "sticky",
      top: 0,
      zIndex: 60
    }
  }, React.createElement("button", {
    className: "ro-menu-btn",
    onClick: onMenu,
    "aria-label": "Menu",
    style: {
      width: 34,
      height: 34,
      display: "none",
      placeItems: "center",
      flex: "none",
      background: "var(--panel-3)",
      border: "1px solid var(--border-2)",
      borderRadius: "var(--r-sm)",
      color: "var(--t1)",
      cursor: "pointer"
    }
  }, React.createElement(Icon, {
    name: "menu",
    size: 18
  })), React.createElement("div", {
    style: {
      display: "flex",
      alignItems: "center",
      gap: 9
    }
  }, React.createElement(StatusDot, {
    tone: sysContained ? "success" : sysActive ? "success" : "muted",
    live: sysActive
  }), React.createElement("span", {
    className: "mono",
    style: {
      fontSize: 11.5,
      letterSpacing: ".08em",
      color: sysContained || sysActive ? "var(--success)" : "var(--t3)",
      fontWeight: 600
    }
  }, "SYSTEM: ", sysContained ? "CONTAINED" : sysActive ? "ACTIVE" : "STANDBY")), React.createElement("span", {
    className: "ro-topbar-recall mono",
    style: {
      fontSize: 11.5,
      color: "var(--t3)"
    }
  }, "\xB7 ", window.RO.recall.recallId), React.createElement("div", {
    style: {
      flex: 1
    }
  }), React.createElement("div", {
    className: "ro-topbar-chips",
    style: {
      display: "flex",
      alignItems: "center",
      gap: 7
    }
  }, statusChips.map(c => React.createElement("div", {
    key: c.label,
    style: {
      display: "inline-flex",
      alignItems: "center",
      gap: 6,
      padding: "4px 9px",
      borderRadius: "var(--r-pill)",
      background: "var(--panel)",
      border: "1px solid var(--border)",
      fontSize: 11,
      fontFamily: "var(--f-mono)",
      whiteSpace: "nowrap"
    }
  }, React.createElement(StatusDot, {
    tone: c.tone,
    live: c.tone !== "muted",
    size: 6
  }), React.createElement("span", {
    style: {
      color: "var(--t2)"
    }
  }, c.label)))), React.createElement("button", {
    onClick: openPalette,
    "aria-label": "Command palette",
    className: "ro-kbtn",
    style: {
      display: "inline-flex",
      alignItems: "center",
      gap: 6,
      padding: "5px 9px",
      borderRadius: "var(--r-sm)",
      background: "var(--panel)",
      border: "1px solid var(--border-2)",
      color: "var(--t3)",
      cursor: "pointer",
      fontFamily: "var(--f-mono)",
      fontSize: 11
    }
  }, React.createElement(Icon, {
    name: "search",
    size: 13
  }), " ", React.createElement("kbd", {
    style: {
      fontFamily: "var(--f-mono)"
    }
  }, "\u2318K")), React.createElement("button", {
    onClick: judgeMode,
    title: "Judge Mode \u2014 cinematic 90s run",
    style: {
      display: "inline-flex",
      alignItems: "center",
      gap: 6,
      padding: "6px 12px",
      borderRadius: "var(--r-sm)",
      background: "var(--accent-grad)",
      border: "1px solid rgba(6,182,212,.5)",
      color: "#04121d",
      cursor: "pointer",
      fontFamily: "var(--f-sans)",
      fontWeight: 700,
      fontSize: 12.5,
      whiteSpace: "nowrap"
    }
  }, React.createElement(Icon, {
    name: "gavel",
    size: 14
  }), " ", React.createElement("span", {
    className: "ro-judge-text"
  }, "Judge Mode")), React.createElement("div", {
    style: {
      width: 1,
      height: 22,
      background: "var(--border-2)"
    },
    className: "ro-topbar-div"
  }), React.createElement(LiveClock, null), React.createElement(AgentOrb, {
    busy: busy
  }));
}
function CommandPalette({
  open,
  onClose,
  navigate,
  judge
}) {
  const [q, setQ] = useState("");
  const [idx, setIdx] = useState(0);
  const inputRef = useRef(null);
  useEffect(() => {
    if (open) {
      setQ("");
      setIdx(0);
      setTimeout(() => inputRef.current && inputRef.current.focus(), 30);
    }
  }, [open]);
  if (!open) return null;
  const items = [{
    id: "__judge",
    label: "Run Judge Mode",
    icon: "play",
    kind: "Action",
    run: () => {
      onClose();
      judge();
    }
  }, ...window.RO.routes.map(r => ({
    id: r.id,
    label: r.label,
    icon: r.icon,
    kind: "Navigate",
    run: () => {
      onClose();
      navigate(r.id);
    }
  }))];
  const filtered = items.filter(it => it.label.toLowerCase().includes(q.toLowerCase()));
  const onKey = e => {
    if (e.key === "ArrowDown") {
      e.preventDefault();
      setIdx(i => Math.min(filtered.length - 1, i + 1));
    } else if (e.key === "ArrowUp") {
      e.preventDefault();
      setIdx(i => Math.max(0, i - 1));
    } else if (e.key === "Enter") {
      e.preventDefault();
      filtered[idx] && filtered[idx].run();
    }
  };
  return React.createElement("div", {
    onClick: onClose,
    style: {
      position: "fixed",
      inset: 0,
      zIndex: 140,
      background: "rgba(4,7,13,0.66)",
      backdropFilter: "blur(5px)",
      display: "flex",
      justifyContent: "center",
      alignItems: "flex-start",
      paddingTop: "12vh"
    }
  }, React.createElement("div", {
    onClick: e => e.stopPropagation(),
    className: "rise",
    style: {
      "--dur": ".22s",
      width: "min(560px,92%)",
      background: "var(--panel)",
      border: "1px solid var(--border-3)",
      borderRadius: "var(--r-md)",
      boxShadow: "var(--sh-2)",
      overflow: "hidden"
    }
  }, React.createElement("div", {
    style: {
      display: "flex",
      alignItems: "center",
      gap: 11,
      padding: "13px 16px",
      borderBottom: "1px solid var(--border)"
    }
  }, React.createElement(Icon, {
    name: "search",
    size: 17,
    style: {
      color: "var(--t3)"
    }
  }), React.createElement("input", {
    ref: inputRef,
    value: q,
    onChange: e => {
      setQ(e.target.value);
      setIdx(0);
    },
    onKeyDown: onKey,
    placeholder: "Search routes and actions\u2026",
    style: {
      flex: 1,
      background: "none",
      border: "none",
      outline: "none",
      color: "var(--t1)",
      fontSize: 14.5,
      fontFamily: "var(--f-sans)"
    }
  }), React.createElement("kbd", {
    className: "mono",
    style: {
      fontSize: 10,
      color: "var(--t3)",
      border: "1px solid var(--border-2)",
      borderRadius: 4,
      padding: "2px 6px"
    }
  }, "ESC")), React.createElement("div", {
    className: "no-sb",
    style: {
      maxHeight: 360,
      overflowY: "auto",
      padding: 7
    }
  }, filtered.map((it, i) => React.createElement("button", {
    key: it.id,
    onMouseEnter: () => setIdx(i),
    onClick: it.run,
    style: {
      display: "flex",
      alignItems: "center",
      gap: 11,
      width: "100%",
      padding: "10px 12px",
      textAlign: "left",
      cursor: "pointer",
      background: i === idx ? "var(--panel-3)" : "transparent",
      border: "1px solid " + (i === idx ? "var(--border-2)" : "transparent"),
      borderRadius: "var(--r-sm)",
      color: "var(--t1)",
      fontFamily: "var(--f-sans)",
      fontSize: 13.5
    }
  }, React.createElement("span", {
    style: {
      color: it.kind === "Action" ? "var(--cyan)" : "var(--t3)",
      display: "flex"
    }
  }, React.createElement(Icon, {
    name: it.icon,
    size: 16
  })), it.label, React.createElement("span", {
    className: "mono",
    style: {
      marginLeft: "auto",
      fontSize: 10,
      color: "var(--t4)"
    }
  }, it.kind))), !filtered.length && React.createElement("div", {
    style: {
      padding: "18px 14px",
      color: "var(--t3)",
      fontSize: 13
    }
  }, "No matches."))));
}
function InspectorDrawer({
  node,
  onClose
}) {
  useEffect(() => {
    if (node) document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = "";
    };
  }, [node]);
  if (!node) return null;
  const fields = node.fields || [];
  return React.createElement("div", {
    onClick: onClose,
    style: {
      position: "fixed",
      inset: 0,
      zIndex: 95,
      background: "rgba(4,7,13,0.55)",
      backdropFilter: "blur(3px)"
    }
  }, React.createElement("div", {
    onClick: e => e.stopPropagation(),
    style: {
      position: "absolute",
      top: 0,
      right: 0,
      height: "100%",
      width: "min(440px,100%)",
      background: "var(--panel)",
      borderLeft: "1px solid var(--border-3)",
      boxShadow: "-30px 0 60px -30px rgba(0,0,0,.8)",
      display: "flex",
      flexDirection: "column",
      animation: "ro-rise .3s ease"
    }
  }, React.createElement("div", {
    style: {
      padding: "16px 20px",
      borderBottom: "1px solid var(--border)",
      display: "flex",
      alignItems: "flex-start",
      justifyContent: "space-between",
      gap: 12
    }
  }, React.createElement("div", {
    style: {
      minWidth: 0
    }
  }, node.kind && React.createElement("div", {
    className: "label",
    style: {
      color: node.accent || "var(--cyan)",
      marginBottom: 6
    }
  }, node.kind), React.createElement("h3", {
    style: {
      margin: 0,
      fontSize: 17,
      fontWeight: 600,
      fontFamily: "var(--f-display)",
      color: "var(--t1)"
    }
  }, node.title), node.subtitle && React.createElement("div", {
    className: "mono",
    style: {
      fontSize: 11.5,
      color: "var(--t3)",
      marginTop: 6
    }
  }, node.subtitle)), React.createElement("button", {
    onClick: onClose,
    "aria-label": "Close",
    style: {
      width: 32,
      height: 32,
      borderRadius: "var(--r-sm)",
      background: "var(--panel-3)",
      border: "1px solid var(--border-2)",
      color: "var(--t2)",
      cursor: "pointer",
      display: "grid",
      placeItems: "center",
      flex: "none"
    }
  }, React.createElement(Icon, {
    name: "x",
    size: 16
  }))), React.createElement("div", {
    className: "no-sb",
    style: {
      overflowY: "auto",
      padding: "16px 20px",
      display: "flex",
      flexDirection: "column",
      gap: 14
    }
  }, fields.map((f, i) => React.createElement("div", {
    key: i
  }, React.createElement("div", {
    className: "label",
    style: {
      marginBottom: 4
    }
  }, f.k), React.createElement("div", {
    className: f.mono ? "mono" : "",
    style: {
      fontSize: f.mono ? 12 : 13,
      color: f.tone || "var(--t1)",
      lineHeight: 1.5,
      wordBreak: "break-word"
    }
  }, f.v))), node.json && React.createElement("div", null, React.createElement("div", {
    className: "label",
    style: {
      marginBottom: 6
    }
  }, "Raw JSON"), React.createElement("pre", {
    className: "mono no-sb",
    style: {
      margin: 0,
      fontSize: 11,
      color: "var(--t2)",
      background: "var(--bg-2)",
      border: "1px solid var(--border)",
      borderRadius: "var(--r-sm)",
      padding: 12,
      overflowX: "auto",
      lineHeight: 1.6
    }
  }, JSON.stringify(node.json, null, 2))), node.extra)));
}
class ViewErrorBoundary extends React.Component {
  constructor(p) {
    super(p);
    this.state = {
      err: null
    };
  }
  static getDerivedStateFromError(e) {
    return {
      err: e
    };
  }
  componentDidCatch() {}
  render() {
    if (this.state.err) {
      return React.createElement("div", {
        style: {
          display: "grid",
          placeItems: "center",
          padding: "60px 24px",
          textAlign: "center"
        }
      }, React.createElement("div", null, React.createElement("div", {
        style: {
          width: 52,
          height: 52,
          borderRadius: "var(--r-md)",
          background: "var(--panel-3)",
          border: "1px solid var(--border-2)",
          display: "grid",
          placeItems: "center",
          color: "var(--warning)",
          margin: "0 auto 14px"
        }
      }, React.createElement(Icon, {
        name: "alert",
        size: 24
      })), React.createElement("div", {
        style: {
          fontSize: 15,
          fontWeight: 600,
          color: "var(--t1)",
          fontFamily: "var(--f-display)"
        }
      }, "This view hit an error"), React.createElement("p", {
        style: {
          margin: "8px auto 0",
          fontSize: 13,
          color: "var(--t3)",
          maxWidth: 380
        }
      }, "The rest of RecallOps Cortex is still running \u2014 pick another module from the rail or command palette.")));
    }
    return this.props.children;
  }
}
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
  useEffect(() => {
    applyTweaks(tw);
  }, [tw]);
  const playBriefing = useCallback(() => {
    briefTimers.current.forEach(clearTimeout);
    briefTimers.current = [];
    if ((location.hash.replace('#', '') || '/') !== '/') {
      location.hash = '/';
      setRoute('cortex');
    }
    store.reset();
    setBriefing(true);
    setBriefPct(0);
    const total = 15000,
      t0 = performance.now();
    const prog = setInterval(() => {
      const p = Math.min(100, (performance.now() - t0) / total * 100);
      setBriefPct(p);
      if (p >= 100) clearInterval(prog);
    }, 60);
    briefTimers.current.push(prog);
    const sec = i => {
      const els = document.querySelectorAll('main section');
      return els[i];
    };
    const to = (i, ms) => briefTimers.current.push(setTimeout(() => {
      const el = sec(i);
      if (el) window.scrollTo({
        top: el.getBoundingClientRect().top + window.scrollY - 74,
        behavior: 'smooth'
      });
    }, ms));
    setTimeout(() => store.triggerContainment(), 350);
    window.scrollTo({
      top: 0,
      behavior: 'smooth'
    });
    to(2, 1400);
    to(3, 5600);
    to(4, 8400);
    to(5, 11600);
    briefTimers.current.push(setTimeout(() => {
      setBriefing(false);
      setBriefPct(0);
    }, 15200));
  }, [store]);
  const navigate = useCallback(id => {
    const r = window.RO.routes.find(x => x.id === id);
    if (r) {
      location.hash = r.path;
      setRoute(id);
      window.scrollTo({
        top: 0,
        behavior: "smooth"
      });
    }
  }, []);
  useEffect(() => {
    const onHash = () => {
      const h = location.hash.replace("#", "") || "/";
      const r = window.RO.routes.find(x => x.path === h);
      if (r) setRoute(r.id);
    };
    window.addEventListener("hashchange", onHash);
    return () => window.removeEventListener("hashchange", onHash);
  }, []);
  useEffect(() => {
    if (bgRef.current && window.startCommandBackground) window.startCommandBackground(bgRef.current);
  }, []);
  useEffect(() => {
    const onKey = e => {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === "k") {
        e.preventDefault();
        setPalette(p => !p);
      }
      if (e.key === "Escape") {
        setPalette(false);
        setInspector(null);
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, []);
  useEffect(() => {
    const targets = Array.from(document.querySelectorAll('main section'));
    const io = new IntersectionObserver(entries => {
      entries.forEach(e => {
        if (e.isIntersecting) {
          e.target.classList.add('in');
          io.unobserve(e.target);
        }
      });
    }, {
      threshold: 0.08,
      rootMargin: '0px 0px -6% 0px'
    });
    const vh = window.innerHeight;
    targets.forEach((el, i) => {
      if (el.getBoundingClientRect().top > vh * 0.92) {
        el.classList.add('reveal-up');
        el.style.transitionDelay = Math.min(i, 4) * 40 + 'ms';
        io.observe(el);
      }
    });
    const safety = setTimeout(() => targets.forEach(el => el.classList.add('in')), 1600);
    return () => {
      io.disconnect();
      clearTimeout(safety);
    };
  }, [route]);
  const ctx = {
    route,
    navigate,
    statusChips: window.RO.statusChips,
    briefing,
    playBriefing,
    judgeMode: playBriefing,
    openPalette: () => setPalette(true),
    inspector,
    openInspector: setInspector,
    closeInspector: () => setInspector(null),
    ...store
  };
  const VIEWS = {
    cortex: window.CortexView,
    radar: window.RadarView,
    fivetran: window.FivetranView,
    graph: window.GraphView,
    context: window.ContextView,
    evidence: window.EvidenceView,
    actions: window.ActionsView,
    llmops: window.LLMOpsView,
    improvement: window.ImprovementView,
    replay: window.ReplayView,
    compliance: window.ComplianceView,
    report: window.ReportView,
    architecture: window.ArchitectureView,
    settings: window.SettingsView
  };
  const ViewComp = VIEWS[route];
  return React.createElement(ROContext.Provider, {
    value: ctx
  }, React.createElement("canvas", {
    ref: bgRef,
    style: {
      position: "fixed",
      inset: 0,
      width: "100%",
      height: "100%",
      zIndex: 0,
      pointerEvents: "none"
    }
  }), React.createElement("div", {
    id: "ro-aurora"
  }, React.createElement("span", {
    className: "a1"
  }), React.createElement("span", {
    className: "a2"
  })), React.createElement("div", {
    id: "ro-grain"
  }), briefing && React.createElement("div", {
    id: "ro-brief-bar",
    style: {
      width: briefPct + "%"
    }
  }), React.createElement("div", {
    style: {
      position: "relative",
      zIndex: 1,
      display: "flex",
      minHeight: "100vh"
    }
  }, React.createElement(NavRail, {
    open: drawer,
    onClose: () => setDrawer(false)
  }), React.createElement("div", {
    style: {
      flex: 1,
      minWidth: 0,
      display: "flex",
      flexDirection: "column"
    }
  }, React.createElement(TopStatusBar, {
    onMenu: () => setDrawer(true)
  }), React.createElement("main", {
    style: {
      flex: 1,
      padding: "20px clamp(14px, 2.2vw, 28px) 64px",
      maxWidth: 1500,
      width: "100%",
      margin: "0 auto"
    }
  }, ViewComp ? React.createElement(ViewErrorBoundary, {
    key: route
  }, React.createElement(ViewComp, null)) : window.Placeholder ? React.createElement(window.Placeholder, {
    key: route,
    routeId: route
  }) : null))), route === "cortex" && React.createElement("button", {
    onClick: playBriefing,
    disabled: briefing,
    "aria-label": "Play auto briefing",
    style: {
      position: "fixed",
      right: 22,
      bottom: 22,
      zIndex: 120,
      display: "inline-flex",
      alignItems: "center",
      gap: 9,
      padding: "12px 18px",
      borderRadius: "var(--r-pill)",
      border: "1px solid rgba(6,182,212,.5)",
      background: "linear-gradient(135deg, rgba(6,182,212,.92), rgba(59,130,246,.92))",
      color: "#04121d",
      fontFamily: "var(--f-sans)",
      fontWeight: 700,
      fontSize: 13.5,
      cursor: briefing ? "default" : "pointer",
      boxShadow: "0 10px 30px -8px rgba(6,182,212,.6), 0 0 0 1px rgba(255,255,255,.06) inset",
      overflow: "hidden",
      opacity: briefing ? 0.85 : 1,
      transition: "transform .2s, box-shadow .2s"
    },
    onMouseEnter: e => {
      if (!briefing) {
        e.currentTarget.style.transform = "translateY(-2px)";
        e.currentTarget.style.boxShadow = "0 16px 40px -8px rgba(6,182,212,.75)";
      }
    },
    onMouseLeave: e => {
      e.currentTarget.style.transform = "none";
      e.currentTarget.style.boxShadow = "0 10px 30px -8px rgba(6,182,212,.6), 0 0 0 1px rgba(255,255,255,.06) inset";
    }
  }, React.createElement("span", {
    style: {
      position: "absolute",
      top: 0,
      bottom: 0,
      width: 40,
      left: 0,
      background: "linear-gradient(90deg, transparent, rgba(255,255,255,.5), transparent)",
      animation: briefing ? "none" : "ro-sheen 3.4s ease-in-out infinite",
      pointerEvents: "none"
    }
  }), React.createElement(Icon, {
    name: briefing ? "activity" : "play",
    size: 16,
    fill: !briefing
  }), briefing ? "Playing briefing…" : "Play briefing"), React.createElement(CommandPalette, {
    open: palette,
    onClose: () => setPalette(false),
    navigate: navigate,
    judge: playBriefing
  }), React.createElement(InspectorDrawer, {
    node: inspector,
    onClose: () => setInspector(null)
  }), React.createElement(TweaksPanel, {
    title: "Tweaks"
  }, React.createElement(TweakSection, {
    label: "Signal palette"
  }), React.createElement(TweakRadio, {
    label: "Agent accent",
    value: tw.signal,
    options: ["cyan", "amber", "emerald"],
    onChange: v => setTweak("signal", v)
  }), React.createElement(TweakSection, {
    label: "Atmosphere"
  }), React.createElement(TweakRadio, {
    label: "Command mood",
    value: tw.atmosphere,
    options: ["focus", "balanced", "cinematic"],
    onChange: v => setTweak("atmosphere", v)
  }), React.createElement(TweakSection, {
    label: "Console density"
  }), React.createElement(TweakRadio, {
    label: "Density",
    value: tw.density,
    options: ["compact", "comfortable", "spacious"],
    onChange: v => setTweak("density", v)
  })));
}
window.App = App;
window.useRO = useRO;
window.Logo = Logo;
window.AgentOrb = AgentOrb;

/* ===== sections1.jsx ===== */
function RecallIntakeCard({
  onTrigger,
  started
}) {
  const r = window.RO.recall;
  return React.createElement("div", {
    className: "panel",
    style: {
      padding: 20,
      display: "flex",
      flexDirection: "column",
      gap: 16
    }
  }, React.createElement("div", {
    style: {
      display: "flex",
      alignItems: "flex-start",
      justifyContent: "space-between",
      gap: 14,
      flexWrap: "wrap"
    }
  }, React.createElement("div", {
    style: {
      minWidth: 0
    }
  }, React.createElement("div", {
    style: {
      display: "flex",
      alignItems: "center",
      gap: 10,
      marginBottom: 9,
      flexWrap: "wrap"
    }
  }, React.createElement(ClassBadge, {
    classification: r.classification,
    size: "lg"
  }), React.createElement("span", {
    style: {
      display: "inline-flex",
      alignItems: "center",
      gap: 6,
      fontSize: 11,
      fontFamily: "var(--f-mono)",
      color: "var(--t3)"
    }
  }, React.createElement(Icon, {
    name: "external",
    size: 12
  }), " Source: openFDA")), React.createElement("h3", {
    style: {
      margin: 0,
      fontSize: 19,
      fontWeight: 600,
      fontFamily: "var(--f-display)",
      letterSpacing: "-.01em",
      color: "var(--t1)",
      lineHeight: 1.2
    }
  }, r.productDescription), React.createElement("div", {
    className: "mono",
    style: {
      fontSize: 11.5,
      color: "var(--cyan)",
      marginTop: 6
    }
  }, r.recallId, " \xB7 ", r.recallingFirm)), React.createElement("div", {
    style: {
      flex: "none"
    }
  }, !started ? React.createElement(Button, {
    variant: "primary",
    size: "lg",
    icon: "zap",
    onClick: onTrigger
  }, "Trigger Containment") : React.createElement(Badge, {
    tone: "success"
  }, React.createElement(Icon, {
    name: "check",
    size: 11
  }), " Containment running"))), React.createElement("div", {
    style: {
      height: 1,
      background: "var(--border)"
    }
  }), React.createElement("div", {
    style: {
      display: "grid",
      gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))",
      gap: 14
    }
  }, React.createElement(IntakeField, {
    label: "Reason",
    value: r.reason
  }), React.createElement(IntakeField, {
    label: "Distribution pattern",
    value: r.distributionPattern
  })), React.createElement("div", {
    style: {
      display: "flex",
      flexWrap: "wrap",
      gap: 20
    }
  }, React.createElement(IntakeMeta, {
    label: "Event date",
    value: r.eventDate,
    mono: true
  }), React.createElement(IntakeMeta, {
    label: "Recalling firm",
    value: r.recallingFirm
  }), React.createElement(IntakeMeta, {
    label: "Matched SKUs",
    value: r.skuMatches.length + " internal",
    mono: true
  })), React.createElement("div", {
    style: {
      display: "flex",
      flexWrap: "wrap",
      gap: 16
    }
  }, React.createElement(ChipRow, {
    label: "Lot codes",
    items: r.lotCodes,
    tone: "class1"
  }), React.createElement(ChipRow, {
    label: "UPCs",
    items: r.upcs,
    tone: "muted"
  })));
}
function IntakeField({
  label,
  value
}) {
  return React.createElement("div", null, React.createElement("div", {
    className: "label",
    style: {
      marginBottom: 5
    }
  }, label), React.createElement("p", {
    style: {
      margin: 0,
      fontSize: 13,
      color: "var(--t2)",
      lineHeight: 1.5
    }
  }, value));
}
function IntakeMeta({
  label,
  value,
  mono
}) {
  return React.createElement("div", null, React.createElement("div", {
    className: "label",
    style: {
      marginBottom: 4
    }
  }, label), React.createElement("div", {
    className: mono ? "mono" : "",
    style: {
      fontSize: 13,
      color: "var(--t1)",
      fontWeight: 500
    }
  }, value));
}
function ChipRow({
  label,
  items,
  tone
}) {
  return React.createElement("div", null, React.createElement("div", {
    className: "label",
    style: {
      marginBottom: 6
    }
  }, label), React.createElement("div", {
    style: {
      display: "flex",
      gap: 7,
      flexWrap: "wrap"
    }
  }, items.map((it, i) => React.createElement("span", {
    key: i,
    className: "mono",
    style: {
      fontSize: 11.5,
      padding: "3px 9px",
      borderRadius: "var(--r-xs)",
      color: tone === "class1" ? "var(--class-1)" : "var(--t2)",
      background: tone === "class1" ? "var(--class-1-dim)" : "var(--panel-3)",
      border: "1px solid " + (tone === "class1" ? "rgba(239,68,68,.3)" : "var(--border-2)")
    }
  }, it))));
}
function FivetranSyncStrip() {
  const {
    sync,
    analyzeOn,
    phase
  } = useRO();
  const runs = window.RO.syncRuns;
  const done = runs.every(r => sync[r.id] === "success");
  const active = runs.some(r => sync[r.id] === "syncing");
  const total = runs.length;
  const completed = runs.filter(r => sync[r.id] === "success").length;
  return React.createElement("div", {
    className: "panel",
    style: {
      padding: 20
    }
  }, React.createElement(SectionTitle, {
    icon: "refresh",
    title: "Fivetran-synced operational data",
    sub: "Partner MCP triggers connector syncs into the BigQuery operational warehouse.",
    right: React.createElement("span", {
      style: {
        display: "inline-flex",
        alignItems: "center",
        gap: 8,
        fontSize: 11.5,
        fontFamily: "var(--f-mono)",
        color: done ? "var(--success)" : active ? "var(--cyan)" : "var(--t3)"
      }
    }, React.createElement(StatusDot, {
      tone: done ? "success" : active ? "cyan" : "muted",
      live: active
    }), phase === "idle" ? "8 sources idle" : done ? "8 sources synced" : "SYNCING " + completed + "/" + total + " SOURCES…")
  }), React.createElement("div", {
    style: {
      display: "grid",
      gridTemplateColumns: "repeat(auto-fit, minmax(250px, 1fr))",
      gap: 10
    }
  }, runs.map(r => {
    const st = sync[r.id];
    const pct = st === "success" ? 100 : st === "syncing" ? 66 : 0;
    const c = st === "success" ? "var(--success)" : st === "syncing" ? "var(--cyan)" : "var(--t4)";
    return React.createElement("div", {
      key: r.id,
      style: {
        padding: "12px 13px",
        background: "var(--panel-2)",
        border: "1px solid var(--border)",
        borderRadius: "var(--r-sm)"
      }
    }, React.createElement("div", {
      style: {
        display: "flex",
        alignItems: "center",
        justifyContent: "space-between",
        gap: 8,
        marginBottom: 8
      }
    }, React.createElement("div", {
      style: {
        minWidth: 0
      }
    }, React.createElement("div", {
      style: {
        fontSize: 12.5,
        fontWeight: 600,
        color: "var(--t1)",
        whiteSpace: "nowrap",
        overflow: "hidden",
        textOverflow: "ellipsis"
      }
    }, r.source), React.createElement("div", {
      className: "mono",
      style: {
        fontSize: 10,
        color: "var(--t3)",
        marginTop: 2
      }
    }, r.connector)), React.createElement("span", {
      style: {
        display: "inline-flex",
        color: c,
        flex: "none"
      }
    }, st === "success" ? React.createElement(Icon, {
      name: "check",
      size: 15
    }) : st === "syncing" ? React.createElement("span", {
      className: "spin",
      style: {
        display: "flex"
      }
    }, React.createElement(Icon, {
      name: "refresh",
      size: 13
    })) : React.createElement(Icon, {
      name: "dot",
      size: 13,
      fill: true
    }))), React.createElement("div", {
      style: {
        height: 4,
        background: "var(--bg-2)",
        borderRadius: 999,
        overflow: "hidden"
      }
    }, React.createElement("div", {
      style: {
        width: pct + "%",
        height: "100%",
        background: st === "success" ? "var(--success)" : "var(--accent-grad)",
        borderRadius: 999,
        transition: "width .5s cubic-bezier(.22,.61,.36,1)"
      }
    })), React.createElement("div", {
      style: {
        display: "flex",
        alignItems: "center",
        justifyContent: "space-between",
        marginTop: 7
      }
    }, React.createElement("span", {
      className: "mono",
      style: {
        fontSize: 10,
        color: "var(--t3)"
      }
    }, st === "pending" ? "queued" : r.recordsSynced.toLocaleString() + " rows"), React.createElement("span", {
      className: "mono",
      style: {
        fontSize: 10,
        color: "var(--t4)",
        display: "inline-flex",
        alignItems: "center",
        gap: 4
      }
    }, "\u2192 ", React.createElement(Icon, {
      name: "database",
      size: 10
    }), " BigQuery")));
  })), done && React.createElement("div", {
    className: "rise",
    style: {
      marginTop: 14,
      padding: "11px 14px",
      background: "var(--success-dim)",
      border: "1px solid rgba(16,185,129,.3)",
      borderRadius: "var(--r-sm)",
      display: "flex",
      alignItems: "center",
      gap: 10
    }
  }, React.createElement(Icon, {
    name: "database",
    size: 16,
    style: {
      color: "var(--success)"
    }
  }), React.createElement("span", {
    style: {
      fontSize: 13,
      color: "var(--t1)"
    }
  }, "BigQuery operational warehouse refreshed \u2014 ", React.createElement("span", {
    className: "mono",
    style: {
      color: "var(--success)"
    }
  }, "158,888 rows"), " across 8 sources.")));
}
function ReasoningTrace() {
  const {
    reasoningOn,
    onReasoningDone
  } = useRO();
  const lines = window.RO.reasoning;
  const [revealed, setRevealed] = useState([]);
  const [done, setDone] = useState(false);
  const startedRef = useRef(false);
  const interval = useRef(0);
  const firedDone = useRef(false);
  const scrollRef = useRef(null);
  useEffect(() => {
    if (!reasoningOn || startedRef.current) return;
    startedRef.current = true;
    const tone = {
      cyan: "var(--cyan)",
      dim: "var(--t2)",
      ok: "var(--success)",
      warn: "var(--warning)"
    };
    const MS_CHAR = 7,
      GAP = 120;
    let acc = 0;
    const windows = lines.map(l => {
      const start = acc;
      const type = l.t.length * MS_CHAR;
      acc += type + GAP;
      return {
        start,
        type
      };
    });
    const total = acc;
    const t0 = performance.now();
    const render = () => {
      const E = performance.now() - t0;
      const out = lines.map((l, i) => {
        const w = windows[i];
        if (E < w.start) return null;
        const chars = Math.min(l.t.length, Math.floor((E - w.start) / MS_CHAR));
        return {
          text: l.t.slice(0, chars),
          tone: tone[l.tone] || "var(--t2)",
          full: chars >= l.t.length
        };
      });
      setRevealed(out);
      if (scrollRef.current) scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
      if (E >= total) {
        clearInterval(interval.current);
        setDone(true);
        if (!firedDone.current) {
          firedDone.current = true;
          setTimeout(() => onReasoningDone(), 350);
        }
      }
    };
    render();
    interval.current = setInterval(render, 28);
    return () => clearInterval(interval.current);
  }, [reasoningOn]);
  return React.createElement("div", {
    className: "panel",
    style: {
      padding: 0,
      overflow: "hidden",
      display: "flex",
      flexDirection: "column",
      height: "100%"
    }
  }, React.createElement("div", {
    style: {
      display: "flex",
      alignItems: "center",
      justifyContent: "space-between",
      padding: "11px 16px",
      borderBottom: "1px solid var(--border)",
      background: "var(--bg-2)"
    }
  }, React.createElement("div", {
    style: {
      display: "flex",
      alignItems: "center",
      gap: 9
    }
  }, React.createElement(Icon, {
    name: "brain",
    size: 15,
    style: {
      color: "var(--cyan)"
    }
  }), React.createElement("span", {
    style: {
      fontSize: 13,
      fontWeight: 600,
      fontFamily: "var(--f-display)",
      color: "var(--t1)"
    }
  }, "Gemini-generated containment plan")), React.createElement("span", {
    style: {
      display: "inline-flex",
      alignItems: "center",
      gap: 6,
      fontSize: 11,
      fontFamily: "var(--f-mono)",
      color: done ? "var(--success)" : reasoningOn ? "var(--cyan)" : "var(--t3)"
    }
  }, React.createElement(StatusDot, {
    tone: done ? "success" : reasoningOn ? "cyan" : "muted",
    live: reasoningOn && !done
  }), " ", done ? "plan ready" : reasoningOn ? "reasoning" : "idle")), React.createElement("div", {
    ref: scrollRef,
    className: "no-sb",
    style: {
      padding: "14px 16px",
      fontFamily: "var(--f-mono)",
      fontSize: 12.5,
      lineHeight: 1.85,
      flex: 1,
      overflowY: "auto",
      minHeight: 240
    }
  }, !reasoningOn && React.createElement("div", {
    style: {
      color: "var(--t3)",
      display: "flex",
      alignItems: "center",
      gap: 8,
      height: "100%"
    }
  }, React.createElement("span", {
    className: "mono",
    style: {
      color: "var(--t4)"
    }
  }, "$"), " awaiting trigger \u2014 agent will narrate its reasoning here."), revealed.map((l, i) => l && React.createElement("div", {
    key: i,
    style: {
      display: "flex",
      gap: 9,
      color: l.tone
    }
  }, React.createElement("span", {
    style: {
      color: "var(--t4)",
      flex: "none"
    }
  }, ">"), React.createElement("span", {
    style: {
      wordBreak: "break-word"
    }
  }, l.text, !l.full && React.createElement("span", {
    className: "caret",
    style: {
      color: "var(--cyan)"
    }
  }, "\u258B"))))));
}
function MetricTile({
  icon,
  label,
  value,
  sub,
  tone = "cyan",
  animate,
  decimals = 0,
  big,
  suffix = "",
  delay = 0
}) {
  const v = useCountUp(value, {
    animate,
    decimals,
    duration: 1300
  });
  const c = RTONE[tone] || "var(--cyan)";
  const done = !animate || v >= value - (decimals ? 0.01 : 0.5);
  const [pinged, setPinged] = useState(false);
  useEffect(() => {
    if (animate && done && !pinged) setPinged(true);
  }, [done, animate]);
  return React.createElement("div", {
    className: "rise panel lift",
    style: {
      "--dur": "0.45s",
      animationDelay: delay + "ms",
      padding: big ? "18px 18px" : "15px 16px",
      display: "flex",
      flexDirection: "column",
      gap: 9,
      minWidth: 0,
      position: "relative",
      overflow: "hidden"
    }
  }, React.createElement("div", {
    style: {
      position: "absolute",
      inset: 0,
      background: "radial-gradient(120% 80% at 100% 0%, color-mix(in srgb," + c + " 9%, transparent), transparent 60%)",
      pointerEvents: "none",
      opacity: animate ? 1 : 0.4
    }
  }), React.createElement("div", {
    style: {
      display: "flex",
      alignItems: "center",
      justifyContent: "space-between",
      position: "relative"
    }
  }, React.createElement("span", {
    className: "label",
    style: {
      whiteSpace: "nowrap",
      overflow: "hidden",
      textOverflow: "ellipsis"
    }
  }, label), React.createElement("span", {
    className: pinged ? "ping" : "",
    style: {
      width: 27,
      height: 27,
      borderRadius: "var(--r-xs)",
      flex: "none",
      background: "color-mix(in srgb," + c + " 14%, transparent)",
      border: "1px solid color-mix(in srgb," + c + " 30%, transparent)",
      display: "grid",
      placeItems: "center",
      color: c
    }
  }, React.createElement(Icon, {
    name: icon,
    size: 14
  }))), React.createElement("div", {
    className: "mono num-grad",
    style: {
      fontSize: big ? "clamp(34px, 4.6vw, 58px)" : "clamp(25px, 3.1vw, 36px)",
      fontWeight: 700,
      letterSpacing: "-.025em",
      lineHeight: 1,
      position: "relative",
      fontVariantNumeric: "tabular-nums"
    }
  }, animate ? decimals ? v.toFixed(decimals) : Math.round(v).toLocaleString() : decimals ? value.toFixed(decimals) : value.toLocaleString(), suffix), React.createElement("div", {
    className: "spark",
    style: {
      position: "relative"
    }
  }, React.createElement("i", {
    style: {
      background: "linear-gradient(90deg, " + c + ", color-mix(in srgb," + c + " 40%, transparent))",
      transform: "scaleX(" + (animate ? 1 : 0.08) + ")",
      boxShadow: animate ? "0 0 10px -1px " + c : "none"
    }
  })), sub && React.createElement("div", {
    className: "label",
    style: {
      color: "color-mix(in srgb," + c + " 80%, var(--t3))",
      position: "relative"
    }
  }, sub));
}
Object.assign(window, {
  RecallIntakeCard,
  FivetranSyncStrip,
  ReasoningTrace,
  MetricTile,
  IntakeField,
  IntakeMeta,
  ChipRow
});

/* ===== sections2.jsx ===== */
const TIER = {
  critical: {
    c: "var(--class-1)",
    label: "Critical"
  },
  high: {
    c: "var(--class-2)",
    label: "High"
  },
  medium: {
    c: "var(--class-3)",
    label: "Medium"
  },
  low: {
    c: "var(--t3)",
    label: "Low"
  }
};
const LOC_ICON = {
  stadium_concession: "users",
  store: "store",
  warehouse: "building"
};
function BlastRadiusMap({
  height = 380
}) {
  const {
    analyzeOn
  } = useRO();
  const locs = window.RO.locations;
  const [lit, setLit] = useState(analyzeOn ? locs.length : 0);
  const timer = useRef(0);
  useEffect(() => {
    if (!analyzeOn) {
      setLit(0);
      return;
    }
    let n = 0;
    const tick = () => {
      n += 1;
      setLit(n);
      if (n < locs.length) timer.current = setTimeout(tick, 55);
    };
    tick();
    return () => clearTimeout(timer.current);
  }, [analyzeOn]);
  return React.createElement("div", {
    className: "panel",
    style: {
      padding: 0,
      overflow: "hidden",
      position: "relative"
    }
  }, React.createElement("div", {
    style: {
      display: "flex",
      alignItems: "center",
      justifyContent: "space-between",
      padding: "12px 16px",
      borderBottom: "1px solid var(--border)",
      position: "relative",
      zIndex: 2
    }
  }, React.createElement("div", {
    style: {
      display: "flex",
      alignItems: "center",
      gap: 9
    }
  }, React.createElement(Icon, {
    name: "radar",
    size: 15,
    style: {
      color: "var(--cyan)"
    }
  }), React.createElement("span", {
    style: {
      fontSize: 13,
      fontWeight: 600,
      fontFamily: "var(--f-display)",
      color: "var(--t1)"
    }
  }, "BigQuery blast-radius analysis")), React.createElement("span", {
    className: "mono",
    style: {
      fontSize: 11,
      color: analyzeOn ? "var(--class-1)" : "var(--t3)"
    }
  }, analyzeOn ? lit + " / " + locs.length + " locations" : "standby")), React.createElement("div", {
    style: {
      position: "relative",
      height,
      background: "radial-gradient(120% 100% at 30% 20%, rgba(6,182,212,0.05), transparent 55%), radial-gradient(120% 100% at 80% 90%, rgba(239,68,68,0.05), transparent 55%), var(--bg-2)",
      overflow: "hidden"
    }
  }, React.createElement("svg", {
    width: "100%",
    height: "100%",
    style: {
      position: "absolute",
      inset: 0,
      opacity: 0.5
    },
    preserveAspectRatio: "none"
  }, React.createElement("defs", null, React.createElement("pattern", {
    id: "rogrid",
    width: "44",
    height: "44",
    patternUnits: "userSpaceOnUse"
  }, React.createElement("path", {
    d: "M44 0H0V44",
    fill: "none",
    stroke: "rgba(138,153,176,0.08)",
    strokeWidth: "1"
  }))), React.createElement("rect", {
    width: "100%",
    height: "100%",
    fill: "url(#rogrid)"
  })), locs.map((l, i) => {
    const on = i < lit;
    const tier = TIER[l.riskTier];
    const sz = l.type === "warehouse" ? 13 : l.riskTier === "critical" ? 11 : 8;
    return React.createElement("div", {
      key: l.id,
      title: l.name + " · " + tier.label,
      style: {
        position: "absolute",
        left: l.mx * 100 + "%",
        top: l.my * 100 + "%",
        transform: "translate(-50%,-50%)",
        zIndex: 1
      }
    }, on && l.riskTier === "critical" && React.createElement("span", {
      style: {
        position: "absolute",
        left: "50%",
        top: "50%",
        width: sz * 3,
        height: sz * 3,
        borderRadius: "50%",
        border: "1.5px solid " + tier.c,
        animation: "ro-ripple 2.4s ease-out infinite",
        animationDelay: i % 6 * 0.3 + "s"
      }
    }), React.createElement("span", {
      style: {
        display: "block",
        width: sz,
        height: sz,
        borderRadius: "50%",
        flex: "none",
        background: on ? tier.c : "var(--t4)",
        border: "1.5px solid " + (on ? "color-mix(in srgb," + tier.c + " 60%, #fff)" : "var(--border-2)"),
        boxShadow: on ? "0 0 12px -1px " + tier.c : "none",
        transition: "all .3s",
        opacity: on ? 1 : 0.3
      }
    }));
  }), !analyzeOn && React.createElement("div", {
    style: {
      position: "absolute",
      inset: 0,
      display: "grid",
      placeItems: "center",
      zIndex: 2
    }
  }, React.createElement("div", {
    style: {
      textAlign: "center",
      color: "var(--t3)"
    }
  }, React.createElement(Icon, {
    name: "radar",
    size: 28,
    style: {
      color: "var(--t4)",
      margin: "0 auto 10px"
    }
  }), React.createElement("div", {
    style: {
      fontSize: 13,
      color: "var(--t2)"
    }
  }, "Blast radius not yet computed"), React.createElement("div", {
    className: "mono",
    style: {
      fontSize: 11,
      marginTop: 4
    }
  }, "trigger containment to map affected locations"))), React.createElement("div", {
    style: {
      position: "absolute",
      left: 14,
      bottom: 12,
      display: "flex",
      gap: 12,
      flexWrap: "wrap",
      zIndex: 3,
      background: "rgba(13,19,32,0.7)",
      padding: "7px 11px",
      borderRadius: "var(--r-sm)",
      border: "1px solid var(--border)",
      backdropFilter: "blur(6px)"
    }
  }, Object.entries(TIER).map(([k, v]) => React.createElement("span", {
    key: k,
    style: {
      display: "inline-flex",
      alignItems: "center",
      gap: 6,
      fontSize: 10.5,
      fontFamily: "var(--f-mono)",
      color: "var(--t2)"
    }
  }, React.createElement("span", {
    style: {
      width: 8,
      height: 8,
      borderRadius: "50%",
      background: v.c
    }
  }), " ", v.label)))));
}
const ACTION_ICON = {
  STOP_SALE: "lock",
  SHELF_PULL: "package",
  SUPPLIER_HOLD: "truck",
  CUSTOMER_NOTICE: "bell",
  REPLACEMENT_PO: "refresh",
  COMPLIANCE_REPORT: "fileCheck"
};
function ActionCard({
  action,
  state,
  onApprove,
  onReject,
  delay = 0
}) {
  const [showEv, setShowEv] = useState(false);
  const executed = state.status === "executed";
  const rejected = state.approvalState === "rejected";
  const recorded = state.recorded !== false;
  const pt = PRIORITY_TONE[action.priority];
  const evReg = window.RO.evidence;
  return React.createElement("div", {
    className: "rise panel lift",
    style: {
      "--dur": "0.5s",
      animationDelay: delay + "ms",
      padding: 17,
      borderColor: executed ? "rgba(16,185,129,.5)" : rejected ? "rgba(239,68,68,.4)" : "var(--border)",
      boxShadow: executed ? "var(--glow-emerald)" : "var(--sh-1)",
      transition: "border-color .4s, box-shadow .4s",
      animationName: executed ? "ro-exec" : undefined,
      animationDuration: executed ? "0.6s" : undefined,
      animationIterationCount: 1
    }
  }, React.createElement("div", {
    style: {
      display: "flex",
      alignItems: "flex-start",
      gap: 13
    }
  }, React.createElement("div", {
    style: {
      width: 38,
      height: 38,
      borderRadius: "var(--r-sm)",
      flex: "none",
      display: "grid",
      placeItems: "center",
      background: executed ? "var(--success-dim)" : "var(--panel-3)",
      border: "1px solid " + (executed ? "rgba(16,185,129,.35)" : "var(--border-2)"),
      color: executed ? "var(--success)" : "var(--cyan)"
    }
  }, React.createElement(Icon, {
    name: executed ? "shieldCheck" : ACTION_ICON[action.type],
    size: 19
  })), React.createElement("div", {
    style: {
      flex: 1,
      minWidth: 0
    }
  }, React.createElement("div", {
    style: {
      display: "flex",
      alignItems: "center",
      gap: 8,
      flexWrap: "wrap",
      marginBottom: 5
    }
  }, React.createElement(Badge, {
    tone: pt
  }, action.priority), React.createElement("span", {
    className: "mono",
    style: {
      fontSize: 10.5,
      color: "var(--t3)"
    }
  }, action.type.replace(/_/g, " ")), executed && React.createElement(Badge, {
    tone: "success"
  }, "Approved"), rejected && React.createElement(Badge, {
    tone: "danger"
  }, "Rejected")), React.createElement("h4", {
    style: {
      margin: 0,
      fontSize: 15,
      fontWeight: 600,
      color: "var(--t1)",
      letterSpacing: "-.01em"
    }
  }, action.title), React.createElement("div", {
    style: {
      display: "flex",
      gap: 14,
      flexWrap: "wrap",
      marginTop: 7
    }
  }, React.createElement(Meta, {
    label: "Owner",
    value: action.owner
  }), React.createElement(Meta, {
    label: "Scope",
    value: action.scope
  }), React.createElement(Meta, {
    label: "Risk",
    value: action.risk,
    tone: action.risk === "high" ? "var(--class-1)" : action.risk === "medium" ? "var(--class-2)" : "var(--success)"
  })))), React.createElement("p", {
    style: {
      margin: "13px 0 0",
      fontSize: 12.5,
      color: "var(--t2)",
      lineHeight: 1.55,
      background: "var(--bg-2)",
      padding: "11px 13px",
      borderRadius: "var(--r-sm)",
      border: "1px solid var(--border)"
    }
  }, action.draft), React.createElement("div", {
    style: {
      display: "flex",
      alignItems: "center",
      gap: 8,
      marginTop: 11,
      flexWrap: "wrap"
    }
  }, React.createElement("span", {
    className: "label",
    style: {
      marginRight: 2
    }
  }, "Evidence"), action.evidenceIds.map(eid => React.createElement("span", {
    key: eid,
    className: "mono",
    style: {
      fontSize: 10.5,
      padding: "3px 8px",
      borderRadius: "var(--r-xs)",
      color: "var(--cyan)",
      background: "var(--cyan-dim)",
      border: "1px solid var(--cyan-line)"
    }
  }, evReg[eid]?.label || eid))), showEv && React.createElement("div", {
    style: {
      marginTop: 11,
      display: "flex",
      flexDirection: "column",
      gap: 7
    }
  }, action.evidenceIds.map(eid => {
    const e = evReg[eid];
    if (!e) return null;
    return React.createElement("div", {
      key: eid,
      style: {
        display: "flex",
        alignItems: "center",
        justifyContent: "space-between",
        gap: 10,
        padding: "9px 11px",
        background: "var(--bg-2)",
        borderRadius: "var(--r-sm)",
        border: "1px solid var(--border)"
      }
    }, React.createElement("div", {
      style: {
        minWidth: 0
      }
    }, React.createElement("div", {
      style: {
        fontSize: 12.5,
        color: "var(--t1)",
        fontWeight: 500
      }
    }, e.label), React.createElement("div", {
      className: "mono",
      style: {
        fontSize: 10.5,
        color: "var(--t3)",
        marginTop: 2
      }
    }, e.detail)), React.createElement(Badge, {
      tone: "blue"
    }, e.source));
  })), React.createElement("div", {
    style: {
      display: "flex",
      alignItems: "center",
      gap: 8,
      marginTop: 14,
      flexWrap: "wrap"
    }
  }, !executed && !rejected ? React.createElement(React.Fragment, null, React.createElement(Button, {
    variant: "success",
    size: "sm",
    icon: "check",
    onClick: () => onApprove(action)
  }, "Approve"), React.createElement(Button, {
    variant: "ghost",
    size: "sm",
    onClick: () => onReject(action.id)
  }, "Reject")) : executed ? React.createElement("span", {
    style: {
      display: "inline-flex",
      alignItems: "center",
      gap: 7,
      fontSize: 12.5,
      color: recorded ? "var(--success)" : "var(--warning)",
      fontWeight: 600
    }
  }, React.createElement(Icon, {
    name: recorded ? "shieldCheck" : "alert",
    size: 15
  }), " ", recorded ? "Approved · audit-logged (no external dispatch)" : "Approved locally · ⚠ offline — not recorded server-side") : React.createElement(Button, {
    variant: "ghost",
    size: "sm",
    icon: "refresh",
    onClick: () => onReject(action.id)
  }, "Re-draft"), React.createElement("button", {
    onClick: () => setShowEv(v => !v),
    style: {
      marginLeft: "auto",
      background: "none",
      border: "none",
      color: "var(--t3)",
      fontSize: 12,
      cursor: "pointer",
      display: "inline-flex",
      alignItems: "center",
      gap: 5,
      fontFamily: "var(--f-mono)"
    }
  }, "Inspect evidence ", React.createElement(Icon, {
    name: "chevronDown",
    size: 13,
    style: {
      transform: showEv ? "rotate(180deg)" : "none",
      transition: "transform .2s"
    }
  }))));
}
function Meta({
  label,
  value,
  tone
}) {
  return React.createElement("div", {
    style: {
      minWidth: 0
    }
  }, React.createElement("div", {
    className: "label",
    style: {
      fontSize: 9.5
    }
  }, label), React.createElement("div", {
    style: {
      fontSize: 12,
      color: tone || "var(--t2)",
      fontWeight: 500,
      marginTop: 2,
      textTransform: tone ? "capitalize" : "none"
    }
  }, value));
}
function ActionQueue({
  onApprove
}) {
  const {
    actionState,
    rejectAction
  } = useRO();
  return React.createElement("div", {
    style: {
      display: "flex",
      flexDirection: "column",
      gap: 13
    }
  }, window.RO.actions.map((a, i) => React.createElement(ActionCard, {
    key: a.id,
    action: a,
    state: actionState[a.id],
    onApprove: onApprove,
    onReject: rejectAction,
    delay: i * 60
  })));
}
function ApprovalModal({
  action,
  onApprove,
  onCancel
}) {
  const checklist = ["FDA recall source attached", "Fivetran sync completed", "BigQuery evidence attached", "Customer-facing impact reviewed", "Rollback / correction path available", "Audit log entry will be written"];
  const [checks, setChecks] = useState(checklist.map(() => true));
  useEffect(() => {
    const onKey = e => {
      if (e.key === "Escape") onCancel();
    };
    window.addEventListener("keydown", onKey);
    document.body.style.overflow = "hidden";
    return () => {
      window.removeEventListener("keydown", onKey);
      document.body.style.overflow = "";
    };
  }, []);
  const all = checks.every(Boolean);
  return React.createElement("div", {
    role: "dialog",
    "aria-modal": "true",
    "aria-label": "Approve containment action",
    onClick: onCancel,
    style: {
      position: "fixed",
      inset: 0,
      zIndex: 100,
      background: "rgba(4,7,13,0.76)",
      backdropFilter: "blur(6px)",
      display: "grid",
      placeItems: "center",
      padding: 18
    }
  }, React.createElement("div", {
    onClick: e => e.stopPropagation(),
    className: "rise",
    style: {
      "--dur": "0.26s",
      width: "min(520px,100%)",
      background: "var(--panel)",
      border: "1px solid var(--border-3)",
      borderRadius: "var(--r-md)",
      boxShadow: "var(--sh-2)",
      overflow: "hidden",
      maxHeight: "92vh",
      display: "flex",
      flexDirection: "column"
    }
  }, React.createElement("div", {
    style: {
      padding: "18px 20px",
      borderBottom: "1px solid var(--border)",
      display: "flex",
      gap: 13,
      alignItems: "flex-start"
    }
  }, React.createElement("div", {
    style: {
      width: 38,
      height: 38,
      borderRadius: "var(--r-sm)",
      background: "var(--cyan-dim)",
      border: "1px solid var(--cyan-line)",
      display: "grid",
      placeItems: "center",
      color: "var(--cyan)",
      flex: "none"
    }
  }, React.createElement(Icon, {
    name: "shield",
    size: 19
  })), React.createElement("div", {
    style: {
      minWidth: 0
    }
  }, React.createElement("h2", {
    style: {
      margin: 0,
      fontSize: 17,
      fontWeight: 600,
      fontFamily: "var(--f-display)",
      color: "var(--t1)"
    }
  }, "Approve containment action?"), React.createElement("p", {
    style: {
      margin: "5px 0 0",
      fontSize: 12.5,
      color: "var(--t3)",
      lineHeight: 1.5
    }
  }, "No external action executes without approval. This entry will be written to the audit timeline."))), React.createElement("div", {
    style: {
      padding: "16px 20px",
      overflowY: "auto"
    }
  }, React.createElement("div", {
    style: {
      display: "flex",
      alignItems: "center",
      gap: 9,
      marginBottom: 14,
      flexWrap: "wrap"
    }
  }, React.createElement(Badge, {
    tone: PRIORITY_TONE[action.priority]
  }, action.priority), React.createElement("span", {
    className: "mono",
    style: {
      fontSize: 12,
      color: "var(--cyan)"
    }
  }, action.type.replace(/_/g, " ")), React.createElement("span", {
    style: {
      fontSize: 13,
      color: "var(--t1)",
      fontWeight: 500
    }
  }, action.title)), React.createElement("div", {
    className: "label",
    style: {
      marginBottom: 10
    }
  }, "Pre-execution checklist"), React.createElement("div", {
    style: {
      display: "flex",
      flexDirection: "column",
      gap: 8
    }
  }, checklist.map((c, i) => React.createElement("button", {
    key: i,
    onClick: () => setChecks(cs => cs.map((v, j) => j === i ? !v : v)),
    style: {
      display: "flex",
      alignItems: "center",
      gap: 11,
      padding: "10px 12px",
      textAlign: "left",
      cursor: "pointer",
      background: checks[i] ? "var(--success-dim)" : "var(--panel-2)",
      border: "1px solid " + (checks[i] ? "rgba(16,185,129,.3)" : "var(--border-2)"),
      borderRadius: "var(--r-sm)",
      color: "var(--t1)",
      fontFamily: "var(--f-sans)",
      fontSize: 13
    }
  }, React.createElement("span", {
    style: {
      width: 18,
      height: 18,
      borderRadius: "var(--r-xs)",
      flex: "none",
      display: "grid",
      placeItems: "center",
      background: checks[i] ? "var(--success)" : "transparent",
      border: "1px solid " + (checks[i] ? "var(--success)" : "var(--border-3)"),
      color: "#06101c"
    }
  }, checks[i] && React.createElement(Icon, {
    name: "check",
    size: 12,
    stroke: 2.6
  })), c)))), React.createElement("div", {
    style: {
      padding: "14px 20px",
      borderTop: "1px solid var(--border)",
      display: "flex",
      gap: 10,
      justifyContent: "flex-end",
      alignItems: "center"
    }
  }, !all && React.createElement("span", {
    className: "mono",
    style: {
      fontSize: 11,
      color: "var(--warning)",
      marginRight: "auto"
    }
  }, "complete checklist to execute"), React.createElement(Button, {
    variant: "ghost",
    onClick: onCancel
  }, "Cancel"), React.createElement(Button, {
    variant: "primary",
    icon: "zap",
    disabled: !all,
    onClick: () => onApprove(action.id)
  }, "Approve and Execute"))));
}
Object.assign(window, {
  BlastRadiusMap,
  ActionCard,
  ActionQueue,
  ApprovalModal,
  TIER,
  LOC_ICON,
  ACTION_ICON,
  Meta
});

/* ===== sections3.jsx ===== */
const PIPE = [{
  id: "openfda",
  label: "openFDA",
  icon: "external",
  phaseAt: 0
}, {
  id: "mcp",
  label: "Fivetran MCP",
  icon: "refresh",
  phaseAt: 1
}, {
  id: "bq",
  label: "BigQuery",
  icon: "database",
  phaseAt: 2
}, {
  id: "gemini",
  label: "Gemini Agent",
  icon: "brain",
  phaseAt: 3
}, {
  id: "human",
  label: "Human Approval",
  icon: "shield",
  phaseAt: 4
}, {
  id: "report",
  label: "Compliance Report",
  icon: "fileCheck",
  phaseAt: 5
}];
function phaseRank(phase, actionsOn, approvedCount) {
  if (phase === "idle") return -1;
  if (phase === "syncing") return 1;
  if (phase === "reasoning") return 3;
  if (phase === "review") return 4;
  if (phase === "contained") return 6;
  return 0;
}
function PipelineViz() {
  const {
    phase,
    actionsOn,
    approvedCount
  } = useRO();
  const rank = phaseRank(phase, actionsOn, approvedCount);
  return React.createElement("div", {
    className: "panel",
    style: {
      padding: "16px 16px 18px"
    }
  }, React.createElement("div", {
    style: {
      display: "flex",
      alignItems: "center",
      justifyContent: "space-between",
      marginBottom: 14
    }
  }, React.createElement("span", {
    className: "label"
  }, "Live pipeline"), React.createElement("span", {
    style: {
      display: "inline-flex",
      alignItems: "center",
      gap: 6,
      fontSize: 11,
      fontFamily: "var(--f-mono)",
      color: phase === "idle" ? "var(--t3)" : phase === "contained" ? "var(--success)" : "var(--cyan)"
    }
  }, React.createElement(StatusDot, {
    tone: phase === "idle" ? "muted" : phase === "contained" ? "success" : "cyan",
    live: phase !== "idle" && phase !== "contained"
  }), " ", phase)), React.createElement("div", {
    style: {
      display: "flex",
      flexDirection: "column",
      gap: 9
    }
  }, PIPE.map((p, i) => {
    const done = rank > p.phaseAt;
    const active = rank === p.phaseAt || phase === "syncing" && p.id === "mcp" || phase === "reasoning" && p.id === "gemini" || phase === "review" && p.id === "human";
    const c = done ? "var(--success)" : active ? "var(--cyan)" : "var(--t3)";
    const bg = done ? "var(--success-dim)" : active ? "var(--cyan-dim)" : "var(--panel-2)";
    const bd = done ? "rgba(16,185,129,.3)" : active ? "var(--cyan-line)" : "var(--border)";
    return React.createElement("div", {
      key: p.id,
      style: {
        display: "flex",
        alignItems: "center",
        gap: 11
      }
    }, React.createElement("div", {
      style: {
        width: 32,
        height: 32,
        borderRadius: "var(--r-sm)",
        flex: "none",
        display: "grid",
        placeItems: "center",
        background: bg,
        border: "1px solid " + bd,
        color: c,
        transition: "all .4s",
        boxShadow: active ? "0 0 18px -6px var(--cyan)" : "none",
        position: "relative",
        overflow: "hidden"
      }
    }, active && React.createElement("span", {
      style: {
        position: "absolute",
        left: "50%",
        top: -6,
        width: 4,
        height: 4,
        marginLeft: -2,
        borderRadius: "50%",
        background: "var(--cyan)",
        boxShadow: "0 0 8px var(--cyan)",
        animation: "ro-flowdown 1.3s ease-in-out infinite"
      }
    }), done ? React.createElement(Icon, {
      name: "check",
      size: 15
    }) : active ? React.createElement("span", {
      className: "spin",
      style: {
        display: "flex"
      }
    }, React.createElement(Icon, {
      name: "refresh",
      size: 13
    })) : React.createElement(Icon, {
      name: p.icon,
      size: 15
    })), React.createElement("div", {
      style: {
        flex: 1,
        minWidth: 0
      }
    }, React.createElement("div", {
      style: {
        fontSize: 12.5,
        fontWeight: 600,
        color: done || active ? "var(--t1)" : "var(--t2)"
      }
    }, p.label), active && React.createElement("div", {
      style: {
        height: 2,
        marginTop: 5,
        borderRadius: 999,
        background: "var(--bg-2)",
        overflow: "hidden"
      }
    }, React.createElement("span", {
      style: {
        display: "block",
        width: "40%",
        height: "100%",
        background: "var(--accent-grad)",
        borderRadius: 999,
        animation: "ro-sweep 1.4s ease-in-out infinite"
      }
    }))), i < PIPE.length - 1 && React.createElement("span", {
      style: {
        color: "var(--t4)",
        flex: "none"
      }
    }, React.createElement(Icon, {
      name: "chevronDown",
      size: 13
    })));
  })));
}
function deriveTimeline(store) {
  const {
    phase,
    sync,
    actionsOn,
    actionState
  } = store;
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
    au_8: actionsOn ? actionState.act_4?.approvalState === "approved" ? "complete" : "pending" : "pending",
    au_9: actionState.act_6?.approvalState === "approved" ? "complete" : "pending"
  };
  return map;
}
const ACTOR = {
  agent: {
    c: "var(--cyan)",
    label: "Agent",
    icon: "brain"
  },
  human: {
    c: "var(--blue)",
    label: "Human",
    icon: "shield"
  },
  system: {
    c: "var(--t3)",
    label: "System",
    icon: "cpu"
  }
};
function ComplianceTimeline({
  compact
}) {
  const store = useRO();
  const status = deriveTimeline(store);
  const events = window.RO.audit;
  const liveAudit = events.some(e => e.hash);
  const base = new Date();
  base.setSeconds(0);
  return React.createElement("div", {
    style: {
      display: "flex",
      flexDirection: "column"
    }
  }, events.map((e, i) => {
    const st = liveAudit ? "complete" : status[e.id];
    const actor = ACTOR[e.actorType];
    const done = st === "complete";
    const last = i === events.length - 1;
    const c = done ? "var(--success)" : "var(--t4)";
    const t = new Date(base.getTime() - (events.length - i) * 47000);
    const z = n => String(n).padStart(2, "0");
    return React.createElement("div", {
      key: e.id,
      style: {
        display: "flex",
        gap: 13
      }
    }, React.createElement("div", {
      style: {
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        flex: "none",
        width: 22
      }
    }, React.createElement("div", {
      style: {
        width: 20,
        height: 20,
        borderRadius: "50%",
        display: "grid",
        placeItems: "center",
        flex: "none",
        zIndex: 1,
        background: done ? "var(--success-dim)" : "var(--panel-2)",
        border: "1px solid " + (done ? "var(--success)" : "var(--border-2)"),
        color: c,
        transition: "all .3s"
      }
    }, done ? React.createElement(Icon, {
      name: "check",
      size: 11,
      stroke: 2.4
    }) : React.createElement("span", {
      style: {
        width: 5,
        height: 5,
        borderRadius: "50%",
        background: "var(--t4)"
      }
    })), !last && React.createElement("div", {
      style: {
        width: 2,
        flex: 1,
        minHeight: compact ? 18 : 24,
        background: done ? "var(--success)" : "var(--border-2)",
        opacity: done ? 0.4 : 1,
        transition: "background .4s"
      }
    })), React.createElement("div", {
      style: {
        flex: 1,
        paddingBottom: last ? 0 : compact ? 14 : 18,
        minWidth: 0,
        opacity: done ? 1 : 0.6,
        transition: "opacity .3s"
      }
    }, React.createElement("div", {
      style: {
        display: "flex",
        alignItems: "center",
        justifyContent: "space-between",
        gap: 10,
        flexWrap: "wrap"
      }
    }, React.createElement("span", {
      style: {
        fontSize: 13.5,
        fontWeight: 600,
        color: done ? "var(--t1)" : "var(--t2)"
      }
    }, e.label), React.createElement("span", {
      className: "mono",
      style: {
        fontSize: 10.5,
        color: "var(--t3)",
        flex: "none"
      }
    }, z(t.getUTCHours()), ":", z(t.getUTCMinutes()), ":", z(t.getUTCSeconds()), " UTC")), React.createElement("div", {
      style: {
        display: "flex",
        alignItems: "center",
        gap: 10,
        marginTop: 5,
        flexWrap: "wrap"
      }
    }, React.createElement("span", {
      style: {
        display: "inline-flex",
        alignItems: "center",
        gap: 5,
        fontSize: 11,
        fontFamily: "var(--f-mono)",
        color: actor.c
      }
    }, React.createElement(Icon, {
      name: actor.icon,
      size: 11
    }), " ", actor.label, " \xB7 ", e.actorName), React.createElement("a", {
      href: "#",
      onClick: ev => ev.preventDefault(),
      className: "mono",
      style: {
        fontSize: 11,
        color: "var(--t3)",
        textDecoration: "none",
        display: "inline-flex",
        alignItems: "center",
        gap: 4
      }
    }, React.createElement(Icon, {
      name: "link",
      size: 10
    }), " ", e.evidence), React.createElement(Badge, {
      tone: done ? "success" : "muted"
    }, done ? "complete" : "pending"))));
  }));
}
function FinalReport() {
  const store = useRO();
  const {
    actionState,
    contained,
    approvedCount
  } = store;
  const s = window.RO.stats;
  const [toast, setToast] = useState(null);
  const flash = msg => {
    setToast(msg);
    setTimeout(() => setToast(null), 2600);
  };
  const executed = window.RO.actions.filter(a => actionState[a.id]?.status === "executed");
  const pending = window.RO.actions.filter(a => actionState[a.id]?.status !== "executed");
  const statusLabel = contained ? "CONTAINED" : approvedCount > 0 ? "CONTAINING" : "DRAFT";
  const statusTone = contained ? "var(--success)" : approvedCount > 0 ? "var(--cyan)" : "var(--t3)";
  const copySummary = () => {
    const text = `RecallOps Command — Recall Containment Report\nRecall: ${window.RO.recall.recallId} (${window.RO.recall.classification})\nStatus: ${statusLabel}\nActions approved: ${executed.length}/6\nLocations: ${s.locationsAffected} · Units: ${s.unitsInventory} · Customers notified: ${s.customersToNotify}`;
    if (navigator.clipboard) navigator.clipboard.writeText(text).then(() => flash("Audit summary copied")).catch(() => flash("Copy blocked by browser"));else flash("Audit summary copied");
  };
  return React.createElement("div", {
    className: "panel",
    style: {
      padding: 24,
      position: "relative",
      overflow: "hidden"
    }
  }, React.createElement("div", {
    style: {
      position: "absolute",
      inset: 0,
      background: contained ? "radial-gradient(90% 60% at 100% 0%, rgba(16,185,129,.08), transparent 55%)" : "none",
      pointerEvents: "none"
    }
  }), React.createElement("div", {
    style: {
      position: "relative"
    }
  }, React.createElement("div", {
    style: {
      display: "flex",
      alignItems: "flex-start",
      justifyContent: "space-between",
      gap: 16,
      flexWrap: "wrap",
      marginBottom: 20
    }
  }, React.createElement("div", {
    style: {
      minWidth: 0
    }
  }, React.createElement("div", {
    className: "label",
    style: {
      marginBottom: 8
    }
  }, "Audit-ready compliance report"), React.createElement("h2", {
    style: {
      margin: 0,
      fontFamily: "var(--f-display)",
      fontSize: "clamp(24px,3vw,32px)",
      fontWeight: 600,
      letterSpacing: "-.02em",
      color: "var(--t1)"
    }
  }, "Recall Containment Report"), React.createElement("div", {
    className: "mono",
    style: {
      fontSize: 12,
      color: "var(--t3)",
      marginTop: 7
    }
  }, window.RO.recall.recallId, " \xB7 ", window.RO.recall.recallingFirm)), React.createElement("div", {
    style: {
      display: "flex",
      alignItems: "center",
      gap: 11,
      padding: "10px 16px",
      borderRadius: "var(--r-md)",
      background: "color-mix(in srgb," + statusTone + " 12%, transparent)",
      border: "1px solid color-mix(in srgb," + statusTone + " 40%, transparent)"
    }
  }, React.createElement("span", {
    style: {
      width: 9,
      height: 9,
      borderRadius: "50%",
      background: statusTone,
      boxShadow: "0 0 12px " + statusTone
    },
    className: contained ? "" : "pulse-dot"
  }), React.createElement("span", {
    style: {
      fontFamily: "var(--f-display)",
      fontWeight: 600,
      fontSize: 18,
      letterSpacing: ".03em",
      color: statusTone
    }
  }, statusLabel))), React.createElement("p", {
    style: {
      margin: "0 0 20px",
      fontSize: 14,
      color: "var(--t2)",
      lineHeight: 1.6,
      maxWidth: 760
    }
  }, "RecallOps identified affected inventory, sales, shipments, and customer exposure from Fivetran-synced operational data. Human-approved actions were recorded into the audit timeline (drafted for approval \u2014 no external dispatch in this demo)."), React.createElement("div", {
    style: {
      display: "grid",
      gridTemplateColumns: "repeat(auto-fit, minmax(150px,1fr))",
      gap: 12,
      marginBottom: 20
    }
  }, React.createElement(ReportStat, {
    k: "Locations",
    v: s.locationsAffected
  }), React.createElement(ReportStat, {
    k: "Units quarantined",
    v: s.unitsInventory.toLocaleString()
  }), React.createElement(ReportStat, {
    k: "Units sold",
    v: s.unitsSold,
    tone: "var(--class-2)"
  }), React.createElement(ReportStat, {
    k: "Customers notified",
    v: s.customersToNotify
  }), React.createElement(ReportStat, {
    k: "Actions approved",
    v: executed.length + " / 6",
    tone: contained ? "var(--success)" : "var(--t1)"
  })), React.createElement("div", {
    style: {
      display: "grid",
      gridTemplateColumns: "1fr 1fr",
      gap: 18,
      marginBottom: 20
    },
    className: "ro-report-cols"
  }, React.createElement(ReportBlock, {
    title: "Actions approved",
    icon: "shieldCheck",
    tone: "var(--success)"
  }, executed.length ? executed.map(a => React.createElement(ReportLine, {
    key: a.id,
    ok: true,
    label: a.title
  })) : React.createElement(Empty, null, "None approved yet \u2014 approve actions to populate.")), React.createElement(ReportBlock, {
    title: "Actions pending",
    icon: "clock",
    tone: "var(--warning)"
  }, pending.length ? pending.map(a => React.createElement(ReportLine, {
    key: a.id,
    label: a.title
  })) : React.createElement(Empty, null, "All actions executed."))), React.createElement("div", {
    style: {
      marginBottom: 20
    }
  }, React.createElement(ReportBlock, {
    title: "Evidence sources",
    icon: "database",
    tone: "var(--cyan)"
  }, React.createElement("div", {
    style: {
      display: "flex",
      flexWrap: "wrap",
      gap: 8
    }
  }, Object.values(window.RO.evidence).map(e => React.createElement("span", {
    key: e.id,
    className: "mono",
    style: {
      fontSize: 11,
      padding: "4px 10px",
      borderRadius: "var(--r-xs)",
      background: "var(--panel-2)",
      border: "1px solid var(--border-2)",
      color: "var(--t2)"
    }
  }, e.label, " ", React.createElement("span", {
    style: {
      color: "var(--t4)"
    }
  }, "\xB7 ", e.source)))))), React.createElement("div", {
    style: {
      display: "flex",
      alignItems: "center",
      justifyContent: "space-between",
      gap: 14,
      flexWrap: "wrap",
      padding: "14px 16px",
      background: "var(--bg-2)",
      borderRadius: "var(--r-sm)",
      border: "1px solid var(--border)",
      marginBottom: 18
    }
  }, React.createElement("div", {
    style: {
      display: "flex",
      gap: 22,
      flexWrap: "wrap"
    }
  }, React.createElement(Signed, {
    k: "Generated by",
    v: "RecallOps Command",
    icon: "cpu"
  }), React.createElement(Signed, {
    k: "Approved by",
    v: approvedCount > 0 ? "Human operator" : "— pending —",
    icon: "shield",
    tone: approvedCount > 0 ? "var(--blue)" : "var(--t3)"
  }), React.createElement(Signed, {
    k: "Residual risk",
    v: contained ? "Low — contained" : "Elevated — in progress",
    icon: "activity",
    tone: contained ? "var(--success)" : "var(--warning)"
  }))), React.createElement("div", {
    style: {
      display: "flex",
      gap: 10,
      flexWrap: "wrap"
    }
  }, React.createElement(Button, {
    variant: "primary",
    icon: "download",
    onClick: () => flash("Report export queued (PDF)")
  }, "Download PDF"), React.createElement(Button, {
    variant: "secondary",
    icon: "copy",
    onClick: copySummary
  }, "Copy Audit Summary"), React.createElement(Button, {
    variant: "ghost",
    icon: "layers",
    onClick: () => flash("Evidence bundle opened")
  }, "Open Evidence Bundle"))), toast && React.createElement("div", {
    style: {
      position: "fixed",
      bottom: 24,
      left: "50%",
      transform: "translateX(-50%)",
      zIndex: 120,
      display: "flex",
      alignItems: "center",
      gap: 9,
      padding: "11px 16px",
      background: "var(--panel)",
      border: "1px solid var(--success)",
      borderRadius: "var(--r-sm)",
      boxShadow: "var(--sh-2)"
    }
  }, React.createElement(Icon, {
    name: "checkCircle",
    size: 16,
    style: {
      color: "var(--success)"
    }
  }), React.createElement("span", {
    style: {
      fontSize: 13,
      color: "var(--t1)"
    }
  }, toast)));
}
function ReportStat({
  k,
  v,
  tone
}) {
  return React.createElement("div", {
    style: {
      padding: "13px 14px",
      background: "var(--panel-2)",
      border: "1px solid var(--border)",
      borderRadius: "var(--r-sm)"
    }
  }, React.createElement("div", {
    className: "label"
  }, k), React.createElement("div", {
    className: "mono",
    style: {
      fontSize: 24,
      fontWeight: 600,
      color: tone || "var(--t1)",
      marginTop: 5
    }
  }, v));
}
function ReportBlock({
  title,
  icon,
  tone,
  children
}) {
  return React.createElement("div", {
    style: {
      padding: "14px 15px",
      background: "var(--panel-2)",
      border: "1px solid var(--border)",
      borderRadius: "var(--r-sm)"
    }
  }, React.createElement("div", {
    style: {
      display: "flex",
      alignItems: "center",
      gap: 8,
      marginBottom: 11
    }
  }, React.createElement(Icon, {
    name: icon,
    size: 14,
    style: {
      color: tone
    }
  }), React.createElement("span", {
    className: "label",
    style: {
      color: "var(--t2)"
    }
  }, title)), React.createElement("div", {
    style: {
      display: "flex",
      flexDirection: "column",
      gap: 7
    }
  }, children));
}
function ReportLine({
  ok,
  label
}) {
  return React.createElement("div", {
    style: {
      display: "flex",
      alignItems: "center",
      gap: 8,
      fontSize: 12.5,
      color: "var(--t2)"
    }
  }, React.createElement(Icon, {
    name: ok ? "check" : "dot",
    size: ok ? 13 : 8,
    fill: !ok,
    style: {
      color: ok ? "var(--success)" : "var(--t4)"
    }
  }), " ", label);
}
function Empty({
  children
}) {
  return React.createElement("span", {
    style: {
      fontSize: 12,
      color: "var(--t3)",
      fontStyle: "italic"
    }
  }, children);
}
function Signed({
  k,
  v,
  icon,
  tone
}) {
  return React.createElement("div", null, React.createElement("div", {
    className: "label",
    style: {
      fontSize: 9.5
    }
  }, k), React.createElement("div", {
    style: {
      display: "flex",
      alignItems: "center",
      gap: 6,
      marginTop: 3,
      fontSize: 12.5,
      color: tone || "var(--t1)",
      fontWeight: 500
    }
  }, React.createElement(Icon, {
    name: icon,
    size: 12
  }), " ", v));
}
function ArchitectureDiagram() {
  const stages = [{
    t: "openFDA API",
    g: "source",
    ic: "external"
  }, {
    t: "Recall Intake Service",
    g: "service",
    ic: "inbox"
  }, {
    t: "Fivetran MCP Server",
    g: "fivetran",
    ic: "refresh"
  }, {
    t: "Fivetran Connectors",
    g: "fivetran",
    ic: "route"
  }, {
    t: "BigQuery Warehouse",
    g: "data",
    ic: "database"
  }, {
    t: "Gemini Agent (Agent Builder / ADK)",
    g: "agent",
    ic: "brain"
  }, {
    t: "Containment Planner",
    g: "agent",
    ic: "target"
  }, {
    t: "Human Approval Gate",
    g: "human",
    ic: "shield"
  }, {
    t: "Action Executors",
    g: "service",
    ic: "zap"
  }, {
    t: "Audit Log",
    g: "data",
    ic: "timeline"
  }, {
    t: "Compliance Report",
    g: "out",
    ic: "fileCheck"
  }];
  const GC = {
    source: "var(--t2)",
    service: "var(--blue)",
    fivetran: "var(--cyan)",
    data: "var(--blue)",
    agent: "var(--cyan)",
    human: "var(--warning)",
    out: "var(--success)"
  };
  return React.createElement("div", null, React.createElement("div", {
    style: {
      display: "flex",
      flexWrap: "wrap",
      gap: 8,
      alignItems: "center"
    }
  }, stages.map((s, i) => React.createElement(React.Fragment, {
    key: i
  }, React.createElement("div", {
    style: {
      display: "flex",
      alignItems: "center",
      gap: 8,
      padding: "9px 13px",
      background: "color-mix(in srgb," + GC[s.g] + " 9%, var(--panel-2))",
      border: "1px solid color-mix(in srgb," + GC[s.g] + " 30%, transparent)",
      borderRadius: "var(--r-sm)"
    }
  }, React.createElement(Icon, {
    name: s.ic,
    size: 14,
    style: {
      color: GC[s.g]
    }
  }), React.createElement("span", {
    style: {
      fontSize: 12,
      fontWeight: 600,
      color: "var(--t1)",
      whiteSpace: "nowrap"
    }
  }, s.t)), i < stages.length - 1 && React.createElement(Icon, {
    name: "arrowRight",
    size: 14,
    style: {
      color: "var(--t4)",
      flex: "none"
    }
  })))), React.createElement("div", {
    style: {
      display: "flex",
      flexWrap: "wrap",
      gap: 16,
      marginTop: 18,
      paddingTop: 16,
      borderTop: "1px solid var(--border)"
    }
  }, [["fivetran", "Fivetran (partner)"], ["agent", "Gemini agent"], ["data", "BigQuery / data"], ["human", "Human gate"], ["out", "Output"]].map(([g, l]) => React.createElement("span", {
    key: g,
    style: {
      display: "inline-flex",
      alignItems: "center",
      gap: 7,
      fontSize: 11.5,
      color: "var(--t3)",
      fontFamily: "var(--f-mono)"
    }
  }, React.createElement("span", {
    style: {
      width: 10,
      height: 10,
      borderRadius: 3,
      background: GC[g]
    }
  }), " ", l))));
}
Object.assign(window, {
  PipelineViz,
  ComplianceTimeline,
  FinalReport,
  ArchitectureDiagram,
  deriveTimeline
});

/* ===== views1.jsx ===== */
function PageHeader({
  eyebrow,
  title,
  sub,
  icon,
  right
}) {
  return React.createElement("div", {
    className: "rise",
    style: {
      "--dur": "0.4s",
      display: "flex",
      alignItems: "flex-end",
      justifyContent: "space-between",
      gap: 16,
      flexWrap: "wrap",
      marginBottom: 20
    }
  }, React.createElement("div", {
    style: {
      minWidth: 0
    }
  }, React.createElement("div", {
    style: {
      display: "flex",
      alignItems: "center",
      gap: 9,
      marginBottom: 8
    }
  }, React.createElement("span", {
    style: {
      color: "var(--cyan)",
      display: "flex"
    }
  }, React.createElement(Icon, {
    name: icon,
    size: 16
  })), React.createElement("span", {
    className: "mono",
    style: {
      fontSize: 11,
      letterSpacing: ".12em",
      textTransform: "uppercase",
      color: "var(--cyan)",
      fontWeight: 600
    }
  }, eyebrow)), React.createElement("h1", {
    style: {
      margin: 0,
      fontFamily: "var(--f-display)",
      fontSize: "clamp(25px, 3.2vw, 34px)",
      fontWeight: 600,
      letterSpacing: "-.025em",
      color: "var(--t1)",
      lineHeight: 1.05
    }
  }, title), sub && React.createElement("p", {
    style: {
      margin: "10px 0 0",
      fontSize: 14,
      color: "var(--t2)",
      maxWidth: 720,
      lineHeight: 1.55
    }
  }, sub)), right);
}
function CommandView() {
  const store = useRO();
  const {
    phase,
    analyzeOn,
    actionsOn,
    contained,
    triggerContainment,
    reset,
    navigate
  } = store;
  const [modal, setModal] = useState(null);
  const started = phase !== "idle";
  const s = window.RO.stats;
  return React.createElement("div", {
    style: {
      display: "flex",
      flexDirection: "column",
      gap: 22
    }
  }, React.createElement("section", {
    className: "rise",
    style: {
      "--dur": "0.45s"
    }
  }, React.createElement("div", {
    style: {
      display: "grid",
      gridTemplateColumns: "1.25fr 0.75fr",
      gap: 18
    },
    className: "ro-hero"
  }, React.createElement("div", {
    className: "panel",
    style: {
      padding: "24px 24px",
      display: "flex",
      flexDirection: "column",
      justifyContent: "center",
      position: "relative",
      overflow: "hidden"
    }
  }, React.createElement("div", {
    style: {
      position: "absolute",
      inset: 0,
      background: "radial-gradient(110% 80% at 0% 0%, rgba(6,182,212,.08), transparent 58%)",
      pointerEvents: "none"
    }
  }), React.createElement("div", {
    style: {
      position: "relative"
    }
  }, React.createElement("div", {
    style: {
      display: "inline-flex",
      alignItems: "center",
      gap: 8,
      padding: "5px 11px",
      borderRadius: "var(--r-pill)",
      background: contained ? "var(--success-dim)" : "var(--class-1-dim)",
      border: "1px solid " + (contained ? "rgba(16,185,129,.34)" : "rgba(239,68,68,.34)"),
      marginBottom: 16
    }
  }, React.createElement(StatusDot, {
    tone: contained ? "success" : "danger",
    live: started && !contained
  }), React.createElement("span", {
    className: "mono",
    style: {
      fontSize: 11,
      letterSpacing: ".08em",
      textTransform: "uppercase",
      color: contained ? "var(--success)" : "var(--class-1)",
      fontWeight: 600
    }
  }, contained ? "Recall contained" : started ? "Containment in progress" : "Class I recall · standby")), React.createElement("h1", {
    style: {
      margin: 0,
      fontFamily: "var(--f-display)",
      fontSize: "clamp(30px, 4.4vw, 46px)",
      fontWeight: 600,
      letterSpacing: "-.03em",
      lineHeight: 1.02,
      color: "var(--t1)"
    }
  }, "RecallOps Command"), React.createElement("p", {
    style: {
      margin: "13px 0 0",
      fontSize: "clamp(14px,1.6vw,16px)",
      color: "var(--t2)",
      maxWidth: 520,
      lineHeight: 1.55
    }
  }, "Human-approved recall containment powered by Gemini, Fivetran, and BigQuery."), React.createElement("div", {
    style: {
      display: "flex",
      gap: 10,
      marginTop: 22,
      flexWrap: "wrap"
    }
  }, !started ? React.createElement(Button, {
    variant: "primary",
    size: "lg",
    icon: "zap",
    onClick: triggerContainment
  }, "Trigger Containment") : contained ? React.createElement(Button, {
    variant: "success",
    size: "lg",
    icon: "refresh",
    onClick: reset
  }, "Reset scenario") : React.createElement(Button, {
    variant: "primary",
    size: "lg",
    disabled: true,
    icon: "refresh"
  }, "Containment running\u2026"), React.createElement(Button, {
    variant: "ghost",
    size: "lg",
    icon: "fileCheck",
    onClick: () => navigate("report")
  }, "View Audit Report"), React.createElement(Button, {
    variant: "ghost",
    size: "lg",
    icon: "cpu",
    onClick: () => navigate("architecture")
  }, "Inspect Architecture")))), React.createElement(PipelineViz, null))), React.createElement("section", null, React.createElement(SectionTitle, {
    num: "01",
    icon: "inbox",
    title: "Recall intake",
    sub: "Live openFDA food enforcement record matched to internal SKUs."
  }), React.createElement(RecallIntakeCard, {
    onTrigger: triggerContainment,
    started: started
  })), React.createElement("section", null, React.createElement(SectionTitle, {
    num: "02",
    icon: "refresh",
    title: "Operational data sync",
    sub: "Fivetran is the operational data foundation \u2014 the agent cannot scope a recall without fresh synced data."
  }), React.createElement(FivetranSyncStrip, null)), React.createElement("section", null, React.createElement(SectionTitle, {
    num: "03",
    icon: "radar",
    title: "Blast radius",
    sub: "BigQuery blast-radius analysis across inventory, sales, shipments, and customers.",
    right: React.createElement(Button, {
      variant: "ghost",
      size: "sm",
      iconRight: "arrowRight",
      onClick: () => navigate("blast")
    }, "Expand")
  }), React.createElement("div", {
    style: {
      display: "grid",
      gridTemplateColumns: "1.5fr 1fr",
      gap: 16
    },
    className: "ro-blast"
  }, React.createElement(BlastRadiusMap, {
    height: 420
  }), React.createElement("div", {
    style: {
      display: "grid",
      gridTemplateColumns: "1fr 1fr",
      gap: 12,
      alignContent: "start"
    }
  }, React.createElement(MetricTile, {
    big: true,
    icon: "pin",
    label: "Locations affected",
    value: s.locationsAffected,
    tone: "danger",
    animate: analyzeOn,
    sub: "14 critical"
  }), React.createElement(MetricTile, {
    big: true,
    icon: "package",
    label: "Units in inventory",
    value: s.unitsInventory,
    tone: "cyan",
    animate: analyzeOn,
    sub: "to quarantine"
  }), React.createElement(MetricTile, {
    icon: "store",
    label: "Units already sold",
    value: s.unitsSold,
    tone: "warning",
    animate: analyzeOn,
    sub: "customer exposure"
  }), React.createElement(MetricTile, {
    icon: "truck",
    label: "Shipments in transit",
    value: s.shipmentsInTransit,
    tone: "class3",
    animate: analyzeOn,
    sub: "divert to hold"
  }), React.createElement(MetricTile, {
    icon: "users",
    label: "Customers to notify",
    value: s.customersToNotify,
    tone: "blue",
    animate: analyzeOn,
    sub: "consented only"
  }), React.createElement(MetricTile, {
    icon: "clock",
    label: "Est. containment",
    value: s.estContainmentMin,
    suffix: " min",
    tone: "success",
    animate: analyzeOn,
    sub: "projected"
  })))), React.createElement("section", null, React.createElement(SectionTitle, {
    num: "04",
    icon: "brain",
    title: "Agent reasoning trace",
    sub: "The Gemini agent narrates how it scoped the recall from synced data \u2014 not a chat window."
  }), React.createElement("div", {
    style: {
      minHeight: 280
    }
  }, React.createElement(ReasoningTrace, null))), React.createElement("section", null, React.createElement(SectionTitle, {
    num: "05",
    icon: "shield",
    title: "Containment action queue",
    sub: "No external action executes without approval.",
    right: React.createElement(Button, {
      variant: "ghost",
      size: "sm",
      iconRight: "arrowRight",
      onClick: () => navigate("actions")
    }, "Open queue")
  }), actionsOn ? React.createElement("div", {
    style: {
      display: "grid",
      gridTemplateColumns: "1fr 1fr",
      gap: 13
    },
    className: "ro-actions-grid"
  }, window.RO.actions.map((a, i) => React.createElement(ActionCard, {
    key: a.id,
    action: a,
    state: store.actionState[a.id],
    onApprove: setModal,
    onReject: store.rejectAction,
    delay: i * 60
  }))) : React.createElement(ActionsPlaceholder, {
    started: started,
    onTrigger: triggerContainment
  })), React.createElement("section", null, React.createElement("div", {
    style: {
      display: "grid",
      gridTemplateColumns: "1.1fr 0.9fr",
      gap: 18
    },
    className: "ro-blast"
  }, React.createElement("div", {
    className: "panel",
    style: {
      padding: 20
    }
  }, React.createElement(SectionTitle, {
    num: "06",
    icon: "timeline",
    title: "Compliance timeline",
    right: React.createElement(Button, {
      variant: "ghost",
      size: "sm",
      iconRight: "arrowRight",
      onClick: () => navigate("compliance")
    }, "Audit log")
  }), React.createElement(ComplianceTimeline, {
    compact: true
  })), React.createElement(ContainSummaryCard, {
    store: store,
    navigate: navigate
  }))), modal && React.createElement(ApprovalModal, {
    action: modal,
    onApprove: id => {
      store.approveAction(id);
      setModal(null);
    },
    onCancel: () => setModal(null)
  }));
}
function ActionsPlaceholder({
  started,
  onTrigger
}) {
  return React.createElement("div", {
    className: "panel",
    style: {
      padding: "34px 20px",
      textAlign: "center",
      display: "flex",
      flexDirection: "column",
      alignItems: "center",
      gap: 14,
      border: "1px dashed var(--border-2)"
    }
  }, React.createElement("div", {
    style: {
      width: 46,
      height: 46,
      borderRadius: "var(--r-sm)",
      background: "var(--panel-3)",
      border: "1px solid var(--border-2)",
      display: "grid",
      placeItems: "center",
      color: "var(--t3)"
    }
  }, React.createElement(Icon, {
    name: started ? "refresh" : "shield",
    size: 20,
    className: started ? "spin" : ""
  })), React.createElement("div", null, React.createElement("div", {
    style: {
      fontSize: 14.5,
      fontWeight: 600,
      color: "var(--t1)"
    }
  }, started ? "Drafting containment actions…" : "No actions drafted"), React.createElement("p", {
    style: {
      margin: "5px 0 0",
      fontSize: 12.5,
      color: "var(--t3)",
      maxWidth: 380
    }
  }, started ? "The agent is scoping the recall and will populate the approval queue shortly." : "Trigger containment to generate the Gemini-drafted action queue.")), !started && React.createElement(Button, {
    variant: "primary",
    icon: "zap",
    onClick: onTrigger
  }, "Trigger Containment"));
}
function ContainSummaryCard({
  store,
  navigate
}) {
  const {
    approvedCount,
    contained,
    phase
  } = store;
  const total = window.RO.actions.length;
  const pct = Math.round(approvedCount / total * 100);
  return React.createElement("div", {
    className: "panel",
    style: {
      padding: 20,
      display: "flex",
      flexDirection: "column"
    }
  }, React.createElement(SectionTitle, {
    num: "07",
    icon: "target",
    title: "Containment status"
  }), React.createElement("div", {
    style: {
      display: "flex",
      alignItems: "baseline",
      gap: 10,
      marginBottom: 6
    }
  }, React.createElement("span", {
    className: "mono",
    style: {
      fontSize: 44,
      fontWeight: 600,
      color: contained ? "var(--success)" : "var(--t1)",
      letterSpacing: "-.02em",
      lineHeight: 1
    }
  }, pct, "%"), React.createElement("span", {
    className: "label"
  }, approvedCount, " / ", total, " actions approved")), React.createElement("div", {
    style: {
      height: 8,
      background: "var(--bg-2)",
      borderRadius: 999,
      overflow: "hidden",
      margin: "10px 0 16px",
      position: "relative"
    }
  }, React.createElement("div", {
    style: {
      width: pct + "%",
      height: "100%",
      background: contained ? "var(--success)" : "var(--accent-grad)",
      borderRadius: 999,
      transition: "width .6s cubic-bezier(.22,.61,.36,1)"
    }
  })), React.createElement("div", {
    style: {
      display: "grid",
      gridTemplateColumns: "1fr 1fr",
      gap: 10,
      marginBottom: 16
    }
  }, React.createElement(MiniKpi, {
    k: "Critical stores",
    v: window.RO.stats.criticalStores
  }), React.createElement(MiniKpi, {
    k: "Supplier holds",
    v: window.RO.stats.supplierHolds
  }), React.createElement(MiniKpi, {
    k: "Replacement POs",
    v: window.RO.stats.replacementPOs
  }), React.createElement(MiniKpi, {
    k: "Customers",
    v: window.RO.stats.customersToNotify
  })), React.createElement("div", {
    style: {
      marginTop: "auto"
    }
  }, React.createElement(Button, {
    variant: contained ? "success" : "primary",
    full: true,
    icon: "fileCheck",
    onClick: () => navigate("report")
  }, contained ? "Open compliance report" : "View draft report")));
}
function MiniKpi({
  k,
  v
}) {
  return React.createElement("div", {
    style: {
      padding: "10px 12px",
      background: "var(--panel-2)",
      border: "1px solid var(--border)",
      borderRadius: "var(--r-sm)"
    }
  }, React.createElement("div", {
    className: "label",
    style: {
      fontSize: 9.5
    }
  }, k), React.createElement("div", {
    className: "mono",
    style: {
      fontSize: 18,
      fontWeight: 600,
      color: "var(--t1)",
      marginTop: 3
    }
  }, v));
}
function IntakeView() {
  const {
    phase,
    triggerContainment,
    navigate
  } = useRO();
  const started = phase !== "idle";
  return React.createElement("div", {
    style: {
      display: "flex",
      flexDirection: "column",
      gap: 22
    }
  }, React.createElement(PageHeader, {
    eyebrow: "openFDA food enforcement",
    title: "Recall intake",
    icon: "inbox",
    sub: "Inbound recall records from the openFDA food enforcement endpoint, matched against internal SKUs before containment."
  }), React.createElement("div", {
    style: {
      display: "grid",
      gridTemplateColumns: "repeat(auto-fit, minmax(160px,1fr))",
      gap: 12
    }
  }, React.createElement(IntakeSum, {
    k: "Open recalls",
    v: "1",
    icon: "alert",
    tone: "var(--class-1)",
    sub: "Class I"
  }), React.createElement(IntakeSum, {
    k: "SKU matches",
    v: "3",
    icon: "package",
    tone: "var(--cyan)",
    sub: "internal"
  }), React.createElement(IntakeSum, {
    k: "Lot codes",
    v: "3",
    icon: "route",
    tone: "var(--class-2)",
    sub: "affected"
  }), React.createElement(IntakeSum, {
    k: "Source latency",
    v: "42s",
    icon: "clock",
    tone: "var(--success)",
    sub: "openFDA poll"
  })), React.createElement(RecallIntakeCard, {
    onTrigger: triggerContainment,
    started: started
  }), React.createElement("div", {
    className: "panel",
    style: {
      padding: 20
    }
  }, React.createElement(SectionTitle, {
    icon: "search",
    title: "Recall feed",
    sub: "Most recent records polled from openFDA."
  }), React.createElement("div", {
    style: {
      overflowX: "auto"
    },
    className: "no-sb"
  }, React.createElement("table", {
    style: {
      width: "100%",
      borderCollapse: "collapse",
      minWidth: 640
    }
  }, React.createElement("thead", null, React.createElement("tr", {
    style: {
      borderBottom: "1px solid var(--border-2)"
    }
  }, ["Recall ID", "Product", "Class", "Firm", "Status", ""].map((h, i) => React.createElement("th", {
    key: i,
    style: {
      textAlign: i === 5 ? "right" : "left",
      padding: "0 12px 11px"
    }
  }, React.createElement("span", {
    className: "label"
  }, h))))), React.createElement("tbody", null, React.createElement(FeedRow, {
    rec: window.RO.recall,
    active: true,
    onSelect: () => navigate("command")
  }), React.createElement(FeedRow, {
    rec: {
      recallId: "F-1139-2026",
      productDescription: "Bagged Spring Mix, 10 oz",
      classification: "Class II",
      recallingFirm: "Verde Farms"
    }
  }), React.createElement(FeedRow, {
    rec: {
      recallId: "F-1131-2026",
      productDescription: "Almond Protein Bars, 12 ct",
      classification: "Class III",
      recallingFirm: "Sunset Snacks"
    }
  }))))));
}
function IntakeSum({
  k,
  v,
  icon,
  tone,
  sub
}) {
  return React.createElement("div", {
    className: "panel lift",
    style: {
      padding: "15px 16px",
      display: "flex",
      alignItems: "center",
      gap: 13
    }
  }, React.createElement("div", {
    style: {
      width: 38,
      height: 38,
      borderRadius: "var(--r-sm)",
      flex: "none",
      display: "grid",
      placeItems: "center",
      background: "var(--panel-2)",
      border: "1px solid var(--border-2)",
      color: tone
    }
  }, React.createElement(Icon, {
    name: icon,
    size: 18
  })), React.createElement("div", null, React.createElement("div", {
    style: {
      display: "flex",
      alignItems: "baseline",
      gap: 6
    }
  }, React.createElement("span", {
    className: "mono",
    style: {
      fontSize: 22,
      fontWeight: 600,
      color: tone,
      lineHeight: 1
    }
  }, v), React.createElement("span", {
    className: "mono",
    style: {
      fontSize: 10,
      color: "var(--t4)"
    }
  }, sub)), React.createElement("div", {
    className: "label",
    style: {
      marginTop: 5
    }
  }, k)));
}
function FeedRow({
  rec,
  active,
  onSelect
}) {
  return React.createElement("tr", {
    onClick: active ? onSelect : undefined,
    style: {
      borderBottom: "1px solid var(--border)",
      cursor: active ? "pointer" : "default",
      opacity: active ? 1 : 0.6
    }
  }, React.createElement("td", {
    style: {
      padding: "13px 12px"
    }
  }, React.createElement("span", {
    className: "mono",
    style: {
      fontSize: 12.5,
      color: active ? "var(--cyan)" : "var(--t3)"
    }
  }, rec.recallId)), React.createElement("td", {
    style: {
      padding: "13px 12px",
      fontSize: 13,
      color: "var(--t1)",
      fontWeight: 500,
      whiteSpace: "nowrap"
    }
  }, rec.productDescription), React.createElement("td", {
    style: {
      padding: "13px 12px"
    }
  }, React.createElement(Badge, {
    tone: CLASS_TONE[rec.classification]
  }, rec.classification)), React.createElement("td", {
    style: {
      padding: "13px 12px",
      fontSize: 12.5,
      color: "var(--t2)",
      whiteSpace: "nowrap"
    }
  }, rec.recallingFirm), React.createElement("td", {
    style: {
      padding: "13px 12px"
    }
  }, active ? React.createElement(Badge, {
    tone: "danger"
  }, "Active") : React.createElement("span", {
    className: "mono",
    style: {
      fontSize: 11,
      color: "var(--t3)"
    }
  }, "monitoring")), React.createElement("td", {
    style: {
      padding: "13px 12px",
      textAlign: "right"
    }
  }, active && React.createElement("span", {
    style: {
      color: "var(--t3)",
      display: "inline-flex"
    }
  }, React.createElement(Icon, {
    name: "chevronRight",
    size: 16
  }))));
}
function BlastRadiusView() {
  const {
    analyzeOn,
    phase,
    triggerContainment
  } = useRO();
  const s = window.RO.stats;
  return React.createElement("div", {
    style: {
      display: "flex",
      flexDirection: "column",
      gap: 22
    }
  }, React.createElement(PageHeader, {
    eyebrow: "BigQuery blast-radius analysis",
    title: "Blast radius",
    icon: "radar",
    sub: "Affected stores, warehouses, in-transit shipments, and customer notification zones computed from Fivetran-synced operational data in BigQuery.",
    right: phase === "idle" ? React.createElement(Button, {
      variant: "primary",
      icon: "zap",
      onClick: triggerContainment
    }, "Trigger Containment") : null
  }), React.createElement("div", {
    style: {
      display: "grid",
      gridTemplateColumns: "repeat(auto-fit, minmax(160px,1fr))",
      gap: 12
    }
  }, React.createElement(MetricTile, {
    big: true,
    icon: "pin",
    label: "Locations affected",
    value: s.locationsAffected,
    tone: "danger",
    animate: analyzeOn,
    sub: "14 critical"
  }), React.createElement(MetricTile, {
    big: true,
    icon: "package",
    label: "Units in inventory",
    value: s.unitsInventory,
    tone: "cyan",
    animate: analyzeOn,
    sub: "to quarantine"
  }), React.createElement(MetricTile, {
    big: true,
    icon: "store",
    label: "Units already sold",
    value: s.unitsSold,
    tone: "warning",
    animate: analyzeOn,
    sub: "exposure"
  }), React.createElement(MetricTile, {
    big: true,
    icon: "truck",
    label: "Shipments in transit",
    value: s.shipmentsInTransit,
    tone: "class3",
    animate: analyzeOn,
    sub: "divert"
  }), React.createElement(MetricTile, {
    big: true,
    icon: "users",
    label: "Customers to notify",
    value: s.customersToNotify,
    tone: "blue",
    animate: analyzeOn,
    sub: "consented"
  })), React.createElement(BlastRadiusMap, {
    height: 460
  }), React.createElement("div", {
    style: {
      display: "grid",
      gridTemplateColumns: "1fr 1fr",
      gap: 18
    },
    className: "ro-blast"
  }, React.createElement("div", {
    className: "panel",
    style: {
      padding: 20
    }
  }, React.createElement(SectionTitle, {
    icon: "truck",
    title: "In-transit shipments",
    sub: "Diverted to quarantine docks under supplier hold."
  }), React.createElement("div", {
    style: {
      display: "flex",
      flexDirection: "column",
      gap: 9
    }
  }, window.RO.shipments.map(sh => React.createElement("div", {
    key: sh.id,
    style: {
      display: "flex",
      alignItems: "center",
      justifyContent: "space-between",
      gap: 10,
      padding: "11px 13px",
      background: "var(--panel-2)",
      border: "1px solid var(--border)",
      borderRadius: "var(--r-sm)"
    }
  }, React.createElement("div", {
    style: {
      minWidth: 0
    }
  }, React.createElement("div", {
    className: "mono",
    style: {
      fontSize: 12,
      color: "var(--t1)"
    }
  }, sh.id, " ", React.createElement("span", {
    style: {
      color: "var(--t3)"
    }
  }, "\xB7 ", sh.sku)), React.createElement("div", {
    className: "mono",
    style: {
      fontSize: 10.5,
      color: "var(--t3)",
      marginTop: 2
    }
  }, "lot ", sh.lotCode, " \xB7 ", sh.quantity, " units")), React.createElement(Badge, {
    tone: "class2"
  }, sh.status.replace("_", " ")))))), React.createElement("div", {
    className: "panel",
    style: {
      padding: 20
    }
  }, React.createElement(SectionTitle, {
    icon: "building",
    title: "Critical locations",
    sub: "Highest-risk tier \u2014 prioritized for shelf pull."
  }), React.createElement("div", {
    style: {
      display: "flex",
      flexDirection: "column",
      gap: 8
    }
  }, window.RO.locations.filter(l => l.riskTier === "critical").slice(0, 7).map(l => React.createElement("div", {
    key: l.id,
    style: {
      display: "flex",
      alignItems: "center",
      justifyContent: "space-between",
      gap: 10,
      padding: "10px 12px",
      background: "var(--panel-2)",
      border: "1px solid var(--border)",
      borderRadius: "var(--r-sm)"
    }
  }, React.createElement("div", {
    style: {
      display: "flex",
      alignItems: "center",
      gap: 10,
      minWidth: 0
    }
  }, React.createElement("span", {
    style: {
      color: "var(--class-1)",
      display: "flex"
    }
  }, React.createElement(Icon, {
    name: LOC_ICON[l.type],
    size: 15
  })), React.createElement("div", {
    style: {
      minWidth: 0
    }
  }, React.createElement("div", {
    style: {
      fontSize: 12.5,
      color: "var(--t1)",
      fontWeight: 500,
      whiteSpace: "nowrap",
      overflow: "hidden",
      textOverflow: "ellipsis"
    }
  }, l.name), React.createElement("div", {
    className: "mono",
    style: {
      fontSize: 10,
      color: "var(--t3)"
    }
  }, "mgr ", l.manager, " \xB7 ", l.units, " units"))), React.createElement(Badge, {
    tone: "danger"
  }, "Critical")))))));
}
function ActionsView() {
  const store = useRO();
  const {
    actionsOn,
    phase,
    triggerContainment,
    approvedCount
  } = store;
  const [modal, setModal] = useState(null);
  return React.createElement("div", {
    style: {
      display: "flex",
      flexDirection: "column",
      gap: 22
    }
  }, React.createElement(PageHeader, {
    eyebrow: "Human approval queue",
    title: "Containment actions",
    icon: "shield",
    sub: "Gemini-generated containment plan. No external action executes without approval \u2014 every approval is written to the audit log.",
    right: React.createElement(Badge, {
      tone: approvedCount === 6 ? "success" : "warning"
    }, approvedCount, "/6 approved")
  }), actionsOn ? React.createElement("div", {
    style: {
      display: "grid",
      gridTemplateColumns: "1fr 1fr",
      gap: 13
    },
    className: "ro-actions-grid"
  }, window.RO.actions.map((a, i) => React.createElement(ActionCard, {
    key: a.id,
    action: a,
    state: store.actionState[a.id],
    onApprove: setModal,
    onReject: store.rejectAction,
    delay: i * 50
  }))) : React.createElement(ActionsPlaceholder, {
    started: phase !== "idle",
    onTrigger: triggerContainment
  }), modal && React.createElement(ApprovalModal, {
    action: modal,
    onApprove: id => {
      store.approveAction(id);
      setModal(null);
    },
    onCancel: () => setModal(null)
  }));
}
Object.assign(window, {
  PageHeader,
  CommandView,
  IntakeView,
  BlastRadiusView,
  ActionsView,
  ActionsPlaceholder
});

/* ===== views2.jsx ===== */
function ComplianceView() {
  const store = useRO();
  const status = deriveTimeline(store);
  const complete = Object.values(status).filter(v => v === "complete").length;
  const total = Object.keys(status).length;
  return React.createElement("div", {
    style: {
      display: "flex",
      flexDirection: "column",
      gap: 22
    }
  }, React.createElement(PageHeader, {
    eyebrow: "Audit-ready compliance",
    title: "Compliance timeline",
    icon: "timeline",
    sub: "Every agent and human action is recorded with a timestamp, actor, and evidence link \u2014 the spine of the audit-ready compliance report.",
    right: React.createElement(Badge, {
      tone: complete === total ? "success" : "cyan"
    }, complete, "/", total, " events complete")
  }), React.createElement("div", {
    style: {
      display: "grid",
      gridTemplateColumns: "1fr 1fr",
      gap: 18
    },
    className: "ro-blast"
  }, React.createElement("div", {
    className: "panel",
    style: {
      padding: 22
    }
  }, React.createElement(SectionTitle, {
    icon: "timeline",
    title: "Event timeline"
  }), React.createElement(ComplianceTimeline, null)), React.createElement("div", {
    style: {
      display: "flex",
      flexDirection: "column",
      gap: 18
    }
  }, React.createElement("div", {
    className: "panel",
    style: {
      padding: 20
    }
  }, React.createElement(SectionTitle, {
    icon: "shield",
    title: "Approval ledger",
    sub: "Human sign-offs recorded for containment actions."
  }), React.createElement("div", {
    style: {
      display: "flex",
      flexDirection: "column",
      gap: 8
    }
  }, window.RO.actions.map(a => {
    const st = store.actionState[a.id];
    const ok = st?.approvalState === "approved";
    return React.createElement("div", {
      key: a.id,
      style: {
        display: "flex",
        alignItems: "center",
        justifyContent: "space-between",
        gap: 10,
        padding: "10px 12px",
        background: "var(--panel-2)",
        border: "1px solid var(--border)",
        borderRadius: "var(--r-sm)"
      }
    }, React.createElement("div", {
      style: {
        display: "flex",
        alignItems: "center",
        gap: 10,
        minWidth: 0
      }
    }, React.createElement(Icon, {
      name: ACTION_ICON[a.type],
      size: 15,
      style: {
        color: ok ? "var(--success)" : "var(--t3)"
      }
    }), React.createElement("span", {
      style: {
        fontSize: 12.5,
        color: "var(--t1)",
        fontWeight: 500,
        whiteSpace: "nowrap",
        overflow: "hidden",
        textOverflow: "ellipsis"
      }
    }, a.title)), React.createElement(Badge, {
      tone: ok ? "success" : st?.approvalState === "rejected" ? "danger" : "muted"
    }, ok ? "approved" : st?.approvalState || "pending"));
  }))), React.createElement("div", {
    className: "panel",
    style: {
      padding: 20
    }
  }, React.createElement(SectionTitle, {
    icon: "database",
    title: "Evidence registry"
  }), React.createElement("div", {
    style: {
      display: "flex",
      flexDirection: "column",
      gap: 7
    }
  }, Object.values(window.RO.evidence).map(e => React.createElement("div", {
    key: e.id,
    style: {
      display: "flex",
      alignItems: "center",
      justifyContent: "space-between",
      gap: 10,
      padding: "9px 11px",
      background: "var(--panel-2)",
      border: "1px solid var(--border)",
      borderRadius: "var(--r-sm)"
    }
  }, React.createElement("div", {
    style: {
      minWidth: 0
    }
  }, React.createElement("div", {
    style: {
      fontSize: 12.5,
      color: "var(--t1)"
    }
  }, e.label), React.createElement("div", {
    className: "mono",
    style: {
      fontSize: 10,
      color: "var(--t3)",
      marginTop: 2
    }
  }, e.detail)), React.createElement(Badge, {
    tone: "blue"
  }, e.source))))))));
}
function ReportView() {
  const {
    navigate
  } = useRO();
  return React.createElement("div", {
    style: {
      display: "flex",
      flexDirection: "column",
      gap: 22,
      maxWidth: 1080,
      margin: "0 auto",
      width: "100%"
    }
  }, React.createElement(PageHeader, {
    eyebrow: "Judge-facing output",
    title: "Compliance report",
    icon: "fileCheck",
    sub: "The export-ready artifact a regulator or executive reads after containment.",
    right: React.createElement(Button, {
      variant: "ghost",
      size: "sm",
      iconRight: "arrowRight",
      onClick: () => navigate("architecture")
    }, "Architecture")
  }), React.createElement(FinalReport, null));
}
function ArchitectureView() {
  const deploy = [{
    k: "Frontend",
    v: "Cloud Run / Vercel",
    icon: "external"
  }, {
    k: "Backend / API",
    v: "Cloud Run",
    icon: "cpu"
  }, {
    k: "Agent runtime",
    v: "Agent Builder / ADK",
    icon: "brain"
  }, {
    k: "Data warehouse",
    v: "BigQuery",
    icon: "database"
  }, {
    k: "Data sync",
    v: "Fivetran",
    icon: "refresh"
  }, {
    k: "Partner MCP",
    v: "Fivetran MCP server",
    icon: "route"
  }, {
    k: "Secrets",
    v: "Secret Manager",
    icon: "lock"
  }, {
    k: "Logs",
    v: "Cloud Logging",
    icon: "timeline"
  }, {
    k: "State (optional)",
    v: "Firestore",
    icon: "layers"
  }];
  const ECOSYSTEM_FALLBACK = [{
    id: "google",
    name: "Google Cloud",
    role: "Gemini 3 · Agent Builder · Cloud Run · BigQuery",
    status: "core"
  }, {
    id: "fivetran",
    name: "Fivetran",
    role: "MCP sync (161 ops) → BigQuery",
    status: "pluggable"
  }, {
    id: "arize",
    name: "Arize Phoenix",
    role: "LLM tracing + evals · OpenTelemetry",
    status: "live"
  }, {
    id: "dynatrace",
    name: "Dynatrace",
    role: "APM / observability via OTLP export",
    status: "otlp-ready"
  }, {
    id: "elastic",
    name: "Elastic",
    role: "Recall + audit full-text search",
    status: "pluggable"
  }, {
    id: "mongodb",
    name: "MongoDB",
    role: "Agent memory + vector similar-recalls",
    status: "pluggable"
  }, {
    id: "gitlab",
    name: "GitLab",
    role: "CI/CD + DevSecOps pipeline",
    status: "in-repo"
  }];
  const eco = window.RO.ecosystem || ECOSYSTEM_FALLBACK;
  return React.createElement("div", {
    style: {
      display: "flex",
      flexDirection: "column",
      gap: 22,
      maxWidth: 1180,
      margin: "0 auto",
      width: "100%"
    }
  }, React.createElement(PageHeader, {
    eyebrow: "System architecture",
    title: "How RecallOps works",
    icon: "cpu",
    sub: "A judge-facing view of the data and control flow behind the containment agent."
  }), React.createElement("div", {
    className: "panel",
    style: {
      padding: 22
    }
  }, React.createElement(SectionTitle, {
    icon: "route",
    title: "Data & control flow",
    sub: "From a public FDA recall to an audit-ready, human-approved containment report."
  }), React.createElement(ArchitectureDiagram, null)), React.createElement("div", {
    className: "panel",
    style: {
      padding: 22,
      borderColor: "var(--cyan-line)",
      background: "linear-gradient(180deg, rgba(6,182,212,0.05), transparent 40%), var(--panel)"
    }
  }, React.createElement("div", {
    style: {
      display: "flex",
      gap: 14,
      alignItems: "flex-start"
    }
  }, React.createElement("div", {
    style: {
      width: 40,
      height: 40,
      borderRadius: "var(--r-sm)",
      flex: "none",
      background: "var(--cyan-dim)",
      border: "1px solid var(--cyan-line)",
      display: "grid",
      placeItems: "center",
      color: "var(--cyan)"
    }
  }, React.createElement(Icon, {
    name: "refresh",
    size: 20
  })), React.createElement("div", null, React.createElement("h3", {
    style: {
      margin: 0,
      fontSize: 17,
      fontWeight: 600,
      fontFamily: "var(--f-display)",
      color: "var(--t1)"
    }
  }, "Why Fivetran is load-bearing"), React.createElement("p", {
    style: {
      margin: "9px 0 0",
      fontSize: 14,
      color: "var(--t2)",
      lineHeight: 1.62,
      maxWidth: 820
    }
  }, "Fivetran is not decorative in RecallOps. It is the operational data foundation. The agent cannot determine recall blast radius without fresh synced data from inventory, POS, shipments, suppliers, customers, and locations.")))), React.createElement("div", null, React.createElement(SectionTitle, {
    icon: "layers",
    title: "Partner ecosystem",
    sub: "Built on Google Cloud + Fivetran, with first-class OpenTelemetry observability and a pluggable partner stack. Each badge reflects real config \u2014 no fake integrations."
  }), React.createElement("div", {
    style: {
      display: "grid",
      gridTemplateColumns: "repeat(auto-fit, minmax(258px,1fr))",
      gap: 12
    }
  }, eco.map(p => {
    const tone = p.status === "live" ? "success" : p.status === "core" ? "blue" : "warning";
    const label = {
      live: "LIVE",
      core: "CORE",
      pluggable: "PLUGGABLE",
      "otlp-ready": "OTLP-READY",
      "in-repo": "IN REPO"
    }[p.status] || p.status.toUpperCase();
    return React.createElement("div", {
      key: p.id,
      className: "panel lift",
      style: {
        padding: "15px 16px"
      }
    }, React.createElement("div", {
      style: {
        display: "flex",
        alignItems: "center",
        justifyContent: "space-between",
        gap: 8,
        marginBottom: 7
      }
    }, React.createElement("span", {
      style: {
        fontSize: 14,
        fontWeight: 600,
        color: "var(--t1)"
      }
    }, p.name), React.createElement(Badge, {
      tone: tone
    }, label)), React.createElement("div", {
      style: {
        fontSize: 12,
        color: "var(--t3)",
        lineHeight: 1.5
      }
    }, p.role));
  }))), React.createElement("div", null, React.createElement(SectionTitle, {
    icon: "cpu",
    title: "Cloud deployment",
    sub: "Google Cloud Rapid Agent Hackathon \u2014 Fivetran track."
  }), React.createElement("div", {
    style: {
      display: "grid",
      gridTemplateColumns: "repeat(auto-fit, minmax(220px,1fr))",
      gap: 12
    }
  }, deploy.map(d => React.createElement("div", {
    key: d.k,
    className: "panel lift",
    style: {
      padding: "15px 16px",
      display: "flex",
      alignItems: "center",
      gap: 13
    }
  }, React.createElement("div", {
    style: {
      width: 36,
      height: 36,
      borderRadius: "var(--r-sm)",
      flex: "none",
      background: "var(--panel-2)",
      border: "1px solid var(--border-2)",
      display: "grid",
      placeItems: "center",
      color: "var(--cyan)"
    }
  }, React.createElement(Icon, {
    name: d.icon,
    size: 17
  })), React.createElement("div", {
    style: {
      minWidth: 0
    }
  }, React.createElement("div", {
    className: "label"
  }, d.k), React.createElement("div", {
    style: {
      fontSize: 13.5,
      color: "var(--t1)",
      fontWeight: 600,
      marginTop: 3
    }
  }, d.v)))))), React.createElement("div", {
    className: "panel",
    style: {
      padding: 22
    }
  }, React.createElement(SectionTitle, {
    icon: "shield",
    title: "Compliance guarantees"
  }), React.createElement("div", {
    style: {
      display: "grid",
      gridTemplateColumns: "repeat(auto-fit, minmax(240px,1fr))",
      gap: 14
    }
  }, [["No external action executes without approval", "Customer-facing and destructive actions are gated behind a human approval modal.", "lock"], ["Audit-ready compliance report", "Every step is timestamped with actor and evidence, assembled into an exportable report.", "fileCheck"], ["Before-the-fact evidence", "Each action cites the exact BigQuery query and Fivetran sync it was derived from.", "database"]].map(([t, d, ic]) => React.createElement("div", {
    key: t,
    style: {
      padding: "15px 16px",
      background: "var(--panel-2)",
      border: "1px solid var(--border)",
      borderRadius: "var(--r-sm)"
    }
  }, React.createElement("div", {
    style: {
      width: 32,
      height: 32,
      borderRadius: "var(--r-sm)",
      background: "var(--cyan-dim)",
      border: "1px solid var(--cyan-line)",
      display: "grid",
      placeItems: "center",
      color: "var(--cyan)",
      marginBottom: 11
    }
  }, React.createElement(Icon, {
    name: ic,
    size: 16
  })), React.createElement("div", {
    style: {
      fontSize: 13.5,
      fontWeight: 600,
      color: "var(--t1)",
      marginBottom: 5,
      lineHeight: 1.3
    }
  }, t), React.createElement("p", {
    style: {
      margin: 0,
      fontSize: 12,
      color: "var(--t3)",
      lineHeight: 1.5
    }
  }, d))))));
}
function SettingsView() {
  const ig = window.RO_INTEGRATIONS || {};
  const realStatus = it => {
    const map = {
      openfda: ig.openfda,
      gemini: ig.gemini,
      bigquery: ig.bigquery,
      fivetran: ig.fivetran,
      fivetran_mcp: ig.fivetran
    };
    if (it.id in map) return map[it.id] === "live" ? it.status : "fallback";
    if (it.id === "cloudrun") return window.RO_LIVE ? it.status : "fallback";
    if (it.id === "secret") return "fallback";
    return it.status;
  };
  const [items, setItems] = useState(() => window.RO.integrations.map(it => ({
    ...it,
    status: realStatus(it)
  })));
  const [retry, setRetry] = useState(null);
  const reconnect = id => {
    setRetry(id);
    setTimeout(() => {
      setItems(list => list.map(x => x.id === id ? {
        ...x,
        status: "connected",
        detail: "ingest recovered · 0 lag"
      } : x));
      setRetry(null);
    }, 1500);
  };
  const ACC = {
    cyan: "var(--cyan)",
    blue: "var(--blue)",
    success: "var(--success)",
    warning: "var(--warning)"
  };
  const ST = {
    connected: "Connected",
    active: "Active",
    synced: "Synced",
    ready: "Ready",
    live: "Live",
    degraded: "Degraded",
    fallback: "Fallback"
  };
  const STtone = {
    connected: "success",
    active: "success",
    synced: "blue",
    ready: "blue",
    live: "success",
    degraded: "warning",
    fallback: "warning"
  };
  return React.createElement("div", {
    style: {
      display: "flex",
      flexDirection: "column",
      gap: 22,
      maxWidth: 1080,
      margin: "0 auto",
      width: "100%"
    }
  }, React.createElement(PageHeader, {
    eyebrow: "Environment & integrations",
    title: "Integration health",
    icon: "settings",
    sub: "Connection status for every system in the containment pipeline. Wire these to real credentials and the command center goes live."
  }), React.createElement("div", {
    style: {
      display: "grid",
      gridTemplateColumns: "repeat(auto-fit, minmax(280px,1fr))",
      gap: 14
    }
  }, items.map(it => {
    const degraded = it.status === "degraded";
    const fallback = it.status === "fallback";
    const tone = STtone[it.status];
    return React.createElement("div", {
      key: it.id,
      className: "panel lift",
      style: {
        padding: 18,
        borderColor: degraded ? "rgba(245,158,11,.34)" : "var(--border)"
      }
    }, React.createElement("div", {
      style: {
        display: "flex",
        alignItems: "flex-start",
        justifyContent: "space-between",
        gap: 10,
        marginBottom: 14
      }
    }, React.createElement("div", {
      style: {
        display: "flex",
        alignItems: "center",
        gap: 11,
        minWidth: 0
      }
    }, React.createElement("div", {
      style: {
        width: 40,
        height: 40,
        borderRadius: "var(--r-sm)",
        flex: "none",
        display: "grid",
        placeItems: "center",
        background: "color-mix(in srgb," + ACC[it.accent] + " 12%, var(--panel-2))",
        border: "1px solid color-mix(in srgb," + ACC[it.accent] + " 30%, transparent)",
        color: ACC[it.accent]
      }
    }, React.createElement(Icon, {
      name: it.id.includes("fivetran") ? "refresh" : it.id === "bigquery" ? "database" : it.id === "gemini" ? "brain" : it.id === "cloudrun" ? "cpu" : it.id === "openfda" ? "external" : it.id === "secret" ? "lock" : it.id === "logging" ? "timeline" : "layers",
      size: 19
    })), React.createElement("div", {
      style: {
        minWidth: 0
      }
    }, React.createElement("div", {
      style: {
        fontSize: 14,
        fontWeight: 600,
        color: "var(--t1)"
      }
    }, it.name), React.createElement("div", {
      className: "label",
      style: {
        marginTop: 3
      }
    }, it.role))), React.createElement("span", {
      style: {
        display: "inline-flex",
        alignItems: "center",
        gap: 6,
        fontSize: 11.5,
        fontFamily: "var(--f-mono)",
        color: RTONE[tone],
        flex: "none"
      }
    }, React.createElement(StatusDot, {
      tone: tone,
      live: !degraded
    }), " ", ST[it.status])), fallback ? React.createElement("div", {
      style: {
        background: "color-mix(in srgb, var(--warning) 10%, transparent)",
        border: "1px solid rgba(245,158,11,.28)",
        borderRadius: "var(--r-sm)",
        padding: "11px 12px",
        display: "flex",
        alignItems: "center",
        gap: 10
      }
    }, React.createElement(Icon, {
      name: "alert",
      size: 15,
      style: {
        color: "var(--warning)",
        flex: "none"
      }
    }), React.createElement("span", {
      style: {
        fontSize: 12,
        color: "var(--t2)"
      }
    }, "Not connected \u2014 add credentials to go live (docs/setup.md).")) : degraded ? React.createElement("div", {
      style: {
        background: "color-mix(in srgb, var(--warning) 12%, transparent)",
        border: "1px solid rgba(245,158,11,.3)",
        borderRadius: "var(--r-sm)",
        padding: "11px 12px",
        display: "flex",
        alignItems: "center",
        gap: 11,
        flexWrap: "wrap"
      }
    }, React.createElement(Icon, {
      name: "alert",
      size: 16,
      style: {
        color: "var(--warning)",
        flex: "none"
      }
    }), React.createElement("span", {
      style: {
        fontSize: 12,
        color: "var(--t1)",
        flex: 1,
        minWidth: 110
      }
    }, it.detail), React.createElement(Button, {
      variant: "ghost",
      size: "sm",
      onClick: () => reconnect(it.id),
      disabled: retry === it.id
    }, retry === it.id ? "Reconnecting…" : "Reconnect")) : React.createElement("div", {
      style: {
        display: "flex",
        alignItems: "center",
        justifyContent: "space-between",
        gap: 10
      }
    }, React.createElement("code", {
      className: "mono",
      style: {
        fontSize: 11.5,
        color: "var(--t3)"
      }
    }, it.detail), React.createElement("span", {
      style: {
        display: "inline-flex",
        alignItems: "center",
        gap: 5,
        color: "var(--success)",
        fontSize: 11,
        fontFamily: "var(--f-mono)"
      }
    }, React.createElement(Icon, {
      name: "check",
      size: 12
    }), " healthy")));
  })), React.createElement("div", {
    style: {
      display: "grid",
      gridTemplateColumns: "1fr 1fr",
      gap: 18
    },
    className: "ro-blast"
  }, React.createElement("div", {
    className: "panel",
    style: {
      padding: 20
    }
  }, React.createElement(SectionTitle, {
    icon: "route",
    title: "Fivetran MCP tools",
    sub: "Tools the agent calls for Fivetran-synced operational data."
  }), React.createElement("div", {
    style: {
      display: "grid",
      gridTemplateColumns: "1fr 1fr",
      gap: 10
    }
  }, [["list_connectors", "Enumerate sources"], ["trigger_sync", "Force a connector resync"], ["get_sync_status", "Poll sync state"], ["describe_schema", "Warehouse schema"], ["get_records", "Sampled rows"]].map(([t, d]) => React.createElement("div", {
    key: t,
    style: {
      padding: "11px 12px",
      background: "var(--panel-2)",
      border: "1px solid var(--border)",
      borderRadius: "var(--r-sm)"
    }
  }, React.createElement("div", {
    style: {
      display: "flex",
      alignItems: "center",
      gap: 7,
      marginBottom: 4
    }
  }, React.createElement(Icon, {
    name: "route",
    size: 12,
    style: {
      color: "var(--cyan)"
    }
  }), React.createElement("code", {
    className: "mono",
    style: {
      fontSize: 11.5,
      color: "var(--t1)",
      fontWeight: 600
    }
  }, t)), React.createElement("p", {
    style: {
      margin: 0,
      fontSize: 11,
      color: "var(--t3)"
    }
  }, d))))), React.createElement("div", {
    className: "panel",
    style: {
      padding: 20
    }
  }, React.createElement(SectionTitle, {
    icon: "shield",
    title: "Containment policy"
  }), React.createElement(Toggle, {
    k: "Require human approval",
    sub: "Gate every action behind sign-off",
    on: true
  }), React.createElement(Toggle, {
    k: "Block customer-facing auto-execute",
    sub: "Never message customers without approval",
    on: true
  }), React.createElement(Toggle, {
    k: "Suppress non-consented contacts",
    sub: "Honor opt-out on notifications",
    on: true
  }), React.createElement(Toggle, {
    k: "Write all events to audit log",
    sub: "Immutable compliance trail",
    on: true,
    last: true
  }))));
}
function Toggle({
  k,
  sub,
  on: init,
  last
}) {
  const [on, setOn] = useState(init);
  return React.createElement("div", {
    style: {
      display: "flex",
      alignItems: "center",
      justifyContent: "space-between",
      gap: 12,
      padding: "12px 0",
      borderBottom: last ? "none" : "1px solid var(--border)"
    }
  }, React.createElement("div", {
    style: {
      minWidth: 0
    }
  }, React.createElement("div", {
    style: {
      fontSize: 13,
      color: "var(--t1)",
      fontWeight: 500
    }
  }, k), React.createElement("div", {
    style: {
      fontSize: 11.5,
      color: "var(--t3)",
      marginTop: 2
    }
  }, sub)), React.createElement("button", {
    onClick: () => setOn(o => !o),
    role: "switch",
    "aria-checked": on,
    "aria-label": k,
    style: {
      width: 40,
      height: 23,
      borderRadius: 999,
      flex: "none",
      cursor: "pointer",
      position: "relative",
      background: on ? "var(--success)" : "var(--panel-3)",
      border: "1px solid " + (on ? "var(--success)" : "var(--border-3)"),
      transition: "all .2s"
    }
  }, React.createElement("span", {
    style: {
      position: "absolute",
      top: 2,
      left: on ? 19 : 2,
      width: 17,
      height: 17,
      borderRadius: "50%",
      background: on ? "#06101c" : "var(--t3)",
      transition: "left .2s cubic-bezier(.22,.61,.36,1)"
    }
  })));
}
Object.assign(window, {
  ComplianceView,
  ReportView,
  ArchitectureView,
  SettingsView
});

/* ===== views_cortex.jsx ===== */
function GraphPreview() {
  const {
    navigate
  } = useRO();
  return React.createElement("div", {
    className: "panel",
    style: {
      padding: 0,
      overflow: "hidden",
      position: "relative",
      height: 320
    }
  }, React.createElement("div", {
    style: {
      position: "absolute",
      top: 0,
      left: 0,
      right: 0,
      zIndex: 3,
      display: "flex",
      alignItems: "center",
      justifyContent: "space-between",
      padding: "12px 16px",
      borderBottom: "1px solid var(--border)",
      background: "linear-gradient(180deg, rgba(13,19,32,0.9), transparent)"
    }
  }, React.createElement("div", {
    style: {
      display: "flex",
      alignItems: "center",
      gap: 9
    }
  }, React.createElement(Icon, {
    name: "graph",
    size: 15,
    style: {
      color: "var(--cyan)"
    }
  }), React.createElement("span", {
    style: {
      fontSize: 13,
      fontWeight: 600,
      fontFamily: "var(--f-display)",
      color: "var(--t1)"
    }
  }, "RecallGraph memory")), React.createElement(Button, {
    variant: "ghost",
    size: "sm",
    iconRight: "maximize",
    onClick: () => navigate("graph")
  }, "Open")), React.createElement(RecallGraph, {
    mini: true
  }), React.createElement("div", {
    onClick: () => navigate("graph"),
    style: {
      position: "absolute",
      inset: 0,
      zIndex: 2,
      cursor: "pointer"
    },
    title: "Open RecallGraph"
  }));
}
function RiskConfidencePanel() {
  const m = window.RO.entityMatches;
  const det = m.filter(x => x.confidence >= 0.9);
  const fuzzy = m.filter(x => x.confidence >= 0.7 && x.confidence < 0.9);
  const low = m.filter(x => x.confidence < 0.7);
  const Row = ({
    x
  }) => React.createElement("div", {
    style: {
      display: "flex",
      alignItems: "center",
      justifyContent: "space-between",
      gap: 10,
      padding: "9px 11px",
      background: "var(--panel-2)",
      border: "1px solid var(--border)",
      borderRadius: "var(--r-sm)"
    }
  }, React.createElement("div", {
    style: {
      minWidth: 0
    }
  }, React.createElement("div", {
    className: "mono",
    style: {
      fontSize: 11.5,
      color: "var(--t1)",
      whiteSpace: "nowrap",
      overflow: "hidden",
      textOverflow: "ellipsis"
    }
  }, x.from), React.createElement("div", {
    className: "mono",
    style: {
      fontSize: 10,
      color: "var(--t3)",
      marginTop: 2
    }
  }, "\u2192 ", x.to)), React.createElement("span", {
    className: "mono",
    style: {
      fontSize: 12,
      fontWeight: 600,
      flex: "none",
      color: x.confidence >= 0.9 ? "var(--success)" : x.confidence >= 0.7 ? "var(--class-2)" : "var(--class-1)"
    }
  }, x.confidence.toFixed(2)));
  return React.createElement("div", {
    className: "panel",
    style: {
      padding: 20
    }
  }, React.createElement(SectionTitle, {
    icon: "target",
    title: "Risk & confidence",
    sub: "Deterministic vs fuzzy entity matches \u2014 explainable scoring."
  }), React.createElement("div", {
    style: {
      display: "flex",
      flexDirection: "column",
      gap: 14
    }
  }, React.createElement("div", null, React.createElement("div", {
    style: {
      display: "flex",
      alignItems: "center",
      gap: 7,
      marginBottom: 8
    }
  }, React.createElement(StatusDot, {
    tone: "success",
    live: false
  }), React.createElement("span", {
    className: "label",
    style: {
      color: "var(--success)"
    }
  }, "Deterministic \xB7 auto-applied (", det.length, ")")), React.createElement("div", {
    style: {
      display: "flex",
      flexDirection: "column",
      gap: 7
    }
  }, det.map(x => React.createElement(Row, {
    key: x.id,
    x: x
  })))), React.createElement("div", null, React.createElement("div", {
    style: {
      display: "flex",
      alignItems: "center",
      gap: 7,
      marginBottom: 8
    }
  }, React.createElement(StatusDot, {
    tone: "warning",
    live: false
  }), React.createElement("span", {
    className: "label",
    style: {
      color: "var(--class-2)"
    }
  }, "Fuzzy \xB7 review suggested (", fuzzy.length, ")")), React.createElement("div", {
    style: {
      display: "flex",
      flexDirection: "column",
      gap: 7
    }
  }, fuzzy.map(x => React.createElement(Row, {
    key: x.id,
    x: x
  })))), low.length > 0 && React.createElement("div", null, React.createElement("div", {
    style: {
      display: "flex",
      alignItems: "center",
      gap: 7,
      marginBottom: 8
    }
  }, React.createElement(StatusDot, {
    tone: "danger",
    live: false
  }), React.createElement("span", {
    className: "label",
    style: {
      color: "var(--class-1)"
    }
  }, "Low confidence \xB7 human review required (", low.length, ")")), React.createElement("div", {
    style: {
      display: "flex",
      flexDirection: "column",
      gap: 7
    }
  }, low.map(x => React.createElement(Row, {
    key: x.id,
    x: x
  })))), React.createElement("div", {
    style: {
      display: "flex",
      alignItems: "center",
      gap: 10,
      padding: "11px 13px",
      background: "var(--success-dim)",
      border: "1px solid rgba(16,185,129,.25)",
      borderRadius: "var(--r-sm)"
    }
  }, React.createElement(Icon, {
    name: "shieldCheck",
    size: 16,
    style: {
      color: "var(--success)"
    }
  }), React.createElement("span", {
    style: {
      fontSize: 12.5,
      color: "var(--t1)"
    }
  }, "Residual risk ", React.createElement("strong", {
    style: {
      color: "var(--success)"
    }
  }, "low"), " \u2014 every low-confidence match is gated behind human review."))));
}
function CortexView() {
  const store = useRO();
  const {
    triggerContainment,
    judgeMode,
    navigate,
    phase,
    analyzeOn,
    actionsOn
  } = store;
  const [modal, setModal] = useState(null);
  const started = phase !== "idle";
  const s = window.RO.stats;
  return React.createElement("div", {
    style: {
      display: "flex",
      flexDirection: "column",
      gap: 22
    }
  }, React.createElement("section", {
    className: "rise",
    style: {
      "--dur": "0.45s"
    }
  }, React.createElement("div", {
    style: {
      display: "grid",
      gridTemplateColumns: "1.25fr 0.75fr",
      gap: 18
    },
    className: "ro-hero"
  }, React.createElement("div", {
    className: "panel",
    style: {
      padding: "24px 24px",
      display: "flex",
      flexDirection: "column",
      justifyContent: "center",
      position: "relative",
      overflow: "hidden"
    }
  }, React.createElement("div", {
    style: {
      position: "absolute",
      inset: 0,
      background: "radial-gradient(110% 80% at 0% 0%, rgba(6,182,212,.08), transparent 58%)",
      pointerEvents: "none"
    }
  }), React.createElement("div", {
    style: {
      position: "relative"
    }
  }, React.createElement("div", {
    style: {
      display: "inline-flex",
      alignItems: "center",
      gap: 8,
      padding: "5px 11px",
      borderRadius: "var(--r-pill)",
      background: store.contained ? "var(--success-dim)" : "var(--class-1-dim)",
      border: "1px solid " + (store.contained ? "rgba(16,185,129,.34)" : "rgba(239,68,68,.34)"),
      marginBottom: 16
    }
  }, React.createElement(StatusDot, {
    tone: store.contained ? "success" : "danger",
    live: started && !store.contained
  }), React.createElement("span", {
    className: "mono",
    style: {
      fontSize: 11,
      letterSpacing: ".08em",
      textTransform: "uppercase",
      color: store.contained ? "var(--success)" : "var(--class-1)",
      fontWeight: 600
    }
  }, store.contained ? "Recall contained" : started ? "Containment in progress" : "Class I recall · operational memory online")), React.createElement("h1", {
    style: {
      margin: 0,
      fontFamily: "var(--f-display)",
      fontSize: "clamp(30px, 4.4vw, 46px)",
      fontWeight: 600,
      letterSpacing: "-.02em",
      lineHeight: 1.02,
      color: "var(--t1)"
    }
  }, "RecallOps Cortex"), React.createElement("p", {
    style: {
      margin: "13px 0 0",
      fontSize: "clamp(14px,1.6vw,16px)",
      color: "var(--t2)",
      maxWidth: 540,
      lineHeight: 1.55
    }
  }, "Operational memory and human-approved recall containment."), React.createElement("div", {
    style: {
      display: "flex",
      gap: 10,
      marginTop: 22,
      flexWrap: "wrap"
    }
  }, !started ? React.createElement(Button, {
    variant: "primary",
    size: "lg",
    icon: "zap",
    onClick: triggerContainment
  }, "Run Containment") : store.contained ? React.createElement(Button, {
    variant: "success",
    size: "lg",
    icon: "refresh",
    onClick: store.reset
  }, "Reset scenario") : React.createElement(Button, {
    variant: "primary",
    size: "lg",
    disabled: true,
    icon: "refresh"
  }, "Running\u2026"), React.createElement(Button, {
    variant: "secondary",
    size: "lg",
    icon: "gavel",
    onClick: judgeMode
  }, "Judge Mode"), React.createElement(Button, {
    variant: "ghost",
    size: "lg",
    icon: "fileCheck",
    onClick: () => navigate("report")
  }, "View Report"), React.createElement(Button, {
    variant: "ghost",
    size: "lg",
    icon: "cpu",
    onClick: () => navigate("architecture")
  }, "Inspect Architecture")))), React.createElement(PipelineViz, null))), React.createElement("section", null, React.createElement(SectionTitle, {
    num: "01",
    icon: "inbox",
    title: "Recall intake",
    sub: "Live openFDA enforcement record, matched to internal SKUs."
  }), React.createElement(RecallIntakeCard, {
    onTrigger: triggerContainment,
    started: started
  })), React.createElement("section", null, React.createElement(SectionTitle, {
    num: "02",
    icon: "refresh",
    title: "Fivetran-synced operational data",
    sub: "The agent cannot scope a recall without fresh synced data in BigQuery."
  }), React.createElement(FivetranSyncStrip, null)), React.createElement("section", null, React.createElement(SectionTitle, {
    num: "03",
    icon: "radar",
    title: "Blast radius",
    sub: "BigQuery blast-radius analysis across inventory, sales, shipments, suppliers, and customers.",
    right: React.createElement(Button, {
      variant: "ghost",
      size: "sm",
      iconRight: "arrowRight",
      onClick: () => navigate("graph")
    }, "Graph")
  }), React.createElement("div", {
    style: {
      display: "grid",
      gridTemplateColumns: "repeat(auto-fit, minmax(150px,1fr))",
      gap: 12
    }
  }, React.createElement(MetricTile, {
    big: true,
    icon: "pin",
    label: "Locations affected",
    value: s.locationsAffected,
    tone: "danger",
    animate: analyzeOn,
    sub: "14 critical"
  }), React.createElement(MetricTile, {
    big: true,
    icon: "package",
    label: "Inventory units",
    value: s.unitsInventory,
    tone: "cyan",
    animate: analyzeOn,
    sub: "to quarantine"
  }), React.createElement(MetricTile, {
    icon: "store",
    label: "Units sold",
    value: s.unitsSold,
    tone: "warning",
    animate: analyzeOn,
    sub: "exposure"
  }), React.createElement(MetricTile, {
    icon: "truck",
    label: "Shipments",
    value: s.shipmentsInTransit,
    tone: "class3",
    animate: analyzeOn,
    sub: "in transit"
  }), React.createElement(MetricTile, {
    icon: "users",
    label: "Customers",
    value: s.customersToNotify,
    tone: "blue",
    animate: analyzeOn,
    sub: "to notify"
  }), React.createElement(MetricTile, {
    icon: "shield",
    label: "Stop-sale actions",
    value: 6,
    tone: "success",
    animate: analyzeOn,
    sub: "drafted"
  }))), React.createElement("section", null, React.createElement("div", {
    style: {
      display: "grid",
      gridTemplateColumns: "1fr 1fr",
      gap: 18
    },
    className: "ro-blast"
  }, React.createElement(GraphPreview, null), React.createElement("div", {
    style: {
      minHeight: 320
    }
  }, React.createElement(ReasoningTrace, null)))), React.createElement("section", null, React.createElement(SectionTitle, {
    num: "04",
    icon: "shield",
    title: "Containment action queue",
    sub: "No external action executes without approval.",
    right: React.createElement(Button, {
      variant: "ghost",
      size: "sm",
      iconRight: "arrowRight",
      onClick: () => navigate("actions")
    }, "Workbench")
  }), actionsOn ? React.createElement("div", {
    style: {
      display: "grid",
      gridTemplateColumns: "1fr 1fr",
      gap: 13
    },
    className: "ro-actions-grid"
  }, window.RO.actions.map((a, i) => React.createElement(ActionCard, {
    key: a.id,
    action: a,
    state: store.actionState[a.id],
    onApprove: setModal,
    onReject: store.rejectAction,
    delay: i * 60
  }))) : React.createElement(ActionsPlaceholder, {
    started: started,
    onTrigger: triggerContainment
  })), React.createElement("section", null, React.createElement(SectionTitle, {
    num: "05",
    icon: "target",
    title: "Risk & confidence",
    sub: "Explainable entity resolution behind every action."
  }), React.createElement(RiskConfidencePanel, null)), modal && React.createElement(ApprovalModal, {
    action: modal,
    onApprove: id => {
      store.approveAction(id);
      setModal(null);
    },
    onCancel: () => setModal(null)
  }));
}
const PLACEHOLDER_META = {
  replay: {
    title: "Crisis Replay",
    eyebrow: "watch the incident",
    icon: "play",
    phase: 7,
    lines: ["Play / pause / scrub / speed", "Pipeline, graph, stats, trace animate", "Jump to any incident phase"]
  }
};
function Placeholder({
  routeId
}) {
  const m = PLACEHOLDER_META[routeId] || {
    title: routeId,
    eyebrow: "module",
    icon: "command",
    phase: "—",
    lines: []
  };
  return React.createElement("div", {
    style: {
      display: "flex",
      flexDirection: "column",
      gap: 22
    }
  }, React.createElement(PageHeader, {
    eyebrow: m.eyebrow,
    title: m.title,
    icon: m.icon,
    sub: "Phased build.",
    right: React.createElement(Badge, {
      tone: "cyan"
    }, "Phase ", m.phase)
  }), React.createElement("div", {
    className: "panel",
    style: {
      padding: "40px 28px",
      display: "flex",
      flexDirection: "column",
      alignItems: "center",
      gap: 16,
      textAlign: "center"
    }
  }, React.createElement("div", {
    style: {
      width: 54,
      height: 54,
      borderRadius: "var(--r-md)",
      background: "var(--panel-3)",
      border: "1px solid var(--border-2)",
      display: "grid",
      placeItems: "center",
      color: "var(--cyan)"
    }
  }, React.createElement(Icon, {
    name: m.icon,
    size: 26
  })), React.createElement("div", {
    style: {
      fontSize: 16,
      fontWeight: 600,
      color: "var(--t1)",
      fontFamily: "var(--f-display)"
    }
  }, m.title)));
}
window.CortexView = CortexView;
window.Placeholder = Placeholder;
window.GraphPreview = GraphPreview;
window.RiskConfidencePanel = RiskConfidencePanel;

/* ===== graph.jsx ===== */
const GRAPH_TYPE_LABEL = {
  recall: "Recall",
  product: "Product",
  sku: "SKU",
  lot: "Lot",
  supplier: "Supplier",
  shipment: "Shipment",
  location: "Location",
  customer_segment: "Customer segment",
  containment_action: "Action",
  evidence: "Evidence",
  audit_event: "Audit",
  playbook_memory: "Memory",
  eval_case: "Eval case",
  improvement_proposal: "Improvement"
};
function buildGraphData() {
  const nodes = window.RO.graph.nodes.map(n => ({
    ...n
  }));
  const links = window.RO.graph.edges.map(e => ({
    ...e
  }));
  return {
    nodes,
    links
  };
}
const GRAPH_MODES = {
  all: {
    label: "Full graph",
    icon: "graph",
    set: () => null
  },
  blast: {
    label: "Trace blast radius",
    icon: "radar",
    set: n => ["recall", "product", "sku", "lot", "location", "customer_segment"].includes(n.type)
  },
  context: {
    label: "Context pack",
    icon: "layers",
    set: n => ["recall", "product", "sku", "lot", "location", "shipment", "customer_segment", "evidence"].includes(n.type)
  },
  memory: {
    label: "Show memory",
    icon: "sparkles",
    set: n => ["recall", "playbook_memory"].includes(n.type)
  },
  lowconf: {
    label: "Low-confidence",
    icon: "alert",
    set: n => n.confidence < 0.78
  },
  actions: {
    label: "Approved actions",
    icon: "shield",
    set: n => ["containment_action", "audit_event"].includes(n.type)
  }
};
function DockBtn({
  icon,
  text,
  title,
  active,
  onClick
}) {
  return React.createElement("button", {
    onClick: onClick,
    title: title,
    "aria-label": title,
    style: {
      width: 32,
      height: 32,
      borderRadius: "var(--r-sm)",
      display: "grid",
      placeItems: "center",
      cursor: "pointer",
      padding: 0,
      background: active ? "var(--cyan-dim)" : "transparent",
      border: "1px solid " + (active ? "var(--cyan-line)" : "transparent"),
      color: active ? "var(--cyan)" : "var(--t2)",
      fontFamily: "var(--f-mono)",
      fontSize: 16,
      fontWeight: 600,
      transition: "all .14s"
    },
    onMouseEnter: e => {
      if (!active) e.currentTarget.style.background = "var(--panel-3)";
    },
    onMouseLeave: e => {
      if (!active) e.currentTarget.style.background = "transparent";
    }
  }, icon ? React.createElement(Icon, {
    name: icon,
    size: 15
  }) : text);
}
function RecallGraph({
  mini = false,
  mode = "all",
  onModeMeta
}) {
  const wrapRef = useRef(null);
  const gRef = useRef(null);
  const modeRef = useRef(mode);
  const hoverRef = useRef(null);
  const partsRef = useRef(true);
  const {
    openInspector
  } = useRO();
  const [ready, setReady] = useState(false);
  const [err, setErr] = useState(false);
  const [spin, setSpin] = useState(true);
  const [parts, setParts] = useState(true);
  const adj = useMemo(() => {
    const m = {};
    window.RO.graph.edges.forEach(e => {
      (m[e.source] = m[e.source] || new Set()).add(e.target);
      (m[e.target] = m[e.target] || new Set()).add(e.source);
    });
    return m;
  }, []);
  useEffect(() => {
    modeRef.current = mode;
    if (gRef.current) refreshStyle();
  }, [mode]);
  const lid = x => typeof x === "object" ? x.id : x;
  const highlighted = n => {
    const f = (GRAPH_MODES[modeRef.current] || GRAPH_MODES.all).set;
    return modeRef.current === "all" ? true : !!f(n);
  };
  const refreshStyle = () => {
    const g = gRef.current;
    if (!g) return;
    const h = hoverRef.current;
    const hset = h ? new Set([h.id, ...(adj[h.id] || [])]) : null;
    g.nodeColor(n => {
      if (hset) return hset.has(n.id) ? n.color : hexA(n.color, 0.05);
      return highlighted(n) ? n.color : dim(n.color);
    });
    g.linkColor(l => {
      const s = lid(l.source),
        t = lid(l.target);
      if (hset) {
        return s === h.id || t === h.id ? hexA(h.color, 0.7) : "rgba(148,163,184,0.04)";
      }
      const on = modeRef.current === "all" || highlighted(getNode(s)) && highlighted(getNode(t));
      return on ? modeRef.current === "lowconf" && l.confidence < 0.78 ? "rgba(245,158,11,0.6)" : "rgba(148,163,184,0.32)" : "rgba(148,163,184,0.05)";
    });
    g.linkWidth(l => {
      const s = lid(l.source),
        t = lid(l.target);
      if (hset && (s === h.id || t === h.id)) return 1.6;
      return 0.4 + (l.weight || 1) * 0.4;
    });
    g.linkDirectionalParticles(l => {
      if (!partsRef.current) return 0;
      const s = lid(l.source),
        t = lid(l.target);
      if (hset) return s === h.id || t === h.id ? 4 : 0;
      const on = modeRef.current === "all" || highlighted(getNode(s)) && highlighted(getNode(t));
      return on ? 2 : 0;
    });
  };
  const nodeMap = useMemo(() => Object.fromEntries(window.RO.graph.nodes.map(n => [n.id, n])), []);
  const getNode = id => nodeMap[id] || {
    type: ""
  };
  function dim(hex) {
    return hexA(hex, 0.12);
  }
  function hexA(hex, a) {
    const h = hex.replace("#", "");
    const r = parseInt(h.slice(0, 2), 16),
      g = parseInt(h.slice(2, 4), 16),
      b = parseInt(h.slice(4, 6), 16);
    return `rgba(${r},${g},${b},${a})`;
  }
  useEffect(() => {
    if (!window.ForceGraph3D) {
      setErr(true);
      return;
    }
    try {
      const tc = document.createElement("canvas");
      if (!(tc.getContext("webgl") || tc.getContext("webgl2") || tc.getContext("experimental-webgl"))) {
        setErr(true);
        return;
      }
    } catch (e) {
      setErr(true);
      return;
    }
    const el = wrapRef.current;
    if (!el) return;
    const data = buildGraphData();
    let g;
    try {
      g = window.ForceGraph3D({
        controlType: "orbit",
        rendererConfig: {
          antialias: true,
          alpha: true,
          preserveDrawingBuffer: true
        }
      })(el).graphData(data).backgroundColor("rgba(0,0,0,0)").showNavInfo(false).nodeRelSize(mini ? 2.4 : 3.2).nodeVal(n => Math.min(n.val || 3, 7)).nodeColor(n => n.color).nodeOpacity(0.92).nodeResolution(12).linkColor(() => "rgba(148,163,184,0.34)").linkWidth(l => 0.4 + (l.weight || 1) * 0.4).linkDirectionalParticles(2).linkDirectionalParticleWidth(mini ? 1.4 : 2).linkDirectionalParticleSpeed(0.005).linkDirectionalParticleColor(() => "rgba(150,200,255,0.9)").linkCurvature(mini ? 0.12 : 0.2).nodeLabel(n => `<div style="font-family:Inter,sans-serif;background:#0D1320;border:1px solid #28384F;border-radius:6px;padding:7px 10px;color:#E8EEF7;font-size:12px;box-shadow:0 8px 24px rgba(0,0,0,.6)">
        <div style="font-size:9px;letter-spacing:.1em;text-transform:uppercase;color:${n.color};margin-bottom:3px">${GRAPH_TYPE_LABEL[n.type] || n.type}</div>
        <div style="font-weight:600">${n.label}</div>
        <div style="font-family:'JetBrains Mono',monospace;font-size:10px;color:#8A99B0;margin-top:3px">conf ${(n.confidence ?? 1).toFixed(2)} · ${n.source || "BigQuery"}</div></div>`).width(el.clientWidth).height(el.clientHeight);
    } catch (e) {
      setErr(true);
      return;
    }
    if (!mini) {
      g.onNodeClick(n => {
        openInspector({
          kind: GRAPH_TYPE_LABEL[n.type] || n.type,
          accent: n.color,
          title: n.label,
          subtitle: n.id + " · " + (n.source || "BigQuery"),
          fields: [{
            k: "Node type",
            v: GRAPH_TYPE_LABEL[n.type] || n.type
          }, {
            k: "Confidence",
            v: (n.confidence ?? 1).toFixed(2),
            tone: n.confidence < 0.78 ? "var(--warning)" : "var(--success)",
            mono: true
          }, {
            k: "Source system",
            v: n.source || "BigQuery",
            mono: true
          }, {
            k: "Severity",
            v: n.severity || "—"
          }, {
            k: "Connections",
            v: window.RO.graph.edges.filter(e => e.source === n.id || e.target === n.id).length + " edges",
            mono: true
          }],
          json: {
            id: n.id,
            type: n.type,
            label: n.label,
            confidence: n.confidence,
            source: n.source,
            severity: n.severity
          }
        });
        const dist = 90;
        const r = 1 + dist / Math.hypot(n.x || 1, n.y || 1, n.z || 1);
        g.cameraPosition({
          x: (n.x || 0) * r,
          y: (n.y || 0) * r,
          z: (n.z || 0) * r
        }, n, 1200);
      });
    }
    g.cooldownTicks(mini ? 90 : 240);
    g.cameraPosition({
      x: 0,
      y: 0,
      z: mini ? 175 : 150
    });
    g.onEngineStop(() => {
      try {
        g.zoomToFit(600, mini ? 45 : 70);
      } catch (e) {}
      refreshStyle();
    });
    try {
      g.d3Force("charge").strength(mini ? -62 : -98);
      const lf = g.d3Force("link");
      if (lf) lf.distance(l => l.edge_type === "similar_to" ? 82 : l.edge_type === "triggers" ? 54 : 34);
    } catch (e) {}
    if (!mini) {
      g.onNodeHover(n => {
        hoverRef.current = n || null;
        if (el) el.style.cursor = n ? "pointer" : "grab";
        refreshStyle();
      });
    }
    const ctr = g.controls();
    if (ctr) {
      ctr.autoRotate = true;
      ctr.autoRotateSpeed = mini ? 0.8 : 0.4;
      ctr.enableZoom = !mini;
      ctr.enableDamping = true;
      ctr.dampingFactor = 0.12;
    }
    gRef.current = g;
    window.__g = g;
    setReady(true);
    setTimeout(() => {
      refreshStyle();
    }, 800);
    const onResize = () => {
      if (el) g.width(el.clientWidth).height(el.clientHeight);
    };
    const ro = new ResizeObserver(onResize);
    ro.observe(el);
    return () => {
      ro.disconnect();
      try {
        g._destructor && g._destructor();
      } catch (e) {}
      gRef.current = null;
    };
  }, []);
  const zoomFit = () => {
    try {
      gRef.current && gRef.current.zoomToFit(800, mini ? 40 : 80);
    } catch (e) {}
  };
  const zoomBy = f => {
    const g = gRef.current;
    if (!g) return;
    const c = g.camera();
    c.position.multiplyScalar(f);
  };
  const toggleSpin = () => setSpin(s => {
    const ns = !s;
    const c = gRef.current && gRef.current.controls();
    if (c) c.autoRotate = ns;
    return ns;
  });
  const toggleParts = () => setParts(p => {
    const np = !p;
    partsRef.current = np;
    refreshStyle();
    return np;
  });
  if (err) {
    return React.createElement("div", {
      ref: wrapRef,
      style: {
        width: "100%",
        height: "100%",
        display: "grid",
        placeItems: "center",
        color: "var(--t3)",
        textAlign: "center"
      }
    }, React.createElement("div", null, React.createElement(Icon, {
      name: "graph",
      size: 28,
      style: {
        color: "var(--t4)",
        margin: "0 auto 10px"
      }
    }), React.createElement("div", {
      style: {
        fontSize: 13,
        color: "var(--t2)"
      }
    }, "3D graph engine offline"), React.createElement("div", {
      className: "mono",
      style: {
        fontSize: 11,
        marginTop: 4
      }
    }, "cached graph: ", window.RO.graph.nodes.length, " nodes \xB7 ", window.RO.graph.edges.length, " edges")));
  }
  return React.createElement("div", {
    style: {
      position: "relative",
      width: "100%",
      height: "100%"
    }
  }, React.createElement("div", {
    ref: wrapRef,
    style: {
      width: "100%",
      height: "100%"
    }
  }), !ready && React.createElement("div", {
    style: {
      position: "absolute",
      inset: 0,
      display: "grid",
      placeItems: "center",
      color: "var(--t3)"
    }
  }, React.createElement("span", {
    className: "spin",
    style: {
      display: "inline-flex"
    }
  }, React.createElement(Icon, {
    name: "refresh",
    size: 20
  }))), !mini && ready && React.createElement("div", {
    style: {
      position: "absolute",
      right: 12,
      bottom: 12,
      display: "flex",
      flexDirection: "column",
      gap: 6,
      background: "rgba(13,19,32,0.78)",
      border: "1px solid var(--border-2)",
      borderRadius: "var(--r-md)",
      padding: 6,
      backdropFilter: "blur(8px)"
    }
  }, React.createElement(DockBtn, {
    icon: "refresh",
    title: "Auto-rotate",
    active: spin,
    onClick: toggleSpin
  }), React.createElement(DockBtn, {
    icon: "zap",
    title: "Span particles",
    active: parts,
    onClick: toggleParts
  }), React.createElement("div", {
    style: {
      height: 1,
      background: "var(--border)",
      margin: "1px 4px"
    }
  }), React.createElement(DockBtn, {
    text: "+",
    title: "Zoom in",
    onClick: () => zoomBy(0.8)
  }), React.createElement(DockBtn, {
    text: "\u2212",
    title: "Zoom out",
    onClick: () => zoomBy(1.25)
  }), React.createElement(DockBtn, {
    icon: "maximize",
    title: "Fit graph",
    onClick: zoomFit
  })));
}
function GraphView() {
  const [mode, setMode] = useState("all");
  const counts = window.RO.graph.nodes.reduce((a, n) => {
    a[n.type] = (a[n.type] || 0) + 1;
    return a;
  }, {});
  const legend = Object.entries(window.RO.graph.colors);
  return React.createElement("div", {
    style: {
      display: "flex",
      flexDirection: "column",
      gap: 16,
      height: "calc(100vh - var(--topbar-h) - 64px)"
    }
  }, React.createElement(PageHeader, {
    eyebrow: "Operational memory \xB7 3D",
    title: "RecallGraph",
    icon: "graph",
    sub: "Every entity in the incident \u2014 recall, SKUs, lots, locations, shipments, customers, actions, evidence, memory \u2014 as one queryable graph.",
    right: React.createElement(Badge, {
      tone: "cyan"
    }, window.RO.graph.nodes.length, " nodes \xB7 ", window.RO.graph.edges.length, " edges")
  }), React.createElement("div", {
    style: {
      display: "flex",
      gap: 8,
      flexWrap: "wrap"
    }
  }, Object.entries(GRAPH_MODES).map(([k, m]) => React.createElement("button", {
    key: k,
    onClick: () => setMode(k),
    style: {
      display: "inline-flex",
      alignItems: "center",
      gap: 7,
      padding: "8px 13px",
      fontSize: 12.5,
      fontWeight: 600,
      cursor: "pointer",
      fontFamily: "var(--f-sans)",
      background: mode === k ? "var(--panel-3)" : "var(--panel)",
      border: "1px solid " + (mode === k ? "var(--cyan-line)" : "var(--border-2)"),
      borderRadius: "var(--r-sm)",
      color: mode === k ? "var(--t1)" : "var(--t2)"
    }
  }, React.createElement(Icon, {
    name: m.icon,
    size: 14,
    style: {
      color: mode === k ? "var(--cyan)" : "var(--t3)"
    }
  }), " ", m.label))), React.createElement("div", {
    className: "panel",
    style: {
      flex: 1,
      minHeight: 420,
      position: "relative",
      overfl: "hidden",
      overflow: "hidden",
      padding: 0
    }
  }, React.createElement(RecallGraph, {
    mode: mode
  }), React.createElement("div", {
    className: "no-sb",
    style: {
      position: "absolute",
      left: 12,
      top: 12,
      display: "flex",
      flexDirection: "column",
      gap: 5,
      background: "rgba(13,19,32,0.74)",
      border: "1px solid var(--border)",
      borderRadius: "var(--r-sm)",
      padding: "10px 12px",
      backdropFilter: "blur(8px)",
      maxHeight: "70%",
      overflowY: "auto"
    }
  }, React.createElement("div", {
    className: "label",
    style: {
      marginBottom: 3
    }
  }, "Node types"), legend.map(([t, c]) => React.createElement("span", {
    key: t,
    style: {
      display: "inline-flex",
      alignItems: "center",
      gap: 7,
      fontSize: 10.5,
      fontFamily: "var(--f-mono)",
      color: "var(--t2)"
    }
  }, React.createElement("span", {
    style: {
      width: 8,
      height: 8,
      borderRadius: "50%",
      background: c,
      flex: "none"
    }
  }), " ", GRAPH_TYPE_LABEL[t], " ", React.createElement("span", {
    style: {
      color: "var(--t4)"
    }
  }, counts[t] || 0)))), React.createElement("div", {
    style: {
      position: "absolute",
      right: 12,
      top: 12,
      fontSize: 10.5,
      fontFamily: "var(--f-mono)",
      color: "var(--t3)",
      background: "rgba(13,19,32,0.74)",
      border: "1px solid var(--border)",
      borderRadius: "var(--r-sm)",
      padding: "6px 10px",
      backdropFilter: "blur(8px)"
    }
  }, "click a node \u2192 inspector \xB7 drag to orbit")));
}
window.RecallGraph = RecallGraph;
window.GraphView = GraphView;
window.GRAPH_TYPE_LABEL = GRAPH_TYPE_LABEL;

/* ===== views_ops.jsx ===== */
const RECALL_FEED = [window.RO.recall, {
  recallId: "F-1139-2026",
  classification: "Class II",
  productDescription: "Bagged Spring Mix, 10 oz",
  recallingFirm: "Verde Farms",
  reason: "Undeclared allergen (sulfites).",
  distributionPattern: "CA, OR, WA",
  eventDate: "2026-06-04",
  status: "Ongoing"
}, {
  recallId: "F-1131-2026",
  classification: "Class III",
  productDescription: "Almond Protein Bars, 12 ct",
  recallingFirm: "Sunset Snacks",
  reason: "Mislabeled net weight.",
  distributionPattern: "Nationwide",
  eventDate: "2026-05-29",
  status: "Ongoing"
}, {
  recallId: "F-1126-2026",
  classification: "Class II",
  productDescription: "Cold-Brew Concentrate, 32 oz",
  recallingFirm: "Harbor Roasters",
  reason: "Possible spoilage from seal failure.",
  distributionPattern: "CA, NV",
  eventDate: "2026-05-24",
  status: "Terminated"
}];
function FallbackBanner({
  show,
  text
}) {
  if (!show) return null;
  return React.createElement("div", {
    style: {
      display: "flex",
      alignItems: "center",
      gap: 9,
      padding: "10px 13px",
      background: "color-mix(in srgb, var(--warning) 10%, transparent)",
      border: "1px solid color-mix(in srgb, var(--warning) 34%, transparent)",
      borderRadius: "var(--r-sm)"
    }
  }, React.createElement(Icon, {
    name: "alert",
    size: 14,
    style: {
      color: "var(--warning)"
    }
  }), React.createElement("span", {
    style: {
      fontSize: 12.5,
      color: "var(--t2)"
    }
  }, text));
}
function RadarView() {
  const {
    triggerContainment,
    navigate
  } = useRO();
  const [sel, setSel] = useState(0);
  const [cls, setCls] = useState("all");
  const feed = RECALL_FEED.filter(r => cls === "all" || r.classification === cls);
  const r = feed[sel] || feed[0];
  const isPrimary = r.recallId === window.RO.recall.recallId;
  return React.createElement("div", {
    style: {
      display: "flex",
      flexDirection: "column",
      gap: 20
    }
  }, React.createElement(PageHeader, {
    eyebrow: "openFDA food enforcement",
    title: "Recall Radar",
    icon: "radar",
    sub: "Live FDA recall intake. Search, filter, and start a containment run.",
    right: React.createElement("span", {
      className: "mono",
      style: {
        fontSize: 11,
        color: "var(--success)",
        display: "inline-flex",
        alignItems: "center",
        gap: 6
      }
    }, React.createElement(StatusDot, {
      tone: "success"
    }), " endpoint live")
  }), React.createElement("div", {
    className: "mono",
    style: {
      fontSize: 11,
      color: "var(--t3)",
      background: "var(--bg-2)",
      border: "1px solid var(--border)",
      borderRadius: "var(--r-sm)",
      padding: "9px 12px",
      overflowX: "auto"
    }
  }, "GET ", window.RO.env.OPENFDA_BASE, "?search=report_date:[20260524+TO+20260607]&limit=20"), React.createElement("div", {
    style: {
      display: "grid",
      gridTemplateColumns: "0.85fr 1.15fr",
      gap: 18
    },
    className: "ro-blast"
  }, React.createElement("div", {
    className: "panel",
    style: {
      padding: 16
    }
  }, React.createElement("div", {
    style: {
      display: "flex",
      gap: 6,
      marginBottom: 12,
      flexWrap: "wrap"
    }
  }, ["all", "Class I", "Class II", "Class III"].map(c => React.createElement("button", {
    key: c,
    onClick: () => {
      setCls(c);
      setSel(0);
    },
    style: {
      padding: "6px 11px",
      fontSize: 11.5,
      fontWeight: 500,
      cursor: "pointer",
      fontFamily: "var(--f-sans)",
      background: cls === c ? "var(--panel-3)" : "transparent",
      border: "1px solid " + (cls === c ? "var(--border-3)" : "var(--border-2)"),
      borderRadius: "var(--r-sm)",
      color: cls === c ? "var(--t1)" : "var(--t3)"
    }
  }, c))), React.createElement("div", {
    style: {
      display: "flex",
      flexDirection: "column",
      gap: 8
    }
  }, feed.map((x, i) => React.createElement("button", {
    key: x.recallId,
    onClick: () => setSel(i),
    style: {
      display: "flex",
      flexDirection: "column",
      gap: 6,
      padding: "12px 13px",
      textAlign: "left",
      cursor: "pointer",
      background: sel === i ? "var(--panel-3)" : "var(--panel-2)",
      border: "1px solid " + (sel === i ? "var(--cyan-line)" : "var(--border)"),
      borderRadius: "var(--r-sm)",
      width: "100%"
    }
  }, React.createElement("div", {
    style: {
      display: "flex",
      alignItems: "center",
      justifyContent: "space-between",
      gap: 8
    }
  }, React.createElement("span", {
    className: "mono",
    style: {
      fontSize: 11.5,
      color: "var(--cyan)"
    }
  }, x.recallId), React.createElement(Badge, {
    tone: CLASS_TONE[x.classification]
  }, x.classification)), React.createElement("span", {
    style: {
      fontSize: 13,
      color: "var(--t1)",
      fontWeight: 500
    }
  }, x.productDescription), React.createElement("span", {
    className: "mono",
    style: {
      fontSize: 10.5,
      color: "var(--t3)"
    }
  }, x.recallingFirm, " \xB7 ", x.eventDate))))), React.createElement("div", {
    className: "panel",
    style: {
      padding: 20
    }
  }, React.createElement("div", {
    style: {
      display: "flex",
      alignItems: "flex-start",
      justifyContent: "space-between",
      gap: 12,
      flexWrap: "wrap",
      marginBottom: 14
    }
  }, React.createElement("div", {
    style: {
      minWidth: 0
    }
  }, React.createElement(ClassBadge, {
    classification: r.classification,
    size: "lg"
  }), React.createElement("h3", {
    style: {
      margin: "10px 0 0",
      fontSize: 18,
      fontWeight: 600,
      fontFamily: "var(--f-display)",
      color: "var(--t1)"
    }
  }, r.productDescription), React.createElement("div", {
    className: "mono",
    style: {
      fontSize: 11.5,
      color: "var(--cyan)",
      marginTop: 5
    }
  }, r.recallId, " \xB7 ", r.recallingFirm)), isPrimary ? React.createElement(Button, {
    variant: "primary",
    icon: "zap",
    onClick: () => {
      triggerContainment();
      navigate("cortex");
    }
  }, "Start containment run") : React.createElement(Badge, {
    tone: "muted"
  }, "monitoring")), React.createElement("div", {
    style: {
      display: "grid",
      gridTemplateColumns: "1fr 1fr",
      gap: 14,
      marginBottom: 16
    }
  }, React.createElement(KV, {
    k: "Reason",
    v: r.reason
  }), React.createElement(KV, {
    k: "Distribution",
    v: r.distributionPattern
  }), React.createElement(KV, {
    k: "Event date",
    v: r.eventDate,
    mono: true
  }), React.createElement(KV, {
    k: "Status",
    v: r.status
  })), React.createElement("div", {
    className: "label",
    style: {
      marginBottom: 6
    }
  }, "Raw openFDA record"), React.createElement("pre", {
    className: "mono no-sb",
    style: {
      margin: 0,
      fontSize: 11,
      color: "var(--t2)",
      background: "var(--bg-2)",
      border: "1px solid var(--border)",
      borderRadius: "var(--r-sm)",
      padding: 12,
      overflowX: "auto",
      lineHeight: 1.6
    }
  }, JSON.stringify({
    recall_number: r.recallId,
    classification: r.classification,
    product_description: r.productDescription,
    recalling_firm: r.recallingFirm,
    reason_for_recall: r.reason,
    distribution_pattern: r.distributionPattern,
    status: r.status,
    source: "openFDA"
  }, null, 2)))));
}
function KV({
  k,
  v,
  mono
}) {
  return React.createElement("div", null, React.createElement("div", {
    className: "label",
    style: {
      marginBottom: 4
    }
  }, k), React.createElement("div", {
    className: mono ? "mono" : "",
    style: {
      fontSize: 12.5,
      color: "var(--t2)",
      lineHeight: 1.5
    }
  }, v));
}
function FivetranView() {
  const runs = window.RO.syncRuns;
  const [diag, setDiag] = useState(null);
  const fvLive = !!(window.RO_INTEGRATIONS && window.RO_INTEGRATIONS.fivetran === "live");
  return React.createElement("div", {
    style: {
      display: "flex",
      flexDirection: "column",
      gap: 20
    }
  }, React.createElement(PageHeader, {
    eyebrow: "operational data sync",
    title: "Fivetran Control Tower",
    icon: "refresh",
    sub: "Connector health, sync timeline, and MCP tool activity feeding the BigQuery warehouse.",
    right: React.createElement("span", {
      className: "mono",
      style: {
        fontSize: 11,
        color: fvLive ? "var(--cyan)" : "var(--warning)",
        display: "inline-flex",
        alignItems: "center",
        gap: 6
      }
    }, React.createElement(StatusDot, {
      tone: fvLive ? "cyan" : "warning"
    }), " ", fvLive ? "MCP connected · stdio" : "MCP fallback · seeded")
  }), React.createElement(FallbackBanner, {
    show: !fvLive,
    text: "Showing seeded connector data \u2014 Fivetran isn't connected yet (fallback mode). Live connector status and sync timestamps appear once Fivetran credentials are configured."
  }), React.createElement("div", {
    style: {
      display: "grid",
      gridTemplateColumns: "repeat(auto-fit, minmax(160px,1fr))",
      gap: 12
    }
  }, React.createElement(MiniStatTile, {
    k: "Connectors",
    v: "8",
    sub: fvLive ? "all healthy" : "seeded",
    tone: "var(--success)",
    icon: "route"
  }), React.createElement(MiniStatTile, {
    k: "Records synced",
    v: "158,888",
    sub: fvLive ? "last run" : "seeded",
    tone: "var(--cyan)",
    icon: "database"
  }), React.createElement(MiniStatTile, {
    k: "Destination",
    v: "BigQuery",
    sub: window.RO.env.BQ_DATASET,
    tone: "var(--blue)",
    icon: "database"
  }), React.createElement(MiniStatTile, {
    k: "Freshness",
    v: "42s",
    sub: fvLive ? "< 15 min SLA" : "seeded sample",
    tone: "var(--success)",
    icon: "clock"
  })), React.createElement("div", {
    className: "panel",
    style: {
      padding: 20
    }
  }, React.createElement(SectionTitle, {
    icon: "route",
    title: "Connector health",
    sub: "source \u2192 BigQuery \xB7 API key configured, masked"
  }), React.createElement("div", {
    style: {
      display: "grid",
      gridTemplateColumns: "repeat(auto-fit, minmax(280px,1fr))",
      gap: 12
    }
  }, runs.map(r => React.createElement("div", {
    key: r.id,
    className: "panel lift",
    style: {
      padding: 14,
      background: "var(--panel-2)"
    }
  }, React.createElement("div", {
    style: {
      display: "flex",
      alignItems: "center",
      justifyContent: "space-between",
      marginBottom: 9
    }
  }, React.createElement("div", {
    style: {
      minWidth: 0
    }
  }, React.createElement("div", {
    style: {
      fontSize: 13,
      fontWeight: 600,
      color: "var(--t1)"
    }
  }, r.source), React.createElement("div", {
    className: "mono",
    style: {
      fontSize: 10,
      color: "var(--t3)",
      marginTop: 2
    }
  }, r.connector)), React.createElement("span", {
    style: {
      display: "inline-flex",
      alignItems: "center",
      gap: 5,
      fontSize: 10.5,
      fontFamily: "var(--f-mono)",
      color: fvLive ? "var(--success)" : "var(--t3)"
    }
  }, React.createElement(StatusDot, {
    tone: fvLive ? "success" : "muted"
  }), " ", fvLive ? "success" : r.status || "seeded")), React.createElement("div", {
    style: {
      display: "flex",
      alignItems: "center",
      justifyContent: "space-between",
      gap: 8
    }
  }, React.createElement("span", {
    className: "mono",
    style: {
      fontSize: 10.5,
      color: "var(--t3)"
    }
  }, r.recordsSynced.toLocaleString(), " rows \xB7 ", r.source.toLowerCase().replace(/[^a-z]/g, "_")), React.createElement("button", {
    onClick: () => setDiag(r.id),
    style: {
      background: "none",
      border: "none",
      color: "var(--cyan)",
      fontSize: 10.5,
      cursor: "pointer",
      fontFamily: "var(--f-mono)",
      display: "inline-flex",
      alignItems: "center",
      gap: 4
    }
  }, React.createElement(Icon, {
    name: "brain",
    size: 11
  }), " diagnose")), diag === r.id && React.createElement("div", {
    className: "rise",
    style: {
      marginTop: 10,
      padding: "9px 11px",
      background: "var(--cyan-dim)",
      border: "1px solid var(--cyan-line)",
      borderRadius: "var(--r-sm)",
      fontSize: 11.5,
      color: "var(--t1)"
    }
  }, React.createElement(Icon, {
    name: "sparkles",
    size: 12,
    style: {
      color: "var(--cyan)",
      display: "inline",
      verticalAlign: "-2px",
      marginRight: 6
    }
  }), fvLive ? "Gemini" : "Sample", ": connector healthy. Last sync ", r.recordsSynced.toLocaleString(), " rows, 0 errors, schema drift none."))))), React.createElement("div", {
    className: "panel",
    style: {
      padding: 20
    }
  }, React.createElement(SectionTitle, {
    icon: "link",
    title: "MCP tool activity",
    sub: "Tools the agent invoked on the Fivetran MCP server."
  }), React.createElement("div", {
    style: {
      display: "grid",
      gridTemplateColumns: "repeat(auto-fit, minmax(220px,1fr))",
      gap: 10
    }
  }, ["list_connectors", "trigger_sync", "get_sync_status", "describe_schema", "get_records"].map(t => React.createElement("div", {
    key: t,
    style: {
      display: "flex",
      alignItems: "center",
      gap: 9,
      padding: "11px 13px",
      background: "var(--panel-2)",
      border: "1px solid var(--border)",
      borderRadius: "var(--r-sm)"
    }
  }, React.createElement(Icon, {
    name: "route",
    size: 13,
    style: {
      color: "var(--cyan)"
    }
  }), React.createElement("code", {
    className: "mono",
    style: {
      fontSize: 12,
      color: "var(--t1)",
      fontWeight: 600
    }
  }, t), React.createElement("span", {
    className: "mono",
    style: {
      marginLeft: "auto",
      fontSize: 10,
      color: fvLive ? "var(--success)" : "var(--t3)"
    }
  }, fvLive ? "ok" : "sample"))))));
}
function MiniStatTile({
  k,
  v,
  sub,
  tone,
  icon
}) {
  return React.createElement("div", {
    className: "panel lift",
    style: {
      padding: "15px 16px",
      display: "flex",
      alignItems: "center",
      gap: 13
    }
  }, React.createElement("div", {
    style: {
      width: 38,
      height: 38,
      borderRadius: "var(--r-sm)",
      flex: "none",
      display: "grid",
      placeItems: "center",
      background: "var(--panel-2)",
      border: "1px solid var(--border-2)",
      color: tone
    }
  }, React.createElement(Icon, {
    name: icon,
    size: 18
  })), React.createElement("div", {
    style: {
      minWidth: 0
    }
  }, React.createElement("div", {
    className: "mono",
    style: {
      fontSize: 20,
      fontWeight: 600,
      color: tone,
      lineHeight: 1
    }
  }, v), React.createElement("div", {
    className: "label",
    style: {
      marginTop: 5
    }
  }, k, " \xB7 ", sub)));
}
function EvidenceView() {
  const bqLive = !!(window.RO_INTEGRATIONS && window.RO_INTEGRATIONS.bigquery === "live");
  const rc = window.RO.recall;
  const _lots = rc.lotCodes || [];
  const m = [{
    id: "m_firm",
    from: rc.recallingFirm || "recalling firm",
    to: "supplier sup_01 · seed catalog",
    type: "firm → supplier",
    confidence: 0.88,
    status: "auto"
  }, ..._lots.slice(0, 2).map((l, i) => ({
    id: "m_lot" + i,
    from: "Recall lot " + l,
    to: "internal lot " + l,
    type: "exact lot",
    confidence: 0.96 - i * 0.05,
    status: "auto"
  })), {
    id: "m_prod",
    from: '"' + (rc.productDescription || "").slice(0, 30) + '…"',
    to: "SKU · seed catalog",
    type: "semantic product",
    confidence: 0.74,
    status: "review"
  }, {
    id: "m_dist",
    from: "Distribution: " + (rc.distributionPattern || "").slice(0, 22),
    to: (window.RO.stats.locationsAffected || 37) + " mapped locations",
    type: "distribution → regions",
    confidence: 0.91,
    status: "auto"
  }];
  return React.createElement("div", {
    style: {
      display: "flex",
      flexDirection: "column",
      gap: 20
    }
  }, React.createElement(PageHeader, {
    eyebrow: "explainable matching",
    title: "Evidence Board",
    icon: "database",
    sub: "FDA fields \u2192 BigQuery SQL \u2192 result rows \u2192 entity matches. Every recommendation is traceable."
  }), React.createElement(FallbackBanner, {
    show: !bqLive,
    text: "The resolver rows below illustrate the matching concept on sample data. With BigQuery connected, these become real query results against the synced warehouse."
  }), React.createElement("div", {
    className: "panel",
    style: {
      padding: 20
    }
  }, React.createElement(SectionTitle, {
    icon: "database",
    title: "BigQuery evidence query",
    sub: "Deterministic blast-radius SQL run on synced operational data."
  }), React.createElement("pre", {
    className: "mono no-sb",
    style: {
      margin: 0,
      fontSize: 11.5,
      color: "var(--t2)",
      background: "var(--bg-2)",
      border: "1px solid var(--border)",
      borderRadius: "var(--r-sm)",
      padding: 14,
      overflowX: "auto",
      lineHeight: 1.7
    }
  }, `SELECT location_id, sku, lot, units
FROM \`${window.RO.env.BQ_DATASET || 'recallops_cortex'}.inventory_lots\`
WHERE lot IN (${(window.RO.recall.lotCodes || []).map(l => "'" + l + "'").join(', ')});
-- → ${window.RO.stats.unitsInventory.toLocaleString()} units · ${window.RO.stats.locationsAffected} locations · ${window.RO.stats.skuCount || 3} SKUs`)), React.createElement("div", {
    className: "panel",
    style: {
      padding: 20
    }
  }, React.createElement(SectionTitle, {
    icon: "target",
    title: "Entity resolver",
    sub: "FDA text resolved to internal entities with confidence scoring."
  }), React.createElement("div", {
    style: {
      overflowX: "auto"
    },
    className: "no-sb"
  }, React.createElement("table", {
    style: {
      width: "100%",
      borderCollapse: "collapse",
      minWidth: 640
    }
  }, React.createElement("thead", null, React.createElement("tr", {
    style: {
      borderBottom: "1px solid var(--border-2)"
    }
  }, ["FDA source", "Internal entity", "Match type", "Confidence", "Status"].map((h, i) => React.createElement("th", {
    key: i,
    style: {
      textAlign: i === 3 ? "right" : "left",
      padding: "0 12px 11px"
    }
  }, React.createElement("span", {
    className: "label"
  }, h))))), React.createElement("tbody", null, m.map(x => React.createElement("tr", {
    key: x.id,
    style: {
      borderBottom: "1px solid var(--border)"
    }
  }, React.createElement("td", {
    style: {
      padding: "12px"
    }
  }, React.createElement("span", {
    className: "mono",
    style: {
      fontSize: 11.5,
      color: "var(--t1)"
    }
  }, x.from)), React.createElement("td", {
    style: {
      padding: "12px"
    }
  }, React.createElement("span", {
    className: "mono",
    style: {
      fontSize: 11.5,
      color: "var(--cyan)"
    }
  }, x.to)), React.createElement("td", {
    style: {
      padding: "12px"
    }
  }, React.createElement("span", {
    style: {
      fontSize: 12,
      color: "var(--t2)"
    }
  }, x.type)), React.createElement("td", {
    style: {
      padding: "12px",
      textAlign: "right"
    }
  }, React.createElement("span", {
    className: "mono",
    style: {
      fontSize: 12.5,
      fontWeight: 600,
      color: x.confidence >= 0.9 ? "var(--success)" : x.confidence >= 0.7 ? "var(--class-2)" : "var(--class-1)"
    }
  }, x.confidence.toFixed(2))), React.createElement("td", {
    style: {
      padding: "12px"
    }
  }, x.status === "auto" ? React.createElement(Badge, {
    tone: "success"
  }, "auto") : React.createElement(Badge, {
    tone: "warning"
  }, "review")))))))));
}
function ContextView() {
  const {
    navigate
  } = useRO();
  const base = window.RO.contextPack;
  const bqLive = !!(window.RO_INTEGRATIONS && window.RO_INTEGRATIONS.bigquery === "live");
  const c = Object.assign({}, base, {
    recallId: window.RO.recall.recallId,
    matchedRows: window.RO.stats.unitsInventory,
    json: Object.assign({}, base.json, {
      recall: window.RO.recall.recallId,
      classification: window.RO.recall.classification,
      bigquery_rows: window.RO.stats.unitsInventory
    })
  });
  const [regen, setRegen] = useState(false);
  return React.createElement("div", {
    style: {
      display: "flex",
      flexDirection: "column",
      gap: 20
    }
  }, React.createElement(PageHeader, {
    eyebrow: "what the agent used",
    title: "Context Pack",
    icon: "layers",
    sub: "The exact evidence the agent assembled before reasoning \u2014 grounded, fresh, and auditable.",
    right: React.createElement("span", {
      className: "mono",
      style: {
        fontSize: 11,
        color: "var(--cyan)"
      }
    }, c.id)
  }), React.createElement(FallbackBanner, {
    show: !bqLive,
    text: "Numbers reflect the live recall; warehouse freshness and row counts become real BigQuery values once connected."
  }), React.createElement("div", {
    style: {
      display: "grid",
      gridTemplateColumns: "repeat(auto-fit, minmax(150px,1fr))",
      gap: 12
    }
  }, React.createElement(MiniStatTile, {
    k: "Freshness",
    v: c.freshnessSec + "s",
    sub: "synced",
    tone: "var(--success)",
    icon: "clock"
  }), React.createElement(MiniStatTile, {
    k: "Matched rows",
    v: c.matchedRows.toLocaleString(),
    sub: "BigQuery",
    tone: "var(--cyan)",
    icon: "database"
  }), React.createElement(MiniStatTile, {
    k: "Graph nodes",
    v: String(c.graphNodes),
    sub: "neighbors",
    tone: "var(--blue)",
    icon: "graph"
  }), React.createElement(MiniStatTile, {
    k: "Memories",
    v: String(c.similarRecalls),
    sub: "similar",
    tone: "var(--memory, #FBBF24)",
    icon: "sparkles"
  })), React.createElement("div", {
    style: {
      display: "grid",
      gridTemplateColumns: "1fr 1fr",
      gap: 18
    },
    className: "ro-blast"
  }, React.createElement("div", {
    className: "panel",
    style: {
      padding: 20
    }
  }, React.createElement(SectionTitle, {
    icon: "layers",
    title: "Pack contents"
  }), [["Recall summary", c.recallId + " · " + window.RO.recall.classification], ["Fivetran freshness", c.freshnessSec + "s ago (< 15 min)"], ["BigQuery matched rows", c.matchedRows.toLocaleString()], ["Graph neighbors", c.graphNodes + " nodes"], ["Similar past recalls", c.similarRecalls], ["Approved memories", c.playbookMemories], ["Risk constraints", c.riskConstraints]].map(([k, v], i) => React.createElement("div", {
    key: i,
    style: {
      display: "flex",
      alignItems: "center",
      justifyContent: "space-between",
      padding: "11px 0",
      borderBottom: i < 6 ? "1px solid var(--border)" : "none"
    }
  }, React.createElement("span", {
    style: {
      fontSize: 13,
      color: "var(--t2)"
    }
  }, k), React.createElement("span", {
    className: "mono",
    style: {
      fontSize: 12.5,
      color: "var(--t1)"
    }
  }, v))), React.createElement("div", {
    style: {
      display: "flex",
      gap: 9,
      marginTop: 16,
      flexWrap: "wrap"
    }
  }, React.createElement(Button, {
    variant: "secondary",
    size: "sm",
    icon: "refresh",
    onClick: () => {
      setRegen(true);
      setTimeout(() => setRegen(false), 1200);
    }
  }, regen ? "Regenerating…" : "Regenerate"), React.createElement(Button, {
    variant: "ghost",
    size: "sm",
    icon: "graph",
    onClick: () => navigate("graph")
  }, "Inspect graph nodes"), React.createElement(Button, {
    variant: "primary",
    size: "sm",
    icon: "brain",
    onClick: () => navigate("cortex")
  }, "Send to Gemini"))), React.createElement("div", {
    className: "panel",
    style: {
      padding: 20,
      display: "flex",
      flexDirection: "column"
    }
  }, React.createElement(SectionTitle, {
    icon: "brain",
    title: "Context pack JSON",
    sub: "Sent verbatim to the Gemini agent."
  }), React.createElement("pre", {
    className: "mono no-sb",
    style: {
      margin: 0,
      flex: 1,
      fontSize: 11,
      color: "var(--t2)",
      background: "var(--bg-2)",
      border: "1px solid var(--border)",
      borderRadius: "var(--r-sm)",
      padding: 14,
      overflow: "auto",
      lineHeight: 1.65
    }
  }, JSON.stringify(c.json, null, 2)))));
}
Object.assign(window, {
  RadarView,
  FivetranView,
  EvidenceView,
  ContextView,
  KV,
  MiniStatTile,
  FallbackBanner
});

/* ===== views_llmops.jsx ===== */
function LineChart({
  values,
  color = "var(--cyan)",
  height = 132,
  fmt = v => v,
  max,
  min
}) {
  const mx = max != null ? max : Math.max(...values),
    mn = min != null ? min : Math.min(...values);
  const pad = (mx - mn) * 0.14 || 0.1,
    hi = mx + pad,
    lo = mn - pad,
    range = hi - lo || 1;
  const n = values.length,
    X = i => n > 1 ? 3 + i / (n - 1) * 94 : 50,
    Y = v => 100 - (v - lo) / range * 100;
  const pts = values.map((v, i) => [X(i), Y(v)]);
  const d = pts.map((p, i) => (i ? "L" : "M") + p[0].toFixed(2) + " " + p[1].toFixed(2)).join(" ");
  const id = "lc" + color.replace(/\W/g, "");
  return React.createElement("div", {
    style: {
      position: "relative"
    }
  }, React.createElement("svg", {
    viewBox: "0 0 100 100",
    preserveAspectRatio: "none",
    style: {
      width: "100%",
      height,
      display: "block",
      overflow: "visible"
    }
  }, React.createElement("defs", null, React.createElement("linearGradient", {
    id: id,
    x1: "0",
    y1: "0",
    x2: "0",
    y2: "1"
  }, React.createElement("stop", {
    offset: "0",
    stopColor: color,
    stopOpacity: "0.32"
  }), React.createElement("stop", {
    offset: "1",
    stopColor: color,
    stopOpacity: "0"
  }))), [0, 25, 50, 75, 100].map(y => React.createElement("line", {
    key: y,
    x1: "0",
    y1: y,
    x2: "100",
    y2: y,
    stroke: "rgba(255,255,255,0.05)",
    strokeWidth: "0.5",
    vectorEffect: "non-scaling-stroke"
  })), React.createElement("path", {
    d: d + " L97 100 L3 100 Z",
    fill: "url(#" + id + ")"
  }), React.createElement("path", {
    d: d,
    fill: "none",
    stroke: color,
    strokeWidth: "2.2",
    vectorEffect: "non-scaling-stroke",
    strokeLinejoin: "round",
    strokeLinecap: "round",
    style: {
      filter: "drop-shadow(0 1px 5px " + color + "66)"
    }
  }), pts.map((p, i) => React.createElement("g", {
    key: i
  }, i === n - 1 && React.createElement("circle", {
    cx: p[0],
    cy: p[1],
    r: "3.4",
    fill: "none",
    stroke: color,
    strokeWidth: "1.2",
    opacity: "0.55",
    vectorEffect: "non-scaling-stroke"
  }, React.createElement("animate", {
    attributeName: "r",
    values: "3;8;3",
    dur: "2.4s",
    repeatCount: "indefinite"
  }), React.createElement("animate", {
    attributeName: "opacity",
    values: "0.55;0;0.55",
    dur: "2.4s",
    repeatCount: "indefinite"
  })), React.createElement("circle", {
    cx: p[0],
    cy: p[1],
    r: i === n - 1 ? 3.2 : 1.7,
    fill: i === n - 1 ? color : "var(--panel)",
    stroke: color,
    strokeWidth: i === n - 1 ? 0 : 1.4,
    vectorEffect: "non-scaling-stroke"
  })))), React.createElement("span", {
    className: "mono",
    style: {
      position: "absolute",
      top: -3,
      left: 0,
      fontSize: 9,
      color: "var(--t4)"
    }
  }, fmt(mx)), React.createElement("span", {
    className: "mono",
    style: {
      position: "absolute",
      bottom: 13,
      left: 0,
      fontSize: 9,
      color: "var(--t4)"
    }
  }, fmt(mn)));
}
function ChartCard({
  icon,
  title,
  sub,
  values,
  color,
  unit = "",
  fmt = v => v,
  max,
  min,
  goodUp = true
}) {
  const last = values[values.length - 1],
    first = values[0],
    delta = last - first;
  const good = goodUp ? delta >= 0 : delta <= 0;
  const accent = good ? "var(--success)" : "var(--class-1)";
  return React.createElement("div", {
    className: "panel lift",
    style: {
      padding: 20
    }
  }, React.createElement("div", {
    style: {
      display: "flex",
      alignItems: "flex-start",
      justifyContent: "space-between",
      gap: 12,
      marginBottom: 16
    }
  }, React.createElement("div", {
    style: {
      display: "flex",
      alignItems: "center",
      gap: 11,
      minWidth: 0
    }
  }, React.createElement("div", {
    style: {
      width: 32,
      height: 32,
      borderRadius: "var(--r-sm)",
      flex: "none",
      background: "color-mix(in srgb," + color + " 13%, transparent)",
      border: "1px solid color-mix(in srgb," + color + " 30%, transparent)",
      display: "grid",
      placeItems: "center",
      color
    }
  }, React.createElement(Icon, {
    name: icon,
    size: 16
  })), React.createElement("div", {
    style: {
      minWidth: 0
    }
  }, React.createElement("div", {
    className: "label",
    style: {
      whiteSpace: "nowrap"
    }
  }, title), React.createElement("div", {
    className: "mono num-grad",
    style: {
      fontSize: 26,
      fontWeight: 700,
      letterSpacing: "-.02em",
      marginTop: 2
    }
  }, fmt(last), unit))), React.createElement("span", {
    style: {
      display: "inline-flex",
      alignItems: "center",
      gap: 4,
      flex: "none",
      fontSize: 11.5,
      fontFamily: "var(--f-mono)",
      fontWeight: 600,
      color: accent,
      background: "color-mix(in srgb," + accent + " 13%, transparent)",
      border: "1px solid color-mix(in srgb," + accent + " 30%, transparent)",
      borderRadius: "var(--r-pill)",
      padding: "4px 9px"
    }
  }, React.createElement("span", {
    style: {
      display: "inline-flex",
      transform: delta >= 0 ? "none" : "scaleY(-1)"
    }
  }, React.createElement(Icon, {
    name: "arrowUpRight",
    size: 12
  })), (delta >= 0 ? "+" : "−") + fmt(Math.abs(delta)), unit)), React.createElement(LineChart, {
    values: values,
    color: color,
    max: max,
    min: min,
    fmt: fmt
  }), React.createElement("div", {
    style: {
      display: "flex",
      justifyContent: "space-between",
      alignItems: "center",
      marginTop: 10,
      paddingTop: 10,
      borderTop: "1px solid var(--border)"
    }
  }, React.createElement("span", {
    className: "mono",
    style: {
      fontSize: 10,
      color: "var(--t4)"
    }
  }, "oldest"), React.createElement("span", {
    className: "mono",
    style: {
      fontSize: 10,
      color: "var(--t3)"
    }
  }, values.length, " runs"), React.createElement("span", {
    className: "mono",
    style: {
      fontSize: 10,
      color: "var(--t4)"
    }
  }, "latest")));
}
function LLMOpsView() {
  const runs = window.RO.agentRuns;
  const trace = window.RO.toolTrace;
  const avgEval = runs.reduce((a, r) => a + r.eval_score, 0) / runs.length;
  const avgLat = runs.reduce((a, r) => a + r.latency_ms, 0) / runs.length / 1000;
  const cost = runs.reduce((a, r) => a + r.cost, 0);
  const ev = [...runs].reverse().map(r => r.eval_score);
  const lat = [...runs].reverse().map(r => r.latency_ms / 1000);
  const maxLat = Math.max(...trace.map(t => t.latencyMs));
  return React.createElement("div", {
    style: {
      display: "flex",
      flexDirection: "column",
      gap: 20
    }
  }, React.createElement(PageHeader, {
    eyebrow: "agent observability",
    title: "LLMOps Tower",
    icon: "activity",
    sub: "Every Gemini run, instrumented \u2014 prompt versions, tool calls, latency, token spend, and eval scores."
  }), window.FallbackBanner && React.createElement(window.FallbackBanner, {
    show: !(window.RO_INTEGRATIONS && window.RO_INTEGRATIONS.gemini === "live"),
    text: "Includes seeded run history. Live Gemini 3 runs populate real model, token, latency, and eval telemetry once a key is configured."
  }), React.createElement("div", {
    style: {
      display: "grid",
      gridTemplateColumns: "repeat(auto-fit, minmax(160px,1fr))",
      gap: 12
    }
  }, React.createElement(MiniStatTile, {
    k: "Agent runs",
    v: String(runs.length),
    sub: "last 24h",
    tone: "var(--cyan)",
    icon: "activity"
  }), React.createElement(MiniStatTile, {
    k: "Avg eval",
    v: avgEval.toFixed(2),
    sub: "suite score",
    tone: "var(--success)",
    icon: "flask"
  }), React.createElement(MiniStatTile, {
    k: "Avg latency",
    v: avgLat.toFixed(1) + "s",
    sub: "per run",
    tone: "var(--class-2)",
    icon: "clock"
  }), React.createElement(MiniStatTile, {
    k: "Token spend",
    v: "$" + cost.toFixed(2),
    sub: "total",
    tone: "var(--blue)",
    icon: "zap"
  })), React.createElement("div", {
    style: {
      display: "grid",
      gridTemplateColumns: "1fr 1fr",
      gap: 18
    },
    className: "ro-blast"
  }, React.createElement(ChartCard, {
    icon: "flask",
    title: "Eval score over runs",
    values: ev,
    color: "#10B981",
    max: 1,
    min: 0.6,
    fmt: v => v.toFixed(2),
    goodUp: true
  }), React.createElement(ChartCard, {
    icon: "clock",
    title: "Latency over runs",
    values: lat,
    color: "#06B6D4",
    unit: "s",
    fmt: v => v.toFixed(1),
    goodUp: false
  })), React.createElement("div", {
    className: "panel",
    style: {
      padding: 20
    }
  }, React.createElement(SectionTitle, {
    icon: "activity",
    title: "Agent runs"
  }), React.createElement("div", {
    className: "no-sb scroll-contain"
  }, React.createElement("table", {
    style: {
      width: "100%",
      borderCollapse: "collapse",
      minWidth: 760
    }
  }, React.createElement("thead", null, React.createElement("tr", {
    style: {
      borderBottom: "1px solid var(--border-2)"
    }
  }, ["Run", "Prompt", "Model", "Tools", "Latency", "Tokens", "Cost", "Eval", "Status"].map((h, i) => React.createElement("th", {
    key: i,
    style: {
      textAlign: i >= 3 && i <= 7 ? "right" : "left",
      padding: "0 12px 11px",
      whiteSpace: "nowrap"
    }
  }, React.createElement("span", {
    className: "label"
  }, h))))), React.createElement("tbody", null, runs.map(r => React.createElement("tr", {
    key: r.run_id,
    style: {
      borderBottom: "1px solid var(--border)"
    }
  }, React.createElement("td", {
    style: {
      padding: "11px 12px"
    }
  }, React.createElement("span", {
    className: "mono",
    style: {
      fontSize: 12,
      color: "var(--cyan)"
    }
  }, r.run_id)), React.createElement("td", {
    style: {
      padding: "11px 12px"
    }
  }, React.createElement("span", {
    className: "mono",
    style: {
      fontSize: 11.5,
      color: "var(--t2)"
    }
  }, r.prompt_version)), React.createElement("td", {
    style: {
      padding: "11px 12px"
    }
  }, React.createElement("span", {
    className: "mono",
    style: {
      fontSize: 11,
      color: "var(--t3)"
    }
  }, r.model)), React.createElement("td", {
    style: {
      padding: "11px 12px",
      textAlign: "right"
    }
  }, React.createElement("span", {
    className: "mono",
    style: {
      fontSize: 12,
      color: "var(--t2)"
    }
  }, r.tools)), React.createElement("td", {
    style: {
      padding: "11px 12px",
      textAlign: "right"
    }
  }, React.createElement("span", {
    className: "mono",
    style: {
      fontSize: 12,
      color: "var(--t2)"
    }
  }, (r.latency_ms / 1000).toFixed(1), "s")), React.createElement("td", {
    style: {
      padding: "11px 12px",
      textAlign: "right"
    }
  }, React.createElement("span", {
    className: "mono",
    style: {
      fontSize: 12,
      color: "var(--t2)"
    }
  }, r.token_count.toLocaleString())), React.createElement("td", {
    style: {
      padding: "11px 12px",
      textAlign: "right"
    }
  }, React.createElement("span", {
    className: "mono",
    style: {
      fontSize: 12,
      color: "var(--t2)"
    }
  }, "$", r.cost.toFixed(3))), React.createElement("td", {
    style: {
      padding: "11px 12px",
      textAlign: "right"
    }
  }, React.createElement("span", {
    className: "mono",
    style: {
      fontSize: 12,
      fontWeight: 600,
      color: r.eval_score >= 0.85 ? "var(--success)" : r.eval_score >= 0.75 ? "var(--class-2)" : "var(--class-1)"
    }
  }, r.eval_score.toFixed(2))), React.createElement("td", {
    style: {
      padding: "11px 12px"
    }
  }, React.createElement(Badge, {
    tone: r.status === "passed" ? "success" : r.status === "review" ? "warning" : "danger"
  }, r.status)))))))), React.createElement("div", {
    className: "panel",
    style: {
      padding: 20
    }
  }, React.createElement(SectionTitle, {
    icon: "route",
    title: "Tool-call timeline",
    sub: (runs[0] ? runs[0].run_id : "latest") + " · " + trace.length + " OpenTelemetry spans"
  }), React.createElement("div", {
    style: {
      display: "flex",
      flexDirection: "column",
      gap: 7
    }
  }, trace.map((t, i) => React.createElement("div", {
    key: i,
    style: {
      display: "flex",
      alignItems: "center",
      gap: 11,
      flexWrap: "wrap"
    }
  }, React.createElement("span", {
    className: "mono",
    style: {
      fontSize: 11,
      color: "var(--t2)",
      flex: "1 1 150px",
      maxWidth: 200,
      minWidth: 0,
      whiteSpace: "nowrap",
      overflow: "hidden",
      textOverflow: "ellipsis"
    }
  }, t.name), React.createElement("div", {
    style: {
      flex: "10 1 90px",
      minWidth: 80,
      height: 16,
      background: "var(--bg-2)",
      borderRadius: 4,
      overflow: "hidden",
      position: "relative"
    }
  }, React.createElement("div", {
    style: {
      width: t.latencyMs / maxLat * 100 + "%",
      height: "100%",
      background: "var(--accent-grad)",
      borderRadius: 4,
      opacity: 0.85
    }
  })), React.createElement("span", {
    className: "mono",
    style: {
      fontSize: 10.5,
      color: "var(--t3)",
      width: 58,
      textAlign: "right",
      flex: "none"
    }
  }, t.latencyMs, "ms"), React.createElement("span", {
    className: "mono",
    style: {
      fontSize: 10.5,
      color: "var(--t3)",
      flex: "1 1 110px",
      maxWidth: 130,
      minWidth: 0,
      whiteSpace: "nowrap",
      overflow: "hidden",
      textOverflow: "ellipsis"
    }
  }, t.detail))))));
}
const IMP_TYPE = {
  matching_rule: "Matching rule",
  playbook_rule: "Playbook rule",
  memory_update: "Memory update",
  tool_policy: "Tool policy",
  prompt_patch: "Prompt patch"
};
function ImprovementView() {
  const [states, setStates] = useState(() => Object.fromEntries(window.RO.improvements.map(p => [p.id, p.state])));
  const [toast, setToast] = useState(null);
  const flash = (m, t) => {
    setToast({
      m,
      t
    });
    setTimeout(() => setToast(null), 2600);
  };
  const set = (id, st, label) => {
    setStates(s => ({
      ...s,
      [id]: st
    }));
    flash(id + " " + label, st === "approved" ? "success" : "danger");
  };
  return React.createElement("div", {
    style: {
      display: "flex",
      flexDirection: "column",
      gap: 20
    }
  }, React.createElement(PageHeader, {
    eyebrow: "human-approved learning",
    title: "Self-Improvement Center",
    icon: "sparkles",
    sub: "Eval failures become improvement proposals. Nothing changes production behavior without human approval \u2014 no silent edits to memory or playbooks."
  }), React.createElement("div", {
    className: "panel",
    style: {
      padding: "14px 16px",
      display: "flex",
      alignItems: "center",
      gap: 11,
      borderColor: "rgba(16,185,129,.3)"
    }
  }, React.createElement(Icon, {
    name: "shieldCheck",
    size: 16,
    style: {
      color: "var(--success)"
    }
  }), React.createElement("span", {
    style: {
      fontSize: 13,
      color: "var(--t2)"
    }
  }, "Eval run completed \u2192 ", React.createElement("strong", {
    style: {
      color: "var(--t1)"
    }
  }, "9/10 passed"), ". 1 low-confidence area generated ", window.RO.improvements.length, " proposals for review.")), React.createElement("div", {
    style: {
      display: "grid",
      gridTemplateColumns: "1fr 1fr",
      gap: 16
    },
    className: "ro-actions-grid"
  }, window.RO.improvements.map(p => {
    const st = states[p.id];
    return React.createElement("div", {
      key: p.id,
      className: "panel lift",
      style: {
        padding: 17,
        borderColor: st === "approved" ? "rgba(16,185,129,.4)" : st === "rejected" ? "rgba(239,68,68,.35)" : "var(--border)"
      }
    }, React.createElement("div", {
      style: {
        display: "flex",
        alignItems: "center",
        gap: 8,
        marginBottom: 9,
        flexWrap: "wrap"
      }
    }, React.createElement(Badge, {
      tone: p.risk === "low" ? "success" : p.risk === "medium" ? "warning" : "danger"
    }, p.risk, " risk"), React.createElement("span", {
      className: "mono",
      style: {
        fontSize: 10.5,
        color: "var(--t3)"
      }
    }, IMP_TYPE[p.type]), st === "approved" && React.createElement(Badge, {
      tone: "success"
    }, "approved"), st === "rejected" && React.createElement(Badge, {
      tone: "danger"
    }, "rejected")), React.createElement("h4", {
      style: {
        margin: 0,
        fontSize: 14.5,
        fontWeight: 600,
        color: "var(--t1)"
      }
    }, p.title), React.createElement("div", {
      style: {
        marginTop: 11,
        borderRadius: "var(--r-sm)",
        overflow: "hidden",
        border: "1px solid var(--border)"
      }
    }, React.createElement("div", {
      style: {
        padding: "9px 11px",
        background: "rgba(239,68,68,0.05)",
        display: "flex",
        gap: 8
      }
    }, React.createElement("span", {
      className: "mono",
      style: {
        color: "var(--class-1)",
        fontSize: 11
      }
    }, "\u2212"), React.createElement("span", {
      style: {
        fontSize: 11.5,
        color: "var(--t2)",
        lineHeight: 1.5
      }
    }, p.before)), React.createElement("div", {
      style: {
        padding: "9px 11px",
        background: "rgba(16,185,129,0.06)",
        display: "flex",
        gap: 8,
        borderTop: "1px solid var(--border)"
      }
    }, React.createElement("span", {
      className: "mono",
      style: {
        color: "var(--success)",
        fontSize: 11
      }
    }, "+"), React.createElement("span", {
      style: {
        fontSize: 11.5,
        color: "var(--t1)",
        lineHeight: 1.5
      }
    }, p.after))), React.createElement("div", {
      style: {
        display: "flex",
        alignItems: "center",
        gap: 14,
        marginTop: 12
      }
    }, React.createElement("div", null, React.createElement("div", {
      className: "label",
      style: {
        fontSize: 9.5
      }
    }, "Eval before"), React.createElement("div", {
      className: "mono",
      style: {
        fontSize: 14,
        fontWeight: 600,
        color: "var(--class-1)",
        marginTop: 2
      }
    }, p.evalBefore.toFixed(2))), React.createElement(Icon, {
      name: "arrowRight",
      size: 15,
      style: {
        color: "var(--t4)"
      }
    }), React.createElement("div", null, React.createElement("div", {
      className: "label",
      style: {
        fontSize: 9.5
      }
    }, "Eval after"), React.createElement("div", {
      className: "mono",
      style: {
        fontSize: 14,
        fontWeight: 600,
        color: "var(--success)",
        marginTop: 2
      }
    }, p.evalAfter.toFixed(2))), !st || st === "pending" ? React.createElement("div", {
      style: {
        marginLeft: "auto",
        display: "flex",
        gap: 8
      }
    }, React.createElement(Button, {
      variant: "ghost",
      size: "sm",
      onClick: () => set(p.id, "rejected", "rejected")
    }, "Reject"), React.createElement(Button, {
      variant: "success",
      size: "sm",
      icon: "check",
      onClick: () => set(p.id, "approved", "approved → future context")
    }, "Approve")) : React.createElement("span", {
      style: {
        marginLeft: "auto",
        fontSize: 11.5,
        color: st === "approved" ? "var(--success)" : "var(--t3)",
        fontFamily: "var(--f-mono)"
      }
    }, st === "approved" ? "→ promoted to memory" : "discarded")));
  })), React.createElement("div", {
    className: "panel",
    style: {
      padding: 20
    }
  }, React.createElement(SectionTitle, {
    icon: "sparkles",
    title: "Memory episodes",
    sub: "Past incidents the agent can recall \u2014 approved for future use."
  }), React.createElement("div", {
    style: {
      display: "grid",
      gridTemplateColumns: "repeat(auto-fit, minmax(280px,1fr))",
      gap: 12
    }
  }, window.RO.memory.map(m => React.createElement("div", {
    key: m.id,
    style: {
      padding: 14,
      background: "var(--panel-2)",
      border: "1px solid var(--border)",
      borderRadius: "var(--r-sm)"
    }
  }, React.createElement("div", {
    style: {
      display: "flex",
      alignItems: "center",
      justifyContent: "space-between",
      marginBottom: 7
    }
  }, React.createElement("span", {
    style: {
      fontSize: 13,
      fontWeight: 600,
      color: "var(--t1)"
    }
  }, m.title), React.createElement("span", {
    className: "mono",
    style: {
      fontSize: 11,
      color: "#FBBF24"
    }
  }, m.similarity.toFixed(2))), React.createElement("p", {
    style: {
      margin: "0 0 9px",
      fontSize: 11.5,
      color: "var(--t3)",
      lineHeight: 1.5
    }
  }, m.lesson), React.createElement("div", {
    style: {
      display: "flex",
      alignItems: "center",
      justifyContent: "space-between"
    }
  }, React.createElement("span", {
    className: "mono",
    style: {
      fontSize: 10.5,
      color: "var(--t3)"
    }
  }, m.outcome), React.createElement(Badge, {
    tone: m.approved ? "success" : "muted"
  }, m.approved ? "approved" : "pending")))))), toast && React.createElement("div", {
    style: {
      position: "fixed",
      bottom: 24,
      left: "50%",
      transform: "translateX(-50%)",
      zIndex: 120,
      display: "flex",
      alignItems: "center",
      gap: 9,
      padding: "11px 16px",
      background: "var(--panel)",
      border: "1px solid " + (toast.t === "success" ? "var(--success)" : "var(--class-1)"),
      borderRadius: "var(--r-sm)",
      boxShadow: "var(--sh-2)"
    }
  }, React.createElement(Icon, {
    name: toast.t === "success" ? "checkCircle" : "x",
    size: 16,
    style: {
      color: toast.t === "success" ? "var(--success)" : "var(--class-1)"
    }
  }), React.createElement("span", {
    style: {
      fontSize: 13,
      color: "var(--t1)"
    }
  }, toast.m)));
}
const REPLAY_PHASES = {
  intake: "FDA intake",
  sync: "Fivetran sync",
  graph: "Graph build",
  context: "Context pack",
  reason: "Gemini reasoning",
  approve: "Human approval",
  eval: "Eval suite",
  report: "Report"
};
function ReplayView() {
  const {
    judgeMode,
    navigate
  } = useRO();
  const events = window.RO.replayEvents;
  const END = 90;
  const [t, setT] = useState(0);
  const [playing, setPlaying] = useState(false);
  const [speed, setSpeed] = useState(1);
  const timer = useRef(0);
  useEffect(() => {
    if (!playing) return;
    timer.current = setInterval(() => setT(v => {
      const nv = v + 0.4 * speed;
      if (nv >= END) {
        clearInterval(timer.current);
        setPlaying(false);
        return END;
      }
      return nv;
    }), 100);
    return () => clearInterval(timer.current);
  }, [playing, speed]);
  const curIdx = events.reduce((acc, e, i) => t >= e.t ? i : acc, 0);
  const cur = events[curIdx];
  return React.createElement("div", {
    style: {
      display: "flex",
      flexDirection: "column",
      gap: 20
    }
  }, React.createElement(PageHeader, {
    eyebrow: "watch the incident",
    title: "Crisis Replay",
    icon: "play",
    sub: "Scrub the entire containment from FDA intake to CONTAINED.",
    right: React.createElement(Button, {
      variant: "primary",
      size: "sm",
      icon: "gavel",
      onClick: judgeMode
    }, "Run live (Judge Mode)")
  }), React.createElement("div", {
    className: "panel",
    style: {
      padding: 24
    }
  }, React.createElement("div", {
    style: {
      display: "flex",
      alignItems: "center",
      justifyContent: "space-between",
      gap: 14,
      flexWrap: "wrap",
      marginBottom: 18
    }
  }, React.createElement("div", null, React.createElement("div", {
    className: "label"
  }, "Now showing"), React.createElement("div", {
    style: {
      fontSize: 20,
      fontWeight: 600,
      fontFamily: "var(--f-display)",
      color: "var(--cyan)",
      marginTop: 4
    }
  }, REPLAY_PHASES[cur.phase]), React.createElement("div", {
    style: {
      fontSize: 13,
      color: "var(--t2)",
      marginTop: 3
    }
  }, cur.label)), React.createElement("div", {
    className: "mono",
    style: {
      fontSize: 34,
      fontWeight: 600,
      color: "var(--t1)"
    }
  }, Math.floor(t), React.createElement("span", {
    style: {
      fontSize: 16,
      color: "var(--t3)"
    }
  }, "s / ", END, "s"))), React.createElement("div", {
    style: {
      position: "relative",
      height: 40,
      marginBottom: 18
    }
  }, React.createElement("div", {
    style: {
      position: "absolute",
      top: 18,
      left: 0,
      right: 0,
      height: 4,
      background: "var(--bg-2)",
      borderRadius: 999
    }
  }), React.createElement("div", {
    style: {
      position: "absolute",
      top: 18,
      left: 0,
      width: t / END * 100 + "%",
      height: 4,
      background: "var(--accent-grad)",
      borderRadius: 999,
      boxShadow: "0 0 10px var(--cyan)"
    }
  }), events.map((e, i) => React.createElement("button", {
    key: i,
    onClick: () => setT(e.t),
    title: e.label,
    style: {
      position: "absolute",
      top: 11,
      left: e.t / END * 100 + "%",
      transform: "translateX(-50%)",
      width: 18,
      height: 18,
      borderRadius: "50%",
      border: "2px solid " + (t >= e.t ? "var(--cyan)" : "var(--border-3)"),
      background: t >= e.t ? "var(--cyan)" : "var(--panel)",
      cursor: "pointer",
      padding: 0
    }
  }))), React.createElement("div", {
    style: {
      display: "flex",
      alignItems: "center",
      gap: 12,
      flexWrap: "wrap"
    }
  }, React.createElement(Button, {
    variant: "primary",
    icon: playing ? "activity" : "play",
    onClick: () => {
      if (t >= END) setT(0);
      setPlaying(p => !p);
    }
  }, playing ? "Pause" : "Play"), React.createElement(Button, {
    variant: "ghost",
    size: "sm",
    icon: "refresh",
    onClick: () => {
      setT(0);
      setPlaying(false);
    }
  }, "Reset"), React.createElement("input", {
    type: "range",
    min: "0",
    max: END,
    step: "0.5",
    value: t,
    onChange: e => setT(parseFloat(e.target.value)),
    style: {
      flex: 1,
      minWidth: 160,
      accentColor: "var(--cyan)"
    }
  }), React.createElement("div", {
    style: {
      display: "flex",
      gap: 6
    }
  }, [0.5, 1, 2].map(s => React.createElement("button", {
    key: s,
    onClick: () => setSpeed(s),
    style: {
      padding: "5px 10px",
      fontSize: 11.5,
      fontFamily: "var(--f-mono)",
      cursor: "pointer",
      background: speed === s ? "var(--panel-3)" : "transparent",
      border: "1px solid " + (speed === s ? "var(--cyan-line)" : "var(--border-2)"),
      borderRadius: "var(--r-sm)",
      color: speed === s ? "var(--cyan)" : "var(--t3)"
    }
  }, s, "\xD7"))))), React.createElement("div", {
    className: "panel",
    style: {
      padding: 20
    }
  }, React.createElement(SectionTitle, {
    icon: "timeline",
    title: "Incident events"
  }), React.createElement("div", {
    style: {
      display: "flex",
      flexDirection: "column",
      gap: 8
    }
  }, events.map((e, i) => React.createElement("button", {
    key: i,
    onClick: () => setT(e.t),
    style: {
      display: "flex",
      alignItems: "center",
      gap: 12,
      padding: "10px 12px",
      textAlign: "left",
      cursor: "pointer",
      background: i === curIdx ? "var(--panel-3)" : "var(--panel-2)",
      border: "1px solid " + (i === curIdx ? "var(--cyan-line)" : "var(--border)"),
      borderRadius: "var(--r-sm)",
      width: "100%"
    }
  }, React.createElement("span", {
    className: "mono",
    style: {
      fontSize: 11,
      color: t >= e.t ? "var(--cyan)" : "var(--t4)",
      width: 38,
      flex: "none"
    }
  }, e.t, "s"), React.createElement(Icon, {
    name: t >= e.t ? "checkCircle" : "dot",
    size: 14,
    style: {
      color: t >= e.t ? "var(--success)" : "var(--t4)",
      flex: "none"
    },
    fill: t < e.t
  }), React.createElement("span", {
    style: {
      fontSize: 13,
      color: i === curIdx ? "var(--t1)" : "var(--t2)",
      fontWeight: i === curIdx ? 600 : 400
    }
  }, e.label), React.createElement(Badge, {
    tone: "muted"
  }, REPLAY_PHASES[e.phase]))))));
}
Object.assign(window, {
  LLMOpsView,
  ImprovementView,
  ReplayView,
  LineChart,
  ChartCard
});
