/**
 * CrossPlatformTesting.ts
 * 
 * Utilities for testing components across platforms.
 * Helps set up consistent testing environments for both web and native.
 */

import type { ReactElement } from 'react';
import { Platform } from 'react-native';

export interface PlatformTestConfig {
  /**
   * Test name or description
   */
  name: string;
  
  /**
   * Platforms this test should run on
   */
  platforms: Array<'web' | 'ios' | 'android' | 'all'>;
  
  /**
   * Test function to run
   */
  test: () => void | Promise<void>;
}

/**
 * Run a test only on specific platforms
 */
export function platformTest(config: PlatformTestConfig): void {
  const { name, platforms, test } = config;
  
  // Determine if test should run on current platform
  const shouldRun = 
    platforms.includes('all') || 
    (Platform.OS === 'web' && platforms.includes('web')) ||
    (Platform.OS === 'ios' && platforms.includes('ios')) ||
    (Platform.OS === 'android' && platforms.includes('android'));
  
  if (shouldRun) {
    it(name, test);
  } else {
    // Skip test on unsupported platforms
    it.skip(`${name} (skipped on ${Platform.OS})`, () => {});
  }
}

/**
 * Run a test suite only on specific platforms
 */
export function platformDescribe(
  name: string,
  platforms: Array<'web' | 'ios' | 'android' | 'all'>,
  testSuite: () => void
): void {
  // Determine if suite should run on current platform
  const shouldRun = 
    platforms.includes('all') || 
    (Platform.OS === 'web' && platforms.includes('web')) ||
    (Platform.OS === 'ios' && platforms.includes('ios')) ||
    (Platform.OS === 'android' && platforms.includes('android'));
  
  if (shouldRun) {
    describe(name, testSuite);
  } else {
    // Skip test suite on unsupported platforms
    describe.skip(`${name} (skipped on ${Platform.OS})`, () => {
      it('Platform not supported', () => {});
    });
  }
}

/**
 * Mock platform-specific components or functions
 */
export function mockPlatformSpecific<T>(
  webImplementation: T,
  nativeImplementation: T
): T {
  return Platform.OS === 'web' ? webImplementation : nativeImplementation;
}

/**
 * Helper to test platform-specific components
 */
export function renderPlatformSpecific(
  webComponent: ReactElement,
  nativeComponent: ReactElement
): ReactElement {
  return Platform.OS === 'web' ? webComponent : nativeComponent;
}

/**
 * Get platform-specific test timeouts
 * Some platforms may need longer timeouts for certain operations
 */
export function getPlatformTimeout(
  options: {
    web?: number;
    ios?: number;
    android?: number;
    default: number;
  }
): number {
  if (Platform.OS === 'web' && options.web !== undefined) {
    return options.web;
  } else if (Platform.OS === 'ios' && options.ios !== undefined) {
    return options.ios;
  } else if (Platform.OS === 'android' && options.android !== undefined) {
    return options.android;
  }
  
  return options.default;
}

/**
 * Default timeouts for different test types across platforms
 */
export const TestTimeouts = {
  animation: getPlatformTimeout({
    web: 300,
    ios: 500,
    android: 800,
    default: 500,
  }),
  navigation: getPlatformTimeout({
    web: 500,
    ios: 800,
    android: 1000,
    default: 800,
  }),
  network: getPlatformTimeout({
    default: 5000,
  }),
  render: getPlatformTimeout({
    web: 100,
    ios: 200,
    android: 300,
    default: 200,
  }),
}; 