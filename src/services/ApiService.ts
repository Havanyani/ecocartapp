/**
 * ApiService.ts
 * 
 * A centralized service for making API requests to the backend.
 * Handles common functionality like authentication, error handling, and retries.
 */

import { environment } from '@/config/environments';
import { PerformanceMonitor } from '@/utils/PerformanceMonitoring';
import axios, {
    AxiosError,
    AxiosInstance,
    AxiosRequestConfig,
    AxiosResponse,
    InternalAxiosRequestConfig
} from 'axios';

// Error types
export enum ApiErrorType {
  NETWORK = 'network',
  TIMEOUT = 'timeout',
  SERVER = 'server',
  AUTH = 'authentication',
  CLIENT = 'client',
  UNKNOWN = 'unknown'
}

// API Error class
export class ApiError extends Error {
  type: ApiErrorType;
  status: number | null;
  data: any;
  originalError?: Error;

  constructor(
    message: string,
    type: ApiErrorType = ApiErrorType.UNKNOWN,
    status: number | null = null,
    data: any = null,
    originalError?: Error
  ) {
    super(message);
    this.name = 'ApiError';
    this.type = type;
    this.status = status;
    this.data = data;
    this.originalError = originalError;
  }
}

// API response type - updated to match Axios response structure
export interface ApiResponse<T> {
  data: T;
  status: number;
  headers: Record<string, any>;
  statusText?: string;
  config?: any;
}

// Request retry configuration - fixed return type to always be boolean
interface RetryConfig {
  retries: number;
  retryDelay: number;
  retryCondition: (error: AxiosError<unknown>) => boolean;
}

// API service configuration
interface ApiServiceConfig {
  baseURL: string;
  timeout: number;
  headers?: Record<string, string>;
  retry?: Partial<RetryConfig>;
}

export class ApiService {
  private static instance: ApiService;
  private axios: AxiosInstance;
  private authToken: string | null = null;
  private refreshToken: string | null = null;
  private readonly retryConfig: RetryConfig;

  private constructor(config: ApiServiceConfig) {
    this.axios = axios.create({
      baseURL: config.baseURL,
      timeout: config.timeout,
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json',
        ...config.headers
      }
    });

    // Default retry configuration with fixed return type
    this.retryConfig = {
      retries: config.retry?.retries ?? 3,
      retryDelay: config.retry?.retryDelay ?? 1000,
      retryCondition: config.retry?.retryCondition ?? 
        ((error: AxiosError<unknown>) => {
          // Default retry condition: retry on network errors, 408, and 5xx
          const status = error.response?.status;
          return !!(
            error.code === 'ECONNABORTED' ||
            error.message.includes('Network Error') ||
            status === 408 ||
            (status && status >= 500 && status < 600)
          );
        })
    };

    // Add request interceptor with correct type
    this.axios.interceptors.request.use(
      (config: InternalAxiosRequestConfig) => this.handleRequest(config),
      this.handleRequestError.bind(this)
    );

