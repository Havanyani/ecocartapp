/**
 * AuthService.ts
 * 
 * Service for handling user authentication, including login, signup, and token management.
 * Works with the API service and provides methods for token refreshing and validation.
 */

import { PerformanceMonitor } from '@/utils/PerformanceMonitoring';
import { SafeStorage } from '@/utils/storage';
import { jwtDecode } from "jwt-decode";
import ApiService, { ApiError, ApiErrorType } from './ApiService';

// Auth token storage keys
const AUTH_TOKEN_KEY = 'auth_token';
const REFRESH_TOKEN_KEY = 'refresh_token';
const USER_DATA_KEY = 'user_data';

// Token payload interface
interface TokenPayload {
  sub: string; // User ID
  email: string;
  name?: string;
  role?: string;
  exp: number; // Expiration timestamp
}

// User data interface
export interface User {
  id: string;
  email: string;
  name: string;
  role: string;
  profilePictureUrl?: string; // Profile picture URL
  preferences?: {
    notifications: boolean;
    darkMode: boolean;
    language: string;
    units: 'metric' | 'imperial';
  };
  stats?: {
    totalPoints?: number;
    totalCollections: number;
    totalWeight: number;
    co2Saved: number;
    level: number;
    points: number;
  };
  createdAt: string;
  updatedAt: string;
}

// Login request
export interface LoginRequest {
  email: string;
  password: string;
}

// Login response
export interface AuthResponse {
  token: string;
  refreshToken: string;
  user: User;
}

// Signup request
export interface SignupRequest {
  email: string;
  password: string;
  name: string;
}

// Auth service class
export class AuthService {
  private static instance: AuthService;
  private currentUser: User | null = null;
  private authToken: string | null = null;
  private refreshToken: string | null = null;
  private tokenExpirationTimer: NodeJS.Timeout | null = null;

  private constructor() {
    // Private constructor for singleton pattern
  }

  /**
   * Get AuthService instance (singleton)
   */
  public static getInstance(): AuthService {
    if (!this.instance) {
      this.instance = new AuthService();
    }
    return this.instance;
  }

  /**
   * Initialize the auth service by loading saved tokens
   */
  public async initialize(): Promise<void> {
    try {
      // Load tokens from storage
      const [authToken, refreshToken, userData] = await Promise.all([
        SafeStorage.getItem(AUTH_TOKEN_KEY),
        SafeStorage.getItem(REFRESH_TOKEN_KEY),
        SafeStorage.getItem(USER_DATA_KEY),
      ]);

      if (authToken) {
        this.authToken = authToken;
        ApiService.setAuthToken(authToken);
        
        // Set up token expiration
        this.setupTokenExpiration(authToken);
      }

      if (refreshToken) {
        this.refreshToken = refreshToken;
        ApiService.setRefreshToken(refreshToken);
      }

      if (userData) {
        this.currentUser = JSON.parse(userData);
      }
    } catch (error) {
      console.error('Failed to initialize auth service:', error);
      this.clearAuth();
    }
  }

  /**
   * Log in a user with email and password
   */
  public async login(credentials: LoginRequest): Promise<User> {
    try {
      const response = await ApiService.post<AuthResponse>('/auth/login', credentials);
      
      await this.handleAuthResponse(response.data);
      return this.currentUser!;
    } catch (error) {
      // Handle specific auth errors
      if (error instanceof ApiError && error.type === ApiErrorType.AUTH) {
        throw new Error('Invalid email or password');
      }
      throw error;
    }
  }

  /**
   * Register a new user
   */
  public async signup(userData: SignupRequest): Promise<User> {
    try {
      const response = await ApiService.post<AuthResponse>('/auth/signup', userData);
      
      await this.handleAuthResponse(response.data);
      return this.currentUser!;
    } catch (error) {
      // Handle specific errors
      if (error instanceof ApiError && error.status === 409) {
        throw new Error('Email already in use');
      }
      throw error;
    }
  }

  /**
   * Log out the current user
   */
  public async logout(): Promise<void> {
    try {
      // Call logout endpoint if online
      if (this.authToken) {
        try {
          await ApiService.post('/auth/logout', { refreshToken: this.refreshToken });
        } catch (error) {
          // Ignore errors when logging out
          console.warn('Error during logout API call:', error);
        }
      }
    } finally {
      // Always clear auth state, even if API call fails
      await this.clearAuth();
    }
  }

  /**
   * Refresh the authentication token
   */
  public async refreshAuthToken(): Promise<string | null> {
    if (!this.refreshToken) {
      return null;
    }
    
    try {
      const response = await ApiService.post<AuthResponse>(
        '/auth/refresh',
        { refreshToken: this.refreshToken }
      );
      
      // Update tokens
      await this.setTokens(response.data.token, response.data.refreshToken, response.data.user);
      
      return response.data.token;
    } catch (error) {
      console.error('Failed to refresh token:', error);
      await this.clearAuth();
      return null;
    }
  }

