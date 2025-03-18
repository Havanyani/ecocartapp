/**
 * SchedulingService.ts
 * 
 * A service for managing collection appointment scheduling, including
 * one-time and recurring collection patterns.
 */

import {
    Collection,
    CollectionLocation,
    CollectionStatus,
    TimeSlot
} from '@/types/Collection';
import { OfflineQueueManager } from '@/utils/OfflineQueueManager';
import { SafeStorage } from '@/utils/storage';
import { ApiService } from './ApiService';
import NotificationService from './NotificationService';

/**
 * Enum for recurrence frequency options
 */
export enum RecurrenceFrequency {
  WEEKLY = 'WEEKLY',
  BI_WEEKLY = 'BI_WEEKLY',
  MONTHLY = 'MONTHLY',
  CUSTOM = 'CUSTOM',
}

/**
 * Interface for recurrence pattern
 */
export interface RecurrencePattern {
  frequency: RecurrenceFrequency;
  dayOfWeek?: number[];  // Days of week (0-6, Sunday to Saturday)
  dayOfMonth?: number[]; // Days of month (1-31)
  interval?: number;     // For custom recurrence (number of weeks)
  endDate?: string;      // ISO date string
  occurrences?: number;  // Number of occurrences
}

/**
 * Interface for schedule collection request
 */
export interface ScheduleCollectionRequest {
  scheduledTime: string;           // ISO date string
  materials: string[];             // Array of material IDs
  notes?: string;                  // Optional notes
  recurrencePattern?: RecurrencePattern; // Optional recurrence pattern
}

/**
 * Interface for schedule response
 */
export interface ScheduleResponse {
  collectionId: string;
  scheduledTime: string;
  materials: string[];
  notes?: string;
  status: 'SCHEDULED' | 'COMPLETED' | 'CANCELLED';
  recurrenceId?: string;
  seriesId?: string;
  nextCollectionDate?: string;
}

export interface ScheduleRequest {
  userId: string;
  locationId: string;
  materials: string[];
  estimatedWeight: number;
  notes?: string;
  date: string;                     // ISO date string
  timeSlotId: string;
  isRecurring: boolean;
  recurrencePattern?: RecurrencePattern;
  notificationPreferences?: {
    reminderTime: number;           // Hours before collection
    channels: ('push'|'email'|'sms')[];
  };
}

export interface RecurringScheduleResponse {
  scheduleId: string;
  recurrenceId: string;
  collections: Collection[];
  nextCollectionDate: string;
}

export interface AvailabilityQuery {
  locationId: string;
  date: string;
  recurrencePattern?: RecurrencePattern;
}

export type DateAvailability = {
  date: string;
  hasAvailability: boolean;
  slots?: TimeSlot[];
}

export class SchedulingService {
  private static instance: SchedulingService;
  private static readonly ENDPOINT = '/scheduling';
  private apiService: ApiService;
  private notificationService: NotificationService;

  private constructor() {
    this.apiService = ApiService.getInstance();
    this.notificationService = NotificationService.getInstance();
  }

  public static getInstance(): SchedulingService {
    if (!SchedulingService.instance) {
      SchedulingService.instance = new SchedulingService();
    }
    return SchedulingService.instance;
  }

  /**
   * Schedule a collection appointment
   * @param request Schedule collection request
   * @returns Schedule response
   */
  public static async scheduleCollection(request: ScheduleCollectionRequest): Promise<ScheduleResponse> {
    try {
      // Call API to schedule collection
      const response = await ApiService.post<ScheduleResponse>('/collections/schedule', request);
      
      // Schedule notification for this collection
      const scheduledTime = new Date(request.scheduledTime);
      const notificationTime = new Date(scheduledTime.getTime());
      notificationTime.setHours(notificationTime.getHours() - 24); // 24 hours before
      
      // Schedule notification reminder
      await NotificationService.scheduleNotification({
        title: 'Collection Reminder',
        body: `You have a collection scheduled for ${scheduledTime.toLocaleDateString()} at ${scheduledTime.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}`,
        data: { collectionId: response.collectionId },
        trigger: { date: notificationTime },
      });
      
      // If this is a recurring collection, schedule overview notification
      if (request.recurrencePattern) {
        await NotificationService.scheduleNotification({
          title: 'Recurring Collection Series Created',
          body: `Your recurring collection series has been set up successfully.`,
          data: { 
            seriesId: response.seriesId,
            screen: 'CollectionSchedule'
          },
          trigger: { seconds: 5 }, // Show immediately after creating
        });
      }
      
      return response;
    } catch (error: any) {
      console.error('Failed to schedule collection:', error);
      throw new Error(error.message || 'Failed to schedule collection');
    }
  }
  