    // Add response interceptor
    this.axios.interceptors.response.use(
      // Return the original AxiosResponse from the interceptor
      (response: AxiosResponse) => response,
      this.handleResponseError.bind(this)
    );
  }

  /**
   * Get the ApiService instance
   */
  public static getInstance(config?: ApiServiceConfig): ApiService {
    if (!this.instance) {
      if (!config) {
        throw new Error('ApiService must be initialized with a config');
      }
      this.instance = new ApiService(config);
    }
    return this.instance;
  }

  /**
   * Initialize the API service with configuration
   */
  public static initialize(config: ApiServiceConfig): ApiService {
    if (this.instance) {
      console.warn('ApiService already initialized, reinitializing');
    }
    this.instance = new ApiService(config);
    return this.instance;
  }

  /**
   * Set the authentication token
   */
  public setAuthToken(token: string | null): void {
    this.authToken = token;
  }

  /**
   * Set the refresh token
   */
  public setRefreshToken(token: string | null): void {
    this.refreshToken = token;
  }

  /**
   * Make a GET request
   */
  public async get<T = any>(
    url: string,
    params?: Record<string, any>,
    config?: AxiosRequestConfig
  ): Promise<ApiResponse<T>> {
    const startTime = Date.now();
    try {
      const response = await this.request<T>({
        method: 'GET',
        url,
        params,
        ...config
      });
      this.trackRequest('GET', url, Date.now() - startTime, response.status);
      return response;
    } catch (error) {
      this.trackRequest('GET', url, Date.now() - startTime, 
        error instanceof ApiError ? error.status || 0 : 0);
      throw error;
    }
  }

  /**
   * Make a POST request
   */
  public async post<T = any>(
    url: string,
    data?: any,
    config?: AxiosRequestConfig
  ): Promise<ApiResponse<T>> {
    const startTime = Date.now();
    try {
      const response = await this.request<T>({
        method: 'POST',
        url,
        data,
        ...config
      });
      this.trackRequest('POST', url, Date.now() - startTime, response.status);
      return response;
    } catch (error) {
      this.trackRequest('POST', url, Date.now() - startTime, 
        error instanceof ApiError ? error.status || 0 : 0);
      throw error;
    }
  }

  /**
   * Make a PUT request
   */
  public async put<T = any>(
    url: string,
    data?: any,
    config?: AxiosRequestConfig
  ): Promise<ApiResponse<T>> {
    const startTime = Date.now();
    try {
      const response = await this.request<T>({
        method: 'PUT',
        url,
        data,
        ...config
      });
      this.trackRequest('PUT', url, Date.now() - startTime, response.status);
      return response;
    } catch (error) {
      this.trackRequest('PUT', url, Date.now() - startTime, 
        error instanceof ApiError ? error.status || 0 : 0);
      throw error;
    }
  }

  /**
   * Make a DELETE request
   */
  public async delete<T = any>(
    url: string,
    config?: AxiosRequestConfig
  ): Promise<ApiResponse<T>> {
    const startTime = Date.now();
    try {
      const response = await this.request<T>({
        method: 'DELETE',
        url,
        ...config
      });
      this.trackRequest('DELETE', url, Date.now() - startTime, response.status);
      return response;
    } catch (error) {
      this.trackRequest('DELETE', url, Date.now() - startTime, 
        error instanceof ApiError ? error.status || 0 : 0);
      throw error;
    }
  }

  /**
   * Make a PATCH request
   */
  public async patch<T = any>(
    url: string,
    data?: any,
    config?: AxiosRequestConfig
  ): Promise<ApiResponse<T>> {
    const startTime = Date.now();
    try {
      const response = await this.request<T>({
        method: 'PATCH',
        url,
        data,
        ...config
      });
      this.trackRequest('PATCH', url, Date.now() - startTime, response.status);
      return response;
    } catch (error) {
      this.trackRequest('PATCH', url, Date.now() - startTime, 
        error instanceof ApiError ? error.status || 0 : 0);
      throw error;
    }
  }

  /**
   * Convert Axios response to our API response format
   */
  private mapAxiosResponse<T>(response: AxiosResponse<T>): ApiResponse<T> {
    const { data, status, headers, statusText, config } = response;
    return { data, status, headers, statusText, config };
  }

  /**
   * Make a request with retry logic
   */
  private async request<T = any>(
    config: AxiosRequestConfig,
    retryCount: number = 0
  ): Promise<ApiResponse<T>> {
    try {
      const response = await this.axios.request<T, AxiosResponse<T>>(config);
      return this.mapAxiosResponse(response);
    } catch (error) {
      const axiosError = error as AxiosError;

      // Check if we should retry
      if (
        retryCount < this.retryConfig.retries &&
        this.retryConfig.retryCondition(axiosError)
      ) {
        const delay = this.retryConfig.retryDelay * Math.pow(2, retryCount);
        console.log(`Retrying request (${retryCount + 1}/${this.retryConfig.retries})`);
        
        // Wait for the retry delay
        await new Promise(resolve => setTimeout(resolve, delay));
        
        // Retry the request
        return this.request<T>(config, retryCount + 1);
      }

      // Convert to ApiError and rethrow
      throw this.createApiError(axiosError);
    }
  }

  /**
   * Handle request interceptor
   */
  private handleRequest(config: InternalAxiosRequestConfig): InternalAxiosRequestConfig {
    // Add auth token if available
    if (this.authToken) {
      config.headers.Authorization = `Bearer ${this.authToken}`;
    }
    
    return config;
  }

  /**
   * Handle request error interceptor
   */
  private handleRequestError(error: any): Promise<never> {
    return Promise.reject(this.createApiError(error));
  }

  /**
   * Handle response error interceptor
   */
  private async handleResponseError(error: any): Promise<never> {
    // Handle 401 Unauthorized - try to refresh token
    if (
      error.response?.status === 401 &&
      this.refreshToken &&
      !error.config.__isRetryRequest
    ) {
      try {
        const newToken = await this.refreshAuthToken();
        if (newToken) {
          // Retry the original request with the new token
          const config = { ...error.config };
          config.headers['Authorization'] = `Bearer ${newToken}`;
          config.__isRetryRequest = true;
          return this.axios.request(config);
        }
      } catch (refreshError) {
        console.error('Failed to refresh auth token:', refreshError);
        // Continue to regular error handling
      }
    }
    
    return Promise.reject(this.createApiError(error));
  }

  /**
   * Refresh the authentication token
   */
  private async refreshAuthToken(): Promise<string | null> {
    if (!this.refreshToken) {
      return null;
    }
    
    try {
      // This would be a real API call in production
      const response = await this.axios.post('/auth/refresh', {
        refreshToken: this.refreshToken
      });
      
      const newToken = response.data.token;
      this.setAuthToken(newToken);
      
      return newToken;
    } catch (error) {
      console.error('Failed to refresh token:', error);
      this.setAuthToken(null);
      this.setRefreshToken(null);
      return null;
    }
  }

  /**
   * Create an ApiError from an AxiosError
   */
  private createApiError(error: any): ApiError {
    // Network error
    if (error.message && error.message.includes('Network Error')) {
      return new ApiError(
        'Network error. Please check your internet connection.',
        ApiErrorType.NETWORK,
        null,
        null,
        error
      );
    }
    
    // Timeout error
    if (error.code === 'ECONNABORTED') {
      return new ApiError(
        'Request timed out. Please try again.',
        ApiErrorType.TIMEOUT,
        408,
        null,
        error
      );
    }
    
    // Response error
    if (error.response) {
      const { status, data } = error.response;
      
      // Authentication error
      if (status === 401 || status === 403) {
        return new ApiError(
          'Authentication failed. Please log in again.',
          ApiErrorType.AUTH,
          status,
          data,
          error
        );
      }
      
      // Server error
      if (status >= 500) {
        return new ApiError(
          'Server error. Please try again later.',
          ApiErrorType.SERVER,
          status,
          data,
          error
        );
      }
      
      // Client error
      if (status >= 400) {
        return new ApiError(
          data?.message || 'Invalid request. Please check your input.',
          ApiErrorType.CLIENT,
          status,
          data,
          error
        );
      }
    }
    
    // Unknown error
    return new ApiError(
      error.message || 'An unknown error occurred',
      ApiErrorType.UNKNOWN,
      error.response?.status || null,
      error.response?.data || null,
      error instanceof Error ? error : new Error(String(error))
    );
  }

  /**
   * Track API request for performance monitoring
   */
  private trackRequest(
    method: string,
    url: string,
    duration: number,
    status: number
  ): void {
    // Remove query parameters from URL for tracking
    const baseUrl = url.split('?')[0];
    
    PerformanceMonitor.trackNetworkRequest(
      `${method} ${baseUrl}`,
      duration,
      status
    );
  }
}

// Create a default instance
export default ApiService.getInstance({
  baseURL: (environment?.apiUrl || 'https://api.ecocart.example.com') + '/v1',
  timeout: 30000,
  retry: {
    retries: 5,
    retryDelay: 2000,
    retryCondition: (error) => {
      const shouldRetry = 
        error.code === 'ECONNABORTED' ||
        !error.response ||
        (error.response && error.response.status >= 500);
        
      if (error.response && error.response.status >= 400 && error.response.status < 500) {
        return error.response.status === 429;
      }
      
      return shouldRetry;
    }
  }
}); 