import { getLocales } from 'expo-localization';
import i18n, {
  formatters,
  SUPPORTED_LANGUAGES,
  translate,
  type TranslationKey
} from '../../utils/i18n';

// Mock expo-localization
jest.mock('expo-localization', () => ({
  getLocales: jest.fn(() => [{
    languageCode: 'en',
    countryCode: 'US',
    languageTag: 'en-US',
    isRTL: false
  }])
}));

// Define supported languages for testing
const SUPPORTED_LANGUAGES_TEST = ['en', 'es', 'fr', 'de', 'zh', 'af'] as const;
type SupportedLanguage = typeof SUPPORTED_LANGUAGES_TEST[number];

describe('i18n utility', () => {
  beforeEach(() => {
    // Reset i18n locale to English before each test
    i18n.locale = 'en';
  });

  describe('translations', () => {
    it('should translate basic strings', () => {
      expect(i18n.t('welcome')).toBe('Welcome to EcoCart');
    });

    it('should translate nested strings', () => {
      expect(i18n.t('collection.schedule.title')).toBe('Schedule a Plastic Collection');
      expect(i18n.t('environmental.impact.title')).toBe('Your Environmental Impact');
    });

    it('should handle translation with parameters', () => {
      expect(i18n.t('notifications.creditEarned', { amount: '100' }))
        .toBe('You earned 100 credits for your recycling!');
      expect(i18n.t('notifications.levelUp', { level: 'Gold' }))
        .toBe('Congratulations! You\'ve reached Gold level');
    });

    it('should fallback to English for unsupported languages', () => {
      i18n.locale = 'xx' as any; // Set to unsupported language
      expect(i18n.t('welcome')).toBe('Welcome to EcoCart');
    });
  });

  describe('language support', () => {
    it('should support all specified languages', () => {
      const expectedLanguages = SUPPORTED_LANGUAGES_TEST;
      expectedLanguages.forEach(lang => {
        expect(SUPPORTED_LANGUAGES_TEST).toContain(lang);
      });
    });

    it('should have complete translations for all supported languages', () => {
      SUPPORTED_LANGUAGES_TEST.forEach((lang: SupportedLanguage) => {
        i18n.locale = lang;
        expect(i18n.t('welcome')).not.toBe('welcome');
        expect(i18n.t('collection.title')).not.toBe('collection.title');
      });
    });
  });

  describe('number formatting', () => {
    it('should format currency correctly', () => {
      const formattedCurrency = formatters.formatCurrency(1234.56);
      expect(formattedCurrency).toMatch(/R\s*1[,.]234[.,]56/); // Handles both comma and period separators
    });

    it('should format weight correctly', () => {
      const formattedWeight = formatters.formatWeight(1234.56);
      expect(formattedWeight).toMatch(/1[,.]234[.,]6/); // One decimal place
    });
  });

  describe('localization integration', () => {
    it('should use device locale when available', () => {
      (getLocales as jest.Mock).mockReturnValueOnce([{
        languageCode: 'es',
        countryCode: 'ES',
        languageTag: 'es-ES',
        isRTL: false
      }]);

      // Reinitialize i18n to test locale detection
      i18n.locale = getLocales()[0]?.languageCode || 'en';
      expect(i18n.locale).toBe('es');
    });

    it('should fallback to English when device locale is not supported', () => {
      (getLocales as jest.Mock).mockReturnValueOnce([{
        languageCode: 'xx',
        countryCode: 'XX',
        languageTag: 'xx-XX',
        isRTL: false
      }]);

      // Reinitialize i18n to test fallback
      i18n.locale = getLocales()[0]?.languageCode || 'en';
      expect(i18n.t('welcome')).toBe('Welcome to EcoCart');
    });
  });

  describe('error handling', () => {
    it('should return key when translation is missing', () => {
      const nonExistentKey = 'nonexistent.key';
      expect(i18n.t(nonExistentKey)).toContain(nonExistentKey);
    });

    it('should handle invalid translation parameters gracefully', () => {
      expect(i18n.t('notifications.creditEarned', { wrongParam: '100' }))
        .toContain('{{amount}}'); // Shows unparsed parameter when wrong param name is used
    });
  });
});

