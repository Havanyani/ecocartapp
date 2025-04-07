/**
 * PrefetchManager.ts
 * 
 * Implements predictive content prefetching based on user behavior patterns.
 * This component analyzes usage patterns to predict and prefetch likely
 * future content requests during idle periods.
 */

import AsyncStorage from '@react-native-async-storage/async-storage';
import NetInfo from '@react-native-community/netinfo';
import { RequestPriority, RequestQueue } from './RequestQueue';

/**
 * Configuration for the PrefetchManager
 */
export interface PrefetchConfig {
  // Maximum number of items to prefetch at once
  maxPrefetchItems?: number;
  
  // Only prefetch on WiFi networks
  onlyPrefetchOnWifi?: boolean;
  
  // Only prefetch when device is charging
  onlyPrefetchWhileCharging?: boolean;
  
  // Maximum allowed data usage for prefetching (in bytes)
  maxPrefetchDataUsage?: number;
  
  // Time to wait between prefetch operations (ms)
  prefetchInterval?: number;
  
  // Routes to exclude from prefetching
  excludedRoutes?: string[];
}

/**
 * Default configuration
 */
const DEFAULT_CONFIG: PrefetchConfig = {
  maxPrefetchItems: 5,
  onlyPrefetchOnWifi: true,
  onlyPrefetchWhileCharging: false,
  maxPrefetchDataUsage: 5 * 1024 * 1024, // 5MB
  prefetchInterval: 60000, // 1 minute
  excludedRoutes: ['/auth/', '/payment/']
};

/**
 * User access pattern for a specific route/resource
 */
interface AccessPattern {
  route: string;
  accessCount: number;
  lastAccessed: number;
  averageInterval: number;
  relatedRoutes: Array<{route: string, correlation: number}>;
}

/**
 * Prefetch status for a specific route
 */
interface PrefetchStatus {
  route: string;
  lastPrefetched: number;
  prefetchCount: number;
  hitCount: number;
  missCount: number;
  dataUsage: number;
}

/**
 * PrefetchManager class handles predictive content prefetching
 */
export class PrefetchManager {
  private static instance: PrefetchManager;
  private config: PrefetchConfig;
  private requestQueue: RequestQueue;
  private accessPatterns: Map<string, AccessPattern> = new Map();
  private prefetchStatus: Map<string, PrefetchStatus> = new Map();
  private currentlyPrefetching: Set<string> = new Set();
  private prefetchTimer: ReturnType<typeof setTimeout> | null = null;
  private totalDataUsage: number = 0;
  private isWifi: boolean = false;
  private isCharging: boolean = false;
  
  /**
   * Creates a new PrefetchManager
   */
  private constructor(config: PrefetchConfig = {}) {
    this.config = { ...DEFAULT_CONFIG, ...config };
    this.requestQueue = RequestQueue.getInstance();
    
    // Subscribe to network changes
    NetInfo.addEventListener(this.handleNetworkChange);
    
    // Load previous patterns and status
    this.loadData();
    
    // Start the prefetch timer
    this.schedulePrefetch();
  }
  
  /**
   * Get the PrefetchManager instance (singleton)
   */
  public static getInstance(config?: PrefetchConfig): PrefetchManager {
    if (!PrefetchManager.instance) {
      PrefetchManager.instance = new PrefetchManager(config);
    }
    return PrefetchManager.instance;
  }
  
  /**
   * Load saved data from storage
   */
  private async loadData(): Promise<void> {
    try {
      // Load access patterns
      const patternsString = await AsyncStorage.getItem('prefetch_patterns');
      if (patternsString) {
        const patterns = JSON.parse(patternsString);
        patterns.forEach((pattern: AccessPattern) => {
          this.accessPatterns.set(pattern.route, pattern);
        });
      }
      
      // Load prefetch status
      const statusString = await AsyncStorage.getItem('prefetch_status');
      if (statusString) {
        const status = JSON.parse(statusString);
        status.forEach((item: PrefetchStatus) => {
          this.prefetchStatus.set(item.route, item);
        });
        
        // Calculate total data usage
        this.totalDataUsage = status.reduce(
          (total: number, item: PrefetchStatus) => total + item.dataUsage, 
          0
        );
      }
    } catch (error) {
      console.error('Error loading prefetch data:', error);
    }
  }
  
  /**
   * Save data to storage
   */
  private async saveData(): Promise<void> {
    try {
      // Save access patterns
      const patterns = Array.from(this.accessPatterns.values());
      await AsyncStorage.setItem('prefetch_patterns', JSON.stringify(patterns));
      
      // Save prefetch status
      const status = Array.from(this.prefetchStatus.values());
      await AsyncStorage.setItem('prefetch_status', JSON.stringify(status));
    } catch (error) {
      console.error('Error saving prefetch data:', error);
    }
  }
  
