# Navigation Documentation

This document outlines the navigation structure and implementation in the EcoCart app using Expo Router.

## Navigation Structure

The app uses a file-based routing system with the following structure:

```
app/
├── _layout.tsx              # Root layout with authentication and theme
├── (auth)/                  # Authentication group
│   ├── _layout.tsx         # Auth layout with transitions
│   ├── login.tsx           # Login screen
│   ├── signup.tsx          # Signup screen
│   ├── forgot-password.tsx # Forgot password screen
│   └── reset-password.tsx  # Reset password screen
├── (tabs)/                  # Main app tabs group
│   ├── _layout.tsx         # Tabs layout with bottom navigation
│   ├── index.tsx           # Home screen (first tab)
│   ├── materials.tsx       # Materials screen
│   ├── collections.tsx     # Collections screen
│   ├── community.tsx       # Community screen
│   └── profile.tsx         # Profile screen
└── modal/                   # Modal screens group
    ├── _layout.tsx         # Modal layout with animations
    ├── ar-scan.tsx         # AR Scanner modal
    ├── material-details.tsx # Material details modal
    └── collection-details.tsx # Collection details modal
```

## Navigation Features

1. **Smart Route Preloading**
   - Critical routes are preloaded on app start
   - Adjacent routes are preloaded based on current screen
   - Route priorities are defined in `routePreloading.ts`

2. **Screen Transitions**
   - Smooth transitions between screens
   - Custom animations for modals
   - Optimized performance with native drivers

3. **Type Safety**
   - Full TypeScript support
   - Type-safe navigation with `useAppNavigation` hook
   - Route parameters are properly typed

4. **Performance Optimizations**
   - Lazy loading of screens
   - Screen caching
   - Navigation state management
   - Memory cleanup on screen unmount

## Usage Examples

1. **Basic Navigation**
```typescript
import { useAppNavigation } from '@/hooks/useAppNavigation';

function MyComponent() {
  const { navigate } = useAppNavigation();

  const handlePress = () => {
    navigate('material-details', { id: '123' });
  };
}
```

2. **Screen Preloading**
```typescript
import { useRoutePreloading } from '@/utils/routePreloading';

function MyComponent() {
  const { preloadRoute } = useRoutePreloading();

  useEffect(() => {
    preloadRoute('/materials');
  }, []);
}
```

3. **Screen Transitions**
```typescript
import { useTransitionOptimization } from '@/hooks/useTransitionOptimization';

function MyScreen() {
  const { transitionAnim } = useTransitionOptimization();

  return (
    <Animated.View
      style={{
        opacity: transitionAnim,
        transform: [{
          translateY: transitionAnim.interpolate({
            inputRange: [0, 1],
            outputRange: [20, 0]
          })
        }]
      }}
    >
      {/* Screen content */}
    </Animated.View>
  );
}
```

4. **Screen Cleanup**
```typescript
import { useScreenCleanup } from '@/hooks/useScreenCleanup';

function MyScreen() {
  useScreenCleanup(() => {
    // Cleanup resources
    cleanupResources();
  });
}
```

## Best Practices

1. **Route Organization**
   - Group related routes in directories
   - Use descriptive route names
   - Keep route parameters minimal

2. **Performance**
   - Preload critical routes
   - Use lazy loading for non-critical screens
   - Implement proper cleanup

3. **Type Safety**
   - Always use typed navigation
   - Define route parameters
   - Use the `useAppNavigation` hook

4. **Animations**
   - Use native drivers when possible
   - Keep animations simple
   - Implement proper cleanup

## Common Issues

1. **Navigation State**
   - Use `useNavigationState` for complex navigation
   - Handle navigation queues properly
   - Clean up navigation listeners

2. **Screen Transitions**
   - Use `useTransitionOptimization` for smooth transitions
   - Handle animation cleanup
   - Test on different devices

3. **Route Preloading**
   - Don't preload too many routes
   - Handle preloading errors
   - Clean up preloaded routes when needed

4. **Memory Management**
   - Use `useScreenCleanup` for resource cleanup
   - Handle screen unmounting
   - Monitor memory usage 