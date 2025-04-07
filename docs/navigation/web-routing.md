# Web Routing with Expo Router

## Overview

This guide describes how to implement web-specific routing using Expo Router while maintaining a seamless cross-platform navigation experience.

## Browser URL Integration

Expo Router automatically integrates with browser URLs when running on web. This provides several key benefits:

1. **SEO Support**: URLs map to specific screens for search engine crawling
2. **Bookmarking**: Users can bookmark specific screens
3. **Sharing**: Links can be shared to specific screens
4. **History**: Browser back/forward navigation works seamlessly

## URL Structure

Expo Router uses a file-based routing system that maps directly to URLs on web:

| File Path | Web URL | Description |
|-----------|---------|-------------|
| `app/index.tsx` | `/` | Home screen |
| `app/profile.tsx` | `/profile` | Profile screen |
| `app/settings/index.tsx` | `/settings` | Settings main screen |
| `app/settings/notifications.tsx` | `/settings/notifications` | Notifications settings screen |
| `app/(tabs)/index.tsx` | `/` | Home tab (groups don't affect URL) |
| `app/(tabs)/discover.tsx` | `/discover` | Discover tab |
| `app/[id].tsx` | `/123` | Dynamic route with ID parameter |

## Configuring Web Routes

### Route Configuration

Web-specific route configuration can be added in the `app/linking.ts` file:

```typescript
import { LinkingOptions } from '@react-navigation/native';

export const linking: LinkingOptions<RootStackParamList> = {
  prefixes: ['https://ecocart.app', 'ecocart://'],
  config: {
    screens: {
      Home: '',
      Profile: 'profile',
      Settings: {
        path: 'settings',
        screens: {
          General: 'general',
          Notifications: 'notifications',
        },
      },
      Details: {
        path: 'details/:id',
        parse: {
          id: (id: string) => id,
        },
      },
      NotFound: '*',
    },
  },
};
```

### Web-Specific Link Behavior

For links that should behave differently on web, use platform-specific implementations:

```typescript
// Link.tsx
import { Link as ExpoLink } from 'expo-router';
import { Platform } from 'react-native';
import type { ComponentProps } from 'react';

type LinkProps = Omit<ComponentProps<typeof ExpoLink>, 'href'> & {
  href: string;
  target?: '_blank' | '_self' | '_parent' | '_top';
};

export function Link({ href, target, ...rest }: LinkProps) {
  return (
    <ExpoLink
      href={href}
      {...rest}
      target={Platform.OS === 'web' ? target : undefined}
    />
  );
}
```

## SEO Optimization

To improve SEO on web, add proper metadata to your screens:

```tsx
// app/product/[id].tsx
import { Stack, useLocalSearchParams } from 'expo-router';
import { Text, View } from 'react-native';
import { Helmet } from 'react-helmet'; // For web only

export default function ProductScreen() {
  const { id } = useLocalSearchParams();
  const product = useProduct(id as string);
  
  return (
    <>
      {/* Web-specific head metadata */}
      {Platform.OS === 'web' && (
        <Helmet>
          <title>{product.name} | EcoCart</title>
          <meta name="description" content={product.description} />
          <meta property="og:title" content={product.name} />
          <meta property="og:description" content={product.description} />
          <meta property="og:image" content={product.imageUrl} />
          <link rel="canonical" href={`https://ecocart.app/product/${id}`} />
        </Helmet>
      )}
      
      <Stack.Screen options={{ title: product.name }} />
      <View>
        <Text>{product.name}</Text>
        {/* Product details */}
      </View>
    </>
  );
}
```

## Handling Browser History

Expo Router automatically integrates with browser history. For programmatic history manipulation on web:

```typescript
import { useRouter, usePathname } from 'expo-router';
import { Platform } from 'react-native';

export function useNavigation() {
  const router = useRouter();
  const pathname = usePathname();
  
  const navigateAndTrack = (path: string) => {
    // Navigate to the path
    router.push(path);
    
    // Web-specific analytics tracking
    if (Platform.OS === 'web') {
      trackPageView(path);
    }
  };
  
  const goBack = () => {
    if (Platform.OS === 'web' && window.history.length > 1) {
      // Use browser history on web when available
      window.history.back();
    } else {
      // Fallback for native or when no history
      router.back();
    }
  };
  
  return { navigateAndTrack, goBack, pathname };
}
```

## Deep Linking

For deep linking that works across platforms:

```typescript
// app/_layout.tsx
import { Slot, SplashScreen } from 'expo-router';
import { useEffect } from 'react';
import { Platform } from 'react-native';
import * as Linking from 'expo-linking';

export default function RootLayout() {
  useEffect(() => {
    // Handle deep links
    const subscription = Linking.addEventListener('url', ({ url }) => {
      // Parse the URL and navigate accordingly
      const parsed = Linking.parse(url);
      console.log('Deep link received:', parsed);
      
      // Handle the deep link based on parsed.path and parsed.queryParams
    });
    
    return () => subscription.remove();
  }, []);
  
  return <Slot />;
}
```

## Testing Web Routes

To test web routes locally:

```bash
# Start the development server with web support
npm run web
```

Then verify:
1. Direct URL access (e.g., http://localhost:19006/settings)
2. Navigation between screens
3. Browser back/forward navigation
4. Bookmark functionality
5. Dynamic route parameters

## Best Practices

1. **Use relative navigation** - Prefer `../` style navigation for cross-platform compatibility
2. **Implement 404 handling** - Create a `app/+not-found.tsx` page for invalid routes
3. **Create SEO-friendly URLs** - Use descriptive paths rather than IDs when possible
4. **Lazy load large screens** - Use dynamic imports on web for better performance
5. **Test across browsers** - Ensure routing works in different browsers

## Common Issues

### URL Parameters Not Working

Make sure you're using `useLocalSearchParams()` to access URL parameters:

```tsx
import { useLocalSearchParams } from 'expo-router';

export default function Screen() {
  const { id, category } = useLocalSearchParams();
  // ...
}
```

### Hash Router vs. Browser Router

By default, Expo Router uses browser history on web. For hash-based routing (useful for static hosting):

```typescript
// app/_layout.tsx
import { Platform } from 'react-native';
import { Slot, Stack } from 'expo-router';

export default function RootLayout() {
  return (
    <>
      {/* On web, use hash routing for static hosting */}
      {Platform.OS === 'web' && typeof window !== 'undefined' && (
        <script dangerouslySetInnerHTML={{
          __html: `
            window.history.replaceState = window.history.pushState = () => {};
            window.location.hash = window.location.hash || '#/';
          `
        }} />
      )}
      <Stack />
    </>
  );
}
```

### Browser-Specific Navigation

For browser-specific functionality:

```tsx
import { useRouter } from 'expo-router';
import { Platform } from 'react-native';

export function useBrowserNavigation() {
  const router = useRouter();
  
  const openInNewTab = (url: string) => {
    if (Platform.OS === 'web') {
      window.open(url, '_blank');
    } else {
      // Use native webview or external browser
      Linking.openURL(url);
    }
  };
  
  return { openInNewTab };
}
``` 