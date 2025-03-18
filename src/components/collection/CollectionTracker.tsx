import { IconSymbol } from '@/components/ui/IconSymbol';
import { ThemedText } from '@/components/ui/ThemedText';
import { ThemedView } from '@/components/ui/ThemedView';
import { useCollectionTracking } from '@/hooks/useCollectionTracking';
import { useTheme } from '@/hooks/useTheme';
import { Collection } from '@/types/Collection';
import { useEffect, useState } from 'react';
import { ActivityIndicator, Alert, StyleSheet, TouchableOpacity } from 'react-native';
import MapView, { Marker, PROVIDER_GOOGLE } from 'react-native-maps';

interface CollectionTrackerProps {
  collection: Collection;
  onStatusUpdate?: (status: Collection['status']) => void;
  onLocationUpdate?: (location: { latitude: number; longitude: number }) => void;
}

export function CollectionTracker({
  collection,
  onStatusUpdate,
  onLocationUpdate,
}: CollectionTrackerProps) {
  const { colors } = useTheme();
  const [isUpdating, setIsUpdating] = useState(false);
  const {
    isTracking,
    currentLocation,
    error,
    startTracking,
    stopTracking,
    updateStatus,
    updateLocation,
    hasLocationPermission,
  } = useCollectionTracking();

  useEffect(() => {
    if (collection.status === 'confirmed' || collection.status === 'in_progress') {
      startTracking(collection.id);
    }
    return () => {
      stopTracking();
    };
  }, [collection.id, collection.status]);

  useEffect(() => {
    if (currentLocation && onLocationUpdate) {
      onLocationUpdate(currentLocation);
    }
  }, [currentLocation, onLocationUpdate]);

  const handleStatusUpdate = async (newStatus: Collection['status']) => {
    try {
      setIsUpdating(true);
      await updateStatus(collection.id, newStatus);
      if (onStatusUpdate) {
        onStatusUpdate(newStatus);
      }
      Alert.alert('Success', `Collection status updated to ${newStatus}`);
    } catch (err) {
      Alert.alert('Error', 'Failed to update collection status');
    } finally {
      setIsUpdating(false);
    }
  };

  const getStatusColor = (status: Collection['status']) => {
    switch (status) {
      case 'pending':
        return colors.secondary;
      case 'confirmed':
        return colors.primary;
      case 'in_progress':
        return colors.primary;
      case 'completed':
        return colors.surface;
      case 'cancelled':
        return colors.error;
      case 'rescheduled':
        return colors.secondary;
      default:
        return colors.text.primary;
    }
  };

  if (!hasLocationPermission) {
    return (
      <ThemedView style={styles.container}>
        <ThemedText style={styles.errorText}>
          Location permission is required for tracking. Please enable location services in your device settings.
        </ThemedText>
      </ThemedView>
    );
  }

  if (error) {
    return (
      <ThemedView style={styles.container}>
        <ThemedText style={styles.errorText}>{error}</ThemedText>
      </ThemedView>
    );
  }

  return (
    <ThemedView style={styles.container}>
      <ThemedView style={styles.header}>
        <IconSymbol name="location" size={24} color={colors.primary} />
        <ThemedText style={styles.title}>Collection Tracking</ThemedText>
      </ThemedView>

      <ThemedView style={styles.mapContainer}>
        {currentLocation ? (
          <MapView
            provider={PROVIDER_GOOGLE}
            style={styles.map}
            initialRegion={{
              latitude: currentLocation.latitude,
              longitude: currentLocation.longitude,
              latitudeDelta: 0.0922,
              longitudeDelta: 0.0421,
            }}
          >
            <Marker
              coordinate={{
                latitude: currentLocation.latitude,
                longitude: currentLocation.longitude,
              }}
              title="Current Location"
              description="Your current position"
              pinColor={colors.primary}
            />
            {collection.location.coordinates && (
              <Marker
                coordinate={{
                  latitude: collection.location.coordinates.latitude,
                  longitude: collection.location.coordinates.longitude,
                }}
                title="Collection Location"
                description="Collection pickup point"
                pinColor={getStatusColor(collection.status)}
              />
            )}
          </MapView>
        ) : (
          <ThemedView style={styles.loadingContainer}>
            <ActivityIndicator size="large" color={colors.primary} />
            <ThemedText style={styles.loadingText}>Getting location...</ThemedText>
          </ThemedView>
        )}
      </ThemedView>

      <ThemedView style={styles.statusContainer}>
        <ThemedText style={styles.statusText}>
          Current Status: {collection.status}
        </ThemedText>
        {collection.status === 'confirmed' && (
          <TouchableOpacity
            style={[styles.button, { backgroundColor: colors.primary }]}
            onPress={() => handleStatusUpdate('in_progress')}
            disabled={isUpdating}
          >
            {isUpdating ? (
              <ActivityIndicator color={colors.background} />
            ) : (
              <ThemedText style={styles.buttonText}>Start Collection</ThemedText>
            )}
          </TouchableOpacity>
        )}
        {collection.status === 'in_progress' && (
          <TouchableOpacity
            style={[styles.button, { backgroundColor: colors.surface }]}
            onPress={() => handleStatusUpdate('completed')}
            disabled={isUpdating}
          >
            {isUpdating ? (
              <ActivityIndicator color={colors.background} />
            ) : (
              <ThemedText style={styles.buttonText}>Complete Collection</ThemedText>
            )}
          </TouchableOpacity>
        )}
      </ThemedView>
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 16,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
  },
  title: {
    fontSize: 20,
    fontWeight: 'bold',
    marginLeft: 8,
  },
  mapContainer: {
    flex: 1,
    marginBottom: 16,
    borderRadius: 8,
    overflow: 'hidden',
  },
  map: {
    flex: 1,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    marginTop: 8,
  },
  statusContainer: {
    padding: 16,
    borderRadius: 8,
    backgroundColor: 'rgba(0, 0, 0, 0.05)',
  },
  statusText: {
    fontSize: 16,
    marginBottom: 16,
  },
  button: {
    padding: 12,
    borderRadius: 8,
    alignItems: 'center',
  },
  buttonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: 'bold',
  },
  errorText: {
    color: '#FF3B30',
    textAlign: 'center',
    marginTop: 16,
  },
}); 