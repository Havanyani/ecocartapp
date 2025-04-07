/**
 * SmartBinAdapter.ts
 * 
 * Manages communication with smart recycling bins, handling bin status monitoring,
 * weight tracking, and fill-level detection.
 * 
 * Supports multiple smart bin models through standardized protocols.
 */

import AsyncStorage from '@react-native-async-storage/async-storage';
import { EventEmitter } from 'events';
import { SmartHomeDevice } from '../SmartHomeService';
import { BLEManager } from '../protocols/BLEManager';

/**
 * Supported smart recycling bin models
 */
export enum BinModel {
  ECO_BIN_PRO = 'ECO_BIN_PRO',
  SMART_RECYCLER = 'SMART_RECYCLER',
  COMPOST_MASTER = 'COMPOST_MASTER',
  WASTE_WIZARD = 'WASTE_WIZARD',
}

/**
 * Bin measurement data structure
 */
export interface BinMeasurement {
  deviceId: string;
  timestamp: number;
  weight: number; // in grams
  fillLevel: number; // percentage (0-100)
  batteryLevel: number; // percentage (0-100)
  isLidOpen: boolean;
  materialType?: string; // detected material (if supported)
}

/**
 * Bin configuration settings
 */
export interface BinSettings {
  notifyWhenFull: boolean;
  fullThreshold: number; // percentage (0-100)
  weightCalibration: number; // calibration factor
  autoDetectMaterials: boolean;
  enableWeightTracking: boolean;
  lidCloseTimeout: number; // in seconds
}

/**
 * Bin usage statistics
 */
export interface BinStats {
  totalWeight: number; // in grams
  averageFillLevel: number;
  emptyCount: number;
  lastEmptied: number | null; // timestamp
  materialsDetected: Record<string, number>; // count by type
  weightHistory: Array<{ timestamp: number; weight: number }>;
  fillHistory: Array<{ timestamp: number; level: number }>;
}

/**
 * Service UUIDs for different smart bin models
 */
const SERVICE_UUIDS = {
  ECO_BIN_PRO: '000000ff-0000-1000-8000-00805f9b34fb',
  SMART_RECYCLER: '0000aa00-0000-1000-8000-00805f9b34fb',
  COMPOST_MASTER: '0000bb00-0000-1000-8000-00805f9b34fb',
  WASTE_WIZARD: '0000cc00-0000-1000-8000-00805f9b34fb',
};

/**
 * Characteristic UUIDs for smart bin features
 */
const CHARACTERISTIC_UUIDS = {
  WEIGHT: '00000001-0000-1000-8000-00805f9b34fb',
  FILL_LEVEL: '00000002-0000-1000-8000-00805f9b34fb',
  BATTERY: '00000003-0000-1000-8000-00805f9b34fb',
  LID_STATUS: '00000004-0000-1000-8000-00805f9b34fb',
  MATERIAL_DETECTION: '00000005-0000-1000-8000-00805f9b34fb',
  BIN_SETTINGS: '00000006-0000-1000-8000-00805f9b34fb',
};

/**
 * Material type mapping from device codes
 */
const MATERIAL_TYPES: Record<number, string> = {
  0: 'unknown',
  1: 'plastic',
  2: 'paper',
  3: 'glass',
  4: 'metal',
  5: 'organic',
  6: 'electronic',
  7: 'hazardous',
};

/**
 * Adapter for integrating with smart recycling bins
 */
export class SmartBinAdapter extends EventEmitter {
  private static readonly STORAGE_KEY = '@ecocart:smart_bin_data';
  private initialized = false;
  private connectedBins = new Set<string>();
  private binMeasurements = new Map<string, BinMeasurement>();
  private binSettings = new Map<string, BinSettings>();
  private binStats = new Map<string, BinStats>();
  
  /**
   * Create a new SmartBinAdapter
   * @param bleManager BLE manager for communicating with devices
   */
  constructor(private bleManager: BLEManager) {
    super();
    
    // Set up event listeners
    this.bleManager.on('deviceConnected', this.handleDeviceConnected.bind(this));
    this.bleManager.on('deviceDisconnected', this.handleDeviceDisconnected.bind(this));
    this.bleManager.on('dataReceived', this.handleDataReceived.bind(this));
  }
  
