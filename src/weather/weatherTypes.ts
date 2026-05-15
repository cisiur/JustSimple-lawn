// ─── Raw Open-Meteo response shapes ──────────────────────────────────────────

export interface OpenMeteoHourly {
  time: string[];            // ISO datetime strings, local time of requested timezone
  precipitation: number[];   // mm
  temperature_2m: number[];  // °C
}

export interface OpenMeteoDaily {
  time: string[];                // ISO date strings
  precipitation_sum: number[];   // mm
  temperature_2m_max: number[];  // °C
}

export interface OpenMeteoForecastResponse {
  latitude: number;
  longitude: number;
  timezone: string;
  hourly: OpenMeteoHourly;
  daily: OpenMeteoDaily;
}

// ─── Normalised internal weather model ───────────────────────────────────────

export interface WeatherData {
  hourly: {
    time: string[];
    precipitation: number[];
    temperature2m: number[];
  };
  daily: {
    time: string[];
    precipitationSum: number[];
    temperature2mMax: number[];
  };
  timezone: string;
}

// ─── Decision output ──────────────────────────────────────────────────────────

export type WateringDecisionType = 'water' | 'skip' | 'uncertain';

/** i18n key for the decision reason — translated in UI layer */
export type ReasonKey =
  | 'reason.recentRain'
  | 'reason.forecastRain'
  | 'reason.hotAndDry'
  | 'reason.default'
  | 'reason.noData';

export interface WateringDecision {
  decision:      WateringDecisionType;
  reason:        ReasonKey;   // i18n key — translated in the UI
  recentRainMm:  number;      // Diagnostic — rain in the past window
  expectedRainMm: number;     // Diagnostic — rain in the forecast window
  todayMaxTempC: number;
}

// ─── Geocoding ────────────────────────────────────────────────────────────────

export interface GeocodingResult {
  name: string;
  latitude: number;
  longitude: number;
  country: string;
  admin1?: string; // state / region
}
