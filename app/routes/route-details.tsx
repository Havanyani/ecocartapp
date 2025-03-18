/**
 * app/routes/route-details.tsx
 * 
 * Detailed view of a specific route showing stops, statistics, and environmental impact
 */

import { IconSymbol } from '@/components/ui/IconSymbol';
import { ThemedText } from '@/components/ui/ThemedText';
import { ThemedView } from '@/components/ui/ThemedView';
import { useTheme } from '@/hooks/useTheme';
import {
    OptimizedRoute,
    Vehicle
} from '@/services/RouteOptimizationService';
import { useLocalSearchParams, useRouter } from 'expo-router';
import React, { useEffect, useState } from 'react';
import {
    ActivityIndicator,
    Dimensions,
    ScrollView,
    StyleSheet,
    View
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

// Map component placeholder - in a real app, integrate with MapView from react-native-maps
const MapView = ({ route }: { route: OptimizedRoute }) => {
  const { theme } = useTheme();
  return (
    <ThemedView style={styles.mapContainer}>
      <ThemedText style={styles.mapPlaceholder}>
        Interactive Route Map
      </ThemedText>
      <ThemedText style={[styles.mapPlaceholderSub, { color: theme.colors.text.secondary }]}>
        {route.stops.length} stops - {route.statistics.totalDistance.toFixed(1)} km
      </ThemedText>
    </ThemedView>
  );
};

export default function RouteDetailsScreen() {
  const params = useLocalSearchParams();
  const router = useRouter();
  const { theme } = useTheme();
  const insets = useSafeAreaInsets();
  const routeId = typeof params.routeId === 'string' ? parseInt(params.routeId, 10) : 0;
  
  const [isLoading, setIsLoading] = useState(true);
  const [route, setRoute] = useState<OptimizedRoute | null>(null);
  const [vehicle, setVehicle] = useState<Vehicle | null>(null);

  // In a real app, fetch this data from a service
  useEffect(() => {
    const loadRouteDetails = async () => {
      setIsLoading(true);
      try {
        // Simulate fetching data
        await new Promise(resolve => setTimeout(resolve, 1000));
        
        // Mock route data
        const mockRoute: OptimizedRoute = {
          vehicleId: 'vehicle-1',
          stops: Array.from({ length: 8 }, (_, i) => ({
            stopId: `stop-${i+1}`,
            location: {
              latitude: 40.7128 + (Math.random() - 0.5) * 0.1,
              longitude: -74.006 + (Math.random() - 0.5) * 0.1,
              address: `${100 + i} Main St, Collection Point ${i + 1}`,
            },
            arrivalTime: new Date(new Date().setHours(8 + Math.floor(i/2), i % 2 === 0 ? 0 : 30, 0, 0)).toISOString(),
            departureTime: new Date(new Date().setHours(8 + Math.floor(i/2), i % 2 === 0 ? 15 : 45, 0, 0)).toISOString(),
            weight: Math.floor(Math.random() * 50) + 10,
            sequence: i + 1,
            distance: Math.random() * 3 + 0.5,
            duration: Math.floor(Math.random() * 15) + 5,
          })),
          statistics: {
            totalDistance: 18.5,
            totalDuration: 145,
            totalWeight: 320,
            capacityUtilization: 64,
            startTime: new Date(new Date().setHours(8, 0, 0, 0)).toISOString(),
            endTime: new Date(new Date().setHours(12, 25, 0, 0)).toISOString(),
            fuelUsage: 2.8,
            co2Emissions: 6.5,
          },
          polyline: 'mock_polyline',
        };
        
        // Mock vehicle data
        const mockVehicle: Vehicle = {
          id: 'vehicle-1',
          name: 'EcoTruck 1',
          maxCapacity: 500,
          maxStops: 20,
          averageSpeed: 45,
          startLocation: {
            latitude: 40.7128,
            longitude: -74.006,
            address: 'EcoCart Depot',
          },
          endLocation: {
            latitude: 40.7128,
            longitude: -74.006,
            address: 'EcoCart Depot',
          },
          availabilityWindow: {
            start: new Date(new Date().setHours(8, 0, 0, 0)).toISOString(),
            end: new Date(new Date().setHours(17, 0, 0, 0)).toISOString(),
          },
        };
        
        setRoute(mockRoute);
        setVehicle(mockVehicle);
      } catch (error) {
        console.error('Error loading route details:', error);
      } finally {
        setIsLoading(false);
      }
    };
    
    loadRouteDetails();
  }, [routeId]);
  
  if (isLoading) {
    return (
      <ThemedView style={styles.loadingContainer}>
        <ActivityIndicator size="large" color={theme.colors.primary} />
        <ThemedText style={styles.loadingText}>Loading route details...</ThemedText>
      </ThemedView>
    );
  }
  
  if (!route || !vehicle) {
    return (
      <ThemedView style={styles.loadingContainer}>
        <IconSymbol name="alert-circle" size={48} color={theme.colors.secondary} />
        <ThemedText style={styles.errorText}>Route not found</ThemedText>
      </ThemedView>
    );
  }
  
  // Format time range
  const formatTimeRange = () => {
    const startTime = new Date(route.statistics.startTime);
    const endTime = new Date(route.statistics.endTime);
    return `${startTime.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })} - ${endTime.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}`;
  };

  return (
    <ScrollView 
      style={styles.container}
      contentContainerStyle={{ paddingBottom: insets.bottom + 20 }}
    >
      <View style={styles.header}>
        <View>
          <ThemedText style={styles.vehicleName}>{vehicle.name}</ThemedText>
          <ThemedText style={styles.routeTime}>{formatTimeRange()}</ThemedText>
        </View>
      </View>
      
      <MapView route={route} />
      
      <ThemedView style={styles.statsContainer}>
        <ThemedText style={styles.sectionTitle}>Route Statistics</ThemedText>
        
        <View style={styles.statsGrid}>
          <View style={styles.statItem}>
            <IconSymbol name="map-marker-path" size={24} color={theme.colors.primary} />
            <ThemedText style={styles.statValue}>{route.statistics.totalDistance.toFixed(1)} km</ThemedText>
            <ThemedText style={styles.statLabel}>Total Distance</ThemedText>
          </View>
          
          <View style={styles.statItem}>
            <IconSymbol name="clock" size={24} color={theme.colors.primary} />
            <ThemedText style={styles.statValue}>{Math.round(route.statistics.totalDuration)} min</ThemedText>
            <ThemedText style={styles.statLabel}>Total Duration</ThemedText>
          </View>
          
          <View style={styles.statItem}>
            <IconSymbol name="weight" size={24} color={theme.colors.primary} />
            <ThemedText style={styles.statValue}>{route.statistics.totalWeight} kg</ThemedText>
            <ThemedText style={styles.statLabel}>Total Weight</ThemedText>
          </View>
          
          <View style={styles.statItem}>
            <IconSymbol name="truck-loading" size={24} color={theme.colors.primary} />
            <ThemedText style={styles.statValue}>{Math.round(route.statistics.capacityUtilization)}%</ThemedText>
            <ThemedText style={styles.statLabel}>Capacity Utilization</ThemedText>
          </View>
        </View>
      </ThemedView>
      
      <ThemedView style={styles.environmentalImpactContainer}>
        <ThemedText style={styles.sectionTitle}>Environmental Impact</ThemedText>
        
        <View style={styles.impactStats}>
          <View style={styles.impactItem}>
            <IconSymbol name="gas-station" size={24} color={theme.colors.primary} />
            <ThemedText style={styles.impactValue}>{route.statistics.fuelUsage.toFixed(1)} L</ThemedText>
            <ThemedText style={styles.impactLabel}>Fuel Consumption</ThemedText>
          </View>
          
          <View style={styles.impactItem}>
            <IconSymbol name="leaf" size={24} color={theme.colors.primary} />
            <ThemedText style={styles.impactValue}>{route.statistics.co2Emissions.toFixed(1)} kg</ThemedText>
            <ThemedText style={styles.impactLabel}>CO₂ Emissions</ThemedText>
          </View>
          
          <View style={styles.impactItem}>
            <IconSymbol name="flask-outline" size={24} color={theme.colors.primary} />
            <ThemedText style={styles.impactValue}>{(route.statistics.co2Emissions * 0.3).toFixed(1)} kg</ThemedText>
            <ThemedText style={styles.impactLabel}>CO₂ Saved</ThemedText>
          </View>
        </View>
      </ThemedView>
      
      <ThemedView style={styles.stopsContainer}>
        <ThemedText style={styles.sectionTitle}>Collection Stops ({route.stops.length})</ThemedText>
        
        {route.stops.map((stop, index) => (
          <ThemedView key={stop.stopId} style={styles.stopItem}>
            <View style={styles.stopHeader}>
              <View style={styles.stopNumberContainer}>
                <ThemedText style={styles.stopNumber}>{index + 1}</ThemedText>
              </View>
              <View style={styles.stopTimeContainer}>
                <ThemedText style={styles.stopTime}>
                  {new Date(stop.arrivalTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                </ThemedText>
              </View>
            </View>
            
            <ThemedText style={styles.stopAddress}>{stop.location.address}</ThemedText>
            
            <View style={styles.stopDetails}>
              <ThemedText style={styles.stopDetail}>
                <IconSymbol name="timer-outline" size={14} color={theme.colors.text.secondary} /> {stop.duration} min
              </ThemedText>
              <ThemedText style={styles.stopDetail}>
                <IconSymbol name="weight" size={14} color={theme.colors.text.secondary} /> {stop.weight} kg
              </ThemedText>
              <ThemedText style={styles.stopDetail}>
                <IconSymbol name="arrow-right" size={14} color={theme.colors.text.secondary} /> {stop.distance.toFixed(1)} km
              </ThemedText>
            </View>
          </ThemedView>
        ))}
      </ThemedView>
    </ScrollView>
  );
}

const { width } = Dimensions.get('window');

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 16,
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
  errorText: {
    marginTop: 16,
    fontSize: 18,
    fontWeight: '500',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
  },
  vehicleName: {
    fontSize: 24,
    fontWeight: 'bold',
  },
  routeTime: {
    fontSize: 16,
    opacity: 0.7,
    marginTop: 4,
  },
  mapContainer: {
    height: 200,
    borderRadius: 12,
    marginBottom: 20,
    justifyContent: 'center',
    alignItems: 'center',
  },
  mapPlaceholder: {
    fontSize: 18,
    fontWeight: '600',
  },
  mapPlaceholderSub: {
    fontSize: 14,
    marginTop: 8,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    marginBottom: 16,
  },
  statsContainer: {
    padding: 16,
    borderRadius: 12,
    marginBottom: 20,
  },
  statsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  statItem: {
    width: '48%',
    padding: 12,
    marginBottom: 16,
    alignItems: 'center',
  },
  statValue: {
    fontSize: 20,
    fontWeight: '700',
    marginTop: 8,
    marginBottom: 4,
  },
  statLabel: {
    fontSize: 14,
    textAlign: 'center',
    opacity: 0.7,
  },
  environmentalImpactContainer: {
    padding: 16,
    borderRadius: 12,
    marginBottom: 20,
  },
  impactStats: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  impactItem: {
    width: '32%',
    alignItems: 'center',
    padding: 8,
  },
  impactValue: {
    fontSize: 18,
    fontWeight: '700',
    marginTop: 8,
    marginBottom: 4,
  },
  impactLabel: {
    fontSize: 12,
    textAlign: 'center',
    opacity: 0.7,
  },
  stopsContainer: {
    padding: 16,
    borderRadius: 12,
    marginBottom: 20,
  },
  stopItem: {
    padding: 16,
    borderRadius: 8,
    marginBottom: 12,
  },
  stopHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  stopNumberContainer: {
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: '#007AFF',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  stopNumber: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: 'bold',
  },
  stopTimeContainer: {
    flex: 1,
  },
  stopTime: {
    fontSize: 16,
    fontWeight: '500',
  },
  stopAddress: {
    fontSize: 16,
    marginBottom: 8,
    paddingLeft: 40,
  },
  stopDetails: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingLeft: 40,
  },
  stopDetail: {
    fontSize: 14,
    opacity: 0.7,
  },
}); 