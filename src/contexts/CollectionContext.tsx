/**
 * CollectionContext.tsx
 * 
 * Context for managing collection-related state and operations.
 * Provides methods for scheduling, updating, and retrieving collections.
 */

import collectionService from '@/services/CollectionService';
import { CollectionItem, TimeSlot } from '@/types/collections';
import React, { createContext, useContext, useEffect, useReducer } from 'react';
import { useAuth } from './AuthContext';

interface CollectionState {
  collections: CollectionItem[];
  timeSlots: TimeSlot[];
  isLoading: boolean;
  error: string | null;
}

type CollectionAction =
  | { type: 'SET_COLLECTIONS'; payload: CollectionItem[] }
  | { type: 'SET_TIME_SLOTS'; payload: TimeSlot[] }
  | { type: 'SET_LOADING'; payload: boolean }
  | { type: 'SET_ERROR'; payload: string | null }
  | { type: 'ADD_COLLECTION'; payload: CollectionItem }
  | { type: 'UPDATE_COLLECTION'; payload: CollectionItem }
  | { type: 'DELETE_COLLECTION'; payload: string };

interface CollectionContextType extends CollectionState {
  scheduleCollection: (data: Omit<CollectionItem, 'id' | 'createdAt' | 'updatedAt' | 'status'>) => Promise<void>;
  updateCollection: (id: string, updates: Partial<CollectionItem>) => Promise<void>;
  cancelCollection: (id: string) => Promise<void>;
  completeCollection: (id: string, actualWeight: number, driverNotes?: string) => Promise<void>;
  getTimeSlots: (date: Date) => Promise<void>;
  getCollectionById: (id: string) => Promise<CollectionItem | null>;
  fetchCollections: () => Promise<void>;
}

export type CollectionStatus = 'scheduled' | 'completed' | 'cancelled';

export interface Collection {
  id: string;
  userId: string;
  scheduledDateTime: string;
  materials: string[];
  weight?: number;
  status: CollectionStatus;
  driverLocation?: {
    latitude: number;
    longitude: number;
  };
}

const initialState: CollectionState = {
  collections: [],
  timeSlots: [],
  isLoading: false,
  error: null,
};

const CollectionContext = createContext<CollectionContextType | undefined>(undefined);

function collectionReducer(state: CollectionState, action: CollectionAction): CollectionState {
  switch (action.type) {
    case 'SET_COLLECTIONS':
      return { ...state, collections: action.payload };
    case 'SET_TIME_SLOTS':
      return { ...state, timeSlots: action.payload };
    case 'SET_LOADING':
      return { ...state, isLoading: action.payload };
    case 'SET_ERROR':
      return { ...state, error: action.payload };
    case 'ADD_COLLECTION':
      return { ...state, collections: [...state.collections, action.payload] };
    case 'UPDATE_COLLECTION':
      return {
        ...state,
        collections: state.collections.map(collection =>
          collection.id === action.payload.id ? action.payload : collection
        ),
      };
    case 'DELETE_COLLECTION':
      return {
        ...state,
        collections: state.collections.filter(collection => collection.id !== action.payload),
      };
    default:
      return state;
  }
}

export function CollectionProvider({ children }: { children: React.ReactNode }) {
  const [state, dispatch] = useReducer(collectionReducer, initialState);
  const { user } = useAuth();

  useEffect(() => {
    if (user) {
      loadCollections();
    }
  }, [user]);

  const loadCollections = async () => {
    try {
      dispatch({ type: 'SET_LOADING', payload: true });
      const collections = await collectionService.getCollectionsByUserId(user!.id);
      dispatch({ type: 'SET_COLLECTIONS', payload: collections });
    } catch (error) {
      dispatch({ type: 'SET_ERROR', payload: 'Failed to load collections' });
    } finally {
      dispatch({ type: 'SET_LOADING', payload: false });
    }
  };

  const scheduleCollection = async (data: Omit<CollectionItem, 'id' | 'createdAt' | 'updatedAt' | 'status'>) => {
    try {
      dispatch({ type: 'SET_LOADING', payload: true });
      const newCollection = await collectionService.scheduleCollection(data);
      dispatch({ type: 'ADD_COLLECTION', payload: newCollection });
    } catch (error) {
      dispatch({ type: 'SET_ERROR', payload: 'Failed to schedule collection' });
      throw error;
    } finally {
      dispatch({ type: 'SET_LOADING', payload: false });
    }
  };

  const updateCollection = async (id: string, updates: Partial<CollectionItem>) => {
    try {
      dispatch({ type: 'SET_LOADING', payload: true });
      const updatedCollection = await collectionService.updateCollection(id, updates);
      dispatch({ type: 'UPDATE_COLLECTION', payload: updatedCollection });
    } catch (error) {
      dispatch({ type: 'SET_ERROR', payload: 'Failed to update collection' });
      throw error;
    } finally {
      dispatch({ type: 'SET_LOADING', payload: false });
    }
  };

  const cancelCollection = async (id: string) => {
    try {
      dispatch({ type: 'SET_LOADING', payload: true });
      await collectionService.cancelCollection(id);
      dispatch({ type: 'DELETE_COLLECTION', payload: id });
    } catch (error) {
      dispatch({ type: 'SET_ERROR', payload: 'Failed to cancel collection' });
      throw error;
    } finally {
      dispatch({ type: 'SET_LOADING', payload: false });
    }
  };

  const completeCollection = async (id: string, actualWeight: number, driverNotes?: string) => {
    try {
      dispatch({ type: 'SET_LOADING', payload: true });
      const completedCollection = await collectionService.completeCollection(id, actualWeight, driverNotes);
      dispatch({ type: 'UPDATE_COLLECTION', payload: completedCollection });
    } catch (error) {
      dispatch({ type: 'SET_ERROR', payload: 'Failed to complete collection' });
      throw error;
    } finally {
      dispatch({ type: 'SET_LOADING', payload: false });
    }
  };

  const getTimeSlots = async (date: Date) => {
    try {
      dispatch({ type: 'SET_LOADING', payload: true });
      const timeSlots = await collectionService.getTimeSlots(date);
      dispatch({ type: 'SET_TIME_SLOTS', payload: timeSlots });
    } catch (error) {
      dispatch({ type: 'SET_ERROR', payload: 'Failed to get time slots' });
      throw error;
    } finally {
      dispatch({ type: 'SET_LOADING', payload: false });
    }
  };

  const getCollectionById = async (id: string) => {
    try {
      dispatch({ type: 'SET_LOADING', payload: true });
      const collection = await collectionService.getCollectionById(id);
      return collection;
    } catch (error) {
      dispatch({ type: 'SET_ERROR', payload: 'Failed to get collection' });
      throw error;
    } finally {
      dispatch({ type: 'SET_LOADING', payload: false });
    }
  };

  const fetchCollections = async () => {
    try {
      dispatch({ type: 'SET_LOADING', payload: true });
      await loadCollections();
    } catch (error) {
      dispatch({ type: 'SET_ERROR', payload: 'Failed to fetch collections' });
      throw error;
    } finally {
      dispatch({ type: 'SET_LOADING', payload: false });
    }
  };

  const value = {
    ...state,
    scheduleCollection,
    updateCollection,
    cancelCollection,
    completeCollection,
    getTimeSlots,
    getCollectionById,
    fetchCollections,
  };

  return <CollectionContext.Provider value={value}>{children}</CollectionContext.Provider>;
}

export function useCollection() {
  const context = useContext(CollectionContext);
  if (context === undefined) {
    throw new Error('useCollection must be used within a CollectionProvider');
  }
  return context;
} 