  /**
   * Get user's scheduled collections
   * @param includeCompleted Whether to include completed collections
   * @returns Array of schedule responses
   */
  public static async getScheduledCollections(includeCompleted: boolean = false): Promise<ScheduleResponse[]> {
    try {
      return await ApiService.get<ScheduleResponse[]>(
        `/collections/scheduled?includeCompleted=${includeCompleted}`
      );
    } catch (error: any) {
      console.error('Failed to get scheduled collections:', error);
      throw new Error(error.message || 'Failed to get scheduled collections');
    }
  }
  
  /**
   * Cancel a scheduled collection
   * @param collectionId ID of the collection to cancel
   * @param cancelEntireSeries Whether to cancel the entire series for recurring collections
   * @returns Success response
   */
  public static async cancelCollection(
    collectionId: string, 
    cancelEntireSeries: boolean = false
  ): Promise<{ success: boolean }> {
    try {
      const response = await ApiService.post<{ success: boolean }>(
        `/collections/cancel/${collectionId}`,
        { cancelEntireSeries }
      );
      
      // Cancel any scheduled notifications for this collection
      await NotificationService.cancelScheduledNotificationsByData({ collectionId });
      
      return response;
    } catch (error: any) {
      console.error('Failed to cancel collection:', error);
      throw new Error(error.message || 'Failed to cancel collection');
    }
  }
  
  /**
   * Reschedule a collection appointment
   * @param collectionId ID of the collection to reschedule
   * @param newScheduledTime New scheduled time (ISO date string)
   * @param updateEntireSeries Whether to update the entire series for recurring collections
   * @returns Updated schedule response
   */
  public static async rescheduleCollection(
    collectionId: string,
    newScheduledTime: string,
    updateEntireSeries: boolean = false
  ): Promise<ScheduleResponse> {
    try {
      const response = await ApiService.post<ScheduleResponse>(
        `/collections/reschedule/${collectionId}`,
        { newScheduledTime, updateEntireSeries }
      );
      
      // Cancel existing notifications and schedule new ones
      await NotificationService.cancelScheduledNotificationsByData({ collectionId });
      
      const scheduledTime = new Date(newScheduledTime);
      const notificationTime = new Date(scheduledTime.getTime());
      notificationTime.setHours(notificationTime.getHours() - 24); // 24 hours before
      
      await NotificationService.scheduleNotification({
        title: 'Collection Reminder',
        body: `You have a rescheduled collection for ${scheduledTime.toLocaleDateString()} at ${scheduledTime.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}`,
        data: { collectionId: response.collectionId },
        trigger: { date: notificationTime },
      });
      
      return response;
    } catch (error: any) {
      console.error('Failed to reschedule collection:', error);
      throw new Error(error.message || 'Failed to reschedule collection');
    }
  }
  
  /**
   * Update a collection's materials or notes
   * @param collectionId ID of the collection to update
   * @param updates Updates to apply (materials and/or notes)
   * @param updateEntireSeries Whether to update the entire series for recurring collections
   * @returns Updated schedule response
   */
  public static async updateCollectionDetails(
    collectionId: string,
    updates: { materials?: string[]; notes?: string },
    updateEntireSeries: boolean = false
  ): Promise<ScheduleResponse> {
    try {
      return await ApiService.post<ScheduleResponse>(
        `/collections/update/${collectionId}`,
        { ...updates, updateEntireSeries }
      );
    } catch (error: any) {
      console.error('Failed to update collection details:', error);
      throw new Error(error.message || 'Failed to update collection details');
    }
  }
  
