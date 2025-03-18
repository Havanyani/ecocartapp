/**
 * Driver Dashboard Screen
 * 
 * Main interface for delivery personnel to view assigned routes,
 * track collections, and manage their schedule.
 */

import { Button } from '@/components/ui/Button';
import { IconSymbol } from '@/components/ui/IconSymbol';
import { ThemedText } from '@/components/ui/ThemedText';
import { ThemedView } from '@/components/ui/ThemedView';
import { useTheme } from '@/hooks/useTheme';
import { DriverService } from '@/services/DriverService';
import { RouteOptimizationService } from '@/services/RouteOptimizationService';
import { format } from 'date-fns';
import { Stack, useRouter } from 'expo-router';
import React, { useEffect, useState } from 'react';
import { ActivityIndicator, Alert, FlatList, RefreshControl, StyleSheet, TouchableOpacity, View } from 'react-native';

// Collection status enum
export enum CollectionStatus {
  PENDING = 'pending',
  EN_ROUTE = 'en_route',
  ARRIVED = 'arrived',
  COMPLETED = 'completed',
  MISSED = 'missed',
  CANCELLED = 'cancelled'
}

// Collection assignment interface
interface CollectionAssignment {
  id: string;
  userId: string;
  address: string;
  scheduledTime: string;
  materials: string[];
  status: CollectionStatus;
  estimatedWeight: number;
  notes: string;
  latitude: number;
  longitude: number;
  sequence?: number;
}

// Route assignment interface
interface RouteAssignment {
  id: string;
  date: string;
  collections: CollectionAssignment[];
  startTime: string;
  endTime: string;
  status: 'pending' | 'in_progress' | 'completed';
  vehicleId: string;
  totalDistance: number;
  totalDuration: number;
}

