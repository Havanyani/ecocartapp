/**
 * Platform-specific AppInitializer exports
 * This file acts as a facade to expose the appropriate implementation based on platform
 */

import { Platform } from 'react-native';
import type { IAppInitializer } from './shared';

// Import implementations - TypeScript will tree-shake unused imports
import { MobileAppInitializer } from './MobileAppInitializer';
import { WebAppInitializer } from './WebAppInitializer';

/**
 * Export the platform-specific AppInitializer implementation
 */
export const AppInitializer: IAppInitializer = Platform.OS === 'web' 
  ? WebAppInitializer.getInstance()
  : MobileAppInitializer.getInstance();

// Re-export types
export * from './shared';