  /**
   * Get all recurring collection series for the user
   * @returns Array of recurring collection series
   */
  public static async getRecurringSeries(): Promise<{
    seriesId: string;
    pattern: RecurrencePattern;
    nextCollections: ScheduleResponse[];
  }[]> {
    try {
      return await ApiService.get('/collections/recurring');
    } catch (error: any) {
      console.error('Failed to get recurring series:', error);
      throw new Error(error.message || 'Failed to get recurring series');
    }
  }
  
  /**
   * Find available time slots for collection
   * @param date Date to find slots for
   * @returns Array of available time slots
   */
  public static async getAvailableTimeSlots(date: string): Promise<string[]> {
    try {
      const response = await ApiService.get<{ slots: string[] }>(
        `/collections/available-slots?date=${date}`
      );
      return response.slots;
    } catch (error: any) {
      console.error('Failed to get available time slots:', error);
      throw new Error(error.message || 'Failed to get available time slots');
    }
  }

  /**
   * Schedule a one-time or recurring collection appointment
   */
  async scheduleCollection(request: ScheduleRequest): Promise<Collection | RecurringScheduleResponse> {
    try {
      const endpoint = request.isRecurring 
        ? `${SchedulingService.ENDPOINT}/recurring` 
        : `${SchedulingService.ENDPOINT}/one-time`;
      
      const response = await this.apiService.post(endpoint, request);
      
      // Set up notifications for the collection(s)
      if (request.notificationPreferences) {
        if (request.isRecurring) {
          const recurringResponse = response.data as RecurringScheduleResponse;
          await this.setupRecurringNotifications(
            recurringResponse.collections, 
            request.notificationPreferences
          );
        } else {
          const collection = response.data as Collection;
          await this.setupCollectionNotification(
            collection, 
            request.notificationPreferences
          );
        }
      }
      
      return response.data;
    } catch (error: any) {
      if (!navigator.onLine) {
        await OfflineQueueManager.addToQueue({
          type: 'SCHEDULE_COLLECTION',
          payload: request
        });
        
        // Store tentative booking locally
        await this.storeTentativeBooking(request);
        
        if (request.isRecurring) {
          return {
            scheduleId: 'offline-' + Date.now(),
            recurrenceId: 'offline-recurring-' + Date.now(),
            collections: [],
            nextCollectionDate: request.date
          };
        } else {
          return {
            id: 'offline-' + Date.now(),
            userId: request.userId,
            materials: [],
            location: { id: request.locationId } as CollectionLocation,
            scheduledDateTime: new Date(request.date),
            estimatedDuration: 60,
            status: 'pending' as CollectionStatus,
            createdAt: new Date(),
            updatedAt: new Date(),
            statusHistory: [],
          } as Collection;
        }
      }
      throw new Error('Failed to schedule collection: ' + (error.message || 'Unknown error'));
    }
  }
  
  /**
   * Get available time slots for a specific date
   */
  async getAvailableTimeSlots(date: string, locationId: string): Promise<TimeSlot[]> {
    try {
      const response = await this.apiService.get(
        `${SchedulingService.ENDPOINT}/availability`,
        { params: { date, locationId } }
      );
      return response.data;
    } catch (error) {
      if (!navigator.onLine) {
        // Return cached time slots if available
        const cachedSlots = await this.getCachedTimeSlots(date, locationId);
        if (cachedSlots && cachedSlots.length > 0) {
          return cachedSlots;
        }
      }
      throw new Error('Failed to fetch available time slots');
    }
  }
  
  /**
   * Check availability for recurring pattern
   */
  async checkRecurringAvailability(query: AvailabilityQuery): Promise<DateAvailability[]> {
    try {
      const response = await this.apiService.post(
        `${SchedulingService.ENDPOINT}/recurring-availability`,
        query
      );
      return response.data;
    } catch (error) {
      throw new Error('Failed to check recurring availability');
    }
  }
  
