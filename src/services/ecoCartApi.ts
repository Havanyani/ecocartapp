import axios, { AxiosInstance } from 'axios';
import type { CollectionData, CollectionResponse } from './CollectionService';
import type { CreditsBalance } from './UserService';

interface ApiResponse<T> {
  data: T;
  status: number;
  message?: string;
}

interface ApiError {
  code: string;
  message: string;
  details?: unknown;
}

interface CommunityStats {
  totalUsers: number;
  totalCollections: number;
  totalRecycled: number;
  carbonOffset: number;
  topCollectors: Array<{
    userId: string;
    name: string;
    collections: number;
    credits: number;
  }>;
}

interface CommunityPost {
  id: string;
  userId: string;
  content: string;
  images?: string[];
  likes: number;
  comments: number;
  createdAt: string;
}

interface PostData {
  content: string;
  images?: string[];
  tags?: string[];
}

class EcoCartApi {
  private static instance: EcoCartApi;
  private readonly axiosInstance: AxiosInstance;
  private readonly baseURL: string;

  private constructor() {
    this.baseURL = process.env.EXPO_PUBLIC_API_URL || 'https://api.ecocart.com/v1';
    this.axiosInstance = axios.create({
      baseURL: this.baseURL,
      timeout: 30000,
      headers: {
        'Content-Type': 'application/json',
      },
    });

    // Add request interceptor for retry logic
    let retryCount = 0;
    const MAX_RETRIES = 3;
    
    this.axiosInstance.interceptors.request.use(
      (config) => {
        // Add custom retry count to the config
        (config as any).retryCount = retryCount;
        return config;
      },
      (error) => Promise.reject(error)
    );

    // Add response interceptor for error handling
    this.axiosInstance.interceptors.response.use(
      (response) => {
        // Reset retry count on successful response
        retryCount = 0;
        return response;
      },
      async (error) => {
        const config = error.config;
        
        // Only retry for network errors, timeouts, or server errors (5xx)
        const shouldRetry = (
          !error.response || 
          error.code === 'ECONNABORTED' ||
          (error.response && error.response.status >= 500)
        );
        
        // Don't retry if we've hit the max retries
        if (shouldRetry && (config.retryCount || 0) < MAX_RETRIES) {
          retryCount = (config.retryCount || 0) + 1;
          
          // Exponential backoff
          const delay = Math.pow(2, retryCount) * 1000;
          
          await new Promise(resolve => setTimeout(resolve, delay));
          return this.axiosInstance(config);
        }
        
        // Format the error response
        if (error.response) {
          // Server responded with error status
          const apiError: ApiError = {
            code: error.response.status.toString(),
            message: error.response.data.message || 'An error occurred',
            details: error.response.data,
          };
          return Promise.reject(apiError);
        } else if (error.request) {
          // Request made but no response received
          const apiError: ApiError = {
            code: 'NETWORK_ERROR',
            message: 'Network error occurred. Please check your connection and try again.',
            details: error.request,
          };
          return Promise.reject(apiError);
        } else {
          // Error in request setup
          const apiError: ApiError = {
            code: 'REQUEST_ERROR',
            message: error.message || 'An error occurred with your request',
          };
          return Promise.reject(apiError);
        }
      }
    );
  }

  public static getInstance(): EcoCartApi {
    if (!EcoCartApi.instance) {
      EcoCartApi.instance = new EcoCartApi();
    }
    return EcoCartApi.instance;
  }

  public async getCollections(): Promise<ApiResponse<CollectionResponse[]>> {
    const response = await this.axiosInstance.get<ApiResponse<CollectionResponse[]>>('/collections');
    return response.data;
  }

  public async scheduleCollection(data: CollectionData): Promise<ApiResponse<CollectionResponse>> {
    const response = await this.axiosInstance.post<ApiResponse<CollectionResponse>>('/collections', data);
    return response.data;
  }

  public async getCreditsBalance(userId: string): Promise<ApiResponse<CreditsBalance>> {
    const response = await this.axiosInstance.get<ApiResponse<CreditsBalance>>(`/users/${userId}/credits`);
    return response.data;
  }

  public async updateProfile(userId: string, data: Record<string, unknown>): Promise<ApiResponse<unknown>> {
    const response = await this.axiosInstance.put<ApiResponse<unknown>>(`/users/${userId}/profile`, data);
    return response.data;
  }

  public setAuthToken(token: string): void {
    this.axiosInstance.defaults.headers.common.Authorization = `Bearer ${token}`;
  }

  public clearAuthToken(): void {
    delete this.axiosInstance.defaults.headers.common.Authorization;
  }

  async getCollectionHistory(userId: number): Promise<ApiResponse<CollectionResponse[]>> {
    const response = await this.axiosInstance.get<ApiResponse<CollectionResponse[]>>(`/collections/history/${userId}`);
    return response.data;
  }

  async getCommunityStats(): Promise<ApiResponse<CommunityStats>> {
    const response = await this.axiosInstance.get<ApiResponse<CommunityStats>>('/community/stats');
    return response.data;
  }

  async submitPost(postData: PostData): Promise<ApiResponse<CommunityPost>> {
    const response = await this.axiosInstance.post<ApiResponse<CommunityPost>>('/community/posts', postData);
    return response.data;
  }
}

export const ecoCartApi = EcoCartApi.getInstance(); 