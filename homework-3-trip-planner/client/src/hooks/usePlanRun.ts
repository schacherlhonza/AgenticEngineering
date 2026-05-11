import { useCallback, useRef, useState } from 'react';
import { postPlan, subscribePlanEvents } from '../api/planClient';
import type { AgentName, Itinerary, PlanEvent, PlanRequest } from '../types/itinerary';

export type AgentStatus = 'idle' | 'running' | 'done';

export type AgentProgress = {
  agent: AgentName;
  status: AgentStatus;
  toolCalls: string[];
  preview?: string;
};

export type PlanState = {
  status: 'idle' | 'running' | 'done' | 'error';
  agents: Record<AgentName, AgentProgress>;
  events: PlanEvent[];
  itinerary?: Itinerary;
  totalCostUsd?: number;
  error?: string;
};

const ALL_AGENTS: AgentName[] = [
  'WeatherAgent',
  'SightsAgent',
  'FoodAgent',
  'TravelAgent',
  'BudgetAgent',
  'ItineraryAssembler',
];

function freshAgents(): Record<AgentName, AgentProgress> {
  const out = {} as Record<AgentName, AgentProgress>;
  for (const agent of ALL_AGENTS) {
    out[agent] = { agent, status: 'idle', toolCalls: [] };
  }
  return out;
}

export function usePlanRun(): {
  state: PlanState;
  run: (req: PlanRequest) => Promise<void>;
  reset: () => void;
} {
  const [state, setState] = useState<PlanState>({
    status: 'idle',
    agents: freshAgents(),
    events: [],
  });

  const unsubRef = useRef<(() => void) | null>(null);

  const reset = useCallback(() => {
    unsubRef.current?.();
    unsubRef.current = null;
    setState({ status: 'idle', agents: freshAgents(), events: [] });
  }, []);

  const run = useCallback(async (req: PlanRequest) => {
    unsubRef.current?.();
    setState({ status: 'running', agents: freshAgents(), events: [] });

    let planId: string;
    try {
      planId = await postPlan(req);
    } catch (err) {
      setState((s) => ({
        ...s,
        status: 'error',
        error: err instanceof Error ? err.message : String(err),
      }));
      return;
    }

    unsubRef.current = subscribePlanEvents(
      planId,
      (event) => {
        setState((s) => {
          const next: PlanState = { ...s, events: [...s.events, event] };
          const agents = { ...s.agents };

          if (event.type === 'agent_started') {
            agents[event.agent] = { ...agents[event.agent], status: 'running' };
          } else if (event.type === 'tool_call') {
            agents[event.agent] = {
              ...agents[event.agent],
              toolCalls: [...agents[event.agent].toolCalls, event.tool],
            };
          } else if (event.type === 'agent_finished') {
            agents[event.agent] = {
              ...agents[event.agent],
              status: 'done',
              preview: event.preview,
            };
          } else if (event.type === 'supervisor_started') {
            agents.ItineraryAssembler = { ...agents.ItineraryAssembler, status: 'running' };
          } else if (event.type === 'final_result') {
            agents.ItineraryAssembler = { ...agents.ItineraryAssembler, status: 'done' };
            next.itinerary = event.itinerary;
            next.totalCostUsd = event.totalCostUsd;
            next.status = 'done';
          } else if (event.type === 'error') {
            next.error = event.message;
            next.status = 'error';
          }

          next.agents = agents;
          return next;
        });
      },
      (err) => {
        setState((s) => ({ ...s, status: 'error', error: err.message }));
      },
    );
  }, []);

  return { state, run, reset };
}
