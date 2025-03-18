/**
 * app/routes/optimization-dashboard.tsx
 * 
 * Route optimization dashboard that allows users to configure optimization parameters,
 * view optimized routes, and visualize impact.
 */

import { IconSymbol } from '@/components/ui/IconSymbol';
import { ThemedText } from '@/components/ui/ThemedText';
import { ThemedView } from '@/components/ui/ThemedView';
import { useTheme } from '@/hooks/useTheme';
import RouteOptimizationService, {
    CollectionStop,
    Location,
    OptimizationRequest,
    OptimizationStrategy,
    OptimizedRoute,
    Vehicle
} from '@/services/RouteOptimizationService';
import { useRouter } from 'expo-router';
import React, { useEffect, useState } from 'react';
import {
    ActivityIndicator,
    Alert,
    Dimensions,
    FlatList,
    ScrollView,
    StyleSheet,
    TouchableOpacity,
    View
} from 'react-native';
import Animated, {
    useAnimatedStyle,
    useSharedValue,
    withTiming
} from 'react-native-reanimated';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

// Map component placeholder - in a real app, integrate with MapView from react-native-maps
const MapView = ({ routes, vehicleLocation, onStopPress }: any) => {
  const { theme } = useTheme();
  return (
    <ThemedView style={styles.mapContainer}>
      <ThemedText style={styles.mapPlaceholder}>
        Interactive Route Map
      </ThemedText>
      <ThemedText style={[styles.mapPlaceholderSub, { color: theme.colors.text.secondary }]}>
        {routes?.length} routes - {routes?.reduce((acc: number, route: OptimizedRoute) => acc + route.stops.length, 0)} stops
      </ThemedText>
    </ThemedView>
  );
};

