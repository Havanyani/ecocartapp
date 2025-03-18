/**
 * Delivery type definitions
 * @module types/delivery
 */

import { Address } from './index';

/**
 * Delivery route interface
 */
export interface DeliveryRoute {
  id: string;
  driverId: string;
  stops: DeliveryStop[];
  status: DeliveryStatus;
  startTime: string;
  endTime?: string;
  totalDistance: number;
  estimatedDuration: number;
}

/**
 * Delivery stop interface
 */
export interface DeliveryStop {
  id: string;
  address: Address;
  collectionId: string;
  scheduledTime: string;
  actualTime?: string;
  status: DeliveryStopStatus;
  notes?: string;
}

/**
 * Delivery status type
 */
export type DeliveryStatus = 
  | 'PLANNED'
  | 'IN_PROGRESS'
  | 'COMPLETED'
  | 'CANCELLED';

/**
 * Delivery stop status type
 */
export type DeliveryStopStatus = 
  | 'PENDING'
  | 'ARRIVED'
  | 'COMPLETED'
  | 'SKIPPED'
  | 'FAILED';

export interface Location {
  latitude: number;
  longitude: number;
  altitude: number | null;
  timestamp: number;
  accuracy: number | null;
  altitudeAccuracy: number | null;
  speed: number | null;
  heading: number | null;
}

export interface PlasticPickup {
  id: string;
  location: Location;
  estimatedWeight: number;
  scheduledTime: Date;
} 