  /**
   * Initialize the adapter and load persisted data
   */
  async initialize(): Promise<void> {
    if (this.initialized) return;
    
    try {
      // Load persisted data
      const data = await AsyncStorage.getItem(SmartBinAdapter.STORAGE_KEY);
      
      if (data) {
        const parsedData = JSON.parse(data);
        
        // Restore measurements
        if (parsedData.measurements) {
          Object.entries(parsedData.measurements).forEach(([deviceId, measurement]) => {
            this.binMeasurements.set(deviceId, measurement as BinMeasurement);
          });
        }
        
        // Restore settings
        if (parsedData.settings) {
          Object.entries(parsedData.settings).forEach(([deviceId, settings]) => {
            this.binSettings.set(deviceId, settings as BinSettings);
          });
        }
        
        // Restore stats
        if (parsedData.stats) {
          Object.entries(parsedData.stats).forEach(([deviceId, stats]) => {
            this.binStats.set(deviceId, stats as BinStats);
          });
        }
      }
      
      this.initialized = true;
      console.log(`Initialized SmartBinAdapter with ${this.binMeasurements.size} stored measurements`);
    } catch (error) {
      console.error('Error initializing SmartBinAdapter:', error);
    }
  }
  
  /**
   * Check if a discovered device is a supported smart bin
   */
  isSupportedBin(device: { id: string; serviceUUIDs?: string[] }): boolean {
    if (!device.serviceUUIDs || device.serviceUUIDs.length === 0) {
      return false;
    }
    
    return device.serviceUUIDs.some(uuid => 
      Object.values(SERVICE_UUIDS).includes(uuid)
    );
  }
  
  /**
   * Get the model of a bin based on its service UUID
   */
  getBinModel(device: { id: string; serviceUUIDs?: string[] }): BinModel | null {
    if (!device.serviceUUIDs || device.serviceUUIDs.length === 0) {
      return null;
    }
    
    for (const [model, uuid] of Object.entries(SERVICE_UUIDS)) {
      if (device.serviceUUIDs.includes(uuid)) {
        return model as BinModel;
      }
    }
    
    return null;
  }
  
  /**
   * Connect to a smart bin device
   */
  async connectToBin(device: SmartHomeDevice): Promise<boolean> {
    try {
      // Ensure the adapter is initialized
      if (!this.initialized) {
        await this.initialize();
      }
      
      // Connect to the device
      const connected = await this.bleManager.connect(device.id);
      
      if (connected) {
        this.connectedBins.add(device.id);
        
        // Read initial data
        await this.readBinData(device.id);
        
        // Initialize default settings if needed
        if (!this.binSettings.has(device.id)) {
          this.binSettings.set(device.id, {
            notifyWhenFull: true,
            fullThreshold: 80,
            weightCalibration: 1.0,
            autoDetectMaterials: true,
            enableWeightTracking: true,
            lidCloseTimeout: 30,
          });
        }
        
        // Initialize default stats if needed
        if (!this.binStats.has(device.id)) {
          this.binStats.set(device.id, {
            totalWeight: 0,
            averageFillLevel: 0,
            emptyCount: 0,
            lastEmptied: null,
            materialsDetected: {},
            weightHistory: [],
            fillHistory: [],
          });
        }
        
        // Persist data
        this.persistData();
        
        // Notify listeners
        this.emit('binConnected', device);
        
        return true;
      }
      
      return false;
    } catch (error) {
      console.error(`Error connecting to bin ${device.id}:`, error);
      return false;
    }
  }
  
  /**
   * Disconnect from a smart bin device
   */
  async disconnectFromBin(deviceId: string): Promise<boolean> {
    try {
      const disconnected = await this.bleManager.disconnect(deviceId);
      
      if (disconnected) {
        this.connectedBins.delete(deviceId);
        
        // Persist data
        this.persistData();
        
        // Notify listeners
        this.emit('binDisconnected', deviceId);
        
        return true;
      }
      
      return false;
    } catch (error) {
      console.error(`Error disconnecting from bin ${deviceId}:`, error);
      return false;
    }
  }
  
  /**
   * Get the current measurement data for a bin
   */
  getBinMeasurement(deviceId: string): BinMeasurement | null {
    return this.binMeasurements.get(deviceId) || null;
  }
  
  /**
   * Get the current settings for a bin
   */
  getBinSettings(deviceId: string): BinSettings | null {
    return this.binSettings.get(deviceId) || null;
  }
  
  /**
   * Get the usage statistics for a bin
   */
  getBinStats(deviceId: string): BinStats | null {
    return this.binStats.get(deviceId) || null;
  }
  
