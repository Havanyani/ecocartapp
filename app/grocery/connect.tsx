/**
 * Grocery Store Connection Screen
 * 
 * Allows users to connect to grocery delivery systems,
 * manage their existing connections, and set up delivery preferences.
 */

import { Button } from '@/components/ui/Button';
import { IconSymbol } from '@/components/ui/IconSymbol';
import { Input } from '@/components/ui/Input';
import { ThemedText } from '@/components/ui/ThemedText';
import { ThemedView } from '@/components/ui/ThemedView';
import { useTheme } from '@/hooks/useTheme';
import { GroceryIntegrationService, GroceryProvider, GroceryStore } from '@/services/GroceryIntegrationService';
import { Stack, useRouter } from 'expo-router';
import React, { useEffect, useState } from 'react';
import { ActivityIndicator, Alert, Image, ScrollView, StyleSheet, Switch, TouchableOpacity, View } from 'react-native';

// Grocery provider logos and info
const PROVIDER_INFO = {
  [GroceryProvider.WHOLE_FOODS]: {
    name: 'Whole Foods',
    logo: require('@/assets/images/grocery/whole-foods.png'),
    description: 'Connect to your Whole Foods account for eco-friendly grocery deliveries and use your EcoCart credits.',
  },
  [GroceryProvider.INSTACART]: {
    name: 'Instacart',
    logo: require('@/assets/images/grocery/instacart.png'),
    description: 'Connect to Instacart for deliveries from multiple grocery stores and redeem your credits.',
  },
  [GroceryProvider.KROGER]: {
    name: 'Kroger',
    logo: require('@/assets/images/grocery/kroger.png'),
    description: 'Connect to Kroger for scheduled deliveries and apply your EcoCart credits to your orders.',
  },
  [GroceryProvider.WALMART]: {
    name: 'Walmart',
    logo: require('@/assets/images/grocery/walmart.png'),
    description: 'Connect to Walmart for grocery deliveries and use your earned credits for discounts.',
  },
};

