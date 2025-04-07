import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '@react-navigation/native';
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
import { DeviceSettings, DeviceType, SmartHomeDevice, SmartHomeService } from '../../services/smart-home/SmartHomeService';

interface SmartDeviceSettingsProps {
  deviceId: string;
  onBack?: () => void;
}

function SmartDeviceSettings({ deviceId, onBack }: SmartDeviceSettingsProps) {
  const [device, setDevice] = useState<SmartHomeDevice | null>(null);
  const [settings, setSettings] = useState<DeviceSettings | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const theme = useTheme();

  useEffect(() => {
    loadDeviceAndSettings();
  }, [deviceId]);

  const loadDeviceAndSettings = async () => {
    setIsLoading(true);
    try {
      // Get the service instance
      const smartHomeService = SmartHomeService.getInstance();
      
      // Get device details
      const deviceData = await smartHomeService.getDevice(deviceId);
      if (!deviceData) {
        throw new Error('Device not found');
      }
      
      setDevice(deviceData);
      
      // Get device settings
      const deviceSettings = await smartHomeService.getDeviceSettings(deviceId);
      setSettings(deviceSettings);
    } catch (error) {
      console.error('Error loading device settings:', error);
      Alert.alert(
        'Error',
        'Could not load device settings. Please try again later.',
        [{ text: 'OK' }]
      );
    } finally {
      setIsLoading(false);
    }
  };

  const saveSettings = async () => {
    if (!settings || !device) return;
    
    setIsSaving(true);
    try {
      // Get the service instance
      const smartHomeService = SmartHomeService.getInstance();
      
      // Save the updated settings
      await smartHomeService.updateDeviceSettings(deviceId, settings);
      
      Alert.alert(
        'Success',
        'Device settings have been saved successfully.',
        [{ text: 'OK' }]
      );
    } catch (error) {
      console.error('Error saving device settings:', error);
      Alert.alert(
        'Error',
        'Could not save device settings. Please try again later.',
        [{ text: 'OK' }]
      );
    } finally {
      setIsSaving(false);
    }
  };

  const handleToggleSetting = (key: string, value: boolean) => {
    if (!settings) return;
    
    setSettings({
      ...settings,
      [key]: value,
    });
  };

  const handleUpdateSetting = (key: string, value: any) => {
    if (!settings) return;
    
    setSettings({
      ...settings,
      [key]: value,
    });
  };

  const renderDeviceTypeIcon = () => {
    if (!device) return null;

    let iconName = 'help-circle-outline';
    
    switch (device.type) {
      case DeviceType.SMART_BIN:
        iconName = 'trash-outline';
        break;
      case DeviceType.ENERGY_MONITOR:
        iconName = 'flash-outline';
        break;
      case DeviceType.WATER_MONITOR:
        iconName = 'water-outline';
        break;
      case DeviceType.COMPOSTING_SYSTEM:
        iconName = 'leaf-outline';
        break;
    }

    return (
      <View style={styles.iconContainer}>
        <Ionicons name={iconName} size={48} color={theme.colors.primary} />
      </View>
    );
  };

  const getDeviceTypeName = () => {
    if (!device) return 'Unknown Device';

    switch (device.type) {
      case DeviceType.SMART_BIN:
        return 'Smart Recycling Bin';
      case DeviceType.ENERGY_MONITOR:
        return 'Energy Monitor';
      case DeviceType.WATER_MONITOR:
        return 'Water Usage Monitor';
      case DeviceType.COMPOSTING_SYSTEM:
        return 'Smart Composting System';
      default:
        return 'Smart Device';
    }
  };

  if (isLoading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color={theme.colors.primary} />
        <Text style={styles.loadingText}>Loading device settings...</Text>
      </View>
    );
  }

  if (!device || !settings) {
    return (
      <View style={styles.errorContainer}>
        <Ionicons name="alert-circle-outline" size={48} color={theme.colors.notification} />
        <Text style={styles.errorText}>Device not found or settings unavailable.</Text>
        {onBack && (
          <TouchableOpacity style={styles.backButton} onPress={onBack}>
            <Text style={[styles.backButtonText, { color: theme.colors.primary }]}>Go Back</Text>
          </TouchableOpacity>
        )}
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        {onBack && (
          <TouchableOpacity style={styles.backButton} onPress={onBack}>
            <Ionicons name="arrow-back" size={24} color={theme.colors.text} />
          </TouchableOpacity>
        )}
        <Text style={styles.headerTitle}>{device.name}</Text>
      </View>

      <ScrollView style={styles.scrollView}>
        <View style={styles.deviceInfo}>
          {renderDeviceTypeIcon()}
          <Text style={styles.deviceType}>{getDeviceTypeName()}</Text>
          <Text style={styles.deviceId}>ID: {device.id}</Text>
          <Text style={styles.connectionStatus}>
            Status: {device.isConnected ? 'Connected' : 'Disconnected'}
          </Text>
        </View>

        <View style={styles.settingsSection}>
          <Text style={styles.sectionTitle}>Device Settings</Text>

          <View style={styles.settingItem}>
            <Text style={styles.settingLabel}>Notifications</Text>
            <Switch
              value={settings.enableNotifications}
              onValueChange={(value) => handleToggleSetting('enableNotifications', value)}
            />
          </View>

          <View style={styles.settingItem}>
            <Text style={styles.settingLabel}>Auto-connect on startup</Text>
            <Switch
              value={settings.autoConnect}
              onValueChange={(value) => handleToggleSetting('autoConnect', value)}
            />
          </View>

          {device.type === DeviceType.SMART_BIN && (
            <>
              <View style={styles.settingItem}>
                <Text style={styles.settingLabel}>Fill level notifications</Text>
                <Switch
                  value={settings.fillLevelAlerts}
                  onValueChange={(value) => handleToggleSetting('fillLevelAlerts', value)}
                />
              </View>
              
              <View style={styles.settingItem}>
                <Text style={styles.settingLabel}>Contamination detection</Text>
                <Switch
                  value={settings.contaminationDetection}
                  onValueChange={(value) => handleToggleSetting('contaminationDetection', value)}
                />
              </View>
            </>
          )}

          {device.type === DeviceType.ENERGY_MONITOR && (
            <View style={styles.settingItem}>
              <Text style={styles.settingLabel}>Energy usage alerts</Text>
              <Switch
                value={settings.energyUsageAlerts}
                onValueChange={(value) => handleToggleSetting('energyUsageAlerts', value)}
              />
            </View>
          )}

          {device.type === DeviceType.WATER_MONITOR && (
            <View style={styles.settingItem}>
              <Text style={styles.settingLabel}>Water usage alerts</Text>
              <Switch
                value={settings.waterUsageAlerts}
                onValueChange={(value) => handleToggleSetting('waterUsageAlerts', value)}
              />
            </View>
          )}

          {device.type === DeviceType.COMPOSTING_SYSTEM && (
            <>
              <View style={styles.settingItem}>
                <Text style={styles.settingLabel}>Temperature alerts</Text>
                <Switch
                  value={settings.temperatureAlerts}
                  onValueChange={(value) => handleToggleSetting('temperatureAlerts', value)}
                />
              </View>
              
              <View style={styles.settingItem}>
                <Text style={styles.settingLabel}>Moisture alerts</Text>
                <Switch
                  value={settings.moistureAlerts}
                  onValueChange={(value) => handleToggleSetting('moistureAlerts', value)}
                />
              </View>
            </>
          )}

          <View style={styles.settingItem}>
            <Text style={styles.settingLabel}>Data sync interval (minutes)</Text>
            <Text style={styles.settingValue}>{settings.dataSyncInterval}</Text>
          </View>

          <View style={styles.settingItem}>
            <Text style={styles.settingLabel}>Device nickname</Text>
            <Text style={styles.settingValue}>{settings.nickname || device.name}</Text>
          </View>
        </View>

        <View style={styles.actionsSection}>
          <Text style={styles.sectionTitle}>Actions</Text>
          
          <TouchableOpacity 
            style={styles.actionButton}
            onPress={() => {
              Alert.alert(
                'Forget Device',
                'Are you sure you want to forget this device? You will need to reconnect it later.',
                [
                  { text: 'Cancel', style: 'cancel' },
                  { 
                    text: 'Forget', 
                    style: 'destructive',
                    onPress: async () => {
                      try {
                        const smartHomeService = SmartHomeService.getInstance();
                        await smartHomeService.removeDevice(deviceId);
                        Alert.alert('Success', 'Device has been removed.');
                        if (onBack) onBack();
                      } catch (error) {
                        console.error('Error removing device:', error);
                        Alert.alert('Error', 'Could not remove device. Please try again.');
                      }
                    }
                  }
                ]
              );
            }}
          >
            <Ionicons name="trash-outline" size={24} color="red" />
            <Text style={[styles.actionButtonText, { color: 'red' }]}>Forget Device</Text>
          </TouchableOpacity>

          <TouchableOpacity 
            style={styles.actionButton}
            onPress={() => {
              Alert.alert(
                'Reset Device',
                'Are you sure you want to reset this device to factory settings?',
                [
                  { text: 'Cancel', style: 'cancel' },
                  { 
                    text: 'Reset', 
                    style: 'destructive',
                    onPress: async () => {
                      try {
                        const smartHomeService = SmartHomeService.getInstance();
                        // Reset device (mock implementation)
                        Alert.alert('Success', 'Device has been reset to factory settings.');
                        loadDeviceAndSettings();
                      } catch (error) {
                        console.error('Error resetting device:', error);
                        Alert.alert('Error', 'Could not reset device. Please try again.');
                      }
                    }
                  }
                ]
              );
            }}
          >
            <Ionicons name="refresh-outline" size={24} color={theme.colors.text} />
            <Text style={styles.actionButtonText}>Factory Reset</Text>
          </TouchableOpacity>

          {device.isConnected && (
            <TouchableOpacity 
              style={styles.actionButton}
              onPress={async () => {
                try {
                  const smartHomeService = SmartHomeService.getInstance();
                  await smartHomeService.disconnectDevice(deviceId);
                  
                  // Update device state
                  const updatedDevice = {
                    ...device,
                    isConnected: false
                  };
                  setDevice(updatedDevice);
                  
                  Alert.alert('Success', 'Device has been disconnected.');
                } catch (error) {
                  console.error('Error disconnecting device:', error);
                  Alert.alert('Error', 'Could not disconnect device. Please try again.');
                }
              }}
            >
              <Ionicons name="bluetooth-outline" size={24} color={theme.colors.text} />
              <Text style={styles.actionButtonText}>Disconnect</Text>
            </TouchableOpacity>
          )}

          {!device.isConnected && (
            <TouchableOpacity 
              style={styles.actionButton}
              onPress={async () => {
                try {
                  const smartHomeService = SmartHomeService.getInstance();
                  const result = await smartHomeService.connectDevice(deviceId);
                  
                  if (result.success) {
                    // Update device state
                    const updatedDevice = {
                      ...device,
                      isConnected: true
                    };
                    setDevice(updatedDevice);
                    
                    Alert.alert('Success', 'Device has been connected.');
                  } else {
                    Alert.alert('Error', `Could not connect device: ${result.error}`);
                  }
                } catch (error) {
                  console.error('Error connecting device:', error);
                  Alert.alert('Error', 'Could not connect to device. Please try again.');
                }
              }}
            >
              <Ionicons name="bluetooth-outline" size={24} color={theme.colors.text} />
              <Text style={styles.actionButtonText}>Connect</Text>
            </TouchableOpacity>
          )}
        </View>
      </ScrollView>

      <View style={styles.footer}>
        <TouchableOpacity 
          style={[
            styles.saveButton, 
            { backgroundColor: theme.colors.primary },
            isSaving && styles.saveButtonDisabled
          ]}
          onPress={saveSettings}
          disabled={isSaving}
        >
          {isSaving ? (
            <ActivityIndicator size="small" color="#fff" />
          ) : (
            <Text style={styles.saveButtonText}>Save Settings</Text>
          )}
        </TouchableOpacity>
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
    alignItems: 'center',
    padding: 16,
    backgroundColor: '#fff',
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
  },
  backButton: {
    marginRight: 16,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    flex: 1,
  },
  scrollView: {
    flex: 1,
  },
  deviceInfo: {
    padding: 16,
    backgroundColor: '#fff',
    alignItems: 'center',
    marginBottom: 16,
    marginTop: 16,
    marginHorizontal: 16,
    borderRadius: 8,
    elevation: 1,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 1,
  },
  iconContainer: {
    marginBottom: 16,
  },
  deviceType: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 8,
  },
  deviceId: {
    fontSize: 12,
    color: '#666',
    marginBottom: 8,
  },
  connectionStatus: {
    fontSize: 14,
    color: '#444',
  },
  settingsSection: {
    backgroundColor: '#fff',
    marginBottom: 16,
    marginHorizontal: 16,
    borderRadius: 8,
    padding: 16,
    elevation: 1,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 1,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 16,
  },
  settingItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
  },
  settingLabel: {
    fontSize: 16,
    color: '#444',
  },
  settingValue: {
    fontSize: 16,
    color: '#666',
  },
  actionsSection: {
    backgroundColor: '#fff',
    marginBottom: 32,
    marginHorizontal: 16,
    borderRadius: 8,
    padding: 16,
    elevation: 1,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 1,
  },
  actionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
  },
  actionButtonText: {
    fontSize: 16,
    marginLeft: 16,
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
  saveButton: {
    padding: 16,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
  },
  saveButtonDisabled: {
    opacity: 0.7,
  },
  saveButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#f8f9fa',
  },
  loadingText: {
    marginTop: 16,
    fontSize: 16,
    color: '#666',
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#f8f9fa',
    padding: 16,
  },
  errorText: {
    marginTop: 16,
    marginBottom: 24,
    fontSize: 16,
    color: '#666',
    textAlign: 'center',
  },
  backButtonText: {
    fontSize: 16,
    fontWeight: 'bold',
  },
});

export default SmartDeviceSettings; 