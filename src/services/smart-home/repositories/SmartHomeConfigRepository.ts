/**
 * SmartHomeConfigRepository.ts
 * 
 * Repository for storing and retrieving smart home configuration.
 * Uses AsyncStorage for persistent storage and provides methods for 
 * working with the configuration data.
 */

import AsyncStorage from '@react-native-async-storage/async-storage';
import { SmartHomeConfig, VoicePlatform } from '../SmartHomeService';

/**
 * Repository for managing smart home configuration
 */
export class SmartHomeConfigRepository {
  private static CONFIG_STORAGE_KEY = 'ecocart_smart_home_config';
  private config: SmartHomeConfig | null = null;
  private isInitialized: boolean = false;
  
  /**
   * Initialize the repository
   */
  public async initialize(): Promise<boolean> {
    if (this.isInitialized) {
      return true;
    }
    
    try {
      // Load configuration from storage
      await this.loadConfig();
      this.isInitialized = true;
      return true;
    } catch (error) {
      console.error('[SmartHomeConfigRepository] Initialization error:', error);
      return false;
    }
  }
  
  /**
   * Get configuration
   */
  public async getConfig(): Promise<SmartHomeConfig | null> {
    if (!this.isInitialized) {
      await this.initialize();
    }
    
    return this.config ? { ...this.config } : null;
  }
  
  /**
   * Save configuration
   */
  public async saveConfig(config: SmartHomeConfig): Promise<boolean> {
    if (!this.isInitialized) {
      await this.initialize();
    }
    
    try {
      this.config = {
        ...config,
        lastUpdated: Date.now()
      };
      
      await this.persistConfig();
      return true;
    } catch (error) {
      console.error('[SmartHomeConfigRepository] Save config error:', error);
      return false;
    }
  }
  
  /**
   * Initialize empty configuration for a user
   */
  public async initializeConfigForUser(userId: string): Promise<SmartHomeConfig> {
    const newConfig: SmartHomeConfig = {
      userId,
      linkedPlatforms: [],
      deviceSettings: {},
      automationRules: [],
      notificationPreferences: [
        {
          type: 'device_connection',
          isEnabled: true,
          deliveryMethod: ['push']
        },
        {
          type: 'fill_level_alert',
          isEnabled: true,
          deliveryMethod: ['push']
        },
        {
          type: 'energy_usage_alert',
          isEnabled: true,
          deliveryMethod: ['push', 'email']
        }
      ],
      lastUpdated: Date.now()
    };
    
    await this.saveConfig(newConfig);
    return newConfig;
  }
  
  /**
   * Get platform link status
   */
  public async getPlatformLink(platform: VoicePlatform): Promise<boolean> {
    if (!this.isInitialized) {
      await this.initialize();
    }
    
    if (!this.config) {
      return false;
    }
    
    const platformLink = this.config.linkedPlatforms.find(link => link.platform === platform);
    return platformLink ? platformLink.isLinked : false;
  }
  
  /**
   * Update device settings
   */
  public async updateDeviceSettings(deviceId: string, settings: any): Promise<boolean> {
    if (!this.isInitialized) {
      await this.initialize();
    }
    
    if (!this.config) {
      return false;
    }
    
    try {
      const currentSettings = this.config.deviceSettings[deviceId] || {};
      
      this.config.deviceSettings[deviceId] = {
        ...currentSettings,
        ...settings,
        id: deviceId
      };
      
      this.config.lastUpdated = Date.now();
      await this.persistConfig();
      return true;
    } catch (error) {
      console.error('[SmartHomeConfigRepository] Update device settings error:', error);
      return false;
    }
  }
  
  /**
   * Get device settings
   */
  public async getDeviceSettings(deviceId: string): Promise<any | null> {
    if (!this.isInitialized) {
      await this.initialize();
    }
    
    if (!this.config) {
      return null;
    }
    
    return this.config.deviceSettings[deviceId] || null;
  }
  
  /**
   * Add automation rule
   */
  public async addAutomationRule(rule: any): Promise<boolean> {
    if (!this.isInitialized) {
      await this.initialize();
    }
    
    if (!this.config) {
      return false;
    }
    
    try {
      // Add or update rule
      const existingRuleIndex = this.config.automationRules.findIndex(r => r.id === rule.id);
      
      if (existingRuleIndex >= 0) {
        this.config.automationRules[existingRuleIndex] = rule;
      } else {
        this.config.automationRules.push(rule);
      }
      
      this.config.lastUpdated = Date.now();
      await this.persistConfig();
      return true;
    } catch (error) {
      console.error('[SmartHomeConfigRepository] Add automation rule error:', error);
      return false;
    }
  }
  
  /**
   * Delete automation rule
   */
  public async deleteAutomationRule(ruleId: string): Promise<boolean> {
    if (!this.isInitialized) {
      await this.initialize();
    }
    
    if (!this.config) {
      return false;
    }
    
    try {
      const initialLength = this.config.automationRules.length;
      this.config.automationRules = this.config.automationRules.filter(rule => rule.id !== ruleId);
      
      if (this.config.automationRules.length === initialLength) {
        return false; // Rule not found
      }
      
      this.config.lastUpdated = Date.now();
      await this.persistConfig();
      return true;
    } catch (error) {
      console.error('[SmartHomeConfigRepository] Delete automation rule error:', error);
      return false;
    }
  }
  
  /**
   * Update notification preferences
   */
  public async updateNotificationPreferences(preferences: any[]): Promise<boolean> {
    if (!this.isInitialized) {
      await this.initialize();
    }
    
    if (!this.config) {
      return false;
    }
    
    try {
      this.config.notificationPreferences = preferences;
      this.config.lastUpdated = Date.now();
      await this.persistConfig();
      return true;
    } catch (error) {
      console.error('[SmartHomeConfigRepository] Update notification preferences error:', error);
      return false;
    }
  }
  
  /**
   * Clear configuration
   */
  public async clearConfig(): Promise<boolean> {
    try {
      this.config = null;
      await AsyncStorage.removeItem(SmartHomeConfigRepository.CONFIG_STORAGE_KEY);
      console.log('[SmartHomeConfigRepository] Cleared configuration');
      return true;
    } catch (error) {
      console.error('[SmartHomeConfigRepository] Error clearing configuration:', error);
      return false;
    }
  }
  
  /**
   * Load configuration from storage
   */
  private async loadConfig(): Promise<void> {
    try {
      const configJson = await AsyncStorage.getItem(SmartHomeConfigRepository.CONFIG_STORAGE_KEY);
      
      if (configJson) {
        this.config = JSON.parse(configJson);
        console.log('[SmartHomeConfigRepository] Loaded configuration from storage');
      } else {
        console.log('[SmartHomeConfigRepository] No configuration found in storage');
        this.config = null;
      }
    } catch (error) {
      console.error('[SmartHomeConfigRepository] Error loading configuration:', error);
      this.config = null;
      throw error;
    }
  }
  
  /**
   * Persist configuration to storage
   */
  private async persistConfig(): Promise<void> {
    try {
      if (this.config) {
        await AsyncStorage.setItem(
          SmartHomeConfigRepository.CONFIG_STORAGE_KEY, 
          JSON.stringify(this.config)
        );
        console.log('[SmartHomeConfigRepository] Persisted configuration to storage');
      }
    } catch (error) {
      console.error('[SmartHomeConfigRepository] Error persisting configuration:', error);
      throw error;
    }
  }
} 