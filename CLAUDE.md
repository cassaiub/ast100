# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## What this is

**AST 100 — Our Cosmic History** is the interactive lecture site for an undergraduate astronomy course at IUB. It is an **Astro 6 + React 19 + Tailwind 4** static site whose defining feature is a set of scientifically-grounded, fullscreen-ready, keyboard-operable interactive figures.

- **Live at** `cassa.site/courses/ast100`. Pushing to `main` triggers `.github/workflows/deploy.yml`, which runs `npm ci && npm run build` and rsyncs `dist/` to Bluehost. **There is no staging — a push to `main` is a live deploy.** Don't push without an explicit request.
- **Content state:** chapters **0 and 1 are fully live** (and are both the gold-standard reference); chapters **2–7 are placeholders** (`live: false` / `overviewLive: false` in `src/data/course-nav.ts`).

## Commands

```bash
npm run dev       # Astro dev server (default http://localhost:4321/courses/ast100)
npm run build     # static build → dist/
npm run preview   # serve the built dist/ (http://localhost:4321/courses/ast100)
```

- Requires **Node ≥ 22.12** (`package.json` engines; CI uses Node 22).
- **No test or lint scripts exist.** Verification is manual: `npm run build && npm run preview`, then walk the page at all three sizes (default, fullscreen, mobile ~360px), both themes, and `prefers-reduced-motion`. `tsconfig.json` extends `astro/tsconfigs/strict`.
- The site is served under a base path (`base: '/courses/ast100'` in `astro.config.mjs`, `trailingSlash: 'never'`). **Never hard-code `/...` URLs** — use the helpers in `course-nav.ts` (below).

## Authoring workflow — use the skills

Lessons are authored through two project skills in `.claude/skills/` (the user invokes them frequently). They encode the current, authoritative conventions and stay active for the whole session:

- **`/ast100-create N.M`** — create a new lesson (`N.M`) or chapter overview (`N.0`) from the canonical scraped source.
- **`/ast100-edit ...`** — edit/tweak/fix an existing lesson, figure, prose block, component, or data file without regressing site-wide conventions.

`LECTURE-AUTHORING.md` (repo root) is the deep convention reference, but the `SKILL.md` files are primary where they diverge. Note: `LECTURE-AUTHORING.md` and `README.md` predate the MDX removal — **ignore any mention of MDX or a `src/content/` collection; neither exists.**

## Architecture / mental model

**Static, no MDX, single-file lessons.** Every lesson is one self-contained `.astro` file under `src/pages/chapter/N/N.M.astro` with all prose, headings, and figure wiring inline. No content collection, no SSR.

### Routing & the three layouts

| Route | File | Layout | What it is |
|-------|------|--------|------------|
| `/chapter/N` | `src/pages/chapter/[num]/index.astro` (dynamic, `getStaticPaths` over `CHAPTERS`) | `Layout.astro` | No-prose chapter **cover** — a 5-card deck: a wide N.0 lead card + a 2×2 grid of lesson sub-cards. Card titles/teases come from `course-nav.ts`. |
| `/chapter/N/N.0` | `src/pages/chapter/N/N.0.astro` | `ChapterOverviewLayout.astro` | Cinematic chapter **overview lesson** — adds the `mood-arc` scrolling backdrop (cool→warm tint) plus React islands (`ReadingProgress`, `MobileNav`). |
| `/chapter/N/N.M` | `src/pages/chapter/N/N.M.astro` | `ChapterLayout.astro` | Individual **lesson** — left-rail scroll-spy (`Rail.astro`), starfield, reading progress. |

`Layout.astro` is the root shell (top `SiteNav`, starfield, `BaseHead`) used by home (`/`), the chapter covers, and standalone pages (`timeline`, `mid`, `fin`). Lesson pages pass `current="/chapter/N/N.M"` (logical, un-based) so `SiteNav` highlights correctly.

### `src/data/course-nav.ts` is the single source of truth

This file drives every link, nav state, "coming soon" flag, rail section, and chapter-cover card. **Edit it whenever you add or ship a lesson.**

