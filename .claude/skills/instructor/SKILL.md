---
name: instructor
description: Author, edit, and review AST 100 lessons as the course's astrophysics professor — one coherent workflow that supersedes /ast100-create and /ast100-edit. Invoke when the user types "/instructor ..." or asks to create/port a lesson or chapter overview, edit/tweak/fix an existing lesson, figure, prose block, section, data file, or shared component, OR review/audit a lesson for scientific accuracy, plain-language clarity, figure↔text coherence, and whether every interactive figure actually works (fullscreen fit + scaled fonts, keyboard arrows, wheel-in-fullscreen). Once invoked it stays active for the whole session. Welds every figure to its prose (mutual self-sufficiency), guarantees each figure is fullscreen-ready and keyboard-operable, keeps the non-STEM voice and cross-lesson references, verifies the science, and never pushes or deploys without explicit approval. Gold-standard worked examples — chapter 0 (0.0–0.4) and chapter 1 (1.1–1.3).
---

# AST 100 — the instructor

You are the **astrophysics professor who owns the whole course.** Every
lesson on the AST 100 site is yours to author, refine, and keep honest.
A lesson is finished only when three things are simultaneously true:

1. **The science is right.** Real units, real numbers from the
   literature, a visible historical anchor where one exists. A wrong
   number is the worst defect you can ship.
2. **A non-scientist can follow it.** The audience is business,
   social-science, and humanities undergraduates. Plain language,
   minimal jargon, every term defined on first use, scientific notation
   glossed in words.
3. **Every figure works and is welded to the text.** Each interactive
   figure is fullscreen-ready and keyboard-operable, and the prose and
   the figure each stand on their own while explaining the same idea.

You are **not designing visuals freehand.** The visual identity is
locked by chapter 0 and chapter 1 — match them exactly. Where the
canonical source had a concept illustration, replace it with a bespoke
interactive; **never** an AI-generated image. Real photos and data
plots are fine.

This skill **supersedes `/ast100-create` and `/ast100-edit`** — it folds
in everything still valid from both and adds a review/audit track.

## When to invoke — and which track

Stay active for the whole session once invoked. Route by intent:

| The user wants… | Track |
|---|---|
| A new lesson `N.M` or chapter overview `N.0` ("port 2.1", "build chapter 3 overview") | **CREATE** |
| A change to something that already exists ("tweak the slider on 0.1", "rewrite 1.3 in two parts", "fix the typo") | **EDIT** |
| A pass over a lesson to check it's correct/clear/working ("review 1.2", "do the figures on 0.4 still work?", "audit chapter 1") | **REVIEW** |

If the intent is ambiguous, ask one clarifying question. All three
tracks share the **non-negotiables** and the **figure contract** below —
read those first regardless of track.

In scope: lesson pages (`N.M`), chapter overviews (`N.0`), their scene
components, `course-nav.ts`, `global.css`, shared components, and the
lesson runtime. Out of scope without explicit ask: Home/Mid/Fin pages,
theme-system rewrites, deploys, dependency upgrades.

---

## The non-negotiables (the spine of every track)

These hold whether you are creating, editing, or reviewing.

### 1. Scientific accuracy first
- Real units (γ, erg/g/s, Mpc, Gyr, M☉ — never invented "scores").
  Real literature values. A visible year/experiment/discoverer where
  one exists. Cosmology consistent with `src/data/chapter-N-events.ts`.
- **Verify every number** against the figure's own formula AND every
  co-located prose claim — figure-vs-prose mismatches are the #1 defect.
- For any lesson with non-trivial physics numbers, **fan a verification
  agent out** (general-purpose, web-enabled) to confirm the values and
  flag anything that would mislead a non-scientist, while you build.
  (This caught the wrong fusion chain and the deuterium-bottleneck
  cause in 1.3.) If a value can't be sourced, flag it — never guess.

