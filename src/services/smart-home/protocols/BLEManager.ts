/**
 * BLEManager.ts
 * 
 * Handles Bluetooth Low Energy connections to smart devices.
 * Uses react-native-ble-plx for cross-platform BLE connectivity.
 */

import { EventEmitter } from 'events';
import { PermissionsAndroid, Platform } from 'react-native';
import { BleManager } from 'react-native-ble-plx';

import {
    ConnectionStatus,
    ConnectionType,
    DeviceCapability,
    DeviceDataResult,
    DeviceDiscoveryResult,
    DeviceType
} from '../SmartHomeService';

/**
 * Interface for discovered BLE devices
 */
export interface DiscoveredDevice {
  id: string;
  name?: string;
  rssi?: number;
  manufacturerData?: string;
  serviceUUIDs?: string[];
  localName?: string;
  isConnectable?: boolean;
  lastSeen: number;
}

/**
 * Handles Bluetooth Low Energy device scanning and connections
 */
export class BLEManager extends EventEmitter {
  private bleManager: BleManager;
  private isScanning: boolean = false;
  private discoveredDevices: Map<string, DiscoveredDevice> = new Map();
  private connectedDevices: Map<string, any> = new Map();
  private scanTimeout: NodeJS.Timeout | null = null;
  private isInitialized: boolean = false;
  
  // Constants
  private static SCAN_TIMEOUT_MS = 30000; // 30 seconds
  private static RECONNECT_ATTEMPTS = 3;
  
  // Device recognition data
  private deviceProfiles: Map<string, DeviceType> = new Map();
  
  constructor() {
    super();
    this.bleManager = new BleManager();
    
    // Initialize device profiles for recognition
    this.initializeDeviceProfiles();
  }
  
  /**
   * Initialize the BLE manager
   */
  public async initialize(): Promise<boolean> {
    if (this.isInitialized) {
      return true;
    }
    
    try {
      // Request permissions if on Android
      if (Platform.OS === 'android') {
        const granted = await this.requestAndroidPermissions();
        if (!granted) {
          console.error('[BLEManager] Permission denied');
          return false;
        }
      }
      
      // Subscribe to state changes
      this.bleManager.onStateChange((state) => {
        console.log('[BLEManager] Bluetooth state:', state);
        if (state === 'PoweredOn') {
          this.emit('stateChanged', { state: 'powered_on' });
        } else if (state === 'PoweredOff') {
          this.emit('stateChanged', { state: 'powered_off' });
        }
      }, true);
      
      this.isInitialized = true;
      return true;
    } catch (error) {
      console.error('[BLEManager] Initialization error:', error);
      return false;
    }
  }
  
  /**
   * Check if BLE is supported on this device
   */
  public isSupported(): boolean {
    // Add more checks as needed
    return true;
  }
  
  /**
   * Start scanning for devices
   */
  public async startScan(): Promise<boolean> {
    if (this.isScanning) {
      return true;
    }
    
    try {
      // Clear discovered devices cache
      this.discoveredDevices.clear();
      
      // Start scanning
      this.isScanning = true;
      this.emit('scanStarted', {});
      
      // Set timeout to stop scanning after a period
      this.scanTimeout = setTimeout(() => {
        this.stopScan();
      }, BLEManager.SCAN_TIMEOUT_MS);
      
      // Start scanning
      this.bleManager.startDeviceScan(
        null, // All services
        { allowDuplicates: true },
        (error, device) => {
          if (error) {
            console.error('[BLEManager] Scan error:', error);
            this.emit('scanError', { error: error.message });
            return;
          }
          
          if (device) {
            this.handleDiscoveredDevice(device);
          }
        }
      );
      
      return true;
    } catch (error) {
      console.error('[BLEManager] Start scan error:', error);
      this.isScanning = false;
      return false;
    }
  }
  
  /**
   * Stop scanning for devices
   */
  public async stopScan(): Promise<boolean> {
    if (!this.isScanning) {
      return true;
    }
    
    try {
      // Clear scan timeout if exists
      if (this.scanTimeout) {
        clearTimeout(this.scanTimeout);
        this.scanTimeout = null;
      }
      
      // Stop the scan
      this.bleManager.stopDeviceScan();
      this.isScanning = false;
      this.emit('scanStopped', {});
      
      return true;
    } catch (error) {
      console.error('[BLEManager] Stop scan error:', error);
      return false;
    }
  }
  
