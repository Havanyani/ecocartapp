/**
 * UserContext.tsx
 * 
 * Context provider for user profile management.
 * Extends the AuthContext with EcoCart-specific user information.
 */

import { UserProfile, UserProfileUpdateData } from '@/types/User';
import { CollectionItem } from '@/types/collections';
import { CreditsSummary } from '@/types/credits';
import AsyncStorage from '@react-native-async-storage/async-storage';
import React, { createContext, useCallback, useContext, useEffect, useReducer } from 'react';
import { useAuth } from './AuthContext';

// Constants
const USER_PROFILE_STORAGE_KEY = '@ecocart/user_profile';

// Initial state
interface UserState {
  profile: UserProfile | null;
  isLoading: boolean;
  error: string | null;
}

const initialState: UserState = {
  profile: null,
  isLoading: true,
  error: null,
};

// Action types
type UserAction =
  | { type: 'USER_LOAD_START' }
  | { type: 'USER_LOAD_SUCCESS'; payload: UserProfile }
  | { type: 'USER_LOAD_FAILURE'; payload: string }
  | { type: 'USER_UPDATE_SUCCESS'; payload: UserProfile }
  | { type: 'USER_UPDATE_FAILURE'; payload: string }
  | { type: 'USER_CLEAR' }
  | { type: 'CLEAR_ERROR' };

// Reducer
function userReducer(state: UserState, action: UserAction): UserState {
  switch (action.type) {
    case 'USER_LOAD_START':
      return {
        ...state,
        isLoading: true,
        error: null,
      };
    case 'USER_LOAD_SUCCESS':
      return {
        ...state,
        profile: action.payload,
        isLoading: false,
        error: null,
      };
    case 'USER_LOAD_FAILURE':
      return {
        ...state,
        profile: null,
        isLoading: false,
        error: action.payload,
      };
    case 'USER_UPDATE_SUCCESS':
      return {
        ...state,
        profile: action.payload,
        isLoading: false,
        error: null,
      };
    case 'USER_UPDATE_FAILURE':
      return {
        ...state,
        isLoading: false,
        error: action.payload,
      };
    case 'USER_CLEAR':
      return {
        ...state,
        profile: null,
        isLoading: false,
        error: null,
      };
    case 'CLEAR_ERROR':
      return {
        ...state,
        error: null,
      };
    default:
      return state;
  }
}

// Context value interface
interface UserContextValue extends UserState {
  updateProfile: (data: UserProfileUpdateData) => Promise<void>;
  addCollectionToHistory: (collection: CollectionItem) => Promise<void>;
  updateCredits: (credits: CreditsSummary) => Promise<void>;
  clearError: () => void;
}

// Context
const UserContext = createContext<UserContextValue | undefined>(undefined);

// Provider props
interface UserProviderProps {
  children: React.ReactNode;
}

