import AsyncStorage from '@react-native-async-storage/async-storage';

// ─── Settings ────────────────────────────────────────────────────────────────

export interface AppSettings {
  locationName: string;
  latitude: number | null;
  longitude: number | null;
  reminderEnabled: boolean;
  reminderTime: string; // 'HH:MM', e.g. '08:00'
}

const DEFAULT_SETTINGS: AppSettings = {
  locationName: '',
  latitude: null,
  longitude: null,
  reminderEnabled: false,
  reminderTime: '08:00',
};

// ─── Storage keys ─────────────────────────────────────────────────────────────

const KEYS = {
  SETTINGS: '@jsl/settings',
  WEATHER_CACHE: '@jsl/weather_cache',
} as const;

// ─── Settings API ─────────────────────────────────────────────────────────────

export async function loadSettings(): Promise<AppSettings> {
  try {
    const json = await AsyncStorage.getItem(KEYS.SETTINGS);
    if (!json) return DEFAULT_SETTINGS;
    return { ...DEFAULT_SETTINGS, ...(JSON.parse(json) as Partial<AppSettings>) };
  } catch {
    return DEFAULT_SETTINGS;
  }
}

export async function saveSettings(patch: Partial<AppSettings>): Promise<void> {
  const current = await loadSettings();
  await AsyncStorage.setItem(KEYS.SETTINGS, JSON.stringify({ ...current, ...patch }));
}

// ─── Weather cache API ────────────────────────────────────────────────────────

export interface RawWeatherCache {
  json: string;       // serialised WeatherData
  fetchedAt: number;  // Date.now() timestamp
  latitude: number;
  longitude: number;
}

export async function loadWeatherCache(): Promise<RawWeatherCache | null> {
  try {
    const raw = await AsyncStorage.getItem(KEYS.WEATHER_CACHE);
    if (!raw) return null;
    return JSON.parse(raw) as RawWeatherCache;
  } catch {
    return null;
  }
}

export async function saveWeatherCache(cache: RawWeatherCache): Promise<void> {
  await AsyncStorage.setItem(KEYS.WEATHER_CACHE, JSON.stringify(cache));
}

export async function clearWeatherCache(): Promise<void> {
  await AsyncStorage.removeItem(KEYS.WEATHER_CACHE);
}
