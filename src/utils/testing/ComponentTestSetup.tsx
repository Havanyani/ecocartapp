/**
 * ComponentTestSetup.tsx
 * 
 * Utilities for setting up component tests with the necessary providers.
 * Creates a consistent testing environment for components across platforms.
 */

import { render, RenderOptions } from '@testing-library/react-native';
import React, { ReactElement } from 'react';
import { HelmetProvider } from 'react-helmet-async';
import { Platform } from 'react-native';
import { SafeAreaProvider } from 'react-native-safe-area-context';

// Import your app providers here
// import { ThemeProvider } from '../../contexts/ThemeContext';

interface CustomRenderOptions extends RenderOptions {
  /**
   * Whether to wrap the component with required providers
   * @default true
   */
  withProviders?: boolean;
  
  /**
   * Whether to wrap with web-specific providers
   * @default true on web, false on native
   */
  withWebProviders?: boolean;
  
  /**
   * Optional theme to pass to the ThemeProvider
   */
  theme?: any; // Replace with your actual theme type
  
  /**
   * Any additional context providers to wrap with
   */
  additionalProviders?: Array<React.FC<{ children: React.ReactNode }>>;
}

/**
 * Custom render function that wraps the component with the necessary providers
 */
export function renderWithProviders(
  ui: ReactElement,
  options: CustomRenderOptions = {}
) {
  const {
    withProviders = true,
    withWebProviders = Platform.OS === 'web',
    theme, // Replace with your default theme
    additionalProviders = [],
    ...renderOptions
  } = options;
  
  // If providers are not needed, render normally
  if (!withProviders) {
    return render(ui, renderOptions);
  }
  
  // Create a wrapper with all required providers
  const Wrapper: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    // Start with the component
    let wrappedUI = <>{children}</>;
    
    // Wrap with additional custom providers (in reverse order)
    [...additionalProviders].reverse().forEach(Provider => {
      wrappedUI = <Provider>{wrappedUI}</Provider>;
    });
    
    // Wrap with web-specific providers if needed
    if (withWebProviders && Platform.OS === 'web') {
      wrappedUI = <HelmetProvider>{wrappedUI}</HelmetProvider>;
    }
    
    // Wrap with app-specific providers
    // wrappedUI = <ThemeProvider theme={theme}>{wrappedUI}</ThemeProvider>;
    
    // Always wrap with SafeAreaProvider for consistent layout
    wrappedUI = <SafeAreaProvider>{wrappedUI}</SafeAreaProvider>;
    
    return wrappedUI;
  };
  
  return render(ui, { wrapper: Wrapper, ...renderOptions });
}

/**
 * Create a test for a component across all platforms
 */
export function createComponentTest(
  name: string,
  component: ReactElement,
  assertions: (result: ReturnType<typeof renderWithProviders>) => void | Promise<void>
) {
  test(name, async () => {
    const result = renderWithProviders(component);
    await assertions(result);
  });
}

/**
 * Create platform-specific tests for a component
 */
export function createPlatformComponentTests(options: {
  name: string;
  web?: {
    component: ReactElement;
    assertions: (result: ReturnType<typeof renderWithProviders>) => void | Promise<void>;
  };
  native?: {
    component: ReactElement;
    assertions: (result: ReturnType<typeof renderWithProviders>) => void | Promise<void>;
  };
  all?: {
    component: ReactElement;
    assertions: (result: ReturnType<typeof renderWithProviders>) => void | Promise<void>;
  };
}) {
  const { name, web, native, all } = options;
  
  if (all) {
    test(name, async () => {
      const result = renderWithProviders(all.component);
      await all.assertions(result);
    });
    return;
  }
  
  if (Platform.OS === 'web' && web) {
    test(`${name} (web)`, async () => {
      const result = renderWithProviders(web.component);
      await web.assertions(result);
    });
  } else if (Platform.OS !== 'web' && native) {
    test(`${name} (native)`, async () => {
      const result = renderWithProviders(native.component);
      await native.assertions(result);
    });
  } else {
    test.skip(`${name} (skipped on ${Platform.OS})`, () => {});
  }
} 