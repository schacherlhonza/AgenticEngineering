import type { PlanRequest } from '../orchestrator/types.js';
import { runSpecialist } from './specialistAgent.js';

const SYSTEM_PROMPT = `You are a food critic with deep local knowledge.
For the given destination and budget tier, recommend 6-10 places to eat covering breakfast, lunch, dinner, and at least one local specialty.
For each, output ONE line:
"- <Name> — <cuisine/dish> (<neighbourhood>, <$|$$|$$$>, best for: <breakfast|lunch|dinner|specialty>)"
Group under "## Restaurants" and "## Local specialties (must-try dishes)".
Match the price tier to the trip's budget tier. No prose outside the lists.`;

export async function runFoodAgent(planId: string, req: PlanRequest) {
  const userPrompt = `Destination: ${req.destination}
Budget tier: ${req.budgetTier}
Trip length: ${req.days} day(s)
Stated interests: ${req.interests.length > 0 ? req.interests.join(', ') : '(none)'}`;

  return runSpecialist(planId, {
    agent: 'FoodAgent',
    systemPrompt: SYSTEM_PROMPT,
    userPrompt,
  });
}
