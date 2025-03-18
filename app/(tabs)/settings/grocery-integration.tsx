import { Button } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';
import { ThemedText } from '@/components/ui/ThemedText';
import { ThemedView } from '@/components/ui/ThemedView';
import { useTheme } from '@/hooks/useTheme';
import { groceryIntegrationService } from '@/services/GroceryIntegrationService';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import React, { useEffect, useState } from 'react';
import { ActivityIndicator, ScrollView, StyleSheet, Switch, TextInput, TouchableOpacity, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

export default function GroceryIntegrationScreen() {
  const { theme } = useTheme();
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(true);
  const [isAuthenticating, setIsAuthenticating] = useState(false);
  const [isSyncing, setIsSyncing] = useState(false);
  const [isEnabled, setIsEnabled] = useState(false);
  const [provider, setProvider] = useState('default');
  const [autoSync, setAutoSync] = useState(true);
  const [syncInterval, setSyncInterval] = useState('30');
  const [lastSyncTime, setLastSyncTime] = useState<Date | null>(null);
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [authError, setAuthError] = useState('');

  useEffect(() => {
    loadSettings();
  }, []);

  const loadSettings = async () => {
    try {
      setIsLoading(true);
      const settings = groceryIntegrationService.getSettings();
      setIsEnabled(settings.enabled);
      setProvider(settings.provider);
      setAutoSync(settings.autoSync);
      setSyncInterval(settings.syncInterval.toString());
      if (settings.lastSyncTime) {
        setLastSyncTime(new Date(settings.lastSyncTime));
      }
    } catch (error) {
      console.error('Error loading settings:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSaveSettings = () => {
    groceryIntegrationService.updateSettings({
      enabled: isEnabled,
      provider,
      autoSync,
      syncInterval: parseInt(syncInterval, 10) || 30,
    });
  };

  const handleAuthenticate = async () => {
    if (!username || !password) {
      setAuthError('Please enter username and password');
      return;
    }

    try {
      setIsAuthenticating(true);
      setAuthError('');
      const success = await groceryIntegrationService.authenticate(
        { username, password },
        provider
      );

      if (success) {
        setIsEnabled(true);
        loadSettings();
      } else {
        setAuthError('Authentication failed. Please check your credentials.');
      }
    } catch (error) {
      setAuthError('An error occurred during authentication.');
      console.error('Authentication error:', error);
    } finally {
      setIsAuthenticating(false);
    }
  };

  const handleSync = async () => {
    try {
      setIsSyncing(true);
      const result = await groceryIntegrationService.synchronizeDeliverySlots();
      if (result.success) {
        setLastSyncTime(new Date());
      } else {
        console.error('Sync failed:', result.errors);
      }
    } catch (error) {
      console.error('Sync error:', error);
    } finally {
      setIsSyncing(false);
    }
  };

  const handleDisconnect = async () => {
    await groceryIntegrationService.disconnect();
    setIsEnabled(false);
    setLastSyncTime(null);
  };

  if (isLoading) {
    return (
      <ThemedView style={styles.loadingContainer}>
        <ActivityIndicator size="large" color={theme.colors.primary} />
        <ThemedText style={styles.loadingText}>Loading settings...</ThemedText>
      </ThemedView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView>
        <ThemedView style={styles.header}>
          <TouchableOpacity 
            style={styles.backButton} 
            onPress={() => router.back()}
          >
            <Ionicons name="arrow-back" size={24} color={theme.colors.text.primary} />
          </TouchableOpacity>
          <ThemedText style={styles.title}>Grocery Store Integration</ThemedText>
        </ThemedView>

        <ThemedView style={styles.content}>
          <Card style={styles.card}>
            <ThemedText style={styles.sectionTitle}>Checkers Sixty60 Integration</ThemedText>
            <ThemedText style={styles.description}>
              Connect your Checkers Sixty60 account to synchronize delivery schedules and enable
              credit redemption for your recycling efforts.
            </ThemedText>

            <View style={styles.settingRow}>
              <ThemedText>Enable Integration</ThemedText>
              <Switch 
                value={isEnabled}
                onValueChange={setIsEnabled}
                trackColor={{ false: '#767577', true: theme.colors.primary }}
              />
            </View>

            {!isEnabled ? (
              <View style={styles.authSection}>
                <View style={styles.inputContainer}>
                  <ThemedText style={styles.inputLabel}>Username</ThemedText>
                  <TextInput
                    style={[styles.input, { color: theme.colors.text.primary, borderColor: theme.colors.secondary }]}
                    value={username}
                    onChangeText={setUsername}
                    placeholder="Enter your Sixty60 username"
                    placeholderTextColor={theme.colors.text.secondary}
                  />
                </View>

                <View style={styles.inputContainer}>
                  <ThemedText style={styles.inputLabel}>Password</ThemedText>
                  <TextInput
                    style={[styles.input, { color: theme.colors.text.primary, borderColor: theme.colors.secondary }]}
                    value={password}
                    onChangeText={setPassword}
                    placeholder="Enter your Sixty60 password"
                    placeholderTextColor={theme.colors.text.secondary}
                    secureTextEntry
                  />
                </View>

                {authError ? (
                  <ThemedText style={styles.errorText}>{authError}</ThemedText>
                ) : null}

                <Button 
                  onPress={handleAuthenticate}
                  isLoading={isAuthenticating}
                >
                  Connect Account
                </Button>
              </View>
            ) : (
              <>
                <View style={styles.settingRow}>
                  <ThemedText>Auto Sync</ThemedText>
                  <Switch 
                    value={autoSync}
                    onValueChange={setAutoSync}
                    trackColor={{ false: '#767577', true: theme.colors.primary }}
                  />
                </View>

                <View style={styles.settingRow}>
                  <ThemedText>Sync Interval (minutes)</ThemedText>
                  <TextInput
                    style={[styles.intervalInput, { color: theme.colors.text.primary, borderColor: theme.colors.secondary }]}
                    value={syncInterval}
                    onChangeText={setSyncInterval}
                    keyboardType="number-pad"
                    maxLength={4}
                  />
                </View>

                <View style={styles.infoRow}>
                  <ThemedText>Last Synchronized</ThemedText>
                  <ThemedText>
                    {lastSyncTime 
                      ? lastSyncTime.toLocaleString() 
                      : 'Never'}
                  </ThemedText>
                </View>

                <View style={styles.buttonRow}>
                  <Button 
                    onPress={handleSaveSettings}
                    style={styles.button}
                  >
                    Save Settings
                  </Button>
                  <Button 
                    onPress={handleSync}
                    isLoading={isSyncing}
                    style={styles.button}
                  >
                    Sync Now
                  </Button>
                </View>

                <Button 
                  onPress={handleDisconnect}
                  variant="outline"
                  style={styles.disconnectButton}
                >
                  Disconnect Account
                </Button>
              </>
            )}
          </Card>
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
  loadingText: {
    marginTop: 16,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 16,
  },
  backButton: {
    marginRight: 16,
  },
  title: {
    fontSize: 20,
    fontWeight: 'bold',
  },
  content: {
    paddingHorizontal: 16,
    paddingBottom: 32,
  },
  card: {
    marginBottom: 16,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    marginBottom: 8,
  },
  description: {
    marginBottom: 16,
    opacity: 0.8,
  },
  settingRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(0,0,0,0.1)',
  },
  infoRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 12,
  },
  intervalInput: {
    borderWidth: 1,
    borderRadius: 4,
    paddingHorizontal: 8,
    paddingVertical: 4,
    width: 80,
    textAlign: 'center',
  },
  buttonRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 24,
  },
  button: {
    flex: 1,
    marginHorizontal: 4,
  },
  disconnectButton: {
    marginTop: 16,
  },
  authSection: {
    marginTop: 16,
  },
  inputContainer: {
    marginBottom: 16,
  },
  inputLabel: {
    marginBottom: 8,
  },
  input: {
    borderWidth: 1,
    borderRadius: 4,
    paddingHorizontal: 12,
    paddingVertical: 8,
    fontSize: 16,
  },
  errorText: {
    color: 'red',
    marginBottom: 16,
  },
}); 