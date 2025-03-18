# EcoCart Animation Framework

This document outlines the architecture, components, and best practices for using animations in the EcoCart mobile application.

## Overview

The EcoCart animation framework provides:

1. **Type-safe animation definitions**
2. **Performance monitoring**
3. **Error handling**
4. **Reusable animation components**

## Key Components

### 1. Animation Type Definitions (`src/types/animation.ts`)

The type definitions provide a structured way to define animations with proper TypeScript typing:

```typescript
import { AnimationConfig } from '@/types/animation';

// Example of a fade animation configuration
const fadeInConfig: AnimationConfig = {
  type: 'fade',
  from: 0,
  to: 1,
  duration: 300,
  useNativeDriver: true
};
```

### 2. Animation Performance Monitor (`src/utils/AnimationPerformanceMonitor.ts`)

Tracks animation performance to identify potential issues:

```typescript
import { AnimationMonitor } from '@/utils/AnimationPerformanceMonitor';

// Generate a unique animation ID
const animationId = AnimationMonitor.createAnimationId('ComponentName', 'fadeIn');

// Track an animation
const cleanup = AnimationMonitor.trackAnimation(animationId, 300, true);

// Call cleanup when animation completes or component unmounts
cleanup();
```

### 3. Animation Error Handler (`src/utils/AnimationErrorHandler.ts`)

Utilities to prevent animations from crashing the app:

```typescript
import { safelyRunAnimation, withAnimationErrorHandling } from '@/utils/AnimationErrorHandler';

// Safely run an animation with a fallback
const animation = safelyRunAnimation(
  () => Animated.timing(opacity, { toValue: 1, duration: 300, useNativeDriver: true }),
  Animated.timing(opacity, { toValue: 1, duration: 100, useNativeDriver: true }),
  'ComponentName'
);

// Add error handling to existing animations
const safeAnimation = withAnimationErrorHandling(animation, 'ComponentName');
safeAnimation.start(result => {
  if (result.finished) {
    console.log('Animation completed successfully');
  }
});
```

### 4. Error Boundary Component (`src/components/ui/ErrorBoundary.tsx`)

React component that catches errors in its children:

```jsx
import { ErrorBoundary } from '@/components/ui/ErrorBoundary';

// Wrap animation components with error boundary
<ErrorBoundary componentName="AnimatedList">
  <AnimatedListComponent data={items} />
</ErrorBoundary>
```

### 5. Reusable Animated Components

Components with built-in animation capabilities:

- `AnimatedCard`: A card component with entrance animations
- More components coming soon...

## Best Practices

### 1. Use Native Driver When Possible

Native driver offloads animations to the native thread, improving performance:

```typescript
Animated.timing(opacity, {
  toValue: 1,
  duration: 300,
  useNativeDriver: true // Use native driver whenever possible
}).start();
```

### 2. Error Handling

Always include error handling for animations:

```typescript
try {
  animation.start();
} catch (error) {
  console.error('Animation error:', error);
  // Provide a fallback UI or state
}
```

### 3. Cleanup Animations

Always clean up animations when components unmount:

```typescript
useEffect(() => {
  const animation = Animated.timing(opacity, {
    toValue: 1,
    duration: 300,
    useNativeDriver: true
  });
  
  animation.start();
  
  return () => {
    animation.stop(); // Stop animation on unmount
  };
}, []);
```

### 4. Use Animation IDs

Track animations with unique IDs for performance monitoring:

```typescript
const animId = AnimationMonitor.createAnimationId('ComponentName', 'animationType');
```

### 5. Accessibility

Respect user preferences for reduced motion:

```typescript
import { AccessibilityInfo } from 'react-native';

const [reducedMotion, setReducedMotion] = useState(false);

useEffect(() => {
  AccessibilityInfo.isReduceMotionEnabled().then(setReducedMotion);
  
  const subscription = AccessibilityInfo.addEventListener(
    'reduceMotionChanged',
    setReducedMotion
  );
  
  return () => subscription.remove();
}, []);

// Adjust animation based on preference
const duration = reducedMotion ? 0 : 300;
```

## Performance Guidelines

1. **Batch animations** using `Animated.parallel` when possible
2. **Avoid animating layout properties** that trigger layout recalculation
3. **Use `transform` properties** instead of margin/position when possible
4. **Optimize JS thread** by minimizing work during animations
5. **Test on low-end devices** to ensure smooth performance

## Examples

### Basic Fade In Animation

```jsx
import React, { useRef, useEffect } from 'react';
import { Animated, View } from 'react-native';
import { AnimationMonitor } from '@/utils/AnimationPerformanceMonitor';
import { withAnimationErrorHandling } from '@/utils/AnimationErrorHandler';

function FadeInView({ children }) {
  const opacity = useRef(new Animated.Value(0)).current;
  
  useEffect(() => {
    const animId = AnimationMonitor.createAnimationId('FadeInView', 'fadeIn');
    const cleanup = AnimationMonitor.trackAnimation(animId, 300, true);
    
    const animation = withAnimationErrorHandling(
      Animated.timing(opacity, {
        toValue: 1,
        duration: 300,
        useNativeDriver: true
      }),
      'FadeInView'
    );
    
    animation.start(() => cleanup());
    
    return () => {
      cleanup();
    };
  }, []);
  
  return (
    <Animated.View style={{ opacity }}>
      {children}
    </Animated.View>
  );
}
```

### Using the AnimatedCard Component

```jsx
import React from 'react';
import { View } from 'react-native';
import AnimatedCard from '@/components/ui/animations/AnimatedCard';

function CardList() {
  return (
    <View>
      <AnimatedCard
        title="Recycling Tips"
        content="Learn how to recycle more effectively"
        onPress={() => console.log('Card pressed')}
      />
      
      <AnimatedCard
        title="Eco Facts"
        initialAnimation={{
          type: 'scale',
          from: 0.8,
          to: 1,
          duration: 400
        }}
      >
        <CustomContent />
      </AnimatedCard>
    </View>
  );
}
```

## Future Enhancements

1. **Animation preset library** for common animation patterns
2. **Animation composition API** for creating complex animations
3. **Gesture-driven animations** using `react-native-gesture-handler`
4. **Shared element transitions** between screens
5. **Keyframe animation API** for more complex sequences 