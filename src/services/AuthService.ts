/**
 * AuthService.ts
 * 
 * Service for handling authentication-related API calls
 */

import apiClient from '@/api/ApiClient';
import {
    AuthUser,
    LoginFormData,
    RegisterFormData,
    ResetPasswordFormData
} from '@/types/auth';
import { secureStorage } from '@/utils/SecureStorage';
import * as AppleAuthentication from 'expo-apple-authentication';
import * as Facebook from 'expo-auth-session/providers/facebook';
import * as Google from 'expo-auth-session/providers/google';
import * as LocalAuthentication from 'expo-local-authentication';
import * as WebBrowser from 'expo-web-browser';
import { Platform } from 'react-native';

// Constants for token storage
const AUTH_TOKEN_KEY = 'auth_token';
const REFRESH_TOKEN_KEY = 'refresh_token';
const BIOMETRIC_ENABLED_KEY = 'biometric_enabled';
const USER_CREDENTIALS_KEY = 'user_credentials';

// Auto-close auth session
WebBrowser.maybeCompleteAuthSession();

/**
 * Auth Service for handling all authentication operations
 */
export class AuthService {
  private static instance: AuthService;
  
  private constructor() {}
  
  /**
   * Get singleton instance
   */
  public static getInstance(): AuthService {
    if (!this.instance) {
      this.instance = new AuthService();
    }
    return this.instance;
  }
  
  /**
   * Log in with email and password
   */
  public async login(data: LoginFormData): Promise<{ user: AuthUser; token: string }> {
    const response = await apiClient.post<{ user: AuthUser; token: string; refreshToken: string }>(
      '/auth/login', 
      data
    );
    
    if (response.data) {
      // Store tokens
      await this.storeTokens(response.data.token, response.data.refreshToken);
      
      // Set auth token in API client
      apiClient.setAuthToken(response.data.token);
      apiClient.setRefreshToken(response.data.refreshToken);
      
      return {
        user: response.data.user,
        token: response.data.token
      };
    }
    
    throw new Error('Failed to log in');
  }
  
  /**
   * Register a new user
   */
  public async register(data: RegisterFormData): Promise<{ user: AuthUser; token: string }> {
    const response = await apiClient.post<{ user: AuthUser; token: string; refreshToken: string }>(
      '/auth/register', 
      data
    );
    
    if (response.data) {
      // Store tokens
      await this.storeTokens(response.data.token, response.data.refreshToken);
      
      // Set auth token in API client
      apiClient.setAuthToken(response.data.token);
      apiClient.setRefreshToken(response.data.refreshToken);
      
      return {
        user: response.data.user,
        token: response.data.token
      };
    }
    
    throw new Error('Failed to register');
  }
  
  /**
   * Log out the current user
   */
  public async logout(): Promise<void> {
    try {
      // Attempt to notify the server
      await apiClient.post('/auth/logout');
    } catch (error) {
      console.warn('Error notifying server about logout:', error);
    }
    
    // Clear tokens regardless of server response
    await this.clearTokens();
    
    // Clear tokens in API client
    apiClient.setAuthToken(null);
    apiClient.setRefreshToken(null);
  }
  
  /**
   * Request a password reset
   */
  public async requestPasswordReset(email: string): Promise<boolean> {
    const response = await apiClient.post<{ success: boolean }>(
      '/auth/forgot-password',
      { email }
    );
    
    return response.data?.success || false;
  }
  
  /**
   * Reset password with token
   */
  public async resetPassword(data: ResetPasswordFormData): Promise<boolean> {
    const response = await apiClient.post<{ success: boolean }>(
      '/auth/reset-password',
      data
    );
    
    return response.data?.success || false;
  }
  
  /**
   * Get the current auth token
   */
  public async getAuthToken(): Promise<string | null> {
    return await secureStorage.getItem(AUTH_TOKEN_KEY);
  }
  
  /**
   * Refresh the auth token using the refresh token
   */
  public async refreshToken(): Promise<string | null> {
    try {
      const refreshToken = await secureStorage.getItem(REFRESH_TOKEN_KEY);
      
      if (!refreshToken) {
        return null;
      }
      
      const response = await apiClient.post<{ token: string; refreshToken: string }>(
        '/auth/refresh-token',
        { refreshToken }
      );
      
      if (response.data) {
        // Store new tokens
        await this.storeTokens(response.data.token, response.data.refreshToken);
        
        // Update token in API client
        apiClient.setAuthToken(response.data.token);
        
        return response.data.token;
      }
      
      return null;
    } catch (error) {
      console.error('Failed to refresh token:', error);
      await this.clearTokens();
      return null;
    }
  }
  
