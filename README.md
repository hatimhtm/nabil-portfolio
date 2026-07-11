# NM · Equity Research — the portfolio of Nabil Mouzoun

Seven-page personal site with one governing concept: **an equity-research report that
initiates coverage on Nabil himself.** Rating box (STRONG HIRE), key-data table, numbered
investment thesis, catalysts, a coverage universe of four case studies with their own pages,
and a fundamentals/profile page. Business-finance identity is the design language itself.

## Pages

| P. | File | Contents |
|---|---|---|
| 1 | `index.html` | Report cover, rating box, milestone chart (interactive), thesis, catalysts, coverage index |
| 2 | `work.html` | Case index table (clickable rows) + what-the-book-proves cards |
| 3 | `hope.html` | NM-01 Hope's Assistant — flow diagram, before/after step strip, guardrails, honest credit |
| 4 | `designmall.html` | NM-02 Design-Mall — venture funnel, founder-lessons table |
| 5 | `signals.html` | NM-03 Signals Toolkit — **live SMA crossover chart** (hover crosshair + tooltip), code block |
| 6 | `bridge.html` | NM-04 Education Bridge — live tri-city clocks (Casablanca/NY/Beijing) |
| 7 | `profile.html` | Education gantt chart, experience ledger, skills table, languages, governance |

## Design system

IBM Plex superfamily (Serif display / Sans text / Mono data) · warm paper + ink navy +
market green/red · ruled report tables · dark terminal chart panels · live ET clock in the
masthead · ticker tape · page numbers and tongue-in-cheek disclosures.

**Charts are hand-rolled SVG in `charts.js` (no libraries), palettes validated for
colorblind separation and contrast** (dataviz skill validator):
dark panel `#5b8def/#bd8a2e/#b4635b` + `#19b57a`; light `#3563b8/#0e7a57/#b4552d`.
All line charts have crosshair + tooltip hover; the signals series is deterministic
(seeded) and labeled "synthetic — not market data."

## Extras

- **Social cards**: `assets/og.png` (1200×630) is wired into every page's og:/twitter: meta.
  After deploy, optionally change the `content="/assets/og.png"` paths to the absolute
  `https://…` URL for maximum scraper compatibility.
- **Print**: every page carries a print stylesheet — File → Print yields a clean paper
  research report (nav/ticker stripped, chart panels color-forced, smart page breaks).
- **SEO**: JSON-LD Person schema on index.html; `.vercelignore` keeps README off the deploy.

## Run / deploy

Zero dependencies. `python3 -m http.server 8000` or open `index.html`.
Deploy: GitHub → Vercel (preset **Other**, no build, output `.`) → point `nabilmouzoun.com`.
`cleanUrls` is intentionally **false** — all internal links use `.html`, so navigation works
identically on Vercel and when opened straight from disk, with zero redirects.

## Gotchas

- Grid columns must stay `minmax(0, …)` — plain `1fr` lets `<pre>`/charts force overflow.
- No `background-attachment: fixed` — breaks painting in some renderers.
- Chart draw-in has a 5s failsafe so lines never stay hidden if IntersectionObserver misses.
- `.nav` z-index (96) must stay ABOVE `.menu` (95) or the burger can't close the mobile menu.
- Charts read `(max-width: 700px)` at build time and render a 420-unit viewBox with
  left-anchored labels on mobile — keep that branch when editing chart code.
- Audited by two independent agents (design + logic) on 2026-07-11; all HIGH/MED findings fixed.
