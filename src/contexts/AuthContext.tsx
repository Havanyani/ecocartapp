/**
 * AuthContext.tsx
 * 
 * Context provider for authentication state management.
 * Provides authentication state and functions to login, logout, and signup.
 */

import { AuthState, AuthUser, LoginFormData, RegisterFormData, TwoFactorSetupData } from '@/types/auth';
import AsyncStorage from '@react-native-async-storage/async-storage';
import * as LocalAuthentication from 'expo-local-authentication';
import { usePathname, useRouter } from 'expo-router';
import React, { createContext, useCallback, useContext, useEffect, useMemo, useReducer } from 'react';

// Constants
const AUTH_STORAGE_KEY = '@ecocart/auth';
const BIOMETRIC_ENABLED_KEY = '@ecocart/biometric_enabled';
const TWO_FACTOR_ENABLED_KEY = '@ecocart/2fa_enabled';
const TWO_FACTOR_SECRET_KEY = '@ecocart/2fa_secret';

// Initial state
const initialState: AuthState = {
  user: null,
  token: null,
  isLoading: true,
  error: null,
  isBiometricEnabled: false,
  isTwoFactorEnabled: false,
  twoFactorSecret: null,
};

// Action types
type AuthAction =
  | { type: 'AUTH_START' }
  | { type: 'AUTH_SUCCESS'; payload: { user: AuthUser | null; token: string | null } }
  | { type: 'AUTH_FAILURE'; payload: string }
  | { type: 'AUTH_LOGOUT' }
  | { type: 'CLEAR_ERROR' }
  | { type: 'SET_BIOMETRIC_ENABLED'; payload: boolean }
  | { type: 'SET_TWO_FACTOR_ENABLED'; payload: boolean }
  | { type: 'SET_TWO_FACTOR_SECRET'; payload: string | null };

// Reducer
function authReducer(state: AuthState, action: AuthAction): AuthState {
  switch (action.type) {
    case 'AUTH_START':
      return {
        ...state,
        isLoading: true,
        error: null,
      };
    case 'AUTH_SUCCESS':
      return {
        ...state,
        user: action.payload.user,
        token: action.payload.token,
        isLoading: false,
        error: null,
      };
    case 'AUTH_FAILURE':
      return {
        ...state,
        isLoading: false,
        error: action.payload,
      };
    case 'AUTH_LOGOUT':
      return {
        ...initialState,
        isLoading: false,
      };
    case 'CLEAR_ERROR':
      return {
        ...state,
        error: null,
      };
    case 'SET_BIOMETRIC_ENABLED':
      return {
        ...state,
        isBiometricEnabled: action.payload,
      };
    case 'SET_TWO_FACTOR_ENABLED':
      return {
        ...state,
        isTwoFactorEnabled: action.payload,
      };
    case 'SET_TWO_FACTOR_SECRET':
      return {
        ...state,
        twoFactorSecret: action.payload,
      };
    default:
      return state;
  }
}

// Context interface
interface AuthContextValue extends AuthState {
  signIn: (data: LoginFormData) => Promise<void>;
  signUp: (data: RegisterFormData) => Promise<void>;
  signOut: () => Promise<void>;
  clearError: () => void;
  requestPasswordReset: (email: string) => Promise<void>;
  signInWithGoogle: () => Promise<void>;
  signInWithApple: () => Promise<void>;
  signInWithFacebook: () => Promise<void>;
  signInWithTwitter: () => Promise<void>;
  signInWithGithub: () => Promise<void>;
  signInWithMicrosoft: () => Promise<void>;
  enableBiometric: () => Promise<void>;
  disableBiometric: () => Promise<void>;
  authenticateWithBiometric: () => Promise<void>;
  enableTwoFactor: (data: TwoFactorSetupData) => Promise<void>;
  disableTwoFactor: () => Promise<void>;
  verifyTwoFactor: (code: string) => Promise<void>;
  generateTwoFactorSecret: () => Promise<string>;
}

// Create context
const AuthContext = createContext<AuthContextValue | null>(null);

// Provider props
interface AuthProviderProps {
  children: React.ReactNode;
}

