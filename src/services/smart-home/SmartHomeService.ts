/**
 * SmartHomeService.ts
 * 
 * Core service for EcoCart's smart home integration, handling device connections,
 * platform integrations, and providing a unified interface for the app to interact
 * with smart home capabilities.
 */

import NetInfo from '@react-native-community/netinfo';
import EventEmitter from 'events';
import { Platform } from 'react-native';

// Import types and utilities
import { DeviceRepository } from './repositories/DeviceRepository';
import { SmartHomeConfigRepository } from './repositories/SmartHomeConfigRepository';

// Platform adapters
import { AlexaAdapter } from './adapters/AlexaAdapter';
import { GoogleHomeAdapter } from './adapters/GoogleHomeAdapter';
import { HomeKitAdapter } from './adapters/HomeKitAdapter';

// Protocol implementations
import { BLEManager } from './protocols/BLEManager';

// Enums
export enum DeviceType {
  RECYCLING_BIN = 'recyclingBin',
  ENERGY_MONITOR = 'energyMonitor',
  SMART_APPLIANCE = 'smartAppliance',
  VOICE_ASSISTANT = 'voiceAssistant',
  SMART_PLUG = 'smartPlug',
  WATER_MONITOR = 'waterMonitor',
  COMPOST_MONITOR = 'compostMonitor',
  OTHER = 'other'
}

export enum ConnectionType {
  BLE = 'ble',
  WIFI = 'wifi',
  ZIGBEE = 'zigbee',
  ZWAVE = 'zwave',
  CLOUD = 'cloud',
  MATTER = 'matter',
  THREAD = 'thread'
}

export enum ConnectionStatus {
  CONNECTED = 'connected',
  DISCONNECTED = 'disconnected',
  CONNECTING = 'connecting',
  CONNECTION_FAILED = 'connectionFailed',
  PAIRING = 'pairing',
  PAIRED = 'paired'
}

export enum DeviceCapability {
  WEIGHT_TRACKING = 'weight-tracking',
  FILL_LEVEL = 'fill-level',
  MATERIAL_DETECTION = 'material-detection',
  POWER_MONITORING = 'power-monitoring',
  ENERGY_TRACKING = 'energy-tracking',
  WATER_MONITORING = 'water-monitoring',
  SCHEDULE_CONTROL = 'schedule-control',
  VOICE_CONTROL = 'voice-control',
  TEMPERATURE_CONTROL = 'temperature-control'
}

export enum VoicePlatform {
  GOOGLE_ASSISTANT = 'googleAssistant',
  ALEXA = 'alexa',
  SIRI = 'siri'
}

// Interfaces
export interface SmartHomeDevice {
  id: string;
  name: string;
  type: DeviceType;
  connectionType: ConnectionType;
  connectionStatus: ConnectionStatus;
  manufacturer?: string;
  model?: string;
  capabilities: DeviceCapability[];
  lastSyncTimestamp: number;
  metadata?: Record<string, any>;
}

export interface SmartHomeConfig {
  userId: string;
  linkedPlatforms: PlatformLink[];
  deviceSettings: Record<string, DeviceSettings>;
  automationRules: AutomationRule[];
  notificationPreferences: NotificationPreference[];
}

export interface PlatformLink {
  platform: VoicePlatform;
  isLinked: boolean;
  accountName?: string;
  linkedAt?: number;
}

export interface DeviceSettings {
  deviceId: string;
  nickname?: string;
  room?: string;
  automationEnabled: boolean;
  notificationsEnabled: boolean;
  customSettings?: Record<string, any>;
}

export interface AutomationRule {
  id: string;
  name: string;
  enabled: boolean;
  triggerDeviceId: string;
  triggerCondition: string;
  triggerValue: any;
  actions: DeviceAction[];
  createdAt: number;
  updatedAt: number;
}

export interface DeviceAction {
  deviceId: string;
  action: string;
  parameters?: Record<string, any>;
}

