import TripForm from './components/TripForm';
import AgentProgressList from './components/AgentProgressList';
import ItineraryView from './components/ItineraryView';
import ErrorBanner from './components/ErrorBanner';
import { usePlanRun } from './hooks/usePlanRun';

export default function App() {
  const { state, run, reset } = usePlanRun();

  return (
    <main className="min-h-screen bg-slate-50 text-slate-900">
      <div className="mx-auto max-w-3xl px-4 py-8">
        <header className="mb-6">
          <h1 className="text-3xl font-semibold">Trip Planner</h1>
          <p className="text-sm text-slate-500">
            Pět specializovaných agentů pracuje paralelně, supervizor sleje výsledky
            do day-by-day itineráře. Powered by Claude Agent SDK.
          </p>
        </header>

        <TripForm onSubmit={run} disabled={state.status === 'running'} />

        {state.status !== 'idle' && (
          <section className="mt-6 space-y-4">
            <AgentProgressList agents={state.agents} />

            {state.status === 'error' && state.error && (
              <ErrorBanner message={state.error} onRetry={reset} />
            )}

            {state.itinerary && (
              <ItineraryView itinerary={state.itinerary} totalCostUsd={state.totalCostUsd} />
            )}
          </section>
        )}
      </div>
    </main>
  );
}
