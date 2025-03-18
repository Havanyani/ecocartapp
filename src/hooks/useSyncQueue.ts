/**
 * useSyncQueue.ts
 * 
 * A React hook to manage the synchronization queue for offline data.
 * This hook provides methods to access and manipulate the sync queue,
 * check synchronization status, and trigger manual synchronization.
 */

import NetInfo from '@react-native-community/netinfo';
import { useCallback, useEffect, useState } from 'react';
import ConflictResolution, { ConflictData, ConflictType } from '@/services/ConflictResolution';
import LocalStorageService from '@/services/LocalStorageService';
import { PerformanceMonitor } from '@/utils/PerformanceMonitoring';

export interface SyncItem {
  id: string;
  action: 'create' | 'update' | 'delete';
  endpoint: string;
  data: any;
  timestamp: number;
  retryCount: number;
  priority: number;
  entityType?: string;
}

interface SyncStats {
  total: number;
  pending: number;
  completed: number;
  failed: number;
}

interface UseSyncQueueReturn {
  queue: SyncItem[];
  stats: SyncStats;
  isOnline: boolean;
  isSyncing: boolean;
  syncError: Error | null;
  addToQueue: (item: Omit<SyncItem, 'id' | 'timestamp' | 'retryCount'>) => Promise<void>;
  removeFromQueue: (id: string) => Promise<void>;
  synchronize: () => Promise<void>;
  clearQueue: () => Promise<void>;
}

/**
 * A hook for managing offline data synchronization queue
 */
