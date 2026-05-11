---
name: "feature-doc"
description: "Use when the user wants documentation generated for a feature branch — summarizes the commits between the current branch and main into a structured doc (overview / changes / how to test / risk). Output goes to docs/features/<branch>.md."
---

# Feature Documentation

Generate a feature-branch documentation file from the commits that diverge from
`main`. This is meant to be run **just before opening a PR** or **just after
merging** to leave a durable record of what shipped and why.

## Inputs

- **branch** (optional) — defaults to the current branch
- **base** (optional) — defaults to `main`; falls back to `master` if `main`
  doesn't exist

## Process

### Step 1 — Gather the raw material

Run in parallel:

```bash
git rev-parse --abbrev-ref HEAD             # current branch name
git log <base>..HEAD --pretty=fuller        # commits with author + date
git diff <base>...HEAD --stat               # files changed + line counts
git diff <base>...HEAD                      # full diff (for content summary)
```

### Step 2 — Read project context

Read `.claude/CLAUDE.md` and `README.md`. The generated doc should use the
project's vocabulary (component names, hook names, scope names from
`commit-message` skill).

### Step 3 — Render the doc

Write to `docs/features/<branch>.md`. Create `docs/features/` if it doesn't exist.

Use this template literally:

```markdown
# <Feature title>

> Branch: `<branch>` → `<base>` · <count> commits · <files> files changed
> Period: <first commit date> – <last commit date>

## Overview

<2–4 sentences: what this feature does for the user, written in plain language.
Pull from commit subjects and bodies. Avoid restating the diff.>

## Changes

### New
- `src/components/<File>.tsx` — <one-line purpose>

### Modified
- `src/App.tsx` — <one-line what changed>

### Removed
- <file path> — <one-line why>

## How to test

1. <Steps the reviewer follows in the dev server to see the feature work.
   Derived from what the diff actually does, not boilerplate.>
2. ...

## Risk & rollback

- **Risk:** <largest risk this change carries — perf, data, breakage scope>
- **Rollback:** `git revert <merge-commit>` is safe / unsafe because <reason>
- **Migration:** <none / required steps>

## Related

- Commits: <count> on `<branch>`
- Issues: <linked issue IDs if mentioned in commit bodies>
```

### Step 4 — Don't overpromise

Mark sections **"(not enough info — please review)"** if:
- No issue IDs were mentioned anywhere → `Related → Issues`
- The diff has zero UI changes → drop the "How to test" UI steps and replace
  with API/unit-test steps
- The branch has 1 trivial commit → keep the doc to one paragraph, don't pad

### Step 5 — Report

Show the user the saved path and the first 30 lines as a preview:

```markdown
## Feature doc generated

**File:** docs/features/feat-city-picker.md (78 lines)

\`\`\`markdown
# City picker
> Branch: feat/city-picker → main · 5 commits · 7 files changed
...
\`\`\`

Next: review, edit, and link from the PR description.
```

## Rules
- **Don't fabricate.** If the commits don't say *why*, don't invent a motivation
  — write `(motivation not captured in commit bodies; ask author)`.
- **Don't summarise the diff line-by-line.** A `git diff` already does that.
  The doc's job is to make the *intent* legible.
- **Don't write tests as part of this skill** — that's the `test-writer`
  subagent. This skill is documentation only.
- **Overwrite** an existing `docs/features/<branch>.md` only after confirming
  with the user. Otherwise append `-v2` and write a new file.
