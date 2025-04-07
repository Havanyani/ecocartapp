/**
 * ApiClient.ts
 * 
 * Enhanced API client for the EcoCart app with advanced features:
 * - Request caching
 * - Request deduplication
 * - Request cancellation
 * - Enhanced error handling
 * - Structured responses
 */

import { environment } from '@/config/environments';
import { ApiError, ApiErrorType, ApiResponse, ApiService } from '@/services/ApiService';
import { PerformanceMonitor } from '@/utils/PerformanceMonitoring';
import AsyncStorage from '@react-native-async-storage/async-storage';
import axios, { AxiosRequestConfig } from 'axios';

// Cache settings interface
interface CacheSettings {
  /** Enable caching for this request */
  enabled: boolean;
  
  /** Cache expiration time in milliseconds */
  expirationTime: number;
  
  /** Cache key prefix */
  keyPrefix: string;
}

// Default cache settings
const DEFAULT_CACHE_SETTINGS: CacheSettings = {
  enabled: true,
  expirationTime: 5 * 60 * 1000, // 5 minutes
  keyPrefix: 'api_cache',
};

// Request options with caching
export interface RequestOptions extends AxiosRequestConfig {
  /** Cache settings */
  cache?: Partial<CacheSettings>;
  
  /** Skip cache and force a network request */
  forceRefresh?: boolean;
  
  /** Enable request deduplication */
  deduplicate?: boolean;
  
  /** Request ID for tracking */
  requestId?: string;
}

// Response with cache metadata
export interface EnhancedResponse<T> extends ApiResponse<T> {
  /** Whether this response was served from cache */
  fromCache?: boolean;
  
  /** Cache expiration timestamp */
  cacheExpiry?: number;
}

// In-flight request tracking
interface PendingRequest {
  cancelToken: ReturnType<typeof axios.CancelToken.source>;
  timestamp: number;
}

/**
 * Enhanced API client with caching, deduplication, and better error handling
 */
export class ApiClient {
  private static instance: ApiClient;
  private apiService: ApiService;
  private pendingRequests: Map<string, PendingRequest> = new Map();
  
  private constructor() {
    // Initialize the API service
    this.apiService = ApiService.getInstance({
      baseURL: environment.apiUrl,
      timeout: 30000, // 30 seconds
      retry: {
        retries: 3,
        retryDelay: 1000,
      }
    });
  }
  
  /**
   * Get the ApiClient instance
   */
  public static getInstance(): ApiClient {
    if (!this.instance) {
      this.instance = new ApiClient();
    }
    return this.instance;
  }
  
  /**
   * Make a GET request with enhanced features
   */
  public async get<T = any>(
    url: string,
    params?: Record<string, any>,
    options?: RequestOptions
  ): Promise<EnhancedResponse<T>> {
    const requestKey = this.getRequestKey('GET', url, params);
    const cacheSettings = this.getCacheSettings(options?.cache);
    
    // Handle deduplication
    if (options?.deduplicate !== false && this.pendingRequests.has(requestKey)) {
      PerformanceMonitor.recordMetric({
        name: 'api_deduplicated',
        duration: 0,
        type: 'api',
        timestamp: Date.now()
      });
      
      // Cancel the existing request if it's older than 5 seconds
      const pending = this.pendingRequests.get(requestKey)!;
      if (Date.now() - pending.timestamp > 5000) {
        pending.cancelToken.cancel('Request superseded by newer request');
        this.pendingRequests.delete(requestKey);
      } else {
        throw new ApiError(
          'Request already in progress',
          ApiErrorType.CLIENT,
          409,
          { requestKey }
        );
      }
    }
    
    // Check cache if enabled and not force refreshing
    if (cacheSettings.enabled && !options?.forceRefresh) {
      try {
        const cachedResponse = await this.getFromCache<T>(requestKey);
        if (cachedResponse) {
          return {
            ...cachedResponse,
            fromCache: true,
          };
        }
      } catch (error) {
        console.warn('Error retrieving from cache:', error);
      }
    }
    
    // Create cancel token for this request
    const cancelTokenSource = axios.CancelToken.source();
    
    // Track this request
    this.pendingRequests.set(requestKey, {
      cancelToken: cancelTokenSource,
      timestamp: Date.now(),
    });
    
    try {
      // Make the request
      const response = await this.apiService.get<T>(url, params, {
        ...options,
        cancelToken: cancelTokenSource.token,
      });
      
      // Cache the response if caching is enabled
      if (cacheSettings.enabled) {
        this.saveToCache(requestKey, response, cacheSettings.expirationTime);
      }
      
      // Clean up tracking
      this.pendingRequests.delete(requestKey);
      
      return {
        ...response,
        fromCache: false,
      };
    } catch (error) {
      // Clean up tracking
      this.pendingRequests.delete(requestKey);
      throw error;
    }
  }
  
