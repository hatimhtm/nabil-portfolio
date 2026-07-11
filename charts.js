/* NM · Equity Research — hand-rolled SVG charts (no libraries)
   Palettes validated for CVD + contrast:
   dark #0b1626 → #5b8def / #bd8a2e / #b4635b · up #19b57a
   light #f5f2ea → #3563b8 / #0e7a57 / #b4552d                              */
(() => {
  const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  const MOBILE = window.matchMedia("(max-width: 700px)").matches;
  const AXIS = "rgba(245,242,234,0.55)";
  const NS = "http://www.w3.org/2000/svg";
  const el = (tag, attrs, parent) => {
    const n = document.createElementNS(NS, tag);
    for (const k in attrs) n.setAttribute(k, attrs[k]);
    if (parent) parent.appendChild(n);
    return n;
  };
  const drawIn = (path) => {
    if (reduced) return;
    const len = path.getTotalLength();
    path.style.strokeDasharray = len;
    path.style.strokeDashoffset = len;
    let done = false;
    const go = () => {
      if (done) return;
      done = true;
      path.style.transition = "stroke-dashoffset 1.8s cubic-bezier(0.3,0,0.2,1)";
      path.style.strokeDashoffset = 0;
      io.disconnect();
    };
    const io = new IntersectionObserver((es) => {
      es.forEach((e) => { if (e.isIntersecting) go(); });
    }, { threshold: 0.15 });
    io.observe(path);
    setTimeout(go, 5000); // failsafe: never leave a chart undrawn
  };

  /* ============================================================
     1 · MILESTONE ACCUMULATION — index.html  (single series, stepped)
     ============================================================ */
  const traj = document.getElementById("chart-trajectory");
  if (traj) {
    const D = [
      { x: 2021.7,  y: 1,  l: "Enroll — Al Akhawayn University" },
      { x: 2022.5,  y: 2,  l: "Treasurer — Michlifen G&CC" },
      { x: 2022.8,  y: 3,  l: "Lions Club — AUI chapter" },
      { x: 2023.3,  y: 4,  l: "Co-found Design-Mall" },
      { x: 2024.2,  y: 5,  l: "Top 50 University Startup" },
      { x: 2024.65, y: 6,  l: "J-1 Exchange — Monroe, NYC" },
      { x: 2024.95, y: 7,  l: "Dean's List — Winter 2024" },
      { x: 2025.6,  y: 8,  l: "Transfer — Mercy University" },
      { x: 2025.7,  y: 9,  l: "China Global Study consulting" },
      { x: 2025.85, y: 10, l: "Intern — Prometheus Trading" },
      { x: 2025.98, y: 11, l: "Dean's List — Fall 2025" },
      { x: 2026.2,  y: 12, l: "Hope's Assistant ships" },
    ];
    const W = MOBILE ? 420 : 760, H = MOBILE ? 300 : 320, M = { t: 20, r: 16, b: 34, l: MOBILE ? 30 : 40 };
    const X0 = 2021.4, X1 = 2026.8, Y1 = 14;
    const FS = MOBILE ? 10.5 : 11;
    const sx = (v) => M.l + ((v - X0) / (X1 - X0)) * (W - M.l - M.r);
    const sy = (v) => H - M.b - (v / Y1) * (H - M.t - M.b);
    const svg = el("svg", { viewBox: `0 0 ${W} ${H}`, role: "img",
      "aria-label": "Stepped line chart: cumulative milestones, 1 in late 2021 rising to 12 by mid 2026." }, traj);

    for (let y = 0; y <= Y1; y += 2) {
      el("line", { x1: M.l, x2: W - M.r, y1: sy(y), y2: sy(y), stroke: "rgba(245,242,234,0.07)" }, svg);
      el("text", { x: M.l - 7, y: sy(y) + 3, "text-anchor": "end", fill: AXIS,
        "font-family": "IBM Plex Mono", "font-size": FS - 1.5 }, svg).textContent = y;
    }
    for (let yr = 2022; yr <= 2026; yr++) {
      el("text", { x: sx(yr), y: H - 12, "text-anchor": "middle", fill: AXIS,
        "font-family": "IBM Plex Mono", "font-size": FS - 1.5 }, svg).textContent = yr;
    }

    // stepped path (after)
    let d = `M ${sx(X0)} ${sy(0)} L ${sx(D[0].x)} ${sy(0)}`;
    D.forEach((p) => { d += ` L ${sx(p.x)} ${sy(p.y - 1)} L ${sx(p.x)} ${sy(p.y)}`; });
    d += ` L ${sx(2026.72)} ${sy(12)}`;
    const line = el("path", { d, fill: "none", stroke: "#19b57a", "stroke-width": 2,
      "stroke-linejoin": "round" }, svg);
    drawIn(line);

    D.forEach((p) => el("circle", { cx: sx(p.x), cy: sy(p.y), r: 3.2, fill: "#0b1626",
      stroke: "#19b57a", "stroke-width": 2 }, svg));

    // selective direct labels — three flags only (indices into D);
    // DEAN'S sits left of its point so it can't touch the SHIPPED dot above-right
    const FLAGS = [
      [4, "TOP 50", "middle", 0, -14],
      [10, "DEAN'S ×2", "end", -10, 4],
      [11, "SHIPPED", "middle", 0, -14],
    ];
    FLAGS.forEach(([i, txt, anchor, dx, dy]) => {
      const p = D[i];
      el("text", { x: sx(p.x) + dx, y: sy(p.y) + dy, "text-anchor": anchor, fill: "rgba(245,242,234,0.8)",
        "font-family": "IBM Plex Mono", "font-size": FS - 1, "letter-spacing": "0.08em" }, svg).textContent = txt;
    });

    attachHover(traj, svg, (mx) => {
      let best = 0, bd = Infinity;
      D.forEach((p, i) => { const dd = Math.abs(sx(p.x) - mx); if (dd < bd) { bd = dd; best = i; } });
      const p = D[best];
      return { x: sx(p.x), y: sy(p.y), html: `<b>#${p.y}</b> · ${Math.floor(p.x)}<br>${p.l}` };
    }, { top: M.t, bottom: H - M.b, W, H });
  }

  /* ============================================================
     2 · SMA CROSSOVER DEMO — signals.html  (3 series + status marker)
     ============================================================ */
  const sig = document.getElementById("chart-signals");
  if (sig) {
    // deterministic series (seeded LCG) so the chart is stable
    let seed = 42;
    const rnd = () => (seed = (seed * 1664525 + 1013904223) % 4294967296) / 4294967296;
    const N = 340, price = [];
    let v = 100;
    for (let i = 0; i < N; i++) {
      const drift = i < 220 ? -0.2 : 0.45;           // long decline, then recovery → cross at ~D262
      v = Math.max(40, v + drift + (rnd() - 0.5) * 2.6);
      price.push(v);
    }
    const sma = (n) => price.map((_, i) => i < n - 1 ? null :
      price.slice(i - n + 1, i + 1).reduce((a, b) => a + b, 0) / n);
    const s50 = sma(50), s200 = sma(200);
    let cross = -1;
    for (let i = 201; i < N; i++) {
      if (s50[i - 1] <= s200[i - 1] && s50[i] > s200[i]) { cross = i; break; }
    }

    const W = MOBILE ? 420 : 760, H = MOBILE ? 320 : 340, M = { t: 18, r: MOBILE ? 58 : 74, b: 30, l: MOBILE ? 30 : 40 };
    const FS = MOBILE ? 10.5 : 11;
    const lo = Math.min(...price) - 4, hi = Math.max(...price) + 4;
    const sx = (i) => M.l + (i / (N - 1)) * (W - M.l - M.r);
    const sy = (p) => H - M.b - ((p - lo) / (hi - lo)) * (H - M.t - M.b);
    const svg = el("svg", { viewBox: `0 0 ${W} ${H}`, role: "img",
      "aria-label": "Line chart of a synthetic price with 50 and 200 day moving averages; the 50-day crosses above the 200-day, marked as a golden cross." }, sig);

    for (let g = 0; g < 5; g++) {
      const yy = M.t + (g / 4) * (H - M.t - M.b);
      el("line", { x1: M.l, x2: W - M.r, y1: yy, y2: yy, stroke: "rgba(245,242,234,0.07)" }, svg);
      el("text", { x: M.l - 7, y: yy + 3, "text-anchor": "end", fill: AXIS,
        "font-family": "IBM Plex Mono", "font-size": FS - 1.5 }, svg).textContent = Math.round(hi - (g / 4) * (hi - lo));
    }
    (MOBILE ? [0, 170, 339] : [0, 85, 170, 255, 339]).forEach((i) => {
      el("text", { x: sx(i), y: H - 10, "text-anchor": "middle", fill: AXIS,
        "font-family": "IBM Plex Mono", "font-size": FS - 1.5 }, svg).textContent = `D${i}`;
    });

    const pathOf = (arr) => arr.reduce((acc, p, i) =>
      p == null ? acc : acc + (acc ? " L " : "M ") + sx(i).toFixed(1) + " " + sy(p).toFixed(1), "");
    const SERIES = [
      { d: price, c: "#5b8def", w: 1.6, label: "PRICE" },
      { d: s50,   c: "#bd8a2e", w: 2,   label: "SMA 50" },
      { d: s200,  c: "#b4635b", w: 2,   label: "SMA 200" },
    ];
    SERIES.forEach((s) => {
      const p = el("path", { d: pathOf(s.d), fill: "none", stroke: s.c, "stroke-width": s.w,
        "stroke-linejoin": "round" }, svg);
      drawIn(p);
      const last = s.d[N - 1];
      el("text", { x: W - M.r + 7, y: sy(last) + 3, fill: s.c,
        "font-family": "IBM Plex Mono", "font-size": FS - 1, "letter-spacing": "0.05em" }, svg).textContent = s.label;
    });

    if (cross > 0) {
      el("circle", { cx: sx(cross), cy: sy(s50[cross]), r: 5, fill: "#19b57a",
        stroke: "#0b1626", "stroke-width": 2 }, svg);
      el("line", { x1: sx(cross), x2: sx(cross), y1: M.t, y2: H - M.b,
        stroke: "rgba(25,181,122,0.35)", "stroke-dasharray": "3 4" }, svg);
      el("text", { x: sx(cross), y: M.t - 6, "text-anchor": "middle", fill: "#19b57a",
        "font-family": "IBM Plex Mono", "font-size": FS - 0.5, "letter-spacing": "0.1em" }, svg)
        .textContent = "GOLDEN CROSS ▲";
    }

    attachHover(sig, svg, (mx) => {
      const i = Math.max(0, Math.min(N - 1, Math.round(((mx - M.l) / (W - M.l - M.r)) * (N - 1))));
      const rows = [`<b>DAY ${i}</b>`, `PRICE&nbsp;&nbsp;${price[i].toFixed(1)}`];
      if (s50[i] != null) rows.push(`SMA50&nbsp;&nbsp;${s50[i].toFixed(1)}`);
      if (s200[i] != null) rows.push(`SMA200&nbsp;${s200[i].toFixed(1)}`);
      return { x: sx(i), y: sy(price[i]), html: rows.join("<br>") };
    }, { top: M.t, bottom: H - M.b, W, H });
  }

  /* ============================================================
     3 · EDUCATION TIMELINE — profile.html  (gantt, light surface)
     ============================================================ */
  const edu = document.getElementById("chart-education");
  if (edu) {
    const ROWS = [
      { from: 2021.7, to: 2025.4, c: "#3563b8", name: "AL AKHAWAYN UNIVERSITY — BBA FOUNDATION", where: "IFRANE, MOROCCO" },
      { from: 2024.65, to: 2025.4, c: "#b4552d", name: "MONROE COLLEGE — J-1 EXCHANGE", where: "NEW YORK, US", mark: { x: 2024.95, l: "DEAN'S LIST W24" } },
      { from: 2025.6, to: 2027.4, c: "#0e7a57", name: "MERCY UNIVERSITY — B.S. FINANCE", where: "NEW YORK, US", mark: { x: 2025.95, l: "DEAN'S LIST F25" }, est: 2026.55 },
    ];
    const W = MOBILE ? 420 : 760, H = MOBILE ? 250 : 230, M = { t: 14, r: 16, b: 30, l: 16 };
    const NAME_FS = MOBILE ? 9.5 : 9.5, SUB_FS = MOBILE ? 8.6 : 8.6;
    const X0 = 2021.4, X1 = 2027.6;
    const sx = (v) => M.l + ((v - X0) / (X1 - X0)) * (W - M.l - M.r);
    const rowY = (i) => M.t + 16 + i * (MOBILE ? 68 : 62);
    const svg = el("svg", { viewBox: `0 0 ${W} ${H}`, role: "img",
      "aria-label": "Timeline: Al Akhawayn 2021 to 2025, Monroe exchange 2024 to 2025, Mercy 2025 through expected 2027, with two Dean's List marks." }, edu);

    const yearStep = MOBILE ? 2 : 1;
    for (let yr = 2022; yr <= 2027; yr += yearStep) {
      el("line", { x1: sx(yr), x2: sx(yr), y1: M.t, y2: H - M.b, stroke: "rgba(14,27,44,0.07)" }, svg);
      el("text", { x: sx(yr), y: H - 10, "text-anchor": "middle", fill: "#67718c",
        "font-family": "IBM Plex Mono", "font-size": SUB_FS }, svg).textContent = yr;
    }
    ROWS.forEach((r, i) => {
      const y = rowY(i);
      // on mobile, anchor all text to the left margin so long names never overflow the plot
      const tx = MOBILE ? M.l : sx(r.from);
      const solidTo = r.est || r.to;
      el("rect", { x: sx(r.from), y: y, width: sx(solidTo) - sx(r.from), height: 12,
        rx: 4, fill: r.c }, svg);
      if (r.est) {
        el("rect", { x: sx(r.est), y: y, width: sx(r.to) - sx(r.est), height: 12, rx: 4,
          fill: r.c, opacity: 0.28 }, svg);
        el("text", { x: (sx(r.est) + sx(r.to)) / 2, y: y + 9, "text-anchor": "middle",
          fill: "#45536e", "font-family": "IBM Plex Mono", "font-size": MOBILE ? 6.4 : 7.2,
          "letter-spacing": "0.05em" }, svg).textContent = "EXP. 2027";
      }
      el("text", { x: tx, y: y - 6, fill: "#0e1b2c",
        "font-family": "IBM Plex Mono", "font-size": NAME_FS, "letter-spacing": "0.06em" }, svg).textContent = r.name;
      el("text", { x: tx, y: y + 26, fill: "#67718c",
        "font-family": "IBM Plex Mono", "font-size": SUB_FS, "letter-spacing": "0.06em" }, svg).textContent = r.where;
      if (r.mark) {
        el("path", { d: `M ${sx(r.mark.x)} ${y - 3} l 4.5 7 h -9 z`, fill: "#0e9f6e" }, svg);
        // label sits after the where-text, never over it
        const labelX = tx + r.where.length * (SUB_FS * 0.68) + 16;
        el("text", { x: labelX, y: y + 26, fill: "#0a7d57",
          "font-family": "IBM Plex Mono", "font-size": SUB_FS, "letter-spacing": "0.05em" }, svg).textContent = "▲ " + r.mark.l;
      }
    });
  }

  /* ============================================================
     hover layer — crosshair + tooltip (shared)
     ============================================================ */
  function attachHover(container, svg, locate, geom) {
    const tip = document.createElement("div");
    tip.className = "chart__tip";
    container.appendChild(tip);
    const cross = el("line", { y1: geom.top, y2: geom.bottom,
      stroke: "rgba(245,242,234,0.25)", "stroke-width": 1, opacity: 0 }, svg);
    const halo = el("circle", { r: 5, fill: "none", stroke: "rgba(245,242,234,0.8)",
      "stroke-width": 1.5, opacity: 0 }, svg);
    const move = (clientX, clientY) => {
      const r = svg.getBoundingClientRect();
      const mx = ((clientX - r.left) / r.width) * geom.W;
      const hit = locate(mx);
      if (!hit) return;
      cross.setAttribute("x1", hit.x); cross.setAttribute("x2", hit.x);
      cross.setAttribute("opacity", 1);
      halo.setAttribute("cx", hit.x); halo.setAttribute("cy", hit.y);
      halo.setAttribute("opacity", 1);
      tip.innerHTML = hit.html;
      tip.style.left = (hit.x / geom.W) * r.width + "px";
      tip.style.top = (hit.y / geom.H) * r.height + "px";
      tip.classList.add("is-on");
    };
    svg.addEventListener("mousemove", (e) => move(e.clientX, e.clientY));
    svg.addEventListener("touchstart", (e) => move(e.touches[0].clientX, e.touches[0].clientY), { passive: true });
    svg.addEventListener("touchmove", (e) => move(e.touches[0].clientX, e.touches[0].clientY), { passive: true });
    const hide = () => {
      tip.classList.remove("is-on");
      cross.setAttribute("opacity", 0);
      halo.setAttribute("opacity", 0);
    };
    svg.addEventListener("mouseleave", hide);
    svg.addEventListener("touchend", () => setTimeout(hide, 1400));
    svg.addEventListener("touchcancel", hide);
  }
})();