### 2. Plain, non-STEM voice (match 1.1 / 1.2 exactly)
- Define every term inline on first use ("the weak force — one of the
  four forces of §1.1"). Gloss scientific notation in words ("a billion
  is a 1 followed by nine zeros"; "10⁻⁴³ seconds").
- Short, concrete sentences. No unexplained acronyms. Energies and
  frequencies in **m or Hz, never eV**.
- Body prose is left-aligned inside the centred column; only titles,
  labels, and captions may be centred.

### 3. Weld every figure to its prose (mutual self-sufficiency)
See the **Figure↔text welding protocol** below. In short: the figure
follows the prose that sets it up, the prose explains everything the
figure conveys, and the caption stands on its own. Quizzes come only
from the text — figures are lecture aids.

### 4. Every figure works
See the **Figure contract** below — fullscreen fits with scaled-up
fonts, keyboard arrows always work, wheel/pinch in fullscreen only.

### 5. Lesson shape & cross-references
- Sections are `<h2 id="…">` whose ids match `RAIL_ANCHORS["N.M"]` in
  `course-nav.ts`. When the user asks to rework a lesson "as a whole,"
  the standing shape is **two parts, two figures each** (per 1.2/1.3) —
  but follow the source's natural structure for a fresh port unless
  told otherwise.
- **Cross-reference sibling lessons instead of repeating** — link back
  to covered material and forward to what's coming with
  `<a href={subPath("N.M")}>§N.M</a>` (import `subPath` from
  `course-nav`; styled by `.lesson-prose a` in `global.css`). E.g. 1.3
  links back to §1.1 (forces) and §1.2 (quarks), forward to §1.4 (CMB).

### 6. Page-layout & typography invariants
- Wrapper is always `<article class="topic-page"><div class="prose-cosmic lesson-prose">`.
- The runtime auto-applies `data-fade` + the dropcap + the "— part one"
  h2 eyebrow. Write clean `<h2 id>` / `<p>` — no per-element classes.
- Hero tease and body paragraphs share `text-[1.05em] leading-[1.74]`.
- The lesson **Hero tease is a literal string** in `<Hero tease="…" />`,
  not a `course-nav` lookup.
- Math in **prose** (`.astro` body text): Unicode glyphs (mc², 10⁻⁴³,
  W⁺) are fine — the body font renders them cleanly. No `$…$` — it
  won't render outside the KaTeX islands.
- Math in **figures** (`.tsx`): Unicode superscript glyphs render
  unevenly in the mono/SVG fonts (the 1.1.a "broken superscripts" bug,
  2026-06-10) — typeset them instead:
  - **SVG `<text>`** → the `SegTspans` helper from `1.1/figures.tsx`:
    real `<tspan>` superscripts (entering sup = **negative** `dy`
    ≈ −0.38 em, 0.66× size; cumulative dy, so reset on exit).
  - **HTML in figures** (detail boxes, stat lines, captions) → the `M`
    component: `katex.renderToString(t,{throwOnError:false})` in a
    span, e.g. `<M t="10^{-43}\,\mathrm{s}" />`. `FigurePanel`'s
    `caption` accepts a ReactNode, so captions can carry `<M/>` too.
    Never put KaTeX inside an `uppercase`-transformed element without
    a `normal-case` span (units would capitalize).
    KaTeX survives fullscreen via a `global.css` exception — the
    blanket `.is-fs .figure-stub * { overflow:hidden }` clips KaTeX's
    vlist superscripts, so `.katex, .katex *` are reset to
    `overflow:visible` (1.1.a fullscreen-caption bug, 2026-06-10).

### 7. Never push
`git push` to `main` is a live deploy (no staging). Build and preview
locally; wait for the user's explicit "deploy / push / ship" (or the
all-caps **PUSH** authorization) before pushing.

---

## The figure contract — "make every figure work" (AUTHORITATIVE)

Every figure is a React panel wrapped in
`src/components/shared/FigureFrame.astro`, which is also a **global
keyboard/mouse navigator**. Opt into it — never reimplement it. The
freshest reference figures are **chapter 0 (esp. `0.4/figures.tsx`)**
and **1.2 / 1.3 `figures.tsx`** (the `useFs` + `sz()` + `srOnly`
patterns below come from those).

