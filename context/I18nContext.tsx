import React, { createContext, ReactNode, useContext, useEffect, useState } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import fr from '@/translations/fr';
import en from '@/translations/en';

type LanguageCode = 'fr' | 'en';
type TranslationDict = Record<string, string>;

const TRANSLATIONS: Record<LanguageCode, TranslationDict> = { fr, en };
const LANG_STORAGE_KEY = 'app_language';

const LABELS: Record<LanguageCode, string> = {
  fr: 'Français',
  en: 'English',
};

interface I18nContextType {
  language: LanguageCode;
  setLanguage: (lang: LanguageCode) => Promise<void>;
  t: (key: string, params?: Record<string, string>) => string;
  availableLanguages: { code: LanguageCode; label: string }[];
}

const I18nContext = createContext<I18nContextType | undefined>(undefined);

export function I18nProvider({ children }: { children: ReactNode }) {
  const [language, setLanguageState] = useState<LanguageCode>('fr');

  useEffect(() => {
    loadLanguage();
  }, []);

  const loadLanguage = async () => {
    try {
      const saved = await AsyncStorage.getItem(LANG_STORAGE_KEY);
      if (saved === 'en' || saved === 'fr') {
        setLanguageState(saved);
      }
    } catch {}
  };

  const setLanguage = async (lang: LanguageCode) => {
    setLanguageState(lang);
    await AsyncStorage.setItem(LANG_STORAGE_KEY, lang);
  };

  const t = (key: string, params?: Record<string, string>): string => {
    const dict = TRANSLATIONS[language] || fr;
    let val = dict[key];
    if (!val) {
      val = TRANSLATIONS.fr[key] || key;
    }
    if (params) {
      for (const [k, v] of Object.entries(params)) {
        val = val.replace(`{${k}}`, v);
      }
    }
    return val;
  };

  const availableLanguages = Object.entries(LABELS).map(([code, label]) => ({
    code: code as LanguageCode,
    label,
  }));

  return (
    <I18nContext.Provider value={{ language, setLanguage, t, availableLanguages }}>
      {children}
    </I18nContext.Provider>
  );
}

export function useI18n() {
  const context = useContext(I18nContext);
  if (!context) throw new Error('useI18n must be used within I18nProvider');
  return context;
}

export function useT() {
  return useI18n().t;
}
