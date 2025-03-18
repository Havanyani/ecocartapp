/**
 * OfflineManager.test.ts
 * 
 * Unit tests for the OfflineManager service
 */

import { ConflictResolution, ResolutionStrategy } from '../../services/ConflictResolution';
import { OfflineManager } from '../../services/OfflineManager';

// Mock dependencies
jest.mock('../../services/OfflineStorageService');
jest.mock('../../services/SyncService');
jest.mock('../../services/ConflictResolution');
jest.mock('@react-native-community/netinfo', () => ({
  addEventListener: jest.fn(() => ({ remove: jest.fn() })),
  fetch: jest.fn().mockResolvedValue({ isConnected: true })
}));
jest.mock('react-native', () => ({
  AppState: {
    addEventListener: jest.fn(() => ({ remove: jest.fn() }))
  },
  Platform: {
    OS: 'ios'
  }
}));

describe('OfflineManager', () => {
  let offlineManager: OfflineManager;
  
  // Setup before each test
  beforeEach(() => {
    // Clear all mocks
    jest.clearAllMocks();
    
    // Reset the instance
    (OfflineManager as any).instance = null;
    
    // Get a fresh instance
    offlineManager = OfflineManager.getInstance();
  });
  
  test('getInstance should return a singleton instance', () => {
    const instance1 = OfflineManager.getInstance();
    const instance2 = OfflineManager.getInstance();
    
    expect(instance1).toBe(instance2);
  });
  
  test('should initialize network and app state listeners', async () => {
    // Mock the initialization methods
    const mockInitNetworkListener = jest.spyOn(
      offlineManager as any,
      'initNetworkListener'
    );
    const mockInitAppStateListener = jest.spyOn(
      offlineManager as any,
      'initAppStateListener'
    );
    
    // Call initialize
    await (offlineManager as any).initialize();
    
    // Verify calls
    expect(mockInitNetworkListener).toHaveBeenCalled();
    expect(mockInitAppStateListener).toHaveBeenCalled();
  });
  
  test('should handle network changes', async () => {
    // Setup
    const mockUpdateStatus = jest.spyOn(offlineManager as any, 'updateStatus');
    const mockProcessQueue = jest.spyOn(offlineManager as any, 'processOfflineQueue');
    
    // Simulate a network change to online
    await (offlineManager as any).handleNetworkChange({ isConnected: true });
    
    // Verify calls
    expect(mockUpdateStatus).toHaveBeenCalledWith('online');
    expect(mockProcessQueue).toHaveBeenCalled();
    
    // Reset mocks
    mockUpdateStatus.mockClear();
    mockProcessQueue.mockClear();
    
    // Simulate a network change to offline
    await (offlineManager as any).handleNetworkChange({ isConnected: false });
    
    // Verify status updated to offline but queue not processed
    expect(mockUpdateStatus).toHaveBeenCalledWith('offline');
    expect(mockProcessQueue).not.toHaveBeenCalled();
  });
  
  test('should execute operation with offline handling', async () => {
    // Mock methods
    const mockIsOnline = jest.fn();
    (offlineManager as any).isOnline = mockIsOnline;
    mockIsOnline.mockReturnValue(true);
    
    const mockSyncFn = jest.fn().mockResolvedValue({ success: true, data: { id: '123' } });
    
    // Call executeWithOfflineHandling with online status
    const result = await (offlineManager as any).executeWithOfflineHandling({
      entityType: 'collection',
      operation: 'create',
      syncFn: mockSyncFn,
      data: { name: 'Test Collection' }
    });
    
    // Verify sync function was called directly (online mode)
    expect(mockSyncFn).toHaveBeenCalled();
    expect(result).toEqual({ success: true, data: { id: '123' } });
    
    // Reset and test offline behavior
    mockIsOnline.mockReturnValue(false);
    mockSyncFn.mockClear();
    
    // Mock addToQueue
    const mockAddToQueue = jest.spyOn(offlineManager as any, 'addToQueue');
    mockAddToQueue.mockResolvedValue({ id: 'offline-123' });
    
    // Call executeWithOfflineHandling with offline status
    const offlineResult = await (offlineManager as any).executeWithOfflineHandling({
      entityType: 'collection',
      operation: 'create',
      syncFn: mockSyncFn,
      data: { name: 'Test Collection' }
    });
    
    // Verify operation was queued instead of executed
    expect(mockSyncFn).not.toHaveBeenCalled();
    expect(mockAddToQueue).toHaveBeenCalled();
    expect(offlineResult).toEqual({ id: 'offline-123', _offlineCreated: true });
  });
  
  test('should register and use merge functions for conflict resolution', async () => {
    // Mock conflict resolution
    const mockMergeFn = jest.fn((local, remote) => ({ ...local, ...remote, merged: true }));
    
    // Register merge function
    (offlineManager as any).registerMergeFunction('collection', mockMergeFn);
    
    // Mock resolveConflict to simulate conflict resolution
    const mockResolveConflict = jest.spyOn(ConflictResolution, 'resolveConflict');
    mockResolveConflict.mockResolvedValue({
      resolvedData: { id: '123', merged: true },
      shouldDelete: false,
      strategyUsed: ResolutionStrategy.MERGE
    });
    
    // Setup mock data for conflict
    const localData = { id: '123', name: 'Local', version: 1 };
    const remoteData = { id: '123', name: 'Remote', version: 2 };
    
    // Call the private resolveConflict method (we need to access it through the prototype)
    const result = await (offlineManager as any).resolveConflict(
      'collection',
      '123',
      localData,
      remoteData
    );
    
    // Verify ConflictResolution.resolveConflict was called with the right params
    expect(mockResolveConflict).toHaveBeenCalledWith(
      expect.objectContaining({
        type: expect.any(String),
        id: '123',
        localData,
        remoteData
      }),
      'collection'
    );
    
    // Verify result is as expected
    expect(result).toEqual({
      id: '123',
      merged: true
    });
  });
  
  test('should process offline queue when coming online', async () => {
    // Setup mock queue with two items
    (offlineManager as any).offlineQueue = [
      {
        id: 'op1',
        entityType: 'collection',
        operation: 'create',
        data: { name: 'Test 1' },
        timestamp: Date.now() - 1000
      },
      {
        id: 'op2',
        entityType: 'user',
        operation: 'update',
        data: { id: 'user1', name: 'Updated User' },
        timestamp: Date.now()
      }
    ];
    
    // Mock methods
    const mockExecuteOperation = jest.spyOn(offlineManager as any, 'executeOperation');
    mockExecuteOperation.mockResolvedValue({ success: true });
    
    const mockRemoveFromQueue = jest.spyOn(offlineManager as any, 'removeFromQueue');
    mockRemoveFromQueue.mockResolvedValue(undefined);
    
    // Process the queue
    await (offlineManager as any).processOfflineQueue();
    
    // Verify operations were executed in order (oldest first)
    expect(mockExecuteOperation).toHaveBeenCalledTimes(2);
    expect(mockExecuteOperation).toHaveBeenNthCalledWith(
      1,
      expect.objectContaining({ id: 'op1' })
    );
    expect(mockExecuteOperation).toHaveBeenNthCalledWith(
      2,
      expect.objectContaining({ id: 'op2' })
    );
    
    // Verify operations were removed from queue
    expect(mockRemoveFromQueue).toHaveBeenCalledTimes(2);
    expect(mockRemoveFromQueue).toHaveBeenNthCalledWith(1, 'op1');
    expect(mockRemoveFromQueue).toHaveBeenNthCalledWith(2, 'op2');
  });
  
  test('should handle failures in processing offline queue', async () => {
    // Setup mock queue with two items
    (offlineManager as any).offlineQueue = [
      {
        id: 'op1',
        entityType: 'collection',
        operation: 'create',
        data: { name: 'Test 1' },
        timestamp: Date.now(),
        retryCount: 0
      }
    ];
    
    // Mock methods to simulate failure
    const mockExecuteOperation = jest.spyOn(offlineManager as any, 'executeOperation');
    mockExecuteOperation.mockRejectedValue(new Error('Network error'));
    
    const mockUpdateQueueItem = jest.spyOn(offlineManager as any, 'updateQueueItem');
    mockUpdateQueueItem.mockResolvedValue(undefined);
    
    // Process the queue
    await (offlineManager as any).processOfflineQueue();
    
    // Verify operation was attempted
    expect(mockExecuteOperation).toHaveBeenCalledWith(
      expect.objectContaining({ id: 'op1' })
    );
    
    // Verify retry count was incremented
    expect(mockUpdateQueueItem).toHaveBeenCalledWith(
      'op1',
      expect.objectContaining({ retryCount: 1 })
    );
  });
  
  test('should subscribe to status changes', () => {
    // Create mock callback
    const mockCallback = jest.fn();
    
    // Subscribe to status changes
    const unsubscribe = (offlineManager as any).subscribeToStatusChanges(mockCallback);
    
    // Update status
    (offlineManager as any).updateStatus('syncing');
    
    // Verify callback was called
    expect(mockCallback).toHaveBeenCalledWith('syncing');
    
    // Unsubscribe
    unsubscribe();
    
    // Update status again
    (offlineManager as any).updateStatus('online');
    
    // Verify callback was not called again
    expect(mockCallback).toHaveBeenCalledTimes(1);
  });
}); 