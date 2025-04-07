import { useTheme } from '@/hooks/useTheme';
import {
    ConnectionStatus,
    ConnectionType,
    DeviceType,
    SmartHomeDevice,
    SmartHomeService,
} from '@/services/smart-home/SmartHomeService';
import { useFocusEffect, useNavigation } from '@react-navigation/native';
import React, { useCallback, useEffect, useRef, useState } from 'react';
import {
    ActivityIndicator,
    Alert,
    FlatList,
    Image,
    PermissionsAndroid,
    Platform,
    RefreshControl,
    StyleSheet,
    Text,
    TouchableOpacity,
    View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';

// Mock service for development - will be replaced with real service instance
const smartHomeService = new SmartHomeService();
const SCAN_TIMEOUT = 30000; // 30 seconds

/**
 * Device Discovery Screen for finding and connecting to smart home devices
 */
export default function DeviceDiscoveryScreen() {
  const { theme } = useTheme();
  const navigation = useNavigation();
  const [initializing, setInitializing] = useState(true);
  const [scanning, setScanning] = useState(false);
  const [discoveredDevices, setDiscoveredDevices] = useState<SmartHomeDevice[]>([]);
  const [savedDevices, setSavedDevices] = useState<SmartHomeDevice[]>([]);
  const [refreshing, setRefreshing] = useState(false);
  const scanTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  // Initialize SmartHomeService
  useEffect(() => {
    const initService = async () => {
      try {
        // In a real app, get userId from authentication service
        const userId = 'test-user-123';
        await smartHomeService.initialize(userId);

        // Load saved devices
        await loadSavedDevices();
        setInitializing(false);
      } catch (error) {
        console.error('Error initializing SmartHomeService:', error);
        Alert.alert(
          'Initialization Error',
          'Could not initialize the smart home service. Please try again.'
        );
        setInitializing(false);
      }
    };

    initService();

    // Set up event listeners
    smartHomeService.on('deviceDiscovered', handleDeviceDiscovered);

    return () => {
      // Clean up
      smartHomeService.removeAllListeners('deviceDiscovered');
      if (scanTimeoutRef.current) {
        clearTimeout(scanTimeoutRef.current);
      }
    };
  }, []);

  // Reload saved devices when screen is focused
  useFocusEffect(
    useCallback(() => {
      if (!initializing) {
        loadSavedDevices();
      }
    }, [initializing])
  );

  const loadSavedDevices = async () => {
    try {
      const devices = await smartHomeService.getDevices();
      setSavedDevices(devices);
    } catch (error) {
      console.error('Error loading saved devices:', error);
    }
  };

  const handleDeviceDiscovered = (device: SmartHomeDevice) => {
    setDiscoveredDevices(prevDevices => {
      // Check if device already exists in the list
      const deviceExists = prevDevices.some(d => d.id === device.id);
      if (deviceExists) {
        // Update existing device
        return prevDevices.map(d => d.id === device.id ? device : d);
      } else {
        // Add new device
        return [...prevDevices, device];
      }
    });
  };

  const startScan = async () => {
    try {
      // Request permissions if needed
      if (Platform.OS === 'android') {
        const granted = await requestBluetoothPermissions();
        if (!granted) {
          Alert.alert(
            'Permission Required',
            'Bluetooth permissions are required to scan for devices.'
          );
          return;
        }
      }

      setScanning(true);
      setDiscoveredDevices([]);

      const result = await smartHomeService.startDeviceDiscovery([
        ConnectionType.BLE,
        ConnectionType.WIFI
      ]);

      if (result.error) {
        Alert.alert('Scan Error', result.error);
      }

      // Set timeout to stop scanning
      scanTimeoutRef.current = setTimeout(() => {
        stopScan();
      }, SCAN_TIMEOUT);
    } catch (error) {
      console.error('Error starting scan:', error);
      Alert.alert('Scan Error', 'Failed to start scanning for devices.');
      setScanning(false);
    }
  };

  const stopScan = () => {
    if (scanTimeoutRef.current) {
      clearTimeout(scanTimeoutRef.current);
      scanTimeoutRef.current = null;
    }
    
    smartHomeService.stopDeviceDiscovery();
    setScanning(false);
  };

  const onRefresh = async () => {
    setRefreshing(true);
    await loadSavedDevices();
    setRefreshing(false);
  };

  const connectToDevice = async (device: SmartHomeDevice) => {
    try {
      const result = await smartHomeService.connectToDevice(device);
      
      if (result.success) {
        // Reload saved devices to see the updated connection status
        await loadSavedDevices();
        
        Alert.alert(
          'Connection Successful',
          `Connected to ${device.name}`,
          [
            { 
              text: 'View Device', 
              onPress: () => navigation.navigate('DeviceDetailsScreen', { deviceId: device.id }) 
            },
            { text: 'OK' }
          ]
        );
      } else {
        Alert.alert('Connection Failed', result.error || 'Could not connect to device');
      }
    } catch (error) {
      console.error(`Error connecting to device ${device.id}:`, error);
      Alert.alert('Connection Error', 'Failed to connect to device');
    }
  };

  const disconnectFromDevice = async (device: SmartHomeDevice) => {
    try {
      const result = await smartHomeService.disconnectFromDevice(device.id);
      
      if (result.success) {
        // Reload saved devices to see the updated connection status
        await loadSavedDevices();
        Alert.alert('Disconnected', `Disconnected from ${device.name}`);
      } else {
        Alert.alert('Disconnection Failed', result.error || 'Could not disconnect from device');
      }
    } catch (error) {
      console.error(`Error disconnecting from device ${device.id}:`, error);
      Alert.alert('Disconnection Error', 'Failed to disconnect from device');
    }
  };

  const forgetDevice = async (device: SmartHomeDevice) => {
    Alert.alert(
      'Forget Device',
      `Are you sure you want to forget ${device.name}?`,
      [
        { text: 'Cancel', style: 'cancel' },
        { 
          text: 'Forget', 
          style: 'destructive',
          onPress: async () => {
            try {
              const result = await smartHomeService.deleteDevice(device.id);
              
              if (result) {
                await loadSavedDevices();
                Alert.alert('Device Forgotten', `${device.name} has been removed`);
              } else {
                Alert.alert('Error', 'Could not forget device');
              }
            } catch (error) {
              console.error(`Error forgetting device ${device.id}:`, error);
              Alert.alert('Error', 'Failed to forget device');
            }
          }
        }
      ]
    );
  };

  const requestBluetoothPermissions = async (): Promise<boolean> => {
    try {
      if (Platform.OS !== 'android') {
        return true;
      }

      const apiLevel = parseInt(Platform.Version.toString(), 10);
      
      if (apiLevel <= 30) {
        const granted = await PermissionsAndroid.request(
          PermissionsAndroid.PERMISSIONS.ACCESS_FINE_LOCATION,
          {
            title: 'Location Permission',
            message: 'Bluetooth scanning requires location permission',
            buttonPositive: 'OK',
          }
        );
        return granted === PermissionsAndroid.RESULTS.GRANTED;
      } else {
        const results = await PermissionsAndroid.requestMultiple([
          PermissionsAndroid.PERMISSIONS.BLUETOOTH_SCAN,
          PermissionsAndroid.PERMISSIONS.BLUETOOTH_CONNECT,
          PermissionsAndroid.PERMISSIONS.ACCESS_FINE_LOCATION,
        ]);
        
        return (
          results[PermissionsAndroid.PERMISSIONS.BLUETOOTH_SCAN] === PermissionsAndroid.RESULTS.GRANTED &&
          results[PermissionsAndroid.PERMISSIONS.BLUETOOTH_CONNECT] === PermissionsAndroid.RESULTS.GRANTED &&
          results[PermissionsAndroid.PERMISSIONS.ACCESS_FINE_LOCATION] === PermissionsAndroid.RESULTS.GRANTED
        );
      }
    } catch (error) {
      console.error('Error requesting permissions:', error);
      return false;
    }
  };

  const getDeviceTypeIcon = (deviceType: DeviceType): string => {
    switch (deviceType) {
      case DeviceType.RECYCLING_BIN:
        return 'delete-outline';
      case DeviceType.ENERGY_MONITOR:
        return 'flash-outline';
      case DeviceType.SMART_APPLIANCE:
        return 'washing-machine';
      case DeviceType.VOICE_ASSISTANT:
        return 'microphone-outline';
      case DeviceType.SMART_PLUG:
        return 'power-socket-eu';
      case DeviceType.WATER_MONITOR:
        return 'water-outline';
      case DeviceType.COMPOST_MONITOR:
        return 'leaf-outline';
      default:
        return 'devices';
    }
  };

  const renderSavedDeviceItem = ({ item }: { item: SmartHomeDevice }) => {
    const isConnected = item.connectionStatus === ConnectionStatus.CONNECTED;
    const iconName = getDeviceTypeIcon(item.type);
    
    return (
      <TouchableOpacity
        style={[
          styles.deviceItem,
          { backgroundColor: theme.colors.card }
        ]}
        onPress={() => navigation.navigate('DeviceDetailsScreen', { deviceId: item.id })}
      >
        <View style={styles.deviceIconContainer}>
          <Icon name={iconName} size={24} color={theme.colors.primary} />
        </View>
        <View style={styles.deviceInfo}>
          <Text style={[styles.deviceName, { color: theme.colors.text }]}>
            {item.name}
          </Text>
          <Text style={[styles.deviceType, { color: theme.colors.text }]}>
            {item.type}
          </Text>
          <View style={styles.statusContainer}>
            <View 
              style={[
                styles.statusIndicator, 
                { backgroundColor: isConnected ? '#4CAF50' : '#9E9E9E' }
              ]} 
            />
            <Text 
              style={[
                styles.statusText, 
                { color: isConnected ? '#4CAF50' : '#9E9E9E' }
              ]}
            >
              {isConnected ? 'Connected' : 'Disconnected'}
            </Text>
          </View>
        </View>
        <View style={styles.deviceActions}>
          {isConnected ? (
            <TouchableOpacity
              style={[styles.actionButton, { backgroundColor: theme.colors.notification }]}
              onPress={() => disconnectFromDevice(item)}
            >
              <Text style={styles.actionButtonText}>Disconnect</Text>
            </TouchableOpacity>
          ) : (
            <TouchableOpacity
              style={[styles.actionButton, { backgroundColor: theme.colors.primary }]}
              onPress={() => connectToDevice(item)}
            >
              <Text style={styles.actionButtonText}>Connect</Text>
            </TouchableOpacity>
          )}
          <TouchableOpacity
            style={styles.forgetButton}
            onPress={() => forgetDevice(item)}
          >
            <Icon name="trash-can-outline" size={20} color={theme.colors.notification} />
          </TouchableOpacity>
        </View>
      </TouchableOpacity>
    );
  };

  const renderDiscoveredDeviceItem = ({ item }: { item: SmartHomeDevice }) => {
    // Check if device is already saved
    const isSaved = savedDevices.some(d => d.id === item.id);
    const iconName = getDeviceTypeIcon(item.type);
    
    if (isSaved) {
      return null; // Don't show devices that are already saved
    }
    
    return (
      <TouchableOpacity
        style={[
          styles.deviceItem,
          { backgroundColor: theme.colors.card }
        ]}
      >
        <View style={styles.deviceIconContainer}>
          <Icon name={iconName} size={24} color={theme.colors.primary} />
        </View>
        <View style={styles.deviceInfo}>
          <Text style={[styles.deviceName, { color: theme.colors.text }]}>
            {item.name}
          </Text>
          <Text style={[styles.deviceType, { color: theme.colors.text }]}>
            {item.type}
          </Text>
          <Text style={[styles.deviceId, { color: theme.colors.text }]}>
            ID: {item.id.substring(0, 8)}...
          </Text>
        </View>
        <View style={styles.deviceActions}>
          <TouchableOpacity
            style={[styles.actionButton, { backgroundColor: theme.colors.primary }]}
            onPress={() => connectToDevice(item)}
          >
            <Text style={styles.actionButtonText}>Connect</Text>
          </TouchableOpacity>
        </View>
      </TouchableOpacity>
    );
  };

  if (initializing) {
    return (
      <View style={[styles.container, { backgroundColor: theme.colors.background }]}>
        <ActivityIndicator size="large" color={theme.colors.primary} />
        <Text style={[styles.loadingText, { color: theme.colors.text }]}>
          Initializing Smart Home...
        </Text>
      </View>
    );
  }

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: theme.colors.background }]}>
      <View style={styles.header}>
        <Text style={[styles.headerTitle, { color: theme.colors.text }]}>
          Smart Home Devices
        </Text>
        {scanning ? (
          <TouchableOpacity
            style={[styles.scanButton, { backgroundColor: theme.colors.notification }]}
            onPress={stopScan}
          >
            <Text style={styles.scanButtonText}>Stop Scan</Text>
          </TouchableOpacity>
        ) : (
          <TouchableOpacity
            style={[styles.scanButton, { backgroundColor: theme.colors.primary }]}
            onPress={startScan}
          >
            <Text style={styles.scanButtonText}>Scan for Devices</Text>
          </TouchableOpacity>
        )}
      </View>

      {scanning && (
        <View style={styles.scanningContainer}>
          <ActivityIndicator size="small" color={theme.colors.primary} />
          <Text style={[styles.scanningText, { color: theme.colors.text }]}>
            Scanning for devices...
          </Text>
        </View>
      )}

      {savedDevices.length > 0 && (
        <View style={styles.sectionContainer}>
          <Text style={[styles.sectionTitle, { color: theme.colors.text }]}>
            Your Devices
          </Text>
          <FlatList
            data={savedDevices}
            renderItem={renderSavedDeviceItem}
            keyExtractor={item => item.id}
            refreshControl={
              <RefreshControl
                refreshing={refreshing}
                onRefresh={onRefresh}
                colors={[theme.colors.primary]}
              />
            }
          />
        </View>
      )}

      {scanning && discoveredDevices.length > 0 && (
        <View style={styles.sectionContainer}>
          <Text style={[styles.sectionTitle, { color: theme.colors.text }]}>
            Discovered Devices
          </Text>
          <FlatList
            data={discoveredDevices.filter(device => 
              !savedDevices.some(savedDevice => savedDevice.id === device.id)
            )}
            renderItem={renderDiscoveredDeviceItem}
            keyExtractor={item => item.id}
          />
        </View>
      )}

      {!scanning && savedDevices.length === 0 && (
        <View style={styles.emptyContainer}>
          <Image
            source={require('@/assets/images/empty-devices.png')}
            style={styles.emptyImage}
            resizeMode="contain"
          />
          <Text style={[styles.emptyTitle, { color: theme.colors.text }]}>
            No devices found
          </Text>
          <Text style={[styles.emptyText, { color: theme.colors.text }]}>
            Tap "Scan for Devices" to discover smart home devices around you
          </Text>
        </View>
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 16,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: 'rgba(0,0,0,0.1)',
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: 'bold',
  },
  scanButton: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
  },
  scanButtonText: {
    color: 'white',
    fontWeight: '600',
  },
  scanningContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 12,
    backgroundColor: 'rgba(0,0,0,0.05)',
  },
  scanningText: {
    marginLeft: 8,
    fontSize: 14,
  },
  sectionContainer: {
    flex: 1,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '600',
    padding: 16,
    paddingBottom: 8,
  },
  deviceItem: {
    flexDirection: 'row',
    padding: 16,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: 'rgba(0,0,0,0.1)',
    alignItems: 'center',
  },
  deviceIconContainer: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(0,0,0,0.05)',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  deviceInfo: {
    flex: 1,
  },
  deviceName: {
    fontSize: 16,
    fontWeight: '600',
  },
  deviceType: {
    fontSize: 14,
    opacity: 0.7,
    textTransform: 'capitalize',
  },
  deviceId: {
    fontSize: 12,
    opacity: 0.5,
  },
  statusContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 4,
  },
  statusIndicator: {
    width: 8,
    height: 8,
    borderRadius: 4,
    marginRight: 4,
  },
  statusText: {
    fontSize: 12,
    fontWeight: '500',
  },
  deviceActions: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  actionButton: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
    marginLeft: 8,
  },
  actionButtonText: {
    color: 'white',
    fontSize: 12,
    fontWeight: '600',
  },
  forgetButton: {
    padding: 8,
    marginLeft: 8,
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 32,
  },
  emptyImage: {
    width: 150,
    height: 150,
    marginBottom: 16,
    opacity: 0.7,
  },
  emptyTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 8,
  },
  emptyText: {
    fontSize: 14,
    textAlign: 'center',
    opacity: 0.7,
  },
  loadingText: {
    marginTop: 16,
    fontSize: 16,
  },
}); 