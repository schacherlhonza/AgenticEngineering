# Homework 2 — Claude Code Agent Setup

Domácí úkol pro kurz **Agentic Engineering / Vibe Coding** — kompletní
nastavení Claude Code (subagenti, skilly, MCP servery) zabalené kolem
funkčního ukázkového projektu.


## Co najdeš v repu

### Ukázkový projekt — React Weather Dashboard

Malý funkční web ve **Vite + React 18 + TypeScript + Tailwind**, který si tahá
počasí z [Open-Meteo](https://open-meteo.com/) (bez API klíče). Slouží jako
realistický playground, aby Claude měl o čem přemýšlet.

```
src/
├── api/openMeteo.ts        # HTTP client pro Open-Meteo
├── components/
│   ├── CityPicker.tsx      # dropdown s českými městy
│   └── WeatherCard.tsx     # zobrazení aktuálního počasí + 7denní forecast
├── hooks/useWeather.ts     # hook s { data, error, isLoading, refetch }
├── App.tsx
└── main.tsx
```

**Spuštění:**

```bash
cd homework-2-claude-setup
npm install
npm run dev          # http://localhost:5173
npm run test:run     # Vitest
npm run build        # type-check + production build
```

### .claude/ — konfigurace Claude Code

```
.claude/
├── CLAUDE.md                          # project instructions pro Claude
├── settings.json                      # permissions (allow/deny) + MCP allowlist
├── agents/                            # 4 specializovaní subagenti
│   ├── code-reviewer.md               # review diffu vůči main
│   ├── test-writer.md                 # Vitest + RTL testy
│   ├── dead-code-analyzer.md          # report nepoužitého kódu
│   └── ui-component-builder.md        # nová komponenta end-to-end
└── skills/                            # 5 user-invocable skillů
    ├── component-scaffold/SKILL.md    # kostra nové komponenty
    ├── screenshot/                    # Windows screenshot
    │   ├── SKILL.md
    │   └── scripts/take_screenshot.ps1
    ├── commit-message/SKILL.md        # conventional commit z diffu
    ├── api-client-gen/SKILL.md        # typed TS klient pro REST endpoint
    └── feature-doc/SKILL.md           # docs ke commitům na feature branchi
```

### .mcp.json — MCP servery

| Server         | Type   | Účel                                                                |
|----------------|--------|---------------------------------------------------------------------|
| **figma**      | http   | Design-to-code workflow — `get_design_context`, `get_screenshot`    |
| **context7**   | stdio  | Aktuální dokumentace knihoven (React, Vite, Tailwind, …)            |
| **filesystem** | stdio  | Sandboxovaný file-system přístup omezený na workspace               |

> `figma` MCP běží lokálně přes plugin Figma desktopu (port 3845). Pokud nemáš
> Figmu spuštěnou, server prostě nebude odpovídat — Claude to zvládne.

## Subagenti — kdy je Claude použije

| Subagent              | Trigger fráze                                                       |
|-----------------------|---------------------------------------------------------------------|
| `code-reviewer`       | "review my changes", "is this safe to merge?"                       |
| `test-writer`         | "write tests for X", "add coverage for the hook"                    |
| `dead-code-analyzer`  | "find dead code", "what can I delete?"                              |
| `ui-component-builder`| "create a ForecastChart component", "build a UnitToggle"            |

Claude je vyvolá sám podle popisu v hlavičce `.md` souboru — nemusíš je volat
ručně.

## Skilly — jak je vyvolat

Skilly se volají buď příkazem `/<skill-name>` v promptu, nebo si je Claude vyvolá
sám, když popis v `description` matchuje žádost uživatele.

| Skill              | `/skill` název       | Popis                                              |
|--------------------|----------------------|----------------------------------------------------|
| Component scaffold | `/component-scaffold`| Vytvoří `<Name>.tsx` + `<Name>.test.tsx` skeleton  |
| Screenshot         | `/screenshot`        | Windows screenshot (PowerShell)                    |
| Commit message     | `/commit-message`    | Conventional commit message z aktuálního diffu     |
| API client gen     | `/api-client-gen`    | Typed TS klient pro REST endpoint                  |
| Feature doc        | `/feature-doc`       | `docs/features/<branch>.md` z commitů na větvi     |

## Permissions — co je v `.claude/settings.json` zapnuto

**Allow:** standardní tooling (Read/Edit/Write/Grep/Glob/Skill/Agent), `npm run
dev|build|test|lint`, `git` read-only + `add` + `commit`, `mcp__figma`,
`mcp__context7`, `mcp__filesystem`.

**Deny:** destruktivní příkazy (`rm -rf /`, `sudo`, `git push`, `git reset
--hard`, `npm publish`, `npm install -g`), čtení `node_modules` / `dist` /
`.git`, čtení `.env` a `*credentials*.json`, čtení uživatelských klíčů
(`~/.ssh`, `~/.aws`, `~/.kube/config`, …).

Filozofie: dej Claudovi všechno, co potřebuje pro vývoj projektu, a striktně
zakaž věci, které by mohly:
1. Trvale poškodit systém / ztratit data
2. Vystavit secrety (klíče, tokeny, historie shellu)
3. Publikovat něco navenek bez explicitního souhlasu (`git push`, `npm publish`)