  /**
   * Get user's upcoming scheduled collections
   */
  async getUpcomingCollections(): Promise<Collection[]> {
    try {
      const response = await this.apiService.get(`${SchedulingService.ENDPOINT}/upcoming`);
      return response.data;
    } catch (error) {
      if (!navigator.onLine) {
        // Return locally stored tentative bookings
        return await this.getTentativeBookings();
      }
      throw new Error('Failed to fetch upcoming collections');
    }
  }
  
  /**
   * Get user's recurring collection schedules
   */
  async getRecurringSchedules(): Promise<RecurringScheduleResponse[]> {
    try {
      const response = await this.apiService.get(`${SchedulingService.ENDPOINT}/recurring`);
      return response.data;
    } catch (error) {
      throw new Error('Failed to fetch recurring schedules');
    }
  }
  
  /**
   * Update a recurring collection schedule
   */
  async updateRecurringSchedule(
    recurrenceId: string, 
    updates: Partial<ScheduleRequest>
  ): Promise<RecurringScheduleResponse> {
    try {
      const response = await this.apiService.patch(
        `${SchedulingService.ENDPOINT}/recurring/${recurrenceId}`,
        updates
      );
      return response.data;
    } catch (error) {
      throw new Error('Failed to update recurring schedule');
    }
  }
  
  /**
   * Cancel a recurring collection schedule
   */
  async cancelRecurringSchedule(recurrenceId: string): Promise<void> {
    try {
      await this.apiService.delete(`${SchedulingService.ENDPOINT}/recurring/${recurrenceId}`);
    } catch (error) {
      throw new Error('Failed to cancel recurring schedule');
    }
  }
  
  /**
   * Skip a specific occurrence in a recurring schedule
   */
  async skipOccurrence(recurrenceId: string, date: string): Promise<void> {
    try {
      await this.apiService.post(`${SchedulingService.ENDPOINT}/recurring/${recurrenceId}/skip`, {
        date
      });
    } catch (error) {
      throw new Error('Failed to skip occurrence');
    }
  }
  
  /**
   * Reschedule a specific occurrence in a recurring schedule
   */
  async rescheduleOccurrence(
    recurrenceId: string, 
    originalDate: string,
    newDate: string,
    timeSlotId: string
  ): Promise<Collection> {
    try {
      const response = await this.apiService.post(
        `${SchedulingService.ENDPOINT}/recurring/${recurrenceId}/reschedule`,
        {
          originalDate,
          newDate,
          timeSlotId
        }
      );
      return response.data;
    } catch (error) {
      throw new Error('Failed to reschedule occurrence');
    }
  }
  
  /**
   * Get the calendar availability for a month
   */
  async getMonthAvailability(year: number, month: number, locationId: string): Promise<DateAvailability[]> {
    try {
      const response = await this.apiService.get(
        `${SchedulingService.ENDPOINT}/month-availability`,
        { params: { year, month, locationId } }
      );
      
      // Cache the result
      this.cacheMonthAvailability(year, month, locationId, response.data);
      
      return response.data;
    } catch (error) {
      if (!navigator.onLine) {
        // Return cached availability if available
        const cachedAvailability = await this.getCachedMonthAvailability(year, month, locationId);
        if (cachedAvailability) {
          return cachedAvailability;
        }
      }
      throw new Error('Failed to fetch month availability');
    }
  }
  
