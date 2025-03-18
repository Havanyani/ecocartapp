import { SafeStorage } from '@/utils/storage';
import { useCallback, useEffect, useState } from 'react';
import { Alert } from 'react-native';
import { generateUniqueId } from '@/utils/UniqueIdGenerator';

export interface UserProfile {
  id: string;
  email: string;
  displayName: string;
  phoneNumber?: string;
  address?: string;
  profileImageUrl?: string;
  createdAt: Date;
  lastLoginAt: Date;
  collectorStatus?: 'pending' | 'approved' | 'rejected';
  isAdmin?: boolean;
  totalCollections?: number;
  totalCredits?: number;
  preferences?: {
    notifications: boolean;
    emailUpdates: boolean;
    darkMode: boolean;
  };
}

export interface UserCredentials {
  email: string;
  password: string;
}

export interface SignUpData extends UserCredentials {
  displayName: string;
  phoneNumber?: string;
  address?: string;
}

/**
 * Hook for managing user authentication and profile
 */
export function useUser() {
  const [user, setUser] = useState<UserProfile | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<Error | null>(null);
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(false);

  /**
   * Load user profile from storage on component mount
   */
  useEffect(() => {
    loadUserProfile();
  }, []);

  /**
   * Load user profile from local storage
   */
  const loadUserProfile = async () => {
    setIsLoading(true);
    setError(null);
    
    try {
      const userDataString = await SafeStorage.getItem('user');
      
      if (userDataString) {
        const userData = JSON.parse(userDataString);
        // Convert date strings to Date objects
        const formattedUser = {
          ...userData,
          createdAt: new Date(userData.createdAt),
          lastLoginAt: new Date(userData.lastLoginAt)
        };
        
        setUser(formattedUser);
        setIsAuthenticated(true);
      } else {
        setUser(null);
        setIsAuthenticated(false);
      }
    } catch (err) {
      setError(err instanceof Error ? err : new Error('Failed to load user profile'));
      console.error('Error loading user profile:', err);
    } finally {
      setIsLoading(false);
    }
  };

  /**
   * Save user profile to storage
   */
  const saveUserProfile = async (userData: UserProfile) => {
    try {
      await SafeStorage.setItem('user', JSON.stringify(userData));
    } catch (err) {
      console.error('Error saving user profile:', err);
      Alert.alert('Error', 'Failed to save user profile.');
    }
  };

  /**
   * Sign in with email and password
   */
  const signIn = async (credentials: UserCredentials): Promise<UserProfile> => {
    setIsLoading(true);
    setError(null);
    
    try {
      // In a real app, you'd send these credentials to an API
      // For now, we'll fake successful authentication and return mocked user data
      
      // Simulate API call delay
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      // Basic validation
      if (!credentials.email || !credentials.password) {
        throw new Error('Email and password are required');
      }
      
      // Mock user profile - in a real app, this would come from your API
      const mockUser: UserProfile = {
        id: generateUniqueId(),
        email: credentials.email,
        displayName: credentials.email.split('@')[0], // Default display name based on email
        createdAt: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000), // 30 days ago
        lastLoginAt: new Date(),
        totalCollections: 0,
        totalCredits: 0,
        preferences: {
          notifications: true,
          emailUpdates: true,
          darkMode: false
        }
      };
      
      // Save and set the user
      await saveUserProfile(mockUser);
      setUser(mockUser);
      setIsAuthenticated(true);
      
      return mockUser;
    } catch (err) {
      const error = err instanceof Error ? err : new Error('Sign in failed');
      setError(error);
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  /**
   * Sign up a new user account
   */
  const signUp = async (signUpData: SignUpData): Promise<UserProfile> => {
    setIsLoading(true);
    setError(null);
    
    try {
      // Simulate API call delay
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      // Basic validation
      if (!signUpData.email || !signUpData.password || !signUpData.displayName) {
        throw new Error('Email, password, and display name are required');
      }
      
      // Create new user profile
      const newUser: UserProfile = {
        id: generateUniqueId(),
        email: signUpData.email,
        displayName: signUpData.displayName,
        phoneNumber: signUpData.phoneNumber,
        address: signUpData.address,
        createdAt: new Date(),
        lastLoginAt: new Date(),
        totalCollections: 0,
        totalCredits: 0,
        preferences: {
          notifications: true,
          emailUpdates: true,
          darkMode: false
        }
      };
      
      // Save and set the user
      await saveUserProfile(newUser);
      setUser(newUser);
      setIsAuthenticated(true);
      
      return newUser;
    } catch (err) {
      const error = err instanceof Error ? err : new Error('Sign up failed');
      setError(error);
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  /**
   * Sign out the current user
   */
  const signOut = async (): Promise<void> => {
    try {
      await SafeStorage.removeItem('user');
      setUser(null);
      setIsAuthenticated(false);
    } catch (err) {
      console.error('Error signing out:', err);
      Alert.alert('Error', 'Failed to sign out properly.');
    }
  };

  /**
   * Update user profile data
   */
  const updateProfile = async (profileData: Partial<UserProfile>): Promise<UserProfile> => {
    if (!user) {
      throw new Error('No user is logged in');
    }
    
    try {
      // Update user with new profile data
      const updatedUser: UserProfile = {
        ...user,
        ...profileData,
        // Don't allow overriding these fields
        id: user.id,
        email: user.email,
        createdAt: user.createdAt,
        lastLoginAt: new Date() // Update last login time
      };
      
      // Save and set updated user
      await saveUserProfile(updatedUser);
      setUser(updatedUser);
      
      return updatedUser;
    } catch (err) {
      console.error('Error updating profile:', err);
      Alert.alert('Error', 'Failed to update profile.');
      throw err;
    }
  };

  /**
   * Refresh user profile data
   */
  const refreshUserProfile = useCallback(async (): Promise<void> => {
    await loadUserProfile();
  }, []);

  return {
    user,
    isLoading,
    error,
    isAuthenticated,
    signIn,
    signUp,
    signOut,
    updateProfile,
    refreshUserProfile
  };
} 