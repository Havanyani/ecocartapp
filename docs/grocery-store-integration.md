# Grocery Store Integration

This document describes the grocery store integration in the EcoCart app, including components, state management, and API integration.

## Overview

The grocery store integration allows users to:
- Search for nearby grocery stores
- View store details and operating hours
- Browse products by category
- View product details including sustainability scores
- Check product availability and inventory

## Components

### StoreList
A component that displays a list of grocery stores with search functionality.

```typescript
<StoreList onStoreSelect={(store) => handleStoreSelect(store)} />
```

Props:
- `onStoreSelect`: Callback function called when a store is selected

### StoreDetails
A component that displays detailed information about a selected store.

```typescript
<StoreDetails store={selectedStore} />
```

Props:
- `store`: The selected store object

### ProductCard
A component that displays product information with sustainability score.

```typescript
<ProductCard product={product} onPress={(product) => handleProductSelect(product)} />
```

Props:
- `product`: The product object to display
- `onPress`: Optional callback function called when the card is pressed

## State Management

The grocery store state is managed using Redux Toolkit with the following structure:

```typescript
interface GroceryStoreState {
  stores: GroceryStore[];
  selectedStore: GroceryStore | null;
  products: Record<string, Product[]>;
  inventory: Record<string, InventoryItem[]>;
  isLoading: boolean;
  error: string | null;
}
```

### Actions
- `searchStores`: Search for stores based on parameters
- `getStoreById`: Get a specific store by ID
- `searchProducts`: Search for products in a store
- `getStoreInventory`: Get inventory for a store
- `setSelectedStore`: Set the currently selected store
- `clearError`: Clear any error state

## API Integration

The grocery store API service provides the following endpoints:

```typescript
const groceryStoreApi = {
  searchStores(params: StoreSearchParams): Promise<GroceryStore[]>;
  getStoreById(storeId: string): Promise<GroceryStore>;
  searchProducts(params: ProductSearchParams): Promise<Product[]>;
  getProductById(storeId: string, productId: string): Promise<Product>;
  getInventory(storeId: string, productId: string): Promise<InventoryItem>;
  getStoreInventory(storeId: string): Promise<InventoryItem[]>;
};
```

### Search Parameters

#### Store Search
```typescript
interface StoreSearchParams {
  latitude?: number;
  longitude?: number;
  radius?: number; // in kilometers
  query?: string;
  isActive?: boolean;
}
```

#### Product Search
```typescript
interface ProductSearchParams {
  storeId: string;
  category?: string;
  query?: string;
  isAvailable?: boolean;
}
```

## Data Types

### GroceryStore
```typescript
interface GroceryStore {
  id: string;
  name: string;
  address: string;
  location: {
    latitude: number;
    longitude: number;
  };
  operatingHours: {
    day: 'MONDAY' | 'TUESDAY' | 'WEDNESDAY' | 'THURSDAY' | 'FRIDAY' | 'SATURDAY' | 'SUNDAY';
    open: string;
    close: string;
  }[];
  contactNumber?: string;
  email?: string;
  isActive: boolean;
}
```

### Product
```typescript
interface Product {
  id: string;
  name: string;
  category: string;
  description?: string;
  price: number;
  unit: string;
  imageUrl?: string;
  isAvailable: boolean;
  sustainabilityScore?: number; // 0-100
}
```

### InventoryItem
```typescript
interface InventoryItem {
  productId: string;
  storeId: string;
  quantity: number;
  lastUpdated: Date;
}
```

## Usage Example

```typescript
import { useGroceryStore } from '@/hooks/useGroceryStore';

function StoreScreen() {
  const {
    stores,
    selectedStore,
    products,
    isLoading,
    error,
    searchStores,
    getStoreProducts,
  } = useGroceryStore();

  useEffect(() => {
    // Search for stores near user's location
    searchStores({
      latitude: 37.7749,
      longitude: -122.4194,
      radius: 10,
    });
  }, [searchStores]);

  const handleStoreSelect = (store) => {
    // Handle store selection
  };

  if (isLoading) {
    return <LoadingSpinner />;
  }

  if (error) {
    return <ErrorMessage message={error} />;
  }

  return (
    <StoreList
      stores={stores}
      onStoreSelect={handleStoreSelect}
    />
  );
}
```

## Testing

The integration includes comprehensive tests for all components:

- `StoreList.test.tsx`: Tests for store list rendering and interactions
- `StoreDetails.test.tsx`: Tests for store details and product filtering
- `ProductCard.test.tsx`: Tests for product card rendering and interactions

Run tests with:
```bash
npm test
```

## Error Handling

The integration includes robust error handling:

1. API Errors
   - Network errors
   - Invalid responses
   - Server errors

2. State Management Errors
   - Invalid data
   - Missing required fields
   - Type mismatches

3. UI Error States
   - Loading states
   - Error messages
   - Empty states

## Performance Considerations

1. Data Caching
   - Store data is cached in Redux store
   - Product data is cached per store
   - Inventory data is cached per store

2. Pagination
   - Store search results are paginated
   - Product lists are paginated
   - Inventory data is loaded on demand

3. Image Optimization
   - Product images are lazy loaded
   - Images are cached
   - Responsive image sizes

## Security

1. API Security
   - HTTPS for all API calls
   - API key authentication
   - Rate limiting

2. Data Validation
   - Zod schemas for runtime validation
   - TypeScript for compile-time validation
   - Input sanitization

## Accessibility

1. Screen Reader Support
   - Proper ARIA labels
   - Semantic HTML structure
   - Keyboard navigation

2. Visual Accessibility
   - High contrast text
   - Proper text scaling
   - Color blindness support

## Future Improvements

1. Features
   - Real-time inventory updates
   - Price history tracking
   - Store ratings and reviews
   - Shopping list integration

2. Performance
   - Offline support
   - Background sync
   - Image preloading
   - Infinite scrolling

3. UX
   - Store comparison
   - Price alerts
   - Sustainability insights
   - Shopping recommendations 