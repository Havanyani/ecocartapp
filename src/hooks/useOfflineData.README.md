# useOfflineData Hook

## Overview

The `useOfflineData` hook is a powerful utility for implementing offline-first capabilities in EcoCart components. It provides a clean interface to the offline management system, including status information, operation execution, and synchronization controls.

## Import

```tsx
import { useOfflineData } from '@/hooks/useOfflineData';
```

## Return Value

The hook returns an object with the following properties and methods:

```typescript
interface UseOfflineDataReturn {
  // Status information
  offlineStatus: OfflineStatus;         // 'online' | 'offline' | 'syncing'
  isSyncing: boolean;                   // Whether sync is in progress
  isOffline: boolean;                   // Whether app is in offline mode
  isOnline: boolean;                    // Whether app is in online mode
  
  // Data for pending operations
  pendingOperationsCount: number;       // Count of operations waiting to sync
  pendingOperationsByType: Record<string, number>; // Count by entity type
  
  // Functions for offline data management
  executeOperation: <T>(params: {       // Execute operation with offline support
    entityType: EntityType;             // Type of entity being operated on
    operation: OperationType;           // 'create', 'update', 'delete', 'query'
    data: T;                            // Data for the operation
    entityId?: string;                  // Optional entity ID for updates/deletes
    apiCall?: () => Promise<T>;         // API call to execute when online
  }) => Promise<T>;
  
  forceSyncData: () => Promise<boolean>; // Manually trigger synchronization
  clearCache: () => Promise<void>;       // Clear cached data
  cacheExpired: (                       // Check if cache is expired
    lastUpdated: number | null,          
    ttl?: number                        // Time-to-live in milliseconds
  ) => boolean;
}
```

## Basic Usage

```tsx
function MyComponent() {
  const { 
    isOffline, 
    isOnline, 
    isSyncing, 
    pendingOperationsCount,
    executeOperation,
    forceSyncData
  } = useOfflineData();
  
  return (
    <View>
      <Text>
        Status: {isOffline ? 'Offline' : isOnline ? 'Online' : 'Syncing'}
      </Text>
      {pendingOperationsCount > 0 && (
        <Text>Pending operations: {pendingOperationsCount}</Text>
      )}
      <Button 
        title="Sync Now" 
        onPress={forceSyncData}
        disabled={!isOnline || isSyncing || pendingOperationsCount === 0}
      />
    </View>
  );
}
```

## Examples

### Creating Data with Offline Support

```tsx
function CreateCollectionForm() {
  const { executeOperation, isOffline } = useOfflineData();
  const [formData, setFormData] = useState({});
  
  const handleSubmit = async () => {
    try {
      await executeOperation({
        entityType: 'collection',
        operation: 'create',
        data: formData,
        apiCall: () => api.collections.create(formData)
      });
      
      // Success - clear form or navigate away
      navigation.goBack();
    } catch (error) {
      // Handle error
      Alert.alert('Error', error.message);
    }
  };
  
  return (
    <View>
      {/* Form fields */}
      <Button 
        title={isOffline ? "Save (Offline)" : "Save"} 
        onPress={handleSubmit} 
      />
    </View>
  );
}
```

### Updating Data with Offline Support

```tsx
function EditCollectionScreen({ route }) {
  const { id } = route.params;
  const { executeOperation } = useOfflineData();
  const [collection, setCollection] = useState(null);
  
  // Load collection data
  
  const handleUpdate = async (updates) => {
    try {
      const updatedCollection = await executeOperation({
        entityType: 'collection',
        operation: 'update',
        data: { ...collection, ...updates },
        entityId: id,
        apiCall: () => api.collections.update(id, { ...collection, ...updates })
      });
      
      setCollection(updatedCollection);
    } catch (error) {
      Alert.alert('Error', error.message);
    }
  };
  
  return (
    <View>
      {/* Edit form */}
    </View>
  );
}
```

### Fetching Data with Offline Fallback

```tsx
function MaterialsListScreen() {
  const { executeOperation, isOffline } = useOfflineData();
  const [materials, setMaterials] = useState([]);
  const [loading, setLoading] = useState(true);
  
  useEffect(() => {
    async function loadMaterials() {
      try {
        setLoading(true);
        const data = await executeOperation({
          entityType: 'material',
          operation: 'query',
          data: null,
          apiCall: () => api.materials.getAll()
        });
        
        setMaterials(data);
      } catch (error) {
        Alert.alert('Error', 'Could not load materials');
      } finally {
        setLoading(false);
      }
    }
    
    loadMaterials();
  }, []);
  
  return (
    <View>
      {isOffline && (
        <Text style={styles.offlineNote}>
          Viewing cached data in offline mode
        </Text>
      )}
      {loading ? (
        <ActivityIndicator />
      ) : (
        <FlatList 
          data={materials}
          keyExtractor={item => item.id}
          renderItem={({ item }) => <MaterialListItem material={item} />}
        />
      )}
    </View>
  );
}
```

### Manual Sync Control

```tsx
function SyncControlPanel() {
  const { 
    forceSyncData, 
    clearCache,
    isSyncing,
    isOnline, 
    pendingOperationsCount, 
    pendingOperationsByType 
  } = useOfflineData();
  
  const handleSync = async () => {
    const success = await forceSyncData();
    if (success) {
      Alert.alert('Success', 'All data synchronized successfully!');
    } else {
      Alert.alert('Warning', 'Some operations could not be synchronized');
    }
  };
  
  return (
    <View>
      <Text>Pending operations: {pendingOperationsCount}</Text>
      
      {Object.entries(pendingOperationsByType).map(([type, count]) => (
        <Text key={type}>
          {type}: {count}
        </Text>
      ))}
      
      <Button
        title="Force Sync"
        onPress={handleSync}
        disabled={!isOnline || isSyncing || pendingOperationsCount === 0}
      />
      
      <Button
        title="Clear Cache"
        onPress={clearCache}
        disabled={isSyncing}
      />
    </View>
  );
}
```

## Implementation Details

The `useOfflineData` hook is built on top of three core services:

1. **OfflineManager** - Manages offline operations queue and caching
2. **SyncService** - Handles synchronization when online
3. **ConflictResolution** - Resolves conflicts between local and server data

The hook initializes these services on first use and sets up subscribers to monitor status changes. When status changes occur, the hook updates its state values and notifies components.

## Best Practices

1. **Always provide an apiCall function** for operations that should be executed online
2. **Implement proper error handling** for offline operations
3. **Use the status indicators** to provide visual feedback to users
4. **Consider data consistency** when working with related entities
5. **Pre-cache important data** when online for better offline experience

## Related Documentation

For more detailed information, see:
- [Offline Capabilities Guide](../docs/offline-capabilities-guide.md)
- [Offline Architecture](../services/README.md#offline-services-architecture)
- [OfflineStatusIndicator Component](../components/ui/README.md#offlinestatusindicator) 