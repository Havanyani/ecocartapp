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
      timeout: 10000,
      headers: {
        'Content-Type': 'application/json',
      },
    });

    // Add response interceptor for error handling
    this.axiosInstance.interceptors.response.use(
      (response) => response,
      (error) => {
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
            message: 'Network error occurred',
            details: error.request,
          };
          return Promise.reject(apiError);
        } else {
          // Error in request setup
          const apiError: ApiError = {
            code: 'REQUEST_ERROR',
            message: error.message,
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