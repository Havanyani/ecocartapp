import {
    DeliveryRouteMap,
    IconSymbol,
    LoadingSpinner,
    RouteOptimizationCard,
    ThemedText,
    ThemedView,
    WeightInput
} from '@/components/ui';
import { useDeliveryRoute } from '@/hooks/useDeliveryRoute';
import { useLocation } from '@/hooks/useLocation';
import { usePlasticCollection } from '@/hooks/usePlasticCollection';
import { useTheme } from '@/theme';
import React, { useCallback, useEffect, useState } from 'react';
import {
    Alert,
    RefreshControl,
    ScrollView,
    StyleSheet,
    TouchableOpacity,
    View
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

interface Pickup {
  id: string;
  customerId: string;
  customerName: string;
  address: string;
  scheduledTime: string;
  status: 'pending' | 'in_progress' | 'completed' | 'cancelled';
  estimatedWeight?: number;
  actualWeight?: number;
  notes?: string;
  orderId: string;
}

interface OptimizedRoute {
  totalDistance: number;
  estimatedTime: number;
  stops: Array<{
    id: string;
    type: 'delivery' | 'pickup';
    address: string;
    scheduledTime: string;
  }>;
}

export function DeliveryPersonnelScreen() {
  const theme = useTheme()()();
  const {
    pickups,
    isLoading,
    error,
    updatePickupStatus,
    submitPickupWeight,
    refreshPickups
  } = usePlasticCollection();
  const { currentRoute, optimizeRoute } = useDeliveryRoute();
  const { getCurrentLocation } = useLocation();
  
  const [selectedPickup, setSelectedPickup] = useState<Pickup | null>(null);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [weight, setWeight] = useState<string>('');

  useEffect(() => {
    if (currentRoute && currentRoute.stops.length > 0) {
      optimizeRoute(currentRoute.stops);
    }
  }, [currentRoute, optimizeRoute]);

  const handleRefresh = useCallback(async () => {
    setIsRefreshing(true);
    try {
      await refreshPickups();
    } finally {
      setIsRefreshing(false);
    }
  }, [refreshPickups]);

  const handleStartPickup = useCallback(async (pickup: Pickup) => {
    try {
      const location = await getCurrentLocation();
      await updatePickupStatus(pickup.id, 'in_progress', location);
      setSelectedPickup(pickup);
    } catch (error) {
      Alert.alert('Error', 'Failed to start pickup. Please try again.');
    }
  }, [getCurrentLocation, updatePickupStatus]);

  const handleSubmitWeight = useCallback(async () => {
    if (!selectedPickup || !weight) return;

    try {
      await submitPickupWeight(selectedPickup.id, parseFloat(weight));
      await updatePickupStatus(selectedPickup.id, 'completed');
      setSelectedPickup(null);
      setWeight('');
      Alert.alert('Success', 'Pickup completed successfully!');
    } catch (error) {
      Alert.alert('Error', 'Failed to submit weight. Please try again.');
    }
  }, [selectedPickup, weight, submitPickupWeight, updatePickupStatus]);

  if (isLoading) {
    return <LoadingSpinner testID="loading-spinner" />;
  }

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView
        style={styles.content}
        refreshControl={
          <RefreshControl refreshing={isRefreshing} onRefresh={handleRefresh} />
        }
      >
        {currentRoute && (
          <RouteOptimizationCard
            route={currentRoute}
            onRefreshRoute={() => optimizeRoute(currentRoute.stops)}
            testID="route-optimization-card"
          />
        )}

        <DeliveryRouteMap
          stops={currentRoute?.stops || []}
          currentPickup={selectedPickup}
          style={styles.map}
          testID="delivery-route-map"
        />

        <ThemedView style={styles.pickupsSection}>
          <ThemedText style={styles.sectionTitle}>Today's Pickups</ThemedText>
          {pickups.map(pickup => (
            <ThemedView key={pickup.id} style={styles.pickupCard}>
              <View style={styles.pickupHeader}>
                <ThemedText style={styles.customerName}>
                  {pickup.customerName}
                </ThemedText>
                <ThemedText style={styles.pickupTime}>
                  {new Date(pickup.scheduledTime).toLocaleTimeString()}
                </ThemedText>
              </View>
              
              <ThemedText style={styles.address}>{pickup.address}</ThemedText>
              
              {pickup.estimatedWeight && (
                <ThemedText style={styles.estimatedWeight}>
                  Est. Weight: {pickup.estimatedWeight}kg
                </ThemedText>
              )}
              
              {pickup.notes && (
                <ThemedText style={styles.notes}>{pickup.notes}</ThemedText>
              )}

              {pickup.status === 'pending' && (
                <TouchableOpacity
                  style={styles.startButton}
                  onPress={() => handleStartPickup(pickup)}
                  accessibilityLabel="Start pickup"
                  testID={`start-pickup-${pickup.id}`}
                >
                  <IconSymbol name="play" size={20} color="#FFFFFF" />
                  <ThemedText style={styles.buttonText}>Start Pickup</ThemedText>
                </TouchableOpacity>
              )}

              {pickup.status === 'in_progress' && (
                <View style={styles.weightInputSection}>
                  <WeightInput
                    value={weight}
                    onChangeText={setWeight}
                    onSubmit={handleSubmitWeight}
                    testID={`weight-input-${pickup.id}`}
                  />
                  <TouchableOpacity
                    style={styles.submitButton}
                    onPress={handleSubmitWeight}
                    disabled={!weight}
                    accessibilityLabel="Submit weight"
                    testID={`submit-weight-${pickup.id}`}
                  >
                    <ThemedText style={styles.buttonText}>Submit</ThemedText>
                  </TouchableOpacity>
                </View>
              )}
            </ThemedView>
          ))}
        </ThemedView>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  content: {
    flex: 1,
  },
  map: {
    height: 300,
    marginBottom: 16,
  },
  pickupsSection: {
    padding: 16,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    marginBottom: 16,
  },
  pickupCard: {
    padding: 16,
    marginBottom: 12,
    borderRadius: 8,
  },
  pickupHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 8,
  },
  customerName: {
    fontSize: 16,
    fontWeight: '500',
  },
  pickupTime: {
    opacity: 0.7,
  },
  address: {
    marginBottom: 8,
  },
  estimatedWeight: {
    fontSize: 14,
    opacity: 0.8,
    marginBottom: 8,
  },
  notes: {
    fontSize: 14,
    opacity: 0.7,
    fontStyle: 'italic',
    marginBottom: 8,
  },
  startButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#4CAF50',
    padding: 12,
    borderRadius: 8,
  },
  weightInputSection: {
    marginTop: 8,
  },
  submitButton: {
    backgroundColor: '#2196F3',
    padding: 12,
    borderRadius: 8,
    alignItems: 'center',
    marginTop: 8,
  },
  buttonText: {
    color: '#FFFFFF',
    fontWeight: '500',
    marginLeft: 8,
  },
}); 