  /**
   * Generate dates for a recurrence pattern starting from a specific date
   */
  generateRecurrenceDates(
    startDate: Date, 
    pattern: RecurrencePattern, 
    maxOccurrences: number = 10
  ): Date[] {
    const dates: Date[] = [];
    const currentDate = new Date(startDate);
    
    // Calculate end date if occurrences is specified
    let endDate: Date | null = null;
    if (pattern.endDate) {
      endDate = new Date(pattern.endDate);
    } else if (pattern.occurrences) {
      // Will be calculated as we go
      maxOccurrences = pattern.occurrences;
    }
    
    let occurrenceCount = 0;
    
    while (occurrenceCount < maxOccurrences) {
      // Check if we've reached the end date
      if (endDate && currentDate > endDate) {
        break;
      }
      
      let shouldAdd = false;
      
      switch (pattern.frequency) {
        case RecurrenceFrequency.WEEKLY:
          // Check if current day of week matches
          if (!pattern.dayOfWeek || pattern.dayOfWeek.includes(currentDate.getDay())) {
            shouldAdd = true;
          }
          // Move to next day
          currentDate.setDate(currentDate.getDate() + 1);
          break;
          
        case RecurrenceFrequency.BI_WEEKLY:
          // Check if current day of week matches and we're in an "on" week
          if (!pattern.dayOfWeek || pattern.dayOfWeek.includes(currentDate.getDay())) {
            // Calculate week number since start date
            const weeksSinceStart = Math.floor(
              (currentDate.getTime() - startDate.getTime()) / (7 * 24 * 60 * 60 * 1000)
            );
            if (weeksSinceStart % 2 === 0) {
              shouldAdd = true;
            }
          }
          // Move to next day
          currentDate.setDate(currentDate.getDate() + 1);
          break;
          
        case RecurrenceFrequency.MONTHLY:
          // Check if current day of month matches
          if (!pattern.dayOfMonth || pattern.dayOfMonth.includes(currentDate.getDate())) {
            shouldAdd = true;
          }
          // Move to next day
          currentDate.setDate(currentDate.getDate() + 1);
          
          // If we've moved to a new month and haven't found a match, jump to the 1st of next month
          if (currentDate.getDate() === 1 && !shouldAdd) {
            // We've moved to a new month, but haven't added any dates yet
            const newDate = new Date(currentDate);
            newDate.setMonth(newDate.getMonth() + 1);
            newDate.setDate(1);
            currentDate.setTime(newDate.getTime());
          }
          break;
          
        case RecurrenceFrequency.CUSTOM:
          // For custom patterns with specific interval
          const interval = pattern.interval || 1;
          if (pattern.dayOfWeek && pattern.dayOfWeek.includes(currentDate.getDay())) {
            // Calculate days since start
            const daysSinceStart = Math.floor(
              (currentDate.getTime() - startDate.getTime()) / (24 * 60 * 60 * 1000)
            );
            if (daysSinceStart % (7 * interval) === 0) {
              shouldAdd = true;
            }
          }
          // Move to next day
          currentDate.setDate(currentDate.getDate() + 1);
          break;
      }
      
      if (shouldAdd) {
        dates.push(new Date(currentDate.getTime() - 24 * 60 * 60 * 1000)); // Subtract one day since we've already incremented
        occurrenceCount++;
      }
    }
    
    return dates;
  }
  
  // Private methods
  
  /**
   * Set up a notification for a collection
   */
  private async setupCollectionNotification(
    collection: Collection, 
    preferences: ScheduleRequest['notificationPreferences']
  ): Promise<void> {
    if (!preferences) return;
    
    const scheduledDate = new Date(collection.scheduledDateTime);
    const reminderDate = new Date(scheduledDate);
    reminderDate.setHours(reminderDate.getHours() - preferences.reminderTime);
    
    // Skip if reminder date is in the past
    if (reminderDate < new Date()) return;
    
    await this.notificationService.scheduleNotification({
      id: `collection-reminder-${collection.id}`,
      title: 'Upcoming Collection Reminder',
      body: `Your collection is scheduled for ${scheduledDate.toLocaleString()}`,
      data: { collectionId: collection.id },
      trigger: { date: reminderDate }
    });
  }
  
  /**
   * Set up notifications for recurring collections
   */
  private async setupRecurringNotifications(
    collections: Collection[],
    preferences: ScheduleRequest['notificationPreferences']
  ): Promise<void> {
    if (!preferences || collections.length === 0) return;
    
    // Schedule notifications for each collection
    for (const collection of collections) {
      await this.setupCollectionNotification(collection, preferences);
    }
  }
  
