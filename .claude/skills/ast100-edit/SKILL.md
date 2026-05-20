---
name: ast100-edit
description: Edit, tweak, fix, or fine-tune an existing AST 100 lesson, chapter overview, figure, section, prose paragraph, data file, or shared component without breaking site-wide conventions or causing regressions. Invoke when the user types "/ast100-edit ..." or asks to edit/fix/tweak/change/update/modify an existing part of the site, e.g. "tweak the slider on 0.1", "fix the typo in 2.3", "make the timeline event read X instead of Y", "the section header in 3.2 should be different", "shrink the figure on 0.4", "the LightBending slider should start at 0.5 M☉". Once invoked, the skill stays active for the whole session — the user does not need to re-trigger for follow-up tweaks. Preserves the figure non-negotiables (scientific accuracy, fullscreen-ready, keyboard-operable, math typography, page centring) and all other conventions documented in LECTURE-AUTHORING.md.
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
   twice or more in the session (or across lessons, if the user
   mentions it).

### What to do when you spot one

At a natural break point (end of STEP 2 plan, end of STEP 4 re-verify,
end of STEP 5 preview, end of STEP 6 hand-off, when the user says
"done" or moves to a new topic):

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

## STEP 0 — Read the briefing (parallel)

Before changing anything, read in parallel:

1. `LECTURE-AUTHORING.md` at the repo root — the conventions. The
   figure non-negotiables in §4½ still apply to edits.
2. **The file(s) the user is referring to.** If they said "the second
   figure on 0.4," read `src/pages/chapter/0/0.4.astro` and
   `src/components/scenes/0.4/figures.tsx`.
3. **If the edit touches a shared component or global file**, also
   read the consumers:
   - `src/components/shared/FigureFrame.astro` → every page that uses it.
   - `src/data/course-nav.ts` → `SiteNav`, `MobileNav`, `Rail`,
     prev/next defaults, the dynamic `[num]/index.astro`.
   - `src/styles/global.css` → potential site-wide ripple; check
     both themes.
4. **Reference implementations to match style**:
   - `src/components/scenes/0.1/figures.tsx` — gold standard for
     figure code.
   - `src/pages/chapter/0/0.1.astro` — gold standard for page
     structure.
5. **For prose edits** referring to the canonical source: the raw
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
| `course-nav.ts` | Medium | All chapter overviews + every nav surface |
| A shared component (FigureFrame, PrevNext, SiteNav…) | Large | Every page that uses it (sample at least 3) |
| `global.css` | Largest | Sample 4–5 pages; both themes; mobile |

If you're editing a component used in 30 places, plan to sample a
representative spread in STEP 5.

## STEP 4 — Re-verify against the non-negotiables

If the edit touches a figure, re-check each rule from
`LECTURE-AUTHORING.md` §4½:

- [ ] **A. Scientific accuracy** — still uses real units, real
      numbers from the literature, real historical anchors? Did you
      accidentally change a value without sourcing it?
- [ ] **B. Fullscreen-ready** — still re-lays out at default,
      fullscreen, and mobile portrait sizes?
- [ ] **C. Keyboard-operable** — still operable in both normal and
      fullscreen modes? Tab order still logical?
- [ ] **D. Math typography** — any new math still rendered via KaTeX
      or Unicode glyphs? Never raw `a^b`?
- [ ] **E. Page-layout invariants** — prose column still
      `mx-auto`-centred? Body text still left-aligned within it?

If the edit touches **prose only**, check D and E.

If the edit touches a **shared component or global CSS**, also
re-check B (figures still render at all sizes) and E (centring
intact) on a sample of pages.

## STEP 5 — Build + preview + walk neighbours

```bash
npm run build
npm run preview   # serves dist/ on localhost
```

Walk through, in this order:

1. The edited page / component itself.
2. 2–3 NEIGHBOURING pages of the same type, to catch regressions
   from any shared code you touched. (See blast-radius table above
   for sampling guidance.)
3. Both themes (dark default + light via theme toggle).
4. Mobile portrait (DevTools responsive view).
5. `prefers-reduced-motion: reduce` (DevTools rendering panel).

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
4. **Figure non-negotiables still apply.** All five rules (sci
   accuracy, fullscreen, keyboard, math, centring) apply to edits,
   not only to new figures.
5. **No `git push` without explicit approval** — push triggers live
   deploy.
6. **No new dependencies** without explicit reason.
7. **No SSR / server runtime.** Static output only.
8. **`prefers-reduced-motion` fallback** required for any motion change.
9. **Don't change unrelated files.** If a typo or smell in a
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
depend on each other.

## Quick reference: where things live

| Thing | Path |
|---|---|
| Gold-standard lesson | `src/pages/chapter/0/0.1.astro` |
| Gold-standard figures | `src/components/scenes/0.1/figures.tsx` |
| FigureFrame (shared) | `src/components/shared/FigureFrame.astro` |
| PrevNext (per-scene template) | `src/components/scenes/0/PrevNext.astro` |
| Course nav + helpers | `src/data/course-nav.ts` |
| Design tokens | `src/styles/global.css` (`@theme` block) |
| Canonical scrape (raw HTML) | `knowledgebase/2026-spring/raw_html/` |
| Source media | `knowledgebase/2026-spring/media/` |
| Deep convention doc | `LECTURE-AUTHORING.md` at the repo root |
| Sister skill (new lessons) | `.claude/skills/ast100-create/SKILL.md` |
