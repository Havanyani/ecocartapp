import { HapticTab } from '@/components/ui/HapticTab';
import { IconSymbol } from '@/components/ui/IconSymbol';
import { ThemedText } from '@/components/ui/ThemedText';
import { ThemedView } from '@/components/ui/ThemedView';
import { Order, OrderItem } from '@/services/OrderService';
import React from 'react';
import { StyleSheet, View, ViewStyle } from 'react-native';

interface OrderTrackingProps {
  order?: Order;
  onStatusUpdate?: (itemId: string) => void;
  onTrackDelivery?: () => void;
  onViewLiveShopping?: () => void;
  status: Order['status'];
  style?: ViewStyle;
  testID?: string;
}

export function OrderTracking({
  order,
  onStatusUpdate,
  onTrackDelivery,
  onViewLiveShopping,
  status,
  style,
  testID,
}: OrderTrackingProps) {
  const getStatusColor = (status: OrderItem['status']) => {
    switch (status) {
      case 'pending': return '#ffa000';
      case 'processing': return '#1976d2';
      case 'shipped': return '#2e7d32';
      case 'delivered': return '#388e3c';
      default: return '#666';
    }
  };

  const getStatusIcon = () => {
    switch (status) {
      case 'pending':
        return 'clock-outline';
      case 'processing':
        return 'package-variant';
      case 'shipped':
        return 'truck-delivery';
      case 'delivered':
        return 'check-circle';
      case 'cancelled':
        return 'close-circle';
      default:
        return 'help-circle';
    }
  };

  return (
    <ThemedView style={[styles.container, style]} testID={testID}>
      <View style={styles.header}>
        <IconSymbol name={getStatusIcon()} size={24} color="#666" />
        <ThemedText style={styles.title}>Order Status</ThemedText>
      </View>

      {order?.estimatedDelivery && (
        <ThemedText style={styles.estimatedDelivery}>
          Estimated Delivery: {order.estimatedDelivery}
        </ThemedText>
      )}
      
      <View style={styles.trackingButtons}>
        {onViewLiveShopping && (
          <HapticTab
            style={styles.trackingButton}
            onPress={onViewLiveShopping}
          >
            <IconSymbol name="cart" size={20} color="#2e7d32" />
            <ThemedText style={styles.buttonText}>Live Shopping</ThemedText>
          </HapticTab>
        )}

        {onTrackDelivery && order?.trackingNumber && (
          <HapticTab
            style={styles.trackingButton}
            onPress={onTrackDelivery}
          >
            <IconSymbol name="map-marker" size={20} color="#2e7d32" />
            <ThemedText style={styles.buttonText}>Track Delivery</ThemedText>
          </HapticTab>
        )}
      </View>

      {order && (
        <View style={styles.itemsList}>
          {order.items.map(item => (
            <ThemedView key={item.id} style={styles.itemContainer}>
              <View style={styles.itemHeader}>
                <ThemedText style={styles.itemName}>{item.name}</ThemedText>
                <View style={[styles.statusBadge, { backgroundColor: getStatusColor(item.status) + '20' }]}>
                  <IconSymbol
                    name={getStatusIcon()}
                    size={16}
                    color={getStatusColor(item.status)}
                  />
                  <ThemedText style={[styles.statusText, { color: getStatusColor(item.status) }]}>
                    {item.status.charAt(0).toUpperCase() + item.status.slice(1)}
                  </ThemedText>
                </View>
              </View>
              
              <View style={styles.itemDetails}>
                <ThemedText style={styles.itemInfo}>
                  Quantity: {item.quantity} • ${item.price.toFixed(2)}
                </ThemedText>
                {onStatusUpdate && (
                  <HapticTab
                    style={styles.updateButton}
                    onPress={() => onStatusUpdate(item.id)}
                  >
                    <IconSymbol name="refresh" size={20} color="#2e7d32" />
                  </HapticTab>
                )}
              </View>
            </ThemedView>
          ))}
        </View>
      )}
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  container: {
    padding: 16,
    backgroundColor: '#fff',
    borderRadius: 8,
    margin: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 12,
  },
  title: {
    fontSize: 20,
    fontWeight: 'bold',
  },
  estimatedDelivery: {
    fontSize: 14,
    color: '#666',
    marginBottom: 16,
  },
  trackingButtons: {
    flexDirection: 'row',
    gap: 8,
    marginBottom: 16,
  },
  trackingButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    padding: 12,
    backgroundColor: '#f5f5f5',
    borderRadius: 8,
    justifyContent: 'center',
  },
  buttonText: {
    fontSize: 14,
    fontWeight: '600',
  },
  itemsList: {
    gap: 12,
  },
  itemContainer: {
    padding: 12,
    backgroundColor: '#f5f5f5',
    borderRadius: 8,
  },
  itemHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  itemName: {
    fontSize: 16,
    fontWeight: 'bold',
  },
  statusBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 4,
  },
  statusText: {
    fontSize: 12,
    fontWeight: '600',
  },
  itemDetails: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  itemInfo: {
    fontSize: 14,
    color: '#666',
  },
  updateButton: {
    padding: 8,
    borderRadius: 8,
  },
}); 