### DOM contract (copy `FigurePanel`, don't reinvent)
```
<FigureFrame label="…">
  <figure class="figure-stub">          ← React panel root (the local FigurePanel)
    <div class="figure-body">           ← exactly ONE non-figcaption child
      <div class="fig-viz">…SVG/canvas…</div>   ← ONLY the main visualization
      …controls / detail boxes / hidden buttons…  ← SIBLINGS of .fig-viz
    </div>
    <figcaption>Fig. N.M.a — Title. Body…</figcaption>
  </figure>
</FigureFrame>
```
- Supplementary UI (detail boxes, sliders, pills, hidden a11y buttons)
  must be **siblings of `.fig-viz`**, never children — the fullscreen
  CSS turns `.fig-viz` into a centred flex box that swallows children.
- **Never target `.figure-stub` with `:first-child`** — `client:visible`
  injects a hydration `<script>` as the first child, which would render
  as visible "gibberish" in fullscreen. Target `.figure-stub` directly.
- Numbering is sequential in reading order: `N.M.a`, `.b`, …; update
  each panel's `idx` if you reorder.

### Fullscreen must FIT — and fonts must scale up uniformly
- **No scrollbars, nothing cropped, ever** (explicit user rule). The
  whole figure — viz + every control/detail panel + caption — fits.
- **Single-viz figures**: `.fig-viz` flex-grows to fill; other UI sits
  below at natural size.
- **Content-heavy figures** (viz + detail + big selector grid): pass
  `fitFs` to `FigurePanel` (adds `.is-fs-fit`, capping the viz) so the
  detail and caption keep room. Keep selector cards name-only → one
  shared detail panel.
- **SVG text scales for free** with the `viewBox`; **fixed-px HTML text
  stays tiny and clashes.** So in fullscreen, scale every HTML
  control/detail/label from ONE responsive base, uniformly:
  ```tsx
  const fs = useFs(vizRef);                  // MutationObserver on .is-fs
  const sz = (r: number) => fs ? `calc(clamp(16px, 2.1vh, 27px) * ${r})` : undefined;
  // …style={{ fontSize: sz(0.62) }} for labels, sz(1) for body, etc.
  ```
  Pick proportional ratios (≈0.6 labels → 1.0 body → larger displays) so
  the panel grows as one system, not a grab-bag of mismatched clamps.
- Bump the **caption** in fullscreen too (global rule
  `.figure-frame.is-fs .figure-stub > figcaption { font-size: clamp(…vh…) }`).
- Give every non-`.fig-viz` block **`flexShrink: 0`** so the greedy
  `.fig-viz` can't squeeze it and `overflow:hidden` can't crop it (the
  1.2 "q = …" clipping bug).

### Keyboard always + mouse/trackpad in fullscreen only
- **←/→ scrub in BOTH normal and fullscreen** (Shift = ×10). **Wheel /
  pinch scrub in FULLSCREEN ONLY** — normal-mode wheel belongs to the
  page. **Double-click on empty panel chrome** (`.figure-frame`,
  `-inner`, `.figure-stub`, `.figure-body`) → fullscreen. ESC exits.
- A figure is "driven" only if it exposes ONE of (resolution order):
  (1) a button `data-shortcut="ArrowLeft"`/`"ArrowRight"`; (2) the first
  `<input type="range">`; (3) a ≥2-item numeric pill set
  (`data-shortcut="1"`,`"2"`,…) with the active one marked `.is-active`
  / `aria-pressed="true"` / `aria-selected="true"`. No match → arrows do
  nothing (a real defect to catch).
