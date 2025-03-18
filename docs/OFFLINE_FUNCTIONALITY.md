# EcoCart Offline Functionality Documentation

## Overview

The EcoCart app includes comprehensive offline functionality that enables users to continue using the app even without an internet connection. This document explains how the offline system works, how to implement it in components, and best practices for handling offline scenarios.

## Table of Contents

1. [Architecture](#architecture)
2. [Core Services](#core-services)
3. [React Hooks](#react-hooks)
4. [Conflict Resolution](#conflict-resolution)
5. [Testing Offline Scenarios](#testing-offline-scenarios)
6. [Implementation Guide](#implementation-guide)
7. [Best Practices](#best-practices)
8. [Troubleshooting](#troubleshooting)

## Architecture

The offline functionality is built on a layered architecture:

1. **Storage Layer**: Uses AsyncStorage as the underlying persistence mechanism.
2. **Service Layer**: LocalStorageService provides data validation, expiration, and synchronization.
3. **Hook Layer**: React hooks that provide easy-to-use interfaces for components.
4. **Component Layer**: UI components that handle online/offline states gracefully.

The synchronization system uses a queue-based approach where operations performed while offline are stored and executed when the connection is restored.

## Core Services

### LocalStorageService

The `LocalStorageService` is the foundation of our offline capabilities:

- **Data Persistence**: Stores and retrieves data with type safety.
- **Validation**: Ensures data integrity using validation schemas.
- **Expiration**: Supports automatic expiration of stale data.
- **Synchronization**: Manages the sync queue for offline operations.

```typescript
// Example usage
await LocalStorageService.setItem('materials', materialsList, {
  expiry: 24 * 60 * 60 * 1000, // 1 day
  validate: true,
  offlineSync: true
});
```

### ConflictResolution

The `ConflictResolution` service handles data conflicts that may occur during synchronization:

- **Conflict Detection**: Identifies different types of conflicts between local and remote data.
- **Resolution Strategies**: Provides multiple strategies for resolving conflicts.
- **Entity-specific Handling**: Supports custom merge functions for different entity types.

```typescript
// Example: Register a custom merge function for collections
ConflictResolution.registerMergeFunction('collections', (local, remote) => {
  // Custom merge logic
  return { ...remote, ...local };
});
```

## React Hooks

### useLocalStorage

The `useLocalStorage` hook provides a React interface to the LocalStorageService:

```typescript
const { 
  value: materials, 
  setValue: setMaterials,
  isLoading,
  error
} = useLocalStorage<Material[]>('materials', {
  defaultValue: [],
  expiry: 7 * 24 * 60 * 60 * 1000, // 1 week
  validate: true
});
```

### useSyncQueue

The `useSyncQueue` hook manages the synchronization queue for offline operations:

```typescript
const { 
  addToQueue, 
  removeFromQueue, 
  synchronize,
  queue,
  stats,
  isOnline,
  isSyncing
} = useSyncQueue();

// Add an operation to the sync queue
await addToQueue({
  action: 'create',
  endpoint: '/api/collections',
  data: newCollection,
  priority: 2,
  entityType: 'collections'
});
```

### useNetworkStatus

The `useNetworkStatus` hook monitors network connectivity:

```typescript
const { 
  isOnline, 
  networkDetails,
  checkConnection,
  canPerformOperation
} = useNetworkStatus();

// Check if a high-bandwidth operation can be performed
if (canPerformOperation('high')) {
  // Perform operation
}
```

### useOfflineForm

The `useOfflineForm` hook combines form handling with offline capabilities:

```typescript
const {
  formData,
  errors,
  isValid,
  isSubmitting,
  handleChange,
  submitForm,
  saveDraft,
  loadDraft
} = useOfflineForm<CollectionFormData>({
  formId: 'collection_form',
  initialData: initialFormData,
  validate: validateForm,
  endpoint: '/api/collections',
  priority: 2,
  onSuccess: (data, isOffline) => {
    // Handle success
  }
});
```

## Conflict Resolution

When data conflicts occur during synchronization, they are categorized into four types:

1. **Both Modified**: Both local and remote versions were modified.
2. **Local Deleted, Remote Modified**: Local data was deleted but remote was modified.
3. **Remote Deleted, Local Modified**: Remote data was deleted but local was modified.
4. **Both Deleted**: Both local and remote versions were deleted.

Resolution strategies include:

- **Local Wins**: Always use the local version.
- **Remote Wins**: Always use the remote version.
- **Latest Wins**: Use the most recently modified version.
- **Merge**: Combine the local and remote versions using a merge function.
- **Manual**: Ask the user to resolve the conflict.

## Testing Offline Scenarios

The `NetworkTester` utility allows you to simulate different network conditions for testing:

```typescript
// Enable offline condition
NetworkTester.enable(NetworkCondition.OFFLINE);

// Test a function with specific network condition
await runWithNetworkCondition(
  NetworkCondition.INTERMITTENT,
  async () => {
    // Code to test under intermittent connection
  }
);

// Disable network testing
NetworkTester.disable();
```

Available network conditions:
- `ONLINE`: Normal online connection.
- `OFFLINE`: No connection.
- `INTERMITTENT`: Connection that switches between online and offline.
- `SLOW`: Slow but stable connection.
- `VERY_SLOW`: Very slow but stable connection.

## Implementation Guide

### 1. Set Up Global Provider

Add the `OfflineStorageProvider` to your app:

```tsx
// In App.tsx
import OfflineStorageProvider from './providers/OfflineStorageProvider';

export default function App() {
  return (
    <SafeAreaProvider>
      <OfflineStorageProvider>
        <NavigationContainer>
          <AppNavigator />
        </NavigationContainer>
      </OfflineStorageProvider>
    </SafeAreaProvider>
  );
}
```

### 2. Use Local Storage in Components

```tsx
// Example component with local storage
function MaterialListScreen() {
  const { isOnline } = useNetworkStatus();
  
  const { 
    value: materials, 
    setValue: setMaterials,
    isLoading
  } = useLocalStorage<Material[]>('materials_data', {
    defaultValue: []
  });
  
  // Fetch data when online
  useEffect(() => {
    if (isOnline && (!materials || materials.length === 0)) {
      fetchMaterials().then(setMaterials);
    }
  }, [isOnline, materials]);
  
  // Render with offline awareness
  return (
    <View>
      {!isOnline && <Text>You are offline. Some data may be outdated.</Text>}
      {/* Render materials list */}
    </View>
  );
}
```

### 3. Create Offline-Aware Forms

```tsx
function CollectionForm() {
  const {
    formData,
    errors,
    isValid,
    isSubmitting,
    isOnline,
    handleChange,
    submitForm,
    saveDraft
  } = useOfflineForm<CollectionFormData>({
    formId: 'collection_form',
    initialData: initialFormData,
    validate: validateForm,
    endpoint: '/api/collections',
    onSuccess: () => {
      navigation.goBack();
    }
  });
  
  return (
    <View>
      {!isOnline && <Text>You are offline. Form will be submitted when online.</Text>}
      
      {/* Form fields */}
      <TextInput
        value={formData.title}
        onChangeText={(value) => handleChange('title', value)}
      />
      
      {/* Submit and save buttons */}
      <Button
        title={isOnline ? "Submit" : "Save for Later"}
        onPress={submitForm}
        disabled={!isValid || isSubmitting}
      />
      
      <Button
        title="Save Draft"
        onPress={() => saveDraft()}
      />
    </View>
  );
}
```

## Best Practices

1. **Show Network Status**: Always indicate network status to users.
2. **Optimize for Offline First**: Design components to work offline by default.
3. **Prioritize Synchronization**: Order sync operations by importance.
4. **Handle Conflicts Gracefully**: Use appropriate conflict resolution strategies.
5. **Validate Data**: Always validate data before storing it locally.
6. **Use Expiration**: Set appropriate expiration times for different types of data.
7. **Minimize Storage Usage**: Be mindful of storage limitations on mobile devices.
8. **Test Different Scenarios**: Regularly test with various network conditions.

## Troubleshooting

### Common Issues

1. **Sync Queue Not Processing**
   - Check if the network status is accurate.
   - Ensure the sync queue is not empty.
   - Verify that synchronization is not already in progress.

2. **Data Not Persisting Offline**
   - Check if the `LocalStorageService` is initialized.
   - Verify that the data was properly written to storage.
   - Ensure the storage key is consistent across reads and writes.

3. **Conflicts Not Resolving**
   - Check if the entity type is registered for custom merge functions.
   - Verify that the conflict type is correctly identified.
   - Ensure the resolution strategy is appropriate for the conflict type.

### Debugging Tools

1. **Network Monitor**: Use the `NetworkTester` to simulate different network conditions.
2. **Storage Inspector**: Check the content of AsyncStorage for debugging.

```typescript
// Example debugging code
console.log('Sync Queue:', await LocalStorageService.getItem('syncQueue'));
console.log('Network Status:', NetworkTester.isNetworkOnline());
```

---

For more information, refer to the API reference documentation for each service and hook. 