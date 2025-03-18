import AsyncStorage from '@react-native-async-storage/async-storage';
import { v4 as uuidv4 } from 'uuid';
import { Storage } from './StorageService';

/**
 * Service to handle migration from AsyncStorage to the hybrid MMKV+SQLite solution
 */
export class MigrationService {
  private static instance: MigrationService;
  
  // Flag to track migration status
  private migrationComplete = false;
  
  // Migration mapping - defines where each AsyncStorage key should go
  private migrationMap: Record<string, {
    destination: 'mmkv' | 'sqlite' | 'both';
    table?: string;
    newKey?: string;
  }> = {
    // User data (to MMKV)
    'user:profile': { destination: 'mmkv', newKey: 'user_profile' },
    'user:preferences': { destination: 'mmkv', newKey: 'user_preferences' },
    'user:settings': { destination: 'mmkv', newKey: 'user_settings' },
    'user:theme': { destination: 'mmkv', newKey: 'app_theme' },
    'user:notifications': { destination: 'mmkv', newKey: 'notifications_enabled' },
    
    // App data (to MMKV)
    'app:lastVisit': { destination: 'mmkv', newKey: 'last_visit_timestamp' },
    'app:onboardingComplete': { destination: 'mmkv', newKey: 'onboarding_complete' },
    'app:lastVersion': { destination: 'mmkv', newKey: 'last_app_version' },
    
    // Recycling data (to SQLite)
    'recycling:history': { destination: 'sqlite', table: 'recycling_entries' },
    'recycling:materials': { destination: 'sqlite', table: 'materials' },
    
    // Sync data (to both)
    'sync:pendingActions': { destination: 'mmkv', newKey: 'ecocart:pendingActions' },
    'sync:stats': { destination: 'mmkv', newKey: 'ecocart:syncStats' },
    'sync:lastTimestamp': { destination: 'mmkv', newKey: 'ecocart:lastSyncTimestamp' },
  };
  
  private constructor() {
    // Private constructor for singleton pattern
  }
  
  public static getInstance(): MigrationService {
    if (!MigrationService.instance) {
      MigrationService.instance = new MigrationService();
    }
    return MigrationService.instance;
  }
  
  /**
   * Check if migration has been completed
   */
  public async isMigrationNeeded(): Promise<boolean> {
    try {
      // Check if we've already migrated
      const migrationStatus = Storage.getBoolean('migration_completed');
      if (migrationStatus === true) {
        this.migrationComplete = true;
        return false;
      }
      
      // Check if there's anything to migrate
      const asyncStorageKeys = await AsyncStorage.getAllKeys();
      return asyncStorageKeys.length > 0;
    } catch (error) {
      console.error('Error checking migration status:', error);
      return false;
    }
  }
  
  /**
   * Perform the migration from AsyncStorage to MMKV and SQLite
   */
  public async migrateData(): Promise<{
    success: boolean;
    migratedKeys: number;
    errors: string[];
  }> {
    try {
      if (this.migrationComplete) {
        return { success: true, migratedKeys: 0, errors: [] };
      }
      
      // Initialize SQLite
      await Storage.initSQLite();
      
      // Get all keys from AsyncStorage
      const asyncStorageKeys = await AsyncStorage.getAllKeys();
      let migratedCount = 0;
      const errors: string[] = [];
      
      console.log(`Starting migration of ${asyncStorageKeys.length} keys from AsyncStorage`);
      
      // Process each key
      for (const key of asyncStorageKeys) {
        try {
          await this.migrateKey(key);
          migratedCount++;
        } catch (error) {
          console.error(`Error migrating key ${key}:`, error);
          errors.push(`Failed to migrate ${key}: ${error}`);
        }
      }
      
      // Mark migration as complete
      Storage.setBoolean('migration_completed', true);
      Storage.setNumber('migration_timestamp', Date.now());
      this.migrationComplete = true;
      
      console.log(`Migration completed. Migrated ${migratedCount} of ${asyncStorageKeys.length} keys.`);
      
      return {
        success: errors.length === 0,
        migratedKeys: migratedCount,
        errors,
      };
    } catch (error) {
      console.error('Error in migration process:', error);
      return {
        success: false,
        migratedKeys: 0,
        errors: ['Migration failed: ' + (error?.toString() || 'Unknown error')],
      };
    }
  }
  
