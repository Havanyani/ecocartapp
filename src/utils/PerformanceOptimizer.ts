import AsyncStorage from '@react-native-async-storage/async-storage';
import * as FileSystem from 'expo-file-system';
import { Image } from 'expo-image';
import { Platform } from 'react-native';
import { performanceAnalytics } from './PerformanceAnalytics';
import { PerformanceMonitor } from './PerformanceMonitoring';

interface ImageCacheConfig {
  maxSize: number;
  maxAge: number;
  enabled: boolean;
}

interface PerformanceOptimizerConfig {
  imageCache: ImageCacheConfig;
  codeSplitting: {
    enabled: boolean;
    chunkSize: number;
  };
  lazyLoading: {
    enabled: boolean;
    threshold: number;
  };
}

interface OptimizationSuggestion {
  id: string;
  title: string;
  description: string;
  impact: 'high' | 'medium' | 'low';
  category: 'memory' | 'network' | 'render' | 'frameRate' | 'interaction';
  action: string;
  timestamp: number;
}

interface PerformanceSnapshot {
  timestamp: number;
  metrics: {
    memoryUsage: number;
    networkLatency: number;
    renderTime: number;
    frameRate: number;
    interactionDelay: number;
  };
  suggestions: OptimizationSuggestion[];
}

export class PerformanceOptimizer {
  private static instance: PerformanceOptimizer;
  private config: PerformanceOptimizerConfig;
  private imageCache: Map<string, { path: string; timestamp: number }> = new Map();
  private static readonly DEFAULT_CONFIG: PerformanceOptimizerConfig = {
    imageCache: {
      maxSize: 100 * 1024 * 1024, // 100MB
      maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
      enabled: true,
    },
    codeSplitting: {
      enabled: true,
      chunkSize: 50 * 1024, // 50KB
    },
    lazyLoading: {
      enabled: true,
      threshold: 100, // pixels from viewport
    },
  };
  private static readonly STORAGE_KEY = '@performance_snapshots';
  private static readonly MAX_SNAPSHOTS = 100;

  private constructor(config: Partial<PerformanceOptimizerConfig> = {}) {
    this.config = {
      ...PerformanceOptimizer.DEFAULT_CONFIG,
      ...config,
    };
    this.initialize();
  }

  static getInstance(): PerformanceOptimizer {
    if (!PerformanceOptimizer.instance) {
      PerformanceOptimizer.instance = new PerformanceOptimizer();
    }
    return PerformanceOptimizer.instance;
  }

  private async initialize(): Promise<void> {
    if (this.config.imageCache.enabled) {
      await this.setupImageCache();
    }
    if (this.config.codeSplitting.enabled) {
      await this.setupCodeSplitting();
    }
  }

  private async setupImageCache(): Promise<void> {
    try {
      const cacheDir = `${FileSystem.cacheDirectory}image-cache/`;
      const dirInfo = await FileSystem.getInfoAsync(cacheDir);
      
      if (!dirInfo.exists) {
        await FileSystem.makeDirectoryAsync(cacheDir, { intermediates: true });
      }

      // Clean old cache entries
      await this.cleanImageCache();
    } catch (error) {
      console.error('Failed to setup image cache:', error);
      PerformanceMonitor.captureError(error instanceof Error ? error : new Error('Failed to setup image cache'));
    }
  }

  private async setupCodeSplitting(): Promise<void> {
    if (Platform.OS === 'web') {
      // Web-specific code splitting setup
      // This would typically be handled by the bundler (webpack/rollup)
      console.log('Code splitting enabled for web platform');
    }
  }

