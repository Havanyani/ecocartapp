/**
 * SyncConflictResolution.test.ts
 * 
 * Integration tests for conflict resolution during synchronization.
 * Tests how SyncService, OfflineManager, and ConflictResolution
 * interact to handle data conflicts during sync operations.
 */

import { ConflictResolution, ConflictType, ResolutionStrategy } from '@/services/ConflictResolution';
import { OfflineManager } from '@/services/OfflineManager';
import { SyncService } from '@/services/SyncService';

// Create interface mocks to match the real services
interface OfflineStorageServiceMock {
  getCachedData: jest.Mock;
  cacheData: jest.Mock;
  removeCachedData: jest.Mock;
  getAllCachedDataWithPrefix: jest.Mock;
  getEntityTimestamp: jest.Mock;
}

interface ApiServiceMock {
  get: jest.Mock;
  post: jest.Mock;
  put: jest.Mock;
  delete: jest.Mock;
}

// Mock dependencies
jest.mock('@/services/ApiService', () => ({
  ApiService: {
    getInstance: jest.fn().mockReturnValue({
      get: jest.fn(),
      post: jest.fn(),
      put: jest.fn(),
      delete: jest.fn(),
    }),
  }
}));

jest.mock('@/services/OfflineStorageService', () => ({
  offlineStorageService: {
    getCachedData: jest.fn(),
    cacheData: jest.fn(),
    removeCachedData: jest.fn(),
    getAllCachedDataWithPrefix: jest.fn(),
    getEntityTimestamp: jest.fn(),
  }
}));

jest.mock('@react-native-community/netinfo', () => ({
  addEventListener: jest.fn(() => ({ remove: jest.fn() })),
  fetch: jest.fn().mockResolvedValue({ isConnected: true })
}));

jest.mock('react-native', () => ({
  AppState: {
    addEventListener: jest.fn(() => ({ remove: jest.fn() })),
    currentState: 'active'
  },
  Platform: {
    OS: 'ios'
  }
}));

// Create a mock type for entities that we'll use in tests
interface TestEntity {
  id: string;
  name: string;
  description?: string;
  version: number;
  updatedAt: number;
}

