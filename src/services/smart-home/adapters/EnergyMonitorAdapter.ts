/**
 * EnergyMonitorAdapter.ts
 * 
 * Manages communication with smart energy monitors, handling energy usage tracking,
 * consumption patterns, and efficiency recommendations.
 * 
 * Supports multiple energy monitor models through standardized protocols.
 */

import AsyncStorage from '@react-native-async-storage/async-storage';
import { EventEmitter } from 'events';
import { SmartHomeDevice } from '../SmartHomeService';
import { BLEManager } from '../protocols/BLEManager';

/**
 * Supported energy monitor models
 */
export enum MonitorModel {
  ECO_ENERGY_PRO = 'ECO_ENERGY_PRO',
  SMART_METER = 'SMART_METER',
  POWER_SENTINEL = 'POWER_SENTINEL',
  ECO_WATT_TRACKER = 'ECO_WATT_TRACKER',
}

/**
 * Energy reading data structure
 */
export interface EnergyReading {
  deviceId: string;
  timestamp: number;
  power: number; // in watts
  voltage: number; // in volts
  current: number; // in amps
  energy: number; // in kWh
  frequency: number; // in Hz
  powerFactor: number; // 0-1
  batteryLevel: number; // percentage (0-100)
  appliance?: string; // detected appliance type if applicable
}

/**
 * Energy monitor configuration settings
 */
export interface EnergyMonitorSettings {
  reportingInterval: number; // in seconds
  highUsageThreshold: number; // in watts
  standbyThreshold: number; // in watts
  enableApplianceDetection: boolean;
  enableNotifications: boolean;
  costPerKwh: number; // in local currency
}

/**
 * Energy usage statistics
 */
export interface EnergyStats {
  totalEnergyToday: number; // in kWh
  totalEnergyCost: number; // in local currency
  peakUsage: number; // in watts
  averagePower: number; // in watts
  usageHistory: Array<{ timestamp: number; power: number; energy: number }>;
  detectedAppliances: Record<string, number>; // count by type
  dailyUsage: Record<string, number>; // kWh by date string
  hourlyUsage: Record<string, number>; // kWh by hour (0-23)
}

/**
 * Service UUIDs for different energy monitor models
 */
const SERVICE_UUIDS = {
  ECO_ENERGY_PRO: '0000ee00-0000-1000-8000-00805f9b34fb',
  SMART_METER: '0000ee01-0000-1000-8000-00805f9b34fb',
  POWER_SENTINEL: '0000ee02-0000-1000-8000-00805f9b34fb',
  ECO_WATT_TRACKER: '0000ee03-0000-1000-8000-00805f9b34fb',
};

/**
 * Characteristic UUIDs for energy monitor features
 */
const CHARACTERISTIC_UUIDS = {
  POWER: '00000101-0000-1000-8000-00805f9b34fb',
  VOLTAGE: '00000102-0000-1000-8000-00805f9b34fb',
  CURRENT: '00000103-0000-1000-8000-00805f9b34fb',
  ENERGY: '00000104-0000-1000-8000-00805f9b34fb',
  FREQUENCY: '00000105-0000-1000-8000-00805f9b34fb',
  POWER_FACTOR: '00000106-0000-1000-8000-00805f9b34fb',
  BATTERY: '00000107-0000-1000-8000-00805f9b34fb',
  APPLIANCE: '00000108-0000-1000-8000-00805f9b34fb',
  MONITOR_SETTINGS: '00000109-0000-1000-8000-00805f9b34fb',
};

/**
 * Appliance type mapping from device codes
 */
const APPLIANCE_TYPES: Record<number, string> = {
  0: 'unknown',
  1: 'refrigerator',
  2: 'washing_machine',
  3: 'dryer',
  4: 'dishwasher',
  5: 'oven',
  6: 'microwave',
  7: 'air_conditioner',
  8: 'heater',
  9: 'tv',
  10: 'computer',
  11: 'lighting',
  12: 'water_heater',
};

/**
 * Adapter for integrating with smart energy monitors
 */
export class EnergyMonitorAdapter extends EventEmitter {
  private static readonly STORAGE_KEY = '@ecocart:energy_monitor_data';
  private initialized = false;
  private connectedMonitors = new Set<string>();
  private monitorReadings = new Map<string, EnergyReading>();
  private monitorSettings = new Map<string, EnergyMonitorSettings>();
  private energyStats = new Map<string, EnergyStats>();
  
