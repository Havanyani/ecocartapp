import { RootState } from '@/store';
import {
    clearError,
    getStoreById,
    getStoreInventory,
    searchProducts,
    searchStores,
    setSelectedStore,
} from '@/store/slices/groceryStoreSlice';
import { GroceryStore, InventoryItem, Product, ProductSearchParams, StoreSearchParams } from '@/types/GroceryStore';
import { useCallback } from 'react';
import { useDispatch, useSelector } from 'react-redux';

export function useGroceryStore() {
  const dispatch = useDispatch();
  const { stores, selectedStore, products, inventory, isLoading, error } = useSelector(
    (state: RootState) => state.groceryStore
  );

  const handleSearchStores = useCallback(
    (params: StoreSearchParams) => {
      return dispatch(searchStores(params));
    },
    [dispatch]
  );

  const handleGetStoreById = useCallback(
    (storeId: string) => {
      return dispatch(getStoreById(storeId));
    },
    [dispatch]
  );

  const handleSearchProducts = useCallback(
    (params: ProductSearchParams) => {
      return dispatch(searchProducts(params));
    },
    [dispatch]
  );

  const handleGetStoreInventory = useCallback(
    (storeId: string) => {
      return dispatch(getStoreInventory(storeId));
    },
    [dispatch]
  );

  const handleSetSelectedStore = useCallback(
    (store: GroceryStore) => {
      dispatch(setSelectedStore(store));
    },
    [dispatch]
  );

  const handleClearError = useCallback(() => {
    dispatch(clearError());
  }, [dispatch]);

  const getStoreProducts = useCallback(
    (storeId: string): Product[] => {
      return products[storeId] || [];
    },
    [products]
  );

  const getStoreInventoryItems = useCallback(
    (storeId: string): InventoryItem[] => {
      return inventory[storeId] || [];
    },
    [inventory]
  );

  return {
    stores,
    selectedStore,
    products,
    inventory,
    isLoading,
    error,
    searchStores: handleSearchStores,
    getStoreById: handleGetStoreById,
    searchProducts: handleSearchProducts,
    getStoreInventory: handleGetStoreInventory,
    setSelectedStore: handleSetSelectedStore,
    clearError: handleClearError,
    getStoreProducts,
    getStoreInventoryItems,
  };
} 