import AsyncStorage from '@react-native-async-storage/async-storage';
import Constants from 'expo-constants';
import { Platform } from 'react-native';
import { MMKV } from 'react-native-mmkv';
import SQLite from 'react-native-sqlite-storage';

// Enable SQLite promises
SQLite.enablePromise(true);

// Check if running in Expo Go
const isExpoGo = Constants.appOwnership === 'expo';

/**
 * StorageService - A hybrid storage solution using MMKV for simple data
 * and SQLite for complex relational data in the EcoCart app.
 * 
 * Falls back to AsyncStorage when running in Expo Go or web platforms
 * where MMKV is not supported.
 */
export class StorageService {
  private static instance: StorageService;
  
  // MMKV instance for fast key-value storage
  private mmkv: MMKV | null = null;
  
  // Flag to indicate if we're using MMKV or AsyncStorage fallback
  private usingMMKV: boolean = false;
  
  // SQLite database for structured data
  private sqlite: SQLite.SQLiteDatabase | null = null;
  
  // Database path
  private readonly DB_NAME = 'ecocart.db';
  
  // Flag to track if SQLite DB has been initialized
  private sqliteInitialized = false;

  /**
   * Private constructor for singleton pattern
   */
  private constructor() {
    // Determine if we can use MMKV
    const canUseMMKV = !isExpoGo && !(Platform.OS === 'web');
    
    if (canUseMMKV) {
      try {
        // Initialize MMKV with an ID
        // Don't include encryptionKey on web platforms where it's not supported
        const mmkvConfig = {
          id: 'ecocart-storage',
          ...(Platform.OS !== 'web' && { 
            encryptionKey: 'ecocart-encryption-key' // For sensitive data, only on native
          })
        };
        
        this.mmkv = new MMKV(mmkvConfig);
        this.usingMMKV = true;
        console.log('StorageService initialized with MMKV');
      } catch (error) {
        console.warn('Failed to initialize MMKV, falling back to AsyncStorage:', error);
        this.usingMMKV = false;
      }
    } else {
      console.log('StorageService initialized with AsyncStorage (MMKV not available in this environment)');
      this.usingMMKV = false;
    }
    
    // SQLite will be initialized on demand
  }

  /**
   * Get the singleton instance
   */
  public static getInstance(): StorageService {
    if (!StorageService.instance) {
      StorageService.instance = new StorageService();
    }
    return StorageService.instance;
  }

  /**
   * Initialize SQLite database
   */
  public async initSQLite(): Promise<void> {
    if (this.sqliteInitialized) return;
    
    try {
      // Open/create the database
      this.sqlite = await SQLite.openDatabase({
        name: this.DB_NAME,
        location: 'default'
      });
      
      // Create necessary tables
      await this.createTables();
      
      this.sqliteInitialized = true;
      console.log('SQLite database initialized successfully');
    } catch (error) {
      console.error('Error initializing SQLite database:', error);
      throw error;
    }
  }
  
  /**
   * Create database tables
   */
  private async createTables(): Promise<void> {
    if (!this.sqlite) throw new Error('SQLite not initialized');
    
    try {
      // Create recycling entries table
      await this.sqlite.executeSql(`
        CREATE TABLE IF NOT EXISTS recycling_entries (
          id TEXT PRIMARY KEY,
          material_id TEXT NOT NULL,
          weight REAL NOT NULL,
          date TEXT NOT NULL,
          status TEXT NOT NULL,
          user_id TEXT NOT NULL,
          credits INTEGER NOT NULL DEFAULT 0,
          plastic_saved REAL,
          co2_reduced REAL,
          trees_equivalent REAL,
          sync_status TEXT DEFAULT 'pending'
        )
      `);
      
      // Create materials table
      await this.sqlite.executeSql(`
        CREATE TABLE IF NOT EXISTS materials (
          id TEXT PRIMARY KEY,
          name TEXT NOT NULL,
          category TEXT NOT NULL,
          points_per_kg INTEGER NOT NULL,
          description TEXT,
          image_url TEXT,
          recycling_tips TEXT
        )
      `);
      
      console.log('Database tables created/verified');
    } catch (error) {
      console.error('Error creating tables:', error);
      throw error;
    }
  }

  // --- STORAGE OPERATIONS ---
  
  /**
   * Store a string value
   */
  public async setString(key: string, value: string): Promise<void> {
    if (this.usingMMKV && this.mmkv) {
      this.mmkv.set(key, value);
    } else {
      await AsyncStorage.setItem(key, value);
    }
  }
  
  /**
   * Get a string value
   */
  public async getString(key: string): Promise<string | undefined> {
    if (this.usingMMKV && this.mmkv) {
      return this.mmkv.getString(key);
    } else {
      const value = await AsyncStorage.getItem(key);
      return value || undefined;
    }
  }
  
  /**
   * Store a boolean value
   */
  public async setBoolean(key: string, value: boolean): Promise<void> {
    if (this.usingMMKV && this.mmkv) {
      this.mmkv.set(key, value);
    } else {
      await AsyncStorage.setItem(key, value ? 'true' : 'false');
    }
  }
  
