/**
 * SyncService.test.ts
 * 
 * Unit tests for the SyncService service
 */

import NetInfo from '@react-native-community/netinfo';
import { AppState } from 'react-native';
import { Storage } from '../../services/StorageService';
import { SyncService, SyncStats } from '../../services/SyncService';

// Mock dependencies
jest.mock('../../services/StorageService', () => ({
  Storage: {
    getObject: jest.fn(),
    setObject: jest.fn(),
    removeItem: jest.fn(),
    initSQLite: jest.fn().mockResolvedValue(undefined),
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

jest.mock('expo-notifications', () => ({
  scheduleNotificationAsync: jest.fn(),
  setNotificationHandler: jest.fn()
}));

describe('SyncService', () => {
  let syncService: SyncService;
  
  // Setup before each test
  beforeEach(() => {
    // Clear all mocks
    jest.clearAllMocks();
    
    // Reset the instance
    (SyncService as any).instance = null;
    
    // Setup mock for storage
    (Storage.getObject as jest.Mock).mockImplementation((key: string) => {
      if (key === 'ecocart:pendingActions') {
        return Promise.resolve([]);
      } else if (key === 'ecocart:syncStats') {
        return Promise.resolve(null);
      }
      return Promise.resolve(null);
    });
    
    // Get a fresh instance
    syncService = SyncService.getInstance();
  });
  
  test('getInstance should return a singleton instance', () => {
    const instance1 = SyncService.getInstance();
    const instance2 = SyncService.getInstance();
    
    expect(instance1).toBe(instance2);
  });
  
  test('should initialize correctly', async () => {
    // Call initialize (which is private, so we use any)
    await (syncService as any).initializeSyncService();
    
    // Verify storage initialization and loading of pending actions
    expect(Storage.initSQLite).toHaveBeenCalled();
    expect(Storage.getObject).toHaveBeenCalledWith('ecocart:pendingActions');
  });
  
  test('should add pending action to queue', async () => {
    // Mock Date.now for consistent testing
    const originalDateNow = Date.now;
    Date.now = jest.fn(() => 1234567890);
    
    // Setup empty sync queue
    (syncService as any).syncQueue = [];
    
    // Add a pending action
    const actionId = await syncService.addPendingAction({
      type: 'create',
      entityType: 'collection',
      data: { name: 'Test Collection' },
      priority: 'high'
    });
    
    // Verify action was added to queue
    expect((syncService as any).syncQueue.length).toBe(1);
    expect((syncService as any).syncQueue[0]).toEqual({
      id: expect.any(String),
      type: 'create',
      entityType: 'collection',
      data: { name: 'Test Collection' },
      priority: 'high',
      timestamp: 1234567890,
      retryCount: 0
    });
    
    // Verify actions were saved to storage
    expect(Storage.setObject).toHaveBeenCalledWith(
      'ecocart:pendingActions',
      (syncService as any).syncQueue
    );
    
    // Since we mocked NetInfo.fetch to return isConnected: true,
    // verify that a sync was triggered
    expect(NetInfo.fetch).toHaveBeenCalled();
    
    // Restore original Date.now
    Date.now = originalDateNow;
  });
  
  test('should prioritize actions by priority and timestamp', async () => {
    // Mock fixed timestamps for testing
    const time1 = 1000;
    const time2 = 2000;
    const time3 = 3000;
    
    // Setup empty sync queue
    (syncService as any).syncQueue = [];
    
    // Add actions with different priorities and timestamps
    (syncService as any).syncQueue.push({
      id: 'action1',
      type: 'create',
      entityType: 'collection',
      data: { name: 'Low Priority Old' },
      priority: 'low',
      timestamp: time1,
      retryCount: 0
    });
    
    (syncService as any).syncQueue.push({
      id: 'action2',
      type: 'update',
      entityType: 'user',
      data: { id: 'user1', name: 'High Priority New' },
      priority: 'high',
      timestamp: time3,
      retryCount: 0
    });
    
    (syncService as any).syncQueue.push({
      id: 'action3',
      type: 'create',
      entityType: 'material',
      data: { name: 'Medium Priority Middle' },
      priority: 'medium',
      timestamp: time2,
      retryCount: 0
    });
    
    // Add a new pending action (this should trigger a sort)
    await syncService.addPendingAction({
      type: 'create',
      entityType: 'feedback',
      data: { text: 'High Priority Old' },
      priority: 'high'
    });
    
    // Queue should be sorted by priority first, then timestamp
    const queue = (syncService as any).syncQueue;
    
    // First two should be high priority
    expect(queue[0].priority).toBe('high');
    expect(queue[1].priority).toBe('high');
    
    // Within same priority, older timestamps should come first
    if (queue[0].data.text === 'High Priority Old') {
      expect(queue[0].timestamp).toBeLessThan(queue[1].timestamp);
    } else {
      expect(queue[1].timestamp).toBeLessThan(queue[0].timestamp);
    }
    
    // Medium priority should come after high
    expect(queue[2].priority).toBe('medium');
    
    // Low priority should come last
    expect(queue[3].priority).toBe('low');
  });
  
  test('should trigger sync when app comes to foreground', () => {
    // Get the registered app state change handler
    const appStateHandler = (AppState.addEventListener as jest.Mock).mock.calls[0][1];
    
    // Mock triggerSync
    const mockTriggerSync = jest.fn().mockResolvedValue(true);
    (syncService as any).triggerSync = mockTriggerSync;
    
    // Set current state to background
    (syncService as any).appState = 'background';
    
    // Simulate app coming to foreground
    appStateHandler('active');
    
    // Verify triggerSync was called
    expect(mockTriggerSync).toHaveBeenCalledWith('app_foreground');
    
    // Verify app state was updated
    expect((syncService as any).appState).toBe('active');
  });
  
  test('should not trigger sync when app stays in same state', () => {
    // Get the registered app state change handler
    const appStateHandler = (AppState.addEventListener as jest.Mock).mock.calls[0][1];
    
    // Mock triggerSync
    const mockTriggerSync = jest.fn().mockResolvedValue(true);
    (syncService as any).triggerSync = mockTriggerSync;
    
    // Set current state to active
    (syncService as any).appState = 'active';
    
    // Simulate app staying active
    appStateHandler('active');
    
    // Verify triggerSync was not called
    expect(mockTriggerSync).not.toHaveBeenCalled();
    
    // Verify app state was updated
    expect((syncService as any).appState).toBe('active');
  });
  
  test('should get and update sync stats', async () => {
    // Mock the default stats
    const defaultStats: SyncStats = {
      totalSyncs: 0,
      successfulSyncs: 0,
      failedSyncs: 0,
      lastSyncTimestamp: null,
      pendingActions: 0,
      lastError: null
    };
    
    // Mock Storage.getObject to return null (forcing default)
    (Storage.getObject as jest.Mock).mockReturnValueOnce(null);
    
    // Get sync stats
    const initialStats = await syncService.getSyncStats();
    
    // Verify default stats are returned
    expect(initialStats).toEqual(defaultStats);
    
    // Update some stats
    await (syncService as any).updateSyncStats({
      totalSyncs: 1,
      successfulSyncs: 1,
      lastSyncTimestamp: 1234567890
    });
    
    // Verify storage was updated
    expect(Storage.setObject).toHaveBeenCalledWith(
      'ecocart:syncStats',
      {
        ...defaultStats,
        totalSyncs: 1,
        successfulSyncs: 1,
        lastSyncTimestamp: 1234567890
      }
    );
  });
  
  test('should handle sync failure', async () => {
    // Mock methods
    (syncService as any).syncQueue = [
      {
        id: 'action1',
        type: 'create',
        entityType: 'collection',
        data: { name: 'Test Collection' },
        priority: 'high',
        timestamp: Date.now(),
        retryCount: 0
      }
    ];
    
    // Mock handleCreateAction to throw an error
    const mockHandleCreateAction = jest.fn().mockRejectedValue(new Error('API Error'));
    (syncService as any).handleCreateAction = mockHandleCreateAction;
    
    // Mock storage methods
    (Storage.getObject as jest.Mock).mockReturnValueOnce({
      totalSyncs: 1,
      successfulSyncs: 1,
      failedSyncs: 0,
      lastSyncTimestamp: 1000,
      pendingActions: 0,
      lastError: null
    });
    
    // Call triggerSync
    const result = await (syncService as any).triggerSync('test');
    
    // Verify error handling and stats update
    expect(result).toBe(false);
    expect(Storage.setObject).toHaveBeenCalledWith(
      'ecocart:syncStats',
      expect.objectContaining({
        totalSyncs: 2,
        successfulSyncs: 1,
        failedSyncs: 1,
        lastError: expect.stringContaining('API Error')
      })
    );
    
    // Verify the action stayed in the queue with incremented retryCount
    expect((syncService as any).syncQueue[0].retryCount).toBe(1);
  });
  
  test('should cleanup resources on cleanup call', () => {
    // Setup mocks
    const mockNetworkListener = { remove: jest.fn() };
    const mockAppStateSubscription = { remove: jest.fn() };
    (syncService as any).networkListener = mockNetworkListener;
    (syncService as any).appStateSubscription = mockAppStateSubscription;
    (syncService as any).syncInterval = 123;
    
    // Mock clearInterval
    const originalClearInterval = global.clearInterval;
    global.clearInterval = jest.fn();
    
    // Call cleanup
    syncService.cleanup();
    
    // Verify listeners and intervals were cleaned up
    expect(mockNetworkListener.remove).toHaveBeenCalled();
    expect(mockAppStateSubscription.remove).toHaveBeenCalled();
    expect(global.clearInterval).toHaveBeenCalledWith(123);
    
    // Restore original
    global.clearInterval = originalClearInterval;
  });
}); 