// ─── Raw Open-Meteo response shapes ──────────────────────────────────────────

export interface OpenMeteoHourly {
  time: string[];            // ISO datetime strings, local time of requested timezone
  precipitation: number[];   // mm
  temperature_2m: number[];  // °C
}

export interface OpenMeteoDaily {
  time: string[];                          // ISO date strings
  precipitation_sum: number[];             // mm
  temperature_2m_max: number[];            // °C
  et0_fao_evapotranspiration: number[];    // mm — reference evapotranspiration
  precipitation_probability_max: number[]; // % — max probability of precipitation
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
    et0EvapotranspirationSum: number[];    // mm per day
    precipitationProbabilityMax: number[]; // % per day
  };
  timezone: string;
}

// ─── Soil moisture state (persisted in AsyncStorage) ─────────────────────────

export interface SoilMoistureState {
  moisturePercent: number;              // current estimated soil moisture 0–100
  lastUpdatedDate: string;              // ISO date string YYYY-MM-DD
  consecutiveOversaturatedDays: number; // days moisture was above OVERSATURATED threshold
  consecutiveDryDays: number;           // days moisture was at or below SOIL_MOISTURE_MIN
}

// ─── Decision output ──────────────────────────────────────────────────────────

export type WateringDecisionType = 'water' | 'skip' | 'uncertain';

/** i18n key for the decision reason — translated in UI layer */
export type ReasonKey =
  | 'reason.recentRain'
  | 'reason.forecastRain'
  | 'reason.hotAndDry'
  | 'reason.default'
  | 'reason.noData'
  // Soil Moisture Balance Model reasons
  | 'reason.soilWet'
  | 'reason.soilDry'
  | 'reason.soilUncertain'
  | 'reason.forecastRainProbability'
  | 'reason.soilOversaturated'
  | 'reason.urgentDry';

export interface WateringDecision {
  decision:             WateringDecisionType;
  reason:               ReasonKey;   // i18n key — translated in the UI
  recentRainMm:         number;      // Diagnostic — rain in the past 24 h window
  expectedRainMm:       number;      // Diagnostic — rain in the forecast 24 h window
  todayMaxTempC:        number;
  soilMoisturePercent?: number;      // Estimated soil moisture % (soil model only)
}

// ─── Geocoding ────────────────────────────────────────────────────────────────

export interface GeocodingResult {
  name: string;
  latitude: number;
  longitude: number;
  country: string;
  admin1?: string; // state / region
}
