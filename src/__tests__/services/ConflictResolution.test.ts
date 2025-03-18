/**
 * ConflictResolution.test.ts
 * 
 * Unit tests for the ConflictResolution service
 */

import ConflictResolution, {
    ConflictData,
    ConflictType,
    ResolutionResult,
    ResolutionStrategy
} from '../../services/ConflictResolution';

describe('ConflictResolution service', () => {
  // Mock data for testing
  const localData = { id: '123', name: 'Local Version', version: 1, updatedAt: 1000 };
  const remoteData = { id: '123', name: 'Remote Version', version: 2, updatedAt: 2000 };
  
  // Reset service state before each test
  beforeEach(() => {
    // Reset to default strategy
    ConflictResolution.setDefaultStrategy(ResolutionStrategy.LATEST_WINS);
    
    // Clear any registered merge functions
    // Note: In a real implementation, we would add a method to reset for testing
    (ConflictResolution as any).mergeFunctions = new Map();
    (ConflictResolution as any).manualResolutionFn = null;
  });
  
  test('should resolve with local wins strategy', async () => {
    // Create conflict data
    const conflict: ConflictData<any> = {
      type: ConflictType.BOTH_MODIFIED,
      id: '123',
      localData,
      localTimestamp: 1000,
      remoteData,
      remoteTimestamp: 2000
    };
    
    // Set strategy
    ConflictResolution.setDefaultStrategy(ResolutionStrategy.LOCAL_WINS);
    
    // Resolve conflict
    const result = await ConflictResolution.resolveConflict(conflict);
    
    // Should use local data
    expect(result.resolvedData).toEqual(localData);
    expect(result.shouldDelete).toBe(false);
    expect(result.strategyUsed).toBe(ResolutionStrategy.LOCAL_WINS);
  });
  
  test('should resolve with remote wins strategy', async () => {
    // Create conflict data
    const conflict: ConflictData<any> = {
      type: ConflictType.BOTH_MODIFIED,
      id: '123',
      localData,
      localTimestamp: 1000,
      remoteData,
      remoteTimestamp: 2000
    };
    
    // Set strategy
    ConflictResolution.setDefaultStrategy(ResolutionStrategy.REMOTE_WINS);
    
    // Resolve conflict
    const result = await ConflictResolution.resolveConflict(conflict);
    
    // Should use remote data
    expect(result.resolvedData).toEqual(remoteData);
    expect(result.shouldDelete).toBe(false);
    expect(result.strategyUsed).toBe(ResolutionStrategy.REMOTE_WINS);
  });
  
  test('should resolve with latest wins strategy', async () => {
    // Create conflict data
    const conflict: ConflictData<any> = {
      type: ConflictType.BOTH_MODIFIED,
      id: '123',
      localData,
      localTimestamp: 1000,
      remoteData,
      remoteTimestamp: 2000
    };
    
    // Set strategy
    ConflictResolution.setDefaultStrategy(ResolutionStrategy.LATEST_WINS);
    
    // Resolve conflict
    const result = await ConflictResolution.resolveConflict(conflict);
    
    // Should use remote data (later timestamp)
    expect(result.resolvedData).toEqual(remoteData);
    expect(result.shouldDelete).toBe(false);
    expect(result.strategyUsed).toBe(ResolutionStrategy.LATEST_WINS);
    
    // Test with local data being more recent
    const recentLocalConflict = {
      ...conflict,
      localTimestamp: 3000 // More recent than remote
    };
    
    const recentLocalResult = await ConflictResolution.resolveConflict(recentLocalConflict);
    
    // Should use local data (later timestamp)
    expect(recentLocalResult.resolvedData).toEqual(localData);
    expect(recentLocalResult.shouldDelete).toBe(false);
    expect(recentLocalResult.strategyUsed).toBe(ResolutionStrategy.LOCAL_WINS);
  });
  
  test('should resolve with merge strategy using custom merge function', async () => {
    // Create conflict data
    const conflict: ConflictData<any> = {
      type: ConflictType.BOTH_MODIFIED,
      id: '123',
      localData,
      localTimestamp: 1000,
      remoteData,
      remoteTimestamp: 2000
    };
    
    // Register custom merge function
    const mergedData = { 
      id: '123', 
      name: 'Merged Version', 
      version: 3, 
      updatedAt: 3000 
    };
    
    ConflictResolution.registerMergeFunction('testEntity', (local, remote) => {
      return mergedData;
    });
    
    // Set strategy
    ConflictResolution.setDefaultStrategy(ResolutionStrategy.MERGE);
    
    // Resolve conflict
    const result = await ConflictResolution.resolveConflict(conflict, 'testEntity');
    
    // Should use merged data
    expect(result.resolvedData).toEqual(mergedData);
    expect(result.shouldDelete).toBe(false);
    expect(result.strategyUsed).toBe(ResolutionStrategy.MERGE);
  });
  
  test('should fall back to latest wins if no merge function is available', async () => {
    // Create conflict data
    const conflict: ConflictData<any> = {
      type: ConflictType.BOTH_MODIFIED,
      id: '123',
      localData,
      localTimestamp: 1000,
      remoteData,
      remoteTimestamp: 2000
    };
    
    // Set strategy but don't register merge function
    ConflictResolution.setDefaultStrategy(ResolutionStrategy.MERGE);
    
    // Resolve conflict
    const result = await ConflictResolution.resolveConflict(conflict, 'unknownEntity');
    
    // Should fall back to latest wins (remote)
    expect(result.resolvedData).toEqual(remoteData);
    expect(result.shouldDelete).toBe(false);
    expect(result.strategyUsed).toBe(ResolutionStrategy.LATEST_WINS);
  });
  
  test('should handle manual resolution strategy', async () => {
    // Create conflict data
    const conflict: ConflictData<any> = {
      type: ConflictType.BOTH_MODIFIED,
      id: '123',
      localData,
      localTimestamp: 1000,
      remoteData,
      remoteTimestamp: 2000
    };
    
    // Mock manual resolution function
    const manualResult: ResolutionResult<any> = {
      resolvedData: { id: '123', name: 'Manual Resolution', version: 4 },
      shouldDelete: false,
      strategyUsed: ResolutionStrategy.MANUAL
    };
    
    ConflictResolution.setManualResolutionFunction(async () => manualResult);
    
    // Set strategy
    ConflictResolution.setDefaultStrategy(ResolutionStrategy.MANUAL);
    
    // Resolve conflict
    const result = await ConflictResolution.resolveConflict(conflict);
    
    // Should use manually resolved data
    expect(result).toEqual(manualResult);
  });
  
  test('should fall back to latest wins if no manual resolution function is set', async () => {
    // Create conflict data
    const conflict: ConflictData<any> = {
      type: ConflictType.BOTH_MODIFIED,
      id: '123',
      localData,
      localTimestamp: 1000,
      remoteData,
      remoteTimestamp: 2000
    };
    
    // Set strategy but don't set manual resolution function
    ConflictResolution.setDefaultStrategy(ResolutionStrategy.MANUAL);
    
    // Resolve conflict (should log a warning, but we're not testing that)
    const result = await ConflictResolution.resolveConflict(conflict);
    
    // Should fall back to latest wins (remote)
    expect(result.resolvedData).toEqual(remoteData);
    expect(result.shouldDelete).toBe(false);
    expect(result.strategyUsed).toBe(ResolutionStrategy.LATEST_WINS);
  });
  
  test('should use specific strategy for each conflict type', async () => {
    // Configure different strategies for different conflict types
    ConflictResolution.setStrategyForConflictType(
      ConflictType.BOTH_MODIFIED, 
      ResolutionStrategy.REMOTE_WINS
    );
    
    ConflictResolution.setStrategyForConflictType(
      ConflictType.LOCAL_DELETED_REMOTE_MODIFIED, 
      ResolutionStrategy.LOCAL_WINS
    );
    
    // Test BOTH_MODIFIED conflict
    const bothModifiedConflict: ConflictData<any> = {
      type: ConflictType.BOTH_MODIFIED,
      id: '123',
      localData,
      localTimestamp: 3000, // Later than remote
      remoteData,
      remoteTimestamp: 2000
    };
    
    const bothModifiedResult = await ConflictResolution.resolveConflict(bothModifiedConflict);
    
    // Should use remote data (because of REMOTE_WINS strategy for BOTH_MODIFIED)
    expect(bothModifiedResult.resolvedData).toEqual(remoteData);
    expect(bothModifiedResult.strategyUsed).toBe(ResolutionStrategy.REMOTE_WINS);
    
    // Test LOCAL_DELETED_REMOTE_MODIFIED conflict
    const localDeletedConflict: ConflictData<any> = {
      type: ConflictType.LOCAL_DELETED_REMOTE_MODIFIED,
      id: '123',
      localData: null, // Deleted locally
      localTimestamp: 3000,
      remoteData,
      remoteTimestamp: 2000
    };
    
    const localDeletedResult = await ConflictResolution.resolveConflict(localDeletedConflict);
    
    // Should delete (because of LOCAL_WINS strategy for LOCAL_DELETED_REMOTE_MODIFIED)
    expect(localDeletedResult.shouldDelete).toBe(true);
    expect(localDeletedResult.strategyUsed).toBe(ResolutionStrategy.LOCAL_WINS);
  });
  
  test('should handle deletion scenarios correctly', async () => {
    // Test local deleted, remote exists
    const localDeletedConflict: ConflictData<any> = {
      type: ConflictType.LOCAL_DELETED_REMOTE_MODIFIED,
      id: '123',
      localData: null,
      localTimestamp: 3000,
      remoteData,
      remoteTimestamp: 2000
    };
    
    // Set to remote wins
    ConflictResolution.setDefaultStrategy(ResolutionStrategy.REMOTE_WINS);
    
    const localDeletedResult = await ConflictResolution.resolveConflict(localDeletedConflict);
    
    // Should use remote data
    expect(localDeletedResult.resolvedData).toEqual(remoteData);
    expect(localDeletedResult.shouldDelete).toBe(false);
    
    // Test remote deleted, local exists
    const remoteDeletedConflict: ConflictData<any> = {
      type: ConflictType.REMOTE_DELETED_LOCAL_MODIFIED,
      id: '123',
      localData,
      localTimestamp: 1000,
      remoteData: null,
      remoteTimestamp: 2000
    };
    
    // Set to remote wins
    const remoteDeletedResult = await ConflictResolution.resolveConflict(remoteDeletedConflict);
    
    // Should delete
    expect(remoteDeletedResult.shouldDelete).toBe(true);
    expect(remoteDeletedResult.resolvedData).toBeNull();
    
    // Test both deleted
    const bothDeletedConflict: ConflictData<any> = {
      type: ConflictType.BOTH_DELETED,
      id: '123',
      localData: null,
      localTimestamp: 1000,
      remoteData: null,
      remoteTimestamp: 2000
    };
    
    const bothDeletedResult = await ConflictResolution.resolveConflict(bothDeletedConflict);
    
    // Should delete
    expect(bothDeletedResult.shouldDelete).toBe(true);
    expect(bothDeletedResult.resolvedData).toBeNull();
  });
}); 