# Data Management and API Integration Guide

This guide explains the data management and API integration system implemented in the EcoCart application.

## Architecture Overview

The data management system combines several key features:

1. **Enhanced API Client**: A wrapper around the base API service with advanced features like caching, request deduplication, and cancellation.
2. **Data Fetching Hooks**: React hooks for easy data fetching with caching, error handling, and state management.
3. **Redux Data Store**: A global state management solution for API data with normalized data structure.
4. **Type Definitions**: Comprehensive TypeScript interfaces for all data models.

## API Client

The API client (`src/api/ApiClient.ts`) extends the base API service with:

- **Caching**: Client-side caching of API responses to reduce network requests
- **Request Deduplication**: Prevention of duplicate requests
- **Request Cancellation**: Auto-cancellation of in-flight requests when components unmount
- **Enhanced Error Handling**: Comprehensive error types and handling
- **Performance Monitoring**: Integration with the app's performance monitoring system

Example usage:

```typescript
import apiClient from '@/api/ApiClient';

// Simple GET request with caching
const response = await apiClient.get('/materials');

// GET request with query parameters and cache control
const response = await apiClient.get('/materials', 
  { category: 'plastic' }, 
  { 
    cache: { expirationTime: 60 * 1000 }, // 1 minute cache
    forceRefresh: true // Skip cache and fetch from network
  }
);

// POST request
const newMaterial = await apiClient.post('/materials', {
  name: 'PET Plastic',
  category: 'plastic',
  recyclingRate: 0.75
});
```

## Data Fetching Hook

The `useApi` hook (`src/hooks/useApi.ts`) provides a React-friendly way to interact with the API with:

- **Automatic Loading State**: Tracks loading, error, and data states
- **Caching**: Built-in caching with stale-time configuration
- **Polling**: Configurable polling for real-time updates
- **Pagination**: Built-in support for paginated data
- **Retry Logic**: Automatic retry on network errors with exponential backoff
- **Dependency Control**: Fetch data based on dependencies (similar to React Query)

Example usage:

```typescript
import useApi from '@/hooks/useApi';

function MaterialsList({ category }) {
  const { 
    data, 
    loading, 
    error, 
    refetch 
  } = useApi(
    'GET',
    '/materials',
    { category },
    {
      cache: {
        staleTime: 5 * 60 * 1000, // 5 minutes
      },
      polling: {
        enabled: true,
        interval: 30000, // 30 seconds
      },
      dependencies: [category],
    }
  );

  if (loading) return <LoadingSpinner />;
  if (error) return <ErrorMessage error={error} />;

  return (
    <div>
      <button onClick={() => refetch()}>Refresh</button>
      <MaterialsGrid materials={data || []} />
    </div>
  );
}
```

## Redux Data Store

The Redux store (`src/store/slices/apiDataSlice.ts`) provides global state management for API data with:

- **Normalized Data Structure**: Efficient data storage with normalized entities
- **Optimistic Updates**: Support for optimistic UI updates
- **Selectors**: Helper functions to access the data

Example usage:

```typescript
import { useAppDispatch, useAppSelector } from '@/store';
import { 
  setMaterials, 
  selectMaterials,
  selectMaterialById 
} from '@/store/slices/apiDataSlice';

// In a component
function MaterialDetails({ id }) {
  const material = useAppSelector(state => selectMaterialById(state, id));
  
  // ...
}

// In a hook or thunk
const dispatch = useAppDispatch();
dispatch(setMaterials(materialsData));
```

## Data Models

Type definitions (`src/types/models.ts`) provide:

- **Type Safety**: Comprehensive interfaces for all data models
- **Code Completion**: Better developer experience with typed data
- **Documentation**: Self-documenting code with type annotations

Example:

```typescript
import { Material, CollectionRequest } from '@/types/models';

// Type-safe function
function calculateRecyclingImpact(material: Material, quantity: number): number {
  return material.recyclingRate * quantity;
}
```

## Custom Data Hooks

For specific resources, custom hooks combine the generic API hook with Redux for a complete data management solution:

- **Resource-Specific Logic**: Business logic for specific resources
- **Redux Integration**: Automatic syncing with Redux store
- **CRUD Operations**: Simplified Create, Read, Update, Delete operations

Example:

```typescript
import useMaterialsData from '@/hooks/useMaterialsData';

function MaterialsManager() {
  const {
    materials,
    loading,
    error,
    getMaterial,
    createMaterial,
    updateMaterial,
    deleteMaterial
  } = useMaterialsData({ limit: 50 });

  // Full CRUD operations available
  // ...
}
```

## Best Practices

1. **Use the Appropriate Tool**:
   - For global state, use Redux
   - For component-local data, use the `useApi` hook
   - For resource-specific operations, use the resource hooks (e.g., `useMaterialsData`)

2. **Error Handling**:
   - Always check for loading and error states
   - Implement retry logic for transient errors
   - Show appropriate error messages to users

3. **Performance Optimization**:
   - Leverage caching for frequently accessed data
   - Use pagination for large datasets
   - Implement optimistic updates for better user experience

4. **Offline Support**:
   - Handle offline scenarios gracefully
   - Use the cache for offline data access
   - Queue mutations for when the network is available again

5. **Data Validation**:
   - Validate API responses against expected types
   - Handle unexpected data formats gracefully
   - Use Zod or similar validation libraries for runtime validation

## Conclusion

This data management system provides a robust, type-safe, and efficient solution for handling API data in the EcoCart application. By leveraging modern React patterns, TypeScript, and Redux, it offers a great developer experience while ensuring good performance and reliability. 