import AsyncStorage from '@react-native-async-storage/async-storage';
import { EventEmitter } from 'events';
import { BLEManager } from '../protocols/BLEManager';
import { DeviceType, SmartHomeDevice } from '../SmartHomeService';

/**
 * Interface for appliance schedule
 */
export interface ApplianceSchedule {
  id: string;
  enabled: boolean;
  days: number[]; // 0-6 (Sunday to Saturday)
  startTime: string; // HH:MM format
  endTime: string; // HH:MM format
  mode?: string;
  createdAt: number;
}

/**
 * Interface for energy consumption data
 */
export interface EnergyUsage {
  timestamp: number;
  power: number; // in watts
  energyUsed: number; // in kWh
  duration: number; // in minutes
  mode?: string;
}

/**
 * Interface for appliance status
 */
export interface ApplianceStatus {
  deviceId: string;
  isOn: boolean;
  currentMode?: string;
  currentPower: number;
  temperature?: number;
  remainingTime?: number; // in minutes
  errorCode?: string;
  lastUpdated: number;
}

/**
 * Supported appliance types
 */
export enum ApplianceType {
  REFRIGERATOR = 'refrigerator',
  WASHING_MACHINE = 'washing_machine',
  DRYER = 'dryer',
  DISHWASHER = 'dishwasher',
  OVEN = 'oven',
  MICROWAVE = 'microwave',
  AIR_CONDITIONER = 'air_conditioner',
  WATER_HEATER = 'water_heater',
  OTHER = 'other'
}

/**
 * Adapter for integrating with smart appliances
 */
export class SmartApplianceAdapter extends EventEmitter {
  private static readonly STORAGE_KEY = '@ecocart:smart_appliance_data';
  private initialized = false;
  private connectedAppliances = new Set<string>();
  private applianceStatuses = new Map<string, ApplianceStatus>();
  private schedules = new Map<string, ApplianceSchedule[]>();
  private energyHistory = new Map<string, EnergyUsage[]>();
  private applianceTypes = new Map<string, ApplianceType>();
  
  /**
   * Create a new SmartApplianceAdapter
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
      const data = await AsyncStorage.getItem(SmartApplianceAdapter.STORAGE_KEY);
      
      if (data) {
        const parsedData = JSON.parse(data);
        
        // Restore appliance statuses
        if (parsedData.statuses) {
          Object.entries(parsedData.statuses).forEach(([deviceId, status]) => {
            this.applianceStatuses.set(deviceId, status as ApplianceStatus);
          });
        }
        
        // Restore schedules
        if (parsedData.schedules) {
          Object.entries(parsedData.schedules).forEach(([deviceId, scheduleList]) => {
            this.schedules.set(deviceId, scheduleList as ApplianceSchedule[]);
          });
        }
        
        // Restore energy history
        if (parsedData.energyHistory) {
          Object.entries(parsedData.energyHistory).forEach(([deviceId, history]) => {
            this.energyHistory.set(deviceId, history as EnergyUsage[]);
          });
        }
        
        // Restore appliance types
        if (parsedData.applianceTypes) {
          Object.entries(parsedData.applianceTypes).forEach(([deviceId, type]) => {
            this.applianceTypes.set(deviceId, type as ApplianceType);
          });
        }
      }
      
      this.initialized = true;
      console.log(`Initialized SmartApplianceAdapter with ${this.applianceStatuses.size} stored appliances`);
    } catch (error) {
      console.error('Error initializing SmartApplianceAdapter:', error);
    }
  }
  
  /**
   * Check if a discovered device is a supported smart appliance
   */
  isSupportedAppliance(device: { id: string; serviceUUIDs?: string[] }): boolean {
    if (!device.serviceUUIDs || device.serviceUUIDs.length === 0) {
      return false;
    }
    
    // Check for known smart appliance service UUIDs
    return device.serviceUUIDs.some(uuid => uuid.includes('bb00'));
  }
  
