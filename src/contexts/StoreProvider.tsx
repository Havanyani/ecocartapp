import React, { createContext, ReactNode, useContext } from 'react';

type Store = {
  // Add your store state types here
};

type StoreProviderProps = {
  children: ReactNode;
  store?: Store;
};

const StoreContext = createContext<Store | undefined>(undefined);

export function StoreProvider({ children }: StoreProviderProps) {
  const store = {}; // Initialize your store here

  return (
    <StoreContext.Provider value={store}>
      {children}
    </StoreContext.Provider>
  );
}

export function useStore() {
  const context = useContext(StoreContext);
  if (context === undefined) {
    throw new Error('useStore must be used within a StoreProvider');
  }
  return context;
} 