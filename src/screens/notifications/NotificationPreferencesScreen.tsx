/**
 * NotificationPreferencesScreen.tsx
 * 
 * A screen for users to manage their notification preferences.
 * Allows users to:
 * - Enable/disable notification categories
 * - Configure notification channels (push, in-app, email)
 * - Set up quiet hours
 * - Configure feature-specific notification settings
 */

import { ThemedText } from '@/components/ui/ThemedText';
import { ThemedView } from '@/components/ui/ThemedView';
import { NotificationService } from '@/services/NotificationService';
import { useTheme } from '@/theme';
import { NotificationCategory, NotificationChannel, NotificationPreferences } from '@/types/NotificationPreferences';
import { Ionicons } from '@expo/vector-icons';
import * as Linking from 'expo-linking';
import * as Notifications from 'expo-notifications';
import React, { useCallback, useEffect, useState } from 'react';
import {
    ActivityIndicator,
    Alert,
    Platform,
    ScrollView,
    StyleSheet,
    Switch,
    TouchableOpacity,
    View
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

interface NotificationPreferencesScreenProps {
  navigation: any;
}

export default function NotificationPreferencesScreen({ navigation }: NotificationPreferencesScreenProps) {
  const theme = useTheme();
  const [preferences, setPreferences] = useState<NotificationPreferences | null>(null);
  const [permissionStatus, setPermissionStatus] = useState<boolean | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);

  // Load notification preferences
  const loadPreferences = useCallback(async () => {
    try {
      setIsLoading(true);
      
      // Load permission status
      const { status } = await Notifications.getPermissionsAsync();
      setPermissionStatus(status === 'granted');
      
      // Load preferences
      const notificationService = NotificationService.getInstance();
      const prefs = notificationService.getPreferences();
      setPreferences(prefs);
    } catch (error) {
      console.error('Error loading notification preferences:', error);
    } finally {
      setIsLoading(false);
    }
  }, []);

  // Effect to load preferences on mount
  useEffect(() => {
    loadPreferences();
  }, [loadPreferences]);

  // Request notification permissions
  const requestPermissions = async () => {
    try {
      const { status } = await Notifications.requestPermissionsAsync();
      setPermissionStatus(status === 'granted');
      
      if (status !== 'granted') {
        Alert.alert(
          'Permission Required',
          'Notification permissions are required to receive notifications. Would you like to open settings to enable them?',
          [
            { text: 'Cancel', style: 'cancel' },
            { 
              text: 'Open Settings', 
              onPress: () => {
                if (Platform.OS === 'ios') {
                  Linking.openURL('app-settings:');
                } else {
                  Linking.openSettings();
                }
              }
            }
          ]
        );
      } else if (preferences) {
        // Update push notification preference if permission was granted
        handleTogglePreference('pushNotificationsEnabled', true);
      }
    } catch (error) {
      console.error('Error requesting notification permissions:', error);
    }
  };

  // Save preferences
  const savePreferences = async (updatedPreferences: NotificationPreferences) => {
    try {
      setIsSaving(true);
      
      const notificationService = NotificationService.getInstance();
      await notificationService.updatePreferences(updatedPreferences);
      
      setPreferences(updatedPreferences);
    } catch (error) {
      console.error('Error saving notification preferences:', error);
      Alert.alert('Error', 'Failed to save notification preferences.');
    } finally {
      setIsSaving(false);
    }
  };

  // Toggle a boolean preference
  const handleTogglePreference = (key: keyof NotificationPreferences, value: boolean) => {
    if (!preferences) return;
    
    const updatedPreferences = { ...preferences, [key]: value };
    
    // If allNotificationsEnabled is toggled off, disable push notifications too
    if (key === 'allNotificationsEnabled' && !value) {
      updatedPreferences.pushNotificationsEnabled = false;
    }
    
    // If push notifications are enabled, ensure we have permission
    if (key === 'pushNotificationsEnabled' && value && !permissionStatus) {
      requestPermissions();
      return;
    }
    
    savePreferences(updatedPreferences);
  };

  // Toggle category enabled state
  const handleToggleCategory = (category: NotificationCategory, enabled: boolean) => {
    if (!preferences) return;
    
    const updatedPreferences = {
      ...preferences,
      [category]: {
        ...preferences[category],
        enabled
      }
    };
    
    savePreferences(updatedPreferences);
  };

  // Toggle channel for category
  const handleToggleChannel = (category: NotificationCategory, channel: NotificationChannel, enabled: boolean) => {
    if (!preferences) return;
    
    let channels = [...preferences[category].channels];
    
    if (enabled) {
      // Add channel if it doesn't exist
      if (!channels.includes(channel)) {
        channels.push(channel);
      }
    } else {
      // Remove channel if it exists
      channels = channels.filter(c => c !== channel);
    }
    
    const updatedPreferences = {
      ...preferences,
      [category]: {
        ...preferences[category],
        channels
      }
    };
    
    savePreferences(updatedPreferences);
  };

  // Toggle feature-specific notification
  const handleToggleFeature = (feature: keyof NotificationPreferences, enabled: boolean) => {
    if (!preferences) return;
    
    const updatedPreferences = {
      ...preferences,
      [feature]: enabled
    };
    
    savePreferences(updatedPreferences);
  };

  // Toggle quiet hours
  const handleToggleQuietHours = (enabled: boolean) => {
    if (!preferences) return;
    
    const updatedPreferences = {
      ...preferences,
      schedule: {
        ...preferences.schedule,
        quietHoursEnabled: enabled
      }
    };
    
    savePreferences(updatedPreferences);
  };

  // Render a category section
  const renderCategorySection = (category: NotificationCategory, title: string, description: string, icon: string) => {
    if (!preferences) return null;
    
    const categoryPrefs = preferences[category];
    const isEnabled = preferences.allNotificationsEnabled && categoryPrefs.enabled;
    
    return (
      <View style={styles.section}>
        <View style={styles.sectionHeader}>
          <View style={styles.sectionTitleContainer}>
            <Ionicons name={icon as any} size={24} color={theme.theme.colors.primary} />
            <ThemedText style={styles.sectionTitle}>{title}</ThemedText>
          </View>
          <Switch
            value={isEnabled}
            onValueChange={(value) => handleToggleCategory(category, value)}
            trackColor={{ false: theme.theme.colors.border, true: theme.theme.colors.primary }}
            thumbColor={Platform.OS === 'android' ? theme.theme.colors.card : undefined}
            disabled={!preferences.allNotificationsEnabled}
          />
        </View>
        
        <ThemedText style={styles.sectionDescription}>{description}</ThemedText>
        
        {isEnabled && (
          <View style={styles.channelsContainer}>
            <ThemedText style={styles.channelsTitle}>Notification Channels</ThemedText>
            
            <View style={styles.channelRow}>
              <View style={styles.channelInfo}>
                <Ionicons name="phone-portrait" size={20} color={theme.theme.colors.text} />
                <ThemedText style={styles.channelLabel}>Push Notifications</ThemedText>
              </View>
              <Switch
                value={
                  preferences.pushNotificationsEnabled && 
                  categoryPrefs.channels.includes(NotificationChannel.PUSH)
                }
                onValueChange={(value) => handleToggleChannel(
                  category, 
                  NotificationChannel.PUSH, 
                  value
                )}
                trackColor={{ false: theme.theme.colors.border, true: theme.theme.colors.primary }}
                thumbColor={Platform.OS === 'android' ? theme.theme.colors.card : undefined}
                disabled={!preferences.pushNotificationsEnabled}
              />
            </View>
            
            <View style={styles.channelRow}>
              <View style={styles.channelInfo}>
                <Ionicons name="notifications" size={20} color={theme.theme.colors.text} />
                <ThemedText style={styles.channelLabel}>In-App Notifications</ThemedText>
              </View>
              <Switch
                value={categoryPrefs.channels.includes(NotificationChannel.IN_APP)}
                onValueChange={(value) => handleToggleChannel(
                  category, 
                  NotificationChannel.IN_APP, 
                  value
                )}
                trackColor={{ false: theme.theme.colors.border, true: theme.theme.colors.primary }}
                thumbColor={Platform.OS === 'android' ? theme.theme.colors.card : undefined}
              />
            </View>
            
            <View style={styles.channelRow}>
              <View style={styles.channelInfo}>
                <Ionicons name="mail" size={20} color={theme.theme.colors.text} />
                <ThemedText style={styles.channelLabel}>Email Notifications</ThemedText>
              </View>
              <Switch
                value={
                  preferences.emailNotificationsEnabled && 
                  categoryPrefs.channels.includes(NotificationChannel.EMAIL)
                }
                onValueChange={(value) => handleToggleChannel(
                  category, 
                  NotificationChannel.EMAIL, 
                  value
                )}
                trackColor={{ false: theme.theme.colors.border, true: theme.theme.colors.primary }}
                thumbColor={Platform.OS === 'android' ? theme.theme.colors.card : undefined}
                disabled={!preferences.emailNotificationsEnabled}
              />
            </View>
          </View>
        )}
      </View>
    );
  };

  // Render a feature toggle
  const renderFeatureToggle = (feature: keyof NotificationPreferences, title: string, icon: string) => {
    if (!preferences) return null;
    
    return (
      <View style={styles.preferenceRow}>
        <View style={styles.preferenceInfo}>
          <Ionicons name={icon as any} size={20} color={theme.theme.colors.text} />
          <ThemedText style={styles.preferenceLabel}>{title}</ThemedText>
        </View>
        <Switch
          value={preferences[feature] as boolean}
          onValueChange={(value) => handleToggleFeature(feature, value)}
          trackColor={{ false: theme.theme.colors.border, true: theme.theme.colors.primary }}
          thumbColor={Platform.OS === 'android' ? theme.theme.colors.card : undefined}
          disabled={!preferences.allNotificationsEnabled}
        />
      </View>
    );
  };

  // Loading state
  if (isLoading) {
    return (
      <SafeAreaView style={[styles.container, { backgroundColor: theme.theme.colors.background }]}>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={theme.theme.colors.primary} />
          <ThemedText style={styles.loadingText}>Loading preferences...</ThemedText>
        </View>
      </SafeAreaView>
    );
  }

  // If preferences failed to load
  if (!preferences) {
    return (
      <SafeAreaView style={[styles.container, { backgroundColor: theme.theme.colors.background }]}>
        <View style={styles.errorContainer}>
          <Ionicons name="alert-circle" size={64} color={theme.theme.colors.error} />
          <ThemedText style={styles.errorTitle}>Failed to load preferences</ThemedText>
          <ThemedText style={styles.errorText}>
            We couldn't load your notification preferences. Please try again.
          </ThemedText>
          <TouchableOpacity
            style={[styles.retryButton, { backgroundColor: theme.theme.colors.primary }]}
            onPress={loadPreferences}
          >
            <ThemedText style={styles.retryButtonText}>Retry</ThemedText>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: theme.theme.colors.background }]}>
      {/* Header */}
      <ThemedView style={styles.header}>
        <TouchableOpacity
          style={styles.backButton}
          onPress={() => navigation.goBack()}
        >
          <Ionicons name="arrow-back" size={24} color={theme.theme.colors.text} />
        </TouchableOpacity>
        <ThemedText style={styles.headerTitle}>Notification Settings</ThemedText>
        <View style={{ width: 40 }} />
      </ThemedView>

      {/* Content */}
      <ScrollView style={styles.content}>
        {/* Global Settings */}
        <ThemedView style={styles.section}>
          <ThemedText style={styles.sectionTitle}>Global Settings</ThemedText>
          
          <View style={styles.preferenceRow}>
            <View style={styles.preferenceInfo}>
              <Ionicons name="notifications" size={20} color={theme.theme.colors.text} />
              <ThemedText style={styles.preferenceLabel}>All Notifications</ThemedText>
            </View>
            <Switch
              value={preferences.allNotificationsEnabled}
              onValueChange={(value) => handleTogglePreference('allNotificationsEnabled', value)}
              trackColor={{ false: theme.theme.colors.border, true: theme.theme.colors.primary }}
              thumbColor={Platform.OS === 'android' ? theme.theme.colors.card : undefined}
            />
          </View>
          
          <View style={styles.preferenceRow}>
            <View style={styles.preferenceInfo}>
              <Ionicons name="phone-portrait" size={20} color={theme.theme.colors.text} />
              <ThemedText style={styles.preferenceLabel}>Push Notifications</ThemedText>
            </View>
            <Switch
              value={permissionStatus && preferences.pushNotificationsEnabled}
              onValueChange={(value) => handleTogglePreference('pushNotificationsEnabled', value)}
              trackColor={{ false: theme.theme.colors.border, true: theme.theme.colors.primary }}
              thumbColor={Platform.OS === 'android' ? theme.theme.colors.card : undefined}
              disabled={!preferences.allNotificationsEnabled}
            />
          </View>
          
          <View style={styles.preferenceRow}>
            <View style={styles.preferenceInfo}>
              <Ionicons name="mail" size={20} color={theme.theme.colors.text} />
              <ThemedText style={styles.preferenceLabel}>Email Notifications</ThemedText>
            </View>
            <Switch
              value={preferences.emailNotificationsEnabled}
              onValueChange={(value) => handleTogglePreference('emailNotificationsEnabled', value)}
              trackColor={{ false: theme.theme.colors.border, true: theme.theme.colors.primary }}
              thumbColor={Platform.OS === 'android' ? theme.theme.colors.card : undefined}
              disabled={!preferences.allNotificationsEnabled}
            />
          </View>
          
          <View style={styles.preferenceRow}>
            <View style={styles.preferenceInfo}>
              <Ionicons name="chatbubble" size={20} color={theme.theme.colors.text} />
              <ThemedText style={styles.preferenceLabel}>SMS Notifications</ThemedText>
            </View>
            <Switch
              value={preferences.smsNotificationsEnabled}
              onValueChange={(value) => handleTogglePreference('smsNotificationsEnabled', value)}
              trackColor={{ false: theme.theme.colors.border, true: theme.theme.colors.primary }}
              thumbColor={Platform.OS === 'android' ? theme.theme.colors.card : undefined}
              disabled={!preferences.allNotificationsEnabled}
            />
          </View>
        </ThemedView>
        
        {/* Quiet Hours */}
        <ThemedView style={styles.section}>
          <View style={styles.sectionHeader}>
            <View style={styles.sectionTitleContainer}>
              <Ionicons name="moon" size={24} color={theme.theme.colors.primary} />
              <ThemedText style={styles.sectionTitle}>Quiet Hours</ThemedText>
            </View>
            <Switch
              value={preferences.schedule.quietHoursEnabled}
              onValueChange={handleToggleQuietHours}
              trackColor={{ false: theme.theme.colors.border, true: theme.theme.colors.primary }}
              thumbColor={Platform.OS === 'android' ? theme.theme.colors.card : undefined}
              disabled={!preferences.allNotificationsEnabled}
            />
          </View>
          
          <ThemedText style={styles.sectionDescription}>
            During quiet hours, notifications will be silenced but still delivered to your device.
          </ThemedText>
          
          {preferences.schedule.quietHoursEnabled && (
            <View style={styles.quietHoursInfo}>
              <ThemedText style={styles.quietHoursTime}>
                {preferences.schedule.quietHoursStart} - {preferences.schedule.quietHoursEnd}
              </ThemedText>
              <TouchableOpacity 
                style={[styles.editButton, { borderColor: theme.theme.colors.primary }]}
                onPress={() => navigation.navigate('QuietHoursSettings')}
              >
                <ThemedText style={[styles.editButtonText, { color: theme.theme.colors.primary }]}>
                  Edit
                </ThemedText>
              </TouchableOpacity>
            </View>
          )}
        </ThemedView>
        
        {/* Categories */}
        <ThemedText style={styles.categoriesHeader}>Notification Categories</ThemedText>
        
        {renderCategorySection(
          NotificationCategory.COLLECTION, 
          'Collection Notifications',
          'Notifications related to material collections and pickups.',
          'basket'
        )}
        
        {renderCategorySection(
          NotificationCategory.DELIVERY, 
          'Delivery Notifications',
          'Updates about delivery status and location.',
          'car'
        )}
        
        {renderCategorySection(
          NotificationCategory.REWARDS, 
          'Rewards Notifications',
          'Achievements, points, and other rewards notifications.',
          'trophy'
        )}
        
        {renderCategorySection(
          NotificationCategory.COMMUNITY, 
          'Community Notifications',
          'Community challenges, events, and updates.',
          'people'
        )}
        
        {renderCategorySection(
          NotificationCategory.SYSTEM, 
          'System Notifications',
          'Important system updates and information.',
          'settings'
        )}
        
        {/* Feature-specific Notifications */}
        <ThemedView style={styles.section}>
          <ThemedText style={styles.sectionTitle}>Feature Notifications</ThemedText>
          
          {renderFeatureToggle(
            'collectionStatusChanges',
            'Collection Status Updates',
            'information-circle'
          )}
          
          {renderFeatureToggle(
            'achievementNotifications',
            'Achievement Notifications',
            'ribbon'
          )}
          
          {renderFeatureToggle(
            'questNotifications',
            'Quest Notifications',
            'flag'
          )}
          
          {renderFeatureToggle(
            'creditUpdates',
            'Credit Updates',
            'cash'
          )}
          
          {renderFeatureToggle(
            'communityEvents',
            'Community Events',
            'calendar'
          )}
        </ThemedView>
      </ScrollView>

      {/* Saving indicator */}
      {isSaving && (
        <View style={styles.savingOverlay}>
          <View style={[styles.savingIndicator, { backgroundColor: theme.theme.colors.card }]}>
            <ActivityIndicator size="small" color={theme.theme.colors.primary} />
            <ThemedText style={styles.savingText}>Saving...</ThemedText>
          </View>
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
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
  backButton: {
    padding: 8,
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: 'bold',
  },
  content: {
    flex: 1,
  },
  section: {
    padding: 16,
    marginHorizontal: 16,
    marginBottom: 16,
    borderRadius: 12,
    backgroundColor: 'rgba(0, 0, 0, 0.03)',
  },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 8,
  },
  sectionTitleContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginLeft: 8,
  },
  sectionDescription: {
    fontSize: 14,
    marginBottom: 16,
    opacity: 0.7,
  },
  preferenceRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(0, 0, 0, 0.05)',
  },
  preferenceInfo: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  preferenceLabel: {
    fontSize: 16,
    marginLeft: 12,
  },
  channelsContainer: {
    marginTop: 16,
  },
  channelsTitle: {
    fontSize: 16,
    fontWeight: '500',
    marginBottom: 12,
  },
  channelRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 10,
    paddingHorizontal: 8,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(0, 0, 0, 0.05)',
  },
  channelInfo: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  channelLabel: {
    fontSize: 14,
    marginLeft: 8,
  },
  categoriesHeader: {
    fontSize: 18,
    fontWeight: 'bold',
    marginHorizontal: 20,
    marginBottom: 8,
    marginTop: 8,
  },
  quietHoursInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginTop: 8,
    paddingVertical: 8,
    paddingHorizontal: 16,
    backgroundColor: 'rgba(0, 0, 0, 0.03)',
    borderRadius: 8,
  },
  quietHoursTime: {
    fontSize: 16,
    fontWeight: '500',
  },
  editButton: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
    borderWidth: 1,
  },
  editButtonText: {
    fontSize: 14,
    fontWeight: '500',
  },
  savingOverlay: {
    position: 'absolute',
    bottom: 20,
    left: 0,
    right: 0,
    alignItems: 'center',
  },
  savingIndicator: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.2,
    shadowRadius: 2,
    elevation: 3,
  },
  savingText: {
    marginLeft: 8,
    fontSize: 14,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    marginTop: 16,
    opacity: 0.6,
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  errorTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginTop: 16,
    marginBottom: 8,
  },
  errorText: {
    textAlign: 'center',
    marginBottom: 24,
  },
  retryButton: {
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 8,
  },
  retryButtonText: {
    color: '#fff',
    fontWeight: 'bold',
  },
}); 