  /**
   * Get the appliance type based on service UUIDs
   */
  detectApplianceType(device: { id: string; serviceUUIDs?: string[] }): ApplianceType | null {
    if (!device.serviceUUIDs || device.serviceUUIDs.length === 0) {
      return null;
    }
    
    // Try to determine appliance type from service UUIDs
    // (In a real implementation, this would match specific UUIDs to appliance types)
    for (const uuid of device.serviceUUIDs) {
      if (uuid.includes('bb01')) return ApplianceType.REFRIGERATOR;
      if (uuid.includes('bb02')) return ApplianceType.WASHING_MACHINE;
      if (uuid.includes('bb03')) return ApplianceType.DRYER;
      if (uuid.includes('bb04')) return ApplianceType.DISHWASHER;
      if (uuid.includes('bb05')) return ApplianceType.OVEN;
      if (uuid.includes('bb06')) return ApplianceType.MICROWAVE;
      if (uuid.includes('bb07')) return ApplianceType.AIR_CONDITIONER;
      if (uuid.includes('bb08')) return ApplianceType.WATER_HEATER;
    }
    
    return ApplianceType.OTHER;
  }
  
  /**
   * Connect to a smart appliance
   */
  async connectToAppliance(device: SmartHomeDevice): Promise<boolean> {
    try {
      // Ensure the adapter is initialized
      if (!this.initialized) {
        await this.initialize();
      }
      
      // Connect to the device
      const connected = await this.bleManager.connect(device.id);
      
      if (connected) {
        this.connectedAppliances.add(device.id);
        
        // Detect appliance type if not already known
        if (!this.applianceTypes.has(device.id)) {
          const type = this.detectApplianceType(device);
          if (type) {
            this.applianceTypes.set(device.id, type);
          }
        }
        
        // Initialize status if needed
        if (!this.applianceStatuses.has(device.id)) {
          this.applianceStatuses.set(device.id, {
            deviceId: device.id,
            isOn: false,
            currentPower: 0,
            lastUpdated: Date.now()
          });
        }
        
        // Read initial data from appliance
        await this.readApplianceData(device.id);
        
        // Persist data
        this.persistData();
        
        // Notify listeners
        this.emit('applianceConnected', {
          ...device,
          type: this.applianceTypes.get(device.id) || ApplianceType.OTHER
        });
        
        return true;
      }
      
      return false;
    } catch (error) {
      console.error(`Error connecting to appliance ${device.id}:`, error);
      return false;
    }
  }
  
  /**
   * Disconnect from a smart appliance
   */
  async disconnectFromAppliance(deviceId: string): Promise<boolean> {
    try {
      const disconnected = await this.bleManager.disconnect(deviceId);
      
      if (disconnected) {
        this.connectedAppliances.delete(deviceId);
        
        // Persist data before disconnecting
        this.persistData();
        
        // Notify listeners
        this.emit('applianceDisconnected', deviceId);
        
        return true;
      }
      
      return false;
    } catch (error) {
      console.error(`Error disconnecting from appliance ${deviceId}:`, error);
      return false;
    }
  }
  
  /**
   * Turn an appliance on or off
   */
  async setAppliancePower(deviceId: string, turnOn: boolean): Promise<boolean> {
    try {
      if (!this.connectedAppliances.has(deviceId)) {
        return false;
      }
      
      // Get the current status
      const status = this.applianceStatuses.get(deviceId);
      if (!status) {
        return false;
      }
      
      // Only send command if state is changing
      if (status.isOn !== turnOn) {
        // Create power command
        const powerCommand = new Uint8Array([turnOn ? 1 : 0]);
        
        // Send command to appliance
        // (In a real implementation, this would use the appropriate service/characteristic UUIDs)
        const result = await this.bleManager.writeCharacteristic(
          deviceId,
          '0000bb00-0000-1000-8000-00805f9b34fb',
          '0000bb01-0000-1000-8000-00805f9b34fb',
          powerCommand
        );
        
        if (result) {
          // Update local state
          status.isOn = turnOn;
          status.lastUpdated = Date.now();
          
          // If turning off, set power to 0
          if (!turnOn) {
            status.currentPower = 0;
          }
          
          // Persist data
          this.persistData();
          
          // Notify listeners
          this.emit('applianceStatusChanged', {
            deviceId,
            status: { ...status }
          });
          
          return true;
        }
      } else {
        // Already in desired state
        return true;
      }
      
      return false;
    } catch (error) {
      console.error(`Error setting appliance power for ${deviceId}:`, error);
      return false;
    }
  }
  