  /**
   * Check if user is authenticated
   */
  public isAuthenticated(): boolean {
    return !!this.authToken && !!this.currentUser;
  }

  /**
   * Get the current user
   */
  public getCurrentUser(): User | null {
    return this.currentUser;
  }

  /**
   * Update the user's profile
   */
  public async updateProfile(updates: Partial<User>): Promise<User> {
    if (!this.isAuthenticated()) {
      throw new Error('User not authenticated');
    }
    
    try {
      const response = await ApiService.put<User>('/users/profile', updates);
      
      // Update stored user data
      this.currentUser = response.data;
      await SafeStorage.setItem(USER_DATA_KEY, JSON.stringify(this.currentUser));
      
      return this.currentUser;
    } catch (error) {
      throw error;
    }
  }

  /**
   * Change the user's password
   */
  public async changePassword(currentPassword: string, newPassword: string): Promise<void> {
    if (!this.isAuthenticated()) {
      throw new Error('User not authenticated');
    }
    
    try {
      await ApiService.post('/auth/change-password', {
        currentPassword,
        newPassword
      });
    } catch (error) {
      if (error instanceof ApiError && error.status === 401) {
        throw new Error('Current password is incorrect');
      }
      throw error;
    }
  }

  /**
   * Request a password reset for a user
   */
  public async requestPasswordReset(email: string): Promise<void> {
    try {
      await ApiService.post('/auth/request-reset', { email });
    } catch (error) {
      // We don't want to reveal whether an email exists in our system
      // Just log the error but don't throw it
      console.warn('Error requesting password reset:', error);
    }
  }

  /**
   * Set tokens from auth response
   */
  private async handleAuthResponse(authResponse: AuthResponse): Promise<void> {
    const { token, refreshToken, user } = authResponse;
    
    await this.setTokens(token, refreshToken, user);
  }

  /**
   * Set tokens and user data
   */
  private async setTokens(token: string, refreshToken: string, user: User): Promise<void> {
    // Set tokens in memory
    this.authToken = token;
    this.refreshToken = refreshToken;
    this.currentUser = user;
    
    // Set tokens in API service
    ApiService.setAuthToken(token);
    ApiService.setRefreshToken(refreshToken);
    
    // Save tokens to storage
    await Promise.all([
      SafeStorage.setItem(AUTH_TOKEN_KEY, token),
      SafeStorage.setItem(REFRESH_TOKEN_KEY, refreshToken),
      SafeStorage.setItem(USER_DATA_KEY, JSON.stringify(user))
    ]);
    
    // Set up token expiration
    this.setupTokenExpiration(token);
    
    // Log the successful authentication
    PerformanceMonitor.trackNetworkRequest('AUTH', 0, 200);
  }

  /**
   * Clear all authentication data
   */
  private async clearAuth(): Promise<void> {
    // Clear memory
    this.authToken = null;
    this.refreshToken = null;
    this.currentUser = null;
    
    // Clear from API service
    ApiService.setAuthToken(null);
    ApiService.setRefreshToken(null);
    
    // Clear storage
    await Promise.all([
      SafeStorage.removeItem(AUTH_TOKEN_KEY),
      SafeStorage.removeItem(REFRESH_TOKEN_KEY),
      SafeStorage.removeItem(USER_DATA_KEY)
    ]);
    
    // Clear token expiration timer
    if (this.tokenExpirationTimer) {
      clearTimeout(this.tokenExpirationTimer);
      this.tokenExpirationTimer = null;
    }
  }

  /**
   * Set up timer to refresh token before expiration
   */
  private setupTokenExpiration(token: string): void {
    try {
      // Clear any existing timer
      if (this.tokenExpirationTimer) {
        clearTimeout(this.tokenExpirationTimer);
      }
      
      // Decode the token
      const decoded = jwtDecode<TokenPayload>(token);
      
      // Calculate expiration time
      const expiresAt = decoded.exp * 1000; // Convert to milliseconds
      const now = Date.now();
      const timeUntilExpiration = Math.max(0, expiresAt - now - 60000); // 1 minute before actual expiration
      
      // Set timer to refresh token
      this.tokenExpirationTimer = setTimeout(() => {
        this.refreshAuthToken().catch(() => {
          // If refresh fails, log the user out
          this.clearAuth();
        });
      }, timeUntilExpiration);
    } catch (error) {
      console.error('Failed to setup token expiration:', error);
    }
  }
}

// Create and export a singleton instance
const authService = AuthService.getInstance();
export default authService; 