  async optimizeImage(url: string, options: { width?: number; height?: number } = {}): Promise<string> {
    if (!this.config.imageCache.enabled) {
      return url;
    }

    try {
      const cacheKey = this.getCacheKey(url, options);
      const cached = this.imageCache.get(cacheKey);

      if (cached) {
        const fileInfo = await FileSystem.getInfoAsync(cached.path);
        if (fileInfo.exists) {
          return cached.path;
        }
        this.imageCache.delete(cacheKey);
      }

      const cachePath = `${FileSystem.cacheDirectory}image-cache/${this.hashString(cacheKey)}`;
      
      // Download and cache the image
      await FileSystem.downloadAsync(url, cachePath);
      
      // Optimize the image if dimensions are specified
      if (options.width || options.height) {
        await Image.createAsync(cachePath, {
          width: options.width,
          height: options.height,
          contentFit: 'cover',
        });
      }

      this.imageCache.set(cacheKey, {
        path: cachePath,
        timestamp: Date.now(),
      });

      return cachePath;
    } catch (error) {
      console.error('Failed to optimize image:', error);
      PerformanceMonitor.captureError(error instanceof Error ? error : new Error('Failed to optimize image'));
      return url;
    }
  }

  private async cleanImageCache(): Promise<void> {
    try {
      const now = Date.now();
      for (const [key, value] of this.imageCache.entries()) {
        if (now - value.timestamp > this.config.imageCache.maxAge) {
          await FileSystem.deleteAsync(value.path);
          this.imageCache.delete(key);
        }
      }

      // Check total cache size
      const cacheDir = `${FileSystem.cacheDirectory}image-cache/`;
      const dirInfo = await FileSystem.getInfoAsync(cacheDir);
      if (dirInfo.exists && dirInfo.size && dirInfo.size > this.config.imageCache.maxSize) {
        // Remove oldest entries until we're under the size limit
        const sortedEntries = Array.from(this.imageCache.entries())
          .sort((a, b) => a[1].timestamp - b[1].timestamp);

        for (const [key, value] of sortedEntries) {
          if (dirInfo.size <= this.config.imageCache.maxSize) break;
          
          await FileSystem.deleteAsync(value.path);
          this.imageCache.delete(key);
        }
      }
    } catch (error) {
      console.error('Failed to clean image cache:', error);
      PerformanceMonitor.captureError(error instanceof Error ? error : new Error('Failed to clean image cache'));
    }
  }

  private getCacheKey(url: string, options: { width?: number; height?: number }): string {
    return `${url}-${options.width || 'auto'}-${options.height || 'auto'}`;
  }

  private hashString(str: string): string {
    let hash = 0;
    for (let i = 0; i < str.length; i++) {
      const char = str.charCodeAt(i);
      hash = ((hash << 5) - hash) + char;
      hash = hash & hash;
    }
    return Math.abs(hash).toString(36);
  }

  // Lazy loading helper
  shouldLoad(offset: number): boolean {
    return this.config.lazyLoading.enabled && offset <= this.config.lazyLoading.threshold;
  }

  // Update configuration
  updateConfig(newConfig: Partial<PerformanceOptimizerConfig>): void {
    this.config = {
      ...this.config,
      ...newConfig,
    };
  }

