# NM · Equity Research — the portfolio of Nabil Mouzoun

Eight-page personal site (plus a 404 page) with one governing concept: **an equity-research report that
initiates coverage on Nabil himself.** Rating box (STRONG HIRE), key-data table, numbered
investment thesis, catalysts, a coverage universe of five case studies with their own pages,
and a fundamentals/profile page that ends in the documents on file. Business-finance identity is the design language itself.

## Pages

| P. | File | Contents |
|---|---|---|
| 1 | `index.html` | Report cover, rating box, milestone chart (interactive), thesis, catalysts, coverage index |
| 2 | `work.html` | Case index table (clickable rows) + what-the-book-proves cards |
| 3 | `hope.html` | NM-01 Hope's Assistant — flow diagram, before/after step strip, guardrails, honest credit |
| 4 | `designmall.html` | NM-02 Design-Mall — venture funnel, founder-lessons table |
| 5 | `signals.html` | NM-03 Signals Toolkit — **live SMA crossover chart** (hover crosshair + tooltip), code block |
| 6 | `bridge.html` | NM-04 Education Bridge — live tri-city clocks (Casablanca/NY/Beijing) |
| 7 | `prometheus.html` | NM-05 Prometheus Trading — the summer market-research project: workstream table, research flow |
| 8 | `profile.html` | Education gantt chart, experience ledger, skills table, languages, governance, **Exhibits** (certificate viewer) |

## Facts on the site

Every fact follows Nabil's résumé.

- Degree: B.S. Business Administration, concentration in Finance, Mercy University, expected December 2026.
- GPA 3.93 / 4.00 at Mercy. Write it as 3.93.
- Dean's List, four semesters: Al Akhawayn (Fall 2022), Monroe (Spring 2024), Mercy (Fall 2025, Spring 2026).
- Prometheus Trading (Jun–Aug 2026) is shown as a **project** (NM-05), not in the experience ledger.

## Exhibits

`profile.html#exhibits` shows documents on file. Exhibit A is the Bulenox Qualification Program certificate
(`assets/bulenox-qualification-50k.pdf`, with two JPG renders for the page). A click opens it in a viewer
(a native `<dialog>`, wired in `app.js` by `data-exhibit="<dialog id>"`); the link itself points at the PDF,
so it still works with no script, and a ⌘/ctrl-click opens the PDF in a new tab. To add an exhibit: copy the
`.exhibit` block and its `<dialog>`, give the dialog a new id, and point `data-exhibit` at it.

**Assets are cached for a year** (`vercel.json`). A changed picture or PDF needs a NEW file name, or
returning visitors keep the old one.

## v2 (October 2026) — how the site is put together now

**Pages are built, not hand-edited.** Edit `src/` and run `python3 tools/build.py` (standard library only).
- `src/layout.html` — the shell every page shares: head, masthead, navigation, phone tab bar, command line, footer.
- `src/pages/*.html` — one file per page: a few `key: value` lines, a line of `---`, then the page's content.
- The pages in the site root are OUTPUT. A change made straight to them is lost on the next build.
- The build also gives every table cell `data-label="<its column heading>"`: on a phone a table is drawn as
  stacked, labelled rows instead of scrolling sideways.

**Look.** A light page throughout: warm paper, tinted bands, cards in shallow trays. Ink-navy is kept for the
instruments only (a chart and its tape, the ticker, a code window, the verdict stamp, the footer).
IBM Plex Serif / Sans / Mono. Keep the site light, and keep the name in the serif.

**Colour is all tokens** (`--bg --bg2 --bg3 --tx --tx2 --tx3 --line --line2 --up --up-fill`). The navy panels do not
restyle anything: one rule ("THE NAVY PANELS" in `styles.css`) re-points the same tokens, so a card, a table or a
chart reads correctly on either surface. `charts.js` reads those tokens where each chart sits (`tokens()`).

**The home page.** The cover is his record as a live chart (`#cover-chart`, built in `charts.js` from the same
list `D` that feeds the milestone chart and the tape), the name set as wide as the screen allows (`data-fit`,
sized in `app.js` from the measured letters), the verdict stamp and four key figures. With a mouse the cover
chart reads out the milestone under the pointer. Then: tearsheet, performance (chart + tape, linked both ways),
thesis (the argument at eye level is lit), catalysts, coverage cards (each with a small drawing), about, call to action.

**Wording.** The copy is written in plain language: no em dashes, no slogans or pull-quotes, and a person as the
subject of each sentence. `python3 tools/copy_dump.py [page.html ...]` prints every piece of wording, one line
each, to review a change. The only document shown on the site is the Bulenox certificate (Exhibit A), which sits
right under "Who this is" on the profile page.

**The portrait** (`assets/nabil-portrait-light*.jpg`) is a studio photo set on a warm light ground. To change it,
save the new picture under a NEW file name (assets are cached for a year) and update the two `<img>` tags in
`src/pages/index.html` and `src/pages/profile.html`.

**Phone first.** A fixed tab bar replaces the menu; the cover fits one screen down to 360 × 700; tables stack;
nothing scrolls sideways. Check at 400×800, 360×700 and 390×664 with a mobile user agent before desktop.

**Motion** (all `transform` / `opacity`, all off under `prefers-reduced-motion`; nothing is hidden without JS):
the cover plays once on arrival; section titles rise out of a mask and their rule draws; table rows and cards
follow one another; counters run; charts draw; pages cross-fade (cross-document view transitions, JS fade elsewhere).

**Keyboard.** `/` or ⌘K opens a command line: type a ticker (HOPE, DMALL, SGNL, BRDG, PRMT, CERT…) and press Enter.

## Run / deploy

`python3 tools/build.py`, then `python3 -m http.server 8000`.
Live at **https://nabil-portfolio-lemon.vercel.app** (Vercel builds from `main` on GitHub: preset **Other**,
no build step on Vercel, output `.`; `src/` and `tools/` are in `.vercelignore`). `nabil-portfolio.vercel.app`
belongs to someone else. `nabilmouzoun.com` is not connected yet.
`cleanUrls` is intentionally **false** — all internal links use `.html`.

## Gotchas

- Grid columns must stay `minmax(0, …)` — plain `1fr` lets `<pre>`/charts force overflow.
- No `background-attachment: fixed` — breaks painting in some renderers.
- Chart draw-in has a 5s failsafe so lines never stay hidden if IntersectionObserver misses.
- Charts read `(max-width: 760px)` when they are built and draw a 420-unit viewBox with left-anchored labels on
  phones. Each chart container reserves its shape in CSS (`aspect-ratio`), so nothing below it jumps.
- A full-page screenshot taller than 16384 device pixels comes back with its top repeated: photograph in pieces.
- Audited by two independent agents (design + logic) on 2026-07-11; all HIGH/MED findings fixed.
- Table cells with a period or a place carry `num` / `nw` so they stay on one line; tables scroll sideways on phones.
- The milestone chart's four direct labels sit to the LEFT of their points (the line climbs to the right).
- In the education chart a label that would run past the right edge is anchored to that edge instead.
