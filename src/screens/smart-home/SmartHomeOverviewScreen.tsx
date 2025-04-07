import { useTheme } from '@/hooks/useTheme';
import {
    ConnectionStatus,
    DeviceType,
    SmartHomeDevice,
    SmartHomeService,
} from '@/services/smart-home/SmartHomeService';
import { useFocusEffect, useNavigation } from '@react-navigation/native';
import React, { useCallback, useEffect, useState } from 'react';
import {
    ActivityIndicator,
    FlatList,
    RefreshControl,
    ScrollView,
    StyleSheet,
    Text,
    TouchableOpacity,
    View
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';

// Initialize the service
const smartHomeService = new SmartHomeService();

/**
 * Screen that provides an overview of all connected smart home devices and summary information
 */
export default function SmartHomeOverviewScreen() {
  const { theme } = useTheme();
  const navigation = useNavigation();
  
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [initialized, setInitialized] = useState(false);
  const [devices, setDevices] = useState<SmartHomeDevice[]>([]);
  const [connectedDevicesCount, setConnectedDevicesCount] = useState(0);
  const [energyConsumption, setEnergyConsumption] = useState<number | null>(null);
  const [totalRecycled, setTotalRecycled] = useState<number | null>(null);
  const [error, setError] = useState<string | null>(null);

  // Load devices when screen comes into focus
  useFocusEffect(
    useCallback(() => {
      loadDevices();
    }, [])
  );

  // Initialize service and load devices
  useEffect(() => {
    const initializeService = async () => {
      try {
        if (!initialized) {
          // In a real app, get userId from authentication service
          await smartHomeService.initialize('test-user-123');
          setInitialized(true);
        }
        
        await loadDevices();
      } catch (error) {
        console.error('Error initializing smart home service:', error);
        setError('Failed to initialize smart home service');
        setLoading(false);
      }
    };
    
    initializeService();
  }, []);

  const loadDevices = async () => {
    try {
      setLoading(true);
      
      // Initialize if needed
      if (!initialized) {
        await smartHomeService.initialize('test-user-123');
        setInitialized(true);
      }
      
      // Load devices
      const allDevices = await smartHomeService.getAllDevices();
      setDevices(allDevices);
      
      // Count connected devices
      const connected = allDevices.filter(
        device => device.connectionStatus === ConnectionStatus.CONNECTED
      ).length;
      setConnectedDevicesCount(connected);
      
      // Load energy consumption summary
      await loadEnergySummary(allDevices);
      
      // Load recycling data
      await loadRecyclingSummary(allDevices);
      
      setLoading(false);
      setRefreshing(false);
      setError(null);
    } catch (error) {
      console.error('Error loading devices:', error);
      setError('Failed to load devices');
      setLoading(false);
      setRefreshing(false);
    }
  };

  const loadEnergySummary = async (devices: SmartHomeDevice[]) => {
    try {
      const energyMonitors = devices.filter(
        device => device.type === DeviceType.ENERGY_MONITOR &&
                  device.connectionStatus === ConnectionStatus.CONNECTED
      );
      
      // If no energy monitors, get data from smart appliances
      if (energyMonitors.length === 0) {
        const appliances = devices.filter(
          device => device.type === DeviceType.SMART_APPLIANCE &&
                    device.connectionStatus === ConnectionStatus.CONNECTED
        );
        
        // Sum up estimated consumption from appliances (mock data)
        let totalConsumption = 0;
        for (const appliance of appliances) {
          const mockConsumption = Math.random() * 0.5 + 0.1; // 0.1 to 0.6 kWh
          totalConsumption += mockConsumption;
        }
        
        setEnergyConsumption(totalConsumption);
      } else {
        // Get real data from energy monitors
        let totalConsumption = 0;
        for (const monitor of energyMonitors) {
          const result = await smartHomeService.getDeviceData(monitor.id, 'energy');
          if (result.success && result.data) {
            totalConsumption += result.data;
          }
        }
        
        setEnergyConsumption(totalConsumption);
      }
    } catch (error) {
      console.error('Error loading energy summary:', error);
    }
  };

  const loadRecyclingSummary = async (devices: SmartHomeDevice[]) => {
    try {
      const recyclingBins = devices.filter(
        device => device.type === DeviceType.RECYCLING_BIN &&
                  device.connectionStatus === ConnectionStatus.CONNECTED
      );
      
      if (recyclingBins.length > 0) {
        let totalWeight = 0;
        for (const bin of recyclingBins) {
          // Get recycling stats from the bin
          const result = await smartHomeService.getDeviceData(bin.id, 'recycledTotal');
          if (result.success && result.data) {
            totalWeight += result.data;
          }
        }
        
        setTotalRecycled(totalWeight);
      } else {
        // Set mock data if no bins connected
        setTotalRecycled(null);
      }
    } catch (error) {
      console.error('Error loading recycling summary:', error);
    }
  };

  const handleRefresh = async () => {
    setRefreshing(true);
    await loadDevices();
  };

  const handleAddDevice = () => {
    navigation.navigate('DeviceDiscovery');
  };

  const handleDevicePress = (deviceId: string) => {
    navigation.navigate('DeviceDetails', { deviceId });
  };

  const handleAutomationPress = () => {
    navigation.navigate('AutomationRules');
  };

  const getDeviceIcon = (type: DeviceType) => {
    switch (type) {
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

  const renderDeviceItem = ({ item }: { item: SmartHomeDevice }) => {
    const isConnected = item.connectionStatus === ConnectionStatus.CONNECTED;
    
    return (
      <TouchableOpacity
        style={[
          styles.deviceCard,
          { backgroundColor: theme.colors.card }
        ]}
        onPress={() => handleDevicePress(item.id)}
      >
        <View style={styles.deviceCardContent}>
          <View 
            style={[
              styles.deviceIconContainer,
              { backgroundColor: isConnected ? theme.colors.primary + '20' : '#f0f0f0' }
            ]}
          >
            <Icon 
              name={getDeviceIcon(item.type)} 
              size={24} 
              color={isConnected ? theme.colors.primary : '#9e9e9e'} 
            />
          </View>
          
          <View style={styles.deviceInfo}>
            <Text style={[styles.deviceName, { color: theme.colors.text }]}>
              {item.name}
            </Text>
            <Text style={[styles.deviceType, { color: theme.colors.textSecondary }]}>
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
          
          <Icon name="chevron-right" size={24} color="#9e9e9e" />
        </View>
      </TouchableOpacity>
    );
  };

  const renderSummarySection = () => {
    return (
      <View style={styles.summarySection}>
        <Text style={[styles.sectionTitle, { color: theme.colors.text }]}>
          Summary
        </Text>
        
        <View style={[styles.summaryCard, { backgroundColor: theme.colors.card }]}>
          <View style={styles.summaryItem}>
            <View 
              style={[
                styles.summaryIconContainer, 
                { backgroundColor: theme.colors.primary + '20' }
              ]}
            >
              <Icon name="devices" size={24} color={theme.colors.primary} />
            </View>
            <View style={styles.summaryTextContainer}>
              <Text style={[styles.summaryValue, { color: theme.colors.text }]}>
                {devices.length}
              </Text>
              <Text style={[styles.summaryLabel, { color: theme.colors.textSecondary }]}>
                Total Devices
              </Text>
            </View>
          </View>
          
          <View style={styles.summaryItem}>
            <View 
              style={[
                styles.summaryIconContainer, 
                { backgroundColor: theme.colors.primary + '20' }
              ]}
            >
              <Icon name="wifi" size={24} color={theme.colors.primary} />
            </View>
            <View style={styles.summaryTextContainer}>
              <Text style={[styles.summaryValue, { color: theme.colors.text }]}>
                {connectedDevicesCount}
              </Text>
              <Text style={[styles.summaryLabel, { color: theme.colors.textSecondary }]}>
                Connected
              </Text>
            </View>
          </View>
        </View>
        
        {energyConsumption !== null && (
          <View style={[styles.summaryCard, { backgroundColor: theme.colors.card }]}>
            <View style={styles.summaryItem}>
              <View 
                style={[
                  styles.summaryIconContainer, 
                  { backgroundColor: theme.colors.notification + '20' }
                ]}
              >
                <Icon name="flash" size={24} color={theme.colors.notification} />
              </View>
              <View style={styles.summaryTextContainer}>
                <Text style={[styles.summaryValue, { color: theme.colors.text }]}>
                  {energyConsumption.toFixed(2)} kWh
                </Text>
                <Text style={[styles.summaryLabel, { color: theme.colors.textSecondary }]}>
                  Today's Energy
                </Text>
              </View>
              
              <TouchableOpacity
                style={styles.actionButton}
                onPress={() => {
                  // Find an energy monitor to navigate to, or just show tips
                  const energyMonitor = devices.find(d => d.type === DeviceType.ENERGY_MONITOR);
                  if (energyMonitor) {
                    navigation.navigate('EnergyHistory', { deviceId: energyMonitor.id });
                  } else {
                    navigation.navigate('EnergySavingTips', { applianceType: null });
                  }
                }}
              >
                <Text style={[styles.actionButtonText, { color: theme.colors.primary }]}>
                  Details
                </Text>
              </TouchableOpacity>
            </View>
          </View>
        )}
        
        {totalRecycled !== null && (
          <View style={[styles.summaryCard, { backgroundColor: theme.colors.card }]}>
            <View style={styles.summaryItem}>
              <View 
                style={[
                  styles.summaryIconContainer, 
                  { backgroundColor: '#4CAF50' + '20' }
                ]}
              >
                <Icon name="recycle" size={24} color="#4CAF50" />
              </View>
              <View style={styles.summaryTextContainer}>
                <Text style={[styles.summaryValue, { color: theme.colors.text }]}>
                  {totalRecycled.toFixed(1)} kg
                </Text>
                <Text style={[styles.summaryLabel, { color: theme.colors.textSecondary }]}>
                  Total Recycled
                </Text>
              </View>
              
              <TouchableOpacity
                style={styles.actionButton}
                onPress={() => {
                  // Find a recycling bin to navigate to
                  const bin = devices.find(d => d.type === DeviceType.RECYCLING_BIN);
                  if (bin) {
                    navigation.navigate('RecyclingHistory', { deviceId: bin.id });
                  }
                }}
              >
                <Text style={[styles.actionButtonText, { color: theme.colors.primary }]}>
                  Details
                </Text>
              </TouchableOpacity>
            </View>
          </View>
        )}
      </View>
    );
  };

  const renderDevicesSection = () => {
    return (
      <View style={styles.devicesSection}>
        <View style={styles.sectionHeader}>
          <Text style={[styles.sectionTitle, { color: theme.colors.text }]}>
            Devices
          </Text>
          <TouchableOpacity
            style={[styles.addButton, { backgroundColor: theme.colors.primary }]}
            onPress={handleAddDevice}
          >
            <Icon name="plus" size={16} color="#fff" />
            <Text style={styles.addButtonText}>Add</Text>
          </TouchableOpacity>
        </View>
        
        {devices.length === 0 ? (
          <View style={styles.emptyStateContainer}>
            <Icon name="devices" size={48} color={theme.colors.textSecondary} />
            <Text style={[styles.emptyStateText, { color: theme.colors.textSecondary }]}>
              No devices added yet
            </Text>
            <TouchableOpacity
              style={[styles.emptyStateButton, { backgroundColor: theme.colors.primary }]}
              onPress={handleAddDevice}
            >
              <Text style={styles.emptyStateButtonText}>Add Device</Text>
            </TouchableOpacity>
          </View>
        ) : (
          <FlatList
            data={devices}
            renderItem={renderDeviceItem}
            keyExtractor={(item) => item.id}
            scrollEnabled={false}
            ItemSeparatorComponent={() => <View style={{ height: 8 }} />}
          />
        )}
      </View>
    );
  };

  const renderAutomationSection = () => {
    return (
      <View style={styles.automationSection}>
        <Text style={[styles.sectionTitle, { color: theme.colors.text }]}>
          Automation
        </Text>
        
        <TouchableOpacity
          style={[styles.automationCard, { backgroundColor: theme.colors.card }]}
          onPress={handleAutomationPress}
        >
          <View style={styles.automationCardContent}>
            <View 
              style={[
                styles.automationIconContainer, 
                { backgroundColor: theme.colors.primary + '20' }
              ]}
            >
              <Icon name="robot" size={24} color={theme.colors.primary} />
            </View>
            
            <View style={styles.automationInfo}>
              <Text style={[styles.automationTitle, { color: theme.colors.text }]}>
                Manage Automations
              </Text>
              <Text style={[styles.automationDescription, { color: theme.colors.textSecondary }]}>
                Create and manage automation rules for your devices
              </Text>
            </View>
            
            <Icon name="chevron-right" size={24} color="#9e9e9e" />
          </View>
        </TouchableOpacity>
      </View>
    );
  };

  if (loading && !refreshing) {
    return (
      <View style={[styles.container, { backgroundColor: theme.colors.background }]}>
        <ActivityIndicator size="large" color={theme.colors.primary} />
        <Text style={[styles.loadingText, { color: theme.colors.text }]}>
          Loading smart home devices...
        </Text>
      </View>
    );
  }
  
  if (error && devices.length === 0) {
    return (
      <View style={[styles.container, { backgroundColor: theme.colors.background }]}>
        <Icon name="alert-circle-outline" size={48} color={theme.colors.error} />
        <Text style={[styles.errorText, { color: theme.colors.error }]}>
          {error}
        </Text>
        <TouchableOpacity
          style={[styles.retryButton, { backgroundColor: theme.colors.primary }]}
          onPress={loadDevices}
        >
          <Text style={styles.retryButtonText}>Retry</Text>
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: theme.colors.background }]}>
      <ScrollView
        contentContainerStyle={styles.scrollContent}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={handleRefresh}
            colors={[theme.colors.primary]}
          />
        }
      >
        {renderSummarySection()}
        {renderDevicesSection()}
        {devices.length > 0 && renderAutomationSection()}
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
  summarySection: {
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    marginBottom: 12,
  },
  summaryCard: {
    borderRadius: 12,
    marginBottom: 12,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.22,
    shadowRadius: 2.22,
  },
  summaryItem: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
  },
  summaryIconContainer: {
    width: 48,
    height: 48,
    borderRadius: 24,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 16,
  },
  summaryTextContainer: {
    flex: 1,
  },
  summaryValue: {
    fontSize: 18,
    fontWeight: 'bold',
  },
  summaryLabel: {
    fontSize: 14,
  },
  actionButton: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
  },
  actionButtonText: {
    fontWeight: '600',
    fontSize: 12,
  },
  devicesSection: {
    marginBottom: 24,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  addButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
  },
  addButtonText: {
    color: '#fff',
    fontWeight: '600',
    fontSize: 12,
    marginLeft: 4,
  },
  deviceCard: {
    borderRadius: 12,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.22,
    shadowRadius: 2.22,
  },
  deviceCardContent: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
  },
  deviceIconContainer: {
    width: 48,
    height: 48,
    borderRadius: 24,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 16,
  },
  deviceInfo: {
    flex: 1,
  },
  deviceName: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 2,
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
  emptyStateContainer: {
    alignItems: 'center',
    padding: 32,
    borderRadius: 12,
    backgroundColor: 'rgba(0,0,0,0.03)',
  },
  emptyStateText: {
    fontSize: 16,
    marginVertical: 16,
  },
  emptyStateButton: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 8,
  },
  emptyStateButtonText: {
    color: '#fff',
    fontWeight: '600',
  },
  automationSection: {
    marginBottom: 24,
  },
  automationCard: {
    borderRadius: 12,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.22,
    shadowRadius: 2.22,
  },
  automationCardContent: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
  },
  automationIconContainer: {
    width: 48,
    height: 48,
    borderRadius: 24,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 16,
  },
  automationInfo: {
    flex: 1,
  },
  automationTitle: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 4,
  },
  automationDescription: {
    fontSize: 14,
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
  retryButton: {
    marginTop: 16,
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 8,
  },
  retryButtonText: {
    color: '#fff',
    fontWeight: '600',
  },
}); 