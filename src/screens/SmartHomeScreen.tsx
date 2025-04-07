import { Ionicons } from '@expo/vector-icons';
import { useNavigation, useTheme } from '@react-navigation/native';
import React, { useCallback, useEffect, useState } from 'react';
import {
    ActivityIndicator,
    Alert,
    Modal,
    Platform,
    ScrollView,
    StatusBar,
    StyleSheet,
    Text,
    TouchableOpacity,
    View
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import DeviceDiscovery from '../components/smart-home/DeviceDiscovery';
import SmartDeviceSettings from '../components/smart-home/SmartDeviceSettings';
import { DeviceType, SmartHomeDevice, SmartHomeService, VoicePlatform } from '../services/smart-home/SmartHomeService';

function SmartHomeScreen() {
  const [devices, setDevices] = useState<SmartHomeDevice[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedDeviceId, setSelectedDeviceId] = useState<string | null>(null);
  const [showDiscovery, setShowDiscovery] = useState(false);
  const [showDeviceSettings, setShowDeviceSettings] = useState(false);
  const [linkedPlatforms, setLinkedPlatforms] = useState<{
    [key in VoicePlatform]?: boolean;
  }>({});
  const [linkingPlatform, setLinkingPlatform] = useState<VoicePlatform | null>(null);
  
  const theme = useTheme();
  const navigation = useNavigation();

  const loadDevices = useCallback(async () => {
    setIsLoading(true);
    
    try {
      // Get the service instance
      const smartHomeService = SmartHomeService.getInstance();
      
      // Load all devices
      const allDevices = await smartHomeService.getAllDevices();
      setDevices(allDevices);
      
      // Check platform link status
      const googleLinked = await smartHomeService.isPlatformLinked(VoicePlatform.GOOGLE_ASSISTANT);
      const alexaLinked = await smartHomeService.isPlatformLinked(VoicePlatform.ALEXA);
      const siriLinked = await smartHomeService.isPlatformLinked(VoicePlatform.SIRI);
      
      setLinkedPlatforms({
        [VoicePlatform.GOOGLE_ASSISTANT]: googleLinked,
        [VoicePlatform.ALEXA]: alexaLinked,
        [VoicePlatform.SIRI]: siriLinked,
      });
    } catch (error) {
      console.error('Error loading smart home data:', error);
      Alert.alert(
        'Error',
        'Could not load smart home data. Please try again later.',
        [{ text: 'OK' }]
      );
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    loadDevices();
    
    // Listen for device connection changes
    const smartHomeService = SmartHomeService.getInstance();
    
    const connectionStatusHandler = () => {
      loadDevices();
    };
    
    smartHomeService.on('connectionStatusChanged', connectionStatusHandler);
    
    return () => {
      smartHomeService.off('connectionStatusChanged', connectionStatusHandler);
    };
  }, [loadDevices]);

  const handleStartLinkPlatform = async (platform: VoicePlatform) => {
    setLinkingPlatform(platform);
    
    try {
      const smartHomeService = SmartHomeService.getInstance();
      const result = await smartHomeService.linkVoicePlatform(platform);
      
      if (result.success) {
        setLinkedPlatforms(prev => ({
          ...prev,
          [platform]: true
        }));
        
        Alert.alert(
          'Success',
          `Successfully linked with ${getPlatformName(platform)}`,
          [{ text: 'OK' }]
        );
      } else {
        Alert.alert(
          'Linking Failed',
          `Could not link with ${getPlatformName(platform)}: ${result.error}`,
          [{ text: 'OK' }]
        );
      }
    } catch (error) {
      console.error(`Error linking with ${platform}:`, error);
      Alert.alert(
        'Error',
        `An error occurred while linking with ${getPlatformName(platform)}`,
        [{ text: 'OK' }]
      );
    } finally {
      setLinkingPlatform(null);
    }
  };

  const handleUnlinkPlatform = async (platform: VoicePlatform) => {
    Alert.alert(
      'Confirm Unlink',
      `Are you sure you want to unlink ${getPlatformName(platform)}?`,
      [
        { text: 'Cancel', style: 'cancel' },
        { 
          text: 'Unlink', 
          style: 'destructive',
          onPress: async () => {
            setLinkingPlatform(platform);
            
            try {
              const smartHomeService = SmartHomeService.getInstance();
              const success = await smartHomeService.unlinkVoicePlatform(platform);
              
              if (success) {
                setLinkedPlatforms(prev => ({
                  ...prev,
                  [platform]: false
                }));
                
                Alert.alert(
                  'Success',
                  `Successfully unlinked from ${getPlatformName(platform)}`,
                  [{ text: 'OK' }]
                );
              } else {
                Alert.alert(
                  'Unlinking Failed',
                  `Could not unlink from ${getPlatformName(platform)}`,
                  [{ text: 'OK' }]
                );
              }
            } catch (error) {
              console.error(`Error unlinking from ${platform}:`, error);
              Alert.alert(
                'Error',
                `An error occurred while unlinking from ${getPlatformName(platform)}`,
                [{ text: 'OK' }]
              );
            } finally {
              setLinkingPlatform(null);
            }
          }
        }
      ]
    );
  };

  const getPlatformName = (platform: VoicePlatform): string => {
    switch (platform) {
      case VoicePlatform.GOOGLE_ASSISTANT:
        return 'Google Assistant';
      case VoicePlatform.ALEXA:
        return 'Amazon Alexa';
      case VoicePlatform.SIRI:
        return 'Apple Siri';
      default:
        return 'Unknown Platform';
    }
  };

  const getPlatformIcon = (platform: VoicePlatform): string => {
    switch (platform) {
      case VoicePlatform.GOOGLE_ASSISTANT:
        return 'logo-google';
      case VoicePlatform.ALEXA:
        return 'globe-outline'; // No direct Alexa icon in Ionicons, using a placeholder
      case VoicePlatform.SIRI:
        return 'logo-apple';
      default:
        return 'help-circle-outline';
    }
  };

  const getDeviceTypeString = (type: DeviceType): string => {
    switch (type) {
      case DeviceType.SMART_BIN:
        return 'Smart Recycling Bin';
      case DeviceType.ENERGY_MONITOR:
        return 'Energy Monitor';
      default:
        return 'Smart Device';
    }
  };

  const getDeviceIcon = (type: DeviceType): string => {
    switch (type) {
      case DeviceType.SMART_BIN:
        return 'trash-outline';
      case DeviceType.ENERGY_MONITOR:
        return 'flash-outline';
      default:
        return 'hardware-chip-outline';
    }
  };

  const handleDevicePress = (deviceId: string) => {
    setSelectedDeviceId(deviceId);
    setShowDeviceSettings(true);
  };

  const handleAddDevice = () => {
    setShowDiscovery(true);
  };

  const handleDeviceSelected = (deviceId: string) => {
    setShowDiscovery(false);
    loadDevices();
    
    // Optionally, navigate to device settings immediately
    setTimeout(() => {
      setSelectedDeviceId(deviceId);
      setShowDeviceSettings(true);
    }, 500);
  };

  const renderDeviceItem = (device: SmartHomeDevice) => {
    return (
      <TouchableOpacity
        key={device.id}
        style={styles.deviceCard}
        onPress={() => handleDevicePress(device.id)}
      >
        <View style={styles.deviceIconContainer}>
          <Ionicons
            name={getDeviceIcon(device.type)}
            size={32}
            color={device.isConnected ? theme.colors.primary : '#aaa'}
          />
        </View>
        <View style={styles.deviceInfo}>
          <Text style={styles.deviceName}>{device.name}</Text>
          <Text style={styles.deviceType}>{getDeviceTypeString(device.type)}</Text>
          <View style={styles.deviceStatus}>
            <View style={[
              styles.statusIndicator,
              { backgroundColor: device.isConnected ? '#4CAF50' : '#F44336' }
            ]} />
            <Text style={styles.statusText}>
              {device.isConnected ? 'Connected' : 'Disconnected'}
            </Text>
          </View>
        </View>
        <Ionicons name="chevron-forward" size={24} color="#ccc" />
      </TouchableOpacity>
    );
  };

  const renderPlatformItem = (platform: VoicePlatform) => {
    const isLinked = linkedPlatforms[platform] || false;
    const isLinking = linkingPlatform === platform;
    
    return (
      <View key={platform} style={styles.platformCard}>
        <View style={styles.platformInfo}>
          <Ionicons name={getPlatformIcon(platform)} size={28} color={theme.colors.primary} />
          <View style={styles.platformTextContainer}>
            <Text style={styles.platformName}>{getPlatformName(platform)}</Text>
            <Text style={styles.platformStatus}>
              {isLinked ? 'Connected' : 'Not connected'}
            </Text>
          </View>
        </View>
        
        {isLinking ? (
          <ActivityIndicator size="small" color={theme.colors.primary} />
        ) : (
          <TouchableOpacity
            style={[
              styles.platformButton,
              { backgroundColor: isLinked ? '#f8f9fa' : theme.colors.primary }
            ]}
            onPress={() => {
              if (isLinked) {
                handleUnlinkPlatform(platform);
              } else {
                handleStartLinkPlatform(platform);
              }
            }}
          >
            <Text
              style={[
                styles.platformButtonText,
                { color: isLinked ? '#F44336' : '#fff' }
              ]}
            >
              {isLinked ? 'Unlink' : 'Link'}
            </Text>
          </TouchableOpacity>
        )}
      </View>
    );
  };

  // Only show Siri on iOS
  const availablePlatforms = Platform.OS === 'ios'
    ? [VoicePlatform.GOOGLE_ASSISTANT, VoicePlatform.ALEXA, VoicePlatform.SIRI]
    : [VoicePlatform.GOOGLE_ASSISTANT, VoicePlatform.ALEXA];

  return (
    <SafeAreaView style={styles.safeArea}>
      <StatusBar barStyle="dark-content" backgroundColor="#fff" />
      
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Smart Home</Text>
      </View>
      
      {isLoading ? (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={theme.colors.primary} />
          <Text style={styles.loadingText}>Loading smart home data...</Text>
        </View>
      ) : (
        <ScrollView style={styles.scrollView} contentContainerStyle={styles.scrollContent}>
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>My Devices</Text>
            
            {devices.length > 0 ? (
              devices.map(device => renderDeviceItem(device))
            ) : (
              <View style={styles.emptyContainer}>
                <Ionicons name="home-outline" size={48} color="#ccc" />
                <Text style={styles.emptyTitle}>No devices found</Text>
                <Text style={styles.emptyText}>
                  Add your first smart device to get started
                </Text>
              </View>
            )}
            
            <TouchableOpacity 
              style={styles.addButton}
              onPress={handleAddDevice}
            >
              <Ionicons name="add-circle" size={24} color="#fff" />
              <Text style={styles.addButtonText}>Add Device</Text>
            </TouchableOpacity>
          </View>
          
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Voice Assistants</Text>
            
            <Text style={styles.sectionDescription}>
              Link your voice assistants to control your smart devices and access EcoCart features using voice commands.
            </Text>
            
            {availablePlatforms.map(platform => renderPlatformItem(platform))}
          </View>
          
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Voice Commands</Text>
            
            <Text style={styles.sectionDescription}>
              Here are some example commands you can use with your voice assistant:
            </Text>
            
            <View style={styles.commandCard}>
              <Text style={styles.commandTitle}>Recycling Schedule</Text>
              <Text style={styles.command}>"When is my next recycling pickup?"</Text>
              <Text style={styles.command}>"What items should I put out for recycling this week?"</Text>
            </View>
            
            <View style={styles.commandCard}>
              <Text style={styles.commandTitle}>Add Recyclables</Text>
              <Text style={styles.command}>"Add plastic bottle to my recyclables"</Text>
              <Text style={styles.command}>"I recycled an aluminum can"</Text>
            </View>
            
            <View style={styles.commandCard}>
              <Text style={styles.commandTitle}>EcoPoints</Text>
              <Text style={styles.command}>"How many EcoPoints do I have?"</Text>
              <Text style={styles.command}>"What's my recycling impact this month?"</Text>
            </View>
          </View>
        </ScrollView>
      )}
      
      {/* Device Discovery Modal */}
      <Modal
        visible={showDiscovery}
        animationType="slide"
        onRequestClose={() => setShowDiscovery(false)}
      >
        <DeviceDiscovery
          onDeviceSelected={handleDeviceSelected}
          onClose={() => setShowDiscovery(false)}
        />
      </Modal>
      
      {/* Device Settings Modal */}
      <Modal
        visible={showDeviceSettings && selectedDeviceId !== null}
        animationType="slide"
        onRequestClose={() => setShowDeviceSettings(false)}
      >
        {selectedDeviceId && (
          <SmartDeviceSettings
            deviceId={selectedDeviceId}
            onBack={() => {
              setShowDeviceSettings(false);
              setSelectedDeviceId(null);
              loadDevices();
            }}
          />
        )}
      </Modal>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#f8f9fa',
  },
  header: {
    backgroundColor: '#fff',
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
  },
  headerTitle: {
    fontSize: 22,
    fontWeight: 'bold',
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingBottom: 32,
  },
  section: {
    backgroundColor: '#fff',
    margin: 16,
    marginBottom: 8,
    borderRadius: 8,
    padding: 16,
    elevation: 1,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 16,
  },
  sectionDescription: {
    fontSize: 14,
    color: '#666',
    marginBottom: 16,
    lineHeight: 20,
  },
  deviceCard: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    backgroundColor: '#fff',
    borderRadius: 8,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: '#eee',
  },
  deviceIconContainer: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: '#f5f5f5',
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
    marginBottom: 4,
  },
  deviceType: {
    fontSize: 14,
    color: '#666',
    marginBottom: 4,
  },
  deviceStatus: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  statusIndicator: {
    width: 8,
    height: 8,
    borderRadius: 4,
    marginRight: 6,
  },
  statusText: {
    fontSize: 12,
    color: '#888',
  },
  addButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#4CAF50',
    padding: 12,
    borderRadius: 8,
    marginTop: 8,
  },
  addButtonText: {
    color: '#fff',
    fontWeight: '600',
    marginLeft: 8,
  },
  platformCard: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 16,
    backgroundColor: '#fff',
    borderRadius: 8,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: '#eee',
  },
  platformInfo: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  platformTextContainer: {
    marginLeft: 16,
  },
  platformName: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 4,
  },
  platformStatus: {
    fontSize: 12,
    color: '#888',
  },
  platformButton: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 4,
  },
  platformButtonText: {
    fontWeight: '600',
    fontSize: 14,
  },
  commandCard: {
    padding: 16,
    backgroundColor: '#f5f5f5',
    borderRadius: 8,
    marginBottom: 12,
  },
  commandTitle: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 8,
  },
  command: {
    fontSize: 14,
    color: '#444',
    marginBottom: 8,
    fontStyle: 'italic',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  loadingText: {
    marginTop: 16,
    fontSize: 16,
    color: '#666',
  },
  emptyContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    padding: 32,
  },
  emptyTitle: {
    fontSize: 18,
    fontWeight: '600',
    marginTop: 16,
    marginBottom: 8,
    color: '#444',
  },
  emptyText: {
    fontSize: 14,
    color: '#888',
    textAlign: 'center',
  },
});

export default SmartHomeScreen; 