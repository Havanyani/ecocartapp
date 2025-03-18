import { useEffect, useState } from 'react';
import { PermissionsAndroid, Platform } from 'react-native';
import { BleManager, Characteristic, Device } from 'react-native-ble-plx';

interface UseWeightMeasurementReturn {
  isConnected: boolean;
  isMeasuring: boolean;
  currentWeight: number;
  error: string | null;
  connect: () => Promise<void>;
  disconnect: () => Promise<void>;
  startMeasuring: () => Promise<void>;
  stopMeasuring: () => Promise<void>;
}

export function useWeightMeasurement(): UseWeightMeasurementReturn {
  const [isConnected, setIsConnected] = useState(false);
  const [isMeasuring, setIsMeasuring] = useState(false);
  const [currentWeight, setCurrentWeight] = useState(0);
  const [error, setError] = useState<string | null>(null);
  const [device, setDevice] = useState<Device | null>(null);
  const [characteristic, setCharacteristic] = useState<Characteristic | null>(null);

  const manager = new BleManager();

  useEffect(() => {
    return () => {
      if (device) {
        device.cancelConnection();
      }
    };
  }, [device]);

  const requestPermissions = async () => {
    if (Platform.OS === 'android') {
      const granted = await PermissionsAndroid.request(
        PermissionsAndroid.PERMISSIONS.ACCESS_FINE_LOCATION,
        {
          title: 'Location Permission',
          message: 'Bluetooth scanning requires location permission',
          buttonNeutral: 'Ask Me Later',
          buttonNegative: 'Cancel',
          buttonPositive: 'OK',
        }
      );
      return granted === PermissionsAndroid.RESULTS.GRANTED;
    }
    return true;
  };

  const connect = async () => {
    try {
      setError(null);
      const hasPermission = await requestPermissions();
      
      if (!hasPermission) {
        setError('Location permission is required for Bluetooth scanning');
        return;
      }

      // Start scanning for devices
      manager.startDeviceScan(null, null, (error, device) => {
        if (error) {
          setError(error.message);
          return;
        }

        if (device && device.name?.includes('SCALE')) {
          manager.stopDeviceScan();
          setDevice(device);
          device
            .connect()
            .then((device) => {
              return device.discoverAllServicesAndCharacteristics();
            })
            .then((device) => {
              setIsConnected(true);
              // Find the characteristic that provides weight data
              // This is a placeholder - you'll need to replace with your scale's actual characteristic UUID
              const weightCharacteristic = device.characteristicsForService('0000ffe0-0000-1000-8000-00805f9b34fb')[0];
              setCharacteristic(weightCharacteristic);
            })
            .catch((error) => {
              setError(error.message);
              setIsConnected(false);
            });
        }
      });
    } catch (error) {
      setError(error instanceof Error ? error.message : 'Failed to connect to scale');
    }
  };

  const disconnect = async () => {
    try {
      if (device) {
        await device.cancelConnection();
        setIsConnected(false);
        setIsMeasuring(false);
        setCurrentWeight(0);
      }
    } catch (error) {
      setError(error instanceof Error ? error.message : 'Failed to disconnect from scale');
    }
  };

  const startMeasuring = async () => {
    try {
      if (!characteristic) {
        setError('No weight characteristic found');
        return;
      }

      setIsMeasuring(true);
      // Start monitoring weight changes
      // This is a placeholder - you'll need to replace with your scale's actual characteristic UUID
      characteristic.monitor((error, characteristic) => {
        if (error) {
          setError(error.message);
          return;
        }

        if (characteristic?.value) {
          // Convert the characteristic value to weight
          // This is a placeholder - you'll need to implement the actual conversion based on your scale's protocol
          const weight = parseFloat(characteristic.value);
          setCurrentWeight(weight);
        }
      });
    } catch (error) {
      setError(error instanceof Error ? error.message : 'Failed to start measuring');
      setIsMeasuring(false);
    }
  };

  const stopMeasuring = async () => {
    try {
      if (characteristic) {
        await characteristic.stopNotifications();
        setIsMeasuring(false);
      }
    } catch (error) {
      setError(error instanceof Error ? error.message : 'Failed to stop measuring');
    }
  };

  return {
    isConnected,
    isMeasuring,
    currentWeight,
    error,
    connect,
    disconnect,
    startMeasuring,
    stopMeasuring,
  };
} 