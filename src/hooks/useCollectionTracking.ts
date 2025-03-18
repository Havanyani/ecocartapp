import { useAppDispatch } from '@/store';
import { updateCollectionLocation, updateCollectionStatus } from '@/store/slices/collectionSlice';
import { CollectionStatus } from '@/types/Collection';
import * as Location from 'expo-location';
import { useCallback, useEffect, useState } from 'react';

interface UseCollectionTrackingReturn {
  isTracking: boolean;
  currentLocation: { latitude: number; longitude: number } | null;
  error: string | null;
  startTracking: (collectionId: string) => Promise<void>;
  stopTracking: () => void;
  updateStatus: (collectionId: string, status: CollectionStatus) => Promise<void>;
  updateLocation: (collectionId: string, location: { latitude: number; longitude: number }) => Promise<void>;
  hasLocationPermission: boolean;
}

export function useCollectionTracking(): UseCollectionTrackingReturn {
  const dispatch = useAppDispatch();
  const [isTracking, setIsTracking] = useState(false);
  const [currentLocation, setCurrentLocation] = useState<{
    latitude: number;
    longitude: number;
  } | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [hasLocationPermission, setHasLocationPermission] = useState(false);
  const [locationSubscription, setLocationSubscription] = useState<Location.LocationSubscription | null>(null);

  // Check location permission on mount
  useEffect(() => {
    checkLocationPermission();
    return () => {
      stopTracking();
    };
  }, []);

  const checkLocationPermission = async () => {
    try {
      const { status } = await Location.getForegroundPermissionsAsync();
      const hasPermission = status === 'granted';
      setHasLocationPermission(hasPermission);
    } catch (err) {
      setError('Failed to check location permission');
      console.error('Error checking location permission:', err);
    }
  };

  const startTracking = useCallback(async (collectionId: string) => {
    try {
      setError(null);
      
      // Check location permission first
      const { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== 'granted') {
        setError('Location permission is required for tracking');
        return;
      }

      // Get initial location
      const location = await Location.getCurrentPositionAsync({
        accuracy: Location.Accuracy.Balanced,
      });

      setCurrentLocation({
        latitude: location.coords.latitude,
        longitude: location.coords.longitude,
      });

      // Start watching position
      const subscription = await Location.watchPositionAsync(
        {
          accuracy: Location.Accuracy.Balanced,
          timeInterval: 10000,
          distanceInterval: 20,
        },
        (locationUpdate: Location.LocationObject) => {
          setCurrentLocation({
            latitude: locationUpdate.coords.latitude,
            longitude: locationUpdate.coords.longitude,
          });
        }
      );

      setLocationSubscription(subscription);
      setIsTracking(true);
    } catch (err) {
      setError('Failed to start tracking');
      console.error('Error starting tracking:', err);
    }
  }, []);

  const stopTracking = useCallback(() => {
    if (locationSubscription) {
      locationSubscription.remove();
      setLocationSubscription(null);
    }
    setIsTracking(false);
    setCurrentLocation(null);
  }, [locationSubscription]);

  const updateStatus = useCallback(async (collectionId: string, status: CollectionStatus) => {
    try {
      setError(null);
      await dispatch(updateCollectionStatus({ collectionId, status }));
    } catch (err) {
      setError('Failed to update collection status');
      console.error('Error updating status:', err);
      throw err; // Re-throw to handle in the component
    }
  }, [dispatch]);

  const updateLocation = useCallback(
    async (collectionId: string, location: { latitude: number; longitude: number }) => {
      try {
        setError(null);
        setCurrentLocation(location);
        await dispatch(updateCollectionLocation({ collectionId, location }));
      } catch (err) {
        setError('Failed to update location');
        console.error('Error updating location:', err);
        throw err; // Re-throw to handle in the component
      }
    },
    [dispatch]
  );

  return {
    isTracking,
    currentLocation,
    error,
    startTracking,
    stopTracking,
    updateStatus,
    updateLocation,
    hasLocationPermission,
  };
} 