  /**
   * Migrate a single key from AsyncStorage
   */
  private async migrateKey(key: string): Promise<void> {
    // Get value from AsyncStorage
    const value = await AsyncStorage.getItem(key);
    if (value === null) return;
    
    // Check if we have mapping for this key
    const mapping = this.migrationMap[key];
    
    if (mapping) {
      // Migrate according to mapping
      switch (mapping.destination) {
        case 'mmkv':
          await this.migrateToMMKV(mapping.newKey || key, value);
          break;
        case 'sqlite':
          await this.migrateToSQLite(mapping.table!, value);
          break;
        case 'both':
          await this.migrateToMMKV(mapping.newKey || key, value);
          await this.migrateToSQLite(mapping.table!, value);
          break;
      }
    } else {
      // Default migration strategy for unmapped keys
      if (key.includes('recycling') || key.includes('material')) {
        // Likely complex data - try SQLite
        await this.migrateToSQLite('misc_data', value, key);
      } else {
        // Simple data - use MMKV
        await this.migrateToMMKV(key, value);
      }
    }
    
    // Delete from AsyncStorage after successful migration
    await AsyncStorage.removeItem(key);
  }
  
  /**
   * Migrate a value to MMKV
   */
  private async migrateToMMKV(key: string, value: string): Promise<void> {
    try {
      // Try to parse as JSON
      const jsonValue = JSON.parse(value);
      Storage.setObject(key, jsonValue);
    } catch (error) {
      // Not JSON, store as string
      Storage.setString(key, value);
    }
  }
  
  /**
   * Migrate a value to SQLite
   */
  private async migrateToSQLite(table: string, value: string, originalKey?: string): Promise<void> {
    try {
      // Parse the JSON value
      const jsonValue = JSON.parse(value);
      
      switch (table) {
        case 'recycling_entries':
          await this.migrateRecyclingEntries(jsonValue);
          break;
        case 'materials':
          await this.migrateMaterials(jsonValue);
          break;
        case 'misc_data':
          // For data we don't have a specific migration strategy for
          // We'll store it both in SQLite (for data integrity) and MMKV (for access)
          Storage.setObject(originalKey || 'legacy_data', jsonValue);
          break;
        default:
          console.warn(`No specific migration strategy for table: ${table}, storing in MMKV`);
          Storage.setObject(originalKey || `legacy_${table}`, jsonValue);
      }
    } catch (error) {
      console.error(`Error migrating to SQLite (table: ${table}):`, error);
      throw error;
    }
  }
  
  /**
   * Migrate recycling entries from legacy format to new SQLite schema
   */
  private async migrateRecyclingEntries(data: any): Promise<void> {
    // Check if data is an array
    const entries = Array.isArray(data) ? data : [data];
    
    for (const entry of entries) {
      const id = entry.id || uuidv4();
      
      // Map legacy properties to new schema
      await Storage.addRecyclingEntry({
        id,
        materialId: entry.materialId || entry.material_id || 'unknown',
        weight: parseFloat(entry.weight) || 0,
        date: entry.date || entry.timestamp || new Date().toISOString(),
        status: entry.status || 'completed',
        userId: entry.userId || entry.user_id || 'legacy',
        credits: parseInt(entry.credits) || 0,
        plasticSaved: parseFloat(entry.plastic_saved) || 0,
        co2Reduced: parseFloat(entry.co2_reduced) || 0,
        treesEquivalent: parseFloat(entry.trees_equivalent) || 0,
      });
    }
  }
  
  /**
   * Migrate materials from legacy format to new SQLite schema
   */
  private async migrateMaterials(data: any): Promise<void> {
    // Check if data is an array
    const materials = Array.isArray(data) ? data : [data];
    
    for (const material of materials) {
      const id = material.id || uuidv4();
      
      // Map legacy properties to new schema
      await Storage.addMaterial({
        id,
        name: material.name || 'Unknown Material',
        category: material.category || 'Other',
        pointsPerKg: parseInt(material.points_per_kg || material.pointsPerKg) || 1,
        description: material.description || '',
        imageUrl: material.image_url || material.imageUrl || '',
        recyclingTips: material.recycling_tips || material.recyclingTips || '',
      });
    }
  }
  
  /**
   * Clean up any temporary migration data
   */
  public cleanup(): void {
    // Any cleanup needed after migration
  }
}

// Export singleton instance
export const Migration = MigrationService.getInstance(); 