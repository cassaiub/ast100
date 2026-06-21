---
name: figures
description: >-
  Authoritative conventions for AST 100 interactive figures — modeled on the
  gold-standard figures of chapters 0, 1, and ESPECIALLY chapter 2. Invoke when
  creating, editing, reviewing, or debugging ANY figure, or whenever a figure
  must work in fullscreen. Covers the #1 rule (the figure DOMINATES fullscreen;
  text is a thin bottom strip or a right sidebar), the five fullscreen modes and
  how to choose between them, the FigureFrame + FigurePanel DOM contract,
  keyboard/mouse navigation, fullscreen font scaling, both-theme colour rules,
  the annotated-diagram standard, math, real images, reduced-motion, and CDP
  screenshot verification in both themes × both sizes.
---

# AST 100 — figure conventions

This skill is the single source of truth for the site's interactive
figures. Every figure must satisfy **all** of it. The reference
implementations are **chapter 0, chapter 1, and especially chapter 2**
(`src/components/scenes/2.*/figures.tsx`) — when in doubt, copy chapter 2.

> If you are doing broader lesson work (prose, science, page structure),
> use `/instructor`. This skill is the **deep figure reference** that
> `/instructor`'s figure contract points at. Read it before touching any
> `figures.tsx`.

---

## 0. THE #1 RULE — the figure must OWN fullscreen

Fullscreen exists to show the figure **in all its glory**. Therefore:

> **In fullscreen the VISUALIZATION dominates the screen (~70–85% of the
> area), and ALL text — controls, readout/detail, caption — is squeezed
> into a thin band: a thin strip along the BOTTOM (landscape figures) or
> a RIGHT SIDEBAR (square / radial figures).**

A figure that shrinks to a sliver while a fat detail box and an enlarged
caption eat half the screen is a **defect**, not a layout choice. This is
the single most common figure bug on this site. The cause is almost
always (a) the wrong fullscreen mode, or (b) a tall, multi-line,
2-column detail box that should be a compact one-row strip.

The chapter-2 charts are the proof: **2.4.c Hubble** and **2.4.a
Cepheid** put the chart on top filling ~72% and a *compact horizontal
readout strip* underneath. **2.2.b AGN** fills ~85% with its controls
*overlaid* inside the viz. Match them.

---

## 1. Choosing the fullscreen mode (the decision that matters most)

Every figure is a React panel rendered through a local `FigurePanel`
helper wrapped in `src/components/shared/FigureFrame.astro`. The panel
opts into a fullscreen behaviour by the class it puts on `.figure-stub`.
Pick ONE, by the viz's shape and how much chrome it carries:

| Mode | Class | Use when | What fullscreen does |
|---|---|---|---|
| **Default strip** | *(none)* | **Landscape** viz (axis plots, timelines, left→right schematics) with a **compact** readout. **THE DEFAULT for most charts.** | `.fig-viz` flex-grows to fill; the compact readout + concise caption form a thin bottom band. |
| **vizFill** | `is-fs-fill` | Landscape/spatial viz whose controls can be **overlaid inside** the viz (empty corners), e.g. 2.2.b AGN. Most aggressive (~85%). | Viz fills; caption shrinks to a ~19vh strip; controls are absolutely-positioned inside `.fig-viz`. |
| **Sidebar** | `is-fs-sidebar` (+ `rail`) | **Square / radial** viz with **no left-right story** (a disk, a balloon, an expanding grid, a donut). | Viz takes the full-height LEFT column; `rail` (slider+readout) + caption go in the RIGHT column. |
| **fitFs** | `is-fs-fit` | **Content-heavy** panels where the stuff BELOW the viz is the point — a big **selector grid** + detail (e.g. 0.4.c telescope bestiary). | Caps the viz at `max-height:24vh` so the grid + detail + caption fit. **Do NOT use on a plain chart — it crushes it to a sliver.** |
| **imgZoom** | `is-img-zoom` | A real **photo/map** with a hover-magnifier (1.4.c, 2.1.b, 2.3.c). | Image owns the screen; caption compact; lens/pan controls. |

**Decision tree:**
1. Is the viz a real image? → `imgZoom`.
2. Is the viz **square / radial with no horizontal story** (disk, ring,
   balloon, radial burst)? → `sidebar` + `rail`.