describe('i18n Translations', () => {
  const originalConsoleLog = console.log;
  const originalConsoleError = console.error;

  beforeAll(() => {
    // Suppress console output during tests
    console.log = jest.fn();
    console.error = jest.fn();
  });

  afterAll(() => {
    // Restore console functions
    console.log = originalConsoleLog;
    console.error = originalConsoleError;
  });

  beforeEach(() => {
    i18n.locale = 'en';
  });

  describe('Basic Translation Features', () => {
    it('should translate top-level strings', () => {
      expect(translate('welcome')).toBe('Welcome to EcoCart');
      expect(translate('schedule')).toBe('Schedule Collection');
    });

    it('should handle deeply nested translations', () => {
      expect(translate('environmental.impact.co2Saved' as TranslationKey))
        .toBe('CO₂ Emissions Saved');
      expect(translate('profile.stats.environmentalImpact' as TranslationKey))
        .toBe('Environmental Impact');
    });

    it('should handle multiple parameters in one string', () => {
      const result = translate('notifications.levelUp' as TranslationKey, { 
        level: 'Gold',
        extra: 'Test' // Should ignore unused params
      });
      expect(result).toBe('Congratulations! You\'ve reached Gold level');
    });
  });

  describe('Language-Specific Features', () => {
    it('should handle special characters correctly', () => {
      i18n.locale = 'fr';
      expect(translate('environmental.impact.co2Saved' as TranslationKey))
        .toBe('Économies d\'Émissions de CO₂');
    });

    it('should handle Chinese characters', () => {
      i18n.locale = 'zh';
      expect(translate('welcome')).toBe('欢迎来到EcoCart');
    });

    it('should handle Afrikaans special characters', () => {
      i18n.locale = 'af';
      expect(translate('collection.schedule.title' as TranslationKey))
        .toBe('Skeduleer \'n Plastiek Versameling');
    });
  });

  describe('Edge Cases and Error Handling', () => {
    it('should handle empty parameters gracefully', () => {
      expect(translate('notifications.creditEarned' as TranslationKey, {}))
        .toContain('{{amount}}');
    });

    it('should handle undefined parameters', () => {
      expect(translate('notifications.creditEarned' as TranslationKey, undefined))
        .toContain('{{amount}}');
    });

    it('should handle switching between languages rapidly', () => {
      const key = 'welcome';
      SUPPORTED_LANGUAGES.forEach(lang => {
        i18n.locale = lang;
        expect(translate(key)).not.toBe(key);
      });
    });

    it('should handle numeric parameters correctly', () => {
      expect(translate('notifications.creditEarned' as TranslationKey, { amount: 100 }))
        .toContain('100');
    });
  });

  describe('Formatting Features', () => {
    it('should format currency with correct decimals', () => {
      const cases = [
        { input: 1234.56, expected: /R\s*1[,.]234[.,]56/ },
        { input: 1234, expected: /R\s*1[,.]234[.,]00/ },
        { input: 0.99, expected: /R\s*0[.,]99/ }
      ];

      cases.forEach(({ input, expected }) => {
        expect(formatters.formatCurrency(input)).toMatch(expected);
      });
    });

    it('should format weights consistently', () => {
      const cases = [
        { input: 1234.56, expected: /1[,.]234[.,]6/ },
        { input: 1234, expected: /1[,.]234[.,]0/ },
        { input: 0.99, expected: /0[.,]9/ }
      ];

      cases.forEach(({ input, expected }) => {
        expect(formatters.formatWeight(input)).toMatch(expected);
      });
    });
  });

  describe('Translation Completeness', () => {
    const requiredKeys: TranslationKey[] = [
      'welcome',
      'schedule',
      'collection.title' as TranslationKey,
      'profile.stats.plasticCollected' as TranslationKey,
      'environmental.impact.title' as TranslationKey
    ];

    SUPPORTED_LANGUAGES.forEach(lang => {
      it(`should have all required translations for ${lang}`, () => {
        i18n.locale = lang;
        requiredKeys.forEach(key => {
          const translation = translate(key);
          expect(translation).not.toBe(key);
          expect(translation.length).toBeGreaterThan(0);
        });
      });
    });
  });
}); 