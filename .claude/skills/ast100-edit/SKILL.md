---
name: ast100-edit
description: Edit, tweak, fix, or fine-tune an existing AST 100 lesson, chapter overview, figure, section, prose paragraph, data file, or shared component without breaking site-wide conventions or causing regressions. Invoke when the user types "/ast100-edit ..." or asks to edit/fix/tweak/change/update/modify an existing part of the site, e.g. "tweak the slider on 0.1", "fix the typo in 2.3", "make the timeline event read X instead of Y", "the section header in 3.2 should be different", "shrink the figure on 0.4", "the LightBending slider should start at 0.5 M☉". Once invoked, the skill stays active for the whole session — the user does not need to re-trigger for follow-up tweaks. Preserves the figure non-negotiables (scientific accuracy, fullscreen-equals-normal, keyboard always + mouse-in-fullscreen, math typography, page centring) and all other conventions documented in LECTURE-AUTHORING.md.
---

# Edit / tweak an AST 100 lesson

You are editing an **existing** part of the AST 100 site. The user has
identified a specific thing they want to change. Your job is to make
**only that change**, preserving every other convention in the
codebase. The rest of the site must stay alive and unchanged.

This is the editing complement to `/ast100-create`. If the lesson
doesn't exist yet, use `/ast100-create` instead — that's the template-
driven new-lesson workflow. If the lesson exists and you're tweaking
it, that's this skill.

## When to invoke

The user asks to edit, fix, tweak, fine-tune, modify, change, or
update something that already exists. Examples:

- "edit lesson 2.1"
- "tweak the third figure on 0.4"
- "fix the timeline labels in chapter 1"
- "the LightBending slider should start at M☉ = 0.5, not 1"
- "change the section header in 3.2 from X to Y"
- "shorten the intro paragraph on 0.2"
- "the rail anchor for §3 should say 'evolution', not 'complexity'"
- "fix the typo in the EnergyRateDensity caption"
- "make FigureFrame's exit button smaller" — high blast radius; see
  STEP 3
- "the prose on 1.4 should match the knowledgebase source"

**In scope:** any change to a page, component, data file, or style
that's already live.

**Out of scope:**
- Creating an entire new lesson — `/ast100-create` instead.
- Large global refactors that touch many unrelated files.
- Theme system rewrites, deploy, dependency upgrades.

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
   twice or more in the session (or across lessons).

### What to do when you spot one

At a natural break point (end of STEP 2 plan, end of STEP 4
re-verify, end of STEP 5 preview, end of STEP 6 hand-off, when the
user says "done" or moves to a new topic):

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

### Quality bar for proposed rules

Every proposed rule must include:
- A clear "do" or "don't" statement
- The **WHY** (specific moment, specific reason)
- Edge cases if any are obvious

---

## STEP 0 — Read the briefing (parallel)

Before changing anything, read in parallel:

1. `LECTURE-AUTHORING.md` at the repo root — the conventions. The
   figure non-negotiables in §4½ still apply to edits.
2. **The file(s) the user is referring to.** If they said "the
   second figure on 0.4," read `src/pages/chapter/0/0.4.astro` and
   `src/components/scenes/0.4/figures.tsx`. Each lesson is a single
   self-contained `.astro` file — all prose, headings, figures, and
   the Hero tease live inline. **No more MDX content collection.**
3. **`src/data/course-nav.ts` — what it owns and doesn't own now:**
   - It owns: chapter/sub `id`/`title`/`live`/`overviewLive`,
     `RAIL_ANCHORS`, and the URL helpers (`withBase()`, `subPath()`,
     etc.).
   - It no longer owns the lesson Hero tease — that's a literal
     string in the .astro Hero prop now.
   - The `tease` / `description` / `overviewTease` fields are still
     defined and `SubPage.tease` is still read by `MobileNav`, but
     they're not the source of truth for lesson pages or the
     `/chapter/N` deck anymore.
   - Editing rail anchors → `RAIL_ANCHORS["N.M"]`.
   - Editing whether a sub is "live" / "coming soon" → flip `live:
     boolean`; never hard-code "coming soon" in components.
4. **If the edit touches a shared component or global file**, also
   read the consumers:
   - `src/components/shared/FigureFrame.astro` → every page that
     uses it. Includes the global keyboard + wheel navigator.
   - `src/scripts/chapter-runtime.ts` → `tagLessonProse()` auto-adds
     `data-fade` and `.dropcap` to lesson markup. If lesson prose
     looks wrong, this is often the cause.
   - `src/pages/chapter/[num]/index.astro` → the dynamic chapter
     card-grid page (no-prose 5-box deck). Reads `course-nav.ts`.
   - `src/styles/global.css` → potential site-wide ripple; check
     both themes. The `.lesson-prose` block (~line 1799) and the
     `.figure-frame.is-fs` block (~line 459) are the two most likely
     ripple sources.
