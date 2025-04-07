# Deep Linking Documentation

This document covers the deep linking setup and configuration in EcoCart using Expo Router.

## Overview

Deep linking allows users to open specific screens in the app directly from external links, such as web URLs, notifications, or other apps. EcoCart implements deep linking using Expo Router's built-in support.

## Configuration

### 1. App Configuration

```json
// app.json
{
  "expo": {
    "scheme": "ecocart",
    "web": {
      "bundler": "metro"
    },
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

### 2. Universal Links (iOS)

```json
// app.json
{
  "expo": {
    "ios": {
      "associatedDomains": ["applinks:ecocart.app"]
    }
  }
}
```

### 3. App Links (Android)

```json
// app.json
{
  "expo": {
    "android": {
      "intentFilters": [
        {
          "action": "VIEW",
          "autoVerify": true,
          "data": [
            {
              "scheme": "https",
              "host": "ecocart.app",
              "pathPrefix": "/"
            }
          ],
          "category": ["BROWSABLE", "DEFAULT"]
        }
      ]
    }
  }
}
```

## Deep Link Structure

### URL Patterns

```
// Basic deep links
ecocart://materials
ecocart://collections
ecocart://profile

// Deep links with parameters
ecocart://material-details?id=123
ecocart://collection-details?id=456
ecocart://ar-scan?type=plastic

// Universal links
https://ecocart.app/materials
https://ecocart.app/collections
https://ecocart.app/profile
```

### Route Mapping

```typescript
// app/_layout.tsx
export const linking = {
  prefixes: ['ecocart://', 'https://ecocart.app'],
  config: {
    screens: {
      '(tabs)': {
        screens: {
          index: '',
          materials: 'materials',
          collections: 'collections',
          community: 'community',
          profile: 'profile'
        }
      },
      '(modals)': {
        screens: {
          'ar-scan': 'ar-scan',
          'material-details': 'material-details',
          'collection-details': 'collection-details'
        }
      },
      '(auth)': {
        screens: {
          login: 'login',
          signup: 'signup',
          'forgot-password': 'forgot-password',
          'reset-password': 'reset-password'
        }
      }
    }
  }
};
```

## Implementation

### 1. Handling Deep Links

```typescript
// app/_layout.tsx
import { useEffect } from 'react';
import { useRouter, useSegments } from 'expo-router';
import * as Linking from 'expo-linking';

export default function RootLayout() {
  const router = useRouter();
  const segments = useSegments();

  useEffect(() => {
    // Handle deep links when app is already running
    const subscription = Linking.addEventListener('url', ({ url }) => {
      handleDeepLink(url);
    });

    // Handle initial deep link
    Linking.getInitialURL().then((url) => {
      if (url) {
        handleDeepLink(url);
      }
    });

    return () => {
      subscription.remove();
    };
  }, []);

  const handleDeepLink = (url: string) => {
    const { path, queryParams } = Linking.parse(url);
    router.push({
      pathname: path,
      params: queryParams
    });
  };

  return <Slot />;
}
```

### 2. Dynamic Route Parameters

```typescript
// app/(modals)/material-details.tsx
import { useLocalSearchParams } from 'expo-router';

export default function MaterialDetailsScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();

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

### 3. Authentication with Deep Links

```typescript
// app/_layout.tsx
import { useAuth } from '@/hooks/useAuth';

export default function RootLayout() {
  const { isAuthenticated } = useAuth();
  const segments = useSegments();

  useEffect(() => {
    const inAuthGroup = segments[0] === '(auth)';
    
    if (!isAuthenticated && !inAuthGroup) {
      // Redirect to login but preserve the deep link
      router.replace({
        pathname: '/login',
        params: {
          redirect: segments.join('/')
        }
      });
    }
  }, [isAuthenticated, segments]);

  return <Slot />;
}
```

## Testing Deep Links

### 1. Testing on iOS Simulator

```bash
# Open deep link in simulator
xcrun simctl openurl booted "ecocart://materials"

# Test universal links
xcrun simctl openurl booted "https://ecocart.app/materials"
```

### 2. Testing on Android Emulator

```bash
# Open deep link in emulator
adb shell am start -W -a android.intent.action.VIEW -d "ecocart://materials"

# Test app links
adb shell am start -W -a android.intent.action.VIEW -d "https://ecocart.app/materials"
```

### 3. Testing in Development

```typescript
// utils/deepLinkTesting.ts
export const testDeepLink = (url: string) => {
  Linking.openURL(url).catch((err) => {
    console.error('Deep link error:', err);
  });
};

// Usage in development
testDeepLink('ecocart://materials');
testDeepLink('https://ecocart.app/materials');
```

## Best Practices

1. **URL Structure**
   - Keep URLs clean and semantic
   - Use query parameters for dynamic data
   - Follow RESTful conventions

2. **Error Handling**
   - Handle invalid deep links gracefully
   - Provide fallback navigation
   - Log deep link errors

3. **Security**
   - Validate deep link parameters
   - Sanitize user input
   - Handle authentication state

4. **Performance**
   - Preload deep linked screens
   - Cache deep link data
   - Optimize deep link handling

5. **User Experience**
   - Provide loading states
   - Handle offline scenarios
   - Maintain navigation history

## Common Issues and Solutions

1. **Universal Links Not Working**
   - Verify Apple App Site Association file
   - Check associated domains capability
   - Test with proper SSL certificate

2. **App Links Not Working**
   - Verify Digital Asset Links file
   - Check intent filters configuration
   - Test with proper SSL certificate

3. **Deep Link Parameters**
   - URL encode parameters
   - Handle special characters
   - Validate parameter types

4. **Authentication Flow**
   - Preserve deep link after login
   - Handle expired sessions
   - Manage redirect chains 