3. Does the page below the viz NEED a big selector grid / heavy detail
   stack as the focus? → `fitFs`.
4. Can the controls live as small overlays in the viz's empty corners
   and you want maximum viz size? → `vizFill`.
5. **Otherwise (the common case — a landscape chart/plot/schematic with a
   readout): DEFAULT strip** — no mode flag, just a **compact** readout
   (see §2) so the viz flex-grows and dominates.

`fitFs` is the trap: it is for *content-heavy* panels, NOT "any panel
with a detail box." A landscape chart with a modest readout must use the
default strip, never `fitFs`. (Chapter-3 H-R diagrams were shrunk to
slivers by a wrongly-applied `fitFs`, 2026-06-21.)

The same `FigurePanel` may support several flags — copy the **2.4**
signature, which carries `fitFs`, `sidebar`, and `rail`; **2.2** adds
`vizFill` and `imgZoom`. All the CSS already exists in `global.css`
(`.figure-frame.is-fs .figure-stub.is-fs-*`). You normally need **no CSS
changes** — only the right flag + a compact layout.

---

## 2. The compact bottom strip (how landscape charts dominate)

This is the pattern that makes 2.4.c / 2.4.a dominate, and the fix for
any chart that shrinks. The readout under the viz must be a **single
compact strip**, never a tall 2-column block:

```tsx
{/* readout — a thin horizontal strip; sibling of .fig-viz, flexShrink:0 */}
<div className="mt-4 rounded-md p-3" style={{ background: "…", border: "…", flexShrink: 0 }}>
  {/* inline LABEL value pairs on ONE wrapping row */}
  <div className="flex flex-wrap items-baseline gap-x-6 gap-y-1 font-sans">
    <div>
      <span className="font-mono uppercase tracking-[0.16em]"
            style={{ fontSize: sz(0.6), color: "rgb(var(--c-text-rgb) / 0.6)" }}>hubble constant</span>{" "}
      <span style={{ fontSize: sz(1), fontWeight: 500, color: "rgb(var(--c-text-rgb) / 0.9)" }}>{H0} km/s/Mly</span>
    </div>
    <div>{/* next stat pair … */}</div>
  </div>
  {/* a SHORT description — <= 2 lines, constant height */}
  <div className="mt-2 leading-[1.5] font-sans"
       style={{ fontSize: sz(0.82), minHeight: "3em", color: "rgb(var(--c-text-rgb) / 0.85)" }}>
    {shortDescription}
  </div>
</div>
```

Rules for the strip:
- **Stats inline, horizontal, wrapping** — never a `grid-cols-…` of
  stacked rows (that is tall). One `flex flex-wrap items-baseline` row.
- **Description ≤ ~2 lines** (`minHeight` ~3em, constant so it never
  resizes). If the source detail is longer, the *prose* carries the full
  explanation — the strip is an aid (text-is-self-sufficient).
- **Concise caption** (≤ ~3 lines). A long caption defeats the thin band.
- Modest `sz()` ratios — labels ~0.6, values ~1.0, body ~0.82–0.9.
  Oversized fullscreen text is what fattens the band and shrinks the viz.

---

## 3. The sidebar (how square / radial figures dominate)

For a disk / ring / balloon / radial grid, put the viz full-height LEFT
and the chrome RIGHT. Copy the **2.4** `FigurePanel` signature:

```tsx
function FigurePanel({ idx, kicker, caption, children, fitFs=false, sidebar=false, rail }) {
  const cls = `figure-stub my-12 rounded-md p-4 md:p-6${fitFs ? " is-fs-fit" : ""}${sidebar ? " is-fs-sidebar" : ""}`;
  return (
    <figure data-fade className={cls}>
      <div className="figure-body">{children}</div>
      {rail && <div className="fig-rail">{rail}</div>}   {/* DIRECT child of figure-stub, after body, before figcaption */}
      <figcaption>…</figcaption>
    </figure>
  );
}
```
- **Tier 1** (`sidebar` only): the whole `.figure-body` is the left
  column, the caption is the right column. Good when controls are
  overlays inside `.fig-viz` (0.3.b balloon).
- **Tier 2** (`sidebar` + `rail`): pass the slider/readout as the `rail`
  ReactNode → fullscreen lifts it into the right column above the
  caption, leaving the bare `.fig-viz` on the left (2.4.d, 1.3.d). Move
  slider + readout boxes into `rail`.
