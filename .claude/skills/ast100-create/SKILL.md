---
name: ast100-create
description: Create a new AST 100 lesson or chapter overview in the Astro app, matching the polished standard — scientific accuracy first, every interactive figure fullscreen-ready and keyboard-operable, conventions in LECTURE-AUTHORING.md. Invoke when the user types "/ast100-create N.M" or asks to "create lesson N.M", "port lesson N.M", "add chapter K overview", "build subpage Z.W", "tweak the figure in N.M", or similar. Once invoked, the skill stays active for the whole session — the user does not need to re-trigger for follow-up tweaks. Reads canonical source from knowledgebase/2026-spring/raw_html/ and produces the page, components, and nav updates without pushing or deploying.
---

# Create an AST 100 lesson

You are porting a lesson or chapter overview into the AST 100 immersive
Astro course site. The user gave a subpage ID like `2.1` (lesson) or
`3.0` (chapter overview).

You are **not designing visuals freehand.** The visual identity is locked
by chapters 0 and 1. You are translating canonical scraped content +
the existing template into a new page. Where a concept illustration
existed in the source, replace it with a bespoke interactive — never an
AI image.

## When to invoke

The user asks to add or port a lesson/overview. Examples:
- "port lesson 2.1"
- "create the milky way subpage"
- "let's build chapter 3 overview"
- "next up: 4.2 types of planets"

**In scope:** subpages `N.M` (M ∈ 1..4) and chapter overviews `N.0` for
chapters 2–7. Chapters 0 and 1 are already live — don't re-port them.

**Out of scope:** Mid/Fin pages, Home page, theme work, deploy.

## Self-improvement (automatic — applies to every session)

This skill is meant to **get sharper over time** as the team accumulates
experience. Throughout the session, watch the conversation for moments
that should become rules, and offer to record them.

### Signals to watch for

1. **Corrections** — the user says "no, don't do that", "stop X",
   "actually use Y instead", "this should be Z".
2. **Confirmations of a non-obvious choice** — "yes, exactly", "good,
   keep doing that", or silent acceptance of an unusual approach (no
   pushback when you'd expect some).
3. **New rules stated explicitly** — "always X", "never Y", "we use Z
   because…", "the supervisor wants W".
4. **Repeated patterns** — the same correction or request appearing
   twice or more in the session (or across lessons, if the user
   mentions it).

### What to do when you spot one

At a natural break point (end of STEP 1 plan, end of STEP 5 preview,
end of STEP 6 hand-off, when the user says "done" or moves to a new
topic):

1. Pause and tell the user: "I noticed a rule worth recording: …"
2. Show a proposed diff:
   - The exact text to add.
   - Which file(s) it belongs in:
     - **Hard rule / do-or-don't** → `SKILL.md` `## Hard rules` AND
       `LECTURE-AUTHORING.md` `§7. Hard rules`
     - **Figure convention** → `LECTURE-AUTHORING.md` `§4½`
     - **New component pattern** → `LECTURE-AUTHORING.md` §4 Component
       conventions
     - **Workflow change** → the relevant `## STEP N` in this `SKILL.md`
   - The **WHY** — cite the moment in the session, the incident, or
     the underlying reason.
3. If the user approves, apply the edit (Edit tool, surgical).
4. If they decline, drop it.
5. The user is responsible for committing + pushing the change.

### Quality bar for proposed rules

Every proposed rule must include:
- A clear "do" or "don't" statement
- The **WHY** (specific moment, specific reason)
- Edge cases if any are obvious

Without the WHY, the rule is brittle. With it, future sessions can
judge edge cases instead of mechanically applying.

---

## STEP 0 — Read the briefing (always, parallel)

Before any editing, read these in parallel:

1. `LECTURE-AUTHORING.md` at the repo root — the deep conventions
   (treat as reference; this SKILL.md is the authoritative entrypoint).
2. **For a lesson page (`N.M`):**
   - `src/pages/chapter/0/0.1.astro` (gold-standard lesson template)
   - `src/pages/chapter/0/0.2.astro` (multiple FigureFrame examples)
   - `src/pages/chapter/1/1.1.astro` (a fully-inline lesson with a
     merged tree figure — useful as a second example)
3. **For a chapter overview lesson (`N.0`):**
   - `src/pages/chapter/0/0.0.astro` — uses `ChapterOverviewLayout`
     and a wide `<FigureFrame variant="wide">` for the flagship
     RiverScene-style map.
