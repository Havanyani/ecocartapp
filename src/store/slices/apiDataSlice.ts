/**
 * apiDataSlice.ts
 * 
 * Redux slice for managing global API data state
 */

import {
    CollectionRequest,
    CommunityChallenge,
    DeliveryPersonnel,
    DeliveryRoute,
    GroceryStore,
    Material,
    Reward
} from '@/types/models';
import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import { RootState } from '../index';

/**
 * API data state interface
 */
interface ApiDataState {
  materials: {
    entities: Record<string, Material>;
    ids: string[];
    loaded: boolean;
    loadingError: string | null;
    lastUpdated: number | null;
  };
  
  collections: {
    entities: Record<string, CollectionRequest>;
    ids: string[];
    loaded: boolean;
    loadingError: string | null;
    lastUpdated: number | null;
  };
  
  stores: {
    entities: Record<string, GroceryStore>;
    ids: string[];
    loaded: boolean;
    loadingError: string | null;
    lastUpdated: number | null;
  };
  
  rewards: {
    entities: Record<string, Reward>;
    ids: string[];
    loaded: boolean;
    loadingError: string | null;
    lastUpdated: number | null;
  };
  
  deliveryPersonnel: {
    entities: Record<string, DeliveryPersonnel>;
    ids: string[];
    loaded: boolean;
    loadingError: string | null;
    lastUpdated: number | null;
  };
  
  deliveryRoutes: {
    entities: Record<string, DeliveryRoute>;
    ids: string[];
    loaded: boolean;
    loadingError: string | null;
    lastUpdated: number | null;
  };
  
  challenges: {
    entities: Record<string, CommunityChallenge>;
    ids: string[];
    loaded: boolean;
    loadingError: string | null;
    lastUpdated: number | null;
  };
}

/**
 * Initial state for API data
 */
const initialState: ApiDataState = {
  materials: {
    entities: {},
    ids: [],
    loaded: false,
    loadingError: null,
    lastUpdated: null,
  },
  
  collections: {
    entities: {},
    ids: [],
    loaded: false,
    loadingError: null,
    lastUpdated: null,
  },
  
  stores: {
    entities: {},
    ids: [],
    loaded: false,
    loadingError: null,
    lastUpdated: null,
  },
  
  rewards: {
    entities: {},
    ids: [],
    loaded: false,
    loadingError: null,
    lastUpdated: null,
  },
  
  deliveryPersonnel: {
    entities: {},
    ids: [],
    loaded: false,
    loadingError: null,
    lastUpdated: null,
  },
  
  deliveryRoutes: {
    entities: {},
    ids: [],
    loaded: false,
    loadingError: null,
    lastUpdated: null,
  },
  
  challenges: {
    entities: {},
    ids: [],
    loaded: false,
    loadingError: null,
    lastUpdated: null,
  },
};

/**
 * Helper function to normalize array data into entities and ids
 */
function normalizeData<T extends { id: string }>(items: T[]): {
  entities: Record<string, T>;
  ids: string[];
} {
  const entities: Record<string, T> = {};
  const ids: string[] = [];
  
  items.forEach(item => {
    entities[item.id] = item;
    ids.push(item.id);
  });
  
  return { entities, ids };
}

/**
 * API data slice
 */
