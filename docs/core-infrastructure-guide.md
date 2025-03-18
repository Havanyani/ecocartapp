# EcoCart Core Infrastructure Guide

## Overview

This guide documents the foundational infrastructure of the EcoCart application. The core infrastructure provides the essential building blocks upon which the entire application is built, including authentication, data management, UI components, and navigation.

## Table of Contents

1. [Authentication System](#authentication-system)
2. [Material Resource API](#material-resource-api)
3. [UI Component Library](#ui-component-library)
4. [Navigation Structure](#navigation-structure)
5. [State Management](#state-management)
6. [Environment Configuration](#environment-configuration)

## Authentication System

### Architecture

The authentication system uses token-based authentication with JWT (JSON Web Tokens) for secure, stateless authentication.

```
┌────────────┐         ┌─────────────┐         ┌─────────────┐
│            │ 1. Auth │             │ 2. JWT  │             │
│    User    │────────►│  Auth API   │────────►│ EcoCart App │
│            │◄────────│             │◄────────│             │
└────────────┘ 4. Data └─────────────┘ 3. API  └─────────────┘
                                         Call
```

### Key Components

- **AuthProvider** (`src/providers/AuthProvider.tsx`): Context provider for authentication state
- **useAuth** (`src/hooks/useAuth.ts`): Custom hook for consuming auth context
- **AuthService** (`src/services/AuthService.ts`): Service for handling auth operations
- **TokenStorage** (`src/services/TokenStorage.ts`): Secure token management

### Implementation

The authentication flow is implemented using a secure, async storage mechanism for token persistence and validation:

```typescript
// Example usage of the auth system
const { isAuthenticated, user, login, logout } = useAuth();

const handleLogin = async () => {
  try {
    await login(email, password);
    // Navigate to home screen
  } catch (error) {
    // Handle authentication error
  }
};
```

### Security Considerations

- Tokens are stored securely using `expo-secure-store`
- Automatic token refresh mechanism prevents session expiration
- Token validation occurs on every protected API request
- Biometric authentication is supported when available

## Material Resource API

### Architecture

The Material Resource API provides a data layer for accessing and managing recycling materials, collections, and related resources, with support for both online and offline operations.

```
┌────────────┐         ┌─────────────┐         ┌─────────────┐
│            │         │             │         │             │
│ API Client │────────►│ Data Cache  │────────►│   Storage   │
│            │         │             │         │             │
└────────────┘         └─────────────┘         └─────────────┘
     ▲  │                                            ▲
     │  │                                            │
     │  ▼                                            │
┌────────────┐                               ┌─────────────┐
│            │                               │             │
│ API Server │◄──────────────────────────────│ Sync Engine │
│            │                               │             │
└────────────┘                               └─────────────┘
```

### Key Components

- **MaterialService** (`src/services/MaterialService.ts`): Manages material data
- **CollectionService** (`src/services/CollectionService.ts`): Handles collection scheduling
- **DataSyncService** (`src/services/DataSyncService.ts`): Manages offline data synchronization
- **ApiClient** (`src/services/ApiClient.ts`): Handles API requests with error handling and retries

### Data Models

Materials and collections are defined using TypeScript interfaces:

```typescript
interface Material {
  id: string;
  name: string;
  category: string;
  weight: number;
  creditValue: number;
  imageUrl?: string;
}

interface Collection {
  id: string;
  userId: string;
  materialType: string;
  weight: number;
  credits: number;
  date: Date;
  status: 'scheduled' | 'completed' | 'cancelled';
  location: {
    latitude: number;
    longitude: number;
    address: string;
  };
}
```

### Caching Strategy

The API implements a sophisticated caching strategy:

- In-memory cache for frequent access
- Persistent cache using AsyncStorage for offline support
- Cache invalidation based on time-to-live (TTL) and version markers
- Optimistic updates for better perceived performance

## UI Component Library

### Design System

The EcoCart UI is built on a consistent design system with defined colors, typography, spacing, and components.

### Key Components

The component library is organized by function:

#### Layout Components
- **Container** (`src/components/Container.tsx`): Base layout container with padding and safe area support
- **Section** (`src/components/Section.tsx`): Content section with consistent spacing
- **Card** (`src/components/Card.tsx`): Shadowed container for content grouping

#### Input Components
- **Button** (`src/components/Button.tsx`): Primary, secondary, and tertiary buttons
- **TextField** (`src/components/TextField.tsx`): Text input with validation
- **Select** (`src/components/Select.tsx`): Dropdown selection component

#### Display Components
- **MaterialCard** (`src/components/MaterialCard.tsx`): Displays material information
- **CollectionItem** (`src/components/CollectionItem.tsx`): Shows collection details
- **StatisticDisplay** (`src/components/StatisticDisplay.tsx`): Visualizes statistics

#### Feedback Components
- **Toast** (`src/components/Toast.tsx`): Temporary feedback messages
- **LoadingIndicator** (`src/components/LoadingIndicator.tsx`): Activity indicators
- **ErrorDisplay** (`src/components/ErrorDisplay.tsx`): Error messaging

### Theme Support

The app supports light and dark themes through a theme provider:

```typescript
// Example of theme implementation
import { useTheme } from '../hooks/useTheme';

function MyComponent() {
  const { colors, spacing, isDark, toggleTheme } = useTheme();
  
  return (
    <View style={{ 
      backgroundColor: colors.background,
      padding: spacing.medium
    }}>
      <Text style={{ color: colors.text }}>
        Themed content
      </Text>
      <Button 
        title={isDark ? "Light Mode" : "Dark Mode"} 
        onPress={toggleTheme} 
      />
    </View>
  );
}
```

### Accessibility Support

All UI components are built with accessibility in mind:

- Proper semantic HTML/native elements
- Support for screen readers via accessibility labels
- Adequate contrast ratios
- Support for text scaling
- Touch targets meet size requirements

## Navigation Structure

### Expo Router Implementation

EcoCart uses Expo Router for file-based navigation:

```
app/
├── _layout.tsx           # Root layout (handles auth state)
├── (tabs)/               # Tab navigation group
│   ├── _layout.tsx       # Tab navigator configuration
│   ├── index.tsx         # Home screen
│   ├── materials.tsx     # Materials catalog
│   ├── collection.tsx    # Schedule collection
│   ├── rewards.tsx       # Rewards screen
│   └── profile.tsx       # User profile
├── auth/                 # Auth screens group
│   ├── _layout.tsx       # Auth navigator
│   ├── login.tsx         # Login screen
│   └── register.tsx      # Registration screen
├── collection/
│   ├── [id].tsx          # Collection details (dynamic route)
│   └── history.tsx       # Collection history
└── [...unmatched].tsx    # 404 catch-all route
```

### Navigation Patterns

The app implements several navigation patterns:

1. **Tab Navigation**: Primary app sections
2. **Stack Navigation**: For drill-down flows
3. **Modal Presentation**: For focused tasks
4. **Deep Linking**: For notifications and external links

### Navigation State Management

Navigation state is managed through Expo Router's built-in capabilities:

```typescript
// Example of programmatic navigation
import { useRouter, usePathname } from 'expo-router';

function NavigationExample() {
  const router = useRouter();
  const pathname = usePathname();
  
  // Navigate to a new screen
  const handleNavigation = () => {
    router.push('/collection/new');
  };
  
  // Navigate back
  const handleBack = () => {
    router.back();
  };
  
  // Navigate and replace current screen
  const handleReplace = () => {
    router.replace('/materials');
  };
  
  return (
    <View>
      <Text>Current path: {pathname}</Text>
      {/* Navigation buttons */}
    </View>
  );
}
```

### Protected Routes

Access control is implemented at the router level:

```typescript
// Example from app/_layout.tsx
export default function RootLayout() {
  const { user, isLoading } = useAuth();
  const segments = useSegments();
  const router = useRouter();
  
  useEffect(() => {
    if (isLoading) return;
    
    const inAuthGroup = segments[0] === 'auth';
    
    if (!user && !inAuthGroup) {
      // Redirect to sign-in if not signed in and not on auth screen
      router.replace('/auth/login');
    } else if (user && inAuthGroup) {
      // Redirect to home if signed in but on auth screen
      router.replace('/(tabs)');
    }
  }, [user, segments, isLoading]);
  
  return (
    <Stack>
      <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
      <Stack.Screen name="auth" options={{ headerShown: false }} />
      <Stack.Screen name="modal" options={{ presentation: 'modal' }} />
    </Stack>
  );
}
```

## State Management

### Architecture

EcoCart uses a combination of React Context and local component state for state management:

```
┌────────────────────────────────────────────────┐
│                                                │
│  Root Component                                │
│                                                │
│  ┌──────────────┐       ┌──────────────┐      │
│  │              │       │              │      │
│  │  AuthContext │       │ ThemeContext │      │
│  │              │       │              │      │
│  └──────────────┘       └──────────────┘      │
│                                                │
│  ┌──────────────┐       ┌──────────────┐      │
│  │              │       │              │      │
│  │  DataContext │       │ UtilsContext │      │
│  │              │       │              │      │
│  └──────────────┘       └──────────────┘      │
│                                                │
└────────────────────────────────────────────────┘
```

### Key Contexts

- **AuthContext**: Authentication state management
- **ThemeContext**: Theme management (light/dark)
- **DataContext**: Cached data management
- **NotificationContext**: Push notification state
- **OfflineContext**: Network connectivity state

### Custom Hooks

Each context has an associated hook for easy consumption:

```typescript
// Example of consuming multiple contexts through hooks
function ProfileScreen() {
  const { user, updateProfile } = useAuth();
  const { isDarkMode, toggleTheme } = useTheme();
  const { isOnline } = useOffline();
  const { data: collections, isLoading, error } = useCollections(user.id);
  
  // Component implementation
}
```

## Environment Configuration

### Multiple Environments

The app supports multiple environments (development, staging, production):

```typescript
// src/config/environments.ts
export const environments = {
  development: {
    apiUrl: 'https://dev-api.ecocart.com',
    enableLogging: true,
    apiTimeout: 10000,
    featureFlags: {
      enablePushNotifications: false,
      showBetaFeatures: true
    }
  },
  staging: {
    apiUrl: 'https://staging-api.ecocart.com',
    enableLogging: true,
    apiTimeout: 10000,
    featureFlags: {
      enablePushNotifications: true,
      showBetaFeatures: true
    }
  },
  production: {
    apiUrl: 'https://api.ecocart.com',
    enableLogging: false,
    apiTimeout: 5000,
    featureFlags: {
      enablePushNotifications: true,
      showBetaFeatures: false
    }
  }
};
```

### Environment Access

The current environment is accessible through a hook:

```typescript
// Example usage of environment configuration
import { useEnvironment } from '../hooks/useEnvironment';

function ApiComponent() {
  const { apiUrl, enableLogging } = useEnvironment();
  
  // Use environment configuration
}
```

### Feature Flags

Feature flags enable/disable functionality based on environment:

```typescript
// Example usage of feature flags
import { useFeatureFlag } from '../hooks/useFeatureFlag';

function BetaFeature() {
  const isEnabled = useFeatureFlag('showBetaFeatures');
  
  if (!isEnabled) return null;
  
  return (
    <View>
      <Text>Beta Feature</Text>
    </View>
  );
}
```

## Best Practices

### Code Organization

- Keep related code together in the same directory
- Use consistent file naming conventions
- Separate business logic from UI components
- Keep components small and focused on a single responsibility

### Performance Considerations

- Memoize expensive calculations and component renders
- Implement virtualization for long lists
- Defer non-critical operations
- Use code splitting and lazy loading for larger features

### Security Best Practices

- Never store sensitive information in plain text
- Use HTTPS for all API communication
- Implement proper input validation
- Expire and rotate tokens regularly
- Implement biometric authentication when available

### Error Handling

- Implement consistent error boundaries
- Log errors appropriately based on environment
- Provide user-friendly error messages
- Implement retry mechanisms for transient failures

## Troubleshooting

### Common Issues

#### Authentication Issues
- Token expiration
- Network connectivity problems
- Invalid credentials

#### API Issues
- Timeout errors
- Rate limiting
- Data validation errors

#### Navigation Issues
- Deep linking problems
- Screen transition issues
- Tab navigation state preservation

### Debugging Tools

- React Native Debugger
- Flipper
- Chrome DevTools
- Custom logging utilities

## References

- [Expo Router Documentation](https://docs.expo.dev/router/introduction/)
- [React Native Documentation](https://reactnative.dev/docs/getting-started)
- [TypeScript Documentation](https://www.typescriptlang.org/docs/) 