export default function OptimizationDashboardScreen() {
  const router = useRouter();
  const { theme } = useTheme();
  const insets = useSafeAreaInsets();
  const routeService = RouteOptimizationService.getInstance();
  
  // State variables
  const [isLoading, setIsLoading] = useState(false);
  const [isInitializing, setIsInitializing] = useState(true);
  const [optimizedRoutes, setOptimizedRoutes] = useState<OptimizedRoute[]>([]);
  const [selectedStrategy, setSelectedStrategy] = useState<OptimizationStrategy>(OptimizationStrategy.BALANCED);
  const [stops, setStops] = useState<CollectionStop[]>([]);
  const [vehicles, setVehicles] = useState<Vehicle[]>([]);
  const [selectedRouteIndex, setSelectedRouteIndex] = useState<number | null>(null);
  const [showOptions, setShowOptions] = useState(false);
  const [balanceRoutes, setBalanceRoutes] = useState(true);
  const [avoidHighways, setAvoidHighways] = useState(false);
  const [avoidTolls, setAvoidTolls] = useState(true);
  const [considerTraffic, setConsiderTraffic] = useState(true);
  
  // Animation values
  const optionsPanelHeight = useSharedValue(0);
  
  // Effects
  useEffect(() => {
    const initializeData = async () => {
      setIsInitializing(true);
      try {
        // In a real app, these would come from an API or service
        await loadMockData();
      } catch (error) {
        console.error('Failed to initialize optimization data:', error);
        Alert.alert('Error', 'Failed to load optimization data');
      } finally {
        setIsInitializing(false);
      }
    };
    
    initializeData();
  }, []);
  
  // Load mock data for demonstration
  const loadMockData = async () => {
    // Mock collection stops
    const mockStops: CollectionStop[] = Array.from({ length: 15 }, (_, i) => ({
      id: `stop-${i + 1}`,
      location: {
        latitude: 40.7128 + (Math.random() - 0.5) * 0.1,
        longitude: -74.006 + (Math.random() - 0.5) * 0.1,
        address: `${100 + i} Main St, Collection Point ${i + 1}`,
      },
      estimatedWeight: Math.floor(Math.random() * 50) + 10,
      serviceDuration: Math.floor(Math.random() * 15) + 5,
      materialTypes: ['plastic', 'paper', 'glass'].slice(0, Math.floor(Math.random() * 3) + 1),
      priority: Math.floor(Math.random() * 5) + 1,
      userId: `user-${Math.floor(Math.random() * 100) + 1}`,
      timeWindow: Math.random() > 0.3 ? {
        start: new Date(new Date().setHours(8 + Math.floor(Math.random() * 4), 0, 0, 0)).toISOString(),
        end: new Date(new Date().setHours(14 + Math.floor(Math.random() * 6), 0, 0, 0)).toISOString(),
      } : undefined,
    }));
    
    // Mock vehicles
    const mockVehicles: Vehicle[] = Array.from({ length: 3 }, (_, i) => {
      const startLocation: Location = {
        latitude: 40.7128,
        longitude: -74.006,
        address: 'EcoCart Depot',
      };
      
      return {
        id: `vehicle-${i + 1}`,
        name: `EcoTruck ${i + 1}`,
        maxCapacity: 500,
        maxStops: 20,
        averageSpeed: 30 + Math.floor(Math.random() * 20),
        startLocation,
        endLocation: startLocation,
        availabilityWindow: {
          start: new Date(new Date().setHours(8, 0, 0, 0)).toISOString(),
          end: new Date(new Date().setHours(17, 0, 0, 0)).toISOString(),
        },
      };
    });
    
    setStops(mockStops);
    setVehicles(mockVehicles);
  };
  
  // Run optimization algorithm
  const optimizeRoutes = async () => {
    if (isLoading || stops.length === 0 || vehicles.length === 0) return;
    
    setIsLoading(true);
    try {
      const request: OptimizationRequest = {
        stops,
        vehicles,
        strategy: selectedStrategy,
        balanceRoutes,
        avoidHighways,
        avoidTolls,
        considerTraffic,
      };
      
      const routes = await routeService.optimizeRoutes(request);
      setOptimizedRoutes(routes);
      setSelectedRouteIndex(routes.length > 0 ? 0 : null);
    } catch (error) {
      console.error('Route optimization failed:', error);
      Alert.alert('Optimization Failed', 'An error occurred while optimizing routes');
    } finally {
      setIsLoading(false);
    }
  };
  
  // Toggle options panel
  const toggleOptionsPanel = () => {
    setShowOptions(!showOptions);
    optionsPanelHeight.value = withTiming(
      showOptions ? 0 : 310,
      { duration: 300 }
    );
  };
  
  // Animated styles
  const optionsPanelStyle = useAnimatedStyle(() => {
    return {
      height: optionsPanelHeight.value,
      overflow: 'hidden',
    };
  });
  
  // Render strategy option buttons
  const renderStrategyOptions = () => {
    const strategies = [
      { key: OptimizationStrategy.SHORTEST_DISTANCE, label: 'Shortest Distance' },
      { key: OptimizationStrategy.SHORTEST_TIME, label: 'Shortest Time' },
      { key: OptimizationStrategy.BALANCED, label: 'Balanced' },
      { key: OptimizationStrategy.FUEL_EFFICIENT, label: 'Eco-Friendly' },
      { key: OptimizationStrategy.PRIORITY_FIRST, label: 'Priority First' },
      { key: OptimizationStrategy.CAPACITY_OPTIMIZED, label: 'Capacity Optimized' },
    ];
    
    return (
      <ScrollView 
        horizontal 
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.strategyOptionsContainer}
      >
        {strategies.map((strategy) => (
          <TouchableOpacity
            key={strategy.key}
            style={[
              styles.strategyOption,
              selectedStrategy === strategy.key && {
                backgroundColor: theme.colors.primary,
              },
            ]}
            onPress={() => setSelectedStrategy(strategy.key)}
          >
            <ThemedText
              style={[
                styles.strategyOptionText,
                selectedStrategy === strategy.key && {
                  color: '#FFFFFF',
                },
              ]}
            >
              {strategy.label}
            </ThemedText>
          </TouchableOpacity>
        ))}
      </ScrollView>
    );
  };
  
  // Render optimization options
  const renderOptimizationOptions = () => {
    return (
      <Animated.View style={[styles.optionsPanel, optionsPanelStyle]}>
        <ThemedText style={styles.optionsSectionTitle}>Advanced Options</ThemedText>
        
        <View style={styles.optionRow}>
          <ThemedText>Balance routes across vehicles</ThemedText>
          <TouchableOpacity 
            style={[styles.toggleButton, balanceRoutes && styles.toggleButtonActive]} 
            onPress={() => setBalanceRoutes(!balanceRoutes)}
          >
            <ThemedView style={[styles.toggleIndicator, balanceRoutes && styles.toggleIndicatorActive]} />
          </TouchableOpacity>
        </View>
        
        <View style={styles.optionRow}>
          <ThemedText>Avoid highways</ThemedText>
          <TouchableOpacity 
            style={[styles.toggleButton, avoidHighways && styles.toggleButtonActive]} 
            onPress={() => setAvoidHighways(!avoidHighways)}
          >
            <ThemedView style={[styles.toggleIndicator, avoidHighways && styles.toggleIndicatorActive]} />
          </TouchableOpacity>
        </View>
        
        <View style={styles.optionRow}>
          <ThemedText>Avoid toll roads</ThemedText>
          <TouchableOpacity 
            style={[styles.toggleButton, avoidTolls && styles.toggleButtonActive]} 
            onPress={() => setAvoidTolls(!avoidTolls)}
          >
            <ThemedView style={[styles.toggleIndicator, avoidTolls && styles.toggleIndicatorActive]} />
          </TouchableOpacity>
        </View>
        
        <View style={styles.optionRow}>
          <ThemedText>Consider real-time traffic</ThemedText>
          <TouchableOpacity 
            style={[styles.toggleButton, considerTraffic && styles.toggleButtonActive]} 
            onPress={() => setConsiderTraffic(!considerTraffic)}
          >
            <ThemedView style={[styles.toggleIndicator, considerTraffic && styles.toggleIndicatorActive]} />
          </TouchableOpacity>
        </View>
        
        <View style={styles.vehicleSection}>
          <ThemedText style={styles.optionsSectionTitle}>Vehicles ({vehicles.length})</ThemedText>
          <ScrollView horizontal showsHorizontalScrollIndicator={false}>
            {vehicles.map((vehicle, index) => (
              <ThemedView key={vehicle.id} style={styles.vehicleItem}>
                <IconSymbol name="truck" size={24} />
                <ThemedText style={styles.vehicleItemTitle}>{vehicle.name}</ThemedText>
                <ThemedText style={styles.vehicleItemDetail}>Capacity: {vehicle.maxCapacity}kg</ThemedText>
                <ThemedText style={styles.vehicleItemDetail}>Max Stops: {vehicle.maxStops}</ThemedText>
              </ThemedView>
            ))}
          </ScrollView>
        </View>
      </Animated.View>
    );
  };
  
  // Render route details
  const renderRouteDetails = () => {
    if (!optimizedRoutes.length || selectedRouteIndex === null) return null;
    
    const selectedRoute = optimizedRoutes[selectedRouteIndex];
    const vehicle = vehicles.find(v => v.id === selectedRoute.vehicleId);
    
    if (!selectedRoute || !vehicle) return null;
    
    return (
      <ThemedView style={styles.routeDetailsContainer}>
        <View style={styles.routeDetailsHeader}>
          <ThemedText style={styles.routeDetailsTitle}>{vehicle.name} Route</ThemedText>
          <TouchableOpacity 
            style={styles.routeDetailsAction}
            onPress={() => router.push(`/routes/route-details?routeId=${selectedRouteIndex}`)}
          >
            <ThemedText style={styles.routeDetailsActionText}>View Details</ThemedText>
          </TouchableOpacity>
        </View>
        
        <View style={styles.routeDetailStats}>
          <View style={styles.routeDetailStat}>
            <IconSymbol name="map-marker-path" size={20} color={theme.colors.primary} />
            <ThemedText style={styles.routeDetailStatValue}>
              {selectedRoute.statistics.totalDistance.toFixed(1)} km
            </ThemedText>
            <ThemedText style={styles.routeDetailStatLabel}>Distance</ThemedText>
          </View>
          
          <View style={styles.routeDetailStat}>
            <IconSymbol name="clock" size={20} color={theme.colors.primary} />
            <ThemedText style={styles.routeDetailStatValue}>
              {Math.round(selectedRoute.statistics.totalDuration)} min
            </ThemedText>
            <ThemedText style={styles.routeDetailStatLabel}>Duration</ThemedText>
          </View>
          
          <View style={styles.routeDetailStat}>
            <IconSymbol name="weight" size={20} color={theme.colors.primary} />
            <ThemedText style={styles.routeDetailStatValue}>
              {selectedRoute.statistics.totalWeight} kg
            </ThemedText>
            <ThemedText style={styles.routeDetailStatLabel}>Weight</ThemedText>
          </View>
          
          <View style={styles.routeDetailStat}>
            <IconSymbol name="truck-loading" size={20} color={theme.colors.primary} />
            <ThemedText style={styles.routeDetailStatValue}>
              {Math.round(selectedRoute.statistics.capacityUtilization)}%
            </ThemedText>
            <ThemedText style={styles.routeDetailStatLabel}>Utilization</ThemedText>
          </View>
        </View>
        
        <View style={styles.stopsList}>
          <ThemedText style={styles.stopsListTitle}>
            Stops ({selectedRoute.stops.length})
          </ThemedText>
          
          <FlatList
            data={selectedRoute.stops}
            keyExtractor={(item) => item.stopId}
            horizontal
            showsHorizontalScrollIndicator={false}
            renderItem={({ item, index }) => (
              <ThemedView style={styles.stopItem}>
                <View style={styles.stopItemHeader}>
                  <View style={styles.stopNumberBadge}>
                    <ThemedText style={styles.stopNumber}>{index + 1}</ThemedText>
                  </View>
                  <ThemedText style={styles.stopTime}>
                    {new Date(item.arrivalTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                  </ThemedText>
                </View>
                <ThemedText style={styles.stopAddress} numberOfLines={2}>
                  {item.location.address}
                </ThemedText>
                <ThemedText style={styles.stopDuration}>
                  {item.duration} min · {item.distance.toFixed(1)} km
                </ThemedText>
              </ThemedView>
            )}
            contentContainerStyle={styles.stopsListContent}
          />
        </View>
      </ThemedView>
    );
  };
  
  // Route selection tabs
  const renderRouteTabs = () => {
    if (!optimizedRoutes.length) return null;
    
    return (
      <ScrollView 
        horizontal 
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.routeTabsContainer}
      >
        {optimizedRoutes.map((route, index) => {
          const vehicle = vehicles.find(v => v.id === route.vehicleId);
          return (
            <TouchableOpacity
              key={route.vehicleId}
              style={[
                styles.routeTab,
                selectedRouteIndex === index && styles.routeTabActive,
              ]}
              onPress={() => setSelectedRouteIndex(index)}
            >
              <ThemedText 
                style={[
                  styles.routeTabText,
                  selectedRouteIndex === index && styles.routeTabTextActive,
                ]}
              >
                {vehicle?.name || `Route ${index + 1}`}
              </ThemedText>
            </TouchableOpacity>
          );
        })}
      </ScrollView>
    );
  };
  
  // Render environmental impact panel
  const renderEnvironmentalImpact = () => {
    if (!optimizedRoutes.length) return null;
    
    // Calculate totals across all routes
    const totalStats = optimizedRoutes.reduce(
      (acc, route) => {
        return {
          fuelSaved: acc.fuelSaved + route.statistics.fuelUsage * 0.25, // Estimated fuel saved vs non-optimized
          co2Reduced: acc.co2Reduced + route.statistics.co2Emissions * 0.3, // Estimated CO2 reduction
          timeReduced: acc.timeReduced + route.statistics.totalDuration * 0.2, // Estimated time saved
        };
      },
      { fuelSaved: 0, co2Reduced: 0, timeReduced: 0 }
    );
    
    return (
      <ThemedView style={styles.environmentalImpactContainer}>
        <ThemedText style={styles.environmentalImpactTitle}>Environmental Impact</ThemedText>
        
        <View style={styles.environmentalImpactStats}>
          <View style={styles.environmentalImpactStat}>
            <IconSymbol name="leaf" size={28} color={theme.colors.primary} />
            <ThemedText style={styles.environmentalImpactValue}>
              {totalStats.co2Reduced.toFixed(1)} kg
            </ThemedText>
            <ThemedText style={styles.environmentalImpactLabel}>CO₂ Reduced</ThemedText>
          </View>
          
          <View style={styles.environmentalImpactStat}>
            <IconSymbol name="gas-station" size={28} color={theme.colors.primary} />
            <ThemedText style={styles.environmentalImpactValue}>
              {totalStats.fuelSaved.toFixed(1)} L
            </ThemedText>
            <ThemedText style={styles.environmentalImpactLabel}>Fuel Saved</ThemedText>
          </View>
          
          <View style={styles.environmentalImpactStat}>
            <IconSymbol name="clock-fast" size={28} color={theme.colors.primary} />
            <ThemedText style={styles.environmentalImpactValue}>
              {Math.round(totalStats.timeReduced)} min
            </ThemedText>
            <ThemedText style={styles.environmentalImpactLabel}>Time Saved</ThemedText>
          </View>
        </View>
      </ThemedView>
    );
  };
  
  if (isInitializing) {
    return (
      <ThemedView style={styles.loadingContainer}>
        <ActivityIndicator size="large" color={theme.colors.primary} />
        <ThemedText style={styles.loadingText}>Initializing optimization dashboard...</ThemedText>
      </ThemedView>
    );
  }
  
  return (
    <ScrollView 
      style={styles.container}
      contentContainerStyle={{ paddingBottom: insets.bottom + 20 }}
    >
      <View style={styles.header}>
        <ThemedText style={styles.headerTitle}>Route Optimization</ThemedText>
        <TouchableOpacity 
          style={[styles.optionsButton, showOptions && styles.optionsButtonActive]} 
          onPress={toggleOptionsPanel}
        >
          <ThemedText style={[styles.optionsButtonText, showOptions && styles.optionsButtonTextActive]}>
            {showOptions ? 'Hide Options' : 'Show Options'}
          </ThemedText>
          <IconSymbol 
            name={showOptions ? 'chevron-up' : 'chevron-down'} 
            size={20} 
            color={showOptions ? '#FFFFFF' : theme.colors.text.primary} 
          />
        </TouchableOpacity>
      </View>
      
      <ThemedText style={styles.sectionTitle}>Optimization Strategy</ThemedText>
      
      {renderStrategyOptions()}
      {renderOptimizationOptions()}
      
      <View style={styles.actionsContainer}>
        <TouchableOpacity 
          style={[
            styles.optimizeButton, 
            isLoading && styles.optimizeButtonDisabled
          ]} 
          onPress={optimizeRoutes}
          disabled={isLoading}
        >
          {isLoading ? (
            <ActivityIndicator size="small" color="#FFFFFF" />
          ) : (
            <>
              <IconSymbol name="refresh" size={20} color="#FFFFFF" />
              <ThemedText style={styles.optimizeButtonText}>
                {optimizedRoutes.length ? 'Re-Optimize Routes' : 'Optimize Routes'}
              </ThemedText>
            </>
          )}
        </TouchableOpacity>
      </View>
      
      {optimizedRoutes.length > 0 && (
        <>
          <MapView 
            routes={optimizedRoutes} 
            vehicleLocation={null} 
            onStopPress={(stopId: string) => console.log('Stop pressed:', stopId)}
          />
          
          {renderRouteTabs()}
          {renderRouteDetails()}
          {renderEnvironmentalImpact()}
        </>
      )}
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
    padding: 16,
  },
  loadingText: {
    marginTop: 16,
    fontSize: 16,
    textAlign: 'center',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: 'bold',
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    marginBottom: 12,
  },
  strategyOptionsContainer: {
    paddingVertical: 8,
  },
  strategyOption: {
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderRadius: 20,
    marginRight: 12,
    backgroundColor: '#F0F0F0',
  },
  strategyOptionText: {
    fontSize: 14,
    fontWeight: '500',
  },
  optionsButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 6,
    paddingHorizontal: 12,
    borderRadius: 16,
    backgroundColor: '#F0F0F0',
  },
  optionsButtonActive: {
    backgroundColor: '#007AFF',
  },
  optionsButtonText: {
    marginRight: 4,
    fontSize: 14,
    fontWeight: '500',
  },
  optionsButtonTextActive: {
    color: '#FFFFFF',
  },
  optionsPanel: {
    marginTop: 8,
    marginBottom: 16,
    borderRadius: 8,
    padding: 16,
    backgroundColor: '#F8F8F8',
  },
  optionsSectionTitle: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 12,
  },
  optionRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  toggleButton: {
    width: 50,
    height: 30,
    borderRadius: 15,
    backgroundColor: '#E0E0E0',
    justifyContent: 'center',
    padding: 2,
  },
  toggleButtonActive: {
    backgroundColor: theme.colors.primary,
  },
  toggleIndicator: {
    width: 26,
    height: 26,
    borderRadius: 13,
    backgroundColor: '#FFFFFF',
  },
  toggleIndicatorActive: {
    alignSelf: 'flex-end',
  },
  vehicleSection: {
    marginTop: 16,
  },
  vehicleItem: {
    width: 140,
    height: 120,
    padding: 12,
    marginRight: 10,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
  },
  vehicleItemTitle: {
    fontSize: 16,
    fontWeight: '600',
    marginTop: 8,
    textAlign: 'center',
  },
  vehicleItemDetail: {
    fontSize: 12,
    marginTop: 4,
    textAlign: 'center',
  },
  actionsContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    marginBottom: 24,
  },
  optimizeButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: theme.colors.primary,
    paddingVertical: 12,
    paddingHorizontal: 24,
    borderRadius: 8,
    width: '100%',
  },
  optimizeButtonDisabled: {
    opacity: 0.7,
  },
  optimizeButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
    marginLeft: 8,
  },
  mapContainer: {
    height: 200,
    borderRadius: 12,
    marginBottom: 16,
    justifyContent: 'center',
    alignItems: 'center',
    overflow: 'hidden',
  },
  mapPlaceholder: {
    fontSize: 18,
    fontWeight: '600',
  },
  mapPlaceholderSub: {
    fontSize: 14,
    marginTop: 8,
  },
  routeTabsContainer: {
    paddingVertical: 8,
  },
  routeTab: {
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderRadius: 8,
    marginRight: 12,
    backgroundColor: '#F0F0F0',
  },
  routeTabActive: {
    backgroundColor: theme.colors.primary,
  },
  routeTabText: {
    fontSize: 14,
    fontWeight: '500',
  },
  routeTabTextActive: {
    color: '#FFFFFF',
  },
  routeDetailsContainer: {
    padding: 16,
    borderRadius: 12,
    marginBottom: 24,
  },
  routeDetailsHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  routeDetailsTitle: {
    fontSize: 18,
    fontWeight: '600',
  },
  routeDetailsAction: {
    padding: 6,
  },
  routeDetailsActionText: {
    fontSize: 14,
    color: theme.colors.primary,
    fontWeight: '500',
  },
  routeDetailStats: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginBottom: 16,
  },
  routeDetailStat: {
    width: '25%',
    alignItems: 'center',
    marginBottom: 10,
  },
  routeDetailStatValue: {
    fontSize: 16,
    fontWeight: '600',
    marginTop: 4,
  },
  routeDetailStatLabel: {
    fontSize: 12,
    marginTop: 2,
  },
  stopsList: {
    marginTop: 8,
  },
  stopsListTitle: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 12,
  },
  stopsListContent: {
    paddingVertical: 8,
  },
  stopItem: {
    width: 170,
    padding: 12,
    marginRight: 12,
    borderRadius: 8,
  },
  stopItemHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 8,
  },
  stopNumberBadge: {
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: theme.colors.primary,
    justifyContent: 'center',
    alignItems: 'center',
  },
  stopNumber: {
    color: '#FFFFFF',
    fontSize: 12,
    fontWeight: '600',
  },
  stopTime: {
    fontSize: 14,
    fontWeight: '500',
  },
  stopAddress: {
    fontSize: 14,
    marginBottom: 8,
  },
  stopDuration: {
    fontSize: 12,
  },
  environmentalImpactContainer: {
    padding: 16,
    borderRadius: 12,
    marginBottom: 24,
  },
  environmentalImpactTitle: {
    fontSize: 18,
    fontWeight: '600',
    marginBottom: 16,
    textAlign: 'center',
  },
  environmentalImpactStats: {
    flexDirection: 'row',
    justifyContent: 'space-around',
  },
  environmentalImpactStat: {
    alignItems: 'center',
  },
  environmentalImpactValue: {
    fontSize: 18,
    fontWeight: '700',
    marginTop: 8,
  },
  environmentalImpactLabel: {
    fontSize: 12,
    marginTop: 4,
  },
}); 