import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import type { RootState } from '@/index';

export interface UserProfile {
  id: string;
  email: string;
  displayName: string;
  avatar?: string;
  totalPoints: number;
  totalCollections: number;
  co2Offset: number;
  createdAt: string;
  updatedAt: string;
}

export interface UserState {
  profile: UserProfile | null;
  token: string | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  error: string | null;
  preferences: {
    notifications: boolean;
    darkMode: boolean;
    language: string;
  };
}

const initialState: UserState = {
  profile: null,
  token: null,
  isAuthenticated: false,
  isLoading: false,
  error: null,
  preferences: {
    notifications: true,
    darkMode: false,
    language: 'en',
  },
};

export const userSlice = createSlice({
  name: 'user',
  initialState,
  reducers: {
    setProfile: (state, action: PayloadAction<UserProfile>) => {
      state.profile = action.payload;
      state.isAuthenticated = true;
    },
    setToken: (state, action: PayloadAction<string | null>) => {
      state.token = action.payload;
      state.isAuthenticated = !!action.payload;
    },
    updatePoints: (state, action: PayloadAction<number>) => {
      if (state.profile) {
        state.profile.totalPoints += action.payload;
      }
    },
    updateCollections: (state, action: PayloadAction<number>) => {
      if (state.profile) {
        state.profile.totalCollections += action.payload;
      }
    },
    updateCo2Offset: (state, action: PayloadAction<number>) => {
      if (state.profile) {
        state.profile.co2Offset += action.payload;
      }
    },
    setLoading: (state, action: PayloadAction<boolean>) => {
      state.isLoading = action.payload;
    },
    setError: (state, action: PayloadAction<string | null>) => {
      state.error = action.payload;
    },
    updatePreferences: (state, action: PayloadAction<Partial<UserState['preferences']>>) => {
      state.preferences = { ...state.preferences, ...action.payload };
    },
    logout: (state) => {
      state.profile = null;
      state.token = null;
      state.isAuthenticated = false;
      state.error = null;
    },
  },
});

// Export actions
export const {
  setProfile,
  setToken,
  updatePoints,
  updateCollections,
  updateCo2Offset,
  setLoading,
  setError,
  updatePreferences,
  logout,
} = userSlice.actions;

// Export selectors
export const selectUser = (state: RootState) => state.user.profile;
export const selectToken = (state: RootState) => state.user.token;
export const selectIsAuthenticated = (state: RootState) => state.user.isAuthenticated;
export const selectIsLoading = (state: RootState) => state.user.isLoading;
export const selectError = (state: RootState) => state.user.error;
export const selectPreferences = (state: RootState) => state.user.preferences;

// Export reducer
export default userSlice.reducer; 