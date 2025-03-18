# Storage Components

This directory contains components for managing data persistence, offline storage, and data synchronization in the EcoCart application.

## Components

### StorageDashboard

Central component for managing storage settings and status.

```tsx
import { StorageDashboard } from './StorageDashboard';

<StorageDashboard
  showUsage={true}
  onClearCache={handleClear}
  enableSync={true}
/>
```

#### Features
- Storage usage stats
- Cache management
- Sync controls
- Data cleanup
- Status monitoring

### OfflineManager

Manages offline data access and synchronization.

```tsx
import { OfflineManager } from './OfflineManager';

<OfflineManager
  syncInterval={5000}
  onSyncComplete={handleSync}
  showStatus={true}
/>
```

#### Features
- Offline data access
- Background sync
- Conflict resolution
- Progress tracking
- Error recovery

### StorageMonitor

Monitors storage usage and performance.

```tsx
import { StorageMonitor } from './StorageMonitor';

<StorageMonitor
  showMetrics={true}
  onThresholdExceeded={handleAlert}
/>
```

#### Features
- Usage monitoring
- Performance metrics
- Alert thresholds
- Cleanup suggestions
- Health checks

## Data Types

### StorageMetrics
```typescript
interface StorageMetrics {
  totalSpace: number;
  usedSpace: number;
  cacheSize: number;
  offlineData: {
    size: number;
    lastSync: Date;
    items: number;
  };
  performance: {
    readSpeed: number;
    writeSpeed: number;
    syncSpeed: number;
  };
}
```

### SyncStatus
```typescript
interface SyncStatus {
  isOnline: boolean;
  lastSync: Date;
  pendingChanges: number;
  conflicts: {
    count: number;
    items: Array<{
      id: string;
      type: string;
      timestamp: Date;
    }>;
  };
  errors: Array<{
    code: string;
    message: string;
    timestamp: Date;
  }>;
}
```

### StorageConfig
```typescript
interface StorageConfig {
  syncEnabled: boolean;
  syncInterval: number;
  maxCacheSize: number;
  offlineRetention: number;
  compression: boolean;
  encryption: {
    enabled: boolean;
    algorithm: string;
  };
  priorities: {
    [key: string]: 'high' | 'medium' | 'low';
  };
}
```

## Best Practices

1. **Data Management**
   - Efficient storage
   - Regular cleanup
   - Version control
   - Data integrity
   - Privacy protection

2. **Sync Strategy**
   - Incremental sync
   - Conflict resolution
   - Retry mechanism
   - Background sync
   - Data validation

3. **Performance**
   - Compression
   - Batch operations
   - Cache strategy
   - Index optimization
   - Memory management

4. **Security**
   - Data encryption
   - Access control
   - Secure sync
   - Audit logging
   - Error handling

## Contributing

When adding new storage components:

1. Follow storage guidelines
2. Consider offline use
3. Add proper validation
4. Include error handling
5. Document features
6. Add test coverage

## Testing

1. **Unit Tests**
   - Test storage operations
   - Verify sync logic
   - Test compression
   - Validate encryption

2. **Integration Tests**
   - Test data flow
   - Verify sync process
   - Test offline mode
   - Validate recovery

3. **Performance Tests**
   - Test large datasets
   - Verify sync speed
   - Test concurrent ops
   - Measure impact

## Storage Guidelines

1. **Data Structure**
   - Clear organization
   - Efficient indexing
   - Version control
   - Data normalization
   - Type safety

2. **Sync Protocol**
   - Clear states
   - Error recovery
   - Progress tracking
   - Conflict handling
   - Data validation

3. **Security Measures**
   - Encryption at rest
   - Secure transfer
   - Access control
   - Data sanitization
   - Audit trails

## Error Handling

1. **Storage Errors**
   - Space limitations
   - Corruption detection
   - Recovery procedures
   - User notification
   - Logging strategy

2. **Sync Errors**
   - Network issues
   - Conflict detection
   - Version mismatch
   - Timeout handling
   - Retry strategy

3. **Data Validation**
   - Schema validation
   - Type checking
   - Integrity checks
   - Format validation
   - Size limits 