import { useContext } from 'react';
import { StoreContext } from '@/contexts/StoreProvider';
import { RootStore } from '@/stores/RootStore';

export function useStore(): RootStore {
  const store = useContext(StoreContext);
  if (!store) {
    throw new Error('Store not found - wrap your app with Provider');
  }
  return store;
} 