  /**
   * Get a boolean value
   */
  public async getBoolean(key: string): Promise<boolean | undefined> {
    if (this.usingMMKV && this.mmkv) {
      return this.mmkv.getBoolean(key);
    } else {
      const value = await AsyncStorage.getItem(key);
      if (value === null) return undefined;
      return value === 'true';
    }
  }
  
  /**
   * Store a number value
   */
  public async setNumber(key: string, value: number): Promise<void> {
    if (this.usingMMKV && this.mmkv) {
      this.mmkv.set(key, value);
    } else {
      await AsyncStorage.setItem(key, value.toString());
    }
  }
  
  /**
   * Get a number value
   */
  public async getNumber(key: string): Promise<number | undefined> {
    if (this.usingMMKV && this.mmkv) {
      return this.mmkv.getNumber(key);
    } else {
      const value = await AsyncStorage.getItem(key);
      if (value === null) return undefined;
      const num = Number(value);
      return isNaN(num) ? undefined : num;
    }
  }
  
  /**
   * Store an object value (serialized as JSON)
   */
  public async setObject<T>(key: string, value: T): Promise<void> {
    const jsonValue = JSON.stringify(value);
    if (this.usingMMKV && this.mmkv) {
      this.mmkv.set(key, jsonValue);
    } else {
      await AsyncStorage.setItem(key, jsonValue);
    }
  }
  
  /**
   * Get an object value (parsed from JSON)
   */
  public async getObject<T>(key: string): Promise<T | null> {
    let json;
    if (this.usingMMKV && this.mmkv) {
      json = this.mmkv.getString(key);
    } else {
      json = await AsyncStorage.getItem(key);
    }
    
    if (!json) return null;
    
    try {
      return JSON.parse(json) as T;
    } catch (error) {
      console.error(`Error parsing JSON for key ${key}:`, error);
      return null;
    }
  }
  
  /**
   * Delete a key
   */
  public async delete(key: string): Promise<void> {
    if (this.usingMMKV && this.mmkv) {
      this.mmkv.delete(key);
    } else {
      await AsyncStorage.removeItem(key);
    }
  }
  
  /**
   * Clear all data in storage
   */
  public async clearStorage(): Promise<void> {
    if (this.usingMMKV && this.mmkv) {
      this.mmkv.clearAll();
    } else {
      await AsyncStorage.clear();
    }
  }

  // --- SQLITE OPERATIONS ---
  
  /**
   * Add a recycling entry
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
    if (!this.sqlite) await this.initSQLite();
    
    try {
      await this.sqlite!.executeSql(
        `INSERT INTO recycling_entries (
          id, material_id, weight, date, status, user_id, 
          credits, plastic_saved, co2_reduced, trees_equivalent
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
        [
          entry.id,
          entry.materialId,
          entry.weight,
          entry.date,
          entry.status,
          entry.userId,
          entry.credits || 0,
          entry.plasticSaved || 0,
          entry.co2Reduced || 0,
          entry.treesEquivalent || 0
        ]
      );
    } catch (error) {
      console.error('Error adding recycling entry:', error);
      throw error;
    }
  }
  
  /**
   * Get recycling entries by user
   */
  public async getRecyclingEntriesByUser(
    userId: string, 
    limit: number = 50, 
    offset: number = 0
  ): Promise<any[]> {
    if (!this.sqlite) await this.initSQLite();
    
    try {
      const [results] = await this.sqlite!.executeSql(
        `SELECT r.*, m.name as material_name, m.category as material_category
         FROM recycling_entries r
         LEFT JOIN materials m ON r.material_id = m.id
         WHERE r.user_id = ?
         ORDER BY datetime(r.date) DESC
         LIMIT ? OFFSET ?`,
        [userId, limit, offset]
      );
      
      const entries: any[] = [];
      for (let i = 0; i < results.rows.length; i++) {
        entries.push(results.rows.item(i));
      }
      
      return entries;
    } catch (error) {
      console.error('Error getting recycling entries:', error);
      throw error;
    }
  }
  
  /**
   * Get recycling stats for a user
   */
  public async getUserRecyclingStats(userId: string): Promise<{
    totalWeight: number;
    totalEntries: number;
    totalCredits: number;
    co2Reduced: number;
    plasticSaved: number;
    treesEquivalent: number;
  }> {
    if (!this.sqlite) await this.initSQLite();
    
    try {
      const [results] = await this.sqlite!.executeSql(
        `SELECT 
          SUM(weight) as totalWeight,
          COUNT(*) as totalEntries,
          SUM(credits) as totalCredits,
          SUM(co2_reduced) as co2Reduced,
          SUM(plastic_saved) as plasticSaved,
          SUM(trees_equivalent) as treesEquivalent
         FROM recycling_entries
         WHERE user_id = ? AND status = 'completed'`,
        [userId]
      );
      
      if (results.rows.length > 0) {
        const stats = results.rows.item(0);
        return {
          totalWeight: stats.totalWeight || 0,
          totalEntries: stats.totalEntries || 0,
          totalCredits: stats.totalCredits || 0,
          co2Reduced: stats.co2Reduced || 0,
          plasticSaved: stats.plasticSaved || 0,
          treesEquivalent: stats.treesEquivalent || 0
        };
      }
      
      return {
        totalWeight: 0,
        totalEntries: 0,
        totalCredits: 0,
        co2Reduced: 0,
        plasticSaved: 0,
        treesEquivalent: 0
      };
    } catch (error) {
      console.error('Error getting user recycling stats:', error);
      throw error;
    }
  }
  
