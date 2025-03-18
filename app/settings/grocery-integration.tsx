import { Button } from '@/components/ui/Button';
import { SettingsItem } from '@/components/ui/settings/SettingsItem';
import { SettingsSection } from '@/components/ui/settings/SettingsSection';
import { ThemedText } from '@/components/ui/ThemedText';
import { ThemedView } from '@/components/ui/ThemedView';
import { useTheme } from '@/hooks/useTheme';
import { groceryIntegrationService } from '@/services/GroceryIntegrationService';
import { Ionicons } from '@expo/vector-icons';
import { Link, useRouter } from 'expo-router';
import React, { useEffect, useState } from 'react';
import { ActivityIndicator, Alert, StyleSheet, Switch, TouchableOpacity, View } from 'react-native';
import { ScrollView } from 'react-native-gesture-handler';
import { SafeAreaView } from 'react-native-safe-area-context';

// Custom component for a switch item since SettingsItem doesn't support rightElement
function SettingsSwitchItem({ 
  title, 
  icon, 
  value, 
  onValueChange 
}: { 
  title: string; 
  icon: keyof typeof Ionicons.glyphMap; 
  value: boolean; 
  onValueChange: (value: boolean) => void 
}) {
  const { theme } = useTheme();
  
  return (
    <View style={styles.switchItem}>
      <Ionicons name={icon} size={22} color={theme.colors.text.secondary} style={styles.switchIcon} />
      <ThemedText style={styles.switchText}>{title}</ThemedText>
      <Switch
        value={value}
        onValueChange={onValueChange}
        trackColor={{ 
          false: '#767577', 
          true: theme.colors.primary 
        }}
      />
    </View>
  );
}

// Custom button with icon component since Button only accepts string children
function IconButton({ 
  icon, 
  onPress, 
  color
}: { 
  icon: keyof typeof Ionicons.glyphMap;
  onPress: () => void;
  color: string;
}) {
  return (
    <TouchableOpacity onPress={onPress} style={styles.iconButton}>
      <Ionicons name={icon} size={24} color={color} />
    </TouchableOpacity>
  );
}

