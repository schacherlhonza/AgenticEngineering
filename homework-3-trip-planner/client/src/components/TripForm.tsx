import { useState } from 'react';
import type { PlanRequest } from '../types/itinerary';

export type Props = {
  onSubmit: (req: PlanRequest) => void;
  disabled: boolean;
};

const INTEREST_OPTIONS = [
  'food',
  'architecture',
  'museums',
  'nightlife',
  'nature',
  'shopping',
  'history',
  'family',
];

const todayPlus = (days: number): string => {
  const d = new Date();
  d.setDate(d.getDate() + days);
  return d.toISOString().slice(0, 10);
};

export default function TripForm({ onSubmit, disabled }: Props) {
  const [destination, setDestination] = useState('Lisbon');
  const [startDate, setStartDate] = useState(todayPlus(14));
  const [days, setDays] = useState(3);
  const [budgetTier, setBudgetTier] = useState<PlanRequest['budgetTier']>('mid');
  const [interests, setInterests] = useState<string[]>(['food', 'architecture']);

  const toggle = (i: string) =>
    setInterests((prev) => (prev.includes(i) ? prev.filter((x) => x !== i) : [...prev, i]));

  return (
    <form
      onSubmit={(e) => {
        e.preventDefault();
        onSubmit({ destination, startDate, days, budgetTier, interests });
      }}
      className="space-y-5 rounded-xl border border-slate-200 bg-white p-6 shadow-sm"
    >
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <label className="flex flex-col gap-1 text-sm font-medium text-slate-700">
          Destination
          <input
            type="text"
            required
            value={destination}
            onChange={(e) => setDestination(e.target.value)}
            placeholder="e.g. Lisbon"
            className="rounded-md border border-slate-300 bg-white px-3 py-2 shadow-sm focus:border-slate-500 focus:outline-none"
          />
        </label>

        <label className="flex flex-col gap-1 text-sm font-medium text-slate-700">
          Start date
          <input
            type="date"
            required
            value={startDate}
            onChange={(e) => setStartDate(e.target.value)}
            className="rounded-md border border-slate-300 bg-white px-3 py-2 shadow-sm focus:border-slate-500 focus:outline-none"
          />
        </label>

        <label className="flex flex-col gap-1 text-sm font-medium text-slate-700">
          Days: <span className="font-semibold">{days}</span>
          <input
            type="range"
            min={1}
            max={14}
            value={days}
            onChange={(e) => setDays(Number(e.target.value))}
            className="accent-slate-700"
          />
        </label>

        <fieldset className="flex flex-col gap-1 text-sm font-medium text-slate-700">
          Budget
          <div className="flex gap-2">
            {(['budget', 'mid', 'luxury'] as const).map((tier) => (
              <label
                key={tier}
                className={`flex-1 cursor-pointer rounded-md border px-3 py-2 text-center capitalize ${
                  budgetTier === tier
                    ? 'border-slate-700 bg-slate-900 text-white'
                    : 'border-slate-300 bg-white hover:bg-slate-50'
                }`}
              >
                <input
                  type="radio"
                  name="budgetTier"
                  value={tier}
                  checked={budgetTier === tier}
                  onChange={() => setBudgetTier(tier)}
                  className="sr-only"
                />
                {tier}
              </label>
            ))}
          </div>
        </fieldset>
      </div>

      <fieldset>
        <legend className="mb-2 text-sm font-medium text-slate-700">Interests</legend>
        <div className="flex flex-wrap gap-2">
          {INTEREST_OPTIONS.map((i) => {
            const active = interests.includes(i);
            return (
              <button
                key={i}
                type="button"
                onClick={() => toggle(i)}
                className={`rounded-full border px-3 py-1 text-sm capitalize ${
                  active
                    ? 'border-slate-700 bg-slate-900 text-white'
                    : 'border-slate-300 bg-white text-slate-700 hover:bg-slate-50'
                }`}
              >
                {i}
              </button>
            );
          })}
        </div>
      </fieldset>

      <button
        type="submit"
        disabled={disabled}
        className="w-full rounded-md bg-slate-900 px-4 py-3 text-base font-semibold text-white shadow-sm hover:bg-slate-800 disabled:cursor-not-allowed disabled:opacity-50"
      >
        {disabled ? 'Planning…' : 'Plan my trip'}
      </button>
    </form>
  );
}