export interface NotificationPreference {
  eventType: string;
  enabled: boolean;
  devices?: string[]; // Device IDs or empty for all
  quietHoursStart?: number; // 0-23 hour
  quietHoursEnd?: number; // 0-23 hour
}

export interface ConnectionResult {
  success: boolean;
  deviceId: string;
  error?: string;
}

export interface DeviceDiscoveryResult {
  devices: SmartHomeDevice[];
  error?: string;
}

export interface DeviceDataResult {
  success: boolean;
  deviceId: string;
  data?: any;
  error?: string;
}

export interface PlatformLinkResult {
  success: boolean;
  platform: VoicePlatform;
  error?: string;
  redirectUrl?: string;
}

/**
 * Main service for smart home integration within EcoCart
 */
export class SmartHomeService extends EventEmitter {
  private initialized = false;
  private bleManager: BLEManager;
  private deviceRepository: DeviceRepository;
  private configRepository: SmartHomeConfigRepository;
  private googleHomeAdapter: GoogleHomeAdapter;
  private alexaAdapter: AlexaAdapter;
  private homeKitAdapter: HomeKitAdapter;
  private currentUserId?: string;
  
  constructor() {
    super();
    
    // Initialize managers and repositories
    this.bleManager = new BLEManager();
    this.deviceRepository = new DeviceRepository();
    this.configRepository = new SmartHomeConfigRepository();
    
    // Initialize platform adapters
    this.googleHomeAdapter = new GoogleHomeAdapter();
    this.alexaAdapter = new AlexaAdapter();
    this.homeKitAdapter = new HomeKitAdapter();
    
    // Set up event listeners
    this.setupEventListeners();
  }
  
  /**
   * Initialize the smart home service
   * @param userId ID of the current user
   */
  async initialize(userId: string): Promise<boolean> {
    try {
      if (this.initialized && this.currentUserId === userId) {
        return true;
      }
      
      console.log(`Initializing SmartHomeService for user ${userId}`);
      this.currentUserId = userId;
      
      // Initialize underlying services
      await this.bleManager.initialize();
      await this.deviceRepository.initialize();
      await this.configRepository.initialize(userId);
      
      // Initialize platform adapters
      await this.googleHomeAdapter.initialize();
      await this.alexaAdapter.initialize();
      await this.homeKitAdapter.initialize();
      
      // Check for existing configuration
      const config = await this.configRepository.getConfig();
      if (!config) {
        // Create default configuration for new user
        await this.configRepository.initializeEmptyConfig(userId);
      }
      
      this.initialized = true;
      return true;
    } catch (error) {
      console.error('Error initializing SmartHomeService:', error);
      return false;
    }
  }
  
  /**
   * Start discovery of nearby devices
   * @param connectionTypes Types of connections to discover
   * @param timeout Discovery timeout in seconds
   */
  async startDeviceDiscovery(
    connectionTypes: ConnectionType[] = [ConnectionType.BLE, ConnectionType.WIFI],
    timeout: number = 30
  ): Promise<DeviceDiscoveryResult> {
    try {
      this.ensureInitialized();
      
      const discoveredDevices: SmartHomeDevice[] = [];
      
      // Start BLE scanning if requested
      if (connectionTypes.includes(ConnectionType.BLE)) {
        this.bleManager.startScan();
      }
      
      // For demo, return immediately with mock devices
      // In reality, would wait for timeout and collect discovered devices
      
      return {
        devices: discoveredDevices
      };
    } catch (error) {
      console.error('Error discovering devices:', error);
      return {
        devices: [],
        error: error instanceof Error ? error.message : 'Unknown error'
      };
    }
  }
  
  /**
   * Stop ongoing device discovery
   */
  stopDeviceDiscovery(): void {
    try {
      this.ensureInitialized();
      
      // Stop BLE scanning
      this.bleManager.stopScan();
      
      // Stop other discovery methods if active
    } catch (error) {
      console.error('Error stopping device discovery:', error);
    }
  }
  
