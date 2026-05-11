import type { PlanRequest } from '../orchestrator/types.js';
import { runSpecialist } from './specialistAgent.js';

const SYSTEM_PROMPT = `You are a local transit and logistics expert.
For the given destination, produce a short briefing structured as:
## Getting around
- 3-5 bullets covering metro/tram/bus, walkability, taxi/rideshare typical cost in USD.

## Day pass / transit pass
- The current best-value pass option (name + USD cost). If none exists, say so.

## Airport to city centre
- 1-2 bullets: the practical options and approximate cost in USD and duration.

Keep it factual and practical. Avoid prose outside the structure.`;

export async function runTravelAgent(planId: string, req: PlanRequest) {
  const userPrompt = `Destination: ${req.destination}
Trip length: ${req.days} day(s)`;

  return runSpecialist(planId, {
    agent: 'TravelAgent',
    systemPrompt: SYSTEM_PROMPT,
    userPrompt,
  });
}
