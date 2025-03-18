import AsyncStorage from '@react-native-async-storage/async-storage';
import { getLocales } from 'expo-localization';
import { I18n } from 'i18n-js';
import { LogBox } from 'react-native';

// Supported languages with their RTL status
export const SUPPORTED_LANGUAGES = {
  en: { name: 'English', isRTL: false },
  af: { name: 'Afrikaans', isRTL: false },
  zu: { name: 'isiZulu', isRTL: false },
  xh: { name: 'isiXhosa', isRTL: false },
  nr: { name: 'isiNdebele', isRTL: false },
  st: { name: 'Sesotho sa Leboa', isRTL: false },
  tn: { name: 'Setswana', isRTL: false },
  ss: { name: 'siSwati', isRTL: false },
  ve: { name: 'Tshivenda', isRTL: false },
  ts: { name: 'Xitsonga', isRTL: false },
  nso: { name: 'Sesotho', isRTL: false },
} as const;

export type SupportedLanguage = keyof typeof SUPPORTED_LANGUAGES;

// Translations with pluralization support
const translations = {
  en: {
    welcome: 'Welcome to EcoCart',
    collection: {
      title: 'Collection Details',
      schedule: 'Collection Schedule',
      status: 'Collection Status',
      items: {
        one: '{{count}} item',
        other: '{{count}} items',
      },
    },
    navigation: {
      home: 'Home',
      schedule: 'Schedule',
      reminders: 'Reminders',
      profile: 'Profile',
      environmental: 'Environmental',
      credits: 'Credits',
    },
    notifications: {
      creditEarned: 'You earned {{amount}} credits!',
      collectionReminder: {
        one: 'You have {{count}} collection tomorrow',
        other: 'You have {{count}} collections tomorrow',
      },
    },
    analytics: {
      title: 'Advanced Analytics',
      usage: 'Usage',
      performance: 'Performance',
      engagement: 'Engagement',
      metrics: {
        activeUsers: 'Active Users',
        sessionDuration: 'Session Duration',
        screenViews: 'Screen Views',
        loadTime: 'Load Time',
        errorRate: 'Error Rate',
        memoryUsage: 'Memory Usage',
        retention: 'Retention',
        conversion: 'Conversion',
        satisfaction: 'Satisfaction',
      },
      timeRanges: {
        day: 'Day',
        week: 'Week',
        month: 'Month',
      },
      charts: {
        trendAnalysis: 'Trend Analysis',
        metricDistribution: 'Metric Distribution',
      },
    },
  },
  af: {
    welcome: 'Welkom by EcoCart',
    collection: {
      title: 'Versamelingsbesonderhede',
      schedule: 'Versamelingskedule',
      status: 'Versamelingsstatus',
      items: {
        one: '{{count}} item',
        other: '{{count}} items',
      },
    },
    // ... Add Afrikaans translations
  },
  zu: {
    welcome: 'Wamukelekile e-EcoCart',
    collection: {
      title: 'Imininingwane Yokuqoqa',
      schedule: 'Ishejuli Yokuqoqa',
      status: 'Isimo Sokuqoqa',
      items: {
        one: 'into eyodwa',
        other: 'izinto ezingama-{{count}}',
      },
    },
    // ... Add isiZulu translations
  },
  xh: {
    welcome: 'Wamkelekile kwi-EcoCart',
    collection: {
      title: 'Iinkcukacha Zokuqokelela',
      schedule: 'Ishedyuli Yokuqokelela',
      status: 'Isimo Sokuqokelela',
      items: {
        one: 'into enye',
        other: 'izinto ezingama-{{count}}',
      },
    },
    // ... Add isiXhosa translations
  },
  nr: {
    welcome: 'Wamukelekile e-EcoCart',
    collection: {
      title: 'Imininingwane Yokuqoqa',
      schedule: 'Ishejuli Yokuqoqa',
      status: 'Isimo Sokuqoqa',
      items: {
        one: 'into eyodwa',
        other: 'izinto ezingama-{{count}}',
      },
    },
    // ... Add isiNdebele translations
  },
  st: {
    welcome: 'Re a go amogela go EcoCart',
    collection: {
      title: 'Dintlha tša Phokotšo',
      schedule: 'Lenaneo la Phokotšo',
      status: 'Boemo bja Phokotšo',
      items: {
        one: 'selo se le sengwe',
        other: 'dilo tše {{count}}',
      },
    },
    // ... Add Sesotho sa Leboa translations
  },
  tn: {
    welcome: 'O amogetswe mo EcoCart',
    collection: {
      title: 'Dintlha tša Phokotšo',
      schedule: 'Lenaneo la Phokotšo',
      status: 'Boemo bja Phokotšo',
      items: {
        one: 'selo se le sengwe',
        other: 'dilo tše {{count}}',
      },
    },
    // ... Add Setswana translations
  },
  ss: {
    welcome: 'Wamukelekile e-EcoCart',
    collection: {
      title: 'Emininingwane YekuQoqa',
      schedule: 'Ishejuli YekuQoqa',
      status: 'Isimo SekuQoqa',
      items: {
        one: 'into yinye',
        other: 'tinto leti-{{count}}',
      },
    },
    // ... Add siSwati translations
  },
  ve: {
    welcome: 'Ndaa kha EcoCart',
    collection: {
      title: 'Mafhungo a U Kuvhanganya',
      schedule: 'Tshifhinga tsha U Kuvhanganya',
      status: 'Tshimo tsha U Kuvhanganya',
      items: {
        one: 'tshithu tshithihi',
        other: 'zwithu zwihulu {{count}}',
      },
    },
    // ... Add Tshivenda translations
  },
  ts: {
    welcome: 'Wamukelekile e-EcoCart',
    collection: {
      title: 'Vuxokoxoko bya Ku Kuvonya',
      schedule: 'Nkarhi wa Ku Kuvonya',
      status: 'Xiyimo xa Ku Kuvonya',
      items: {
        one: "xilo xin'we",
        other: 'swilo swa {{count}}',
      },
    },
    // ... Add Xitsonga translations
  },
  nso: {
    welcome: 'Re a go amogela go EcoCart',
    collection: {
      title: 'Dintlha tša Phokotšo',
      schedule: 'Lenaneo la Phokotšo',
      status: 'Boemo bja Phokotšo',
      items: {
        one: 'selo se le sengwe',
        other: 'dilo tše {{count}}',
      },
    },
    // ... Add Sesotho translations
  },
};

