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

At a natural break point (end of STEP 1 plan, end of STEP 6 preview,
end of STEP 7 hand-off, when the user says "done" or moves to a new
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

### When NOT to propose a rule

- One-off taste calls specific to the current lesson
- Personal preferences without a clear rationale
- Trivial wording / phrasing tweaks
- Anything that wouldn't help a future session

When unsure, ask: "is this worth recording as a rule, or specific to
this lesson?"

### Quality bar for proposed rules

Every proposed rule must include:
- A clear "do" or "don't" statement
- The **WHY** (specific moment, specific reason)
- Edge cases if any are obvious

Without the WHY, the rule is brittle. With it, future sessions can
judge edge cases instead of mechanically applying.

### When to surface, not record

If the user does a one-off that contradicts an existing rule (e.g.
overrides a default just for one lesson), don't propose removing the
rule — instead, flag the exception in your hand-off so they can decide.

---

## STEP 0 — Read the briefing (always, parallel)

Before any editing, read these in parallel:

1. `LECTURE-AUTHORING.md` at the repo root — the deep conventions.
2. **For a lesson page (`N.M`):**
   - `src/pages/chapter/0/0.1.astro` (gold-standard lesson template)
   - `src/pages/chapter/0/0.2.astro` (multiple FigureFrame examples)
3. **For a chapter overview (`N.0`):**
   - `src/pages/chapter/1/1.0.astro` (the lean overview pattern using
     `Layout` + `showBackdrop`)
4. `src/data/course-nav.ts` — current live state and the `withBase()`,
   `subPath()`, `overviewPath()` helpers.
5. `src/components/shared/FigureFrame.astro` — wrapper component.
6. Canonical source content for the target page:
   - Lesson: `knowledgebase/2026-spring/raw_html/pN_M.html`
   - Overview: `knowledgebase/2026-spring/raw_html/chN.html`

If `knowledgebase/2026-spring/raw_html/` is missing, stop and tell the
user — the content pipeline depends on it.

## STEP 1 — Plan, then confirm

Without writing any files yet, produce a plan with:

1. The target ID (e.g. `2.1`) and its full title.
2. The neighbors for the footer nav (prev / next, looked up from
   `course-nav.ts`).
3. The section breakdown (3–5 sections for a lesson, each with a rail
   anchor `id` and short `label`).
4. The figure plan, per section:
   - Source figure path (from `knowledgebase/2026-spring/media/`, if
     any).
   - Decision: **port as-is** (real photo / data plot), **replace with
     bespoke interactive** (concept illustration), or **omit**.
   - For each bespoke interactive, a one-line sketch of mechanism
     (slider, scrubber, comparison chart, etc.) and what concept it
     teaches.
5. The drop-cap-worthy first sentence of each section.

Present the plan to the user. Wait for "go" or revisions before STEP 2.

For a chapter overview, the plan is simpler: a flagship hero + a
topic-card grid (4 cards linking to the chapter's subs) + a brief intro
paragraph.

## STEP 2 — Author the content MDX

Create `src/content/chapter/N.M_slug.mdx`:

```mdx
---
title: "N.M Title"
slug: "N.M_slug"
chapter: N
order: <integer>
summary: "One-sentence summary."
sourceUrl: "https://cassa.site/abekta/courses/ast100/N.M"
---

<verbatim body text from the scrape, preserving structure>
```

The MDX is the schema/SoT. The body text is currently also inlined into
the `.astro` page so the prototype's interleaved layout works — keep
prose identical between the two for now.

## Figure non-negotiables (read before STEP 3)

Three rules apply to every interactive figure. They reflect what was
changed between the original prototype and the current polished version
in chapters 0 and 1. **See §4½ of LECTURE-AUTHORING.md for the full
deep guide** — this is the short version. All three apply to every
figure.

### A. Scientific accuracy first
The polish round was **not visual** — it was scientific. Every figure
got rewired around correct physics. Match that:
- Real units (γ, erg/g/s, Mpc, Gyr, M☉) — never "complexity score"
- Real numbers from the literature (Chaisson Φₘ, Eddington 1919,
  Penzias & Wilson 1965, COBE/Planck)
- Real historical anchor where one exists — name the experiment, year,
  discoverer somewhere visible
- No decorative-only motion — if a curve doesn't encode information,
  drop it

If a value cannot be sourced, **flag it to the user before guessing.**

### B. Fullscreen-ready
Wrapping in `<FigureFrame>` gives the toggle for free, but the figure
inside must work at all sizes:
- Default (figure-frame breakout, ~1400px max)
- Fullscreen (100vw × 100vh) — re-layout, don't just scale a small
  canvas
- Mobile portrait (~360 × 640) — controls reachable

Use SVG `viewBox` + `preserveAspectRatio`, or canvas + `ResizeObserver`.

### C. Keyboard-operable in BOTH states (normal AND fullscreen)
Every control reachable and operable via keyboard:
- Sliders: native `<input type="range">` (arrow keys free) OR custom
  with `tabindex="0"`, `role="slider"`, `aria-valuemin/max/now`,
  `keydown` handler (Arrow, Home/End, Shift = larger step)
- Draggable targets: `tabindex="0"` + arrow-key nudge + Home = reset
- Buttons: native `<button>`; Enter and Space both activate; visible
  `:focus-visible` ring
- Tab order visits every control in a logical sequence
- Fullscreen ESC still works — don't intercept it

Plus the standing `prefers-reduced-motion` fallback.

### Reference implementations (read before implementing your own)
- `src/components/scenes/0.1/figures.tsx`
- `src/components/scenes/0.2/figures.tsx`
- `src/components/scenes/0.4/figures.tsx`

If your figure idea doesn't match any of these patterns, propose two
or three alternatives to the user before implementing.

### D. Math typography (every formula, every time)

Never display a formula as raw text like `a^b`, `x_2`, or
`sqrt(1-v²/c²)`. Math must render as proper mathematical typography.

- **In MDX prose** — use KaTeX delimiters: `$inline$` for inline
  (e.g. `$E = mc^2$`), `$$display$$` for blocks. The build wires
  `remark-math` + `rehype-katex`, so anything between `$` is typeset
  properly. Test by running `npm run build` and checking the page.
- **In JSX/TSX figures** — prefer **Unicode glyphs** for short
  expressions: γ, ², ³, ⁻¹, ½, √, λ, μ, π, Σ, Φ, Ω, ε₀, M☉, ×, ÷, ≈,
  ≪, ≫, ↔, ≡, ∝. For longer formulas, render KaTeX explicitly via
  `katex.renderToString(latex, { throwOnError: false })` and inject as
  `dangerouslySetInnerHTML` (KaTeX CSS is already loaded).
- The `.katex-faux` class is **typography-only** (no parse) — use it
  for visual pull-quotes like the `E = mc²` block, not for actual
  computed math.

### E. Page-layout invariants

- The prose column **must remain horizontally centred** on the page.
  The `mx-auto` on `<div class="max-w-[68ch] mx-auto prose-cosmic">`
  is mandatory — never remove it.
- The figure-frame breakout band is also centred by default; don't
  override with left/right margins inside the figure.
- Hero, prose, figures, and `PrevNext` all live inside the same
  centred article container (`<article class="max-w-[1100px] mx-auto …">`).
- Section headers, figures, and pull-quotes never get `text-align: center`
  applied to long-form prose body text — only short standalone elements
  (hero titles, section labels, captions) may be center-aligned.

---

## STEP 3 — Author scene components

Create `src/components/scenes/N.M/`:

- `Hero.tsx` — ghost-number + section title with parallax. Pattern
  lives in `src/components/scenes/0.1/Hero.tsx`. Default-exported,
  takes no props.
- `figures.tsx` — one or more interactive panel components,
  default-exported individually. Wrap real data and historical
  references into the visualization. Never decorative. Always honour
  `prefers-reduced-motion` with a static fallback.
- `PrevNext.astro` — copy from `src/components/scenes/0/PrevNext.astro`.
  Default `next` to the next sub in `course-nav`; default `prev` to the
  previous sub (or `null` if first in the chapter).

For figures: prefer SVG + small canvas. Don't add libraries. Don't add
Framer Motion unless absolutely necessary. Type the props.

## STEP 4 — Author the page

Create `src/pages/chapter/N/N.M.astro` using this template (adapt
section ids/labels to match your rail anchors):

```astro
---
import ChapterLayout from "../../../layouts/ChapterLayout.astro";
import Hero from "../../../components/scenes/N.M/Hero";
import { PanelA } from "../../../components/scenes/N.M/figures";
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
        <p data-fade class="dropcap">First sentence…</p>
        <p data-fade>More prose…</p>

        <FigureFrame label="Panel A name">
          <PanelA client:visible />
        </FigureFrame>

        <p data-fade>Caption / follow-up…</p>
      </section>

      <!-- repeat sections -->

      <PrevNext />
    </div>
  </article>
</ChapterLayout>
```

For a chapter overview (`N.0`), use `Layout` with `showBackdrop`, not
`ChapterLayout`. Pattern: `src/pages/chapter/1/1.0.astro`.

## STEP 5 — Update `course-nav.ts`

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

## STEP 6 — Build + preview

```bash
npm run build
npm run preview   # serves dist/ on localhost
```

Walk the new page in browser. Check:
- The page loads, no console errors.
- Dark and light themes both work.
- `prefers-reduced-motion: reduce` shows static fallbacks for every
  animation. Test via DevTools rendering panel.
- Mobile layout (DevTools responsive). The rail collapses; mobile nav
  shows.
- Prev/next links resolve correctly under `base: '/courses/ast100'`.
- The new sub appears in the top nav dropdown and chapter card grid.

## STEP 7 — Hand off

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
2. **No `tailwind.config.js`.** Tailwind v4 is CSS-first — tokens live
   in `@theme` inside `src/styles/global.css`.
3. **No hard-coded `/...` URLs.** Always go through `withBase()`,
   `subPath()`, `overviewPath()`, `chapterPath()`.
4. **No hard-coded "coming soon".** Flip `live: boolean` in
   `course-nav.ts`.
5. **No animation without `prefers-reduced-motion` fallback.**
6. **`git push` to `main` = live deploy.** Build and preview locally
   before pushing. Wait for explicit approval.
7. **No new dependencies** without checking with the user first.
8. **No SSR / server runtime.** Static output only.
9. **Don't improvise on visual decisions.** The figure pattern follows
   the polished versions in `src/components/scenes/0.X/` and
   `src/components/scenes/1.X/`.
10. **Math** via `$inline$` / `$$display$$` in MDX (KaTeX is wired).

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
each other.

## Quick reference: where things live

| Thing | Path |
|---|---|
| Scraped raw source content | `knowledgebase/2026-spring/raw_html/pN_M.html` (subpage), `chN.html` (overview) |
| Source media (figures, photos) | `knowledgebase/2026-spring/media/` |
| Gold-standard lesson template | `src/pages/chapter/0/0.1.astro` |
| Chapter-overview template | `src/pages/chapter/1/1.0.astro` |
| FigureFrame | `src/components/shared/FigureFrame.astro` |
| Course nav data | `src/data/course-nav.ts` |
| Design tokens | `src/styles/global.css` (`@theme` block) |
| Deep convention doc | `LECTURE-AUTHORING.md` at the repo root |
| Parallel plain-HTML spec | `knowledgebase/2026-spring/SPEC.md` |
| Deploy workflow | `.github/workflows/deploy.yml` |
