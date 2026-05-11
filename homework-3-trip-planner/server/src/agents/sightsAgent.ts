import type { PlanRequest } from '../orchestrator/types.js';
import { runSpecialist } from './specialistAgent.js';

const SYSTEM_PROMPT = `You are a knowledgeable local guide.
For the given destination, recommend 8-12 sights mixing famous landmarks with hidden gems.
For each sight, output ONE line in the format:
"- [<category>] <Name> — <one-line why> (~<visit duration in minutes> min, neighbourhood: <area>)"
Categories: museum, landmark, park, viewpoint, neighbourhood, architecture, market, religious.
Group output under headers: "## Must-see" and "## Hidden gems".
Be specific (real names of places). No prose outside the lists.`;

export async function runSightsAgent(planId: string, req: PlanRequest) {
  const userPrompt = `Destination: ${req.destination}
Trip length: ${req.days} day(s)
Stated interests: ${req.interests.length > 0 ? req.interests.join(', ') : '(none)'}

Recommend sights weighted toward the stated interests if any.`;

  return runSpecialist(planId, {
    agent: 'SightsAgent',
    systemPrompt: SYSTEM_PROMPT,
    userPrompt,
  });
}
