import { useState } from 'react';
import CityPicker from './components/CityPicker';
import WeatherCard from './components/WeatherCard';
import { useWeather } from './hooks/useWeather';

const DEFAULT_CITY = { name: 'Prague', lat: 50.0755, lon: 14.4378 };

export default function App() {
  const [city, setCity] = useState(DEFAULT_CITY);
  const { data, error, isLoading, refetch } = useWeather(city);

  return (
    <main className="min-h-screen bg-slate-50 text-slate-900">
      <div className="mx-auto max-w-2xl px-4 py-8">
        <header className="mb-6">
          <h1 className="text-3xl font-semibold">Weather Dashboard</h1>
          <p className="text-sm text-slate-500">
            Powered by Open-Meteo — no API key required.
          </p>
        </header>

        <CityPicker value={city} onChange={setCity} />

        <section className="mt-6">
          {isLoading && <p className="text-slate-500">Loading…</p>}
          {error && (
            <p className="rounded-md bg-red-50 px-3 py-2 text-sm text-red-700">
              {error.message}
            </p>
          )}
          {data && <WeatherCard city={city.name} data={data} onRefresh={refetch} />}
        </section>
      </div>
    </main>
  );
}
