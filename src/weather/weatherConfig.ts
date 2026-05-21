// ─── Open-Meteo API base URLs ─────────────────────────────────────────────────
// No API key required. Free and open-source.

export const OPEN_METEO_FORECAST_URL = 'https://api.open-meteo.com/v1/forecast';
export const OPEN_METEO_GEOCODING_URL = 'https://geocoding-api.open-meteo.com/v1/search';

// ─── Fields requested from Open-Meteo ─────────────────────────────────────────
// Centralised here so adding a new provider means changing only the service file.

export const WEATHER_FIELDS = {
  hourly: 'precipitation,temperature_2m',
  daily: 'precipitation_sum,temperature_2m_max,et0_fao_evapotranspiration,precipitation_probability_max',
} as const;

// 7 past days gives the soil model enough history to initialise accurately on first launch
export const PAST_DAYS = 7;
export const FORECAST_DAYS = 2;

// ─── Cache ────────────────────────────────────────────────────────────────────

// Refresh weather data at most once every 30 minutes
export const WEATHER_CACHE_TTL_MS = 30 * 60 * 1000;

// ─── Watering decision thresholds ─────────────────────────────────────────────
// All values are easy to tune from here without touching rule logic.

export const THRESHOLDS = {
  // ── Legacy hourly thresholds (kept for diagnostic displays) ─────────────────
  RECENT_RAIN_MM: 5,
  RECENT_HOURS: 24,
  FORECAST_RAIN_MM: 3,
  FORECAST_HOURS: 24,

  // ── Temperature ──────────────────────────────────────────────────────────────
  // Nudge toward watering when it's this hot (°C) and dry
  HOT_TEMP_C: 28,

  // ── Soil Moisture Balance Model ──────────────────────────────────────────────
  SOIL_MOISTURE_INITIAL: 50,       // % starting value on first launch
  SOIL_MOISTURE_WET: 60,           // % — above this, skip watering
  SOIL_MOISTURE_DRY: 35,           // % — below this, water today
  SOIL_MOISTURE_MAX: 100,          // % clamp ceiling
  SOIL_MOISTURE_MIN: 0,            // % clamp floor
  SOIL_MOISTURE_OVERSATURATED: 80, // % — sustained above this triggers warning
  SOIL_OVERSATURATED_DAYS: 3,      // consecutive days above 80 % = oversaturation warning
  SOIL_URGENT_DRY_DAYS: 2,         // consecutive days at 0 % = urgent-dry alert
  RAIN_FORECAST_PROBABILITY: 60,   // % probability threshold — skip if rain likely
  HOT_TEMP_ET_MULTIPLIER: 1.2,     // ET multiplier applied when temp > HOT_TEMP_C
} as const;
