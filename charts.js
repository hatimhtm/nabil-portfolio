/* NM · Equity Research — hand-rolled SVG charts (no libraries) · v2
   Palettes validated for CVD + contrast:
   navy panel #0b1626 → #5b8def / #bd8a2e / #b4635b · up #19b57a
   light paper #f5f2ea → #3563b8 / #0e7a57 / #b4552d · up #0e9f6e
   A chart reads the page's colour tokens where it sits (tokens()), so the same
   code draws on paper and on a navy panel.                                  */
(() => {
  const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  const hasHover = window.matchMedia("(hover: hover) and (pointer: fine)").matches;
  const MOBILE = window.matchMedia("(max-width: 760px)").matches;
  const tokens = (node) => {
    const s = getComputedStyle(node);
    const v = (name) => s.getPropertyValue(name).trim();
    return { up: v("--up-fill"), upText: v("--up"), bg: v("--bg"), card: v("--bg3"), tx: v("--tx"), tx2: v("--tx2"), tx3: v("--tx3"), line: v("--line"), line2: v("--line2") };
  };
  const NS = "http://www.w3.org/2000/svg";
  const el = (tag, attrs, parent) => {
    const n = document.createElementNS(NS, tag);
    for (const k in attrs) n.setAttribute(k, attrs[k]);
    if (parent) parent.appendChild(n);
    return n;
  };
  /* a line draws itself: when it scrolls into view, or (now: true) straight away after a delay */
  const drawIn = (path, opt = {}) => {
    if (reduced) return;
    const len = path.getTotalLength();
    path.style.strokeDasharray = len;
    path.style.strokeDashoffset = len;
    let done = false;
    const go = () => {
      if (done) return;
      done = true;
      path.style.transition = `stroke-dashoffset ${opt.dur || 1.8}s cubic-bezier(0.3,0,0.2,1) ${opt.delay || 0}s`;
      path.style.strokeDashoffset = 0;
    };
    if (opt.now) { requestAnimationFrame(() => requestAnimationFrame(go)); return; }
    const io = new IntersectionObserver((es) => {
      es.forEach((e) => { if (e.isIntersecting) { go(); io.disconnect(); } });
    }, { threshold: 0.15 });
    io.observe(path);
    setTimeout(go, 5000); // failsafe: never leave a chart undrawn
  };

  /* ============================================================
     THE RECORD — one list feeds the cover trace, the tearsheet sparkline,
     the milestone chart and its tape. Every point is a line on the résumé
     or a dated document; dl marks a Dean's List semester.
     ============================================================ */
  const D = [
    { x: 2021.7,  l: "Enrolls at Al Akhawayn University" },
    { x: 2022.7,  l: "Treasurer, Michlifen Golf & Country Club" },
    { x: 2022.78, l: "Head of Media, AUI Short Film Festival" },
    { x: 2022.97, l: "Dean's List, Al Akhawayn, Fall 2022", dl: true },
    { x: 2023.05, l: "Co-founds Design-Mall" },
    { x: 2023.13, l: "Board member, Humanitarian Lions Club" },
    { x: 2024.05, l: "Delegate, Golden MUN, Marrakech" },
    { x: 2024.15, l: "Top 50 University Startup" },
    { x: 2024.22, l: "J-1 exchange at Monroe, New York" },
    { x: 2024.45, l: "Dean's List, Monroe, Spring 2024", dl: true },
    { x: 2024.7,  l: "Student leader, Guoji-Africa Center" },
    { x: 2025.67, l: "Transfers to Mercy University" },
    { x: 2025.75, l: "Starts consulting for China Global Study" },
    { x: 2025.98, l: "Dean's List, Mercy, Fall 2025", dl: true },
    { x: 2026.2,  l: "Hope's Assistant ships" },
    { x: 2026.4,  l: "Dean's List, Mercy, Spring 2026", dl: true },
    { x: 2026.45, l: "Market research for Prometheus Trading" },
    { x: 2026.5,  l: "Volunteer, FIFA World Cup 2026" },
    { x: 2026.69, l: "Intern, High Quality Home Therapy" },
    { x: 2026.73, l: "Trading qualification, Bulenox 50K" },
  ];
  D.forEach((p, i) => { p.y = i + 1; });
  const LAST = D[D.length - 1];
  const X0 = 2021.4, X1 = 2027.0, NOW = 2026.86;
  /* the stepped line through every point, for any pair of scales */
  const steps = (sx, sy) => {
    let d = `M ${sx(X0)} ${sy(0)} L ${sx(D[0].x)} ${sy(0)}`;
    D.forEach((p) => { d += ` L ${sx(p.x)} ${sy(p.y - 1)} L ${sx(p.x)} ${sy(p.y)}`; });
    return d + ` L ${sx(NOW)} ${sy(LAST.y)}`;
  };

  /* ============================================================
     0 · COVER — the record so far, drawn across the whole cover: a glowing
     line that climbs to today, the area under it, and a live last point.
     On a wide screen it fills the band above the name. On a phone it fills
     the band between the rating and the name, or sits behind the name when
     the screen is too short to spare a band.
     ============================================================ */
  const stage = document.getElementById("cover-chart");
  if (stage) {
    const cover = stage.parentElement;
    let last = "";
    const build = (animate) => {
      const w = cover.clientWidth, h = cover.clientHeight;
      const name = cover.querySelector(".cover__name");
      const top0 = cover.querySelector(".cover__top");
      const wide = window.matchMedia("(min-width: 1021px)").matches;
      let top = (top0 ? top0.offsetTop + top0.offsetHeight : 40) + (wide ? 34 : 22);
      let bottom = name ? name.offsetTop - (wide ? 18 : 10) : h * 0.6;
      let behind = false;
      if (bottom - top < 70 && name) {           // no band to spare: go behind the name
        top = name.offsetTop + 6;
        bottom = name.offsetTop + name.offsetHeight - 6;
        behind = true;
      }
      const key = [w, Math.round(top), Math.round(bottom)].join(":");
      if (key === last) return;
      last = key;
      stage.textContent = "";
      const UP = tokens(stage).up;
      const svg = el("svg", { viewBox: `0 0 ${w} ${h}`, preserveAspectRatio: "none" }, stage);
      svg.style.opacity = behind ? 0.42 : 1;
      const right = w * (wide ? 0.955 : 0.93);
      const sx = (v) => ((v - X0) / (NOW - X0)) * right;
      const sy = (v) => bottom - (v / LAST.y) * (bottom - top);
      const defs = el("defs", {}, svg);
      const grad = el("linearGradient", { id: "cover-fill", gradientUnits: "userSpaceOnUse", x1: 0, y1: top, x2: 0, y2: bottom + 70 }, defs);
      el("stop", { offset: "0", "stop-color": UP, "stop-opacity": behind ? 0.1 : 0.2 }, grad);
      el("stop", { offset: "1", "stop-color": UP, "stop-opacity": 0 }, grad);
      const d = steps(sx, sy);
      const area = el("path", { class: "area", d: `${d} L ${sx(NOW)} ${bottom + 70} L ${sx(X0)} ${bottom + 70} Z` }, svg);
      const line = el("path", { class: "line", d }, svg);
      const ex = sx(NOW), ey = sy(LAST.y);
      // the four Dean's List semesters sit on the line as filled pins
      const pins = behind ? [] : D.filter((p) => p.dl).map((p) => el("circle", { class: "pin is-dl", cx: sx(p.x), cy: sy(p.y), r: 4.5 }, svg));
      const halo = el("circle", { class: "halo", cx: ex, cy: ey, r: 5 }, svg);
      const dot = el("circle", { class: "dot", cx: ex, cy: ey, r: 6 }, svg);
      const rest = `${LAST.y} MILESTONES ▲`;
      const tag = behind ? null : el("text", { class: "tag", x: ex - 14, y: ey - 14, "text-anchor": "end" }, svg);
      if (tag) tag.textContent = rest;
      if (animate && !reduced) {
        drawIn(line, { now: true, delay: 0.35, dur: 2.4 });
        [area, halo, dot, tag, ...pins].forEach((n) => {
          if (!n) return;
          n.style.opacity = 0;
          n.style.transition = `opacity 0.9s ease ${n === area ? 1.3 : 2.5}s`;
          requestAnimationFrame(() => requestAnimationFrame(() => { n.style.opacity = 1; }));
        });
      }
      // with a mouse the cover is live: move across it and the chart reads out the milestone under the pointer
      if (hasHover && tag) {
        const probe = el("line", { class: "probe", y1: top - 6, y2: bottom, opacity: 0 }, svg);
        const mark = el("circle", { class: "pin", r: 5.5, opacity: 0 }, svg);
        cover.onpointermove = (e) => {
          const r = cover.getBoundingClientRect();
          const mx = e.clientX - r.left;
          let best = D[0], gap = Infinity;
          D.forEach((p) => { const g = Math.abs(sx(p.x) - mx); if (g < gap) { gap = g; best = p; } });
          const px = sx(best.x), py = sy(best.y);
          probe.setAttribute("x1", px); probe.setAttribute("x2", px); probe.setAttribute("opacity", 1);
          mark.setAttribute("cx", px); mark.setAttribute("cy", py); mark.setAttribute("opacity", 1);
          mark.setAttribute("class", best.dl ? "pin is-dl" : "pin");
          const right = px > w * 0.62;
          tag.setAttribute("x", right ? px - 12 : px + 12);
          tag.setAttribute("y", Math.max(top - 12, py - 14));
          tag.setAttribute("text-anchor", right ? "end" : "start");
          tag.textContent = `#${String(best.y).padStart(2, "0")} · ${Math.floor(best.x)} · ${best.l.toUpperCase()}`;
        };
        cover.onpointerleave = () => {
          probe.setAttribute("opacity", 0); mark.setAttribute("opacity", 0);
          tag.setAttribute("x", ex - 14); tag.setAttribute("y", ey - 14); tag.setAttribute("text-anchor", "end");
          tag.textContent = rest;
        };
      }
    };
    build(true);
    // the name is sized by app.js after the fonts arrive; follow it, without replaying the entrance
    window.addEventListener("nm:fit", () => build(false));
    let wait;
    window.addEventListener("resize", () => { clearTimeout(wait); wait = setTimeout(() => build(false), 180); });
  }

  /* ============================================================
     1 · MILESTONE ACCUMULATION — index.html  (single series, stepped),
     with the tape beside it: the same twenty points as a list
     ============================================================ */
  const traj = document.getElementById("chart-trajectory");
  if (traj) {
    const W = MOBILE ? 420 : 760, H = MOBILE ? 320 : 330, M = { t: 20, r: 16, b: 34, l: MOBILE ? 30 : 40 };
    const Y1 = 22;
    const FS = MOBILE ? 10.5 : 11;
    const T = tokens(traj), UP = T.up, PANEL = T.bg, AXIS = T.tx3, GRID = T.line, INK = T.tx2;
    const sx = (v) => M.l + ((v - X0) / (X1 - X0)) * (W - M.l - M.r);
    const sy = (v) => H - M.b - (v / Y1) * (H - M.t - M.b);
    const svg = el("svg", { viewBox: `0 0 ${W} ${H}`, role: "img",
      "aria-label": `Stepped line chart: cumulative milestones, 1 in late 2021 rising to ${LAST.y} by autumn 2026. Four of them are Dean's List semesters.` }, traj);

    for (let y = 0; y <= Y1; y += 4) {
      el("line", { x1: M.l, x2: W - M.r, y1: sy(y), y2: sy(y), stroke: GRID }, svg);
      el("text", { x: M.l - 7, y: sy(y) + 3, "text-anchor": "end", fill: AXIS,
        "font-family": "IBM Plex Mono", "font-size": FS - 1.5 }, svg).textContent = y;
    }
    for (let yr = 2022; yr <= 2026; yr++) {
      el("text", { x: sx(yr), y: H - 12, "text-anchor": "middle", fill: AXIS,
        "font-family": "IBM Plex Mono", "font-size": FS - 1.5 }, svg).textContent = yr;
    }

    // the area under the line, then the line itself with a little glow
    const defs = el("defs", {}, svg);
    const fill = el("linearGradient", { id: "traj-fill", x1: 0, y1: 0, x2: 0, y2: 1 }, defs);
    el("stop", { offset: "0", "stop-color": UP, "stop-opacity": 0.22 }, fill);
    el("stop", { offset: "1", "stop-color": UP, "stop-opacity": 0 }, fill);
    const dd = steps(sx, sy);
    el("path", { d: `${dd} L ${sx(NOW)} ${sy(0)} Z`, fill: "url(#traj-fill)" }, svg);
    const line = el("path", { d: dd, fill: "none", stroke: UP, "stroke-width": 2,
      "stroke-linejoin": "round" }, svg);
    line.style.filter = "drop-shadow(0 0 6px rgba(25,181,122,0.55))";
    drawIn(line);

    // a Dean's List semester is a filled point; everything else is hollow
    D.forEach((p) => el("circle", { cx: sx(p.x), cy: sy(p.y), r: p.dl ? 4 : 3.2,
      fill: p.dl ? UP : PANEL, stroke: UP, "stroke-width": 2 }, svg));

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
      el("text", { x: sx(p.x) + dx, y: sy(p.y) + dy, "text-anchor": anchor, fill: INK,
        "font-family": "IBM Plex Mono", "font-size": FS - 1, "letter-spacing": "0.08em" }, svg).textContent = txt;
    });

    const hit = (i) => {
      const p = D[i];
      return { i, x: sx(p.x), y: sy(p.y), html: `<b>#${p.y}</b> · ${Math.floor(p.x)}<br>${p.l}` };
    };

    /* ---- the tape ---- */
    const tape = document.getElementById("tape");
    let rows = [], list = null;
    if (tape) {
      const head = document.createElement("div");
      head.className = "tape__head";
      head.innerHTML = `<span>THE TAPE · NEWEST FIRST</span><span>${D.length} ▲</span>`;
      list = document.createElement("ol");
      const FOLD = 6;            // on a phone the tape shows this many until asked for the rest
      [...D].reverse().forEach((p, k) => {
        const li = document.createElement("li");
        if (p.dl) li.className = "is-dl";
        li.dataset.i = p.y - 1;
        if (k >= FOLD) li.hidden = true;
        [`#${String(p.y).padStart(2, "0")}`, Math.floor(p.x), p.l].forEach((t) => {
          const s = document.createElement("span");
          s.textContent = t;
          li.appendChild(s);
        });
        list.appendChild(li);
      });
      rows = Array.from(list.children);
      const more = document.createElement("button");
      more.type = "button";
      more.className = "tape__more";
      more.setAttribute("aria-expanded", "false");
      more.textContent = `SHOW ALL ${D.length} ↓`;
      more.addEventListener("click", () => {
        const open = more.getAttribute("aria-expanded") === "true";
        rows.forEach((li, k) => { if (k >= FOLD) li.hidden = open; });
        more.setAttribute("aria-expanded", String(!open));
        more.textContent = open ? `SHOW ALL ${D.length} ↓` : "SHOW FEWER ↑";
      });
      tape.append(head, list, more);
    }
    const mark = (i, follow) => {
      rows.forEach((li) => {
        const on = Number(li.dataset.i) === i;
        li.classList.toggle("is-on", on);
        // keep the marked row in sight when the tape scrolls on its own (wide screens)
        if (on && follow && list.scrollHeight > list.clientHeight + 4) {
          list.scrollTo({ top: li.offsetTop - list.clientHeight / 2 + li.offsetHeight / 2, behavior: reduced ? "auto" : "smooth" });
        }
      });
    };

    const hover = attachHover(traj, svg, (mx) => {
      let best = 0, bd = Infinity;
      D.forEach((p, i) => { const dd = Math.abs(sx(p.x) - mx); if (dd < bd) { bd = dd; best = i; } });
      return hit(best);
    }, { top: M.t, bottom: H - M.b, W, H }, (h) => mark(h ? h.i : -1, true));

    rows.forEach((li) => {
      const i = Number(li.dataset.i);
      if (hasHover) {
        li.addEventListener("mouseenter", () => { hover.show(hit(i)); mark(i, false); });
        li.addEventListener("mouseleave", () => { hover.hide(); mark(-1, false); });
      } else {
        // on a phone: a tap on a row takes you to its point on the chart
        li.addEventListener("click", () => {
          traj.scrollIntoView({ block: "center", behavior: reduced ? "auto" : "smooth" });
          hover.show(hit(i));
          mark(i, false);
        });
      }
    });
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
    const T = tokens(sig), UP = T.up, PANEL = T.bg, AXIS = T.tx3, GRID = T.line;
    const lo = Math.min(...price) - 4, hi = Math.max(...price) + 4;
    const sx = (i) => M.l + (i / (N - 1)) * (W - M.l - M.r);
    const sy = (p) => H - M.b - ((p - lo) / (hi - lo)) * (H - M.t - M.b);
    const svg = el("svg", { viewBox: `0 0 ${W} ${H}`, role: "img",
      "aria-label": "Line chart of a synthetic price with 50 and 200 day moving averages; the 50-day crosses above the 200-day, marked as a golden cross." }, sig);

    for (let g = 0; g < 5; g++) {
      const yy = M.t + (g / 4) * (H - M.t - M.b);
      el("line", { x1: M.l, x2: W - M.r, y1: yy, y2: yy, stroke: GRID }, svg);
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
      el("circle", { cx: sx(cross), cy: sy(s50[cross]), r: 5, fill: UP,
        stroke: PANEL, "stroke-width": 2 }, svg);
      el("line", { x1: sx(cross), x2: sx(cross), y1: M.t, y2: H - M.b,
        stroke: "rgba(25,181,122,0.4)", "stroke-dasharray": "3 4" }, svg);
      el("text", { x: sx(cross), y: M.t - 6, "text-anchor": "middle", fill: UP,
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
      { from: 2021.7, to: 2025.4, c: "#3563b8", name: "AL AKHAWAYN UNIVERSITY · BUSINESS ADMINISTRATION", where: "IFRANE, MOROCCO",
        marks: [{ x: 2022.9, l: "F22" }] },
      { from: 2024.2, to: 2024.97, c: "#b4552d", name: "MONROE UNIVERSITY · J-1 EXCHANGE", where: "NEW YORK, US",
        marks: [{ x: 2024.4, l: "S24" }] },
      { from: 2025.67, to: 2026.97, c: "#0e7a57", name: "MERCY UNIVERSITY · B.S. BUSINESS ADMIN., FINANCE", where: "NEW YORK, US · EXP. DEC 2026",
        marks: [{ x: 2025.9, l: "F25" }, { x: 2026.35, l: "S26" }], est: 2026.79 },
    ];
    const W = MOBILE ? 420 : 760, H = MOBILE ? 250 : 230, M = { t: 14, r: 16, b: 30, l: 16 };
    const NAME_FS = 9.5, SUB_FS = 8.6;
    const E0 = 2021.4, E1 = 2027.25;
    const T = tokens(edu), GRID = T.line;
    const sx = (v) => M.l + ((v - E0) / (E1 - E0)) * (W - M.l - M.r);
    const rowY = (i) => M.t + 16 + i * (MOBILE ? 68 : 62);
    const svg = el("svg", { viewBox: `0 0 ${W} ${H}`, role: "img",
      "aria-label": "Timeline: Al Akhawayn 2021 to 2025, Monroe exchange in 2024, Mercy 2025 through expected December 2026, with four Dean's List marks." }, edu);

    const yearStep = MOBILE ? 2 : 1;
    for (let yr = 2022; yr <= 2027; yr += yearStep) {
      el("line", { x1: sx(yr), x2: sx(yr), y1: M.t, y2: H - M.b, stroke: GRID }, svg);
      el("text", { x: sx(yr), y: H - 10, "text-anchor": "middle", fill: T.tx3,
        "font-family": "IBM Plex Mono", "font-size": SUB_FS }, svg).textContent = yr;
    }
    ROWS.forEach((r, i) => {
      const y = rowY(i);
      // the full span first, faint; the part already done on top of it, solid, growing from its start
      if (r.est) el("rect", { x: sx(r.from), y: y, width: sx(r.to) - sx(r.from), height: 12, rx: 4,
        fill: r.c, opacity: 0.28 }, svg);
      const bar = el("rect", { x: sx(r.from), y: y, width: sx(r.est || r.to) - sx(r.from), height: 12,
        rx: 4, fill: r.c }, svg);
      if (!reduced) {
        bar.style.transformBox = "fill-box";
        bar.style.transformOrigin = "0 50%";
        bar.style.transform = "scaleX(0)";
        bar.style.transition = `transform 1.1s cubic-bezier(0.77,0,0.175,1) ${0.15 + i * 0.16}s`;
      }
      // Dean's List semesters: a paper-coloured mark cut into the bar, readable on all three colours
      (r.marks || []).forEach((m) => el("path", { d: `M ${sx(m.x)} ${y + 2.5} l 4.5 7 h -9 z`, fill: T.card }, svg));

      // Labels start where the bar starts (at the left margin on mobile). Each row has its own
      // lane, so a label that would run past the right edge is anchored to that edge instead.
      const honors = r.marks && r.marks.length ? "▲ DEAN'S LIST " + r.marks.map((m) => m.l).join(" · ") : "";
      const width = (s, fs) => s.length * fs * 0.66;   // Plex Mono advance 0.6em + 0.06em tracking
      const widest = Math.max(width(r.name, NAME_FS), width(r.where + honors, SUB_FS) + 12);
      const start = MOBILE ? M.l : sx(r.from);
      const fits = start + widest <= W - M.r;
      const tx = fits ? start : W - M.r, anchor = fits ? "start" : "end";
      el("text", { x: tx, y: y - 6, "text-anchor": anchor, fill: T.tx,
        "font-family": "IBM Plex Mono", "font-size": NAME_FS, "letter-spacing": "0.06em" }, svg).textContent = r.name;
      const sub = el("text", { x: tx, y: y + 26, "text-anchor": anchor, fill: T.tx3,
        "font-family": "IBM Plex Mono", "font-size": SUB_FS, "letter-spacing": "0.06em" }, svg);
      sub.textContent = r.where;
      if (honors) el("tspan", { dx: 12, fill: T.upText }, sub).textContent = honors;
    });
    // the bars grow when the chart comes into view
    if (!reduced) {
      const grow = () => svg.querySelectorAll("rect").forEach((b) => { b.style.transform = "none"; });
      const io = new IntersectionObserver((es) => {
        es.forEach((e) => { if (e.isIntersecting) { grow(); io.disconnect(); } });
      }, { threshold: 0.25 });
      io.observe(svg);
      setTimeout(grow, 5000);
    }
  }

  /* ============================================================
     hover layer — crosshair + tooltip (shared). A mouse hovers; a finger
     drags sideways (the chart leaves vertical drags to the page scroll).
     Returns show/hide so something else (the tape) can drive it.
     ============================================================ */
  function attachHover(container, svg, locate, geom, onChange) {
    const tip = document.createElement("div");
    tip.className = "chart__tip";
    container.appendChild(tip);
    const cross = el("line", { y1: geom.top, y2: geom.bottom,
      stroke: "rgba(245,242,234,0.3)", "stroke-width": 1, opacity: 0 }, svg);
    const halo = el("circle", { r: 5.5, fill: "none", stroke: "rgba(245,242,234,0.9)",
      "stroke-width": 1.5, opacity: 0 }, svg);
    let timer;
    const show = (h) => {
      clearTimeout(timer);
      const r = svg.getBoundingClientRect();
      cross.setAttribute("x1", h.x); cross.setAttribute("x2", h.x);
      cross.setAttribute("opacity", 1);
      halo.setAttribute("cx", h.x); halo.setAttribute("cy", h.y);
      halo.setAttribute("opacity", 1);
      tip.innerHTML = h.html;
      // keep the tooltip inside the chart: near an edge it slides in instead of being cut off
      const half = tip.offsetWidth / 2 + 4;
      const left = Math.max(half, Math.min(r.width - half, (h.x / geom.W) * r.width));
      tip.style.left = left + "px";
      tip.style.top = Math.max(tip.offsetHeight + 18, (h.y / geom.H) * r.height) + "px";
      tip.classList.add("is-on");
      if (onChange) onChange(h);
    };
    const hide = () => {
      tip.classList.remove("is-on");
      cross.setAttribute("opacity", 0);
      halo.setAttribute("opacity", 0);
      if (onChange) onChange(null);
    };
    const at = (e) => {
      const r = svg.getBoundingClientRect();
      const h = locate(((e.clientX - r.left) / r.width) * geom.W);
      if (h) show(h);
    };
    svg.addEventListener("pointerdown", at);
    svg.addEventListener("pointermove", (e) => { if (e.pointerType === "mouse" || e.buttons || e.pressure > 0) at(e); });
    svg.addEventListener("pointerleave", (e) => { if (e.pointerType === "mouse") hide(); });
    const later = (e) => { if (e.pointerType !== "mouse") { clearTimeout(timer); timer = setTimeout(hide, 2200); } };
    svg.addEventListener("pointerup", later);
    svg.addEventListener("pointercancel", later);
    return { show, hide };
  }
})();
