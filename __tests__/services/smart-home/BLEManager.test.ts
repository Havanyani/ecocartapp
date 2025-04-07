import { Platform } from 'react-native';
import { BLEManager } from '../../../src/services/smart-home/protocols/BLEManager';

// Mock react-native-ble-plx
jest.mock('react-native-ble-plx', () => {
  const mockDeviceEvents = new Map();
  const mockConnectedDevices = [];
  
  class MockBleManager {
    onStateChange = jest.fn((callback) => {
      callback('PoweredOn');
      return { remove: jest.fn() };
    });
    
    state = jest.fn().mockResolvedValue('PoweredOn');
    
    startDeviceScan = jest.fn((serviceUUIDs, options, callback) => {
      // Simulate finding devices
      setTimeout(() => {
        callback(null, {
          id: 'device1',
          name: 'Test Device 1',
          serviceUUIDs: ['000000ff-0000-1000-8000-00805f9b34fb'],
          rssi: -60,
          isConnectable: true
        });
      }, 100);
      
      setTimeout(() => {
        callback(null, {
          id: 'device2',
          name: 'Test Device 2',
          serviceUUIDs: ['0000ee00-0000-1000-8000-00805f9b34fb'],
          rssi: -70,
          isConnectable: true
        });
      }, 200);
    });
    
    stopDeviceScan = jest.fn();
    
    connectToDevice = jest.fn((deviceId) => {
      const device = {
        id: deviceId,
        name: deviceId === 'device1' ? 'Test Device 1' : 'Test Device 2',
        serviceUUIDs: deviceId === 'device1' 
          ? ['000000ff-0000-1000-8000-00805f9b34fb'] 
          : ['0000ee00-0000-1000-8000-00805f9b34fb'],
        onDisconnected: jest.fn((callback) => {
          mockDeviceEvents.set(deviceId, callback);
          return { remove: jest.fn() };
        }),
        discoverAllServicesAndCharacteristics: jest.fn().mockResolvedValue(),
        services: jest.fn().mockResolvedValue([
          { uuid: deviceId === 'device1' ? '000000ff-0000-1000-8000-00805f9b34fb' : '0000ee00-0000-1000-8000-00805f9b34fb' }
        ]),
        readCharacteristicForService: jest.fn().mockResolvedValue({
          value: 'SGVsbG8=' // Base64 for "Hello"
        }),
        writeCharacteristicWithResponseForService: jest.fn().mockResolvedValue({
          value: 'SGVsbG8=' // Base64 for "Hello"
        }),
        monitorCharacteristicForService: jest.fn((serviceUUID, characteristicUUID, callback) => {
          // Simulate value updates
          setTimeout(() => {
            callback(null, { value: 'SGVsbG8=' });
          }, 100);
          
          return { remove: jest.fn() };
        }),
        cancelConnection: jest.fn().mockResolvedValue()
      };
      
      mockConnectedDevices.push(device);
      return Promise.resolve(device);
    });
    
    // Helper to simulate disconnection
    simulateDisconnect(deviceId) {
      const callback = mockDeviceEvents.get(deviceId);
      if (callback) {
        callback(null, { id: deviceId });
      }
      const deviceIndex = mockConnectedDevices.findIndex(d => d.id === deviceId);
      if (deviceIndex >= 0) {
        mockConnectedDevices.splice(deviceIndex, 1);
      }
    }
    
    connectedDevices = jest.fn().mockResolvedValue(mockConnectedDevices);
  }
  
  return {
    BleManager: MockBleManager
  };
});