  /**
   * Set the operation mode of an appliance
   */
  async setApplianceMode(deviceId: string, mode: string): Promise<boolean> {
    try {
      if (!this.connectedAppliances.has(deviceId)) {
        return false;
      }
      
      // Get the current status
      const status = this.applianceStatuses.get(deviceId);
      if (!status) {
        return false;
      }
      
      // Encode mode as a string
      const encoder = new TextEncoder();
      const modeData = encoder.encode(mode);
      
      // Send mode command to appliance
      const result = await this.bleManager.writeCharacteristic(
        deviceId,
        '0000bb00-0000-1000-8000-00805f9b34fb',
        '0000bb02-0000-1000-8000-00805f9b34fb',
        modeData
      );
      
      if (result) {
        // Update local state
        status.currentMode = mode;
        status.lastUpdated = Date.now();
        
        // Persist data
        this.persistData();
        
        // Notify listeners
        this.emit('applianceStatusChanged', {
          deviceId,
          status: { ...status }
        });
        
        return true;
      }
      
      return false;
    } catch (error) {
      console.error(`Error setting appliance mode for ${deviceId}:`, error);
      return false;
    }
  }
  
  /**
   * Set temperature for temperature-controlled appliances
   */
  async setApplianceTemperature(deviceId: string, temperature: number): Promise<boolean> {
    try {
      if (!this.connectedAppliances.has(deviceId)) {
        return false;
      }
      
      const status = this.applianceStatuses.get(deviceId);
      if (!status) {
        return false;
      }
      
      // Convert temperature to buffer
      const tempData = new Uint8Array([Math.round(temperature)]);
      
      // Send temperature command to appliance
      const result = await this.bleManager.writeCharacteristic(
        deviceId,
        '0000bb00-0000-1000-8000-00805f9b34fb',
        '0000bb03-0000-1000-8000-00805f9b34fb',
        tempData
      );
      
      if (result) {
        // Update local state
        status.temperature = temperature;
        status.lastUpdated = Date.now();
        
        // Persist data
        this.persistData();
        
        // Notify listeners
        this.emit('applianceStatusChanged', {
          deviceId,
          status: { ...status }
        });
        
        return true;
      }
      
      return false;
    } catch (error) {
      console.error(`Error setting appliance temperature for ${deviceId}:`, error);
      return false;
    }
  }
  
  /**
   * Add a schedule for an appliance
   */
  async addApplianceSchedule(
    deviceId: string, 
    schedule: Omit<ApplianceSchedule, 'id' | 'createdAt'>
  ): Promise<string | null> {
    try {
      // Create a new schedule with ID and timestamp
      const newSchedule: ApplianceSchedule = {
        ...schedule,
        id: `schedule_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`,
        createdAt: Date.now()
      };
      
      // Get current schedules for this device
      const deviceSchedules = this.schedules.get(deviceId) || [];
      
      // Add new schedule
      deviceSchedules.push(newSchedule);
      this.schedules.set(deviceId, deviceSchedules);
      
      // Persist data
      this.persistData();
      
      // If connected, send schedule to device
      if (this.connectedAppliances.has(deviceId)) {
        await this.syncSchedulesToDevice(deviceId);
      }
      
      // Notify listeners
      this.emit('scheduleAdded', {
        deviceId,
        scheduleId: newSchedule.id
      });
      
      return newSchedule.id;
    } catch (error) {
      console.error(`Error adding schedule for ${deviceId}:`, error);
      return null;
    }
  }
  
