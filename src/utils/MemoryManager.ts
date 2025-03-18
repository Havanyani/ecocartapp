import { InteractionManager, Platform } from 'react-native';

interface MemoryThreshold {
  warning: number; // MB
  critical: number; // MB
}

interface MemoryManagerConfig {
  thresholds: MemoryThreshold;
  autoCleanup: boolean;
  cleanupInterval: number; // ms
}

class MemoryManager {
  private static instance: MemoryManager;
  private config: MemoryManagerConfig;
  private cleanupInterval: NodeJS.Timeout | null = null;
  private componentCache: Map<string, { component: any; lastAccessed: number }> = new Map();
  private static readonly DEFAULT_CONFIG: MemoryManagerConfig = {
    thresholds: {
      warning: 100, // 100MB
      critical: 200, // 200MB
    },
    autoCleanup: true,
    cleanupInterval: 5 * 60 * 1000, // 5 minutes
  };

  private constructor(config: Partial<MemoryManagerConfig> = {}) {
    this.config = {
      ...MemoryManager.DEFAULT_CONFIG,
      ...config,
    };
    this.initialize();
  }

  static getInstance(): MemoryManager {
    if (!MemoryManager.instance) {
      MemoryManager.instance = new MemoryManager();
    }
    return MemoryManager.instance;
  }

  private initialize(): void {
    if (this.config.autoCleanup) {
      this.startCleanupInterval();
    }
  }

  private startCleanupInterval(): void {
    this.cleanupInterval = setInterval(() => {
      this.performCleanup();
    }, this.config.cleanupInterval);
  }

  private stopCleanupInterval(): void {
    if (this.cleanupInterval) {
      clearInterval(this.cleanupInterval);
      this.cleanupInterval = null;
    }
  }

  async performCleanup(): Promise<void> {
    // Defer cleanup until after interactions
    await InteractionManager.runAfterInteractions();

    const now = Date.now();
    const maxAge = 30 * 60 * 1000; // 30 minutes

    for (const [key, value] of this.componentCache.entries()) {
      if (now - value.lastAccessed > maxAge) {
        this.componentCache.delete(key);
      }
    }

    // Force garbage collection on Android
    if (Platform.OS === 'android') {
      // @ts-ignore - Android-specific API
      if (global.gc) {
        // @ts-ignore
        global.gc();
      }
    }
  }

  cacheComponent(key: string, component: any): void {
    this.componentCache.set(key, {
      component,
      lastAccessed: Date.now(),
    });
  }

  getCachedComponent(key: string): any | undefined {
    const cached = this.componentCache.get(key);
    if (cached) {
      cached.lastAccessed = Date.now();
      return cached.component;
    }
    return undefined;
  }

  clearCache(): void {
    this.componentCache.clear();
  }

  dispose(): void {
    this.stopCleanupInterval();
    this.clearCache();
  }
}

// Export singleton instance
export const memoryManager = MemoryManager.getInstance();

// Custom hook for memory-aware component caching
export function useMemoryAwareCache<T>(key: string, value: T): T {
  const cachedValue = memoryManager.getCachedComponent(key);
  if (cachedValue) {
    return cachedValue;
  }
  memoryManager.cacheComponent(key, value);
  return value;
} 