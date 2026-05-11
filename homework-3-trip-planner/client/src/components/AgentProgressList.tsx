import type { AgentProgress } from '../hooks/usePlanRun';
import type { AgentName } from '../types/itinerary';

export type Props = {
  agents: Record<AgentName, AgentProgress>;
};

const AGENT_LABEL: Record<AgentName, string> = {
  WeatherAgent: 'Weather analyst',
  SightsAgent: 'Local guide (sights)',
  FoodAgent: 'Food critic',
  TravelAgent: 'Transit expert',
  BudgetAgent: 'Budget planner',
  ItineraryAssembler: 'Itinerary assembler (supervisor)',
};

const ORDER: AgentName[] = [
  'WeatherAgent',
  'SightsAgent',
  'FoodAgent',
  'TravelAgent',
  'BudgetAgent',
  'ItineraryAssembler',
];

function StatusDot({ status }: { status: AgentProgress['status'] }) {
  if (status === 'done') return <span aria-label="done" className="text-emerald-600">✓</span>;
  if (status === 'running')
    return (
      <span aria-label="running" className="inline-block h-3 w-3 animate-pulse rounded-full bg-amber-500" />
    );
  return <span aria-label="idle" className="inline-block h-3 w-3 rounded-full bg-slate-300" />;
}

export default function AgentProgressList({ agents }: Props) {
  return (
    <ul className="space-y-2 rounded-xl border border-slate-200 bg-white p-4 shadow-sm">
      {ORDER.map((agent) => {
        const a = agents[agent];
        const isSupervisor = agent === 'ItineraryAssembler';
        return (
          <li
            key={agent}
            className={`flex items-start gap-3 rounded-md px-2 py-2 ${
              isSupervisor ? 'border-t border-slate-200 pt-3' : ''
            }`}
          >
            <div className="mt-1 w-4 text-center">
              <StatusDot status={a.status} />
            </div>
            <div className="flex-1">
              <div className="flex items-center justify-between">
                <span className="font-medium text-slate-800">{AGENT_LABEL[agent]}</span>
                {a.toolCalls.length > 0 && (
                  <span className="text-xs text-slate-500">
                    tools: {a.toolCalls.join(', ')}
                  </span>
                )}
              </div>
              {a.preview && (
                <p className="mt-1 line-clamp-2 text-sm text-slate-500">{a.preview}</p>
              )}
            </div>
          </li>
        );
      })}
    </ul>
  );
}
