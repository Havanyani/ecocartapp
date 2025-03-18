/**
 * LocationService.ts
 * 
 * Service for managing location-related operations and GPS tracking.
 * Handles permissions, geolocation, and location-related utilities.
 */

import * as Location from 'expo-location';

// Location accuracy preset
const LOCATION_ACCURACY = Location.Accuracy.High;

// Background location options
const BACKGROUND_LOCATION_OPTIONS = {
  accuracy: Location.Accuracy.Balanced,
  timeInterval: 15000, // 15 seconds
  distanceInterval: 100, // 100 meters
  foregroundService: {
    notificationTitle: 'EcoCart Location Tracking',
    notificationBody: 'EcoCart is tracking your location for delivery purposes',
    notificationColor: '#4CAF50'
  },
  pausesUpdatesAutomatically: false
};

export class LocationService {
  private static instance: LocationService;
  private locationSubscription: Location.LocationSubscription | null = null;
  private lastKnownLocation: Location.LocationObject | null = null;
  private locationPermissionsGranted = false;
  private backgroundLocationPermissionsGranted = false;
  private locationUpdateListeners: Map<string, (location: Location.LocationObject) => void> = new Map();

  private constructor() {
    // Initialize permissions on startup
    this.checkLocationPermissions();
  }

  public static getInstance(): LocationService {
    if (!LocationService.instance) {
      LocationService.instance = new LocationService();
    }
    return LocationService.instance;
  }

  /**
   * Check if location permissions are granted
   */
  public async checkLocationPermissions(): Promise<boolean> {
    try {
      // Check foreground location permissions
      const { status: foregroundStatus } = await Location.requestForegroundPermissionsAsync();
      this.locationPermissionsGranted = foregroundStatus === 'granted';
      
      // If foreground is granted, check background permissions
      if (this.locationPermissionsGranted) {
        const { status: backgroundStatus } = await Location.getBackgroundPermissionsAsync();
        this.backgroundLocationPermissionsGranted = backgroundStatus === 'granted';
      }
      
      return this.locationPermissionsGranted;
    } catch (error) {
      console.error('Error checking location permissions:', error);
      return false;
    }
  }

  /**
   * Request foreground location permissions
   */
  public async requestForegroundPermissions(): Promise<boolean> {
    try {
      const { status } = await Location.requestForegroundPermissionsAsync();
      this.locationPermissionsGranted = status === 'granted';
      return this.locationPermissionsGranted;
    } catch (error) {
      console.error('Error requesting foreground location permissions:', error);
      return false;
    }
  }

  /**
   * Request background location permissions
   */
  public async requestBackgroundPermissions(): Promise<boolean> {
    try {
      // Background permissions require foreground permissions first
      if (!this.locationPermissionsGranted) {
        const foregroundGranted = await this.requestForegroundPermissions();
        if (!foregroundGranted) return false;
      }
      
      const { status } = await Location.requestBackgroundPermissionsAsync();
      this.backgroundLocationPermissionsGranted = status === 'granted';
      return this.backgroundLocationPermissionsGranted;
    } catch (error) {
      console.error('Error requesting background location permissions:', error);
      return false;
    }
  }

  /**
   * Get current location
   */
  public async getCurrentLocation(): Promise<Location.LocationObject | null> {
    try {
      if (!this.locationPermissionsGranted) {
        const granted = await this.requestForegroundPermissions();
        if (!granted) {
          console.warn('Location permissions not granted');
          return null;
        }
      }
      
      const location = await Location.getCurrentPositionAsync({
        accuracy: LOCATION_ACCURACY
      });
      
      this.lastKnownLocation = location;
      return location;
    } catch (error) {
      console.error('Error getting current location:', error);
      return this.lastKnownLocation; // Return last known location if available
    }
  }

