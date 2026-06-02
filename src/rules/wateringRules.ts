import { WeatherData, WateringDecision, SoilMoistureState } from '../weather/weatherTypes';
import { THRESHOLDS } from '../weather/weatherConfig';
import { loadSoilMoisture, saveSoilMoisture } from '../storage/storageService';

// ─── Date helpers ─────────────────────────────────────────────────────────────

/** Returns today's date as YYYY-MM-DD in the device's local timezone. */
function localDateStr(): string {
  const now = new Date();
  const y   = now.getFullYear();
  const m   = String(now.getMonth() + 1).padStart(2, '0');
  const d   = String(now.getDate()).padStart(2, '0');
  return `${y}-${m}-${d}`;
}

/** Adds (or subtracts) n days to a YYYY-MM-DD string. Uses noon to avoid DST edge cases. */
function addDays(dateStr: string, n: number): string {
  const d = new Date(`${dateStr}T12:00:00`);
  d.setDate(d.getDate() + n);
  const y  = d.getFullYear();
  const mo = String(d.getMonth() + 1).padStart(2, '0');
  const da = String(d.getDate()).padStart(2, '0');
  return `${y}-${mo}-${da}`;
}

// ─── Hourly helpers (kept for diagnostic fields) ──────────────────────────────

function sumSlice(arr: number[], start: number, count: number): number {
  const s = Math.max(0, start);
  return arr.slice(s, s + count).reduce((acc, v) => acc + (Number.isFinite(v) ? v : 0), 0);
}

function currentHourIndex(times: string[]): number {
  const now = Date.now();
  let best  = 0;
  for (let i = 0; i < times.length; i++) {
    if (new Date(times[i]).getTime() <= now) best = i;
    else break;
  }
  return best;
}

// ─── Synchronous fallback (legacy — keeps existing imports compiling) ─────────

/**
 * @deprecated Use evaluateWateringWithSoilModel() instead.
 * This synchronous stub always returns 'uncertain' and exists only
 * for backward-compatibility. Will be removed in a future version.
 */
export function evaluateWatering(weather: WeatherData): WateringDecision {
  // Compute hourly diagnostics so the WeatherSummary widget still shows data
  const { hourly, daily } = weather;

  if (!hourly.precipitation.length || !hourly.time.length) {
    return {
      decision:      'uncertain',
      reason:        'reason.noData',
      recentRainMm:  0,
      expectedRainMm: 0,
      todayMaxTempC: 0,
    };
  }

  const idx            = currentHourIndex(hourly.time);
  const lookbackStart  = Math.max(0, idx - THRESHOLDS.RECENT_HOURS + 1);
  const recentRainMm   = sumSlice(hourly.precipitation, lookbackStart, THRESHOLDS.RECENT_HOURS);
  const expectedRainMm = sumSlice(hourly.precipitation, idx + 1, THRESHOLDS.FORECAST_HOURS);
  const today          = localDateStr();
  const todayIdx       = daily.time.findIndex(t => t === today);
  const todayMaxTempC  = todayIdx !== -1 ? (daily.temperature2mMax[todayIdx] ?? 20) : 20;

  return {
    decision:      'uncertain',
    reason:        'reason.noData',
    recentRainMm,
    expectedRainMm,
    todayMaxTempC,
  };
}

// ─── Soil Moisture Balance Model ──────────────────────────────────────────────

/**
 * Evaluates the watering decision using a daily Soil Moisture Balance Model.
 *
 * Algorithm:
 *  1. Load (or initialise) persisted SoilMoistureState.
 *  2. Replay missing days from lastUpdatedDate → today using:
 *       moisture += precipitation_mm − ET₀ × multiplier
 *       clamped to [SOIL_MOISTURE_MIN, SOIL_MOISTURE_MAX]
 *  3. Persist the updated state.
 *  4. Apply decision rules in priority order.
 */
