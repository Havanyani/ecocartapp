import { useTheme } from '@/hooks/useTheme';
import {
    SmartHomeService
} from '@/services/smart-home/SmartHomeService';
import {
    ApplianceType,
    SmartApplianceAdapter
} from '@/services/smart-home/adapters/SmartApplianceAdapter';
import { useNavigation, useRoute } from '@react-navigation/native';
import React, { useEffect, useState } from 'react';
import {
    ActivityIndicator,
    Alert,
    ScrollView,
    Slider,
    StyleSheet,
    Switch,
    Text,
    TouchableOpacity,
    View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';

// Initialize services
const smartHomeService = new SmartHomeService();
const applianceAdapter = new SmartApplianceAdapter();

/**
 * Screen for controlling smart appliance settings and features
 */
export default function SmartDeviceControlScreen() {
  const { theme } = useTheme();
  const navigation = useNavigation();
  const route = useRoute();
  
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [deviceId, setDeviceId] = useState<string>('');
  const [deviceName, setDeviceName] = useState<string>('');
  const [deviceType, setDeviceType] = useState<ApplianceType | null>(null);

  // Device state
  const [isPowered, setIsPowered] = useState(false);
  const [currentMode, setCurrentMode] = useState<string>('standard');
  const [temperature, setTemperature] = useState<number>(22);
  const [ecoMode, setEcoMode] = useState<boolean>(false);
  const [scheduledStart, setScheduledStart] = useState<string | null>(null);
  const [powerUsage, setPowerUsage] = useState<number | null>(null);
  const [availableModes, setAvailableModes] = useState<string[]>([]);

  useEffect(() => {
    // Get device ID from route params
    const id = route.params?.deviceId;
    if (!id) {
      setError('No device ID provided');
      setLoading(false);
      return;
    }
    
    setDeviceId(id);
    loadDeviceDetails();
  }, []);

  const loadDeviceDetails = async () => {
    try {
      // Initialize the adapter if needed
      if (!(applianceAdapter as any).initialized) {
        await applianceAdapter.initialize();
      }
      
      // Get device from SmartHomeService
      const device = await smartHomeService.getDevice(deviceId);
      if (!device) {
        setError('Device not found');
        setLoading(false);
        return;
      }
      
      setDeviceName(device.name);
      
      // Connect to the device if not already connected
      if (!applianceAdapter.isConnected(deviceId)) {
        const connectionResult = await applianceAdapter.connect(deviceId);
        if (!connectionResult.success) {
          setError(`Failed to connect: ${connectionResult.error}`);
          setLoading(false);
          return;
        }
      }
      
      // Get the appliance type
      const applianceType = await applianceAdapter.getApplianceType(deviceId);
      setDeviceType(applianceType);
      
      // Load the current status
      const status = await applianceAdapter.getStatus(deviceId);
      if (status) {
        setIsPowered(status.isPowered);
        setCurrentMode(status.currentMode);
        setTemperature(status.temperature || 22);
        setEcoMode(status.ecoMode || false);
        setScheduledStart(status.scheduledStart);
      }
      
      // Load energy usage data
      const usage = await applianceAdapter.getEnergyUsage(deviceId);
      if (usage && usage.length > 0) {
        setPowerUsage(usage[0].powerWatts);
      }
      
      // Get available modes for this appliance
      const modes = getApplianceModes(applianceType);
      setAvailableModes(modes);
      
      setLoading(false);
    } catch (error) {
      console.error('Error loading device details:', error);
      setError('Failed to load device details');
      setLoading(false);
    }
  };

  const getApplianceModes = (type: ApplianceType | null): string[] => {
    switch (type) {
      case ApplianceType.WASHING_MACHINE:
        return ['eco', 'quick', 'normal', 'intensive', 'delicate'];
      case ApplianceType.REFRIGERATOR:
        return ['standard', 'vacation', 'rapid cool', 'energy save'];
      case ApplianceType.DRYER:
        return ['eco', 'delicate', 'quick', 'heavy duty', 'normal'];
      case ApplianceType.DISHWASHER:
        return ['eco', 'quick', 'intensive', 'glass', 'normal'];
      case ApplianceType.OVEN:
        return ['bake', 'broil', 'convection', 'eco', 'warm'];
      case ApplianceType.AIR_CONDITIONER:
        return ['cool', 'heat', 'fan', 'auto', 'eco'];
      default:
        return ['standard', 'eco'];
    }
  };

  const handlePowerToggle = async () => {
    try {
      const newPoweredState = !isPowered;
      const result = await applianceAdapter.setPower(deviceId, newPoweredState);
      
      if (result.success) {
        setIsPowered(newPoweredState);
        Alert.alert(
          'Success', 
          `Device ${newPoweredState ? 'powered on' : 'powered off'}`
        );
      } else {
        Alert.alert('Error', result.error || 'Failed to change power state');
      }
    } catch (error) {
      console.error('Error toggling power:', error);
      Alert.alert('Error', 'Failed to change power state');
    }
  };

  const handleModeChange = async (mode: string) => {
    try {
      const result = await applianceAdapter.setMode(deviceId, mode);
      
      if (result.success) {
        setCurrentMode(mode);
        Alert.alert('Success', `Mode changed to ${mode}`);
      } else {
        Alert.alert('Error', result.error || 'Failed to change mode');
      }
    } catch (error) {
      console.error('Error changing mode:', error);
      Alert.alert('Error', 'Failed to change mode');
    }
  };

  const handleEcoModeToggle = async () => {
    try {
      const newEcoMode = !ecoMode;
      const result = await applianceAdapter.setMode(
        deviceId, 
        newEcoMode ? 'eco' : 'standard'
      );
      
      if (result.success) {
        setEcoMode(newEcoMode);
        setCurrentMode(newEcoMode ? 'eco' : 'standard');
        Alert.alert(
          'Success', 
          `Eco mode ${newEcoMode ? 'enabled' : 'disabled'}`
        );
      } else {
        Alert.alert('Error', result.error || 'Failed to change eco mode');
      }
    } catch (error) {
      console.error('Error toggling eco mode:', error);
      Alert.alert('Error', 'Failed to change eco mode');
    }
  };

  const handleTemperatureChange = async (value: number) => {
    try {
      // Update local state immediately for responsive UI
      setTemperature(value);
      
      // Debounce the actual API call (would typically use useEffect with debounce)
      const result = await applianceAdapter.setTemperature(deviceId, value);
      
      if (!result.success) {
        Alert.alert('Error', result.error || 'Failed to set temperature');
        // Revert to previous value if error
        loadDeviceDetails();
      }
    } catch (error) {
      console.error('Error setting temperature:', error);
      Alert.alert('Error', 'Failed to set temperature');
    }
  };

  const handleSchedulePress = () => {
    // Navigate to scheduling screen
    navigation.navigate('ApplianceScheduleScreen', { 
      deviceId,
      deviceName,
      currentSchedule: scheduledStart
    });
  };

  const renderPowerControl = () => {
    return (
      <View style={styles.controlSection}>
        <Text style={[styles.sectionTitle, { color: theme.colors.text }]}>
          Power Control
        </Text>
        
        <View style={styles.powerButtonContainer}>
          <TouchableOpacity
            style={[
              styles.powerButton,
              { backgroundColor: isPowered ? theme.colors.primary : '#444' }
            ]}
            onPress={handlePowerToggle}
          >
            <Icon 
              name="power" 
              size={32} 
              color="#fff" 
            />
          </TouchableOpacity>
          <Text style={[styles.powerStatusText, { color: theme.colors.text }]}>
            {isPowered ? 'ON' : 'OFF'}
          </Text>
        </View>
        
        {isPowered && powerUsage !== null && (
          <View style={styles.usageContainer}>
            <Icon name="lightning-bolt" size={20} color={theme.colors.primary} />
            <Text style={[styles.usageText, { color: theme.colors.textSecondary }]}>
              Current power usage: {powerUsage} W
            </Text>
          </View>
        )}
      </View>
    );
  };

  const renderModeSelector = () => {
    if (!isPowered || !availableModes.length) return null;
    
    return (
      <View style={styles.controlSection}>
        <Text style={[styles.sectionTitle, { color: theme.colors.text }]}>
          Operation Mode
        </Text>
        
        <ScrollView 
          horizontal 
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.modesContainer}
        >
          {availableModes.map((mode) => (
            <TouchableOpacity
              key={mode}
              style={[
                styles.modeButton,
                currentMode === mode ? 
                  { backgroundColor: theme.colors.primary } : 
                  { backgroundColor: theme.colors.card }
              ]}
              onPress={() => handleModeChange(mode)}
            >
              <Text 
                style={[
                  styles.modeButtonText,
                  { color: currentMode === mode ? '#fff' : theme.colors.text }
                ]}
              >
                {mode.charAt(0).toUpperCase() + mode.slice(1)}
              </Text>
            </TouchableOpacity>
          ))}
        </ScrollView>
      </View>
    );
  };

  const renderTemperatureControl = () => {
    if (!isPowered || 
      ![ApplianceType.REFRIGERATOR, ApplianceType.AIR_CONDITIONER, ApplianceType.OVEN].includes(deviceType as ApplianceType)) {
      return null;
    }
    
    const minTemp = deviceType === ApplianceType.REFRIGERATOR ? 1 : 
                   deviceType === ApplianceType.OVEN ? 50 : 16;
                   
    const maxTemp = deviceType === ApplianceType.REFRIGERATOR ? 7 : 
                   deviceType === ApplianceType.OVEN ? 250 : 30;
    
    const unit = deviceType === ApplianceType.OVEN && temperature > 40 ? '°C' : '°C';
    
    return (
      <View style={styles.controlSection}>
        <Text style={[styles.sectionTitle, { color: theme.colors.text }]}>
          Temperature Control
        </Text>
        
        <View style={styles.temperatureContainer}>
          <Text style={[styles.temperatureValue, { color: theme.colors.primary }]}>
            {Math.round(temperature)}{unit}
          </Text>
          
          <View style={styles.sliderContainer}>
            <Text style={{ color: theme.colors.textSecondary }}>{minTemp}{unit}</Text>
            <Slider
              style={styles.slider}
              minimumValue={minTemp}
              maximumValue={maxTemp}
              value={temperature}
              onValueChange={setTemperature}
              onSlidingComplete={handleTemperatureChange}
              minimumTrackTintColor={theme.colors.primary}
              maximumTrackTintColor={theme.colors.border}
              thumbTintColor={theme.colors.primary}
              step={deviceType === ApplianceType.REFRIGERATOR ? 0.5 : 1}
            />
            <Text style={{ color: theme.colors.textSecondary }}>{maxTemp}{unit}</Text>
          </View>
        </View>
      </View>
    );
  };

  const renderEcoModeToggle = () => {
    if (!isPowered) return null;
    
    return (
      <View style={styles.controlSection}>
        <View style={styles.ecoModeContainer}>
          <View>
            <Text style={[styles.settingLabel, { color: theme.colors.text }]}>
              Eco Mode
            </Text>
            <Text style={[styles.settingDescription, { color: theme.colors.textSecondary }]}>
              Optimizes energy consumption
            </Text>
          </View>
          
          <Switch
            value={ecoMode}
            onValueChange={handleEcoModeToggle}
            trackColor={{ false: '#767577', true: theme.colors.primary + '50' }}
            thumbColor={ecoMode ? theme.colors.primary : '#f4f3f4'}
          />
        </View>
      </View>
    );
  };

  const renderSchedulingOptions = () => {
    if (!isPowered) return null;
    
    return (
      <View style={styles.controlSection}>
        <Text style={[styles.sectionTitle, { color: theme.colors.text }]}>
          Scheduling
        </Text>
        
        <View style={styles.scheduleContainer}>
          <View>
            <Text style={[styles.settingLabel, { color: theme.colors.text }]}>
              {scheduledStart ? 'Scheduled Start' : 'No Schedule Set'}
            </Text>
            {scheduledStart && (
              <Text style={[styles.settingDescription, { color: theme.colors.textSecondary }]}>
                {scheduledStart}
              </Text>
            )}
          </View>
          
          <TouchableOpacity
            style={[styles.scheduleButton, { backgroundColor: theme.colors.primary }]}
            onPress={handleSchedulePress}
          >
            <Text style={styles.scheduleButtonText}>
              {scheduledStart ? 'Change' : 'Set Schedule'}
            </Text>
          </TouchableOpacity>
        </View>
      </View>
    );
  };

  const renderEnergyUsageSection = () => {
    if (!isPowered || powerUsage === null) return null;
    
    return (
      <View style={styles.controlSection}>
        <Text style={[styles.sectionTitle, { color: theme.colors.text }]}>
          Energy Insights
        </Text>
        
        <TouchableOpacity
          style={[styles.actionButton, { backgroundColor: theme.colors.card }]}
          onPress={() => navigation.navigate('EnergyUsageScreen', { deviceId })}
        >
          <Icon name="chart-line" size={20} color={theme.colors.primary} />
          <Text style={[styles.actionButtonText, { color: theme.colors.text }]}>
            View Energy Usage History
          </Text>
        </TouchableOpacity>
        
        <TouchableOpacity
          style={[styles.actionButton, { backgroundColor: theme.colors.card }]}
          onPress={() => navigation.navigate('EnergySavingTipsScreen', { applianceType: deviceType })}
        >
          <Icon name="lightbulb-outline" size={20} color={theme.colors.primary} />
          <Text style={[styles.actionButtonText, { color: theme.colors.text }]}>
            Energy Saving Tips
          </Text>
        </TouchableOpacity>
      </View>
    );
  };

  if (loading) {
    return (
      <View style={[styles.container, { backgroundColor: theme.colors.background }]}>
        <ActivityIndicator size="large" color={theme.colors.primary} />
        <Text style={[styles.loadingText, { color: theme.colors.text }]}>
          Connecting to device...
        </Text>
      </View>
    );
  }

  if (error) {
    return (
      <View style={[styles.container, { backgroundColor: theme.colors.background }]}>
        <Icon name="alert-circle-outline" size={48} color={theme.colors.error} />
        <Text style={[styles.errorText, { color: theme.colors.error }]}>
          {error}
        </Text>
        <TouchableOpacity
          style={[styles.actionButton, { backgroundColor: theme.colors.primary, marginTop: 20 }]}
          onPress={() => navigation.goBack()}
        >
          <Text style={styles.buttonText}>Go Back</Text>
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: theme.colors.background }]}>
      <ScrollView contentContainerStyle={styles.scrollContent}>
        <View style={styles.header}>
          <Text style={[styles.deviceName, { color: theme.colors.text }]}>
            {deviceName}
          </Text>
          {deviceType && (
            <Text style={[styles.deviceType, { color: theme.colors.textSecondary }]}>
              {deviceType}
            </Text>
          )}
        </View>

        {renderPowerControl()}
        {renderModeSelector()}
        {renderTemperatureControl()}
        {renderEcoModeToggle()}
        {renderSchedulingOptions()}
        {renderEnergyUsageSection()}
        
        <TouchableOpacity
          style={[styles.backButton, { backgroundColor: theme.colors.card }]}
          onPress={() => navigation.goBack()}
        >
          <Text style={[styles.backButtonText, { color: theme.colors.text }]}>
            Back to Device Details
          </Text>
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
    marginBottom: 24,
  },
  deviceName: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 4,
  },
  deviceType: {
    fontSize: 16,
    textTransform: 'capitalize',
  },
  controlSection: {
    marginBottom: 24,
    padding: 16,
    borderRadius: 12,
    backgroundColor: 'rgba(0,0,0,0.03)',
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    marginBottom: 16,
  },
  powerButtonContainer: {
    alignItems: 'center',
    marginVertical: 8,
  },
  powerButton: {
    width: 70,
    height: 70,
    borderRadius: 35,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 8,
  },
  powerStatusText: {
    fontSize: 16,
    fontWeight: '600',
  },
  usageContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 8,
  },
  usageText: {
    marginLeft: 4,
    fontSize: 14,
  },
  modesContainer: {
    paddingVertical: 8,
  },
  modeButton: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    marginRight: 8,
  },
  modeButtonText: {
    fontWeight: '500',
  },
  temperatureContainer: {
    alignItems: 'center',
  },
  temperatureValue: {
    fontSize: 42,
    fontWeight: 'bold',
    marginBottom: 16,
  },
  sliderContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    width: '100%',
  },
  slider: {
    flex: 1,
    height: 40,
    marginHorizontal: 8,
  },
  ecoModeContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  settingLabel: {
    fontSize: 16,
    fontWeight: '500',
  },
  settingDescription: {
    fontSize: 14,
    marginTop: 2,
  },
  scheduleContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  scheduleButton: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 8,
  },
  scheduleButtonText: {
    color: 'white',
    fontWeight: '500',
  },
  actionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 12,
    borderRadius: 8,
    marginBottom: 8,
  },
  actionButtonText: {
    marginLeft: 8,
    fontWeight: '500',
  },
  backButton: {
    paddingVertical: 12,
    borderRadius: 8,
    alignItems: 'center',
    marginTop: 16,
    marginBottom: 24,
  },
  backButtonText: {
    fontWeight: '500',
  },
  loadingText: {
    marginTop: 16,
    fontSize: 16,
    textAlign: 'center',
  },
  errorText: {
    marginTop: 16,
    fontSize: 16,
    textAlign: 'center',
  },
  buttonText: {
    color: 'white',
    fontWeight: '600',
  },
}); 