  /**
   * Update an existing schedule
   */
  async updateApplianceSchedule(
    deviceId: string,
    scheduleId: string,
    updates: Partial<Omit<ApplianceSchedule, 'id' | 'createdAt'>>
  ): Promise<boolean> {
    try {
      // Get current schedules for this device
      const deviceSchedules = this.schedules.get(deviceId) || [];
      
      // Find the schedule to update
      const scheduleIndex = deviceSchedules.findIndex(s => s.id === scheduleId);
      if (scheduleIndex === -1) {
        return false;
      }
      
      // Update the schedule
      deviceSchedules[scheduleIndex] = {
        ...deviceSchedules[scheduleIndex],
        ...updates
      };
      
      // Save updated schedules
      this.schedules.set(deviceId, deviceSchedules);
      
      // Persist data
      this.persistData();
      
      // If connected, send schedule to device
      if (this.connectedAppliances.has(deviceId)) {
        await this.syncSchedulesToDevice(deviceId);
      }
      
      // Notify listeners
      this.emit('scheduleUpdated', {
        deviceId,
        scheduleId
      });
      
      return true;
    } catch (error) {
      console.error(`Error updating schedule ${scheduleId} for ${deviceId}:`, error);
      return false;
    }
  }
  
  /**
   * Delete an appliance schedule
   */
  async deleteApplianceSchedule(deviceId: string, scheduleId: string): Promise<boolean> {
    try {
      // Get current schedules for this device
      const deviceSchedules = this.schedules.get(deviceId) || [];
      
      // Filter out the schedule to delete
      const updatedSchedules = deviceSchedules.filter(s => s.id !== scheduleId);
      
      // If no schedule was removed, return false
      if (updatedSchedules.length === deviceSchedules.length) {
        return false;
      }
      
      // Save updated schedules
      this.schedules.set(deviceId, updatedSchedules);
      
      // Persist data
      this.persistData();
      
      // If connected, sync schedules to device
      if (this.connectedAppliances.has(deviceId)) {
        await this.syncSchedulesToDevice(deviceId);
      }
      
      // Notify listeners
      this.emit('scheduleDeleted', {
        deviceId,
        scheduleId
      });
      
      return true;
    } catch (error) {
      console.error(`Error deleting schedule ${scheduleId} for ${deviceId}:`, error);
      return false;
    }
  }
  
  /**
   * Get all schedules for an appliance
   */
  getApplianceSchedules(deviceId: string): ApplianceSchedule[] {
    return this.schedules.get(deviceId) || [];
  }
  
  /**
   * Get the current status of an appliance
   */
  getApplianceStatus(deviceId: string): ApplianceStatus | null {
    return this.applianceStatuses.get(deviceId) || null;
  }
  
  /**
   * Get energy usage history for an appliance
   */
  getEnergyUsageHistory(deviceId: string): EnergyUsage[] {
    return this.energyHistory.get(deviceId) || [];
  }
  
  /**
   * Get the type of an appliance
   */
  getApplianceType(deviceId: string): ApplianceType | null {
    return this.applianceTypes.get(deviceId) || null;
  }
  