export async function evaluateWateringWithSoilModel(
  weather: WeatherData,
  latitude: number,
  longitude: number,
): Promise<WateringDecision> {
  const { hourly, daily } = weather;

  // ── Guard: no data ───────────────────────────────────────────────────────────
  if (!hourly.precipitation.length || !hourly.time.length || !daily.time.length) {
    return {
      decision:      'uncertain',
      reason:        'reason.noData',
      recentRainMm:  0,
      expectedRainMm: 0,
      todayMaxTempC: 0,
      soilMoisturePercent: THRESHOLDS.SOIL_MOISTURE_INITIAL,
    };
  }

  // ── Hourly diagnostics (unchanged from original logic) ───────────────────────
  const hIdx           = currentHourIndex(hourly.time);
  const lookbackStart  = Math.max(0, hIdx - THRESHOLDS.RECENT_HOURS + 1);
  const recentRainMm   = sumSlice(hourly.precipitation, lookbackStart, THRESHOLDS.RECENT_HOURS);
  const expectedRainMm = sumSlice(hourly.precipitation, hIdx + 1, THRESHOLDS.FORECAST_HOURS);

  const today      = localDateStr();
  const todayDIdx  = daily.time.findIndex(t => t === today);
  const todayMaxTempC = todayDIdx !== -1 ? (daily.temperature2mMax[todayDIdx] ?? 20) : 20;

  // ── Load or initialise soil state ────────────────────────────────────────────
  let stored = await loadSoilMoisture(latitude, longitude);

  if (stored === null) {
    // First launch: start one day before the earliest available daily entry so
    // the replay loop processes all historical days in the weather payload.
    const earliestDate = daily.time[0] ?? today;
    stored = {
      moisturePercent:              THRESHOLDS.SOIL_MOISTURE_INITIAL,
      lastUpdatedDate:              addDays(earliestDate, -1),
      consecutiveOversaturatedDays: 0,
      consecutiveDryDays:           0,
    };
  }

  // ── Replay missing days ───────────────────────────────────────────────────────
  let moisture   = stored.moisturePercent;
  let oversatDays = stored.consecutiveOversaturatedDays;
  let dryDays     = stored.consecutiveDryDays;

  let cursor = addDays(stored.lastUpdatedDate, 1);

  while (cursor <= today) {
    const dIdx = daily.time.findIndex(t => t === cursor);

    if (dIdx !== -1) {
      const precip      = daily.precipitationSum[dIdx]         ?? 0;
      const et0         = daily.et0EvapotranspirationSum[dIdx] ?? 0;
      const temp        = daily.temperature2mMax[dIdx]         ?? 20;
      const etMult      = temp >= THRESHOLDS.HOT_TEMP_C
        ? THRESHOLDS.HOT_TEMP_ET_MULTIPLIER
        : 1.0;

      moisture = Math.min(
        THRESHOLDS.SOIL_MOISTURE_MAX,
        Math.max(
          THRESHOLDS.SOIL_MOISTURE_MIN,
          moisture + precip - et0 * etMult,
        ),
      );

      if (moisture > THRESHOLDS.SOIL_MOISTURE_OVERSATURATED) {
        oversatDays++;
      } else {
        oversatDays = 0;
      }

      if (moisture <= THRESHOLDS.SOIL_MOISTURE_MIN) {
        dryDays++;
      } else {
        dryDays = 0;
      }
    }

    cursor = addDays(cursor, 1);
  }

  // ── Persist updated state ────────────────────────────────────────────────────
  const newState: SoilMoistureState = {
    moisturePercent:              moisture,
    lastUpdatedDate:              today,
    consecutiveOversaturatedDays: oversatDays,
    consecutiveDryDays:           dryDays,
  };
  await saveSoilMoisture(newState, latitude, longitude);

  // ── Decision rules ────────────────────────────────────────────────────────────

  // Override A — urgent dry
  if (dryDays >= THRESHOLDS.SOIL_URGENT_DRY_DAYS) {
    return { decision: 'water', reason: 'reason.urgentDry', recentRainMm, expectedRainMm, todayMaxTempC, soilMoisturePercent: moisture };
  }

  // Override B — oversaturated for multiple days
  if (oversatDays >= THRESHOLDS.SOIL_OVERSATURATED_DAYS) {
    return { decision: 'skip', reason: 'reason.soilOversaturated', recentRainMm, expectedRainMm, todayMaxTempC, soilMoisturePercent: moisture };
  }

  // Override C — rain highly likely today or tomorrow
  const tomorrowStr   = addDays(today, 1);
  const todayProb     = todayDIdx !== -1
    ? (daily.precipitationProbabilityMax[todayDIdx] ?? 0)
    : 0;
  const tomorrowDIdx  = daily.time.findIndex(t => t === tomorrowStr);
  const tomorrowProb  = tomorrowDIdx !== -1
    ? (daily.precipitationProbabilityMax[tomorrowDIdx] ?? 0)
    : 0;

  if (todayProb >= THRESHOLDS.RAIN_FORECAST_PROBABILITY || tomorrowProb >= THRESHOLDS.RAIN_FORECAST_PROBABILITY) {
    return { decision: 'skip', reason: 'reason.forecastRainProbability', recentRainMm, expectedRainMm, todayMaxTempC, soilMoisturePercent: moisture };
  }

  // Base D — soil wet
  if (moisture >= THRESHOLDS.SOIL_MOISTURE_WET) {
    return { decision: 'skip', reason: 'reason.soilWet', recentRainMm, expectedRainMm, todayMaxTempC, soilMoisturePercent: moisture };
  }

  // Base E — soil dry
  if (moisture <= THRESHOLDS.SOIL_MOISTURE_DRY) {
    return { decision: 'water', reason: 'reason.soilDry', recentRainMm, expectedRainMm, todayMaxTempC, soilMoisturePercent: moisture };
  }

  // Base F — in-between
  return { decision: 'uncertain', reason: 'reason.soilUncertain', recentRainMm, expectedRainMm, todayMaxTempC, soilMoisturePercent: moisture };
}
