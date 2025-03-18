import { darkTheme, highContrast, sepia, Theme, THEME_STORAGE_KEY, ThemeContext, ThemeProvider } from '@contexts/ThemeContext';
import { act, renderHook } from '@testing-library/react-hooks';
import React from 'react';
import { Animated, useColorScheme } from 'react-native';

// Add at the top after imports
type WrapperProps = {
  children: React.ReactNode;
};

jest.mock('react-native', () => ({
  useColorScheme: jest.fn(),
}));

const mockSetItem = jest.fn((key: string, value: string) => Promise.resolve());
const mockGetItem = jest.fn((key: string) => Promise.resolve(null));
const mockClear = jest.fn(() => Promise.resolve());

jest.mock('@react-native-async-storage/async-storage', () => ({
  setItem: mockSetItem,
  getItem: mockGetItem,
  clear: mockClear
}));

describe('ThemeContext', () => {
  const mockTheme: Theme = {
    text: {
      primary: {
        fontSize: 16,
        fontWeight: '600',
        color: '#000000'
      },
      secondary: {
        fontSize: 14,
        fontWeight: '400',
        color: '#666666'
      }
    },
    colors: {
      background: '#FFFFFF',
      surface: '#F5F5F5',
      primary: '#1976D2',
      secondary: '#424242',
      success: '#388E3C',
      warning: '#FFA000',
      error: '#D32F2F',
      info: '#1976D2'
    },
    spacing: {
      xs: 4,
      sm: 8,
      md: 16,
      lg: 24,
      xl: 32
    },
    borderRadius: {
      sm: 4,
      md: 8,
      lg: 16
    }
  };

  beforeEach(() => {
    mockClear();
    (useColorScheme as jest.Mock).mockReturnValue('light');
  });

  it('provides theme to children', () => {
    const wrapper = ({ children }: { children: React.ReactNode }) => (
      <ThemeProvider>{children}</ThemeProvider>
    
    // const wrapper = ({ children }: WrapperProps) => (
    //   <ThemeProvider initialTheme={mockTheme}>
    //     {children}
    //   </ThemeProvider>
    );

    const { result } = renderHook(
      () => React.useContext(ThemeContext),
      { wrapper }
    );
    expect(result.current.theme).toEqual(mockTheme);
  });

  it('uses default theme when no initial theme provided', () => {
    const wrapper = ({ children }: { children: React.ReactNode }) => (
      <ThemeProvider>{children}</ThemeProvider>
    );
    
    const { result } = renderHook(
      () => React.useContext(ThemeContext),
      { wrapper }
    );
    expect((result.current as ThemeContextType).theme.text.primary).toBeDefined();
    expect((result.current as ThemeContextType).theme.text.secondary).toBeDefined();
  });

  it('should use system theme by default', () => {
    const wrapper = ({ children }: { children: React.ReactNode }) => (
      <ThemeProvider>{children}</ThemeProvider>
    );
    
    const { result } = renderHook(
      () => React.useContext(ThemeContext),
      { wrapper }
    );
    expect((result.current as ThemeContextType).useSystemTheme).toBe(true);
  });

  it('should respect system dark mode', () => {
    (useColorScheme as jest.Mock).mockReturnValue('dark');
    const wrapper = ({ children }: { children: React.ReactNode }) => (
      <ThemeProvider>{children}</ThemeProvider>
    );
    
    const { result } = renderHook(
      () => React.useContext(ThemeContext),
      { wrapper }
    );
    expect((result.current as ThemeContextType).theme).toEqual(expect.objectContaining(darkTheme));
  });

  it('should persist theme preferences', async () => {
    const wrapper = ({ children }: { children: React.ReactNode }) => (
      <ThemeProvider>{children}</ThemeProvider>
    );
    
    const { result } = renderHook(
      () => React.useContext(ThemeContext),
      { wrapper }
    );
    
    act(() => {
      (result.current as ThemeContextType).toggleTheme();
    });

    const saved = await mockGetItem(THEME_STORAGE_KEY);
    expect(JSON.parse(saved!)).toEqual(
      expect.objectContaining({ isDark: true })
    );
  });

  it('should load persisted preferences', async () => {
    await mockSetItem(
      THEME_STORAGE_KEY,
      JSON.stringify({ isDark: true, useSystemTheme: false })
    );

    const wrapper = ({ children }: { children: React.ReactNode }) => (
      <ThemeProvider>{children}</ThemeProvider>
    );
    
    const { result } = renderHook(
      () => React.useContext(ThemeContext),
      { wrapper }
    );
    expect((result.current as ThemeContextType).isDark).toBe(true);
    expect((result.current as ThemeContextType).useSystemTheme).toBe(false);
  });
});