- `CHAPTERS[]` — per chapter: `num`, `age`, `title`, `telescope`, `weeks`, `overviewLive`, optional `description` (~100 words, shown under the cover title), optional `overviewTease` (~50 words, the N.0 lead card), and `subs[]`.
- `subs[]` — per lesson: `id`, `title`, `live` (flips "coming soon" → clickable), optional `tease` (~50 words, **the lesson's card on the `/chapter/N` cover**).
- `RAIL_ANCHORS["N.M"]` — `{id, label}[]` of section anchors; the page's `<h2 id="...">` must match these for scroll-spy.
- **Helpers (always use, never hand-build URLs):** `withBase()`, `chapterPath(n)`, `subPath("N.M")`, `overviewPath(n)`, `findChapter(n)`, `getRailItems(n)`.

> The **lesson Hero tease** is a *separate* literal string passed inline on the page (`<Hero tease="…" client:load />`), not read from `course-nav.ts`. The `subs[].tease` field feeds the chapter-cover card and mobile nav. They're often the same words but are maintained independently — keep them consistent by hand.

### Client runtime scripts (`src/scripts/`, plain TS, no framework)

- `chapter-runtime.ts` (loaded by `ChapterLayout`) — auto-tags `.lesson-prose` children with `[data-fade]` and adds `.dropcap` to the first paragraph of each section, then boots the fade-up IntersectionObserver, reading-progress bar, and desktop smooth-scroll. So lesson prose needs **no per-element animation/typography classes** — it's applied at runtime.
- `chapter0-runtime.ts` — fade-up only (overview pages).
- `mood-arc.ts` — drives the cool→warm backdrop tint on overview pages from scroll position.

### Design system (`src/styles/global.css`, Tailwind v4 CSS-first)

- **No `tailwind.config.js`** — tokens live in an `@theme` block: a `--color-*` palette (`void`, `plasma`, `solar`, `nebula`) plus `--c-*-rgb` raw triples for `rgb(var(--c-…) / α)` alpha blending.
- **Theme:** `data-theme="dark|light"` on `<html>`, set pre-paint by an anti-flash inline script in `BaseHead.astro`; all tokens flip in CSS.
- Mix of utilities and named classes (`.prose-cosmic`, `.lesson-prose`, `.dropcap`, `.surface-card`, the `.figure-frame.is-fs` fullscreen choreography). **Every animation needs a `prefers-reduced-motion` fallback.**
- **Prose column stays horizontally centred** (`.prose-cosmic` is `mx-auto`); long-form body text is left-aligned within it — never `text-align: center` on body paragraphs.

## The interactive-figure system (the non-obvious core)

Figures are two layers:

1. **`FigureFrame.astro`** (`src/components/shared/`) — a shared wrapper that is also a **global keyboard/mouse navigator** via one delegated event listener (≈ lines 53–377). Any wrapped figure gets, for free:
   - **Keyboard, always (normal + fullscreen):** `←`/`→` step one notch (`Shift` = ×10); `Esc` exits fullscreen; single-char keys trigger buttons tagged `data-shortcut="r"` etc.
   - **Wheel / trackpad pinch, fullscreen only (by design):** scroll-up = step right (50px threshold); in normal flow the wheel scrolls the page.
   - **Double-click the frame chrome → fullscreen** (clicks on `.fig-viz`, inputs, buttons, captions pass through).
   - **Resolution order** for `←`/`→` and wheel (first match wins): (1) a button `data-shortcut="ArrowLeft"`/`"ArrowRight"`; (2) the first `<input type="range">`; (3) a numeric pill set (`data-shortcut="1"`, `"2"`, … with the active one marked `.is-active` / `aria-selected` / `aria-pressed`). **Don't reimplement navigation — just tag the right elements.**

2. **Scene components** in `src/components/scenes/N.M/` — `Hero.tsx` (accepts `tease`), `figures.tsx` (exports the React figure panels via a local `FigurePanel` helper), `PrevNext.astro`, plus any lesson-specific pieces (e.g. `SpacetimeFabric.tsx`, `EqPullQuote.astro`). Figures hydrate with `client:visible`; Hero with `client:load`.

**Figure DOM contract (copy `FigurePanel`, don't reinvent):** `<figure class="figure-stub"> → <div class="figure-body"> → content + <figcaption>`. The `.fig-viz` holds the visualization and flex-grows in fullscreen; controls/detail boxes are **siblings inside `.figure-body`, never inside `.fig-viz`** (so fullscreen looks like an enlarged normal view, not a reflow). **Never target `.figure-stub` with `:first-child`** — `client:visible` injects a hydration `<script>` as the first child, which would render as visible garbage.

Figures use **three.js / @react-three/fiber** (3D, e.g. lesson 0.4), **framer-motion**, and **katex**. Don't add new dependencies without asking.

### Figure & content non-negotiables

- **Scientific accuracy first.** Real units (γ, erg/g/s, Mpc, Gyr, M☉ — never invented "scores"), real literature values, a visible historical anchor (year/experiment/discoverer) where relevant, cosmology consistent with `src/data/chapter-N-events.ts`. No AI-generated images — replace concept art with bespoke interactives; real photos and data plots are fine. No decorative-only motion.
- **Fullscreen-ready & responsive.** Must lay out (not merely scale) at default breakout, fullscreen (100vw×100vh), and mobile portrait. Use SVG `viewBox`+`preserveAspectRatio` or canvas + `ResizeObserver`.
- **Keyboard always + mouse/trackpad in fullscreen** — via the `FigureFrame` tagging above.

## Math rendering

`BaseHead.astro` imports KaTeX `auto-render` and runs `renderMathInElement(document.body)` on DOM-ready plus delayed passes (600/1800/3500 ms) so math inside lazily-hydrated React islands also typesets (idempotent — `.katex` nodes are skipped). Delimiters: `$…$`, `$$…$$`, `\(…\)`, `\[…\]`.

- **In prose**, `$…$` / `$$…$$` work anywhere on the page.
- **Inside TSX figures**, prefer **Unicode glyphs** (γ, ², ⁻¹, √, π, M☉, …) for short expressions and `katex.renderToString(latex, {throwOnError:false})` + `dangerouslySetInnerHTML` for longer formulas. Never raw `a^b` or `x_2`.

## Read these first when working on a lesson

- `src/pages/chapter/0/0.1.astro` — canonical lesson page (prose + `FigureFrame` wiring + inline Hero tease).
- `src/components/scenes/0.1/figures.tsx` — the `FigurePanel` helper and slider/pill figure patterns.
- `src/components/scenes/0.4/figures.tsx` — most complex (3D canvas, spectrum scrubber, fullscreen detail boxes).
- `src/pages/chapter/0/0.0.astro` — chapter-overview lesson pattern.

## Content source

`knowledgebase/2026-spring/` is **reference only, never deployed**: `raw_html/pN_M.html` (lesson scrapes) and `chN.html` (overview scrapes) are the canonical source content the create skill ports from; `media/` holds figures/photos. Data files such as `knowledgebase/claudemds/cosmic_distances.md` back the timelines in `src/data/chapter-N-events.ts`. The knowledgebase has its own separate design system — don't mix it into the Astro site.
