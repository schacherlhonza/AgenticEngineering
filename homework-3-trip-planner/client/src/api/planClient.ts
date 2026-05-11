import type { PlanEvent, PlanRequest } from '../types/itinerary';

export async function postPlan(req: PlanRequest): Promise<string> {
  const response = await fetch('/api/plan', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(req),
  });
  if (!response.ok) {
    const detail = await response.text();
    throw new Error(`postPlan failed (${response.status}): ${detail}`);
  }
  const json = (await response.json()) as { planId: string };
  return json.planId;
}

export function subscribePlanEvents(
  planId: string,
  onEvent: (event: PlanEvent) => void,
  onError: (err: Error) => void,
): () => void {
  const source = new EventSource(`/api/plan/${planId}/events`);

  const eventTypes: PlanEvent['type'][] = [
    'agent_started',
    'tool_call',
    'agent_finished',
    'supervisor_started',
    'final_result',
    'error',
  ];

  for (const type of eventTypes) {
    source.addEventListener(type, (raw) => {
      const message = raw as MessageEvent<string>;
      try {
        const parsed = JSON.parse(message.data) as PlanEvent;
        onEvent(parsed);
        if (parsed.type === 'final_result' || parsed.type === 'error') {
          source.close();
        }
      } catch (err) {
        onError(err instanceof Error ? err : new Error(String(err)));
      }
    });
  }

  source.onerror = () => {
    if (source.readyState === EventSource.CLOSED) return;
    onError(new Error('SSE connection error'));
    source.close();
  };

  return () => source.close();
}
