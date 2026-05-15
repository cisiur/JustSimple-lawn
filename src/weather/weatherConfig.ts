// ─── Open-Meteo API base URLs ─────────────────────────────────────────────────
// No API key required. Free and open-source.

export const OPEN_METEO_FORECAST_URL = 'https://api.open-meteo.com/v1/forecast';
export const OPEN_METEO_GEOCODING_URL = 'https://geocoding-api.open-meteo.com/v1/search';

// ─── Fields requested from Open-Meteo ─────────────────────────────────────────
// Centralised here so adding a new provider means changing only the service file.

export const WEATHER_FIELDS = {
  hourly: 'precipitation,temperature_2m',
  daily: 'precipitation_sum,temperature_2m_max',
} as const;

// Request 1 past day + 2 forecast days so we can detect recent rain
export const PAST_DAYS = 1;
export const FORECAST_DAYS = 2;

// ─── Cache ────────────────────────────────────────────────────────────────────

// Refresh weather data at most once every 30 minutes
export const WEATHER_CACHE_TTL_MS = 30 * 60 * 1000;

// ─── Watering decision thresholds ─────────────────────────────────────────────
// All values are easy to tune from here without touching rule logic.

export const THRESHOLDS = {
  // Skip watering if this many mm of rain fell in the past window
  RECENT_RAIN_MM: 5,
  RECENT_HOURS: 24,

  // Skip watering if this many mm of rain is forecast in the upcoming window
  FORECAST_RAIN_MM: 3,
  FORECAST_HOURS: 24,

  // Nudge toward watering when it's this hot (°C) and dry
  HOT_TEMP_C: 28,
} as const;
