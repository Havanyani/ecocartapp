/**
 * DeviceRepository.ts
 * 
 * Repository for storing and retrieving smart home device data.
 * Uses AsyncStorage for persistent storage.
 */

import AsyncStorage from '@react-native-async-storage/async-storage';
import { SmartHomeDevice } from '../SmartHomeService';

/**
 * Repository for managing smart home device data
 */
export class DeviceRepository {
  private static DEVICES_STORAGE_KEY = 'ecocart_smart_home_devices';
  private devices: Map<string, SmartHomeDevice> = new Map();
  private isInitialized: boolean = false;
  
  /**
   * Initialize the repository
   */
  public async initialize(): Promise<boolean> {
    if (this.isInitialized) {
      return true;
    }
    
    try {
      // Load devices from storage
      await this.loadDevices();
      this.isInitialized = true;
      return true;
    } catch (error) {
      console.error('[DeviceRepository] Initialization error:', error);
      return false;
    }
  }
  
  /**
   * Get all devices
   */
  public async getAllDevices(): Promise<SmartHomeDevice[]> {
    if (!this.isInitialized) {
      await this.initialize();
    }
    
    return Array.from(this.devices.values());
  }
  
  /**
   * Get device by ID
   */
  public async getDeviceById(deviceId: string): Promise<SmartHomeDevice | null> {
    if (!this.isInitialized) {
      await this.initialize();
    }
    
    return this.devices.get(deviceId) || null;
  }
  
  /**
   * Save device
   */
  public async saveDevice(device: SmartHomeDevice): Promise<boolean> {
    if (!this.isInitialized) {
      await this.initialize();
    }
    
    try {
      this.devices.set(device.id, {
        ...device,
        lastSyncTimestamp: Date.now()
      });
      
      await this.persistDevices();
      return true;
    } catch (error) {
      console.error('[DeviceRepository] Save device error:', error);
      return false;
    }
  }
  
  /**
   * Delete device
   */
  public async deleteDevice(deviceId: string): Promise<boolean> {
    if (!this.isInitialized) {
      await this.initialize();
    }
    
    if (!this.devices.has(deviceId)) {
      return false;
    }
    
    try {
      this.devices.delete(deviceId);
      await this.persistDevices();
      return true;
    } catch (error) {
      console.error('[DeviceRepository] Delete device error:', error);
      return false;
    }
  }
  
  /**
   * Get devices by type
   */
  public async getDevicesByType(deviceType: string): Promise<SmartHomeDevice[]> {
    if (!this.isInitialized) {
      await this.initialize();
    }
    
    return Array.from(this.devices.values()).filter(
      device => device.type === deviceType
    );
  }
  
  /**
   * Get connected devices
   */
  public async getConnectedDevices(): Promise<SmartHomeDevice[]> {
    if (!this.isInitialized) {
      await this.initialize();
    }
    
    return Array.from(this.devices.values()).filter(
      device => device.connectionStatus === 'connected'
    );
  }
  
  /**
   * Load devices from storage
   */
  private async loadDevices(): Promise<void> {
    try {
      const devicesJson = await AsyncStorage.getItem(DeviceRepository.DEVICES_STORAGE_KEY);
      
      if (devicesJson) {
        const deviceArray: SmartHomeDevice[] = JSON.parse(devicesJson);
        
        // Clear current devices
        this.devices.clear();
        
        // Add devices to map
        deviceArray.forEach(device => {
          this.devices.set(device.id, device);
        });
        
        console.log(`[DeviceRepository] Loaded ${deviceArray.length} devices from storage`);
      } else {
        console.log('[DeviceRepository] No devices found in storage');
      }
    } catch (error) {
      console.error('[DeviceRepository] Error loading devices:', error);
      this.devices.clear();
      throw error;
    }
  }
  
  /**
   * Persist devices to storage
   */
  private async persistDevices(): Promise<void> {
    try {
      const deviceArray = Array.from(this.devices.values());
      await AsyncStorage.setItem(DeviceRepository.DEVICES_STORAGE_KEY, JSON.stringify(deviceArray));
      console.log(`[DeviceRepository] Persisted ${deviceArray.length} devices to storage`);
    } catch (error) {
      console.error('[DeviceRepository] Error persisting devices:', error);
      throw error;
    }
  }
  
  /**
   * Clear all devices
   */
  public async clearDevices(): Promise<boolean> {
    try {
      this.devices.clear();
      await AsyncStorage.removeItem(DeviceRepository.DEVICES_STORAGE_KEY);
      console.log('[DeviceRepository] Cleared all devices');
      return true;
    } catch (error) {
      console.error('[DeviceRepository] Error clearing devices:', error);
      return false;
    }
  }
} 