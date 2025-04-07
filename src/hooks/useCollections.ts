/**
 * useCollections.ts
 * 
 * Custom hook for managing collections with offline support.
 */

import { CollectionsApi, CollectionsQueryParams, CreateCollectionData, UpdateCollectionData } from '@/api/CollectionsApi';
import { useOfflineStorage } from '@/providers/OfflineStorageProvider';
import { CollectionItem } from '@/types/collections';
import { useCallback, useEffect, useState } from 'react';
import useNetworkStatus from './useNetworkStatus';

const COLLECTIONS_STORAGE_KEY = 'collections';
const COLLECTION_STATS_STORAGE_KEY = 'collection_stats';

export function useCollections() {
  const { isOnline } = useNetworkStatus();
  const { getItem, setItem, removeItem } = useOfflineStorage();
  const [collections, setCollections] = useState<CollectionItem[]>([]);
  const [stats, setStats] = useState<CollectionStats | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  // Load collections from storage or API
  const loadCollections = useCallback(async (params?: CollectionsQueryParams) => {
    setIsLoading(true);
    setError(null);

    try {
      if (isOnline) {
        const response = await CollectionsApi.getCollections(params);
        setCollections(response.collections);
        await setItem(COLLECTIONS_STORAGE_KEY, response.collections);
      } else {
        const storedCollections = await getItem<CollectionItem[]>(COLLECTIONS_STORAGE_KEY);
        if (storedCollections) {
          setCollections(storedCollections);
        }
      }
    } catch (err) {
      setError(err instanceof Error ? err : new Error('Failed to load collections'));
    } finally {
      setIsLoading(false);
    }
  }, [isOnline, getItem, setItem]);

  // Load collection statistics
  const loadStats = useCallback(async () => {
    try {
      if (isOnline) {
        const stats = await CollectionsApi.getCollectionStats();
        setStats(stats);
        await setItem(COLLECTION_STATS_STORAGE_KEY, stats);
      } else {
        const storedStats = await getItem<CollectionStats>(COLLECTION_STATS_STORAGE_KEY);
        if (storedStats) {
          setStats(storedStats);
        }
      }
    } catch (err) {
      console.error('Failed to load collection stats:', err);
    }
  }, [isOnline, getItem, setItem]);

  // Create a new collection
  const createCollection = useCallback(async (data: CreateCollectionData) => {
    try {
      if (isOnline) {
        const newCollection = await CollectionsApi.createCollection(data);
        setCollections(prev => [...prev, newCollection]);
        return newCollection;
      } else {
        // Create a temporary collection for offline mode
        const tempCollection: CollectionItem = {
          id: `temp-${Date.now()}`,
          materialId: data.materialId,
          materialName: 'Loading...', // Will be updated when online
          scheduledDate: data.scheduledDate,
          estimatedWeight: data.estimatedWeight,
          address: data.address,
          notes: data.notes,
          status: 'scheduled',
          createdAt: new Date(),
          updatedAt: new Date()
        };
        setCollections(prev => [...prev, tempCollection]);
        return tempCollection;
      }
    } catch (err) {
      throw err instanceof Error ? err : new Error('Failed to create collection');
    }
  }, [isOnline]);

  // Update a collection
  const updateCollection = useCallback(async (id: string, data: UpdateCollectionData) => {
    try {
      if (isOnline) {
        const updatedCollection = await CollectionsApi.updateCollection(id, data);
        setCollections(prev => 
          prev.map(c => c.id === id ? updatedCollection : c)
        );
        return updatedCollection;
      } else {
        // Update local collection for offline mode
        setCollections(prev => 
          prev.map(c => c.id === id ? { ...c, ...data, updatedAt: new Date() } : c)
        );
        return collections.find(c => c.id === id);
      }
    } catch (err) {
      throw err instanceof Error ? err : new Error('Failed to update collection');
    }
  }, [isOnline, collections]);

  // Cancel a collection
  const cancelCollection = useCallback(async (id: string) => {
    try {
      if (isOnline) {
        const cancelledCollection = await CollectionsApi.cancelCollection(id);
        setCollections(prev => 
          prev.map(c => c.id === id ? cancelledCollection : c)
        );
        return cancelledCollection;
      } else {
        return updateCollection(id, { status: 'cancelled' });
      }
    } catch (err) {
      throw err instanceof Error ? err : new Error('Failed to cancel collection');
    }
  }, [isOnline, updateCollection]);

  // Complete a collection
  const completeCollection = useCallback(async (id: string, data: { actualWeight: number; driverNotes?: string }) => {
    try {
      if (isOnline) {
        const completedCollection = await CollectionsApi.completeCollection(id, data);
        setCollections(prev => 
          prev.map(c => c.id === id ? completedCollection : c)
        );
        return completedCollection;
      } else {
        return updateCollection(id, {
          status: 'completed',
          actualWeight: data.actualWeight,
          driverNotes: data.driverNotes,
          completedDate: new Date()
        });
      }
    } catch (err) {
      throw err instanceof Error ? err : new Error('Failed to complete collection');
    }
  }, [isOnline, updateCollection]);

  // Get a collection by ID
  const getCollection = useCallback((id: string) => {
    return collections.find(c => c.id === id);
  }, [collections]);

  // Initial load
  useEffect(() => {
    loadCollections();
    loadStats();
  }, [loadCollections, loadStats]);

  return {
    collections,
    stats,
    isLoading,
    error,
    loadCollections,
    loadStats,
    createCollection,
    updateCollection,
    cancelCollection,
    completeCollection,
    getCollection
  };
} 