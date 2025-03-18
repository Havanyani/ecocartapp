/**
 * OfflineStorageService.test.ts
 * 
 * Unit tests for the OfflineStorageService
 */

import AsyncStorage from '@react-native-async-storage/async-storage';
// Using a type-only import for SQLite to avoid errors when the module is mocked
import { offlineStorageService } from '../../services/OfflineStorageService';

// Mock the dependencies
jest.mock('@react-native-async-storage/async-storage', () => ({
  getItem: jest.fn(),
  setItem: jest.fn(),
  removeItem: jest.fn(),
  getAllKeys: jest.fn(),
  multiGet: jest.fn()
}));

jest.mock('expo-sqlite', () => {
  // Create a mock database object
  const mockDb = {
    transaction: jest.fn(),
    exec: jest.fn()
  };
  
  // Mock transaction methods
  const mockTx = {
    executeSql: jest.fn()
  };
  
  // Setup transaction function to call the callback with mockTx
  mockDb.transaction.mockImplementation((callback) => {
    callback(mockTx);
    return {
      then: jest.fn((onSuccess) => {
        onSuccess();
        return { catch: jest.fn() };
      })
    };
  });
  
  // Return mock SQLite.openDatabase
  return {
    openDatabase: jest.fn().mockReturnValue(mockDb)
  };
});

