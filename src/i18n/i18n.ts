import AsyncStorage from '@react-native-async-storage/async-storage';
import {
  LanguageCode,
  TranslationKey,
  Translations,
  TRANSLATIONS,
  SUPPORTED_LANGUAGES,
} from './translations';

const LANG_KEY = '@jsl/language';

// ─── Module-level state ───────────────────────────────────────────────────────

let _setting: LanguageCode | 'auto' = 'auto';
let _current: LanguageCode          = 'en';
let _trans:   Translations          = TRANSLATIONS.en;

// ─── Device language detection ────────────────────────────────────────────────

/**
 * Reads the device locale using the JS-engine Intl API (Hermes built-in).
 * No native module required — works in Expo Go, dev builds, and production.
 */
function detectDeviceLanguage(): LanguageCode {
  try {
    const locale = Intl.DateTimeFormat().resolvedOptions().locale; // e.g. "pl-PL", "en-US"
    const raw    = locale.split(/[-_]/)[0].toLowerCase();          // → "pl", "en", …
    const supported = SUPPORTED_LANGUAGES.map(l => l.code) as string[];
    return supported.includes(raw) ? (raw as LanguageCode) : 'en';
  } catch {
    return 'en';
  }
}

// ─── Initialise once at startup (call in App.tsx before rendering) ────────────

export async function initI18n(): Promise<void> {
  try {
    const stored = await AsyncStorage.getItem(LANG_KEY);
    if (stored && SUPPORTED_LANGUAGES.some(l => l.code === stored)) {
      _setting = stored as LanguageCode;
      _current = stored as LanguageCode;
    } else {
      _setting = 'auto';
      _current = detectDeviceLanguage();
    }
  } catch {
    _setting = 'auto';
    _current = detectDeviceLanguage();
  }
  _trans = TRANSLATIONS[_current];
}

// ─── Persist user preference and switch language ──────────────────────────────

export async function persistLanguage(lang: LanguageCode | 'auto'): Promise<void> {
  _setting = lang;
  if (lang === 'auto') {
    await AsyncStorage.removeItem(LANG_KEY);
    _current = detectDeviceLanguage();
  } else {
    await AsyncStorage.setItem(LANG_KEY, lang);
    _current = lang;
  }
  _trans = TRANSLATIONS[_current];
}

// ─── Getters ──────────────────────────────────────────────────────────────────

export function getCurrentLanguage(): LanguageCode {
  return _current;
}

export function getLanguageSetting(): LanguageCode | 'auto' {
  return _setting;
}

// ─── Translation function ─────────────────────────────────────────────────────

type Params = Record<string, string | number>;

export function t(key: TranslationKey, params?: Params): string {
  let str: string = (_trans[key] ?? TRANSLATIONS.en[key] ?? key) as string;
  if (params) {
    for (const [k, v] of Object.entries(params)) {
      str = str.split(`{{${k}}}`).join(String(v));
    }
  }
  return str;
}
