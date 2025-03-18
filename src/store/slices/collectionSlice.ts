import { RootState } from '@/store';
import { Collection, CollectionStatus } from '@/types/Collection';
import { DeliveryPersonnel } from '@/types/DeliveryPersonnel';
import { createSlice, PayloadAction } from '@reduxjs/toolkit';

interface CollectionState {
  collections: Collection[];
  loading: boolean;
  error: string | null;
  activeCollection: Collection | null;
  deliveryPersonnel: Record<string, DeliveryPersonnel>; // Maps collectionId to assigned personnel
  lastUpdateTimestamp: number;
  realtimeEnabled: boolean;
}

const initialState: CollectionState = {
  collections: [],
  loading: false,
  error: null,
  activeCollection: null,
  deliveryPersonnel: {},
  lastUpdateTimestamp: 0,
  realtimeEnabled: false,
};

const collectionSlice = createSlice({
  name: 'collections',
  initialState,
  reducers: {
    setCollections: (state, action: PayloadAction<Collection[]>) => {
      state.collections = action.payload;
      state.lastUpdateTimestamp = Date.now();
    },
    setLoading: (state, action: PayloadAction<boolean>) => {
      state.loading = action.payload;
    },
    setError: (state, action: PayloadAction<string | null>) => {
      state.error = action.payload;
    },
    setActiveCollection: (state, action: PayloadAction<Collection | null>) => {
      state.activeCollection = action.payload;
    },
    updateCollectionStatus: (
      state,
      action: PayloadAction<{ collectionId: string; status: CollectionStatus }>
    ) => {
      const { collectionId, status } = action.payload;
      const collection = state.collections.find((c) => c.id === collectionId);
      if (collection) {
        collection.status = status;
        collection.statusHistory.push({
          status,
          timestamp: new Date(),
        });
      }
      if (state.activeCollection?.id === collectionId) {
        state.activeCollection = {
          ...state.activeCollection,
          status,
          statusHistory: [
            ...state.activeCollection.statusHistory,
            { status, timestamp: new Date() },
          ],
        };
      }
      state.lastUpdateTimestamp = Date.now();
    },
    updateCollectionLocation: (
      state,
      action: PayloadAction<{
        collectionId: string;
        location: { latitude: number; longitude: number };
      }>
    ) => {
      const { collectionId, location } = action.payload;
      const collection = state.collections.find((c) => c.id === collectionId);
      if (collection) {
        collection.location.coordinates = location;
      }
      if (state.activeCollection?.id === collectionId) {
        state.activeCollection = {
          ...state.activeCollection,
          location: {
            ...state.activeCollection.location,
            coordinates: location,
          },
        };
      }
      state.lastUpdateTimestamp = Date.now();
    },
    updateCollection: (state, action: PayloadAction<Collection>) => {
      const index = state.collections.findIndex((c) => c.id === action.payload.id);
      if (index !== -1) {
        state.collections[index] = action.payload;
      }
      if (state.activeCollection?.id === action.payload.id) {
        state.activeCollection = action.payload;
      }
      state.lastUpdateTimestamp = Date.now();
    },
    // New reducers for real-time features
    setDeliveryPersonnel: (
      state,
      action: PayloadAction<{ collectionId: string; personnel: DeliveryPersonnel }>
    ) => {
      const { collectionId, personnel } = action.payload;
      state.deliveryPersonnel[collectionId] = personnel;
      state.lastUpdateTimestamp = Date.now();
    },
    updateDeliveryPersonnelLocation: (
      state,
      action: PayloadAction<{
        collectionId: string;
        personnelId: string;
        location: { latitude: number; longitude: number };
      }>
    ) => {
      const { collectionId, personnelId, location } = action.payload;
      const personnel = state.deliveryPersonnel[collectionId];
      if (personnel && personnel.id === personnelId) {
        state.deliveryPersonnel[collectionId] = {
          ...personnel,
          lastKnownLocation: location,
          locationUpdatedAt: new Date(),
        };
      }
      state.lastUpdateTimestamp = Date.now();
    },
    updateDeliveryPersonnelStatus: (
      state,
      action: PayloadAction<{
        collectionId: string;
        personnelId: string;
        status: string;
      }>
    ) => {
      const { collectionId, personnelId, status } = action.payload;
      const personnel = state.deliveryPersonnel[collectionId];
      if (personnel && personnel.id === personnelId) {
        state.deliveryPersonnel[collectionId] = {
          ...personnel,
          status,
          statusUpdatedAt: new Date(),
        };
      }
      state.lastUpdateTimestamp = Date.now();
    },
    setRealtimeEnabled: (state, action: PayloadAction<boolean>) => {
      state.realtimeEnabled = action.payload;
    }
  },
});

export const {
  setCollections,
  setLoading,
  setError,
  setActiveCollection,
  updateCollectionStatus,
  updateCollectionLocation,
  updateCollection,
  setDeliveryPersonnel,
  updateDeliveryPersonnelLocation,
  updateDeliveryPersonnelStatus,
  setRealtimeEnabled
} = collectionSlice.actions;

// Selectors
export const selectCollections = (state: RootState) => state.collection.collections;
export const selectIsLoading = (state: RootState) => state.collection.loading;
export const selectError = (state: RootState) => state.collection.error;
export const selectActiveCollection = (state: RootState) => state.collection.activeCollection;
export const selectDeliveryPersonnel = (collectionId: string) => (state: RootState) => 
  state.collection.deliveryPersonnel[collectionId];
export const selectRealtimeEnabled = (state: RootState) => state.collection.realtimeEnabled;
export const selectLastUpdateTimestamp = (state: RootState) => state.collection.lastUpdateTimestamp;

export default collectionSlice.reducer; 