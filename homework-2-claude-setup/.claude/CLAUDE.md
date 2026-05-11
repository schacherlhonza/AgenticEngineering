# Weather Dashboard — Project Guide for Claude

This is a small React + TypeScript + Vite weather dashboard. It fetches current
weather + a short forecast from the public **Open-Meteo** API (no key required)
and renders it with Tailwind CSS.

The goal of this project is to be a **realistic playground** for the Claude Code
configuration in `.claude/` — subagents, skills and MCP servers shipped with this
repo are wired to the patterns below.

## Tech stack

- **Vite** + **React 18** + **TypeScript** (strict mode on)
- **Tailwind CSS** for styling
- **Vitest** + **React Testing Library** for tests
- **ESLint** (flat config) for linting
- Package manager: **npm**
- Target Node: **>= 20**

## Project layout

```
src/
├── api/            HTTP clients (Open-Meteo, geocoding)
├── components/     Presentational React components (PascalCase)
├── hooks/          Custom hooks (camelCase, prefix `use`)
├── App.tsx         Top-level composition
└── main.tsx        Vite entry
```

## Conventions

### Components
- One component per file, file name matches export (`WeatherCard.tsx`).
- Props are an exported `type Props = {...}` above the component.
- Prefer function components with hooks. No class components.
- Tailwind utility classes inline; no CSS Modules unless a class set is reused
  4+ times.

### Hooks
- Custom hook files live in `src/hooks/`. Each file exports exactly one hook.
- Hooks fetching remote data return `{ data, error, isLoading, refetch }`.

### API clients
- All HTTP calls go through a function in `src/api/`. Components never call
  `fetch` directly — they go through a hook that calls an api client function.
- Functions accept a typed input and return a typed result (or throw).

### Tests
- Co-locate: `Foo.tsx` ↔ `Foo.test.tsx`.
- Test the public behaviour (what the user sees), not implementation details.
- Use `screen.getByRole` over `getByTestId` where reasonable.

## Coding principles

1. **Simple over clever** — readable code wins.
2. **No premature abstraction** — three similar lines are fine; abstract on the
   fourth or when intent diverges.
3. **No dead code, no TODOs** — delete instead of commenting out.
4. **Strict types** — no `any`, no `@ts-ignore` without a one-line explanation.
5. **Error handling at boundaries** — API client throws, hooks expose `error`,
   UI renders an error state. Don't catch-and-ignore.

## Commands

```bash
npm install         # install deps
npm run dev         # start Vite dev server (http://localhost:5173)
npm run build       # type-check + production build
npm run test        # run Vitest in watch mode
npm run test:run    # run Vitest once (CI mode)
npm run lint        # ESLint
```

## When working on this repo

- Before claiming a UI change is done, **start the dev server and verify in the
  browser**. Type-check passing is not the same as the feature working.
- Don't add a state-management library. `useState` + props is fine for this
  size of app.
- Don't introduce a CSS framework other than Tailwind.
- Don't add API keys or paid services — Open-Meteo is intentionally keyless.

## Claude tooling shipped with this repo

- **Subagents** (`.claude/agents/`) — `code-reviewer`, `test-writer`,
  `dead-code-analyzer`, `ui-component-builder`. Delegate to them rather than
  doing the work inline when the task matches their description.
- **Skills** (`.claude/skills/`) — `component-scaffold`, `screenshot`,
  `commit-message`, `api-client-gen`, `feature-doc`. Invoked via the Skill tool.
- **MCP** (`.mcp.json`) — Figma (design context), Context7 (live library docs),
  Filesystem (sandboxed FS access).
