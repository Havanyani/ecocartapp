# Services

## Overview
This directory contains service modules that handle core business logic, data management, API communication, and other essential operations for the EcoCart application. Services are designed to be reusable, testable, and independent of UI components.

## Service Modules

### API Services
- **ApiClient.ts** - Core API client with request/response interceptors and error handling
- **ApiService.ts** - Service for communicating with backend APIs

### Storage Services
- **EnhancedStorageService.ts** - Platform-optimized storage service with a consistent API
- **CacheService.ts** - Manages in-memory caching for frequently accessed data

### Offline Services
- **OfflineManager.ts** - Coordinates offline operations, manages queue, and handles network state changes
- **SyncService.ts** - Manages synchronization of pending operations when network is available
- **ConflictResolution.ts** - Resolves conflicts between local and remote data during synchronization

### Authentication Services
- **AuthService.ts** - Handles user authentication and session management

### Feature-Specific Services
- **PaymentService.ts** - Manages payment processing and transactions
- **NotificationService.ts** - Handles push notifications and in-app messaging
- **LocationService.ts** - Provides geolocation services and address management

## Offline Services Architecture

The offline capabilities in EcoCart are built on three main services:

### OfflineManager
The central service that orchestrates offline operations, with key responsibilities:
- Tracking network connectivity using NetInfo
- Managing a queue of operations to be performed when online
- Caching data for offline access using AsyncStorage
- Coordinating with SyncService for synchronization

```typescript
// Example usage of OfflineManager
import { offlineManager } from '@/services/OfflineManager';

// Execute an operation with offline support
const result = await offlineManager.executeWithOfflineHandling({
  entityType: 'collection',
  operation: 'create',
  data: newCollection,
  apiCall: () => api.collections.create(newCollection)
});
```

### SyncService
Handles the process of synchronizing data with the server, with key responsibilities:
- Processing the operation queue when online
- Managing retry logic for failed operations
- Detecting and handling conflicts
- Tracking synchronization statistics

```typescript
// Example usage of SyncService
import { syncService } from '@/services/SyncService';

// Manually trigger synchronization
await syncService.triggerSync('manual');

// Get pending actions
const pendingActions = syncService.getPendingActions();
```

### ConflictResolution
Specialized service for resolving conflicts when local and remote data have diverged:
- Implements various strategies for resolving conflicts
- Provides entity-specific merge logic
- Supports custom merge functions for complex data types

```typescript
// Example usage of ConflictResolution
import { 
  ConflictResolution, 
  ResolutionStrategy 
} from '@/services/ConflictResolution';

// Register a custom merge function
ConflictResolution.registerMergeFunction('collection', 
  (local, remote) => {
    // Custom merge logic
    return {
      ...remote,
      items: [...local.items, ...remote.items]
    };
  }
);

// Resolve a conflict
const resolvedData = ConflictResolution.resolveConflict(
  'collection',
  localData,
  remoteData,
  ResolutionStrategy.SMART_MERGE
);
```

## Service Patterns

Services in EcoCart follow these design patterns:

1. **Singleton Pattern** - Many services use the singleton pattern to ensure a single instance throughout the app
2. **Dependency Injection** - Services accept dependencies via constructors or initialization methods
3. **Observer Pattern** - Services use event listeners and callbacks to notify about state changes
4. **Facade Pattern** - Higher-level services often wrap multiple lower-level services

## Testing Services

Services are thoroughly tested with unit and integration tests:
- Unit tests for individual service methods
- Integration tests for service interactions
- Mock implementations for external dependencies

## Related Documentation
- [API Integration Guide](../docs/data-management-guide.md)
- [Authentication Guide](../docs/authentication-guide.md)
- [Storage Guide](../docs/storage-guide.md)
- [Offline Capabilities Guide](../docs/offline-capabilities-guide.md) 