describe('Sync Conflict Resolution Integration', () => {
  let syncService: SyncService;
  let offlineManager: OfflineManager;
  let offlineStorageServiceMock: OfflineStorageServiceMock;
  let apiServiceMock: ApiServiceMock;
  
  beforeEach(() => {
    // Clear all mocks
    jest.clearAllMocks();
    
    // Reset the instances
    (SyncService as any).instance = null;
    (OfflineManager as any).instance = null;
    
    // Get fresh instances
    syncService = SyncService.getInstance();
    offlineManager = OfflineManager.getInstance();
    
    // Get references to mocks for easier access
    offlineStorageServiceMock = require('@/services/OfflineStorageService').offlineStorageService as OfflineStorageServiceMock;
    apiServiceMock = require('@/services/ApiService').ApiService.getInstance() as ApiServiceMock;
    
    // Set default conflict resolution strategy
    ConflictResolution.setDefaultStrategy(ResolutionStrategy.LATEST_WINS);
    
    // Mock the network as online
    (offlineManager as any).isOnline = jest.fn().mockReturnValue(true);
  });
  
  test('should detect and resolve conflicts during sync operation', async () => {
    // Mock entity data
    const localEntity: TestEntity = {
      id: 'entity-123',
      name: 'Local Name',
      description: 'Local description',
      version: 1,
      updatedAt: 1000
    };
    
    const remoteEntity: TestEntity = {
      id: 'entity-123',
      name: 'Remote Name',
      description: 'Remote description',
      version: 2,
      updatedAt: 2000
    };
    
    // Setup local cache with local version
    offlineStorageServiceMock.getCachedData.mockResolvedValue(localEntity);
    offlineStorageServiceMock.getEntityTimestamp.mockResolvedValue(localEntity.updatedAt);
    
    // Setup API to return remote version
    apiServiceMock.get.mockResolvedValue({ data: remoteEntity });
    
    // Mock the conflict resolution function
    const mockResolveConflict = jest.spyOn(ConflictResolution, 'resolveConflict');
    mockResolveConflict.mockResolvedValue({
      resolvedData: remoteEntity, // Remote wins because of later timestamp
      shouldDelete: false,
      strategyUsed: ResolutionStrategy.LATEST_WINS
    });
    
    // Execute the sync operation (via OfflineManager to test integration)
    const syncResult = await (offlineManager as any).syncEntity(
      'testEntity',
      'entity-123'
    );
    
    // Verify the conflict detection happened
    expect(mockResolveConflict).toHaveBeenCalledWith(
      expect.objectContaining({
        type: ConflictType.BOTH_MODIFIED,
        id: 'entity-123',
        localData: localEntity,
        remoteData: remoteEntity
      }),
      'testEntity'
    );
    
    // Verify that the resolved entity was saved to local storage
    expect(offlineStorageServiceMock.cacheData).toHaveBeenCalledWith(
      'testEntity:entity-123', 
      remoteEntity,
      expect.any(Number)
    );
    
    // Verify the sync result is the resolved entity
    expect(syncResult).toEqual(remoteEntity);
  });
  
  test('should handle deletion conflicts correctly', async () => {
    // Mock entity data - locally modified but remotely deleted
    const localEntity: TestEntity = {
      id: 'entity-456',
      name: 'Modified Locally',
      version: 1,
      updatedAt: 1000
    };
    
    // Setup local cache with local version
    offlineStorageServiceMock.getCachedData.mockResolvedValue(localEntity);
    offlineStorageServiceMock.getEntityTimestamp.mockResolvedValue(localEntity.updatedAt);
    
    // Setup API to return 404 (entity deleted remotely)
    apiServiceMock.get.mockRejectedValue({ response: { status: 404 } });
    
    // Mock the conflict resolution function for deletion
    const mockResolveConflict = jest.spyOn(ConflictResolution, 'resolveConflict');
    mockResolveConflict.mockResolvedValue({
      resolvedData: null,
      shouldDelete: true, // Should delete based on strategy
      strategyUsed: ResolutionStrategy.REMOTE_WINS
    });
    
    // Set strategy to remote wins
    ConflictResolution.setDefaultStrategy(ResolutionStrategy.REMOTE_WINS);
    
    // Execute the sync operation
    const syncResult = await (offlineManager as any).syncEntity(
      'testEntity',
      'entity-456'
    );
    
    // Verify the conflict detection happened with right type
    expect(mockResolveConflict).toHaveBeenCalledWith(
      expect.objectContaining({
        type: ConflictType.REMOTE_DELETED_LOCAL_MODIFIED,
        id: 'entity-456',
        localData: localEntity,
        remoteData: null
      }),
      'testEntity'
    );
    
    // Verify the local entity was deleted
    expect(offlineStorageServiceMock.removeCachedData).toHaveBeenCalledWith(
      'testEntity:entity-456'
    );
    
    // Verify the sync result is null
    expect(syncResult).toBeNull();
  });
  
  test('should use custom merge function for conflict resolution', async () => {
    // Mock entity data
    const localEntity: TestEntity = {
      id: 'entity-789',
      name: 'Local Name',
      description: 'Local description',
      version: 1,
      updatedAt: 1000
    };
    
    const remoteEntity: TestEntity = {
      id: 'entity-789',
      name: 'Remote Name',
      // No description on remote
      version: 2,
      updatedAt: 2000
    };
    
    // Setup local cache with local version
    offlineStorageServiceMock.getCachedData.mockResolvedValue(localEntity);
    offlineStorageServiceMock.getEntityTimestamp.mockResolvedValue(localEntity.updatedAt);
    
    // Setup API to return remote version
    apiServiceMock.get.mockResolvedValue({ data: remoteEntity });
    
    // Register custom merge function for testEntity
    const mockMergeFn = jest.fn((local: TestEntity, remote: TestEntity) => ({
      ...remote,
      description: local.description || remote.description, // Preserve local description if exists
      version: Math.max(local.version, remote.version) + 1,
      updatedAt: Date.now()
    }));
    
    // Register the merge function
    (offlineManager as any).registerMergeFunction('testEntity', mockMergeFn);
    
    // Set merge strategy
    ConflictResolution.setDefaultStrategy(ResolutionStrategy.MERGE);
    
    // Mock Date.now for consistent testing
    const originalDateNow = Date.now;
    Date.now = jest.fn(() => 3000);
    
    // Execute the sync operation
    const syncResult = await (offlineManager as any).syncEntity(
      'testEntity',
      'entity-789'
    );
    
    // Verify the merge function was called
    expect(mockMergeFn).toHaveBeenCalledWith(localEntity, remoteEntity);
    
    // Verify that the merged entity was saved to local storage
    expect(offlineStorageServiceMock.cacheData).toHaveBeenCalledWith(
      'testEntity:entity-789', 
      expect.objectContaining({
        id: 'entity-789',
        name: 'Remote Name',
        description: 'Local description',
        version: 3
      }),
      expect.any(Number)
    );
    
    // Verify the sync result includes the merged data
    expect(syncResult).toMatchObject({
      id: 'entity-789',
      name: 'Remote Name',
      description: 'Local description',
      version: 3
    });
    
    // Restore original Date.now
    Date.now = originalDateNow;
  });
  
  test('should sync multiple entities with concurrency control', async () => {
    // Mock list of entities to sync
    const entityKeys = [
      'testEntity:entity-1',
      'testEntity:entity-2',
      'testEntity:entity-3'
    ];
    
    // Setup getAllCachedDataWithPrefix to return entities
    offlineStorageServiceMock.getAllCachedDataWithPrefix.mockResolvedValue({
      'testEntity:entity-1': { id: 'entity-1', name: 'Entity 1', version: 1, updatedAt: 1000 },
      'testEntity:entity-2': { id: 'entity-2', name: 'Entity 2', version: 1, updatedAt: 1000 },
      'testEntity:entity-3': { id: 'entity-3', name: 'Entity 3', version: 1, updatedAt: 1000 }
    });
    
    // Mock API responses with different conflict scenarios
    
    // Entity 1: No conflict
    apiServiceMock.get.mockResolvedValueOnce({ data: { id: 'entity-1', name: 'Entity 1', version: 1, updatedAt: 1000 } });
    
    // Entity 2: Remote has newer version
    apiServiceMock.get.mockResolvedValueOnce({ data: { id: 'entity-2', name: 'Updated Entity 2', version: 2, updatedAt: 2000 } });
    
    // Entity 3: Remote returns 404 (deleted)
    apiServiceMock.get.mockRejectedValueOnce({ response: { status: 404 } });
    
    // Create spy for syncEntity
    const syncEntitySpy = jest.spyOn(offlineManager as any, 'syncEntity');
    
    // Execute the sync all entities operation
    await (offlineManager as any).syncAllEntities('testEntity');
    
    // Verify syncEntity was called for each entity
    expect(syncEntitySpy).toHaveBeenCalledTimes(3);
    expect(syncEntitySpy).toHaveBeenCalledWith('testEntity', 'entity-1');
    expect(syncEntitySpy).toHaveBeenCalledWith('testEntity', 'entity-2');
    expect(syncEntitySpy).toHaveBeenCalledWith('testEntity', 'entity-3');
  });
  
  test('should handle network errors gracefully during sync', async () => {
    // Setup local entity
    const localEntity: TestEntity = {
      id: 'entity-999',
      name: 'Network Error Test',
      version: 1,
      updatedAt: 1000
    };
    
    // Setup local cache
    offlineStorageServiceMock.getCachedData.mockResolvedValue(localEntity);
    
    // Simulate network error during API call
    apiServiceMock.get.mockRejectedValue(new Error('Network request failed'));
    
    // Execute the sync operation (should not throw)
    const syncResult = await (offlineManager as any).syncEntity(
      'testEntity',
      'entity-999'
    );
    
    // Verify the local entity was returned (no change)
    expect(syncResult).toEqual(localEntity);
    
    // Verify no cache updates happened
    expect(offlineStorageServiceMock.cacheData).not.toHaveBeenCalled();
    expect(offlineStorageServiceMock.removeCachedData).not.toHaveBeenCalled();
  });
}); 