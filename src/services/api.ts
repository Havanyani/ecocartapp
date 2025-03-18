import axios, { InternalAxiosRequestConfig } from 'axios';
import * as SecureStore from 'expo-secure-store';
import { ApiService, AuthResponse } from '@/types/api';
import { User } from '@/types/User';

const API_URL = process.env.EXPO_PUBLIC_API_URL || 'http://localhost:3000/api';

class ApiServiceImpl implements ApiService {
  api: ReturnType<typeof axios.create>;

  constructor() {
    this.api = axios.create({
      baseURL: API_URL,
      headers: {
        'Content-Type': 'application/json',
      },
    });

    // Add request interceptor
    this.api.interceptors.request.use(
      async (config: InternalAxiosRequestConfig) => {
        const token = await this.getAuthToken();
        if (token && config.headers) {
          config.headers.Authorization = `Bearer ${token}`;
        }
        return config;
      },
      (error) => {
        return Promise.reject(error);
      }
    );

    // Add response interceptor
    this.api.interceptors.response.use(
      (response) => response,
      async (error) => {
        if (error.response?.status === 401) {
          await this.removeAuthToken();
        }
        return Promise.reject(error);
      }
    );
  }

  async getAuthToken(): Promise<string | null> {
    try {
      return await SecureStore.getItemAsync('auth_token');
    } catch (error) {
      console.error('Error getting auth token:', error);
      return null;
    }
  }

  async setAuthToken(token: string): Promise<void> {
    try {
      await SecureStore.setItemAsync('auth_token', token);
    } catch (error) {
      console.error('Error setting auth token:', error);
      throw error;
    }
  }

  async removeAuthToken(): Promise<void> {
    try {
      await SecureStore.deleteItemAsync('auth_token');
    } catch (error) {
      console.error('Error removing auth token:', error);
      throw error;
    }
  }

  async get<T>(url: string, config?: any): Promise<T> {
    const response = await this.api.get<T>(url, config);
    return response.data;
  }

  async post<T>(url: string, data?: any, config?: any): Promise<T> {
    const response = await this.api.post<T>(url, data, config);
    return response.data;
  }

  async put<T>(url: string, data?: any, config?: any): Promise<T> {
    const response = await this.api.put<T>(url, data, config);
    return response.data;
  }

  async patch<T>(url: string, data?: any, config?: any): Promise<T> {
    const response = await this.api.patch<T>(url, data, config);
    return response.data;
  }

  async delete<T>(url: string, config?: any): Promise<T> {
    const response = await this.api.delete<T>(url, config);
    return response.data;
  }

  // Auth endpoints
  async login(credentials: { email: string; password: string }): Promise<AuthResponse> {
    return this.post<AuthResponse>('/auth/login', credentials);
  }

  async register(data: { email: string; password: string; name: string }): Promise<AuthResponse> {
    return this.post<AuthResponse>('/auth/register', data);
  }

  async logout(): Promise<void> {
    await this.post('/auth/logout');
  }

  async resetPassword(email: string): Promise<void> {
    await this.post('/auth/reset-password', { email });
  }

  // User endpoints
  async getCurrentUser(): Promise<User> {
    return this.get<User>('/user/me');
  }

  async updateUser(data: Partial<User>): Promise<User> {
    return this.patch<User>('/user/me', data);
  }

  async updateUserSettings(data: any): Promise<void> {
    await this.patch('/user/settings', data);
  }

  // Order endpoints
  async getOrders(params?: any): Promise<any[]> {
    return this.get<any[]>('/orders', { params });
  }

  async getOrder(id: string): Promise<any> {
    return this.get(`/orders/${id}`);
  }

  async createOrder(data: any): Promise<any> {
    return this.post('/orders', data);
  }

  async cancelOrder(id: string): Promise<void> {
    await this.post(`/orders/${id}/cancel`);
  }

  // Collection endpoints
  async getCollections(params?: any): Promise<any[]> {
    return this.get<any[]>('/collections', { params });
  }

  async getCollection(id: string): Promise<any> {
    return this.get(`/collections/${id}`);
  }

  async scheduleCollection(data: any): Promise<any> {
    return this.post('/collections', data);
  }

  async cancelCollection(id: string): Promise<void> {
    await this.post(`/collections/${id}/cancel`);
  }

  // Feedback endpoints
  async submitFeedback(data: any): Promise<any> {
    return this.post('/feedback', data);
  }

  async getFeedback(id: string): Promise<any> {
    return this.get(`/feedback/${id}`);
  }

  async updateFeedback(id: string, data: any): Promise<any> {
    return this.patch(`/feedback/${id}`, data);
  }

  async deleteFeedback(id: string): Promise<void> {
    await this.delete(`/feedback/${id}`);
  }
}

export const api = new ApiServiceImpl(); 