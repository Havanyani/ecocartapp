/**
 * DriverService.ts
 * 
 * Service for managing driver operations, location tracking, and collection status updates.
 * This service handles real-time location sharing, status updates, and collection verifications.
 */

import { CollectionStatus } from '@/types/Collection';
import { ApiService } from './ApiService';
import { LocationService } from './LocationService';
import NotificationService from './NotificationService';

// Location update frequency in milliseconds
const LOCATION_UPDATE_FREQUENCY = 15000; // 15 seconds

// Route and collection types
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

interface CollectionVerification {
  collectionId: string;
  actualWeight: number;
  photoUrls: string[];
  materialTypes: string[];
  notes: string;
  timestamp: string;
}

interface LocationUpdate {
  latitude: number;
  longitude: number;
  accuracy: number;
  heading?: number;
  speed?: number;
  timestamp: string;
}

export class DriverService {
  private static instance: DriverService;
  private static readonly ENDPOINT = '/driver';
  private locationTrackingInterval: NodeJS.Timer | null = null;
  private currentRouteId: string | null = null;
  private lastLocation: LocationUpdate | null = null;

  private constructor() {}

  public static getInstance(): DriverService {
    if (!DriverService.instance) {
      DriverService.instance = new DriverService();
    }
    return DriverService.instance;
  }

  /**
   * Get assigned routes for the driver
   */
  public async getAssignedRoutes(): Promise<RouteAssignment[]> {
    try {
      const response = await ApiService.getInstance().get(`${DriverService.ENDPOINT}/routes`);
      return response.data;
    } catch (error) {
      console.error('Error fetching assigned routes:', error);
      return [];
    }
  }

  /**
   * Get a specific route by ID
   */
  public async getRouteById(routeId: string): Promise<RouteAssignment | null> {
    try {
      const response = await ApiService.getInstance().get(`${DriverService.ENDPOINT}/routes/${routeId}`);
      return response.data;
    } catch (error) {
      console.error(`Error fetching route ${routeId}:`, error);
      return null;
    }
  }

  /**
   * Get a specific collection by ID
   */
  public async getCollectionById(collectionId: string): Promise<CollectionAssignment | null> {
    try {
      const response = await ApiService.getInstance().get(`${DriverService.ENDPOINT}/collections/${collectionId}`);
      return response.data;
    } catch (error) {
      console.error(`Error fetching collection ${collectionId}:`, error);
      return null;
    }
  }

  /**
   * Start a route
   */
  public async startRoute(routeId: string): Promise<boolean> {
    try {
      await ApiService.getInstance().post(`${DriverService.ENDPOINT}/routes/${routeId}/start`);
      
      // Start location tracking
      this.currentRouteId = routeId;
      this.startLocationTracking();
      
      // Notify dispatch that the driver has started the route
      await NotificationService.getInstance().sendDispatchNotification({
        type: 'ROUTE_STARTED',
        routeId,
        message: 'Driver has started the route'
      });
      
      return true;
    } catch (error) {
      console.error(`Error starting route ${routeId}:`, error);
      return false;
    }
  }

  /**
   * Complete a route
   */
  public async completeRoute(routeId: string): Promise<boolean> {
    try {
      await ApiService.getInstance().post(`${DriverService.ENDPOINT}/routes/${routeId}/complete`);
      
      // Stop location tracking if this is the current route
      if (this.currentRouteId === routeId) {
        this.stopLocationTracking();
        this.currentRouteId = null;
      }
      
      // Notify dispatch that the driver has completed the route
      await NotificationService.getInstance().sendDispatchNotification({
        type: 'ROUTE_COMPLETED',
        routeId,
        message: 'Driver has completed the route'
      });
      
      return true;
    } catch (error) {
      console.error(`Error completing route ${routeId}:`, error);
      return false;
    }
  }

  /**
   * Update collection status
   */
  public async updateCollectionStatus(
    collectionId: string, 
    status: CollectionStatus, 
    notes?: string
  ): Promise<boolean> {
    try {
      await ApiService.getInstance().post(`${DriverService.ENDPOINT}/collections/${collectionId}/status`, {
        status,
        notes,
        timestamp: new Date().toISOString(),
        location: this.lastLocation
      });
      
      // Notify the user about the status update
      if (status === CollectionStatus.EN_ROUTE) {
        await NotificationService.getInstance().sendUserCollectionUpdate({
          collectionId,
          status: 'en_route',
          message: 'Your recycling collector is on the way'
        });
      } else if (status === CollectionStatus.ARRIVED) {
        await NotificationService.getInstance().sendUserCollectionUpdate({
          collectionId,
          status: 'arrived',
          message: 'Your recycling collector has arrived'
        });
      } else if (status === CollectionStatus.COMPLETED) {
        await NotificationService.getInstance().sendUserCollectionUpdate({
          collectionId,
          status: 'completed',
          message: 'Your collection has been completed'
        });
      }
      
      return true;
    } catch (error) {
      console.error(`Error updating collection ${collectionId} status:`, error);
      return false;
    }
  }

