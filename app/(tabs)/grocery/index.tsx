import { Button } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';
import { ThemedText } from '@/components/ui/ThemedText';
import { ThemedView } from '@/components/ui/ThemedView';
import { useTheme } from '@/hooks/useTheme';
import { CreditService } from '@/services/CreditService';
import { groceryIntegrationService } from '@/services/GroceryIntegrationService';
import { DeliverySlot, GroceryOrder } from '@/types/GroceryStore';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import React, { useEffect, useState } from 'react';
import { ActivityIndicator, FlatList, StyleSheet, TouchableOpacity, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

// Mock user ID for now - in a real app, this would come from auth service
const MOCK_USER_ID = 'user123';

export default function GroceryOrdersScreen() {
  const { theme } = useTheme();
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(true);
  const [isLoadingCreditBalance, setIsLoadingCreditBalance] = useState(true);
  const [isIntegrationEnabled, setIsIntegrationEnabled] = useState(false);
  const [deliverySlots, setDeliverySlots] = useState<DeliverySlot[]>([]);
  const [orders, setOrders] = useState<GroceryOrder[]>([]);
  const [creditBalance, setCreditBalance] = useState(0);

  useEffect(() => {
    loadInitialData();
  }, []);

  const loadInitialData = async () => {
    try {
      setIsLoading(true);
      
      // Check if integration is enabled
      const settings = groceryIntegrationService.getSettings();
      setIsIntegrationEnabled(settings.enabled);
      
      if (settings.enabled) {
        // Load delivery slots
        const slots = await groceryIntegrationService.getDeliverySlots();
        setDeliverySlots(slots.filter(slot => slot.available).slice(0, 3));
        
        // Placeholder for fetching orders (would come from a backend)
        // In a real app, we'd get this from the API
        setOrders([]);
      }

      // Load credit balance
      setIsLoadingCreditBalance(true);
      const credits = await CreditService.getUserCredits(MOCK_USER_ID);
      setCreditBalance(credits);
      setIsLoadingCreditBalance(false);
    } catch (error) {
      console.error('Error loading grocery data:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleGoToSettings = () => {
    router.push('/settings/grocery-integration');
  };

  if (isLoading) {
    return (
      <ThemedView style={styles.loadingContainer}>
        <ActivityIndicator size="large" color={theme.colors.primary} />
        <ThemedText style={styles.loadingText}>Loading grocery store data...</ThemedText>
      </ThemedView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <ThemedView style={styles.header}>
        <ThemedText style={styles.title}>Grocery Orders</ThemedText>
      </ThemedView>
      
      {!isIntegrationEnabled ? (
        <ThemedView style={styles.notConnectedContainer}>
          <Ionicons name="cart-outline" size={64} color={theme.colors.secondary} />
          <ThemedText style={styles.notConnectedTitle}>
            Grocery Store Integration
          </ThemedText>
          <ThemedText style={styles.notConnectedDescription}>
            Connect your Checkers Sixty60 account to redeem your recycling credits
            for grocery delivery discounts.
          </ThemedText>
          <Button onPress={handleGoToSettings}>
            Connect Account
          </Button>
        </ThemedView>
      ) : (
        <FlatList
          data={[]}
          ListHeaderComponent={() => (
            <>
              <Card style={styles.creditCard}>
                <ThemedText style={styles.creditTitle}>Available Credits</ThemedText>
                {isLoadingCreditBalance ? (
                  <ActivityIndicator size="small" color={theme.colors.primary} />
                ) : (
                  <ThemedText style={styles.creditBalance}>
                    R {creditBalance.toFixed(2)}
                  </ThemedText>
                )}
                <ThemedText style={styles.creditDescription}>
                  Use your recycling credits towards grocery purchases
                </ThemedText>
                <Button 
                  onPress={() => router.push('/grocery/redeem')}
                  style={styles.redeemButton}
                >
                  Redeem Credits
                </Button>
              </Card>

              {deliverySlots.length > 0 && (
                <View style={styles.section}>
                  <ThemedText style={styles.sectionTitle}>Available Delivery Slots</ThemedText>
                  {deliverySlots.map((slot) => (
                    <TouchableOpacity 
                      key={slot.id}
                      style={styles.slotCard}
                      onPress={() => router.push(`/grocery/book-slot?id=${slot.id}`)}
                    >
                      <View>
                        <ThemedText style={styles.slotDate}>{slot.date}</ThemedText>
                        <ThemedText style={styles.slotTime}>{slot.startTime} - {slot.endTime}</ThemedText>
                      </View>
                      <View style={styles.slotPrice}>
                        <ThemedText style={styles.slotPriceText}>
                          R {(slot.fee || 0).toFixed(2)}
                        </ThemedText>
                        <Ionicons 
                          name="chevron-forward" 
                          size={20} 
                          color={theme.colors.text.secondary} 
                        />
                      </View>
                    </TouchableOpacity>
                  ))}
                  <TouchableOpacity 
                    style={styles.viewMoreButton}
                    onPress={() => router.push('/grocery/delivery-slots')}
                  >
                    <ThemedText style={styles.viewMoreText}>View All Slots</ThemedText>
                  </TouchableOpacity>
                </View>
              )}

              <View style={styles.section}>
                <ThemedText style={styles.sectionTitle}>My Orders</ThemedText>
                
                {orders.length === 0 && (
                  <ThemedView style={styles.emptyStateContainer}>
                    <Ionicons name="bag-outline" size={48} color={theme.colors.text.secondary} />
                    <ThemedText style={styles.emptyStateText}>No orders yet</ThemedText>
                    <ThemedText style={styles.emptyStateSubtext}>
                      Orders placed with your recycling credits will appear here
                    </ThemedText>
                  </ThemedView>
                )}
              </View>
            </>
          )}
          renderItem={() => null}
          ListEmptyComponent={() => null}
          ListFooterComponent={() => (
            <View style={styles.settingsLinkContainer}>
              <TouchableOpacity 
                style={styles.settingsLink}
                onPress={handleGoToSettings}
              >
                <Ionicons name="settings-outline" size={20} color={theme.colors.text.secondary} />
                <ThemedText style={styles.settingsLinkText}>
                  Grocery Integration Settings
                </ThemedText>
              </TouchableOpacity>
            </View>
          )}
        />
      )}
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
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 16,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
  },
  notConnectedContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 32,
  },
  notConnectedTitle: {
    fontSize: 22,
    fontWeight: 'bold',
    marginTop: 24,
    marginBottom: 12,
    textAlign: 'center',
  },
  notConnectedDescription: {
    textAlign: 'center',
    marginBottom: 32,
    opacity: 0.7,
  },
  creditCard: {
    marginHorizontal: 16,
    marginTop: 16,
    marginBottom: 8,
    padding: 16,
  },
  creditTitle: {
    fontSize: 16,
    opacity: 0.7,
    marginBottom: 8,
  },
  creditBalance: {
    fontSize: 32,
    fontWeight: 'bold',
    marginBottom: 4,
  },
  creditDescription: {
    fontSize: 14,
    opacity: 0.7,
    marginBottom: 16,
  },
  redeemButton: {
    alignSelf: 'flex-start',
  },
  section: {
    marginTop: 24,
    paddingHorizontal: 16,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    marginBottom: 12,
  },
  slotCard: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 16,
    paddingHorizontal: 16,
    backgroundColor: 'rgba(0,0,0,0.03)',
    borderRadius: 8,
    marginBottom: 8,
  },
  slotDate: {
    fontSize: 16,
    fontWeight: '600',
  },
  slotTime: {
    fontSize: 14,
    opacity: 0.7,
    marginTop: 4,
  },
  slotPrice: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  slotPriceText: {
    fontSize: 16,
    marginRight: 4,
  },
  viewMoreButton: {
    alignItems: 'center',
    paddingVertical: 12,
  },
  viewMoreText: {
    fontSize: 14,
    opacity: 0.7,
  },
  emptyStateContainer: {
    padding: 32,
    alignItems: 'center',
    justifyContent: 'center',
  },
  emptyStateText: {
    fontSize: 18,
    fontWeight: '600',
    marginTop: 16,
    marginBottom: 8,
  },
  emptyStateSubtext: {
    textAlign: 'center',
    opacity: 0.7,
  },
  settingsLinkContainer: {
    margin: 24,
  },
  settingsLink: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 12,
  },
  settingsLinkText: {
    marginLeft: 8,
    opacity: 0.7,
  },
}); 