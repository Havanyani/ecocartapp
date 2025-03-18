import { configureStore } from '@reduxjs/toolkit';
import { TypedUseSelectorHook, useDispatch, useSelector } from 'react-redux';
import collectionReducer from './slices/collectionSlice';
import { ecoCartReducer } from './slices/ecoCartSlice';
import groceryStoreReducer from './slices/groceryStoreSlice';
import orderReducer from './slices/orderSlice';
import paymentReducer from './slices/paymentSlice';
import performanceReducer from './slices/performanceSlice';
import recyclingRewardsReducer from './slices/recyclingRewardsSlice';
import userReducer from './slices/userSlice';

export const store = configureStore({
  reducer: {
    ecoCart: ecoCartReducer,
    user: userReducer,
    collection: collectionReducer,
    performance: performanceReducer,
    orders: orderReducer,
    payment: paymentReducer,
    recyclingRewards: recyclingRewardsReducer,
    groceryStore: groceryStoreReducer,
  },
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware({
      serializableCheck: {
        // Ignore these action types
        ignoredActions: ['user/setToken'],
        // Ignore these field paths in all actions
        ignoredActionPaths: ['payload.timestamp'],
        // Ignore these paths in the state
        ignoredPaths: ['user.token'],
      },
    }),
  devTools: process.env.NODE_ENV !== 'production',
});

// Infer the `RootState` and `AppDispatch` types from the store itself
export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;

// Use throughout your app instead of plain `useDispatch` and `useSelector`
export const useAppDispatch = () => useDispatch<AppDispatch>();
export const useAppSelector: TypedUseSelectorHook<RootState> = useSelector; 