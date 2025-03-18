/**
 * SettingsScreen.tsx
 * 
 * Screen for configuring app settings and preferences.
 */

import useNetworkStatus from '@/hooks/useNetworkStatus';
import { useTheme } from '@/hooks/useTheme';
import { Ionicons, MaterialIcons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import React, { useState } from 'react';
import { Alert, ScrollView, StyleSheet, Switch, Text, TouchableOpacity, View } from 'react-native';

interface SettingsScreenProps {
  navigation: any;
}

export default function SettingsScreen({ navigation }: SettingsScreenProps) {
  const { isOnline } = useNetworkStatus();
  const { theme, toggleTheme } = useTheme();
  const navigation = useNavigation();
  
  // Toggle states
  const [pushNotifications, setPushNotifications] = useState(true);
  const [emailNotifications, setEmailNotifications] = useState(true);
  const [darkMode, setDarkMode] = useState(false);
  const [locationServices, setLocationServices] = useState(true);
  const [dataUsage, setDataUsage] = useState(true);
  
  // Handle toggle change
  const handleToggleChange = (setting: string, value: boolean) => {
    if (!isOnline) {
      Alert.alert(
        'Offline Mode',
        'Settings changes will be applied when you\'re back online.',
        [{ text: 'OK' }]
      );
    }
    
    switch (setting) {
      case 'pushNotifications':
        setPushNotifications(value);
        break;
      case 'emailNotifications':
        setEmailNotifications(value);
        break;
      case 'darkMode':
        setDarkMode(value);
        break;
      case 'locationServices':
        setLocationServices(value);
        break;
      case 'dataUsage':
        setDataUsage(value);
        break;
      default:
        break;
    }
  };
  
  // Handle clearing cache
  const handleClearCache = () => {
    Alert.alert(
      'Clear Cache',
      'This will clear all cached data. This action cannot be undone.',
      [
        { text: 'Cancel', style: 'cancel' },
        { 
          text: 'Clear', 
          style: 'destructive',
          onPress: () => {
            // TODO: Implement cache clearing logic
            Alert.alert('Success', 'Cache cleared successfully');
          }
        }
      ]
    );
  };

  // Add a navigation option for the AI Performance Monitor
  const navigateToPerformanceMonitor = () => {
    navigation.navigate('AIPerformanceMonitorScreen');
  };

  // Add a navigation option for the AI Benchmark screen
  const navigateToBenchmark = () => {
    navigation.navigate('AIBenchmarkScreen');
  };

  return (
    <ScrollView style={[styles.container, { backgroundColor: theme.colors.background }]}>
      {/* Offline Banner */}
      {!isOnline && (
        <View style={styles.offlineBanner}>
          <Ionicons name="cloud-offline" size={20} color="#FFFFFF" />
          <Text style={styles.offlineText}>
            You're currently offline. Settings changes will be synced when you're back online.
          </Text>
        </View>
      )}
      
      {/* Notifications Section */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Notifications</Text>
        <View style={styles.settingsCard}>
          <View style={styles.settingRow}>
            <View style={styles.settingInfo}>
              <Text style={styles.settingTitle}>Push Notifications</Text>
              <Text style={styles.settingDescription}>Receive alerts on your device</Text>
            </View>
            <Switch
              value={pushNotifications}
              onValueChange={(value) => handleToggleChange('pushNotifications', value)}
              trackColor={{ false: '#E5E5EA', true: '#34C759' }}
              thumbColor="#FFFFFF"
            />
          </View>
          
          <View style={styles.divider} />
          
          <View style={styles.settingRow}>
            <View style={styles.settingInfo}>
              <Text style={styles.settingTitle}>Email Notifications</Text>
              <Text style={styles.settingDescription}>Receive updates via email</Text>
            </View>
            <Switch
              value={emailNotifications}
              onValueChange={(value) => handleToggleChange('emailNotifications', value)}
              trackColor={{ false: '#E5E5EA', true: '#34C759' }}
              thumbColor="#FFFFFF"
            />
          </View>
        </View>
      </View>
      
      {/* Appearance Section */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Appearance</Text>
        <View style={styles.settingsCard}>
          <View style={styles.settingRow}>
            <View style={styles.settingInfo}>
              <Text style={styles.settingTitle}>Dark Mode</Text>
              <Text style={styles.settingDescription}>Use dark theme for the app</Text>
            </View>
            <Switch
              value={darkMode}
              onValueChange={(value) => handleToggleChange('darkMode', value)}
              trackColor={{ false: '#E5E5EA', true: '#34C759' }}
              thumbColor="#FFFFFF"
            />
          </View>
        </View>
      </View>
      
      {/* Privacy Section */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Privacy</Text>
        <View style={styles.settingsCard}>
          <View style={styles.settingRow}>
            <View style={styles.settingInfo}>
              <Text style={styles.settingTitle}>Location Services</Text>
              <Text style={styles.settingDescription}>Allow app to access your location</Text>
            </View>
            <Switch
              value={locationServices}
              onValueChange={(value) => handleToggleChange('locationServices', value)}
              trackColor={{ false: '#E5E5EA', true: '#34C759' }}
              thumbColor="#FFFFFF"
            />
          </View>
          
          <View style={styles.divider} />
          
          <View style={styles.settingRow}>
            <View style={styles.settingInfo}>
              <Text style={styles.settingTitle}>Data Usage</Text>
              <Text style={styles.settingDescription}>Allow data collection for app improvement</Text>
            </View>
            <Switch
              value={dataUsage}
              onValueChange={(value) => handleToggleChange('dataUsage', value)}
              trackColor={{ false: '#E5E5EA', true: '#34C759' }}
              thumbColor="#FFFFFF"
            />
          </View>
        </View>
      </View>
      
      {/* Storage Section */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Storage</Text>
        <View style={styles.settingsCard}>
          <TouchableOpacity 
            style={styles.actionRow}
            onPress={handleClearCache}
          >
            <View style={styles.actionInfo}>
              <Text style={styles.actionTitle}>Clear Cache</Text>
              <Text style={styles.actionDescription}>Free up storage space</Text>
            </View>
            <Ionicons name="chevron-forward" size={20} color="#8E8E93" />
          </TouchableOpacity>
        </View>
      </View>
      
      {/* About Section */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>About</Text>
        <View style={styles.settingsCard}>
          <TouchableOpacity style={styles.actionRow}>
            <View style={styles.actionInfo}>
              <Text style={styles.actionTitle}>Version</Text>
              <Text style={styles.actionDescription}>1.0.0</Text>
            </View>
          </TouchableOpacity>
          
          <View style={styles.divider} />
          
          <TouchableOpacity style={styles.actionRow}>
            <View style={styles.actionInfo}>
              <Text style={styles.actionTitle}>Terms of Service</Text>
            </View>
            <Ionicons name="chevron-forward" size={20} color="#8E8E93" />
          </TouchableOpacity>
          
          <View style={styles.divider} />
          
          <TouchableOpacity style={styles.actionRow}>
            <View style={styles.actionInfo}>
              <Text style={styles.actionTitle}>Privacy Policy</Text>
            </View>
            <Ionicons name="chevron-forward" size={20} color="#8E8E93" />
          </TouchableOpacity>
          
          <View style={styles.divider} />
          
          <TouchableOpacity style={styles.actionRow}>
            <View style={styles.actionInfo}>
              <Text style={styles.actionTitle}>Licenses</Text>
            </View>
            <Ionicons name="chevron-forward" size={20} color="#8E8E93" />
          </TouchableOpacity>
        </View>
      </View>
      
      {/* Developer Tools Section */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Developer Tools</Text>
        
        {/* Add entry for AI Performance Monitor */}
        <TouchableOpacity onPress={navigateToPerformanceMonitor} style={styles.settingItem}>
          <View style={styles.settingContent}>
            <MaterialIcons name="speed" size={24} color="#444" />
            <Text style={styles.settingText}>AI Performance Monitor</Text>
          </View>
          <MaterialIcons name="chevron-right" size={24} color="#999" />
        </TouchableOpacity>

        {/* Add entry for AI Benchmark */}
        <TouchableOpacity onPress={navigateToBenchmark} style={styles.settingItem}>
          <View style={styles.settingContent}>
            <MaterialIcons name="assessment" size={24} color="#444" />
            <Text style={styles.settingText}>AI Performance Benchmark</Text>
          </View>
          <MaterialIcons name="chevron-right" size={24} color="#999" />
        </TouchableOpacity>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F2F2F7',
    padding: 16
  },
  offlineBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FF9500',
    borderRadius: 8,
    padding: 12,
    marginBottom: 16
  },
  offlineText: {
    color: '#FFFFFF',
    fontSize: 14,
    marginLeft: 8,
    flex: 1
  },
  section: {
    marginBottom: 24
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#2C3E50',
    marginBottom: 12,
    paddingLeft: 4
  },
  settingsCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    overflow: 'hidden'
  },
  settingRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 16,
    paddingHorizontal: 16
  },
  settingInfo: {
    flex: 1,
    marginRight:.16
  },
  settingTitle: {
    fontSize: 16,
    fontWeight: '500',
    color: '#2C3E50',
    marginBottom: 4
  },
  settingDescription: {
    fontSize: 14,
    color: '#8E8E93'
  },
  divider: {
    height: 1,
    backgroundColor: '#E5E5EA',
    marginHorizontal: 16
  },
  actionRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 16,
    paddingHorizontal: 16
  },
  actionInfo: {
    flex: 1
  },
  actionTitle: {
    fontSize: 16,
    fontWeight: '500',
    color: '#2C3E50'
  },
  actionDescription: {
    fontSize: 14,
    color: '#8E8E93',
    marginTop: 4
  },
  settingItem: {
    borderBottomWidth: 1,
    borderBottomColor: '#E5E5EA',
    paddingVertical: 16,
    paddingHorizontal: 16
  },
  settingContent: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1
  },
  settingText: {
    fontSize: 16,
    fontWeight: '500',
    color: '#2C3E50',
    marginLeft: 8
  }
}); 