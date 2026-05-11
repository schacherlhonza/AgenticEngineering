import type { WeatherSnapshot } from '../api/openMeteo';

export type Props = {
  city: string;
  data: WeatherSnapshot;
  onRefresh: () => void;
};

export default function WeatherCard({ city, data, onRefresh }: Props) {
  return (
    <article className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
      <header className="flex items-baseline justify-between">
        <h2 className="text-xl font-semibold">{city}</h2>
        <button
          type="button"
          onClick={onRefresh}
          className="rounded-md border border-slate-300 px-3 py-1 text-sm text-slate-700 hover:bg-slate-50"
        >
          Refresh
        </button>
      </header>

      <div className="mt-4 flex items-end gap-6">
        <div>
          <div className="text-5xl font-light tabular-nums">
            {Math.round(data.currentTempC)}°C
          </div>
          <div className="text-sm text-slate-500">
            Wind {Math.round(data.windKmh)} km/h
          </div>
        </div>
      </div>

      <h3 className="mt-6 text-sm font-semibold text-slate-600">Next days</h3>
      <ul className="mt-2 grid grid-cols-3 gap-2 text-sm sm:grid-cols-7">
        {data.daily.slice(0, 7).map((d) => (
          <li
            key={d.date}
            className="rounded-md bg-slate-50 px-2 py-2 text-center"
          >
            <div className="text-xs text-slate-500">{formatDay(d.date)}</div>
            <div className="tabular-nums">
              {Math.round(d.tempMin)}° / {Math.round(d.tempMax)}°
            </div>
          </li>
        ))}
      </ul>
    </article>
  );
}

function formatDay(iso: string): string {
  const d = new Date(iso);
  return d.toLocaleDateString('en-US', { weekday: 'short' });
}
