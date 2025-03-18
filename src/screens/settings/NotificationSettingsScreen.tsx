import { FontAwesome5 } from '@expo/vector-icons';
import { SafeStorage } from '@/utils/storage';
import * as Notifications from 'expo-notifications';
import React, { useEffect, useState } from 'react';
import { Linking, Platform, ScrollView, StyleSheet, Switch, Text, TouchableOpacity, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNotifications } from '@/components/notifications/NotificationManager';

// Notification preference types
interface NotificationPreferences {
  collection_reminders: boolean;
  achievement_notifications: boolean;
  sync_notifications: boolean;
  community_challenge_notifications: boolean;
  recycling_tips: boolean;
}

// Default preferences
const DEFAULT_PREFERENCES: NotificationPreferences = {
  collection_reminders: true,
  achievement_notifications: true,
  sync_notifications: true,
  community_challenge_notifications: true,
  recycling_tips: true,
};

const PREFERENCES_STORAGE_KEY = 'ecocart_notification_preferences';

const NotificationSettingsScreen: React.FC = () => {
  const [preferences, setPreferences] = useState<NotificationPreferences>(DEFAULT_PREFERENCES);
  const [permissionStatus, setPermissionStatus] = useState<string>('loading');
  const notifications = useNotifications();

  // Load saved preferences on mount
  useEffect(() => {
    const loadPreferences = async () => {
      try {
        const savedPrefs = await SafeStorage.getItem(PREFERENCES_STORAGE_KEY);
        if (savedPrefs) {
          setPreferences(JSON.parse(savedPrefs));
        }

        // Check notification permission status
        const permStatus = await Notifications.getPermissionsAsync();
        setPermissionStatus(permStatus.status);
      } catch (error) {
        console.error('Failed to load notification preferences:', error);
      }
    };

    loadPreferences();
  }, []);

  // Save preferences when they change
  const savePreferences = async (newPrefs: NotificationPreferences) => {
    try {
      await SafeStorage.setItem(PREFERENCES_STORAGE_KEY, JSON.stringify(newPrefs));
    } catch (error) {
      console.error('Failed to save notification preferences:', error);
    }
  };

  // Toggle a preference
  const togglePreference = (key: keyof NotificationPreferences) => {
    const newPreferences = {
      ...preferences,
      [key]: !preferences[key],
    };
    setPreferences(newPreferences);
    savePreferences(newPreferences);
  };

  // Request permission if needed
  const requestPermission = async () => {
    try {
      const { status } = await Notifications.requestPermissionsAsync();
      setPermissionStatus(status);
    } catch (error) {
      console.error('Failed to request notification permissions:', error);
    }
  };

  // Open device settings (iOS only)
  const openSettings = () => {
    if (Platform.OS === 'ios') {
      Linking.openURL('app-settings:');
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView>
        <View style={styles.header}>
          <Text style={styles.title}>Notification Settings</Text>
          <Text style={styles.subtitle}>
            Configure which notifications you want to receive
          </Text>
        </View>

        {/* Permission Status */}
        <View style={styles.permissionContainer}>
          <View style={styles.permissionHeader}>
            <FontAwesome5
              name={permissionStatus === 'granted' ? 'check-circle' : 'exclamation-circle'}
              size={20}
              color={permissionStatus === 'granted' ? '#4CAF50' : '#FFB300'}
            />
            <Text style={styles.permissionTitle}>Notification Permission</Text>
          </View>

          <Text style={styles.permissionStatus}>
            {permissionStatus === 'granted'
              ? 'Enabled - You will receive notifications'
              : permissionStatus === 'denied'
              ? 'Disabled - You will not receive notifications'
              : 'Not determined - Permission not requested yet'}
          </Text>

          {permissionStatus !== 'granted' && (
            <TouchableOpacity
              style={styles.permissionButton}
              onPress={permissionStatus === 'denied' && Platform.OS === 'ios' ? openSettings : requestPermission}
            >
              <Text style={styles.permissionButtonText}>
                {permissionStatus === 'denied' && Platform.OS === 'ios'
                  ? 'Open Settings'
                  : 'Enable Notifications'}
              </Text>
            </TouchableOpacity>
          )}
        </View>

        {/* Notification Categories */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Notification Types</Text>

          <View style={styles.preferenceItem}>
            <View style={styles.preferenceTextContainer}>
              <Text style={styles.preferenceTitle}>Collection Reminders</Text>
              <Text style={styles.preferenceDescription}>
                Reminders about upcoming plastic collection appointments
              </Text>
            </View>
            <Switch
              value={preferences.collection_reminders}
              onValueChange={() => togglePreference('collection_reminders')}
              trackColor={{ false: '#CCCCCC', true: '#34D399' }}
              thumbColor={Platform.OS === 'ios' ? undefined : preferences.collection_reminders ? '#10B981' : '#F4F3F4'}
              disabled={permissionStatus !== 'granted'}
            />
          </View>

          <View style={styles.preferenceItem}>
            <View style={styles.preferenceTextContainer}>
              <Text style={styles.preferenceTitle}>Achievement Notifications</Text>
              <Text style={styles.preferenceDescription}>
                Get notified when you unlock new achievements
              </Text>
            </View>
            <Switch
              value={preferences.achievement_notifications}
              onValueChange={() => togglePreference('achievement_notifications')}
              trackColor={{ false: '#CCCCCC', true: '#34D399' }}
              thumbColor={Platform.OS === 'ios' ? undefined : preferences.achievement_notifications ? '#10B981' : '#F4F3F4'}
              disabled={permissionStatus !== 'granted'}
            />
          </View>

          <View style={styles.preferenceItem}>
            <View style={styles.preferenceTextContainer}>
              <Text style={styles.preferenceTitle}>Sync Notifications</Text>
              <Text style={styles.preferenceDescription}>
                Notifications about data synchronization status
              </Text>
            </View>
            <Switch
              value={preferences.sync_notifications}
              onValueChange={() => togglePreference('sync_notifications')}
              trackColor={{ false: '#CCCCCC', true: '#34D399' }}
              thumbColor={Platform.OS === 'ios' ? undefined : preferences.sync_notifications ? '#10B981' : '#F4F3F4'}
              disabled={permissionStatus !== 'granted'}
            />
          </View>

          <View style={styles.preferenceItem}>
            <View style={styles.preferenceTextContainer}>
              <Text style={styles.preferenceTitle}>Community Challenges</Text>
              <Text style={styles.preferenceDescription}>
                Updates about community recycling challenges
              </Text>
            </View>
            <Switch
              value={preferences.community_challenge_notifications}
              onValueChange={() => togglePreference('community_challenge_notifications')}
              trackColor={{ false: '#CCCCCC', true: '#34D399' }}
              thumbColor={Platform.OS === 'ios' ? undefined : preferences.community_challenge_notifications ? '#10B981' : '#F4F3F4'}
              disabled={permissionStatus !== 'granted'}
            />
          </View>

          <View style={styles.preferenceItem}>
            <View style={styles.preferenceTextContainer}>
              <Text style={styles.preferenceTitle}>Recycling Tips</Text>
              <Text style={styles.preferenceDescription}>
                Receive helpful tips about recycling practices
              </Text>
            </View>
            <Switch
              value={preferences.recycling_tips}
              onValueChange={() => togglePreference('recycling_tips')}
              trackColor={{ false: '#CCCCCC', true: '#34D399' }}
              thumbColor={Platform.OS === 'ios' ? undefined : preferences.recycling_tips ? '#10B981' : '#F4F3F4'}
              disabled={permissionStatus !== 'granted'}
            />
          </View>
        </View>

        <View style={styles.infoContainer}>
          <FontAwesome5 name="info-circle" size={16} color="#64748B" />
          <Text style={styles.infoText}>
            You can change these settings at any time. Your preferences will be saved automatically.
          </Text>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F8FAFC',
  },
  header: {
    padding: 20,
    backgroundColor: '#FFFFFF',
    borderBottomWidth: 1,
    borderBottomColor: '#E2E8F0',
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#0F172A',
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 16,
    color: '#64748B',
  },
  permissionContainer: {
    margin: 16,
    padding: 16,
    backgroundColor: '#FFFFFF',
    borderRadius: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  permissionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  permissionTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#0F172A',
    marginLeft: 8,
  },
  permissionStatus: {
    fontSize: 14,
    color: '#64748B',
    marginBottom: 16,
  },
  permissionButton: {
    backgroundColor: '#34D399',
    padding: 12,
    borderRadius: 8,
    alignItems: 'center',
  },
  permissionButtonText: {
    color: '#FFFFFF',
    fontWeight: '600',
    fontSize: 16,
  },
  section: {
    margin: 16,
    padding: 16,
    backgroundColor: '#FFFFFF',
    borderRadius: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#0F172A',
    marginBottom: 16,
  },
  preferenceItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#E2E8F0',
  },
  preferenceTextContainer: {
    flex: 1,
    marginRight: 16,
  },
  preferenceTitle: {
    fontSize: 16,
    fontWeight: '500',
    color: '#0F172A',
    marginBottom: 4,
  },
  preferenceDescription: {
    fontSize: 14,
    color: '#64748B',
  },
  infoContainer: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    padding: 16,
    margin: 16,
    backgroundColor: '#F1F5F9',
    borderRadius: 8,
    borderLeftWidth: 4,
    borderLeftColor: '#64748B',
  },
  infoText: {
    flex: 1,
    marginLeft: 8,
    fontSize: 14,
    color: '#64748B',
    lineHeight: 20,
  },
});

export default NotificationSettingsScreen; 