import { createContext, useContext, useEffect, useMemo, useState } from 'react';
import type { Dictionary, Locale } from '../locales';
import { dictionaries } from '../locales';

type I18nContextType = {
  locale: Locale;
  setLocale: (locale: Locale) => void;
  t: Dictionary;
};

const I18nContext = createContext<I18nContextType | undefined>(undefined);

function getInitialLocale(): Locale {
  const stored = localStorage.getItem('calibre_locale');
  if (stored === 'en' || stored === 'fr') return stored;
  const browser = navigator.language.toLowerCase();
  if (browser.startsWith('en')) return 'en';
  return 'fr';
}

export function I18nProvider({ children }: { children: React.ReactNode }) {
  const [locale, setLocaleState] = useState<Locale>(getInitialLocale);

  useEffect(() => {
    localStorage.setItem('calibre_locale', locale);
    document.documentElement.lang = locale;
  }, [locale]);

  const setLocale = (value: Locale) => {
    setLocaleState(value);
  };

  const value = useMemo<I18nContextType>(() => {
    const t = dictionaries[locale] as Dictionary;
    return { locale, setLocale, t };
  }, [locale]);

  return <I18nContext.Provider value={value}>{children}</I18nContext.Provider>;
}

export function useI18n() {
  const ctx = useContext(I18nContext);
  if (!ctx) throw new Error('useI18n must be used within I18nProvider');
  return ctx;
}