  /**
   * Get energy efficiency tips for an appliance
   */
  getEfficiencyTips(deviceId: string): string[] {
    const applianceType = this.applianceTypes.get(deviceId);
    if (!applianceType) {
      return [];
    }
    
    const status = this.applianceStatuses.get(deviceId);
    const usageHistory = this.energyHistory.get(deviceId) || [];
    const tips: string[] = [];
    
    // Get appliance-specific tips
    switch (applianceType) {
      case ApplianceType.REFRIGERATOR:
        tips.push('Keep your refrigerator at 38°F (3°C) for optimal efficiency.');
        tips.push('Ensure the refrigerator door seals are tight.');
        tips.push('Keep the refrigerator full but not overcrowded to maintain efficiency.');
        break;
        
      case ApplianceType.WASHING_MACHINE:
        tips.push('Wash full loads to maximize efficiency.');
        tips.push('Use cold water when possible to save energy.');
        tips.push('Choose eco mode for routine washing.');
        break;
        
      case ApplianceType.DRYER:
        tips.push('Clean the lint filter before each load to improve efficiency.');
        tips.push('Use sensor drying instead of timed drying to avoid over-drying.');
        tips.push('Consider air-drying clothes when weather permits.');
        break;
        
      case ApplianceType.DISHWASHER:
        tips.push('Run the dishwasher only when full.');
        tips.push('Use eco mode for daily washing.');
        tips.push('Avoid pre-rinsing dishes to save water and energy.');
        break;
        
      case ApplianceType.AIR_CONDITIONER:
        tips.push('Set your AC to 78°F (26°C) when home and higher when away.');
        tips.push('Clean or replace filters regularly.');
        tips.push('Use a programmable thermostat to reduce usage when not needed.');
        break;
    }
    
    // Add usage-based tips
    if (status && usageHistory.length > 0) {
      // Check for high power consumption
      const avgPower = usageHistory.reduce((sum, usage) => sum + usage.power, 0) / usageHistory.length;
      
      if (avgPower > 500) {
        tips.push('Your appliance is using more energy than expected. Consider checking for maintenance issues.');
      }
      
      // Check usage patterns
      const totalUsageToday = usageHistory
        .filter(u => isToday(new Date(u.timestamp)))
        .reduce((sum, usage) => sum + usage.energyUsed, 0);
      
      if (totalUsageToday > 5) { // 5 kWh threshold example
        tips.push('Your energy usage today is higher than average. Consider adjusting settings or usage patterns.');
      }
    }
    
    return tips;
  }
  
  /**
   * Handle device connected event
   */
  private handleDeviceConnected(device: any): void {
    // Check if it's a supported appliance
    if (this.isSupportedAppliance(device)) {
      const applianceType = this.detectApplianceType(device);
      
      this.emit('applianceDiscovered', {
        id: device.id,
        name: device.name || `Smart Appliance ${device.id.substring(0, 4)}`,
        type: DeviceType.SMART_APPLIANCE,
        applianceType: applianceType || ApplianceType.OTHER,
        metadata: { serviceUUIDs: device.serviceUUIDs }
      });
    }
  }
  
