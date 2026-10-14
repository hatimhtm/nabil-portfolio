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
    // every point is a line on the résumé or a dated document; dl marks a Dean's List semester
    const D = [
      { x: 2021.7,  l: "Enroll — Al Akhawayn University" },
      { x: 2022.7,  l: "Treasurer — Michlifen G&CC" },
      { x: 2022.78, l: "Head of Media — AUI Short Film Festival" },
      { x: 2022.97, l: "Dean's List — Al Akhawayn, Fall 2022", dl: true },
      { x: 2023.05, l: "Co-found Design-Mall" },
      { x: 2023.13, l: "Board member — Humanitarian Lions Club" },
      { x: 2024.05, l: "Delegate — Golden MUN, Marrakech" },
      { x: 2024.15, l: "Top 50 University Startup" },
      { x: 2024.22, l: "J-1 Exchange — Monroe, NYC" },
      { x: 2024.45, l: "Dean's List — Monroe, Spring 2024", dl: true },
      { x: 2024.7,  l: "Student leader — Guoji-Africa Center" },
      { x: 2025.67, l: "Transfer — Mercy University" },
      { x: 2025.75, l: "China Global Study consulting" },
      { x: 2025.98, l: "Dean's List — Mercy, Fall 2025", dl: true },
      { x: 2026.2,  l: "Hope's Assistant ships" },
      { x: 2026.4,  l: "Dean's List — Mercy, Spring 2026", dl: true },
      { x: 2026.45, l: "Market research — Prometheus Trading" },
      { x: 2026.5,  l: "Volunteer — FIFA World Cup 2026" },
      { x: 2026.69, l: "Intern — High Quality Home Therapy" },
      { x: 2026.73, l: "Trading qualification — Bulenox, 50K" },
    ];
    D.forEach((p, i) => { p.y = i + 1; });
    const LAST = D[D.length - 1];
    const W = MOBILE ? 420 : 760, H = MOBILE ? 300 : 320, M = { t: 20, r: 16, b: 34, l: MOBILE ? 30 : 40 };
    const X0 = 2021.4, X1 = 2027.0, Y1 = 22;
    const FS = MOBILE ? 10.5 : 11;
    const sx = (v) => M.l + ((v - X0) / (X1 - X0)) * (W - M.l - M.r);
    const sy = (v) => H - M.b - (v / Y1) * (H - M.t - M.b);
    const svg = el("svg", { viewBox: `0 0 ${W} ${H}`, role: "img",
      "aria-label": `Stepped line chart: cumulative milestones, 1 in late 2021 rising to ${LAST.y} by autumn 2026. Four of them are Dean's List semesters.` }, traj);

    for (let y = 0; y <= Y1; y += 4) {
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
    d += ` L ${sx(2026.86)} ${sy(LAST.y)}`;
    const line = el("path", { d, fill: "none", stroke: "#19b57a", "stroke-width": 2,
      "stroke-linejoin": "round" }, svg);
    drawIn(line);

    // a Dean's List semester is a filled point; everything else is hollow
    D.forEach((p) => el("circle", { cx: sx(p.x), cy: sy(p.y), r: p.dl ? 4 : 3.2,
      fill: p.dl ? "#19b57a" : "#0b1626", stroke: "#19b57a", "stroke-width": 2 }, svg));

    // selective direct labels — four flags only (indices into D). Each sits to the LEFT of
    // its point: the line climbs to the right, so the room is always on the left.
    const FLAGS = [
      [3, "DEAN'S LIST", "end", -10, 4],
      [7, "TOP 50", "end", -10, 4],
      [14, "SHIPPED", "end", -10, 4],
      [19, "CERTIFIED", "end", -10, 4],
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
    // dates as on the résumé; marks = Dean's List semesters as printed on each transcript;
    // est = where the solid bar stops (today) before the expected finish
    const ROWS = [
      { from: 2021.7, to: 2025.4, c: "#3563b8", name: "AL AKHAWAYN UNIVERSITY — BUSINESS ADMINISTRATION", where: "IFRANE, MOROCCO",
        marks: [{ x: 2022.9, l: "F22" }] },
      { from: 2024.2, to: 2024.97, c: "#b4552d", name: "MONROE UNIVERSITY — J-1 EXCHANGE", where: "NEW YORK, US",
        marks: [{ x: 2024.4, l: "S24" }] },
      { from: 2025.67, to: 2026.97, c: "#0e7a57", name: "MERCY UNIVERSITY — B.S. BUSINESS ADMIN., FINANCE", where: "NEW YORK, US · EXP. DEC 2026",
        marks: [{ x: 2025.9, l: "F25" }, { x: 2026.35, l: "S26" }], est: 2026.79 },
    ];
    const W = MOBILE ? 420 : 760, H = MOBILE ? 250 : 230, M = { t: 14, r: 16, b: 30, l: 16 };
    const NAME_FS = MOBILE ? 9.5 : 9.5, SUB_FS = MOBILE ? 8.6 : 8.6;
    const X0 = 2021.4, X1 = 2027.25;
    const sx = (v) => M.l + ((v - X0) / (X1 - X0)) * (W - M.l - M.r);
    const rowY = (i) => M.t + 16 + i * (MOBILE ? 68 : 62);
    const svg = el("svg", { viewBox: `0 0 ${W} ${H}`, role: "img",
      "aria-label": "Timeline: Al Akhawayn 2021 to 2025, Monroe exchange in 2024, Mercy 2025 through expected December 2026, with four Dean's List marks." }, edu);

    const yearStep = MOBILE ? 2 : 1;
    for (let yr = 2022; yr <= 2027; yr += yearStep) {
      el("line", { x1: sx(yr), x2: sx(yr), y1: M.t, y2: H - M.b, stroke: "rgba(14,27,44,0.07)" }, svg);
      el("text", { x: sx(yr), y: H - 10, "text-anchor": "middle", fill: "#67718c",
        "font-family": "IBM Plex Mono", "font-size": SUB_FS }, svg).textContent = yr;
    }
    ROWS.forEach((r, i) => {
      const y = rowY(i);
      // the full span first, faint; the part already done on top of it, solid
      if (r.est) el("rect", { x: sx(r.from), y: y, width: sx(r.to) - sx(r.from), height: 12, rx: 4,
        fill: r.c, opacity: 0.28 }, svg);
      el("rect", { x: sx(r.from), y: y, width: sx(r.est || r.to) - sx(r.from), height: 12,
        rx: 4, fill: r.c }, svg);
      // Dean's List semesters: a paper-coloured mark cut into the bar, readable on all three colours
      (r.marks || []).forEach((m) => el("path", { d: `M ${sx(m.x)} ${y + 2.5} l 4.5 7 h -9 z`, fill: "#fbf9f3" }, svg));

      // Labels start where the bar starts (at the left margin on mobile). Each row has its own
      // lane, so a label that would run past the right edge is anchored to that edge instead.
      const honors = r.marks && r.marks.length ? "▲ DEAN'S LIST " + r.marks.map((m) => m.l).join(" · ") : "";
      const width = (s, fs) => s.length * fs * 0.66;   // Plex Mono advance 0.6em + 0.06em tracking
      const widest = Math.max(width(r.name, NAME_FS), width(r.where + honors, SUB_FS) + 12);
      const start = MOBILE ? M.l : sx(r.from);
      const fits = start + widest <= W - M.r;
      const tx = fits ? start : W - M.r, anchor = fits ? "start" : "end";
      el("text", { x: tx, y: y - 6, "text-anchor": anchor, fill: "#0e1b2c",
        "font-family": "IBM Plex Mono", "font-size": NAME_FS, "letter-spacing": "0.06em" }, svg).textContent = r.name;
      const sub = el("text", { x: tx, y: y + 26, "text-anchor": anchor, fill: "#67718c",
        "font-family": "IBM Plex Mono", "font-size": SUB_FS, "letter-spacing": "0.06em" }, svg);
      sub.textContent = r.where;
      if (honors) el("tspan", { dx: 12, fill: "#0a7d57" }, sub).textContent = honors;
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