  /**
   * Create a new EnergyMonitorAdapter
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
      const data = await AsyncStorage.getItem(EnergyMonitorAdapter.STORAGE_KEY);
      
      if (data) {
        const parsedData = JSON.parse(data);
        
        // Restore readings
        if (parsedData.readings) {
          Object.entries(parsedData.readings).forEach(([deviceId, reading]) => {
            this.monitorReadings.set(deviceId, reading as EnergyReading);
          });
        }
        
        // Restore settings
        if (parsedData.settings) {
          Object.entries(parsedData.settings).forEach(([deviceId, settings]) => {
            this.monitorSettings.set(deviceId, settings as EnergyMonitorSettings);
          });
        }
        
        // Restore stats
        if (parsedData.stats) {
          Object.entries(parsedData.stats).forEach(([deviceId, stats]) => {
            this.energyStats.set(deviceId, stats as EnergyStats);
          });
        }
      }
      
      this.initialized = true;
      console.log(`Initialized EnergyMonitorAdapter with ${this.monitorReadings.size} stored readings`);
    } catch (error) {
      console.error('Error initializing EnergyMonitorAdapter:', error);
    }
  }
  
  /**
   * Check if a discovered device is a supported energy monitor
   */
  isSupportedMonitor(device: { id: string; serviceUUIDs?: string[] }): boolean {
    if (!device.serviceUUIDs || device.serviceUUIDs.length === 0) {
      return false;
    }
    
    return device.serviceUUIDs.some(uuid => 
      Object.values(SERVICE_UUIDS).includes(uuid)
    );
  }
  
  /**
   * Get the model of a monitor based on its service UUID
   */
  getMonitorModel(device: { id: string; serviceUUIDs?: string[] }): MonitorModel | null {
    if (!device.serviceUUIDs || device.serviceUUIDs.length === 0) {
      return null;
    }
    
    for (const [model, uuid] of Object.entries(SERVICE_UUIDS)) {
      if (device.serviceUUIDs.includes(uuid)) {
        return model as MonitorModel;
      }
    }
    
    return null;
  }
  
  /**
   * Connect to an energy monitor device
   */
  async connectToMonitor(device: SmartHomeDevice): Promise<boolean> {
    try {
      // Ensure the adapter is initialized
      if (!this.initialized) {
        await this.initialize();
      }
      
      // Connect to the device
      const connected = await this.bleManager.connect(device.id);
      
      if (connected) {
        this.connectedMonitors.add(device.id);
        
        // Read initial data
        await this.readMonitorData(device.id);
        
        // Initialize default settings if needed
        if (!this.monitorSettings.has(device.id)) {
          this.monitorSettings.set(device.id, {
            reportingInterval: 10, // seconds
            highUsageThreshold: 2000, // watts
            standbyThreshold: 5, // watts
            enableApplianceDetection: true,
            enableNotifications: true,
            costPerKwh: 0.15, // default cost per kWh
          });
        }
        
        // Initialize default stats if needed
        if (!this.energyStats.has(device.id)) {
          this.energyStats.set(device.id, {
            totalEnergyToday: 0,
            totalEnergyCost: 0,
            peakUsage: 0,
            averagePower: 0,
            usageHistory: [],
            detectedAppliances: {},
            dailyUsage: {},
            hourlyUsage: {},
          });
        }
        
        // Persist data
        this.persistData();
        
        // Notify listeners
        this.emit('monitorConnected', device);
        
        return true;
      }
      
      return false;
    } catch (error) {
      console.error(`Error connecting to monitor ${device.id}:`, error);
      return false;
    }
  }
  
  /**
   * Disconnect from an energy monitor device
   */
  async disconnectFromMonitor(deviceId: string): Promise<boolean> {
    try {
      const disconnected = await this.bleManager.disconnect(deviceId);
      
      if (disconnected) {
        this.connectedMonitors.delete(deviceId);
        
        // Persist data
        this.persistData();
        
        // Notify listeners
        this.emit('monitorDisconnected', deviceId);
        
        return true;
      }
      
      return false;
    } catch (error) {
      console.error(`Error disconnecting from monitor ${deviceId}:`, error);
      return false;
    }
  }
  
  /**
   * Get the current reading data for a monitor
   */
  getMonitorReading(deviceId: string): EnergyReading | null {
    return this.monitorReadings.get(deviceId) || null;
  }
  