// Provider component
export function UserProvider({ children }: UserProviderProps) {
  const [state, dispatch] = useReducer(userReducer, initialState);
  const { user, isAuthenticated } = useAuth();

  // Load user profile from storage
  useEffect(() => {
    async function loadUserProfile() {
      if (!isAuthenticated || !user) {
        dispatch({ type: 'USER_CLEAR' });
        return;
      }

      dispatch({ type: 'USER_LOAD_START' });

      try {
        const storedProfile = await AsyncStorage.getItem(USER_PROFILE_STORAGE_KEY);
        
        if (storedProfile) {
          const profile = JSON.parse(storedProfile);
          dispatch({ type: 'USER_LOAD_SUCCESS', payload: profile });
        } else {
          // Create a default profile if none exists
          const defaultProfile: UserProfile = {
            ...user,
            credits: {
              totalCredits: 0,
              pendingCredits: 0,
              lastCollection: {
                date: new Date().toISOString(),
                credits: 0,
                weight: 0,
              },
              nextRedemptionAvailable: false,
            },
            collectionHistory: [],
            notificationPreferences: {
              collectionReminders: true,
              creditUpdates: true,
              promotions: true,
              environmentalTips: true,
            },
            isDeliveryPersonnel: false,
            createdAt: user.createdAt,
            updatedAt: new Date().toISOString(),
          };
          
          await AsyncStorage.setItem(USER_PROFILE_STORAGE_KEY, JSON.stringify(defaultProfile));
          dispatch({ type: 'USER_LOAD_SUCCESS', payload: defaultProfile });
        }
      } catch (error) {
        console.error('Error loading user profile:', error);
        dispatch({ type: 'USER_LOAD_FAILURE', payload: 'Failed to load user profile' });
      }
    }

    loadUserProfile();
  }, [isAuthenticated, user]);

  // Update user profile
  const updateProfile = useCallback(async (data: UserProfileUpdateData) => {
    if (!state.profile) {
      dispatch({ type: 'USER_UPDATE_FAILURE', payload: 'No user profile found' });
      return;
    }

    dispatch({ type: 'USER_LOAD_START' });

    try {
      // Create a new profile object with the updated data
      const updatedProfile: UserProfile = {
        ...state.profile,
        ...data,
        // Handle notification preferences separately to ensure all required fields are present
        notificationPreferences: data.notificationPreferences 
          ? {
              ...state.profile.notificationPreferences,
              ...data.notificationPreferences,
            }
          : state.profile.notificationPreferences,
        updatedAt: new Date().toISOString(),
      };

      await AsyncStorage.setItem(USER_PROFILE_STORAGE_KEY, JSON.stringify(updatedProfile));
      dispatch({ type: 'USER_UPDATE_SUCCESS', payload: updatedProfile });
    } catch (error) {
      console.error('Error updating user profile:', error);
      dispatch({ type: 'USER_UPDATE_FAILURE', payload: 'Failed to update user profile' });
    }
  }, [state.profile]);

  // Add collection to history
  const addCollectionToHistory = useCallback(async (collection: CollectionItem) => {
    if (!state.profile) {
      dispatch({ type: 'USER_UPDATE_FAILURE', payload: 'No user profile found' });
      return;
    }

    dispatch({ type: 'USER_LOAD_START' });

    try {
      const updatedProfile: UserProfile = {
        ...state.profile,
        collectionHistory: [collection, ...state.profile.collectionHistory],
        updatedAt: new Date().toISOString(),
      };

      await AsyncStorage.setItem(USER_PROFILE_STORAGE_KEY, JSON.stringify(updatedProfile));
      dispatch({ type: 'USER_UPDATE_SUCCESS', payload: updatedProfile });
    } catch (error) {
      console.error('Error adding collection to history:', error);
      dispatch({ type: 'USER_UPDATE_FAILURE', payload: 'Failed to add collection to history' });
    }
  }, [state.profile]);

  // Update credits
  const updateCredits = useCallback(async (credits: CreditsSummary) => {
    if (!state.profile) {
      dispatch({ type: 'USER_UPDATE_FAILURE', payload: 'No user profile found' });
      return;
    }

    dispatch({ type: 'USER_LOAD_START' });

    try {
      const updatedProfile: UserProfile = {
        ...state.profile,
        credits,
        updatedAt: new Date().toISOString(),
      };

      await AsyncStorage.setItem(USER_PROFILE_STORAGE_KEY, JSON.stringify(updatedProfile));
      dispatch({ type: 'USER_UPDATE_SUCCESS', payload: updatedProfile });
    } catch (error) {
      console.error('Error updating credits:', error);
      dispatch({ type: 'USER_UPDATE_FAILURE', payload: 'Failed to update credits' });
    }
  }, [state.profile]);

  // Clear error
  const clearError = useCallback(() => {
    dispatch({ type: 'CLEAR_ERROR' });
  }, []);

  // Context value
  const value: UserContextValue = {
    ...state,
    updateProfile,
    addCollectionToHistory,
    updateCredits,
    clearError,
  };

  return <UserContext.Provider value={value}>{children}</UserContext.Provider>;
}

// Hook
export function useUser() {
  const context = useContext(UserContext);
  if (context === undefined) {
    throw new Error('useUser must be used within a UserProvider');
  }
  return context;
} 