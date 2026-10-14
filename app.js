/* NM · Equity Research — shared interactions (v2) */
(() => {
  const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  const hasHover = window.matchMedia("(hover: hover) and (pointer: fine)").matches;
  const $ = (s, c) => (c || document).querySelector(s);
  const $$ = (s, c) => Array.from((c || document).querySelectorAll(s));

  /* ---- report date, New York time in the masthead, tri-city clocks (bridge page) ---- */
  const clock = (tz, short) =>
    new Intl.DateTimeFormat("en-US", { hour: "2-digit", minute: "2-digit", second: short ? undefined : "2-digit", hour12: false, timeZone: tz }).format(new Date());
  $$("[data-date]").forEach((el) => {
    el.textContent = new Intl.DateTimeFormat("en-US", { day: "2-digit", month: "short", year: "numeric" }).format(new Date()).toUpperCase();
  });
  const clocks = $$("[data-clock]");
  if (clocks.length) {
    const tick = () => clocks.forEach((c) => (c.textContent = clock(c.dataset.clock, "clockShort" in c.dataset)));
    tick();
    setInterval(tick, 1000);
  }

  /* ---- words that only make sense with a mouse get their touch wording ---- */
  if (!hasHover) $$("[data-touch]").forEach((el) => (el.textContent = el.dataset.touch));

  /* ---- reading progress + the quote line in the navigation ---- */
  const bar = $(".progress i");
  const cover = $(".cover, .casehero");
  let queued = false;
  const onScroll = () => {
    queued = false;
    const y = window.scrollY;
    const room = document.documentElement.scrollHeight - window.innerHeight;
    if (bar) bar.style.transform = `scaleX(${room > 0 ? Math.min(1, y / room) : 0})`;
    const line = cover ? cover.offsetTop + cover.offsetHeight * 0.55 : 200;
    document.body.classList.toggle("is-scrolled", y > line);
  };
  window.addEventListener("scroll", () => { if (!queued) { queued = true; requestAnimationFrame(onScroll); } }, { passive: true });
  onScroll();

  /* ---- seamless ticker ---- */
  $$("[data-ticker]").forEach((t) => (t.innerHTML += t.innerHTML));

  /* ---- page to page. Browsers with cross-document view transitions do the cross-fade
          themselves (see @view-transition in the stylesheet); the rest get a short fade out. ---- */
  const nativeFade = "CSSViewTransitionRule" in window;
  const leave = (href) => {
    if (reduced || nativeFade) { location.href = href; return; }
    document.body.classList.add("is-leaving");
    setTimeout(() => (location.href = href), 240);
  };
  $$("a[data-nav]").forEach((a) => {
    a.addEventListener("click", (e) => {
      if (e.metaKey || e.ctrlKey || e.shiftKey || e.altKey || e.button) return;
      const url = new URL(a.href, location.href);
      if (url.pathname === location.pathname && url.hash) return;
      if (reduced || nativeFade) return;
      e.preventDefault();
      leave(a.href);
    });
  });
  window.addEventListener("pageshow", (e) => {
    if (e.persisted) document.body.classList.remove("is-leaving");
  });

  /* ---- row links (coverage table) — mouse + keyboard ---- */
  $$("[data-href]").forEach((row) => {
    row.setAttribute("role", "link");
    row.addEventListener("click", () => leave(row.dataset.href));
    row.addEventListener("keydown", (e) => {
      if (e.key === "Enter" || e.key === " ") { e.preventDefault(); leave(row.dataset.href); }
    });
  });

  /* ---- reveals. Things that come into view together follow one another (--i);
          the rows of a table follow one another (--r). ---- */
  $$(".tablewrap.reveal tbody tr").forEach((tr) => {
    tr.style.setProperty("--r", Array.prototype.indexOf.call(tr.parentNode.children, tr));
  });
  const io = new IntersectionObserver(
    (entries) => {
      const arriving = entries.filter((e) => e.isIntersecting).sort((a, b) => a.boundingClientRect.top - b.boundingClientRect.top || a.boundingClientRect.left - b.boundingClientRect.left);
      arriving.forEach((e, i) => {
        e.target.style.setProperty("--i", Math.min(i, 6));
        e.target.classList.add("is-in");
        io.unobserve(e.target);
      });
    },
    { threshold: 0.08, rootMargin: "0px 0px -6% 0px" }
  );
  $$(".reveal").forEach((el) => io.observe(el));

  /* ---- counters (a target written with decimals, like 3.93, counts up with them) ---- */
  const runCount = (el) => {
    const target = parseFloat(el.dataset.count);
    const places = (el.dataset.count.split(".")[1] || "").length;
    const fmt = (n) => n.toLocaleString("en-US", { minimumFractionDigits: places, maximumFractionDigits: places });
    if (reduced) { el.textContent = fmt(target); return; }
    const wait = parseFloat(el.dataset.wait || 0) * 1000;
    const dur = 1400;
    let t0;
    el.textContent = fmt(0);
    const step = (t) => {
      if (t0 === undefined) t0 = t + wait;
      const p = Math.max(0, Math.min((t - t0) / dur, 1));
      el.textContent = fmt((1 - Math.pow(1 - p, 4)) * target);
      if (p < 1) requestAnimationFrame(step);
    };
    requestAnimationFrame(step);
  };
  const cio = new IntersectionObserver(
    (entries) => {
      for (const e of entries) {
        if (e.isIntersecting) { runCount(e.target); cio.unobserve(e.target); }
      }
    },
    { threshold: 0.6 }
  );
  $$(".count").forEach((el) => cio.observe(el));

  /* ---- a light that follows the pointer across the dark cards (mouse only) ---- */
  if (hasHover) {
    $$(".case-card").forEach((card) => {
      card.addEventListener("pointermove", (e) => {
        const r = card.getBoundingClientRect();
        card.style.setProperty("--mx", `${e.clientX - r.left}px`);
        card.style.setProperty("--my", `${e.clientY - r.top}px`);
      });
    });
  }

  /* ---- copy the address: the button says so, then goes back ---- */
  $$("[data-copy]").forEach((btn) => {
    const label = btn.textContent;
    btn.addEventListener("click", async () => {
      try {
        await navigator.clipboard.writeText(btn.dataset.copy);
        btn.textContent = "Copied ✓";
      } catch (err) {
        btn.textContent = btn.dataset.copy;
      }
      setTimeout(() => (btn.textContent = label), 1800);
    });
  });

  /* ---- exhibits: a click opens the document in a viewer on the page.
          The link itself points at the PDF, so it still works with no script,
          and a modified click (new tab, new window) is left alone. ---- */
  $$("[data-exhibit]").forEach((link) => {
    const box = document.getElementById(link.dataset.exhibit);
    if (!box || typeof box.showModal !== "function") return;
    link.addEventListener("click", (e) => {
      if (e.metaKey || e.ctrlKey || e.shiftKey || e.altKey || e.button) return;
      e.preventDefault();
      box.showModal();
    });
    box.addEventListener("click", (e) => {
      if (e.target === box || e.target.closest("[data-close]")) box.close();
    });
  });

  /* ---- the name on the cover is set as wide as the screen allows: one line on a wide screen,
          two on a phone. The size comes from measuring the letters, so it holds for any name. ---- */
  const fits = $$("[data-fit]");
  const fit = () => {
    fits.forEach((h) => {
      const lines = $$(".line > span", h);
      if (!lines.length) return;
      const wide = window.matchMedia("(min-width: 1021px)").matches;
      h.style.fontSize = "100px";
      const widths = lines.map((l) => l.getBoundingClientRect().width);
      const need = wide ? widths.reduce((a, b) => a + b, 0) + 20 * (lines.length - 1) : Math.max(...widths);
      const room = h.clientWidth;
      // never taller than the screen can spare: the buttons under it must stay in the first screen
      const cap = wide ? window.innerHeight * 0.24 : window.innerHeight * 0.138;
      h.style.fontSize = Math.min((98.5 * room) / need, cap).toFixed(1) + "px";   // a hair under, so rounding never wraps it
    });
    window.dispatchEvent(new Event("nm:fit"));
  };
  if (fits.length) {
    fit();
    if (document.fonts && document.fonts.ready) document.fonts.ready.then(fit);
    let w = window.innerWidth, t;
    window.addEventListener("resize", () => {
      if (window.innerWidth === w) return;       // a phone's address bar hiding is not a resize
      w = window.innerWidth;
      clearTimeout(t);
      t = setTimeout(fit, 120);
    });
  }

  /* ---- the thesis: the argument at eye level is lit, the others wait ---- */
  $$(".theses").forEach((list) => {
    const items = $$("li", list);
    const eye = new IntersectionObserver((entries) => {
      entries.forEach((e) => {
        if (!e.isIntersecting) return;
        list.classList.add("is-live");
        items.forEach((li) => li.classList.toggle("is-now", li === e.target));
      });
    }, { rootMargin: "-44% 0px -44% 0px" });
    items.forEach((li) => eye.observe(li));
    new IntersectionObserver((entries) => {
      if (!entries[0].isIntersecting) list.classList.remove("is-live");
    }).observe(list);
  });

  /* ---- the command line: "/" or ⌘K, type a ticker, Enter. Keyboards only. ---- */
  const cmd = $("#cmd"), cmdIn = $("#cmd-in"), cmdList = $("#cmd-list");
  if (cmd && cmdIn && cmdList && typeof cmd.showModal === "function") {
    const ROUTES = [
      ["HOME", "Overview: the cover and the thesis", "index.html"],
      ["COV", "Coverage universe: all five cases", "work.html"],
      ["HOPE", "NM-01 · Hope's Assistant", "hope.html"],
      ["DMALL", "NM-02 · Design-Mall", "designmall.html"],
      ["SGNL", "NM-03 · Market Signals Toolkit", "signals.html"],
      ["BRDG", "NM-04 · The Education Bridge", "bridge.html"],
      ["PRMT", "NM-05 · Prometheus Trading", "prometheus.html"],
      ["PROF", "Profile and fundamentals", "profile.html"],
      ["CERT", "Exhibit A · the Bulenox certificate", "profile.html#exhibits"],
      ["MAIL", "Write to Nabil", "mailto:mouzounn1@gmail.com"],
    ];
    let shown = [], at = 0;
    const draw = () => {
      const q = cmdIn.value.trim().toUpperCase();
      shown = ROUTES.filter(([code, name]) => !q || code.includes(q) || name.toUpperCase().includes(q));
      at = Math.min(at, Math.max(0, shown.length - 1));
      cmdList.textContent = "";
      if (!shown.length) {
        const none = document.createElement("li");
        none.className = "cmd__none";
        none.textContent = "NOTHING ON FILE UNDER THAT NAME";
        cmdList.appendChild(none);
        return;
      }
      shown.forEach(([code, name], i) => {
        const li = document.createElement("li");
        li.setAttribute("role", "option");
        li.setAttribute("aria-selected", i === at);
        const b = document.createElement("b"); b.textContent = code;
        const s = document.createElement("span"); s.textContent = name;
        const k = document.createElement("i"); k.textContent = "GO ↵";
        li.append(b, s, k);
        li.addEventListener("click", () => go(i));
        li.addEventListener("mousemove", () => { if (at !== i) { at = i; draw(); } });
        cmdList.appendChild(li);
      });
    };
    const go = (i) => {
      const row = shown[i];
      if (!row) return;
      cmd.close();
      if (row[2].startsWith("mailto:")) location.href = row[2]; else leave(row[2]);
    };
    const open = () => { if (cmd.open) return; cmdIn.value = ""; at = 0; draw(); cmd.showModal(); cmdIn.focus(); };
    $$("[data-cmd-open]").forEach((b) => b.addEventListener("click", open));
    document.addEventListener("keydown", (e) => {
      const typing = /^(INPUT|TEXTAREA|SELECT)$/.test(document.activeElement.tagName);
      if ((e.key === "/" && !typing && !e.metaKey && !e.ctrlKey) || (e.key.toLowerCase() === "k" && (e.metaKey || e.ctrlKey))) {
        e.preventDefault();
        open();
      }
    });
    cmdIn.addEventListener("input", () => { at = 0; draw(); });
    cmdIn.addEventListener("keydown", (e) => {
      if (e.key === "ArrowDown") { e.preventDefault(); at = Math.min(at + 1, shown.length - 1); draw(); }
      else if (e.key === "ArrowUp") { e.preventDefault(); at = Math.max(at - 1, 0); draw(); }
      else if (e.key === "Enter") { e.preventDefault(); go(at); }
    });
    cmd.addEventListener("click", (e) => { if (e.target === cmd) cmd.close(); });
  }

  /* ---- arriving on a link to a section (profile.html#exhibits): once everything has
          loaded and taken its size, make sure the section is really where the page stopped ---- */
  if (location.hash.length > 1) {
    window.addEventListener("load", () => {
      const target = document.getElementById(decodeURIComponent(location.hash.slice(1)));
      if (target) target.scrollIntoView({ block: "start", behavior: "instant" });
    });
  }

  /* ---- year ---- */
  $$("[data-year]").forEach((el) => (el.textContent = new Date().getFullYear()));
})();
