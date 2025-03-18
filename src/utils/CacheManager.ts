import { SafeStorage } from '@/utils/storage';
import { PerformanceMonitor } from './PerformanceMonitoring';

interface CacheConfig {
  defaultTTL: number;  // Time-to-live in milliseconds
  maxEntries: number;
  cleanupInterval: number;
}

interface CacheEntry<T> {
  value: T;
  timestamp: number;
  ttl: number;
}

interface CacheStats {
  totalEntries: number;
  oldestEntry: number;
  newestEntry: number;
  averageAge: number;
  hitRate: number;
  missRate: number;
}

export class CacheManager {
  private static config: CacheConfig = {
    defaultTTL: 30 * 60 * 1000, // 30 minutes
    maxEntries: 100,
    cleanupInterval: 5 * 60 * 1000 // 5 minutes
  };

  private static stats = {
    hits: 0,
    misses: 0
  };

  static async initialize(config?: Partial<CacheConfig>): Promise<void> {
    try {
      if (config) {
        this.config = { ...this.config, ...config };
      }

      // Start cleanup interval
      setInterval(() => {
        this.cleanup().catch(error => {
          PerformanceMonitor.captureError(error instanceof Error ? error : new Error(String(error)));
        });
      }, this.config.cleanupInterval);

      PerformanceMonitor.addBreadcrumb('cache', 'Cache manager initialized');
    } catch (error: unknown) {
      PerformanceMonitor.captureError(error instanceof Error ? error : new Error(String(error)));
      throw error;
    }
  }

  static async setCacheItem<T>(
    key: string,
    value: T,
    ttl: number = this.config.defaultTTL
  ): Promise<void> {
    try {
      const entry: CacheEntry<T> = {
        value,
        timestamp: Date.now(),
        ttl
      };

      await AsyncStorage.setItem(
        this.getCacheKey(key),
        JSON.stringify(entry)
      );

      // Check if we need to clean up old entries
      const keys = await SafeStorage.getAllKeys();
      const cacheKeys = keys.filter(k => k.startsWith('cache:'));
      if (cacheKeys.length > this.config.maxEntries) {
        await this.cleanup();
      }
    } catch (error: unknown) {
      PerformanceMonitor.captureError(error instanceof Error ? error : new Error(String(error)));
      throw error;
    }
  }

  static async getCacheItem<T>(key: string): Promise<T | null> {
    try {
      const data = await SafeStorage.getItem(this.getCacheKey(key));
      
      if (!data) {
        this.stats.misses++;
        return null;
      }

      const entry = JSON.parse(data) as CacheEntry<T>;
      const now = Date.now();

      if (now - entry.timestamp > entry.ttl) {
        // Entry has expired
        await this.removeCacheItem(key);
        this.stats.misses++;
        return null;
      }

      this.stats.hits++;
      return entry.value;
    } catch (error: unknown) {
      PerformanceMonitor.captureError(error instanceof Error ? error : new Error(String(error)));
      return null;
    }
  }

  static async removeCacheItem(key: string): Promise<void> {
    try {
      await SafeStorage.removeItem(this.getCacheKey(key));
    } catch (error: unknown) {
      PerformanceMonitor.captureError(error instanceof Error ? error : new Error(String(error)));
      throw error;
    }
  }

  static async clearCache(): Promise<void> {
    try {
      const keys = await SafeStorage.getAllKeys();
      const cacheKeys = keys.filter(k => k.startsWith('cache:'));
      await SafeStorage.multiRemove(cacheKeys);
      
      // Reset stats
      this.stats.hits = 0;
      this.stats.misses = 0;

      PerformanceMonitor.addBreadcrumb('cache', 'Cache cleared');
    } catch (error: unknown) {
      PerformanceMonitor.captureError(error instanceof Error ? error : new Error(String(error)));
      throw error;
    }
  }

  static async getCacheStats(): Promise<CacheStats> {
    try {
      const keys = await SafeStorage.getAllKeys();
      const cacheKeys = keys.filter(k => k.startsWith('cache:'));
      const entries: CacheEntry<unknown>[] = [];
      const now = Date.now();

      // Collect all valid entries
      for (const key of cacheKeys) {
        const data = await SafeStorage.getItem(key);
        if (data) {
          const entry = JSON.parse(data) as CacheEntry<unknown>;
          if (now - entry.timestamp <= entry.ttl) {
            entries.push(entry);
          }
        }
      }

      const timestamps = entries.map(e => e.timestamp);
      const totalRequests = this.stats.hits + this.stats.misses;

      return {
        totalEntries: entries.length,
        oldestEntry: Math.min(...timestamps),
        newestEntry: Math.max(...timestamps),
        averageAge: entries.reduce((sum, e) => sum + (now - e.timestamp), 0) / entries.length,
        hitRate: totalRequests ? this.stats.hits / totalRequests : 0,
        missRate: totalRequests ? this.stats.misses / totalRequests : 0
      };
    } catch (error: unknown) {
      PerformanceMonitor.captureError(error instanceof Error ? error : new Error(String(error)));
      throw error;
    }
  }

  private static async cleanup(): Promise<void> {
    try {
      const keys = await SafeStorage.getAllKeys();
      const cacheKeys = keys.filter(k => k.startsWith('cache:'));
      const now = Date.now();
      const keysToRemove: string[] = [];

      // Find expired entries
      for (const key of cacheKeys) {
        const data = await SafeStorage.getItem(key);
        if (data) {
          const entry = JSON.parse(data) as CacheEntry<unknown>;
          if (now - entry.timestamp > entry.ttl) {
            keysToRemove.push(key);
          }
        }
      }

      // Remove expired entries
      if (keysToRemove.length > 0) {
        await SafeStorage.multiRemove(keysToRemove);
        PerformanceMonitor.addBreadcrumb('cache', `Cleaned up ${keysToRemove.length} expired entries`);
      }
    } catch (error: unknown) {
      PerformanceMonitor.captureError(error instanceof Error ? error : new Error(String(error)));
    }
  }

  private static getCacheKey(key: string): string {
    return `cache:${key}`;
  }
} 