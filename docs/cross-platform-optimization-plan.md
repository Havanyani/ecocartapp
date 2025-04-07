# Cross-Platform Performance Optimization Implementation Plan

## Introduction

This document outlines our strategy for implementing performance optimizations that work consistently across both mobile (React Native) and web platforms while minimizing code duplication. The goal is to create a unified approach to performance optimization that leverages platform-specific capabilities when needed but maintains a consistent API.

## Current State Analysis

### Mobile Platform
- Comprehensive performance optimization system in place:
  - `OptimizedImage` component for image loading and optimization
  - `LazyScreen` component for code splitting and screen loading
  - `AppInitializationWrapper` for centralized app initialization
  - Various performance utilities for monitoring and optimization

### Web Platform 
- Limited performance optimization:
  - Basic web implementations exist (`PerformanceOptimizer.web.ts`, etc.)
  - Missing several key optimizations available in mobile
  - Web-specific optimization opportunities not fully leveraged

## Implementation Strategy

We'll take the following approach to implement cross-platform performance optimizations:

1. Create platform-adaptive components with consistent APIs
2. Extract shared logic into platform-agnostic utilities
3. Implement platform-specific optimizations where necessary
4. Establish unified monitoring and benchmarking

## Phase 1: Platform-Adaptive Component Architecture

### 1.1. File Structure

```
src/
├── components/
│   ├── OptimizedImage/
│   │   ├── index.ts             # Platform selector
│   │   ├── shared.ts            # Shared types and utilities
│   │   ├── MobileOptimizedImage.tsx
│   │   └── WebOptimizedImage.tsx
│   ├── LazyScreen/
│   │   ├── index.ts             # Platform selector
│   │   ├── shared.ts            # Shared types and utilities
│   │   ├── MobileLazyScreen.tsx
│   │   └── WebLazyScreen.tsx
│   └── AppInitializationWrapper/
│       ├── index.ts             # Platform selector
│       ├── shared.ts            # Shared types and utilities
│       ├── MobileAppInitializationWrapper.tsx
│       └── WebAppInitializationWrapper.tsx
└── utils/
    └── performance/
        ├── AppInitializer/
        │   ├── index.ts         # Platform selector
        │   ├── shared.ts        # Shared types and utilities
        │   ├── MobileAppInitializer.ts
        │   └── WebAppInitializer.ts
        └── BundleSplitter/
            ├── index.ts         # Platform selector
            ├── shared.ts        # Shared types and utilities
            ├── MobileBundleSplitter.ts
            └── WebBundleSplitter.ts
```

### 1.2. Platform Selector Pattern

For each component, create a platform selector:

```typescript
// src/components/OptimizedImage/index.ts
import { Platform } from 'react-native';
import WebOptimizedImage from './WebOptimizedImage';
import MobileOptimizedImage from './MobileOptimizedImage';
import type { OptimizedImageProps } from './shared';

export type { OptimizedImageProps };

export default Platform.select({
  web: WebOptimizedImage,
  default: MobileOptimizedImage,
});
```

## Phase 2: Implement Platform-Specific Components

### 2.1. OptimizedImage

