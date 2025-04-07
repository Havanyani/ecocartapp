# Performance-Optimized Components

This document provides detailed documentation for the performance-optimized components used throughout the EcoCart app.

## OptimizedImage

A cross-platform image component that provides optimized image loading and rendering.

### Props

```typescript
interface OptimizedImageProps {
  source: string | ImageSourcePropType;
  width?: number;
  height?: number;
  placeholder?: 'blur' | 'none';
  blurDataURL?: string;
  priority?: boolean;
  loading?: 'lazy' | 'eager';
  quality?: number;
  onLoad?: () => void;
  onError?: (error: Error) => void;
  style?: StyleProp<ImageStyle>;
}
```

### Usage

```typescript
import { OptimizedImage } from '@/components/OptimizedImage';

function ProductCard({ imageUrl, title }) {
  return (
    <View>
      <OptimizedImage
        source={imageUrl}
        width={200}
        height={200}
        placeholder="blur"
        blurDataURL={generateBlurDataURL(imageUrl)}
        priority={true}
      />
      <Text>{title}</Text>
    </View>
  );
}
```

### Platform-Specific Behavior

#### Web
- Uses `next/image` for optimal image loading
- Implements lazy loading with blur placeholder
- Supports responsive images
- Optimizes image quality based on device

#### Mobile
- Uses native image caching
- Implements progressive loading
- Optimizes memory usage
- Supports offline access

## LazyScreen

A component for lazy loading screen content with a fallback UI.

### Props

```typescript
interface LazyScreenProps {
  children: React.ReactNode;
  fallback: React.ReactNode;
  threshold?: number;
  onLoad?: () => void;
  onError?: (error: Error) => void;
}
```

### Usage

```typescript
import { LazyScreen } from '@/components/LazyScreen';

function AnalyticsScreen() {
  return (
    <LazyScreen
      fallback={<LoadingSpinner />}
      threshold={0.5}
      onLoad={() => console.log('Analytics loaded')}
    >
      <AnalyticsDashboard />
    </LazyScreen>
  );
}
```

### Platform-Specific Behavior

#### Web
- Uses `React.lazy` for code splitting
- Implements intersection observer for loading
- Supports preloading on hover

#### Mobile
- Uses native lazy loading
- Implements viewport-based loading
- Optimizes memory usage

## PerformanceMonitor

A component for monitoring and displaying performance metrics.

### Props

```typescript
interface PerformanceMonitorProps {
  metrics: PerformanceMetrics[];
  onRefresh?: () => void;
  showDetails?: boolean;
  style?: StyleProp<ViewStyle>;
}
```

### Usage

```typescript
import { PerformanceMonitor } from '@/components/PerformanceMonitor';

function PerformanceDashboard() {
  const { metrics, refresh } = usePerformanceMonitor();

  return (
    <PerformanceMonitor
      metrics={metrics}
      onRefresh={refresh}
      showDetails={true}
    />
  );
}
```

### Platform-Specific Behavior

#### Web
- Displays Core Web Vitals
- Shows network performance
- Tracks resource loading

#### Mobile
- Shows frame rate
- Displays memory usage
- Tracks battery impact

## ParallaxScrollView

A scrollable view with parallax effects and performance optimizations.

### Props

```typescript
interface ParallaxScrollViewProps {
  children: React.ReactNode;
  headerHeight?: number;
  parallaxSpeed?: number;
  onScroll?: (event: NativeScrollEvent) => void;
  style?: StyleProp<ViewStyle>;
}
```

### Usage

```typescript
import { ParallaxScrollView } from '@/components/ParallaxScrollView';

function ProductDetailsScreen() {
  return (
    <ParallaxScrollView
      headerHeight={200}
      parallaxSpeed={0.5}
      onScroll={handleScroll}
    >
      <ProductHeader />
      <ProductContent />
    </ParallaxScrollView>
  );
}
```

### Platform-Specific Behavior

#### Web
- Uses CSS transforms for parallax
- Implements smooth scrolling
- Optimizes repaints

#### Mobile
- Uses native animations
- Implements gesture handling
- Optimizes frame rate

## HapticButton

A button component with haptic feedback and performance optimizations.

### Props

```typescript
interface HapticButtonProps {
  onPress: () => void;
  children: React.ReactNode;
  hapticStyle?: 'light' | 'medium' | 'heavy';
  disabled?: boolean;
  style?: StyleProp<ViewStyle>;
}
```

### Usage

```typescript
import { HapticButton } from '@/components/HapticButton';

function ActionButton() {
  return (
    <HapticButton
      onPress={handlePress}
      hapticStyle="medium"
      disabled={isLoading}
    >
      <Text>Press Me</Text>
    </HapticButton>
  );
}
```

### Platform-Specific Behavior

#### Web
- Simulates haptic feedback
- Uses CSS transitions
- Optimizes touch events

#### Mobile
- Uses native haptics
- Implements gesture handling
- Optimizes response time

## Best Practices

1. **Component Usage**
   - Always use these components instead of their standard counterparts
   - Follow the platform-specific guidelines
   - Implement proper error handling

2. **Performance Considerations**
   - Monitor component performance
   - Use appropriate loading strategies
   - Implement proper cleanup

3. **Testing**
   - Test on both platforms
   - Verify performance metrics
   - Check memory usage

4. **Maintenance**
   - Keep components updated
   - Monitor for performance regressions
   - Update documentation as needed 