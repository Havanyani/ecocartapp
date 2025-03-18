import { SUPPORTED_LANGUAGES, getCurrentLanguage, isCurrentLanguageRTL, setLanguage } from '@/i18n/enhanced';
import { useCallback, useEffect, useState } from 'react';
import { I18nManager } from 'react-native';

export type SupportedLanguage = keyof typeof SUPPORTED_LANGUAGES;

export function useLanguage() {
  const [currentLang, setCurrentLang] = useState<SupportedLanguage>(getCurrentLanguage());

  useEffect(() => {
    const isRTL = isCurrentLanguageRTL();
    I18nManager.allowRTL(isRTL);
    I18nManager.forceRTL(isRTL);
  }, [currentLang]);

  const changeLanguage = useCallback(async (lang: SupportedLanguage) => {
    try {
      await setLanguage(lang);
      setCurrentLang(lang);
    } catch (error) {
      console.error('Failed to change language:', error);
      throw error;
    }
  }, []);

  return {
    currentLang,
    changeLanguage,
    isRTL: isCurrentLanguageRTL(),
    supportedLanguages: SUPPORTED_LANGUAGES,
  };
} 