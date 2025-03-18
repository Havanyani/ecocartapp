import { Button } from '@/components/ui/Button';
import { ThemedText } from '@/components/ui/ThemedText';
import { ThemedView } from '@/components/ui/ThemedView';
import { useTheme } from '@/hooks/useTheme';
import { CollectionMaterials } from '@/types/Collection';
import React, { useEffect, useState } from 'react';
import { Platform, StyleSheet, View } from 'react-native';
import { BleError, Characteristic, Device } from 'react-native-ble-plx';

// Web Bluetooth API types
declare global {
  interface BluetoothCharacteristic {
    startNotifications(): Promise<void>;
    stopNotifications(): Promise<void>;
    addEventListener(
      type: string,
      listener: (event: { target: { value: string } }) => void
    ): void;
  }

  interface BluetoothRemoteGATTService {
    getCharacteristic(characteristic: string): Promise<BluetoothCharacteristic>;
  }

  interface BluetoothRemoteGATTServer {
    connect(): Promise<BluetoothRemoteGATTServer>;
    getPrimaryService(service: string): Promise<BluetoothRemoteGATTService>;
    disconnect(): void;
  }

  interface BluetoothDevice {
    gatt?: BluetoothRemoteGATTServer;
  }

  interface Bluetooth {
    requestDevice(options: {
      filters: Array<{ namePrefix: string }>;
      optionalServices: string[];
    }): Promise<BluetoothDevice>;
  }

  interface Navigator {
    bluetooth: Bluetooth;
  }
}

interface WeightMeasurementProps {
  material: CollectionMaterials;
  onWeightUpdate: (weight: number) => void;
  onError: (error: string) => void;
}

// Web implementation using Web Bluetooth API
const useWebBluetooth = () => {
  const [device, setDevice] = useState<BluetoothDevice | null>(null);
  const [characteristic, setCharacteristic] = useState<BluetoothCharacteristic | null>(null);

  const connect = async () => {
    try {
      const device = await navigator.bluetooth.requestDevice({
        filters: [{ namePrefix: 'SCALE' }],
        optionalServices: ['weight_service'] // Replace with your scale's service UUID
      });
      
      const server = await device.gatt?.connect();
      const service = await server?.getPrimaryService('weight_service');
      const char = await service?.getCharacteristic('weight_characteristic');
      
      setDevice(device);
      setCharacteristic(char || null);
      return true;
    } catch (error) {
      console.error('Web Bluetooth error:', error);
      return false;
    }
  };

  const startNotifications = async (callback: (value: number) => void) => {
    try {
      await characteristic?.startNotifications();
      characteristic?.addEventListener('characteristicvaluechanged', (event: any) => {
        const value = event.target.value;
        // Parse the weight value based on your scale's data format
        callback(parseFloat(value));
      });
    } catch (error) {
      console.error('Start notifications error:', error);
    }
  };

  const stopNotifications = async () => {
    try {
      await characteristic?.stopNotifications();
    } catch (error) {
      console.error('Stop notifications error:', error);
    }
  };

  const disconnect = async () => {
    try {
      await device?.gatt?.disconnect();
      setDevice(null);
      setCharacteristic(null);
    } catch (error) {
      console.error('Disconnect error:', error);
    }
  };

  return { connect, startNotifications, stopNotifications, disconnect };
};

// Native implementation
const useNativeBluetooth = () => {
  if (Platform.OS === 'web') {
    return null;
  }

  const { BleManager } = require('react-native-ble-plx');
  const { PermissionsAndroid } = require('react-native');
  
  const [manager] = useState(() => new BleManager());
  const [device, setDevice] = useState<Device | null>(null);
  const [characteristic, setCharacteristic] = useState<Characteristic | null>(null);

  const requestPermissions = async () => {
    if (Platform.OS === 'ios') {
      return true;
    }
    
    if (Platform.OS === 'android') {
      const apiLevel = parseInt(Platform.Version.toString(), 10);

      if (apiLevel < 31) {
        const granted = await PermissionsAndroid.request(
          PermissionsAndroid.PERMISSIONS.ACCESS_FINE_LOCATION
        );
        return granted === PermissionsAndroid.RESULTS.GRANTED;
      }

      const result = await PermissionsAndroid.requestMultiple([
        PermissionsAndroid.PERMISSIONS.BLUETOOTH_SCAN,
        PermissionsAndroid.PERMISSIONS.BLUETOOTH_CONNECT,
        PermissionsAndroid.PERMISSIONS.ACCESS_FINE_LOCATION
      ]);

      return (
        result['android.permission.BLUETOOTH_CONNECT'] === PermissionsAndroid.RESULTS.GRANTED &&
        result['android.permission.BLUETOOTH_SCAN'] === PermissionsAndroid.RESULTS.GRANTED &&
        result['android.permission.ACCESS_FINE_LOCATION'] === PermissionsAndroid.RESULTS.GRANTED
      );
    }

    return false;
  };

  const connect = async () => {
    try {
      const granted = await requestPermissions();
      if (!granted) {
        throw new Error('Bluetooth permission not granted');
      }

      return new Promise<boolean>((resolve, reject) => {
        manager.startDeviceScan(
          null,
          null,
          (error: BleError | null, scannedDevice: Device | null) => {
            if (error) {
              reject(error);
              return;
            }

            if (scannedDevice?.name?.toUpperCase().includes('SCALE')) {
              manager.stopDeviceScan();
              scannedDevice
                .connect()
                .then((device: Device) => device.discoverAllServicesAndCharacteristics())
                .then((device: Device) => device.characteristicsForService('0000180f-0000-1000-8000-00805f9b34fb'))
                .then((characteristics: Characteristic[]) => {
                  if (!characteristics?.[0]) {
                    throw new Error('No weight characteristic found');
                  }
                  setDevice(scannedDevice);
                  setCharacteristic(characteristics[0]);
                  resolve(true);
                })
                .catch(reject);
            }
          }
        );
      });
    } catch (error) {
      console.error('Native Bluetooth error:', error);
      return false;
    }
  };

  const startNotifications = async (callback: (value: number) => void) => {
    try {
      await characteristic?.monitor(
        (error: BleError | null, char: Characteristic | null) => {
          if (error) {
            throw error;
          }
          if (char?.value) {
            const weight = parseFloat(char.value);
            if (!isNaN(weight)) {
              callback(weight);
            }
          }
        }
      );
    } catch (error) {
      console.error('Start notifications error:', error);
    }
  };

  const stopNotifications = async () => {
    try {
      await characteristic?.monitor(() => {
        // Empty callback to stop monitoring
      });
    } catch (error) {
      console.error('Stop notifications error:', error);
    }
  };

  const disconnect = async () => {
    try {
      await device?.cancelConnection();
      setDevice(null);
      setCharacteristic(null);
    } catch (error) {
      console.error('Disconnect error:', error);
    }
  };

  return { connect, startNotifications, stopNotifications, disconnect };
};

