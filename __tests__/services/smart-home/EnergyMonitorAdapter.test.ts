import AsyncStorage from '@react-native-async-storage/async-storage';
import { EnergyMonitorAdapter, EnergyMonitorSettings, MonitorModel } from '../../../src/services/smart-home/adapters/EnergyMonitorAdapter';
import { BLEManager } from '../../../src/services/smart-home/protocols/BLEManager';
import { DeviceType, SmartHomeDevice } from '../../../src/services/smart-home/SmartHomeService';

// Mock dependencies
jest.mock('@react-native-async-storage/async-storage', () => ({
  getItem: jest.fn(),
  setItem: jest.fn(),
  removeItem: jest.fn(),
  clear: jest.fn(),
}));

describe('EnergyMonitorAdapter', () => {
  let adapter: EnergyMonitorAdapter;
  let mockBLEManager: BLEManager;
  
  const mockMonitorDevice: SmartHomeDevice = {
    id: 'test-monitor-id',
    name: 'Test Energy Monitor',
    type: DeviceType.ENERGY_MONITOR,
    connectionType: 'ble',
    connectionStatus: 'connected',
    manufacturer: 'EcoEnergy',
    model: 'Pro',
    capabilities: ['power-monitoring', 'energy-tracking'],
    lastSyncTimestamp: Date.now(),
    metadata: {
      serviceUUIDs: ['0000ee00-0000-1000-8000-00805f9b34fb'], // ECO_ENERGY_PRO
    }
  };
  
  beforeEach(() => {
    jest.clearAllMocks();
    
    // Create mock BLEManager
    mockBLEManager = new BLEManager();
    
    // Mock BLEManager methods
    mockBLEManager.connect = jest.fn().mockResolvedValue(true);
    mockBLEManager.disconnect = jest.fn().mockResolvedValue(true);
    mockBLEManager.readCharacteristic = jest.fn().mockImplementation((deviceId, serviceUUID, characteristicUUID) => {
      // Return different mock data based on characteristic
      if (characteristicUUID.includes('POWER')) {
        return Promise.resolve(new Uint8Array([0x01, 0xF4])); // 500 watts
      } else if (characteristicUUID.includes('VOLTAGE')) {
        return Promise.resolve(new Uint8Array([0x09, 0x3E])); // 238.0 volts (2380 / 10)
      } else if (characteristicUUID.includes('CURRENT')) {
        return Promise.resolve(new Uint8Array([0x00, 0x96])); // 1.50 amps (150 / 100)
      } else if (characteristicUUID.includes('ENERGY')) {
        return Promise.resolve(new Uint8Array([0x00, 0x00, 0x04, 0xB0])); // 1.2 kWh (1200 / 1000)
      } else if (characteristicUUID.includes('FREQUENCY')) {
        return Promise.resolve(new Uint8Array([60])); // 60 Hz
      } else if (characteristicUUID.includes('POWER_FACTOR')) {
        return Promise.resolve(new Uint8Array([85])); // 0.85 (85 / 100)
      } else if (characteristicUUID.includes('BATTERY')) {
        return Promise.resolve(new Uint8Array([90])); // 90% battery
      } else if (characteristicUUID.includes('APPLIANCE')) {
        return Promise.resolve(new Uint8Array([5])); // oven
      } else if (characteristicUUID.includes('MONITOR_SETTINGS')) {
        return Promise.resolve(new Uint8Array([10, 0x07, 0xD0, 5, 1, 1, 0x00, 0x0F])); // settings
      }
      return Promise.resolve(new Uint8Array([0]));
    });
    
    mockBLEManager.writeCharacteristic = jest.fn().mockResolvedValue(true);
    
    // Create adapter with mock BLEManager
    adapter = new EnergyMonitorAdapter(mockBLEManager);
  });
  
  describe('initialization', () => {
    it('should initialize the adapter', async () => {
      // Mock AsyncStorage.getItem to return null (no stored data)
      (AsyncStorage.getItem as jest.Mock).mockResolvedValueOnce(null);
      
      await adapter.initialize();
      
      // Should set up event listeners on BLEManager
      expect(mockBLEManager.on).toHaveBeenCalledWith('deviceConnected', expect.any(Function));
      expect(mockBLEManager.on).toHaveBeenCalledWith('deviceDisconnected', expect.any(Function));
      expect(mockBLEManager.on).toHaveBeenCalledWith('dataReceived', expect.any(Function));
    });
    
    it('should load persisted data on initialization', async () => {
      // Mock persisted data
      const mockData = {
        readings: {
          'test-monitor-id': {
            timestamp: Date.now(),
            power: 450,
            voltage: 230,
            current: 1.95,
            energy: 1.1,
            frequency: 50,
            powerFactor: 0.9,
            batteryLevel: 85
          }
        },
        settings: {
          'test-monitor-id': {
            reportingInterval: 10,
            highUsageThreshold: 2000,
            standbyThreshold: 5,
            enableApplianceDetection: true,
            enableNotifications: true,
            costPerKwh: 0.15
          }
        },
        stats: {
          'test-monitor-id': {
            totalEnergyToday: 8.5,
            totalEnergyCost: 1.28,
            peakUsage: 2500,
            averagePower: 450,
            usageHistory: [],
            detectedAppliances: { refrigerator: 5, oven: 2 },
            dailyUsage: { '2025-04-25': 8.5 },
            hourlyUsage: { '10': 0.5, '12': 1.2, '18': 3.5 }
          }
        }
      };
      
      (AsyncStorage.getItem as jest.Mock).mockResolvedValueOnce(JSON.stringify(mockData));
      
      await adapter.initialize();
      
      // Should have loaded persisted data
      expect(AsyncStorage.getItem).toHaveBeenCalled();
    });
  });
  
  describe('device detection', () => {
    it('should detect supported energy monitor devices', () => {
      const supportedDevice = {
        id: 'monitor-1',
        name: 'Eco Energy',
        serviceUUIDs: ['0000ee00-0000-1000-8000-00805f9b34fb'] // ECO_ENERGY_PRO
      };
      
      const unsupportedDevice = {
        id: 'not-a-monitor',
        name: 'Some Device',
        serviceUUIDs: ['00001234-0000-1000-8000-00805f9b34fb']
      };
      
      expect(adapter.isSupportedMonitor(supportedDevice)).toBe(true);
      expect(adapter.isSupportedMonitor(unsupportedDevice)).toBe(false);
    });
    
    it('should correctly identify monitor model from service UUIDs', () => {
      const ecoEnergyPro = {
        id: 'monitor-1',
        serviceUUIDs: ['0000ee00-0000-1000-8000-00805f9b34fb'] // ECO_ENERGY_PRO
      };
      
      const smartMeter = {
        id: 'monitor-2',
        serviceUUIDs: ['0000ee01-0000-1000-8000-00805f9b34fb'] // SMART_METER
      };
      
      expect(adapter.getMonitorModel(ecoEnergyPro)).toBe(MonitorModel.ECO_ENERGY_PRO);
      expect(adapter.getMonitorModel(smartMeter)).toBe(MonitorModel.SMART_METER);
      expect(adapter.getMonitorModel({ id: 'unknown', serviceUUIDs: [] })).toBeNull();
    });
  });
  
  describe('connection management', () => {
    it('should connect to an energy monitor device', async () => {
      // Set up AsyncStorage mock for persisted data
      (AsyncStorage.getItem as jest.Mock).mockResolvedValue(null);
      (AsyncStorage.setItem as jest.Mock).mockResolvedValue(undefined);
      
      // Set up event listener to test event emission
      const connectListener = jest.fn();
      adapter.on('monitorConnected', connectListener);
      
      const result = await adapter.connectToMonitor(mockMonitorDevice);
      
      expect(result).toBe(true);
      expect(mockBLEManager.connect).toHaveBeenCalledWith(mockMonitorDevice.id);
      expect(connectListener).toHaveBeenCalledWith(mockMonitorDevice);
      
      // Should read initial data
      expect(mockBLEManager.readCharacteristic).toHaveBeenCalled();
      
      // Should persist connection data
      expect(AsyncStorage.setItem).toHaveBeenCalled();
    });
    
    it('should disconnect from an energy monitor device', async () => {
      // First connect to a monitor
      await adapter.connectToMonitor(mockMonitorDevice);
      
      // Set up event listener to test event emission
      const disconnectListener = jest.fn();
      adapter.on('monitorDisconnected', disconnectListener);
      
      const result = await adapter.disconnectFromMonitor(mockMonitorDevice.id);
      
      expect(result).toBe(true);
      expect(mockBLEManager.disconnect).toHaveBeenCalledWith(mockMonitorDevice.id);
      expect(disconnectListener).toHaveBeenCalledWith(mockMonitorDevice.id);
      
      // Should persist connection data
      expect(AsyncStorage.setItem).toHaveBeenCalled();
    });
  });
  
  describe('data management', () => {
    beforeEach(async () => {
      // Connect to monitor for testing data methods
      await adapter.connectToMonitor(mockMonitorDevice);
    });
    
    it('should get energy monitor reading data', async () => {
      const reading = adapter.getMonitorReading(mockMonitorDevice.id);
      
      expect(reading).not.toBeNull();
      expect(reading?.power).toBe(500); // From mock readCharacteristic
      expect(reading?.voltage).toBe(238.0);
      expect(reading?.current).toBe(1.5);
      expect(reading?.energy).toBe(1.2);
      expect(reading?.frequency).toBe(60);
      expect(reading?.powerFactor).toBe(0.85);
      expect(reading?.batteryLevel).toBe(90);
      expect(reading?.appliance).toBe('oven');
    });
    
    it('should update monitor settings', async () => {
      const newSettings: Partial<EnergyMonitorSettings> = {
        highUsageThreshold: 2500,
        enableNotifications: false
      };
      
      const result = await adapter.updateMonitorSettings(mockMonitorDevice.id, newSettings);
      
      expect(result).toBe(true);
      
      // Should apply settings to device
      expect(mockBLEManager.writeCharacteristic).toHaveBeenCalled();
      
      // Get updated settings
      const settings = adapter.getMonitorSettings(mockMonitorDevice.id);
      expect(settings?.highUsageThreshold).toBe(2500);
      expect(settings?.enableNotifications).toBe(false);
    });
    
    it('should reset energy statistics', () => {
      // Set up event listener to test event emission
      const resetListener = jest.fn();
      adapter.on('energyStatsReset', resetListener);
      
      const result = adapter.resetEnergyStats(mockMonitorDevice.id);
      
      expect(result).toBe(true);
      expect(resetListener).toHaveBeenCalledWith(mockMonitorDevice.id);
      
      // Should reset stats
      const stats = adapter.getEnergyStats(mockMonitorDevice.id);
      expect(stats?.totalEnergyToday).toBe(0);
      expect(stats?.totalEnergyCost).toBe(0);
      expect(stats?.peakUsage).toBe(0);
    });
    
    it('should calculate energy cost based on consumption', () => {
      // First update cost setting
      adapter.updateMonitorSettings(mockMonitorDevice.id, { costPerKwh: 0.20 });
      
      const cost = adapter.calculateEnergyCost(mockMonitorDevice.id, 10); // 10 kWh
      
      expect(cost).toBe(2.0); // 10 kWh * $0.20/kWh = $2.00
    });
    
    it('should provide efficiency recommendations', () => {
      const recommendations = adapter.getEfficiencyRecommendations(mockMonitorDevice.id);
      
      expect(Array.isArray(recommendations)).toBe(true);
      
      // Test with standby device
      // Mock reading with standby power
      const mockReading = adapter.getMonitorReading(mockMonitorDevice.id);
      mockReading!.power = 10; // Above default standbyThreshold of 5
      adapter['monitorReadings'].set(mockMonitorDevice.id, mockReading!);
      
      const standbyRecommendations = adapter.getEfficiencyRecommendations(mockMonitorDevice.id);
      expect(standbyRecommendations.some(r => r.includes('standby'))).toBe(true);
      
      // Test with high usage device
      mockReading!.power = 3000; // Above default highUsageThreshold of 2000
      adapter['monitorReadings'].set(mockMonitorDevice.id, mockReading!);
      
      const highUsageRecommendations = adapter.getEfficiencyRecommendations(mockMonitorDevice.id);
      expect(highUsageRecommendations.some(r => r.includes('more power'))).toBe(true);
    });
  });
  
  describe('event handling', () => {
    it('should handle device connection events', () => {
      // Mock a connected device and emit a connection event
      const deviceConnectedHandler = jest.fn();
      adapter.on('monitorConnected', deviceConnectedHandler);
      
      // Simulate device connected event from BLEManager
      const mockOnFunction = mockBLEManager.on as jest.Mock;
      const connectionCallback = mockOnFunction.mock.calls.find(call => call[0] === 'deviceConnected')[1];
      
      // Call the connection callback with a supported monitor device
      connectionCallback({
        id: 'new-monitor',
        name: 'New Monitor',
        type: DeviceType.ENERGY_MONITOR,
        serviceUUIDs: ['0000ee00-0000-1000-8000-00805f9b34fb']
      });
      
      expect(deviceConnectedHandler).toHaveBeenCalled();
    });
    
    it('should handle device disconnection events', async () => {
      // First connect to a monitor
      await adapter.connectToMonitor(mockMonitorDevice);
      
      // Mock a disconnection event handler
      const deviceDisconnectedHandler = jest.fn();
      adapter.on('monitorDisconnected', deviceDisconnectedHandler);
      
      // Simulate device disconnected event from BLEManager
      const mockOnFunction = mockBLEManager.on as jest.Mock;
      const disconnectionCallback = mockOnFunction.mock.calls.find(call => call[0] === 'deviceDisconnected')[1];
      
      // Call the disconnection callback with the monitor ID
      disconnectionCallback(mockMonitorDevice.id);
      
      expect(deviceDisconnectedHandler).toHaveBeenCalledWith(mockMonitorDevice.id);
    });
    
    it('should handle data received events', async () => {
      // First connect to a monitor
      await adapter.connectToMonitor(mockMonitorDevice);
      
      // Mock event handlers
      const powerChangedHandler = jest.fn();
      const energyChangedHandler = jest.fn();
      
      adapter.on('powerChanged', powerChangedHandler);
      adapter.on('energyChanged', energyChangedHandler);
      
      // Simulate data received event from BLEManager
      const mockOnFunction = mockBLEManager.on as jest.Mock;
      const dataReceivedCallback = mockOnFunction.mock.calls.find(call => call[0] === 'dataReceived')[1];
      
      // Call the data received callback with power data
      dataReceivedCallback({
        deviceId: mockMonitorDevice.id,
        serviceUUID: '0000ee00-0000-1000-8000-00805f9b34fb',
        characteristicUUID: '00000101-0000-1000-8000-00805f9b34fb', // POWER
        value: new Uint8Array([0x03, 0xE8]) // 1000 watts
      });
      
      expect(powerChangedHandler).toHaveBeenCalledWith(expect.objectContaining({
        deviceId: mockMonitorDevice.id,
        power: 1000
      }));
      
      // Call the data received callback with energy data
      dataReceivedCallback({
        deviceId: mockMonitorDevice.id,
        serviceUUID: '0000ee00-0000-1000-8000-00805f9b34fb',
        characteristicUUID: '00000104-0000-1000-8000-00805f9b34fb', // ENERGY
        value: new Uint8Array([0x00, 0x00, 0x07, 0xD0]) // 2.0 kWh (2000 / 1000)
      });
      
      expect(energyChangedHandler).toHaveBeenCalledWith(expect.objectContaining({
        deviceId: mockMonitorDevice.id,
        energy: 2.0
      }));
    });
    
    it('should emit high energy usage event when power exceeds threshold', async () => {
      // First connect to a monitor
      await adapter.connectToMonitor(mockMonitorDevice);
      
      // Update settings with a low threshold
      await adapter.updateMonitorSettings(mockMonitorDevice.id, {
        enableNotifications: true,
        highUsageThreshold: 1500
      });
      
      // Mock high usage event handler
      const highUsageHandler = jest.fn();
      adapter.on('highEnergyUsage', highUsageHandler);
      
      // Simulate data received event from BLEManager with high power usage
      const mockOnFunction = mockBLEManager.on as jest.Mock;
      const dataReceivedCallback = mockOnFunction.mock.calls.find(call => call[0] === 'dataReceived')[1];
      
      // Call the data received callback with power data (2000W > 1500W threshold)
      dataReceivedCallback({
        deviceId: mockMonitorDevice.id,
        serviceUUID: '0000ee00-0000-1000-8000-00805f9b34fb',
        characteristicUUID: '00000101-0000-1000-8000-00805f9b34fb', // POWER
        value: new Uint8Array([0x07, 0xD0]) // 2000 watts
      });
      
      expect(highUsageHandler).toHaveBeenCalledWith(expect.objectContaining({
        deviceId: mockMonitorDevice.id,
        power: 2000,
        threshold: 1500
      }));
    });
  });
}); 