#### Web Implementation (WebOptimizedImage.tsx)
```typescript
import React, { useState, useEffect } from 'react';
import { Image, StyleSheet, View } from 'react-native';
import { OptimizedImageProps } from './shared';
import { trackPerformanceEvent } from '@/utils/performance';

// Web-specific image optimization techniques
const WebOptimizedImage: React.FC<OptimizedImageProps> = ({
  source,
  style,
  contentFit = 'cover',
  placeholder,
  blurhash,
  transitionDuration = 300,
  lazyLoad = true,
  onLoad,
  onError,
  testID,
  ...props
}) => {
  const [isLoaded, setIsLoaded] = useState(false);
  const [hasError, setHasError] = useState(false);
  const [loadStartTime] = useState(Date.now());

  // Map contentFit to object-fit CSS property
  const objectFit = {
    cover: 'cover',
    contain: 'contain',
    fill: 'fill',
    none: 'none',
    'scale-down': 'scale-down',
  }[contentFit];

  // Process source
  const processedSource = React.useMemo(() => {
    if (typeof source === 'number') {
      return source;
    }
    if (typeof source === 'string') {
      return { uri: source };
    }
    return source;
  }, [source]);

  const handleLoad = () => {
    setIsLoaded(true);
    trackPerformanceEvent('image_load', Date.now() - loadStartTime);
    onLoad?.();
  };

  const handleError = (error: Error) => {
    setHasError(true);
    onError?.(error);
  };

  // Setup IntersectionObserver for lazy loading on web
  useEffect(() => {
    if (!lazyLoad || typeof window === 'undefined') return;

    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting) {
          // When image is in viewport, load it
          const imgElement = document.getElementById(testID || 'optimized-image');
          if (imgElement) {
            const dataSrc = imgElement.getAttribute('data-src');
            if (dataSrc) {
              imgElement.setAttribute('src', dataSrc);
              imgElement.removeAttribute('data-src');
            }
          }
          observer.disconnect();
        }
      },
      { rootMargin: '200px 0px' } // Load images 200px before they appear in viewport
    );

    const imgElement = document.getElementById(testID || 'optimized-image');
    if (imgElement) {
      observer.observe(imgElement);
    }

    return () => {
      observer.disconnect();
    };
  }, [lazyLoad, testID]);

  // Generate srcSet for responsive images if source is remote
  const srcSet = React.useMemo(() => {
    if (typeof processedSource === 'object' && processedSource.uri?.startsWith('http')) {
      const uri = processedSource.uri;
      // Create srcSet for different screen sizes
      return `${uri} 1x, ${uri} 2x`;
    }
    return undefined;
  }, [processedSource]);

  return (
    <View style={[styles.container, style]} testID={`${testID}-container`}>
      {!isLoaded && placeholder && (
        <Image
          source={typeof placeholder === 'string' ? { uri: placeholder } : placeholder}
          style={[
            StyleSheet.absoluteFill,
            styles.placeholder,
            { objectFit },
          ]}
          testID={`${testID}-placeholder`}
        />
      )}
      
      <Image
        source={processedSource}
        style={[
          StyleSheet.absoluteFill,
          styles.image,
          { 
            objectFit,
            opacity: isLoaded ? 1 : 0,
            transition: `opacity ${transitionDuration}ms ease-in-out`,
          },
        ]}
        onLoad={handleLoad}
        onError={(e) => handleError(new Error('Image failed to load'))}
        id={testID || 'optimized-image'}
        data-src={lazyLoad ? (typeof processedSource === 'object' ? processedSource.uri : '') : undefined}
        srcSet={srcSet}
        testID={testID}
        {...props}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    position: 'relative',
    overflow: 'hidden',
  },
  image: {
    width: '100%',
    height: '100%',
  },
  placeholder: {
    width: '100%',
    height: '100%',
  },
});

export default WebOptimizedImage;
```

### 2.2. LazyScreen

#### Web Implementation (WebLazyScreen.tsx)
```typescript
import React, { lazy, Suspense } from 'react';
import { StyleSheet, View, ActivityIndicator, Text } from 'react-native';
import { LazyScreenOptions } from './shared';
import { trackPerformanceEvent } from '@/utils/performance';

// Default loading component
const DefaultLoadingComponent = ({ screenName }: { screenName: string }) => (
  <View style={styles.loadingContainer}>
    <ActivityIndicator size="large" color="#0366d6" />
    <Text style={styles.loadingText}>Loading {screenName}...</Text>
  </View>
);

function createLazyScreen(
  screenName: string,
  importFunc: () => Promise<any>,
  options: LazyScreenOptions = {}
) {
  const {
    loadingComponent,
    preload = false,
    trackPerformance = true,
  } = options;

  // For web, we use React.lazy directly
  const LazyComponent = lazy(() => {
    const startTime = Date.now();
    
    return importFunc().then(module => {
      if (trackPerformance) {
        trackPerformanceEvent(`screen_load_${screenName}`, Date.now() - startTime);
      }
      return module;
    });
  });

  // Preload if requested
  if (preload && typeof window !== 'undefined') {
    // Use requestIdleCallback for preloading to avoid blocking the main thread
    if ('requestIdleCallback' in window) {
      window.requestIdleCallback(() => {
        importFunc().catch(error => {
          console.error(`Error preloading screen ${screenName}:`, error);
        });
      });
    } else {
      // Fallback for browsers that don't support requestIdleCallback
      setTimeout(() => {
        importFunc().catch(error => {
          console.error(`Error preloading screen ${screenName}:`, error);
        });
      }, 1000);
    }
  }

  // The actual component that uses Suspense
  const LazySuspendedComponent = (props: any) => {
    const LoadingComponent = loadingComponent || (() => <DefaultLoadingComponent screenName={screenName} />);

    return (
      <Suspense fallback={<LoadingComponent />}>
        <LazyComponent {...props} />
      </Suspense>
    );
  };

  // Display name for easier debugging
  LazySuspendedComponent.displayName = `LazyScreen(${screenName})`;
  
  return LazySuspendedComponent;
}

const styles = StyleSheet.create({
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  loadingText: {
    marginTop: 10,
    fontSize: 16,
    color: '#555',
  },
});

export default createLazyScreen;
```