// Mock react-native PermissionsAndroid
jest.mock('react-native', () => {
  const ReactNative = jest.requireActual('react-native');
  
  return {
    ...ReactNative,
    Platform: {
      ...ReactNative.Platform,
      OS: 'android',
      Version: 31
    },
    PermissionsAndroid: {
      PERMISSIONS: {
        ACCESS_FINE_LOCATION: 'android.permission.ACCESS_FINE_LOCATION',
        BLUETOOTH_SCAN: 'android.permission.BLUETOOTH_SCAN',
        BLUETOOTH_CONNECT: 'android.permission.BLUETOOTH_CONNECT',
      },
      RESULTS: {
        GRANTED: 'granted',
        DENIED: 'denied',
      },
      request: jest.fn().mockResolvedValue('granted'),
      requestMultiple: jest.fn().mockResolvedValue({
        'android.permission.BLUETOOTH_SCAN': 'granted',
        'android.permission.BLUETOOTH_CONNECT': 'granted',
        'android.permission.ACCESS_FINE_LOCATION': 'granted',
      }),
    },
    NativeEventEmitter: jest.fn().mockImplementation(() => ({
      addListener: jest.fn(),
      removeListener: jest.fn(),
    })),
  };
});

describe('BLEManager', () => {
  let bleManager: BLEManager;
  let mockBleManagerInstance;
  
  beforeEach(() => {
    jest.clearAllMocks();
    bleManager = new BLEManager();
    // Get access to the mock instance for testing
    mockBleManagerInstance = (bleManager as any).manager;
  });
  
  describe('initialize', () => {
    it('should initialize successfully and request permissions', async () => {
      const result = await bleManager.initialize();
      
      expect(result).toBe(true);
      expect(mockBleManagerInstance.onStateChange).toHaveBeenCalled();
      
      // Check permissions request for Android
      if (Platform.OS === 'android') {
        if (Platform.Version <= 30) {
          expect(Platform.PermissionsAndroid.request).toHaveBeenCalledWith(
            Platform.PermissionsAndroid.PERMISSIONS.ACCESS_FINE_LOCATION,
            expect.any(Object)
          );
        } else {
          expect(Platform.PermissionsAndroid.requestMultiple).toHaveBeenCalledWith([
            Platform.PermissionsAndroid.PERMISSIONS.BLUETOOTH_SCAN,
            Platform.PermissionsAndroid.PERMISSIONS.BLUETOOTH_CONNECT,
            Platform.PermissionsAndroid.PERMISSIONS.ACCESS_FINE_LOCATION,
          ]);
        }
      }
    });
    
    it('should handle initialization failure', async () => {
      // Mock permission denial
      if (Platform.OS === 'android') {
        Platform.PermissionsAndroid.requestMultiple = jest.fn().mockResolvedValue({
          'android.permission.BLUETOOTH_SCAN': 'denied',
          'android.permission.BLUETOOTH_CONNECT': 'denied',
          'android.permission.ACCESS_FINE_LOCATION': 'denied',
        });
      }
      
      const result = await bleManager.initialize();
      
      expect(result).toBe(false);
    });
  });
  
  describe('isBLESupported', () => {
    it('should return true when BLE is supported', async () => {
      const result = await bleManager.isBLESupported();
      
      expect(result).toBe(true);
      expect(mockBleManagerInstance.state).toHaveBeenCalled();
    });
    
    it('should return false on error', async () => {
      mockBleManagerInstance.state = jest.fn().mockRejectedValue(new Error('BLE error'));
      
      const result = await bleManager.isBLESupported();
      
      expect(result).toBe(false);
    });
  });
  
  describe('startScan', () => {
    it('should start scanning for devices', async () => {
      // Initialize first
      await bleManager.initialize();
      
      const result = await bleManager.startScan();
      
      expect(result).toBe(true);
      expect(mockBleManagerInstance.startDeviceScan).toHaveBeenCalled();
    });
    
    it('should handle scan errors', async () => {
      // Initialize first
      await bleManager.initialize();
      
      // Mock scan error
      mockBleManagerInstance.startDeviceScan = jest.fn((serviceUUIDs, options, callback) => {
        callback(new Error('Scan error'), null);
      });
      
      // Set up event listener for scanError
      const errorHandler = jest.fn();
      bleManager.on('scanError', errorHandler);
      
      const result = await bleManager.startScan();
      
      // Even though there's an error in scanning, the startScan function should
      // return true because it started successfully before the error callback
      expect(result).toBe(true);
      
      // Let the event loop process the error callback
      await new Promise(resolve => setTimeout(resolve, 10));
      
      expect(errorHandler).toHaveBeenCalled();
      expect(mockBleManagerInstance.stopDeviceScan).toHaveBeenCalled();
    });
  });
  
  describe('stopScan', () => {
    it('should stop scanning', async () => {
      // Start scan first
      await bleManager.initialize();
      await bleManager.startScan();
      
      bleManager.stopScan();
      
      expect(mockBleManagerInstance.stopDeviceScan).toHaveBeenCalled();
    });
    
    it('should not call stopDeviceScan if not scanning', () => {
      bleManager.stopScan();
      
      expect(mockBleManagerInstance.stopDeviceScan).not.toHaveBeenCalled();
    });
  });
  
  describe('device discovery', () => {
    it('should emit deviceDiscovered events', async () => {
      // Initialize and start scan
      await bleManager.initialize();
      
      // Set up event listener
      const discoveryHandler = jest.fn();
      bleManager.on('deviceDiscovered', discoveryHandler);
      
      await bleManager.startScan();
      
      // Let the event loop process the discovery callbacks
      await new Promise(resolve => setTimeout(resolve, 300));
      
      expect(discoveryHandler).toHaveBeenCalledTimes(2);
      expect(discoveryHandler).toHaveBeenCalledWith(expect.objectContaining({
        id: 'device1',
        name: 'Test Device 1'
      }));
      expect(discoveryHandler).toHaveBeenCalledWith(expect.objectContaining({
        id: 'device2',
        name: 'Test Device 2'
      }));
    });
    
    it('should track discovered devices', async () => {
      // Initialize and start scan
      await bleManager.initialize();
      await bleManager.startScan();
      
      // Let the event loop process the discovery callbacks
      await new Promise(resolve => setTimeout(resolve, 300));
      
      const devices = bleManager.getDiscoveredDevices();
      
      expect(devices.length).toBe(2);
      expect(devices).toContainEqual(expect.objectContaining({
        id: 'device1',
        name: 'Test Device 1'
      }));
      expect(devices).toContainEqual(expect.objectContaining({
        id: 'device2',
        name: 'Test Device 2'
      }));
    });
  });
  
  describe('connect/disconnect', () => {
    it('should connect to a device', async () => {
      // Initialize first
      await bleManager.initialize();
      
      const result = await bleManager.connect('device1');
      
      expect(result).toBe(true);
      expect(mockBleManagerInstance.connectToDevice).toHaveBeenCalledWith('device1');
      
      // Should emit deviceConnected event
      const connectHandler = jest.fn();
      bleManager.on('deviceConnected', connectHandler);
      
      // Let the event loop process
      await new Promise(resolve => setTimeout(resolve, 10));
      
      expect(connectHandler).toHaveBeenCalled();
    });
    
    it('should handle connect errors', async () => {
      // Initialize first
      await bleManager.initialize();
      
      // Mock connection error
      mockBleManagerInstance.connectToDevice = jest.fn().mockRejectedValue(new Error('Connection error'));
      
      const result = await bleManager.connect('device1');
      
      expect(result).toBe(false);
    });
    
    it('should disconnect from a device', async () => {
      // Connect first
      await bleManager.initialize();
      await bleManager.connect('device1');
      
      const result = await bleManager.disconnect('device1');
      
      expect(result).toBe(true);
      expect(mockBleManagerInstance.connectedDevices).toHaveBeenCalled();
    });
    
    it('should handle device disconnection events', async () => {
      // Connect first
      await bleManager.initialize();
      await bleManager.connect('device1');
      
      // Set up event listener
      const disconnectHandler = jest.fn();
      bleManager.on('deviceDisconnected', disconnectHandler);
      
      // Simulate device disconnection
      mockBleManagerInstance.simulateDisconnect('device1');
      
      // Let the event loop process
      await new Promise(resolve => setTimeout(resolve, 10));
      
      expect(disconnectHandler).toHaveBeenCalledWith('device1');
    });
  });
  
  describe('characteristic operations', () => {
    beforeEach(async () => {
      await bleManager.initialize();
      await bleManager.connect('device1');
    });
    
    it('should read a characteristic', async () => {
      const value = await bleManager.readCharacteristic(
        'device1',
        '000000ff-0000-1000-8000-00805f9b34fb',
        '00000001-0000-1000-8000-00805f9b34fb'
      );
      
      expect(mockBleManagerInstance.connectedDevices).toHaveBeenCalled();
      expect(value).toEqual(new Uint8Array([72, 101, 108, 108, 111])); // "Hello" in Uint8Array
    });
    
    it('should write a characteristic', async () => {
      const data = new Uint8Array([72, 101, 108, 108, 111]); // "Hello" in Uint8Array
      
      const result = await bleManager.writeCharacteristic(
        'device1',
        '000000ff-0000-1000-8000-00805f9b34fb',
        '00000001-0000-1000-8000-00805f9b34fb',
        data
      );
      
      expect(result).toBe(true);
      expect(mockBleManagerInstance.connectedDevices).toHaveBeenCalled();
    });
    
    it('should monitor a characteristic', async () => {
      const dataHandler = jest.fn();
      bleManager.on('dataReceived', dataHandler);
      
      const stopMonitoring = await bleManager.monitorCharacteristic(
        'device1',
        '000000ff-0000-1000-8000-00805f9b34fb',
        '00000001-0000-1000-8000-00805f9b34fb'
      );
      
      // Let the event loop process the value update
      await new Promise(resolve => setTimeout(resolve, 200));
      
      expect(mockBleManagerInstance.connectedDevices).toHaveBeenCalled();
      expect(dataHandler).toHaveBeenCalledWith(expect.objectContaining({
        deviceId: 'device1',
        serviceUUID: '000000ff-0000-1000-8000-00805f9b34fb',
        characteristicUUID: '00000001-0000-1000-8000-00805f9b34fb',
      }));
      
      // Should be able to stop monitoring
      expect(typeof stopMonitoring).toBe('function');
      stopMonitoring();
    });
  });
  
  describe('device capabilities', () => {
    it('should determine device capabilities based on services', () => {
      const capabilities = bleManager.getDeviceCapabilities([
        '000000ff-0000-1000-8000-00805f9b34fb', // Recycling bin service
        '0000ee00-0000-1000-8000-00805f9b34fb'  // Energy monitor service
      ]);
      
      // The deviceProfiles map in BLEManager maps these service UUIDs to capabilities
      expect(capabilities.length).toBeGreaterThan(0);
    });
  });
  
  describe('error handling', () => {
    beforeEach(async () => {
      await bleManager.initialize();
    });
    
    it('should handle errors when reading characteristic', async () => {
      mockBleManagerInstance.connectedDevices = jest.fn().mockResolvedValue([
        { id: 'device1' }
      ]);
      
      mockBleManagerInstance.connectToDevice('device1').readCharacteristicForService = 
        jest.fn().mockRejectedValue(new Error('Read error'));
      
      await expect(bleManager.readCharacteristic(
        'device1',
        '000000ff-0000-1000-8000-00805f9b34fb',
        '00000001-0000-1000-8000-00805f9b34fb'
      )).rejects.toThrow();
    });
    
    it('should handle errors when writing characteristic', async () => {
      mockBleManagerInstance.connectedDevices = jest.fn().mockResolvedValue([
        { id: 'device1' }
      ]);
      
      const connectedDevice = await mockBleManagerInstance.connectToDevice('device1');
      connectedDevice.writeCharacteristicWithResponseForService = 
        jest.fn().mockRejectedValue(new Error('Write error'));
      
      const data = new Uint8Array([72, 101, 108, 108, 111]); // "Hello" in Uint8Array
      
      const result = await bleManager.writeCharacteristic(
        'device1',
        '000000ff-0000-1000-8000-00805f9b34fb',
        '00000001-0000-1000-8000-00805f9b34fb',
        data
      );
      
      expect(result).toBe(false);
    });
  });
}); 