5. **Reference implementations to match style** — chapter 0 OR
   chapter 1 (both are now gold standard; they share the same
   Hero+tease + lesson-prose conventions):
   - `src/components/scenes/0.1/figures.tsx` — gold-standard figure
     code (figures + `FigurePanel` helper).
   - `src/components/scenes/1.1/figures.tsx` — the
     sibling-detail-box pattern (FourForcesPanel) — the canonical
     reference for fullscreen-safe layouts.
   - `src/pages/chapter/0/0.1.astro` — gold-standard lesson page
     (all-inline pattern).
   - `src/pages/chapter/0/0.0.astro` — gold-standard chapter-
     overview lesson.
6. **For prose edits** referring to the canonical source: the raw
   scrape lives at `knowledgebase/2026-spring/raw_html/pN_M.html`
   (subpages) or `chN.html` (overviews).

## STEP 1 — Locate and confirm

Pin down EXACTLY what's being changed:
- File path
- Function / component / section / line range
- Current behaviour vs requested behaviour

If anything is ambiguous, **ASK**. Examples:
- "Edit the figure on 0.1" → which one? TimeDilation, LightBending,
  or SpacetimeFabric?
- "Make the slider bigger" → bigger value range, bigger UI track,
  or bigger labels?
- "Change the colour" → which element, what colour, why?

Don't guess. One clarifying question is cheaper than editing the
wrong thing.

## STEP 2 — Plan and confirm

Present:
- The exact file(s) and approximate line range that will change.
- A before/after sketch for each affected location.
- Any **ripple effects** you found (other pages that share the
  component, other consumers of a data file).
- Whether the change requires touching `LECTURE-AUTHORING.md` or
  this skill (rare — only if introducing a NEW pattern).

Wait for "go" before STEP 3.

## STEP 3 — Apply the change surgically

Use `Edit` (not `Write`) when possible. Make the **smallest change**
that achieves the user's intent.

- No drive-by formatting changes
- No "while I'm here, also fix Y"
- No refactors unless explicitly requested
- No new dependencies
- No new files unless the change requires one

### Blast radius awareness

Different edits have different risk levels. Higher risk → more
verification later.

| Edit target | Blast radius | Verify (STEP 5) |
|---|---|---|
| One paragraph on one page | Tiny | That page |
| One figure on one page | Small | The page + that figure in fullscreen |
| Per-page nav anchor / title | Small | The page + rail nav appearance |
| `course-nav.ts` (RAIL_ANCHORS, live, title) | Medium | All chapter overviews + every nav surface |
| A shared component (FigureFrame, PrevNext, SiteNav…) | Large | Every page that uses it (sample at least 3) |
| `global.css` (esp. `.lesson-prose`, `.figure-frame.is-fs`) | Largest | Sample 4–5 pages; both themes; mobile; fullscreen-test a figure |
| `chapter-runtime.ts` | Largest | Every chapter page; verify fade-up + dropcap still apply |

If you're editing a component used in 30 places, plan to sample a
representative spread in STEP 5.

## STEP 4 — Re-verify against the non-negotiables

If the edit touches a figure, re-check each rule from
`LECTURE-AUTHORING.md` §4½:

- [ ] **A. Scientific accuracy** — still uses real units, real
      numbers from the literature, real historical anchors? Did you
      accidentally change a value without sourcing it?
- [ ] **B. Fullscreen == enlarged normal mode** — fullscreen still
      shows the SAME layout as normal mode (same control positions,
      caption at the bottom, any detail boxes just above the caption,
      nothing swallowed or repositioned)? If you added new UI to a
      figure, did you make it a SIBLING of `.fig-viz` (not a child)?
- [ ] **C. Keyboard + mouse/trackpad** — ←/→ arrows still work in
      BOTH normal and fullscreen; wheel/pinch still works in
      fullscreen only? Still using FigureFrame's global navigator?
  - `data-shortcut="ArrowLeft"`/`"ArrowRight"` on prev-next buttons,
    OR a `<input type="range">`, OR a ≥2-item numeric `data-shortcut`
    pill set with `.is-active`/`aria-selected="true"`/`aria-pressed="true"`
    on the active one.
  - DON'T add per-figure wheel listeners in normal mode (it would
    steal page scroll).
  - Double-click on `.figure-frame`, `.figure-frame-inner`,
    `.figure-stub`, or `.figure-body` still enters fullscreen — make
    sure new interactive elements you add don't accidentally become
    "panel chrome".
  - Figure DOM still
    `<figure.figure-stub> → <div.figure-body> → <figcaption>`,
    exactly one non-figcaption body wrapper.
  - Tab order still logical; ESC still exits.
