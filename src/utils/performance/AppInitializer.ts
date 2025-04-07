/**
 * AppInitializer.ts
 * 
 * Backward compatibility wrapper for the platform-specific AppInitializer.
 * Redirects to the new platform-specific implementation.
 */

import {
    AppInitializerOptions,
    AssetType,
    IAppInitializer,
    InitializationMetrics,
    InitializationStatus,
    AppInitializer as PlatformAppInitializer,
    appInitializer as platformAppInitializer
} from './AppInitializer/index';

// Export types from the new implementation
export type {
    AppInitializerOptions,
    AssetType, IAppInitializer, InitializationMetrics,
    InitializationStatus
};

// Export the singleton instance for backward compatibility
export const appInitializer = platformAppInitializer;

// Export the class for backward compatibility
export default PlatformAppInitializer; 