4. **For the chapter card-grid page (`/chapter/N`):**
   - `src/pages/chapter/[num]/index.astro` — a single dynamic page
     that renders a no-prose 5-box deck for every chapter (one wide
     N.0 lead card + four sub-cards in a 2×2 grid). You almost never
     edit this; just flipping `live`/`overviewLive` in `course-nav.ts`
     is enough.
5. `src/data/course-nav.ts` — current live state and helpers:
   `withBase()`, `subPath()`, `overviewPath()`, `chapterPath()`,
   `findChapter(n)`. The `tease`/`description`/`overviewTease` fields
   on `SubPage`/`Chapter` are essentially dead — the lesson Hero now
   takes a literal tease string and the cover-page deck is no-prose.
   `SubPage.tease` is still read by `MobileNav` so don't strip it.
6. `src/components/shared/FigureFrame.astro` — wrapper component +
   the global keyboard/wheel navigator script.
7. `src/scripts/chapter-runtime.ts` — `tagLessonProse()` auto-adds
   `data-fade` to every direct child of `.lesson-prose` and `.dropcap`
   to the first `<p>` after each heading. Lesson markup stays clean
   because of this.
8. `src/styles/global.css` — the `.lesson-prose` block (auto h2
   eyebrow numbering, dropcap, paragraph typography) + the
   `.figure-frame.is-fs` block (fullscreen layout — read this if any
   figure misbehaves in fullscreen).
9. Canonical source content for the target page:
   - Lesson: `knowledgebase/2026-spring/raw_html/pN_M.html`
   - Overview: `knowledgebase/2026-spring/raw_html/chN.html`

If `knowledgebase/2026-spring/raw_html/` is missing, stop and tell the
user — the content pipeline depends on it.

## STEP 1 — Plan, then confirm

Without writing any files yet, produce a plan with:

1. The target ID (e.g. `2.1`) and its full title.
2. The neighbors for the footer nav (prev / next, looked up from
   `course-nav.ts`).
3. The section breakdown (3–5 sections for a lesson, each with a
   short rail-anchor `id`).
4. The figure plan, per section:
   - Source figure path (from `knowledgebase/2026-spring/media/`, if
     any).
   - Decision: **port as-is** (real photo / data plot), **replace
     with bespoke interactive** (concept illustration), or **omit**.
   - For each bespoke interactive, a one-line sketch of mechanism
     (slider, scrubber, comparison chart, etc.) and what concept it
     teaches.
5. **The ~70-word Hero tease** that appears below the H1 on the
   lesson page (literal string passed as `<Hero tease="..." />` —
   no course-nav lookup). Match the style of chapter-0 / 1.1 teases:
   concrete, names the instrument/figure used, points at what the
   reader will actually touch. Roughly 70 words, ±10.
6. **For a chapter overview lesson (`N.0`):** same tease (in
   `overviewTease`-style language, passed to the Hero literally).
   The cover-page deck is no-prose so no separate "100-word chapter
   description" is needed anymore.

Present the plan to the user. Wait for "go" or revisions before STEP 2.

## STEP 2 — Author scene components

Create `src/components/scenes/N.M/`:

- `Hero.tsx` — ghost-number + section title with parallax + a tease
  paragraph directly below the H1. **Accepts a `tease: string` prop.**
  Pattern lives in `src/components/scenes/0.1/Hero.tsx` (or
  `1.1/Hero.tsx`) — copy that file and change the ghost number,
  subsection label, and the right-bottom metadata line. The tease
  `<p>` must use:
  ```tsx
  <p
    data-fade
    style={{ ["--delay" as string]: "420ms" }}
    className="mt-10 max-w-[64ch] text-[1.05em] leading-[1.74] text-white/75"
  >
    {tease}
  </p>
  ```
  The `text-[1.05em] leading-[1.74]` matches the prose-body paragraph
  rule (`.prose-cosmic > p`) — every non-figure paragraph site-wide
  shares this exact typography.
- `figures.tsx` — one or more interactive panel components, default-
  or named-exported individually. Wrap real data and historical
  references into the visualization. Never decorative. Always honour
  `prefers-reduced-motion` with a static fallback. Copy the local
  `FigurePanel` helper from `0.2/figures.tsx` (or any chapter 0/1
  figures file) so every panel emits the canonical
  `<figure.figure-stub> → <div.figure-body> → <figcaption>` shape.
  **Read the Figure non-negotiables section below before designing.**