  async analyzePerformance(): Promise<OptimizationSuggestion[]> {
    const latestMetrics = performanceAnalytics.getLatestMetrics();
    if (!latestMetrics) return [];

    const suggestions: OptimizationSuggestion[] = [];

    // Memory usage analysis
    if (latestMetrics.memoryUsage > 150) { // 150MB threshold
      suggestions.push({
        id: 'memory_high_usage',
        title: 'High Memory Usage',
        description: `Memory usage is at ${latestMetrics.memoryUsage.toFixed(1)}MB. Consider implementing memory optimization techniques.`,
        impact: 'high',
        category: 'memory',
        action: 'Implement memory optimization techniques such as:\n- Use React.memo for expensive components\n- Implement proper cleanup in useEffect\n- Optimize image loading and caching',
        timestamp: Date.now(),
      });
    }

    // Network latency analysis
    if (latestMetrics.networkLatency > 2000) { // 2s threshold
      suggestions.push({
        id: 'network_high_latency',
        title: 'High Network Latency',
        description: `Network latency is ${latestMetrics.networkLatency}ms. Consider optimizing network requests.`,
        impact: 'high',
        category: 'network',
        action: 'Implement network optimization techniques such as:\n- Use request caching\n- Implement request debouncing\n- Optimize API response payloads',
        timestamp: Date.now(),
      });
    }

    // Render time analysis
    if (latestMetrics.renderTime > 16) { // 16ms threshold (60fps)
      suggestions.push({
        id: 'render_slow',
        title: 'Slow Render Time',
        description: `Render time is ${latestMetrics.renderTime.toFixed(1)}ms. Consider optimizing component rendering.`,
        impact: 'medium',
        category: 'render',
        action: 'Implement render optimization techniques such as:\n- Use useMemo and useCallback\n- Implement virtualization for long lists\n- Optimize component re-renders',
        timestamp: Date.now(),
      });
    }

    // Frame rate analysis
    if (latestMetrics.frameRate < 45) { // 45fps threshold
      suggestions.push({
        id: 'frame_rate_low',
        title: 'Low Frame Rate',
        description: `Frame rate is ${latestMetrics.frameRate}fps. Consider optimizing animations and transitions.`,
        impact: 'high',
        category: 'frameRate',
        action: 'Implement frame rate optimization techniques such as:\n- Use native driver for animations\n- Optimize heavy computations\n- Implement proper animation cleanup',
        timestamp: Date.now(),
      });
    }

    // Interaction delay analysis
    if (latestMetrics.interactionDelay > 100) { // 100ms threshold
      suggestions.push({
        id: 'interaction_delay',
        title: 'High Interaction Delay',
        description: `Interaction delay is ${latestMetrics.interactionDelay.toFixed(1)}ms. Consider optimizing user interactions.`,
        impact: 'medium',
        category: 'interaction',
        action: 'Implement interaction optimization techniques such as:\n- Use proper event debouncing\n- Optimize touch handlers\n- Implement proper gesture handling',
        timestamp: Date.now(),
      });
    }

    // Save snapshot with suggestions
    await this.saveSnapshot(latestMetrics, suggestions);

    return suggestions;
  }

  private async saveSnapshot(metrics: any, suggestions: OptimizationSuggestion[]): Promise<void> {
    try {
      const snapshot: PerformanceSnapshot = {
        timestamp: Date.now(),
        metrics: {
          memoryUsage: metrics.memoryUsage,
          networkLatency: metrics.networkLatency,
          renderTime: metrics.renderTime,
          frameRate: metrics.frameRate,
          interactionDelay: metrics.interactionDelay,
        },
        suggestions,
      };

      // Get existing snapshots
      const existingSnapshots = await this.getSnapshots();
      
      // Add new snapshot and keep only the last MAX_SNAPSHOTS
      const updatedSnapshots = [...existingSnapshots, snapshot]
        .sort((a, b) => b.timestamp - a.timestamp)
        .slice(0, PerformanceOptimizer.MAX_SNAPSHOTS);

      // Save to storage
      await AsyncStorage.setItem(
        PerformanceOptimizer.STORAGE_KEY,
        JSON.stringify(updatedSnapshots)
      );
    } catch (error) {
      console.error('Error saving performance snapshot:', error);
    }
  }

  async getSnapshots(): Promise<PerformanceSnapshot[]> {
    try {
      const data = await AsyncStorage.getItem(PerformanceOptimizer.STORAGE_KEY);
      return data ? JSON.parse(data) : [];
    } catch (error) {
      console.error('Error getting performance snapshots:', error);
      return [];
    }
  }

  async clearSnapshots(): Promise<void> {
    try {
      await AsyncStorage.removeItem(PerformanceOptimizer.STORAGE_KEY);
    } catch (error) {
      console.error('Error clearing performance snapshots:', error);
    }
  }

  async exportSnapshots(): Promise<string> {
    try {
      const snapshots = await this.getSnapshots();
      return JSON.stringify(snapshots, null, 2);
    } catch (error) {
      console.error('Error exporting performance snapshots:', error);
      return '[]';
    }
  }
}

// Export singleton instance
export const performanceOptimizer = PerformanceOptimizer.getInstance(); 