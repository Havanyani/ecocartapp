# Offline Capabilities in EcoCart

This guide explains the offline capabilities implemented in the EcoCart application, including how to use them in your components and the architecture behind them.

## Table of Contents

1. [Overview](#overview)
2. [Architecture](#architecture)
3. [Using Offline Capabilities](#using-offline-capabilities)
4. [Handling Conflicts](#handling-conflicts)
5. [UI Components](#ui-components)
6. [Testing Offline Mode](#testing-offline-mode)
7. [Best Practices](#best-practices)

## Overview

The EcoCart app includes robust offline capabilities that allow users to continue working even when they have limited or no internet connectivity. The main features include:

- **Offline Data Persistence**: Data is cached locally for offline access
- **Offline Operations Queue**: Actions performed while offline are queued for later execution
- **Automatic Synchronization**: Queued operations are processed when connectivity is restored
- **Conflict Resolution**: Smart handling of conflicts between local and remote data
- **Visual Indicators**: Clear UI feedback about connectivity and sync status

## Architecture

The offline capabilities are built using several key components:

### OfflineManager

The central service responsible for coordinating offline operations, managing the cache, and determining when to execute operations online vs. offline.

Key responsibilities:
- Tracking network connectivity
- Managing the operation queue
- Caching data for offline use
- Coordinating synchronization

### SyncService

Handles the process of synchronizing pending operations with the server when connectivity is restored.

Key responsibilities:
- Processing the operation queue
- Handling retry logic
- Conflict detection

### ConflictResolution

Resolves conflicts between local and remote data when both have been modified.

Key responsibilities:
- Applying different conflict resolution strategies
- Smart merging of data
- Entity-specific conflict handling

### useOfflineData Hook

React hook that provides components with access to offline functionality.

## Using Offline Capabilities

### Basic Usage with useOfflineData Hook

The main way to integrate offline capabilities into your components is through the `useOfflineData` hook:

```tsx
import { useOfflineData } from '@/hooks/useOfflineData';

function MyComponent() {
  const { 
    isOffline,
    isOnline,
    offlineStatus,
    isSyncing,
    pendingOperationsCount,
    executeOperation,
    forceSyncData
  } = useOfflineData();

  // Component logic here
}
```

### Executing Operations with Offline Support

Use the `executeOperation` function to perform API operations that automatically handle offline scenarios:

```tsx
const handleSubmit = async () => {
  try {
    const result = await executeOperation({
      entityType: 'collection',
      operation: 'create',
      data: collectionData,
      apiCall: () => api.collections.create(collectionData)
    });
    
    // Handle success
  } catch (error) {
    // Handle error
  }
};
```

The `executeOperation` function will:
1. Execute the API call if online
2. Store the operation in the offline queue if offline
3. Cache the result for offline access

### Entity Types

The following entity types are supported for offline operations:

- `collection`: Recycling collections
- `user`: User profiles
- `impact`: Environmental impact data
- `material`: Recycling materials
- `achievement`: User achievements
- `challenge`: Environmental challenges
- `order`: Purchase orders
- `feedback`: User feedback

### Operation Types

The following operation types are supported:

- `create`: Creating new entities
- `update`: Updating existing entities
- `delete`: Deleting entities
- `query`: Retrieving data (only cached when online)

## Handling Conflicts

When changes are made both locally and on the server to the same data, conflicts can occur. The system uses several strategies to handle these:

### Resolution Strategies

- `LOCAL_WINS`: Always choose the local version
- `REMOTE_WINS`: Always choose the server version
- `LATEST_WINS`: Choose the most recently updated version
- `MERGE`: Combine both versions using entity-specific merge logic
- `SMART_MERGE`: Intelligently merge based on field-level changes

### Custom Merge Functions

For complex entities, you can register custom merge functions:

```tsx
import { offlineManager } from '@/services/OfflineManager';

// Register a merge function for collections
offlineManager.registerMergeFunction('collection', (local, remote) => {
  // Custom merge logic
  return {
    ...remote,
    items: [...local.items, ...remote.items.filter(item => 
      !local.items.some(localItem => localItem.id === item.id)
    )]
  };
});
```

## UI Components

### OfflineStatusIndicator

The `OfflineStatusIndicator` component provides visual feedback about the current connectivity and synchronization status:

```tsx
import OfflineStatusIndicator from '@/components/ui/OfflineStatusIndicator';

function App() {
  return (
    <View style={styles.container}>
      <OfflineStatusIndicator 
        position="top"
        showSyncButton={true}
        showPendingCount={true}
      />
      {/* Rest of your app */}
    </View>
  );
}
```

Props:
- `position`: 'top' or 'bottom'
- `showSyncButton`: Whether to display the manual sync button
- `showPendingCount`: Whether to display the count of pending operations
- `expandedByDefault`: Whether the detailed view should be expanded initially

## Testing Offline Mode

### Development Testing

To test offline capabilities during development:

1. Use Chrome DevTools in web mode to simulate offline status
2. Use airplane mode on physical devices
3. Use the Network Link Conditioner on iOS simulators

### Automated Testing

The `setupOfflineMode` and `setupOnlineMode` utilities can be used in tests:

```tsx
import { setupOfflineMode, setupOnlineMode } from '@/utils/testUtils';

describe('Offline Mode Tests', () => {
  beforeEach(() => {
    setupOfflineMode();
  });

  afterEach(() => {
    setupOnlineMode();
  });

  it('should queue operations when offline', async () => {
    // Test logic here
  });
});
```

## Best Practices

1. **Check Connectivity First**: Use `isOffline` to check if the device is offline before performing heavy operations

```tsx
const handleDataProcessing = () => {
  if (isOffline) {
    // Show message or fallback UI
    return;
  }
  
  // Proceed with operation
};
```

2. **Optimize for Offline Experience**: Pre-cache essential data when online

```tsx
useEffect(() => {
  if (isOnline) {
    // Prefetch and cache critical data
    executeOperation({
      entityType: 'material',
      operation: 'query',
      data: null,
      apiCall: () => api.materials.getAll()
    });
  }
}, [isOnline]);
```

3. **Provide Clear Feedback**: Always let users know when they're working offline

```tsx
<Button
  title={isOffline ? 'Save (Offline)' : 'Save'}
  onPress={handleSave}
/>
```

4. **Handle Large Data Carefully**: Be selective about what data is cached offline

```tsx
// Only cache essential fields for offline use
const essentialData = {
  id: fullData.id,
  name: fullData.name,
  status: fullData.status
  // Omit large fields like images, etc.
};
```

5. **Conflict Resolution**: Design your data structures to minimize conflicts

```tsx
// Use timestamps for all data to facilitate conflict resolution
const newCollection = {
  ...collectionData,
  createdAt: Date.now(),
  updatedAt: Date.now()
};
```

## Conclusion

The offline capabilities in EcoCart ensure that users can continue working regardless of network connectivity, providing a seamless experience even in challenging network environments. By following the patterns and practices outlined in this guide, you can leverage these capabilities to build robust features that work reliably in all conditions. 