- [ ] **D. Math typography** — any new math still rendered via
      Unicode glyphs (or KaTeX explicitly via `katex.renderToString`)?
      Never raw `a^b`. No `$…$` in .astro — it won't render.
- [ ] **E. Page-layout invariants** — `.prose-cosmic` + `.lesson-prose`
      pair still in place on the wrapper div? Body text still
      left-aligned within the centred column?
- [ ] **Typography uniformity** — runtime auto-tags handle paragraph
      classes; if you added a non-`<p>` element to lesson prose, does
      it still respect the visual rhythm?

If the edit touches **prose only**, check D and E.

If the edit touches a **shared component or global CSS**, also
re-check B (figures still render at all sizes), C (FigureFrame
navigator still works), and E (centring intact) on a sample of
pages from chapters 0 and 1.

## STEP 5 — Build + preview + walk neighbours

```bash
# Kill any stale astro dev/preview from earlier sessions FIRST.
pkill -f "astro dev" 2>/dev/null
pkill -f "astro preview" 2>/dev/null

npm run build
npm run preview   # serves dist/ on localhost (defaults to 4321)
```

Walk through, in this order:

1. The edited page / component itself.
2. 2–3 NEIGHBOURING pages of the same type, to catch regressions
   from any shared code you touched. (See blast-radius table above
   for sampling guidance.)
3. If you edited `course-nav.ts`, also walk `/chapter/N` (the card
   grid) AND any lesson page that references the changed field.
4. Both themes (dark default + light via theme toggle).
5. Mobile portrait (DevTools responsive view).
6. `prefers-reduced-motion: reduce` (DevTools rendering panel).
7. **If you touched a figure, fullscreen it and confirm:**
   - The fullscreen layout looks IDENTICAL to normal — controls in
     the same place, caption at the bottom, detail box just above
     the caption.
   - No "gibberish text" leak on the left half (Astro hydration
     script source becoming visible).
   - ←/→ arrows scrub the figure in BOTH normal AND fullscreen.
   - Wheel/pinch scrubs in fullscreen only (page scrolls normally
     over the figure in normal view).
   - Double-clicking the panel chrome enters fullscreen.

If anything broke, **fix it before handing off.** Don't accept
regressions. The rest of the site must stay alive.

## STEP 6 — Hand off

Report to the user:
- Files / lines changed.
- The behaviour change you verified.
- Neighbouring pages walked, with any observations.
- Anything you noticed but did NOT change (flag for follow-up; don't
  silently fix things outside scope).
- The next step you did NOT take: **`git push` triggers the live
  deploy.** Wait for explicit "deploy / push / ship" approval.

End. Do not push, do not commit without explicit go-ahead.

## Hard rules (do not violate)

1. **No drive-by refactors.** The edit must be the smallest change
   that achieves the user's intent.
2. **No silent regressions.** Always preview and walk neighbours.
3. **No improvising new patterns.** If the edit requires a new
   component type, slider behaviour, layout, etc. that doesn't exist
   in the codebase, stop and propose options. Do not invent a new
   pattern just to satisfy the edit.
4. **Figure non-negotiables still apply.** Sci accuracy, fullscreen
   equals enlarged normal, keyboard arrows in both modes + mouse/
   trackpad in fullscreen only, math typography, centring.
5. **Fullscreen mode == enlarged normal mode.** Same layout, same
   control positions, same caption placement, same detail-box
   placement. If you add new UI to a figure, make it a SIBLING of
   `.fig-viz`, NOT a child — the global fullscreen CSS rewrites
   `.fig-viz` into a centered flex container that swallows children.
   (Per user instruction, 2026-05-25.)
6. **Every figure must support keyboard arrows in BOTH normal and
   fullscreen, AND mouse/trackpad wheel/pinch in fullscreen.** No
   exceptions. If your edit could break this (e.g. removing a
   slider, removing data-shortcut markers, restructuring a pill
   set), ensure the figure still satisfies one of FigureFrame's
   resolution patterns: arrow-shortcut buttons, native range slider,
   or numeric-shortcut pill set with `.is-active`.
7. **New pages must match the exact style of chapters 0 and 1.**
   Both are now gold standard. Don't improvise typography, spacing,
   or layout.
