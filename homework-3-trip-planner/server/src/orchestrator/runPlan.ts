import { runWeatherAgent } from '../agents/weatherAgent.js';
import { runSightsAgent } from '../agents/sightsAgent.js';
import { runFoodAgent } from '../agents/foodAgent.js';
import { runTravelAgent } from '../agents/travelAgent.js';
import { runBudgetAgent } from '../agents/budgetAgent.js';
import { runItineraryAssembler } from '../agents/itineraryAssembler.js';
import { closeBus, emit } from './eventBus.js';
import type { PlanRequest } from './types.js';

export async function runPlan(planId: string, req: PlanRequest): Promise<void> {
  try {
    const specialists = await Promise.all([
      runWeatherAgent(planId, req),
      runSightsAgent(planId, req),
      runFoodAgent(planId, req),
      runTravelAgent(planId, req),
      runBudgetAgent(planId, req),
    ]);

    const specialistCost = specialists.reduce((sum, s) => sum + s.costUsd, 0);

    const { itinerary, costUsd: supervisorCost } = await runItineraryAssembler(
      planId,
      req,
      specialists,
    );

    emit(planId, {
      type: 'final_result',
      itinerary,
      totalCostUsd: specialistCost + supervisorCost,
      ts: Date.now(),
    });
  } catch (err) {
    emit(planId, {
      type: 'error',
      message: err instanceof Error ? err.message : String(err),
      ts: Date.now(),
    });
  } finally {
    setTimeout(() => closeBus(planId), 30_000);
  }
}
