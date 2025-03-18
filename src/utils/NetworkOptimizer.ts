import NetInfo from '@react-native-community/netinfo';
import { useEffect, useState } from 'react';

interface NetworkConfig {
  cacheDuration: number; // ms
  maxCacheSize: number; // MB
  retryAttempts: number;
  retryDelay: number; // ms
  offlineQueue: boolean;
}

interface CachedResponse {
  data: any;
  timestamp: number;
  etag?: string;
}

class NetworkOptimizer {
  private static instance: NetworkOptimizer;
  private config: NetworkConfig;
  private cache: Map<string, CachedResponse> = new Map();
  private offlineQueue: Array<() => Promise<void>> = [];
  private isOnline: boolean = true;

  private static readonly DEFAULT_CONFIG: NetworkConfig = {
    cacheDuration: 5 * 60 * 1000, // 5 minutes
    maxCacheSize: 50 * 1024 * 1024, // 50MB
    retryAttempts: 3,
    retryDelay: 1000, // 1 second
    offlineQueue: true,
  };

  private constructor(config: Partial<NetworkConfig> = {}) {
    this.config = {
      ...NetworkOptimizer.DEFAULT_CONFIG,
      ...config,
    };
    this.initialize();
  }

  static getInstance(): NetworkOptimizer {
    if (!NetworkOptimizer.instance) {
      NetworkOptimizer.instance = new NetworkOptimizer();
    }
    return NetworkOptimizer.instance;
  }

  private initialize(): void {
    // Subscribe to network state changes
    NetInfo.addEventListener(state => {
      this.isOnline = state.isConnected ?? true;
      if (this.isOnline && this.offlineQueue.length > 0) {
        this.processOfflineQueue();
      }
    });
  }

  private async processOfflineQueue(): Promise<void> {
    while (this.offlineQueue.length > 0) {
      const request = this.offlineQueue.shift();
      if (request) {
        try {
          await request();
        } catch (error) {
          console.error('Failed to process queued request:', error);
          // Put failed request back in queue
          this.offlineQueue.unshift(request);
        }
      }
    }
  }

  private isCacheValid(cached: CachedResponse): boolean {
    return Date.now() - cached.timestamp < this.config.cacheDuration;
  }

  private async fetchWithRetry(
    url: string,
    options: RequestInit = {},
    attempt: number = 0
  ): Promise<Response> {
    try {
      const response = await fetch(url, options);
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      return response;
    } catch (error) {
      if (attempt < this.config.retryAttempts) {
        await new Promise(resolve => setTimeout(resolve, this.config.retryDelay));
        return this.fetchWithRetry(url, options, attempt + 1);
      }
      throw error;
    }
  }

  async request<T>(
    url: string,
    options: RequestInit = {}
  ): Promise<T> {
    const cacheKey = `${url}-${JSON.stringify(options)}`;
    const cached = this.cache.get(cacheKey);

    if (cached && this.isCacheValid(cached)) {
      return cached.data;
    }

    if (!this.isOnline) {
      if (this.config.offlineQueue) {
        return new Promise((resolve, reject) => {
          this.offlineQueue.push(async () => {
            try {
              const response = await this.fetchWithRetry(url, options);
              const data = await response.json();
              this.cache.set(cacheKey, {
                data,
                timestamp: Date.now(),
                etag: response.headers.get('etag') || undefined,
              });
              resolve(data);
            } catch (error) {
              reject(error);
            }
          });
        });
      }
      throw new Error('No internet connection');
    }

    const response = await this.fetchWithRetry(url, options);
    const data = await response.json();

    this.cache.set(cacheKey, {
      data,
      timestamp: Date.now(),
      etag: response.headers.get('etag') || undefined,
    });

    return data;
  }

  clearCache(): void {
    this.cache.clear();
  }

  dispose(): void {
    this.clearCache();
    this.offlineQueue = [];
  }
}

// Export singleton instance
export const networkOptimizer = NetworkOptimizer.getInstance();

// Custom hook for optimized network requests
export function useOptimizedRequest<T>(
  url: string,
  options: RequestInit = {}
): {
  data: T | null;
  isLoading: boolean;
  error: Error | null;
  refetch: () => Promise<void>;
} {
  const [data, setData] = useState<T | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  const fetchData = async () => {
    try {
      setIsLoading(true);
      setError(null);
      const result = await networkOptimizer.request<T>(url, options);
      setData(result);
    } catch (err) {
      setError(err instanceof Error ? err : new Error('Failed to fetch data'));
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, [url, JSON.stringify(options)]);

  return {
    data,
    isLoading,
    error,
    refetch: fetchData,
  };
} 