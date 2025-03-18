/**
 * Grocery Order Details Screen
 * 
 * Displays detailed information about a grocery order
 * including items, delivery status, and tracking information.
 */

import { Button } from '@/components/ui/Button';
import { IconSymbol } from '@/components/ui/IconSymbol';
import { ThemedText } from '@/components/ui/ThemedText';
import { ThemedView } from '@/components/ui/ThemedView';
import { useTheme } from '@/hooks/useTheme';
import { GroceryIntegrationService, GroceryOrder, OrderItem, OrderStatus } from '@/services/GroceryIntegrationService';
import { format } from 'date-fns';
import { Stack, useLocalSearchParams, useRouter } from 'expo-router';
import React, { useEffect, useState } from 'react';
import { ActivityIndicator, Alert, Linking, ScrollView, StyleSheet, View } from 'react-native';

// Helper function to get human-readable status
const getStatusText = (status: OrderStatus): string => {
  switch (status) {
    case OrderStatus.PENDING:
      return 'Pending';
    case OrderStatus.APPROVED:
      return 'Approved';
    case OrderStatus.PROCESSING:
      return 'Processing';
    case OrderStatus.READY_FOR_PICKUP:
      return 'Ready for Pickup';
    case OrderStatus.OUT_FOR_DELIVERY:
      return 'Out for Delivery';
    case OrderStatus.DELIVERED:
      return 'Delivered';
    case OrderStatus.CANCELLED:
      return 'Cancelled';
    case OrderStatus.RETURNED:
      return 'Returned';
    case OrderStatus.REFUNDED:
      return 'Refunded';
    default:
      return 'Unknown';
  }
};

// Helper function to get status color
const getStatusColor = (status: OrderStatus, theme: any): string => {
  switch (status) {
    case OrderStatus.DELIVERED:
      return theme.colors.success || '#4CAF50';
    case OrderStatus.OUT_FOR_DELIVERY:
      return theme.colors.primary;
    case OrderStatus.READY_FOR_PICKUP:
      return theme.colors.info || '#2196F3';
    case OrderStatus.CANCELLED:
    case OrderStatus.RETURNED:
      return theme.colors.error || '#F44336';
    case OrderStatus.REFUNDED:
      return theme.colors.warning || '#FF9800';
    default:
      return theme.colors.secondary;
  }
};

