import { StorageMonitorInstance } from '../utils/StorageMonitor';
import { Storage } from './StorageService';

/**
 * Enhanced storage service that adds monitoring capabilities to the base StorageService
 * This is a proxy wrapper around the existing Storage singleton
 */
export class EnhancedStorageService {
  private static instance: EnhancedStorageService;
  
  private constructor() {
    // Private constructor for singleton pattern
  }
  
  public static getInstance(): EnhancedStorageService {
    if (!EnhancedStorageService.instance) {
      EnhancedStorageService.instance = new EnhancedStorageService();
    }
    return EnhancedStorageService.instance;
  }
  
  // --- MMKV Operations with Monitoring ---
  
  /**
   * Store a string value with monitoring
   */
  public setString(key: string, value: string): void {
    StorageMonitorInstance.trackMMKVWrite(key, value, () => {
      Storage.setString(key, value);
    });
  }
  
  /**
   * Get a string value with monitoring
   */
  public getString(key: string): Promise<string | undefined> {
    return StorageMonitorInstance.trackMMKVRead(key, () => {
      return Storage.getString(key);
    });
  }
  
  /**
   * Store a boolean value with monitoring
   */
  public setBoolean(key: string, value: boolean): void {
    StorageMonitorInstance.trackMMKVWrite(key, value, () => {
      Storage.setBoolean(key, value);
    });
  }
  
  /**
   * Get a boolean value with monitoring
   */
  public getBoolean(key: string): Promise<boolean | undefined> {
    return StorageMonitorInstance.trackMMKVRead(key, () => {
      return Storage.getBoolean(key);
    });
  }
  
  /**
   * Store a number value with monitoring
   */
  public setNumber(key: string, value: number): void {
    StorageMonitorInstance.trackMMKVWrite(key, value, () => {
      Storage.setNumber(key, value);
    });
  }
  
  /**
   * Get a number value with monitoring
   */
  public getNumber(key: string): Promise<number | undefined> {
    return StorageMonitorInstance.trackMMKVRead(key, () => {
      return Storage.getNumber(key);
    });
  }
  
  /**
   * Store an object value with monitoring
   */
  public setObject<T>(key: string, value: T): void {
    StorageMonitorInstance.trackMMKVWrite(key, value, () => {
      Storage.setObject(key, value);
    });
  }
  
  /**
   * Get an object value with monitoring
   */
  public getObject<T>(key: string): Promise<T | null> {
    return StorageMonitorInstance.trackMMKVRead(key, () => {
      return Storage.getObject<T>(key);
    });
  }
  
  /**
   * Delete a key with monitoring
   */
  public delete(key: string): void {
    StorageMonitorInstance.trackMMKVDelete(key, () => {
      Storage.delete(key);
    });
  }
  
  /**
   * Clear all data in MMKV storage with monitoring
   */
  /* cSpell:ignore MMKV */
  public clearMMKV(): void {
    StorageMonitorInstance.trackMMKVDelete('all', () => {
      // Not ideal but works as a temporary fix
      (Storage as any).clearMMKV();
    });
  }
  
  // --- SQLite Operations with Monitoring ---
  
  /**
   * Initialize SQLite database with monitoring
   */
  public async initSQLite(): Promise<void> {
    return StorageMonitorInstance.trackSQLiteWrite('system', { operation: 'init' }, async () => {
      return Storage.initSQLite();
    });
  }
  
  /**
   * Add a recycling entry with monitoring
   */
  public async addRecyclingEntry(entry: {
    id: string;
    materialId: string;
    weight: number;
    date: string;
    status: string;
    userId: string;
    credits?: number;
    plasticSaved?: number;
    co2Reduced?: number;
    treesEquivalent?: number;
  }): Promise<void> {
    return StorageMonitorInstance.trackSQLiteWrite('recycling_entries', entry, async () => {
      return Storage.addRecyclingEntry(entry);
    });
  }
  
