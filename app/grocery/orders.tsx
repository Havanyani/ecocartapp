/**
 * Grocery Orders Screen
 * 
 * Displays the user's grocery orders, their status, and tracking information.
 * Allows users to apply credits to orders and view order details.
 */

import { Button } from '@/components/ui/Button';
import { IconSymbol } from '@/components/ui/IconSymbol';
import { ThemedText } from '@/components/ui/ThemedText';
import { ThemedView } from '@/components/ui/ThemedView';
import { useTheme } from '@/hooks/useTheme';
import { CreditsService } from '@/services/CreditsService';
import { GroceryIntegrationService, GroceryOrder, OrderStatus } from '@/services/GroceryIntegrationService';
import { format, isPast } from 'date-fns';
import { Stack, useRouter } from 'expo-router';
import React, { useEffect, useState } from 'react';
import { ActivityIndicator, Alert, FlatList, RefreshControl, StyleSheet, TouchableOpacity, View } from 'react-native';

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

// Filter options for orders
const FILTER_OPTIONS = [
  { label: 'All', value: null },
  { label: 'Active', value: 'active' },
  { label: 'Completed', value: 'completed' },
  { label: 'Cancelled', value: 'cancelled' },
];

// Active order statuses
const ACTIVE_STATUSES = [
  OrderStatus.PENDING,
  OrderStatus.APPROVED,
  OrderStatus.PROCESSING,
  OrderStatus.READY_FOR_PICKUP,
  OrderStatus.OUT_FOR_DELIVERY,
];

// Completed order statuses
const COMPLETED_STATUSES = [
  OrderStatus.DELIVERED,
];

// Cancelled order statuses
const CANCELLED_STATUSES = [
  OrderStatus.CANCELLED,
  OrderStatus.RETURNED,
  OrderStatus.REFUNDED,
];

