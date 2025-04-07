import { OrderTracking } from '@/components/OrderTracking';
import { HapticTab } from '@/components/ui/HapticTab';
import { IconSymbol } from '@/components/ui/IconSymbol';
import { ThemedText } from '@/components/ui/ThemedText';
import { ThemedView } from '@/components/ui/ThemedView';
import { useOrders } from '@/hooks/useOrders';
import { RootStackParamList } from '@/navigation/types';
import { useTheme } from '@/theme';
import { formatCurrency } from '@/utils/formatCurrency';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import React, { useCallback, useEffect, useState } from 'react';
import {
    Alert,
    FlatList,
    RefreshControl,
    StyleSheet,
    TouchableOpacity,
    View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

interface PlasticPickup {
  id: string;
  status: 'pending' | 'completed' | 'cancelled';
  estimatedWeight: number;
  actualWeight?: number;
  scheduledTime: string;
  environmentalImpact?: {
    plasticSaved: number;
    co2Reduced: number;
  };
}

interface DeliveryPersonnel {
  id: string;
  name: string;
  phone: string;
  rating: number;
  photo?: string;
}

interface Order {
  id: string;
  orderNumber: string;
  status: 'processing' | 'out_for_delivery' | 'delivered' | 'cancelled';
  items: Array<{
    id: string;
    name: string;
    quantity: number;
    price: number;
  }>;
  totalAmount: number;
  deliveryTime: string;
  plasticPickup?: PlasticPickup;
  deliveryPersonnel?: DeliveryPersonnel;
  createdAt: string;
}

type OrderTab = 'in_progress' | 'completed' | 'cancelled';

type OrdersScreenProps = {
  navigation: NativeStackNavigationProp<RootStackParamList, 'Orders'>;
};

export function OrdersScreen({ navigation }: OrdersScreenProps): JSX.Element {
  const theme = useTheme();
  const { orders, isLoading, error, fetchOrders } = useOrders();
  const [selectedTab, setSelectedTab] = useState<OrderTab>('in_progress');
  const [refreshing, setRefreshing] = useState(false);

  useEffect(() => {
    fetchOrders();
  }, [fetchOrders]);

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    try {
      await fetchOrders();
    } catch (error) {
      Alert.alert('Error', 'Failed to refresh orders');
    } finally {
      setRefreshing(false);
    }
  }, [fetchOrders]);

  const filteredOrders = orders.filter(order => {
    switch (selectedTab) {
      case 'in_progress':
        return ['processing', 'out_for_delivery'].includes(order.status);
      case 'completed':
        return order.status === 'delivered';
      case 'cancelled':
        return order.status === 'cancelled';
      default:
        return true;
    }
  });

  const handleCall = useCallback((phone: string) => {
    // Implementation for making a phone call
    Alert.alert('Call Delivery Personnel', `Calling ${phone}`);
  }, []);

  const renderOrder = useCallback(({ item: order }: { item: Order }) => (
    <ThemedView style={styles.orderCard} testID={`order-${order.id}`}>
      <View style={styles.orderHeader}>
        <ThemedText style={styles.orderNumber}>
          Order #{order.orderNumber}
        </ThemedText>
        <ThemedText style={styles.orderDate}>
          {new Date(order.createdAt).toLocaleDateString()}
        </ThemedText>
      </View>

      <View style={styles.orderDetails}>
        <ThemedText style={styles.totalAmount}>
          Total: {formatCurrency(order.totalAmount)}
        </ThemedText>
        <ThemedText style={styles.deliveryTime}>
          Delivery: {new Date(order.deliveryTime).toLocaleTimeString()}
        </ThemedText>
      </View>

      {order.plasticPickup && (
        <View style={styles.plasticPickup}>
          <ThemedText style={styles.pickupTitle}>Plastic Pickup</ThemedText>
          <ThemedText>
            Status: {order.plasticPickup.status}
          </ThemedText>
          <ThemedText>
            Estimated Weight: {order.plasticPickup.estimatedWeight}kg
          </ThemedText>
          {order.plasticPickup.actualWeight && (
            <ThemedText>
              Actual Weight: {order.plasticPickup.actualWeight}kg
            </ThemedText>
          )}
          {order.plasticPickup.environmentalImpact && (
            <View style={styles.impact}>
              <ThemedText>
                Plastic Saved: {order.plasticPickup.environmentalImpact.plasticSaved}kg
              </ThemedText>
              <ThemedText>
                CO₂ Reduced: {order.plasticPickup.environmentalImpact.co2Reduced}kg
              </ThemedText>
            </View>
          )}
        </View>
      )}

      {order.deliveryPersonnel && (
        <View style={styles.personnel}>
          <View style={styles.personnelInfo}>
            <ThemedText style={styles.personnelName}>
              {order.deliveryPersonnel.name}
            </ThemedText>
            <View style={styles.rating}>
              <IconSymbol name="star" size={16} color={theme.theme.colors.primary} />
              <ThemedText>{order.deliveryPersonnel.rating}</ThemedText>
            </View>
          </View>
          <TouchableOpacity
            onPress={() => handleCall(order.deliveryPersonnel!.phone)}
            style={styles.callButton}
            testID={`call-button-${order.id}`}
          >
            <IconSymbol name="phone" size={20} color={theme.theme.colors.primary} />
          </TouchableOpacity>
        </View>
      )}

      <OrderTracking
        status={order.status}
        style={styles.tracking}
        testID={`tracking-${order.id}`}
      />
    </ThemedView>
  ), [handleCall, theme.theme.colors.primary]);

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.tabContainer}>
        <HapticTab
          active={selectedTab === 'in_progress'}
          onPress={() => setSelectedTab('in_progress')}
          testID="tab-in-progress"
        >
          <ThemedText>In Progress</ThemedText>
        </HapticTab>
        <HapticTab
          active={selectedTab === 'completed'}
          onPress={() => setSelectedTab('completed')}
          testID="tab-completed"
        >
          <ThemedText>Completed</ThemedText>
        </HapticTab>
        <HapticTab
          active={selectedTab === 'cancelled'}
          onPress={() => setSelectedTab('cancelled')}
          testID="tab-cancelled"
        >
          <ThemedText>Cancelled</ThemedText>
        </HapticTab>
      </View>

      <FlatList
        data={filteredOrders}
        renderItem={renderOrder}
        keyExtractor={order => order.id}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
        contentContainerStyle={styles.listContent}
        testID="orders-list"
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  tabContainer: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#e0e0e0',
  },
  listContent: {
    padding: 16,
  },
  orderCard: {
    padding: 16,
    marginBottom: 16,
    borderRadius: 8,
  },
  orderHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 8,
  },
  orderNumber: {
    fontSize: 16,
    fontWeight: '600',
  },
  orderDate: {
    opacity: 0.7,
  },
  orderDetails: {
    marginBottom: 12,
  },
  totalAmount: {
    fontSize: 18,
    fontWeight: '600',
    marginBottom: 4,
  },
  deliveryTime: {
    opacity: 0.8,
  },
  plasticPickup: {
    marginTop: 12,
    padding: 12,
    backgroundColor: '#f5f5f5',
    borderRadius: 6,
  },
  pickupTitle: {
    fontSize: 16,
    fontWeight: '500',
    marginBottom: 8,
  },
  impact: {
    marginTop: 8,
  },
  personnel: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 16,
    padding: 12,
    backgroundColor: '#f5f5f5',
    borderRadius: 6,
  },
  personnelInfo: {
    flex: 1,
  },
  personnelName: {
    fontSize: 16,
    fontWeight: '500',
    marginBottom: 4,
  },
  rating: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  callButton: {
    padding: 8,
  },
  tracking: {
    marginTop: 16,
  },
}); 