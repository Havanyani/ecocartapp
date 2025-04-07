# Navigation Examples

This document provides practical examples of navigation patterns in EcoCart using Expo Router.

## Basic Navigation

### Using the Router Hook

```typescript
import { useRouter } from 'expo-router';

export function MyComponent() {
  const router = useRouter();

  // Navigate to a new screen
  const handleNavigate = () => {
    router.push('/materials');
  };

  // Navigate with parameters
  const handleNavigateWithParams = () => {
    router.push({
      pathname: '/material-details',
      params: { id: '123' }
    });
  };

  // Replace current screen
  const handleReplace = () => {
    router.replace('/profile');
  };

  // Go back
  const handleGoBack = () => {
    router.back();
  };
}
```

### Using Link Component

```typescript
import { Link } from 'expo-router';

export function MyComponent() {
  return (
    <Link href="/materials">
      Go to Materials
    </Link>
  );
}

// With parameters
<Link href={{
  pathname: '/material-details',
  params: { id: '123' }
}}>
  View Material Details
</Link>
```

## Tab Navigation

### Tab Bar Navigation

```typescript
import { Tabs } from 'expo-router';

export default function TabLayout() {
  return (
    <Tabs>
      <Tabs.Screen
        name="index"
        options={{
          title: 'Home',
          tabBarIcon: ({ color }) => (
            <TabBarIcon name="home" color={color} />
          ),
        }}
      />
      <Tabs.Screen
        name="materials"
        options={{
          title: 'Materials',
          tabBarIcon: ({ color }) => (
            <TabBarIcon name="material" color={color} />
          ),
        }}
      />
      {/* Other tab screens */}
    </Tabs>
  );
}
```

## Modal Navigation

### Opening a Modal

```typescript
import { useRouter } from 'expo-router';

export function MyComponent() {
  const router = useRouter();

  const openARScan = () => {
    router.push('/ar-scan');
  };

  return (
    <Button onPress={openARScan} title="Scan Material" />
  );
}
```

### Modal with Parameters

```typescript
import { useRouter } from 'expo-router';

export function MaterialList() {
  const router = useRouter();

  const openMaterialDetails = (id: string) => {
    router.push({
      pathname: '/material-details',
      params: { id }
    });
  };

  return (
    <FlatList
      data={materials}
      renderItem={({ item }) => (
        <Button
          onPress={() => openMaterialDetails(item.id)}
          title={item.name}
        />
      )}
    />
  );
}
```

## Authentication Navigation

### Protected Routes

```typescript
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

### Auth Flow Navigation

```typescript
import { useRouter } from 'expo-router';

export function LoginScreen() {
  const router = useRouter();

  const handleLogin = async () => {
    try {
      await loginUser(credentials);
      router.replace('/(tabs)');
    } catch (error) {
      // Handle error
    }
  };

  const handleForgotPassword = () => {
    router.push('/forgot-password');
  };

  return (
    <View>
      <Button onPress={handleLogin} title="Login" />
      <Button onPress={handleForgotPassword} title="Forgot Password?" />
    </View>
  );
}
```

## Deep Linking

### Handling Deep Links

```typescript
import { useRouter, useLocalSearchParams } from 'expo-router';

export function MaterialDetailsScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const router = useRouter();

  useEffect(() => {
    if (id) {
      loadMaterialDetails(id);
    }
  }, [id]);

  return (
    <View>
      {/* Material details content */}
    </View>
  );
}
```

### Deep Link Configuration

```typescript
// app.json
{
  "expo": {
    "scheme": "ecocart",
    "plugins": [
      [
        "expo-router",
        {
          "origin": "https://ecocart.app"
        }
      ]
    ]
  }
}
```

## Route Preloading

### Preloading Routes

```typescript
import { useRoutePreloading } from '@/utils/routePreloading';

export function AppInitializer() {
  const { preloadCriticalRoutes } = useRoutePreloading();

  useEffect(() => {
    preloadCriticalRoutes();
  }, []);

  return null;
}
```

### Smart Preloading

```typescript
import { useRoutePreloading } from '@/utils/routePreloading';

export function MyComponent() {
  const { preloadAdjacentRoutes } = useRoutePreloading();
  const router = useRouter();

  useEffect(() => {
    // Preload adjacent routes when component mounts
    preloadAdjacentRoutes(router.pathname);
  }, [router.pathname]);

  return (
    // Component content
  );
}
```

## Error Handling

### Navigation Error Handling

```typescript
import { useRouter } from 'expo-router';

export function MyComponent() {
  const router = useRouter();

  const handleNavigation = async () => {
    try {
      await router.push('/materials');
    } catch (error) {
      // Handle navigation error
      console.error('Navigation failed:', error);
    }
  };

  return (
    <Button onPress={handleNavigation} title="Navigate" />
  );
}
```

### Route Not Found

```typescript
// app/[...missing].tsx
import { View, Text } from 'react-native';
import { Link } from 'expo-router';

export default function NotFoundScreen() {
  return (
    <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center' }}>
      <Text>Screen not found</Text>
      <Link href="/">Go back home</Link>
    </View>
  );
}
``` 