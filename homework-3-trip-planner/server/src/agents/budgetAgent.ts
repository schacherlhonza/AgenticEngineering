import type { PlanRequest } from '../orchestrator/types.js';
import { runSpecialist } from './specialistAgent.js';

const SYSTEM_PROMPT = `You are a travel budget planner.
Produce a per-day cost breakdown in USD for the given destination, days, and budget tier.

Output exactly:
## Per-day estimate
- Lodging: $X
- Food: $X
- Local transport: $X
- Attractions/activities: $X
- Buffer (15%): $X
- **Daily total: $X**

## Trip total
- **Total (<days> days): $X**
- Notes: 1-2 short lines on what drove the numbers (season, neighbourhood choice, tier).

Be realistic for the city and tier. Numbers must be integers.`;

export async function runBudgetAgent(planId: string, req: PlanRequest) {
  const userPrompt = `Destination: ${req.destination}
Trip length: ${req.days} day(s)
Budget tier: ${req.budgetTier}`;

  return runSpecialist(planId, {
    agent: 'BudgetAgent',
    systemPrompt: SYSTEM_PROMPT,
    userPrompt,
  });
}
