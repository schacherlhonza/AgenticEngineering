import { tool, createSdkMcpServer } from '@anthropic-ai/claude-agent-sdk';
import { z } from 'zod';

type GeocodeResult = {
  results?: Array<{ latitude: number; longitude: number; name: string; country: string }>;
};

type ForecastResult = {
  daily?: {
    time: string[];
    temperature_2m_max: number[];
    temperature_2m_min: number[];
    precipitation_sum: number[];
    weather_code: number[];
  };
};

async function geocode(destination: string): Promise<{ lat: number; lon: number; resolvedName: string }> {
  const url = `https://geocoding-api.open-meteo.com/v1/search?name=${encodeURIComponent(
    destination,
  )}&count=1&language=en&format=json`;
  const response = await fetch(url);
  if (!response.ok) {
    throw new Error(`geocode failed: ${response.status} ${response.statusText}`);
  }
  const raw = (await response.json()) as GeocodeResult;
  const first = raw.results?.[0];
  if (!first) {
    throw new Error(`geocode: no results for "${destination}"`);
  }
  return {
    lat: first.latitude,
    lon: first.longitude,
    resolvedName: `${first.name}, ${first.country}`,
  };
}

async function forecast(
  lat: number,
  lon: number,
  startDate: string,
  endDate: string,
): Promise<NonNullable<ForecastResult['daily']>> {
  const params = new URLSearchParams({
    latitude: String(lat),
    longitude: String(lon),
    start_date: startDate,
    end_date: endDate,
    daily: 'temperature_2m_max,temperature_2m_min,precipitation_sum,weather_code',
    timezone: 'auto',
  });
  const url = `https://api.open-meteo.com/v1/forecast?${params.toString()}`;
  const response = await fetch(url);
  if (!response.ok) {
    throw new Error(`forecast failed: ${response.status} ${response.statusText}`);
  }
  const raw = (await response.json()) as ForecastResult;
  if (!raw.daily) {
    throw new Error('forecast: missing daily data');
  }
  return raw.daily;
}

const getWeatherForecastTool = tool(
  'get_weather_forecast',
  'Fetch daily weather forecast (min/max temperature, precipitation, weather code) for a destination and date range. Use this once per planning task.',
  {
    destination: z.string().describe('City name, e.g. "Lisbon" or "Prague"'),
    startDate: z.string().describe('Start date in YYYY-MM-DD'),
    endDate: z.string().describe('End date in YYYY-MM-DD (inclusive)'),
  },
  async (args) => {
    const { lat, lon, resolvedName } = await geocode(args.destination);
    const daily = await forecast(lat, lon, args.startDate, args.endDate);
    const summary = daily.time.map((date, i) => ({
      date,
      tempMaxC: daily.temperature_2m_max[i],
      tempMinC: daily.temperature_2m_min[i],
      precipitationMm: daily.precipitation_sum[i],
      weatherCode: daily.weather_code[i],
    }));
    return {
      content: [
        {
          type: 'text' as const,
          text: JSON.stringify({ resolvedName, daily: summary }, null, 2),
        },
      ],
    };
  },
);

export const openMeteoServer = createSdkMcpServer({
  name: 'openmeteo',
  version: '1.0.0',
  tools: [getWeatherForecastTool],
});

export const OPEN_METEO_ALLOWED_TOOLS = ['mcp__openmeteo__get_weather_forecast'];