  /**
   * Connect to a device
   * @param device Device to connect to
   */
  async connectToDevice(device: SmartHomeDevice): Promise<ConnectionResult> {
    try {
      this.ensureInitialized();
      
      switch (device.connectionType) {
        case ConnectionType.BLE:
          const connected = await this.bleManager.connect(device.id);
          
          if (connected) {
            // Update device status
            device.connectionStatus = ConnectionStatus.CONNECTED;
            device.lastSyncTimestamp = Date.now();
            
            // Save updated device
            await this.deviceRepository.saveDevice(device);
            
            // Emit connection event
            this.emit('deviceConnected', device);
            
            return {
              success: true,
              deviceId: device.id
            };
          } else {
            return {
              success: false,
              deviceId: device.id,
              error: 'Failed to connect to BLE device'
            };
          }
          
        case ConnectionType.WIFI:
          // Implementation for WiFi devices
          return {
            success: false,
            deviceId: device.id,
            error: 'WiFi connection not implemented'
          };
          
        default:
          return {
            success: false,
            deviceId: device.id,
            error: `Unsupported connection type: ${device.connectionType}`
          };
      }
    } catch (error) {
      console.error(`Error connecting to device ${device.id}:`, error);
      return {
        success: false,
        deviceId: device.id,
        error: error instanceof Error ? error.message : 'Unknown error'
      };
    }
  }
  
  /**
   * Disconnect from a device
   * @param deviceId ID of the device to disconnect from
   */
  async disconnectFromDevice(deviceId: string): Promise<ConnectionResult> {
    try {
      this.ensureInitialized();
      
      const device = await this.deviceRepository.getDevice(deviceId);
      
      if (!device) {
        return {
          success: false,
          deviceId,
          error: 'Device not found'
        };
      }
      
      switch (device.connectionType) {
        case ConnectionType.BLE:
          const disconnected = await this.bleManager.disconnect(deviceId);
          
          if (disconnected) {
            // Update device status
            device.connectionStatus = ConnectionStatus.DISCONNECTED;
            device.lastSyncTimestamp = Date.now();
            
            // Save updated device
            await this.deviceRepository.saveDevice(device);
            
            // Emit disconnection event
            this.emit('deviceDisconnected', deviceId);
            
            return {
              success: true,
              deviceId
            };
          } else {
            return {
              success: false,
              deviceId,
              error: 'Failed to disconnect from BLE device'
            };
          }
          
        case ConnectionType.WIFI:
          // Implementation for WiFi devices
          return {
            success: false,
            deviceId,
            error: 'WiFi disconnection not implemented'
          };
          
        default:
          return {
            success: false,
            deviceId,
            error: `Unsupported connection type: ${device.connectionType}`
          };
      }
    } catch (error) {
      console.error(`Error disconnecting from device ${deviceId}:`, error);
      return {
        success: false,
        deviceId,
        error: error instanceof Error ? error.message : 'Unknown error'
      };
    }
  }
  
  /**
   * Get all devices
   */
  async getDevices(): Promise<SmartHomeDevice[]> {
    this.ensureInitialized();
    return this.deviceRepository.getAllDevices();
  }
  
  /**
   * Get a specific device by ID
   * @param deviceId ID of the device to get
   */
  async getDevice(deviceId: string): Promise<SmartHomeDevice | null> {
    this.ensureInitialized();
    return this.deviceRepository.getDevice(deviceId);
  }
  
  /**
   * Get devices of a specific type
   * @param type Type of devices to get
   */
  async getDevicesByType(type: DeviceType): Promise<SmartHomeDevice[]> {
    this.ensureInitialized();
    return this.deviceRepository.getDevicesByType(type);
  }
  
  /**
   * Get connected devices
   */
  async getConnectedDevices(): Promise<SmartHomeDevice[]> {
    this.ensureInitialized();
    return this.deviceRepository.getConnectedDevices();
  }
  
  /**
   * Save or update a device
   * @param device Device to save
   */
  async saveDevice(device: SmartHomeDevice): Promise<boolean> {
    this.ensureInitialized();
    return this.deviceRepository.saveDevice(device);
  }
  