  /**
   * Connect to a BLE device
   * @param deviceId Device identifier
   * @returns Promise resolving to true if connection successful
   */
  public async connect(deviceId: string): Promise<boolean> {
    try {
      console.log(`Connecting to device: ${deviceId}`);
      // Implementation would use the underlying BLE library to connect
      
      // Emit connected event
      this.emit('deviceConnected', { id: deviceId });
      
      return true;
    } catch (error) {
      console.error(`Error connecting to device ${deviceId}:`, error);
      return false;
    }
  }

  /**
   * Disconnect from a BLE device
   * @param deviceId Device identifier
   * @returns Promise resolving to true if disconnection successful
   */
  public async disconnect(deviceId: string): Promise<boolean> {
    try {
      console.log(`Disconnecting from device: ${deviceId}`);
      // Implementation would use the underlying BLE library to disconnect
      
      // Emit disconnected event
      this.emit('deviceDisconnected', deviceId);
      
      return true;
    } catch (error) {
      console.error(`Error disconnecting from device ${deviceId}:`, error);
      return false;
    }
  }

  /**
   * Read a characteristic from a BLE device
   * @param deviceId Device identifier
   * @param serviceUUID Service UUID
   * @param characteristicUUID Characteristic UUID
   * @returns Promise resolving to the characteristic value
   */
  public async readCharacteristic(
    deviceId: string,
    serviceUUID: string,
    characteristicUUID: string
  ): Promise<any> {
    try {
      console.log(`Reading characteristic ${characteristicUUID} from device ${deviceId}`);
      // Implementation would use the underlying BLE library to read the characteristic
      
      // Mock data for testing
      return new Uint8Array([0, 0]);
    } catch (error) {
      console.error(`Error reading characteristic ${characteristicUUID} from device ${deviceId}:`, error);
      throw error;
    }
  }

  /**
   * Write a characteristic to a BLE device
   * @param deviceId Device identifier
   * @param serviceUUID Service UUID
   * @param characteristicUUID Characteristic UUID
   * @param data Data to write
   * @returns Promise resolving to true if write successful
   */
  public async writeCharacteristic(
    deviceId: string,
    serviceUUID: string,
    characteristicUUID: string,
    data: any
  ): Promise<boolean> {
    try {
      console.log(`Writing characteristic ${characteristicUUID} to device ${deviceId}`);
      // Implementation would use the underlying BLE library to write the characteristic
      
      return true;
    } catch (error) {
      console.error(`Error writing characteristic ${characteristicUUID} to device ${deviceId}:`, error);
      return false;
    }
  }
  
  /**
   * Read data from a device
   */
  public async readDeviceData<T>(deviceId: string, dataType: string): Promise<DeviceDataResult<T>> {
    const device = this.connectedDevices.get(deviceId);
    if (!device) {
      return { success: false, error: 'Device not connected' };
    }
    
    try {
      // Determine which characteristic to read based on data type
      const { serviceUUID, characteristicUUID } = this.getCharacteristicForDataType(dataType);
      
      if (!serviceUUID || !characteristicUUID) {
        return { success: false, error: 'Unsupported data type' };
      }
      
      // Read characteristic
      const characteristic = await device.readCharacteristicForService(
        serviceUUID,
        characteristicUUID
      );
      
      // Parse data based on type
      const data = this.parseCharacteristicData(characteristic, dataType) as T;
      
      return {
        success: true,
        data,
        timestamp: Date.now()
      };
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      console.error('[BLEManager] Read data error:', errorMessage);
      return { success: false, error: errorMessage };
    }
  }
  
  /**
   * Send a command to a device
   */
  public async sendCommand(deviceId: string, command: string, params?: any): Promise<boolean> {
    const device = this.connectedDevices.get(deviceId);
    if (!device) {
      return false;
    }
    
    try {
      // Determine which characteristic to write based on command
      const { serviceUUID, characteristicUUID } = this.getCharacteristicForCommand(command);
      
      if (!serviceUUID || !characteristicUUID) {
        return false;
      }
      
      // Format the command data
      const data = this.formatCommandData(command, params);
      
      // Write to characteristic
      await device.writeCharacteristicWithResponseForService(
        serviceUUID,
        characteristicUUID,
        data
      );
      
      return true;
    } catch (error) {
      console.error('[BLEManager] Send command error:', error);
      return false;
    }
  }
  
