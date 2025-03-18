/**
 * NotificationSettingsScreen
 * 
 * Screen for managing notification preferences
 */

import { Stack } from 'expo-router';
import React, { useEffect, useState } from 'react';
import { ActivityIndicator, ScrollView, StyleSheet, Switch, View } from 'react-native';

import Button from '@/components/Button';
import { IconSymbol } from '@/components/IconSymbol';
import ThemedText from '@/components/ThemedText';
import ThemedView from '@/components/ThemedView';
import NotificationService from '@/src/services/NotificationService';
import { NotificationChannel, NotificationPreferences } from '@/src/types/NotificationPreferences';

export default function NotificationSettingsScreen() {
  const [preferences, setPreferences] = useState<NotificationPreferences | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false);
  
  // Load notification preferences
  useEffect(() => {
    loadPreferences();
  }, []);
  
  // Load notification preferences from service
  const loadPreferences = async () => {
    try {
      setIsLoading(true);
      
      // Get preferences from notification service
      const notificationService = NotificationService.getInstance();
      const currentPreferences = notificationService.getPreferences();
      
      setPreferences(currentPreferences);
      setHasUnsavedChanges(false);
    } catch (error) {
      console.error('Error loading notification preferences:', error);
    } finally {
      setIsLoading(false);
    }
  };
  
  // Save notification preferences
  const savePreferences = async () => {
    if (!preferences) return;
    
    try {
      setIsSaving(true);
      
      // Update preferences in notification service
      const notificationService = NotificationService.getInstance();
      await notificationService.updatePreferences(preferences);
      
      setHasUnsavedChanges(false);
    } catch (error) {
      console.error('Error saving notification preferences:', error);
    } finally {
      setIsSaving(false);
    }
  };
  
  // Handle toggle for boolean preferences
  const handleToggle = (key: keyof NotificationPreferences, value: boolean) => {
    if (!preferences) return;
    
    setPreferences({
      ...preferences,
      [key]: value
    });
    
    setHasUnsavedChanges(true);
  };
  
  // Handle toggle for category preferences
  const handleCategoryToggle = (category: keyof Pick<NotificationPreferences, 'collection' | 'delivery' | 'system' | 'rewards' | 'community'>, enabled: boolean) => {
    if (!preferences) return;
    
    setPreferences({
      ...preferences,
      [category]: {
        ...preferences[category],
        enabled
      }
    });
    
    setHasUnsavedChanges(true);
  };
  
  // Handle change for channel preferences
  const handleChannelToggle = (
    category: keyof Pick<NotificationPreferences, 'collection' | 'delivery' | 'system' | 'rewards' | 'community'>,
    channel: NotificationChannel,
    enabled: boolean
  ) => {
    if (!preferences) return;
    
    const currentChannels = preferences[category].channels;
    let newChannels: NotificationChannel[];
    
    if (enabled) {
      // Add channel if not already included
      newChannels = currentChannels.includes(channel) 
        ? currentChannels 
        : [...currentChannels, channel];
    } else {
      // Remove channel if included
      newChannels = currentChannels.filter(c => c !== channel);
    }
    
    setPreferences({
      ...preferences,
      [category]: {
        ...preferences[category],
        channels: newChannels
      }
    });
    
    setHasUnsavedChanges(true);
  };
  
  // Handle quiet hours toggle
  const handleQuietHoursToggle = (enabled: boolean) => {
    if (!preferences) return;
    
    setPreferences({
      ...preferences,
      schedule: {
        ...preferences.schedule,
        quietHoursEnabled: enabled
      }
    });
    
    setHasUnsavedChanges(true);
  };
  
  // Handle day toggle in schedule
  const handleDayToggle = (day: keyof typeof preferences.schedule.daysEnabled, enabled: boolean) => {
    if (!preferences) return;
    
    setPreferences({
      ...preferences,
      schedule: {
        ...preferences.schedule,
        daysEnabled: {
          ...preferences.schedule.daysEnabled,
          [day]: enabled
        }
      }
    });
    
    setHasUnsavedChanges(true);
  };
  
  if (isLoading) {
    return (
      <ThemedView style={styles.loadingContainer}>
        <ActivityIndicator size="large" />
        <ThemedText style={styles.loadingText}>Loading preferences...</ThemedText>
      </ThemedView>
    );
  }
  
  if (!preferences) {
    return (
      <ThemedView style={styles.errorContainer}>
        <IconSymbol name="exclamation-triangle" size={48} color="#F44336" />
        <ThemedText style={styles.errorText}>Failed to load preferences</ThemedText>
        <Button 
          title="Retry" 
          onPress={loadPreferences}
          style={styles.retryButton}
        />
      </ThemedView>
    );
  }
  
  return (
    <ThemedView style={styles.container}>
      <Stack.Screen 
        options={{ 
          headerTitle: 'Notification Settings',
          headerRight: () => (
            <Button
              title="Save"
              onPress={savePreferences}
              disabled={!hasUnsavedChanges || isSaving}
              loading={isSaving}
              variant="text"
              size="small"
            />
          )
        }} 
      />
      
      <ScrollView style={styles.scrollView}>
        {/* Global Settings */}
        <View style={styles.section}>
          <ThemedText style={styles.sectionTitle}>Global Settings</ThemedText>
          
          <View style={styles.settingItem}>
            <ThemedText>Enable All Notifications</ThemedText>
            <Switch
              value={preferences.allNotificationsEnabled}
              onValueChange={(value) => handleToggle('allNotificationsEnabled', value)}
            />
          </View>
          
          <View style={styles.settingItem}>
            <ThemedText>Push Notifications</ThemedText>
            <Switch
              value={preferences.pushNotificationsEnabled}
              onValueChange={(value) => handleToggle('pushNotificationsEnabled', value)}
              disabled={!preferences.allNotificationsEnabled}
            />
          </View>
          
          <View style={styles.settingItem}>
            <ThemedText>Email Notifications</ThemedText>
            <Switch
              value={preferences.emailNotificationsEnabled}
              onValueChange={(value) => handleToggle('emailNotificationsEnabled', value)}
              disabled={!preferences.allNotificationsEnabled}
            />
          </View>
          
          <View style={styles.settingItem}>
            <ThemedText>SMS Notifications</ThemedText>
            <Switch
              value={preferences.smsNotificationsEnabled}
              onValueChange={(value) => handleToggle('smsNotificationsEnabled', value)}
              disabled={!preferences.allNotificationsEnabled}
            />
          </View>
        </View>
        
        {/* Categories */}
        <View style={styles.section}>
          <ThemedText style={styles.sectionTitle}>Categories</ThemedText>
          
          {/* Collection Notifications */}
          <View style={styles.categorySection}>
            <View style={styles.settingItem}>
              <View style={styles.categoryHeader}>
                <View style={[styles.categoryIcon, { backgroundColor: '#4CAF5020' }]}>
                  <IconSymbol name="recycle" size={18} color="#4CAF50" />
                </View>
                <ThemedText style={styles.categoryTitle}>Collection Notifications</ThemedText>
              </View>
              <Switch
                value={preferences.collection.enabled}
                onValueChange={(value) => handleCategoryToggle('collection', value)}
                disabled={!preferences.allNotificationsEnabled}
              />
            </View>
            
            {preferences.collection.enabled && (
              <View style={styles.channelsContainer}>
                <ThemedText style={styles.channelsTitle}>Receive via:</ThemedText>
                
                <View style={styles.channelItem}>
                  <ThemedText>Push Notifications</ThemedText>
                  <Switch
                    value={preferences.collection.channels.includes(NotificationChannel.PUSH)}
                    onValueChange={(value) => handleChannelToggle('collection', NotificationChannel.PUSH, value)}
                    disabled={!preferences.pushNotificationsEnabled}
                  />
                </View>
                
                <View style={styles.channelItem}>
                  <ThemedText>In-App Notifications</ThemedText>
                  <Switch
                    value={preferences.collection.channels.includes(NotificationChannel.IN_APP)}
                    onValueChange={(value) => handleChannelToggle('collection', NotificationChannel.IN_APP, value)}
                  />
                </View>
                
                <View style={styles.channelItem}>
                  <ThemedText>Email</ThemedText>
                  <Switch
                    value={preferences.collection.channels.includes(NotificationChannel.EMAIL)}
                    onValueChange={(value) => handleChannelToggle('collection', NotificationChannel.EMAIL, value)}
                    disabled={!preferences.emailNotificationsEnabled}
                  />
                </View>
              </View>
            )}
          </View>
          
          {/* Delivery Notifications */}
          <View style={styles.categorySection}>
            <View style={styles.settingItem}>
              <View style={styles.categoryHeader}>
                <View style={[styles.categoryIcon, { backgroundColor: '#2196F320' }]}>
                  <IconSymbol name="truck" size={18} color="#2196F3" />
                </View>
                <ThemedText style={styles.categoryTitle}>Delivery Notifications</ThemedText>
              </View>
              <Switch
                value={preferences.delivery.enabled}
                onValueChange={(value) => handleCategoryToggle('delivery', value)}
                disabled={!preferences.allNotificationsEnabled}
              />
            </View>
            
            {preferences.delivery.enabled && (
              <View style={styles.channelsContainer}>
                <ThemedText style={styles.channelsTitle}>Receive via:</ThemedText>
                
                <View style={styles.channelItem}>
                  <ThemedText>Push Notifications</ThemedText>
                  <Switch
                    value={preferences.delivery.channels.includes(NotificationChannel.PUSH)}
                    onValueChange={(value) => handleChannelToggle('delivery', NotificationChannel.PUSH, value)}
                    disabled={!preferences.pushNotificationsEnabled}
                  />
                </View>
                
                <View style={styles.channelItem}>
                  <ThemedText>In-App Notifications</ThemedText>
                  <Switch
                    value={preferences.delivery.channels.includes(NotificationChannel.IN_APP)}
                    onValueChange={(value) => handleChannelToggle('delivery', NotificationChannel.IN_APP, value)}
                  />
                </View>
                
                <View style={styles.channelItem}>
                  <ThemedText>Email</ThemedText>
                  <Switch
                    value={preferences.delivery.channels.includes(NotificationChannel.EMAIL)}
                    onValueChange={(value) => handleChannelToggle('delivery', NotificationChannel.EMAIL, value)}
                    disabled={!preferences.emailNotificationsEnabled}
                  />
                </View>
              </View>
            )}
          </View>
          
          {/* Rewards Notifications */}
          <View style={styles.categorySection}>
            <View style={styles.settingItem}>
              <View style={styles.categoryHeader}>
                <View style={[styles.categoryIcon, { backgroundColor: '#FFC10720' }]}>
                  <IconSymbol name="trophy" size={18} color="#FFC107" />
                </View>
                <ThemedText style={styles.categoryTitle}>Rewards Notifications</ThemedText>
              </View>
              <Switch
                value={preferences.rewards.enabled}
                onValueChange={(value) => handleCategoryToggle('rewards', value)}
                disabled={!preferences.allNotificationsEnabled}
              />
            </View>
            
            {preferences.rewards.enabled && (
              <View style={styles.channelsContainer}>
                <ThemedText style={styles.channelsTitle}>Receive via:</ThemedText>
                
                <View style={styles.channelItem}>
                  <ThemedText>Push Notifications</ThemedText>
                  <Switch
                    value={preferences.rewards.channels.includes(NotificationChannel.PUSH)}
                    onValueChange={(value) => handleChannelToggle('rewards', NotificationChannel.PUSH, value)}
                    disabled={!preferences.pushNotificationsEnabled}
                  />
                </View>
                
                <View style={styles.channelItem}>
                  <ThemedText>In-App Notifications</ThemedText>
                  <Switch
                    value={preferences.rewards.channels.includes(NotificationChannel.IN_APP)}
                    onValueChange={(value) => handleChannelToggle('rewards', NotificationChannel.IN_APP, value)}
                  />
                </View>
                
                <View style={styles.channelItem}>
                  <ThemedText>Email</ThemedText>
                  <Switch
                    value={preferences.rewards.channels.includes(NotificationChannel.EMAIL)}
                    onValueChange={(value) => handleChannelToggle('rewards', NotificationChannel.EMAIL, value)}
                    disabled={!preferences.emailNotificationsEnabled}
                  />
                </View>
              </View>
            )}
          </View>
        </View>
        
        {/* Schedule Settings */}
        <View style={styles.section}>
          <ThemedText style={styles.sectionTitle}>Schedule Settings</ThemedText>
          
          <View style={styles.settingItem}>
            <ThemedText>Enable Quiet Hours</ThemedText>
            <Switch
              value={preferences.schedule.quietHoursEnabled}
              onValueChange={handleQuietHoursToggle}
              disabled={!preferences.allNotificationsEnabled}
            />
          </View>
          
          {preferences.schedule.quietHoursEnabled && (
            <>
              <View style={styles.timeRangeContainer}>
                <ThemedText>Quiet Hours:</ThemedText>
                <ThemedText style={styles.timeRange}>
                  {preferences.schedule.quietHoursStart} - {preferences.schedule.quietHoursEnd}
                </ThemedText>
              </View>
              
              <ThemedText style={styles.sectionSubtitle}>Active Days</ThemedText>
              
              <View style={styles.daysContainer}>
                {Object.entries(preferences.schedule.daysEnabled).map(([day, enabled]) => (
                  <View key={day} style={styles.dayItem}>
                    <ThemedText>{capitalize(day)}</ThemedText>
                    <Switch
                      value={enabled}
                      onValueChange={(value) => handleDayToggle(day as keyof typeof preferences.schedule.daysEnabled, value)}
                      disabled={!preferences.schedule.quietHoursEnabled}
                    />
                  </View>
                ))}
              </View>
            </>
          )}
        </View>
        
        {/* Specific Notifications */}
        <View style={styles.section}>
          <ThemedText style={styles.sectionTitle}>Specific Notifications</ThemedText>
          
          <View style={styles.settingItem}>
            <ThemedText>Collection Status Changes</ThemedText>
            <Switch
              value={preferences.collectionStatusChanges}
              onValueChange={(value) => handleToggle('collectionStatusChanges', value)}
              disabled={!preferences.allNotificationsEnabled || !preferences.collection.enabled}
            />
          </View>
          
          <View style={styles.settingItem}>
            <ThemedText>Delivery Personnel Location Updates</ThemedText>
            <Switch
              value={preferences.personnelLocationUpdates}
              onValueChange={(value) => handleToggle('personnelLocationUpdates', value)}
              disabled={!preferences.allNotificationsEnabled || !preferences.delivery.enabled}
            />
          </View>
          
          <View style={styles.settingItem}>
            <ThemedText>Delivery Status Updates</ThemedText>
            <Switch
              value={preferences.deliveryStatusUpdates}
              onValueChange={(value) => handleToggle('deliveryStatusUpdates', value)}
              disabled={!preferences.allNotificationsEnabled || !preferences.delivery.enabled}
            />
          </View>
          
          <View style={styles.settingItem}>
            <ThemedText>Location Updates</ThemedText>
            <Switch
              value={preferences.locationUpdates}
              onValueChange={(value) => handleToggle('locationUpdates', value)}
              disabled={!preferences.allNotificationsEnabled || !preferences.delivery.enabled}
            />
          </View>
          
          <View style={styles.settingItem}>
            <ThemedText>Route Changes</ThemedText>
            <Switch
              value={preferences.routeChanges}
              onValueChange={(value) => handleToggle('routeChanges', value)}
              disabled={!preferences.allNotificationsEnabled || !preferences.delivery.enabled}
            />
          </View>
          
          <View style={styles.settingItem}>
            <ThemedText>Collection Updates</ThemedText>
            <Switch
              value={preferences.collectionUpdates}
              onValueChange={(value) => handleToggle('collectionUpdates', value)}
              disabled={!preferences.allNotificationsEnabled || !preferences.collection.enabled}
            />
          </View>
          
          <View style={styles.settingItem}>
            <ThemedText>Achievement Notifications</ThemedText>
            <Switch
              value={preferences.achievementNotifications}
              onValueChange={(value) => handleToggle('achievementNotifications', value)}
              disabled={!preferences.allNotificationsEnabled || !preferences.rewards.enabled}
            />
          </View>
          
          <View style={styles.settingItem}>
            <ThemedText>Quest Notifications</ThemedText>
            <Switch
              value={preferences.questNotifications}
              onValueChange={(value) => handleToggle('questNotifications', value)}
              disabled={!preferences.allNotificationsEnabled || !preferences.rewards.enabled}
            />
          </View>
          
          <View style={styles.settingItem}>
            <ThemedText>Credit Updates</ThemedText>
            <Switch
              value={preferences.creditUpdates}
              onValueChange={(value) => handleToggle('creditUpdates', value)}
              disabled={!preferences.allNotificationsEnabled || !preferences.rewards.enabled}
            />
          </View>
          
          <View style={styles.settingItem}>
            <ThemedText>Community Events</ThemedText>
            <Switch
              value={preferences.communityEvents}
              onValueChange={(value) => handleToggle('communityEvents', value)}
              disabled={!preferences.allNotificationsEnabled || !preferences.community.enabled}
            />
          </View>
        </View>
      </ScrollView>
    </ThemedView>
  );
}

