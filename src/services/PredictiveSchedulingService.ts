/**
 * PredictiveSchedulingService
 * 
 * Uses historical data and machine learning algorithms to predict optimal collection times
 * and generate smart schedules for waste collection.
 */

import { SafeStorage } from '@/utils/storage';
import { CollectionService } from './CollectionService';
import { UserProfileService } from './UserProfileService';
import { WeatherService } from './WeatherService';

// Collection history item interface
interface CollectionHistoryItem {
  id: string;
  userId: string;
  timestamp: string;
  dayOfWeek: number;
  hourOfDay: number;
  materialTypes: string[];
  totalWeight: number;
  location: {
    latitude: number;
    longitude: number;
    address: string;
  };
  isCompleted: boolean;
  completionTime?: string;
}

// Prediction result interface
export interface PredictionResult {
  dayOfWeek: number;
  hourOfDay: number;
  confidence: number;
  suggestedTimeSlot: string;
  expectedMaterials: string[];
  expectedWeight: number;
}

// Scheduling recommendation
export interface SchedulingRecommendation {
  userId: string;
  optimalDay: number;
  optimalTimeStart: number;
  optimalTimeEnd: number;
  confidenceScore: number;
  expectedMaterialTypes: string[];
  expectedTotalWeight: number;
  nextSuggestedDate: Date;
  alternativeDates: Date[];
  reasoning: string[];
  environmentalImpact: {
    co2Saved: number;
    treesEquivalent: number;
  };
}

class PredictiveSchedulingService {
  private static instance: PredictiveSchedulingService;
  private collectionHistory: Record<string, CollectionHistoryItem[]> = {};
  private collectionService: CollectionService;
  private userProfileService: UserProfileService;
  private weatherService: WeatherService;
  
  private constructor() {
    this.collectionService = CollectionService.getInstance();
    this.userProfileService = UserProfileService.getInstance();
    this.weatherService = WeatherService.getInstance();
  }
  
  /**
   * Gets the singleton instance of the service
   */
  public static getInstance(): PredictiveSchedulingService {
    if (!PredictiveSchedulingService.instance) {
      PredictiveSchedulingService.instance = new PredictiveSchedulingService();
    }
    return PredictiveSchedulingService.instance;
  }
  
  /**
   * Initialize user's prediction model
   * @param userId User ID to initialize for
   */
  public async initialize(userId: string): Promise<boolean> {
    try {
      await this.loadUserCollectionHistory(userId);
      return true;
    } catch (error) {
      console.error('Failed to initialize predictive scheduling:', error);
      return false;
    }
  }
  
  /**
   * Load user's collection history
   * @param userId User ID to load history for
   */
  private async loadUserCollectionHistory(userId: string): Promise<void> {
    try {
      // First try to load from local storage
      const historyData = await SafeStorage.getItem(`collection_history_${userId}`);
      
      if (historyData) {
        this.collectionHistory[userId] = JSON.parse(historyData);
      } else {
        // If not in storage, load from API
        const collections = await this.collectionService.getUserCollectionHistory(userId);
        
        // Transform and store the collection history
        this.collectionHistory[userId] = collections.map(collection => {
          const date = new Date(collection.scheduledDate);
          return {
            id: collection.id,
            userId: collection.userId,
            timestamp: collection.scheduledDate,
            dayOfWeek: date.getDay(),
            hourOfDay: date.getHours(),
            materialTypes: collection.materials,
            totalWeight: collection.totalWeight,
            location: collection.location,
            isCompleted: collection.status === 'completed',
            completionTime: collection.completedAt,
          };
        });
        
        // Save to storage for faster access next time
        await SafeStorage.setItem(
          `collection_history_${userId}`,
          JSON.stringify(this.collectionHistory[userId])
        );
      }
    } catch (error) {
      console.error('Failed to load collection history:', error);
      this.collectionHistory[userId] = [];
    }
  }
  
