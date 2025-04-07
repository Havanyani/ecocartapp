# Migration Guide: Upgrading to Performance-Optimized Components

This guide helps developers transition from standard components to the new performance-optimized components in the EcoCart app.

## Table of Contents

1. [Image Components](#image-components)
2. [Screen Loading](#screen-loading)
3. [List Components](#list-components)
4. [App Initialization](#app-initialization)
5. [Common Migration Issues](#common-migration-issues)

## Image Components

### Migrating from React Native Image to OptimizedImage

#### Before:

```tsx
import { Image } from 'react-native';

function ProductImage({ product }) {
  return (
    <Image
      source={{ uri: product.imageUrl }}
      style={styles.image}
      resizeMode="cover"
    />
  );
}
```

#### After:

```tsx
import OptimizedImage from '@/components/OptimizedImage';

function ProductImage({ product }) {
  return (
    <OptimizedImage
      source={{ uri: product.imageUrl }}
      style={styles.image}
      contentFit="cover"
      placeholder={require('@/assets/images/placeholder.png')}
      // Optional: Add blurhash if available
      blurhash={product.imageBlurHash}
      lazyLoad={true}
    />
  );
}
```

### Prop Mapping

| React Native Image | OptimizedImage | Notes |
|-------------------|----------------|-------|
| `source` | `source` | Same format, supports uri and require |
| `style` | `style` | Same format |
| `resizeMode` | `contentFit` | "cover", "contain", "fill", "none", "scale-down" |
| N/A | `placeholder` | New prop for loading placeholder |
| N/A | `blurhash` | New prop for blur-up technique |
| N/A | `lazyLoad` | New prop to enable lazy loading |
| `onLoad` | `onLoad` | Same format |
| `onError` | `onError` | Similar, but with more detailed error object |

### Generating BlurHash Values

If you want to add blurhash support for optimal loading experience:

1. Add the blurhash field to your product data model
2. Use the generate-blurhashes script to process your images:

```bash
# Generate blurhash values for product images
node scripts/generate-blurhashes.js --input=assets/products --output=src/data/product-blurhash.json
```

3. Import and use the generated values

```tsx
import productBlurhashes from '@/data/product-blurhash.json';

function ProductImage({ product }) {
  const blurhash = productBlurhashes[product.id] || undefined;
  
  return (
    <OptimizedImage
      source={{ uri: product.imageUrl }}
      style={styles.image}
      contentFit="cover"
      blurhash={blurhash}
      lazyLoad={true}
    />
  );
}
```

## Screen Loading

### Migrating to LazyScreen for Code Splitting

#### Before (Navigator definition):

```tsx
import HomeScreen from '@/screens/HomeScreen';
import ProfileScreen from '@/screens/ProfileScreen';
import SettingsScreen from '@/screens/SettingsScreen';

function AppNavigator() {
  return (
    <Stack.Navigator>
      <Stack.Screen name="Home" component={HomeScreen} />
      <Stack.Screen name="Profile" component={ProfileScreen} />
      <Stack.Screen name="Settings" component={SettingsScreen} />
    </Stack.Navigator>
  );
}
```

#### After:

```tsx
import createLazyScreen from '@/components/LazyScreen';
import HomeScreen from '@/screens/HomeScreen'; // Keep Home non-lazy for faster startup

// Create lazy-loaded screens
const ProfileScreen = createLazyScreen(
  'ProfileScreen',
  () => import('@/screens/ProfileScreen'),
  { preload: false }
);

const SettingsScreen = createLazyScreen(
  'SettingsScreen',
  () => import('@/screens/SettingsScreen'),
  { preload: false }
);

function AppNavigator() {
  return (
    <Stack.Navigator>
      <Stack.Screen name="Home" component={HomeScreen} />
      <Stack.Screen name="Profile" component={ProfileScreen} />
      <Stack.Screen name="Settings" component={SettingsScreen} />
    </Stack.Navigator>
  );
}
```

### Adding Preloading

Improve navigation performance by adding preloading to your navigation events:

```tsx
import { useNavigation, useFocusEffect } from '@react-navigation/native';
import BundleSplitter from '@/utils/performance/BundleSplitter';

function HomeScreen() {
  const navigation = useNavigation();
  
  // Preload screens likely to be accessed from Home
  useFocusEffect(
    React.useCallback(() => {
      BundleSplitter.preloadComponents(['ProfileScreen']);
    }, [])
  );
  
  return (
    <View>
      <TouchableOpacity
        onPress={() => navigation.navigate('Profile')}
        // Preload on press-in for faster perceived navigation
        onPressIn={() => BundleSplitter.preloadComponent('ProfileScreen')}
      >
        <Text>Go to Profile</Text>
      </TouchableOpacity>
    </View>
  );
}
```

## List Components

### Optimizing Lists for Performance

#### Before:

```tsx
import { ScrollView } from 'react-native';

function ProductList({ products }) {
  return (
    <ScrollView>
      {products.map(product => (
        <ProductCard key={product.id} product={product} />
      ))}
    </ScrollView>
  );
}
```

#### After:

```tsx
import { FlatList } from 'react-native';
import React from 'react';

// Memoize the product card to prevent unnecessary renders
const MemoizedProductCard = React.memo(
  ({ product }) => <ProductCard product={product} />,
  (prev, next) => prev.product.id === next.product.id
);

function ProductList({ products }) {
  const renderItem = React.useCallback(({ item }) => (
    <MemoizedProductCard product={item} />
  ), []);
  
  const keyExtractor = React.useCallback((item) => item.id, []);
  
  return (
    <FlatList
      data={products}
      renderItem={renderItem}
      keyExtractor={keyExtractor}
      initialNumToRender={5}
      maxToRenderPerBatch={10}
      windowSize={5}
      removeClippedSubviews={true}
      // Optional if items have fixed height
      getItemLayout={(data, index) => ({
        length: 120, // fixed height
        offset: 120 * index,
        index,
      })}
    />
  );
}
```

## App Initialization

### Migrating to AppInitializationWrapper

#### Before (App.tsx):

```tsx
import React, { useEffect, useState } from 'react';
import { NavigationContainer } from '@react-navigation/native';
import AppNavigator from './src/navigation/AppNavigator';
import * as SplashScreen from 'expo-splash-screen';
import * as Font from 'expo-font';

// Keep splash screen visible while loading resources
SplashScreen.preventAutoHideAsync();

export default function App() {
  const [isReady, setIsReady] = useState(false);
  
  useEffect(() => {
    async function prepare() {
      try {
        // Load fonts
        await Font.loadAsync({
          'Inter-Regular': require('./assets/fonts/Inter-Regular.ttf'),
          'Inter-Bold': require('./assets/fonts/Inter-Bold.ttf'),
        });
        
        // Do other initialization tasks...
      } catch (e) {
        console.warn(e);
      } finally {
        setIsReady(true);
        SplashScreen.hideAsync();
      }
    }
    
    prepare();
  }, []);
  
  if (!isReady) {
    return null;
  }
  
  return (
    <NavigationContainer>
      <AppNavigator />
    </NavigationContainer>
  );
}
```

#### After:

```tsx
import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import AppNavigator from './src/navigation/AppNavigator';
import AppInitializationWrapper from '@/components/AppInitializationWrapper';

export default function App() {
  return (
    <AppInitializationWrapper>
      <NavigationContainer>
        <AppNavigator />
      </NavigationContainer>
    </AppInitializationWrapper>
  );
}
```

With corresponding AppInitializer setup:

```tsx
// src/utils/performance/AppInitializer.ts
import * as Font from 'expo-font';
import * as SplashScreen from 'expo-splash-screen';
import { Asset } from 'expo-asset';

class AppInitializer {
  private initialized = false;
  
  async initialize() {
    if (this.initialized) return;
    
    try {
      // Load fonts
      await Font.loadAsync({
        'Inter-Regular': require('@/assets/fonts/Inter-Regular.ttf'),
        'Inter-Bold': require('@/assets/fonts/Inter-Bold.ttf'),
      });
      
      // Preload critical images
      const images = [
        require('@/assets/images/logo.png'),
        require('@/assets/icons/home.png'),
      ];
      
      await Promise.all(images.map(image => 
        Asset.fromModule(image).downloadAsync()
      ));
      
      // Initialize other services
      // ...
      
      this.initialized = true;
    } catch (error) {
      console.error('Error during app initialization:', error);
      throw error;
    }
  }
  
  async hideSplashScreen() {
    await SplashScreen.hideAsync();
  }
  
  isAppInitialized() {
    return this.initialized;
  }
}

export const appInitializer = new AppInitializer();
```

## Common Migration Issues

### 1. Missing Placeholder Images

**Symptom**: Flickering or empty spaces where images should be

**Solution**: Always provide placeholder images:

```tsx
<OptimizedImage
  source={{ uri: product.imageUrl }}
  placeholder={require('@/assets/images/placeholder.png')}
  // ...
/>
```

### 2. Incorrect ContentFit Values

**Symptom**: Images are stretched or cropped unexpectedly

**Solution**: Map React Native resizeMode values to OptimizedImage contentFit values:

| resizeMode | contentFit |
|------------|------------|
| "cover" | "cover" |
| "contain" | "contain" |
| "stretch" | "fill" |
| "center" | "none" |
| "repeat" | "none" |

### 3. LazyScreen Loading Errors

**Symptom**: "Cannot find module" errors when using LazyScreen

**Solution**: Ensure your import paths are correct and the file exists. Use absolute imports with tsconfig path aliases:

```tsx
// tsconfig.json
{
  "compilerOptions": {
    "baseUrl": ".",
    "paths": {
      "@/*": ["src/*"]
    }
  }
}

// In your code
const ProfileScreen = createLazyScreen(
  'ProfileScreen',
  () => import('@/screens/profile/ProfileScreen'), // Use absolute path with alias
  { preload: false }
);
```

### 4. AppInitializationWrapper Blocking UI

**Symptom**: App appears stuck on loading screen

**Solution**: Ensure initialization tasks are properly awaited and don't block the UI thread:

```tsx
// Move expensive operations to background tasks or Web Workers
// Break up initialization into smaller chunks

// Bad example
async function initializeData() {
  const hugeDataSet = await fetchHugeDataSet();
  processHugeDataSet(hugeDataSet); // Blocks UI thread
}

// Better example
async function initializeData() {
  const hugeDataSet = await fetchHugeDataSet();
  // Process in chunks to avoid blocking UI
  for (let i = 0; i < hugeDataSet.length; i += 100) {
    const chunk = hugeDataSet.slice(i, i + 100);
    await new Promise(resolve => setTimeout(() => {
      processDataChunk(chunk);
      resolve();
    }, 0));
  }
}
```

## Automated Migration Script

To help with the migration process, we've created a script that can automatically convert basic React Native Image components to OptimizedImage components:

```bash
# Run the migration script
npx ts-node scripts/migrate-to-optimized-images.ts --dir=src/screens
```

The script will:

1. Find all Image imports and usages
2. Convert to OptimizedImage with appropriate props 
3. Add placeholder images where possible
4. Generate a report of changes made and potential issues

## Testing After Migration

After migrating components, run the performance test suite to ensure improvements:

```bash
# Run performance tests
npm run test:performance

# Verify E2E tests still pass
npm run test:e2e
```

Look for improvements in:

1. Memory usage
2. Render times 
3. Startup performance
4. Frame rates during scrolling
5. Network efficiency

## Getting Help

If you encounter issues during migration:

1. Check the [Performance Optimization Developer Guide](./performance-optimization-guide.md)
2. Review the [Performance Components README](../../src/components/performance/README.md)
3. Reach out to the Performance Optimization team on Slack (#perf-optimization)
4. File issues with the tag "performance-migration" in the issue tracker 