export default function GroceryOrdersScreen() {
  const router = useRouter();
  const { theme } = useTheme();
  const [orders, setOrders] = useState<GroceryOrder[]>([]);
  const [filteredOrders, setFilteredOrders] = useState<GroceryOrder[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [activeFilter, setActiveFilter] = useState<string | null>(null);
  const [availableCredits, setAvailableCredits] = useState(0);

  useEffect(() => {
    loadOrders();
    loadCredits();
  }, []);

  useEffect(() => {
    filterOrders();
  }, [orders, activeFilter]);

  const loadOrders = async () => {
    try {
      setIsLoading(true);
      const data = await GroceryIntegrationService.getInstance().getOrders(30);
      setOrders(data);
    } catch (error) {
      console.error('Failed to load orders:', error);
      Alert.alert('Error', 'Failed to load your grocery orders');
    } finally {
      setIsLoading(false);
      setRefreshing(false);
    }
  };

  const loadCredits = async () => {
    try {
      const credits = await CreditsService.getInstance().getUserCredits();
      setAvailableCredits(credits);
    } catch (error) {
      console.error('Failed to load credits:', error);
    }
  };

  const onRefresh = () => {
    setRefreshing(true);
    loadOrders();
    loadCredits();
  };

  const filterOrders = () => {
    if (!activeFilter) {
      setFilteredOrders(orders);
      return;
    }

    let filtered: GroceryOrder[] = [];
    
    switch (activeFilter) {
      case 'active':
        filtered = orders.filter(order => ACTIVE_STATUSES.includes(order.status));
        break;
      case 'completed':
        filtered = orders.filter(order => COMPLETED_STATUSES.includes(order.status));
        break;
      case 'cancelled':
        filtered = orders.filter(order => CANCELLED_STATUSES.includes(order.status));
        break;
      default:
        filtered = orders;
    }
    
    setFilteredOrders(filtered);
  };

  const handleApplyCredits = (order: GroceryOrder) => {
    if (availableCredits <= 0) {
      Alert.alert(
        'No Credits Available',
        'You currently have no credits available to apply to this order.'
      );
      return;
    }

    // Show credit redemption dialog
    router.push({
      pathname: '/grocery/redeem-credits',
      params: { orderId: order.id, storeId: order.storeId, maxCredits: availableCredits },
    });
  };

  const handleTrackOrder = (order: GroceryOrder) => {
    if (order.trackingUrl) {
      // Open web browser with tracking URL
      router.push({
        pathname: '/webview',
        params: { url: order.trackingUrl, title: 'Order Tracking' },
      });
    } else {
      // Navigate to order details
      router.push(`/grocery/order/${order.id}`);
    }
  };

  const renderOrderItem = ({ item }: { item: GroceryOrder }) => {
    const statusColor = getStatusColor(item.status, theme);
    const isEligibleForCredits = ACTIVE_STATUSES.includes(item.status) && item.creditsApplied < item.total;
    
    // Format delivery time
    let deliveryTimeText = 'No delivery scheduled';
    if (item.scheduledDeliveryStart && item.scheduledDeliveryEnd) {
      const startDate = new Date(item.scheduledDeliveryStart);
      const endDate = new Date(item.scheduledDeliveryEnd);
      
      if (isPast(endDate)) {
        deliveryTimeText = `Scheduled for ${format(startDate, 'MMM d')} (Past)`;
      } else {
        deliveryTimeText = `Scheduled for ${format(startDate, 'MMM d')} between ${format(startDate, 'h:mm a')} - ${format(endDate, 'h:mm a')}`;
      }
    } else if (item.actualDeliveryTime) {
      deliveryTimeText = `Delivered on ${format(new Date(item.actualDeliveryTime), 'MMM d, h:mm a')}`;
    }

    return (
      <ThemedView style={styles.orderItem}>
        <View style={styles.orderHeader}>
          <View style={styles.orderBasicInfo}>
            <View style={[styles.statusIndicator, { backgroundColor: statusColor }]} />
            <ThemedText style={styles.orderId}>Order #{item.id.slice(-6)}</ThemedText>
          </View>
          
          <ThemedText style={styles.orderDate}>
            {format(new Date(item.createdAt), 'MMM d, yyyy')}
          </ThemedText>
        </View>
        
        <View style={styles.storeInfo}>
          <ThemedText style={styles.storeName}>{item.provider}</ThemedText>
          <ThemedText style={styles.statusText}>{getStatusText(item.status)}</ThemedText>
        </View>
        
        <View style={styles.orderDetails}>
          <View style={styles.orderDetail}>
            <IconSymbol name="clock" size={16} color={theme.colors.secondary} />
            <ThemedText style={styles.orderDetailText}>{deliveryTimeText}</ThemedText>
          </View>
          
          <View style={styles.orderDetail}>
            <IconSymbol name="package" size={16} color={theme.colors.secondary} />
            <ThemedText style={styles.orderDetailText}>
              {item.items.length} {item.items.length === 1 ? 'item' : 'items'}
            </ThemedText>
          </View>
          
          <View style={styles.orderDetail}>
            <IconSymbol name="dollar-sign" size={16} color={theme.colors.secondary} />
            <ThemedText style={styles.orderDetailText}>
              Total: ${item.total.toFixed(2)}
            </ThemedText>
          </View>
          
          {item.creditsApplied > 0 && (
            <View style={styles.orderDetail}>
              <IconSymbol name="award" size={16} color={theme.colors.primary} />
              <ThemedText style={[styles.orderDetailText, { color: theme.colors.primary }]}>
                Credits Applied: ${item.creditsApplied.toFixed(2)}
              </ThemedText>
            </View>
          )}
          
          {item.isEcoDelivery && (
            <View style={styles.ecoDeliveryBadge}>
              <IconSymbol name="leaf" size={12} color="#4CAF50" />
              <ThemedText style={styles.ecoDeliveryText}>Eco Delivery</ThemedText>
            </View>
          )}
        </View>
        
        <View style={styles.orderActions}>
          <Button
            variant="outline"
            onPress={() => router.push(`/grocery/order/${item.id}`)}
            style={styles.viewButton}
          >
            View Details
          </Button>
          
          {ACTIVE_STATUSES.includes(item.status) && (
            <Button
              onPress={() => handleTrackOrder(item)}
              leftIcon={<IconSymbol name="map-pin" size={16} color="white" />}
              style={styles.trackButton}
            >
              Track
            </Button>
          )}
          
          {isEligibleForCredits && (
            <Button
              variant="outline"
              onPress={() => handleApplyCredits(item)}
              style={styles.applyCreditsButton}
            >
              Apply Credits
            </Button>
          )}
        </View>
      </ThemedView>
    );
  };

  const renderFilterOptions = () => (
    <View style={styles.filterContainer}>
      {FILTER_OPTIONS.map(option => (
        <TouchableOpacity
          key={option.value || 'all'}
          style={[
            styles.filterOption,
            activeFilter === option.value && { 
              backgroundColor: theme.colors.primary,
              borderColor: theme.colors.primary,
            },
          ]}
          onPress={() => setActiveFilter(option.value)}
        >
          <ThemedText
            style={[
              styles.filterText,
              activeFilter === option.value && { color: 'white' },
            ]}
          >
            {option.label}
          </ThemedText>
        </TouchableOpacity>
      ))}
    </View>
  );

  return (
    <>
      <Stack.Screen
        options={{
          title: 'Grocery Orders',
          headerBackTitle: 'Back',
        }}
      />

      <View style={styles.container}>
        {isLoading && !refreshing ? (
          <View style={styles.loadingContainer}>
            <ActivityIndicator size="large" color={theme.colors.primary} />
            <ThemedText style={styles.loadingText}>Loading your orders...</ThemedText>
          </View>
        ) : (
          <>
            <View style={styles.creditsContainer}>
              <View style={styles.creditsInfo}>
                <IconSymbol name="award" size={20} color={theme.colors.primary} />
                <ThemedText style={styles.creditsText}>
                  Available Credits: ${availableCredits.toFixed(2)}
                </ThemedText>
              </View>
              
              <TouchableOpacity
                style={styles.earnMoreButton}
                onPress={() => router.push('/recycling/collection')}
              >
                <ThemedText style={styles.earnMoreText}>Earn More</ThemedText>
                <IconSymbol name="plus" size={14} color={theme.colors.primary} />
              </TouchableOpacity>
            </View>
            
            {renderFilterOptions()}
            
            {filteredOrders.length === 0 ? (
              <ThemedView style={styles.emptyState}>
                <IconSymbol name="shopping-bag" size={48} color={theme.colors.secondary} />
                <ThemedText style={styles.emptyStateTitle}>No Orders Found</ThemedText>
                <ThemedText style={styles.emptyStateText}>
                  {activeFilter
                    ? `You don't have any ${activeFilter} orders.`
                    : `You haven't placed any grocery orders yet.`}
                </ThemedText>
                
                <Button
                  onPress={() => router.push('/grocery/connect')}
                  style={styles.connectButton}
                >
                  Connect to Grocery Stores
                </Button>
              </ThemedView>
            ) : (
              <FlatList
                data={filteredOrders}
                renderItem={renderOrderItem}
                keyExtractor={item => item.id}
                contentContainerStyle={styles.ordersList}
                refreshControl={
                  <RefreshControl
                    refreshing={refreshing}
                    onRefresh={onRefresh}
                    colors={[theme.colors.primary]}
                  />
                }
              />
            )}
          </>
        )}
      </View>
    </>
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
    fontSize: 16,
  },
  creditsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#e0e0e0',
  },
  creditsInfo: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  creditsText: {
    fontSize: 16,
    fontWeight: '600',
    marginLeft: 8,
  },
  earnMoreButton: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  earnMoreText: {
    fontSize: 14,
    marginRight: 4,
  },
  filterContainer: {
    flexDirection: 'row',
    padding: 16,
  },
  filterOption: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: '#e0e0e0',
    marginRight: 8,
  },
  filterText: {
    fontSize: 14,
  },
  ordersList: {
    padding: 16,
  },
  orderItem: {
    borderRadius: 12,
    marginBottom: 16,
    padding: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 2,
  },
  orderHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  orderBasicInfo: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  statusIndicator: {
    width: 8,
    height: 8,
    borderRadius: 4,
    marginRight: 8,
  },
  orderId: {
    fontSize: 16,
    fontWeight: '600',
  },
  orderDate: {
    fontSize: 12,
  },
  storeInfo: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 12,
  },
  storeName: {
    fontSize: 14,
  },
  statusText: {
    fontSize: 14,
    fontWeight: '500',
  },
  orderDetails: {
    borderTopWidth: 1,
    borderTopColor: '#e0e0e0',
    paddingTop: 12,
    marginBottom: 16,
  },
  orderDetail: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  orderDetailText: {
    fontSize: 14,
    marginLeft: 8,
  },
  ecoDeliveryBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#E8F5E9',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
    alignSelf: 'flex-start',
    marginTop: 4,
  },
  ecoDeliveryText: {
    fontSize: 12,
    color: '#4CAF50',
    marginLeft: 4,
  },
  orderActions: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
  },
  viewButton: {
    marginRight: 8,
  },
  trackButton: {
    marginRight: 8,
  },
  applyCreditsButton: {
    borderColor: '#4CAF50',
  },
  emptyState: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 32,
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
    marginBottom: 24,
  },
  connectButton: {
    minWidth: 240,
  },
}); 