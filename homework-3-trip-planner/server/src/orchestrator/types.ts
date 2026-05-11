import type { z } from 'zod';
import type { ItinerarySchema } from '../schema/itinerary.js';
import type { PlanRequestSchema } from '../schema/request.js';

export type PlanRequest = z.infer<typeof PlanRequestSchema>;
export type Itinerary = z.infer<typeof ItinerarySchema>;

export type AgentName =
  | 'WeatherAgent'
  | 'SightsAgent'
  | 'FoodAgent'
  | 'TravelAgent'
  | 'BudgetAgent'
  | 'ItineraryAssembler';

export type PlanEvent =
  | { type: 'agent_started'; agent: AgentName; ts: number }
  | { type: 'tool_call'; agent: AgentName; tool: string; ts: number }
  | { type: 'agent_finished'; agent: AgentName; preview: string; ts: number }
  | { type: 'supervisor_started'; ts: number }
  | { type: 'final_result'; itinerary: Itinerary; totalCostUsd: number; ts: number }
  | { type: 'error'; message: string; ts: number };

export type SpecialistOutput = {
  agent: AgentName;
  text: string;
  costUsd: number;
};