export function useSyncQueue(): UseSyncQueueReturn {
  const [queue, setQueue] = useState<SyncItem[]>([]);
  const [isOnline, setIsOnline] = useState<boolean>(true);
  const [isSyncing, setIsSyncing] = useState<boolean>(false);
  const [syncError, setSyncError] = useState<Error | null>(null);
  
  // Calculate stats based on the current queue
  const stats: SyncStats = {
    total: queue.length,
    pending: queue.filter(item => item.retryCount === 0).length,
    completed: 0, // Will be updated from storage
    failed: queue.filter(item => item.retryCount > 2).length
  };

  // Load the queue from storage when the component mounts
  useEffect(() => {
    const loadQueue = async () => {
      try {
        // Ensure the storage service is initialized
        await LocalStorageService.initialize();
        
        // Get the queue from storage
        const storedQueue = await LocalStorageService.getItem<SyncItem[]>('syncQueue', {
          defaultValue: [],
          validate: true
        });
        
        // Get completed count
        const completedCount = await LocalStorageService.getItem<number>('syncCompletedCount', {
          defaultValue: 0,
          validate: false
        });
        
        setQueue(storedQueue || []);
        stats.completed = completedCount || 0;
      } catch (err) {
        const error = err instanceof Error 
          ? err 
          : new Error('Failed to load sync queue from storage');
        PerformanceMonitor.captureError(error);
        setSyncError(error);
      }
    };
    
    loadQueue();
  }, []);

  // Subscribe to network status changes
  useEffect(() => {
    const unsubscribe = NetInfo.addEventListener(state => {
      const newIsOnline = state.isConnected === true && state.isInternetReachable !== false;
      setIsOnline(newIsOnline);
      
      // Trigger sync when coming back online
      if (newIsOnline && queue.length > 0 && !isSyncing) {
        synchronize();
      }
    });
    
    return () => unsubscribe();
  }, [queue, isSyncing]);

  // Add an item to the sync queue
  const addToQueue = useCallback(async (
    item: Omit<SyncItem, 'id' | 'timestamp' | 'retryCount'>
  ) => {
    try {
      const newItem: SyncItem = {
        ...item,
        id: `sync_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
        timestamp: Date.now(),
        retryCount: 0
      };
      
      const updatedQueue = [...queue, newItem];
      setQueue(updatedQueue);
      
      await LocalStorageService.setItem('syncQueue', updatedQueue, {
        validate: true,
        offlineSync: false // Don't sync the sync queue itself
      });
      
      // If online, try to sync immediately
      if (isOnline && !isSyncing) {
        synchronize();
      }
    } catch (err) {
      const error = err instanceof Error 
        ? err 
        : new Error('Failed to add item to sync queue');
      PerformanceMonitor.captureError(error);
      setSyncError(error);
      throw error;
    }
  }, [queue, isOnline, isSyncing]);

  // Remove an item from the sync queue
  const removeFromQueue = useCallback(async (id: string) => {
    try {
      const updatedQueue = queue.filter(item => item.id !== id);
      setQueue(updatedQueue);
      
      await LocalStorageService.setItem('syncQueue', updatedQueue, {
        validate: true,
        offlineSync: false
      });
    } catch (err) {
      const error = err instanceof Error 
        ? err 
        : new Error('Failed to remove item from sync queue');
      PerformanceMonitor.captureError(error);
      setSyncError(error);
      throw error;
    }
  }, [queue]);

  // Process the sync queue
  const synchronize = useCallback(async () => {
    // Skip if offline or already syncing
    if (!isOnline || isSyncing || queue.length === 0) {
      return;
    }
    
    try {
      setIsSyncing(true);
      setSyncError(null);
      
      // Sort queue by priority (higher number = higher priority)
      const sortedQueue = [...queue].sort((a, b) => b.priority - a.priority);
      let completedCount = stats.completed;
      
      // Process each item in the queue
      for (const item of sortedQueue) {
        try {
          // Skip items that have failed too many times
          if (item.retryCount > 2) {
            continue;
          }
          
          // Process the item based on its action type
          console.log(`Processing sync item: ${item.id}, action: ${item.action}, endpoint: ${item.endpoint}`);
          
          // In a real app, this would make API calls
          switch (item.action) {
            case 'create':
              await processSyncCreate(item);
              break;
            case 'update':
              await processSyncUpdate(item);
              break;
            case 'delete':
              await processSyncDelete(item);
              break;
          }
          
          // If successful, remove the item from the queue
          await removeFromQueue(item.id);
          completedCount++;
        } catch (itemError) {
          const error = itemError instanceof Error 
            ? itemError 
            : new Error(`Failed to sync item: ${item.id}`);
          
          console.error('Sync error:', error.message);
          
          // Increment retry count on failure
          const updatedItem = { ...item, retryCount: item.retryCount + 1 };
          const updatedQueue = queue.map(i => 
            i.id === item.id ? updatedItem : i
          );
          
          setQueue(updatedQueue);
          await LocalStorageService.setItem('syncQueue', updatedQueue, {
            validate: true,
            offlineSync: false
          });
        }
      }
      
      // Update completed count
      await LocalStorageService.setItem('syncCompletedCount', completedCount, {
        validate: false,
        offlineSync: false
      });
      
    } catch (err) {
      const error = err instanceof Error 
        ? err 
        : new Error('Failed to synchronize data');
      PerformanceMonitor.captureError(error);
      setSyncError(error);
    } finally {
      setIsSyncing(false);
    }
  }, [queue, isOnline, isSyncing, removeFromQueue, stats.completed]);

  // Clear the entire sync queue
  const clearQueue = useCallback(async () => {
    try {
      setQueue([]);
      await LocalStorageService.setItem('syncQueue', [], {
        validate: true,
        offlineSync: false
      });
    } catch (err) {
      const error = err instanceof Error 
        ? err 
        : new Error('Failed to clear sync queue');
      PerformanceMonitor.captureError(error);
      setSyncError(error);
      throw error;
    }
  }, []);

  // Process a 'create' sync item
  const processSyncCreate = async (item: SyncItem) => {
    try {
      // Simulate API call
      const response = await simulateApiRequest('POST', item.endpoint, item.data);
      
      // In a real app, you might need to update local storage with the server response
      // if the server assigns IDs or other properties
      if (response && item.data.id) {
        await updateLocalData(item.endpoint, item.data.id, response);
      }
      
      return response;
    } catch (error) {
      console.error('Create sync error:', error);
      throw error;
    }
  };

  // Process an 'update' sync item
  const processSyncUpdate = async (item: SyncItem) => {
    try {
      // Fetch the current server version to check for conflicts
      let serverData = null;
      try {
        serverData = await simulateApiRequest('GET', `${item.endpoint}/${item.data.id}`);
      } catch (error) {
        // If the server returns 404, item was deleted on server
        if (error && typeof error === 'object' && 'status' in error && error.status === 404) {
          console.log(`Item with ID ${item.data.id} was deleted on the server`);
        } else {
          throw error;
        }
      }
      
      // Handle potential conflicts
      if (serverData) {
        // Check if server version is different from the base version used for local changes
        if (serverData.version !== item.data.baseVersion) {
          // We have a conflict - both local and server were modified
          const conflict: ConflictData<any> = {
            type: ConflictType.BOTH_MODIFIED,
            id: item.data.id,
            localData: item.data,
            localTimestamp: item.timestamp,
            remoteData: serverData,
            remoteTimestamp: serverData.updatedAt || Date.now()
          };
          
          // Resolve the conflict using our resolution service
          const resolution = await ConflictResolution.resolveConflict(
            conflict,
            item.entityType
          );
          
          if (resolution.shouldDelete) {
            // Delete the item if that's the resolution
            await simulateApiRequest('DELETE', `${item.endpoint}/${item.data.id}`);
            await deleteLocalData(item.endpoint, item.data.id);
          } else if (resolution.resolvedData) {
            // Update with the resolved data
            await simulateApiRequest('PUT', `${item.endpoint}/${item.data.id}`, resolution.resolvedData);
            await updateLocalData(item.endpoint, item.data.id, resolution.resolvedData);
          }
          
          return resolution.resolvedData;
        }
      } else {
        // Server item doesn't exist (was deleted)
        const conflict: ConflictData<any> = {
          type: ConflictType.REMOTE_DELETED_LOCAL_MODIFIED,
          id: item.data.id,
          localData: item.data,
          localTimestamp: item.timestamp,
          remoteData: null,
          remoteTimestamp: Date.now()
        };
        
        // Resolve the conflict
        const resolution = await ConflictResolution.resolveConflict(
          conflict,
          item.entityType
        );
        
        if (resolution.shouldDelete || !resolution.resolvedData) {
          // Keep it deleted
          await deleteLocalData(item.endpoint, item.data.id);
          return null;
        } else {
          // Recreate with local data
          await simulateApiRequest('POST', item.endpoint, resolution.resolvedData);
          await updateLocalData(item.endpoint, item.data.id, resolution.resolvedData);
          return resolution.resolvedData;
        }
      }
      
      // No conflict, proceed with update
      const response = await simulateApiRequest('PUT', `${item.endpoint}/${item.data.id}`, item.data);
      await updateLocalData(item.endpoint, item.data.id, response || item.data);
      
      return response;
    } catch (error) {
      console.error('Update sync error:', error);
      throw error;
    }
  };

  // Process a 'delete' sync item
  const processSyncDelete = async (item: SyncItem) => {
    try {
      // Check if the item still exists on the server
      let serverData = null;
      try {
        serverData = await simulateApiRequest('GET', `${item.endpoint}/${item.data.id}`);
      } catch (error) {
        // If 404, item is already deleted on server
        if (error && typeof error === 'object' && 'status' in error && error.status === 404) {
          console.log(`Item with ID ${item.data.id} already deleted on server`);
          return null;
        } else {
          throw error;
        }
      }
      
      // If server version was modified since our delete, we have a conflict
      if (serverData && serverData.version !== item.data.baseVersion) {
        const conflict: ConflictData<any> = {
          type: ConflictType.LOCAL_DELETED_REMOTE_MODIFIED,
          id: item.data.id,
          localData: null,
          localTimestamp: item.timestamp,
          remoteData: serverData,
          remoteTimestamp: serverData.updatedAt || Date.now()
        };
        
        // Resolve the conflict
        const resolution = await ConflictResolution.resolveConflict(
          conflict,
          item.entityType
        );
        
        if (resolution.shouldDelete) {
          // Delete on server
          await simulateApiRequest('DELETE', `${item.endpoint}/${item.data.id}`);
          await deleteLocalData(item.endpoint, item.data.id);
        } else if (resolution.resolvedData) {
          // Keep the server data
          await updateLocalData(item.endpoint, item.data.id, resolution.resolvedData);
        }
        
        return resolution.resolvedData;
      }
      
      // No conflict, proceed with delete
      await simulateApiRequest('DELETE', `${item.endpoint}/${item.data.id}`);
      await deleteLocalData(item.endpoint, item.data.id);
      
      return null;
    } catch (error) {
      console.error('Delete sync error:', error);
      throw error;
    }
  };

  // Utility function to simulate API requests
  const simulateApiRequest = async (method: string, endpoint: string, data?: any) => {
    // This is just a simulation - in a real app you would use fetch or axios
    await new Promise(resolve => setTimeout(resolve, 500));
    
    // 5% chance of simulated server error
    if (Math.random() < 0.05) {
      const error = new Error('Simulated server error');
      Object.assign(error, { status: 500 });
      throw error;
    }
    
    console.log(`[API] ${method} ${endpoint}`, data || '');
    
    // Return mock response based on method
    switch (method) {
      case 'GET':
        // Simulate getting data
        return { ...data, version: 1, updatedAt: Date.now() };
      case 'POST':
        // Simulate creating data
        return { ...data, id: data.id || `new_${Date.now()}`, version: 1, updatedAt: Date.now() };
      case 'PUT':
        // Simulate updating data
        return { ...data, version: (data.version || 0) + 1, updatedAt: Date.now() };
      case 'DELETE':
        // No response for delete
        return null;
      default:
        throw new Error(`Unsupported method: ${method}`);
    }
  };

  // Utility function to update local data
  const updateLocalData = async (endpoint: string, id: string, data: any) => {
    try {
      // Extract entity type from endpoint
      const entityType = endpoint.split('/')[1]; // e.g., '/api/collections' -> 'collections'
      
      // Update collection in local storage based on entity type
      switch (entityType) {
        case 'collections':
          await updateEntityCollection('collections', id, data);
          break;
        case 'materials':
          await updateEntityCollection('materials', id, data);
          break;
        case 'users':
          await updateEntityCollection('users', id, data);
          break;
        default:
          console.warn(`No local storage handler for entity type: ${entityType}`);
      }
    } catch (error) {
      console.error('Failed to update local data:', error);
      throw error;
    }
  };

  // Utility function to delete local data
  const deleteLocalData = async (endpoint: string, id: string) => {
    try {
      // Extract entity type from endpoint
      const entityType = endpoint.split('/')[1]; // e.g., '/api/collections' -> 'collections'
      
      // Delete from collection in local storage
      switch (entityType) {
        case 'collections':
          await deleteEntityFromCollection('collections', id);
          break;
        case 'materials':
          await deleteEntityFromCollection('materials', id);
          break;
        case 'users':
          await deleteEntityFromCollection('users', id);
          break;
        default:
          console.warn(`No local storage handler for entity type: ${entityType}`);
      }
    } catch (error) {
      console.error('Failed to delete local data:', error);
      throw error;
    }
  };

  // Helper to update an entity in a collection
  const updateEntityCollection = async (collectionKey: string, id: string, data: any) => {
    // Get current collection
    const collection = await LocalStorageService.getItem<any[]>(collectionKey, {
      defaultValue: [],
      validate: false
    });
    
    if (!collection) return;
    
    // Update or add the item
    const index = collection.findIndex(item => item.id === id);
    
    if (index >= 0) {
      // Update existing item
      collection[index] = { ...data };
    } else {
      // Add new item
      collection.push({ ...data });
    }
    
    // Save updated collection
    await LocalStorageService.setItem(collectionKey, collection, {
      validate: false,
      offlineSync: false
    });
  };

  // Helper to delete an entity from a collection
  const deleteEntityFromCollection = async (collectionKey: string, id: string) => {
    // Get current collection
    const collection = await LocalStorageService.getItem<any[]>(collectionKey, {
      defaultValue: [],
      validate: false
    });
    
    if (!collection) return;
    
    // Filter out the item to delete
    const updatedCollection = collection.filter(item => item.id !== id);
    
    // Save updated collection
    await LocalStorageService.setItem(collectionKey, updatedCollection, {
      validate: false,
      offlineSync: false
    });
  };

  return {
    queue,
    stats,
    isOnline,
    isSyncing,
    syncError,
    addToQueue,
    removeFromQueue,
    synchronize,
    clearQueue
  };
}

export default useSyncQueue; 