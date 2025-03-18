import { ErrorView } from '@/components/ErrorView';
import { IconSymbol } from '@/components/ui/IconSymbol';
import { LoadingState } from '@/components/ui/LoadingState';
import { ThemedText } from '@/components/ui/ThemedText';
import { ThemedView } from '@/components/ui/ThemedView';
import { Order, orderService } from '@/services/OrderService';
import { RouteProp, useRoute } from '@react-navigation/native';
import React, { useEffect, useState } from 'react';
import { StyleSheet, View } from 'react-native';

type RootStackParamList = {
  DeliveryTracking: { orderId: string };
};

type DeliveryTrackingScreenRouteProp = RouteProp<RootStackParamList, 'DeliveryTracking'>;

interface TrackingInfo {
  status: string;
  location: string;
  estimatedDelivery: string;
}

export function DeliveryTrackingScreen() {
  const route = useRoute<DeliveryTrackingScreenRouteProp>();
  const [order, setOrder] = useState<Order | null>(null);
  const [trackingInfo, setTrackingInfo] = useState<TrackingInfo | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    loadOrderAndTrackingInfo();
  }, []);

  const loadOrderAndTrackingInfo = async () => {
    try {
      setLoading(true);
      setError(null);

      // Load order details
      const orderData = await orderService.getOrderById(route.params.orderId);
      setOrder(orderData);

      // Load tracking information
      const trackingData = await orderService.getOrderTracking(route.params.orderId);
      setTrackingInfo(trackingData);
    } catch (error) {
      console.error('Error loading delivery tracking:', error);
      setError('Failed to load delivery tracking information');
    } finally {
      setLoading(false);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status.toLowerCase()) {
      case 'in transit':
        return '#1976d2';
      case 'out for delivery':
        return '#2e7d32';
      case 'delivered':
        return '#388e3c';
      case 'delayed':
        return '#f44336';
      default:
        return '#666';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status.toLowerCase()) {
      case 'in transit':
        return 'truck-delivery';
      case 'out for delivery':
        return 'package-variant';
      case 'delivered':
        return 'check-circle';
      case 'delayed':
        return 'alert-circle';
      default:
        return 'help-circle';
    }
  };

  if (loading) {
    return <LoadingState message="Loading delivery tracking..." />;
  }

  if (error) {
    return <ErrorView message={error} onRetry={loadOrderAndTrackingInfo} />;
  }

  if (!order || !trackingInfo) {
    return (
      <ThemedView style={styles.container}>
        <ThemedText style={styles.errorText}>
          No tracking information available
        </ThemedText>
      </ThemedView>
    );
  }

  return (
    <ThemedView style={styles.container}>
      <View style={styles.header}>
        <IconSymbol
          name={getStatusIcon(trackingInfo.status)}
          size={48}
          color={getStatusColor(trackingInfo.status)}
        />
        <ThemedText style={styles.statusText}>
          {trackingInfo.status}
        </ThemedText>
      </View>

      <View style={styles.infoContainer}>
        <View style={styles.infoRow}>
          <IconSymbol name="map-marker" size={24} color="#666" />
          <ThemedText style={styles.infoText}>
            {trackingInfo.location}
          </ThemedText>
        </View>

        <View style={styles.infoRow}>
          <IconSymbol name="clock-outline" size={24} color="#666" />
          <ThemedText style={styles.infoText}>
            Estimated Delivery: {trackingInfo.estimatedDelivery}
          </ThemedText>
        </View>
      </View>

      <View style={styles.orderInfo}>
        <ThemedText style={styles.orderTitle}>Order Details</ThemedText>
        <ThemedText style={styles.orderNumber}>
          Order #{order.id.slice(-6).toUpperCase()}
        </ThemedText>
        <ThemedText style={styles.orderDate}>
          Placed on {new Date(order.createdAt).toLocaleDateString()}
        </ThemedText>
      </View>
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 16,
  },
  header: {
    alignItems: 'center',
    marginBottom: 32,
  },
  statusText: {
    fontSize: 24,
    fontWeight: 'bold',
    marginTop: 16,
  },
  infoContainer: {
    backgroundColor: '#f5f5f5',
    borderRadius: 8,
    padding: 16,
    marginBottom: 32,
  },
  infoRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    marginBottom: 12,
  },
  infoText: {
    fontSize: 16,
    color: '#666',
  },
  orderInfo: {
    backgroundColor: '#f5f5f5',
    borderRadius: 8,
    padding: 16,
  },
  orderTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 8,
  },
  orderNumber: {
    fontSize: 16,
    color: '#666',
    marginBottom: 4,
  },
  orderDate: {
    fontSize: 14,
    color: '#666',
  },
  errorText: {
    fontSize: 16,
    textAlign: 'center',
    color: '#666',
  },
}); 