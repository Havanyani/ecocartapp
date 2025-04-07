import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '@react-navigation/native';
import React, { useCallback, useEffect, useState } from 'react';
import {
    ActivityIndicator,
    Alert,
    FlatList,
    RefreshControl,
    StyleSheet,
    Text,
    TouchableOpacity,
    View,
} from 'react-native';
import { DeviceType, SmartHomeService } from '../../services/smart-home/SmartHomeService';

// Types for discovered/available devices
interface DiscoveredDevice {
  id: string;
  name: string;
  type: DeviceType;
  signalStrength: number; // RSSI value or similar
  isPaired: boolean;
  lastSeen: Date;
}

interface DeviceDiscoveryProps {
  onDeviceSelected?: (deviceId: string) => void;
  onClose?: () => void;
}

function DeviceDiscovery({ onDeviceSelected, onClose }: DeviceDiscoveryProps) {
  const [isScanning, setIsScanning] = useState(false);
  const [discoveredDevices, setDiscoveredDevices] = useState<DiscoveredDevice[]>([]);
  const [refreshing, setRefreshing] = useState(false);
  const theme = useTheme();

  const startDeviceScan = useCallback(async () => {
    setIsScanning(true);
    
    try {
      // Get service instance
      const smartHomeService = SmartHomeService.getInstance();
      
      // Start device discovery
      smartHomeService.startDeviceDiscovery();
      
      // Add event listener for discovered devices
      smartHomeService.on('deviceDiscovered', handleDeviceDiscovered);
      smartHomeService.on('deviceDiscoveryComplete', handleDeviceDiscoveryComplete);
      
      // Timeout after 30 seconds
      setTimeout(() => {
        if (isScanning) {
          handleDeviceDiscoveryComplete();
        }
      }, 30000);
    } catch (error) {
      console.error('Error starting device scan:', error);
      setIsScanning(false);
      Alert.alert(
        'Error',
        'Could not start device scanning. Please make sure Bluetooth is enabled.',
        [{ text: 'OK' }]
      );
    }
  }, [isScanning]);

  const stopDeviceScan = useCallback(() => {
    if (!isScanning) return;
    
    try {
      // Get service instance
      const smartHomeService = SmartHomeService.getInstance();
      
      // Stop device discovery
      smartHomeService.stopDeviceDiscovery();
      
      // Remove event listeners
      smartHomeService.off('deviceDiscovered', handleDeviceDiscovered);
      smartHomeService.off('deviceDiscoveryComplete', handleDeviceDiscoveryComplete);
      
      setIsScanning(false);
    } catch (error) {
      console.error('Error stopping device scan:', error);
    }
  }, [isScanning]);

  const handleDeviceDiscovered = useCallback((device: any) => {
    setDiscoveredDevices((prevDevices) => {
      // Check if device already exists in the list
      const existingDeviceIndex = prevDevices.findIndex(d => d.id === device.id);
      
      if (existingDeviceIndex >= 0) {
        // Update existing device
        const updatedDevices = [...prevDevices];
        updatedDevices[existingDeviceIndex] = {
          ...updatedDevices[existingDeviceIndex],
          signalStrength: device.rssi || updatedDevices[existingDeviceIndex].signalStrength,
          lastSeen: new Date()
        };
        return updatedDevices;
      } else {
        // Add new device
        return [...prevDevices, {
          id: device.id,
          name: device.name || `Unknown Device (${device.id.substring(0, 8)})`,
          type: determineDeviceType(device),
          signalStrength: device.rssi || -70,
          isPaired: false,
          lastSeen: new Date()
        }];
      }
    });
  }, []);

  const handleDeviceDiscoveryComplete = useCallback(() => {
    setIsScanning(false);
    setRefreshing(false);
    
    // Get service instance
    const smartHomeService = SmartHomeService.getInstance();
    
    // Remove event listeners
    smartHomeService.off('deviceDiscovered', handleDeviceDiscovered);
    smartHomeService.off('deviceDiscoveryComplete', handleDeviceDiscoveryComplete);
    
    console.log('Device discovery complete');
  }, [handleDeviceDiscovered]);

  const determineDeviceType = (device: any): DeviceType => {
    // This is a simplified example - in a real implementation,
    // you would use the device's services, manufacturer data, or other
    // characteristics to determine its type
    
    // Check for specific service UUIDs
    const serviceUUIDs = device.serviceUUIDs || [];
    
    if (serviceUUIDs.some(uuid => uuid.toLowerCase().includes('recycling') || uuid.toLowerCase().includes('waste'))) {
      return DeviceType.SMART_BIN;
    }
    
    if (serviceUUIDs.some(uuid => uuid.toLowerCase().includes('energy'))) {
      return DeviceType.ENERGY_MONITOR;
    }
    
    // Check device name for hints
    const name = (device.name || '').toLowerCase();
    
    if (name.includes('bin') || name.includes('recycl') || name.includes('waste')) {
      return DeviceType.SMART_BIN;
    }
    
    if (name.includes('energy') || name.includes('power') || name.includes('electricity')) {
      return DeviceType.ENERGY_MONITOR;
    }
    
    return DeviceType.UNKNOWN;
  };

  const handleRefresh = useCallback(() => {
    setRefreshing(true);
    setDiscoveredDevices([]);
    startDeviceScan();
  }, [startDeviceScan]);

  const connectToDevice = useCallback(async (device: DiscoveredDevice) => {
    try {
      setIsScanning(false);
      
      // Get service instance
      const smartHomeService = SmartHomeService.getInstance();
      
      // Stop ongoing discovery if any
      smartHomeService.stopDeviceDiscovery();
      
      // Attempt to connect to the device
      const result = await smartHomeService.connectDevice(device.id);
      
      if (result.success) {
        Alert.alert(
          'Success',
          `Connected to ${device.name}`,
          [{ 
            text: 'OK', 
            onPress: () => {
              if (onDeviceSelected) {
                onDeviceSelected(device.id);
              }
            }
          }]
        );
      } else {
        Alert.alert(
          'Connection Failed',
          result.error || 'Failed to connect to device. Please try again.',
          [{ text: 'OK' }]
        );
      }
    } catch (error) {
      console.error('Error connecting to device:', error);
      Alert.alert(
        'Connection Error',
        'An error occurred while connecting to the device.',
        [{ text: 'OK' }]
      );
    }
  }, [onDeviceSelected]);

  // Start scanning when component mounts
  useEffect(() => {
    startDeviceScan();
    
    // Clean up when component unmounts
    return () => {
      stopDeviceScan();
    };
  }, [startDeviceScan, stopDeviceScan]);

  const renderDeviceItem = ({ item }: { item: DiscoveredDevice }) => {
    const signalStrengthIcon = () => {
      if (item.signalStrength >= -60) {
        return 'wifi-sharp';
      } else if (item.signalStrength >= -70) {
        return 'wifi-outline';
      } else {
        return 'wifi-sharp';
      }
    };

    const getDeviceTypeIcon = () => {
      switch (item.type) {
        case DeviceType.SMART_BIN:
          return 'trash-outline';
        case DeviceType.ENERGY_MONITOR:
          return 'flash-outline';
        default:
          return 'hardware-chip-outline';
      }
    };

    return (
      <TouchableOpacity
        style={styles.deviceItem}
        onPress={() => connectToDevice(item)}
      >
        <View style={styles.deviceIcon}>
          <Ionicons name={getDeviceTypeIcon()} size={24} color={theme.colors.primary} />
        </View>
        <View style={styles.deviceInfo}>
          <Text style={styles.deviceName}>{item.name}</Text>
          <Text style={styles.deviceType}>
            {item.type === DeviceType.SMART_BIN ? 'Recycling Bin' : 
             item.type === DeviceType.ENERGY_MONITOR ? 'Energy Monitor' : 'Unknown Device'}
          </Text>
        </View>
        <View style={styles.deviceStatus}>
          <Ionicons 
            name={signalStrengthIcon()} 
            size={16} 
            color={
              item.signalStrength >= -60 ? theme.colors.primary : 
              item.signalStrength >= -70 ? 'orange' : 'red'
            } 
          />
          <Text style={styles.deviceDistance}>
            {Math.abs(item.signalStrength)} dBm
          </Text>
        </View>
      </TouchableOpacity>
    );
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Discover Devices</Text>
        {onClose && (
          <TouchableOpacity onPress={onClose} style={styles.closeButton}>
            <Ionicons name="close" size={24} color={theme.colors.text} />
          </TouchableOpacity>
        )}
      </View>
      
      <View style={styles.content}>
        {isScanning && discoveredDevices.length === 0 ? (
          <View style={styles.loadingContainer}>
            <ActivityIndicator size="large" color={theme.colors.primary} />
            <Text style={styles.scanningText}>Scanning for devices...</Text>
            <Text style={styles.scanningSubText}>Make sure your devices are powered on and in pairing mode</Text>
          </View>
        ) : (
          <>
            <FlatList
              data={discoveredDevices}
              renderItem={renderDeviceItem}
              keyExtractor={(item) => item.id}
              contentContainerStyle={styles.deviceList}
              ListEmptyComponent={
                <View style={styles.emptyContainer}>
                  <Ionicons name="search-outline" size={48} color="#ccc" />
                  <Text style={styles.emptyText}>No devices found</Text>
                  <Text style={styles.emptySubText}>
                    Make sure your smart devices are powered on and in pairing mode
                  </Text>
                </View>
              }
              refreshControl={
                <RefreshControl
                  refreshing={refreshing}
                  onRefresh={handleRefresh}
                  colors={[theme.colors.primary]}
                />
              }
            />
            
            <View style={styles.footer}>
              <TouchableOpacity
                style={[
                  styles.scanButton,
                  { backgroundColor: isScanning ? '#ccc' : theme.colors.primary }
                ]}
                onPress={isScanning ? stopDeviceScan : startDeviceScan}
                disabled={isScanning}
              >
                <Text style={styles.scanButtonText}>
                  {isScanning ? 'Scanning...' : 'Scan Again'}
                </Text>
              </TouchableOpacity>
            </View>
          </>
        )}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8f9fa',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 16,
    backgroundColor: '#fff',
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
  },
  title: {
    fontSize: 18,
    fontWeight: 'bold',
  },
  closeButton: {
    padding: 4,
  },
  content: {
    flex: 1,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  scanningText: {
    fontSize: 16,
    fontWeight: '600',
    marginTop: 16,
    color: '#333',
  },
  scanningSubText: {
    fontSize: 14,
    color: '#666',
    marginTop: 8,
    textAlign: 'center',
    paddingHorizontal: 40,
  },
  deviceList: {
    padding: 16,
  },
  deviceItem: {
    flexDirection: 'row',
    backgroundColor: '#fff',
    padding: 16,
    borderRadius: 8,
    marginBottom: 12,
    elevation: 1,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 1,
  },
  deviceIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#f0f0f0',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  deviceInfo: {
    flex: 1,
    justifyContent: 'center',
  },
  deviceName: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 4,
  },
  deviceType: {
    fontSize: 14,
    color: '#666',
  },
  deviceStatus: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  deviceDistance: {
    fontSize: 12,
    color: '#666',
    marginTop: 4,
  },
  emptyContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    padding: 40,
  },
  emptyText: {
    fontSize: 16,
    fontWeight: '600',
    marginTop: 12,
    color: '#666',
  },
  emptySubText: {
    fontSize: 14,
    color: '#888',
    marginTop: 8,
    textAlign: 'center',
  },
  footer: {
    padding: 16,
    backgroundColor: '#fff',
    elevation: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: -2 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
  },
  scanButton: {
    padding: 16,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
  },
  scanButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
});

export default DeviceDiscovery; 