- `PrevNext.astro` — copy from `src/components/scenes/0/PrevNext.astro`.
  Default `next` to the next sub in `course-nav`; default `prev` to
  the previous sub (or `null` if first in the chapter).

For figures: prefer SVG + small canvas. Don't add libraries. Don't add
Framer Motion unless absolutely necessary. Type the props.

## Figure non-negotiables (read before designing any interactive)

**See LECTURE-AUTHORING.md §4½ for the deep guide.** All apply to
every figure.

### A. Scientific accuracy first
Every figure must be wired around correct physics:
- Real units (γ, erg/g/s, Mpc, Gyr, M☉) — never "complexity score"
- Real numbers from the literature (Chaisson Φₘ, Eddington 1919,
  Penzias & Wilson 1965, COBE/Planck)
- Real historical anchor where one exists — name the experiment,
  year, discoverer somewhere visible
- No decorative-only motion — if a curve doesn't encode information,
  drop it

If a value cannot be sourced, **flag it to the user before guessing.**

### B. Fullscreen must FIT — no scrollbars, nothing cropped (HARD INVARIANT)

The whole figure — viz + every control/detail panel + caption — fits in
the viewport with no scrollbar and nothing cut off. **Scrollbars in
fullscreen are unacceptable** (user rule, 2026-06-01).

- **Single-viz figures** enlarge to fill: `.fig-viz` flex-grows, and any
  supplementary UI is a SIBLING of `.fig-viz` inside `.figure-body` (never
  a child — the global fullscreen CSS rewrites `.fig-viz` into a centered
  flex container that swallows children, the most common way to break this).
- **Content-heavy figures** (viz + detail panel + a large selector grid,
  e.g. 0.4.c) get clipped under that fill-model — pass `fitFs` to the local
  `FigurePanel` (adds `.is-fs-fit`, capping `.fig-viz` small) and keep
  selector cards **name-only** (selecting one drives a single dedicated
  detail panel) so everything fits.

**Structure for figures with extra UI (detail boxes, info cards,
controls beyond the main visualisation):**

```jsx
<FigurePanel idx="N.M.a" kicker="…" caption="…">
  <div className="fig-viz">              {/* ONLY the main SVG/canvas */}
    <svg>…</svg>
  </div>

  <div className="detail-box">…</div>     {/* SIBLING of .fig-viz */}
  <div className="sr-only">…hidden a11y buttons…</div>
</FigurePanel>
```

The `FigurePanel` helper wraps children in `<div class="figure-body">`,
and in fullscreen that body becomes a flex column where `.fig-viz`
grows to fill height and siblings sit at natural size — preserving
the normal-mode layout. The 1.1 `FourForcesPanel` is the canonical
sibling-detail-box pattern.

**Aspirational target (not yet implemented):** the user wants TRUE
OS fullscreen via `document.documentElement.requestFullscreen()`,
not just a CSS fixed-position overlay covering the browser viewport.
Current FigureFrame is overlay-only. Slated for a future refactor;
mention it if you touch FigureFrame.

### C. Keyboard + mouse/trackpad navigation (HARD INVARIANT)

- **Keyboard ←/→ arrows MUST work in BOTH normal and fullscreen** for
  every figure without exception. Press an arrow, the figure
  scrubs / advances.
- **Mouse/trackpad wheel + pinch zoom MUST work in fullscreen** for
  every figure without exception. Scroll up = step right; scroll
  down = step left; pinch in/out = same.
- **Mouse/trackpad MUST NOT scrub in normal mode** — the page scroll
  belongs to the page, not the figure.
- **Double-click on empty panel chrome → fullscreen.** Empty =
  `.figure-frame`, `.figure-frame-inner`, `.figure-stub`,
  `.figure-body`. Clicks on `.fig-viz`, buttons, sliders, etc. fall
  through.

`FigureFrame.astro` ships a single delegated **global navigator**
that provides all of the above for free. **Don't reimplement.
Opt in by tagging the right elements:**