  /**
   * Check if the user is logged in by verifying the token
   */
  public async isLoggedIn(): Promise<boolean> {
    try {
      const token = await secureStorage.getItem(AUTH_TOKEN_KEY);
      
      if (!token) {
        return false;
      }
      
      // Verify token with the server
      const response = await apiClient.post<{ valid: boolean }>(
        '/auth/verify-token',
        {},
        {
          headers: {
            Authorization: `Bearer ${token}`
          }
        }
      );
      
      if (response.data?.valid) {
        apiClient.setAuthToken(token);
        return true;
      }
      
      // If token is invalid, try to refresh it
      const newToken = await this.refreshToken();
      return !!newToken;
    } catch (error) {
      console.error('Error checking login status:', error);
      return false;
    }
  }
  
  /**
   * Get the current user
   */
  public async getCurrentUser(): Promise<AuthUser | null> {
    try {
      const token = await secureStorage.getItem(AUTH_TOKEN_KEY);
      
      if (!token) {
        return null;
      }
      
      apiClient.setAuthToken(token);
      
      const response = await apiClient.get<{ user: AuthUser }>('/auth/me');
      return response.data?.user || null;
    } catch (error) {
      console.error('Error getting current user:', error);
      return null;
    }
  }
  
  // === Social Authentication ===
  
  /**
   * Sign in with Google
   */
  public async signInWithGoogle(): Promise<{ user: AuthUser; token: string } | null> {
    try {
      const [request, response, promptAsync] = Google.useAuthRequest({
        clientId: 'YOUR_WEB_CLIENT_ID',
        androidClientId: 'YOUR_ANDROID_CLIENT_ID',
        iosClientId: 'YOUR_IOS_CLIENT_ID',
      });
      
      if (response?.type === 'success') {
        const { authentication } = response;
        
        // Exchange the code for tokens on your server
        const authResponse = await apiClient.post<{ user: AuthUser; token: string; refreshToken: string }>(
          '/auth/google',
          { token: authentication?.accessToken }
        );
        
        if (authResponse.data) {
          // Store tokens
          await this.storeTokens(authResponse.data.token, authResponse.data.refreshToken);
          
          // Set auth token in API client
          apiClient.setAuthToken(authResponse.data.token);
          
          return {
            user: authResponse.data.user,
            token: authResponse.data.token
          };
        }
      } else {
        await promptAsync();
      }
      
      return null;
    } catch (error) {
      console.error('Google sign-in error:', error);
      throw error;
    }
  }
  
  /**
   * Sign in with Apple
   */
  public async signInWithApple(): Promise<{ user: AuthUser; token: string } | null> {
    try {
      // Check if Apple authentication is available on this device
      const isAvailable = await AppleAuthentication.isAvailableAsync();
      
      if (Platform.OS === 'ios' && isAvailable) {
        const credential = await AppleAuthentication.signInAsync({
          requestedScopes: [
            AppleAuthentication.AppleAuthenticationScope.FULL_NAME,
            AppleAuthentication.AppleAuthenticationScope.EMAIL,
          ],
        });
        
        // Exchange the identity token for your own auth token
        const authResponse = await apiClient.post<{ user: AuthUser; token: string; refreshToken: string }>(
          '/auth/apple',
          { identityToken: credential.identityToken }
        );
        
        if (authResponse.data) {
          // Store tokens
          await this.storeTokens(authResponse.data.token, authResponse.data.refreshToken);
          
          // Set auth token in API client
          apiClient.setAuthToken(authResponse.data.token);
          
          return {
            user: authResponse.data.user,
            token: authResponse.data.token
          };
        }
      } else {
        throw new Error('Apple Sign In is not available on this device');
      }
      
      return null;
    } catch (error) {
      console.error('Apple sign-in error:', error);
      throw error;
    }
  }
  