### 2.3. AppInitializer

#### Web Implementation (WebAppInitializer.ts)
```typescript
import { PerformanceMonitor } from '@/utils/PerformanceMonitoring';

class AppInitializer {
  private static instance: AppInitializer;
  private isInitialized = false;
  private initPromise: Promise<void> | null = null;

  private constructor() {}

  public static getInstance(): AppInitializer {
    if (!AppInitializer.instance) {
      AppInitializer.instance = new AppInitializer();
    }
    return AppInitializer.instance;
  }

  private async preloadCriticalAssets(): Promise<void> {
    PerformanceMonitor.startMetricsCollection('preload_critical_assets');
    
    // Web-specific asset preloading
    const importantAssets = [
      '/assets/logo.png',
      '/assets/favicon.ico',
      '/assets/critical-styles.css',
    ];
    
    // Preload CSS and images
    await Promise.all(
      importantAssets.map(asset => {
        return new Promise<void>((resolve) => {
          if (asset.endsWith('.css')) {
            const link = document.createElement('link');
            link.rel = 'preload';
            link.as = 'style';
            link.href = asset;
            link.onload = () => resolve();
            link.onerror = () => resolve(); // Don't block on error
            document.head.appendChild(link);
          } else if (asset.endsWith('.png') || asset.endsWith('.jpg') || asset.endsWith('.ico')) {
            const img = new Image();
            img.src = asset;
            img.onload = () => resolve();
            img.onerror = () => resolve(); // Don't block on error
          } else {
            resolve();
          }
        });
      })
    );
    
    PerformanceMonitor.stopMetricsCollection('preload_critical_assets');
  }

  public async initialize(): Promise<void> {
    if (this.isInitialized) {
      return Promise.resolve();
    }
    
    if (this.initPromise) {
      return this.initPromise;
    }
    
    PerformanceMonitor.startMetricsCollection('app_full_initialization');
    
    this.initPromise = (async () => {
      try {
        console.log('[WebAppInitializer] Starting app initialization');
        
        // Record web vitals
        if (typeof window !== 'undefined' && 'performance' in window) {
          const navEntry = performance.getEntriesByType('navigation')[0];
          if (navEntry) {
            PerformanceMonitor.recordMetric({
              name: 'fcp',
              type: 'web_vital',
              timestamp: Date.now(),
              duration: performance.getEntriesByType('paint')
                .find(entry => entry.name === 'first-contentful-paint')?.startTime || 0
            });
          }
        }
        
        // Preload critical assets
        await this.preloadCriticalAssets();
        
        this.isInitialized = true;
        PerformanceMonitor.stopMetricsCollection('app_full_initialization');
        
        console.log('[WebAppInitializer] App initialization complete');
      } catch (error) {
        console.error('[WebAppInitializer] Initialization failed:', error);
        this.isInitialized = true;
      }
    })();
    
    return this.initPromise;
  }
  
  public async hideSplashScreen(): Promise<void> {
    await this.initialize();
    
    // For web, this might be removing a loading overlay
    const splashElement = document.getElementById('app-splash-screen');
    if (splashElement) {
      splashElement.style.opacity = '0';
      setTimeout(() => {
        splashElement.style.display = 'none';
      }, 300);
    }
  }
  
  public isAppInitialized(): boolean {
    return this.isInitialized;
  }
}

export const appInitializer = AppInitializer.getInstance();

export default AppInitializer;
```