  /**
   * Start continuous location updates
   * @param listener Function to call on each location update
   * @returns Listener ID for removing the listener later
   */
  public async startLocationUpdates(
    listener: (location: Location.LocationObject) => void
  ): Promise<string | null> {
    try {
      if (!this.locationPermissionsGranted) {
        const granted = await this.requestForegroundPermissions();
        if (!granted) {
          console.warn('Location permissions not granted');
          return null;
        }
      }
      
      // Generate a unique ID for this listener
      const listenerId = `listener_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`;
      
      // Store the listener
      this.locationUpdateListeners.set(listenerId, listener);
      
      // If this is the first listener, start the actual subscription
      if (this.locationUpdateListeners.size === 1) {
        this.locationSubscription = await Location.watchPositionAsync(
          { accuracy: LOCATION_ACCURACY },
          (location) => {
            this.lastKnownLocation = location;
            
            // Notify all listeners
            this.locationUpdateListeners.forEach(listenerFn => {
              listenerFn(location);
            });
          }
        );
      }
      
      return listenerId;
    } catch (error) {
      console.error('Error starting location updates:', error);
      return null;
    }
  }

  /**
   * Stop listening to location updates for a specific listener
   */
  public stopLocationUpdates(listenerId: string): void {
    // Remove the listener
    this.locationUpdateListeners.delete(listenerId);
    
    // If no more listeners, stop the subscription
    if (this.locationUpdateListeners.size === 0 && this.locationSubscription) {
      this.locationSubscription.remove();
      this.locationSubscription = null;
    }
  }

  /**
   * Start background location updates (for driver tracking)
   */
  public async startBackgroundLocationUpdates(): Promise<boolean> {
    try {
      // Check if background location is allowed
      if (!this.backgroundLocationPermissionsGranted) {
        const granted = await this.requestBackgroundPermissions();
        if (!granted) {
          console.warn('Background location permissions not granted');
          return false;
        }
      }
      
      // Start background tracking with appropriate options
      await Location.startLocationUpdatesAsync('ecocart-background-location', BACKGROUND_LOCATION_OPTIONS);
      return true;
    } catch (error) {
      console.error('Error starting background location updates:', error);
      return false;
    }
  }

  /**
   * Stop background location updates
   */
  public async stopBackgroundLocationUpdates(): Promise<void> {
    try {
      const isTaskRegistered = await Location.hasStartedLocationUpdatesAsync('ecocart-background-location');
      if (isTaskRegistered) {
        await Location.stopLocationUpdatesAsync('ecocart-background-location');
      }
    } catch (error) {
      console.error('Error stopping background location updates:', error);
    }
  }

  /**
   * Calculate distance between two points in kilometers
   */
  public getDistanceBetweenPoints(
    lat1: number, lon1: number, 
    lat2: number, lon2: number
  ): number {
    // Haversine formula to calculate distance
    const R = 6371; // Radius of the Earth in kilometers
    const dLat = this.deg2rad(lat2 - lat1);
    const dLon = this.deg2rad(lon2 - lon1);
    const a = 
      Math.sin(dLat/2) * Math.sin(dLat/2) +
      Math.cos(this.deg2rad(lat1)) * Math.cos(this.deg2rad(lat2)) * 
      Math.sin(dLon/2) * Math.sin(dLon/2); 
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a)); 
    const distance = R * c; // Distance in kilometers
    return distance;
  }

  /**
   * Convert degrees to radians
   */
  private deg2rad(deg: number): number {
    return deg * (Math.PI/180);
  }

  /**
   * Get the last known location
   */
  public getLastKnownLocation(): Location.LocationObject | null {
    return this.lastKnownLocation;
  }

  /**
   * Check if location permissions are granted
   */
  public hasLocationPermissions(): boolean {
    return this.locationPermissionsGranted;
  }

  /**
   * Check if background location permissions are granted
   */
  public hasBackgroundLocationPermissions(): boolean {
    return this.backgroundLocationPermissionsGranted;
  }

  /**
   * Clean up resources when service is destroyed
   */
  public cleanup(): void {
    if (this.locationSubscription) {
      this.locationSubscription.remove();
      this.locationSubscription = null;
    }
    
    this.stopBackgroundLocationUpdates();
    this.locationUpdateListeners.clear();
  }
} 