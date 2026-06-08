/* ============================================================
   RecallOps Command — Operations backdrop
   Dot-grid mesh · twin radial glows · radar scanline (when active)
   · drifting data packets · mouse parallax. Canvas 2D, performant.
   ============================================================ */
(function () {
  function startCommandBackground(canvas) {
    const ctx = canvas.getContext("2d");
    const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    let W = 0, H = 0, DPR = Math.min(window.devicePixelRatio || 1, 2);
    let mx = 0.5, my = 0.5, px = 0.5, py = 0.5;
    let t = 0, radar = -1; // radar angle, -1 = off
    let packets = [];

    function resize() {
      W = canvas.clientWidth; H = canvas.clientHeight;
      canvas.width = Math.floor(W * DPR); canvas.height = Math.floor(H * DPR);
      ctx.setTransform(DPR, 0, 0, DPR, 0, 0);
      seedPackets();
    }
    function seedPackets() {
      packets = [];
      const n = Math.max(8, Math.floor(W / 180));
      for (let i = 0; i < n; i++) {
        packets.push({
          x: Math.random() * W, y: 0.18 * H + Math.random() * 0.64 * H,
          sp: 0.2 + Math.random() * 0.5, r: 1 + Math.random() * 1.4,
          tone: Math.random() < 0.4 ? [16,185,129] : Math.random() < 0.5 ? [6,182,212] : [59,130,246],
          a: 0.2 + Math.random() * 0.4,
        });
      }
    }

    window.addEventListener("mousemove", (e) => { mx = e.clientX / window.innerWidth; my = e.clientY / window.innerHeight; });

    function frame() {
      raf = requestAnimationFrame(frame);
      t += 1;
      // ease parallax
      px += (mx - px) * 0.04; py += (my - py) * 0.04;
      draw();
    }

    function draw() {
      ctx.clearRect(0, 0, W, H);
      const ox = (px - 0.5) * 26, oy = (py - 0.5) * 20;

      // radial glows
      glow(W * 0.20 + ox, H * 0.22 + oy, Math.max(W, H) * 0.55, [6,182,212], 0.10);
      glow(W * 0.84 - ox, H * 0.78 - oy, Math.max(W, H) * 0.55, [37,99,235], 0.10);

      // dot-grid mesh
      const gap = 34;
      ctx.fillStyle = "rgba(138,153,176,0.08)";
      const sx = (ox * 0.5) % gap, sy = (oy * 0.5) % gap;
      for (let x = sx; x < W; x += gap) {
        for (let y = sy; y < H; y += gap) {
          ctx.beginPath(); ctx.arc(x, y, 1, 0, Math.PI * 2); ctx.fill();
        }
      }

      // data packets drifting left→right (Fivetran → BigQuery → Gemini)
      for (const p of packets) {
        if (!reduce) { p.x += p.sp; if (p.x > W + 10) p.x = -10; }
        const g = ctx.createRadialGradient(p.x, p.y, 0, p.x, p.y, p.r * 5);
        g.addColorStop(0, `rgba(${p.tone[0]},${p.tone[1]},${p.tone[2]},${p.a})`);
        g.addColorStop(1, `rgba(${p.tone[0]},${p.tone[1]},${p.tone[2]},0)`);
        ctx.fillStyle = g; ctx.beginPath(); ctx.arc(p.x, p.y, p.r * 5, 0, Math.PI * 2); ctx.fill();
      }

      // radar scanline sweep when recall active
      if (window.RO_ACTIVE && !reduce) {
        if (radar < 0) radar = 0;
        radar += 0.012;
        if (radar > Math.PI * 2) radar -= Math.PI * 2;
        const cx = W * 0.5, cy = H * 0.46, R = Math.max(W, H) * 0.6;
        const grad = ctx.createConicGradient ? null : null;
        ctx.save();
        ctx.translate(cx, cy);
        // sweep wedge
        ctx.beginPath(); ctx.moveTo(0, 0);
        ctx.arc(0, 0, R, radar - 0.32, radar);
        ctx.closePath();
        const lg = ctx.createLinearGradient(0, 0, Math.cos(radar) * R, Math.sin(radar) * R);
        lg.addColorStop(0, "rgba(6,182,212,0)");
        lg.addColorStop(1, "rgba(6,182,212,0.05)");
        ctx.fillStyle = lg; ctx.fill();
        ctx.restore();
      } else { radar = -1; }

      // vignette
      const vg = ctx.createRadialGradient(W / 2, H * 0.42, Math.min(W, H) * 0.25, W / 2, H * 0.5, Math.max(W, H) * 0.8);
      vg.addColorStop(0, "rgba(10,14,22,0)"); vg.addColorStop(1, "rgba(10,14,22,0.55)");
      ctx.fillStyle = vg; ctx.fillRect(0, 0, W, H);
    }

    function glow(x, y, r, c, a) {
      const g = ctx.createRadialGradient(x, y, 0, x, y, r);
      g.addColorStop(0, `rgba(${c[0]},${c[1]},${c[2]},${a})`);
      g.addColorStop(1, `rgba(${c[0]},${c[1]},${c[2]},0)`);
      ctx.fillStyle = g; ctx.beginPath(); ctx.arc(x, y, r, 0, Math.PI * 2); ctx.fill();
    }

    let raf = 0, rt;
    resize();
    if (reduce) draw(); else raf = requestAnimationFrame(frame);
    window.addEventListener("resize", () => { clearTimeout(rt); rt = setTimeout(resize, 150); });
  }
  window.startCommandBackground = startCommandBackground;
})();
