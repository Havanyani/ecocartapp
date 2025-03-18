import { act, renderHook } from '@testing-library/react-hooks';
import { I18nManager } from 'react-native';
import { useLanguage } from '../../../hooks/useLanguage';
import { getCurrentLanguage, isCurrentLanguageRTL, setLanguage } from '../../../i18n/enhanced';

// Mock dependencies
jest.mock('../../../i18n/enhanced');
jest.mock('react-native', () => {
  const RN = jest.requireActual('react-native');
  return {
    ...RN,
    I18nManager: {
      ...RN.I18nManager,
      allowRTL: jest.fn(),
      forceRTL: jest.fn(),
    },
  };
});

describe('useLanguage', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    (getCurrentLanguage as jest.Mock).mockReturnValue('en');
    (isCurrentLanguageRTL as jest.Mock).mockReturnValue(false);
  });

  it('initializes with current language', () => {
    const { result } = renderHook(() => useLanguage());
    expect(result.current.currentLang).toBe('en');
  });

  it('provides supported languages', () => {
    const { result } = renderHook(() => useLanguage());
    expect(result.current.supportedLanguages).toBeDefined();
    expect(Object.keys(result.current.supportedLanguages).length).toBeGreaterThan(0);
  });

  it('handles language change successfully', async () => {
    const { result } = renderHook(() => useLanguage());

    await act(async () => {
      await result.current.changeLanguage('es');
    });

    expect(setLanguage).toHaveBeenCalledWith('es');
    expect(result.current.currentLang).toBe('es');
  });

  it('updates RTL settings when language changes', async () => {
    (isCurrentLanguageRTL as jest.Mock).mockReturnValue(true);
    const { result } = renderHook(() => useLanguage());

    await act(async () => {
      await result.current.changeLanguage('ar');
    });

    expect(I18nManager.allowRTL).toHaveBeenCalledWith(true);
    expect(I18nManager.forceRTL).toHaveBeenCalledWith(true);
  });

  it('handles language change errors', async () => {
    const error = new Error('Failed to change language');
    (setLanguage as jest.Mock).mockRejectedValueOnce(error);
    const { result } = renderHook(() => useLanguage());

    await act(async () => {
      await expect(result.current.changeLanguage('es')).rejects.toThrow(error);
    });

    expect(result.current.currentLang).toBe('en'); // Should not change on error
  });

  it('provides correct RTL status', () => {
    (isCurrentLanguageRTL as jest.Mock).mockReturnValue(true);
    const { result } = renderHook(() => useLanguage());
    expect(result.current.isRTL).toBe(true);
  });
}); 