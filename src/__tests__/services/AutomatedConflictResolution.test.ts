/**
 * AutomatedConflictResolution.test.ts
 * 
 * Tests specifically focused on automated conflict resolution,
 * verifying that conflicts are automatically resolved according
 * to the configured strategies without user intervention.
 */

import { ConflictResolution, ResolutionStrategy } from '@/services/ConflictResolution';
import { OfflineManager } from '@/services/OfflineManager';

// Create mock interfaces
interface OfflineStorageServiceMock {
  getCachedData: jest.Mock;
  cacheData: jest.Mock;
  removeCachedData: jest.Mock;
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
    getEntityTimestamp: jest.fn(),
  }
}));

jest.mock('@react-native-community/netinfo', () => ({
  addEventListener: jest.fn(() => ({ remove: jest.fn() })),
  fetch: jest.fn().mockResolvedValue({ isConnected: true })
}));

// Define test entity interface
interface TestData {
  id: string;
  content: string;
  version: number;
  lastModified: number;
}

describe('Automated Conflict Resolution', () => {
  let offlineManager: OfflineManager;
  let offlineStorageServiceMock: OfflineStorageServiceMock;
  let apiServiceMock: ApiServiceMock;
  
  // Setup mock entities for testing
  const localEntity: TestData = {
    id: 'test-1',
    content: 'Local content',
    version: 1,
    lastModified: 1000
  };
  
  const remoteEntity: TestData = {
    id: 'test-1',
    content: 'Remote content',
    version: 2,
    lastModified: 2000
  };
  
  beforeEach(() => {
    // Reset mocks
    jest.clearAllMocks();
    
    // Reset the instance
    (OfflineManager as any).instance = null;
    
    // Get fresh instance
    offlineManager = OfflineManager.getInstance();
    
    // Get references to mocks
    offlineStorageServiceMock = require('@/services/OfflineStorageService').offlineStorageService as OfflineStorageServiceMock;
    apiServiceMock = require('@/services/ApiService').ApiService.getInstance() as ApiServiceMock;
    
    // Mock the network as online
    (offlineManager as any).isOnline = jest.fn().mockReturnValue(true);
    
    // Setup default mock responses
    offlineStorageServiceMock.getCachedData.mockResolvedValue(localEntity);
    offlineStorageServiceMock.getEntityTimestamp.mockResolvedValue(localEntity.lastModified);
    apiServiceMock.get.mockResolvedValue({ data: remoteEntity });
  });
  
  test('should automatically resolve with LATEST_WINS strategy preferring remote when remote is newer', async () => {
    // Set the strategy to LATEST_WINS
    ConflictResolution.setDefaultStrategy(ResolutionStrategy.LATEST_WINS);
    
    // Ensure remote has later timestamp
    const remoteNewer = { ...remoteEntity, lastModified: 2000 };
    apiServiceMock.get.mockResolvedValue({ data: remoteNewer });
    
    // Execute sync
    const result = await (offlineManager as any).syncEntity('testData', 'test-1');
    
    // Verify result is from remote (since it's newer)
    expect(result).toEqual(remoteNewer);
    expect(offlineStorageServiceMock.cacheData).toHaveBeenCalledWith(
      'testData:test-1',
      remoteNewer,
      expect.any(Number)
    );
  });
  
  test('should automatically resolve with LATEST_WINS strategy preferring local when local is newer', async () => {
    // Set the strategy to LATEST_WINS
    ConflictResolution.setDefaultStrategy(ResolutionStrategy.LATEST_WINS);
    
    // Make local entity newer than remote
    const localNewer = { ...localEntity, lastModified: 3000 };
    offlineStorageServiceMock.getCachedData.mockResolvedValue(localNewer);
    offlineStorageServiceMock.getEntityTimestamp.mockResolvedValue(localNewer.lastModified);
    
    // Execute sync
    const result = await (offlineManager as any).syncEntity('testData', 'test-1');
    
    // Verify result is from local (since it's newer)
    expect(result).toEqual(localNewer);
    
    // Local data is retained (no call to cache the remote data)
    expect(offlineStorageServiceMock.cacheData).not.toHaveBeenCalledWith(
      'testData:test-1', 
      remoteEntity,
      expect.any(Number)
    );
    
    // API call should be made to update remote with local data
    expect(apiServiceMock.put).toHaveBeenCalledWith(
      expect.stringContaining('testData/test-1'),
      expect.objectContaining(localNewer),
      expect.any(Object)
    );
  });
  
  test('should automatically resolve with LOCAL_WINS strategy regardless of timestamp', async () => {
    // Set the strategy to LOCAL_WINS
    ConflictResolution.setDefaultStrategy(ResolutionStrategy.LOCAL_WINS);
    
    // Execute sync (remote is newer, but LOCAL_WINS should ignore that)
    const result = await (offlineManager as any).syncEntity('testData', 'test-1');
    
    // Verify result is from local (due to strategy)
    expect(result).toEqual(localEntity);
    
    // API call should be made to update remote with local data
    expect(apiServiceMock.put).toHaveBeenCalledWith(
      expect.stringContaining('testData/test-1'),
      expect.objectContaining(localEntity),
      expect.any(Object)
    );
  });
  
  test('should automatically resolve with REMOTE_WINS strategy regardless of timestamp', async () => {
    // Set the strategy to REMOTE_WINS
    ConflictResolution.setDefaultStrategy(ResolutionStrategy.REMOTE_WINS);
    
    // Make local entity newer than remote (which should be ignored due to REMOTE_WINS)
    const localNewer = { ...localEntity, lastModified: 3000 };
    offlineStorageServiceMock.getCachedData.mockResolvedValue(localNewer);
    offlineStorageServiceMock.getEntityTimestamp.mockResolvedValue(localNewer.lastModified);
    
    // Execute sync
    const result = await (offlineManager as any).syncEntity('testData', 'test-1');
    
    // Verify result is from remote (due to strategy)
    expect(result).toEqual(remoteEntity);
    
    // Verify remote data was cached locally
    expect(offlineStorageServiceMock.cacheData).toHaveBeenCalledWith(
      'testData:test-1',
      remoteEntity,
      expect.any(Number)
    );
  });
  
  test('should use custom merge function when MERGE strategy is selected', async () => {
    // Register custom merge function
    const mergedEntity = {
      id: 'test-1',
      content: 'Merged: Local + Remote',
      version: 3,
      lastModified: 3000
    };
    
    const mergeFn = jest.fn().mockReturnValue(mergedEntity);
    (offlineManager as any).registerMergeFunction('testData', mergeFn);
    
    // Set MERGE strategy
    ConflictResolution.setDefaultStrategy(ResolutionStrategy.MERGE);
    
    // Execute sync
    const result = await (offlineManager as any).syncEntity('testData', 'test-1');
    
    // Verify merge function was called with local and remote data
    expect(mergeFn).toHaveBeenCalledWith(localEntity, remoteEntity);
    
    // Verify merged result is returned and cached
    expect(result).toEqual(mergedEntity);
    expect(offlineStorageServiceMock.cacheData).toHaveBeenCalledWith(
      'testData:test-1',
      mergedEntity,
      expect.any(Number)
    );
    
    // Verify merged data is sent to API
    expect(apiServiceMock.put).toHaveBeenCalledWith(
      expect.stringContaining('testData/test-1'),
      expect.objectContaining(mergedEntity),
      expect.any(Object)
    );
  });
  
  test('should handle complex conflict scenario with deletion', async () => {
    // Set up local modified, remote deleted scenario
    apiServiceMock.get.mockRejectedValue({ response: { status: 404 } });
    
    // Set REMOTE_WINS strategy
    ConflictResolution.setDefaultStrategy(ResolutionStrategy.REMOTE_WINS);
    
    // Execute sync
    const result = await (offlineManager as any).syncEntity('testData', 'test-1');
    
    // With REMOTE_WINS, local entity should be deleted
    expect(result).toBeNull();
    expect(offlineStorageServiceMock.removeCachedData).toHaveBeenCalledWith(
      'testData:test-1'
    );
    
    // Reset mocks for another test
    jest.clearAllMocks();
    offlineStorageServiceMock.getCachedData.mockResolvedValue(localEntity);
    
    // Now test with LOCAL_WINS
    ConflictResolution.setDefaultStrategy(ResolutionStrategy.LOCAL_WINS);
    apiServiceMock.get.mockRejectedValue({ response: { status: 404 } });
    
    // Execute sync
    const result2 = await (offlineManager as any).syncEntity('testData', 'test-1');
    
    // With LOCAL_WINS, local entity should be preserved and sent to API
    expect(result2).toEqual(localEntity);
    expect(offlineStorageServiceMock.removeCachedData).not.toHaveBeenCalled();
    expect(apiServiceMock.post).toHaveBeenCalledWith(
      expect.stringContaining('testData'),
      expect.objectContaining(localEntity),
      expect.any(Object)
    );
  });
  
  test('should use different strategies for different entity types', async () => {
    // Setup different strategies for different entity types
    ConflictResolution.setDefaultStrategy(ResolutionStrategy.LATEST_WINS);
    
    // Create a specialized strategy map
    const strategyMap = new Map<string, ResolutionStrategy>();
    strategyMap.set('important', ResolutionStrategy.LOCAL_WINS);
    strategyMap.set('temporary', ResolutionStrategy.REMOTE_WINS);
    
    // Register the strategy map with the conflict resolution service
    (ConflictResolution as any).entityStrategies = strategyMap;
    
    // Test with 'important' entity - should use LOCAL_WINS
    const result1 = await (offlineManager as any).syncEntity('important', 'test-1');
    
    // Should use local data due to entity-specific strategy
    expect(result1).toEqual(localEntity);
    expect(apiServiceMock.put).toHaveBeenCalledWith(
      expect.stringContaining('important/test-1'),
      expect.objectContaining(localEntity),
      expect.any(Object)
    );
    
    // Reset mocks
    jest.clearAllMocks();
    offlineStorageServiceMock.getCachedData.mockResolvedValue(localEntity);
    apiServiceMock.get.mockResolvedValue({ data: remoteEntity });
    
    // Test with 'temporary' entity - should use REMOTE_WINS
    const result2 = await (offlineManager as any).syncEntity('temporary', 'test-1');
    
    // Should use remote data due to entity-specific strategy
    expect(result2).toEqual(remoteEntity);
    expect(offlineStorageServiceMock.cacheData).toHaveBeenCalledWith(
      'temporary:test-1',
      remoteEntity,
      expect.any(Number)
    );
  });
  
  test('should handle network errors gracefully with fallback to local data', async () => {
    // Simulate network error
    apiServiceMock.get.mockRejectedValue(new Error('Network error'));
    
    // Execute sync
    const result = await (offlineManager as any).syncEntity('testData', 'test-1');
    
    // Should use local data as fallback
    expect(result).toEqual(localEntity);
    
    // No changes to local storage
    expect(offlineStorageServiceMock.cacheData).not.toHaveBeenCalled();
    expect(offlineStorageServiceMock.removeCachedData).not.toHaveBeenCalled();
  });
}); 