export function WeightMeasurement({ material, onWeightUpdate, onError }: WeightMeasurementProps) {
  const { colors } = useTheme();
  const [isConnected, setIsConnected] = useState(false);
  const [isMeasuring, setIsMeasuring] = useState(false);
  const [currentWeight, setCurrentWeight] = useState<number>(0);
  const [error, setError] = useState<string | null>(null);

  const bluetooth = Platform.OS === 'web' ? useWebBluetooth() : useNativeBluetooth();

  useEffect(() => {
    return () => {
      if (bluetooth) {
        bluetooth.disconnect();
      }
    };
  }, [bluetooth]);

  const handleConnect = async () => {
    try {
      setError(null);
      const success = await bluetooth?.connect();
      if (success) {
        setIsConnected(true);
      } else {
        throw new Error('Failed to connect to scale');
      }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to connect to scale';
      setError(errorMessage);
      onError(errorMessage);
    }
  };

  const handleStartMeasuring = async () => {
    try {
      if (!isConnected) {
        await handleConnect();
      }

      setIsMeasuring(true);
      await bluetooth?.startNotifications((weight: number) => {
        setCurrentWeight(weight);
        onWeightUpdate(weight);
      });
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to start measuring';
      setError(errorMessage);
      onError(errorMessage);
      setIsMeasuring(false);
    }
  };

  const handleStopMeasuring = async () => {
    try {
      await bluetooth?.stopNotifications();
      setIsMeasuring(false);
    } catch (err) {
      console.error('Error stopping measurements:', err);
    }
  };

  const handleDisconnect = async () => {
    try {
      await bluetooth?.disconnect();
      setIsConnected(false);
      setIsMeasuring(false);
    } catch (err) {
      console.error('Error disconnecting:', err);
    }
  };

  if (!bluetooth) {
    return (
      <ThemedView style={styles.container}>
        <ThemedText style={styles.errorText}>
          Bluetooth is not supported on this platform
        </ThemedText>
      </ThemedView>
    );
  }

  return (
    <ThemedView style={styles.container}>
      <ThemedText style={styles.title}>Weight Measurement</ThemedText>
      <ThemedText style={styles.materialName}>
        Material: {material.material.name}
      </ThemedText>
      
      <View style={styles.weightDisplay}>
        <ThemedText style={styles.weightText}>
          Current Weight: {currentWeight.toFixed(2)} kg
        </ThemedText>
      </View>

      {error && (
        <ThemedText style={[styles.errorText, { color: colors.error }]}>
          {error}
        </ThemedText>
      )}

      <View style={styles.buttonContainer}>
        {!isConnected ? (
          <Button
            onPress={handleConnect}
            isDisabled={isMeasuring}
          >
            Connect to Scale
          </Button>
        ) : (
          <>
            {!isMeasuring ? (
              <Button
                onPress={handleStartMeasuring}
              >
                Start Measuring
              </Button>
            ) : (
              <Button
                onPress={handleStopMeasuring}
              >
                Stop Measuring
              </Button>
            )}
            <Button
              onPress={handleDisconnect}
              isDisabled={isMeasuring}
            >
              Disconnect
            </Button>
          </>
        )}
      </View>
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  container: {
    padding: 16,
    borderRadius: 8,
  },
  title: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 16,
  },
  materialName: {
    fontSize: 16,
    marginBottom: 16,
  },
  weightDisplay: {
    padding: 16,
    borderRadius: 8,
    marginBottom: 16,
  },
  weightText: {
    fontSize: 24,
    fontWeight: 'bold',
    textAlign: 'center',
  },
  errorText: {
    marginBottom: 16,
    textAlign: 'center',
  },
  buttonContainer: {
    gap: 8,
  },
}); 