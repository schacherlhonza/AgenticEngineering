export type ItineraryDay = {
  day: number;
  date: string;
  theme: string;
  weather: { summary: string; highC: number; lowC: number };
  morning: string[];
  afternoon: string[];
  evening: string[];
  meals: { breakfast: string; lunch: string; dinner: string };
  transport: string;
  estimatedCostUsd: number;
};

export type Itinerary = {
  destination: string;
  startDate: string;
  totalDays: number;
  budgetTier: 'budget' | 'mid' | 'luxury';
  summary: string;
  packingTips: string[];
  totalEstimatedCostUsd: number;
  days: ItineraryDay[];
};

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

export type PlanRequest = {
  destination: string;
  startDate: string;
  days: number;
  budgetTier: 'budget' | 'mid' | 'luxury';
  interests: string[];
};