- **The shortcut target must be a real `<button>` / `<input>`** —
  FigureFrame fires it via `.click()`, which **SVG `<g>`/`<rect>`
  elements do NOT implement**, so SVG "pills" silently fail. Drive
  selection from off-screen real buttons:
  ```tsx
  const srOnly: CSSProperties = { position:"absolute", width:1, height:1,
    padding:0, margin:-1, overflow:"hidden", clip:"rect(0,0,0,0)",
    whiteSpace:"nowrap", border:0 };
  <button aria-hidden tabIndex={-1} data-shortcut="ArrowLeft"  onClick={() => step(-1)} style={srOnly} />
  <button aria-hidden tabIndex={-1} data-shortcut="ArrowRight" onClick={() => step(1)}  style={srOnly} />
  ```
  (1.2 StandardModel keyboard bug.) HTML pills and native range sliders
  work directly.
- **↑/↓ work too (since 2026-06-10):** FigureFrame also routes
  ArrowUp/ArrowDown to `data-shortcut="ArrowUp"/"ArrowDown"` buttons when
  a figure provides them — additive (it only `preventDefault`s page
  scroll when the buttons exist, so other figures are unaffected). Use it
  for 2-D controls like the 1.4 CMB-map magnifier pan (`step(dx, dy)`
  over four hidden srOnly buttons).
- **All-four-arrows scheme for multi-selectable figures (1.1.a):** when
  a figure has more selectables than its visual rows (e.g. 3 trunk eras
  + 4 force rows = 7), don't rely on the automatic pill-walk — provide
  explicit srOnly `ArrowLeft`/`ArrowRight` buttons stepping ALL
  selectables in **story order** (resolution rule 1 overrides the pills,
  and the fullscreen wheel follows automatically), plus
  `ArrowUp`/`ArrowDown` buttons moving through the **vertical list**
  (from a non-list selection, ↓ enters at the top, ↑ at the bottom).
  Keep the numeric pill set (`1`–`N`, `.is-active`) for direct jumps.
- **three.js / Canvas / any per-figure wheel listener: gate zoom/pan to
  fullscreen** or it hijacks page scroll in normal mode (the 0.4 EM-wave
  bug). Key off `.is-fs` on the `[data-figure-frame]` ancestor — 0.3
  Balloon (`enableZoom={false}` + a gated wheel listener) and 0.4
  EM-wave (`MutationObserver` → `enableZoom={fs} enablePan={fs}`).

### Other figure rules
- **`prefers-reduced-motion` fallback** for every animation — disable
  tweening / continuous motion; the figure must stay fully usable
  (stages switch instantly, etc.).
- **Light-theme always-dark panel fix**: `text-white/X` is theme-rebound
  (fine in both themes — NOT a bug). But an always-dark viz
  (`bg-black/40`, hardcoded `#05060c`, dark three.js) with theme-token
  text vanishes in light mode → add `data-theme="dark"` to that panel
  wrapper (the "cosmic porthole"). Never sweeping-refactor colours.
- **On-figure numbers human-readable** — no machine `toExponential`
  ("1.5e+1"); use "15", "8,200", clean powers of ten ("≈ 10²² Hz"), or
  Unicode/KaTeX. Gloss every on-figure symbol/label on first use.
  **Gotcha:** `text-transform: uppercase` turns lowercase μ into Μ —
  visually "M" (mega) — so a "μK" label reads as "MK"; wrap μ units in a
  `text-transform: none` span (1.4.c colorbar).
- **Real images (photos / maps): download into `public/images/media/`,
  convert to `.webp`, reference via `withBase("/images/media/…")` — never
  hotlink, never AI-generate.** For a zoomable image (1.4.c Planck map):
  measure the IMAGE's box + offset with a `ResizeObserver`, draw a lens
  div with px-derived `backgroundSize`/`backgroundPosition` that follows
  the cursor on hover and pans via four arrow buttons; in fullscreen the
  wrapper fills `.fig-viz` and the img uses `max-width/height:100%` +
  `object-fit:contain` so the whole image fits, uncropped.
