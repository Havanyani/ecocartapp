import { getLocales } from 'expo-localization';
import { I18n } from 'i18n-js';

import { PerformanceMonitor } from './PerformanceMonitoring';

// Define nested translation structure type
interface TranslationStrings {
  welcome: string;
  schedule: string;
  settings: {
    title: string;
    language: string;
    notifications: string;
    schedule: string;
    reminders: string;
    profile: string;
    environmental: string;
    credits: string;
  };
  collection: {
    title: string;
    schedule: {
      title: string;
      instructions: string;
      weightEstimate: string;
      timeSlot: string;
      submit: string;
    };
    status: {
      pending: string;
      completed: string;
      cancelled: string;
      inProgress: string;
      scheduled: string;
    };
    feedback: {
      title: string;
      rating: string;
      comment: string;
      submit: string;
    };
  };
  profile: {
    stats: {
      plasticCollected: string;
      creditsEarned: string;
      collectionsCompleted: string;
      environmentalImpact: string;
    };
    levels: {
      bronze: string;
      silver: string;
      gold: string;
      platinum: string;
    };
    rewards: {
      available: string;
      history: string;
      redeem: string;
    };
  };
  environmental: {
    impact: {
      title: string;
      plasticWeight: string;
      co2Saved: string;
      waterSaved: string;
      treesEquivalent: string;
      bottlesSaved: string;
    };
    tips: {
      title: string;
      sorting: string;
      cleaning: string;
      storage: string;
    };
  };
  notifications: {
    collectionReminder: string;
    creditEarned: string;
    levelUp: string;
    promotionalOffer: string;
  };
}

// Create a type for nested paths
type DotPrefix<T extends string> = T extends '' ? '' : `.${T}`;

type DotNestedKeys<T> = (
  T extends object
    ? {
        [K in Exclude<keyof T, symbol>]: `${K}${DotPrefix<
          DotNestedKeys<T[K]>
        >}`;
      }[Exclude<keyof T, symbol>]
    : ''
) extends infer D
  ? Extract<D, string>
  : never;

// Type for all possible translation keys
export type TranslationKey = DotNestedKeys<TranslationStrings>;

// Define available languages
export const SUPPORTED_LANGUAGES = ['en', 'es'] as const;
export type SupportedLanguage = (typeof SUPPORTED_LANGUAGES)[number];

// Type for the translations object
type Translations = {
  [K in SupportedLanguage]: TranslationStrings;
};

// Define translations
const _translations = {
  en: {
    welcome: 'Welcome to EcoCart',
    schedule: 'Schedule Collection',
    settings: {
      title: 'Settings',
      language: 'Language',
      notifications: 'Notifications',
      schedule: 'Schedule',
      reminders: 'Reminders',
      profile: 'Profile',
      environmental: 'Environmental',
      credits: 'Credits',
    },
  },
  es: {
    welcome: 'Bienvenido a EcoCart',
    schedule: 'Programar Recolección',
    settings: {
      title: 'Configuración',
      language: 'Idioma',
      notifications: 'Notificaciones',
      schedule: 'Horario',
      reminders: 'Recordatorios',
      profile: 'Perfil',
      environmental: 'Medioambiental',
      credits: 'Créditos',
    },
  },
};

// Initialize i18n with a simpler configuration
const i18n = new I18n(_translations, {
  defaultLocale: 'en',
  enableFallback: true,
});

// Set the locale with fallback
i18n.locale = getLocales()[0]?.languageCode || 'en';

// Export the translate function
export const t = (
  key: string,
  params?: Record<string, string | number>,
): string => {
  return i18n.t(key, params);
};

export default i18n;

// Helper function for type-safe translations
export const translate = (
  key: string,
  params?: Record<string, string | number>,
): string => {
  try {
    const translation = i18n.t(key, params);
    return translation || key;
  } catch (error) {
    console.error('Translation error:', error);
    return key;
  }
};

// Configure i18n with type safety
try {
  const deviceLocale = getLocales()[0]?.languageCode || 'en';
  i18n.locale = deviceLocale;

  // Configure number formatting using the Intl API
  const formatters = {
    currency: new Intl.NumberFormat('en-ZA', {
      style: 'currency',
      currency: 'ZAR',
      minimumFractionDigits: 2,
    }),
    weight: new Intl.NumberFormat('en-ZA', {
      style: 'decimal',
      minimumFractionDigits: 1,
      maximumFractionDigits: 1,
    }),
  };

  // Add format helpers to the i18n instance
  const _formatCurrency = (value: number): string =>
    formatters.currency.format(value);
  const _formatWeight = (value: number): string =>
    formatters.weight.format(value);

  PerformanceMonitor.addBreadcrumb(
    'i18n',
    'Internationalization configured successfully',
  );
} catch (error: unknown) {
  PerformanceMonitor.captureError(
    error instanceof Error ? error : new Error(String(error)),
  );
}

// Test translations function
export function testTranslations(): {
  success: boolean;
  results: Array<{ test: string; passed: boolean; error?: string }>;
} {
  const results: Array<{ test: string; passed: boolean; error?: string }> = [];

  try {
    // Test 1: Basic translation
    const welcomeTest = {
      test: 'Basic translation',
      passed: translate('welcome') === 'Welcome to EcoCart',
    };
    results.push(welcomeTest);

    // Test 2: Nested translation
    const nestedTest = {
      test: 'Nested translation',
      passed:
        translate('collection.title' as TranslationKey) ===
        'Collection Details',
    };
    results.push(nestedTest);

    // Test 3: Parameter interpolation
    const paramTest = {
      test: 'Parameter interpolation',
      passed: translate('notifications.creditEarned' as TranslationKey, {
        amount: '100',
      }).includes('100'),
    };
    results.push(paramTest);

    // Test 4: Language switching
    const originalLocale = i18n.locale;
    i18n.locale = 'es';
    const switchTest = {
      test: 'Language switching',
      passed: translate('welcome') === 'Bienvenido a EcoCart',
    };
    results.push(switchTest);
    i18n.locale = originalLocale;

    // Test 5: Fallback
    const fallbackTest = {
      test: 'Fallback handling',
      passed: Boolean(translate('welcome')),
    };
    results.push(fallbackTest);

    // Log results
    console.log('Translation Test Results:', results);
    const allPassed = results.every((r) => r.passed);
    console.log(`All tests ${allPassed ? 'passed' : 'failed'}`);

    return {
      success: allPassed,
      results,
    };
  } catch (error) {
    console.error('Translation tests failed:', error);
    return {
      success: false,
      results: [
        {
          test: 'Test execution',
          passed: false,
          error: error instanceof Error ? error.message : String(error),
        },
      ],
    };
  }
}

export const formatters = {
  formatCurrency: (value: number): string =>
    new Intl.NumberFormat('en-ZA', {
      style: 'currency',
      currency: 'ZAR',
    }).format(value),
  formatWeight: (value: number): string =>
    new Intl.NumberFormat('en-ZA', {
      minimumFractionDigits: 1,
      maximumFractionDigits: 1,
    }).format(value),
};
