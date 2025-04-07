/**
 * models.ts
 * 
 * Core data models for the EcoCart application
 */

import { Material } from '@/api/MaterialsApi';

/**
 * Base model with common fields
 */
export interface BaseModel {
  id: string;
  createdAt: string;
  updatedAt: string;
  version: number;
}

/**
 * User profile
 */
export interface User extends BaseModel {
  email: string;
  firstName: string;
  lastName: string;
  phone?: string;
  avatar?: string;
  role: UserRole;
  credits: number;
  totalPlasticCollected: number;
  address?: Address;
  preferences: UserPreferences;
  isVerified: boolean;
  lastLogin?: string;
}

/**
 * User role
 */
export enum UserRole {
  CUSTOMER = 'customer',
  DELIVERY_PERSONNEL = 'delivery_personnel',
  STORE_MANAGER = 'store_manager',
  ADMIN = 'admin'
}

/**
 * User preferences
 */
export interface UserPreferences {
  notifications: NotificationPreferences;
  themeMode: 'light' | 'dark' | 'system';
  language: string;
  currency: string;
  autoSchedule: boolean;
  showImpactMetrics: boolean;
}

/**
 * Notification preferences
 */
export interface NotificationPreferences {
  enablePush: boolean;
  enableEmail: boolean;
  enableSMS: boolean;
  collectionReminders: boolean;
  deliveryUpdates: boolean;
  creditAlerts: boolean;
  communityUpdates: boolean;
  weeklyReport: boolean;
}

/**
 * Physical address
 */
export interface Address {
  line1: string;
  line2?: string;
  city: string;
  state: string;
  postalCode: string;
  country: string;
  coordinates?: {
    latitude: number;
    longitude: number;
  };
  instructions?: string;
}

/**
 * Collection request
 */
export interface CollectionRequest extends BaseModel {
  userId: string;
  scheduleId?: string;
  status: CollectionStatus;
  scheduledDate: string;
  timeSlot: TimeSlot;
  materials: CollectionMaterial[];
  address: Address;
  notes?: string;
  assignedTo?: string;
  estimatedWeight?: number;
  actualWeight?: number;
  creditAmount?: number;
  images?: string[];
  deliveryPersonnelNotes?: string;
  cancellationReason?: string;
  isRecurring: boolean;
  recurrencePattern?: RecurrencePattern;
}

/**
 * Collection status
 */
export enum CollectionStatus {
  PENDING = 'pending',
  SCHEDULED = 'scheduled',
  ASSIGNED = 'assigned',
  IN_PROGRESS = 'in_progress',
  COMPLETED = 'completed',
  CANCELLED = 'cancelled',
  MISSED = 'missed'
}

/**
 * Material being collected
 */
export interface CollectionMaterial {
  materialId: string;
  materialName: string;
  estimatedQuantity: number;
  estimatedWeight: number;
  actualWeight?: number;
  creditPerKg: number;
  totalCredits?: number;
}

/**
 * Time slot for collection
 */
export interface TimeSlot {
  startTime: string;
  endTime: string;
  label: string;
}

/**
 * Recurrence pattern for collection
 */
export interface RecurrencePattern {
  frequency: 'daily' | 'weekly' | 'monthly';
  interval: number;
  daysOfWeek?: number[];
  dayOfMonth?: number;
  endDate?: string;
  occurrences?: number;
}

/**
 * Credit transaction
 */
export interface CreditTransaction extends BaseModel {
  userId: string;
  amount: number;
  type: CreditTransactionType;
  description: string;
  relatedId?: string;
  relatedType?: 'collection' | 'reward' | 'adjustment';
  balanceAfter: number;
}

/**
 * Credit transaction type
 */
export enum CreditTransactionType {
  COLLECTION_CREDIT = 'collection_credit',
  REWARD_REDEMPTION = 'reward_redemption',
  ADJUSTMENT = 'adjustment',
  BONUS = 'bonus',
  REFERRAL = 'referral'
}

/**
 * Reward
 */
