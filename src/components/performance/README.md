# Performance Optimization Components

## Overview

This directory contains components and utilities for optimizing the performance of the EcoCart app. These components focus on improving startup time, image loading, and overall app responsiveness.

## Components

### AppInitializationWrapper

A wrapper component that manages the app initialization process, including asset loading, performance optimization initialization, and splash screen handling.

```tsx
import AppInitializationWrapper from '@/components/AppInitializationWrapper';

// In App.tsx
export default function App() {
  return (
    <AppInitializationWrapper>
      <MainApp />
    </AppInitializationWrapper>
  );
}
```

#### Features

- Displays a loading screen during initialization
- Shows progress feedback to users
- Manages initialization steps with proper sequencing
- Gracefully handles initialization errors
- Tracks initialization performance metrics

### AppLoadingScreen

A customizable loading screen with progress indicator, animation, and branding.

```tsx
import AppLoadingScreen from '@/components/AppLoadingScreen';

<AppLoadingScreen 
  progress={75} 
  message="Loading assets..." 
  isFinished={false}
/>
```

#### Props

| Prop | Type | Description |
|------|------|-------------|
| `progress` | `number` | Progress percentage (0-100) |
| `message` | `string` | Loading message to display |
| `isFinished` | `boolean` | Whether loading is complete |
| `onFinishAnimationComplete` | `() => void` | Callback when fade-out animation completes |
| `testID` | `string` | Test ID for testing |

### OptimizedImage

An enhanced image component that implements multiple optimization strategies.

```tsx
import OptimizedImage from '@/components/OptimizedImage';

<OptimizedImage
  source={{ uri: 'https://example.com/image.jpg' }}
  contentFit="cover"
  placeholder={require('@/assets/images/placeholder.png')}
  blurhash="LKO2:N%2Tw=w]~RBVZRi};RPxuwH"
  lazyLoad={true}
/>
```

#### Features

- Uses `expo-image` for better performance and caching
- Supports progressive loading with placeholders and blurhash
- Automatically resizes images based on screen dimensions
- Applies WebP conversion when supported
- Implements lazy loading for offscreen images
- Provides sophisticated caching strategies
- Supports blur-up technique for perceived performance

#### Props

| Prop | Type | Description |
|------|------|-------------|
| `source` | `string \| { uri: string } \| number` | Image source |
| `style` | `StyleProp<ViewStyle>` | Container style |
| `contentFit` | `'cover' \| 'contain' \| 'fill' \| 'none' \| 'scale-down'` | Image content fit mode |
| `placeholder` | `string \| { uri: string } \| number` | Placeholder image shown during loading |
| `blurhash` | `string` | BlurHash string for blur-up technique |
| `transitionDuration` | `number` | Duration of fade-in animation |
| `priority` | `'low' \| 'normal' \| 'high'` | Loading priority |
| `lazyLoad` | `boolean` | Whether to lazy load image |
| `onLoad` | `() => void` | Callback when image loads |
| `onError` | `(error: Error) => void` | Callback when loading fails |
| `cachePolicy` | `'memory' \| 'disk' \| 'memory-disk' \| 'none'` | Caching policy |
| `blurRadius` | `number` | Blur radius to apply |
| `optimizeQuality` | `boolean` | Whether to optimize image quality |
| `testID` | `string` | Test ID for testing |

### LazyScreen

A utility for lazy-loading screens with performance tracking.

```tsx
import createLazyScreen from '@/components/LazyScreen';

const AnalyticsDashboard = createLazyScreen(
  'AnalyticsDashboard',
  () => import('@/screens/analytics/AnalyticsDashboard'),
  { preload: false }
);

// In a navigator
<Stack.Screen name="AnalyticsDashboard" component={AnalyticsDashboard} />
```

#### Options

| Option | Type | Description |
|--------|------|-------------|
| `loadingComponent` | `React.ReactNode` | Custom loading component |
| `preload` | `boolean` | Whether to preload the screen |
| `trackPerformance` | `boolean` | Whether to track performance metrics |
| `screenName` | `string` | Name for performance tracking |

## Utilities

### AppInitializer

A singleton utility that centralizes app initialization logic.

```typescript
import { appInitializer } from '@/utils/performance/AppInitializer';

// Initialize app resources
await appInitializer.initialize();

// Hide splash screen
await appInitializer.hideSplashScreen();
```

#### Methods

| Method | Description |
|--------|-------------|
| `initialize()` | Initializes app resources and optimizations |
| `hideSplashScreen()` | Hides the splash screen |
| `isAppInitialized()` | Returns whether initialization is complete |

### BundleSplitter

A utility for implementing code splitting strategies.

```typescript
import BundleSplitter from '@/utils/performance/BundleSplitter';

// Register a lazy component
const LazyComponent = BundleSplitter.registerLazyComponent(
  'ComponentName',
  () => import('./Component'),
  { preload: true }
);

// Preload components
BundleSplitter.preloadComponents(['HomeScreen', 'ProfileScreen']);
```

#### Methods

| Method | Description |
|--------|-------------|
| `registerLazyComponent()` | Registers a component for lazy loading |
| `preloadComponent()` | Preloads a registered component |
| `preloadComponents()` | Preloads multiple components |
| `getComponentLoadStatus()` | Gets the load status of a component |

## Performance Testing

The performance optimization components have comprehensive unit, integration, and E2E tests:

- **Unit Tests**: Tests for individual components in isolation
- **Integration Tests**: Tests for interactions between components
- **End-to-End Tests**: Tests for real-world performance metrics

See the test files for examples of how to test performance-related components:

- `src/__tests__/utils/performance/AppInitializer.test.ts`
- `src/__tests__/components/OptimizedImage.test.tsx`
- `src/__tests__/components/LazyScreen.test.tsx`
- `src/__tests__/components/AppLoadingScreen.test.tsx`
- `src/__tests__/components/AppInitializationWrapper.test.tsx`
- `src/e2e/tests/appInitialization.e2e.ts`

## Best Practices

When using these performance optimization components, follow these best practices:

1. **Lazy Load Non-Critical Screens**: Screens that aren't part of the critical path should be lazy loaded.
2. **Optimize Images**: Always use the `OptimizedImage` component for images, especially remote ones.
3. **Preload Critical Assets**: Identify and preload assets needed for the first user interaction.
4. **Monitor Performance**: Use the performance monitoring utilities to track performance metrics.
5. **Adaptive Optimization**: Adjust optimization level based on device capabilities and network conditions.
6. **Test Performance**: Include performance assertions in tests to catch regressions.

## Troubleshooting

### Common Issues

1. **Slow Initial Load**: Check that critical assets are being preloaded correctly.
2. **Image Flickering**: Ensure placeholders or blurhash values are provided to `OptimizedImage`.
3. **Memory Issues**: Verify that lazy-loaded components are correctly unloaded when not in use.
4. **Splash Screen Persists**: Check that `appInitializer.hideSplashScreen()` is being called after initialization.

For more information, see the [Performance Optimization Guide](../../../docs/performance-optimization-guide.md). 