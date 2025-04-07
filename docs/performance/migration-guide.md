# Performance Optimization Migration Guide

This guide provides step-by-step instructions for migrating existing components to use performance-optimized versions in the EcoCart app.

## Table of Contents

1. [Image Components](#image-components)
2. [Screen Components](#screen-components)
3. [Navigation](#navigation)
4. [State Management](#state-management)
5. [Data Fetching](#data-fetching)

## Image Components

### Migrating from React Native Image

```typescript
// Before
import { Image } from 'react-native';

function ProductCard({ imageUrl }) {
  return (
    <Image
      source={{ uri: imageUrl }}
      style={styles.image}
    />
  );
}

// After
import { OptimizedImage } from '@/components/OptimizedImage';

function ProductCard({ imageUrl }) {
  return (
    <OptimizedImage
      source={imageUrl}
      width={200}
      height={200}
      placeholder="blur"
      blurDataURL={generateBlurDataURL(imageUrl)}
    />
  );
}
```

### Migration Steps

1. **Identify Image Components**
   ```bash
   # Search for Image imports
   grep -r "import.*Image.*react-native" src/
   ```

2. **Update Imports**
   ```typescript
   // Remove
   import { Image } from 'react-native';
   
   // Add
   import { OptimizedImage } from '@/components/OptimizedImage';
   ```

3. **Update Props**
   ```typescript
   // Remove
   style={styles.image}
   
   // Add
   width={200}
   height={200}
   ```

4. **Add Placeholder Support**
   ```typescript
   // Add blur placeholder
   placeholder="blur"
   blurDataURL={generateBlurDataURL(imageUrl)}
   ```

## Screen Components

### Migrating to LazyScreen

```typescript
// Before
function AnalyticsScreen() {
  return (
    <View>
      <AnalyticsDashboard />
    </View>
  );
}

// After
import { LazyScreen } from '@/components/LazyScreen';

function AnalyticsScreen() {
  return (
    <LazyScreen
      fallback={<LoadingSpinner />}
      threshold={0.5}
    >
      <AnalyticsDashboard />
    </LazyScreen>
  );
}
```

### Migration Steps

1. **Identify Heavy Screens**
   ```bash
   # Search for large component files
   find src/screens -type f -size +100k
   ```

2. **Add LazyScreen Wrapper**
   ```typescript
   // Wrap heavy components
   <LazyScreen fallback={<LoadingSpinner />}>
     <HeavyComponent />
   </LazyScreen>
   ```

3. **Update Navigation**
   ```typescript
   // Update screen registration
   const AnalyticsScreen = lazy(() => import('./screens/AnalyticsScreen'));
   ```

## Navigation

### Optimizing Navigation Performance

```typescript
// Before
const Stack = createStackNavigator();

function AppNavigator() {
  return (
    <Stack.Navigator>
      <Stack.Screen name="Home" component={HomeScreen} />
      <Stack.Screen name="Profile" component={ProfileScreen} />
    </Stack.Navigator>
  );
}

// After
import { LazyScreen } from '@/components/LazyScreen';

const Stack = createStackNavigator();

function AppNavigator() {
  return (
    <Stack.Navigator>
      <Stack.Screen
        name="Home"
        component={LazyScreen(HomeScreen)}
      />
      <Stack.Screen
        name="Profile"
        component={LazyScreen(ProfileScreen)}
      />
    </Stack.Navigator>
  );
}
```

### Migration Steps

1. **Update Navigation Configuration**
   ```typescript
   // Add screen preloading
   const preloadScreens = () => {
     const screens = ['Home', 'Profile', 'Settings'];
     screens.forEach(screen => {
       const component = navigationRef.current?.getComponent(screen);
       if (component) {
         component.preload();
       }
     });
   };
   ```

2. **Implement Screen Transitions**
   ```typescript
   // Add transition animations
   const config = {
     animation: 'spring',
     config: {
       stiffness: 1000,
       damping: 500,
       mass: 3,
       overshootClamping: true,
       restDisplacementThreshold: 0.01,
       restSpeedThreshold: 0.01,
     },
   };
   ```

## State Management

### Optimizing State Updates

```typescript
// Before
function ProductList() {
  const [products, setProducts] = useState([]);
  
  useEffect(() => {
    fetchProducts().then(setProducts);
  }, []);
  
  return (
    <FlatList
      data={products}
      renderItem={({ item }) => (
        <ProductCard product={item} />
      )}
    />
  );
}

// After
import { useMemo, useCallback } from 'react';

function ProductList() {
  const [products, setProducts] = useState([]);
  
  const memoizedProducts = useMemo(() => products, [products]);
  
  const renderItem = useCallback(({ item }) => (
    <ProductCard product={item} />
  ), []);
  
  return (
    <FlatList
      data={memoizedProducts}
      renderItem={renderItem}
      removeClippedSubviews={true}
      maxToRenderPerBatch={10}
      windowSize={5}
    />
  );
}
```

### Migration Steps

1. **Add Memoization**
   ```typescript
   // Memoize expensive computations
   const memoizedValue = useMemo(() => 
     computeExpensiveValue(a, b),
     [a, b]
   );
   ```

2. **Optimize Callbacks**
   ```typescript
   // Memoize event handlers
   const handlePress = useCallback(() => {
     // Handle press
   }, [/* dependencies */]);
   ```

3. **Update List Components**
   ```typescript
   // Add performance props
   <FlatList
     removeClippedSubviews={true}
     maxToRenderPerBatch={10}
     windowSize={5}
   />
   ```

## Data Fetching

### Implementing Efficient Data Loading

```typescript
// Before
function ProductDetails({ id }) {
  const [product, setProduct] = useState(null);
  
  useEffect(() => {
    fetchProduct(id).then(setProduct);
  }, [id]);
  
  return <ProductView product={product} />;
}

// After
import { useQuery } from '@tanstack/react-query';

function ProductDetails({ id }) {
  const { data: product, isLoading } = useQuery(
    ['product', id],
    () => fetchProduct(id),
    {
      staleTime: 5 * 60 * 1000, // 5 minutes
      cacheTime: 30 * 60 * 1000, // 30 minutes
    }
  );
  
  if (isLoading) return <LoadingSpinner />;
  return <ProductView product={product} />;
}
```

### Migration Steps

1. **Add Data Caching**
   ```typescript
   // Implement caching layer
   const cache = new Map();
   
   function fetchWithCache(key, fetcher) {
     if (cache.has(key)) {
       return cache.get(key);
     }
     const data = fetcher();
     cache.set(key, data);
     return data;
   }
   ```

2. **Update API Calls**
   ```typescript
   // Add request deduplication
   const pendingRequests = new Map();
   
   function fetchWithDeduplication(key, fetcher) {
     if (pendingRequests.has(key)) {
       return pendingRequests.get(key);
     }
     const promise = fetcher().finally(() => {
       pendingRequests.delete(key);
     });
     pendingRequests.set(key, promise);
     return promise;
   }
   ```

3. **Implement Pagination**
   ```typescript
   // Add infinite scrolling
   const [page, setPage] = useState(1);
   const [hasMore, setHasMore] = useState(true);
   
   const loadMore = () => {
     if (!hasMore) return;
     setPage(prev => prev + 1);
   };
   ```

## Best Practices

1. **Migration Process**
   - Start with high-impact components
   - Test thoroughly after each change
   - Monitor performance metrics
   - Document changes

2. **Testing**
   - Add performance tests
   - Test on multiple devices
   - Verify offline behavior
   - Check memory usage

3. **Monitoring**
   - Track performance metrics
   - Monitor error rates
   - Check user feedback
   - Document issues

4. **Maintenance**
   - Regular performance audits
   - Update documentation
   - Monitor dependencies
   - Track metrics over time

## Tools and Resources

1. **Migration Tools**
   - Performance profiler
   - Memory leak detector
   - Network analyzer
   - Bundle analyzer

2. **Testing Tools**
   - Performance testing suite
   - Load testing tools
   - Memory profiling
   - Network simulation

3. **Monitoring Tools**
   - Performance dashboard
   - Error tracking
   - Analytics platform
   - User feedback system

4. **Documentation**
   - Migration checklist
   - Performance guidelines
   - Testing procedures
   - Monitoring setup 