import { ErrorView } from '@/components/ErrorView';
import { OrderTracking } from '@/components/OrderTracking';
import { LoadingState } from '@/components/ui/LoadingState';
import { ThemedText } from '@/components/ui/ThemedText';
import { ThemedView } from '@/components/ui/ThemedView';
import { Order } from '@/services/OrderService';
import { useAppDispatch, useAppSelector } from '@/store';
import { cancelOrder, fetchOrders, updateOrderStatus } from '@/store/slices/orderSlice';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import React, { useEffect } from 'react';
import { RefreshControl, ScrollView, StyleSheet } from 'react-native';

type RootStackParamList = {
  DeliveryTracking: { orderId: string };
  LiveShopping: { orderId: string };
};

type OrderTrackingScreenNavigationProp = NativeStackNavigationProp<RootStackParamList>;

export function OrderTrackingScreen() {
  const dispatch = useAppDispatch();
  const navigation = useNavigation<OrderTrackingScreenNavigationProp>();
  const { orders, loading, error } = useAppSelector((state) => state.orders);

  useEffect(() => {
    loadOrders();
  }, []);

  const loadOrders = async () => {
    try {
      await dispatch(fetchOrders());
    } catch (error) {
      console.error('Error loading orders:', error);
    }
  };

  const handleStatusUpdate = async (orderId: string, itemId: string) => {
    try {
      const order = orders.find(o => o.id === orderId);
      if (!order) return;

      const item = order.items.find(i => i.id === itemId);
      if (!item) return;

      const nextStatus = getNextStatus(item.status);
      await dispatch(updateOrderStatus({ orderId, itemId, status: nextStatus }));
    } catch (error) {
      console.error('Error updating order status:', error);
    }
  };

  const handleCancelOrder = async (orderId: string) => {
    try {
      await dispatch(cancelOrder(orderId));
    } catch (error) {
      console.error('Error cancelling order:', error);
    }
  };

  const handleTrackDelivery = (orderId: string) => {
    navigation.navigate('DeliveryTracking', { orderId });
  };

  const handleViewLiveShopping = (orderId: string) => {
    navigation.navigate('LiveShopping', { orderId });
  };

  const getNextStatus = (currentStatus: Order['items'][0]['status']): Order['items'][0]['status'] => {
    switch (currentStatus) {
      case 'pending':
        return 'processing';
      case 'processing':
        return 'shipped';
      case 'shipped':
        return 'delivered';
      default:
        return currentStatus;
    }
  };

  if (loading) {
    return <LoadingState />;
  }

  if (error) {
    return <ErrorView message={error} onRetry={loadOrders} />;
  }

  return (
    <ThemedView style={styles.container}>
      <ScrollView
        refreshControl={
          <RefreshControl refreshing={loading} onRefresh={loadOrders} />
        }
      >
        {orders.length === 0 ? (
          <ThemedView style={styles.emptyState}>
            <ThemedText style={styles.emptyStateText}>
              No orders found. Start shopping to create your first order!
            </ThemedText>
          </ThemedView>
        ) : (
          orders.map(order => (
            <OrderTracking
              key={order.id}
              order={order}
              status={order.status}
              onStatusUpdate={(itemId) => handleStatusUpdate(order.id, itemId)}
              onTrackDelivery={() => handleTrackDelivery(order.id)}
              onViewLiveShopping={() => handleViewLiveShopping(order.id)}
            />
          ))
        )}
      </ScrollView>
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  emptyState: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  emptyStateText: {
    fontSize: 16,
    textAlign: 'center',
    color: '#666',
  },
}); 