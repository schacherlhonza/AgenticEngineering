import type { PlanRequest } from '../orchestrator/types.js';
import { OPEN_METEO_ALLOWED_TOOLS, openMeteoServer } from '../tools/openMeteoTool.js';
import { runSpecialist } from './specialistAgent.js';
import { addDays } from './dates.js';

const SYSTEM_PROMPT = `You are a travel weather analyst.
Your job: call the get_weather_forecast tool ONCE with the destination and trip dates, then write a concise summary.
Output format:
- 2 sentences describing the overall weather pattern.
- A "Day-by-day" bulleted list: each line = "YYYY-MM-DD: <emoji> <high>°C / <low>°C, <one-liner>".
- A "Packing tips" bulleted list of 3-5 practical items based on the conditions.
Do not invent numbers; only use what the tool returned.`;

export async function runWeatherAgent(planId: string, req: PlanRequest) {
  const endDate = addDays(req.startDate, req.days - 1);
  const userPrompt = `Destination: ${req.destination}
Start date: ${req.startDate}
End date: ${endDate}
Trip length: ${req.days} day(s)

Call get_weather_forecast with destination="${req.destination}", startDate="${req.startDate}", endDate="${endDate}" and produce the report.`;

  return runSpecialist(planId, {
    agent: 'WeatherAgent',
    systemPrompt: SYSTEM_PROMPT,
    userPrompt,
    extraOptions: {
      mcpServers: { openmeteo: openMeteoServer },
      allowedTools: OPEN_METEO_ALLOWED_TOOLS,
    },
  });
}
