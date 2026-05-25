# AST 100 — Lecture Authoring (Supervisor's Guide)

Read this before adding a new chapter or lesson. It captures the visual
and content conventions that already shaped chapters 0 and 1. Following
them keeps the site coherent as we extend to chapters 2–7.

Companions: the `/ast100-create` and `/ast100-edit` skills in
`.claude/skills/` drive the create and edit workflows automatically,
referring back to this doc for the deep rules.

---

## 0. TL;DR

- This is an Astro 6 + React 19 + Tailwind 4 + MDX static site.
- Currently **live: chapters 0 and 1.** Chapters 2–7 still to author.
- Page output is in `dist/`; the GitHub Action rsyncs it to Bluehost at
  `cassa.site/courses/ast100/` on every push to `main`.
- Source content for each lesson is already scraped verbatim in
  `knowledgebase/2026-spring/raw_html/pN_M.html` (subpages) and
  `knowledgebase/2026-spring/raw_html/chN.html` (chapter overviews).
- Every interactive figure goes through the shared
  `src/components/shared/FigureFrame.astro` (centred breakout +
  fullscreen toggle).
- Every lesson page ends with `PrevNext` (not a bespoke footer).
- **Never use AI-generated images.** Replace concept illustrations with
  small bespoke interactives. Real photos and data plots are OK.

---

## 1. Repository shape (what's where)

```
ast100/
├── src/
│   ├── pages/chapter/N/N.M.astro     ← lesson page
│   ├── pages/chapter/N/N.0.astro     ← chapter overview page
│   ├── content/chapter/N.M_*.mdx     ← content collection (schema)
│   ├── components/scenes/N.M/        ← Hero, figures, PrevNext
│   ├── components/shared/            ← FigureFrame, SiteNav, ...
│   ├── data/course-nav.ts            ← chapter/sub registry + helpers
│   ├── data/chapter-N-*.ts           ← per-chapter timeline/event data
│   ├── layouts/                      ← ChapterLayout, Layout, ...
│   └── styles/global.css             ← design tokens (@theme) + custom
├── knowledgebase/2026-spring/        ← scraped source content + media
│   ├── raw_html/pN_M.html            ← per-subpage raw scrape
│   ├── raw_html/chN.html             ← per-chapter raw scrape
│   ├── media/                        ← all figure assets
│   └── SPEC.md                       ← parallel plain-HTML spec
├── .github/workflows/deploy.yml      ← CI: build + rsync to Bluehost
└── .claude/skills/                  ← the authoring skills
    ├── ast100-create/                  for new lessons
    └── ast100-edit/                    for tweaking existing
```

The Astro `src/` and the static `knowledgebase/` are **two separate
build targets.** `src/` produces the polished interactive site at
`cassa.site/courses/ast100`. `knowledgebase/` is the verbatim plain-HTML
fallback site (separate URL, separate spec — see
`knowledgebase/2026-spring/SPEC.md`). They share the same source content
but render it very differently. Don't mix the two design systems.

---

## 2. Lesson page anatomy

This is the structure every lesson page follows. Copy the template;
swap Hero, figure panels, and the rail anchors.

```astro
---
import ChapterLayout from "../../../layouts/ChapterLayout.astro";
import Hero from "../../../components/scenes/N.M/Hero";
import { PanelA, PanelB } from "../../../components/scenes/N.M/figures";
import FigureFrame from "../../../components/shared/FigureFrame.astro";
import PrevNext from "../../../components/scenes/N.M/PrevNext.astro";
import { findSub } from "../../../data/course-nav";

const tease = findSub("N.M")?.tease ?? "";
---

<ChapterLayout
  title="N.M Title · AST 100"
  description="one-sentence summary"
  activeId="N.M"
  current="/chapter/N/N.M"
>
  <Hero tease={tease} client:load />

  <article class="topic-page">
    <div class="prose-cosmic">

      <header class="mt-24 mb-10" id="anchor-id">
        <div data-fade class="font-mono text-[11px] tracking-[0.28em] uppercase text-plasma/80 mb-3 flex items-center gap-3">
          <span class="block w-6 h-px bg-plasma/50"></span> part one
        </div>
        <h2 data-fade style="--delay: 80ms" class="section-title">
          <span class="section-number">1.</span>
          <span class="section-title-text">Section Title</span>
        </h2>
      </header>

      <p data-fade class="dropcap">First sentence with drop cap…</p>
      <p data-fade>More prose…</p>

      <FigureFrame label="Panel A name">
        <PanelA client:visible />
      </FigureFrame>

      <p data-fade>Caption / follow-up prose…</p>

      <!-- repeat sections, typically 3–5 per lesson -->

      <PrevNext />
    </div>
  </article>
</ChapterLayout>
```

