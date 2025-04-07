import NetInfo from '@react-native-community/netinfo';
import { Platform } from 'react-native';
import {
    ConnectionStatus,
    ConnectionType,
    DeviceCapability,
    DeviceType,
    SmartHomeDevice,
    SmartHomeService,
    VoicePlatform
} from '../../../src/services/smart-home/SmartHomeService';
import { AlexaAdapter } from '../../../src/services/smart-home/adapters/AlexaAdapter';
import { GoogleHomeAdapter } from '../../../src/services/smart-home/adapters/GoogleHomeAdapter';
import { HomeKitAdapter } from '../../../src/services/smart-home/adapters/HomeKitAdapter';
import { BLEManager } from '../../../src/services/smart-home/protocols/BLEManager';
import { DeviceRepository } from '../../../src/services/smart-home/repositories/DeviceRepository';
import { SmartHomeConfigRepository } from '../../../src/services/smart-home/repositories/SmartHomeConfigRepository';

// Mock dependencies
jest.mock('../../../src/services/smart-home/protocols/BLEManager');
jest.mock('../../../src/services/smart-home/repositories/DeviceRepository');
jest.mock('../../../src/services/smart-home/repositories/SmartHomeConfigRepository');
jest.mock('../../../src/services/smart-home/adapters/GoogleHomeAdapter');
jest.mock('../../../src/services/smart-home/adapters/AlexaAdapter');
jest.mock('../../../src/services/smart-home/adapters/HomeKitAdapter');
jest.mock('@react-native-community/netinfo');