  /**
   * Add a material
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
    if (!this.sqlite) await this.initSQLite();
    
    try {
      await this.sqlite!.executeSql(
        `INSERT INTO materials (
          id, name, category, points_per_kg, description, image_url, recycling_tips
        ) VALUES (?, ?, ?, ?, ?, ?, ?)`,
        [
          material.id,
          material.name,
          material.category,
          material.pointsPerKg,
          material.description || null,
          material.imageUrl || null,
          material.recyclingTips || null
        ]
      );
    } catch (error) {
      console.error('Error adding material:', error);
      throw error;
    }
  }
  
  /**
   * Get all materials
   */
  public async getAllMaterials(): Promise<any[]> {
    if (!this.sqlite) await this.initSQLite();
    
    try {
      const [results] = await this.sqlite!.executeSql(
        'SELECT * FROM materials ORDER BY category, name',
        []
      );
      
      const materials: any[] = [];
      for (let i = 0; i < results.rows.length; i++) {
        materials.push(results.rows.item(i));
      }
      
      return materials;
    } catch (error) {
      console.error('Error getting materials:', error);
      throw error;
    }
  }
  
  /**
   * Close the database connection
   */
  public async close(): Promise<void> {
    if (this.sqlite) {
      await this.sqlite.close();
      this.sqlite = null;
      this.sqliteInitialized = false;
    }
  }
  
  // --- HYBRID OPERATIONS (Examples of hybrid usage) ---
  
  /**
   * Save user profile information and preferences
   */
  public async saveUserProfile(profile: {
    id: string;
    name: string;
    email: string;
    preferences: Record<string, any>;
  }): Promise<void> {
    // Store the user profile in key-value storage
    await this.setObject('user_profile', {
      id: profile.id,
      name: profile.name,
      email: profile.email,
    });
    
    // Store user preferences separately
    await this.setObject('user_preferences', profile.preferences);
  }
  
  /**
   * Get saved user profile
   */
  public async getUserProfile(): Promise<{
    id: string;
    name: string;
    email: string;
    preferences: Record<string, any>;
  } | null> {
    // Get basic profile
    const profile = await this.getObject<{
      id: string;
      name: string;
      email: string;
    }>('user_profile');
    
    if (!profile) return null;
    
    // Get preferences
    const preferences = await this.getObject<Record<string, any>>('user_preferences');
    
    // Return combined profile with preferences
    return {
      ...profile,
      preferences: preferences || {},
    };
  }
  
  /**
   * Cache materials list in key-value storage
   */
  public async cacheMaterialsList(): Promise<void> {
    try {
      const materials = await this.getAllMaterials();
      if (materials && materials.length > 0) {
        await this.setObject('cached_materials', {
          timestamp: Date.now(),
          data: materials,
        });
      }
    } catch (error) {
      console.error('Error caching materials list:', error);
    }
  }
  
  /**
   * Get materials from cache if fresh, otherwise from database
   * @param maxCacheAge Maximum cache age in milliseconds
   */
  public async getMaterials(maxCacheAge: number = 3600000): Promise<any[]> {
    try {
      // Try to get from cache first
      const cachedData = await this.getObject<{
        timestamp: number;
        data: any[];
      }>('cached_materials');
      
      // Check if cache is valid
      if (
        cachedData && 
        cachedData.timestamp && 
        Date.now() - cachedData.timestamp < maxCacheAge &&
        cachedData.data && 
        cachedData.data.length > 0
      ) {
        return cachedData.data;
      }
      
      // Cache is stale or doesn't exist, get from database
      const materials = await this.getAllMaterials();
      
      // Update cache for next time
      if (materials.length > 0) {
        await this.setObject('cached_materials', {
          timestamp: Date.now(),
          data: materials,
        });
      }
      
      return materials;
    } catch (error) {
      console.error('Error getting materials:', error);
      return [];
    }
  }

  // Sync methods for backward compatibility
  public setStringSync(key: string, value: string): void {
    if (this.usingMMKV && this.mmkv) {
      this.mmkv.set(key, value);
    } else {
      // This is not ideal but needed for backward compatibility
      this.setString(key, value).catch(err => console.error(err));
    }
  }
  
  public getBooleanSync(key: string): boolean | undefined {
    if (this.usingMMKV && this.mmkv) {
      return this.mmkv.getBoolean(key);
    }
    // Return undefined for AsyncStorage case, as we can't do sync get
    return undefined;
  }
  
  // Add similar sync methods for other types as needed
}

// Export singleton instance
export const Storage = StorageService.getInstance(); 