## Phase 3: Shared Performance Monitoring

Create a cross-platform performance monitoring system that captures appropriate metrics for each platform.

### 3.1. Metrics Collection

```typescript
// src/utils/performance/metrics/shared.ts
export interface PerformanceMetric {
  name: string;
  type: 'render' | 'api' | 'navigation' | 'web_vital' | 'resource' | 'custom';
  timestamp: number;
  duration: number;
  metadata?: Record<string, any>;
}

export interface PerformanceThresholds {
  render: Record<string, number>;
  api: Record<string, number>;
  navigation: Record<string, number>;
  resource: Record<string, number>;
  custom: Record<string, number>;
}

export const DEFAULT_THRESHOLDS: PerformanceThresholds = {
  render: {
    default: 16, // ~60fps
    screen_render: 300,
    component_render: 50,
  },
  api: {
    default: 1000,
    critical_api: 500,
  },
  navigation: {
    default: 500,
    screen_transition: 300,
  },
  resource: {
    default: 3000,
    image_load: 1000,
    font_load: 500,
  },
  custom: {
    default: 1000,
  },
};

// Platform-specific implementations will extend from this
export abstract class BasePerformanceMonitor {
  abstract recordMetric(metric: PerformanceMetric): void;
  abstract startMetricsCollection(name: string): void;
  abstract stopMetricsCollection(name: string): void;
  abstract getMetrics(): PerformanceMetric[];
  abstract clearMetrics(): void;
}
```

## Phase 4: Implementation Timeline and Priorities

### 4.1. Timeline
1. Week 1: Set up platform-adaptive architecture
2. Week 2: Implement OptimizedImage for web
3. Week 3: Implement LazyScreen for web
4. Week 4: Implement AppInitializer for web
5. Week 5: Create shared performance monitoring system
6. Week 6: Testing and optimization

### 4.2. Priorities
1. High Priority:
   - OptimizedImage (impacts perceived performance)
   - AppInitializationWrapper (impacts startup time)
   - Performance monitoring (for measuring improvements)

2. Medium Priority:
   - LazyScreen (impacts bundle size)
   - BundleSplitter (impacts initial load)

3. Low Priority:
   - Advanced optimizations (can be implemented later)
   - Detailed analytics dashboard

## Phase 5: Testing Strategy

### 5.1. Performance Benchmarks
Create benchmarks for each platform to ensure optimizations are working as expected:

```typescript
// src/tests/benchmarks/image-loading.bench.ts
import { OptimizedImage } from '@/components/OptimizedImage';
import { render, waitFor } from '@testing-library/react-native';
import { measurePerformance } from '@/utils/testing/performanceUtils';

describe('OptimizedImage Performance', () => {
  it('loads images within acceptable time', async () => {
    const { result, duration } = await measurePerformance(() => {
      render(
        <OptimizedImage
          source={{ uri: 'https://example.com/test.jpg' }}
          testID="test-image"
        />
      );
    });
    
    expect(duration).toBeLessThan(50); // Component mount should be fast
    
    // Additional platform-specific assertions
    if (Platform.OS === 'web') {
      // Web-specific performance assertions
    } else {
      // Native-specific performance assertions
    }
  });
});
```

### 5.2. Platform-specific Testing
Create platform-specific tests for optimizations that differ significantly between platforms.

## Phase 6: Documentation

### 6.1. Developer Guides
Create comprehensive documentation explaining how to use the cross-platform performance components:

1. General Performance Best Practices
2. Platform-specific Considerations
3. Component API Reference
4. Migration Guide (for existing code)

### 6.2. Performance Monitoring Dashboard
Create a developer dashboard showing performance metrics across platforms to help identify optimization opportunities.

## Conclusion

This implementation plan provides a structured approach to building cross-platform performance optimizations while minimizing code duplication. By using a platform-adaptive architecture with consistent APIs, we can leverage platform-specific optimizations while maintaining a unified developer experience.

Following this plan will result in improved performance across all platforms while reducing maintenance overhead through shared code and consistent patterns. 