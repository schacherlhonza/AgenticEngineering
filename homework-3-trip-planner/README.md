# Homework 3 — Trip Planner

User-facing web aplikace postavená na **Claude Agent SDK (TypeScript)**, která
demonstruje **multi-agent orchestraci**: paralelní fan-out 5 specializovaných
agentů + supervizor, který výsledek z agentů sjednotí do strukturovaného itineráře.

Cílový uživatel: Cestovatel, který chce za pár sekund mít
day-by-day plán pro destinaci, datum a rozpočet, který si zadá.

## Co se ukazuje

| Vrstva                       | Pattern                                                                 |
|------------------------------|-------------------------------------------------------------------------|
| **Specialisté (5×)**         | **Parallel workflow** — `Promise.all` rozjede 5 nezávislých `query()`   |
| **Supervizor (1×)**          | **Supervisor multi-agent** — slije briefingy do JSON itineráře přes `outputFormat: 'json_schema'` |
| **Streaming do UI**          | Server-Sent Events — uživatel vidí, kdo právě dělá co                    |
| **Custom SDK tool**          | `tool()` + `createSdkMcpServer()` — WeatherAgent volá Open-Meteo         |

```
   uživatel zadá formulář
            │
            ▼
   ┌────────────────────┐
   │  POST /api/plan    │  → vrátí planId
   └────────┬───────────┘
            │ (fire-and-forget)
            ▼
   ┌──────────────────────────────────────────────────┐
   │  runPlan(planId, req)                            │
   │                                                  │
   │  await Promise.all([                             │
   │    WeatherAgent  ─┐                              │
   │    SightsAgent   ─┤   ◄── PARALLEL (fan-out)     │
   │    FoodAgent     ─┤                              │
   │    TravelAgent   ─┤                              │
   │    BudgetAgent   ─┘                              │
   │  ])                                              │
   │                                                  │
   │  ItineraryAssembler(specialists)                 │
   │  └─── outputFormat: 'json_schema' (Itinerary)    │
   └────────────┬─────────────────────────────────────┘
                │
                ▼ events streamed přes SSE
   ┌────────────────────┐
   │ GET /api/plan/:id  │  → React UI animuje progress + renderuje výsledek
   │     /events  (SSE) │
   └────────────────────┘
```

## Spuštění

**Předpoklady:** Node 20+, npm 10+, ANTHROPIC_API_KEY.

```bash
cd homework-3-trip-planner
npm install                 # nainstaluje server + client workspace
cp .env.example .env        # vlož ANTHROPIC_API_KEY=...
npm run dev                 # běží server (:8787) + client (:5173)
```

Otevři <http://localhost:5173>, vyplň formulář, sleduj progress list a počkej
na finální itinerář.

## Smoke test bez UI

```bash
curl -X POST http://localhost:8787/api/plan \
  -H "content-type: application/json" \
  -d '{
    "destination": "Lisbon",
    "startDate": "2026-06-01",
    "days": 3,
    "budgetTier": "mid",
    "interests": ["food", "architecture"]
  }'
# → {"planId":"<uuid>"}

curl -N http://localhost:8787/api/plan/<uuid>/events
# → SSE stream:
#   event: agent_started     (5×, ~současně)
#   event: tool_call         (1× pro WeatherAgent)
#   event: agent_finished    (5×, jak dobíhají)
#   event: supervisor_started
#   event: final_result      → JSON Itinerary
```

## Struktura

```
homework-3-trip-planner/
├── server/                       Node + Express + SDK
│   └── src/
│       ├── index.ts              bootstrap
│       ├── routes/plan.ts        POST + SSE
│       ├── orchestrator/
│       │   ├── runPlan.ts        Promise.all + supervisor
│       │   ├── eventBus.ts       pub/sub keyed by planId
│       │   └── types.ts
│       ├── agents/               5 specialistů + supervisor
│       ├── tools/openMeteoTool.ts custom SDK tool
│       └── schema/               zod + JSON Schema
└── client/                       Vite + React + Tailwind
    └── src/
        ├── App.tsx
        ├── api/planClient.ts     postPlan + EventSource
        ├── hooks/usePlanRun.ts   stavový stroj
        ├── components/           TripForm, AgentProgressList, ItineraryView
        └── types/itinerary.ts    mirror serverového typu
```

## Agenti

Všichni běží na `model: 'sonnet'` (= claude-sonnet-4-5).

| Agent              | Tool                                | Výstup             |
|--------------------|-------------------------------------|--------------------|
| WeatherAgent       | `mcp__openmeteo__get_weather_forecast` | markdown summary |
| SightsAgent        | —                                   | markdown list      |
| FoodAgent          | —                                   | markdown list      |
| TravelAgent        | —                                   | markdown briefing  |
| BudgetAgent        | —                                   | markdown breakdown |
| ItineraryAssembler | — (`outputFormat: json_schema`)     | typed Itinerary    |