**Consistency rules:**
- `ChapterLayout` for lesson pages (provides the left rail nav).
- `ChapterOverviewLayout` for N.0 chapter-overview lesson pages —
  pattern is `src/pages/chapter/0/0.0.astro`. (Chapter 1's
  `1.0.astro` is the previous pattern and is NOT yet migrated to the
  new tease-in-Hero standard — don't copy from it.)
- `Hero` always `client:load` (above the fold, needs immediate
  interactivity). The Hero takes a single `tease: string` prop and
  renders it directly below the H1; the tease text lives in
  `course-nav.ts` (`subs[].tease` for lessons, `Chapter.overviewTease`
  for N.0) and is mirrored on the `/chapter/N` card grid.
- Interactive figures always `client:visible` (hydrate lazily) and
  wrapped in `<FigureFrame>`.
- Prose wrapped in `<div class="prose-cosmic">` (the class already
  sets `max-width: 68ch; margin-inline: auto` — don't duplicate).
- Outer article uses `class="topic-page"` (defined in `global.css`:
  `max-width: 1100px; margin-inline: auto; padding: 0 24px 112px`).
- Section headers carry an `id` that matches `RAIL_ANCHORS["N.M"]` in
  `src/data/course-nav.ts`.
- First paragraph of each section: `class="dropcap"`.
- Footer is always `<PrevNext />`. Never a bespoke chapter footer.
- All non-figure paragraphs share `text-[1.05em] leading-[1.74]`
  typography — Hero tease, chapter description, card teases, and
  lesson body prose. Don't introduce per-tease font sizes.

**The chapter card-grid page (`/chapter/N`)** is the dynamic
`src/pages/chapter/[num]/index.astro`. It reads every chapter from
`CHAPTERS` in `course-nav.ts`. To populate a chapter overview:
1. Set `Chapter.description` (~100 words) — shown directly under H1.
2. Set `Chapter.overviewTease` (~70 words) — the N.0 card text.
3. Set each `SubPage.tease` (~70 words) — the per-lesson card text.
4. Set `live: true` / `overviewLive: true` to mark cards clickable.
The page renders single-column, no "live" badge, no live/total
count. The per-card 70-word teases span the full card content width.

**Gold-standard reference pages:**
- `src/pages/chapter/0/0.1.astro` — the canonical lesson template.
- `src/pages/chapter/0/0.2.astro` — multiple `FigureFrame` examples.
- `src/pages/chapter/0/0.0.astro` — the canonical N.0
  chapter-overview lesson (uses `ChapterOverviewLayout`).
- `src/pages/chapter/[num]/index.astro` — the dynamic
  `/chapter/N` card-grid page.

---

## 3. Content pipeline

```
knowledgebase/2026-spring/raw_html/pN_M.html
        │
        │   strip wiki chrome → extract title, headings, prose,
        │   figure refs, math, tables
        ▼
src/content/chapter/N.M_slug.mdx
  (frontmatter: title, slug, chapter, order, summary, sourceUrl
   body: verbatim prose)
        │
        │   the body text is currently inlined into the page too,
        │   so the prototype's interleaved layout works. Long-term we
        │   plan to refactor toward MDX-with-imports.
        ▼
src/pages/chapter/N/N.M.astro
  (the template from §2 — imports Hero, figures, PrevNext;
   inline body text wraps the figures at the right anchors)
```

**Figure decisions, per source image:**
- Real photograph (telescope image, geographic photo) → port directly
  to `public/images/chapter-N/...` and reference from the prose.
- Scientific data plot (HR diagram, energy-rate-density chart) → port
  directly OR re-implement as a small interactive if a slider/scrubber
  reveals more than a static figure could.
- Concept illustration ("standard model diagram with arrows and labels",
  "tug-of-war between forces") → **replace** with a bespoke interactive
  component in `figures.tsx`. The interactive should teach the actual
  concept: real units, real history, real data where possible.

Examples of bespoke patterns already in the codebase:
- `src/components/scenes/0.1/figures.tsx` — TimeDilation slider (log
  velocity scale spreading γ evenly), LightBending mass slider (refers
  to Eddington 1919 eclipse), SpacetimeFabric drag-mass SVG.
- `src/components/scenes/0.2/figures.tsx` — EnergyRateDensity 9-point
  timeline in erg/g/s citing Chaisson's Φₘ.
- `src/components/scenes/0.4/figures.tsx` — 3D EM-wave canvas, spectrum
  scrubber, Cassegrain telescope anatomy.

---

## 4. Component conventions

### `FigureFrame.astro` (shared)
Wraps any figure or interactive in a wider centred band that breaks out
of the 68ch prose column, with a fullscreen toggle.
- Wrap **every** interactive figure on a lesson page.
- Optional `label` prop is used for the toggle button's aria-label.
- ESC dismisses fullscreen. Single delegated handler covers all frames
  on the page.

### `PrevNext.astro` (per-scene)
Two-link footer (← previous · next →). Reusable.
- Generic pattern: `src/components/scenes/0/PrevNext.astro` (read it).
- Each lesson's scene dir gets its own copy with default `prev` / `next`
  pointing at the adjacent subs.

### `Hero.tsx` (per-scene)
Parallax ghost-number + title at the top of the page, with a 70-word
tease paragraph directly below the H1.
- Default-exported React component.
- Single prop: `tease: string` — rendered as the `<p>` below the H1
  using the canonical class `mt-10 max-w-[64ch] text-[1.05em]
  leading-[1.74] text-white/70` (or `text-white/75`). The Hero MUST
  not hard-code tease text — the page reads it from `course-nav.ts`
  (`findSub(id)?.tease` or `findChapter(N)?.overviewTease`) and
  passes it in.
- Pattern: `src/components/scenes/0.1/Hero.tsx`.

### `figures.tsx` (per-scene)
Named exports of the interactive panel components used on the page.
- Each panel default-exported individually.
- Honour `prefers-reduced-motion` with a static fallback (see existing
  panels for the pattern).
- Prefer SVG and small canvas. No new libraries without justification.

---

## 4½. Figure non-negotiables (for every new chapter)

Three rules govern every interactive figure from chapter 2 onward.
They reflect what was changed between the original prototype and the
current polished version in chapters 0 and 1. **Do not relax them.**

### A. Scientific accuracy is the headline change

The polish round was **not visual** — it was scientific. Every figure
in chapters 0 and 1 was rewired around correct physics; the mechanism
(slider, scrubber, etc.) often stayed the same but the math, units,
and historical anchors changed. Match that standard for new chapters.

Concretely, every figure must:

- Use **real units** — γ for time dilation, erg/g/s for energy-rate
  density, Mpc and Gyr for cosmology, M☉ for stellar mass. Never
  "complexity score" or "speed factor".
- Use **real numbers from the literature**:
  - TimeDilation uses `v/c = 1 − 10^(−4·s)` so γ spreads evenly 1 → 71
    across the slider (instead of crowding the relativistic regime).
  - EnergyRateDensity points come from Chaisson's complexity metric Φₘ.
  - LightBending matches Eddington's 1919 eclipse value at 1 M☉.
- Embed a **real historical anchor** — name the experiment, year,
  discoverer somewhere the user will see (Eddington 1919, Penzias &
  Wilson 1965, COBE → WMAP → Planck). When students hover or focus a
  value, they should see a source-of-truth fact, not a generic label.
- Use **current cosmological consensus** — epoch boundaries match
  `src/data/chapter-N-events.ts`. When in doubt, defer to existing
  polished data.
- Have **no decorative-only motion** — if a curve, arrow, or trail
  doesn't encode information, drop it.

If a value cannot be sourced, flag it to the user before guessing.

### B. Fullscreen-ready (mandatory)

Wrapping in `<FigureFrame>` gives a fullscreen toggle for free, but
the figure inside must work at all sizes:

- Default (figure-frame breakout, ~min(1400px, viewport − 48px))
- Fullscreen (100vw × 100vh) — re-layout, not just scale a small
  canvas
- Mobile portrait (~360 × 640) — controls reachable, no horizontal
  scroll

Use SVG `viewBox` + `preserveAspectRatio`, or canvas with
`ResizeObserver` to redraw at the new container size. Test all three
sizes during the build/preview step.

### C. Keyboard + mouse/trackpad navigation (global, via FigureFrame)

`FigureFrame.astro` ships a **single delegated global navigator** that
gives every wrapped figure ←/→ arrow scrubbing, wheel/pinch scrubbing
in fullscreen, and double-click-to-fullscreen on the panel chrome.
This is the shared standard — don't reimplement it per-figure, just
opt into it by tagging the right elements.

**Three input modes:**

1. **Keyboard (always — normal AND fullscreen).** ←/→ steps the
   figure one notch left/right; Shift = ×10. ESC always exits
   fullscreen. Single-character `data-shortcut="1"`/`"r"`/etc.
   trigger their button.
2. **Mouse / trackpad wheel + pinch (FULLSCREEN ONLY, by design).**
   Wheel-up = step right, wheel-down = step left. Trackpad pinch
   (ctrl+wheel) maps the same way (pinch-out = "zoom in" = step
   right). Shift = ×10. Deltas accumulate per-frame; one step per
   50px of motion (avoids hyperscrubbing on trackpad smooth-scroll).
   In normal in-page view the wheel belongs to the page (scrolls
   through prose past the figure) — no interception.
3. **Double-click in normal view → fullscreen.** Double-clicking the
   panel chrome enters fullscreen for that figure. "Panel chrome" is
   exactly the four structural wrappers FigureFrame guarantees:
   `.figure-frame`, `.figure-frame-inner`, `.figure-stub`,
   `.figure-body`. Clicks on `.fig-viz`, buttons, inputs, links,
   labels, figcaption, draggable handles, or any element with
   `data-shortcut` are NOT treated as empty space and fall through
   to their existing handlers. Text-selection double-clicks (active
   selection present) are also honored and don't trigger fullscreen.
   The dedicated `⛶ Fullscreen` button + ESC remain the primary
   discoverable affordance.

**The three-target resolution order** for ←/→ and wheel:

1. A button with `data-shortcut="ArrowLeft"` / `"ArrowRight"`
   (prev/next pattern).
2. The first enabled `<input type="range">` inside the figure
   (slider nudge — one step per arrow, ×10 with Shift).
3. A numeric pill set — ≥2 buttons with `data-shortcut="1"`, `"2"`,
   … with the active one marked via `.is-active`,
   `aria-selected="true"`, or `aria-pressed="true"`. Arrow stepping
   advances/retreats through the pills.

The navigator picks the first matching target per figure and uses
it for both keyboard and wheel.

**What a new figure author has to do:**

1. Wrap the figure in `<FigureFrame label="…">` as before.
2. The figure root in the React panel is a `<figure class="figure-stub">`
   with a single `<div class="figure-body">` body wrapper + figcaption.
3. Mark the main visualization wrapper `class="fig-viz"`.
4. Slider-driven figure → nothing else. ←/→ and wheel scrub it.
5. N-option figure (pills, tabs, swatches) → add
   `data-shortcut={String(i+1)}` to each option, and mark the active
   one with `.is-active` (or `aria-selected="true"` /
   `aria-pressed="true"`).
6. Prev/next-driven figure → mark the buttons
   `data-shortcut="ArrowLeft"` / `"ArrowRight"`.

**Per-control accessibility still applies on top:**

- **Sliders** — prefer native `<input type="range">` (arrow keys
  free, and the global navigator can find it). If a custom SVG
  slider: `tabindex="0"` + `role="slider"` + `aria-valuemin/max/now`
  + `keydown` handler responding to Arrow keys, Home (min), End
  (max), Shift = larger step.
- **Draggable targets** — `tabindex="0"` on the handle, arrow-key
  nudge, Home = reset to centre.
- **Buttons** — native `<button>`; Enter and Space both activate;
  visible `:focus-visible` ring.
- **Custom toggles** — `role="switch"`, `aria-checked`, Space toggles.
- **Tab order** — pressing Tab visits every control in a logical
  sequence with a visible focus ring on each. Test manually.
- **Fullscreen entry/exit** — FigureFrame's `⛶ Fullscreen` button is
  already keyboard-focusable; ESC already exits. Don't intercept ESC
  inside the figure (or handle it and let it bubble).

`prefers-reduced-motion` static fallback still required on top.

### Why these three together

A figure that's beautiful but wrong teaches the wrong thing. A figure
that's correct but only works at one size is useless on a projector or
phone. A figure that requires a mouse excludes keyboard users and many
assistive-tech users. All three matter and all three are mandatory.

### Reference implementations (read before designing your own)

- `src/components/scenes/0.1/figures.tsx` — TimeDilation, LightBending,
  SpacetimeFabric. The gold standard for scientific embedding.
- `src/components/scenes/0.2/figures.tsx` — EnergyRateDensity 9-point
  timeline in erg/g/s with Chaisson citations.
- `src/components/scenes/0.4/figures.tsx` — 3D EM-wave canvas, spectrum
  scrubber, Cassegrain telescope anatomy. The largest reference;
  covers fullscreen + keyboard patterns thoroughly.

If a new figure doesn't match any of these patterns, propose two or
three alternatives to the user before implementing. Visual decisions
go through approval, not improvisation.

### D. Math typography (every formula, every time)

Never display a formula as raw text like `a^b`, `x_2`, or
`sqrt(1-v²/c²)`. Math must render as proper mathematical typography.

- **In MDX prose** — use KaTeX delimiters: `$inline$` for inline
  (`$E = mc^2$`), `$$display$$` for blocks. The build wires
  `remark-math` + `rehype-katex`, so anything between `$` is typeset
  properly.
- **In JSX/TSX figures** — prefer **Unicode glyphs** for short
  expressions (γ, ², ³, ⁻¹, ½, √, λ, μ, π, Σ, Φ, Ω, ε₀, M☉, ×, ÷, ≈,
  ≪, ≫, ↔, ≡, ∝). For longer formulas, render KaTeX explicitly via
  `katex.renderToString(latex, { throwOnError: false })` and inject as
  `dangerouslySetInnerHTML`.
- The `.katex-faux` class is **typography-only** — for visual
  pull-quotes (the `E = mc²` block), not actual computed math.

The polished figures use γ as a Unicode glyph and the full
`v/c = 1 − 10^(−4·s)` formula via KaTeX rendering. Match that pattern.

### E. Page-layout invariants

- The prose column **must remain horizontally centred** on the page.
  The `mx-auto` on `<div class="max-w-[68ch] mx-auto prose-cosmic">`
  is mandatory — never remove it.
- The figure-frame breakout band is also centred by default; don't
  override with left/right margins inside the figure.
- Hero, prose, figures, and `PrevNext` all live inside the same
  centred article container (`<article class="max-w-[1100px] mx-auto …">`).
- Long-form prose body text is **left-aligned within the centred
  column** — never `text-align: center` on paragraphs. Only short
  standalone elements (hero titles, section labels, captions) may
  be centre-aligned text.

---

## 5. Navigation registry — `src/data/course-nav.ts`

Single source of truth for: top nav, mobile menu, chapter card grid,
left rail scroll-spy, prev/next defaults, AND lesson tease /
chapter description prose.

When you ship a lesson:
1. Flip `live: true` on the matching `subs[]` entry inside `CHAPTERS`.
2. Write the 70-word lesson `tease` on the matching sub entry. The
   same text renders on the lesson page (Hero, directly below H1)
   AND on the `/chapter/N` card. Single source of truth.
3. When a chapter overview ships, flip `overviewLive: true` AND set
   the chapter-level `description` (~100 words, shown under H1 on
   `/chapter/N`) and `overviewTease` (~70 words, the N.0 card text).
4. Add the section anchors to `RAIL_ANCHORS["N.M"]`:
   ```ts
   "N.M": [
     { id: "anchor-id-1", label: "Short Label" },
     { id: "anchor-id-2", label: "Short Label" },
   ],
   ```

Never hard-code "coming soon" anywhere — flipping `live` is enough.
Never inline tease/description text in `.astro` pages or React
components — both the lesson page Hero and the chapter card pull from
`course-nav.ts`; inlining causes the two surfaces to drift.

Type shape:

```ts
type SubPage = {
  id: string;
  title: string;
  live: boolean;
  tease?: string;        // ~70 words, ±5
};
type Chapter = {
  num: number;
  age: string;
  title: string;
  telescope: string;
  weeks: string;
  overviewLive: boolean;
  description?: string;     // ~100 words, chapter blurb under H1
  overviewTease?: string;   // ~70 words, N.0 card text
  subs: SubPage[];
};
```

Helpers — always use these when emitting an `href` or looking up
content:
- `withBase(p)` — prepends the `base: '/courses/ast100'` from
  `astro.config.mjs`. Required for the subpath deploy.
- `subPath("N.M")` — full URL for a sub.
- `overviewPath(N)` — full URL for a chapter overview lesson (`N.0`).
- `chapterPath(N)` — full URL for the dynamic `/chapter/N` card grid.
- `findChapter(N)` / `findSub("N.M")` — look up the entry by id.

---

## 6. Design tokens & styling

Tailwind v4 uses **CSS-first config** — there is no `tailwind.config.js`.
Design tokens are declared as `@theme` CSS variables in
`src/styles/global.css` (`--color-plasma`, `--color-void`,
`--font-serif`, etc.). They are usable both as Tailwind utilities
(`text-plasma`, `bg-void`) and as raw CSS variables in custom classes.

The codebase is roughly 40% utilities, 60% named custom classes —
intentional, for patterns Tailwind expresses awkwardly (drop caps,
background-clip text, custom keyframes, mood-arc gradients).

**Theme** (dark/light) is a `data-theme="light"` attribute on `<html>`,
toggled by `src/components/shared/ThemeToggle.tsx` and persisted in
`localStorage`. Both `--c-*` semantic vars and the Tailwind palette
tokens flip under `[data-theme="light"]`, so existing utilities re-skin
without component changes. When porting a prototype that hard-codes a
literal colour, prefer a `--c-*` variable so it stays theme-aware.

**Reduced motion** is honoured in ~14 places. Every animation must have
a static fallback. Don't ship motion that vestibular-disorder users
can't escape.

---

## 7. Hard rules (do not violate)

1. **No AI-generated images.** Concept illustrations from the scrape
   must be replaced with bespoke interactives. Real photos and data
   plots OK.
2. **No `tailwind.config.js`.** v4 is CSS-first.
3. **No SSR / server runtime.** Output is static.
4. **No hard-coded `/...` URLs.** Always go through `withBase()`,
   `subPath()`, `overviewPath()`, `chapterPath()`.
5. **No hard-coded "coming soon"** in components. Flip `live` in
   `course-nav.ts`.
6. **`git push` to `main` = live deploy.** Every push triggers the GH
   Action which rsyncs to Bluehost. Build and preview locally before
   pushing.
7. **No new dependencies** without explicit reason — the bundle budget
   is the whole point of choosing Astro.
8. **`prefers-reduced-motion` fallback** required for every new
   animation.
9. **Scientific sources required for every figure.** Real units, real
   numbers from the literature, real historical anchor where one exists
   (see §4½). If a value can't be sourced, flag it before guessing.
10. **Figures must work at all sizes** — default, fullscreen, and mobile
    portrait. Use SVG `viewBox` or canvas + `ResizeObserver`. Test all
    three during preview.
11. **No mouse-only interactives.** Every control must be
    keyboard-operable in both normal and fullscreen states. Opt into
    FigureFrame's global navigator by tagging the slider, pill set,
    or prev/next buttons per the resolution order — don't reinvent
    arrow/wheel handling per-figure (see §4½ rule C).
12. **Math expressions must render as proper typography.** Never raw
    `a^b` or `x_2`. Use `$inline$` / `$$display$$` in MDX, Unicode
    glyphs or `katex.renderToString()` in JSX/TSX (see §4½ rule D).
13. **The prose column must stay horizontally centred** — never remove
    `mx-auto` from the prose-cosmic container; never `text-align: center`
    long-form body text (see §4½ rule E).
14. **Single source of truth for lesson tease + chapter description.**
    The 70-word lesson tease lives in `subs[].tease` in
    `course-nav.ts` and is consumed by BOTH the lesson page Hero
    (`<Hero tease={tease} />`) AND the `/chapter/N` card grid. The
    100-word chapter description lives in `Chapter.description`. Never
    inline either text in a page or component — that causes the two
    surfaces to drift.
15. **Figure DOM contract.** Every figure renders as
    `<figure.figure-stub> → <div.figure-body> → <figcaption>`,
    with exactly one `.figure-body` (non-figcaption) child inside
    `.figure-stub`. The local `FigurePanel` helper in every
    `figures.tsx` does this — copy it; don't reinvent.
16. **Never use `:first-child` to target `figure-stub` from CSS.**
    Astro's `client:visible` directive inserts a hydration `<script>`
    tag as the first child of `.figure-frame-inner`; `:first-child`
    selectors that the author intended for `figure-stub` would
    accidentally promote the script to `display: flex !important`
    and render its JavaScript source as visible "gibberish" text on
    the left half of the fullscreen viewport. Target `.figure-stub`
    directly.
17. **Typography uniformity for non-figure paragraphs.** Hero tease,
    chapter description, card teases, and lesson body prose all
    share `text-[1.05em] leading-[1.74]` (matching the
    `.prose-cosmic > p` rule). One font size, one line-height, for
    every paragraph outside a figure panel.

---

## 8. Per-lesson authoring checklist

```
[ ] 1.  Read knowledgebase/2026-spring/raw_html/pN_M.html (or chN.html
        for overviews).
[ ] 2.  Plan sections (3–5), rail anchors, and figure decisions.
[ ] 3.  Decide per figure: port-as-is photo, port-as-is data plot,
        replace with bespoke interactive, or omit.
[ ] 4.  Write the 70-word lesson tease. For N.0 (chapter overview)
        also write the 100-word Chapter.description and the 70-word
        Chapter.overviewTease.
[ ] 5.  Create src/content/chapter/N.M_slug.mdx (frontmatter + body).
[ ] 6.  Create src/components/scenes/N.M/Hero.tsx (accepts `tease`
        prop; renders it below the H1).
[ ] 7.  Create src/components/scenes/N.M/figures.tsx with the local
        FigurePanel helper that wraps children in
        <div class="figure-body">.
[ ] 8.  Create src/components/scenes/N.M/PrevNext.astro.
[ ] 9.  Create src/pages/chapter/N/N.M.astro (use the §2 template,
        import `findSub`, pass `tease={tease}` to Hero).
[ ] 10. Update src/data/course-nav.ts: flip live=true, write tease
        (and description / overviewTease for N.0), add RAIL_ANCHORS.
[ ] 11. (If applicable) update src/data/chapter-N-events.ts.
[ ] 12. pkill stale astro dev/preview; then npm run build &&
        npm run preview. Walk the page on http://localhost:4321 —
        not on a stale dev server.
[ ] 13. Verify Hero tease matches the /chapter/N card text exactly,
        dark + light themes, reduced motion, mobile layout, and the
        figure global navigator (←/→ arrows, wheel-in-fullscreen,
        double-click panel chrome → fullscreen).
[ ] 14. Commit; push when ready to deploy.
```

---

## 9. Where to look first when stuck

| Need to… | Read… |
|---|---|
| See the gold-standard lesson | `src/pages/chapter/0/0.1.astro` |
| See multiple FigureFrame uses | `src/pages/chapter/0/0.2.astro` |
| See the N.0 chapter-overview lesson pattern | `src/pages/chapter/0/0.0.astro` |
| See the dynamic `/chapter/N` card-grid page | `src/pages/chapter/[num]/index.astro` |
| See the Hero (with `tease` prop) | `src/components/scenes/0.1/Hero.tsx` |
| See bespoke interactive examples | `src/components/scenes/0.1/figures.tsx`, `0.2/figures.tsx`, `0.4/figures.tsx` |
| See the canonical `FigurePanel` body-wrapper helper | `src/components/scenes/0.2/figures.tsx` |
| Understand the rail / nav helpers + teases | `src/data/course-nav.ts` |
| Find the design tokens | `src/styles/global.css` (`@theme` block) |
| Find the figure-frame CSS contract | `src/styles/global.css` (search for `.figure-frame.is-fs`) |
| Find a source figure / image | `knowledgebase/2026-spring/media/` |
| Read the parallel plain-HTML spec | `knowledgebase/2026-spring/SPEC.md` |
| Deploy mechanics | `.github/workflows/deploy.yml` |

Chapter 1 pages are the PREVIOUS pattern — Hero without a `tease`
prop, longer hard-coded tagline, etc. — and are NOT yet migrated to
the new standard. Use chapter 0 (pages 0, 0.0, 0.1, 0.2, 0.3, 0.4)
for everything visual. Chapter 1 will be migrated in a later pass.