describe('Theme Variations', () => {
  it('should support sepia theme', () => {
    const wrapper = ({ children }: { children: React.ReactNode }) => (
      <ThemeProvider>{children}</ThemeProvider>
    );
    
    const { result } = renderHook(
      () => React.useContext(ThemeContext),
      { wrapper }
    );
    
    act(() => {
      (result.current as ThemeContextType).setTheme(sepia);
    });

    expect((result.current as ThemeContextType).theme.colors.background).toBe('#F4ECD8');
  });

  it('should support high contrast theme', () => {
    const wrapper = ({ children }: { children: React.ReactNode }) => (
      <ThemeProvider>{children}</ThemeProvider>
    );
    
    const { result } = renderHook(
      () => React.useContext(ThemeContext),
      { wrapper }
    );
    
    act(() => {
      (result.current as ThemeContextType).setTheme(highContrast);
    });

    expect((result.current as ThemeContextType).theme.colors.background).toBe('#000000');
  });
});

describe('Theme Animations', () => {
  it('should animate theme changes', () => {
    const wrapper = ({ children }: { children: React.ReactNode }) => (
      <ThemeProvider>{children}</ThemeProvider>
    );
    
    const { result } = renderHook(
      () => React.useContext(ThemeContext),
      { wrapper }
    );
    
    act(() => {
      (result.current as ThemeContextType).toggleTheme();
    });

    expect((result.current as ThemeContextType).themeAnimation).toBeDefined();
    expect(typeof (result.current as ThemeContextType).themeAnimation.interpolate).toBe('function');
  });

  it('should complete animation after theme change', async () => {
    const wrapper = ({ children }: { children: React.ReactNode }) => (
      <ThemeProvider>{children}</ThemeProvider>
    );
    
    const { result } = renderHook(
      () => React.useContext(ThemeContext),
      { wrapper }
    );
    
    act(() => {
      (result.current as ThemeContextType).toggleTheme();
    });

    // Wait for animation
    await new Promise(resolve => setTimeout(resolve, 300));
    
    let value = 0;
    (result.current as ThemeContextType).themeAnimation.addListener(({ value: v }) => {
      value = v;
    });
    expect(value).toBe(1);
  });
});

describe('Theme Persistence', () => {
  it('should handle storage errors gracefully', async () => {
    const consoleSpy = jest.spyOn(console, 'error').mockImplementation();
    mockSetItem.mockRejectedValueOnce(new Error('Storage error'));

    const wrapper = ({ children }: { children: React.ReactNode }) => (
      <ThemeProvider>{children}</ThemeProvider>
    );
    
    const { result } = renderHook(
      () => React.useContext(ThemeContext),
      { wrapper }
    );
    
    act(() => {
      (result.current as ThemeContextType).toggleTheme();
    });

    await new Promise(resolve => setTimeout(resolve, 0));
    
    expect(consoleSpy).toHaveBeenCalledWith(
      'Failed to save theme preferences:',
      expect.any(Error)
    );
    consoleSpy.mockRestore();
  });
});

// Add type for hook result
type ThemeContextType = {
  theme: Theme;
  isDark: boolean;
  useSystemTheme: boolean;
  toggleTheme: () => void;
  setTheme: (theme: Theme) => void;
  setUseSystemTheme: (use: boolean) => void;
  themeAnimation: Animated.Value;
};

type ThemeContextValue = {
  theme: Theme;
  isDark: boolean;
  useSystemTheme: boolean;
  toggleTheme: () => void;
  setTheme: (theme: Theme) => void;
  setUseSystemTheme: (use: boolean) => void;
  themeAnimation: Animated.Value;
};

// For direct ThemeProvider usage
const { result } = renderHook(
  () => React.useContext(ThemeContext),
  { wrapper: (({ children }: { children: React.ReactNode }) => (
    <ThemeProvider>{children}</ThemeProvider>
  )) as React.FC
}
); 