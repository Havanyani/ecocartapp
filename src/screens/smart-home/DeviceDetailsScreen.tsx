import { useTheme } from '@/hooks/useTheme';
import {
    ConnectionStatus,
    DeviceCapability,
    DeviceType,
    SmartHomeDevice,
    SmartHomeService
} from '@/services/smart-home/SmartHomeService';
import { useNavigation, useRoute } from '@react-navigation/native';
import React, { useEffect, useState } from 'react';
import {
    ActivityIndicator,
    Alert,
    ScrollView,
    StyleSheet,
    Switch,
    Text,
    TouchableOpacity,
    View
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';

// Mock service for development
const smartHomeService = new SmartHomeService();

/**
 * Screen to display and manage a smart home device
 */
export default function DeviceDetailsScreen() {
  const { theme } = useTheme();
  const navigation = useNavigation();
  const route = useRoute();
  const [loading, setLoading] = useState(true);
  const [device, setDevice] = useState<SmartHomeDevice | null>(null);
  const [deviceData, setDeviceData] = useState<any>(null);
  const [deviceSettings, setDeviceSettings] = useState<any>(null);
  const [refreshing, setRefreshing] = useState(false);

  // Extract deviceId from route params
  const deviceId = route.params?.deviceId;

  useEffect(() => {
    if (!deviceId) {
      Alert.alert('Error', 'No device ID provided');
      navigation.goBack();
      return;
    }

    const initialize = async () => {
      try {
        // Initialize service if needed
        if (!(smartHomeService as any).initialized) {
          // In a real app, get userId from authentication service
          await smartHomeService.initialize('test-user-123');
        }

        await loadDeviceDetails();
      } catch (error) {
        console.error('Error initializing:', error);
        Alert.alert('Error', 'Failed to load device details');
      } finally {
        setLoading(false);
      }
    };

    initialize();
  }, [deviceId]);

  const loadDeviceDetails = async () => {
    try {
      setRefreshing(true);

      // Load device
      const deviceDetails = await smartHomeService.getDevice(deviceId);
      if (!deviceDetails) {
        Alert.alert('Error', 'Device not found');
        navigation.goBack();
        return;
      }
      setDevice(deviceDetails);

      // Load device settings
      const settings = await smartHomeService.getDeviceSettings(deviceId);
      setDeviceSettings(settings);

      // If device is connected, load its data
      if (deviceDetails.connectionStatus === ConnectionStatus.CONNECTED) {
        await loadDeviceData(deviceDetails);
      }
    } catch (error) {
      console.error('Error loading device details:', error);
    } finally {
      setRefreshing(false);
    }
  };

  const loadDeviceData = async (deviceDetails: SmartHomeDevice) => {
    try {
      let data: any = {};

      // Load different data based on device type
      switch (deviceDetails.type) {
        case DeviceType.RECYCLING_BIN:
          if (deviceDetails.capabilities.includes(DeviceCapability.WEIGHT_TRACKING)) {
            const weightResult = await smartHomeService.getDeviceData(deviceId, 'weight');
            if (weightResult.success) {
              data.weight = weightResult.data;
            }
          }
          
          if (deviceDetails.capabilities.includes(DeviceCapability.FILL_LEVEL)) {
            const fillLevelResult = await smartHomeService.getDeviceData(deviceId, 'fillLevel');
            if (fillLevelResult.success) {
              data.fillLevel = fillLevelResult.data;
            }
          }
          break;

        case DeviceType.ENERGY_MONITOR:
          if (deviceDetails.capabilities.includes(DeviceCapability.POWER_MONITORING)) {
            const powerResult = await smartHomeService.getDeviceData(deviceId, 'power');
            if (powerResult.success) {
              data.power = powerResult.data;
            }
          }
          
          if (deviceDetails.capabilities.includes(DeviceCapability.ENERGY_TRACKING)) {
            const energyResult = await smartHomeService.getDeviceData(deviceId, 'energy');
            if (energyResult.success) {
              data.energy = energyResult.data;
            }
          }
          break;

        case DeviceType.SMART_APPLIANCE:
          // Mock appliance data for now
          data = {
            status: 'on',
            mode: 'eco',
            temperature: 4,
            powerUsage: 120,
          };
          break;

        default:
          break;
      }

      setDeviceData(data);
    } catch (error) {
      console.error('Error loading device data:', error);
    }
  };

  const handleConnectToggle = async () => {
    if (!device) return;

    try {
      if (device.connectionStatus === ConnectionStatus.CONNECTED) {
        // Disconnect
        const result = await smartHomeService.disconnectFromDevice(deviceId);
        if (result.success) {
          setDevice({
            ...device,
            connectionStatus: ConnectionStatus.DISCONNECTED
          });
          setDeviceData(null);
        } else {
          Alert.alert('Error', result.error || 'Failed to disconnect');
        }
      } else {
        // Connect
        const result = await smartHomeService.connectToDevice(device);
        if (result.success) {
          const updatedDevice = {
            ...device,
            connectionStatus: ConnectionStatus.CONNECTED
          };
          setDevice(updatedDevice);
          await loadDeviceData(updatedDevice);
        } else {
          Alert.alert('Error', result.error || 'Failed to connect');
        }
      }
    } catch (error) {
      console.error('Error toggling connection:', error);
      Alert.alert('Error', 'Failed to change connection state');
    }
  };

  const handleSettingChange = async (key: string, value: any) => {
    if (!device || !deviceSettings) return;

    try {
      const updatedSettings = {
        ...deviceSettings,
        customSettings: {
          ...deviceSettings.customSettings,
          [key]: value
        }
      };

      const success = await smartHomeService.updateDeviceSettings(
        deviceId,
        updatedSettings
      );

      if (success) {
        setDeviceSettings(updatedSettings);
      } else {
        Alert.alert('Error', 'Failed to update settings');
      }
    } catch (error) {
      console.error('Error updating settings:', error);
      Alert.alert('Error', 'Failed to update settings');
    }
  };

  const renderDeviceTypeIcon = () => {
    if (!device) return null;

    let iconName = 'devices';
    switch (device.type) {
      case DeviceType.RECYCLING_BIN:
        iconName = 'delete-outline';
        break;
      case DeviceType.ENERGY_MONITOR:
        iconName = 'flash-outline';
        break;
      case DeviceType.SMART_APPLIANCE:
        iconName = 'washing-machine';
        break;
      case DeviceType.VOICE_ASSISTANT:
        iconName = 'microphone-outline';
        break;
      case DeviceType.SMART_PLUG:
        iconName = 'power-socket-eu';
        break;
      case DeviceType.WATER_MONITOR:
        iconName = 'water-outline';
        break;
      case DeviceType.COMPOST_MONITOR:
        iconName = 'leaf-outline';
        break;
    }

    return (
      <View style={[styles.iconContainer, { backgroundColor: theme.colors.primary + '20' }]}>
        <Icon name={iconName} size={40} color={theme.colors.primary} />
      </View>
    );
  };

  const renderDeviceData = () => {
    if (!device || !deviceData) return null;

    switch (device.type) {
      case DeviceType.RECYCLING_BIN:
        return renderRecyclingBinData();
      case DeviceType.ENERGY_MONITOR:
        return renderEnergyMonitorData();
      case DeviceType.SMART_APPLIANCE:
        return renderSmartApplianceData();
      default:
        return (
          <Text style={[styles.noDataText, { color: theme.colors.textSecondary }]}>
            No data available for this device type
          </Text>
        );
    }
  };

  const renderRecyclingBinData = () => {
    if (!deviceData) return null;

    return (
      <View style={styles.dataContainer}>
        {deviceData.weight !== undefined && (
          <View style={styles.dataItem}>
            <Icon name="weight" size={24} color={theme.colors.primary} />
            <View style={styles.dataTextContainer}>
              <Text style={[styles.dataValue, { color: theme.colors.text }]}>
                {deviceData.weight.toFixed(1)} kg
              </Text>
              <Text style={[styles.dataLabel, { color: theme.colors.textSecondary }]}>
                Current Weight
              </Text>
            </View>
          </View>
        )}

        {deviceData.fillLevel !== undefined && (
          <View style={styles.dataItem}>
            <Icon name="chart-line" size={24} color={theme.colors.primary} />
            <View style={styles.dataTextContainer}>
              <Text style={[styles.dataValue, { color: theme.colors.text }]}>
                {deviceData.fillLevel}%
              </Text>
              <Text style={[styles.dataLabel, { color: theme.colors.textSecondary }]}>
                Fill Level
              </Text>
            </View>
          </View>
        )}

        <TouchableOpacity 
          style={[styles.actionButton, { backgroundColor: theme.colors.primary }]}
          onPress={() => navigation.navigate('RecyclingHistoryScreen', { deviceId })}
        >
          <Text style={styles.actionButtonText}>View Recycling History</Text>
        </TouchableOpacity>
      </View>
    );
  };

  const renderEnergyMonitorData = () => {
    if (!deviceData) return null;

    return (
      <View style={styles.dataContainer}>
        {deviceData.power !== undefined && (
          <View style={styles.dataItem}>
            <Icon name="flash" size={24} color={theme.colors.primary} />
            <View style={styles.dataTextContainer}>
              <Text style={[styles.dataValue, { color: theme.colors.text }]}>
                {deviceData.power} W
              </Text>
              <Text style={[styles.dataLabel, { color: theme.colors.textSecondary }]}>
                Current Power
              </Text>
            </View>
          </View>
        )}

        {deviceData.energy !== undefined && (
          <View style={styles.dataItem}>
            <Icon name="lightning-bolt" size={24} color={theme.colors.primary} />
            <View style={styles.dataTextContainer}>
              <Text style={[styles.dataValue, { color: theme.colors.text }]}>
                {deviceData.energy.toFixed(2)} kWh
              </Text>
              <Text style={[styles.dataLabel, { color: theme.colors.textSecondary }]}>
                Energy Today
              </Text>
            </View>
          </View>
        )}

        <TouchableOpacity 
          style={[styles.actionButton, { backgroundColor: theme.colors.primary }]}
          onPress={() => navigation.navigate('EnergyHistoryScreen', { deviceId })}
        >
          <Text style={styles.actionButtonText}>View Energy History</Text>
        </TouchableOpacity>
      </View>
    );
  };

  const renderSmartApplianceData = () => {
    if (!deviceData) return null;

    return (
      <View style={styles.dataContainer}>
        <View style={styles.dataItem}>
          <Icon 
            name={deviceData.status === 'on' ? 'power' : 'power-off'} 
            size={24} 
            color={deviceData.status === 'on' ? theme.colors.primary : theme.colors.textSecondary} 
          />
          <View style={styles.dataTextContainer}>
            <Text style={[styles.dataValue, { color: theme.colors.text }]}>
              {deviceData.status === 'on' ? 'On' : 'Off'}
            </Text>
            <Text style={[styles.dataLabel, { color: theme.colors.textSecondary }]}>
              Status
            </Text>
          </View>
          <Switch
            value={deviceData.status === 'on'}
            onValueChange={(value) => {
              setDeviceData({
                ...deviceData,
                status: value ? 'on' : 'off'
              });
              // Here you would call the appropriate service method
            }}
            trackColor={{ false: '#767577', true: theme.colors.primary + '50' }}
            thumbColor={deviceData.status === 'on' ? theme.colors.primary : '#f4f3f4'}
          />
        </View>

        {deviceData.mode && (
          <View style={styles.dataItem}>
            <Icon name="cog-outline" size={24} color={theme.colors.primary} />
            <View style={styles.dataTextContainer}>
              <Text style={[styles.dataValue, { color: theme.colors.text }]}>
                {deviceData.mode}
              </Text>
              <Text style={[styles.dataLabel, { color: theme.colors.textSecondary }]}>
                Mode
              </Text>
            </View>
          </View>
        )}

        {deviceData.temperature !== undefined && (
          <View style={styles.dataItem}>
            <Icon name="thermometer" size={24} color={theme.colors.primary} />
            <View style={styles.dataTextContainer}>
              <Text style={[styles.dataValue, { color: theme.colors.text }]}>
                {deviceData.temperature}°C
              </Text>
              <Text style={[styles.dataLabel, { color: theme.colors.textSecondary }]}>
                Temperature
              </Text>
            </View>
          </View>
        )}

        {deviceData.powerUsage !== undefined && (
          <View style={styles.dataItem}>
            <Icon name="flash-outline" size={24} color={theme.colors.primary} />
            <View style={styles.dataTextContainer}>
              <Text style={[styles.dataValue, { color: theme.colors.text }]}>
                {deviceData.powerUsage} W
              </Text>
              <Text style={[styles.dataLabel, { color: theme.colors.textSecondary }]}>
                Power Usage
              </Text>
            </View>
          </View>
        )}

        <TouchableOpacity 
          style={[styles.actionButton, { backgroundColor: theme.colors.primary }]}
          onPress={() => navigation.navigate('ApplianceControlScreen', { deviceId })}
        >
          <Text style={styles.actionButtonText}>Control Appliance</Text>
        </TouchableOpacity>
      </View>
    );
  };

  const renderSettings = () => {
    if (!deviceSettings) return null;

    return (
      <View style={styles.settingsContainer}>
        <Text style={[styles.sectionTitle, { color: theme.colors.text }]}>Settings</Text>
        
        <View style={styles.settingItem}>
          <Text style={[styles.settingLabel, { color: theme.colors.text }]}>Notifications</Text>
          <Switch
            value={deviceSettings.notificationsEnabled}
            onValueChange={(value) => handleSettingChange('notificationsEnabled', value)}
            trackColor={{ false: '#767577', true: theme.colors.primary + '50' }}
            thumbColor={deviceSettings.notificationsEnabled ? theme.colors.primary : '#f4f3f4'}
          />
        </View>

        <View style={styles.settingItem}>
          <Text style={[styles.settingLabel, { color: theme.colors.text }]}>Automation</Text>
          <Switch
            value={deviceSettings.automationEnabled}
            onValueChange={(value) => handleSettingChange('automationEnabled', value)}
            trackColor={{ false: '#767577', true: theme.colors.primary + '50' }}
            thumbColor={deviceSettings.automationEnabled ? theme.colors.primary : '#f4f3f4'}
          />
        </View>

        {deviceSettings.nickname !== undefined && (
          <View style={styles.settingItem}>
            <Text style={[styles.settingLabel, { color: theme.colors.text }]}>Device Name</Text>
            <Text style={[styles.settingValue, { color: theme.colors.textSecondary }]}>
              {deviceSettings.nickname || device?.name}
            </Text>
          </View>
        )}

        {deviceSettings.room !== undefined && (
          <View style={styles.settingItem}>
            <Text style={[styles.settingLabel, { color: theme.colors.text }]}>Room</Text>
            <Text style={[styles.settingValue, { color: theme.colors.textSecondary }]}>
              {deviceSettings.room || 'Not set'}
            </Text>
          </View>
        )}

        <TouchableOpacity 
          style={[styles.actionButton, { backgroundColor: theme.colors.primary }]}
          onPress={() => navigation.navigate('DeviceSettingsScreen', { deviceId })}
        >
          <Text style={styles.actionButtonText}>Edit Settings</Text>
        </TouchableOpacity>
      </View>
    );
  };

  if (loading) {
    return (
      <View style={[styles.container, { backgroundColor: theme.colors.background }]}>
        <ActivityIndicator size="large" color={theme.colors.primary} />
        <Text style={[styles.loadingText, { color: theme.colors.text }]}>
          Loading device details...
        </Text>
      </View>
    );
  }

  if (!device) {
    return (
      <View style={[styles.container, { backgroundColor: theme.colors.background }]}>
        <Text style={[styles.errorText, { color: theme.colors.error }]}>
          Device not found
        </Text>
        <TouchableOpacity
          style={[styles.actionButton, { backgroundColor: theme.colors.primary, marginTop: 20 }]}
          onPress={() => navigation.goBack()}
        >
          <Text style={styles.actionButtonText}>Go Back</Text>
        </TouchableOpacity>
      </View>
    );
  }

  const isConnected = device.connectionStatus === ConnectionStatus.CONNECTED;

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: theme.colors.background }]}>
      <ScrollView contentContainerStyle={styles.scrollContent}>
        <View style={styles.header}>
          {renderDeviceTypeIcon()}
          <View style={styles.deviceInfoContainer}>
            <Text style={[styles.deviceName, { color: theme.colors.text }]}>
              {deviceSettings?.nickname || device.name}
            </Text>
            <Text style={[styles.deviceType, { color: theme.colors.textSecondary }]}>
              {device.type} • {device.model || 'Unknown model'}
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
        </View>

        <TouchableOpacity
          style={[
            styles.connectButton,
            { backgroundColor: isConnected ? theme.colors.notification : theme.colors.primary }
          ]}
          onPress={handleConnectToggle}
        >
          <Text style={styles.connectButtonText}>
            {isConnected ? 'Disconnect' : 'Connect'}
          </Text>
        </TouchableOpacity>

        {isConnected ? (
          <>
            <Text style={[styles.sectionTitle, { color: theme.colors.text }]}>
              Device Data
            </Text>
            {renderDeviceData()}
          </>
        ) : (
          <View style={styles.disconnectedContainer}>
            <Icon name="wifi-off" size={48} color={theme.colors.textSecondary} />
            <Text style={[styles.disconnectedText, { color: theme.colors.textSecondary }]}>
              Connect to device to view data
            </Text>
          </View>
        )}

        {renderSettings()}

        <TouchableOpacity
          style={[styles.dangerButton, { backgroundColor: theme.colors.error }]}
          onPress={() => {
            Alert.alert(
              'Remove Device',
              'Are you sure you want to remove this device?',
              [
                { text: 'Cancel', style: 'cancel' },
                { 
                  text: 'Remove', 
                  style: 'destructive',
                  onPress: async () => {
                    try {
                      const success = await smartHomeService.deleteDevice(deviceId);
                      if (success) {
                        Alert.alert('Success', 'Device removed successfully');
                        navigation.goBack();
                      } else {
                        Alert.alert('Error', 'Failed to remove device');
                      }
                    } catch (error) {
                      console.error('Error removing device:', error);
                      Alert.alert('Error', 'Failed to remove device');
                    }
                  }
                }
              ]
            );
          }}
        >
          <Text style={styles.dangerButtonText}>Remove Device</Text>
        </TouchableOpacity>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  scrollContent: {
    padding: 16,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
  },
  iconContainer: {
    width: 80,
    height: 80,
    borderRadius: 40,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 16,
  },
  deviceInfoContainer: {
    flex: 1,
  },
  deviceName: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 4,
  },
  deviceType: {
    fontSize: 14,
    marginBottom: 4,
    textTransform: 'capitalize',
  },
  statusContainer: {
    flexDirection: 'row',
    alignItems: 'center',
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
  connectButton: {
    paddingVertical: 12,
    borderRadius: 8,
    alignItems: 'center',
    marginBottom: 24,
  },
  connectButtonText: {
    color: 'white',
    fontWeight: '600',
    fontSize: 14,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    marginBottom: 16,
  },
  dataContainer: {
    marginBottom: 24,
  },
  dataItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: 'rgba(0,0,0,0.1)',
  },
  dataTextContainer: {
    flex: 1,
    marginLeft: 12,
  },
  dataValue: {
    fontSize: 16,
    fontWeight: '600',
  },
  dataLabel: {
    fontSize: 12,
  },
  actionButton: {
    marginTop: 16,
    paddingVertical: 12,
    borderRadius: 8,
    alignItems: 'center',
  },
  actionButtonText: {
    color: 'white',
    fontWeight: '600',
    fontSize: 14,
  },
  settingsContainer: {
    marginBottom: 24,
  },
  settingItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 12,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: 'rgba(0,0,0,0.1)',
  },
  settingLabel: {
    fontSize: 16,
  },
  settingValue: {
    fontSize: 14,
  },
  dangerButton: {
    paddingVertical: 12,
    borderRadius: 8,
    alignItems: 'center',
    marginTop: 12,
    marginBottom: 24,
  },
  dangerButtonText: {
    color: 'white',
    fontWeight: '600',
    fontSize: 14,
  },
  disconnectedContainer: {
    alignItems: 'center',
    paddingVertical: 32,
    marginBottom: 24,
  },
  disconnectedText: {
    marginTop: 12,
    fontSize: 16,
  },
  noDataText: {
    textAlign: 'center',
    fontSize: 16,
    marginVertical: 24,
  },
  loadingText: {
    marginTop: 16,
    fontSize: 16,
  },
  errorText: {
    fontSize: 16,
    textAlign: 'center',
  },
}); 