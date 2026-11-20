export type Place = {
  id: string;
  name: string;
  /** e.g. "California, United States" */
  subtitle: string;
  latitude: number;
  longitude: number;
};

export type Forecast = {
  fetchedAt: number;
  timezone: string;
  current: { time: string; temp: number; feelsLike: number };
  today: { high: number; low: number };
  /** Next 24 hours starting with the current hour (local times, "YYYY-MM-DDTHH:mm"). */
  hourly: { time: string; temp: number }[];
  /** 7 days starting today ("YYYY-MM-DD"). */
  daily: { date: string; high: number; low: number }[];
};

type OpenMeteoForecast = {
  timezone: string;
  current: { time: string; temperature_2m: number; apparent_temperature: number };
  hourly: { time: string[]; temperature_2m: number[] };
  daily: { time: string[]; temperature_2m_max: number[]; temperature_2m_min: number[] };
};

type OpenMeteoGeocode = {
  results?: {
    id: number;
    name: string;
    latitude: number;
    longitude: number;
    country?: string;
    admin1?: string;
  }[];
};

const TIMEOUT_MS = 12_000;

async function getJson<T>(url: string): Promise<T> {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), TIMEOUT_MS);
  try {
    const res = await fetch(url, { signal: controller.signal });
    if (!res.ok) throw new Error(`Request failed (${res.status})`);
    return (await res.json()) as T;
  } finally {
    clearTimeout(timer);
  }
}

export function parseForecast(data: OpenMeteoForecast, now = Date.now()): Forecast {
  const currentHour = data.current.time.slice(0, 13); // "YYYY-MM-DDTHH"
  let start = data.hourly.time.findIndex((t) => t.slice(0, 13) >= currentHour);
  if (start < 0) start = 0;
  const hourly = data.hourly.time.slice(start, start + 24).map((time, i) => ({
    time,
    temp: data.hourly.temperature_2m[start + i],
  }));
  const daily = data.daily.time.map((date, i) => ({
    date,
    high: data.daily.temperature_2m_max[i],
    low: data.daily.temperature_2m_min[i],
  }));
  return {
    fetchedAt: now,
    timezone: data.timezone,
    current: {
      time: data.current.time,
      temp: data.current.temperature_2m,
      feelsLike: data.current.apparent_temperature,
    },
    today: { high: daily[0]?.high ?? data.current.temperature_2m, low: daily[0]?.low ?? data.current.temperature_2m },
    hourly,
    daily,
  };
}

export async function fetchForecast(latitude: number, longitude: number): Promise<Forecast> {
  const params = new URLSearchParams({
    latitude: latitude.toFixed(4),
    longitude: longitude.toFixed(4),
    current: 'temperature_2m,apparent_temperature',
    hourly: 'temperature_2m',
    daily: 'temperature_2m_max,temperature_2m_min',
    timezone: 'auto',
    forecast_days: '7',
  });
  const data = await getJson<OpenMeteoForecast>(`https://api.open-meteo.com/v1/forecast?${params}`);
  return parseForecast(data);
}

export async function searchPlaces(query: string): Promise<Place[]> {
  const q = query.trim();
  if (q.length < 2) return [];
  const params = new URLSearchParams({ name: q, count: '15', language: 'en', format: 'json' });
  const data = await getJson<OpenMeteoGeocode>(`https://geocoding-api.open-meteo.com/v1/search?${params}`);
  return (data.results ?? []).map((r) => ({
    id: String(r.id),
    name: r.name,
    subtitle: [r.admin1, r.country].filter(Boolean).join(', '),
    latitude: r.latitude,
    longitude: r.longitude,
  }));
}
