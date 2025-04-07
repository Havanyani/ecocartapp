import {
    AutomationRule,
    ConnectionStatus,
    DeviceSettings,
    DeviceType,
    PlatformLinkResult,
    SmartHomeDevice,
    SmartHomeService,
    VoicePlatform
} from '@/services/smart-home/SmartHomeService';
import { useCallback, useEffect, useState } from 'react';

// Initialize service
const smartHomeService = new SmartHomeService();

interface SmartHomeHookReturn {
  // Device states
  devices: SmartHomeDevice[];
  isLoading: boolean;
  error: string | null;
  initialized: boolean;
  
  // Connected counts
  connectedDevicesCount: number;
  
  // Energy data
  energyConsumption: number | null;
  
  // Recycling data
  totalRecycled: number | null;
  
  // Platform linking
  linkedPlatforms: {
    [key in VoicePlatform]?: boolean;
  };
  
  // Methods
  initialize: (userId: string) => Promise<boolean>;
  loadDevices: () => Promise<void>;
  getDevice: (deviceId: string) => Promise<SmartHomeDevice | null>;
  toggleDevicePower: (deviceId: string) => Promise<boolean>;
  updateDeviceSettings: (deviceId: string, settings: Partial<DeviceSettings>) => Promise<boolean>;
  discoverDevices: () => Promise<SmartHomeDevice[]>;
  getAutomationRules: () => Promise<AutomationRule[]>;
  createAutomationRule: (rule: Omit<AutomationRule, 'id'>) => Promise<string>;
  updateAutomationRule: (ruleId: string, rule: Partial<AutomationRule>) => Promise<boolean>;
  deleteAutomationRule: (ruleId: string) => Promise<boolean>;
  linkVoicePlatform: (platform: VoicePlatform) => Promise<PlatformLinkResult>;
  refreshData: () => Promise<void>;
}

/**
 * Hook for interfacing with Smart Home functionality
 * @param initialUserId Optional user ID to initialize with
 * @returns Smart home methods and state
 */