  /**
   * Delete a device
   * @param deviceId ID of the device to delete
   */
  async deleteDevice(deviceId: string): Promise<boolean> {
    this.ensureInitialized();
    
    // Disconnect if connected
    const device = await this.deviceRepository.getDevice(deviceId);
    if (device && device.connectionStatus === ConnectionStatus.CONNECTED) {
      await this.disconnectFromDevice(deviceId);
    }
    
    // Remove from storage
    return this.deviceRepository.deleteDevice(deviceId);
  }
  
  /**
   * Get device data
   * @param deviceId ID of the device to get data from
   * @param dataType Type of data to get
   */
  async getDeviceData(
    deviceId: string, 
    dataType: string
  ): Promise<DeviceDataResult> {
    try {
      this.ensureInitialized();
      
      const device = await this.deviceRepository.getDevice(deviceId);
      
      if (!device) {
        return {
          success: false,
          deviceId,
          error: 'Device not found'
        };
      }
      
      if (device.connectionStatus !== ConnectionStatus.CONNECTED) {
        return {
          success: false,
          deviceId,
          error: 'Device not connected'
        };
      }
      
      // Handle different device types and data types
      switch (device.type) {
        case DeviceType.RECYCLING_BIN:
          // Implementation for recycling bin data
          return {
            success: false,
            deviceId,
            error: 'Not implemented for this device type'
          };
          
        case DeviceType.ENERGY_MONITOR:
          // Implementation for energy monitor data
          return {
            success: false,
            deviceId,
            error: 'Not implemented for this device type'
          };
          
        default:
          return {
            success: false,
            deviceId,
            error: `Unsupported device type: ${device.type}`
          };
      }
    } catch (error) {
      console.error(`Error getting data from device ${deviceId}:`, error);
      return {
        success: false,
        deviceId,
        error: error instanceof Error ? error.message : 'Unknown error'
      };
    }
  }
  
  /**
   * Send command to device
   * @param deviceId ID of the device to send command to
   * @param command Command to send
   * @param parameters Command parameters
   */
  async sendDeviceCommand(
    deviceId: string, 
    command: string, 
    parameters?: Record<string, any>
  ): Promise<DeviceDataResult> {
    try {
      this.ensureInitialized();
      
      const device = await this.deviceRepository.getDevice(deviceId);
      
      if (!device) {
        return {
          success: false,
          deviceId,
          error: 'Device not found'
        };
      }
      
      if (device.connectionStatus !== ConnectionStatus.CONNECTED) {
        return {
          success: false,
          deviceId,
          error: 'Device not connected'
        };
      }
      
      // Handle different device types and commands
      switch (device.type) {
        case DeviceType.RECYCLING_BIN:
          // Implementation for recycling bin commands
          return {
            success: false,
            deviceId,
            error: 'Not implemented for this device type'
          };
          
        case DeviceType.ENERGY_MONITOR:
          // Implementation for energy monitor commands
          return {
            success: false,
            deviceId,
            error: 'Not implemented for this device type'
          };
          
        default:
          return {
            success: false,
            deviceId,
            error: `Unsupported device type: ${device.type}`
          };
      }
    } catch (error) {
      console.error(`Error sending command to device ${deviceId}:`, error);
      return {
        success: false,
        deviceId,
        error: error instanceof Error ? error.message : 'Unknown error'
      };
    }
  }
  
  /**
   * Start linking with a voice platform
   * @param platform Platform to link with
   */
  async startPlatformLinking(platform: VoicePlatform): Promise<PlatformLinkResult> {
    try {
      this.ensureInitialized();
      
      // Check network connectivity
      const netInfo = await NetInfo.fetch();
      if (!netInfo.isConnected) {
        return {
          success: false,
          platform,
          error: 'No internet connection'
        };
      }
      
      switch (platform) {
        case VoicePlatform.GOOGLE_ASSISTANT:
          return this.googleHomeAdapter.startLinking();
          
        case VoicePlatform.ALEXA:
          return this.alexaAdapter.startLinking();
          
        case VoicePlatform.SIRI:
          if (Platform.OS !== 'ios') {
            return {
              success: false,
              platform,
              error: 'Siri is only available on iOS devices'
            };
          }
          return this.homeKitAdapter.startLinking();
          
        default:
          return {
            success: false,
            platform,
            error: `Unsupported platform: ${platform}`
          };
      }
    } catch (error) {
      console.error(`Error linking with platform ${platform}:`, error);
      return {
        success: false,
        platform,
        error: error instanceof Error ? error.message : 'Unknown error'
      };
    }
  }
  