  /**
   * Handle network state changes
   */
  private handleNetworkChange = (state: any) => {
    this.isWifi = state.type === 'wifi';
    
    // If we're now on WiFi and that's a requirement, try prefetching
    if (this.isWifi && this.config.onlyPrefetchOnWifi) {
      this.triggerPrefetch();
    }
  };
  
  /**
   * Record a user's access to a specific route
   */
  public recordAccess(route: string, relatedRoutes: string[] = []): void {
    // Skip recording if route is in excluded list
    if (this.isExcludedRoute(route)) {
      return;
    }
    
    const now = Date.now();
    
    // Get existing pattern or create new one
    const pattern = this.accessPatterns.get(route) || {
      route,
      accessCount: 0,
      lastAccessed: 0,
      averageInterval: 0,
      relatedRoutes: []
    };
    
    // Update access pattern
    if (pattern.lastAccessed > 0) {
      const interval = now - pattern.lastAccessed;
      // Update running average interval
      pattern.averageInterval = 
        (pattern.averageInterval * pattern.accessCount + interval) / 
        (pattern.accessCount + 1);
    }
    
    pattern.accessCount++;
    pattern.lastAccessed = now;
    
    // Update related routes
    relatedRoutes.forEach(related => {
      if (related !== route && !this.isExcludedRoute(related)) {
        // Find if this related route already exists
        const existingRelated = pattern.relatedRoutes.find(r => r.route === related);
        
        if (existingRelated) {
          // Increase correlation strength
          existingRelated.correlation = Math.min(1.0, existingRelated.correlation + 0.1);
        } else {
          // Add new related route
          pattern.relatedRoutes.push({
            route: related,
            correlation: 0.5 // Initial correlation
          });
        }
      }
    });
    
    // Sort related routes by correlation (strongest first)
    pattern.relatedRoutes.sort((a, b) => b.correlation - a.correlation);
    
    // Limit to top related routes only
    if (pattern.relatedRoutes.length > 10) {
      pattern.relatedRoutes = pattern.relatedRoutes.slice(0, 10);
    }
    
    // Save updated pattern
    this.accessPatterns.set(route, pattern);
    
    // Save data periodically
    this.debouncedSave();
    
    // Record hit or miss for prefetched content
    this.recordHitOrMiss(route);
  }
  
  /**
   * Record whether this access was a hit or miss for prefetched content
   */
  private recordHitOrMiss(route: string): void {
    const status = this.prefetchStatus.get(route);
    if (!status) {
      return;
    }
    
    const now = Date.now();
    const timeSincePrefetch = now - status.lastPrefetched;
    
    // Consider it a hit if accessed within 5 minutes of prefetching
    if (timeSincePrefetch < 5 * 60 * 1000) {
      status.hitCount++;
    } else {
      status.missCount++;
    }
    
    this.prefetchStatus.set(route, status);
  }
  
  /**
   * Debounced save to prevent too many storage writes
   */
  private debouncedSaveTimer: ReturnType<typeof setTimeout> | null = null;
  private debouncedSave(): void {
    if (this.debouncedSaveTimer !== null) {
      clearTimeout(this.debouncedSaveTimer);
    }
    
    this.debouncedSaveTimer = setTimeout(() => {
      this.saveData();
      this.debouncedSaveTimer = null;
    }, 5000);
  }
  
  /**
   * Schedule periodic prefetching
   */
  private schedulePrefetch(): void {
    if (this.prefetchTimer !== null) {
      clearTimeout(this.prefetchTimer);
    }
    
    this.prefetchTimer = setTimeout(() => {
      this.triggerPrefetch();
      this.schedulePrefetch(); // Schedule next prefetch
    }, this.config.prefetchInterval);
  }
  
  /**
   * Trigger the prefetch process
   */
  public async triggerPrefetch(): Promise<void> {
    // Check if conditions allow prefetching
    if (!this.canPrefetch()) {
      return;
    }
    
    try {
      // Get candidate routes for prefetching
      const candidates = this.getPrefetchCandidates();
      
      // Prefetch each candidate
      for (const route of candidates) {
        if (this.currentlyPrefetching.has(route)) {
          continue; // Skip if already prefetching
        }
        
        this.prefetchRoute(route);
        
        // Add to currently prefetching set
        this.currentlyPrefetching.add(route);
        
        // Stagger prefetches slightly
        await new Promise(resolve => setTimeout(resolve, 200));
      }
    } catch (error) {
      console.error('Error during prefetch:', error);
    }
  }
  
  /**
   * Check if we can prefetch content now
   */
  private canPrefetch(): boolean {
    // Check network type requirement
    if (this.config.onlyPrefetchOnWifi && !this.isWifi) {
      return false;
    }
    
    // Check charging requirement
    if (this.config.onlyPrefetchWhileCharging && !this.isCharging) {
      return false;
    }
    
    // Check data usage limits
    if (this.totalDataUsage >= (this.config.maxPrefetchDataUsage || Infinity)) {
      return false;
    }
    
    return true;
  }
  
