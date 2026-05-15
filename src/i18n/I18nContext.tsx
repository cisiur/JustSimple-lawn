import React, {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useState,
} from 'react';
import {
  initI18n,
  persistLanguage,
  getCurrentLanguage,
  getLanguageSetting,
  t as rawT,
} from './i18n';
import type { LanguageCode, TranslationKey } from './translations';

// ─── Context shape ────────────────────────────────────────────────────────────

type Params = Record<string, string | number>;

interface I18nContextValue {
  /** Resolved language code (never 'auto') */
  language:        LanguageCode;
  /** User's stored preference ('auto' or a specific code) */
  languageSetting: LanguageCode | 'auto';
  /** Translate a key with optional template params */
  t:               (key: TranslationKey, params?: Params) => string;
  /** Change and persist the user's language preference */
  changeLanguage:  (lang: LanguageCode | 'auto') => Promise<void>;
}

const I18nContext = createContext<I18nContextValue | null>(null);

// ─── Provider ─────────────────────────────────────────────────────────────────

interface I18nProviderProps {
  children: React.ReactNode;
}

export function I18nProvider({ children }: I18nProviderProps) {
  const [ready, setReady] = useState(false);
  // Counter increments each time the language changes to force re-renders
  const [rev, setRev] = useState(0);

  useEffect(() => {
    initI18n().then(() => {
      setReady(true);
      setRev(r => r + 1);
    });
  }, []);

  const changeLanguage = useCallback(async (lang: LanguageCode | 'auto') => {
    await persistLanguage(lang);
    setRev(r => r + 1);
  }, []);

  // Recreate t wrapper on every rev bump so all consumers re-render
  // eslint-disable-next-line react-hooks/exhaustive-deps
  const tFn = useCallback(
    (key: TranslationKey, params?: Params) => rawT(key, params),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [rev],
  );

  const value: I18nContextValue = {
    language:        getCurrentLanguage(),
    languageSetting: getLanguageSetting(),
    t:               tFn,
    changeLanguage,
  };

  if (!ready) return null;

  return (
    <I18nContext.Provider value={value}>
      {children}
    </I18nContext.Provider>
  );
}

// ─── Hook ─────────────────────────────────────────────────────────────────────

export function useI18n(): I18nContextValue {
  const ctx = useContext(I18nContext);
  if (!ctx) throw new Error('useI18n must be used inside <I18nProvider>');
  return ctx;
}