export function useSmartHome(initialUserId?: string): SmartHomeHookReturn {
  // State for devices and loading
  const [devices, setDevices] = useState<SmartHomeDevice[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [initialized, setInitialized] = useState(false);
  
  // State for summary data
  const [connectedDevicesCount, setConnectedDevicesCount] = useState(0);
  const [energyConsumption, setEnergyConsumption] = useState<number | null>(null);
  const [totalRecycled, setTotalRecycled] = useState<number | null>(null);
  
  // State for platform links
  const [linkedPlatforms, setLinkedPlatforms] = useState<{
    [key in VoicePlatform]?: boolean;
  }>({});

  /**
   * Initialize the smart home service
   */
  const initialize = useCallback(async (userId: string): Promise<boolean> => {
    try {
      if (initialized) return true;
      
      const success = await smartHomeService.initialize(userId);
      setInitialized(success);
      return success;
    } catch (error) {
      console.error('Error initializing smart home service:', error);
      setError('Failed to initialize smart home service');
      return false;
    }
  }, [initialized]);

  /**
   * Auto-initialize with provided userId on mount
   */
  useEffect(() => {
    if (initialUserId && !initialized) {
      initialize(initialUserId);
    }
  }, [initialUserId, initialized, initialize]);

  /**
   * Load all devices and summary data
   */
  const loadDevices = useCallback(async (): Promise<void> => {
    setIsLoading(true);
    setError(null);
    
    try {
      // Load all devices
      const allDevices = await smartHomeService.getDevices();
      setDevices(allDevices);
      
      // Count connected devices
      const connected = allDevices.filter(
        (device: SmartHomeDevice) => device.connectionStatus === ConnectionStatus.CONNECTED
      ).length;
      setConnectedDevicesCount(connected);
      
      // Load energy data
      await loadEnergySummary(allDevices);
      
      // Load recycling data
      await loadRecyclingSummary(allDevices);
      
      // Load platform link status
      await loadPlatformLinkStatus();
    } catch (error) {
      console.error('Error loading devices:', error);
      setError('Failed to load devices');
    } finally {
      setIsLoading(false);
    }
  }, []);

  /**
   * Load energy consumption summary
   */
  const loadEnergySummary = async (deviceList: SmartHomeDevice[]): Promise<void> => {
    try {
      const energyMonitors = deviceList.filter(
        device => device.type === DeviceType.ENERGY_MONITOR &&
                  device.connectionStatus === ConnectionStatus.CONNECTED
      );
      
      // If no energy monitors, get data from smart appliances
      if (energyMonitors.length === 0) {
        const appliances = deviceList.filter(
          device => device.type === DeviceType.SMART_APPLIANCE &&
                    device.connectionStatus === ConnectionStatus.CONNECTED
        );
        
        // Sum up estimated consumption from appliances (would come from the service in real implementation)
        let totalConsumption = 0;
        for (const appliance of appliances) {
          const result = await smartHomeService.getDeviceData(appliance.id, 'energy');
          if (result.success && result.data) {
            totalConsumption += result.data;
          }
        }
        
        setEnergyConsumption(totalConsumption);
      } else {
        // Get real data from energy monitors
        let totalConsumption = 0;
        for (const monitor of energyMonitors) {
          const result = await smartHomeService.getDeviceData(monitor.id, 'energy');
          if (result.success && result.data) {
            totalConsumption += result.data;
          }
        }
        
        setEnergyConsumption(totalConsumption);
      }
    } catch (error) {
      console.error('Error loading energy summary:', error);
    }
  };

  /**
   * Load recycling summary data
   */
  const loadRecyclingSummary = async (deviceList: SmartHomeDevice[]): Promise<void> => {
    try {
      const recyclingBins = deviceList.filter(
        device => device.type === DeviceType.RECYCLING_BIN &&
                  device.connectionStatus === ConnectionStatus.CONNECTED
      );
      
      // Sum up recycling data from bins
      let totalWeight = 0;
      for (const bin of recyclingBins) {
        const result = await smartHomeService.getDeviceData(bin.id, 'weight');
        if (result.success && result.data) {
          totalWeight += result.data;
        }
      }
      
      setTotalRecycled(totalWeight);
    } catch (error) {
      console.error('Error loading recycling summary:', error);
    }
  };

  /**
   * Load platform link status
   */
  const loadPlatformLinkStatus = async (): Promise<void> => {
    try {
      const googleLinked = await smartHomeService.isPlatformLinked(VoicePlatform.GOOGLE_ASSISTANT);
      const alexaLinked = await smartHomeService.isPlatformLinked(VoicePlatform.ALEXA);
      const siriLinked = await smartHomeService.isPlatformLinked(VoicePlatform.SIRI);
      
      setLinkedPlatforms({
        [VoicePlatform.GOOGLE_ASSISTANT]: googleLinked,
        [VoicePlatform.ALEXA]: alexaLinked,
        [VoicePlatform.SIRI]: siriLinked,
      });
    } catch (error) {
      console.error('Error loading platform link status:', error);
    }
  };

  /**
   * Get a specific device by ID
   */
  const getDevice = async (deviceId: string): Promise<SmartHomeDevice | null> => {
    try {
      return await smartHomeService.getDevice(deviceId);
    } catch (error) {
      console.error(`Error getting device ${deviceId}:`, error);
      return null;
    }
  };

  /**
   * Toggle a device's power state
   */
  const toggleDevicePower = async (deviceId: string): Promise<boolean> => {
    try {
      const device = await smartHomeService.getDevice(deviceId);
      if (!device) return false;
      
      // Get current device power state from device data
      const powerResult = await smartHomeService.getDeviceData(deviceId, 'power');
      const isOn = powerResult.success && powerResult.data ? powerResult.data.isOn : false;
      
      // Send command to toggle power
      const result = await smartHomeService.sendDeviceCommand(
        deviceId, 
        'setPower', 
        { power: !isOn }
      );
      
      if (result.success) {
        // Update local device list
        await loadDevices();
        return true;
      }
      
      return false;
    } catch (error) {
      console.error(`Error toggling device ${deviceId}:`, error);
      return false;
    }
  };

  /**
   * Update device settings
   */
  const updateDeviceSettings = async (
    deviceId: string, 
    settings: Partial<DeviceSettings>
  ): Promise<boolean> => {
    try {
      // The SmartHomeService might have a method like updateDeviceSettings that returns a DeviceDataResult
      const result = await smartHomeService.sendDeviceCommand(
        deviceId, 
        'updateSettings', 
        settings
      );
      
      if (result.success) {
        // Refresh device list
        await loadDevices();
        return true;
      }
      
      return false;
    } catch (error) {
      console.error(`Error updating device settings for ${deviceId}:`, error);
      return false;
    }
  };

  /**
   * Start device discovery
   */
  const discoverDevices = async (): Promise<SmartHomeDevice[]> => {
    try {
      setIsLoading(true);
      
      // Use startDeviceDiscovery method which returns a DeviceDiscoveryResult
      const result = await smartHomeService.sendDeviceCommand('system', 'startDiscovery');
      
      // Refresh device list after discovery
      await loadDevices();
      
      // Return discovered devices or empty array if failed
      return result.success && result.data ? result.data.devices : [];
    } catch (error) {
      console.error('Error discovering devices:', error);
      return [];
    } finally {
      setIsLoading(false);
    }
  };

  /**
   * Get all automation rules
   */
  const getAutomationRules = async (): Promise<AutomationRule[]> => {
    try {
      const config = await smartHomeService.sendDeviceCommand('system', 'getAutomationRules');
      return config.success && config.data ? config.data.rules : [];
    } catch (error) {
      console.error('Error getting automation rules:', error);
      return [];
    }
  };

  /**
   * Create a new automation rule
   */
  const createAutomationRule = async (
    rule: Omit<AutomationRule, 'id'>
  ): Promise<string> => {
    try {
      const result = await smartHomeService.sendDeviceCommand(
        'system', 
        'createAutomationRule', 
        { rule }
      );
      
      if (result.success && result.data) {
        return result.data.ruleId;
      }
      
      throw new Error('Failed to create automation rule');
    } catch (error) {
      console.error('Error creating automation rule:', error);
      throw error;
    }
  };

  /**
   * Update an existing automation rule
   */
  const updateAutomationRule = async (
    ruleId: string, 
    rule: Partial<AutomationRule>
  ): Promise<boolean> => {
    try {
      const result = await smartHomeService.sendDeviceCommand(
        'system', 
        'updateAutomationRule', 
        { ruleId, rule }
      );
      
      return result.success;
    } catch (error) {
      console.error(`Error updating automation rule ${ruleId}:`, error);
      return false;
    }
  };

  /**
   * Delete an automation rule
   */
  const deleteAutomationRule = async (ruleId: string): Promise<boolean> => {
    try {
      const result = await smartHomeService.sendDeviceCommand(
        'system', 
        'deleteAutomationRule', 
        { ruleId }
      );
      
      return result.success;
    } catch (error) {
      console.error(`Error deleting automation rule ${ruleId}:`, error);
      return false;
    }
  };

  /**
   * Link with a voice platform
   */
  const linkVoicePlatform = async (
    platform: VoicePlatform
  ): Promise<PlatformLinkResult> => {
    try {
      const result = await smartHomeService.startPlatformLinking(platform);
      
      if (result.success) {
        // Update local state
        setLinkedPlatforms(prev => ({
          ...prev,
          [platform]: true
        }));
      }
      
      return result;
    } catch (error) {
      console.error(`Error linking with ${platform}:`, error);
      return { 
        success: false, 
        platform,
        error: 'Unknown error' 
      };
    }
  };

  /**
   * Refresh all data
   */
  const refreshData = async (): Promise<void> => {
    await loadDevices();
  };

  return {
    // State
    devices,
    isLoading,
    error,
    initialized,
    connectedDevicesCount,
    energyConsumption,
    totalRecycled,
    linkedPlatforms,
    
    // Methods
    initialize,
    loadDevices,
    getDevice,
    toggleDevicePower,
    updateDeviceSettings,
    discoverDevices,
    getAutomationRules,
    createAutomationRule,
    updateAutomationRule,
    deleteAutomationRule,
    linkVoicePlatform,
    refreshData,
  };
} 