  /**
   * Submit collection verification with photo proof
   */
  public async submitCollectionVerification(
    verification: CollectionVerification
  ): Promise<boolean> {
    try {
      await ApiService.getInstance().post(`${DriverService.ENDPOINT}/collections/${verification.collectionId}/verify`, verification);
      
      // Update collection status to completed
      await this.updateCollectionStatus(verification.collectionId, CollectionStatus.COMPLETED);
      
      return true;
    } catch (error) {
      console.error(`Error submitting verification for collection ${verification.collectionId}:`, error);
      return false;
    }
  }

  /**
   * Upload collection photo
   */
  public async uploadCollectionPhoto(
    collectionId: string,
    photoUri: string,
    type: 'before' | 'after' | 'materials'
  ): Promise<string | null> {
    try {
      // Create form data for file upload
      const formData = new FormData();
      formData.append('photo', {
        uri: photoUri,
        type: 'image/jpeg',
        name: `collection_${collectionId}_${type}_${Date.now()}.jpg`
      } as any);
      formData.append('collectionId', collectionId);
      formData.append('type', type);
      
      const response = await ApiService.getInstance().post(
        `${DriverService.ENDPOINT}/collections/${collectionId}/photos`,
        formData,
        {
          headers: { 'Content-Type': 'multipart/form-data' }
        }
      );
      
      return response.data.photoUrl;
    } catch (error) {
      console.error(`Error uploading photo for collection ${collectionId}:`, error);
      return null;
    }
  }

  /**
   * Report an issue with a collection
   */
  public async reportCollectionIssue(
    collectionId: string,
    issue: {
      type: 'ACCESS_ISSUE' | 'SAFETY_CONCERN' | 'INCORRECT_MATERIALS' | 'OTHER',
      description: string,
      photoUrls?: string[]
    }
  ): Promise<boolean> {
    try {
      await ApiService.getInstance().post(`${DriverService.ENDPOINT}/collections/${collectionId}/issues`, {
        ...issue,
        timestamp: new Date().toISOString(),
        location: this.lastLocation
      });
      
      // Notify dispatch about the issue
      await NotificationService.getInstance().sendDispatchNotification({
        type: 'COLLECTION_ISSUE',
        collectionId,
        message: `Issue reported: ${issue.type}`
      });
      
      return true;
    } catch (error) {
      console.error(`Error reporting issue for collection ${collectionId}:`, error);
      return false;
    }
  }

  /**
   * Start tracking driver location
   */
  private startLocationTracking(): void {
    // Clear any existing interval
    this.stopLocationTracking();
    
    // Set up new tracking interval
    this.locationTrackingInterval = setInterval(async () => {
      try {
        // Get current location
        const location = await LocationService.getInstance().getCurrentLocation();
        
        if (location && this.currentRouteId) {
          // Format location data
          this.lastLocation = {
            latitude: location.coords.latitude,
            longitude: location.coords.longitude,
            accuracy: location.coords.accuracy,
            heading: location.coords.heading ?? undefined,
            speed: location.coords.speed ?? undefined,
            timestamp: new Date().toISOString()
          };
          
          // Send location update to server
          await ApiService.getInstance().post(`${DriverService.ENDPOINT}/location`, {
            routeId: this.currentRouteId,
            ...this.lastLocation
          });
        }
      } catch (error) {
        console.error('Error updating driver location:', error);
      }
    }, LOCATION_UPDATE_FREQUENCY);
  }

  /**
   * Stop tracking driver location
   */
  private stopLocationTracking(): void {
    if (this.locationTrackingInterval) {
      clearInterval(this.locationTrackingInterval);
      this.locationTrackingInterval = null;
    }
  }

  /**
   * Get driver's performance statistics
   */
  public async getPerformanceStats(timeframe: 'day' | 'week' | 'month' = 'week'): Promise<{
    collectionsCompleted: number;
    onTimePercentage: number;
    averageCollectionTime: number;
    totalMaterialsCollected: number;
    issuesReported: number;
  }> {
    try {
      const response = await ApiService.getInstance().get(`${DriverService.ENDPOINT}/stats`, {
        params: { timeframe }
      });
      return response.data;
    } catch (error) {
      console.error('Error fetching performance stats:', error);
      return {
        collectionsCompleted: 0,
        onTimePercentage: 0,
        averageCollectionTime: 0,
        totalMaterialsCollected: 0,
        issuesReported: 0
      };
    }
  }

  /**
   * Clean up resources when service is destroyed
   */
  public cleanup(): void {
    this.stopLocationTracking();
  }
} 