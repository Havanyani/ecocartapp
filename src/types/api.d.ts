import { AxiosInstance, AxiosRequestConfig, AxiosResponse, InternalAxiosRequestConfig } from 'axios';
import { User } from './User';

export interface ApiResponse<T> {
  data: T;
  status: number;
  statusText: string;
  headers: Record<string, string>;
  config: AxiosRequestConfig;
}

export interface AuthResponse {
  user: User;
  token: string;
}

export interface ApiService {
  api: AxiosInstance;
  getAuthToken(): Promise<string | null>;
  setAuthToken(token: string): Promise<void>;
  removeAuthToken(): Promise<void>;
  get<T>(url: string, config?: AxiosRequestConfig): Promise<T>;
  post<T>(url: string, data?: any, config?: AxiosRequestConfig): Promise<T>;
  put<T>(url: string, data?: any, config?: AxiosRequestConfig): Promise<T>;
  patch<T>(url: string, data?: any, config?: AxiosRequestConfig): Promise<T>;
  delete<T>(url: string, config?: AxiosRequestConfig): Promise<T>;
  
  // Auth endpoints
  login(credentials: { email: string; password: string }): Promise<AuthResponse>;
  register(data: { email: string; password: string; name: string }): Promise<AuthResponse>;
  logout(): Promise<void>;
  resetPassword(email: string): Promise<void>;
  
  // User endpoints
  getCurrentUser(): Promise<User>;
  updateUser(data: Partial<User>): Promise<User>;
  updateUserSettings(data: any): Promise<void>;
  
  // Order endpoints
  getOrders(params?: any): Promise<any[]>;
  getOrder(id: string): Promise<any>;
  createOrder(data: any): Promise<any>;
  cancelOrder(id: string): Promise<void>;
  
  // Collection endpoints
  getCollections(params?: any): Promise<any[]>;
  getCollection(id: string): Promise<any>;
  scheduleCollection(data: any): Promise<any>;
  cancelCollection(id: string): Promise<void>;
  
  // Feedback endpoints
  submitFeedback(data: any): Promise<any>;
  getFeedback(id: string): Promise<any>;
  updateFeedback(id: string, data: any): Promise<any>;
  deleteFeedback(id: string): Promise<void>;
}

declare module 'axios' {
  export interface AxiosInstance {
    interceptors: {
      request: {
        use(
          onFulfilled?: (config: InternalAxiosRequestConfig) => InternalAxiosRequestConfig | Promise<InternalAxiosRequestConfig>,
          onRejected?: (error: any) => any
        ): number;
      };
      response: {
        use(
          onFulfilled?: (response: AxiosResponse) => AxiosResponse | Promise<AxiosResponse>,
          onRejected?: (error: any) => any
        ): number;
      };
    };
  }
} 