  /**
   * Get candidate routes for prefetching
   */
  private getPrefetchCandidates(): string[] {
    const candidates: Array<{route: string, score: number}> = [];
    const now = Date.now();
    
    // Go through each access pattern
    this.accessPatterns.forEach(pattern => {
      // Skip if accessed too recently
      if (now - pattern.lastAccessed < 10 * 60 * 1000) { // 10 minutes
        return;
      }
      
      // Skip if prefetched too recently
      const status = this.prefetchStatus.get(pattern.route);
      if (status && now - status.lastPrefetched < 30 * 60 * 1000) { // 30 minutes
        return;
      }
      
      // Calculate prefetch score based on access frequency and predictability
      let score = pattern.accessCount;
      
      // Adjust score based on access frequency
      if (pattern.averageInterval > 0) {
        // Higher score for routes accessed more frequently
        score = score * (24 * 60 * 60 * 1000 / pattern.averageInterval);
      }
      
      // Adjust score based on hit rate if available
      if (status && (status.hitCount + status.missCount) > 0) {
        const hitRate = status.hitCount / (status.hitCount + status.missCount);
        score = score * (0.5 + hitRate);
      }
      
      candidates.push({
        route: pattern.route,
        score
      });
      
      // Also add related routes with high correlation
      pattern.relatedRoutes
        .filter(related => related.correlation > 0.7)
        .forEach(related => {
          candidates.push({
            route: related.route,
            score: score * related.correlation
          });
        });
    });
    
    // Sort by score and limit to max prefetch items
    candidates.sort((a, b) => b.score - a.score);
    
    return candidates
      .slice(0, this.config.maxPrefetchItems)
      .map(candidate => candidate.route);
  }
  
  /**
   * Prefetch a specific route
   */
  private async prefetchRoute(route: string): Promise<void> {
    try {
      // Use the request queue with BACKGROUND priority
      const startTime = Date.now();
      const response = await this.requestQueue.get(
        route,
        { headers: { 'X-Prefetch': 'true' } },
        RequestPriority.BACKGROUND
      );
      
      // Calculate data size (approximate based on JSON stringification)
      const dataSize = JSON.stringify(response).length;
      
      // Update prefetch status
      const status = this.prefetchStatus.get(route) || {
        route,
        lastPrefetched: 0,
        prefetchCount: 0,
        hitCount: 0,
        missCount: 0,
        dataUsage: 0
      };
      
      status.lastPrefetched = Date.now();
      status.prefetchCount++;
      status.dataUsage += dataSize;
      this.prefetchStatus.set(route, status);
      
      // Update total data usage
      this.totalDataUsage += dataSize;
      
      // Remove from currently prefetching
      this.currentlyPrefetching.delete(route);
      
      // Save data
      this.debouncedSave();
      
      // Log prefetch success
      console.log(`Prefetched ${route} in ${Date.now() - startTime}ms (${dataSize} bytes)`);
    } catch (error) {
      console.error(`Error prefetching ${route}:`, error);
      // Remove from currently prefetching
      this.currentlyPrefetching.delete(route);
    }
  }
  
  /**
   * Check if a route is in the excluded list
   */
  private isExcludedRoute(route: string): boolean {
    return (this.config.excludedRoutes || []).some(pattern => 
      route.includes(pattern)
    );
  }
  
  /**
   * Update battery charging status
   */
  public updateChargingStatus(isCharging: boolean): void {
    this.isCharging = isCharging;
    
    // If we're now charging and that's a requirement, try prefetching
    if (isCharging && this.config.onlyPrefetchWhileCharging) {
      this.triggerPrefetch();
    }
  }
  
  /**
   * Get prefetch statistics
   */
  public getStats(): Record<string, any> {
    const totalHits = Array.from(this.prefetchStatus.values())
      .reduce((sum, status) => sum + status.hitCount, 0);
      
    const totalMisses = Array.from(this.prefetchStatus.values())
      .reduce((sum, status) => sum + status.missCount, 0);
    
    const hitRate = totalHits + totalMisses > 0 
      ? totalHits / (totalHits + totalMisses) 
      : 0;
    
    return {
      patternCount: this.accessPatterns.size,
      prefetchedRoutes: this.prefetchStatus.size,
      totalPrefetchCount: Array.from(this.prefetchStatus.values())
        .reduce((sum, status) => sum + status.prefetchCount, 0),
      hitRate: hitRate,
      dataUsageMB: this.totalDataUsage / (1024 * 1024),
      currentlyPrefetching: Array.from(this.currentlyPrefetching)
    };
  }
  
  /**
   * Reset all prefetch data
   */
  public async resetData(): Promise<void> {
    this.accessPatterns.clear();
    this.prefetchStatus.clear();
    this.currentlyPrefetching.clear();
    this.totalDataUsage = 0;
    
    try {
      await AsyncStorage.removeItem('prefetch_patterns');
      await AsyncStorage.removeItem('prefetch_status');
    } catch (error) {
      console.error('Error clearing prefetch data:', error);
    }
  }
} 