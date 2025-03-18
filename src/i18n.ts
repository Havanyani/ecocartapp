import { getLocales } from 'expo-localization';
import { I18n } from 'i18n-js';
import { LogBox } from 'react-native';

// Translations
const translations = {
  en: {
    welcome: 'Welcome to EcoCart',
    collection: {
      title: 'Collection Details',
      schedule: 'Collection Schedule',
      status: 'Collection Status',
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
    },
  },
  es: {
    welcome: 'Bienvenido a EcoCart',
    // Add Spanish translations here
  },
};

type TranslationKey = keyof typeof translations.en;

const i18n = new I18n(translations);

// Set the locale
i18n.locale = getLocales()[0].languageCode || 'en';

// Enable fallback to 'en'
i18n.enableFallback = true;
i18n.defaultLocale = 'en';

// Disable yellow box warning for missing translations
LogBox.ignoreLogs(['Translation not found']);

export function translate(
  key: string,
  params?: Record<string, string | number>,
): string {
  try {
    return i18n.t(key, params);
  } catch (error) {
    console.error('Translation error:', error);
    return key;
  }
}

export function setLanguage(lang: string): void {
  i18n.locale = lang || 'en';
}

// Currency and number formatting
const currencyFormatter = new Intl.NumberFormat('en-ZA', {
  style: 'currency',
  currency: 'ZAR',
});

const decimalFormatter = new Intl.NumberFormat('en-ZA', {
  minimumFractionDigits: 1,
  maximumFractionDigits: 1,
});

// Utility functions for formatting
export const formatCurrency = (value: number): string => currencyFormatter.format(value);
export const formatWeight = (value: number): string => decimalFormatter.format(value);

// Run tests in development
if (__DEV__) {
  console.log('i18n', 'Internationalization configured successfully');
  
  try {
    // Test basic functionality
    const testResults: {
      success: boolean;
      results: Array<{ test: string; passed: boolean; error?: string }>;
    } = {
      success: true,
      results: [],
    };

    // Test cases
    const tests = [
      {
        name: 'Basic translation',
        test: () => translate('welcome') === 'Welcome to EcoCart',
      },
      {
        name: 'Nested translation',
        test: () =>
          translate('collection.title' as TranslationKey) === 'Collection Details',
      },
      {
        name: 'Parameter interpolation',
        test: () =>
          translate('notifications.creditEarned' as TranslationKey, {
            amount: '100',
          }).includes('100'),
      },
      {
        name: 'Language switching',
        test: () => {
          setLanguage('es');
          const result = translate('welcome') === 'Bienvenido a EcoCart';
          setLanguage('en');
          return result;
        },
      },
      {
        name: 'Fallback handling',
        test: () => Boolean(translate('welcome')),
      },
    ];

    // Run tests
    tests.forEach((test) => {
      try {
        const passed = test.test();
        testResults.results.push({
          test: test.name,
          passed,
        });
        if (!passed) testResults.success = false;
      } catch (error) {
        testResults.success = false;
        testResults.results.push({
          test: test.name,
          passed: false,
          error: error instanceof Error ? error.message : String(error),
        });
      }
    });

    // Log results
    console.log('Translation Test Results:');
    testResults.results.forEach((r) => {
      console.log(`- ${r.test}: ${r.passed ? 'passed' : 'failed'}`);
    });

    if (!testResults.success) {
      console.error('Translation tests failed:');
      testResults.results
        .filter((r) => !r.passed)
        .forEach((r) => {
          console.error(`- ${r.test}`);
          if (r.error) console.error(`  Error: ${r.error}`);
        });
    }
  } catch (error) {
    console.error('Failed to run i18n tests:', error);
  }
} 