1. A button with `data-shortcut="ArrowLeft"` / `"ArrowRight"` —
   discrete prev/next (e.g. RiverScene's seven-age map).
2. The first enabled `<input type="range">` — slider nudge,
   Shift = ×10.
3. A numeric pill set — ≥2 buttons with `data-shortcut="1"`,
   `"2"`, … and the active one marked via `.is-active`,
   `aria-selected="true"`, or `aria-pressed="true"`. Arrow
   stepping walks through; 1–N keys jump direct.

The navigator picks the first matching target per figure and uses it
for both keyboard and wheel. **Every figure must satisfy at least
one of these patterns or ←/→ does nothing.**

If clicks need to land on a non-button element (e.g. SVG bands in
the FourForcesPanel tree), mirror selection state in hidden
`<button data-shortcut="N" className={isSel ? 'is-active' : ''}>`
elements inside an `sr-only` wrapper. The navigator finds them; the
visible SVG just shares the same `onClick`.

**three.js / Canvas figures (OrbitControls, or any per-figure wheel
listener): gate zoom/pan/wheel to FULLSCREEN ONLY** — else scroll-wheel
zoom hijacks the page in normal mode (the 0.4 EM-wave bug). Key off the
`.is-fs` class on the `[data-figure-frame]` ancestor: either
`enableZoom={false}` + a `wheel` listener that returns unless the frame is
`.is-fs` (0.3 Balloon), or a `MutationObserver` on the ancestor feeding
`enableZoom={fs} enablePan={fs}` (0.4 EM-wave).

**The DOM contract every figure must follow** (CSS in `global.css`
depends on it; breaking the contract causes the fullscreen layout to
collapse or shows hydration-bootstrap script text as "gibberish"):

```
<FigureFrame label="…">
  <figure class="figure-stub">           ← React panel root
    <div class="figure-body">            ← single body wrapper child
      <div class="fig-viz">…SVG/canvas…</div>
      …other controls / detail boxes / text…   ← SIBLINGS of .fig-viz
    </div>
    <figcaption>Fig. N.M.a — Title. Body.</figcaption>
  </figure>
</FigureFrame>
```

- The `<figure>` MUST carry `figure-stub`.
- Exactly one non-figcaption sibling inside `<figure>` — wrap all
  body content in a single `<div class="figure-body">`. (The shared
  `FigurePanel` helper does this automatically.)
- The main viz container carries `fig-viz`. Nothing else inside
  `.fig-viz` other than the main SVG/canvas.
- If the main content uses CSS Grid (e.g. a 2-column layout) and
  isn't a `.fig-viz`, mark it `fig-stretch` so it grows to fill the
  fullscreen body without `.fig-viz`'s display:flex overriding the
  grid.

**Per-control accessibility still applies on top:**
- Sliders: native `<input type="range">` (arrow keys free).
- Buttons: native `<button>`; Enter and Space both activate; visible
  `:focus-visible` ring.
- Tab order: logical sequence with visible focus ring.
- ESC always exits fullscreen — don't intercept it.

### Reference implementations (read before designing your own)

- `src/components/scenes/0.1/figures.tsx` — gold standard for
  scientific embedding (TimeDilation, LightBending). Note the
  `clock-svg` / `phase-svg` classes that opt small fixed-pixel SVGs
  into a fullscreen size override.
- `src/components/scenes/0.2/figures.tsx` — `FigurePanel` helper that
  wraps `{children}` in `<div className="figure-body">`. Copy this
  helper into every new `figures.tsx`.
- `src/components/scenes/0.4/figures.tsx` — covers fullscreen layout
  patterns across four panels (EM wave, spectrum, telescope bestiary,
  Cassegrain anatomy).
- `src/components/scenes/1.1/figures.tsx` — `FourForcesPanel`:
  Sankey-style tree + click-to-select + detail box as a SIBLING of
  `.fig-viz` (the canonical fullscreen-safe layout pattern).

If your figure idea doesn't match any of these patterns, propose two
or three alternatives to the user before implementing.

### D. Math typography

Never display a formula as raw text like `a^b`, `x_2`, or
`sqrt(1-v²/c²)`. Math must render as proper mathematical typography.

- **In .astro / .tsx (which is everywhere now — no MDX)** — use
  **Unicode glyphs** for short expressions: γ, ², ³, ⁻¹, ½, √, λ, μ,
  π, Σ, Φ, Ω, ε₀, M☉, ×, ÷, ≈, ≪, ≫, ↔, ≡, ∝. Use Unicode super/
  subscripts for exponents: ⁰¹²³⁴⁵⁶⁷⁸⁹ ⁻ ⁺ ₀₁₂₃₄₅₆₇₈₉. So
  `mc²` not `mc^2`, `10⁻⁴³` not `$10^{-43}$`.
- For longer formulas in JSX, render KaTeX explicitly via
  `katex.renderToString(latex, { throwOnError: false })` and inject
  as `dangerouslySetInnerHTML` (KaTeX CSS is loaded by
  `BaseHead.astro`).
- The `.katex-faux` class is **typography-only** (no parse) — use it
  for visual pull-quotes like the `E = mc²` block, not for actual
  computed math.

### E. Page-layout invariants

- The prose column **must remain horizontally centred** on the page.
  `.prose-cosmic` sets `max-width: 68ch; margin-inline: auto` — use
  it on the wrapper div, never inline the utility classes.
- The figure-frame breakout band is also centred by default; don't
  override with left/right margins inside the figure.
- Hero, prose, figures, and `PrevNext` all live inside the same
  centred article container (`<article class="topic-page">`).
- Long-form body text is **left-aligned within the centred column** —
  never `text-align: center` on paragraphs. Only short standalone
  elements (hero titles, section labels, captions) may be
  centre-aligned.

---

## STEP 3 — Author the page (all content inline)

There is NO separate MDX file. The lesson `.astro` page is the single
source of truth — all prose, headings, figures, pull quotes, and the
Hero tease string live inline.

Create `src/pages/chapter/N/N.M.astro` using this template (adapt
section ids/labels to match your rail anchors):

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
  <Hero tease="LITERAL ~70-word tease string written here directly." client:load />

  <article class="topic-page">
    <div class="prose-cosmic lesson-prose">
      <h2 id="rail-anchor-id">Section One Title</h2>

      <p>First paragraph of section one. The runtime auto-applies the
         .dropcap class to me. No data-fade needed; the runtime tags
         it automatically.</p>

      <p>Second paragraph.</p>

      <FigureFrame label="Panel A name">
        <PanelA client:visible />
      </FigureFrame>

      <p>Follow-up paragraph after the figure.</p>

      <h2 id="next-rail-anchor">Section Two Title</h2>

      <p>...</p>

      <FigureFrame label="Panel B">
        <PanelB client:visible />
      </FigureFrame>
    </div>
  </article>

  <PrevNext />
</ChapterLayout>
```

Notes:

- `tease` is the ~70-word lesson description you wrote in STEP 1,
  passed as a **literal string** to Hero. No `findSub()` lookup, no
  course-nav indirection.
- `<h2 id="…">` plain markup; the CSS counter on `.lesson-prose
  h2::before` auto-emits "— part one / two / …" eyebrow. Don't
  hand-author the eyebrow markup.
- No `data-fade`, no `dropcap` class on `<p>` tags — runtime adds
  both automatically.
- `.topic-page` (in `global.css`) wraps the article in
  `max-width: 1100px; margin-inline: auto`.
- `.prose-cosmic` (also in `global.css`) sets the 68ch reading column.
- `.lesson-prose` (also in `global.css`) triggers the auto-eyebrow +
  dropcap + fade-up behaviour. Always pair `.prose-cosmic` and
  `.lesson-prose` together.
- Math: use Unicode glyphs (mc², 10⁻⁴³, etc.). The .astro does not
  process `$…$`.
- For inline emphasis use `<em>` / `<strong>` JSX (no markdown
  `*italic*` parsing inside .astro).
- For HTML entities prefer the literal Unicode character (`"…"` not
  `&ldquo;…&rdquo;`).
- For a horizontal rule before a coda: `<hr />`. For an italic
  coda block: `<blockquote><p>…</p></blockquote>` — both styled by
  `.lesson-prose hr` / `.lesson-prose blockquote` in global.css.

**For a chapter overview lesson (`N.0`),** use `ChapterOverviewLayout`,
not `ChapterLayout`. Pattern: `src/pages/chapter/0/0.0.astro`. The
flagship figure (RiverScene-style map for ch0) sits inside
`<FigureFrame variant="wide">`. The wrapper is the same:
`<article class="topic-page"><div class="prose-cosmic lesson-prose">`.

**For the chapter card-grid page (`/chapter/N`)** — you do NOT write a
per-chapter file. The dynamic `src/pages/chapter/[num]/index.astro`
renders a no-prose 5-box deck (wide N.0 lead card + 2×2 sub-cards)
for every chapter automatically from `CHAPTERS`. Just flip `live` /
`overviewLive` in STEP 4.

## STEP 4 — Update `course-nav.ts`

In `src/data/course-nav.ts`:

1. Flip `live: true` on the matching `subs[]` entry inside `CHAPTERS`.
2. For a chapter overview, set `overviewLive: true`.
3. Add the section anchors to `RAIL_ANCHORS["N.M"]`:
   ```ts
   "N.M": [
     { id: "anchor-id-1", label: "Short Label" },
     { id: "anchor-id-2", label: "Short Label" },
   ],
   ```

Don't hard-code "coming soon" anywhere — flipping `live` is sufficient.
The `tease`/`description`/`overviewTease` fields on `SubPage` / `Chapter`
are kept but mostly unused (Hero takes a literal tease string; the cover
page has no prose). You can leave them blank for new lessons.

## STEP 5 — Build + preview

```bash
# Kill any stale astro dev/preview from earlier sessions FIRST:
pkill -f "astro dev" 2>/dev/null
pkill -f "astro preview" 2>/dev/null

npm run build
npm run preview   # serves dist/ on localhost (defaults to 4321)
```

Walk the new page in the browser. Check:
- The page loads, no console errors.
- The Hero tease renders directly below the H1.
- Section eyebrows ("— part one", "— part two", …) auto-render via CSS.
- First `<p>` after each `<h2>` gets the dropcap.
- Every paragraph fades in on scroll.
- Dark and light themes both work.
- `prefers-reduced-motion: reduce` shows static fallbacks for every
  animation. Test via DevTools rendering panel.
- Mobile layout (DevTools responsive). The rail collapses; mobile nav
  shows.
- Prev/next links resolve correctly under `base: '/courses/ast100'`.
- The new sub appears in the top nav dropdown and chapter card grid.
- **Fullscreen the figures one by one. For each:**
  - The fullscreen layout looks IDENTICAL to normal (same control
    positions, caption at the bottom, detail box just above the
    caption — none of them swallowed or repositioned).
  - ←/→ arrows scrub the figure in BOTH normal and fullscreen.
  - Wheel/pinch scrubs in fullscreen only (page scrolls normally
    over the figure in normal mode).
  - Double-clicking the panel chrome enters fullscreen.
  - No "gibberish text" leak on the left half (Astro hydration
    script visible).

## STEP 6 — Hand off

Report to the user:
- File paths created / edited.
- What you decided for each figure (port-as-is vs bespoke interactive).
- Anything you skipped or flagged.
- The next step you did NOT take: **`git push` triggers the live
  deploy.** Wait for the user's explicit "deploy / push / ship"
  approval before pushing.

End. Do not push, do not commit without explicit go-ahead.

## Hard rules (do not violate)

1. **No AI-generated images.** Concept illustrations from the scrape
   must be replaced with bespoke interactives. Real photos / data
   plots OK.
2. **No `tailwind.config.js`.** Tailwind v4 is CSS-first — tokens
   live in `@theme` inside `src/styles/global.css`.
3. **No hard-coded `/...` URLs.** Always go through `withBase()`,
   `subPath()`, `overviewPath()`, `chapterPath()`.
4. **No hard-coded "coming soon".** Flip `live: boolean` in
   `course-nav.ts`.
5. **No animation without `prefers-reduced-motion` fallback.**
6. **`git push` to `main` = live deploy.** Build and preview locally
   before pushing. Wait for explicit approval.
7. **No new dependencies** without checking with the user first.
8. **No SSR / server runtime.** Static output only.
9. **No MDX, no content collection.** Every lesson is a single
   self-contained `.astro` file. Don't recreate `src/content/`.
10. **Match chapter 0 and chapter 1 style exactly.** Both are the
    gold standard now — same Hero+tease + auto-numbered-h2 +
    lesson-prose conventions. Don't improvise typography, spacing,
    or color choices.
11. **Fullscreen mode == enlarged normal mode.** Same layout, same
    control positions, same caption placement, same detail-box
    placement. The user explicitly stated this: "the fullscreen
    should be just an enlarged version of the normal mode without
    changing the position of the boxes." Don't put extra UI inside
    `.fig-viz` — make it a sibling of `.fig-viz` inside
    `.figure-body`.
12. **Every figure must support keyboard arrows in BOTH normal and
    fullscreen, AND mouse/trackpad wheel/pinch in fullscreen.** No
    exceptions. Opt into FigureFrame's global navigator by tagging
    a slider, pill set, or prev/next button per §C above. If clicks
    must hit a non-button element (SVG band, etc.), add hidden
    mirrored buttons inside `.sr-only` so the navigator finds them.
13. **Single source of truth for the lesson tease.** It's a literal
    string in the `<Hero tease="..." />` prop on the .astro page.
    Don't pull from `course-nav.ts` anymore. (The `tease` field is
    still in `course-nav.ts` because MobileNav reads it, but new
    lessons can leave it blank.)
14. **Figure DOM contract.** Every figure must be
    `<figure.figure-stub> → <div.figure-body> → <figcaption>`. Wrap
    multi-element bodies in a single `<div class="figure-body">`.
    The `FigurePanel` helper does this — copy it; don't reinvent.
15. **Never use `:first-child` to target the figure-stub from CSS.**
    Astro's `client:visible` directive inserts a hydration
    `<script>` tag as the first child of `.figure-frame-inner`, and
    `:first-child` would force it to `display: flex !important` and
    render its JavaScript source as visible text on the left half of
    the fullscreen viewport. Target `.figure-stub` directly.
16. **Don't reinvent the global navigator.** ←/→ arrows, wheel/pinch
    in fullscreen, and double-click-to-fullscreen are all provided
    by `FigureFrame.astro`. Opt in by tagging slider / pill / prev-
    next elements; don't add per-figure keydown or wheel listeners
    except for genuine special cases.
17. **Typography uniformity for non-figure paragraphs.** Hero tease
    and lesson body paragraphs all use `text-[1.05em] leading-[1.74]`
    (matching the `.prose-cosmic > p` rule). The lesson runtime
    handles paragraphs automatically; just write clean `<p>` tags.
18. **Math via Unicode glyphs** (mc², 10⁻⁴³, W⁺, ⁻²², etc.) in
    .astro and .tsx. No `$…$` LaTeX in .astro (it won't render).

## When something is missing or unclear

- If the scrape source is missing → stop, tell the user.
- If a figure clearly demands a novel visual that has no template →
  stop and propose options.
- If anything feels like it crosses one of the hard rules → stop and
  ask.

## Speed tip

When you have many independent files to inspect (e.g. several existing
lesson pages and their figure components), read them as parallel tool
calls in a single message — don't serialise reads that don't depend on
each other. When work is genuinely parallelizable across multiple
lessons or files, dispatch agents in parallel — the user prefers this.

## Quick reference: where things live

| Thing | Path |
|---|---|
| Scraped raw source content | `knowledgebase/2026-spring/raw_html/pN_M.html` (subpage), `chN.html` (overview) |
| Source media (figures, photos) | `knowledgebase/2026-spring/media/` |
| Gold-standard lesson pages | `src/pages/chapter/0/0.1.astro`, `src/pages/chapter/1/1.1.astro` |
| Gold-standard chapter-overview lesson (`N.0`) | `src/pages/chapter/0/0.0.astro` (uses `ChapterOverviewLayout`) |
| Dynamic chapter card-grid page (`/chapter/N`) | `src/pages/chapter/[num]/index.astro` (no-prose, 5-box deck) |
| Gold-standard Hero (with tease prop) | `src/components/scenes/0.1/Hero.tsx` |
| Gold-standard figures + `FigurePanel` helper | `src/components/scenes/0.2/figures.tsx` (canonical body-wrapper pattern), `0.4/figures.tsx` (largest example), `1.1/figures.tsx` (sibling-detail-box pattern) |
| FigureFrame (shared, global navigator) | `src/components/shared/FigureFrame.astro` |
| Course nav data + helpers | `src/data/course-nav.ts` |
| Lesson runtime (data-fade + dropcap auto-tag) | `src/scripts/chapter-runtime.ts` |
| `.lesson-prose` CSS + `.figure-frame.is-fs` | `src/styles/global.css` |
| Deep convention doc (reference) | `LECTURE-AUTHORING.md` at the repo root |
| Parallel plain-HTML spec | `knowledgebase/2026-spring/SPEC.md` |
| Deploy workflow | `.github/workflows/deploy.yml` |

Chapters 0 and 1 are both gold-standard references — they share the
same Hero+tease, auto-numbered-h2, lesson-prose conventions. Use
either as a template.