describe('OfflineStorageService', () => {
  // Reference to the mock transaction object
  let mockTx: { executeSql: jest.Mock };
  
  beforeEach(() => {
    // Clear all mocks
    jest.clearAllMocks();
    
    // Reset the service
    (offlineStorageService as any).db = null;
    (offlineStorageService as any).initialized = false;
    
    // Get reference to the mock transaction
    const mockDb = require('expo-sqlite').openDatabase('');
    mockTx = mockDb.transaction.mock.calls[0][0].mock.calls[0][0];
  });
  
  test('should initialize database and create tables', async () => {
    // Call initialize
    await (offlineStorageService as any).init();
    
    // Verify database was opened
    const SQLite = require('expo-sqlite');
    expect(SQLite.openDatabase).toHaveBeenCalledWith('ecocart_offline.db');
    
    // Verify transaction was created
    const mockDb = SQLite.openDatabase('');
    expect(mockDb.transaction).toHaveBeenCalled();
    
    // Verify tables were created with executeSql
    const mockTx = mockDb.transaction.mock.calls[0][0];
    
    // Check that the SQL for creating tables was executed
    expect(mockTx.executeSql).toHaveBeenCalledWith(
      expect.stringContaining('CREATE TABLE IF NOT EXISTS'),
      [],
      expect.any(Function),
      expect.any(Function)
    );
    
    // Verify initialized flag was set
    expect((offlineStorageService as any).initialized).toBe(true);
  });
  
  test('should store and retrieve entity data', async () => {
    // Mock the transaction executeSql to return row data
    const mockExecuteSql = jest.fn();
    mockExecuteSql.mockImplementation((query, params, success) => {
      if (query.includes('SELECT')) {
        success(mockExecuteSql, {
          rows: {
            _array: [{ id: '123', data: JSON.stringify({ name: 'Test Entity' }), timestamp: 1000 }],
            length: 1
          }
        });
      } else {
        success(mockExecuteSql, { rowsAffected: 1, insertId: 1 });
      }
      return Promise.resolve();
    });
    
    // Set the mock transaction
    (offlineStorageService as any).db = {
      transaction: (callback: (tx: any) => void) => {
        callback({ executeSql: mockExecuteSql });
        return {
          then: (onSuccess: () => void) => {
            onSuccess();
            return { catch: jest.fn() };
          }
        };
      }
    };
    (offlineStorageService as any).initialized = true;
    
    // Store an entity
    await (offlineStorageService as any).cacheData('collection:123', { name: 'Test Entity' }, 1000);
    
    // Verify executeSql was called with INSERT or REPLACE
    expect(mockExecuteSql).toHaveBeenCalledWith(
      expect.stringContaining('INSERT OR REPLACE INTO'),
      expect.arrayContaining(['collection:123', JSON.stringify({ name: 'Test Entity' })]),
      expect.any(Function),
      expect.any(Function)
    );
    
    // Retrieve the entity
    const result = await (offlineStorageService as any).getCachedData('collection:123');
    
    // Verify executeSql was called with SELECT
    expect(mockExecuteSql).toHaveBeenCalledWith(
      expect.stringContaining('SELECT * FROM'),
      ['collection:123'],
      expect.any(Function),
      expect.any(Function)
    );
    
    // Verify returned data
    expect(result).toEqual({ name: 'Test Entity' });
  });
  
  test('should return null for non-existent entity', async () => {
    // Mock the transaction executeSql to return empty rows
    const mockExecuteSql = jest.fn();
    mockExecuteSql.mockImplementation((query, params, success) => {
      success(mockExecuteSql, {
        rows: {
          _array: [],
          length: 0
        }
      });
      return Promise.resolve();
    });
    
    // Set the mock transaction
    (offlineStorageService as any).db = {
      transaction: (callback: (tx: any) => void) => {
        callback({ executeSql: mockExecuteSql });
        return {
          then: (onSuccess: () => void) => {
            onSuccess();
            return { catch: jest.fn() };
          }
        };
      }
    };
    (offlineStorageService as any).initialized = true;
    
    // Retrieve a non-existent entity
    const result = await (offlineStorageService as any).getCachedData('collection:non-existent');
    
    // Verify executeSql was called with SELECT
    expect(mockExecuteSql).toHaveBeenCalledWith(
      expect.stringContaining('SELECT * FROM'),
      ['collection:non-existent'],
      expect.any(Function),
      expect.any(Function)
    );
    
    // Verify returned data is null
    expect(result).toBeNull();
  });
  
  test('should remove an entity', async () => {
    // Mock the transaction executeSql
    const mockExecuteSql = jest.fn();
    mockExecuteSql.mockImplementation((query, params, success) => {
      success(mockExecuteSql, { rowsAffected: 1 });
      return Promise.resolve();
    });
    
    // Set the mock transaction
    (offlineStorageService as any).db = {
      transaction: (callback: (tx: any) => void) => {
        callback({ executeSql: mockExecuteSql });
        return {
          then: (onSuccess: () => void) => {
            onSuccess();
            return { catch: jest.fn() };
          }
        };
      }
    };
    (offlineStorageService as any).initialized = true;
    
    // Remove an entity
    await (offlineStorageService as any).removeCachedData('collection:123');
    
    // Verify executeSql was called with DELETE
    expect(mockExecuteSql).toHaveBeenCalledWith(
      expect.stringContaining('DELETE FROM'),
      ['collection:123'],
      expect.any(Function),
      expect.any(Function)
    );
  });
  
  test('should retrieve all cached entities', async () => {
    // Mock the transaction executeSql to return multiple rows
    const mockExecuteSql = jest.fn();
    mockExecuteSql.mockImplementation((query, params, success) => {
      success(mockExecuteSql, {
        rows: {
          _array: [
            { 
              key: 'collection:123', 
              data: JSON.stringify({ name: 'Entity 1' }), 
              timestamp: 1000 
            },
            { 
              key: 'collection:456', 
              data: JSON.stringify({ name: 'Entity 2' }), 
              timestamp: 2000 
            }
          ],
          length: 2
        }
      });
      return Promise.resolve();
    });
    
    // Set the mock transaction
    (offlineStorageService as any).db = {
      transaction: (callback: (tx: any) => void) => {
        callback({ executeSql: mockExecuteSql });
        return {
          then: (onSuccess: () => void) => {
            onSuccess();
            return { catch: jest.fn() };
          }
        };
      }
    };
    (offlineStorageService as any).initialized = true;
    
    // Retrieve all entities with a prefix
    const results = await (offlineStorageService as any).getAllCachedDataWithPrefix('collection:');
    
    // Verify executeSql was called with SELECT
    expect(mockExecuteSql).toHaveBeenCalledWith(
      expect.stringContaining('SELECT * FROM'),
      ['collection:%'],
      expect.any(Function),
      expect.any(Function)
    );
    
    // Verify returned data
    expect(results).toEqual({
      'collection:123': { name: 'Entity 1' },
      'collection:456': { name: 'Entity 2' }
    });
  });
  
  test('should handle transaction errors', async () => {
    // Mock console.error to prevent test output pollution
    const originalConsoleError = console.error;
    console.error = jest.fn();
    
    // Mock the transaction to throw an error
    (offlineStorageService as any).db = {
      transaction: () => {
        return {
          then: () => {
            return {
              catch: (onError: (err: Error) => void) => {
                onError(new Error('Database error'));
              }
            };
          }
        };
      }
    };
    (offlineStorageService as any).initialized = true;
    
    // Expect the operation to reject
    await expect(
      (offlineStorageService as any).cacheData('collection:123', { name: 'Test' }, 1000)
    ).rejects.toThrow('Database error');
    
    // Restore console.error
    console.error = originalConsoleError;
  });
  
  test('should store operation in offline queue', async () => {
    // Mock AsyncStorage
    (AsyncStorage.getItem as jest.Mock).mockResolvedValue(
      JSON.stringify([
        { id: 'op1', entityType: 'collection', operation: 'update' }
      ])
    );
    
    // Mock initialized state
    (offlineStorageService as any).initialized = true;
    
    // Store operation
    await (offlineStorageService as any).addToQueue({
      id: 'op2',
      entityType: 'material',
      operation: 'create',
      data: { name: 'New Material' },
      timestamp: 1000
    });
    
    // Verify AsyncStorage was called to get and set queue
    expect(AsyncStorage.getItem).toHaveBeenCalledWith('ecocart:offlineQueue');
    expect(AsyncStorage.setItem).toHaveBeenCalledWith(
      'ecocart:offlineQueue',
      JSON.stringify([
        { id: 'op1', entityType: 'collection', operation: 'update' },
        { 
          id: 'op2', 
          entityType: 'material', 
          operation: 'create', 
          data: { name: 'New Material' }, 
          timestamp: 1000 
        }
      ])
    );
  });
  
  test('should get operations from offline queue', async () => {
    // Mock AsyncStorage to return queue
    (AsyncStorage.getItem as jest.Mock).mockResolvedValue(
      JSON.stringify([
        { 
          id: 'op1', 
          entityType: 'collection', 
          operation: 'update',
          data: { id: '123', status: 'pending' },
          timestamp: 1000
        },
        { 
          id: 'op2', 
          entityType: 'material', 
          operation: 'create',
          data: { name: 'New Material' },
          timestamp: 2000
        }
      ])
    );
    
    // Mock initialized state
    (offlineStorageService as any).initialized = true;
    
    // Get all operations
    const allOps = await (offlineStorageService as any).getQueuedOperations();
    
    // Verify AsyncStorage was called
    expect(AsyncStorage.getItem).toHaveBeenCalledWith('ecocart:offlineQueue');
    
    // Verify returned data
    expect(allOps).toEqual([
      { 
        id: 'op1', 
        entityType: 'collection', 
        operation: 'update',
        data: { id: '123', status: 'pending' },
        timestamp: 1000
      },
      { 
        id: 'op2', 
        entityType: 'material', 
        operation: 'create',
        data: { name: 'New Material' },
        timestamp: 2000
      }
    ]);
    
    // Get operations by type
    (AsyncStorage.getItem as jest.Mock).mockClear();
    (AsyncStorage.getItem as jest.Mock).mockResolvedValue(
      JSON.stringify([
        { 
          id: 'op1', 
          entityType: 'collection', 
          operation: 'update',
          data: { id: '123', status: 'pending' },
          timestamp: 1000
        },
        { 
          id: 'op2', 
          entityType: 'material', 
          operation: 'create',
          data: { name: 'New Material' },
          timestamp: 2000
        }
      ])
    );
    
    const collectionOps = await (offlineStorageService as any).getQueuedOperationsByType('collection');
    
    // Verify filtered results
    expect(collectionOps).toEqual([
      { 
        id: 'op1', 
        entityType: 'collection', 
        operation: 'update',
        data: { id: '123', status: 'pending' },
        timestamp: 1000
      }
    ]);
  });
}); 