  /**
   * Predict optimal collection time for a user
   * @param userId User ID to predict for
   */
  public async predictOptimalCollectionTime(userId: string): Promise<PredictionResult | null> {
    // Ensure history is loaded
    if (!this.collectionHistory[userId]) {
      await this.loadUserCollectionHistory(userId);
    }
    
    const history = this.collectionHistory[userId] || [];
    
    // Need at least 3 data points for reasonable prediction
    if (history.length < 3) {
      return null;
    }
    
    // Count frequency of each day and hour
    const dayFrequency: Record<number, number> = {};
    const hourFrequency: Record<number, number> = {};
    const materialCounts: Record<string, number> = {};
    let totalWeight = 0;
    
    for (const item of history) {
      // Only consider completed collections for predictions
      if (item.isCompleted) {
        // Count day frequency (0-6, Sunday-Saturday)
        dayFrequency[item.dayOfWeek] = (dayFrequency[item.dayOfWeek] || 0) + 1;
        
        // Count hour frequency (0-23)
        hourFrequency[item.hourOfDay] = (hourFrequency[item.hourOfDay] || 0) + 1;
        
        // Count material types
        for (const material of item.materialTypes) {
          materialCounts[material] = (materialCounts[material] || 0) + 1;
        }
        
        // Sum up weights
        totalWeight += item.totalWeight;
      }
    }
    
    // Find most frequent day
    let maxDayFreq = 0;
    let predictedDay = -1;
    
    for (const day in dayFrequency) {
      if (dayFrequency[day] > maxDayFreq) {
        maxDayFreq = dayFrequency[day];
        predictedDay = parseInt(day);
      }
    }
    
    // Find most frequent hour
    let maxHourFreq = 0;
    let predictedHour = -1;
    
    for (const hour in hourFrequency) {
      if (hourFrequency[hour] > maxHourFreq) {
        maxHourFreq = hourFrequency[hour];
        predictedHour = parseInt(hour);
      }
    }
    
    // If we couldn't predict either day or hour, return null
    if (predictedDay === -1 || predictedHour === -1) {
      return null;
    }
    
    // Calculate confidence score (0-1)
    const dayConfidence = maxDayFreq / history.length;
    const hourConfidence = maxHourFreq / history.length;
    const overallConfidence = (dayConfidence + hourConfidence) / 2;
    
    // Get most frequent materials
    const expectedMaterials = Object.entries(materialCounts)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 3)
      .map(entry => entry[0]);
    
    // Calculate expected weight (average of completed collections)
    const completedCount = history.filter(item => item.isCompleted).length;
    const expectedWeight = completedCount > 0 ? totalWeight / completedCount : 0;
    
    // Format time slot string
    const dayNames = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
    const timeFormat = predictedHour >= 12 ? 
      `${predictedHour > 12 ? predictedHour - 12 : predictedHour}:00 PM` : 
      `${predictedHour === 0 ? 12 : predictedHour}:00 AM`;
    
    const suggestedTimeSlot = `${dayNames[predictedDay]} at ${timeFormat}`;
    