export const apiDataSlice = createSlice({
  name: 'apiData',
  initialState,
  reducers: {
    // Materials actions
    setMaterials: (state, action: PayloadAction<Material[]>) => {
      const { entities, ids } = normalizeData(action.payload);
      state.materials.entities = entities;
      state.materials.ids = ids;
      state.materials.loaded = true;
      state.materials.loadingError = null;
      state.materials.lastUpdated = Date.now();
    },
    
    addMaterial: (state, action: PayloadAction<Material>) => {
      const material = action.payload;
      state.materials.entities[material.id] = material;
      if (!state.materials.ids.includes(material.id)) {
        state.materials.ids.push(material.id);
      }
      state.materials.lastUpdated = Date.now();
    },
    
    updateMaterial: (state, action: PayloadAction<Material>) => {
      const material = action.payload;
      if (state.materials.entities[material.id]) {
        state.materials.entities[material.id] = material;
        state.materials.lastUpdated = Date.now();
      }
    },
    
    removeMaterial: (state, action: PayloadAction<string>) => {
      const id = action.payload;
      delete state.materials.entities[id];
      state.materials.ids = state.materials.ids.filter(materialId => materialId !== id);
      state.materials.lastUpdated = Date.now();
    },
    
    setMaterialsError: (state, action: PayloadAction<string>) => {
      state.materials.loadingError = action.payload;
    },
    
    // Collections actions
    setCollections: (state, action: PayloadAction<CollectionRequest[]>) => {
      const { entities, ids } = normalizeData(action.payload);
      state.collections.entities = entities;
      state.collections.ids = ids;
      state.collections.loaded = true;
      state.collections.loadingError = null;
      state.collections.lastUpdated = Date.now();
    },
    
    addCollection: (state, action: PayloadAction<CollectionRequest>) => {
      const collection = action.payload;
      state.collections.entities[collection.id] = collection;
      if (!state.collections.ids.includes(collection.id)) {
        state.collections.ids.push(collection.id);
      }
      state.collections.lastUpdated = Date.now();
    },
    
    updateCollection: (state, action: PayloadAction<CollectionRequest>) => {
      const collection = action.payload;
      if (state.collections.entities[collection.id]) {
        state.collections.entities[collection.id] = collection;
        state.collections.lastUpdated = Date.now();
      }
    },
    
    removeCollection: (state, action: PayloadAction<string>) => {
      const id = action.payload;
      delete state.collections.entities[id];
      state.collections.ids = state.collections.ids.filter(collectionId => collectionId !== id);
      state.collections.lastUpdated = Date.now();
    },
    
    setCollectionsError: (state, action: PayloadAction<string>) => {
      state.collections.loadingError = action.payload;
    },
    
    // Stores actions
    setStores: (state, action: PayloadAction<GroceryStore[]>) => {
      const { entities, ids } = normalizeData(action.payload);
      state.stores.entities = entities;
      state.stores.ids = ids;
      state.stores.loaded = true;
      state.stores.loadingError = null;
      state.stores.lastUpdated = Date.now();
    },
    
    addStore: (state, action: PayloadAction<GroceryStore>) => {
      const store = action.payload;
      state.stores.entities[store.id] = store;
      if (!state.stores.ids.includes(store.id)) {
        state.stores.ids.push(store.id);
      }
      state.stores.lastUpdated = Date.now();
    },
    
    updateStore: (state, action: PayloadAction<GroceryStore>) => {
      const store = action.payload;
      if (state.stores.entities[store.id]) {
        state.stores.entities[store.id] = store;
        state.stores.lastUpdated = Date.now();
      }
    },
    
    removeStore: (state, action: PayloadAction<string>) => {
      const id = action.payload;
      delete state.stores.entities[id];
      state.stores.ids = state.stores.ids.filter(storeId => storeId !== id);
      state.stores.lastUpdated = Date.now();
    },
    
    setStoresError: (state, action: PayloadAction<string>) => {
      state.stores.loadingError = action.payload;
    },
    
    // Rewards actions
    setRewards: (state, action: PayloadAction<Reward[]>) => {
      const { entities, ids } = normalizeData(action.payload);
      state.rewards.entities = entities;
      state.rewards.ids = ids;
      state.rewards.loaded = true;
      state.rewards.loadingError = null;
      state.rewards.lastUpdated = Date.now();
    },
    
    addReward: (state, action: PayloadAction<Reward>) => {
      const reward = action.payload;
      state.rewards.entities[reward.id] = reward;
      if (!state.rewards.ids.includes(reward.id)) {
        state.rewards.ids.push(reward.id);
      }
      state.rewards.lastUpdated = Date.now();
    },
    
    updateReward: (state, action: PayloadAction<Reward>) => {
      const reward = action.payload;
      if (state.rewards.entities[reward.id]) {
        state.rewards.entities[reward.id] = reward;
        state.rewards.lastUpdated = Date.now();
      }
    },
    
    removeReward: (state, action: PayloadAction<string>) => {
      const id = action.payload;
      delete state.rewards.entities[id];
      state.rewards.ids = state.rewards.ids.filter(rewardId => rewardId !== id);
      state.rewards.lastUpdated = Date.now();
    },
    
    setRewardsError: (state, action: PayloadAction<string>) => {
      state.rewards.loadingError = action.payload;
    },
    
    // Delivery personnel actions
    setDeliveryPersonnel: (state, action: PayloadAction<DeliveryPersonnel[]>) => {
      const { entities, ids } = normalizeData(action.payload);
      state.deliveryPersonnel.entities = entities;
      state.deliveryPersonnel.ids = ids;
      state.deliveryPersonnel.loaded = true;
      state.deliveryPersonnel.loadingError = null;
      state.deliveryPersonnel.lastUpdated = Date.now();
    },
    
    addDeliveryPersonnel: (state, action: PayloadAction<DeliveryPersonnel>) => {
      const personnel = action.payload;
      state.deliveryPersonnel.entities[personnel.id] = personnel;
      if (!state.deliveryPersonnel.ids.includes(personnel.id)) {
        state.deliveryPersonnel.ids.push(personnel.id);
      }
      state.deliveryPersonnel.lastUpdated = Date.now();
    },
    
    updateDeliveryPersonnel: (state, action: PayloadAction<DeliveryPersonnel>) => {
      const personnel = action.payload;
      if (state.deliveryPersonnel.entities[personnel.id]) {
        state.deliveryPersonnel.entities[personnel.id] = personnel;
        state.deliveryPersonnel.lastUpdated = Date.now();
      }
    },
    
    removeDeliveryPersonnel: (state, action: PayloadAction<string>) => {
      const id = action.payload;
      delete state.deliveryPersonnel.entities[id];
      state.deliveryPersonnel.ids = state.deliveryPersonnel.ids.filter(
        personnelId => personnelId !== id
      );
      state.deliveryPersonnel.lastUpdated = Date.now();
    },
    
    setDeliveryPersonnelError: (state, action: PayloadAction<string>) => {
      state.deliveryPersonnel.loadingError = action.payload;
    },
    
    // Delivery routes actions
    setDeliveryRoutes: (state, action: PayloadAction<DeliveryRoute[]>) => {
      const { entities, ids } = normalizeData(action.payload);
      state.deliveryRoutes.entities = entities;
      state.deliveryRoutes.ids = ids;
      state.deliveryRoutes.loaded = true;
      state.deliveryRoutes.loadingError = null;
      state.deliveryRoutes.lastUpdated = Date.now();
    },
    
    addDeliveryRoute: (state, action: PayloadAction<DeliveryRoute>) => {
      const route = action.payload;
      state.deliveryRoutes.entities[route.id] = route;
      if (!state.deliveryRoutes.ids.includes(route.id)) {
        state.deliveryRoutes.ids.push(route.id);
      }
      state.deliveryRoutes.lastUpdated = Date.now();
    },
    
    updateDeliveryRoute: (state, action: PayloadAction<DeliveryRoute>) => {
      const route = action.payload;
      if (state.deliveryRoutes.entities[route.id]) {
        state.deliveryRoutes.entities[route.id] = route;
        state.deliveryRoutes.lastUpdated = Date.now();
      }
    },
    
    removeDeliveryRoute: (state, action: PayloadAction<string>) => {
      const id = action.payload;
      delete state.deliveryRoutes.entities[id];
      state.deliveryRoutes.ids = state.deliveryRoutes.ids.filter(routeId => routeId !== id);
      state.deliveryRoutes.lastUpdated = Date.now();
    },
    
    setDeliveryRoutesError: (state, action: PayloadAction<string>) => {
      state.deliveryRoutes.loadingError = action.payload;
    },
    
    // Challenges actions
    setChallenges: (state, action: PayloadAction<CommunityChallenge[]>) => {
      const { entities, ids } = normalizeData(action.payload);
      state.challenges.entities = entities;
      state.challenges.ids = ids;
      state.challenges.loaded = true;
      state.challenges.loadingError = null;
      state.challenges.lastUpdated = Date.now();
    },
    
    addChallenge: (state, action: PayloadAction<CommunityChallenge>) => {
      const challenge = action.payload;
      state.challenges.entities[challenge.id] = challenge;
      if (!state.challenges.ids.includes(challenge.id)) {
        state.challenges.ids.push(challenge.id);
      }
      state.challenges.lastUpdated = Date.now();
    },
    
    updateChallenge: (state, action: PayloadAction<CommunityChallenge>) => {
      const challenge = action.payload;
      if (state.challenges.entities[challenge.id]) {
        state.challenges.entities[challenge.id] = challenge;
        state.challenges.lastUpdated = Date.now();
      }
    },
    
    removeChallenge: (state, action: PayloadAction<string>) => {
      const id = action.payload;
      delete state.challenges.entities[id];
      state.challenges.ids = state.challenges.ids.filter(challengeId => challengeId !== id);
      state.challenges.lastUpdated = Date.now();
    },
    
    setChallengesError: (state, action: PayloadAction<string>) => {
      state.challenges.loadingError = action.payload;
    },
    
    // Global data actions
    resetApiData: (state) => {
      return initialState;
    },
    
    clearApiErrors: (state) => {
      state.materials.loadingError = null;
      state.collections.loadingError = null;
      state.stores.loadingError = null;
      state.rewards.loadingError = null;
      state.deliveryPersonnel.loadingError = null;
      state.deliveryRoutes.loadingError = null;
      state.challenges.loadingError = null;
    }
  },
});