describe('SmartHomeService', () => {
  // Mock implementations and data
  const userId = 'test-user-123';
  const mockDevice: SmartHomeDevice = {
    id: 'device1',
    name: 'Test Device',
    type: DeviceType.RECYCLING_BIN,
    connectionType: ConnectionType.BLE,
    connectionStatus: ConnectionStatus.DISCONNECTED,
    capabilities: [DeviceCapability.WEIGHT_TRACKING, DeviceCapability.FILL_LEVEL],
    lastSyncTimestamp: Date.now(),
  };
  
  let service: SmartHomeService;
  let mockBLEManager: jest.Mocked<BLEManager>;
  let mockDeviceRepository: jest.Mocked<DeviceRepository>;
  let mockConfigRepository: jest.Mocked<SmartHomeConfigRepository>;
  let mockGoogleHomeAdapter: jest.Mocked<GoogleHomeAdapter>;
  let mockAlexaAdapter: jest.Mocked<AlexaAdapter>;
  let mockHomeKitAdapter: jest.Mocked<HomeKitAdapter>;
  
  beforeEach(() => {
    jest.clearAllMocks();
    
    // Setup mocks
    mockBLEManager = new BLEManager() as jest.Mocked<BLEManager>;
    mockDeviceRepository = new DeviceRepository() as jest.Mocked<DeviceRepository>;
    mockConfigRepository = new SmartHomeConfigRepository() as jest.Mocked<SmartHomeConfigRepository>;
    mockGoogleHomeAdapter = new GoogleHomeAdapter() as jest.Mocked<GoogleHomeAdapter>;
    mockAlexaAdapter = new AlexaAdapter() as jest.Mocked<AlexaAdapter>;
    mockHomeKitAdapter = new HomeKitAdapter() as jest.Mocked<HomeKitAdapter>;
    
    // Mock repository methods
    mockDeviceRepository.initialize.mockResolvedValue();
    mockDeviceRepository.getAllDevices.mockResolvedValue([mockDevice]);
    mockDeviceRepository.getDevice.mockResolvedValue(mockDevice);
    mockDeviceRepository.getDevicesByType.mockResolvedValue([mockDevice]);
    mockDeviceRepository.getConnectedDevices.mockResolvedValue([]);
    mockDeviceRepository.saveDevice.mockResolvedValue(true);
    mockDeviceRepository.deleteDevice.mockResolvedValue(true);
    
    mockConfigRepository.initialize.mockResolvedValue();
    mockConfigRepository.getConfig.mockResolvedValue({
      userId,
      linkedPlatforms: [],
      deviceSettings: {},
      automationRules: [],
      notificationPreferences: []
    });
    mockConfigRepository.saveConfig.mockResolvedValue(true);
    mockConfigRepository.initializeEmptyConfig.mockResolvedValue();
    mockConfigRepository.addAutomationRule.mockResolvedValue(true);
    mockConfigRepository.deleteAutomationRule.mockResolvedValue(true);
    mockConfigRepository.updateDeviceSettings.mockResolvedValue(true);
    mockConfigRepository.getDeviceSettings.mockResolvedValue({
      deviceId: mockDevice.id,
      automationEnabled: true,
      notificationsEnabled: true
    });
    mockConfigRepository.updateNotificationPreferences.mockResolvedValue(true);
    
    // Mock BLE manager
    mockBLEManager.initialize.mockResolvedValue(true);
    mockBLEManager.startScan.mockResolvedValue(true);
    mockBLEManager.stopScan.mockImplementation(() => {});
    mockBLEManager.connect.mockResolvedValue(true);
    mockBLEManager.disconnect.mockResolvedValue(true);
    
    // Mock platform adapters
    mockGoogleHomeAdapter.initialize.mockResolvedValue();
    mockAlexaAdapter.initialize.mockResolvedValue();
    mockHomeKitAdapter.initialize.mockResolvedValue();
    
    mockGoogleHomeAdapter.startLinking.mockResolvedValue({
      success: true,
      platform: VoicePlatform.GOOGLE_ASSISTANT,
      redirectUrl: 'https://accounts.google.com/oauth'
    });
    
    mockAlexaAdapter.startLinking.mockResolvedValue({
      success: true,
      platform: VoicePlatform.ALEXA,
      redirectUrl: 'https://amazon.com/skills/authorize'
    });
    
    mockHomeKitAdapter.startLinking.mockResolvedValue({
      success: true,
      platform: VoicePlatform.SIRI
    });
    
    // Mock NetInfo
    (NetInfo.fetch as jest.Mock).mockResolvedValue({ isConnected: true });
    
    // Create service instance
    service = new SmartHomeService();
    
    // Inject mocks
    (service as any).bleManager = mockBLEManager;
    (service as any).deviceRepository = mockDeviceRepository;
    (service as any).configRepository = mockConfigRepository;
    (service as any).googleHomeAdapter = mockGoogleHomeAdapter;
    (service as any).alexaAdapter = mockAlexaAdapter;
    (service as any).homeKitAdapter = mockHomeKitAdapter;
  });
  
  describe('initialize', () => {
    it('should initialize successfully', async () => {
      const result = await service.initialize(userId);
      
      expect(result).toBe(true);
      expect(mockBLEManager.initialize).toHaveBeenCalled();
      expect(mockDeviceRepository.initialize).toHaveBeenCalled();
      expect(mockConfigRepository.initialize).toHaveBeenCalledWith(userId);
      expect(mockGoogleHomeAdapter.initialize).toHaveBeenCalled();
      expect(mockAlexaAdapter.initialize).toHaveBeenCalled();
      expect(mockHomeKitAdapter.initialize).toHaveBeenCalled();
      expect((service as any).initialized).toBe(true);
    });
    
    it('should initialize empty config if none exists', async () => {
      mockConfigRepository.getConfig.mockResolvedValue(null);
      
      const result = await service.initialize(userId);
      
      expect(result).toBe(true);
      expect(mockConfigRepository.initializeEmptyConfig).toHaveBeenCalledWith(userId);
    });
    
    it('should handle initialization errors', async () => {
      mockBLEManager.initialize.mockRejectedValue(new Error('BLE init error'));
      
      const result = await service.initialize(userId);
      
      expect(result).toBe(false);
      expect((service as any).initialized).toBe(false);
    });
  });
  
  describe('startDeviceDiscovery', () => {
    beforeEach(async () => {
      await service.initialize(userId);
    });
    
    it('should start discovery for BLE devices', async () => {
      const result = await service.startDeviceDiscovery([ConnectionType.BLE]);
      
      expect(result.devices).toEqual([]);
      expect(mockBLEManager.startScan).toHaveBeenCalled();
    });
    
    it('should handle discovery errors', async () => {
      mockBLEManager.startScan.mockRejectedValue(new Error('Scan error'));
      
      const result = await service.startDeviceDiscovery([ConnectionType.BLE]);
      
      expect(result.devices).toEqual([]);
      expect(result.error).toBeTruthy();
    });
  });
  
  describe('stopDeviceDiscovery', () => {
    beforeEach(async () => {
      await service.initialize(userId);
    });
    
    it('should stop discovery', () => {
      service.stopDeviceDiscovery();
      
      expect(mockBLEManager.stopScan).toHaveBeenCalled();
    });
  });
  
  describe('connectToDevice', () => {
    beforeEach(async () => {
      await service.initialize(userId);
    });
    
    it('should connect to a BLE device', async () => {
      const result = await service.connectToDevice({
        ...mockDevice,
        connectionType: ConnectionType.BLE
      });
      
      expect(result.success).toBe(true);
      expect(mockBLEManager.connect).toHaveBeenCalledWith(mockDevice.id);
      expect(mockDeviceRepository.saveDevice).toHaveBeenCalled();
    });
    
    it('should handle connection errors', async () => {
      mockBLEManager.connect.mockResolvedValue(false);
      
      const result = await service.connectToDevice({
        ...mockDevice,
        connectionType: ConnectionType.BLE
      });
      
      expect(result.success).toBe(false);
      expect(result.error).toBeTruthy();
    });
    
    it('should handle unsupported connection types', async () => {
      const result = await service.connectToDevice({
        ...mockDevice,
        connectionType: ConnectionType.WIFI
      });
      
      expect(result.success).toBe(false);
      expect(result.error).toContain('not implemented');
    });
  });
  
  describe('disconnectFromDevice', () => {
    beforeEach(async () => {
      await service.initialize(userId);
    });
    
    it('should disconnect from a BLE device', async () => {
      mockDeviceRepository.getDevice.mockResolvedValue({
        ...mockDevice,
        connectionType: ConnectionType.BLE,
        connectionStatus: ConnectionStatus.CONNECTED
      });
      
      const result = await service.disconnectFromDevice(mockDevice.id);
      
      expect(result.success).toBe(true);
      expect(mockBLEManager.disconnect).toHaveBeenCalledWith(mockDevice.id);
      expect(mockDeviceRepository.saveDevice).toHaveBeenCalled();
    });
    
    it('should handle device not found', async () => {
      mockDeviceRepository.getDevice.mockResolvedValue(null);
      
      const result = await service.disconnectFromDevice('unknown-device');
      
      expect(result.success).toBe(false);
      expect(result.error).toContain('not found');
    });
    
    it('should handle disconnect errors', async () => {
      mockDeviceRepository.getDevice.mockResolvedValue({
        ...mockDevice,
        connectionType: ConnectionType.BLE,
        connectionStatus: ConnectionStatus.CONNECTED
      });
      mockBLEManager.disconnect.mockResolvedValue(false);
      
      const result = await service.disconnectFromDevice(mockDevice.id);
      
      expect(result.success).toBe(false);
      expect(result.error).toBeTruthy();
    });
  });
  
  describe('device management', () => {
    beforeEach(async () => {
      await service.initialize(userId);
    });
    
    it('should get all devices', async () => {
      const devices = await service.getDevices();
      
      expect(devices).toEqual([mockDevice]);
      expect(mockDeviceRepository.getAllDevices).toHaveBeenCalled();
    });
    
    it('should get a specific device by ID', async () => {
      const device = await service.getDevice(mockDevice.id);
      
      expect(device).toEqual(mockDevice);
      expect(mockDeviceRepository.getDevice).toHaveBeenCalledWith(mockDevice.id);
    });
    
    it('should get devices by type', async () => {
      const devices = await service.getDevicesByType(DeviceType.RECYCLING_BIN);
      
      expect(devices).toEqual([mockDevice]);
      expect(mockDeviceRepository.getDevicesByType).toHaveBeenCalledWith(DeviceType.RECYCLING_BIN);
    });
    
    it('should get connected devices', async () => {
      const devices = await service.getConnectedDevices();
      
      expect(devices).toEqual([]);
      expect(mockDeviceRepository.getConnectedDevices).toHaveBeenCalled();
    });
    
    it('should save a device', async () => {
      const result = await service.saveDevice(mockDevice);
      
      expect(result).toBe(true);
      expect(mockDeviceRepository.saveDevice).toHaveBeenCalledWith(mockDevice);
    });
    
    it('should delete a device', async () => {
      mockDeviceRepository.getDevice.mockResolvedValue({
        ...mockDevice,
        connectionStatus: ConnectionStatus.DISCONNECTED
      });
      
      const result = await service.deleteDevice(mockDevice.id);
      
      expect(result).toBe(true);
      expect(mockDeviceRepository.deleteDevice).toHaveBeenCalledWith(mockDevice.id);
    });
    
    it('should disconnect before deleting a connected device', async () => {
      mockDeviceRepository.getDevice.mockResolvedValue({
        ...mockDevice,
        connectionStatus: ConnectionStatus.CONNECTED
      });
      
      const result = await service.deleteDevice(mockDevice.id);
      
      expect(result).toBe(true);
      expect(mockBLEManager.disconnect).toHaveBeenCalledWith(mockDevice.id);
      expect(mockDeviceRepository.deleteDevice).toHaveBeenCalledWith(mockDevice.id);
    });
  });
  
  describe('device data and commands', () => {
    beforeEach(async () => {
      await service.initialize(userId);
    });
    
    it('should handle getting device data', async () => {
      mockDeviceRepository.getDevice.mockResolvedValue({
        ...mockDevice,
        connectionStatus: ConnectionStatus.CONNECTED
      });
      
      const result = await service.getDeviceData(mockDevice.id, 'weight');
      
      // Since implementation is not complete for specific device types
      expect(result.success).toBe(false);
      expect(result.deviceId).toBe(mockDevice.id);
    });
    
    it('should handle device not found when getting data', async () => {
      mockDeviceRepository.getDevice.mockResolvedValue(null);
      
      const result = await service.getDeviceData('unknown-device', 'weight');
      
      expect(result.success).toBe(false);
      expect(result.error).toContain('not found');
    });
    
    it('should handle disconnected device when getting data', async () => {
      mockDeviceRepository.getDevice.mockResolvedValue({
        ...mockDevice,
        connectionStatus: ConnectionStatus.DISCONNECTED
      });
      
      const result = await service.getDeviceData(mockDevice.id, 'weight');
      
      expect(result.success).toBe(false);
      expect(result.error).toContain('not connected');
    });
    
    it('should handle sending device commands', async () => {
      mockDeviceRepository.getDevice.mockResolvedValue({
        ...mockDevice,
        connectionStatus: ConnectionStatus.CONNECTED
      });
      
      const result = await service.sendDeviceCommand(mockDevice.id, 'tare');
      
      // Since implementation is not complete for specific device types
      expect(result.success).toBe(false);
      expect(result.deviceId).toBe(mockDevice.id);
    });
  });
  
  describe('platform linking', () => {
    beforeEach(async () => {
      await service.initialize(userId);
    });
    
    it('should start Google Assistant linking', async () => {
      const result = await service.startPlatformLinking(VoicePlatform.GOOGLE_ASSISTANT);
      
      expect(result.success).toBe(true);
      expect(result.platform).toBe(VoicePlatform.GOOGLE_ASSISTANT);
      expect(result.redirectUrl).toBeTruthy();
      expect(mockGoogleHomeAdapter.startLinking).toHaveBeenCalled();
    });
    
    it('should start Alexa linking', async () => {
      const result = await service.startPlatformLinking(VoicePlatform.ALEXA);
      
      expect(result.success).toBe(true);
      expect(result.platform).toBe(VoicePlatform.ALEXA);
      expect(result.redirectUrl).toBeTruthy();
      expect(mockAlexaAdapter.startLinking).toHaveBeenCalled();
    });
    
    it('should handle Siri linking on iOS', async () => {
      // Mock iOS platform
      const originalPlatform = Platform.OS;
      Platform.OS = 'ios';
      
      const result = await service.startPlatformLinking(VoicePlatform.SIRI);
      
      expect(result.success).toBe(true);
      expect(result.platform).toBe(VoicePlatform.SIRI);
      expect(mockHomeKitAdapter.startLinking).toHaveBeenCalled();
      
      // Restore
      Platform.OS = originalPlatform;
    });
    
    it('should prevent Siri linking on non-iOS platforms', async () => {
      // Ensure non-iOS platform
      Platform.OS = 'android';
      
      const result = await service.startPlatformLinking(VoicePlatform.SIRI);
      
      expect(result.success).toBe(false);
      expect(result.error).toContain('iOS');
    });
    
    it('should handle linking errors', async () => {
      mockGoogleHomeAdapter.startLinking.mockRejectedValue(new Error('Linking error'));
      
      const result = await service.startPlatformLinking(VoicePlatform.GOOGLE_ASSISTANT);
      
      expect(result.success).toBe(false);
      expect(result.error).toBeTruthy();
    });
    
    it('should check for internet connectivity before linking', async () => {
      (NetInfo.fetch as jest.Mock).mockResolvedValue({ isConnected: false });
      
      const result = await service.startPlatformLinking(VoicePlatform.GOOGLE_ASSISTANT);
      
      expect(result.success).toBe(false);
      expect(result.error).toContain('internet connection');
    });
  });
  
  describe('OAuth callback handling', () => {
    beforeEach(async () => {
      await service.initialize(userId);
    });
    
    it('should handle Google Assistant OAuth callback', async () => {
      mockGoogleHomeAdapter.handleOAuthCallback.mockResolvedValue({
        success: true,
        platform: VoicePlatform.GOOGLE_ASSISTANT,
        accountName: 'test@example.com'
      });
      
      const result = await service.handlePlatformOAuthCallback(
        VoicePlatform.GOOGLE_ASSISTANT,
        'https://example.com/oauth?code=123&state=abc'
      );
      
      expect(result.success).toBe(true);
      expect(mockGoogleHomeAdapter.handleOAuthCallback).toHaveBeenCalledWith(
        'https://example.com/oauth?code=123&state=abc'
      );
      
      // Should update platform link status
      expect(mockConfigRepository.saveConfig).toHaveBeenCalled();
    });
    
    it('should handle OAuth callback errors', async () => {
      mockGoogleHomeAdapter.handleOAuthCallback.mockRejectedValue(new Error('OAuth error'));
      
      const result = await service.handlePlatformOAuthCallback(
        VoicePlatform.GOOGLE_ASSISTANT,
        'https://example.com/oauth?error=access_denied'
      );
      
      expect(result.success).toBe(false);
      expect(result.error).toBeTruthy();
    });
  });
  
  describe('platform unlinking', () => {
    beforeEach(async () => {
      await service.initialize(userId);
    });
    
    it('should unlink from Google Assistant', async () => {
      mockGoogleHomeAdapter.unlink.mockResolvedValue({
        success: true,
        platform: VoicePlatform.GOOGLE_ASSISTANT
      });
      
      const result = await service.unlinkPlatform(VoicePlatform.GOOGLE_ASSISTANT);
      
      expect(result.success).toBe(true);
      expect(mockGoogleHomeAdapter.unlink).toHaveBeenCalled();
      
      // Should update platform link status
      expect(mockConfigRepository.saveConfig).toHaveBeenCalled();
    });
    
    it('should handle unlinking errors', async () => {
      mockGoogleHomeAdapter.unlink.mockRejectedValue(new Error('Unlink error'));
      
      const result = await service.unlinkPlatform(VoicePlatform.GOOGLE_ASSISTANT);
      
      expect(result.success).toBe(false);
      expect(result.error).toBeTruthy();
    });
  });
  
  describe('automation rules', () => {
    beforeEach(async () => {
      await service.initialize(userId);
    });
    
    it('should create an automation rule', async () => {
      const rule = {
        name: 'Test Rule',
        enabled: true,
        triggerDeviceId: mockDevice.id,
        triggerCondition: 'weight > 1000',
        triggerValue: 1000,
        actions: [
          { deviceId: mockDevice.id, action: 'sendNotification' }
        ]
      };
      
      const ruleId = await service.createAutomationRule(rule);
      
      expect(ruleId).toBeTruthy();
      expect(mockConfigRepository.addAutomationRule).toHaveBeenCalled();
    });
    
    it('should update an automation rule', async () => {
      // Mock existing rules
      mockConfigRepository.getConfig.mockResolvedValue({
        userId,
        linkedPlatforms: [],
        deviceSettings: {},
        automationRules: [
          {
            id: 'rule1',
            name: 'Original Rule',
            enabled: true,
            triggerDeviceId: mockDevice.id,
            triggerCondition: 'weight > 1000',
            triggerValue: 1000,
            actions: [],
            createdAt: Date.now(),
            updatedAt: Date.now()
          }
        ],
        notificationPreferences: []
      });
      
      const updates = {
        name: 'Updated Rule',
        enabled: false
      };
      
      const result = await service.updateAutomationRule('rule1', updates);
      
      expect(result).toBe(true);
      expect(mockConfigRepository.saveConfig).toHaveBeenCalled();
    });
    
    it('should delete an automation rule', async () => {
      const result = await service.deleteAutomationRule('rule1');
      
      expect(result).toBe(true);
      expect(mockConfigRepository.deleteAutomationRule).toHaveBeenCalledWith('rule1');
    });
    
    it('should get automation rules', async () => {
      const rules = await service.getAutomationRules();
      
      expect(Array.isArray(rules)).toBe(true);
    });
  });
  
  describe('device settings', () => {
    beforeEach(async () => {
      await service.initialize(userId);
    });
    
    it('should update device settings', async () => {
      mockDeviceRepository.getDevice.mockResolvedValue(mockDevice);
      
      const settings = {
        nickname: 'My Recycling Bin',
        room: 'Kitchen',
        automationEnabled: true,
        notificationsEnabled: true
      };
      
      const result = await service.updateDeviceSettings(mockDevice.id, settings);
      
      expect(result).toBe(true);
      expect(mockConfigRepository.updateDeviceSettings).toHaveBeenCalledWith(
        mockDevice.id,
        settings
      );
    });
    
    it('should not update settings for non-existent device', async () => {
      mockDeviceRepository.getDevice.mockResolvedValue(null);
      
      const result = await service.updateDeviceSettings('unknown-device', {
        automationEnabled: true,
        notificationsEnabled: true
      });
      
      expect(result).toBe(false);
    });
    
    it('should get device settings', async () => {
      const settings = await service.getDeviceSettings(mockDevice.id);
      
      expect(settings).toEqual({
        deviceId: mockDevice.id,
        automationEnabled: true,
        notificationsEnabled: true
      });
      expect(mockConfigRepository.getDeviceSettings).toHaveBeenCalledWith(mockDevice.id);
    });
  });
  
  describe('notification preferences', () => {
    beforeEach(async () => {
      await service.initialize(userId);
    });
    
    it('should update notification preferences', async () => {
      const preferences = [
        {
          eventType: 'binFull',
          enabled: true,
          devices: [mockDevice.id],
          quietHoursStart: 22,
          quietHoursEnd: 8
        }
      ];
      
      const result = await service.updateNotificationPreferences(preferences);
      
      expect(result).toBe(true);
      expect(mockConfigRepository.updateNotificationPreferences).toHaveBeenCalledWith(preferences);
    });
    
    it('should get notification preferences', async () => {
      const preferences = await service.getNotificationPreferences();
      
      expect(Array.isArray(preferences)).toBe(true);
    });
  });
  
  describe('data management', () => {
    beforeEach(async () => {
      await service.initialize(userId);
    });
    
    it('should clear all data', async () => {
      // Mock a connected device
      mockDeviceRepository.getConnectedDevices.mockResolvedValue([
        { ...mockDevice, connectionStatus: ConnectionStatus.CONNECTED }
      ]);
      
      const result = await service.clearAllData();
      
      expect(result).toBe(true);
      expect(mockBLEManager.disconnect).toHaveBeenCalledWith(mockDevice.id);
      expect(mockDeviceRepository.clearDevices).toHaveBeenCalled();
      expect(mockConfigRepository.clearConfig).toHaveBeenCalled();
      expect((service as any).initialized).toBe(false);
    });
  });
  
  describe('error handling', () => {
    it('should throw error if not initialized', async () => {
      // Create a new service without initializing
      const uninitializedService = new SmartHomeService();
      
      await expect(uninitializedService.getDevices()).rejects.toThrow('not initialized');
    });
  });
  
  describe('event handling', () => {
    beforeEach(async () => {
      await service.initialize(userId);
    });
    
    it('should forward BLE manager events', () => {
      // Set up event listener
      const deviceDiscoveredHandler = jest.fn();
      service.on('deviceDiscovered', deviceDiscoveredHandler);
      
      // Trigger event from BLE manager
      mockBLEManager.emit('deviceDiscovered', { id: 'discovered-device' });
      
      expect(deviceDiscoveredHandler).toHaveBeenCalledWith({ id: 'discovered-device' });
    });
    
    it('should forward voice platform events', () => {
      // Set up event listener
      const commandHandler = jest.fn();
      service.on('voiceCommandReceived', commandHandler);
      
      // Trigger event from Google Home adapter
      mockGoogleHomeAdapter.emit('commandReceived', { 
        intent: 'GetRecyclingSchedule',
        parameters: {}
      });
      
      expect(commandHandler).toHaveBeenCalledWith(expect.objectContaining({
        platform: VoicePlatform.GOOGLE_ASSISTANT,
        intent: 'GetRecyclingSchedule'
      }));
    });
  });
}); 