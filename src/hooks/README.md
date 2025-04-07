# Hooks

This directory contains custom React hooks that provide reusable logic across components in the EcoCart application. These hooks follow React's design patterns and best practices for state management, side effects, and component lifecycle.

## Core Hooks

### useTheme
Hook for accessing and manipulating the current theme.
```tsx
const { theme, setTheme, isDark } = useTheme();
```

### useAppState
Hook for monitoring app state (active, background, inactive).
```tsx
const { appState, lastBackgroundedAt } = useAppState();
```

### useNetworkStatus
Hook for monitoring network connectivity and capabilities.
```tsx
const { isOnline, networkDetails, lastOnlineAt } = useNetworkStatus();
```

### usePermissions
Hook for requesting and checking permissions.
```tsx
const { requestPermission, hasPermission, checkPermission } = usePermissions('camera');
```

## Data Management Hooks

### useApi
Hook for making API requests with automatic loading and error states.
```tsx
const { data, isLoading, error, refetch } = useApi(() => api.getResource(id));
```

### useStorage
Hook for working with persistent storage.
```tsx
const { 
  getValue, 
  setValue, 
  removeValue, 
  clearAll 
} = useStorage('namespace');
```

### useOfflineData
Hook for working with offline data and synchronization in components. Integrates with OfflineManager and SyncService to provide a complete offline experience.

```tsx
const { 
  offlineStatus,
  isOffline,
  isOnline,
  isSyncing,
  pendingOperationsCount,
  executeOperation,
  forceSyncData,
  clearCache
} = useOfflineData();
```

Key features:
- Status indicators for offline mode, online mode, and sync status
- Integration with the offline operation queue
- Functions for executing API operations with offline support
- Manual synchronization controls
- Cache management utilities

Example usage:
```tsx
function CollectionForm() {
  const { isOffline, executeOperation } = useOfflineData();
  
  const handleSubmit = async (data) => {
    try {
      await executeOperation({
        entityType: 'collection',
        operation: 'create',
        data,
        apiCall: () => api.collections.create(data)
      });
      
      // Success handling
    } catch (error) {
      // Error handling
    }
  };
  
  return (
    <View>
      <Text>Status: {isOffline ? 'Offline Mode' : 'Online Mode'}</Text>
      <Button 
        title={isOffline ? "Save (will sync later)" : "Save"} 
        onPress={() => handleSubmit(formData)} 
      />
    </View>
  );
}
```

Refer to the [Offline Capabilities Guide](../docs/offline-capabilities-guide.md) for detailed documentation.

### useRealTimeUpdates
Hook for subscribing to real-time data updates.
```tsx
const { data, isConnected } = useRealTimeUpdates('collection', collectionId);
```

## UI Hooks

### useModal
Hook for managing modal state.
```tsx
const { isVisible, showModal, hideModal, toggleModal } = useModal();
```

### useForm
Hook for form state management with validation.
```tsx
const { values, errors, touched, handleChange, handleSubmit } = useForm({
  initialValues,
  validationSchema,
  onSubmit
});
```

### useAnimation
Hook for creating and controlling animations.
```tsx
const animation = useAnimation({
  type: 'fade',
  duration: 300,
  initialValue: 0
});
```

## Testing Hooks

Hooks can be tested using React Testing Library's `renderHook` function. Example:

```typescript
import { renderHook, act } from '@testing-library/react-hooks';
import { useOfflineData } from './useOfflineData';

test('useOfflineData should return correct initial state', () => {
  const { result } = renderHook(() => useOfflineData());
  
  expect(result.current.isOffline).toBe(false);
  expect(result.current.pendingOperationsCount).toBe(0);
});
```

## Best Practices

1. **Keep hooks focused** - Each hook should have a single responsibility
2. **Use TypeScript** - Define proper types for hook parameters and return values
3. **Naming convention** - Prefix hooks with `use` and use camelCase
4. **Handle cleanup** - Use useEffect's cleanup function to prevent memory leaks
5. **Error handling** - Implement robust error handling in hooks that work with external APIs 