8. **Never use `:first-child` to target the figure-stub from CSS.**
   Astro's `client:visible` directive inserts a hydration `<script>`
   tag as the first child of `.figure-frame-inner`; the
   `:first-child` selector would force `display: flex !important` on
   it and render the JavaScript bootstrap source as visible
   "gibberish" text in the left half of the fullscreen viewport.
   Always target `.figure-stub` directly.
9. **Don't break the FigureFrame global navigator's contracts.**
   - Wheel/pinch is fullscreen-only by design — don't add a wheel
     listener that fires in normal mode.
   - Double-click on `.figure-frame`, `.figure-frame-inner`,
     `.figure-stub`, `.figure-body` opens fullscreen. Don't add
     other elements to that whitelist, and don't put interactive
     controls bare inside those wrappers without their own data-
     shortcut or button semantics.
   - ←/→ resolution order is data-shortcut button → first slider →
     numeric pill set. Don't bolt on per-figure keydown for arrows.
10. **Lesson tease is a literal string in `<Hero tease="..." />`.**
    Don't pull from `course-nav.ts` — the lookup pattern was
    removed. The `tease` field on `subs[]` is mostly dead (MobileNav
    is the one remaining reader).
11. **Typography uniformity for non-figure paragraphs.** Hero tease
    + lesson body paragraphs all use `text-[1.05em] leading-[1.74]`
    (matching `.prose-cosmic > p`). The lesson runtime handles
    `<p>` tags automatically — don't add per-element class lists.
12. **No MDX, no content collection.** If the user asks to "edit
    the content" of a lesson, the answer is to edit the `.astro`
    file directly. `src/content/` does not exist.
13. **Math via Unicode glyphs** (mc², 10⁻⁴³, W⁺, ⁻²², etc.) in
    .astro and .tsx. No `$…$` LaTeX — it won't render outside MDX,
    and MDX is gone.
14. **No `git push` without explicit approval** — push triggers
    live deploy.
15. **No new dependencies** without explicit reason.
16. **No SSR / server runtime.** Static output only.
17. **`prefers-reduced-motion` fallback** required for any motion
    change.
18. **Don't change unrelated files.** If a typo or smell in a
    neighbouring file catches your eye, flag it in the hand-off — do
    not "while I'm here" it.

## When something is missing or unclear

- If the file/component the user pointed to doesn't exist → ask;
  perhaps they meant `/ast100-create`.
- If the change requires a NEW pattern not present in the codebase →
  stop and propose 2–3 alternatives that reuse existing patterns
  before improvising.
- If the edit would break a figure non-negotiable → stop and ask. The
  rules are not optional.

## Speed tip

When you have many independent files to inspect (e.g. several
neighbour pages and their figure components), read them as **parallel
tool calls in a single message** — don't serialise reads that don't
depend on each other. When edits cleanly split across multiple files
or lessons, dispatch agents in parallel — the user prefers this.

## Quick reference: where things live

| Thing | Path |
|---|---|
| Gold-standard lesson pages | `src/pages/chapter/0/0.1.astro`, `src/pages/chapter/1/1.1.astro` |
| Gold-standard chapter-overview lesson (`N.0`) | `src/pages/chapter/0/0.0.astro` |
| Dynamic chapter card-grid page (`/chapter/N`) | `src/pages/chapter/[num]/index.astro` (no-prose 5-box deck) |
| Gold-standard Hero (with `tease` prop) | `src/components/scenes/0.1/Hero.tsx` |
| Gold-standard figures + `FigurePanel` helper | `src/components/scenes/0.2/figures.tsx`, `0.4/figures.tsx`, `1.1/figures.tsx` |
| FigureFrame (shared, global navigator) | `src/components/shared/FigureFrame.astro` |
| PrevNext (per-scene template) | `src/components/scenes/0/PrevNext.astro` |
| Course nav + helpers | `src/data/course-nav.ts` |
| Lesson runtime (data-fade + dropcap auto-tag) | `src/scripts/chapter-runtime.ts` |
| `.lesson-prose` CSS + `.figure-frame.is-fs` rules | `src/styles/global.css` |
| Canonical scrape (raw HTML) | `knowledgebase/2026-spring/raw_html/` |
| Source media | `knowledgebase/2026-spring/media/` |
| Deep convention doc (reference) | `LECTURE-AUTHORING.md` at the repo root |
| Sister skill (new lessons) | `.claude/skills/ast100-create/SKILL.md` |

Both chapters 0 and 1 are gold-standard now — pick either as a
reference. They share the same Hero+tease + auto-numbered-h2 +
lesson-prose conventions.
