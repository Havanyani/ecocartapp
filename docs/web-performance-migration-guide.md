# Web Performance Migration Guide

This guide provides detailed instructions for migrating the EcoCart app's performance optimizations from mobile to web, ensuring a consistent user experience across all platforms.

## Table of Contents

1. [Overview](#overview)
2. [Cross-Platform Architecture](#cross-platform-architecture)
3. [Platform-Adaptive Components](#platform-adaptive-components)
   - [OptimizedImage](#optimizedimage)
   - [LazyScreen](#lazyscreen)
   - [AppInitializer](#appinitializer)
4. [Shared Performance Utilities](#shared-performance-utilities)
5. [Web-Specific Optimizations](#web-specific-optimizations)
6. [Performance Metrics](#performance-metrics)
7. [Testing Web Performance](#testing-web-performance)
8. [Migration Checklist](#migration-checklist)

## Overview

The EcoCart app has been optimized for mobile performance, but many users also access our web version. This guide outlines how to adapt our existing performance optimizations for web without duplicating code, leveraging React Native Web's capabilities while adding web-specific optimizations.

## Cross-Platform Architecture

We've adopted a platform-selector pattern to implement cross-platform components:

```
ComponentName/
  ├── index.ts         # Platform selector
  ├── shared.ts        # Shared types and utilities
  ├── WebComponent.tsx # Web implementation
  └── MobileComponent.tsx # Mobile implementation
```

This structure allows us to:
- Share types and utilities across platforms
- Implement platform-specific optimizations
- Maintain backward compatibility
- Avoid code duplication

## Platform-Adaptive Components

### OptimizedImage

The `OptimizedImage` component has been refactored to support both mobile and web platforms:

#### Mobile Features:
- Uses `expo-image` for optimized rendering
- Implements native caching
- Supports blurhash placeholders
- Optimizes assets based on device capabilities

#### Web Features:
- Uses native `<img>` element via React Native Web
- Implements lazy loading via IntersectionObserver
- Supports responsive images with srcset
- Implements progressive loading and blur-up technique

#### Migration Steps:

1. Replace existing `Image` components with `OptimizedImage`:

```jsx
// Before
<Image 
  source={{ uri: 'https://example.com/image.jpg' }} 
  style={{ width: 200, height: 200 }} 
/>

// After
<OptimizedImage 
  source={{ uri: 'https://example.com/image.jpg' }} 
  style={{ width: 200, height: 200 }}
  lazyLoad={true}
  blurhash="L6PZfSi_.AyE_3t7t7R**0o#DgR4"
/>
```

2. Add web-specific props when needed:

```jsx
<OptimizedImage 
  source={{ uri: 'https://example.com/image.jpg' }} 
  style={{ width: 200, height: 200 }}
  // Web-specific props
  priority={isHero ? 'high' : 'normal'}
  lazyLoad={!isAboveFold}
  transition={300}
/>
```

### LazyScreen

The `LazyScreen` component has been adapted for web to support code splitting:

#### Mobile Features:
- Manually managed dynamic imports
- Performance tracking
- Memory management

#### Web Features:
- Uses React.lazy and Suspense
- Implements IntersectionObserver for visibility detection
- Supports code splitting

#### Migration Steps:

1. Update existing lazy screen implementations:

```jsx
// Before
const ProductScreen = createLazyScreen(
  'Product', 
  () => import('./screens/Product')
);

// After
const ProductScreen = (props) => (
  <LazyScreen
    screenId="Product"
    component={require('./screens/Product').default}
    componentProps={props}
    preload={false}
  />
);
```

2. For screens that need web-specific behavior:

```jsx
const HomeScreen = (props) => (
  <LazyScreen
    screenId="Home"
    component={require('./screens/Home').default}
    componentProps={props}
    preload={true} // Preload important screens
    priority="high" // Higher loading priority
    visibilityThreshold={0.1} // Start loading when 10% visible
  />
);
```

### AppInitializer

The `AppInitializer` component has been adapted to support web initialization:

#### Mobile Features:
- Asset preloading
- Font loading
- Configuration initialization
- Splash screen management

#### Web Features:
- Service worker registration
- Web font loading with FontFace API
- Critical CSS optimization
- Core Web Vitals tracking

#### Migration Steps:

1. Replace the direct usage of the AppInitializer with the platform-specific implementation:

```typescript
// Old approach - directly importing
import { appInitializer } from '@/utils/performance/AppInitializer';

// New approach - importing from the platform-adaptive implementation
import { appInitializer } from '@/utils/performance/AppInitializer/index';
```

2. Use the enhanced initialization options:

```typescript
// Initialize with specific options
await appInitializer.initialize({
  preloadFonts: true,
  preloadImages: true,
  preloadConfig: true,
  optimizationLevel: 'balanced', // 'minimal', 'balanced', or 'aggressive'
  trackPerformance: true,
  criticalResources: ['/assets/logo.png', '/assets/critical.css']
});
```

3. Track initialization performance metrics:

```typescript
// Get initialization metrics
const metrics = appInitializer.getInitializationMetrics();
console.log(`App initialized in ${metrics.totalDuration}ms`);

// Check status
const status = appInitializer.getInitializationStatus();
if (status === 'completed') {
  console.log('Initialization successful');
}
```

4. Add custom critical resources:

```typescript
// Add custom resources to preload
import { AssetType } from '@/utils/performance/AppInitializer';

appInitializer.addCriticalResource('/assets/custom-font.woff2', AssetType.FONT);
appInitializer.addCriticalResource('/assets/hero.jpg', AssetType.IMAGE);
```

## Shared Performance Utilities

Our performance utilities have been refactored to be platform-agnostic:

1. **PerformanceMonitoring**: Collects and reports performance metrics
2. **TreeShakingOptimizer**: Removes unused code for both platforms
3. **AdaptiveOptimization**: Adjusts optimization level based on device capabilities

## Web-Specific Optimizations

We've added several web-specific optimizations:

1. **Code Splitting**: Using React.lazy and dynamic imports
2. **Preload/Prefetch**: Preloading critical resources
3. **Service Worker**: For caching and offline support
4. **Web Vitals Tracking**: Monitoring Core Web Vitals

Implementation example:

```jsx
// WebPerformanceOptimizer.ts
export function preloadCriticalAssets() {
  // Preload critical images
  const preloadLinks = [
    { href: '/logo.png', as: 'image' },
    { href: '/hero.jpg', as: 'image' },
    { href: '/main.css', as: 'style' }
  ];
  
  preloadLinks.forEach(({ href, as }) => {
    const link = document.createElement('link');
    link.rel = 'preload';
    link.href = href;
    link.as = as;
    document.head.appendChild(link);
  });
}
```

## Performance Metrics

We're tracking the following metrics for web:

1. **Time to Interactive (TTI)**: When the app becomes fully interactive
2. **First Contentful Paint (FCP)**: When first content is rendered
3. **Largest Contentful Paint (LCP)**: When largest content element is rendered
4. **Cumulative Layout Shift (CLS)**: Visual stability measurement
5. **First Input Delay (FID)**: Response time to first user interaction

## Testing Web Performance

We've implemented the following tests for web performance:

1. **Lighthouse CI**: Automated performance testing
2. **Web Vitals Monitoring**: Real-user monitoring
3. **Bundle Size Analysis**: webpack-bundle-analyzer integration

Example Lighthouse CI configuration:

```js
// lighthouserc.js
module.exports = {
  ci: {
    collect: {
      url: ['http://localhost:3000/'],
      numberOfRuns: 3,
    },
    upload: {
      target: 'temporary-public-storage',
    },
    assert: {
      assertions: {
        'categories:performance': ['error', { minScore: 0.8 }],
        'first-contentful-paint': ['error', { maxNumericValue: 2000 }],
        'interactive': ['error', { maxNumericValue: 3500 }],
      },
    },
  },
};
```

## Migration Checklist

- [x] Replace Image components with OptimizedImage
- [x] Update lazy-loaded screens to use LazyScreen
- [x] Implement AppInitializer for both platforms
- [ ] Set up performance monitoring for web
- [ ] Configure web-specific optimizations
- [ ] Implement web-specific AppLoadingScreen
- [ ] Test performance on various devices and network conditions
- [ ] Set up CI/CD pipeline for performance testing

## Further Resources

- [Web Performance API Documentation](https://developer.mozilla.org/en-US/docs/Web/API/Performance_API)
- [React Native Web Optimization Guide](https://necolas.github.io/react-native-web/docs/optimizing-web-performance/)
- [Core Web Vitals](https://web.dev/vitals/)
- [Lighthouse CI](https://github.com/GoogleChrome/lighthouse-ci) 