export default function ConnectGroceryScreen() {
  const router = useRouter();
  const { theme } = useTheme();
  const [connectedStores, setConnectedStores] = useState<GroceryStore[]>([]);
  const [isConnecting, setIsConnecting] = useState(false);
  const [selectedProvider, setSelectedProvider] = useState<GroceryProvider | null>(null);
  const [credentials, setCredentials] = useState({
    email: '',
    password: '',
  });
  const [isLoading, setIsLoading] = useState(true);
  const [showAddNew, setShowAddNew] = useState(false);
  const [ecoFriendlyOnly, setEcoFriendlyOnly] = useState(true);

  useEffect(() => {
    loadConnectedStores();
  }, []);

  const loadConnectedStores = async () => {
    try {
      setIsLoading(true);
      const stores = await GroceryIntegrationService.getInstance().getConnectedStores();
      setConnectedStores(stores);
    } catch (error) {
      console.error('Failed to load connected stores:', error);
      Alert.alert('Error', 'Failed to load your connected grocery stores');
    } finally {
      setIsLoading(false);
    }
  };

  const handleCredentialChange = (field: 'email' | 'password', value: string) => {
    setCredentials({
      ...credentials,
      [field]: value,
    });
  };

  const handleConnectStore = async () => {
    if (!selectedProvider) {
      Alert.alert('Error', 'Please select a grocery provider');
      return;
    }

    if (!credentials.email || !credentials.password) {
      Alert.alert('Error', 'Please enter your account credentials');
      return;
    }

    try {
      setIsConnecting(true);
      
      const result = await GroceryIntegrationService.getInstance().connectStore({
        provider: selectedProvider,
        email: credentials.email,
        password: credentials.password,
        preferEcoFriendly: ecoFriendlyOnly,
      });

      if (result.success) {
        Alert.alert(
          'Successfully Connected',
          `Your ${PROVIDER_INFO[selectedProvider].name} account has been connected successfully!`,
          [{ text: 'OK', onPress: () => {
            setSelectedProvider(null);
            setCredentials({ email: '', password: '' });
            setShowAddNew(false);
            loadConnectedStores();
          }}]
        );
      } else {
        Alert.alert('Connection Failed', result.message || 'Failed to connect to the grocery provider');
      }
    } catch (error) {
      console.error('Failed to connect store:', error);
      Alert.alert('Error', 'Failed to connect to the grocery provider. Please try again.');
    } finally {
      setIsConnecting(false);
    }
  };

  const handleDisconnectStore = (store: GroceryStore) => {
    Alert.alert(
      'Disconnect Store',
      `Are you sure you want to disconnect from ${store.name}? Your order history and pending orders will remain accessible until they're completed.`,
      [
        { text: 'Cancel', style: 'cancel' },
        { 
          text: 'Disconnect', 
          style: 'destructive',
          onPress: async () => {
            try {
              await GroceryIntegrationService.getInstance().disconnectStore(store.id);
              Alert.alert('Success', `${store.name} has been disconnected`);
              loadConnectedStores();
            } catch (error) {
              console.error('Failed to disconnect store:', error);
              Alert.alert('Error', 'Failed to disconnect from the store. Please try again.');
            }
          }
        }
      ]
    );
  };

  const renderConnectedStores = () => {
    if (connectedStores.length === 0) {
      return (
        <ThemedView style={styles.emptyState}>
          <IconSymbol name="shopping-bag" size={48} color={theme.colors.secondary} />
          <ThemedText style={styles.emptyStateTitle}>No Connected Stores</ThemedText>
          <ThemedText style={styles.emptyStateText}>
            Connect to your favorite grocery delivery services to use your eco-credits for discounts.
          </ThemedText>
        </ThemedView>
      );
    }

    return (
      <View style={styles.connectedStoresContainer}>
        <ThemedText style={styles.sectionTitle}>Connected Stores</ThemedText>
        
        {connectedStores.map(store => (
          <ThemedView key={store.id} style={styles.storeCard}>
            <View style={styles.storeHeader}>
              <Image 
                source={PROVIDER_INFO[store.provider]?.logo || require('@/assets/images/grocery/generic-store.png')} 
                style={styles.storeLogo} 
              />
              <View style={styles.storeInfo}>
                <ThemedText style={styles.storeName}>{store.name}</ThemedText>
                <ThemedText style={styles.storeEmail}>{store.email}</ThemedText>
              </View>
            </View>
            
            <View style={styles.storeDetails}>
              <View style={styles.storeDetail}>
                <IconSymbol name="calendar" size={16} color={theme.colors.secondary} />
                <ThemedText style={styles.storeDetailText}>
                  Connected on {new Date(store.connectedAt).toLocaleDateString()}
                </ThemedText>
              </View>
              
              <View style={styles.storeDetail}>
                <IconSymbol name="truck" size={16} color={theme.colors.secondary} />
                <ThemedText style={styles.storeDetailText}>
                  {store.orderCount} orders placed
                </ThemedText>
              </View>
              
              {store.lastSyncTime && (
                <View style={styles.storeDetail}>
                  <IconSymbol name="refresh-cw" size={16} color={theme.colors.secondary} />
                  <ThemedText style={styles.storeDetailText}>
                    Last synced: {new Date(store.lastSyncTime).toLocaleTimeString()}
                  </ThemedText>
                </View>
              )}
              
              <View style={styles.ecoDeliveryPref}>
                <ThemedText style={styles.ecoDeliveryText}>
                  Eco-friendly delivery preferred
                </ThemedText>
                <Switch
                  value={store.preferEcoFriendly}
                  onValueChange={(value) => handleToggleEcoFriendly(store, value)}
                  trackColor={{ false: '#e0e0e0', true: `${theme.colors.primary}80` }}
                  thumbColor={store.preferEcoFriendly ? theme.colors.primary : '#f4f3f4'}
                />
              </View>
            </View>
            
            <View style={styles.storeActions}>
              <Button
                variant="outline"
                onPress={() => router.push(`/grocery/orders?storeId=${store.id}`)}
                style={styles.viewOrdersButton}
              >
                View Orders
              </Button>
              
              <Button
                variant="text"
                onPress={() => handleDisconnectStore(store)}
                textStyle={{ color: theme.colors.error || '#F44336' }}
              >
                Disconnect
              </Button>
            </View>
          </ThemedView>
        ))}
      </View>
    );
  };

  const handleToggleEcoFriendly = async (store: GroceryStore, value: boolean) => {
    try {
      await GroceryIntegrationService.getInstance().updateStorePreferences(store.id, {
        preferEcoFriendly: value,
      });
      
      // Update the local state
      setConnectedStores(prev => 
        prev.map(s => 
          s.id === store.id ? { ...s, preferEcoFriendly: value } : s
        )
      );
    } catch (error) {
      console.error('Failed to update preferences:', error);
      Alert.alert('Error', 'Failed to update delivery preferences');
    }
  };

  const renderProviderOptions = () => {
    return Object.keys(PROVIDER_INFO).map((provider) => {
      const providerKey = provider as GroceryProvider;
      const info = PROVIDER_INFO[providerKey];
      
      return (
        <TouchableOpacity
          key={provider}
          style={[
            styles.providerOption,
            selectedProvider === providerKey && styles.selectedProvider,
          ]}
          onPress={() => setSelectedProvider(providerKey)}
        >
          <Image source={info.logo} style={styles.providerLogo} />
          <View style={styles.providerInfo}>
            <ThemedText style={styles.providerName}>{info.name}</ThemedText>
            <ThemedText style={styles.providerDescription}>{info.description}</ThemedText>
          </View>
          <View style={styles.radioButton}>
            {selectedProvider === providerKey && (
              <View style={styles.radioButtonSelected} />
            )}
          </View>
        </TouchableOpacity>
      );
    });
  };

  return (
    <>
      <Stack.Screen
        options={{
          title: 'Connect to Grocery Stores',
          headerBackTitle: 'Back',
        }}
      />
      
      <ScrollView style={styles.container} contentContainerStyle={styles.content}>
        {isLoading ? (
          <View style={styles.loadingContainer}>
            <ActivityIndicator size="large" color={theme.colors.primary} />
            <ThemedText style={styles.loadingText}>Loading your connected stores...</ThemedText>
          </View>
        ) : (
          <>
            {renderConnectedStores()}
            
            {showAddNew ? (
              <ThemedView style={styles.addNewContainer}>
                <View style={styles.sectionHeader}>
                  <ThemedText style={styles.sectionTitle}>Connect a New Store</ThemedText>
                  <TouchableOpacity onPress={() => setShowAddNew(false)}>
                    <IconSymbol name="x" size={20} color={theme.colors.secondary} />
                  </TouchableOpacity>
                </View>
                
                <ThemedText style={styles.sectionSubtitle}>Select a grocery provider:</ThemedText>
                {renderProviderOptions()}
                
                {selectedProvider && (
                  <View style={styles.credentialsContainer}>
                    <ThemedText style={styles.sectionSubtitle}>Enter your account details:</ThemedText>
                    
                    <Input
                      label="Email"
                      placeholder="Enter your email"
                      value={credentials.email}
                      onChangeText={(text) => handleCredentialChange('email', text)}
                      keyboardType="email-address"
                      autoCapitalize="none"
                      containerStyle={styles.inputContainer}
                    />
                    
                    <Input
                      label="Password"
                      placeholder="Enter your password"
                      value={credentials.password}
                      onChangeText={(text) => handleCredentialChange('password', text)}
                      secureTextEntry
                      containerStyle={styles.inputContainer}
                    />
                    
                    <View style={styles.preferenceToggle}>
                      <ThemedText style={styles.preferenceText}>
                        Prefer eco-friendly delivery options when available
                      </ThemedText>
                      <Switch
                        value={ecoFriendlyOnly}
                        onValueChange={setEcoFriendlyOnly}
                        trackColor={{ false: '#e0e0e0', true: `${theme.colors.primary}80` }}
                        thumbColor={ecoFriendlyOnly ? theme.colors.primary : '#f4f3f4'}
                      />
                    </View>
                    
                    <Button
                      onPress={handleConnectStore}
                      isLoading={isConnecting}
                      disabled={isConnecting || !credentials.email || !credentials.password}
                      style={styles.connectButton}
                    >
                      Connect Store
                    </Button>
                  </View>
                )}
              </ThemedView>
            ) : (
              <Button
                onPress={() => setShowAddNew(true)}
                leftIcon={<IconSymbol name="plus" size={16} color="white" />}
                style={styles.addButton}
              >
                Connect New Store
              </Button>
            )}
            
            <ThemedView style={styles.infoCard}>
              <View style={styles.infoHeader}>
                <IconSymbol name="info" size={20} color={theme.colors.info || '#2196F3'} />
                <ThemedText style={styles.infoTitle}>Why Connect Grocery Stores?</ThemedText>
              </View>
              
              <ThemedText style={styles.infoText}>
                Connecting to grocery delivery services allows you to:
              </ThemedText>
              
              <View style={styles.infoBullets}>
                <View style={styles.infoBullet}>
                  <IconSymbol name="check" size={16} color={theme.colors.success || '#4CAF50'} />
                  <ThemedText style={styles.bulletText}>
                    Redeem your earned eco-credits for discounts on grocery orders
                  </ThemedText>
                </View>
                
                <View style={styles.infoBullet}>
                  <IconSymbol name="check" size={16} color={theme.colors.success || '#4CAF50'} />
                  <ThemedText style={styles.bulletText}>
                    Automatically choose eco-friendly delivery options
                  </ThemedText>
                </View>
                
                <View style={styles.infoBullet}>
                  <IconSymbol name="check" size={16} color={theme.colors.success || '#4CAF50'} />
                  <ThemedText style={styles.bulletText}>
                    Track your environmental impact from sustainable shopping choices
                  </ThemedText>
                </View>
                
                <View style={styles.infoBullet}>
                  <IconSymbol name="check" size={16} color={theme.colors.success || '#4CAF50'} />
                  <ThemedText style={styles.bulletText}>
                    Reduce carbon emissions by optimizing delivery logistics
                  </ThemedText>
                </View>
              </View>
              
              <ThemedText style={styles.infoPrivacy}>
                Your credentials are securely encrypted and we only access your order information.
              </ThemedText>
            </ThemedView>
          </>
        )}
      </ScrollView>
    </>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  content: {
    padding: 16,
    paddingBottom: 32,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    minHeight: 300,
  },
  loadingText: {
    marginTop: 16,
    fontSize: 16,
  },
  emptyState: {
    padding: 32,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 12,
    marginBottom: 24,
  },
  emptyStateTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginTop: 16,
    marginBottom: 8,
  },
  emptyStateText: {
    fontSize: 14,
    textAlign: 'center',
    marginBottom: 16,
  },
  connectedStoresContainer: {
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 16,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  sectionSubtitle: {
    fontSize: 16,
    fontWeight: '500',
    marginBottom: 12,
  },
  storeCard: {
    borderRadius: 12,
    marginBottom: 16,
    padding: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 2,
  },
  storeHeader: {
    flexDirection: 'row',
    marginBottom: 12,
  },
  storeLogo: {
    width: 40,
    height: 40,
    borderRadius: 8,
    marginRight: 12,
  },
  storeInfo: {
    flex: 1,
    justifyContent: 'center',
  },
  storeName: {
    fontSize: 16,
    fontWeight: '600',
  },
  storeEmail: {
    fontSize: 14,
    color: '#888',
  },
  storeDetails: {
    marginBottom: 16,
  },
  storeDetail: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  storeDetailText: {
    fontSize: 14,
    marginLeft: 8,
  },
  ecoDeliveryPref: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginTop: 8,
    paddingTop: 8,
    borderTopWidth: 1,
    borderTopColor: '#e0e0e0',
  },
  ecoDeliveryText: {
    fontSize: 14,
    fontWeight: '500',
  },
  storeActions: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  viewOrdersButton: {
    minWidth: 120,
  },
  addButton: {
    marginBottom: 24,
  },
  addNewContainer: {
    borderRadius: 12,
    padding: 16,
    marginBottom: 24,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 2,
  },
  providerOption: {
    flexDirection: 'row',
    padding: 12,
    borderWidth: 1,
    borderColor: '#e0e0e0',
    borderRadius: 8,
    marginBottom: 12,
    alignItems: 'center',
  },
  selectedProvider: {
    borderColor: '#4CAF50',
    backgroundColor: 'rgba(76, 175, 80, 0.05)',
  },
  providerLogo: {
    width: 40,
    height: 40,
    borderRadius: 8,
  },
  providerInfo: {
    flex: 1,
    marginLeft: 12,
  },
  providerName: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 4,
  },
  providerDescription: {
    fontSize: 12,
    color: '#888',
  },
  radioButton: {
    width: 20,
    height: 20,
    borderRadius: 10,
    borderWidth: 2,
    borderColor: '#4CAF50',
    justifyContent: 'center',
    alignItems: 'center',
  },
  radioButtonSelected: {
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: '#4CAF50',
  },
  credentialsContainer: {
    marginTop: 16,
    paddingTop: 16,
    borderTopWidth: 1,
    borderTopColor: '#e0e0e0',
  },
  inputContainer: {
    marginBottom: 16,
  },
  preferenceToggle: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 24,
  },
  preferenceText: {
    fontSize: 14,
    flex: 1,
    marginRight: 16,
  },
  connectButton: {
    marginTop: 8,
  },
  infoCard: {
    borderRadius: 12,
    padding: 16,
    backgroundColor: 'rgba(33, 150, 243, 0.05)',
  },
  infoHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  infoTitle: {
    fontSize: 16,
    fontWeight: '600',
    marginLeft: 8,
  },
  infoText: {
    fontSize: 14,
    marginBottom: 12,
  },
  infoBullets: {
    marginBottom: 16,
  },
  infoBullet: {
    flexDirection: 'row',
    marginBottom: 8,
  },
  bulletText: {
    fontSize: 14,
    marginLeft: 8,
    flex: 1,
  },
  infoPrivacy: {
    fontSize: 12,
    fontStyle: 'italic',
  },
}); 