// Export actions
export const {
  // Materials
  setMaterials,
  addMaterial,
  updateMaterial,
  removeMaterial,
  setMaterialsError,
  
  // Collections
  setCollections,
  addCollection,
  updateCollection,
  removeCollection,
  setCollectionsError,
  
  // Stores
  setStores,
  addStore,
  updateStore,
  removeStore,
  setStoresError,
  
  // Rewards
  setRewards,
  addReward,
  updateReward,
  removeReward,
  setRewardsError,
  
  // Delivery Personnel
  setDeliveryPersonnel,
  addDeliveryPersonnel,
  updateDeliveryPersonnel,
  removeDeliveryPersonnel,
  setDeliveryPersonnelError,
  
  // Delivery Routes
  setDeliveryRoutes,
  addDeliveryRoute,
  updateDeliveryRoute,
  removeDeliveryRoute,
  setDeliveryRoutesError,
  
  // Challenges
  setChallenges,
  addChallenge,
  updateChallenge,
  removeChallenge,
  setChallengesError,
  
  // Global
  resetApiData,
  clearApiErrors
} = apiDataSlice.actions;

// Export selectors
export const selectMaterials = (state: RootState) => 
  state.apiData.materials.ids.map(id => state.apiData.materials.entities[id]);

export const selectMaterialById = (state: RootState, id: string) => 
  state.apiData.materials.entities[id];