  /**
   * Request Android BLE permissions
   */
  private async requestAndroidPermissions(): Promise<boolean> {
    if (Platform.OS !== 'android') {
      return true;
    }
    
    try {
      // For Android 12+ (API 31+)
      if (Platform.Version >= 31) {
        const fineLocationGranted = await PermissionsAndroid.request(
          PermissionsAndroid.PERMISSIONS.ACCESS_FINE_LOCATION,
          {
            title: 'Location Permission',
            message: 'EcoCart needs access to your location for Bluetooth scanning.',
            buttonNeutral: 'Ask Me Later',
            buttonNegative: 'Cancel',
            buttonPositive: 'OK'
          }
        );
        
        const bluetoothScanGranted = await PermissionsAndroid.request(
          'android.permission.BLUETOOTH_SCAN',
          {
            title: 'Bluetooth Scan Permission',
            message: 'EcoCart needs to scan for Bluetooth devices.',
            buttonNeutral: 'Ask Me Later',
            buttonNegative: 'Cancel',
            buttonPositive: 'OK'
          }
        );
        
        const bluetoothConnectGranted = await PermissionsAndroid.request(
          'android.permission.BLUETOOTH_CONNECT',
          {
            title: 'Bluetooth Connect Permission',
            message: 'EcoCart needs to connect to Bluetooth devices.',
            buttonNeutral: 'Ask Me Later',
            buttonNegative: 'Cancel',
            buttonPositive: 'OK'
          }
        );
        
        return (
          fineLocationGranted === PermissionsAndroid.RESULTS.GRANTED &&
          bluetoothScanGranted === PermissionsAndroid.RESULTS.GRANTED &&
          bluetoothConnectGranted === PermissionsAndroid.RESULTS.GRANTED
        );
      } else {
        // For Android < 12
        const granted = await PermissionsAndroid.request(
          PermissionsAndroid.PERMISSIONS.ACCESS_FINE_LOCATION,
          {
            title: 'Location Permission',
            message: 'EcoCart needs access to your location for Bluetooth scanning.',
            buttonNeutral: 'Ask Me Later',
            buttonNegative: 'Cancel',
            buttonPositive: 'OK'
          }
        );
        
        return granted === PermissionsAndroid.RESULTS.GRANTED;
      }
    } catch (error) {
      console.error('[BLEManager] Permission request error:', error);
      return false;
    }
  }
  
  /**
   * Handle a discovered device
   */
  private handleDiscoveredDevice(device: any): void {
    // Skip devices without ID or with empty name
    if (!device.id || (!device.name && !device.localName)) {
      return;
    }
    
    // Determine if this device is compatible with EcoCart
    const isCompatible = this.isDeviceCompatible(device);
    
    // Create or update device in the cache
    const existingDevice = this.discoveredDevices.get(device.id);
    const deviceData: DiscoveredDevice = {
      id: device.id,
      name: device.name || device.localName || 'Unknown',
      rssi: device.rssi || -100,
      manufacturerData: device.manufacturerData,
      serviceUUIDs: device.serviceUUIDs,
      localName: device.localName,
      isConnectable: device.isConnectable !== false, // Default to true if not specified
      lastSeen: Date.now()
    };
    
    // Only emit discovery event if this is a new device or significant change
    const isNewDevice = !existingDevice;
    const isUpdatedDevice = existingDevice && (
      existingDevice.name !== deviceData.name ||
      Math.abs(existingDevice.rssi - deviceData.rssi) > 10
    );
    
    this.discoveredDevices.set(device.id, deviceData);
    
    if (isNewDevice || isUpdatedDevice) {
      // Determine device type based on profiles
      const deviceType = this.determineDeviceType(device);
      
      const discoveryResult: DeviceDiscoveryResult = {
        id: device.id,
        name: deviceData.name,
        type: deviceType,
        connectionType: ConnectionType.BLE,
        manufacturer: device.manufacturerData ? this.decodeManufacturerData(device.manufacturerData) : undefined,
        rssi: device.rssi,
        isConnectable: deviceData.isConnectable,
        isCompatible,
        metadata: {
          serviceUUIDs: device.serviceUUIDs,
          localName: device.localName
        }
      };
      
      this.emit('deviceDiscovered', discoveryResult);
    }
  }
  
