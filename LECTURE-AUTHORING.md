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
---

<ChapterLayout
  title="N.M Title · AST 100"
  description="one-sentence summary"
  activeId="N.M"
  current="/chapter/N/N.M"
>
  <Hero client:load />

  <article class="max-w-[1100px] mx-auto px-6 md:px-10 pb-28">
    <div class="max-w-[68ch] mx-auto prose-cosmic">

      <section id="anchor-id" data-fade>
        <h2 class="section-h2">
          <span class="part-num">N.M.1</span>
          Section Title
        </h2>
        <p data-fade class="dropcap">First sentence with drop cap…</p>
        <p data-fade>More prose…</p>

        <FigureFrame label="Panel A name">
          <PanelA client:visible />
        </FigureFrame>

        <p data-fade>Caption / follow-up prose…</p>
      </section>

      <!-- repeat sections, typically 3–5 per lesson -->

      <PrevNext />
    </div>
  </article>
</ChapterLayout>
```

**Consistency rules:**
- `ChapterLayout` for lesson pages (provides the left rail nav).
- `Layout` with `showBackdrop` for chapter overview pages — pattern is
  `src/pages/chapter/1/1.0.astro`.
- `Hero` always `client:load` (above the fold, needs immediate
  interactivity).
- Interactive figures always `client:visible` (hydrate lazily) and
  wrapped in `<FigureFrame>`.
- Prose wrapped in `<div class="max-w-[68ch] mx-auto prose-cosmic">`.
- Section headers carry an `id` that matches `RAIL_ANCHORS["N.M"]` in
  `src/data/course-nav.ts`.
- First paragraph of each section: `class="dropcap"`.
- Footer is always `<PrevNext />`. Never a bespoke chapter footer.

**Gold-standard reference pages:**
- `src/pages/chapter/0/0.1.astro` — the canonical lesson template.
- `src/pages/chapter/0/0.2.astro` — multiple `FigureFrame` examples.
- `src/pages/chapter/1/1.0.astro` — the chapter-overview pattern.

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
Parallax ghost-number + title at the top of the page.
- Default-exported React component, no props.
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

### C. Keyboard-operable, both normal AND fullscreen

Every control must be reachable and operable by keyboard in **both**
the normal and fullscreen state. Concrete rules:

- **Sliders** — prefer native `<input type="range">` (arrow keys
  free). If a custom SVG slider: `tabindex="0"` + `role="slider"` +
  `aria-valuemin/max/now` + `keydown` handler responding to Arrow
  keys, Home (min), End (max), Shift = larger step.
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
left rail scroll-spy, prev/next defaults.

When you ship a lesson:
1. Flip `live: true` on the matching `subs[]` entry inside `CHAPTERS`.
2. When a chapter overview ships, flip `overviewLive: true`.
3. Add the section anchors to `RAIL_ANCHORS["N.M"]`:
   ```ts
   "N.M": [
     { id: "anchor-id-1", label: "Short Label" },
     { id: "anchor-id-2", label: "Short Label" },
   ],
   ```

Never hard-code "coming soon" anywhere — flipping `live` is enough.

Always use the helpers when emitting an `href`:
- `withBase(p)` — prepends the `base: '/courses/ast100'` from
  `astro.config.mjs`. Required for the subpath deploy.
- `subPath("N.M")` — full URL for a sub.
- `overviewPath(N)` — full URL for a chapter overview.
- `chapterPath(N)` — full URL for the dynamic `/chapter/N` card grid.

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
    keyboard-operable in both normal and fullscreen states
    (see §4½ rule C).
12. **Math expressions must render as proper typography.** Never raw
    `a^b` or `x_2`. Use `$inline$` / `$$display$$` in MDX, Unicode
    glyphs or `katex.renderToString()` in JSX/TSX (see §4½ rule D).
13. **The prose column must stay horizontally centred** — never remove
    `mx-auto` from the prose-cosmic container; never `text-align: center`
    long-form body text (see §4½ rule E).

---

## 8. Per-lesson authoring checklist

```
[ ] 1. Read knowledgebase/2026-spring/raw_html/pN_M.html (or chN.html
       for overviews).
[ ] 2. Plan sections (3–5), rail anchors, and figure decisions.
[ ] 3. Decide per figure: port-as-is photo, port-as-is data plot,
       replace with bespoke interactive, or omit.
[ ] 4. Create src/content/chapter/N.M_slug.mdx (frontmatter + body).
[ ] 5. Create src/components/scenes/N.M/Hero.tsx
[ ] 6. Create src/components/scenes/N.M/figures.tsx
[ ] 7. Create src/components/scenes/N.M/PrevNext.astro
[ ] 8. Create src/pages/chapter/N/N.M.astro (use the §2 template).
[ ] 9. Update src/data/course-nav.ts: flip live=true, add RAIL_ANCHORS.
[ ] 10. (If applicable) update src/data/chapter-N-events.ts.
[ ] 11. npm run build && npm run preview — walk the page in browser.
[ ] 12. Verify dark + light themes, reduced motion, mobile layout.
[ ] 13. Commit; push when ready to deploy.
```

---

## 9. Where to look first when stuck

| Need to… | Read… |
|---|---|
| See the gold-standard lesson | `src/pages/chapter/0/0.1.astro` |
| See multiple FigureFrame uses | `src/pages/chapter/0/0.2.astro` |
| See chapter-overview pattern | `src/pages/chapter/1/1.0.astro` |
| See bespoke interactive examples | `src/components/scenes/0.1/figures.tsx`, `0.2/figures.tsx`, `0.4/figures.tsx` |
| Understand the rail / nav helpers | `src/data/course-nav.ts` |
| Find the design tokens | `src/styles/global.css` (`@theme` block) |
| Find a source figure / image | `knowledgebase/2026-spring/media/` |
| Read the parallel plain-HTML spec | `knowledgebase/2026-spring/SPEC.md` |
| Deploy mechanics | `.github/workflows/deploy.yml` |