// Create i18n instance
const i18n = new I18n(translations);

// Set default locale and enable fallback
i18n.enableFallback = true;
i18n.defaultLocale = 'en';

// Load saved language preference
async function loadSavedLanguage(): Promise<SupportedLanguage> {
  try {
    const savedLang = await AsyncStorage.getItem('user_language');
    if (savedLang && savedLang in SUPPORTED_LANGUAGES) {
      return savedLang as SupportedLanguage;
    }
  } catch (error) {
    console.error('Failed to load saved language:', error);
  }
  return 'en';
}

// Initialize i18n with device locale or saved preference
async function initializeI18n() {
  const savedLang = await loadSavedLanguage();
  const deviceLang = getLocales()[0].languageCode as SupportedLanguage;
  
  // Use saved language if available, otherwise use device language if supported, fallback to English
  const initialLang = savedLang || (SUPPORTED_LANGUAGES[deviceLang] ? deviceLang : 'en');
  
  i18n.locale = initialLang;
  return initialLang;
}

// Format numbers based on locale
export function formatNumber(value: number, options: Intl.NumberFormatOptions = {}): string {
  return new Intl.NumberFormat(i18n.locale, options).format(value);
}

// Format currency based on locale
export function formatCurrency(value: number, currency: string = 'ZAR'): string {
  return new Intl.NumberFormat(i18n.locale, {
    style: 'currency',
    currency,
  }).format(value);
}

// Format date based on locale
export function formatDate(date: Date, options: Intl.DateTimeFormatOptions = {}): string {
  return new Intl.DateTimeFormat(i18n.locale, options).format(date);
}

// Translate with pluralization support
export function translate(
  key: string,
  params?: Record<string, string | number>,
  count?: number
): string {
  try {
    return i18n.t(key, { ...params, count });
  } catch (error) {
    console.error('Translation error:', error);
    return key;
  }
}

// Change language and save preference
export async function setLanguage(lang: SupportedLanguage): Promise<void> {
  if (!(lang in SUPPORTED_LANGUAGES)) {
    throw new Error(`Unsupported language: ${lang}`);
  }
  
  i18n.locale = lang;
  try {
    await AsyncStorage.setItem('user_language', lang);
  } catch (error) {
    console.error('Failed to save language preference:', error);
  }
}

// Get current language
export function getCurrentLanguage(): SupportedLanguage {
  return i18n.locale as SupportedLanguage;
}

// Check if current language is RTL
export function isCurrentLanguageRTL(): boolean {
  return SUPPORTED_LANGUAGES[getCurrentLanguage()].isRTL;
}

// Initialize i18n
initializeI18n().catch(console.error);

// Disable yellow box warning for missing translations
LogBox.ignoreLogs(['Translation not found']);

// Export types
export type TranslationKey = keyof typeof translations.en; 