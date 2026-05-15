import AsyncStorage from '@react-native-async-storage/async-storage';

// ─── Types ────────────────────────────────────────────────────────────────────

export interface Location {
  id: string;
  name: string;
  latitude: number;
  longitude: number;
}

export interface AppSettings {
  locations: Location[];
  reminderEnabled: boolean;
  reminderTime: string; // 'HH:MM', e.g. '08:00'
}

// ─── Constants ────────────────────────────────────────────────────────────────

export const MAX_LOCATIONS_FREE    = 1;
export const MAX_LOCATIONS_PREMIUM = 4;

const DEFAULT_SETTINGS: AppSettings = {
  locations: [],
  reminderEnabled: false,
  reminderTime: '08:00',
};

const KEYS = {
  SETTINGS:      '@jsl/settings',
  WEATHER_CACHE: '@jsl/weather_cache', // legacy single-entry key (kept for clearing)
} as const;

// ─── ID helper ────────────────────────────────────────────────────────────────

function generateId(): string {
  return `${Date.now()}_${Math.random().toString(36).slice(2, 7)}`;
}

// ─── Settings API ─────────────────────────────────────────────────────────────

export async function loadSettings(): Promise<AppSettings> {
  try {
    const json = await AsyncStorage.getItem(KEYS.SETTINGS);
    if (!json) return { ...DEFAULT_SETTINGS };

    const parsed = JSON.parse(json) as Record<string, unknown>;

    // ── Migration: old single-location format → locations array ──────────────
    if (!parsed.locations) {
      const locations: Location[] = [];
      if (
        typeof parsed.latitude  === 'number' &&
        typeof parsed.longitude === 'number' &&
        typeof parsed.locationName === 'string' &&
        parsed.locationName
      ) {
        locations.push({
          id:        'legacy',
          name:      parsed.locationName,
          latitude:  parsed.latitude,
          longitude: parsed.longitude,
        });
      }
      return {
        locations,
        reminderEnabled: Boolean(parsed.reminderEnabled),
        reminderTime:    typeof parsed.reminderTime === 'string' ? parsed.reminderTime : '08:00',
      };
    }

    return {
      locations:       Array.isArray(parsed.locations) ? (parsed.locations as Location[]) : [],
      reminderEnabled: Boolean(parsed.reminderEnabled),
      reminderTime:    typeof parsed.reminderTime === 'string' ? parsed.reminderTime : '08:00',
    };
  } catch {
    return { ...DEFAULT_SETTINGS };
  }
}

export async function saveSettings(patch: Partial<AppSettings>): Promise<void> {
  const current = await loadSettings();
  await AsyncStorage.setItem(KEYS.SETTINGS, JSON.stringify({ ...current, ...patch }));
}

// ─── Location helpers ─────────────────────────────────────────────────────────

export async function addLocation(loc: Omit<Location, 'id'>): Promise<Location> {
  const newLoc: Location = { ...loc, id: generateId() };
  const current = await loadSettings();
  await saveSettings({ locations: [...current.locations, newLoc] });
  return newLoc;
}

export async function removeLocation(id: string): Promise<void> {
  const current = await loadSettings();
  await saveSettings({ locations: current.locations.filter(l => l.id !== id) });
}

// ─── Weather cache API (per-location, keyed by rounded coords) ────────────────

export interface RawWeatherCache {
  json:      string;  // serialised WeatherData
  fetchedAt: number;  // Date.now() timestamp
  latitude:  number;
  longitude: number;
}

function weatherCacheKey(latitude: number, longitude: number): string {
  return `@jsl/wc_${latitude.toFixed(2)}_${longitude.toFixed(2)}`;
}

export async function loadWeatherCache(
  latitude: number,
  longitude: number,
): Promise<RawWeatherCache | null> {
  try {
    const raw = await AsyncStorage.getItem(weatherCacheKey(latitude, longitude));
    if (!raw) return null;
    return JSON.parse(raw) as RawWeatherCache;
  } catch {
    return null;
  }
}

export async function saveWeatherCache(cache: RawWeatherCache): Promise<void> {
  await AsyncStorage.setItem(
    weatherCacheKey(cache.latitude, cache.longitude),
    JSON.stringify(cache),
  );
}

export async function clearWeatherCache(): Promise<void> {
  // Clear all per-location caches plus the legacy single-entry key
  const allKeys = await AsyncStorage.getAllKeys();
  const cacheKeys = allKeys.filter(
    k => k.startsWith('@jsl/wc_') || k === KEYS.WEATHER_CACHE,
  );
  if (cacheKeys.length) await AsyncStorage.multiRemove(cacheKeys);
}
