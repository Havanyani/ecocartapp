/**
 * useApi.ts
 * 
 * A versatile hook for data fetching with the API client
 * Features:
 * - Automatic loading state management
 * - Error handling
 * - Caching
 * - Pagination
 * - Polling
 * - Retry on error
 * - Dependent queries
 */

import { apiClient, RequestOptions } from '@/api/ApiClient';
import { ApiError } from '@/services/ApiService';
import { PerformanceMonitor } from '@/utils/PerformanceMonitoring';
import { useCallback, useEffect, useRef, useState } from 'react';
import { Platform } from 'react-native';
import useNetworkStatus from './useNetworkStatus';

/**
 * Query options for the useApi hook
 */
export interface ApiQueryOptions<T, P = any> extends Omit<RequestOptions, 'cache'> {
  /**
   * Function to transform the API response
   */
  transform?: (data: T) => any;
  
  /**
   * Cache settings
   */
  cache?: {
    /**
     * Enable caching (default: true)
     */
    enabled?: boolean;
    
    /**
     * Cache expiration time in milliseconds (default: 5 minutes)
     */
    expirationTime?: number;
    
    /**
     * Stale time in milliseconds - how long before refetching while using cached data
     */
    staleTime?: number;
  };
  
  /**
   * Enable polling - calls API at regular intervals
   */
  polling?: {
    /**
     * Enable polling
     */
    enabled: boolean;
    
    /**
     * Interval in milliseconds (default: 30 seconds)
     */
    interval?: number;
    
    /**
     * Only poll when window is focused (web)
     */
    onlyWhenFocused?: boolean;
  };
  
  /**
   * Enable auto-retry on error
   */
  retry?: {
    /**
     * Enable retry
     */
    enabled: boolean;
    
    /**
     * Max number of retries (default: 3)
     */
    count?: number;
    
    /**
     * Base delay in milliseconds (default: 1000)
     */
    delay?: number;
    
    /**
     * Maximum delay in milliseconds (default: 30000)
     */
    maxDelay?: number;
  };
  
  /**
   * Pagination settings
   */
  pagination?: {
    /**
     * Enable pagination
     */
    enabled: boolean;
    
    /**
     * Page size (default: 20)
     */
    pageSize?: number;
    
    /**
     * Parameter name for page (default: 'page')
     */
    pageParam?: string;
    
    /**
     * Parameter name for page size (default: 'limit')
     */
    pageSizeParam?: string;
  };
  
  /**
   * Dependent query - only fetch if dependencies are truthy
   */
  dependencies?: any[];
  
  /**
   * Callback fired when the query succeeds
   */
  onSuccess?: (data: T) => void;
  
  /**
   * Callback fired when the query fails
   */
  onError?: (error: ApiError) => void;
}

/**
 * Result from the useApi hook
 */
export interface ApiQueryResult<T, P = any> {
  /**
   * The data returned from the API
   */
  data: T | null;
  
  /**
   * Loading state
   */
  loading: boolean;
  
  /**
   * Error state
   */
  error: ApiError | null;
  
  /**
   * Whether the data is stale (older than staleTime)
   */
  isStale: boolean;
  
  /**
   * Whether the data is being refreshed in the background
   */
  isRefreshing: boolean;
  
  /**
   * Whether the data was loaded from cache
   */
  fromCache: boolean;
  
  /**
   * Refetch the data
   */
  refetch: (params?: P) => Promise<T | null>;
  
  /**
   * Fetch the next page
   */
  fetchNextPage: () => Promise<T | null>;
  
  /**
   * Reset to the first page
   */
  resetToFirstPage: () => void;
  
  /**
   * Current page
   */
  currentPage: number;
  
  /**
   * Whether there is a next page
   */
  hasNextPage: boolean;
  
  /**
   * Clear the current data
   */
  clearData: () => void;
}

/**
 * A hook for managing API requests with caching, error handling, and state management
 * @param method API method (GET, POST, etc)
 * @param url API endpoint
 * @param defaultParams Default params to pass to the API
 * @param options API query options
 */
