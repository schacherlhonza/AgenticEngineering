---
name: "commit-message"
description: "Use when the user asks for a commit message based on the current diff, or wants to write a conventional-commits style message. Produces a structured message (type(scope): subject + optional body). Does NOT run git commit unless the user explicitly asks."
---

# Commit Message

Generate a [Conventional Commits](https://www.conventionalcommits.org/) style
message from the staged + unstaged diff on the current branch.

## Format

```
<type>(<scope>): <subject>

<body — what changed and why, wrapped at ~72 chars>

<optional footer — BREAKING CHANGE: ... / Refs #123>
```

### Types

- `feat` — new user-visible feature
- `fix` — bug fix
- `refactor` — code change that neither fixes a bug nor adds a feature
- `test` — adding / fixing tests
- `docs` — documentation only
- `chore` — tooling, deps, config (no behaviour change)
- `perf` — performance improvement
- `style` — formatting only (no logic change)

### Scope

Lowercase area of the codebase. For this project, valid scopes are usually:
- `weather` — anything in `src/api/openMeteo.ts` or weather rendering
- `ui` — anything purely visual in `src/components/`
- `hooks` — `src/hooks/`
- `build` — `vite.config.ts`, `package.json`, tsconfig
- `claude` — `.claude/` config, agents, skills

If multiple scopes apply, drop the scope rather than listing more than one.

### Subject line

- **Imperative present tense** — "add city picker", not "added" or "adds"
- **Lowercase** first letter
- **No trailing period**
- **≤ 72 characters**, ideally ≤ 50

### Body (optional but encouraged)

Explain **why**, not what. The diff already shows what. Anchor the why in:
- the user-visible behaviour change
- the bug being fixed (cite issue ID if mentioned)
- the design decision and the alternative that was rejected

## Process

1. Read the diff:
   - `git status`
   - `git diff` and `git diff --staged`
   - `git log -5 --oneline` to match the repo's prior commit style
2. Identify the dominant change. If the diff contains a mix of unrelated
   changes, **say so** and propose splitting into multiple commits rather than
   producing one Frankenmessage.
3. Draft the message.
4. Present it to the user as a fenced block they can copy. Do **not** run
   `git commit` unless the user explicitly asks ("commit it", "go ahead and
   commit").

## Output

```markdown
## Proposed commit

\`\`\`
feat(weather): show 7-day forecast in WeatherCard

Open-Meteo's daily endpoint returns up to 7 days; surfacing them lets the user
plan further ahead without leaving the dashboard. The forecast row reuses
WeatherIcon so we don't add any new visual primitives.
\`\`\`

To commit: confirm and I'll run `git commit`.
```

## Rules
- **Never invent context** — if you don't know *why*, ask before guessing.
- **Never include "Co-Authored-By: Claude"** in this skill's output. The harness
  adds that automatically when needed.
- **Never use `git commit -m`** with a multi-line message — use a heredoc.
- **Refuse to commit secrets.** If the diff includes a `.env` file, an API key,
  or anything that looks like credentials, surface that and stop.