  /**
   * Update settings for a bin
   */
  async updateBinSettings(
    deviceId: string, 
    settings: Partial<BinSettings>
  ): Promise<boolean> {
    try {
      const currentSettings = this.binSettings.get(deviceId);
      
      if (!currentSettings) {
        return false;
      }
      
      // Update settings
      const updatedSettings = {
        ...currentSettings,
        ...settings,
      };
      
      // Apply settings to device
      if (this.connectedBins.has(deviceId)) {
        // Convert settings to byte array for device
        const settingsBytes = this.settingsToBytes(updatedSettings);
        
        // Write to device
        await this.bleManager.writeCharacteristic(
          deviceId,
          Object.values(SERVICE_UUIDS).find(uuid => uuid.includes('ff')) || SERVICE_UUIDS.ECO_BIN_PRO,
          CHARACTERISTIC_UUIDS.BIN_SETTINGS,
          settingsBytes
        );
      }
      
      // Update local settings
      this.binSettings.set(deviceId, updatedSettings);
      
      // Persist data
      this.persistData();
      
      // Notify listeners
      this.emit('binSettingsChanged', { deviceId, settings: updatedSettings });
      
      return true;
    } catch (error) {
      console.error(`Error updating bin settings for ${deviceId}:`, error);
      return false;
    }
  }
  
  /**
   * Register that a bin has been emptied
   */
  registerBinEmptied(deviceId: string): boolean {
    try {
      const stats = this.binStats.get(deviceId);
      const measurement = this.binMeasurements.get(deviceId);
      
      if (!stats || !measurement) {
        return false;
      }
      
      // Update stats
      stats.emptyCount += 1;
      stats.lastEmptied = Date.now();
      
      // Track previous weight before reset
      if (measurement.weight > 0) {
        stats.totalWeight = 0;
        stats.weightHistory.push({
          timestamp: Date.now(),
          weight: measurement.weight,
        });
      }
      
      // Reset measurements
      measurement.weight = 0;
      measurement.fillLevel = 0;
      measurement.timestamp = Date.now();
      
      // Persist data
      this.persistData();
      
      // Notify listeners
      this.emit('binEmptied', deviceId);
      
      return true;
    } catch (error) {
      console.error(`Error registering bin emptied for ${deviceId}:`, error);
      return false;
    }
  }
  
  /**
   * Calibrate the weight sensor
   */
  async calibrateWeightSensor(deviceId: string): Promise<boolean> {
    try {
      if (!this.connectedBins.has(deviceId)) {
        return false;
      }
      
      // Send calibration command to device
      // This is just a specialized settings update with calibration flag
      const calibrationCommand = new Uint8Array([0x01]);
      
      await this.bleManager.writeCharacteristic(
        deviceId,
        Object.values(SERVICE_UUIDS).find(uuid => uuid.includes('ff')) || SERVICE_UUIDS.ECO_BIN_PRO,
        CHARACTERISTIC_UUIDS.BIN_SETTINGS,
        calibrationCommand
      );
      
      // Reset the weight to zero
      const measurement = this.binMeasurements.get(deviceId);
      if (measurement) {
        measurement.weight = 0;
        this.binMeasurements.set(deviceId, measurement);
      }
      
      // Update calibration factor in settings
      const settings = this.binSettings.get(deviceId);
      if (settings) {
        settings.weightCalibration = 1.0; // Reset to default
        this.binSettings.set(deviceId, settings);
      }
      
      // Persist data
      this.persistData();
      
      // Notify listeners
      this.emit('binCalibrated', deviceId);
      
      return true;
    } catch (error) {
      console.error(`Error calibrating weight sensor for ${deviceId}:`, error);
      return false;
    }
  }
  
  /**
   * Handle device connected event
   */
  private handleDeviceConnected(device: any) {
    // Check if it's a supported bin
    if (this.isSupportedBin(device)) {
      // For already created SmartHomeDevice objects, just notify
      // For discovered devices, we'd usually create a SmartHomeDevice first
      const binModel = this.getBinModel(device);
      
      if (binModel) {
        this.emit('binDiscovered', {
          id: device.id,
          name: device.name || `Smart Bin ${device.id.substring(0, 4)}`,
          type: DeviceType.RECYCLING_BIN,
          model: binModel,
          metadata: { serviceUUIDs: device.serviceUUIDs },
        });
      }
    }
  }
  
  /**
   * Handle device disconnected event
   */
  private handleDeviceDisconnected(deviceId: string) {
    if (this.connectedBins.has(deviceId)) {
      this.connectedBins.delete(deviceId);
      this.emit('binDisconnected', deviceId);
    }
  }
  