// Helper function to capitalize first letter
const capitalize = (s: string) => {
  return s.charAt(0).toUpperCase() + s.slice(1);
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  scrollView: {
    flex: 1,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    marginTop: 16,
    fontSize: 16,
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  errorText: {
    marginTop: 16,
    fontSize: 16,
    fontWeight: '500',
  },
  retryButton: {
    marginTop: 24,
  },
  section: {
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#EEEEEE',
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    marginBottom: 16,
  },
  sectionSubtitle: {
    fontSize: 16,
    fontWeight: '500',
    marginTop: 16,
    marginBottom: 8,
  },
  settingItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 12,
  },
  categorySection: {
    marginBottom: 16,
  },
  categoryHeader: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  categoryIcon: {
    width: 32,
    height: 32,
    borderRadius: 16,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 8,
  },
  categoryTitle: {
    fontSize: 16,
    fontWeight: '500',
  },
  channelsContainer: {
    marginLeft: 40,
    marginTop: 8,
  },
  channelsTitle: {
    fontSize: 14,
    marginBottom: 8,
  },
  channelItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 8,
  },
  timeRangeContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 8,
    marginBottom: 16,
  },
  timeRange: {
    fontWeight: '500',
    marginLeft: 8,
  },
  daysContainer: {
    marginBottom: 8,
  },
  dayItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 8,
  },
}); 