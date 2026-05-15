import {
  OPEN_METEO_FORECAST_URL,
  OPEN_METEO_GEOCODING_URL,
  WEATHER_FIELDS,
  PAST_DAYS,
  FORECAST_DAYS,
  WEATHER_CACHE_TTL_MS,
} from './weatherConfig';
import type {
  WeatherData,
  OpenMeteoForecastResponse,
  GeocodingResult,
} from './weatherTypes';
import { loadWeatherCache, saveWeatherCache } from '../storage/storageService';

// ─── Internal helpers ─────────────────────────────────────────────────────────

function normalize(raw: OpenMeteoForecastResponse): WeatherData {
  return {
    hourly: {
      time:          raw.hourly.time,
      precipitation: raw.hourly.precipitation,
      temperature2m: raw.hourly.temperature_2m,
    },
    daily: {
      time:               raw.daily.time,
      precipitationSum:   raw.daily.precipitation_sum,
      temperature2mMax:   raw.daily.temperature_2m_max,
    },
    timezone: raw.timezone,
  };
}

function coordsMatch(a: number, b: number): boolean {
  return Math.abs(a - b) < 0.01; // ~1 km tolerance
}

// ─── Public API ───────────────────────────────────────────────────────────────

/** Fetch a fresh forecast from Open-Meteo. Throws on network / API error. */
export async function fetchForecast(
  latitude: number,
  longitude: number,
): Promise<WeatherData> {
  const params = new URLSearchParams({
    latitude:     latitude.toFixed(4),
    longitude:    longitude.toFixed(4),
    hourly:       WEATHER_FIELDS.hourly,
    daily:        WEATHER_FIELDS.daily,
    past_days:    String(PAST_DAYS),
    forecast_days: String(FORECAST_DAYS),
    timezone:     'auto',
  });

  const response = await fetch(`${OPEN_METEO_FORECAST_URL}?${params}`);
  if (!response.ok) throw new Error(`Weather API responded with ${response.status}`);
  const raw = (await response.json()) as OpenMeteoForecastResponse;
  return normalize(raw);
}

/**
 * Return cached weather if fresh enough and coordinates match.
 * Each location has its own cache entry keyed by rounded coordinates.
 */
export async function fetchForecastWithCache(
  latitude: number,
  longitude: number,
): Promise<WeatherData> {
  const cached = await loadWeatherCache(latitude, longitude);
  const now = Date.now();

  if (
    cached &&
    now - cached.fetchedAt < WEATHER_CACHE_TTL_MS &&
    coordsMatch(cached.latitude, latitude) &&
    coordsMatch(cached.longitude, longitude)
  ) {
    return JSON.parse(cached.json) as WeatherData;
  }

  const data = await fetchForecast(latitude, longitude);
  await saveWeatherCache({ json: JSON.stringify(data), fetchedAt: now, latitude, longitude });
  return data;
}

/** Convert a city name to candidate coordinates via Open-Meteo Geocoding API. */
export async function geocodeCity(query: string): Promise<GeocodingResult[]> {
  const params = new URLSearchParams({
    name:     query.trim(),
    count:    '5',
    language: 'en',
    format:   'json',
  });

  const response = await fetch(`${OPEN_METEO_GEOCODING_URL}?${params}`);
  if (!response.ok) throw new Error(`Geocoding API responded with ${response.status}`);
  const data = (await response.json()) as { results?: GeocodingResult[] };
  return data.results ?? [];
}
