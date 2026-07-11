/* NM · Equity Research — shared interactions */
(() => {
  const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  const $ = (s, c) => (c || document).querySelector(s);
  const $$ = (s, c) => Array.from((c || document).querySelectorAll(s));

  /* ---- report date + tri-city clocks (bridge page) ---- */
  const fmtClock = (tz) =>
    new Intl.DateTimeFormat("en-US", { hour: "2-digit", minute: "2-digit", second: "2-digit", hour12: false, timeZone: tz }).format(new Date());
  const stampDate = $("[data-date]");
  if (stampDate) {
    stampDate.textContent = new Intl.DateTimeFormat("en-US", { day: "2-digit", month: "short", year: "numeric" }).format(new Date()).toUpperCase();
  }
  const cityClocks = $$("[data-clock]");
  if (cityClocks.length) {
    const tickClocks = () => cityClocks.forEach((c) => (c.textContent = fmtClock(c.dataset.clock)));
    tickClocks();
    setInterval(tickClocks, 1000);
  }

  /* ---- mobile menu ---- */
  const burger = $("#burger");
  const menu = $("#menu");
  if (burger && menu) {
    burger.addEventListener("click", () => {
      const open = menu.classList.toggle("is-open");
      burger.classList.toggle("is-open", open);
      burger.setAttribute("aria-expanded", open);
      burger.setAttribute("aria-label", open ? "Close menu" : "Open menu");
      menu.setAttribute("aria-hidden", !open);
      document.body.style.overflow = open ? "hidden" : "";
    });
  }

  /* ---- seamless ticker ---- */
  $$("[data-ticker]").forEach((t) => (t.innerHTML += t.innerHTML));

  /* ---- page transitions ---- */
  if (!reduced) {
    $$("a[data-nav]").forEach((a) => {
      a.addEventListener("click", (e) => {
        const url = new URL(a.href, location.href);
        if (url.pathname === location.pathname && url.hash) return;
        e.preventDefault();
        document.body.classList.add("is-leaving");
        setTimeout(() => (location.href = a.href), 260);
      });
    });
    window.addEventListener("pageshow", (e) => {
      if (e.persisted) document.body.classList.remove("is-leaving");
    });
  }

  /* ---- row links (coverage table) — mouse + keyboard ---- */
  $$("[data-href]").forEach((row) => {
    const go = () => {
      if (reduced) { location.href = row.dataset.href; return; }
      document.body.classList.add("is-leaving");
      setTimeout(() => (location.href = row.dataset.href), 260);
    };
    row.setAttribute("role", "link");
    row.addEventListener("click", go);
    row.addEventListener("keydown", (e) => {
      if (e.key === "Enter" || e.key === " ") { e.preventDefault(); go(); }
    });
  });

  /* ---- scroll reveals ---- */
  const io = new IntersectionObserver(
    (entries) => {
      for (const e of entries) {
        if (e.isIntersecting) { e.target.classList.add("is-in"); io.unobserve(e.target); }
      }
    },
    { threshold: 0.1, rootMargin: "0px 0px -5% 0px" }
  );
  $$(".reveal").forEach((el) => io.observe(el));

  /* ---- counters ---- */
  const fmt = (n) => n.toLocaleString("en-US");
  const runCount = (el) => {
    const target = parseInt(el.dataset.count, 10);
    if (reduced) { el.textContent = fmt(target); return; }
    const t0 = performance.now();
    const dur = 1300;
    const step = (t) => {
      const p = Math.min((t - t0) / dur, 1);
      el.textContent = fmt(Math.round((1 - Math.pow(1 - p, 3)) * target));
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

  /* ---- year ---- */
  $$("[data-year]").forEach((el) => (el.textContent = new Date().getFullYear()));
})();
