import { Theme, ThemeProvider, defaultTheme } from '@contexts/ThemeContext';
import { NavigationContainer } from '@react-navigation/native';
import { configureStore } from '@reduxjs/toolkit';
import { render as rtlRender } from '@testing-library/react-native';
import React from 'react';
import { Provider } from 'react-redux';

// Default theme for testing
export const mockTheme: Theme = {
  ...defaultTheme,
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

// Mock initial Redux state
export const mockInitialState = {
  performance: {
    metrics: {
      loading: false,
      error: null,
      data: null
    }
  },
  sustainability: {
    metrics: {
      plasticWeight: 0,
      carbonOffset: 0,
      waterSaved: 0
    }
  }
};

type RenderOptions = {
  initialState?: typeof mockInitialState;
  store?: ReturnType<typeof configureStore>;
  theme?: Theme;
} & Parameters<typeof rtlRender>[1];

// Custom render function with providers
export function renderWithProviders(
  ui: React.ReactElement,
  {
    initialState = mockInitialState,
    store = configureStore({
      reducer: {
        performance: (state = initialState.performance) => state,
        sustainability: (state = initialState.sustainability) => state
      }
    }),
    theme = mockTheme,
    ...renderOptions
  }: RenderOptions = {}
) {
  function Wrapper({ children }: { children: React.ReactNode }) {
    return React.createElement(Provider, { store, children: 
      React.createElement(ThemeProvider, { initialTheme: theme, children:
        React.createElement(NavigationContainer, { children })
      })
    });
  }

  return rtlRender(ui, { wrapper: Wrapper, ...renderOptions });
}

// Test data generators
export const generateMetrics = (overrides = {}) => ({
  plasticWeight: 450,
  bottlesSaved: 2000,
  treesPlanted: 50,
  carbonOffset: 1250,
  energyEfficiency: 80,
  wasteReduction: 75,
  ...overrides
});

// Common test matchers
export const matchStyles = (element: any, styles: Record<string, unknown>) => {
  Object.entries(styles).forEach(([key, value]) => {
    expect(element).toHaveStyle({ [key]: value });
  });
};

// Async utilities
export const waitForElement = async (
  getElement: () => unknown,
  timeout = 1000
): Promise<unknown> => {
  const startTime = Date.now();
  while (Date.now() - startTime < timeout) {
    try {
      const element = getElement();
      if (element) return element;
    } catch (error) {
      await new Promise(resolve => setTimeout(resolve, 50));
    }
  }
  throw new Error('Element not found within timeout');
}; 