  /**
   * Get recycling entries by user with monitoring
   */
  public async getRecyclingEntriesByUser(
    userId: string, 
    limit: number = 50, 
    offset: number = 0
  ): Promise<any[]> {
    return StorageMonitorInstance.trackSQLiteRead('recycling_entries', async () => {
      return Storage.getRecyclingEntriesByUser(userId, limit, offset);
    });
  }
  
  /**
   * Get user recycling stats with monitoring
   */
  public async getUserRecyclingStats(userId: string): Promise<{
    totalWeight: number;
    totalEntries: number;
    totalCredits: number;
    co2Reduced: number;
    plasticSaved: number;
    treesEquivalent: number;
  }> {
    return StorageMonitorInstance.trackSQLiteRead('recycling_entries', async () => {
      return Storage.getUserRecyclingStats(userId);
    });
  }
  
  /**
   * Add a material with monitoring
   */
  public async addMaterial(material: {
    id: string;
    name: string;
    category: string;
    pointsPerKg: number;
    description?: string;
    imageUrl?: string;
    recyclingTips?: string;
  }): Promise<void> {
    return StorageMonitorInstance.trackSQLiteWrite('materials', material, async () => {
      return Storage.addMaterial(material);
    });
  }
  
  /**
   * Get all materials with monitoring
   */
  public async getAllMaterials(): Promise<any[]> {
    return StorageMonitorInstance.trackSQLiteRead('materials', async () => {
      return Storage.getAllMaterials();
    });
  }
  
  /**
   * Close database connection with monitoring
   */
  public async close(): Promise<void> {
    return StorageMonitorInstance.trackSQLiteWrite('system', { operation: 'close' }, async () => {
      return Storage.close();
    });
  }
  
  // --- Hybrid Operations ---
  
  /**
   * Save user profile with monitoring
   */
  public saveUserProfile(profile: {
    id: string;
    name: string;
    email: string;
    preferences: Record<string, any>;
  }): void {
    // Store user basic info
    this.setObject('user_profile', {
      id: profile.id,
      name: profile.name,
      email: profile.email
    });
    
    // Store user preferences separately
    this.setObject('user_preferences', profile.preferences);
  }
  
  /**
   * Get user profile with monitoring
   */
  public async getUserProfile(): Promise<{
    id: string;
    name: string;
    email: string;
    preferences: Record<string, any>;
  } | null> {
    // Get basic user info
    const basicInfo = await this.getObject<{
      id: string;
      name: string;
      email: string;
    }>('user_profile');
    
    if (!basicInfo) {
      return null;
    }
    
    // Get preferences
    const preferences = await this.getObject<Record<string, any>>('user_preferences');
    
    return {
      ...basicInfo,
      preferences: preferences || {}
    };
  }
  
  /**
   * Cache materials list with timestamp for efficient access
   */
  public async cacheMaterialsList(): Promise<void> {
    const materials = await Storage.getAllMaterials();
    const timestamp = Date.now();
    
    await this.setObject('cached_materials', materials);
    await this.setNumber('materials_cache_timestamp', timestamp);
  }
  
  /**
   * Get materials with cache support
   */
  public async getMaterials(maxCacheAge: number = 3600000): Promise<any[]> {
    const now = Date.now();
    const cacheTimestamp = await this.getNumber('materials_cache_timestamp') || 0;
    
    // Check if cache is valid
    if (now - cacheTimestamp < maxCacheAge) {
      const cachedMaterials = await this.getObject<any[]>('cached_materials');
      if (cachedMaterials && cachedMaterials.length > 0) {
        return cachedMaterials;
      }
    }
    
    // Cache expired or empty, fetch fresh data
    await this.cacheMaterialsList();
    const materials = await this.getObject<any[]>('cached_materials');
    return materials || [];
  }
}

// Export singleton instance
export const EnhancedStorage = EnhancedStorageService.getInstance(); 