// Provider component
export function AuthProvider({ children }: AuthProviderProps) {
  const [state, dispatch] = useReducer(authReducer, initialState);
  const pathname = usePathname();
  const router = useRouter();

  // Load stored auth state and preferences
  useEffect(() => {
    async function loadStoredAuth() {
      try {
        const [storedAuth, biometricEnabled, twoFactorEnabled, twoFactorSecret] = await Promise.all([
          AsyncStorage.getItem(AUTH_STORAGE_KEY),
          AsyncStorage.getItem(BIOMETRIC_ENABLED_KEY),
          AsyncStorage.getItem(TWO_FACTOR_ENABLED_KEY),
          AsyncStorage.getItem(TWO_FACTOR_SECRET_KEY),
        ]);

        if (storedAuth) {
          const { user, token } = JSON.parse(storedAuth);
          dispatch({ type: 'AUTH_SUCCESS', payload: { user, token } });
        } else {
          dispatch({ type: 'AUTH_LOGOUT' });
        }

        if (biometricEnabled) {
          dispatch({ type: 'SET_BIOMETRIC_ENABLED', payload: true });
        }

        if (twoFactorEnabled) {
          dispatch({ type: 'SET_TWO_FACTOR_ENABLED', payload: true });
        }

        if (twoFactorSecret) {
          dispatch({ type: 'SET_TWO_FACTOR_SECRET', payload: twoFactorSecret });
        }
      } catch (error) {
        console.error('Failed to load auth state:', error);
        dispatch({ type: 'AUTH_LOGOUT' });
      }
    }
    loadStoredAuth();
  }, []);

  // Handle routing based on auth state
  useEffect(() => {
    if (state.isLoading) return;

    const inAuthGroup = pathname?.startsWith('/auth');

    if (state.user && state.token) {
      if (inAuthGroup) {
        router.replace('/(tabs)');
      }
    } else {
      if (!inAuthGroup) {
        router.replace('/auth/login');
      }
    }
  }, [state.user, state.token, state.isLoading, pathname, router]);

  // Auth methods
  const signIn = useCallback(async (data: LoginFormData) => {
    try {
      dispatch({ type: 'AUTH_START' });

      // TODO: Replace with actual API call
      await new Promise(resolve => setTimeout(resolve, 1000));
      const mockResponse = {
        user: {
          id: '1',
          email: data.email,
          name: 'John Doe',
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        },
        token: 'mock_token',
      };

      await AsyncStorage.setItem(AUTH_STORAGE_KEY, JSON.stringify(mockResponse));
      dispatch({ type: 'AUTH_SUCCESS', payload: mockResponse });
    } catch (error) {
      dispatch({
        type: 'AUTH_FAILURE',
        payload: error instanceof Error ? error.message : 'Failed to sign in',
      });
      throw error;
    }
  }, []);

  const signUp = useCallback(async (data: RegisterFormData) => {
    try {
      dispatch({ type: 'AUTH_START' });

      // TODO: Replace with actual API call
      await new Promise(resolve => setTimeout(resolve, 1000));
      const mockResponse = {
        user: {
          id: '1',
          email: data.email,
          name: data.name,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        },
        token: 'mock_token',
      };

      await AsyncStorage.setItem(AUTH_STORAGE_KEY, JSON.stringify(mockResponse));
      dispatch({ type: 'AUTH_SUCCESS', payload: mockResponse });
    } catch (error) {
      dispatch({
        type: 'AUTH_FAILURE',
        payload: error instanceof Error ? error.message : 'Failed to sign up',
      });
      throw error;
    }
  }, []);

  const signOut = useCallback(async () => {
    try {
      await AsyncStorage.removeItem(AUTH_STORAGE_KEY);
      dispatch({ type: 'AUTH_LOGOUT' });
    } catch (error) {
      console.error('Failed to sign out:', error);
    }
  }, []);

  const clearError = useCallback(() => {
    dispatch({ type: 'CLEAR_ERROR' });
  }, []);

  const requestPasswordReset = useCallback(async (email: string) => {
    try {
      dispatch({ type: 'AUTH_START' });

      // TODO: Replace with actual API call
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      // Simulate successful request without user/token
      dispatch({ type: 'AUTH_SUCCESS', payload: { user: null, token: null } });
    } catch (error) {
      dispatch({
        type: 'AUTH_FAILURE',
        payload: error instanceof Error ? error.message : 'Failed to request password reset',
      });
      throw error;
    }
  }, []);

  const signInWithGoogle = useCallback(async () => {
    try {
      dispatch({ type: 'AUTH_START' });

      // TODO: Implement Google Sign In
      await new Promise(resolve => setTimeout(resolve, 1000));
      const mockResponse = {
        user: {
          id: '1',
          email: 'user@example.com',
          name: 'John Doe',
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        },
        token: 'mock_token',
      };

      await AsyncStorage.setItem(AUTH_STORAGE_KEY, JSON.stringify(mockResponse));
      dispatch({ type: 'AUTH_SUCCESS', payload: mockResponse });
    } catch (error) {
      dispatch({
        type: 'AUTH_FAILURE',
        payload: error instanceof Error ? error.message : 'Failed to sign in with Google',
      });
      throw error;
    }
  }, []);

  const signInWithApple = useCallback(async () => {
    try {
      dispatch({ type: 'AUTH_START' });

      // TODO: Implement Apple Sign In
      await new Promise(resolve => setTimeout(resolve, 1000));
      const mockResponse = {
        user: {
          id: '1',
          email: 'user@example.com',
          name: 'John Doe',
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        },
        token: 'mock_token',
      };

      await AsyncStorage.setItem(AUTH_STORAGE_KEY, JSON.stringify(mockResponse));
      dispatch({ type: 'AUTH_SUCCESS', payload: mockResponse });
    } catch (error) {
      dispatch({
        type: 'AUTH_FAILURE',
        payload: error instanceof Error ? error.message : 'Failed to sign in with Apple',
      });
      throw error;
    }
  }, []);

  const signInWithFacebook = useCallback(async () => {
    try {
      dispatch({ type: 'AUTH_START' });

      // TODO: Implement Facebook Sign In
      await new Promise(resolve => setTimeout(resolve, 1000));
      const mockResponse = {
        user: {
          id: '1',
          email: 'user@example.com',
          name: 'John Doe',
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        },
        token: 'mock_token',
      };

      await AsyncStorage.setItem(AUTH_STORAGE_KEY, JSON.stringify(mockResponse));
      dispatch({ type: 'AUTH_SUCCESS', payload: mockResponse });
    } catch (error) {
      dispatch({
        type: 'AUTH_FAILURE',
        payload: error instanceof Error ? error.message : 'Failed to sign in with Facebook',
      });
      throw error;
    }
  }, []);

  const signInWithTwitter = useCallback(async () => {
    try {
      dispatch({ type: 'AUTH_START' });

      // TODO: Implement Twitter Sign In
      await new Promise(resolve => setTimeout(resolve, 1000));
      const mockResponse = {
        user: {
          id: '1',
          email: 'user@example.com',
          name: 'John Doe',
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        },
        token: 'mock_token',
      };

      await AsyncStorage.setItem(AUTH_STORAGE_KEY, JSON.stringify(mockResponse));
      dispatch({ type: 'AUTH_SUCCESS', payload: mockResponse });
    } catch (error) {
      dispatch({
        type: 'AUTH_FAILURE',
        payload: error instanceof Error ? error.message : 'Failed to sign in with Twitter',
      });
      throw error;
    }
  }, []);

  const signInWithGithub = useCallback(async () => {
    try {
      dispatch({ type: 'AUTH_START' });

      // TODO: Implement GitHub Sign In
      await new Promise(resolve => setTimeout(resolve, 1000));
      const mockResponse = {
        user: {
          id: '1',
          email: 'user@example.com',
          name: 'John Doe',
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        },
        token: 'mock_token',
      };

      await AsyncStorage.setItem(AUTH_STORAGE_KEY, JSON.stringify(mockResponse));
      dispatch({ type: 'AUTH_SUCCESS', payload: mockResponse });
    } catch (error) {
      dispatch({
        type: 'AUTH_FAILURE',
        payload: error instanceof Error ? error.message : 'Failed to sign in with GitHub',
      });
      throw error;
    }
  }, []);

  const signInWithMicrosoft = useCallback(async () => {
    try {
      dispatch({ type: 'AUTH_START' });

      // TODO: Implement Microsoft Sign In
      await new Promise(resolve => setTimeout(resolve, 1000));
      const mockResponse = {
        user: {
          id: '1',
          email: 'user@example.com',
          name: 'John Doe',
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        },
        token: 'mock_token',
      };

      await AsyncStorage.setItem(AUTH_STORAGE_KEY, JSON.stringify(mockResponse));
      dispatch({ type: 'AUTH_SUCCESS', payload: mockResponse });
    } catch (error) {
      dispatch({
        type: 'AUTH_FAILURE',
        payload: error instanceof Error ? error.message : 'Failed to sign in with Microsoft',
      });
      throw error;
    }
  }, []);

  const enableBiometric = useCallback(async () => {
    try {
      const hasHardware = await LocalAuthentication.hasHardwareAsync();
      const isEnrolled = await LocalAuthentication.isEnrolledAsync();

      if (!hasHardware || !isEnrolled) {
        throw new Error('Biometric authentication is not available on this device');
      }

      await AsyncStorage.setItem(BIOMETRIC_ENABLED_KEY, 'true');
      dispatch({ type: 'SET_BIOMETRIC_ENABLED', payload: true });
    } catch (error) {
      dispatch({
        type: 'AUTH_FAILURE',
        payload: error instanceof Error ? error.message : 'Failed to enable biometric authentication',
      });
      throw error;
    }
  }, []);

  const disableBiometric = useCallback(async () => {
    try {
      await AsyncStorage.removeItem(BIOMETRIC_ENABLED_KEY);
      dispatch({ type: 'SET_BIOMETRIC_ENABLED', payload: false });
    } catch (error) {
      console.error('Failed to disable biometric authentication:', error);
    }
  }, []);

  const authenticateWithBiometric = useCallback(async () => {
    try {
      const result = await LocalAuthentication.authenticateAsync({
        promptMessage: 'Authenticate to access your account',
        fallbackLabel: 'Use password',
      });

      if (result.success) {
        const storedAuth = await AsyncStorage.getItem(AUTH_STORAGE_KEY);
        if (storedAuth) {
          const { user, token } = JSON.parse(storedAuth);
          dispatch({ type: 'AUTH_SUCCESS', payload: { user, token } });
          router.replace('/(tabs)');
        }
      } else {
        throw new Error('Biometric authentication failed');
      }
    } catch (error) {
      dispatch({
        type: 'AUTH_FAILURE',
        payload: error instanceof Error ? error.message : 'Failed to authenticate with biometric',
      });
      throw error;
    }
  }, [router]);

  const enableTwoFactor = useCallback(async (data: TwoFactorSetupData) => {
    try {
      // TODO: Implement 2FA setup verification
      await new Promise(resolve => setTimeout(resolve, 1000));
      await AsyncStorage.setItem(TWO_FACTOR_ENABLED_KEY, 'true');
      dispatch({ type: 'SET_TWO_FACTOR_ENABLED', payload: true });
    } catch (error) {
      dispatch({
        type: 'AUTH_FAILURE',
        payload: error instanceof Error ? error.message : 'Failed to enable 2FA',
      });
      throw error;
    }
  }, []);

  const disableTwoFactor = useCallback(async () => {
    try {
      await Promise.all([
        AsyncStorage.removeItem(TWO_FACTOR_ENABLED_KEY),
        AsyncStorage.removeItem(TWO_FACTOR_SECRET_KEY),
      ]);
      dispatch({ type: 'SET_TWO_FACTOR_ENABLED', payload: false });
      dispatch({ type: 'SET_TWO_FACTOR_SECRET', payload: null });
    } catch (error) {
      console.error('Failed to disable 2FA:', error);
    }
  }, []);

  const verifyTwoFactor = useCallback(async (code: string) => {
    try {
      // TODO: Implement 2FA code verification
      await new Promise(resolve => setTimeout(resolve, 1000));
      if (code !== '123456') { // Mock verification
        throw new Error('Invalid 2FA code');
      }
    } catch (error) {
      dispatch({
        type: 'AUTH_FAILURE',
        payload: error instanceof Error ? error.message : 'Failed to verify 2FA code',
      });
      throw error;
    }
  }, []);

  const generateTwoFactorSecret = useCallback(async () => {
    try {
      // TODO: Implement 2FA secret generation
      await new Promise(resolve => setTimeout(resolve, 1000));
      const secret = 'JBSWY3DPEHPK3PXP'; // Mock secret
      await AsyncStorage.setItem(TWO_FACTOR_SECRET_KEY, secret);
      dispatch({ type: 'SET_TWO_FACTOR_SECRET', payload: secret });
      return secret;
    } catch (error) {
      dispatch({
        type: 'AUTH_FAILURE',
        payload: error instanceof Error ? error.message : 'Failed to generate 2FA secret',
      });
      throw error;
    }
  }, []);

  const value = useMemo(
    () => ({
      ...state,
      signIn,
      signUp,
      signOut,
      clearError,
      requestPasswordReset,
      signInWithGoogle,
      signInWithApple,
      signInWithFacebook,
      signInWithTwitter,
      signInWithGithub,
      signInWithMicrosoft,
      enableBiometric,
      disableBiometric,
      authenticateWithBiometric,
      enableTwoFactor,
      disableTwoFactor,
      verifyTwoFactor,
      generateTwoFactorSecret,
    }),
    [
      state,
      signIn,
      signUp,
      signOut,
      clearError,
      requestPasswordReset,
      signInWithGoogle,
      signInWithApple,
      signInWithFacebook,
      signInWithTwitter,
      signInWithGithub,
      signInWithMicrosoft,
      enableBiometric,
      disableBiometric,
      authenticateWithBiometric,
      enableTwoFactor,
      disableTwoFactor,
      verifyTwoFactor,
      generateTwoFactorSecret,
    ]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

// Hook
export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}

export default AuthContext; 