  /**
   * Store a tentative booking while offline
   */
  private async storeTentativeBooking(request: ScheduleRequest): Promise<void> {
    try {
      const bookings = await this.getTentativeBookings();
      bookings.push({
        id: 'offline-' + Date.now(),
        userId: request.userId,
        scheduledDateTime: new Date(request.date),
        status: 'pending' as CollectionStatus,
        createdAt: new Date(),
        updatedAt: new Date(),
        statusHistory: [{
          status: 'pending',
          timestamp: new Date(),
          note: 'Created while offline'
        }],
        notes: request.notes || 'Created while offline, will be synced when online',
        estimatedDuration: 60, // Default duration
        // Placeholder data
        materials: [],
        location: { id: request.locationId } as CollectionLocation,
      } as Collection);
      
      await SafeStorage.setItem('tentative_bookings', JSON.stringify(bookings));
    } catch (error) {
      console.error('Failed to store tentative booking', error);
    }
  }
  
  /**
   * Get all tentative bookings stored locally
   */
  private async getTentativeBookings(): Promise<Collection[]> {
    try {
      const bookingsJson = await SafeStorage.getItem('tentative_bookings');
      return bookingsJson ? JSON.parse(bookingsJson) : [];
    } catch (error) {
      console.error('Failed to get tentative bookings', error);
      return [];
    }
  }
  
  /**
   * Cache time slots for a specific date and location
   */
  private async cacheTimeSlots(date: string, locationId: string, slots: TimeSlot[]): Promise<void> {
    try {
      const key = `timeslots_${date}_${locationId}`;
      await SafeStorage.setItem(key, JSON.stringify(slots));
      
      // Set expiration (24 hours)
      const expiration = Date.now() + 24 * 60 * 60 * 1000;
      await SafeStorage.setItem(`${key}_exp`, expiration.toString());
    } catch (error) {
      console.error('Failed to cache time slots', error);
    }
  }
  
  /**
   * Get cached time slots for a specific date and location
   */
  private async getCachedTimeSlots(date: string, locationId: string): Promise<TimeSlot[] | null> {
    try {
      const key = `timeslots_${date}_${locationId}`;
      
      // Check expiration
      const expirationStr = await SafeStorage.getItem(`${key}_exp`);
      if (!expirationStr || parseInt(expirationStr) < Date.now()) {
        return null;
      }
      
      const slotsJson = await SafeStorage.getItem(key);
      return slotsJson ? JSON.parse(slotsJson) : null;
    } catch (error) {
      console.error('Failed to get cached time slots', error);
      return null;
    }
  }
  
  /**
   * Cache availability for a month
   */
  private async cacheMonthAvailability(
    year: number, 
    month: number, 
    locationId: string, 
    availability: DateAvailability[]
  ): Promise<void> {
    try {
      const key = `month_availability_${year}_${month}_${locationId}`;
      await SafeStorage.setItem(key, JSON.stringify(availability));
      
      // Set expiration (24 hours)
      const expiration = Date.now() + 24 * 60 * 60 * 1000;
      await SafeStorage.setItem(`${key}_exp`, expiration.toString());
    } catch (error) {
      console.error('Failed to cache month availability', error);
    }
  }
  
  /**
   * Get cached availability for a month
   */
  private async getCachedMonthAvailability(
    year: number, 
    month: number, 
    locationId: string
  ): Promise<DateAvailability[] | null> {
    try {
      const key = `month_availability_${year}_${month}_${locationId}`;
      
      // Check expiration
      const expirationStr = await SafeStorage.getItem(`${key}_exp`);
      if (!expirationStr || parseInt(expirationStr) < Date.now()) {
        return null;
      }
      
      const availabilityJson = await SafeStorage.getItem(key);
      return availabilityJson ? JSON.parse(availabilityJson) : null;
    } catch (error) {
      console.error('Failed to get cached month availability', error);
      return null;
    }
  }
}

export default SchedulingService; 