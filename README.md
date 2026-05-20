# AST 100 — Our Cosmic History

Welcome. This repository builds the interactive astronomy course site
that lives at **[cassa.site/courses/ast100](https://cassa.site/courses/ast100)**.

It's an Astro 6 + React 19 + Tailwind 4 static site. You write content,
Claude Code (or you, by hand) builds it, and a GitHub Action ships it
to Bluehost on every push.

This README is a **collaboration walkthrough**. Whether you're adding a
new lesson or fixing a typo, read it once and follow the steps.

---

## What's in here

```
ast100/
├── src/                          ← the live Astro app (every change goes here)
│   ├── pages/chapter/N/N.M.astro   each lesson page
│   ├── components/scenes/N.M/      hero, figures, prev/next for that lesson
│   ├── content/chapter/            content collection (MDX with frontmatter)
│   ├── data/course-nav.ts          the nav registry — single source of truth
│   ├── layouts/                    page shells
│   ├── scripts/                    plain TS for runtime polish
│   └── styles/global.css           design tokens + custom CSS
├── knowledgebase/2026-spring/    ← scraped source content + figure images
│   ├── raw_html/                   per-page raw HTML scrape (your input)
│   ├── media/                      every figure / photo / chart
│   └── SPEC.md                     spec for the parallel plain-HTML site
├── .claude/skills/               ← two slash commands that drive the work
│   ├── ast100-create/              create a new lesson or chapter overview
│   └── ast100-edit/                tweak / fix / fine-tune an existing one
├── LECTURE-AUTHORING.md          ← deep convention guide (read once, end to end)
├── .github/workflows/deploy.yml  ← auto-deploys to Bluehost on push to main
└── astro.config.mjs              ← `base: '/courses/ast100'` lives here
```

---

## First-time setup (only once)

You need:

1. **Node 22.12 or newer.** Install from [nodejs.org](https://nodejs.org).
2. **This repo, cloned:**
   ```bash
   git clone git@github.com:cassaiub/ast100.git
   cd ast100
   ```
3. **Claude Code** in your terminal — install from
   [claude.ai/code](https://claude.com/claude-code).

Then install the project dependencies:

```bash
npm install
```

That takes about a minute. Now you're ready to work.

---

## The daily workflow

Do these steps **every time** you sit down to work. They're simple, but
order matters.

### Step 1. Pull the latest changes

Before you touch anything, sync with the remote:

```bash
git pull
```

This pulls in whatever your collaborator (supervisor, teammate)
pushed since you last worked. If there's nothing new, it's a no-op.
If there ARE new commits, they merge cleanly into your local copy.

> **Why this matters:** if you skip the pull and start working on stale
> code, you'll have merge conflicts later — annoying to clean up.
> **Always pull first.**

### Step 2. Decide what kind of work you're doing

There are two flavours:

- **A. Creating a NEW lesson or chapter overview**
  The page doesn't exist yet. You want to build it from the canonical
  scraped content in `knowledgebase/2026-spring/raw_html/`.
  → Use **`/ast100-create`**.

- **B. Editing / fixing / tweaking an EXISTING one**
  The page is already live. You want to change a paragraph, fix a
  number, rename a section, polish a slider.
  → Use **`/ast100-edit`**.

> **Tip:** if you're unsure, just say in plain English what you want
> to do. Claude reads the skill descriptions and picks the right one
> automatically.

### Step 3. Open Claude Code

In your terminal, inside the `ast100/` folder:

```bash
claude
```

(Or open the project in your IDE if you use the VS Code / JetBrains
extension.)

### Step 4. Invoke the right skill — ONCE

Type one of these in the chat:

```
/ast100-create 2.1
```
…to build lesson 2.1 from scratch.

```
/ast100-edit the LightBending slider on 0.1 should start at 0.5 M☉
```
…to tweak something specific.

Once you invoke the skill, Claude:

1. Reads the deep convention guide (`LECTURE-AUTHORING.md`).
2. Reads the gold-standard files (chapter 0 and 1 are the reference).
3. Shows you a **plan** — what files will change, what figures will be
   built or edited, what could ripple elsewhere.
4. **Waits for your "go"** before writing or editing any code.

You only invoke the skill **once per session.** After it's running,
keep chatting normally:

```
make the section header bigger
the caption should mention Eddington 1919
also fix the typo two paragraphs down
```

Claude stays in skill mode for the whole conversation. No need to type
`/ast100-edit` again every time.

### Step 5. Check it locally — ALWAYS

After Claude finishes (or whenever you want to see what something
looks like), build and preview:

```bash
npm run build
npm run preview
```

Open the URL it prints (usually
`http://localhost:4321/courses/ast100/`) and walk through these checks:

- **The page you changed** — does it look right?
- **One or two neighbouring pages** — did anything else break? (If
  you edited a shared component, check more.)
- **Fullscreen the figure** — click the `⛶ Fullscreen` button. Does
  the figure re-layout properly, or does it just scale a tiny canvas?
- **Keyboard test** — press **Tab** through the controls. Every
  slider, button, drag-handle should be reachable. Try arrow keys on
  sliders, Enter/Space on buttons.
- **Light mode** — click the theme toggle (☼/☾ button). Both themes
  must work.
- **Mobile view** — open DevTools (F12), enable responsive mode
  (Ctrl/Cmd+Shift+M), set width to ~360px. Check the controls are
  reachable and nothing scrolls horizontally.
- **Reduced motion** — in DevTools rendering panel, emulate
  `prefers-reduced-motion: reduce`. Animations should be replaced by
  static fallbacks, not just removed.

> **Why this matters so much:** there's no staging environment. The
> moment you push, the change goes live on the public site. If a
> regression slips past you here, it slips past your students too.

### Step 6. Commit your changes

When you're satisfied:

```bash
git add .
git commit -m "Short, plain-English description of what you changed"
```

Good commit messages:

- `Add lesson 2.1 The Milky Way`
- `Fix LightBending slider starting value at Eddington 1919 reference`
- `Tweak EnergyRateDensity caption`
- `Rename section 3.2 from "evolution" to "complexity"`

Skip-able details: emojis, conventional-commit prefixes, ticket
numbers. Just say what you did in one line.

### Step 7. Push — this is the deploy

```bash
git push
```

**The moment this finishes, the deploy starts.** Within ~5 minutes:

1. GitHub Actions runs `npm ci` + `npm run build`.
2. It rsyncs the resulting `dist/` folder to Bluehost over SSH.
3. The change is live at **cassa.site/courses/ast100**.

You can watch the build progress in the **Actions** tab on GitHub.

> **⚠️ Important.** `git push` IS the deploy. There's no separate "ship
> it" step. Always run `npm run preview` and walk through the page
> **before** every push.
>
> If you discover a problem after pushing:
> - **Fastest:** make another commit that fixes it, then push again.
> - **Rollback:** `git revert HEAD && git push` — this undoes the last
>   commit and re-deploys the previous version.

---

## What lives where

| You want to… | Look at… |
|---|---|
| Understand all the conventions in one read | `LECTURE-AUTHORING.md` |
| See how a finished lesson is structured | `src/pages/chapter/0/0.1.astro` |
| See how figures are written | `src/components/scenes/0.1/figures.tsx` |
| See the chapter-overview pattern | `src/pages/chapter/1/1.0.astro` |
| Update the nav (mark a lesson live, add a rail anchor) | `src/data/course-nav.ts` |
| Find a source figure or scraped text | `knowledgebase/2026-spring/` |
| Tweak global styles or design tokens | `src/styles/global.css` |
| See the deploy script | `.github/workflows/deploy.yml` |

---

## Rules of the road (the short version)

The full list lives in `LECTURE-AUTHORING.md` §7. Highlights:

1. **No AI-generated images.** Concept illustrations are out. Replace
   them with a small bespoke interactive (slider, scrubber, chart).
   Real photos and data plots are fine.
2. **Every interactive figure must be:**
   - **Scientifically accurate** — real units (γ, erg/g/s, Mpc, Gyr,
     M☉), real numbers from the literature, real historical anchors
     (Eddington 1919, Penzias & Wilson, etc.).
   - **Fullscreen-ready** — re-lays out at default, fullscreen, and
     mobile sizes. Not just scaled.
   - **Keyboard-operable** — every control works via Tab + arrow keys
     in both normal AND fullscreen states.
3. **Math must render properly.** Use `$E = mc^2$` in MDX, Unicode
   glyphs (γ, M☉, ε₀, √, π) or `katex.renderToString()` in figures.
   **Never raw `a^b` or `x_2`.**
4. **The prose column stays horizontally centred.** Don't remove
   `mx-auto` from the prose container. Body text stays left-aligned
   within the centred column.
5. **Every animation needs a `prefers-reduced-motion` fallback** —
   not just "skip the animation," a static version of what it teaches.
6. **No `git push` without local preview.** Build, preview, walk through.
7. **No new dependencies** without discussing it first.
8. **No `tailwind.config.js`.** Tailwind v4 is CSS-first here.

---

## When you're stuck

- **Ask Claude.** "How do I add a section to 2.1?", "the figure isn't
  centring, what's wrong?", "why does the build fail?". The skill
  knows the codebase.
- **For deep convention questions:** open `LECTURE-AUTHORING.md` and
  scroll the table of contents.
- **For build errors:** read the error message carefully. The file
  path it points to is usually where the problem is.
- **For deploy issues:** open the **Actions** tab on GitHub and read
  the failing workflow log.

---

## Quick-reference cheat sheet

```bash
# At the start of every session:
git pull
claude

# In Claude — invoke ONCE per session:
/ast100-create 2.1                              # new lesson
/ast100-edit fix the typo in 0.3 paragraph 2    # tweak existing

# Check your work before pushing:
npm run build
npm run preview      # open http://localhost:4321/courses/ast100/

# Ship it:
git add .
git commit -m "what you did"
git push             # ← triggers the live deploy

# Oops, rollback:
git revert HEAD
git push
```

---

## A note on `knowledgebase/`

The `knowledgebase/2026-spring/` folder is **internal reference
content** — the verbatim scrape of the source DokuWiki pages, with
all original figures in `media/`. It is **not** a deployed site. You
read from it (as your canonical content source when porting a new
lesson), but you don't build from it for production.

Don't mix its design system (Orbitron + Inter, teal/gold) with the
Astro app's design system. They serve different purposes.

---

## Evolving the skills (we improve them together)

The two skills (`/ast100-create` and `/ast100-edit`) are **plain text
files** in this repo:

- `.claude/skills/ast100-create/SKILL.md`
- `.claude/skills/ast100-edit/SKILL.md`
- `LECTURE-AUTHORING.md` (the deep convention guide both skills read)

As you work with them, you'll notice things Claude got wrong, rules
you wished it knew, or new conventions the team agreed on. **Encode
those lessons** so the next session doesn't repeat the mistake. Over
weeks, the skills get sharper as the team's collective experience
accumulates.

### What's worth encoding

Worth adding:
- A "do" or "don't" that prevented (or would have prevented) a real
  mistake
- A new convention the team agreed on
- A pattern that emerged across multiple lessons
- A scientific accuracy gotcha (e.g. a unit convention, a citation
  preference, a value that should always come from a specific source)

Not worth adding:
- One-off taste calls specific to a single lesson
- Personal preferences without a clear rationale
- Anything you couldn't explain to a brand-new teammate

### Where to put it

| What you're adding | Goes in… |
|---|---|
| A new "do" or "don't" / hard rule | `## Hard rules` of the relevant `SKILL.md` AND `§7. Hard rules` of `LECTURE-AUTHORING.md` |
| A new figure convention / pattern | `§4½. Figure non-negotiables` of `LECTURE-AUTHORING.md` |
| A new component or shared utility | A new sub-section in `LECTURE-AUTHORING.md` §4 component conventions |
| A workflow change | The relevant `## STEP N` in the `SKILL.md` |
| A new "where to look" reference | The quick-reference table at the bottom of the `SKILL.md` |

### How updates happen

**Most updates happen automatically.** While you work through a session
with `/ast100-create` or `/ast100-edit`, Claude watches the conversation
for **corrections, new rules you state explicitly, repeated requests,
or signs that a non-obvious approach worked.** At natural break points,
Claude pauses and proposes a diff:

> "I noticed a rule worth recording: never `text-align: center` on
> long-form body paragraphs (you corrected me on this for 0.3 §2).
> Here's the proposed diff — add as a hard rule in both `SKILL.md`
> and `LECTURE-AUTHORING.md` §7. Apply?"

You approve or decline. If you approve, Claude makes the edit; you
commit + push as part of the regular workflow.

**You can also edit manually** if you already know what to write —
open `.claude/skills/<skill>/SKILL.md` or `LECTURE-AUTHORING.md` in
your editor, add the rule, commit, push. Skip Claude entirely.

Either way: include the **WHY** (next subsection).

### Always include the WHY

Every new rule should explain why it exists. Compare:

> ❌ "Don't put `text-align: center` on body paragraphs."

> ✅ "Don't put `text-align: center` on body paragraphs. Reason: long
> centred lines are unreadable; the supervisor flagged 0.4 v2 for this
> on 2026-05-18. The centred-column-with-left-aligned-text pattern in
> `prose-cosmic` is the standard. Edge case: short pull-quotes and
> captions can be centre-aligned because the line length is short."

The "why" helps the next person (and the next Claude) judge edge cases
instead of just blindly applying the rule.

### How updates reach the rest of the team

1. You commit + push the rule update to `main`.
2. Your teammate runs `git pull` at the start of their next session.
3. Their next `/ast100-create` or `/ast100-edit` invocation reads the
   updated `SKILL.md`. The new rule is now part of their Claude's
   instructions automatically.
4. If two people add rules in parallel, git merges them cleanly —
   numbered rule lists just append.

That's it. **The skills become the team's shared, evolving brain for
this project.**

---

## Credits

Content: **K.M.B. Asad** with NotebookLM and Claude
&nbsp;·&nbsp; Review: **S.A. Uddin**

Website designed with ♥ by **M.O.B. Jihad** with **Claude Code**.