  /**
   * Handle device disconnection
   */
  private handleDeviceDisconnected(deviceId: string, error?: Error): void {
    console.log('[BLEManager] Device disconnected:', deviceId);
    
    // Remove from connected devices
    this.connectedDevices.delete(deviceId);
    
    // Emit disconnection event
    this.emit('connectionStatusChanged', { 
      deviceId, 
      status: ConnectionStatus.DISCONNECTED,
      error: error?.message
    });
  }
  
  /**
   * Initialize device profiles for recognition
   */
  private initializeDeviceProfiles(): void {
    // Add known smart bin manufacturers or service UUIDs
    this.deviceProfiles.set('eco-smart-bin', DeviceType.SMART_BIN);
    this.deviceProfiles.set('recyclebot', DeviceType.SMART_BIN);
    this.deviceProfiles.set('ecocart-bin', DeviceType.SMART_BIN);
    
    // Add known energy monitors
    this.deviceProfiles.set('eco-energy', DeviceType.ENERGY_MONITOR);
    this.deviceProfiles.set('smart-energy', DeviceType.ENERGY_MONITOR);
    this.deviceProfiles.set('power-sense', DeviceType.ENERGY_MONITOR);
    
    // Add smart appliances
    this.deviceProfiles.set('eco-appliance', DeviceType.SMART_APPLIANCE);
  }
  
  /**
   * Check if a discovered device is compatible with EcoCart
   */
  private isDeviceCompatible(device: any): boolean {
    // Check name patterns
    if (device.name) {
      const nameLower = device.name.toLowerCase();
      for (const [pattern, _] of this.deviceProfiles.entries()) {
        if (nameLower.includes(pattern)) {
          return true;
        }
      }
    }
    
    // Check service UUIDs
    if (device.serviceUUIDs && device.serviceUUIDs.length > 0) {
      // Check for known service UUIDs
      // This would include UUIDs for weight measurement, fill level, etc.
    }
    
    // For now, let's assume many devices could be compatible
    // In a real implementation, we would be more specific
    return true;
  }
  
  /**
   * Determine device type based on discovered information
   */
  private determineDeviceType(device: any): DeviceType {
    if (!device) {
      return DeviceType.OTHER;
    }
    
    // Check by name
    if (device.name) {
      const nameLower = device.name.toLowerCase();
      for (const [pattern, type] of this.deviceProfiles.entries()) {
        if (nameLower.includes(pattern)) {
          return type;
        }
      }
    }
    
    // Check by service UUIDs
    if (device.serviceUUIDs && device.serviceUUIDs.length > 0) {
      // This would include logic to identify device type by service UUID
    }
    
    return DeviceType.OTHER;
  }
  
  /**
   * Get device manufacturer from device info service
   */
  private async getDeviceManufacturer(device: any): Promise<string | undefined> {
    try {
      const services = await device.services();
      const deviceInfoService = services.find(
        (service: any) => service.uuid === '180A'
      );
      
      if (deviceInfoService) {
        const characteristics = await device.characteristicsForService('180A');
        const manufacturerChar = characteristics.find(
          (char: any) => char.uuid === '2A29'
        );
        
        if (manufacturerChar) {
          const value = await device.readCharacteristicForService('180A', '2A29');
          return this.decodeString(value.value);
        }
      }
      
      return undefined;
    } catch (error) {
      console.error('[BLEManager] Error getting manufacturer:', error);
      return undefined;
    }
  }
  
  /**
   * Get device model from device info service
   */
  private async getDeviceModel(device: any): Promise<string | undefined> {
    try {
      const services = await device.services();
      const deviceInfoService = services.find(
        (service: any) => service.uuid === '180A'
      );
      
      if (deviceInfoService) {
        const characteristics = await device.characteristicsForService('180A');
        const modelChar = characteristics.find(
          (char: any) => char.uuid === '2A24'
        );
        
        if (modelChar) {
          const value = await device.readCharacteristicForService('180A', '2A24');
          return this.decodeString(value.value);
        }
      }
      
      return undefined;
    } catch (error) {
      console.error('[BLEManager] Error getting model:', error);
      return undefined;
    }
  }
  