    return {
      dayOfWeek: predictedDay,
      hourOfDay: predictedHour,
      confidence: overallConfidence,
      suggestedTimeSlot,
      expectedMaterials,
      expectedWeight,
    };
  }
  
  /**
   * Generate a comprehensive scheduling recommendation
   * @param userId User ID to generate recommendation for
   */
  public async generateSchedulingRecommendation(userId: string): Promise<SchedulingRecommendation | null> {
    try {
      // Get basic prediction
      const prediction = await this.predictOptimalCollectionTime(userId);
      
      if (!prediction) {
        return null;
      }
      
      // Get user profile for personalization
      const userProfile = await this.userProfileService.getUserProfile(userId);
      
      if (!userProfile) {
        return null;
      }
      
      // Get weather forecast to avoid scheduling on rainy days
      const forecast = await this.weatherService.getForecast(userProfile.location.latitude, userProfile.location.longitude);
      
      // Calculate next optimal date
      const nextOptimalDate = this.getNextDateForDayOfWeek(prediction.dayOfWeek);
      const optimalHour = prediction.hourOfDay;
      
      // Adjust for weather conditions - avoid rainy days
      const alternativeDates: Date[] = [];
      const reasoning: string[] = [];
      
      // Add reasoning for the recommendation
      reasoning.push(`Based on your ${this.collectionHistory[userId].length} previous collections`);
      reasoning.push(`You typically recycle on ${prediction.suggestedTimeSlot}`);
      
      // Check if the optimal day has bad weather
      const badWeather = forecast.some(item => {
        const forecastDate = new Date(item.date);
        return (
          forecastDate.getDate() === nextOptimalDate.getDate() &&
          forecastDate.getMonth() === nextOptimalDate.getMonth() &&
          (item.conditions === 'rain' || item.conditions === 'thunderstorm' || item.conditions === 'snow')
        );
      });
      
      if (badWeather) {
        reasoning.push(`Weather forecast indicates poor conditions on ${nextOptimalDate.toLocaleDateString()}`);
        
        // Find alternative dates with better weather
        for (let i = 1; i <= 7; i++) {
          const altDate = new Date(nextOptimalDate);
          altDate.setDate(altDate.getDate() + i);
          
          const hasGoodWeather = !forecast.some(item => {
            const forecastDate = new Date(item.date);
            return (
              forecastDate.getDate() === altDate.getDate() &&
              forecastDate.getMonth() === altDate.getMonth() &&
              (item.conditions === 'rain' || item.conditions === 'thunderstorm' || item.conditions === 'snow')
            );
          });
          
          if (hasGoodWeather) {
            alternativeDates.push(new Date(altDate));
            reasoning.push(`Alternative date: ${altDate.toLocaleDateString()} has better weather conditions`);
            
            if (alternativeDates.length >= 3) {
              break; // Limit to 3 alternatives
            }
          }
        }
      }
      
      // Set time for next optimal date
      nextOptimalDate.setHours(optimalHour, 0, 0, 0);
      
      // Set time for alternative dates
      alternativeDates.forEach(date => {
        date.setHours(optimalHour, 0, 0, 0);
      });
      
      // Calculate environmental impact
      const avgWeight = prediction.expectedWeight;
      const co2PerKg = 2.5; // Average CO2 saved per kg of recycled materials
      const treesPerTon = 17; // Number of trees equivalent to one ton of CO2
      
      const co2Saved = avgWeight * co2PerKg;
      const treesEquivalent = (co2Saved / 1000) * treesPerTon;
      
      // Generate the recommendation
      const recommendation: SchedulingRecommendation = {
        userId,
        optimalDay: prediction.dayOfWeek,
        optimalTimeStart: prediction.hourOfDay,
        optimalTimeEnd: prediction.hourOfDay + 1,
        confidenceScore: prediction.confidence,
        expectedMaterialTypes: prediction.expectedMaterials,
        expectedTotalWeight: prediction.expectedWeight,
        nextSuggestedDate: nextOptimalDate,
        alternativeDates: alternativeDates.length > 0 ? alternativeDates : [new Date(nextOptimalDate)],
        reasoning,
        environmentalImpact: {
          co2Saved,
          treesEquivalent,
        }
      };
      
      return recommendation;
    } catch (error) {
      console.error('Failed to generate scheduling recommendation:', error);
      return null;
    }
  }
  
  /**
   * Update model with new collection data
   * @param userId User ID
   * @param collectionData Collection data to add to the model
   */
  public async addCollectionData(userId: string, collectionData: CollectionHistoryItem): Promise<void> {
    try {
      // Ensure history is loaded
      if (!this.collectionHistory[userId]) {
        await this.loadUserCollectionHistory(userId);
      }
      
      // Add new data
      this.collectionHistory[userId].push(collectionData);
      
      // Save updated history
      await SafeStorage.setItem(
        `collection_history_${userId}`,
        JSON.stringify(this.collectionHistory[userId])
      );
    } catch (error) {
      console.error('Failed to add collection data:', error);
    }
  }
  
  /**
   * Get the next date for a specific day of the week
   * @param dayOfWeek Day of week (0-6, Sunday-Saturday)
   */
  private getNextDateForDayOfWeek(dayOfWeek: number): Date {
    const today = new Date();
    const todayDayOfWeek = today.getDay();
    const daysUntilNextDay = dayOfWeek >= todayDayOfWeek ? 
      dayOfWeek - todayDayOfWeek : 
      7 - (todayDayOfWeek - dayOfWeek);
    
    const nextDate = new Date(today);
    nextDate.setDate(today.getDate() + daysUntilNextDay);
    return nextDate;
  }
  
  /**
   * Get user collection patterns
   * @param userId User ID
   */
  public getUserCollectionPatterns(userId: string): Record<string, any> | null {
    if (!this.collectionHistory[userId] || this.collectionHistory[userId].length < 3) {
      return null;
    }
    
    const history = this.collectionHistory[userId];
    
    // Calculate frequency patterns
    const dayFrequency: Record<number, number> = {};
    const hourFrequency: Record<number, number> = {};
    const materialFrequency: Record<string, number> = {};
    
    // Calculate intervals between collections
    const intervals: number[] = [];
    let previousTimestamp: number | null = null;
    
    for (const item of history) {
      // Count day and hour frequencies
      dayFrequency[item.dayOfWeek] = (dayFrequency[item.dayOfWeek] || 0) + 1;
      hourFrequency[item.hourOfDay] = (hourFrequency[item.hourOfDay] || 0) + 1;
      
      // Count materials
      for (const material of item.materialTypes) {
        materialFrequency[material] = (materialFrequency[material] || 0) + 1;
      }
      
      // Calculate interval from previous collection (in days)
      const timestamp = new Date(item.timestamp).getTime();
      if (previousTimestamp !== null) {
        const daysDiff = Math.floor((timestamp - previousTimestamp) / (1000 * 60 * 60 * 24));
        if (daysDiff > 0) {
          intervals.push(daysDiff);
        }
      }
      previousTimestamp = timestamp;
    }
    
    // Calculate average interval
    const avgInterval = intervals.length > 0 ? 
      intervals.reduce((sum, val) => sum + val, 0) / intervals.length : 
      null;
    
    // Determine if there's a regular pattern
    const hasRegularPattern = intervals.length > 2 && 
      intervals.every(interval => Math.abs(interval - avgInterval!) <= 1);
    
    return {
      totalCollections: history.length,
      completedCollections: history.filter(item => item.isCompleted).length,
      dayFrequency,
      hourFrequency,
      materialFrequency,
      averageInterval: avgInterval,
      hasRegularPattern,
      intervals,
    };
  }
}

export default PredictiveSchedulingService; 