export interface Reward extends BaseModel {
  name: string;
  description: string;
  imageUrl?: string;
  creditCost: number;
  category: RewardCategory;
  terms?: string;
  expiryDate?: string;
  inventory?: number;
  isActive: boolean;
  redemptionInstructions?: string;
  sponsorId?: string;
  sponsorName?: string;
}

/**
 * Reward category
 */
export enum RewardCategory {
  GROCERY_DISCOUNT = 'grocery_discount',
  STORE_COUPON = 'store_coupon',
  ECO_PRODUCT = 'eco_product',
  DONATION = 'donation',
  EXPERIENCE = 'experience'
}

/**
 * Grocery store
 */
export interface GroceryStore extends BaseModel {
  name: string;
  logoUrl?: string;
  address: Address;
  operatingHours: OperatingHours[];
  phone: string;
  website?: string;
  isActive: boolean;
  collectionDepotAvailable: boolean;
  depotHours?: OperatingHours[];
  supportedMaterials: string[];
}

/**
 * Operating hours
 */
export interface OperatingHours {
  day: 0 | 1 | 2 | 3 | 4 | 5 | 6;
  isOpen: boolean;
  openTime?: string;
  closeTime?: string;
}

/**
 * Community challenge
 */
export interface CommunityChallenge extends BaseModel {
  title: string;
  description: string;
  imageUrl?: string;
  startDate: string;
  endDate: string;
  goal: number;
  unit: 'kg' | 'items' | 'participants';
  currentProgress: number;
  rewards?: Reward[];
  participants: number;
  rules?: string;
  isActive: boolean;
}

/**
 * Environmental impact
 */
export interface EnvironmentalImpact {
  plasticWeight: number;
  co2Reduction: number;
  waterSaved: number;
  energySaved: number;
  treesEquivalent: number;
  landfillSpace: number;
}

/**
 * Notification
 */
export interface Notification extends BaseModel {
  userId: string;
  title: string;
  body: string;
  type: NotificationType;
  isRead: boolean;
  actionUrl?: string;
  imageUrl?: string;
  metaData?: Record<string, any>;
}

/**
 * Notification type
 */
export enum NotificationType {
  COLLECTION_REMINDER = 'collection_reminder',
  COLLECTION_UPDATE = 'collection_update',
  CREDIT_EARNED = 'credit_earned',
  REWARD_AVAILABLE = 'reward_available',
  COMMUNITY_UPDATE = 'community_update',
  GENERAL = 'general'
}

/**
 * Delivery personnel
 */
export interface DeliveryPersonnel extends BaseModel {
  userId: string;
  isActive: boolean;
  currentLocation?: {
    latitude: number;
    longitude: number;
    lastUpdated: string;
  };
  vehicleType: VehicleType;
  vehicleRegistration?: string;
  maxCapacity: number;
  collectionsCompleted: number;
  rating: number;
  averageCollectionTime: number;
  storeId: string;
}

/**
 * Vehicle type
 */
export enum VehicleType {
  CAR = 'car',
  VAN = 'van',
  BICYCLE = 'bicycle',
  SCOOTER = 'scooter',
  TRUCK = 'truck'
}

/**
 * Delivery route
 */
export interface DeliveryRoute extends BaseModel {
  deliveryPersonnelId: string;
  date: string;
  status: 'planned' | 'in_progress' | 'completed';
  startTime?: string;
  endTime?: string;
  stops: RouteStop[];
  totalDistance: number;
  totalTime: number;
  optimized: boolean;
}

/**
 * Route stop
 */
export interface RouteStop {
  id: string;
  type: 'collection' | 'delivery' | 'depot' | 'store';
  address: Address;
  scheduledTime: string;
  estimatedArrivalTime: string;
  actualArrivalTime?: string;
  estimatedDepartureTime: string;
  actualDepartureTime?: string;
  status: 'pending' | 'completed' | 'skipped';
  relatedId: string;
  relatedType: 'collection' | 'delivery' | 'depot' | 'store';
  notes?: string;
  sequence: number;
}

/**
 * Export existing models and interfaces
 */
export type { Material };