export function useApi<T = any, P = any>(
  method: 'GET' | 'POST' | 'PUT' | 'DELETE' | 'PATCH',
  url: string,
  defaultParams?: P,
  options: ApiQueryOptions<T, P> = {}
): ApiQueryResult<T, P> {
  // Get the network status
  const { isOnline } = useNetworkStatus();
  
  // Setup state
  const [data, setData] = useState<T | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<ApiError | null>(null);
  const [isStale, setIsStale] = useState(false);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [fromCache, setFromCache] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [hasNextPage, setHasNextPage] = useState(false);
  
  // Cache settings with defaults
  const cacheSettings = {
    enabled: options.cache?.enabled ?? true,
    expirationTime: options.cache?.expirationTime ?? 5 * 60 * 1000, // 5 minutes
    staleTime: options.cache?.staleTime ?? 60 * 1000, // 1 minute
  };
  
  // Pagination settings with defaults
  const paginationSettings = options.pagination?.enabled ? {
    enabled: true,
    pageSize: options.pagination.pageSize ?? 20,
    pageParam: options.pagination.pageParam ?? 'page',
    pageSizeParam: options.pagination.pageSizeParam ?? 'limit',
  } : { enabled: false };
  
  // Polling settings with defaults
  const pollingSettings = options.polling?.enabled ? {
    enabled: true,
    interval: options.polling.interval ?? 30 * 1000, // 30 seconds
    onlyWhenFocused: options.polling.onlyWhenFocused ?? true,
  } : { enabled: false };
  
  // Retry settings with defaults
  const retrySettings = options.retry?.enabled ? {
    enabled: true,
    count: options.retry.count ?? 3,
    delay: options.retry.delay ?? 1000, // 1 second
    maxDelay: options.retry.maxDelay ?? 30 * 1000, // 30 seconds
  } : { enabled: false };
  
  // Track dependencies
  const hasDependencies = !!options.dependencies;
  const allDependenciesAvailable = hasDependencies ? 
    options.dependencies!.every(dep => dep !== undefined && dep !== null) : true;
  
  // Refs
  const pollingIntervalRef = useRef<NodeJS.Timeout | null>(null);
  const abortControllerRef = useRef<AbortController | null>(null);
  const retryCountRef = useRef(0);
  const isMountedRef = useRef(true);
  const lastFetchTimeRef = useRef<number | null>(null);
  const initialParamsRef = useRef(defaultParams);
  const currentParamsRef = useRef(defaultParams);
  
  // Cleanup function
  const cleanup = useCallback(() => {
    if (pollingIntervalRef.current) {
      clearInterval(pollingIntervalRef.current);
      pollingIntervalRef.current = null;
    }
    
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
      abortControllerRef.current = null;
    }
  }, []);
  
  // Handle window focus/blur for polling (web only)
  useEffect(() => {
    if (Platform.OS === 'web' && pollingSettings.enabled && pollingSettings.onlyWhenFocused) {
      const handleVisibilityChange = () => {
        if (document.visibilityState === 'visible') {
          setupPolling();
        } else {
          if (pollingIntervalRef.current) {
            clearInterval(pollingIntervalRef.current);
            pollingIntervalRef.current = null;
          }
        }
      };
      
      document.addEventListener('visibilitychange', handleVisibilityChange);
      
      return () => {
        document.removeEventListener('visibilitychange', handleVisibilityChange);
      };
    }
  }, [pollingSettings.enabled, pollingSettings.onlyWhenFocused]);
  
  // Setup polling
  const setupPolling = useCallback(() => {
    if (pollingSettings.enabled && isOnline) {
      if (pollingIntervalRef.current) {
        clearInterval(pollingIntervalRef.current);
      }
      
      pollingIntervalRef.current = setInterval(() => {
        if (
          isMountedRef.current && 
          allDependenciesAvailable && 
          (!pollingSettings.onlyWhenFocused || 
            (Platform.OS === 'web' && document.visibilityState === 'visible'))
        ) {
          fetchData(currentParamsRef.current, true);
        }
      }, pollingSettings.interval);
    }
  }, [
    pollingSettings.enabled, 
    pollingSettings.interval, 
    pollingSettings.onlyWhenFocused, 
    isOnline, 
    allDependenciesAvailable
  ]);
  
  // Reset state
  const resetState = useCallback(() => {
    setData(null);
    setError(null);
    setLoading(false);
    setIsStale(false);
    setIsRefreshing(false);
    setFromCache(false);
    setCurrentPage(1);
    setHasNextPage(false);
    
    retryCountRef.current = 0;
    lastFetchTimeRef.current = null;
  }, []);
  
  // Clear data
  const clearData = useCallback(() => {
    resetState();
  }, [resetState]);
  
  // Determine if we should update from cache
  const shouldUpdateFromCache = useCallback((cachedData: T, currentData: T | null) => {
    // Always update if we don't have data
    if (currentData === null) return true;
    
    // If we have a transform function, let it decide
    if (options.transform) {
      return true; // For safety, always update if there's a transform
    }
    
    // Otherwise, prefer newer data
    return true;
  }, [options.transform]);
  
  // Main fetch function
  const fetchData = useCallback(async (
    params?: P, 
    silent: boolean = false,
    refreshing: boolean = false,
    pagination: boolean = false
  ): Promise<T | null> => {
    // Don't fetch if dependencies aren't available
    if (hasDependencies && !allDependenciesAvailable) {
      return null;
    }
    
    // Don't proceed if offline
    if (!isOnline && !refreshing) {
      const offlineError = new ApiError(
        'You are offline. Please check your connection and try again.',
        'network' as any,
        null
      );
      
      if (!silent) {
        setError(offlineError);
      }
      
      if (options.onError) {
        options.onError(offlineError);
      }
      
      return null;
    }
    
    // Update loading state
    if (!silent && !refreshing) {
      setLoading(true);
    }
    
    if (refreshing) {
      setIsRefreshing(true);
    }
    
    // Save current params
    currentParamsRef.current = params || defaultParams;
    
    // Reset stale state
    setIsStale(false);
    
    // Create pagination params if necessary
    let finalParams = params ? { ...params } : defaultParams ? { ...defaultParams } : {};
    if (paginationSettings.enabled && !pagination) {
      // Use string keys for computed properties
      const pageParamKey = paginationSettings.pageParam || 'page';
      const pageSizeParamKey = paginationSettings.pageSizeParam || 'limit';
      
      finalParams = {
        ...finalParams,
        [pageParamKey]: 1,
        [pageSizeParamKey]: paginationSettings.pageSize,
      } as any;
      setCurrentPage(1);
    } else if (paginationSettings.enabled && pagination) {
      // Use string keys for computed properties
      const pageParamKey = paginationSettings.pageParam || 'page';
      const pageSizeParamKey = paginationSettings.pageSizeParam || 'limit';
      
      finalParams = {
        ...finalParams,
        [pageParamKey]: currentPage + 1,
        [pageSizeParamKey]: paginationSettings.pageSize,
      } as any;
    }
    
    // Cleanup existing request
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
    }
    
    // Create a new abort controller
    abortControllerRef.current = new AbortController();
    
    // Create API options
    const apiOptions: RequestOptions = {
      ...options,
      signal: abortControllerRef.current.signal,
      cache: {
        enabled: cacheSettings.enabled,
        expirationTime: cacheSettings.expirationTime,
      },
      forceRefresh: refreshing,
    };
    
    // Start timing
    const startTime = Date.now();
    
    try {
      // Make the request
      let response: any;
      switch (method) {
        case 'GET':
          response = await apiClient.get<T>(url, finalParams as any, apiOptions);
          break;
        case 'POST':
          response = await apiClient.post<T>(url, finalParams, apiOptions);
          break;
        case 'PUT':
          response = await apiClient.put<T>(url, finalParams, apiOptions);
          break;
        case 'DELETE':
          response = await apiClient.delete<T>(url, apiOptions);
          break;
        case 'PATCH':
          response = await apiClient.patch<T>(url, finalParams, apiOptions);
          break;
      }
      
      // Track fetch time
      const fetchTime = Date.now() - startTime;
      PerformanceMonitor.recordMetric({
        name: `api_${method.toLowerCase()}_${url}`,
        duration: fetchTime,
        type: 'api',
        timestamp: Date.now()
      });
      
      // Apply transform if available
      const finalData = options.transform ? options.transform(response.data) : response.data;
      
      // Check if we should update from cache
      const shouldUpdate = response.fromCache ? 
        shouldUpdateFromCache(finalData, data) : true;
      
      // Handle pagination
      if (paginationSettings.enabled && pagination && Array.isArray(finalData)) {
        // For pagination, append the data to existing
        if (shouldUpdate && isMountedRef.current) {
          setData(prev => {
            if (Array.isArray(prev)) {
              return [...prev, ...finalData] as any;
            }
            return finalData;
          });
          
          // Determine if there's a next page based on returned data size
          const hasNext = finalData.length === paginationSettings.pageSize;
          setHasNextPage(hasNext);
          
          if (hasNext) {
            setCurrentPage(prev => prev + 1);
          }
        }
      } else if (shouldUpdate && isMountedRef.current) {
        // For non-pagination, replace the data
        setData(finalData);
        
        // For pagination with reset, determine next page
        if (paginationSettings.enabled && Array.isArray(finalData)) {
          setHasNextPage(finalData.length === paginationSettings.pageSize);
        }
      }
      
      // Clear errors
      if (isMountedRef.current) {
        setError(null);
      }
      
      // Reset retry count
      retryCountRef.current = 0;
      
      // Set cache status
      if (isMountedRef.current) {
        setFromCache(!!response.fromCache);
      }
      
      // Fire success callback
      if (options.onSuccess) {
        options.onSuccess(finalData);
      }
      
      // Update stale time tracking
      lastFetchTimeRef.current = Date.now();
      
      // Schedule stale state update
      if (cacheSettings.staleTime) {
        setTimeout(() => {
          if (isMountedRef.current) {
            setIsStale(true);
          }
        }, cacheSettings.staleTime);
      }
      
      return finalData;
    } catch (err) {
      const apiError = err instanceof ApiError ? 
        err : 
        new ApiError(
          'An unexpected error occurred',
          'unknown' as any,
          null,
          null,
          err instanceof Error ? err : undefined
        );
      
      // Don't update state for silent requests
      if (!silent && isMountedRef.current) {
        setError(apiError);
      }
      
      // Fire error callback
      if (options.onError) {
        options.onError(apiError);
      }
      
      // Handle retries
      if (
        retrySettings.enabled && 
        isOnline &&
        retryCountRef.current < (retrySettings.count || 3) &&
        (apiError.type === 'network' || apiError.type === 'timeout' || 
         (apiError.status && apiError.status >= 500))
      ) {
        retryCountRef.current++;
        
        // Exponential backoff with defined defaults
        const retryDelay = retrySettings.delay || 1000;
        const maxRetryDelay = retrySettings.maxDelay || 30000;
        
        const delay = Math.min(
          maxRetryDelay,
          retryDelay * Math.pow(2, retryCountRef.current - 1)
        );
        
        setTimeout(() => {
          if (isMountedRef.current) {
            fetchData(params, silent, refreshing);
          }
        }, delay);
      }
      
      return null;
    } finally {
      // Reset loading state
      if (!silent && isMountedRef.current) {
        setLoading(false);
      }
      
      if (refreshing && isMountedRef.current) {
        setIsRefreshing(false);
      }
      
      // Clear abort controller
      abortControllerRef.current = null;
    }
  }, [
    method, 
    url, 
    defaultParams,
    options, 
    hasDependencies, 
    allDependenciesAvailable, 
    cacheSettings,
    paginationSettings,
    retrySettings,
    isOnline,
    data,
    currentPage,
    shouldUpdateFromCache
  ]);
  
  // Refetch data
  const refetch = useCallback(async (params?: P): Promise<T | null> => {
    return fetchData(params, false, true);
  }, [fetchData]);
  
  // Fetch next page
  const fetchNextPage = useCallback(async (): Promise<T | null> => {
    if (!paginationSettings.enabled) {
      return null;
    }
    
    if (!hasNextPage) {
      return data;
    }
    
    return fetchData(currentParamsRef.current, false, false, true);
  }, [fetchData, paginationSettings.enabled, hasNextPage, data]);
  
  // Reset to first page
  const resetToFirstPage = useCallback(() => {
    if (!paginationSettings.enabled) {
      return;
    }
    
    setCurrentPage(1);
    setHasNextPage(false);
    setData(null);
    
    fetchData(currentParamsRef.current);
  }, [paginationSettings.enabled, fetchData]);
  
  // Initial fetch
  useEffect(() => {
    if (allDependenciesAvailable) {
      fetchData(initialParamsRef.current);
      setupPolling();
    }
    
    return () => {
      cleanup();
    };
  }, [allDependenciesAvailable, setupPolling, fetchData, cleanup]);
  
  // Set mounted ref
  useEffect(() => {
    isMountedRef.current = true;
    
    return () => {
      isMountedRef.current = false;
      cleanup();
    };
  }, [cleanup]);
  
  // Re-fetch when coming online
  useEffect(() => {
    if (isOnline && error && error.type === 'network') {
      fetchData(currentParamsRef.current);
    }
  }, [isOnline, error, fetchData]);
  
  return {
    data,
    loading,
    error,
    isStale,
    isRefreshing,
    fromCache,
    refetch,
    fetchNextPage,
    resetToFirstPage,
    currentPage,
    hasNextPage,
    clearData,
  };
}

export default useApi; 