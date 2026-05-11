import { useCallback, useEffect, useState } from 'react';
import { fetchWeather, type WeatherSnapshot } from '../api/openMeteo';

type City = { lat: number; lon: number };

type UseWeatherResult = {
  data: WeatherSnapshot | undefined;
  error: Error | undefined;
  isLoading: boolean;
  refetch: () => void;
};

export function useWeather(city: City): UseWeatherResult {
  const [data, setData] = useState<WeatherSnapshot | undefined>(undefined);
  const [error, setError] = useState<Error | undefined>(undefined);
  const [isLoading, setIsLoading] = useState(true);
  const [tick, setTick] = useState(0);

  useEffect(() => {
    let cancelled = false;
    setIsLoading(true);
    setError(undefined);

    fetchWeather(city)
      .then((snapshot) => {
        if (cancelled) return;
        setData(snapshot);
      })
      .catch((err: unknown) => {
        if (cancelled) return;
        setError(err instanceof Error ? err : new Error(String(err)));
      })
      .finally(() => {
        if (cancelled) return;
        setIsLoading(false);
      });

    return () => {
      cancelled = true;
    };
  }, [city.lat, city.lon, tick]);

  const refetch = useCallback(() => setTick((t) => t + 1), []);

  return { data, error, isLoading, refetch };
}