  /**
   * Determine device capabilities based on services
   */
  private async determineCapabilities(device: any): Promise<DeviceCapability[]> {
    const capabilities: DeviceCapability[] = [];
    
    try {
      const services = await device.services();
      
      // Check for weight scale service (custom UUID)
      if (services.some((service: any) => service.uuid === '181D')) {
        capabilities.push(DeviceCapability.WEIGHT_TRACKING);
      }
      
      // Check for fill level service (custom UUID)
      if (services.some((service: any) => service.uuid === '183B')) {
        capabilities.push(DeviceCapability.FILL_LEVEL);
      }
      
      // Check for other capabilities
      // For now, this is just placeholder logic
      
      return capabilities;
    } catch (error) {
      console.error('[BLEManager] Error determining capabilities:', error);
      return [];
    }
  }
  
  /**
   * Get characteristic information for a data type
   */
  private getCharacteristicForDataType(dataType: string): { serviceUUID?: string, characteristicUUID?: string } {
    // This is a placeholder implementation
    // In a real app, this would map data types to specific characteristic UUIDs
    
    switch (dataType) {
      case 'weight':
        return { serviceUUID: '181D', characteristicUUID: '2A98' }; // Weight scale
      case 'fill_level':
        return { serviceUUID: '183B', characteristicUUID: '2AB3' }; // Fill level
      default:
        return {};
    }
  }
  
  /**
   * Get characteristic information for a command
   */
  private getCharacteristicForCommand(command: string): { serviceUUID?: string, characteristicUUID?: string } {
    // This is a placeholder implementation
    // In a real app, this would map commands to specific characteristic UUIDs
    
    switch (command) {
      case 'tare':
        return { serviceUUID: '181D', characteristicUUID: '2A99' }; // Weight scale control
      case 'reset':
        return { serviceUUID: '180A', characteristicUUID: '2A05' }; // Generic reset
      default:
        return {};
    }
  }
  
  /**
   * Parse characteristic data based on data type
   */
  private parseCharacteristicData(characteristic: any, dataType: string): any {
    if (!characteristic || !characteristic.value) {
      return null;
    }
    
    // For real implementation, the parsing would depend on the specific
    // data format of each device/characteristic
    
    try {
      // This is a simplified placeholder implementation
      switch (dataType) {
        case 'weight':
          // Parse weight data
          return {
            value: this.decodeFloat(characteristic.value),
            unit: 'kg'
          };
        case 'fill_level':
          // Parse fill level data
          return {
            percentage: this.decodeInt(characteristic.value)
          };
        default:
          return this.decodeString(characteristic.value);
      }
    } catch (error) {
      console.error('[BLEManager] Error parsing characteristic data:', error);
      return null;
    }
  }
  
  /**
   * Format command data
   */
  private formatCommandData(command: string, params?: any): string {
    // For real implementation, the formatting would depend on the specific
    // requirements of each device and command
    
    // This is a simplified placeholder implementation
    switch (command) {
      case 'tare':
        return 'TARE';
      case 'reset':
        return 'RESET';
      default:
        return command;
    }
  }
  
  /**
   * Decode manufacturer data into a string
   */
  private decodeManufacturerData(data: string): string {
    // In a real implementation, this would properly decode the manufacturer data
    // format, which can vary between different manufacturers
    
    // For now, just return a placeholder
    return 'Unknown Manufacturer';
  }
  
  /**
   * Decode a Base64 string into a regular string
   */
  private decodeString(base64: string | null): string {
    if (!base64) {
      return '';
    }
    
    try {
      return atob(base64);
    } catch (error) {
      console.error('[BLEManager] Error decoding string:', error);
      return '';
    }
  }
  
  /**
   * Decode a Base64 string into a number
   */
  private decodeInt(base64: string | null): number {
    if (!base64) {
      return 0;
    }
    
    try {
      const buffer = Buffer.from(base64, 'base64');
      // Assuming little-endian 32-bit integer
      return buffer.readInt32LE(0);
    } catch (error) {
      console.error('[BLEManager] Error decoding integer:', error);
      return 0;
    }
  }
  
  /**
   * Decode a Base64 string into a float
   */
  private decodeFloat(base64: string | null): number {
    if (!base64) {
      return 0;
    }
    
    try {
      const buffer = Buffer.from(base64, 'base64');
      // Assuming little-endian 32-bit float
      return buffer.readFloatLE(0);
    } catch (error) {
      console.error('[BLEManager] Error decoding float:', error);
      return 0;
    }
  }
} 