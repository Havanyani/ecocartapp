import { groceryStoreApi } from '@/services/groceryStoreApi';
import { GroceryStore, InventoryItem, Product, ProductSearchParams, StoreSearchParams } from '@/types/GroceryStore';
import { createAsyncThunk, createSlice } from '@reduxjs/toolkit';

interface GroceryStoreState {
  stores: GroceryStore[];
  selectedStore: GroceryStore | null;
  products: Record<string, Product[]>;
  inventory: Record<string, InventoryItem[]>;
  isLoading: boolean;
  error: string | null;
}

const initialState: GroceryStoreState = {
  stores: [],
  selectedStore: null,
  products: {},
  inventory: {},
  isLoading: false,
  error: null,
};

export const searchStores = createAsyncThunk(
  'groceryStore/searchStores',
  async (params: StoreSearchParams) => {
    const response = await groceryStoreApi.searchStores(params);
    return response;
  }
);

export const getStoreById = createAsyncThunk(
  'groceryStore/getStoreById',
  async (storeId: string) => {
    const response = await groceryStoreApi.getStoreById(storeId);
    return response;
  }
);

export const searchProducts = createAsyncThunk(
  'groceryStore/searchProducts',
  async (params: ProductSearchParams) => {
    const response = await groceryStoreApi.searchProducts(params);
    return { storeId: params.storeId, products: response };
  }
);

export const getStoreInventory = createAsyncThunk(
  'groceryStore/getStoreInventory',
  async (storeId: string) => {
    const response = await groceryStoreApi.getStoreInventory(storeId);
    return { storeId, inventory: response };
  }
);

const groceryStoreSlice = createSlice({
  name: 'groceryStore',
  initialState,
  reducers: {
    setSelectedStore: (state, action) => {
      state.selectedStore = action.payload;
    },
    clearError: (state) => {
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    builder
      // Search Stores
      .addCase(searchStores.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(searchStores.fulfilled, (state, action) => {
        state.isLoading = false;
        state.stores = action.payload;
      })
      .addCase(searchStores.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.error.message || 'Failed to search stores';
      })
      // Get Store By ID
      .addCase(getStoreById.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(getStoreById.fulfilled, (state, action) => {
        state.isLoading = false;
        state.selectedStore = action.payload;
      })
      .addCase(getStoreById.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.error.message || 'Failed to get store';
      })
      // Search Products
      .addCase(searchProducts.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(searchProducts.fulfilled, (state, action) => {
        state.isLoading = false;
        state.products[action.payload.storeId] = action.payload.products;
      })
      .addCase(searchProducts.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.error.message || 'Failed to search products';
      })
      // Get Store Inventory
      .addCase(getStoreInventory.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(getStoreInventory.fulfilled, (state, action) => {
        state.isLoading = false;
        state.inventory[action.payload.storeId] = action.payload.inventory;
      })
      .addCase(getStoreInventory.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.error.message || 'Failed to get inventory';
      });
  },
});

export const { setSelectedStore, clearError } = groceryStoreSlice.actions;
export default groceryStoreSlice.reducer; 