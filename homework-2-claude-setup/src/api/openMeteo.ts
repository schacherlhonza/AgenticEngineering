const BASE_URL = 'https://api.open-meteo.com/v1/forecast';

export type FetchWeatherInput = {
  lat: number;
  lon: number;
};

export type DailyForecast = {
  date: string;
  tempMin: number;
  tempMax: number;
};

export type WeatherSnapshot = {
  currentTempC: number;
  windKmh: number;
  daily: DailyForecast[];
};

type OpenMeteoResponse = {
  current?: { temperature_2m: number; wind_speed_10m: number };
  daily?: {
    time: string[];
    temperature_2m_min: number[];
    temperature_2m_max: number[];
  };
};

export async function fetchWeather(input: FetchWeatherInput): Promise<WeatherSnapshot> {
  const params = new URLSearchParams({
    latitude: String(input.lat),
    longitude: String(input.lon),
    current: 'temperature_2m,wind_speed_10m',
    daily: 'temperature_2m_max,temperature_2m_min',
    timezone: 'auto',
  });
  const url = `${BASE_URL}?${params.toString()}`;

  const response = await fetch(url);
  if (!response.ok) {
    throw new Error(`fetchWeather failed: ${response.status} ${response.statusText}`);
  }

  const raw = (await response.json()) as OpenMeteoResponse;
  if (!raw.current || !raw.daily) {
    throw new Error('fetchWeather: malformed response from Open-Meteo');
  }

  const daily: DailyForecast[] = raw.daily.time.map((date, i) => ({
    date,
    tempMin: raw.daily!.temperature_2m_min[i],
    tempMax: raw.daily!.temperature_2m_max[i],
  }));

  return {
    currentTempC: raw.current.temperature_2m,
    windKmh: raw.current.wind_speed_10m,
    daily,
  };
}
