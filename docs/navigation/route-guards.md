# Route Guards Documentation

This document covers the implementation of route guards and navigation protection in EcoCart using Expo Router.

## Overview

Route guards protect specific routes from unauthorized access and ensure proper navigation flow based on user state and permissions.

## Authentication Guards

### Basic Auth Guard

```typescript
// app/_layout.tsx
import { Redirect, useSegments } from 'expo-router';
import { useAuth } from '@/hooks/useAuth';

export default function RootLayout() {
  const { isAuthenticated } = useAuth();
  const segments = useSegments();

  // Check if the user is authenticated and trying to access protected routes
  if (!isAuthenticated && segments[0] !== '(auth)') {
    return <Redirect href="/login" />;
  }

  return <Slot />;
}
```

### Role-Based Guard

```typescript
// hooks/useRoleGuard.ts
import { useAuth } from './useAuth';
import { useRouter } from 'expo-router';

export function useRoleGuard(requiredRole: string) {
  const { user } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (user && user.role !== requiredRole) {
      router.replace('/unauthorized');
    }
  }, [user, requiredRole]);
}

// Usage in protected screen
export default function AdminScreen() {
  useRoleGuard('admin');
  
  return (
    <View>
      {/* Admin content */}
    </View>
  );
}
```

## Permission Guards

### Feature Access Guard

```typescript
// hooks/useFeatureGuard.ts
import { useAuth } from './useAuth';
import { useRouter } from 'expo-router';

export function useFeatureGuard(feature: string) {
  const { user } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!user?.features?.includes(feature)) {
      router.replace('/feature-unavailable');
    }
  }, [user, feature]);
}

// Usage in feature-protected screen
export default function ARScanScreen() {
  useFeatureGuard('ar_scanning');
  
  return (
    <View>
      {/* AR scanning content */}
    </View>
  );
}
```

## Navigation Guards

### Unsaved Changes Guard

```typescript
// hooks/useUnsavedChangesGuard.ts
import { useRouter } from 'expo-router';
import { Alert } from 'react-native';

export function useUnsavedChangesGuard(hasUnsavedChanges: boolean) {
  const router = useRouter();

  useEffect(() => {
    const handleBackPress = () => {
      if (hasUnsavedChanges) {
        Alert.alert(
          'Unsaved Changes',
          'You have unsaved changes. Are you sure you want to leave?',
          [
            { text: 'Cancel', style: 'cancel' },
            { text: 'Leave', onPress: () => router.back() }
          ]
        );
        return true;
      }
      return false;
    };

    // Add back press handler
    const subscription = router.addListener('beforeRemove', handleBackPress);
    return () => subscription.remove();
  }, [hasUnsavedChanges]);
}

// Usage in form screen
export default function EditProfileScreen() {
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false);
  useUnsavedChangesGuard(hasUnsavedChanges);
  
  return (
    <View>
      {/* Form content */}
    </View>
  );
}
```

### Network Status Guard

```typescript
// hooks/useNetworkGuard.ts
import { useRouter } from 'expo-router';
import NetInfo from '@react-native-community/netinfo';

export function useNetworkGuard() {
  const router = useRouter();

  useEffect(() => {
    const unsubscribe = NetInfo.addEventListener(state => {
      if (!state.isConnected) {
        router.replace('/offline');
      }
    });

    return () => unsubscribe();
  }, []);
}

// Usage in network-dependent screen
export default function MaterialListScreen() {
  useNetworkGuard();
  
  return (
    <View>
      {/* Network-dependent content */}
    </View>
  );
}
```

## Route Protection Patterns

### 1. Group-Level Protection

```typescript
// app/(protected)/_layout.tsx
import { Redirect } from 'expo-router';
import { useAuth } from '@/hooks/useAuth';

export default function ProtectedLayout() {
  const { isAuthenticated } = useAuth();

  if (!isAuthenticated) {
    return <Redirect href="/login" />;
  }

  return <Slot />;
}
```

### 2. Screen-Level Protection

```typescript
// app/(protected)/settings.tsx
import { useAuth } from '@/hooks/useAuth';
import { useRouter } from 'expo-router';

export default function SettingsScreen() {
  const { user } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!user?.isAdmin) {
      router.replace('/unauthorized');
    }
  }, [user]);

  return (
    <View>
      {/* Settings content */}
    </View>
  );
}
```

### 3. Feature-Level Protection

```typescript
// components/FeatureGuard.tsx
import { useAuth } from '@/hooks/useAuth';

interface FeatureGuardProps {
  feature: string;
  children: React.ReactNode;
  fallback?: React.ReactNode;
}

export function FeatureGuard({ feature, children, fallback }: FeatureGuardProps) {
  const { user } = useAuth();

  if (!user?.features?.includes(feature)) {
    return fallback || null;
  }

  return <>{children}</>;
}

// Usage
<FeatureGuard feature="ar_scanning">
  <ARScanButton />
</FeatureGuard>
```

## Best Practices

1. **Guard Organization**
   - Keep guards in separate hooks
   - Use composition for complex guards
   - Implement guards at appropriate levels

2. **Performance**
   - Memoize guard conditions
   - Clean up subscriptions
   - Avoid unnecessary re-renders

3. **User Experience**
   - Provide clear feedback
   - Handle edge cases gracefully
   - Maintain navigation history

4. **Security**
   - Validate permissions server-side
   - Handle token expiration
   - Protect sensitive routes

## Common Issues and Solutions

1. **Race Conditions**
   - Use proper state management
   - Handle loading states
   - Implement proper cleanup

2. **Navigation Loops**
   - Check guard conditions carefully
   - Handle redirect chains
   - Implement proper fallbacks

3. **State Management**
   - Keep auth state in sync
   - Handle state updates properly
   - Implement proper error handling 