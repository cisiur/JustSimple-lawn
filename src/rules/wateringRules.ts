import { WeatherData, WateringDecision } from '../weather/weatherTypes';
import { THRESHOLDS } from '../weather/weatherConfig';

// ─── Helpers ──────────────────────────────────────────────────────────────────

function sumSlice(arr: number[], start: number, count: number): number {
  const s = Math.max(0, start);
  return arr.slice(s, s + count).reduce((acc, v) => acc + (Number.isFinite(v) ? v : 0), 0);
}

/**
 * Returns the index of the most recent elapsed hour in the hourly time array.
 * Open-Meteo hourly times use the station's local timezone (no offset in string).
 * We compare by wall-clock hour using the device's local time.
 */
function currentHourIndex(times: string[]): number {
  const now = Date.now();
  let best = 0;
  for (let i = 0; i < times.length; i++) {
    if (new Date(times[i]).getTime() <= now) best = i;
    else break;
  }
  return best;
}

// ─── Rules engine ─────────────────────────────────────────────────────────────

export function evaluateWatering(weather: WeatherData): WateringDecision {
  const { hourly, daily } = weather;

  // Guard: incomplete data
  if (
    !hourly.precipitation.length ||
    !daily.precipitationSum.length ||
    !hourly.time.length
  ) {
    return {
      decision:      'uncertain',
      reason:        'reason.noData',
      recentRainMm:  0,
      expectedRainMm: 0,
      todayMaxTempC: 0,
    };
  }

  const idx = currentHourIndex(hourly.time);

  // Rain that already fell: look back RECENT_HOURS from the current hour
  const lookbackStart = Math.max(0, idx - THRESHOLDS.RECENT_HOURS + 1);
  const recentRainMm  = sumSlice(hourly.precipitation, lookbackStart, THRESHOLDS.RECENT_HOURS);

  // Rain that is coming: look forward FORECAST_HOURS from the next hour
  const expectedRainMm = sumSlice(hourly.precipitation, idx + 1, THRESHOLDS.FORECAST_HOURS);

  // Today's high temperature (daily[0] = yesterday, daily[1] = today with past_days=1)
  const todayMaxTempC = daily.temperature2mMax[1] ?? daily.temperature2mMax[0] ?? 20;

  // ── Rule 1: Recent rain → skip ────────────────────────────────────────────
  if (recentRainMm >= THRESHOLDS.RECENT_RAIN_MM) {
    return {
      decision:      'skip',
      reason:        'reason.recentRain',
      recentRainMm,
      expectedRainMm,
      todayMaxTempC,
    };
  }

  // ── Rule 2: Rain expected → skip ──────────────────────────────────────────
  if (expectedRainMm >= THRESHOLDS.FORECAST_RAIN_MM) {
    return {
      decision:      'skip',
      reason:        'reason.forecastRain',
      recentRainMm,
      expectedRainMm,
      todayMaxTempC,
    };
  }

  // ── Rule 3: Hot and dry → water urgently ─────────────────────────────────
  if (todayMaxTempC >= THRESHOLDS.HOT_TEMP_C) {
    return {
      decision:      'water',
      reason:        'reason.hotAndDry',
      recentRainMm,
      expectedRainMm,
      todayMaxTempC,
    };
  }

  // ── Rule 4: Dry conditions → water ───────────────────────────────────────
  return {
    decision:      'water',
    reason:        'reason.default',
    recentRainMm,
    expectedRainMm,
    todayMaxTempC,
  };
}