export default function GroceryIntegrationScreen() {
  const { theme } = useTheme();
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(true);
  const [isConnecting, setIsConnecting] = useState(false);
  const [isIntegrationEnabled, setIsIntegrationEnabled] = useState(false);
  const [showAdvancedSettings, setShowAdvancedSettings] = useState(false);
  const [syncFrequency, setSyncFrequency] = useState('daily');
  const [orderNotifications, setOrderNotifications] = useState(true);
  const [deliveryReminders, setDeliveryReminders] = useState(true);

  useEffect(() => {
    loadSettings();
  }, []);

  const loadSettings = async () => {
    try {
      setIsLoading(true);
      const settings = groceryIntegrationService.getSettings();
      setIsIntegrationEnabled(settings.enabled);
      setSyncFrequency((settings as any).syncFrequency || 'daily');
      setIsLoading(false);
    } catch (error) {
      console.error('Error loading grocery integration settings:', error);
      setIsLoading(false);
    }
  };

  const handleToggleIntegration = async (value: boolean) => {
    try {
      if (value) {
        // If turning on, show connection flow
        setIsConnecting(true);
        
        // In a real app, we would initiate the OAuth flow here
        // For demo purposes, we'll simulate a successful connection after a delay
        setTimeout(() => {
          const settings = groceryIntegrationService.getSettings();
          settings.enabled = true;
          groceryIntegrationService.updateSettings(settings);
          setIsIntegrationEnabled(true);
          setIsConnecting(false);
        }, 1500);
      } else {
        // If turning off, show confirmation dialog
        Alert.alert(
          'Disable Integration',
          'Are you sure you want to disconnect your grocery store account? You will no longer be able to redeem recycling credits for delivery discounts.',
          [
            {
              text: 'Cancel',
              style: 'cancel',
            },
            {
              text: 'Disconnect',
              style: 'destructive',
              onPress: () => {
                const settings = groceryIntegrationService.getSettings();
                settings.enabled = false;
                groceryIntegrationService.updateSettings(settings);
                setIsIntegrationEnabled(false);
              },
            },
          ]
        );
      }
    } catch (error) {
      console.error('Error toggling grocery integration:', error);
      Alert.alert('Error', 'There was a problem connecting to the grocery store service.');
    }
  };

  const handleChangeSyncFrequency = (frequency: string) => {
    try {
      const settings = groceryIntegrationService.getSettings();
      (settings as any).syncFrequency = frequency;
      groceryIntegrationService.updateSettings(settings);
      setSyncFrequency(frequency);
    } catch (error) {
      console.error('Error changing sync frequency:', error);
    }
  };

  if (isLoading) {
    return (
      <ThemedView style={styles.loadingContainer}>
        <ActivityIndicator size="large" color={theme.colors.primary} />
      </ThemedView>
    );
  }

  return (
    <SafeAreaView style={styles.container} edges={['bottom']}>
      <ScrollView>
        <View style={styles.header}>
          <Link href="/settings" asChild>
            <Button variant="ghost">
              Back
            </Button>
          </Link>
          <ThemedText style={styles.title}>Grocery Integration</ThemedText>
        </View>

        <ThemedView style={styles.content}>
          {isConnecting ? (
            <ThemedView style={styles.connectingContainer}>
              <ActivityIndicator size="large" color={theme.colors.primary} />
              <ThemedText style={styles.connectingText}>
                Connecting to Checkers Sixty60...
              </ThemedText>
            </ThemedView>
          ) : (
            <>
              <SettingsSection title="Connection">
                <SettingsSwitchItem
                  title="Enable Checkers Sixty60 Integration"
                  icon="cart-outline"
                  value={isIntegrationEnabled}
                  onValueChange={handleToggleIntegration}
                />

                {isIntegrationEnabled && (
                  <SettingsItem
                    title="Sync Account Details"
                    icon="sync"
                    onPress={() => {
                      Alert.alert('Sync', 'Account details synced successfully.');
                    }}
                  />
                )}
              </SettingsSection>

              {isIntegrationEnabled && (
                <>
                  <SettingsSection title="Notification Preferences">
                    <SettingsSwitchItem
                      title="Order Status Notifications"
                      icon="notifications-outline"
                      value={orderNotifications}
                      onValueChange={setOrderNotifications}
                    />
                    <SettingsSwitchItem
                      title="Delivery Reminders"
                      icon="alarm-outline"
                      value={deliveryReminders}
                      onValueChange={setDeliveryReminders}
                    />
                  </SettingsSection>

                  <ThemedView style={styles.advancedToggle}>
                    <Button 
                      variant="ghost"
                      onPress={() => setShowAdvancedSettings(!showAdvancedSettings)}
                    >
                      {showAdvancedSettings ? 'Hide Advanced Settings' : 'Show Advanced Settings'}
                    </Button>
                  </ThemedView>

                  {showAdvancedSettings && (
                    <SettingsSection title="Advanced Settings">
                      <SettingsItem
                        title={`Sync Frequency (${syncFrequency})`}
                        icon="time-outline"
                        onPress={() => {
                          Alert.alert(
                            'Sync Frequency',
                            'Choose how often EcoCart syncs with your grocery store account',
                            [
                              { text: 'Cancel', style: 'cancel' },
                              { 
                                text: 'Hourly', 
                                onPress: () => handleChangeSyncFrequency('hourly') 
                              },
                              { 
                                text: 'Daily', 
                                onPress: () => handleChangeSyncFrequency('daily') 
                              },
                              { 
                                text: 'Weekly', 
                                onPress: () => handleChangeSyncFrequency('weekly') 
                              },
                            ]
                          );
                        }}
                      />
                      <SettingsItem
                        title="Clear Cached Data"
                        icon="trash-outline"
                        onPress={() => {
                          Alert.alert(
                            'Clear Cache',
                            'Are you sure you want to clear all cached grocery store data?',
                            [
                              { text: 'Cancel', style: 'cancel' },
                              { 
                                text: 'Clear', 
                                style: 'destructive',
                                onPress: () => {
                                  Alert.alert('Success', 'Cache cleared successfully');
                                }
                              },
                            ]
                          );
                        }}
                      />
                    </SettingsSection>
                  )}
                </>
              )}

              <ThemedView style={styles.footer}>
                <ThemedText style={styles.footerText}>
                  Grocery integration allows you to redeem recycling credits for delivery discounts
                  on your grocery orders. Connect your Checkers Sixty60 account to get started.
                </ThemedText>
              </ThemedView>
            </>
          )}
        </ThemedView>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 16,
  },
  backButton: {
    marginRight: 8,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginLeft: 8,
  },
  content: {
    flex: 1,
    paddingHorizontal: 16,
  },
  connectingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 32,
  },
  connectingText: {
    marginTop: 16,
    fontSize: 16,
  },
  advancedToggle: {
    marginVertical: 16,
    alignItems: 'center',
  },
  advancedButton: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  advancedText: {
    marginRight: 8,
    fontSize: 16,
    opacity: 0.7,
  },
  footer: {
    marginTop: 32,
    marginBottom: 16,
    padding: 16,
    borderRadius: 8,
  },
  footerText: {
    textAlign: 'center',
    opacity: 0.7,
  },
  switchItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 14,
    paddingHorizontal: 16,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderColor: '#eee',
  },
  switchIcon: {
    marginRight: 12,
    width: 24,
    textAlign: 'center',
  },
  switchText: {
    fontSize: 16,
    flex: 1,
  },
  iconButton: {
    padding: 8,
  },
}); 