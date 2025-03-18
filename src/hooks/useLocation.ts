import * as Location from 'expo-location';
import { useCallback } from 'react';

interface Location {
  latitude: number;
  longitude: number;
}

export function useLocation() {
  const getCurrentLocation = useCallback(async (): Promise<Location> => {
    const { status } = await Location.requestForegroundPermissionsAsync();
    if (status !== 'granted') {
      throw new Error('Location permission not granted');
    }

    const location = await Location.getCurrentPositionAsync({});
    return {
      latitude: location.coords.latitude,
      longitude: location.coords.longitude,
    };
  }, []);

  return {
    getCurrentLocation,
  };
} 