  /**
   * Get the current settings for a monitor
   */
  getMonitorSettings(deviceId: string): EnergyMonitorSettings | null {
    return this.monitorSettings.get(deviceId) || null;
  }
  
  /**
   * Get the energy statistics for a monitor
   */
  getEnergyStats(deviceId: string): EnergyStats | null {
    return this.energyStats.get(deviceId) || null;
  }
  
  /**
   * Update settings for a monitor
   */
  async updateMonitorSettings(
    deviceId: string, 
    settings: Partial<EnergyMonitorSettings>
  ): Promise<boolean> {
    try {
      const currentSettings = this.monitorSettings.get(deviceId);
      
      if (!currentSettings) {
        return false;
      }
      
      // Update settings
      const updatedSettings = {
        ...currentSettings,
        ...settings,
      };
      
      // Apply settings to device
      if (this.connectedMonitors.has(deviceId)) {
        // Convert settings to byte array for device
        const settingsBytes = this.settingsToBytes(updatedSettings);
        
        // Write to device
        await this.bleManager.writeCharacteristic(
          deviceId,
          Object.values(SERVICE_UUIDS).find(uuid => uuid.includes('ee00')) || SERVICE_UUIDS.ECO_ENERGY_PRO,
          CHARACTERISTIC_UUIDS.MONITOR_SETTINGS,
          settingsBytes
        );
      }
      
      // Update local settings
      this.monitorSettings.set(deviceId, updatedSettings);
      
      // Persist data
      this.persistData();
      
      // Notify listeners
      this.emit('monitorSettingsChanged', { deviceId, settings: updatedSettings });
      
      return true;
    } catch (error) {
      console.error(`Error updating monitor settings for ${deviceId}:`, error);
      return false;
    }
  }
  
  /**
   * Reset energy statistics
   */
  resetEnergyStats(deviceId: string): boolean {
    try {
      const stats = this.energyStats.get(deviceId);
      
      if (!stats) {
        return false;
      }
      
      // Save today's date for the reset
      const resetDate = new Date().toISOString().split('T')[0];
      
      // Reset stats
      stats.totalEnergyToday = 0;
      stats.totalEnergyCost = 0;
      stats.peakUsage = 0;
      
      // Mark the reset in history
      const reading = this.monitorReadings.get(deviceId);
      if (reading) {
        stats.usageHistory.push({
          timestamp: Date.now(),
          power: reading.power,
          energy: 0, // Reset point
        });
        
        // Limit history size
        if (stats.usageHistory.length > 100) {
          stats.usageHistory.shift();
        }
      }
      
      // Persist data
      this.persistData();
      
      // Notify listeners
      this.emit('energyStatsReset', deviceId);
      
      return true;
    } catch (error) {
      console.error(`Error resetting energy stats for ${deviceId}:`, error);
      return false;
    }
  }
  
  /**
   * Calculate energy cost for a given consumption
   */
  calculateEnergyCost(deviceId: string, kWh: number): number {
    const settings = this.monitorSettings.get(deviceId);
    
    if (!settings) {
      return 0;
    }
    
    return kWh * settings.costPerKwh;
  }
  
  /**
   * Get energy efficiency recommendations based on usage patterns
   */
  getEfficiencyRecommendations(deviceId: string): string[] {
    const recommendations: string[] = [];
    const reading = this.monitorReadings.get(deviceId);
    const settings = this.monitorSettings.get(deviceId);
    const stats = this.energyStats.get(deviceId);
    
    if (!reading || !settings || !stats) {
      return recommendations;
    }
    
    // Check for standby power consumption
    if (reading.power > settings.standbyThreshold && reading.power < 20) {
      recommendations.push(
        'Detected standby power consumption. Consider using a smart power strip to reduce vampire power drain.'
      );
    }
    
    // Check for high power consumption
    if (reading.power > settings.highUsageThreshold) {
      recommendations.push(
        `Device is using more power than usual (${reading.power} watts). Check if all features are necessary.`
      );
    }
    
    // Check power factor
    if (reading.powerFactor < 0.8) {
      recommendations.push(
        'Power factor is low. This might indicate inefficient power usage or issues with reactive loads.'
      );
    }
    
    // Time-based recommendations
    const hour = new Date().getHours();
    if (hour >= 17 && hour <= 21 && reading.power > 1000) {
      recommendations.push(
        'You\'re using high power during peak hours. Consider shifting energy-intensive tasks to off-peak hours to save costs.'
      );
    }
    
    // Check if any appliance is using more power than expected
    if (reading.appliance && reading.appliance !== 'unknown') {
      switch (reading.appliance) {
        case 'refrigerator':
          if (reading.power > 200) {
            recommendations.push('Your refrigerator is consuming more power than typical. Check if the door seals are intact and coils are clean.');
          }
          break;
        case 'air_conditioner':
          if (reading.power > 3000) {
            recommendations.push('Your air conditioner is using high power. Consider increasing the temperature by 1-2 degrees to save energy.');
          }
          break;
      }
    }
    
    return recommendations;
  }
  