- **Use SPARINGLY** — only for genuinely radial/square vizzes. Wide
  landscape vizzes (ratio ≳ 1.6, a horizontal story) stay full-width with
  the bottom strip.
- Keep sidebar captions CONCISE (narrow column). Lift any inline viz
  `maxWidth` cap in fullscreen (`maxWidth: fs ? "none" : …`).
- **Caption-overlap gotcha:** never make the sidebar `figcaption` a flex
  column with `justify-content:center` — flex items shrink and the lines
  overlap into gibberish on short viewports. The CSS uses a `grid` with
  `grid-auto-rows:min-content; align-content:safe center` instead.

---

## 4. The DOM contract (copy `FigurePanel`, don't reinvent)

```
<FigureFrame label="…">                       (Astro wrapper = global navigator)
  <figure class="figure-stub">                (React panel root = local FigurePanel)
    <div class="figure-body">                 (exactly ONE non-figcaption child)
      <div class="fig-viz">…SVG / canvas…</div>   (ONLY the visualization)
      …controls / detail strip / hidden a11y buttons…  (SIBLINGS of .fig-viz)
    </div>
    [<div class="fig-rail">…</div>]            (Tier-2 sidebar only; direct child)
    <figcaption>Fig. N.M.a — Title. Body…</figcaption>
  </figure>
</FigureFrame>
```
- Supplementary UI (detail strip, sliders, pills, hidden buttons) are
  **siblings of `.fig-viz`**, never children — fullscreen turns
  `.fig-viz` into a centred flex box that swallows children.
- **Never** `:first-child` on `.figure-stub` — `client:visible` injects a
  hydration `<script>` first; it would render as visible gibberish in
  fullscreen. Target `.figure-stub` directly.
- One `<figcaption>`, leading `Fig. N.M.a — Title.`; numbering sequential
  in reading order (`a`, `b`, …) — update `idx` when reordering.
- Give every non-`.fig-viz` block **`flexShrink: 0`** so the greedy
  `.fig-viz` can't squeeze it and `overflow:hidden` can't crop it.

---

## 5. Keyboard + mouse navigation (opt in, never reimplement)

`FigureFrame` is a global navigator via one delegated listener. A figure
is "driven" only if it exposes ONE of (resolution order):
1. a real `<button data-shortcut="ArrowLeft">` / `"ArrowRight"`, else
2. the first `<input type="range">`, else
3. a ≥2-item numeric pill set `data-shortcut="1"`,`"2"`,… with the active
   one marked `.is-active` / `aria-pressed="true"` / `aria-selected`.

- **←/→ scrub in BOTH normal and fullscreen** (Shift = ×10). **Wheel /
  pinch scrub in FULLSCREEN ONLY** (normal-mode wheel scrolls the page).
  **Double-click empty panel chrome → fullscreen; ESC exits.**
- **The shortcut target MUST be a real `<button>`/`<input>`** —
  FigureFrame fires it via `.click()`, which SVG `<g>`/`<rect>` do NOT
  implement, so SVG "pills" silently fail. Drive selection from
  off-screen real buttons (`srOnly` style + `data-shortcut`):
  ```tsx
  const srOnly: CSSProperties = { position:"absolute", width:1, height:1, padding:0,
    margin:-1, overflow:"hidden", clip:"rect(0,0,0,0)", whiteSpace:"nowrap", border:0 };
  <button aria-hidden tabIndex={-1} data-shortcut="ArrowLeft"  onClick={() => step(-1)} style={srOnly} />
  <button aria-hidden tabIndex={-1} data-shortcut="ArrowRight" onClick={() => step(1)}  style={srOnly} />
  ```
- **↑/↓** also route to `data-shortcut="ArrowUp"/"ArrowDown"` buttons when
  present (additive) — for 2-D controls (map pan) and the all-4-arrows
  scheme on multi-selectable diagrams.
- **three.js / Canvas / any per-figure `wheel` listener: gate zoom/pan to
  fullscreen** (key off `.is-fs` on the `[data-figure-frame]` ancestor)
  or it hijacks page scroll in normal mode.
- **Never** drive a per-frame `setState` on a panel that hosts a
  controlled FigureFrame slider — the rAF re-render races the keyboard
  handler and swallows ←/→. Animate imperatively via refs
  (`node.setAttribute(…)`), re-rendering only on real user input.