export default function DriverDashboard() {
  const router = useRouter();
  const { theme } = useTheme();
  const [isLoading, setIsLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [currentRoute, setCurrentRoute] = useState<RouteAssignment | null>(null);
  const [upcomingRoutes, setUpcomingRoutes] = useState<RouteAssignment[]>([]);
  const [isStartingRoute, setIsStartingRoute] = useState(false);
  const [activeCollections, setActiveCollections] = useState<CollectionAssignment[]>([]);

  useEffect(() => {
    loadDriverData();
  }, []);

  const loadDriverData = async () => {
    try {
      setIsLoading(true);
      
      // Get driver's assigned routes
      const driverService = DriverService.getInstance();
      const routes = await driverService.getAssignedRoutes();
      
      // Separate current/today's route from upcoming routes
      const today = new Date().toISOString().split('T')[0];
      const current = routes.find(route => 
        route.date.startsWith(today) && 
        route.status !== 'completed'
      );
      
      const upcoming = routes.filter(route => 
        route.date > today || 
        (route.date === today && route !== current)
      );
      
      setCurrentRoute(current || null);
      setUpcomingRoutes(upcoming);
      
      // If there's a route in progress, load its active collections
      if (current && current.status === 'in_progress') {
        const activeColls = current.collections.filter(c => 
          c.status !== CollectionStatus.COMPLETED && 
          c.status !== CollectionStatus.CANCELLED
        );
        
        // Sort by sequence number
        activeColls.sort((a, b) => (a.sequence || 0) - (b.sequence || 0));
        setActiveCollections(activeColls);
      } else {
        setActiveCollections([]);
      }
    } catch (error) {
      console.error('Failed to load driver data:', error);
      Alert.alert('Error', 'Failed to load your assigned routes');
    } finally {
      setIsLoading(false);
      setRefreshing(false);
    }
  };

  const onRefresh = () => {
    setRefreshing(true);
    loadDriverData();
  };

  const handleStartRoute = async () => {
    if (!currentRoute) return;
    
    try {
      setIsStartingRoute(true);
      
      // Start the route
      await DriverService.getInstance().startRoute(currentRoute.id);
      
      // Optimize the route sequence
      const optimizedRoute = await RouteOptimizationService.getInstance().optimizeRoute({
        stops: currentRoute.collections.map(c => ({
          id: c.id,
          latitude: c.latitude,
          longitude: c.longitude,
          timeWindow: {
            start: c.scheduledTime ? new Date(c.scheduledTime).toISOString() : undefined,
            end: c.scheduledTime ? new Date(new Date(c.scheduledTime).getTime() + 60 * 60 * 1000).toISOString() : undefined
          }
        })),
        strategy: 'SHORTEST_DISTANCE'
      });
      
      // Navigate to active route screen
      router.push('/driver/active-route');
    } catch (error) {
      console.error('Failed to start route:', error);
      Alert.alert('Error', 'Failed to start your route');
    } finally {
      setIsStartingRoute(false);
    }
  };

  const handleContinueRoute = () => {
    // Navigate to active route screen
    router.push('/driver/active-route');
  };

  const renderCurrentRoute = () => {
    if (!currentRoute) {
      return (
        <ThemedView style={styles.emptyStateContainer}>
          <IconSymbol name="calendar" size={48} color={theme.colors.secondary} />
          <ThemedText style={styles.emptyStateTitle}>No Route Today</ThemedText>
          <ThemedText style={styles.emptyStateText}>
            You don't have any assigned collection routes for today.
          </ThemedText>
        </ThemedView>
      );
    }

    const collections = currentRoute.collections || [];
    const totalCollections = collections.length;
    const completedCollections = collections.filter(c => c.status === CollectionStatus.COMPLETED).length;
    
    return (
      <ThemedView style={styles.currentRouteCard}>
        <View style={styles.routeHeader}>
          <View>
            <ThemedText style={styles.routeTitle}>Today's Route</ThemedText>
            <ThemedText style={styles.routeDate}>
              {format(new Date(currentRoute.date), 'EEEE, MMMM d')}
            </ThemedText>
          </View>
          
          <View style={[
            styles.statusBadge, 
            { backgroundColor: currentRoute.status === 'in_progress' ? '#4CAF50' : '#FF9800' }
          ]}>
            <ThemedText style={styles.statusText}>
              {currentRoute.status === 'in_progress' ? 'In Progress' : 'Not Started'}
            </ThemedText>
          </View>
        </View>
        
        <View style={styles.routeStats}>
          <View style={styles.statItem}>
            <IconSymbol name="map-pin" size={16} color={theme.colors.primary} />
            <ThemedText style={styles.statValue}>{totalCollections}</ThemedText>
            <ThemedText style={styles.statLabel}>Stops</ThemedText>
          </View>
          
          <View style={styles.statDivider} />
          
          <View style={styles.statItem}>
            <IconSymbol name="check-circle" size={16} color={theme.colors.primary} />
            <ThemedText style={styles.statValue}>{completedCollections}</ThemedText>
            <ThemedText style={styles.statLabel}>Completed</ThemedText>
          </View>
          
          <View style={styles.statDivider} />
          
          <View style={styles.statItem}>
            <IconSymbol name="truck" size={16} color={theme.colors.primary} />
            <ThemedText style={styles.statValue}>{Math.round(currentRoute.totalDistance)} km</ThemedText>
            <ThemedText style={styles.statLabel}>Distance</ThemedText>
          </View>
        </View>
        
        <View style={styles.timeInfo}>
          <View style={styles.timeItem}>
            <ThemedText style={styles.timeLabel}>Start Time:</ThemedText>
            <ThemedText style={styles.timeValue}>
              {currentRoute.startTime ? format(new Date(currentRoute.startTime), 'h:mm a') : 'Flexible'}
            </ThemedText>
          </View>
          
          <View style={styles.timeItem}>
            <ThemedText style={styles.timeLabel}>End Time:</ThemedText>
            <ThemedText style={styles.timeValue}>
              {currentRoute.endTime ? format(new Date(currentRoute.endTime), 'h:mm a') : 'Flexible'}
            </ThemedText>
          </View>
        </View>
        
        <Button
          onPress={currentRoute.status === 'in_progress' ? handleContinueRoute : handleStartRoute}
          isLoading={isStartingRoute}
          disabled={isStartingRoute}
          leftIcon={<IconSymbol name={currentRoute.status === 'in_progress' ? "play-circle" : "play"} size={20} color="white" />}
          style={styles.routeActionButton}
        >
          {currentRoute.status === 'in_progress' ? 'Continue Route' : 'Start Route'}
        </Button>
      </ThemedView>
    );
  };

  const renderUpcomingRoute = ({ item }: { item: RouteAssignment }) => {
    const collections = item.collections || [];
    const totalCollections = collections.length;
    
    return (
      <ThemedView style={styles.upcomingRouteCard}>
        <View style={styles.upcomingRouteHeader}>
          <ThemedText style={styles.upcomingRouteDate}>
            {format(new Date(item.date), 'EEE, MMM d')}
          </ThemedText>
          <ThemedText style={styles.upcomingRouteStops}>
            {totalCollections} {totalCollections === 1 ? 'stop' : 'stops'}
          </ThemedText>
        </View>
        
        <View style={styles.upcomingRouteFooter}>
          <View style={styles.upcomingRouteTime}>
            <IconSymbol name="clock" size={14} color={theme.colors.secondary} />
            <ThemedText style={styles.upcomingRouteTimeText}>
              {item.startTime ? format(new Date(item.startTime), 'h:mm a') : 'Flexible'} - 
              {item.endTime ? format(new Date(item.endTime), 'h:mm a') : 'Flexible'}
            </ThemedText>
          </View>
          
          <TouchableOpacity
            style={styles.viewButton}
            onPress={() => router.push(`/driver/route/${item.id}`)}
          >
            <ThemedText style={styles.viewButtonText}>View</ThemedText>
            <IconSymbol name="chevron-right" size={16} color={theme.colors.primary} />
          </TouchableOpacity>
        </View>
      </ThemedView>
    );
  };

  return (
    <>
      <Stack.Screen
        options={{
          title: 'Driver Dashboard',
          headerLargeTitle: true,
        }}
      />
      
      <View style={styles.container}>
        {isLoading && !refreshing ? (
          <View style={styles.loadingContainer}>
            <ActivityIndicator size="large" color={theme.colors.primary} />
            <ThemedText style={styles.loadingText}>Loading your assignments...</ThemedText>
          </View>
        ) : (
          <FlatList
            contentContainerStyle={styles.contentContainer}
            data={upcomingRoutes}
            renderItem={renderUpcomingRoute}
            keyExtractor={item => item.id}
            ListHeaderComponent={
              <>
                <ThemedView style={styles.welcomeCard}>
                  <View>
                    <ThemedText style={styles.welcomeText}>Welcome back,</ThemedText>
                    <ThemedText style={styles.driverName}>Alex Johnson</ThemedText>
                  </View>
                  
                  <View style={styles.driverActions}>
                    <TouchableOpacity 
                      style={styles.iconButton}
                      onPress={() => router.push('/driver/settings')}
                    >
                      <IconSymbol name="settings" size={24} color={theme.colors.primary} />
                    </TouchableOpacity>
                    
                    <TouchableOpacity 
                      style={styles.iconButton}
                      onPress={() => router.push('/driver/notifications')}
                    >
                      <IconSymbol name="bell" size={24} color={theme.colors.primary} />
                    </TouchableOpacity>
                  </View>
                </ThemedView>
                
                <ThemedText style={styles.sectionTitle}>Today's Schedule</ThemedText>
                {renderCurrentRoute()}
                
                {currentRoute && currentRoute.status === 'in_progress' && (
                  <Button
                    onPress={() => router.push('/driver/active-collection')}
                    style={styles.nextCollectionButton}
                    leftIcon={<IconSymbol name="navigation" size={20} color="white" />}
                  >
                    Navigate to Next Collection
                  </Button>
                )}
                
                <View style={styles.statsRow}>
                  <ThemedView style={styles.statsCard}>
                    <IconSymbol name="truck" size={24} color={theme.colors.primary} />
                    <ThemedText style={styles.statsValue}>42</ThemedText>
                    <ThemedText style={styles.statsLabel}>Collections Today</ThemedText>
                  </ThemedView>
                  
                  <ThemedView style={styles.statsCard}>
                    <IconSymbol name="package" size={24} color={theme.colors.primary} />
                    <ThemedText style={styles.statsValue}>127 kg</ThemedText>
                    <ThemedText style={styles.statsLabel}>Collected Today</ThemedText>
                  </ThemedView>
                </View>
                
                <ThemedText style={styles.sectionTitle}>Upcoming Routes</ThemedText>
                {upcomingRoutes.length === 0 && (
                  <ThemedView style={styles.emptyStateContainer}>
                    <ThemedText style={styles.emptyStateText}>
                      No upcoming routes scheduled.
                    </ThemedText>
                  </ThemedView>
                )}
              </>
            }
            refreshControl={
              <RefreshControl
                refreshing={refreshing}
                onRefresh={onRefresh}
                colors={[theme.colors.primary]}
              />
            }
          />
        )}
        
        <View style={styles.fabContainer}>
          <TouchableOpacity 
            style={styles.fabButton}
            onPress={() => router.push('/driver/support')}
          >
            <IconSymbol name="help-circle" size={24} color="white" />
          </TouchableOpacity>
        </View>
      </View>
    </>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  contentContainer: {
    padding: 16,
    paddingBottom: 80,
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
  welcomeCard: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 16,
    borderRadius: 12,
    marginBottom: 20,
  },
  welcomeText: {
    fontSize: 16,
  },
  driverName: {
    fontSize: 24,
    fontWeight: 'bold',
  },
  driverActions: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  iconButton: {
    padding: 8,
    marginLeft: 8,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 12,
  },
  currentRouteCard: {
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 3,
    elevation: 1,
  },
  routeHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  routeTitle: {
    fontSize: 18,
    fontWeight: 'bold',
  },
  routeDate: {
    fontSize: 14,
  },
  statusBadge: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
  },
  statusText: {
    fontSize: 12,
    fontWeight: 'bold',
    color: 'white',
  },
  routeStats: {
    flexDirection: 'row',
    marginBottom: 16,
    paddingBottom: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
  },
  statItem: {
    flex: 1,
    alignItems: 'center',
  },
  statValue: {
    fontSize: 16,
    fontWeight: 'bold',
    marginVertical: 4,
  },
  statLabel: {
    fontSize: 12,
  },
  statDivider: {
    width: 1,
    height: '100%',
    backgroundColor: '#eee',
  },
  timeInfo: {
    marginBottom: 16,
  },
  timeItem: {
    flexDirection: 'row',
    marginBottom: 4,
  },
  timeLabel: {
    fontSize: 14,
    width: 100,
  },
  timeValue: {
    fontSize: 14,
    fontWeight: '500',
  },
  routeActionButton: {
    width: '100%',
  },
  nextCollectionButton: {
    width: '100%',
    marginBottom: 20,
  },
  statsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 20,
  },
  statsCard: {
    flex: 1,
    alignItems: 'center',
    padding: 16,
    borderRadius: 12,
    marginHorizontal: 4,
  },
  statsValue: {
    fontSize: 20,
    fontWeight: 'bold',
    marginVertical: 8,
  },
  statsLabel: {
    fontSize: 12,
  },
  upcomingRouteCard: {
    borderRadius: 12,
    padding: 12,
    marginBottom: 12,
  },
  upcomingRouteHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  upcomingRouteDate: {
    fontSize: 16,
    fontWeight: '600',
  },
  upcomingRouteStops: {
    fontSize: 14,
  },
  upcomingRouteFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  upcomingRouteTime: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  upcomingRouteTimeText: {
    fontSize: 14,
    marginLeft: 4,
  },
  viewButton: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  viewButtonText: {
    fontSize: 14,
    color: '#4385F4',
    marginRight: 4,
  },
  emptyStateContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    padding: 32,
    marginBottom: 20,
  },
  emptyStateTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginTop: 12,
    marginBottom: 8,
  },
  emptyStateText: {
    textAlign: 'center',
    fontSize: 14,
  },
  fabContainer: {
    position: 'absolute',
    bottom: 20,
    right: 20,
  },
  fabButton: {
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: '#4385F4',
    alignItems: 'center',
    justifyContent: 'center',
    elevation: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
  },
}); 