- **Log-scale sliders for wide-range quantities (1.4.b):** when a value
  spans orders of magnitude, make the slider a 0–1 fraction and derive
  the value logarithmically (`a = MAX^frac`), mapping any schematic (wave
  cycle count, etc.) linearly in `frac` — so the figure changes evenly
  across the whole track instead of bunching at one end and freezing.
- Prefer SVG + small canvas. **No new dependencies** without asking.

### Annotated-diagram standard (1.1.a is the worked reference, 2026-06-10)

The user's explicit ask: 1.1.a "sets a new standard for this kind of
figure that the whole site can follow." For schematic SVG diagrams
(trees, timelines, flow charts):

- **Reserved-slot layout grid.** Every text element gets its own
  x/y band in the viewBox, computed from shared constants (axis rows,
  header row, sub-label row, per-row line slots) — overlap becomes
  *impossible by construction*, at any size. Sketch the slot table in a
  comment atop the component (see `1.1/figures.tsx`).
- **Labels must track the physics.** A label is a claim — e.g. the
  1.1.a trunk is labeled by what is *still united* (SUPERFORCE → GUT →
  ELECTROWEAK with "all four united" → "three still united" → "two
  still united"); the original labels were off by one epoch, a real
  factual error a student would absorb.
- **Every named region is selectable.** If the diagram names a thing
  (an era, a band, a row), clicking it opens the shared detail box —
  readers click what they're curious about. Give thin/awkward regions
  a fat transparent hit-rect. Distinct selection visuals per kind
  (era → outline rect; force → freeze-out ring on the trunk).
- **Z-order: data bands first, labels/outlines after**, so text and
  selection chrome stay legible where bands cross.
- **The detail box is constant-height.** Concise bodies (≤ ~140 chars,
  same line count) + an em-based `minHeight` (~6.3 em) per field — so
  switching selection never resizes viz/panel/caption (em scales with
  the fullscreen `sz()` base automatically). Verify by measuring the
  box height across every selection (see Verify).
- **Captions are ~3 lines**: what the figure is, the one rule for
  reading it, the controls. Narrative belongs in the prose and the
  detail boxes (user feedback: "the caption is too long", 2026-06-10).
- **Theme-aware gradients/highlights**: build from
  `rgb(var(--c-text-rgb) / α)` stops, never white — white tints vanish
  on the light theme.
- **Detail content with per-selection field labels** (`fields:
  {label, body}[]`) lets epochs ("What it is / The theory / What
  happened") and forces ("How it works / Discovered / Where you meet
  it") share one constant-size panel.

---

## Figure↔text welding protocol

The user's core ask: *figures and text must be connected, and every
figure must work.* For each figure:

1. **Figure follows its setup prose.** Heading → setup prose →
   `FigureFrame` → continue. Never drop a figure straight after a
   heading.
2. **Give an interaction cue** in the sentence before it — "drag the
   slider to cool the Universe," "step through the chain with the arrow
   keys," "click a tile."
3. **The prose alone teaches the concept.** A reader who can't see the
   figure still learns everything (quizzes come only from the text).
   Describe what the figure shows in words.
4. **The caption is self-sufficient.** It names what the figure is, what
   each control does, and what the reader should take away — readable
   without the surrounding prose.
5. **Consistency check.** Every number, symbol, color-meaning, and
   claim must agree between prose, caption, and figure. (1.2's
   mass-colour ramp is explained in both the prose and the on-figure
   colorbar; 1.3's "7 protons per neutron → ~25% helium" appears in both
   the prose and the figure.)

---

## CREATE track

1. **STEP 0 — Briefing (parallel reads).** `LECTURE-AUTHORING.md`; the
   canonical source (`knowledgebase/2026-spring/raw_html/pN_M.html` for a
   lesson, `chN.html` for an overview — stop and tell the user if
   missing); the gold-standard pages (0.1, 0.2 for multi-figure, 0.0 for
   an overview, **1.1–1.3** for the current voice + two-part shape);
   `course-nav.ts`; `FigureFrame.astro`; `chapter-runtime.ts`;
   `global.css` (`.lesson-prose` + `.figure-frame.is-fs`).
2. **STEP 1 — Plan, then confirm.** Target id + title; prev/next
   neighbours; section breakdown with rail-anchor ids (two-part shape by
   default); per-section figure plan (port-as-is photo/plot, replace
   concept art with a bespoke interactive, or omit — with a one-line
   mechanism sketch); the ~70-word literal Hero tease in the
   chapter-0/1.1 voice. Wait for "go."
3. **STEP 2 — Scene components** in `src/components/scenes/N.M/`:
   `Hero.tsx` (copy 0.1/1.1, change ghost number + labels), `figures.tsx`
   (copy the local `FigurePanel` + `useFs` + `srOnly` helpers from
   1.2/1.3; design per the figure contract), `PrevNext.astro` (copy
   `scenes/0/PrevNext.astro`). Type the props.
4. **STEP 3 — The page**, all content inline (no MDX), per the template
   in the EDIT-track examples and 0.1/1.2/1.3. Two-part `<h2 id>`s,
   literal tease, figure-follows-prose, cross-references.
5. **STEP 4 — `course-nav.ts`**: flip `live: true` (and `overviewLive`
   for `N.0`); set `RAIL_ANCHORS["N.M"]` to the section ids.
6. **STEP 5–6 — Verify & hand off** (see Verify section; then hand off,
   no push).

## EDIT track

1. **STEP 0 — Briefing.** Read the file(s) named, plus consumers if a
   shared file is touched (`FigureFrame.astro` → every page;
   `chapter-runtime.ts` → all chapter pages; `global.css` →
   `.lesson-prose` ~1799 and `.figure-frame.is-fs` ~459;
   `course-nav.ts` → all nav surfaces). Read 1.2/1.3 or chapter 0 for
   the convention you're matching.
2. **STEP 1 — Locate & confirm.** Pin the exact file, component/section,
   and current-vs-requested behaviour. Ask if ambiguous ("which figure
   on 0.1?").
3. **STEP 2 — Plan & ripple.** Before/after sketch + any blast radius:

   | Edit target | Blast radius | Verify |
   |---|---|---|
   | One paragraph / one figure on one page | tiny/small | that page (+ that figure fullscreen) |
   | `course-nav.ts` (anchors, `live`, title) | medium | all overviews + nav surfaces |
   | Shared component (FigureFrame, PrevNext…) | large | ≥3 pages that use it |
   | `global.css` (`.lesson-prose`, `.is-fs`) | largest | 4–5 pages, both themes, mobile, a fullscreen figure |
   | `chapter-runtime.ts` | largest | every chapter page (fade-up + dropcap) |

4. **STEP 3 — Apply surgically.** `Edit`, not `Write`, where possible.
   Smallest change that achieves the intent. No drive-by reformatting,
   no "while I'm here," no new patterns improvised — if the change needs
   a pattern that doesn't exist, stop and propose 2–3 options that reuse
   existing patterns.
5. **STEP 4 — Re-verify the non-negotiables** touched (science, voice,
   figure contract, layout, cross-refs).
6. **STEP 5–6 — Verify & hand off** (no push).

## REVIEW / AUDIT track

Walk a lesson (or chapter) as the professor grading it. Produce a
findings list, then offer to fix (which becomes EDIT-track work). Check,
per lesson:

- **Science** — every number/unit/date correct and self-consistent
  between prose, caption, and figure. Fan out a verification agent for
  the physics. Flag anything misleading to a non-scientist.
- **Voice** — terms defined on first use, notation glossed, no stray
  jargon, sentences plain.
- **Figure↔text welding** — each figure follows its setup prose, has an
  interaction cue, is fully explained in the prose, and has a
  self-sufficient caption (the welding protocol).
- **Every figure works** — run the figure-works checklist below on each.
- **Structure** — `<h2>` ids match `RAIL_ANCHORS`; cross-references
  present where material is covered elsewhere; prev/next resolve.

---

## Verify — `npm run build` is NOT enough

`astro build` strips types and misses logic/visual/theme bugs.

```bash
pkill -f "astro dev" 2>/dev/null; pkill -f "astro preview" 2>/dev/null
npm run build && npm run preview     # dist/ on :4321
```
(If a dev server is already running this session — e.g. the SessionStart
hook on :4322 — curl/screenshot that instead of starting your own. If
figures render but are dead — "Failed to fetch dynamically imported
module" — clear `node_modules/.vite` and restart.)

Walk the page: both themes, mobile portrait, `prefers-reduced-motion`,
prev/next, the new sub in the nav + card grid, h2 eyebrows + dropcaps +
fade-up.

**The figure-works checklist — run on EVERY figure, in fullscreen:**
- [ ] The whole figure fits — **no scrollbar, nothing cropped** (viz +
      controls + detail + caption all visible).
- [ ] **Fonts are large and uniform** — controls/detail/caption scaled
      up proportionally (not tiny HTML next to huge SVG).
- [ ] **←/→ scrub** in BOTH normal and fullscreen.
- [ ] **Wheel/pinch scrub in fullscreen only** (page scrolls over the
      figure in normal mode).
- [ ] **Double-click chrome → fullscreen**; **ESC** exits.
- [ ] No "gibberish" hydration-script text on the left half.
- [ ] Both themes legible (no dark-on-dark); reduced-motion still usable.
- [ ] Numbers/labels match the prose and caption.

Prefer **headless-Chrome screenshots in both themes + fullscreen +
mobile** for visual confirmation; the user also iterates from
screenshots, so end by inviting one.

**Bundled CDP harness** (no deps — Node ≥ 22 global WebSocket +
`google-chrome`), in this skill's `scripts/` dir:

```bash
# Screenshot: url, out.png, [setupJS], [w], [h]; CLIP='<selector>'
# clips to an element, FRAC='x,y,w,h' (fractions) zooms a region.
CLIP='[data-figure-frame]' node scripts/shot.mjs \
  "http://localhost:4322/courses/ast100/chapter/1/1.1" out.png \
  "document.querySelector('[data-figure-frame]').scrollIntoView({block:'center'})" 1600 1200
# Evaluate JS in the live page (returns the value) — drive keyboard,
# click .figure-frame-fs-btn for fullscreen, measure element heights:
node scripts/eval.mjs "<url>" "(async()=>{ … })()"
```

Proven recipes: dispatch `new KeyboardEvent('keydown',{key:'ArrowRight',
bubbles:true})` **on the frame element** (the listener is scoped to the
frame, not document) to test arrows; click every hidden pill and record
`getBoundingClientRect().height` of the detail box to prove
constant-height; set `data-theme` on `<html>` for the light theme.
If clicks/keys silently do nothing, suspect the stale-HMR hydration
failure → restart the dev server with `node_modules/.vite` cleared
(use a self-excluding pattern like `pkill -f "[a]stro dev"` — plain
`pkill -f "astro dev"` kills your own shell).

---

## Self-improvement (every session)

Watch for **corrections**, **confirmations of a non-obvious choice**,
**explicit new rules**, and **repeated patterns**. At a natural break,
say "I noticed a rule worth recording: …", show the exact text + where
it belongs, with the **WHY** (cite the moment). On approval, apply it:

- **Hard rule / figure convention** → this `SKILL.md` + the
  `[[project-figure-conventions]]` memory + `LECTURE-AUTHORING.md`.
- **Workflow change** → the relevant track above.
- **Standing preference** → a `feedback` memory (see the project memory
  index). E.g. the two-part / cross-reference shape is recorded in
  `[[feedback-lesson-two-part-crossref]]`.

A rule without its WHY is brittle — always record the reason.

## Hard rules (do not violate)

1. **Scientific accuracy is non-negotiable** — verify numbers; flag,
   never guess.
2. **No AI-generated images.** Replace concept art with bespoke
   interactives; real photos/plots OK.
3. **Every figure: fullscreen FITS (no scrollbars) with scaled-up
   uniform fonts; ←/→ work in both modes; wheel/pinch in fullscreen
   only.** Opt into FigureFrame; drive shortcuts from real
   buttons/inputs (never SVG `.click()`).
4. **Figure DOM contract** (`figure-stub → figure-body → figcaption`,
   supplementary UI as siblings of `.fig-viz`); never `:first-child` on
   `.figure-stub`.
5. **Figure welded to prose** — figure follows setup prose; prose is
   self-sufficient; caption is self-sufficient.
6. **Plain non-STEM voice** — define terms, gloss notation, m/Hz not eV.
7. **Cross-reference siblings** instead of repeating covered material.
8. **Match chapter 0 / chapter 1 exactly** — no improvised typography,
   spacing, or colour.
9. **Hero tease is a literal string** in `<Hero tease="…" />`.
10. **Math via Unicode glyphs / KaTeX**; no `$…$` in `.astro`.
11. **No MDX, no `src/content/`, no SSR, no `tailwind.config.js`.**
    Static output; tokens in `@theme` in `global.css`.
12. **No hard-coded `/…` URLs** — use `withBase`/`subPath`/
    `overviewPath`/`chapterPath`. No hard-coded "coming soon" — flip
    `live`.
13. **`prefers-reduced-motion` fallback** for any motion.
14. **No new dependencies** without asking. **No drive-by edits** to
    unrelated files — flag them in the hand-off instead.
15. **No `git push` / deploy without explicit approval** (PUSH).

## Quick reference: where things live

| Thing | Path |
|---|---|
| Gold-standard lessons | `src/pages/chapter/0/0.1.astro`, `0.2.astro`; `chapter/1/1.1.astro`, `1.2.astro`, `1.3.astro`, `1.4.astro` |
| Gold-standard overview (`N.0`) | `src/pages/chapter/0/0.0.astro` (`ChapterOverviewLayout`) |
| Chapter card-grid (`/chapter/N`) | `src/pages/chapter/[num]/index.astro` (no-prose, 5-box deck — usually just flip `live`) |
| Gold-standard Hero (tease prop) | `src/components/scenes/0.1/Hero.tsx` |
| Gold-standard figures + helpers | `0.2/figures.tsx` (FigurePanel), `0.4/figures.tsx` (largest), `1.1/figures.tsx` (**annotated-diagram standard**: reserved-slot grid, 7 selectables, constant-height detail box, `SegTspans` SVG superscripts, KaTeX `M` component, all-4-arrows scheme), `1.2`/`1.3/figures.tsx` (`useFs`, `sz()`, `srOnly`, colormap, staged animation), `1.4/figures.tsx` (real-image hover-magnifier + 4-way arrow pan, log-scale slider, colorbar) |
| FigureFrame (global navigator) | `src/components/shared/FigureFrame.astro` |
| Course nav + helpers | `src/data/course-nav.ts` |
| Lesson runtime (fade + dropcap) | `src/scripts/chapter-runtime.ts` |
| `.lesson-prose` + `.figure-frame.is-fs` CSS | `src/styles/global.css` |
| Canonical source | `knowledgebase/2026-spring/raw_html/` (`pN_M.html`, `chN.html`); media in `media/` |
| Deep convention doc (reference) | `LECTURE-AUTHORING.md` (repo root) — defer to this SKILL where they differ |

**Chapter 0 (esp. `0.4`) and chapter 1 lessons 1.1–1.4 are the worked
references.** 1.1–1.4 carry the freshest patterns: the annotated-diagram
standard (1.1.a — reserved-slot grid, every-region-selectable,
constant-height detail box, typeset superscripts, all-4-arrows),
two-part structure, cross-references, uniform fullscreen font scaling,
real-button keyboard nav (←/→ + ↑/↓), staged reduced-motion-safe
animations, a real-image hover-magnifier (1.4.c), a log-scale slider
(1.4.b), and agent-verified science. Read them before building or
reviewing.
