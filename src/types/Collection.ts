/**
 * Collection-related type definitions.
 */

import { Material, MaterialCondition, MaterialQuantity } from './Material';

/**
 * Collection status enum
 */
export enum CollectionStatus {
  PENDING = 'pending',
  SCHEDULED = 'scheduled',
  EN_ROUTE = 'en_route',
  ARRIVED = 'arrived',
  IN_PROGRESS = 'in_progress',
  COMPLETED = 'completed',
  CANCELLED = 'cancelled',
  MISSED = 'missed',
  RESCHEDULED = 'rescheduled'
}

// Status history item
export interface StatusHistoryItem {
  status: CollectionStatus;
  timestamp: Date;
  note?: string;
  updatedBy?: string;
}

// Collector information
export interface CollectorInfo {
  id: string;
  name: string;
  contactNumber: string;
  vehicleInfo?: {
    type: string;
    licensePlate: string;
    capacity: number; // in kg
  };
  rating?: number;
  totalCollections: number;
}

// Collection location
export interface CollectionLocation {
  id: string;
  type: 'home' | 'work' | 'other';
  street: string;
  city: string;
  state: string;
  zipCode: string;
  coordinates?: {
    latitude: number;
    longitude: number;
  };
  accessInstructions?: string;
}

// Collection materials
export interface CollectionMaterials {
  id: string;
  material: Material;
  quantity: MaterialQuantity;
  condition: MaterialCondition;
  notes?: string;
}

// Collection feedback
export interface CollectionFeedback {
  rating: number;
  comment?: string;
  collectorRating?: number;
  collectorComment?: string;
  timestamp: Date;
  images?: string[];
}

// Collection interface
export interface Collection {
  id: string;
  userId: string;
  materials: CollectionMaterials[];
  location: CollectionLocation;
  scheduledDateTime: Date;
  estimatedDuration: number; // in minutes
  status: CollectionStatus;
  notes?: string;
  createdAt: Date;
  updatedAt: Date;
  statusHistory: StatusHistoryItem[];
  collectorInfo?: CollectorInfo;
  feedback?: CollectionFeedback;
  totalWeight?: number; // Actual weight after collection
  totalCredits?: number; // Credits earned from this collection
}

// Time slot for collection scheduling
export interface TimeSlot {
  id: string;
  startTime: string;
  endTime: string;
  available: boolean;
}

// Collection summary for analytics
export interface CollectionSummary {
  totalCollections: number;
  totalWeight: number;
  totalCredits: number;
  averageRating: number;
  materialBreakdown: {
    [key: string]: {
      quantity: number;
      value: number;
    };
  };
  timeRange: {
    start: Date;
    end: Date;
  };
}

export interface CollectionSlot {
  id: string;
  date: string;
  timeSlot: string;
  materials: CollectionMaterials[];
  estimatedWeight: number;
  status: 'pending' | 'confirmed' | 'completed' | 'cancelled';
}

export interface UseCollectionScheduleReturn {
  scheduleCollection: (slot: CollectionSlot) => Promise<void>;
  availableSlots: TimeSlot[];
  isLoading: boolean;
  error: string | null;
} 