---

## 6. Fullscreen font scaling (uniform, from one base)

SVG text scales with the `viewBox` for free; **fixed-px HTML text stays
tiny and clashes.** Detect fullscreen and scale every HTML
control/detail/label from ONE responsive base:
```tsx
const fs = useFs(vizRef);                       // MutationObserver on .is-fs
const sz = (r) => fs ? `calc(clamp(16px, 2.1vh, 27px) * ${r})` : undefined;
// style={{ fontSize: sz(0.6) }} labels · sz(1) body · sz(1.05+) displays
```
Pick proportional ratios (≈0.6 labels → 1.0 body → larger displays) so
the panel grows as one system. But **keep ratios modest** — oversized
text is what fattens the bottom band and shrinks the viz (§0).

---

## 7. Both themes — visible in day AND night

The site toggles `data-theme="dark|light"` on `<html>`. Every figure must
read in both. Three rules, in order of how often they bite:

1. **HTML text on theme-adaptive surfaces must use theme tokens, never
   fixed `text-white/NN`.** A control/detail/hint block sitting on the
   page (or a faint tint) renders fixed near-white as *invisible* on the
   light page. Use inline `color: rgb(var(--c-text-rgb) / α)` (α = the
   opacity you'd have used; ≥0.7 primary, ≥0.55 hints). SVG fills that
   already use `rgb(var(--c-*-rgb)/…)` adapt automatically.
2. **An always-dark viz panel needs `data-theme="dark"` AND a SOLID dark
   background.** `data-theme="dark"` alone is NOT enough: if the panel
   background is the common near-transparent `rgb(var(--c-text-rgb)/0.02)`
   it shows the LIGHT page through it in light mode → the (correctly
   light) text vanishes. Give it a solid dark bg — `#05060c`, or
   `radial-gradient(circle at 50% 50%, #0a0c1a 0%, #04050b 82%)` (the 2.4
   reference), or a warm `radial-gradient(… #1d1407 … #08070b)`. On a
   solid-dark panel, fixed light/accent colours (#fff, #f2a154, layer
   hexes) are correct and need no change.
3. **Theme-aware gradients/highlights** build from
   `rgb(var(--c-text-rgb) / α)` stops, never white — white tints vanish
   on the light theme.

---

## 8. The annotated-diagram standard (1.1.a is the worked reference)

For schematic SVG diagrams (trees, timelines, cutaways, flow charts):
- **Reserved-slot layout grid:** every text element gets its own x/y band
  computed from shared constants → overlap is impossible at any size.
  Leaders, if any, must be ordered so they can never cross (sort label
  slots to match anchor order).
- **Labels track the physics** — a label is a claim; get it right.
- **Every named region is selectable** → opens ONE shared, **constant-
  height** detail box (em-based `minHeight`; concise bodies so switching
  never resizes the panel). Give thin regions a fat transparent hit-rect.
- **Z-order:** data bands first, labels/outlines after.
- **Captions are ~3 lines:** what it is, the one rule to read it, the
  controls. Narrative belongs in the prose + detail box.
- **All-4-arrows** for multi-selectable diagrams (explicit
  ←/→ over all selectables in story order + ↑/↓ through the list + 1–N
  pills).

---

## 9. Math in figures

- **SVG `<text>` superscripts:** Unicode sup glyphs render unevenly in
  SVG/mono fonts — use a `SegTspans`-style `<tspan>` helper (entering a
  superscript = NEGATIVE `dy` ≈ −0.38em at 0.66× size; cumulative dy, so
  reset on exit).
- **HTML in figures** (detail strips, captions): an `M` component —
  `katex.renderToString(t, {throwOnError:false})` in a span. `FigurePanel`
  captions accept ReactNode, so they can carry `<M/>`.
- KaTeX in fullscreen survives via the `global.css` exception
  (`.is-fs .figure-stub .katex, .katex * { overflow: visible }`) — the
  blanket fullscreen `overflow:hidden` would clip its vlist superscripts.
- Never raw `a^b`/`x_2`. Units in m or Hz, **never eV**. On-figure numbers
  human-readable (no `1.5e+1`); gloss every symbol on first use. Wrap a
  `μ` unit in a `text-transform:none` span inside any `uppercase` element
  (else μ→Μ reads as mega).

---

## 10. Real images

Download real photos/maps into `public/images/media/`, convert to
`.webp`, reference via `withBase("/images/media/…")` — **never hotlink,
never AI-generate.** For a zoomable image: measure the IMAGE's rendered
box + offset with a `ResizeObserver`, draw a lens div with px-derived
`backgroundSize`/`backgroundPosition` following the cursor + four arrow
buttons; use `imgZoom` so fullscreen gives the image the screen with
`object-fit:contain` (whole image, uncropped). 1.4.c / 2.1.b / 2.3.c are
the references.

---

## 11. Motion & dependencies

- **`prefers-reduced-motion` fallback for every animation** — disable
  tweening/continuous motion; the figure stays fully usable (stages
  switch instantly). Apply the static frame and `return` before starting
  any rAF loop.
- No decorative-only motion. Real units, real literature values, a
  visible historical anchor where one exists.
- **three.js / @react-three/fiber, framer-motion, katex** are available.
  **No new dependencies without asking.**

---

## 12. Verify — screenshots, both themes × both sizes

`npm run build` strips types and misses every visual/theme/layout bug.
You MUST look at the figure. Bundled CDP harness (no deps; Node ≥ 22
global WebSocket + `google-chrome`) lives in
`.claude/skills/instructor/scripts/` (`shot.mjs`, `eval.mjs`); a
port-isolated `shot_port.mjs` (for running many screenshots in parallel)
sits beside this skill in `scripts/`.

For EVERY figure, capture and LOOK at all four states:

```bash
# dev server is on :4322 (SessionStart hook). frame index N = 0 first fig, 1 second.
SETUP='document.documentElement.setAttribute("data-theme","light");var f=document.querySelectorAll("[data-figure-frame]")[N];f.scrollIntoView({block:"center"});setTimeout(function(){f.classList.add("is-fs")},900)'
CDP_PORT=9330 node .claude/skills/figures/scripts/shot_port.mjs \
  "http://localhost:4322/courses/ast100/chapter/3/3.2" /tmp/fig.png "$SETUP" 1600 900
```

The fullscreen checklist (run on every figure):
- [ ] **The viz DOMINATES** (~70–85%); text is a thin bottom strip or a
      right sidebar — NOT a fat block shrinking the viz (§0).
- [ ] Whole figure fits — **no scrollbar, nothing cropped**.
- [ ] Fonts large and uniform — controls/detail/caption scaled from one
      base, not tiny HTML next to a huge SVG.
- [ ] **←/→ scrub** in normal AND fullscreen; **wheel/pinch** fullscreen
      only; double-click chrome → fullscreen; ESC exits.
- [ ] **Both themes legible** — no near-white-on-light, no dark-on-dark.
- [ ] No hydration-script gibberish on the left half.
- [ ] Numbers/labels match the prose and caption; reduced-motion usable.

Prefer headless-Chrome screenshots in **dark + light × normal +
fullscreen**, and end by inviting the user to look.

---

## Reference figures (read before building)

- **Chapter 2 (the gold standard for fullscreen):**
  `2.4/figures.tsx` — `sidebar`+`rail` (2.4.d), and the compact-strip
  charts 2.4.a Cepheid / 2.4.c Hubble; `2.2/figures.tsx` — `vizFill`
  (2.2.b AGN), `imgZoom` (2.2.c Cen A); `2.1` / `2.3` — band/web/merger +
  hover-zoom images.
- **Chapter 1:** `1.1` annotated-diagram standard (reserved slots,
  all-4-arrows, constant-height detail, `SegTspans`/`M`); `1.2`/`1.3`
  `useFs`+`sz()`+`srOnly`, colormaps, staged reduced-motion animation;
  `1.4` real-image hover-magnifier + log-scale slider + colorbar.
- **Chapter 0:** `0.1`/`0.2` the `FigurePanel` + slider/pill patterns;
  `0.4` the most complex (3D canvas + spectrum + `fitFs` bestiary);
  `0.3.b` balloon (Tier-1 sidebar, gated three.js wheel).

Shared machinery: `src/components/shared/FigureFrame.astro` (global
navigator), `src/styles/global.css` (`.figure-frame.is-fs .figure-stub.is-fs-*`
fullscreen modes), `src/scripts/chapter-runtime.ts` (fade + dropcap).
