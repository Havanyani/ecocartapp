/**
 * collections.ts
 * 
 * Type definitions for collection-related data structures.
 */

export type CollectionStatus = 'scheduled' | 'in_progress' | 'completed' | 'cancelled';

export interface CollectionItem {
  id: string;
  userId: string;
  scheduledDate: string;
  timeSlot: string;
  status: CollectionStatus;
  estimatedWeight: number;
  actualWeight?: number;
  creditAmount?: number;
  driverNotes?: string;
  completedDate?: string;
  createdAt: string;
  updatedAt: string;
}

export interface CollectionHistory {
  id: string;
  collectionId: string;
  userId: string;
  date: string;
  weight: number;
  credits: number;
  status: CollectionStatus;
}

export interface TimeSlot {
  id: string;
  startTime: string;
  endTime: string;
  isAvailable: boolean;
}

export interface CollectionSchedule {
  date: string;
  timeSlots: TimeSlot[];
}

export interface CollectionStats {
  totalCollections: number;
  completedCollections: number;
  totalWeight: number;
  totalCredits: number;
  monthlyStats: {
    month: string;
    collections: number;
    weight: number;
    credits: number;
  }[];
} 