export const selectCollections = (state: RootState) => 
  state.apiData.collections.ids.map(id => state.apiData.collections.entities[id]);

export const selectCollectionById = (state: RootState, id: string) => 
  state.apiData.collections.entities[id];

export const selectStores = (state: RootState) => 
  state.apiData.stores.ids.map(id => state.apiData.stores.entities[id]);

export const selectStoreById = (state: RootState, id: string) => 
  state.apiData.stores.entities[id];

export const selectRewards = (state: RootState) => 
  state.apiData.rewards.ids.map(id => state.apiData.rewards.entities[id]);

export const selectRewardById = (state: RootState, id: string) => 
  state.apiData.rewards.entities[id];

export const selectDeliveryPersonnel = (state: RootState) => 
  state.apiData.deliveryPersonnel.ids.map(id => state.apiData.deliveryPersonnel.entities[id]);

export const selectDeliveryPersonnelById = (state: RootState, id: string) => 
  state.apiData.deliveryPersonnel.entities[id];

export const selectDeliveryRoutes = (state: RootState) => 
  state.apiData.deliveryRoutes.ids.map(id => state.apiData.deliveryRoutes.entities[id]);

export const selectDeliveryRouteById = (state: RootState, id: string) => 
  state.apiData.deliveryRoutes.entities[id];

export const selectChallenges = (state: RootState) => 
  state.apiData.challenges.ids.map(id => state.apiData.challenges.entities[id]);

export const selectChallengeById = (state: RootState, id: string) => 
  state.apiData.challenges.entities[id];

export const selectMaterialsLoaded = (state: RootState) => 
  state.apiData.materials.loaded;

export const selectCollectionsLoaded = (state: RootState) => 
  state.apiData.collections.loaded;

export const selectStoresLoaded = (state: RootState) => 
  state.apiData.stores.loaded;

export const selectRewardsLoaded = (state: RootState) => 
  state.apiData.rewards.loaded;

export const selectDeliveryPersonnelLoaded = (state: RootState) => 
  state.apiData.deliveryPersonnel.loaded;

export const selectDeliveryRoutesLoaded = (state: RootState) => 
  state.apiData.deliveryRoutes.loaded;

export const selectChallengesLoaded = (state: RootState) => 
  state.apiData.challenges.loaded;

export default apiDataSlice.reducer; 