  /**
   * Make a POST request with enhanced features
   */
  public async post<T = any>(
    url: string,
    data?: any,
    options?: RequestOptions
  ): Promise<EnhancedResponse<T>> {
    // Create cancel token for this request
    const cancelTokenSource = axios.CancelToken.source();
    
    try {
      // Make the request
      const response = await this.apiService.post<T>(url, data, {
        ...options,
        cancelToken: cancelTokenSource.token,
      });
      
      return {
        ...response,
        fromCache: false,
      };
    } finally {
      cancelTokenSource.cancel();
    }
  }
  
  /**
   * Make a PUT request with enhanced features
   */
  public async put<T = any>(
    url: string,
    data?: any,
    options?: RequestOptions
  ): Promise<EnhancedResponse<T>> {
    // Create cancel token for this request
    const cancelTokenSource = axios.CancelToken.source();
    
    try {
      // Make the request
      const response = await this.apiService.put<T>(url, data, {
        ...options,
        cancelToken: cancelTokenSource.token,
      });
      
      return {
        ...response,
        fromCache: false,
      };
    } finally {
      cancelTokenSource.cancel();
    }
  }
  
  /**
   * Make a DELETE request with enhanced features
   */
  public async delete<T = any>(
    url: string,
    options?: RequestOptions
  ): Promise<EnhancedResponse<T>> {
    // Create cancel token for this request
    const cancelTokenSource = axios.CancelToken.source();
    
    try {
      // Make the request
      const response = await this.apiService.delete<T>(url, {
        ...options,
        cancelToken: cancelTokenSource.token,
      });
      
      return {
        ...response,
        fromCache: false,
      };
    } finally {
      cancelTokenSource.cancel();
    }
  }
  
  /**
   * Make a PATCH request with enhanced features
   */
  public async patch<T = any>(
    url: string,
    data?: any,
    options?: RequestOptions
  ): Promise<EnhancedResponse<T>> {
    // Create cancel token for this request
    const cancelTokenSource = axios.CancelToken.source();
    
    try {
      // Make the request
      const response = await this.apiService.patch<T>(url, data, {
        ...options,
        cancelToken: cancelTokenSource.token,
      });
      
      return {
        ...response,
        fromCache: false,
      };
    } finally {
      cancelTokenSource.cancel();
    }
  }
  
  /**
   * Set the authentication token for all requests
   */
  public setAuthToken(token: string | null): void {
    this.apiService.setAuthToken(token);
  }
  
  /**
   * Set the refresh token for authentication
   */
  public setRefreshToken(token: string | null): void {
    this.apiService.setRefreshToken(token);
  }
  
  /**
   * Clear the API cache
   */
  public async clearCache(): Promise<void> {
    const keys = await AsyncStorage.getAllKeys();
    const cacheKeys = keys.filter(key => key.startsWith(DEFAULT_CACHE_SETTINGS.keyPrefix));
    
    if (cacheKeys.length > 0) {
      await AsyncStorage.multiRemove(cacheKeys);
    }
  }
  
  /**
   * Cancel all pending requests
   */
  public cancelAllRequests(reason: string = 'Operation canceled by user'): void {
    this.pendingRequests.forEach(request => {
      request.cancelToken.cancel(reason);
    });
    this.pendingRequests.clear();
  }
  
  /**
   * Generate a unique cache key for a request
   */
  private getRequestKey(method: string, url: string, params?: Record<string, any>): string {
    return `${method}:${url}:${params ? JSON.stringify(params) : ''}`;
  }
  
  /**
   * Get merged cache settings
   */
  private getCacheSettings(settings?: Partial<CacheSettings>): CacheSettings {
    return {
      ...DEFAULT_CACHE_SETTINGS,
      ...settings
    };
  }
  
  /**
   * Get response from cache
   */
  private async getFromCache<T>(key: string): Promise<EnhancedResponse<T> | null> {
    const cacheKey = `${DEFAULT_CACHE_SETTINGS.keyPrefix}:${key}`;
    const cached = await AsyncStorage.getItem(cacheKey);
    
    if (!cached) {
      return null;
    }
    
    try {
      const { response, expiry } = JSON.parse(cached);
      
      // Check if cache has expired
      if (expiry < Date.now()) {
        await AsyncStorage.removeItem(cacheKey);
        return null;
      }
      
      return {
        ...response,
        fromCache: true,
        cacheExpiry: expiry
      };
    } catch (error) {
      await AsyncStorage.removeItem(cacheKey);
      return null;
    }
  }
  
  /**
   * Save response to cache
   */
  private async saveToCache<T>(
    key: string,
    response: ApiResponse<T>,
    expirationTime: number
  ): Promise<void> {
    const cacheKey = `${DEFAULT_CACHE_SETTINGS.keyPrefix}:${key}`;
    const expiry = Date.now() + expirationTime;
    
    const cacheData = JSON.stringify({
      response,
      expiry
    });
    
    try {
      await AsyncStorage.setItem(cacheKey, cacheData);
    } catch (error) {
      console.warn('Error saving to cache:', error);
    }
  }
}

/**
 * Get the ApiClient instance
 */
export const apiClient = ApiClient.getInstance();

/**
 * Export default instance for convenience
 */
export default apiClient; 