  /**
   * Handle data received from device
   */
  private handleDataReceived(data: { 
    deviceId: string; 
    serviceUUID: string; 
    characteristicUUID: string; 
    value: Uint8Array;
  }) {
    if (!this.connectedBins.has(data.deviceId)) {
      return;
    }
    
    // Get current measurement or create a new one
    let measurement = this.binMeasurements.get(data.deviceId);
    
    if (!measurement) {
      measurement = {
        deviceId,
        timestamp: Date.now(),
        weight: 0,
        fillLevel: 0,
        batteryLevel: 100,
        isLidOpen: false,
      };
    }
    
    // Update measurement based on characteristic
    if (data.characteristicUUID.includes('WEIGHT')) {
      const newWeight = this.bytesToWeight(data.value);
      const oldWeight = measurement.weight;
      measurement.weight = newWeight;
      this.emit('binWeightChanged', { deviceId: data.deviceId, weight: newWeight });
      
      // Update stats
      const stats = this.binStats.get(data.deviceId);
      if (stats) {
        stats.weightHistory.push({
          timestamp: Date.now(),
          weight: newWeight,
        });
        
        // Limit history size
        if (stats.weightHistory.length > 100) {
          stats.weightHistory.shift();
        }
        
        // Update total weight if it increased
        if (newWeight > oldWeight) {
          stats.totalWeight += (newWeight - oldWeight);
        }
      }
    } 
    else if (data.characteristicUUID.includes('FILL_LEVEL')) {
      const newFillLevel = this.bytesToFillLevel(data.value);
      measurement.fillLevel = newFillLevel;
      this.emit('binFillLevelChanged', { deviceId: data.deviceId, fillLevel: newFillLevel });
      
      // Update stats
      const stats = this.binStats.get(data.deviceId);
      if (stats) {
        stats.fillHistory.push({
          timestamp: Date.now(),
          level: newFillLevel,
        });
        
        // Limit history size
        if (stats.fillHistory.length > 100) {
          stats.fillHistory.shift();
        }
        
        // Update average
        const sum = stats.fillHistory.reduce((acc, item) => acc + item.level, 0);
        stats.averageFillLevel = Math.round(sum / stats.fillHistory.length);
      }
      
      // Check if bin is full
      const settings = this.binSettings.get(data.deviceId);
      if (settings && settings.notifyWhenFull && newFillLevel >= settings.fullThreshold) {
        this.emit('binFull', { 
          deviceId: data.deviceId, 
          fillLevel: newFillLevel,
          threshold: settings.fullThreshold,
        });
      }
    }
    else if (data.characteristicUUID.includes('BATTERY')) {
      measurement.batteryLevel = data.value[0];
    }
    else if (data.characteristicUUID.includes('LID_STATUS')) {
      const isOpen = data.value[0] !== 0;
      const wasOpen = measurement.isLidOpen;
      measurement.isLidOpen = isOpen;
      
      // Emit events for lid state changes
      if (isOpen && !wasOpen) {
        this.emit('binLidOpened', { deviceId: data.deviceId });
      } else if (!isOpen && wasOpen) {
        this.emit('binLidClosed', { deviceId: data.deviceId });
      }
    }
    else if (data.characteristicUUID.includes('MATERIAL_DETECTION')) {
      const materialCode = data.value[0];
      const materialType = MATERIAL_TYPES[materialCode] || 'unknown';
      measurement.materialType = materialType;
      
      // Update stats
      const stats = this.binStats.get(data.deviceId);
      if (stats) {
        stats.materialsDetected[materialType] = (stats.materialsDetected[materialType] || 0) + 1;
      }
      
      this.emit('binMaterialDetected', { 
        deviceId: data.deviceId, 
        materialType,
      });
    }
    
    // Update timestamp
    measurement.timestamp = Date.now();
    
    // Store updated measurement
    this.binMeasurements.set(data.deviceId, measurement);
    
    // Persist data
    this.persistData();
  }
  
