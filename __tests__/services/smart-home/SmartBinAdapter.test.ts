import AsyncStorage from '@react-native-async-storage/async-storage';
import { BinModel, BinSettings, SmartBinAdapter } from '../../../src/services/smart-home/adapters/SmartBinAdapter';
import { BLEManager } from '../../../src/services/smart-home/protocols/BLEManager';
import { DeviceType, SmartHomeDevice } from '../../../src/services/smart-home/SmartHomeService';

// Mock dependencies
jest.mock('@react-native-async-storage/async-storage', () => ({
  getItem: jest.fn(),
  setItem: jest.fn(),
  removeItem: jest.fn(),
  clear: jest.fn(),
}));

describe('SmartBinAdapter', () => {
  let adapter: SmartBinAdapter;
  let mockBLEManager: BLEManager;
  
  const mockBinDevice: SmartHomeDevice = {
    id: 'test-bin-id',
    name: 'Test Bin',
    type: DeviceType.RECYCLING_BIN,
    connectionType: 'ble',
    connectionStatus: 'connected',
    manufacturer: 'EcoBin',
    model: 'Pro',
    capabilities: ['weight-tracking', 'fill-level'],
    lastSyncTimestamp: Date.now(),
    metadata: {
      serviceUUIDs: ['000000ff-0000-1000-8000-00805f9b34fb'],
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
      if (characteristicUUID.includes('WEIGHT')) {
        return Promise.resolve(new Uint8Array([0x01, 0x2C])); // 300 grams
      } else if (characteristicUUID.includes('FILL_LEVEL')) {
        return Promise.resolve(new Uint8Array([45])); // 45% full
      } else if (characteristicUUID.includes('BATTERY')) {
        return Promise.resolve(new Uint8Array([80])); // 80% battery
      } else if (characteristicUUID.includes('LID_STATUS')) {
        return Promise.resolve(new Uint8Array([0])); // closed
      } else if (characteristicUUID.includes('MATERIAL_DETECTION')) {
        return Promise.resolve(new Uint8Array([1])); // plastic
      } else if (characteristicUUID.includes('BIN_SETTINGS')) {
        return Promise.resolve(new Uint8Array([80, 1, 1, 1, 30])); // settings
      }
      return Promise.resolve(new Uint8Array([0]));
    });
    
    mockBLEManager.writeCharacteristic = jest.fn().mockResolvedValue(true);
    
    // Create adapter with mock BLEManager
    adapter = new SmartBinAdapter(mockBLEManager);
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
        measurements: {
          'test-bin-id': {
            timestamp: Date.now(),
            weight: 250,
            fillLevel: 40,
            batteryLevel: 75,
            isLidOpen: false
          }
        },
        settings: {
          'test-bin-id': {
            notifyWhenFull: true,
            fullThreshold: 80,
            weightCalibration: 1.0,
            autoDetectMaterials: true,
            enableWeightTracking: true,
            lidCloseTimeout: 30
          }
        },
        stats: {
          'test-bin-id': {
            totalWeight: 1000,
            averageFillLevel: 35,
            emptyCount: 2,
            lastEmptied: Date.now() - 86400000, // 1 day ago
            materialsDetected: { plastic: 5, paper: 3 },
            weightHistory: [],
            fillHistory: []
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
    it('should detect supported bin devices', () => {
      const supportedDevice = {
        id: 'bin-1',
        name: 'Eco Bin',
        serviceUUIDs: ['000000ff-0000-1000-8000-00805f9b34fb'] // ECO_BIN_PRO
      };
      
      const unsupportedDevice = {
        id: 'not-a-bin',
        name: 'Some Device',
        serviceUUIDs: ['00001234-0000-1000-8000-00805f9b34fb']
      };
      
      expect(adapter.isSupportedBin(supportedDevice)).toBe(true);
      expect(adapter.isSupportedBin(unsupportedDevice)).toBe(false);
    });
    
    it('should correctly identify bin model from service UUIDs', () => {
      const ecoBinPro = {
        id: 'bin-1',
        serviceUUIDs: ['000000ff-0000-1000-8000-00805f9b34fb'] // ECO_BIN_PRO
      };
      
      const smartRecycler = {
        id: 'bin-2',
        serviceUUIDs: ['0000aa00-0000-1000-8000-00805f9b34fb'] // SMART_RECYCLER
      };
      
      expect(adapter.getBinModel(ecoBinPro)).toBe(BinModel.ECO_BIN_PRO);
      expect(adapter.getBinModel(smartRecycler)).toBe(BinModel.SMART_RECYCLER);
      expect(adapter.getBinModel({ id: 'unknown', serviceUUIDs: [] })).toBeNull();
    });
  });
  
  describe('connection management', () => {
    it('should connect to a bin device', async () => {
      // Set up AsyncStorage mock for persisted data
      (AsyncStorage.getItem as jest.Mock).mockResolvedValue(null);
      (AsyncStorage.setItem as jest.Mock).mockResolvedValue(undefined);
      
      // Set up event listener to test event emission
      const connectListener = jest.fn();
      adapter.on('binConnected', connectListener);
      
      const result = await adapter.connectToBin(mockBinDevice);
      
      expect(result).toBe(true);
      expect(mockBLEManager.connect).toHaveBeenCalledWith(mockBinDevice.id);
      expect(connectListener).toHaveBeenCalledWith(mockBinDevice);
      
      // Should read initial data
      expect(mockBLEManager.readCharacteristic).toHaveBeenCalled();
      
      // Should persist connection data
      expect(AsyncStorage.setItem).toHaveBeenCalled();
    });
    
    it('should disconnect from a bin device', async () => {
      // First connect to a bin
      await adapter.connectToBin(mockBinDevice);
      
      // Set up event listener to test event emission
      const disconnectListener = jest.fn();
      adapter.on('binDisconnected', disconnectListener);
      
      const result = await adapter.disconnectFromBin(mockBinDevice.id);
      
      expect(result).toBe(true);
      expect(mockBLEManager.disconnect).toHaveBeenCalledWith(mockBinDevice.id);
      expect(disconnectListener).toHaveBeenCalledWith(mockBinDevice.id);
      
      // Should persist connection data
      expect(AsyncStorage.setItem).toHaveBeenCalled();
    });
  });
  
  describe('data management', () => {
    beforeEach(async () => {
      // Connect to bin for testing data methods
      await adapter.connectToBin(mockBinDevice);
    });
    
    it('should get bin measurement data', async () => {
      const measurement = adapter.getBinMeasurement(mockBinDevice.id);
      
      expect(measurement).not.toBeNull();
      expect(measurement?.weight).toBe(300); // From mock readCharacteristic
      expect(measurement?.fillLevel).toBe(45);
      expect(measurement?.batteryLevel).toBe(80);
      expect(measurement?.isLidOpen).toBe(false);
      expect(measurement?.materialType).toBe('plastic');
    });
    
    it('should update bin settings', async () => {
      const newSettings: Partial<BinSettings> = {
        notifyWhenFull: false,
        fullThreshold: 90
      };
      
      const result = await adapter.updateBinSettings(mockBinDevice.id, newSettings);
      
      expect(result).toBe(true);
      
      // Should apply settings to device
      expect(mockBLEManager.writeCharacteristic).toHaveBeenCalled();
      
      // Get updated settings
      const settings = adapter.getBinSettings(mockBinDevice.id);
      expect(settings?.notifyWhenFull).toBe(false);
      expect(settings?.fullThreshold).toBe(90);
    });
    
    it('should handle bin emptied event', () => {
      // Set up event listener to test event emission
      const emptyListener = jest.fn();
      adapter.on('binEmptied', emptyListener);
      
      const result = adapter.registerBinEmptied(mockBinDevice.id);
      
      expect(result).toBe(true);
      expect(emptyListener).toHaveBeenCalledWith(mockBinDevice.id);
      
      // Should update stats
      const stats = adapter.getBinStats(mockBinDevice.id);
      expect(stats?.emptyCount).toBe(1);
      expect(stats?.totalWeight).toBe(0); // Reset after emptying
      
      // Should update measurement
      const measurement = adapter.getBinMeasurement(mockBinDevice.id);
      expect(measurement?.weight).toBe(0);
      expect(measurement?.fillLevel).toBe(0);
    });
    
    it('should calibrate weight sensor', async () => {
      // Set up event listener to test event emission
      const calibrateListener = jest.fn();
      adapter.on('binCalibrated', calibrateListener);
      
      const result = await adapter.calibrateWeightSensor(mockBinDevice.id);
      
      expect(result).toBe(true);
      expect(calibrateListener).toHaveBeenCalledWith(mockBinDevice.id);
      
      // Should send calibration command
      expect(mockBLEManager.writeCharacteristic).toHaveBeenCalledWith(
        mockBinDevice.id,
        expect.any(String),
        expect.stringContaining('SETTINGS'),
        expect.any(Uint8Array)
      );
    });
  });
  
  describe('event handling', () => {
    it('should handle device connection events', () => {
      // Mock a connected device and emit a connection event
      const deviceConnectedHandler = jest.fn();
      adapter.on('binConnected', deviceConnectedHandler);
      
      // Simulate device connected event from BLEManager
      const mockOnFunction = mockBLEManager.on as jest.Mock;
      const connectionCallback = mockOnFunction.mock.calls.find(call => call[0] === 'deviceConnected')[1];
      
      // Call the connection callback with a supported bin device
      connectionCallback({
        id: 'new-bin',
        name: 'New Bin',
        type: DeviceType.RECYCLING_BIN,
        serviceUUIDs: ['000000ff-0000-1000-8000-00805f9b34fb']
      });
      
      expect(deviceConnectedHandler).toHaveBeenCalled();
    });
    
    it('should handle device disconnection events', async () => {
      // First connect to a bin
      await adapter.connectToBin(mockBinDevice);
      
      // Mock a disconnection event handler
      const deviceDisconnectedHandler = jest.fn();
      adapter.on('binDisconnected', deviceDisconnectedHandler);
      
      // Simulate device disconnected event from BLEManager
      const mockOnFunction = mockBLEManager.on as jest.Mock;
      const disconnectionCallback = mockOnFunction.mock.calls.find(call => call[0] === 'deviceDisconnected')[1];
      
      // Call the disconnection callback with the bin ID
      disconnectionCallback(mockBinDevice.id);
      
      expect(deviceDisconnectedHandler).toHaveBeenCalledWith(mockBinDevice.id);
    });
    
    it('should handle data received events', async () => {
      // First connect to a bin
      await adapter.connectToBin(mockBinDevice);
      
      // Mock event handlers
      const weightChangedHandler = jest.fn();
      const fillLevelChangedHandler = jest.fn();
      
      adapter.on('binWeightChanged', weightChangedHandler);
      adapter.on('binFillLevelChanged', fillLevelChangedHandler);
      
      // Simulate data received event from BLEManager
      const mockOnFunction = mockBLEManager.on as jest.Mock;
      const dataReceivedCallback = mockOnFunction.mock.calls.find(call => call[0] === 'dataReceived')[1];
      
      // Call the data received callback with weight data
      dataReceivedCallback({
        deviceId: mockBinDevice.id,
        serviceUUID: '000000ff-0000-1000-8000-00805f9b34fb',
        characteristicUUID: '00000001-0000-1000-8000-00805f9b34fb', // WEIGHT
        value: new Uint8Array([0x02, 0x58]) // 600 grams
      });
      
      expect(weightChangedHandler).toHaveBeenCalledWith(expect.objectContaining({
        deviceId: mockBinDevice.id,
        weight: 600
      }));
      
      // Call the data received callback with fill level data
      dataReceivedCallback({
        deviceId: mockBinDevice.id,
        serviceUUID: '000000ff-0000-1000-8000-00805f9b34fb',
        characteristicUUID: '00000002-0000-1000-8000-00805f9b34fb', // FILL_LEVEL
        value: new Uint8Array([75]) // 75% full
      });
      
      expect(fillLevelChangedHandler).toHaveBeenCalledWith(expect.objectContaining({
        deviceId: mockBinDevice.id,
        fillLevel: 75
      }));
    });
    
    it('should emit bin full event when fill level exceeds threshold', async () => {
      // First connect to a bin
      await adapter.connectToBin(mockBinDevice);
      
      // Update settings with a low threshold
      await adapter.updateBinSettings(mockBinDevice.id, {
        notifyWhenFull: true,
        fullThreshold: 70
      });
      
      // Mock bin full event handler
      const binFullHandler = jest.fn();
      adapter.on('binFull', binFullHandler);
      
      // Simulate data received event from BLEManager with a high fill level
      const mockOnFunction = mockBLEManager.on as jest.Mock;
      const dataReceivedCallback = mockOnFunction.mock.calls.find(call => call[0] === 'dataReceived')[1];
      
      // Call the data received callback with fill level data (80% > 70% threshold)
      dataReceivedCallback({
        deviceId: mockBinDevice.id,
        serviceUUID: '000000ff-0000-1000-8000-00805f9b34fb',
        characteristicUUID: '00000002-0000-1000-8000-00805f9b34fb', // FILL_LEVEL
        value: new Uint8Array([80]) // 80% full
      });
      
      expect(binFullHandler).toHaveBeenCalledWith(expect.objectContaining({
        deviceId: mockBinDevice.id,
        fillLevel: 80,
        threshold: 70
      }));
    });
  });
}); 