  /**
   * Sign in with Facebook
   */
  public async signInWithFacebook(): Promise<{ user: AuthUser; token: string } | null> {
    try {
      const [request, response, promptAsync] = Facebook.useAuthRequest({
        clientId: 'YOUR_FACEBOOK_APP_ID',
      });
      
      if (response?.type === 'success') {
        const { authentication } = response;
        
        // Exchange the token with your server
        const authResponse = await apiClient.post<{ user: AuthUser; token: string; refreshToken: string }>(
          '/auth/facebook',
          { token: authentication?.accessToken }
        );
        
        if (authResponse.data) {
          // Store tokens
          await this.storeTokens(authResponse.data.token, authResponse.data.refreshToken);
          
          // Set auth token in API client
          apiClient.setAuthToken(authResponse.data.token);
          
          return {
            user: authResponse.data.user,
            token: authResponse.data.token
          };
        }
      } else {
        await promptAsync();
      }
      
      return null;
    } catch (error) {
      console.error('Facebook sign-in error:', error);
      throw error;
    }
  }
  
  // === Biometric Authentication ===
  
  /**
   * Check if biometric authentication is available
   */
  public async isBiometricAvailable(): Promise<boolean> {
    const isAvailable = await LocalAuthentication.hasHardwareAsync();
    const isEnrolled = await LocalAuthentication.isEnrolledAsync();
    
    return isAvailable && isEnrolled;
  }
  
  /**
   * Enable biometric authentication for the current user
   */
  public async enableBiometric(email: string, password: string): Promise<boolean> {
    try {
      // Verify credentials first
      await this.login({ email, password });
      
      // Store credentials securely for biometric auth
      await secureStorage.setItem(USER_CREDENTIALS_KEY, JSON.stringify({ email, password }));
      await secureStorage.setItem(BIOMETRIC_ENABLED_KEY, 'true');
      
      return true;
    } catch (error) {
      console.error('Failed to enable biometric authentication:', error);
      return false;
    }
  }
  
  /**
   * Disable biometric authentication
   */
  public async disableBiometric(): Promise<boolean> {
    try {
      await secureStorage.removeItem(USER_CREDENTIALS_KEY);
      await secureStorage.removeItem(BIOMETRIC_ENABLED_KEY);
      
      return true;
    } catch (error) {
      console.error('Failed to disable biometric authentication:', error);
      return false;
    }
  }
  
  /**
   * Check if biometric authentication is enabled
   */
  public async isBiometricEnabled(): Promise<boolean> {
    try {
      const enabled = await secureStorage.getItem(BIOMETRIC_ENABLED_KEY);
      return enabled === 'true';
    } catch (error) {
      return false;
    }
  }
  
  /**
   * Authenticate with biometrics
   */
  public async authenticateWithBiometric(): Promise<{ user: AuthUser; token: string } | null> {
    try {
      // Check if biometric is available and enabled
      const isBiometricAvailable = await this.isBiometricAvailable();
      const isBiometricEnabled = await this.isBiometricEnabled();
      
      if (!isBiometricAvailable || !isBiometricEnabled) {
        throw new Error('Biometric authentication is not available or not enabled');
      }
      
      // Authenticate with biometrics
      const result = await LocalAuthentication.authenticateAsync({
        promptMessage: 'Authenticate to continue',
        fallbackLabel: 'Use Password',
      });
      
      if (result.success) {
        // Retrieve stored credentials
        const credentialsJson = await secureStorage.getItem(USER_CREDENTIALS_KEY);
        
        if (credentialsJson) {
          const credentials = JSON.parse(credentialsJson) as { email: string; password: string };
          
          // Log in with stored credentials
          return await this.login(credentials);
        }
      }
      
      return null;
    } catch (error) {
      console.error('Biometric authentication error:', error);
      throw error;
    }
  }
  
  // === Private Helper Methods ===
  
  /**
   * Store auth and refresh tokens
   */
  private async storeTokens(token: string, refreshToken: string): Promise<void> {
    await Promise.all([
      secureStorage.setItem(AUTH_TOKEN_KEY, token),
      secureStorage.setItem(REFRESH_TOKEN_KEY, refreshToken)
    ]);
  }
  
  /**
   * Clear stored tokens
   */
  private async clearTokens(): Promise<void> {
    await Promise.all([
      secureStorage.removeItem(AUTH_TOKEN_KEY),
      secureStorage.removeItem(REFRESH_TOKEN_KEY)
    ]);
  }
}

// Export default instance
export const authService = AuthService.getInstance();
export default authService; 