  /**
   * Handle OAuth callback for platform linking
   * @param platform Platform being linked
   * @param url Callback URL with authorization code
   */
  async handlePlatformOAuthCallback(
    platform: VoicePlatform, 
    url: string
  ): Promise<PlatformLinkResult> {
    try {
      this.ensureInitialized();
      
      switch (platform) {
        case VoicePlatform.GOOGLE_ASSISTANT:
          const googleResult = await this.googleHomeAdapter.handleOAuthCallback(url);
          
          if (googleResult.success) {
            // Update platform link status in config
            await this.updatePlatformLinkStatus(
              platform, 
              true, 
              googleResult.accountName
            );
          }
          
          return googleResult;
          
        case VoicePlatform.ALEXA:
          const alexaResult = await this.alexaAdapter.handleOAuthCallback(url);
          
          if (alexaResult.success) {
            // Update platform link status in config
            await this.updatePlatformLinkStatus(
              platform, 
              true, 
              alexaResult.accountName
            );
          }
          
          return alexaResult;
          
        case VoicePlatform.SIRI:
          const siriResult = await this.homeKitAdapter.handleOAuthCallback(url);
          
          if (siriResult.success) {
            // Update platform link status in config
            await this.updatePlatformLinkStatus(
              platform, 
              true, 
              siriResult.accountName
            );
          }
          
          return siriResult;
          
        default:
          return {
            success: false,
            platform,
            error: `Unsupported platform: ${platform}`
          };
      }
    } catch (error) {
      console.error(`Error handling OAuth callback for ${platform}:`, error);
      return {
        success: false,
        platform,
        error: error instanceof Error ? error.message : 'Unknown error'
      };
    }
  }
  
  /**
   * Unlink from a voice platform
   * @param platform Platform to unlink from
   */
  async unlinkPlatform(platform: VoicePlatform): Promise<PlatformLinkResult> {
    try {
      this.ensureInitialized();
      
      switch (platform) {
        case VoicePlatform.GOOGLE_ASSISTANT:
          const googleResult = await this.googleHomeAdapter.unlink();
          
          if (googleResult.success) {
            // Update platform link status in config
            await this.updatePlatformLinkStatus(platform, false);
          }
          
          return googleResult;
          
        case VoicePlatform.ALEXA:
          const alexaResult = await this.alexaAdapter.unlink();
          
          if (alexaResult.success) {
            // Update platform link status in config
            await this.updatePlatformLinkStatus(platform, false);
          }
          
          return alexaResult;
          
        case VoicePlatform.SIRI:
          const siriResult = await this.homeKitAdapter.unlink();
          
          if (siriResult.success) {
            // Update platform link status in config
            await this.updatePlatformLinkStatus(platform, false);
          }
          
          return siriResult;
          
        default:
          return {
            success: false,
            platform,
            error: `Unsupported platform: ${platform}`
          };
      }
    } catch (error) {
      console.error(`Error unlinking from platform ${platform}:`, error);
      return {
        success: false,
        platform,
        error: error instanceof Error ? error.message : 'Unknown error'
      };
    }
  }
  
  /**
   * Check if a platform is linked
   * @param platform Platform to check
   */
  async isPlatformLinked(platform: VoicePlatform): Promise<boolean> {
    try {
      this.ensureInitialized();
      
      const config = await this.configRepository.getConfig();
      if (!config) {
        return false;
      }
      
      const platformLink = config.linkedPlatforms.find(p => p.platform === platform);
      if (!platformLink) {
        return false;
      }
      
      return platformLink.isLinked;
    } catch (error) {
      console.error(`Error checking platform link status for ${platform}:`, error);
      return false;
    }
  }
  
