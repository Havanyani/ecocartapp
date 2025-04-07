import React, { useState } from 'react';
import { Modal, Platform, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { getPlatformInfo, isDevelopment } from '../../utils/platformUtils';

interface PlatformOption {
  id: string;
  label: string;
  value: string;
  available: boolean;
}

const platforms: PlatformOption[] = [
  { id: 'web', label: 'Web', value: 'web', available: true },
  { id: 'ios', label: 'iOS', value: 'ios', available: Platform.OS === 'ios' || Platform.OS === 'web' },
  { id: 'android', label: 'Android', value: 'android', available: Platform.OS === 'android' || Platform.OS === 'web' },
];

export default function PlatformSelector() {
  const [modalVisible, setModalVisible] = useState(false);
  const platformInfo = getPlatformInfo();
  
  // Only show in development mode
  if (!isDevelopment()) return null;

  const handlePlatformSelect = (platform: string) => {
    setModalVisible(false);
    
    // In a real app, this would switch platforms or reload the app with the selected platform
    console.log(`Selected platform: ${platform}`);
    
    // Here you could use AsyncStorage to save the selected platform
    // and then reload the app to apply the changes
    
    // For now, just show an alert in dev mode
    alert(`Platform selected: ${platform}. In a real app, this would switch to ${platform}.`);
  };

  return (
    <>
      <TouchableOpacity 
        style={styles.devButton}
        onPress={() => setModalVisible(true)}
      >
        <Text style={styles.devButtonText}>DEV</Text>
      </TouchableOpacity>
      
      <Modal
        animationType="slide"
        transparent={true}
        visible={modalVisible}
        onRequestClose={() => setModalVisible(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>Platform Selector</Text>
            <Text style={styles.modalSubtitle}>
              Current Platform: {platformInfo.os.toUpperCase()}
            </Text>
            
            <View style={styles.platformList}>
              {platforms.map((platform) => (
                <TouchableOpacity
                  key={platform.id}
                  style={[
                    styles.platformButton,
                    platformInfo.os === platform.value && styles.activePlatform,
                    !platform.available && styles.disabledPlatform,
                  ]}
                  onPress={() => handlePlatformSelect(platform.value)}
                  disabled={!platform.available}
                >
                  <Text 
                    style={[
                      styles.platformButtonText,
                      platformInfo.os === platform.value && styles.activePlatformText,
                      !platform.available && styles.disabledPlatformText,
                    ]}
                  >
                    {platform.label}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
            
            <TouchableOpacity
              style={styles.closeButton}
              onPress={() => setModalVisible(false)}
            >
              <Text style={styles.closeButtonText}>Close</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </>
  );
}

const styles = StyleSheet.create({
  devButton: {
    position: 'absolute',
    right: 10,
    top: 40,
    backgroundColor: '#ff6b6b',
    borderRadius: 4,
    paddingHorizontal: 8,
    paddingVertical: 4,
    zIndex: 9999,
  },
  devButtonText: {
    color: 'white',
    fontWeight: 'bold',
    fontSize: 12,
  },
  modalOverlay: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
  },
  modalContent: {
    backgroundColor: 'white',
    borderRadius: 8,
    padding: 20,
    width: '80%',
    maxWidth: 400,
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 10,
    textAlign: 'center',
  },
  modalSubtitle: {
    fontSize: 14,
    marginBottom: 20,
    textAlign: 'center',
    color: '#666',
  },
  platformList: {
    marginVertical: 10,
  },
  platformButton: {
    backgroundColor: '#f0f0f0',
    padding: 15,
    borderRadius: 8,
    marginBottom: 10,
  },
  platformButtonText: {
    textAlign: 'center',
    fontWeight: '500',
  },
  activePlatform: {
    backgroundColor: '#2a9d8f',
  },
  activePlatformText: {
    color: 'white',
    fontWeight: 'bold',
  },
  disabledPlatform: {
    backgroundColor: '#f8f8f8',
    opacity: 0.6,
  },
  disabledPlatformText: {
    color: '#999',
  },
  closeButton: {
    backgroundColor: '#e0e0e0',
    padding: 15,
    borderRadius: 8,
    marginTop: 10,
  },
  closeButtonText: {
    textAlign: 'center',
    fontWeight: '500',
  },
}); 