  /**
   * Read all available data from a bin
   */
  private async readBinData(deviceId: string): Promise<void> {
    try {
      // Find the service UUID for this device
      const serviceUUID = Object.values(SERVICE_UUIDS).find(uuid => {
        // For a real device, we'd check which service it supports
        return true; // Using first one for mock
      }) || SERVICE_UUIDS.ECO_BIN_PRO;
      
      // Create a new measurement or get existing one
      let measurement = this.binMeasurements.get(deviceId) || {
        deviceId,
        timestamp: Date.now(),
        weight: 0,
        fillLevel: 0,
        batteryLevel: 100,
        isLidOpen: false,
      };
      
      // Read weight
      const weightData = await this.bleManager.readCharacteristic(
        deviceId,
        serviceUUID,
        CHARACTERISTIC_UUIDS.WEIGHT
      );
      measurement.weight = this.bytesToWeight(weightData);
      
      // Read fill level
      const fillLevelData = await this.bleManager.readCharacteristic(
        deviceId,
        serviceUUID,
        CHARACTERISTIC_UUIDS.FILL_LEVEL
      );
      measurement.fillLevel = this.bytesToFillLevel(fillLevelData);
      
      // Read battery level
      const batteryData = await this.bleManager.readCharacteristic(
        deviceId,
        serviceUUID,
        CHARACTERISTIC_UUIDS.BATTERY
      );
      measurement.batteryLevel = batteryData[0];
      
      // Read lid status
      const lidData = await this.bleManager.readCharacteristic(
        deviceId,
        serviceUUID,
        CHARACTERISTIC_UUIDS.LID_STATUS
      );
      measurement.isLidOpen = lidData[0] !== 0;
      
      // Read material detection (if available)
      try {
        const materialData = await this.bleManager.readCharacteristic(
          deviceId,
          serviceUUID,
          CHARACTERISTIC_UUIDS.MATERIAL_DETECTION
        );
        const materialCode = materialData[0];
        measurement.materialType = MATERIAL_TYPES[materialCode] || 'unknown';
      } catch (error) {
        // Material detection might not be supported
        console.log(`Material detection not available for bin ${deviceId}`);
      }
      
      // Read settings (if available)
      try {
        const settingsData = await this.bleManager.readCharacteristic(
          deviceId,
          serviceUUID,
          CHARACTERISTIC_UUIDS.BIN_SETTINGS
        );
        const settings = this.bytesToSettings(settingsData);
        this.binSettings.set(deviceId, settings);
      } catch (error) {
        // Settings might not be available
        console.log(`Settings not available for bin ${deviceId}`);
      }
      
      // Store measurement
      measurement.timestamp = Date.now();
      this.binMeasurements.set(deviceId, measurement);
      
    } catch (error) {
      console.error(`Error reading bin data for ${deviceId}:`, error);
    }
  }
  
  /**
   * Convert bytes to weight value
   */
  private bytesToWeight(bytes: Uint8Array): number {
    // Simple 16-bit conversion (big-endian)
    return (bytes[0] << 8) + bytes[1];
  }
  
  /**
   * Convert bytes to fill level value
   */
  private bytesToFillLevel(bytes: Uint8Array): number {
    // Single byte percentage (0-100)
    return bytes[0];
  }
  
  /**
   * Convert settings object to bytes for device
   */
  private settingsToBytes(settings: BinSettings): Uint8Array {
    // Format: [fullThreshold, flags, calibration, timeout]
    const flags = (settings.notifyWhenFull ? 1 : 0) |
                 ((settings.autoDetectMaterials ? 1 : 0) << 1) |
                 ((settings.enableWeightTracking ? 1 : 0) << 2);
    
    return new Uint8Array([
      settings.fullThreshold,
      flags,
      Math.round(settings.weightCalibration * 100), // Store as integer (x100)
      settings.lidCloseTimeout,
    ]);
  }
  
  /**
   * Convert bytes to settings object
   */
  private bytesToSettings(bytes: Uint8Array): BinSettings {
    // Extract flags
    const flags = bytes[1];
    
    return {
      fullThreshold: bytes[0],
      notifyWhenFull: (flags & 1) !== 0,
      autoDetectMaterials: (flags & 2) !== 0,
      enableWeightTracking: (flags & 4) !== 0,
      weightCalibration: bytes[2] / 100, // Convert from integer (x100)
      lidCloseTimeout: bytes[3],
    };
  }
  
  /**
   * Persist all data to storage
   */
  private async persistData(): Promise<void> {
    try {
      const data = {
        measurements: Object.fromEntries(this.binMeasurements.entries()),
        settings: Object.fromEntries(this.binSettings.entries()),
        stats: Object.fromEntries(this.binStats.entries()),
      };
      
      await AsyncStorage.setItem(SmartBinAdapter.STORAGE_KEY, JSON.stringify(data));
    } catch (error) {
      console.error('Error persisting bin data:', error);
    }
  }
} 