/**
 * Active Route Screen
 * 
 * Real-time map display and navigation for delivery personnel
 * to view their route, track progress, and manage collection stops.
 */

import { Button } from '@/components/ui/Button';
import { IconSymbol } from '@/components/ui/IconSymbol';
import { ThemedText } from '@/components/ui/ThemedText';
import { ThemedView } from '@/components/ui/ThemedView';
import { useTheme } from '@/hooks/useTheme';
import { DriverService } from '@/services/DriverService';
import { LocationService } from '@/services/LocationService';
import { format } from 'date-fns';
import * as Linking from 'expo-linking';
import * as Location from 'expo-location';
import { Stack, useRouter } from 'expo-router';
import React, { useEffect, useRef, useState } from 'react';
import { ActivityIndicator, Alert, Dimensions, StyleSheet, TouchableOpacity, View } from 'react-native';
import MapView, { Marker, Polyline, PROVIDER_GOOGLE } from 'react-native-maps';
import { CollectionStatus } from './index';

// Constant for map padding
const MAP_PADDING = { top: 100, bottom: 300, left: 50, right: 50 };

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

export default function ActiveRouteScreen() {
  const router = useRouter();
  const { theme } = useTheme();
  const mapRef = useRef<MapView | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [currentRoute, setCurrentRoute] = useState<RouteAssignment | null>(null);
  const [activeCollections, setActiveCollections] = useState<CollectionAssignment[]>([]);
  const [currentLocation, setCurrentLocation] = useState<Location.LocationObject | null>(null);
  const [selectedCollection, setSelectedCollection] = useState<CollectionAssignment | null>(null);
  const [locationListenerId, setLocationListenerId] = useState<string | null>(null);
  const [routeCoordinates, setRouteCoordinates] = useState<{ latitude: number; longitude: number }[]>([]);
  const [nextCollectionIndex, setNextCollectionIndex] = useState<number>(-1);
  const [expandedPanel, setExpandedPanel] = useState<boolean>(false);
  const [remainingCollections, setRemainingCollections] = useState<number>(0);
  const [completedCollections, setCompletedCollections] = useState<number>(0);

  useEffect(() => {
    // Initialize the route
    loadActiveRoute();
    
    // Start tracking location
    startLocationTracking();
    
    // Cleanup function
    return () => {
      if (locationListenerId) {
        LocationService.getInstance().stopLocationUpdates(locationListenerId);
      }
    };
  }, []);

  useEffect(() => {
    // When active collections change, set the next collection
    if (activeCollections.length > 0) {
      const nextIndex = activeCollections.findIndex(c => 
        c.status !== CollectionStatus.COMPLETED && 
        c.status !== CollectionStatus.CANCELLED
      );
      
      setNextCollectionIndex(nextIndex);
      if (nextIndex >= 0) {
        setSelectedCollection(activeCollections[nextIndex]);
      }
      
      // Calculate progress
      setRemainingCollections(activeCollections.filter(c => 
        c.status !== CollectionStatus.COMPLETED && 
        c.status !== CollectionStatus.CANCELLED
      ).length);
      
      setCompletedCollections(activeCollections.filter(c => 
        c.status === CollectionStatus.COMPLETED
      ).length);
    }
  }, [activeCollections]);

  useEffect(() => {
    // When current location or selected collection changes, update the route coordinates
    if (currentLocation && selectedCollection) {
      // Calculate route between current location and selected collection
      calculateRoute(
        currentLocation.coords.latitude, 
        currentLocation.coords.longitude,
        selectedCollection.latitude,
        selectedCollection.longitude
      );
    }
  }, [currentLocation, selectedCollection]);

  const loadActiveRoute = async () => {
    try {
      setIsLoading(true);
      
      // Get assigned routes
      const driverService = DriverService.getInstance();
      const routes = await driverService.getAssignedRoutes();
      
      // Find the current in-progress route
      const inProgressRoute = routes.find(route => route.status === 'in_progress');
      
      if (inProgressRoute) {
        setCurrentRoute(inProgressRoute);
        
        // Get active collections that aren't completed or cancelled
        const activeColls = inProgressRoute.collections.filter(c => 
          c.status !== CollectionStatus.COMPLETED && 
          c.status !== CollectionStatus.CANCELLED
        );
        
        // Sort by sequence number
        activeColls.sort((a, b) => (a.sequence || 0) - (b.sequence || 0));
        setActiveCollections(activeColls);
      } else {
        // No active route, go back to dashboard
        Alert.alert('No Active Route', 'There is no active route in progress.');
        router.back();
      }
    } catch (error) {
      console.error('Failed to load active route:', error);
      Alert.alert('Error', 'Failed to load your active route');
    } finally {
      setIsLoading(false);
    }
  };

  const startLocationTracking = async () => {
    try {
      // Request location permissions
      const locationService = LocationService.getInstance();
      const hasPermissions = await locationService.checkLocationPermissions();
      
      if (!hasPermissions) {
        Alert.alert(
          'Location Permission Required',
          'This app needs location permissions to track your position during collections.',
          [
            { 
              text: 'Grant Permission', 
              onPress: async () => {
                const granted = await locationService.requestForegroundPermissions();
                if (granted) {
                  startLocationTracking();
                } else {
                  Alert.alert('Permission Denied', 'Location tracking is required for navigation.');
                  router.back();
                }
              }
            },
            {
              text: 'Cancel',
              onPress: () => router.back(),
              style: 'cancel'
            }
          ]
        );
        return;
      }
      
      // Get initial location
      const location = await locationService.getCurrentLocation();
      if (location) {
        setCurrentLocation(location);
        
        // Start continuous updates
        const listenerId = await locationService.startLocationUpdates((updatedLocation) => {
          setCurrentLocation(updatedLocation);
          
          // Center map on user if no collection is selected
          if (!selectedCollection && mapRef.current) {
            mapRef.current.animateCamera({
              center: {
                latitude: updatedLocation.coords.latitude,
                longitude: updatedLocation.coords.longitude
              },
              zoom: 15
            });
          }
        });
        
        setLocationListenerId(listenerId);
      }
    } catch (error) {
      console.error('Error starting location tracking:', error);
      Alert.alert('Error', 'Failed to start location tracking');
    }
  };

  const calculateRoute = async (
    startLat: number, 
    startLng: number, 
    endLat: number, 
    endLng: number
  ) => {
    try {
      // In a real app, this would use a routing service API like Google Directions
      // For now, we'll just draw a straight line between points
      setRouteCoordinates([
        { latitude: startLat, longitude: startLng },
        { latitude: endLat, longitude: endLng }
      ]);
      
      // Fit map to show both points
      if (mapRef.current) {
        mapRef.current.fitToCoordinates(
          [
            { latitude: startLat, longitude: startLng },
            { latitude: endLat, longitude: endLng }
          ],
          {
            edgePadding: MAP_PADDING,
            animated: true
          }
        );
      }
    } catch (error) {
      console.error('Error calculating route:', error);
    }
  };

  const handleSelectCollection = (collection: CollectionAssignment) => {
    setSelectedCollection(collection);
    
    // Fit map to show driver and collection
    if (mapRef.current && currentLocation) {
      mapRef.current.fitToCoordinates(
        [
          { 
            latitude: currentLocation.coords.latitude, 
            longitude: currentLocation.coords.longitude 
          },
          { 
            latitude: collection.latitude, 
            longitude: collection.longitude 
          }
        ],
        {
          edgePadding: MAP_PADDING,
          animated: true
        }
      );
    }
  };

  const handleStatusUpdate = async (collection: CollectionAssignment, status: CollectionStatus) => {
    try {
      // Update the status
      const success = await DriverService.getInstance().updateCollectionStatus(
        collection.id,
        status
      );
      
      if (success) {
        // Update local state
        const updatedCollections = activeCollections.map(c => 
          c.id === collection.id ? { ...c, status } : c
        );
        
        setActiveCollections(updatedCollections);
        
        // If completed, find next collection
        if (status === CollectionStatus.COMPLETED) {
          const nextIndex = updatedCollections.findIndex(c => 
            c.id !== collection.id && 
            c.status !== CollectionStatus.COMPLETED && 
            c.status !== CollectionStatus.CANCELLED
          );
          
          if (nextIndex >= 0) {
            setSelectedCollection(updatedCollections[nextIndex]);
            setNextCollectionIndex(nextIndex);
          } else {
            // No more collections, show route completion dialog
            Alert.alert(
              'All Collections Completed',
              'You have completed all collections on this route. Would you like to finish the route?',
              [
                {
                  text: 'Continue Route',
                  style: 'cancel'
                },
                {
                  text: 'Finish Route',
                  onPress: handleFinishRoute
                }
              ]
            );
          }
        }
        
        // If status is "arrived", navigate to collection verification screen
        if (status === CollectionStatus.ARRIVED) {
          router.push(`/driver/collection/${collection.id}`);
        }
      }
    } catch (error) {
      console.error('Error updating collection status:', error);
      Alert.alert('Error', 'Failed to update collection status');
    }
  };

  const handleNavigate = (collection: CollectionAssignment) => {
    // Open Google Maps or Apple Maps with directions
    const scheme = Platform.OS === 'ios' ? 'maps:' : 'geo:';
    const url = Platform.OS === 'ios'
      ? `${scheme}?q=${collection.address}&saddr=${currentLocation?.coords.latitude},${currentLocation?.coords.longitude}&daddr=${collection.latitude},${collection.longitude}`
      : `${scheme}0,0?q=${collection.latitude},${collection.longitude}(${collection.address})`;
    
    Linking.openURL(url);
  };

  const handleFinishRoute = async () => {
    try {
      // Complete the route
      if (currentRoute) {
        const success = await DriverService.getInstance().completeRoute(currentRoute.id);
        
        if (success) {
          Alert.alert(
            'Route Completed',
            'You have successfully completed this route.',
            [
              {
                text: 'OK',
                onPress: () => router.push('/driver')
              }
            ]
          );
        }
      }
    } catch (error) {
      console.error('Error finishing route:', error);
      Alert.alert('Error', 'Failed to complete the route');
    }
  };

  const renderCollectionItem = (collection: CollectionAssignment, index: number) => {
    const isSelected = selectedCollection?.id === collection.id;
    const isNext = index === nextCollectionIndex;
    
    return (
      <TouchableOpacity
        key={collection.id}
        style={[
          styles.collectionItem,
          isSelected && { borderColor: theme.colors.primary, borderWidth: 2 }
        ]}
        onPress={() => handleSelectCollection(collection)}
      >
        <View style={styles.collectionHeader}>
          <View style={styles.sequenceContainer}>
            <ThemedText style={styles.sequenceNumber}>{collection.sequence || index + 1}</ThemedText>
          </View>
          
          <View style={styles.collectionInfo}>
            <ThemedText style={styles.collectionAddress} numberOfLines={1}>
              {collection.address}
            </ThemedText>
            
            <View style={styles.collectionStatus}>
              <View style={[
                styles.statusIndicator,
                { backgroundColor: getStatusColor(collection.status, theme) }
              ]} />
              <ThemedText style={styles.collectionStatusText}>
                {getStatusText(collection.status)}
              </ThemedText>
            </View>
          </View>
          
          {isNext && (
            <View style={styles.nextBadge}>
              <ThemedText style={styles.nextText}>NEXT</ThemedText>
            </View>
          )}
        </View>
        
        <View style={styles.collectionDetails}>
          <View style={styles.collectionDetail}>
            <IconSymbol name="clock" size={14} color={theme.colors.secondary} />
            <ThemedText style={styles.detailText}>
              {collection.scheduledTime 
                ? format(new Date(collection.scheduledTime), 'h:mm a')
                : 'Flexible'
              }
            </ThemedText>
          </View>
          
          <View style={styles.collectionDetail}>
            <IconSymbol name="package" size={14} color={theme.colors.secondary} />
            <ThemedText style={styles.detailText}>
              {collection.materials.length} {collection.materials.length === 1 ? 'material' : 'materials'}
            </ThemedText>
          </View>
          
          <View style={styles.collectionDetail}>
            <IconSymbol name="shopping-bag" size={14} color={theme.colors.secondary} />
            <ThemedText style={styles.detailText}>
              Est. {collection.estimatedWeight} kg
            </ThemedText>
          </View>
        </View>
        
        <View style={styles.collectionActions}>
          {collection.status === CollectionStatus.PENDING && (
            <Button
              variant="outline"
              size="small"
              onPress={() => handleStatusUpdate(collection, CollectionStatus.EN_ROUTE)}
              style={styles.actionButton}
            >
              Start Trip
            </Button>
          )}
          
          {collection.status === CollectionStatus.EN_ROUTE && (
            <Button
              size="small"
              onPress={() => handleStatusUpdate(collection, CollectionStatus.ARRIVED)}
              style={styles.actionButton}
            >
              Arrived
            </Button>
          )}
          
          <TouchableOpacity
            style={styles.navigateButton}
            onPress={() => handleNavigate(collection)}
          >
            <IconSymbol name="navigation" size={20} color={theme.colors.primary} />
          </TouchableOpacity>
        </View>
      </TouchableOpacity>
    );
  };

  const getStatusText = (status: CollectionStatus): string => {
    switch (status) {
      case CollectionStatus.PENDING:
        return 'Pending';
      case CollectionStatus.EN_ROUTE:
        return 'En Route';
      case CollectionStatus.ARRIVED:
        return 'Arrived';
      case CollectionStatus.COMPLETED:
        return 'Completed';
      case CollectionStatus.MISSED:
        return 'Missed';
      case CollectionStatus.CANCELLED:
        return 'Cancelled';
      default:
        return 'Unknown';
    }
  };

  const getStatusColor = (status: CollectionStatus, theme: any): string => {
    switch (status) {
      case CollectionStatus.PENDING:
        return theme.colors.secondary;
      case CollectionStatus.EN_ROUTE:
        return theme.colors.primary;
      case CollectionStatus.ARRIVED:
        return '#4CAF50';
      case CollectionStatus.COMPLETED:
        return '#4CAF50';
      case CollectionStatus.MISSED:
        return '#F44336';
      case CollectionStatus.CANCELLED:
        return '#F44336';
      default:
        return theme.colors.secondary;
    }
  };

  if (isLoading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color={theme.colors.primary} />
        <ThemedText style={styles.loadingText}>Loading your route...</ThemedText>
      </View>
    );
  }

  return (
    <>
      <Stack.Screen
        options={{
          title: 'Active Route',
          headerBackTitle: 'Dashboard',
        }}
      />
      
      <View style={styles.container}>
        {/* Map View */}
        <MapView
          ref={mapRef}
          style={styles.map}
          provider={PROVIDER_GOOGLE}
          showsUserLocation
          showsMyLocationButton
          followsUserLocation
          initialRegion={currentLocation ? {
            latitude: currentLocation.coords.latitude,
            longitude: currentLocation.coords.longitude,
            latitudeDelta: 0.05,
            longitudeDelta: 0.05
          } : undefined}
        >
          {/* Collection Markers */}
          {activeCollections.map((collection) => (
            <Marker
              key={collection.id}
              coordinate={{
                latitude: collection.latitude,
                longitude: collection.longitude
              }}
              title={`Stop ${collection.sequence}`}
              description={collection.address}
              pinColor={collection.id === selectedCollection?.id ? 'blue' : 'red'}
              onPress={() => handleSelectCollection(collection)}
            />
          ))}
          
          {/* Route Line */}
          {routeCoordinates.length > 0 && (
            <Polyline
              coordinates={routeCoordinates}
              strokeWidth={4}
              strokeColor={theme.colors.primary}
            />
          )}
        </MapView>
        
        {/* Status Bar */}
        <View style={styles.statusBar}>
          <View style={styles.progressContainer}>
            <ThemedText style={styles.progressText}>
              {completedCollections} of {completedCollections + remainingCollections} Completed
            </ThemedText>
            <View style={styles.progressBar}>
              <View 
                style={[
                  styles.progressFill,
                  { 
                    width: `${(completedCollections / (completedCollections + remainingCollections)) * 100}%`,
                    backgroundColor: theme.colors.primary
                  }
                ]} 
              />
            </View>
          </View>
          
          <TouchableOpacity
            style={styles.expandButton}
            onPress={() => setExpandedPanel(!expandedPanel)}
          >
            <IconSymbol 
              name={expandedPanel ? "chevron-down" : "chevron-up"} 
              size={24} 
              color={theme.colors.primary}
            />
          </TouchableOpacity>
        </View>
        
        {/* Collection Panel */}
        <ThemedView 
          style={[
            styles.collectionPanel,
            { height: expandedPanel ? 400 : 200 }
          ]}
        >
          <View style={styles.panelHeader}>
            <ThemedText style={styles.panelTitle}>Collection Stops</ThemedText>
            
            <TouchableOpacity
              style={styles.refreshButton}
              onPress={loadActiveRoute}
            >
              <IconSymbol name="refresh-cw" size={18} color={theme.colors.primary} />
            </TouchableOpacity>
          </View>
          
          <View style={styles.collectionsContainer}>
            {activeCollections.length === 0 ? (
              <ThemedText style={styles.noCollectionsText}>
                No active collections found.
              </ThemedText>
            ) : (
              activeCollections.map((collection, index) => 
                renderCollectionItem(collection, index)
              )
            )}
          </View>
        </ThemedView>
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
  map: {
    flex: 1,
    width: Dimensions.get('window').width,
    height: Dimensions.get('window').height,
  },
  statusBar: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: 'white',
    padding: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 3,
    elevation: 2,
  },
  progressContainer: {
    flex: 1,
  },
  progressText: {
    fontSize: 14,
    fontWeight: '500',
    marginBottom: 4,
  },
  progressBar: {
    height: 6,
    backgroundColor: '#eee',
    borderRadius: 3,
    overflow: 'hidden',
  },
  progressFill: {
    height: '100%',
  },
  expandButton: {
    width: 40,
    height: 40,
    justifyContent: 'center',
    alignItems: 'center',
  },
  collectionPanel: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    borderTopLeftRadius: 16,
    borderTopRightRadius: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: -2 },
    shadowOpacity: 0.1,
    shadowRadius: 3,
    elevation: 2,
    padding: 16,
  },
  panelHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  panelTitle: {
    fontSize: 18,
    fontWeight: 'bold',
  },
  refreshButton: {
    padding: 8,
  },
  collectionsContainer: {
    flex: 1,
  },
  noCollectionsText: {
    textAlign: 'center',
    marginTop: 16,
  },
  collectionItem: {
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#eee',
    padding: 12,
    marginBottom: 12,
  },
  collectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  sequenceContainer: {
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: '#eee',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  sequenceNumber: {
    fontSize: 14,
    fontWeight: 'bold',
  },
  collectionInfo: {
    flex: 1,
  },
  collectionAddress: {
    fontSize: 16,
    fontWeight: '500',
    marginBottom: 4,
  },
  collectionStatus: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  statusIndicator: {
    width: 8,
    height: 8,
    borderRadius: 4,
    marginRight: 6,
  },
  collectionStatusText: {
    fontSize: 12,
  },
  nextBadge: {
    backgroundColor: '#4CAF50',
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 4,
    marginLeft: 8,
  },
  nextText: {
    color: 'white',
    fontSize: 10,
    fontWeight: 'bold',
  },
  collectionDetails: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginBottom: 8,
  },
  collectionDetail: {
    flexDirection: 'row',
    alignItems: 'center',
    marginRight: 16,
    marginBottom: 4,
  },
  detailText: {
    fontSize: 12,
    marginLeft: 4,
  },
  collectionActions: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    alignItems: 'center',
  },
  actionButton: {
    marginLeft: 8,
  },
  navigateButton: {
    padding: 8,
    marginLeft: 8,
  },
}); 