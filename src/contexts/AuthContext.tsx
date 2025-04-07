/**
 * AuthContext.tsx
 * 
 * Context provider for authentication state management.
 * Provides authentication state and functions to login, logout, and signup.
 */

import authService from '@/services/AuthService';
import { AuthState, AuthUser, LoginFormData, RegisterFormData, TwoFactorSetupData } from '@/types/auth';
import AsyncStorage from '@react-native-async-storage/async-storage';
import * as LocalAuthentication from 'expo-local-authentication';
import { useRouter, useSegments } from 'expo-router';
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
  isAuthenticated: false,
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
        isAuthenticated: true,
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
  const router = useRouter();
  const segments = useSegments();

  // Load stored auth state and preferences
  useEffect(() => {
    async function loadStoredAuth() {
      try {
        dispatch({ type: 'AUTH_START' });
        
        // Check if user is logged in
        const isLoggedIn = await authService.isLoggedIn();
        
        if (isLoggedIn) {
          // Get current user and set state
          const user = await authService.getCurrentUser();
          const token = await authService.getAuthToken();
          
          if (user && token) {
            dispatch({ 
              type: 'AUTH_SUCCESS', 
              payload: { 
                user, 
                token 
              } 
            });
          } else {
            dispatch({ type: 'AUTH_LOGOUT' });
          }
        } else {
          dispatch({ type: 'AUTH_LOGOUT' });
        }
        
        // Load biometric preferences
        const isBiometricEnabled = await authService.isBiometricEnabled();
        dispatch({ 
          type: 'SET_BIOMETRIC_ENABLED', 
          payload: isBiometricEnabled 
        });
        
        // Load 2FA settings
        const [twoFactorEnabled, twoFactorSecret] = await Promise.all([
          AsyncStorage.getItem(TWO_FACTOR_ENABLED_KEY),
          AsyncStorage.getItem(TWO_FACTOR_SECRET_KEY),
        ]);
        
        if (twoFactorEnabled === 'true') {
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

  // Handle navigation based on auth state
  useEffect(() => {
    if (state.isLoading) return;

    const inAuthGroup = segments[0] === '(auth)';
    
    if (state.isAuthenticated && inAuthGroup) {
      router.replace('/(app)');
    } else if (!state.isAuthenticated && !inAuthGroup) {
      router.replace('/(auth)');
    }
  }, [state.isAuthenticated, segments, state.isLoading]);

  // Auth methods
  const signIn = useCallback(async (data: LoginFormData) => {
    try {
      dispatch({ type: 'AUTH_START' });
      
      // Handle 2FA if enabled
      if (state.isTwoFactorEnabled && !data.twoFactorCode) {
        dispatch({ 
          type: 'AUTH_FAILURE', 
          payload: 'Two-factor authentication code is required' 
        });
        return;
      }
      
      // Call auth service to login
      const result = await authService.login(data);
      
      // Store auth data for persistence
      await AsyncStorage.setItem(AUTH_STORAGE_KEY, JSON.stringify({
        user: result.user,
        token: result.token
      }));
      
      dispatch({ 
        type: 'AUTH_SUCCESS', 
        payload: { 
          user: result.user, 
          token: result.token 
        } 
      });
    } catch (error) {
      dispatch({
        type: 'AUTH_FAILURE',
        payload: error instanceof Error ? error.message : 'Failed to sign in',
      });
      throw error;
    }
  }, [state.isTwoFactorEnabled]);

  const signUp = useCallback(async (data: RegisterFormData) => {
    try {
      dispatch({ type: 'AUTH_START' });
      
      // Call auth service to register
      const result = await authService.register(data);
      
      // Store auth data for persistence
      await AsyncStorage.setItem(AUTH_STORAGE_KEY, JSON.stringify({
        user: result.user,
        token: result.token
      }));
      
      dispatch({ 
        type: 'AUTH_SUCCESS', 
        payload: { 
          user: result.user, 
          token: result.token 
        } 
      });
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
      await authService.logout();
      await AsyncStorage.removeItem(AUTH_STORAGE_KEY);
      dispatch({ type: 'AUTH_LOGOUT' });
      router.replace('/(auth)/login');
    } catch (error) {
      console.error('Failed to sign out:', error);
    }
  }, [router]);

  const clearError = useCallback(() => {
    dispatch({ type: 'CLEAR_ERROR' });
  }, []);

  const requestPasswordReset = useCallback(async (email: string) => {
    try {
      dispatch({ type: 'AUTH_START' });
      await authService.requestPasswordReset(email);
      dispatch({ type: 'CLEAR_ERROR' });
    } catch (error) {
      dispatch({
        type: 'AUTH_FAILURE',
        payload: error instanceof Error ? error.message : 'Failed to request password reset',
      });
      throw error;
    }
  }, []);

  // Social authentication methods
  const signInWithGoogle = useCallback(async () => {
    try {
      dispatch({ type: 'AUTH_START' });
      
      const result = await authService.signInWithGoogle();
      
      if (!result) {
        dispatch({ 
          type: 'AUTH_FAILURE', 
          payload: 'Google sign-in was canceled or failed' 
        });
        return;
      }
      
      await AsyncStorage.setItem(AUTH_STORAGE_KEY, JSON.stringify({
        user: result.user,
        token: result.token
      }));
      
      dispatch({ 
        type: 'AUTH_SUCCESS', 
        payload: { 
          user: result.user, 
          token: result.token 
        } 
      });
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
      
      const result = await authService.signInWithApple();
      
      if (!result) {
        dispatch({ 
          type: 'AUTH_FAILURE', 
          payload: 'Apple sign-in was canceled or failed' 
        });
        return;
      }
      
      await AsyncStorage.setItem(AUTH_STORAGE_KEY, JSON.stringify({
        user: result.user,
        token: result.token
      }));
      
      dispatch({ 
        type: 'AUTH_SUCCESS', 
        payload: { 
          user: result.user, 
          token: result.token 
        } 
      });
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
      
      const result = await authService.signInWithFacebook();
      
      if (!result) {
        dispatch({ 
          type: 'AUTH_FAILURE', 
          payload: 'Facebook sign-in was canceled or failed' 
        });
        return;
      }
      
      await AsyncStorage.setItem(AUTH_STORAGE_KEY, JSON.stringify({
        user: result.user,
        token: result.token
      }));
      
      dispatch({ 
        type: 'AUTH_SUCCESS', 
        payload: { 
          user: result.user, 
          token: result.token 
        } 
      });
    } catch (error) {
      dispatch({
        type: 'AUTH_FAILURE',
        payload: error instanceof Error ? error.message : 'Failed to sign in with Facebook',
      });
      throw error;
    }
  }, []);

  // Other social sign-in methods (not implemented yet)
  const signInWithTwitter = useCallback(async () => {
    dispatch({
      type: 'AUTH_FAILURE',
      payload: 'Twitter sign-in is not implemented yet',
    });
  }, []);

  const signInWithGithub = useCallback(async () => {
    dispatch({
      type: 'AUTH_FAILURE',
      payload: 'GitHub sign-in is not implemented yet',
    });
  }, []);

  const signInWithMicrosoft = useCallback(async () => {
    dispatch({
      type: 'AUTH_FAILURE',
      payload: 'Microsoft sign-in is not implemented yet',
    });
  }, []);

  // Biometric authentication
  const enableBiometric = useCallback(async () => {
    try {
      dispatch({ type: 'AUTH_START' });
      
      // Check if biometric hardware is available
      const isBiometricAvailable = await authService.isBiometricAvailable();
      
      if (!isBiometricAvailable) {
        dispatch({
          type: 'AUTH_FAILURE',
          payload: 'Biometric authentication is not available on this device',
        });
        return;
      }
      
      // Get stored credentials
      const storedAuth = await AsyncStorage.getItem(AUTH_STORAGE_KEY);
      
      if (!storedAuth) {
        dispatch({
          type: 'AUTH_FAILURE',
          payload: 'You need to be logged in to enable biometric authentication',
        });
        return;
      }
      
      const { user } = JSON.parse(storedAuth);
      
      // Authenticate with biometrics to confirm
      const result = await LocalAuthentication.authenticateAsync({
        promptMessage: 'Authenticate to enable biometric login',
        fallbackLabel: 'Use Password',
      });
      
      if (result.success) {
        // Enable biometric in auth service
        const success = await authService.enableBiometric(
          user.email,
          // For security, we'll prompt for password again separately if needed
          'USE_STORED_CREDENTIALS'
        );
        
        if (success) {
          await AsyncStorage.setItem(BIOMETRIC_ENABLED_KEY, 'true');
          dispatch({ type: 'SET_BIOMETRIC_ENABLED', payload: true });
        } else {
          throw new Error('Failed to enable biometric authentication');
        }
      } else {
        throw new Error('Biometric authentication failed');
      }
    } catch (error) {
      dispatch({
        type: 'AUTH_FAILURE',
        payload: error instanceof Error ? error.message : 'Failed to enable biometric authentication',
      });
    }
  }, []);

  const disableBiometric = useCallback(async () => {
    try {
      const success = await authService.disableBiometric();
      
      if (success) {
        await AsyncStorage.removeItem(BIOMETRIC_ENABLED_KEY);
        dispatch({ type: 'SET_BIOMETRIC_ENABLED', payload: false });
      } else {
        throw new Error('Failed to disable biometric authentication');
      }
    } catch (error) {
      dispatch({
        type: 'AUTH_FAILURE',
        payload: error instanceof Error ? error.message : 'Failed to disable biometric authentication',
      });
    }
  }, []);

  const authenticateWithBiometric = useCallback(async () => {
    try {
      dispatch({ type: 'AUTH_START' });
      
      // Authenticate with biometrics
      const result = await authService.authenticateWithBiometric();
      
      if (!result) {
        dispatch({
          type: 'AUTH_FAILURE',
          payload: 'Biometric authentication failed',
        });
        return;
      }
      
      // Store auth data for persistence
      await AsyncStorage.setItem(AUTH_STORAGE_KEY, JSON.stringify({
        user: result.user,
        token: result.token
      }));
      
      dispatch({ 
        type: 'AUTH_SUCCESS', 
        payload: { 
          user: result.user, 
          token: result.token 
        } 
      });
    } catch (error) {
      dispatch({
        type: 'AUTH_FAILURE',
        payload: error instanceof Error ? error.message : 'Failed to authenticate with biometrics',
      });
      throw error;
    }
  }, []);

  // Two-factor authentication
  const generateTwoFactorSecret = useCallback(async () => {
    // This would typically call an API endpoint that generates a new TOTP secret
    // For now, we'll mock this
    const mockSecret = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ234567';
    await AsyncStorage.setItem(TWO_FACTOR_SECRET_KEY, mockSecret);
    dispatch({ type: 'SET_TWO_FACTOR_SECRET', payload: mockSecret });
    return mockSecret;
  }, []);

  const enableTwoFactor = useCallback(async (data: TwoFactorSetupData) => {
    try {
      dispatch({ type: 'AUTH_START' });
      
      // This would typically call an API endpoint to verify the TOTP code and enable 2FA
      // For now, we'll mock this
      if (data.code === '123456') {
        await AsyncStorage.setItem(TWO_FACTOR_ENABLED_KEY, 'true');
        await AsyncStorage.setItem(TWO_FACTOR_SECRET_KEY, data.secret);
        
        dispatch({ type: 'SET_TWO_FACTOR_ENABLED', payload: true });
        dispatch({ type: 'SET_TWO_FACTOR_SECRET', payload: data.secret });
      } else {
        throw new Error('Invalid two-factor code');
      }
    } catch (error) {
      dispatch({
        type: 'AUTH_FAILURE',
        payload: error instanceof Error ? error.message : 'Failed to enable two-factor authentication',
      });
      throw error;
    }
  }, []);

  const disableTwoFactor = useCallback(async () => {
    try {
      dispatch({ type: 'AUTH_START' });
      
      // This would typically call an API endpoint to disable 2FA
      // For now, we'll mock this
      await AsyncStorage.removeItem(TWO_FACTOR_ENABLED_KEY);
      await AsyncStorage.removeItem(TWO_FACTOR_SECRET_KEY);
      
      dispatch({ type: 'SET_TWO_FACTOR_ENABLED', payload: false });
      dispatch({ type: 'SET_TWO_FACTOR_SECRET', payload: null });
    } catch (error) {
      dispatch({
        type: 'AUTH_FAILURE',
        payload: error instanceof Error ? error.message : 'Failed to disable two-factor authentication',
      });
      throw error;
    }
  }, []);

  const verifyTwoFactor = useCallback(async (code: string) => {
    try {
      dispatch({ type: 'AUTH_START' });
      
      // This would typically call an API endpoint to verify the TOTP code
      // For now, we'll mock this
      if (code === '123456') {
        dispatch({ type: 'CLEAR_ERROR' });
        return;
      }
      
      throw new Error('Invalid two-factor code');
    } catch (error) {
      dispatch({
        type: 'AUTH_FAILURE',
        payload: error instanceof Error ? error.message : 'Failed to verify two-factor code',
      });
      throw error;
    }
  }, []);

  // Memoize context value
  const contextValue = useMemo<AuthContextValue>(
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

  return <AuthContext.Provider value={contextValue}>{children}</AuthContext.Provider>;
}

// Hook to use auth context
export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}

export default AuthContext; 