  /**
   * Handle device disconnected event
   */
  private handleDeviceDisconnected(deviceId: string): void {
    if (this.connectedAppliances.has(deviceId)) {
      this.connectedAppliances.delete(deviceId);
      this.emit('applianceDisconnected', deviceId);
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
  }): void {
    if (!this.connectedAppliances.has(data.deviceId)) {
      return;
    }
    
    // Get current status or create a new one
    let status = this.applianceStatuses.get(data.deviceId);
    if (!status) {
      status = {
        deviceId: data.deviceId,
        isOn: false,
        currentPower: 0,
        lastUpdated: Date.now()
      };
    }
    
    // Update status based on received data
    if (data.characteristicUUID.includes('bb01')) { // Power state
      const newPowerState = data.value[0] === 1;
      status.isOn = newPowerState;
      
      // Emit power state changed event
      this.emit('appliancePowerChanged', {
        deviceId: data.deviceId,
        isOn: newPowerState
      });
    } 
    else if (data.characteristicUUID.includes('bb02')) { // Mode
      const decoder = new TextDecoder();
      const newMode = decoder.decode(data.value);
      status.currentMode = newMode;
      
      // Emit mode changed event
      this.emit('applianceModeChanged', {
        deviceId: data.deviceId,
        mode: newMode
      });
    }
    else if (data.characteristicUUID.includes('bb03')) { // Temperature
      status.temperature = data.value[0];
      
      // Emit temperature changed event
      this.emit('applianceTemperatureChanged', {
        deviceId: data.deviceId,
        temperature: status.temperature
      });
    }
    else if (data.characteristicUUID.includes('bb04')) { // Current power
      const powerValue = (data.value[0] << 8) + data.value[1]; // 16-bit value
      status.currentPower = powerValue;
      
      // Add to energy history if power > 0
      if (powerValue > 0) {
        this.addEnergyUsageData(data.deviceId, powerValue);
      }
      
      // Emit power usage changed event
      this.emit('appliancePowerUsageChanged', {
        deviceId: data.deviceId,
        power: powerValue
      });
    }
    else if (data.characteristicUUID.includes('bb05')) { // Remaining time
      const remainingMinutes = (data.value[0] << 8) + data.value[1]; // 16-bit value
      status.remainingTime = remainingMinutes;
      
      // Emit remaining time changed event
      this.emit('applianceRemainingTimeChanged', {
        deviceId: data.deviceId,
        remainingTime: remainingMinutes
      });
    }
    else if (data.characteristicUUID.includes('bb06')) { // Error code
      const decoder = new TextDecoder();
      const errorCode = decoder.decode(data.value);
      status.errorCode = errorCode;
      
      // Emit error code event
      this.emit('applianceErrorOccurred', {
        deviceId: data.deviceId,
        errorCode
      });
    }
    
    // Update timestamp
    status.lastUpdated = Date.now();
    
    // Store updated status
    this.applianceStatuses.set(data.deviceId, status);
    
    // Persist data
    this.persistData();
  }
  
  /**
   * Add energy usage data point
   */
  private addEnergyUsageData(deviceId: string, power: number): void {
    // Get current history or create new array
    const history = this.energyHistory.get(deviceId) || [];
    
    // Calculate energy used since last reading
    let energyUsed = 0;
    let duration = 0;
    
    if (history.length > 0) {
      const lastReading = history[history.length - 1];
      const timeDiff = Date.now() - lastReading.timestamp; // ms
      duration = timeDiff / (1000 * 60); // convert to minutes
      
      // Average power between readings * time in hours = energy in kWh
      const avgPower = (power + lastReading.power) / 2;
      energyUsed = (avgPower / 1000) * (duration / 60); // convert to kWh
    }
    
    // Create new usage data point
    const newUsage: EnergyUsage = {
      timestamp: Date.now(),
      power,
      energyUsed,
      duration,
      mode: this.applianceStatuses.get(deviceId)?.currentMode
    };
    
    // Add to history
    history.push(newUsage);
    
    // Limit history size (keep last 100 readings)
    if (history.length > 100) {
      history.shift();
    }
    
    // Store updated history
    this.energyHistory.set(deviceId, history);
  }
  