  /**
   * Create an automation rule
   * @param rule Rule to create
   */
  async createAutomationRule(rule: Omit<AutomationRule, 'id' | 'createdAt' | 'updatedAt'>): Promise<string | null> {
    try {
      this.ensureInitialized();
      
      // Generate ID and timestamps
      const newRule: AutomationRule = {
        ...rule,
        id: `rule_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
        createdAt: Date.now(),
        updatedAt: Date.now(),
      };
      
      // Save to config
      const success = await this.configRepository.addAutomationRule(newRule);
      
      return success ? newRule.id : null;
    } catch (error) {
      console.error('Error creating automation rule:', error);
      return null;
    }
  }
  
  /**
   * Update an automation rule
   * @param ruleId ID of the rule to update
   * @param updates Updates to apply
   */
  async updateAutomationRule(
    ruleId: string, 
    updates: Partial<Omit<AutomationRule, 'id' | 'createdAt' | 'updatedAt'>>
  ): Promise<boolean> {
    try {
      this.ensureInitialized();
      
      // Get existing rule
      const config = await this.configRepository.getConfig();
      if (!config) {
        return false;
      }
      
      const ruleIndex = config.automationRules.findIndex(r => r.id === ruleId);
      if (ruleIndex === -1) {
        return false;
      }
      
      // Apply updates
      const updatedRule: AutomationRule = {
        ...config.automationRules[ruleIndex],
        ...updates,
        updatedAt: Date.now(),
      };
      
      // Save to config
      config.automationRules[ruleIndex] = updatedRule;
      return this.configRepository.saveConfig(config);
    } catch (error) {
      console.error(`Error updating automation rule ${ruleId}:`, error);
      return false;
    }
  }
  
  /**
   * Delete an automation rule
   * @param ruleId ID of the rule to delete
   */
  async deleteAutomationRule(ruleId: string): Promise<boolean> {
    try {
      this.ensureInitialized();
      return this.configRepository.deleteAutomationRule(ruleId);
    } catch (error) {
      console.error(`Error deleting automation rule ${ruleId}:`, error);
      return false;
    }
  }
  
  /**
   * Get automation rules
   */
  async getAutomationRules(): Promise<AutomationRule[]> {
    try {
      this.ensureInitialized();
      
      const config = await this.configRepository.getConfig();
      if (!config) {
        return [];
      }
      
      return config.automationRules;
    } catch (error) {
      console.error('Error getting automation rules:', error);
      return [];
    }
  }
  
  /**
   * Update device settings
   * @param deviceId ID of the device to update settings for
   * @param settings Settings to apply
   */
  async updateDeviceSettings(
    deviceId: string, 
    settings: Partial<DeviceSettings>
  ): Promise<boolean> {
    try {
      this.ensureInitialized();
      
      // Get device to ensure it exists
      const device = await this.deviceRepository.getDevice(deviceId);
      if (!device) {
        return false;
      }
      
      return this.configRepository.updateDeviceSettings(deviceId, settings);
    } catch (error) {
      console.error(`Error updating device settings for ${deviceId}:`, error);
      return false;
    }
  }
  
  /**
   * Get device settings
   * @param deviceId ID of the device to get settings for
   */
  async getDeviceSettings(deviceId: string): Promise<DeviceSettings | null> {
    try {
      this.ensureInitialized();
      return this.configRepository.getDeviceSettings(deviceId);
    } catch (error) {
      console.error(`Error getting device settings for ${deviceId}:`, error);
      return null;
    }
  }
  
  /**
   * Update notification preferences
   * @param preferences Preferences to update
   */
  async updateNotificationPreferences(
    preferences: NotificationPreference[]
  ): Promise<boolean> {
    try {
      this.ensureInitialized();
      return this.configRepository.updateNotificationPreferences(preferences);
    } catch (error) {
      console.error('Error updating notification preferences:', error);
      return false;
    }
  }
  
  /**
   * Get notification preferences
   */
  async getNotificationPreferences(): Promise<NotificationPreference[]> {
    try {
      this.ensureInitialized();
      
      const config = await this.configRepository.getConfig();
      if (!config) {
        return [];
      }
      
      return config.notificationPreferences;
    } catch (error) {
      console.error('Error getting notification preferences:', error);
      return [];
    }
  }
  
  /**
   * Clear all data (for testing or account reset)
   */
  async clearAllData(): Promise<boolean> {
    try {
      // Disconnect all connected devices
      const connectedDevices = await this.deviceRepository.getConnectedDevices();
      for (const device of connectedDevices) {
        await this.disconnectFromDevice(device.id);
      }
      
      // Clear repositories
      await this.deviceRepository.clearDevices();
      await this.configRepository.clearConfig();
      
      // Reset initialization flag
      this.initialized = false;
      this.currentUserId = undefined;
      
      return true;
    } catch (error) {
      console.error('Error clearing all data:', error);
      return false;
    }
  }
  
  /**
   * Set up event listeners for underlying services
   */
  private setupEventListeners(): void {
    // Forward BLE manager events
    this.bleManager.on('deviceDiscovered', (device) => {
      this.emit('deviceDiscovered', device);
    });
    
    this.bleManager.on('deviceConnected', (device) => {
      this.emit('deviceConnected', device);
    });
    
    this.bleManager.on('deviceDisconnected', (deviceId) => {
      this.emit('deviceDisconnected', deviceId);
    });
    
    this.bleManager.on('scanStarted', () => {
      this.emit('discoveryStarted', { type: ConnectionType.BLE });
    });
    
    this.bleManager.on('scanStopped', () => {
      this.emit('discoveryStopped', { type: ConnectionType.BLE });
    });
    
    this.bleManager.on('dataReceived', (data) => {
      this.emit('deviceDataReceived', data);
    });
    
    // Forward platform adapter events
    this.googleHomeAdapter.on('commandReceived', (command) => {
      this.emit('voiceCommandReceived', {
        platform: VoicePlatform.GOOGLE_ASSISTANT,
        ...command
      });
    });
    
    this.alexaAdapter.on('commandReceived', (command) => {
      this.emit('voiceCommandReceived', {
        platform: VoicePlatform.ALEXA,
        ...command
      });
    });
    
    this.homeKitAdapter.on('commandReceived', (command) => {
      this.emit('voiceCommandReceived', {
        platform: VoicePlatform.SIRI,
        ...command
      });
    });
  }
  
  /**
   * Update platform link status in config
   */
  private async updatePlatformLinkStatus(
    platform: VoicePlatform, 
    isLinked: boolean, 
    accountName?: string
  ): Promise<boolean> {
    try {
      const config = await this.configRepository.getConfig();
      if (!config) {
        return false;
      }
      
      // Find existing platform link or create a new one
      const platformLinkIndex = config.linkedPlatforms.findIndex(p => p.platform === platform);
      
      if (platformLinkIndex !== -1) {
        // Update existing link
        config.linkedPlatforms[platformLinkIndex] = {
          ...config.linkedPlatforms[platformLinkIndex],
          isLinked,
          accountName: isLinked ? accountName || config.linkedPlatforms[platformLinkIndex].accountName : undefined,
          linkedAt: isLinked ? Date.now() : undefined,
        };
      } else {
        // Create new link
        config.linkedPlatforms.push({
          platform,
          isLinked,
          accountName,
          linkedAt: isLinked ? Date.now() : undefined,
        });
      }
      
      // Save updated config
      return this.configRepository.saveConfig(config);
    } catch (error) {
      console.error(`Error updating platform link status for ${platform}:`, error);
      return false;
    }
  }
  
  /**
   * Ensure the service is initialized
   */
  private ensureInitialized(): void {
    if (!this.initialized || !this.currentUserId) {
      throw new Error('SmartHomeService not initialized. Call initialize() first.');
    }
  }
}

export default SmartHomeService; 