export default function OrderDetailScreen() {
  const router = useRouter();
  const { theme } = useTheme();
  const params = useLocalSearchParams<{ id: string }>();
  const [order, setOrder] = useState<GroceryOrder | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (!params.id) {
      Alert.alert('Error', 'Order ID is missing');
      router.back();
      return;
    }
    
    loadOrderDetails();
  }, [params.id]);

  const loadOrderDetails = async () => {
    try {
      setIsLoading(true);
      const orderDetails = await GroceryIntegrationService.getInstance().getOrderById(params.id);
      setOrder(orderDetails);
    } catch (error) {
      console.error('Failed to load order details:', error);
      Alert.alert('Error', 'Failed to load order details');
      router.back();
    } finally {
      setIsLoading(false);
    }
  };

  const handleTrackOrder = () => {
    if (!order || !order.trackingUrl) {
      Alert.alert('Tracking Unavailable', 'No tracking information is available for this order yet.');
      return;
    }
    
    Linking.openURL(order.trackingUrl).catch(() => {
      Alert.alert('Error', 'Could not open tracking URL');
    });
  };

  const handleViewReceipt = () => {
    if (!order || !order.receiptUrl) {
      Alert.alert('Receipt Unavailable', 'No receipt is available for this order yet.');
      return;
    }
    
    router.push({
      pathname: '/webview',
      params: { url: order.receiptUrl, title: 'Order Receipt' }
    });
  };

  const handleApplyCredits = () => {
    if (!order) return;
    
    router.push({
      pathname: '/grocery/redeem-credits',
      params: { 
        orderId: order.id, 
        storeId: order.storeId, 
        maxCredits: '50' // This would come from the CreditsService in a real app
      }
    });
  };

  const renderItemsList = () => {
    if (!order || !order.items || order.items.length === 0) {
      return (
        <ThemedView style={styles.emptyItemsContainer}>
          <IconSymbol name="package" size={32} color={theme.colors.secondary} />
          <ThemedText style={styles.emptyItemsText}>No items found for this order</ThemedText>
        </ThemedView>
      );
    }

    return (
      <View style={styles.itemsContainer}>
        <ThemedText style={styles.sectionTitle}>Items ({order.items.length})</ThemedText>
        
        {order.items.map((item: OrderItem, index: number) => (
          <ThemedView key={item.id || index} style={styles.itemCard}>
            <View style={styles.itemHeader}>
              <ThemedText style={styles.itemName}>
                {item.name}
              </ThemedText>
              <ThemedText style={styles.itemPrice}>
                ${item.price.toFixed(2)}
              </ThemedText>
            </View>
            
            <View style={styles.itemDetails}>
              <ThemedText style={styles.itemQuantity}>
                Qty: {item.quantity}
              </ThemedText>
              
              {item.notes && (
                <ThemedText style={styles.itemNotes}>
                  Note: {item.notes}
                </ThemedText>
              )}
              
              {item.substitution && (
                <View style={styles.substitutionInfo}>
                  <IconSymbol name="alert-triangle" size={14} color={theme.colors.warning || '#FF9800'} />
                  <ThemedText style={styles.substitutionText}>
                    Substituted with: {item.substitution}
                  </ThemedText>
                </View>
              )}
            </View>
          </ThemedView>
        ))}
      </View>
    );
  };

  const renderDeliveryInfo = () => {
    if (!order) return null;

    return (
      <ThemedView style={styles.infoCard}>
        <ThemedText style={styles.sectionTitle}>Delivery Information</ThemedText>
        
        <View style={styles.infoRow}>
          <ThemedText style={styles.infoLabel}>Address:</ThemedText>
          <ThemedText style={styles.infoValue}>{order.deliveryAddress || 'Not available'}</ThemedText>
        </View>
        
        {order.scheduledDeliveryStart && order.scheduledDeliveryEnd && (
          <View style={styles.infoRow}>
            <ThemedText style={styles.infoLabel}>Scheduled Time:</ThemedText>
            <ThemedText style={styles.infoValue}>
              {format(new Date(order.scheduledDeliveryStart), 'MMM d, yyyy')} between {
                format(new Date(order.scheduledDeliveryStart), 'h:mm a')
              } - {
                format(new Date(order.scheduledDeliveryEnd), 'h:mm a')
              }
            </ThemedText>
          </View>
        )}
        
        {order.actualDeliveryTime && (
          <View style={styles.infoRow}>
            <ThemedText style={styles.infoLabel}>Delivered At:</ThemedText>
            <ThemedText style={styles.infoValue}>
              {format(new Date(order.actualDeliveryTime), 'MMM d, yyyy h:mm a')}
            </ThemedText>
          </View>
        )}
        
        <View style={styles.infoRow}>
          <ThemedText style={styles.infoLabel}>Delivery Type:</ThemedText>
          <View style={styles.deliveryTypeContainer}>
            <ThemedText style={styles.infoValue}>
              {order.isEcoDelivery ? 'Eco-Friendly Delivery' : 'Standard Delivery'}
            </ThemedText>
            
            {order.isEcoDelivery && (
              <View style={styles.ecoDeliveryBadge}>
                <IconSymbol name="leaf" size={12} color="#4CAF50" />
                <ThemedText style={styles.ecoDeliveryText}>Eco</ThemedText>
              </View>
            )}
          </View>
        </View>
        
        {order.driverNotes && (
          <View style={styles.infoRow}>
            <ThemedText style={styles.infoLabel}>Delivery Notes:</ThemedText>
            <ThemedText style={styles.infoValue}>{order.driverNotes}</ThemedText>
          </View>
        )}
        
        {order.trackingUrl && (
          <Button 
            variant="outline"
            onPress={handleTrackOrder}
            leftIcon={<IconSymbol name="map-pin" size={16} color={theme.colors.primary} />}
            style={styles.trackButton}
          >
            Track Delivery
          </Button>
        )}
      </ThemedView>
    );
  };

  const renderOrderSummary = () => {
    if (!order) return null;

    return (
      <ThemedView style={styles.infoCard}>
        <ThemedText style={styles.sectionTitle}>Order Summary</ThemedText>
        
        <View style={styles.summaryRow}>
          <ThemedText style={styles.summaryLabel}>Subtotal</ThemedText>
          <ThemedText style={styles.summaryValue}>${order.subtotal.toFixed(2)}</ThemedText>
        </View>
        
        {order.tax > 0 && (
          <View style={styles.summaryRow}>
            <ThemedText style={styles.summaryLabel}>Tax</ThemedText>
            <ThemedText style={styles.summaryValue}>${order.tax.toFixed(2)}</ThemedText>
          </View>
        )}
        
        {order.deliveryFee > 0 && (
          <View style={styles.summaryRow}>
            <ThemedText style={styles.summaryLabel}>Delivery Fee</ThemedText>
            <ThemedText style={styles.summaryValue}>${order.deliveryFee.toFixed(2)}</ThemedText>
          </View>
        )}
        
        {order.tip > 0 && (
          <View style={styles.summaryRow}>
            <ThemedText style={styles.summaryLabel}>Tip</ThemedText>
            <ThemedText style={styles.summaryValue}>${order.tip.toFixed(2)}</ThemedText>
          </View>
        )}
        
        {order.discount > 0 && (
          <View style={styles.summaryRow}>
            <ThemedText style={styles.summaryLabel}>Discount</ThemedText>
            <ThemedText style={[styles.summaryValue, { color: theme.colors.success || '#4CAF50' }]}>
              -${order.discount.toFixed(2)}
            </ThemedText>
          </View>
        )}
        
        {order.creditsApplied > 0 && (
          <View style={styles.summaryRow}>
            <ThemedText style={styles.summaryLabel}>EcoCart Credits</ThemedText>
            <ThemedText style={[styles.summaryValue, { color: theme.colors.primary }]}>
              -${order.creditsApplied.toFixed(2)}
            </ThemedText>
          </View>
        )}
        
        <View style={styles.divider} />
        
        <View style={styles.summaryRow}>
          <ThemedText style={styles.totalLabel}>Total</ThemedText>
          <ThemedText style={styles.totalValue}>${order.total.toFixed(2)}</ThemedText>
        </View>
        
        {order.creditsApplied === 0 && order.status !== OrderStatus.DELIVERED && (
          <Button
            variant="outline"
            onPress={handleApplyCredits}
            style={styles.applyCreditsButton}
          >
            Apply EcoCart Credits
          </Button>
        )}
      </ThemedView>
    );
  };

  if (isLoading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color={theme.colors.primary} />
        <ThemedText style={styles.loadingText}>Loading order details...</ThemedText>
      </View>
    );
  }

  if (!order) {
    return (
      <View style={styles.errorContainer}>
        <IconSymbol name="alert-circle" size={48} color={theme.colors.error || '#F44336'} />
        <ThemedText style={styles.errorText}>Failed to load order details</ThemedText>
        <Button onPress={() => router.back()}>Go Back</Button>
      </View>
    );
  }

  return (
    <>
      <Stack.Screen
        options={{
          title: `Order #${order.id.slice(-6)}`,
          headerBackTitle: 'Back',
        }}
      />
      
      <ScrollView style={styles.container} contentContainerStyle={styles.content}>
        <View style={styles.header}>
          <View style={styles.orderBasicInfo}>
            <View style={[styles.statusIndicator, { backgroundColor: getStatusColor(order.status, theme) }]} />
            <ThemedText style={styles.statusText}>{getStatusText(order.status)}</ThemedText>
          </View>
          
          <ThemedText style={styles.orderDate}>
            {format(new Date(order.createdAt), 'MMM d, yyyy h:mm a')}
          </ThemedText>
        </View>
        
        <ThemedView style={styles.storeInfo}>
          <View style={styles.storeNameContainer}>
            <IconSymbol name="shopping-bag" size={20} color={theme.colors.primary} />
            <ThemedText style={styles.storeName}>{order.provider}</ThemedText>
          </View>
          
          <ThemedText style={styles.orderNumber}>Order #{order.id}</ThemedText>
        </ThemedView>
        
        {renderDeliveryInfo()}
        {renderItemsList()}
        {renderOrderSummary()}
        
        <View style={styles.actions}>
          {order.receiptUrl && (
            <Button
              variant="outline"
              onPress={handleViewReceipt}
              leftIcon={<IconSymbol name="file-text" size={16} color={theme.colors.primary} />}
              style={styles.actionButton}
            >
              View Receipt
            </Button>
          )}
          
          <Button
            variant="outline"
            onPress={() => router.push('/grocery/orders')}
            leftIcon={<IconSymbol name="list" size={16} color={theme.colors.primary} />}
            style={styles.actionButton}
          >
            All Orders
          </Button>
        </View>
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
  },
  loadingText: {
    marginTop: 16,
    fontSize: 16,
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 16,
  },
  errorText: {
    fontSize: 16,
    marginTop: 16,
    marginBottom: 24,
    textAlign: 'center',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  orderBasicInfo: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  statusIndicator: {
    width: 12,
    height: 12,
    borderRadius: 6,
    marginRight: 8,
  },
  statusText: {
    fontSize: 16,
    fontWeight: '600',
  },
  orderDate: {
    fontSize: 14,
  },
  storeInfo: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 16,
    borderRadius: 12,
    marginBottom: 16,
  },
  storeNameContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  storeName: {
    fontSize: 16,
    fontWeight: '500',
    marginLeft: 8,
  },
  orderNumber: {
    fontSize: 14,
  },
  infoCard: {
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 2,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    marginBottom: 16,
  },
  infoRow: {
    flexDirection: 'row',
    marginBottom: 12,
  },
  infoLabel: {
    fontSize: 14,
    fontWeight: '500',
    width: 120,
  },
  infoValue: {
    fontSize: 14,
    flex: 1,
  },
  deliveryTypeContainer: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
  },
  ecoDeliveryBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#E8F5E9',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
    marginLeft: 8,
  },
  ecoDeliveryText: {
    fontSize: 12,
    color: '#4CAF50',
    marginLeft: 4,
  },
  trackButton: {
    marginTop: 16,
  },
  itemsContainer: {
    marginBottom: 16,
  },
  emptyItemsContainer: {
    padding: 32,
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius: 12,
    marginBottom: 16,
  },
  emptyItemsText: {
    fontSize: 16,
    marginTop: 16,
    textAlign: 'center',
  },
  itemCard: {
    borderRadius: 8,
    padding: 12,
    marginBottom: 8,
  },
  itemHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 8,
  },
  itemName: {
    fontSize: 16,
    fontWeight: '500',
    flex: 1,
    marginRight: 8,
  },
  itemPrice: {
    fontSize: 16,
    fontWeight: '600',
  },
  itemDetails: {
    marginTop: 4,
  },
  itemQuantity: {
    fontSize: 14,
    marginBottom: 4,
  },
  itemNotes: {
    fontSize: 14,
    fontStyle: 'italic',
    marginBottom: 4,
  },
  substitutionInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 4,
  },
  substitutionText: {
    fontSize: 14,
    marginLeft: 8,
    flex: 1,
  },
  summaryRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 12,
  },
  summaryLabel: {
    fontSize: 14,
  },
  summaryValue: {
    fontSize: 14,
    fontWeight: '500',
  },
  divider: {
    height: 1,
    backgroundColor: '#e0e0e0',
    marginVertical: 12,
  },
  totalLabel: {
    fontSize: 16,
    fontWeight: 'bold',
  },
  totalValue: {
    fontSize: 16,
    fontWeight: 'bold',
  },
  applyCreditsButton: {
    marginTop: 16,
  },
  actions: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginTop: 16,
  },
  actionButton: {
    flex: 1,
    marginHorizontal: 8,
  },
}); 