  /**
   * Read all available data from an appliance
   */
  private async readApplianceData(deviceId: string): Promise<void> {
    try {
      // The service UUID for smart appliances
      const serviceUUID = '0000bb00-0000-1000-8000-00805f9b34fb';
      
      // Read power state
      try {
        const powerData = await this.bleManager.readCharacteristic(
          deviceId,
          serviceUUID,
          '0000bb01-0000-1000-8000-00805f9b34fb'
        );
        
        const status = this.applianceStatuses.get(deviceId) || {
          deviceId,
          isOn: false,
          currentPower: 0,
          lastUpdated: Date.now()
        };
        
        status.isOn = powerData[0] === 1;
        this.applianceStatuses.set(deviceId, status);
      } catch (error) {
        console.log(`Could not read power state for ${deviceId}`);
      }
      
      // Read mode
      try {
        const modeData = await this.bleManager.readCharacteristic(
          deviceId,
          serviceUUID,
          '0000bb02-0000-1000-8000-00805f9b34fb'
        );
        
        const decoder = new TextDecoder();
        const mode = decoder.decode(modeData);
        
        const status = this.applianceStatuses.get(deviceId);
        if (status) {
          status.currentMode = mode;
          this.applianceStatuses.set(deviceId, status);
        }
      } catch (error) {
        console.log(`Could not read mode for ${deviceId}`);
      }
      
      // Read temperature
      try {
        const tempData = await this.bleManager.readCharacteristic(
          deviceId,
          serviceUUID,
          '0000bb03-0000-1000-8000-00805f9b34fb'
        );
        
        const status = this.applianceStatuses.get(deviceId);
        if (status) {
          status.temperature = tempData[0];
          this.applianceStatuses.set(deviceId, status);
        }
      } catch (error) {
        console.log(`Could not read temperature for ${deviceId}`);
      }
      
      // Read power usage
      try {
        const powerData = await this.bleManager.readCharacteristic(
          deviceId,
          serviceUUID,
          '0000bb04-0000-1000-8000-00805f9b34fb'
        );
        
        const powerValue = (powerData[0] << 8) + powerData[1];
        
        const status = this.applianceStatuses.get(deviceId);
        if (status) {
          status.currentPower = powerValue;
          this.applianceStatuses.set(deviceId, status);
        }
        
        // Add to energy history if power > 0
        if (powerValue > 0) {
          this.addEnergyUsageData(deviceId, powerValue);
        }
      } catch (error) {
        console.log(`Could not read power usage for ${deviceId}`);
      }
      
    } catch (error) {
      console.error(`Error reading appliance data for ${deviceId}:`, error);
    }
  }
  
  /**
   * Sync schedules to a device
   */
  private async syncSchedulesToDevice(deviceId: string): Promise<boolean> {
    try {
      const schedules = this.schedules.get(deviceId) || [];
      
      // Convert schedules to a compact format for BLE transmission
      // This is a simplified example - real implementations would need a more
      // space-efficient binary format for sending multiple schedules
      
      for (const schedule of schedules) {
        if (schedule.enabled) {
          // Encode schedule as binary data
          // Format: [enabled, days bitmap, start hour, start minute, end hour, end minute]
          const startParts = schedule.startTime.split(':').map(Number);
          const endParts = schedule.endTime.split(':').map(Number);
          
          // Create a bitmap for days (bit 0 = Sunday, bit 1 = Monday, etc)
          let daysBitmap = 0;
          for (const day of schedule.days) {
            daysBitmap |= (1 << day);
          }
          
          const scheduleData = new Uint8Array([
            1, // enabled
            daysBitmap,
            startParts[0], // start hour
            startParts[1], // start minute
            endParts[0],   // end hour
            endParts[1]    // end minute
          ]);
          
          // Send schedule to device
          await this.bleManager.writeCharacteristic(
            deviceId,
            '0000bb00-0000-1000-8000-00805f9b34fb',
            '0000bb07-0000-1000-8000-00805f9b34fb',
            scheduleData
          );
        }
      }
      
      return true;
    } catch (error) {
      console.error(`Error syncing schedules to device ${deviceId}:`, error);
      return false;
    }
  }
  
  /**
   * Persist all data to storage
   */
  private async persistData(): Promise<void> {
    try {
      const data = {
        statuses: Object.fromEntries(this.applianceStatuses.entries()),
        schedules: Object.fromEntries(this.schedules.entries()),
        energyHistory: Object.fromEntries(this.energyHistory.entries()),
        applianceTypes: Object.fromEntries(this.applianceTypes.entries())
      };
      
      await AsyncStorage.setItem(SmartApplianceAdapter.STORAGE_KEY, JSON.stringify(data));
    } catch (error) {
      console.error('Error persisting appliance data:', error);
    }
  }
}

/**
 * Helper function to check if a date is today
 */
function isToday(date: Date): boolean {
  const today = new Date();
  return date.getDate() === today.getDate() &&
    date.getMonth() === today.getMonth() &&
    date.getFullYear() === today.getFullYear();
} 