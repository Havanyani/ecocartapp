/**
 * apiClient.ts
 * 
 * A simple Axios-based API client for making HTTP requests.
 * This client is used by various services such as CommunityService.
 */

import { environment } from '@/config/environments';
import axios from 'axios';

// Create axios instance with default configuration
const instance = axios.create({
  baseURL: environment.apiUrl,
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json',
    'Accept': 'application/json',
  }
});

// Request interceptor for API calls
instance.interceptors.request.use(
  (config) => {
    // Add authorization header if auth token exists
    const authToken = localStorage.getItem('auth_token');
    if (authToken) {
      config.headers = config.headers || {};
      config.headers.Authorization = `Bearer ${authToken}`;
    }
    
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor for API calls
instance.interceptors.response.use(
  (response) => {
    return response;
  },
  (error) => {
    // Handle specific error cases
    if (error.response) {
      // Server responded with an error status
      if (error.response.status === 401) {
        // Unauthorized - handle token refresh or logout
        // For now, just passing through
      }
    } else if (error.request) {
      // Request was made but no response was received
      console.error('No response received:', error.request);
    } else {
      // Something else happened in setting up the request
      console.error('Error setting up request:', error.message);
    }
    
    return Promise.reject(error);
  }
);

// Export the configured client
export const apiClient = instance; 