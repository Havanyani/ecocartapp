# Routing Structure Documentation

## Overview

EcoCart uses Expo Router for navigation, implementing a file-based routing system that provides automatic route generation, deep linking support, and optimized navigation performance.

## Directory Structure

```
app/
├── _layout.tsx              # Root layout with auth state and theme
├── (auth)/                  # Authentication group
│   ├── _layout.tsx         # Auth layout
│   ├── login.tsx           # Login screen
│   ├── signup.tsx          # Signup screen
│   ├── forgot-password.tsx # Forgot password screen
│   └── reset-password.tsx  # Reset password screen
├── (tabs)/                  # Main app tabs
│   ├── _layout.tsx         # Tab layout with bottom navigation
│   ├── index.tsx           # Home screen
│   ├── materials.tsx       # Materials screen
│   ├── collections.tsx     # Collections screen
│   ├── community.tsx       # Community screen
│   └── profile.tsx         # Profile screen
└── (modals)/               # Modal screens
    ├── _layout.tsx         # Modal layout
    ├── ar-scan.tsx         # AR scanning modal
    ├── material-details.tsx # Material details modal
    └── collection-details.tsx # Collection details modal
```

## Route Groups

### (auth)
- Handles all authentication-related screens
- Uses a stack navigator internally
- Protected by authentication state

### (tabs)
- Main application tabs
- Uses a bottom tab navigator
- Includes all primary app features

### (modals)
- Modal screens that overlay the main app
- Uses a modal stack navigator
- Can be dismissed with back gesture or button

## Route Preloading

The app implements an optimized route preloading strategy:

```typescript
// Priority levels for routes
interface RouteConfig {
  priority: 1 | 2 | 3;  // 1: highest, 3: lowest
  dependencies?: string[];
  preloadCondition?: () => boolean;
}

// Critical routes configuration
const CRITICAL_ROUTES: Record<string, RouteConfig> = {
  '/': { priority: 1 },
  '/materials': { priority: 1 },
  '/collections': { priority: 1 },
  '/community': { priority: 2 },
  '/profile': { priority: 2 },
  '/auth/login': { priority: 1 },
  '/auth/signup': { priority: 2 },
};
```

## Navigation Types

```typescript
// Navigation types for type safety
type RootStackParamList = {
  '(auth)': undefined;
  '(tabs)': undefined;
  '(modals)': undefined;
};

type AuthStackParamList = {
  login: undefined;
  signup: undefined;
  'forgot-password': undefined;
  'reset-password': undefined;
};

type TabParamList = {
  index: undefined;
  materials: undefined;
  collections: undefined;
  community: undefined;
  profile: undefined;
};

type ModalStackParamList = {
  'ar-scan': undefined;
  'material-details': { id: string };
  'collection-details': { id: string };
};
```

## Performance Considerations

1. **Route Preloading**
   - Critical routes are preloaded on app start
   - Routes are preloaded based on priority
   - Failed preloads are retried automatically

2. **Navigation Optimization**
   - Uses transition animations for smooth navigation
   - Implements route caching for better performance
   - Handles navigation state efficiently

3. **Memory Management**
   - Clears preloaded routes cache when needed
   - Manages navigation state cleanup
   - Handles screen unmounting properly

## Best Practices

1. **Route Organization**
   - Keep related routes in the same group
   - Use descriptive file names
   - Follow the established directory structure

2. **Navigation**
   - Use the provided navigation hooks
   - Implement proper type checking
   - Handle navigation errors gracefully

3. **Performance**
   - Preload critical routes
   - Use lazy loading for non-critical screens
   - Implement proper cleanup on unmount

4. **Type Safety**
   - Use TypeScript for all navigation
   - Define proper types for route params
   - Implement proper type checking 