import { IconSymbol } from '@/components/ui/IconSymbol';
import { ThemedText } from '@/components/ui/ThemedText';
import { ThemedView } from '@/components/ui/ThemedView';
import { useTheme } from '@/hooks/useTheme';
import { WebSocketService } from '@/services/WebSocketService';
import { Collection } from '@/types/Collection';
import { DeliveryPersonnel } from '@/types/DeliveryPersonnel';
import React, { useEffect, useState } from 'react';
import { ActivityIndicator, Alert, StyleSheet, TouchableOpacity, View } from 'react-native';
import MapView, { Marker, PROVIDER_GOOGLE, Polyline } from 'react-native-maps';

interface DeliveryPersonnelTrackerProps {
  collection: Collection;
  deliveryPersonnel: DeliveryPersonnel;
  onCallPersonnel?: () => void;
}

export function DeliveryPersonnelTracker({
  collection,
  deliveryPersonnel,
  onCallPersonnel,
}: DeliveryPersonnelTrackerProps) {
  const { theme } = useTheme();
  const [isLoading, setIsLoading] = useState(true);
  const [personnelLocation, setPersonnelLocation] = useState<{
    latitude: number;
    longitude: number;
  } | null>(null);
  const [routePath, setRoutePath] = useState<Array<{ latitude: number; longitude: number }>>([]);
  const [estimatedArrival, setEstimatedArrival] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  // Subscribe to real-time location updates for the delivery personnel
  useEffect(() => {
    if (!deliveryPersonnel?.id) return;

    setIsLoading(true);
    setError(null);

    // Subscribe to location updates
    const handleLocationUpdate = (data: any) => {
      if (data.personnelId === deliveryPersonnel.id) {
        setPersonnelLocation(data.location);
        
        // Add location to route path
        setRoutePath(prevPath => [...prevPath, data.location]);
        
        // Update estimated arrival time
        if (data.estimatedArrival) {
          setEstimatedArrival(data.estimatedArrival);
        }
      }
    };

    // Subscribe to WebSocket events
    WebSocketService.subscribe('location_update', handleLocationUpdate);
    
    // Request initial location and route
    WebSocketService.sendMessage('request_personnel_location', {
      personnelId: deliveryPersonnel.id,
      collectionId: collection.id
    }).catch(err => {
      console.error('Error requesting personnel location:', err);
      setError('Failed to get delivery personnel location');
    });
    
    // Set initial location if available
    if (deliveryPersonnel.lastKnownLocation) {
      setPersonnelLocation(deliveryPersonnel.lastKnownLocation);
      setRoutePath([deliveryPersonnel.lastKnownLocation]);
    }
    
    setIsLoading(false);

    // Clean up subscription
    return () => {
      // Unsubscribe from WebSocket events
      // Implement as needed based on your WebSocketService implementation
    };
  }, [deliveryPersonnel?.id, collection?.id]);

  // Handle call personnel button click
  const handleCallPersonnel = () => {
    if (onCallPersonnel) {
      onCallPersonnel();
    } else {
      Alert.alert(
        'Contact Delivery Personnel',
        `Would you like to call ${deliveryPersonnel.name}?`,
        [
          { text: 'Cancel', style: 'cancel' },
          { text: 'Call', onPress: () => {
            // Implement call functionality here
            console.log(`Calling ${deliveryPersonnel.phone}`);
            // You might use Linking.openURL(`tel:${deliveryPersonnel.phone}`)
          }}
        ]
      );
    }
  };

  // Render loading state
  if (isLoading) {
    return (
      <ThemedView style={styles.loadingContainer}>
        <ActivityIndicator size="large" color={theme.colors.primary} />
        <ThemedText style={styles.loadingText}>
          Connecting to delivery personnel...
        </ThemedText>
      </ThemedView>
    );
  }

  // Render error state
  if (error) {
    return (
      <ThemedView style={styles.errorContainer}>
        <IconSymbol name="alert-circle" size={48} color={theme.colors.error} />
        <ThemedText style={styles.errorText}>{error}</ThemedText>
      </ThemedView>
    );
  }

  // No location data available
  if (!personnelLocation) {
    return (
      <ThemedView style={styles.noDataContainer}>
        <IconSymbol name="location-outline" size={48} color={theme.colors.text.secondary} />
        <ThemedText style={styles.noDataText}>
          Waiting for delivery personnel location...
        </ThemedText>
      </ThemedView>
    );
  }

  // Calculate the region for the map
  const mapRegion = {
    latitude: personnelLocation.latitude,
    longitude: personnelLocation.longitude,
    latitudeDelta: 0.05,
    longitudeDelta: 0.05,
  };

  // Render tracking map
  return (
    <ThemedView style={styles.container}>
      <ThemedView style={styles.header}>
        <View style={styles.personnelInfo}>
          <ThemedText style={styles.personnelName}>
            {deliveryPersonnel.name}
          </ThemedText>
          <ThemedText style={styles.statusText}>
            Status: {deliveryPersonnel.status}
          </ThemedText>
          {estimatedArrival && (
            <ThemedText style={styles.estimatedText}>
              ETA: {estimatedArrival}
            </ThemedText>
          )}
        </View>
        <TouchableOpacity
          style={[styles.callButton, { backgroundColor: theme.colors.primary }]}
          onPress={handleCallPersonnel}
        >
          <IconSymbol name="call" size={20} color="#FFFFFF" />
          <ThemedText style={styles.callButtonText}>Call</ThemedText>
        </TouchableOpacity>
      </ThemedView>
      
      <View style={styles.mapContainer}>
        <MapView
          provider={PROVIDER_GOOGLE}
          style={styles.map}
          region={mapRegion}
          showsUserLocation
          showsMyLocationButton
        >
          {/* Delivery personnel marker */}
          <Marker
            coordinate={{
              latitude: personnelLocation.latitude,
              longitude: personnelLocation.longitude,
            }}
            title={`${deliveryPersonnel.name} (${deliveryPersonnel.status})`}
            description="Delivery personnel location"
          >
            <View style={styles.markerContainer}>
              <IconSymbol
                name="person"
                size={24}
                color={theme.colors.primary}
                style={styles.markerIcon}
              />
            </View>
          </Marker>
          
          {/* Collection location marker */}
          {collection.location.coordinates && (
            <Marker
              coordinate={{
                latitude: collection.location.coordinates.latitude,
                longitude: collection.location.coordinates.longitude,
              }}
              title="Collection Location"
              description={collection.location.address || "Pickup point"}
            >
              <View style={styles.markerContainer}>
                <IconSymbol
                  name="location"
                  size={24}
                  color={theme.colors.secondary}
                  style={styles.markerIcon}
                />
              </View>
            </Marker>
          )}
          
          {/* Route path polyline */}
          {routePath.length > 1 && (
            <Polyline
              coordinates={routePath}
              strokeWidth={4}
              strokeColor={theme.colors.primary}
            />
          )}
        </MapView>
      </View>
      
      <ThemedView style={styles.footer}>
        <ThemedText style={styles.footerText}>
          {collection.status === 'in_progress'
            ? "Your collection is in progress"
            : "Your collection is scheduled"}
        </ThemedText>
      </ThemedView>
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 16,
  },
  personnelInfo: {
    flex: 1,
  },
  personnelName: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 4,
  },
  statusText: {
    fontSize: 14,
    marginBottom: 2,
  },
  estimatedText: {
    fontSize: 14,
    fontWeight: '500',
  },
  callButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    marginLeft: 12,
  },
  callButtonText: {
    color: '#FFFFFF',
    marginLeft: 4,
    fontWeight: '500',
  },
  mapContainer: {
    flex: 1,
    borderRadius: 8,
    overflow: 'hidden',
    margin: 16,
  },
  map: {
    ...StyleSheet.absoluteFillObject,
  },
  markerContainer: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 4,
    borderWidth: 2,
    borderColor: '#FFFFFF',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 5,
  },
  markerIcon: {
    textAlign: 'center',
  },
  footer: {
    padding: 16,
    marginHorizontal: 16,
    marginBottom: 16,
    borderRadius: 8,
    backgroundColor: 'rgba(0,0,0,0.05)',
  },
  footerText: {
    textAlign: 'center',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  loadingText: {
    marginTop: 16,
    textAlign: 'center',
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  errorText: {
    marginTop: 16,
    textAlign: 'center',
    color: 'red',
  },
  noDataContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  noDataText: {
    marginTop: 16,
    textAlign: 'center',
    opacity: 0.7,
  },
}); 