  /**
   * Handle device connected event
   */
  private handleDeviceConnected(device: any) {
    // Check if it's a supported monitor
    if (this.isSupportedMonitor(device)) {
      // For already created SmartHomeDevice objects, just notify
      // For discovered devices, we'd usually create a SmartHomeDevice first
      const monitorModel = this.getMonitorModel(device);
      
      if (monitorModel) {
        this.emit('monitorDiscovered', {
          id: device.id,
          name: device.name || `Energy Monitor ${device.id.substring(0, 4)}`,
          type: DeviceType.ENERGY_MONITOR,
          model: monitorModel,
          metadata: { serviceUUIDs: device.serviceUUIDs },
        });
      }
    }
  }
  
  /**
   * Handle device disconnected event
   */
  private handleDeviceDisconnected(deviceId: string) {
    if (this.connectedMonitors.has(deviceId)) {
      this.connectedMonitors.delete(deviceId);
      this.emit('monitorDisconnected', deviceId);
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
    if (!this.connectedMonitors.has(data.deviceId)) {
      return;
    }
    
    // Get current reading or create a new one
    let reading = this.monitorReadings.get(data.deviceId);
    
    if (!reading) {
      reading = {
        deviceId,
        timestamp: Date.now(),
        power: 0,
        voltage: 0,
        current: 0,
        energy: 0,
        frequency: 0,
        powerFactor: 0,
        batteryLevel: 100,
      };
    }
    
    // Update reading based on characteristic
    if (data.characteristicUUID.includes('POWER')) {
      const newPower = this.bytesToPower(data.value);
      const oldPower = reading.power;
      reading.power = newPower;
      
      // Update stats
      const stats = this.energyStats.get(data.deviceId);
      if (stats) {
        // Update peak usage if higher
        if (newPower > stats.peakUsage) {
          stats.peakUsage = newPower;
        }
        
        // Add to history
        stats.usageHistory.push({
          timestamp: Date.now(),
          power: newPower,
          energy: reading.energy,
        });
        
        // Limit history size
        if (stats.usageHistory.length > 100) {
          stats.usageHistory.shift();
        }
        
        // Calculate average
        const total = stats.usageHistory.reduce((sum, item) => sum + item.power, 0);
        stats.averagePower = Math.round(total / stats.usageHistory.length);
      }
      
      // Emit power changed event
      this.emit('powerChanged', { 
        deviceId: data.deviceId, 
        power: newPower,
        previousPower: oldPower,
      });
      
      // Check if power exceeds threshold
      const settings = this.monitorSettings.get(data.deviceId);
      if (settings && settings.enableNotifications && newPower > settings.highUsageThreshold) {
        this.emit('highEnergyUsage', { 
          deviceId: data.deviceId, 
          power: newPower,
          threshold: settings.highUsageThreshold,
        });
      }
    } 
    else if (data.characteristicUUID.includes('VOLTAGE')) {
      reading.voltage = this.bytesToVoltage(data.value);
    }
    else if (data.characteristicUUID.includes('CURRENT')) {
      reading.current = this.bytesToCurrent(data.value);
    }
    else if (data.characteristicUUID.includes('ENERGY')) {
      const newEnergy = this.bytesToEnergy(data.value);
      const oldEnergy = reading.energy;
      reading.energy = newEnergy;
      
      // Update stats
      const stats = this.energyStats.get(data.deviceId);
      if (stats) {
        // Only update if energy increased (to avoid duplicate counts)
        if (newEnergy > oldEnergy) {
          const energyAdded = newEnergy - oldEnergy;
          
          // Update daily total
          const today = new Date().toISOString().split('T')[0];
          stats.dailyUsage[today] = (stats.dailyUsage[today] || 0) + energyAdded;
          stats.totalEnergyToday += energyAdded;
          
          // Update hourly usage
          const hour = new Date().getHours().toString();
          stats.hourlyUsage[hour] = (stats.hourlyUsage[hour] || 0) + energyAdded;
          
          // Update cost
          const settings = this.monitorSettings.get(data.deviceId);
          if (settings) {
            stats.totalEnergyCost += energyAdded * settings.costPerKwh;
          }
        }
      }
      
      // Emit energy changed event
      this.emit('energyChanged', { 
        deviceId: data.deviceId, 
        energy: newEnergy,
        previousEnergy: oldEnergy,
      });
    }
    else if (data.characteristicUUID.includes('FREQUENCY')) {
      reading.frequency = data.value[0];
    }
    else if (data.characteristicUUID.includes('POWER_FACTOR')) {
      reading.powerFactor = data.value[0] / 100; // Convert 0-100 to 0-1
    }
    else if (data.characteristicUUID.includes('BATTERY')) {
      reading.batteryLevel = data.value[0];
    }
    else if (data.characteristicUUID.includes('APPLIANCE')) {
      const applianceCode = data.value[0];
      const applianceType = APPLIANCE_TYPES[applianceCode] || 'unknown';
      reading.appliance = applianceType;
      
      // Update stats
      const stats = this.energyStats.get(data.deviceId);
      if (stats && applianceType !== 'unknown') {
        stats.detectedAppliances[applianceType] = (stats.detectedAppliances[applianceType] || 0) + 1;
      }
      
      // Emit appliance detected event
      this.emit('applianceDetected', { 
        deviceId: data.deviceId, 
        applianceType,
        power: reading.power,
      });
    }
    
    // Update timestamp
    reading.timestamp = Date.now();
    
    // Store updated reading
    this.monitorReadings.set(data.deviceId, reading);
    
    // Persist data
    this.persistData();
  }
  
  /**
   * Read all available data from a monitor
   */
  private async readMonitorData(deviceId: string): Promise<void> {
    try {
      // Find the service UUID for this device
      const serviceUUID = Object.values(SERVICE_UUIDS).find(uuid => {
        // For a real device, we'd check which service it supports
        return true; // Using first one for mock
      }) || SERVICE_UUIDS.ECO_ENERGY_PRO;
      
      // Create a new reading or get existing one
      let reading = this.monitorReadings.get(deviceId) || {
        deviceId,
        timestamp: Date.now(),
        power: 0,
        voltage: 0,
        current: 0,
        energy: 0,
        frequency: 0,
        powerFactor: 0,
        batteryLevel: 100,
      };
      
      // Read power
      const powerData = await this.bleManager.readCharacteristic(
        deviceId,
        serviceUUID,
        CHARACTERISTIC_UUIDS.POWER
      );
      reading.power = this.bytesToPower(powerData);
      
      // Read voltage
      const voltageData = await this.bleManager.readCharacteristic(
        deviceId,
        serviceUUID,
        CHARACTERISTIC_UUIDS.VOLTAGE
      );
      reading.voltage = this.bytesToVoltage(voltageData);
      
      // Read current
      const currentData = await this.bleManager.readCharacteristic(
        deviceId,
        serviceUUID,
        CHARACTERISTIC_UUIDS.CURRENT
      );
      reading.current = this.bytesToCurrent(currentData);
      
      // Read energy
      const energyData = await this.bleManager.readCharacteristic(
        deviceId,
        serviceUUID,
        CHARACTERISTIC_UUIDS.ENERGY
      );
      reading.energy = this.bytesToEnergy(energyData);
      
      // Read frequency
      const frequencyData = await this.bleManager.readCharacteristic(
        deviceId,
        serviceUUID,
        CHARACTERISTIC_UUIDS.FREQUENCY
      );
      reading.frequency = frequencyData[0];
      
      // Read power factor
      const powerFactorData = await this.bleManager.readCharacteristic(
        deviceId,
        serviceUUID,
        CHARACTERISTIC_UUIDS.POWER_FACTOR
      );
      reading.powerFactor = powerFactorData[0] / 100; // Convert 0-100 to 0-1
      
      // Read battery level
      const batteryData = await this.bleManager.readCharacteristic(
        deviceId,
        serviceUUID,
        CHARACTERISTIC_UUIDS.BATTERY
      );
      reading.batteryLevel = batteryData[0];
      
      // Read appliance detection (if available)
      try {
        const applianceData = await this.bleManager.readCharacteristic(
          deviceId,
          serviceUUID,
          CHARACTERISTIC_UUIDS.APPLIANCE
        );
        const applianceCode = applianceData[0];
        reading.appliance = APPLIANCE_TYPES[applianceCode] || 'unknown';
      } catch (error) {
        // Appliance detection might not be available
        console.log(`Appliance detection not available for monitor ${deviceId}`);
      }
      
      // Read settings (if available)
      try {
        const settingsData = await this.bleManager.readCharacteristic(
          deviceId,
          serviceUUID,
          CHARACTERISTIC_UUIDS.MONITOR_SETTINGS
        );
        const settings = this.bytesToSettings(settingsData);
        this.monitorSettings.set(deviceId, settings);
      } catch (error) {
        // Settings might not be available
        console.log(`Settings not available for monitor ${deviceId}`);
      }
      
      // Store reading
      reading.timestamp = Date.now();
      this.monitorReadings.set(deviceId, reading);
      
    } catch (error) {
      console.error(`Error reading monitor data for ${deviceId}:`, error);
    }
  }
  
  /**
   * Convert bytes to power value
   */
  private bytesToPower(bytes: Uint8Array): number {
    // Simple 16-bit conversion (big-endian)
    return (bytes[0] << 8) + bytes[1];
  }
  
  /**
   * Convert bytes to voltage value
   */
  private bytesToVoltage(bytes: Uint8Array): number {
    // 16-bit voltage stored as tenths of volts (e.g., 2380 = 238.0V)
    const raw = (bytes[0] << 8) + bytes[1];
    return raw / 10;
  }
  
  /**
   * Convert bytes to current value
   */
  private bytesToCurrent(bytes: Uint8Array): number {
    // 16-bit current stored as hundredths of amps (e.g., 150 = 1.50A)
    const raw = (bytes[0] << 8) + bytes[1];
    return raw / 100;
  }
  
  /**
   * Convert bytes to energy value
   */
  private bytesToEnergy(bytes: Uint8Array): number {
    // 32-bit energy stored as thousandths of kWh (e.g., 1200 = 1.2kWh)
    const raw = (bytes[0] << 24) + (bytes[1] << 16) + (bytes[2] << 8) + bytes[3];
    return raw / 1000;
  }
  
  /**
   * Convert settings object to bytes for device
   */
  private settingsToBytes(settings: EnergyMonitorSettings): Uint8Array {
    // Format: [interval, highThreshH, highThreshL, standbyThresh, flags, costH, costL]
    const flags = (settings.enableApplianceDetection ? 1 : 0) |
                 ((settings.enableNotifications ? 1 : 0) << 1);
    
    // Convert cost to cents (15 cents = 1500)
    const costCents = Math.round(settings.costPerKwh * 100);
    
    return new Uint8Array([
      settings.reportingInterval,
      (settings.highUsageThreshold >> 8) & 0xFF, // High byte
      settings.highUsageThreshold & 0xFF, // Low byte
      settings.standbyThreshold,
      flags,
      (costCents >> 8) & 0xFF, // High byte
      costCents & 0xFF, // Low byte
    ]);
  }
  
  /**
   * Convert bytes to settings object
   */
  private bytesToSettings(bytes: Uint8Array): EnergyMonitorSettings {
    // Extract high usage threshold from 2 bytes
    const highUsageThreshold = (bytes[1] << 8) + bytes[2];
    
    // Extract flags
    const flags = bytes[4];
    
    // Extract cost from 2 bytes and convert from cents to dollars
    const costCents = (bytes[5] << 8) + bytes[6];
    
    return {
      reportingInterval: bytes[0],
      highUsageThreshold,
      standbyThreshold: bytes[3],
      enableApplianceDetection: (flags & 1) !== 0,
      enableNotifications: (flags & 2) !== 0,
      costPerKwh: costCents / 100,
    };
  }
  
  /**
   * Persist all data to storage
   */
  private async persistData(): Promise<void> {
    try {
      const data = {
        readings: Object.fromEntries(this.monitorReadings.entries()),
        settings: Object.fromEntries(this.monitorSettings.entries()),
        stats: Object.fromEntries(this.energyStats.entries()),
      };
      
      await AsyncStorage.setItem(EnergyMonitorAdapter.STORAGE_KEY, JSON.stringify(data));
    } catch (error) {
      console.error('Error persisting monitor data:', error);
    }
  }
} 