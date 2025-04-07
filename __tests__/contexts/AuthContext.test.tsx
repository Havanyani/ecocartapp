import AsyncStorage from '@react-native-async-storage/async-storage';
import { act, renderHook } from '@testing-library/react-hooks';
import React from 'react';
import { AuthProvider, useAuth } from '../../src/contexts/AuthContext';

// Mock AsyncStorage
jest.mock('@react-native-async-storage/async-storage', () => ({
  getItem: jest.fn(),
  setItem: jest.fn(),
  removeItem: jest.fn(),
  clear: jest.fn(),
}));

// Mock Expo Local Authentication
jest.mock('expo-local-authentication', () => ({
  authenticateAsync: jest.fn(),
  hasHardwareAsync: jest.fn().mockResolvedValue(true),
  isEnrolledAsync: jest.fn().mockResolvedValue(true),
  supportedAuthenticationTypesAsync: jest.fn().mockResolvedValue([1, 2]),
}));

describe('AuthContext', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    // Start with no stored auth data
    (AsyncStorage.getItem as jest.Mock).mockResolvedValue(null);
  });

  it('should provide initial unauthenticated state', async () => {
    const wrapper = ({ children }: { children: React.ReactNode }) => (
      <AuthProvider>{children}</AuthProvider>
    );
    
    const { result, waitForNextUpdate } = renderHook(() => useAuth(), { wrapper });
    
    await waitForNextUpdate(); // Wait for initial auth state check
    
    expect(result.current.isAuthenticated).toBe(false);
    expect(result.current.user).toBeNull();
    expect(result.current.isLoading).toBe(false);
  });

  it('should handle login and store auth data', async () => {
    const wrapper = ({ children }: { children: React.ReactNode }) => (
      <AuthProvider>{children}</AuthProvider>
    );
    
    const { result, waitForNextUpdate } = renderHook(() => useAuth(), { wrapper });
    
    await waitForNextUpdate(); // Wait for initial auth state check
    
    const testCredentials = {
      email: 'test@example.com',
      password: 'Test@123'
    };
    
    await act(async () => {
      await result.current.signIn(testCredentials);
    });
    
    expect(result.current.isAuthenticated).toBe(true);
    expect(result.current.user).not.toBeNull();
    expect(result.current.user?.email).toBe(testCredentials.email);
    expect(AsyncStorage.setItem).toHaveBeenCalledWith(
      expect.any(String),
      expect.any(String)
    );
    expect(result.current.error).toBeNull();
  });

  it('should handle login failure', async () => {
    const wrapper = ({ children }: { children: React.ReactNode }) => (
      <AuthProvider>{children}</AuthProvider>
    );
    
    const { result, waitForNextUpdate } = renderHook(() => useAuth(), { wrapper });
    
    await waitForNextUpdate(); // Wait for initial auth state check
    
    const testCredentials = {
      email: 'test@example.com',
      password: 'wrongpassword'
    };
    
    // Override the mock AuthContext's signIn method
    const originalSignIn = result.current.signIn;
    result.current.signIn = jest.fn().mockImplementation(() => {
      throw new Error('Invalid credentials');
    });
    
    await act(async () => {
      try {
        await result.current.signIn(testCredentials);
      } catch (error) {
        // Expected to throw
      }
    });
    
    expect(result.current.isAuthenticated).toBe(false);
    expect(result.current.user).toBeNull();
    expect(result.current.error).not.toBeNull();
    
    // Restore original method
    result.current.signIn = originalSignIn;
  });

  it('should handle logout', async () => {
    // Mock a stored auth session
    (AsyncStorage.getItem as jest.Mock).mockResolvedValueOnce(
      JSON.stringify({
        token: 'valid-token',
        user: { id: '123', email: 'test@example.com', name: 'Test User' }
      })
    );
    
    const wrapper = ({ children }: { children: React.ReactNode }) => (
      <AuthProvider>{children}</AuthProvider>
    );
    
    const { result, waitForNextUpdate } = renderHook(() => useAuth(), { wrapper });
    
    await waitForNextUpdate(); // Wait for initial auth state check
    
    // Initial state should be authenticated
    expect(result.current.isAuthenticated).toBe(true);
    expect(result.current.user).not.toBeNull();
    
    await act(async () => {
      await result.current.signOut();
    });
    
    expect(result.current.isAuthenticated).toBe(false);
    expect(result.current.user).toBeNull();
    expect(AsyncStorage.removeItem).toHaveBeenCalled();
  });

  it('should handle signup and store auth data', async () => {
    const wrapper = ({ children }: { children: React.ReactNode }) => (
      <AuthProvider>{children}</AuthProvider>
    );
    
    const { result, waitForNextUpdate } = renderHook(() => useAuth(), { wrapper });
    
    await waitForNextUpdate(); // Wait for initial auth state check
    
    const testSignupData = {
      email: 'newuser@example.com',
      password: 'NewPassword@123',
      name: 'New User',
      confirmPassword: 'NewPassword@123'
    };
    
    await act(async () => {
      await result.current.signUp(testSignupData);
    });
    
    expect(result.current.isAuthenticated).toBe(true);
    expect(result.current.user).not.toBeNull();
    expect(result.current.user?.email).toBe(testSignupData.email);
    expect(result.current.user?.name).toBe(testSignupData.name);
    expect(AsyncStorage.setItem).toHaveBeenCalledWith(
      expect.any(String),
      expect.any(String)
    );
  });

  it('should handle biometric authentication', async () => {
    // Mock a stored auth session with biometrics enabled
    (AsyncStorage.getItem as jest.Mock).mockImplementation((key) => {
      if (key === 'AUTH_STATE') {
        return Promise.resolve(
          JSON.stringify({
            token: 'valid-token',
            user: { id: '123', email: 'test@example.com', name: 'Test User' }
          })
        );
      }
      if (key === 'AUTH_BIOMETRICS_ENABLED') {
        return Promise.resolve('true');
      }
      return Promise.resolve(null);
    });
    
    const wrapper = ({ children }: { children: React.ReactNode }) => (
      <AuthProvider>{children}</AuthProvider>
    );
    
    const { result, waitForNextUpdate } = renderHook(() => useAuth(), { wrapper });
    
    await waitForNextUpdate(); // Wait for initial auth state check
    
    // Initial state should have biometrics enabled
    expect(result.current.isBiometricsEnabled).toBe(true);
    
    await act(async () => {
      await result.current.toggleBiometrics(false);
    });
    
    expect(result.current.isBiometricsEnabled).toBe(false);
    expect(AsyncStorage.setItem).toHaveBeenCalledWith('AUTH_BIOMETRICS_ENABLED', 'false');
  });
}); 