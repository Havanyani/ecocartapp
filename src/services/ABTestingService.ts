/**
 * ABTestingService.ts
 * 
 * Service for managing A/B tests in the EcoCart app.
 * Provides functionality for defining experiments, assigning users to variants,
 * tracking conversions, and analyzing results.
 */

import { SafeStorage } from '@/utils/storage';

// Types of experiment variants
export type Variant = 'A' | 'B' | 'C' | 'D';

// Configuration for an experiment
export interface ExperimentConfig {
  id: string;
  name: string;
  description: string;
  variants: Variant[];
  weights?: number[]; // Optional weights for each variant (must sum to 1)
  isActive: boolean;
  startDate: string;
  endDate?: string;
  targetUserPercentage?: number; // What percentage of users to include (0-1)
  targetUserSegments?: string[]; // Optional user segments to target
}

// User's assigned experiment variant
export interface UserExperiment {
  experimentId: string;
  variant: Variant;
  assignedAt: string;
  hasConverted: boolean;
  conversionEvents: {
    eventName: string;
    timestamp: string;
  }[];
}

// Experiment results
export interface ExperimentResults {
  experimentId: string;
  totalUsers: number;
  variantCounts: Record<Variant, number>;
  conversionRates: Record<Variant, number>;
  leadingVariant?: Variant;
  confidence?: number; // Statistical confidence (0-1)
}

/**
 * Service for managing A/B tests
 */
export class ABTestingService {
  private static readonly EXPERIMENTS_CONFIG_KEY = '@ecocart/ab_experiments_config';
  private static readonly USER_EXPERIMENTS_KEY = '@ecocart/user_experiments';
  private static readonly USER_HASH_KEY = '@ecocart/user_hash';
  
  private static experiments: Map<string, ExperimentConfig> = new Map();
  private static userExperiments: Map<string, UserExperiment> = new Map();
  private static isInitialized = false;
  private static userHash: string | null = null;
  private static userSegments: string[] = [];

  /**
   * Initialize the A/B testing service
   * Loads experiment configurations and user assignments
   */
  static async initialize(): Promise<void> {
    if (this.isInitialized) {
      return;
    }

    try {
      // Load experiments configuration
      await this.loadExperiments();
      
      // Load user's assigned experiments
      await this.loadUserExperiments();
      
      // Generate or retrieve user hash for consistent experiment assignments
      await this.getUserHash();
      
      this.isInitialized = true;
      console.log(`A/B Testing initialized with ${this.experiments.size} active experiments`);
    } catch (error) {
      console.error('Failed to initialize A/B Testing:', error);
    }
  }

  /**
   * Get the variant for a specific experiment
   * If user is not yet assigned, they will be assigned to a variant
   * 
   * @param experimentId ID of the experiment
   * @returns The variant assigned to the user, or null if experiment doesn't exist
   */
  static async getVariant(experimentId: string): Promise<Variant | null> {
    if (!this.isInitialized) {
      await this.initialize();
    }

    // Check if experiment exists and is active
    const experiment = this.experiments.get(experimentId);
    if (!experiment || !experiment.isActive) {
      return null;
    }

    // Check if experiment has ended
    if (experiment.endDate && new Date(experiment.endDate) < new Date()) {
      return null;
    }

    // Check if user is already assigned to this experiment
    const userExperiment = this.userExperiments.get(experimentId);
    if (userExperiment) {
      return userExperiment.variant;
    }

    // Check if user should be included in this experiment based on targeting
    if (!this.shouldIncludeUserInExperiment(experiment)) {
      return null;
    }

    // Assign user to a variant
    const variant = this.assignVariant(experiment);
    if (variant) {
      // Store the assignment
      const now = new Date().toISOString();
      const newUserExperiment: UserExperiment = {
        experimentId,
        variant,
        assignedAt: now,
        hasConverted: false,
        conversionEvents: [],
      };
      
      this.userExperiments.set(experimentId, newUserExperiment);
      await this.saveUserExperiments();
    }

    return variant;
  }

  /**
   * Track a conversion event for an experiment
   * 
   * @param experimentId ID of the experiment
   * @param eventName Name of the conversion event
   * @returns Whether the conversion was tracked successfully
   */
  static async trackConversion(experimentId: string, eventName: string): Promise<boolean> {
    if (!this.isInitialized) {
      await this.initialize();
    }

    // Check if user is part of this experiment
    const userExperiment = this.userExperiments.get(experimentId);
    if (!userExperiment) {
      return false;
    }

    // Add conversion event
    const now = new Date().toISOString();
    userExperiment.conversionEvents.push({
      eventName,
      timestamp: now,
    });
    
    // Mark as converted
    userExperiment.hasConverted = true;
    
    // Save updated user experiments
    this.userExperiments.set(experimentId, userExperiment);
    await this.saveUserExperiments();
    
    return true;
  }

  /**
   * Create or update an experiment
   * 
   * @param config Experiment configuration
   * @returns Whether the operation was successful
   */
  static async setExperiment(config: ExperimentConfig): Promise<boolean> {
    if (!this.isInitialized) {
      await this.initialize();
    }

    try {
      // Validate weights if provided
      if (config.weights) {
        if (config.weights.length !== config.variants.length) {
          throw new Error('Number of weights must match number of variants');
        }
        
        const sum = config.weights.reduce((a, b) => a + b, 0);
        if (Math.abs(sum - 1) > 0.0001) {
          throw new Error('Weights must sum to 1');
        }
      }
      
      // Store experiment
      this.experiments.set(config.id, config);
      await this.saveExperiments();
      
      return true;
    } catch (error) {
      console.error(`Error setting experiment ${config.id}:`, error);
      return false;
    }
  }

  /**
   * Delete an experiment
   * 
   * @param experimentId ID of the experiment to delete
   * @returns Whether the operation was successful
   */
  static async deleteExperiment(experimentId: string): Promise<boolean> {
    if (!this.isInitialized) {
      await this.initialize();
    }

    try {
      // Check if experiment exists
      if (!this.experiments.has(experimentId)) {
        return false;
      }
      
      // Remove experiment
      this.experiments.delete(experimentId);
      await this.saveExperiments();
      
      return true;
    } catch (error) {
      console.error(`Error deleting experiment ${experimentId}:`, error);
      return false;
    }
  }

  /**
   * Get all active experiments
   * 
   * @returns Array of active experiment configurations
   */
  static async getActiveExperiments(): Promise<ExperimentConfig[]> {
    if (!this.isInitialized) {
      await this.initialize();
    }

    const activeExperiments: ExperimentConfig[] = [];
    const now = new Date();
    
    for (const experiment of this.experiments.values()) {
      // Check if experiment is active
      if (!experiment.isActive) {
        continue;
      }
      
      // Check if experiment has started
      const startDate = new Date(experiment.startDate);
      if (startDate > now) {
        continue;
      }
      
      // Check if experiment has ended
      if (experiment.endDate && new Date(experiment.endDate) < now) {
        continue;
      }
      
      activeExperiments.push(experiment);
    }
    
    return activeExperiments;
  }

  /**
   * Get results for a specific experiment
   * 
   * @param experimentId ID of the experiment
   * @returns Experiment results or null if experiment not found
   */
  static async getExperimentResults(experimentId: string): Promise<ExperimentResults | null> {
    if (!this.isInitialized) {
      await this.initialize();
    }

    try {
      // Check if experiment exists
      const experiment = this.experiments.get(experimentId);
      if (!experiment) {
        return null;
      }
      
      // Get all user experiments for this experiment
      const allUserExperiments = await this.getAllUserExperiments();
      const experimentUsers = allUserExperiments.filter(ue => ue.experimentId === experimentId);
      
      if (experimentUsers.length === 0) {
        return {
          experimentId,
          totalUsers: 0,
          variantCounts: {} as Record<Variant, number>,
          conversionRates: {} as Record<Variant, number>,
        };
      }
      
      // Count users per variant
      const variantCounts: Record<Variant, number> = {} as Record<Variant, number>;
      const conversionCounts: Record<Variant, number> = {} as Record<Variant, number>;
      
      experiment.variants.forEach(variant => {
        variantCounts[variant] = 0;
        conversionCounts[variant] = 0;
      });
      
      experimentUsers.forEach(user => {
        variantCounts[user.variant] = (variantCounts[user.variant] || 0) + 1;
        
        if (user.hasConverted) {
          conversionCounts[user.variant] = (conversionCounts[user.variant] || 0) + 1;
        }
      });
      
      // Calculate conversion rates
      const conversionRates: Record<Variant, number> = {} as Record<Variant, number>;
      
      experiment.variants.forEach(variant => {
        conversionRates[variant] = variantCounts[variant] > 0
          ? conversionCounts[variant] / variantCounts[variant]
          : 0;
      });
      
      // Find leading variant
      let leadingVariant: Variant | undefined;
      let highestRate = -1;
      
      experiment.variants.forEach(variant => {
        if (conversionRates[variant] > highestRate && variantCounts[variant] > 0) {
          highestRate = conversionRates[variant];
          leadingVariant = variant;
        }
      });
      
      // Calculate statistical confidence (simplified z-test)
      let confidence: number | undefined;
      
      if (leadingVariant && experimentUsers.length > 50) {
        // This is a simplified approach - in production, use a proper statistical test
        const leadingRate = conversionRates[leadingVariant];
        const otherRates = experiment.variants
          .filter(v => v !== leadingVariant)
          .map(v => conversionRates[v]);
        
        if (otherRates.length > 0) {
          const avgOtherRate = otherRates.reduce((sum, rate) => sum + rate, 0) / otherRates.length;
          const diff = leadingRate - avgOtherRate;
          
          // Calculate approximate confidence based on difference and sample size
          const sampleSizeFactor = Math.min(1, experimentUsers.length / 1000);
          confidence = Math.min(0.99, Math.max(0, diff * 5) * sampleSizeFactor);
        }
      }
      
      return {
        experimentId,
        totalUsers: experimentUsers.length,
        variantCounts,
        conversionRates,
        leadingVariant,
        confidence,
      };
    } catch (error) {
      console.error(`Error getting results for experiment ${experimentId}:`, error);
      return null;
    }
  }

  /**
   * Set user segments for targeting
   * 
   * @param segments Array of segment identifiers
   */
  static setUserSegments(segments: string[]): void {
    this.userSegments = [...segments];
  }

  /**
   * Reset all user experiment assignments
   * Useful for testing or when user account changes
   */
  static async resetUserExperiments(): Promise<void> {
    this.userExperiments.clear();
    await SafeStorage.removeItem(this.USER_EXPERIMENTS_KEY);
    console.log('User experiment assignments reset');
  }

  // Private methods

  /**
   * Load experiment configurations from storage
   */
  private static async loadExperiments(): Promise<void> {
    try {
      const experimentsJson = await SafeStorage.getItem(this.EXPERIMENTS_CONFIG_KEY);
      
      if (!experimentsJson) {
        // No experiments stored yet
        this.experiments = new Map();
        return;
      }
      
      const experimentsArray: ExperimentConfig[] = JSON.parse(experimentsJson);
      
      // Convert array to map
      this.experiments = new Map();
      experimentsArray.forEach(experiment => {
        this.experiments.set(experiment.id, experiment);
      });
    } catch (error) {
      console.error('Error loading experiments:', error);
      this.experiments = new Map();
    }
  }

  /**
   * Save experiment configurations to storage
   */
  private static async saveExperiments(): Promise<void> {
    try {
      const experimentsArray = Array.from(this.experiments.values());
      await SafeStorage.setItem(this.EXPERIMENTS_CONFIG_KEY, JSON.stringify(experimentsArray));
    } catch (error) {
      console.error('Error saving experiments:', error);
    }
  }

  /**
   * Load user's assigned experiments from storage
   */
  private static async loadUserExperiments(): Promise<void> {
    try {
      const userExperimentsJson = await SafeStorage.getItem(this.USER_EXPERIMENTS_KEY);
      
      if (!userExperimentsJson) {
        // No user experiments stored yet
        this.userExperiments = new Map();
        return;
      }
      
      const userExperimentsArray: UserExperiment[] = JSON.parse(userExperimentsJson);
      
      // Convert array to map
      this.userExperiments = new Map();
      userExperimentsArray.forEach(userExperiment => {
        this.userExperiments.set(userExperiment.experimentId, userExperiment);
      });
    } catch (error) {
      console.error('Error loading user experiments:', error);
      this.userExperiments = new Map();
    }
  }

  /**
   * Save user's assigned experiments to storage
   */
  private static async saveUserExperiments(): Promise<void> {
    try {
      const userExperimentsArray = Array.from(this.userExperiments.values());
      await SafeStorage.setItem(this.USER_EXPERIMENTS_KEY, JSON.stringify(userExperimentsArray));
    } catch (error) {
      console.error('Error saving user experiments:', error);
    }
  }

  /**
   * Get all user experiments from all users (admin only)
   * This would typically call an API to get data from all users
   */
  private static async getAllUserExperiments(): Promise<UserExperiment[]> {
    // In a real implementation, this would call an API to get data from all users
    // For simplicity, we'll just return the current user's experiments
    return Array.from(this.userExperiments.values());
  }

  /**
   * Get or generate user hash for consistent experiment assignments
   */
  private static async getUserHash(): Promise<string> {
    if (this.userHash) {
      return this.userHash;
    }
    
    try {
      // Try to get existing hash
      const storedHash = await SafeStorage.getItem(this.USER_HASH_KEY);
      
      if (storedHash) {
        this.userHash = storedHash;
        return storedHash;
      }
      
      // Generate new hash
      const newHash = Math.random().toString(36).substring(2, 15) + 
                     Math.random().toString(36).substring(2, 15);
      
      // Store hash
      await SafeStorage.setItem(this.USER_HASH_KEY, newHash);
      this.userHash = newHash;
      
      return newHash;
    } catch (error) {
      console.error('Error getting/generating user hash:', error);
      
      // Fallback hash
      const fallbackHash = Date.now().toString(36);
      this.userHash = fallbackHash;
      
      return fallbackHash;
    }
  }

  /**
   * Check if a user should be included in an experiment based on targeting criteria
   */
  private static shouldIncludeUserInExperiment(experiment: ExperimentConfig): boolean {
    // Check target percentage
    if (experiment.targetUserPercentage !== undefined) {
      // Use user hash for consistent assignment
      if (!this.userHash) {
        return false;
      }
      
      // Convert hash to number between 0-1
      const hashNum = parseInt(this.userHash.substring(0, 8), 36) / Math.pow(36, 8);
      
      // Check if user falls within target percentage
      if (hashNum > experiment.targetUserPercentage) {
        return false;
      }
    }
    
    // Check target user segments
    if (experiment.targetUserSegments && experiment.targetUserSegments.length > 0) {
      // Check if user is in any of the target segments
      const hasMatchingSegment = experiment.targetUserSegments.some(segment => 
        this.userSegments.includes(segment)
      );
      
      if (!hasMatchingSegment) {
        return false;
      }
    }
    
    return true;
  }

  /**
   * Assign a user to a variant for an experiment
   */
  private static assignVariant(experiment: ExperimentConfig): Variant | null {
    if (!experiment.variants || experiment.variants.length === 0) {
      return null;
    }
    
    if (experiment.variants.length === 1) {
      return experiment.variants[0];
    }
    
    // Use weights if provided
    if (experiment.weights && experiment.weights.length === experiment.variants.length) {
      return this.weightedRandomVariant(experiment.variants, experiment.weights);
    }
    
    // Otherwise, assign randomly with equal probability
    const randomIndex = Math.floor(Math.random() * experiment.variants.length);
    return experiment.variants[randomIndex];
  }

  /**
   * Randomly select a variant based on weights
   */
  private static weightedRandomVariant(variants: Variant[], weights: number[]): Variant {
    const rand = Math.random();
    let cumulativeWeight = 0;
    
    for (let i = 0; i < variants.length; i++) {
      cumulativeWeight += weights[i];
      
      if (rand < cumulativeWeight) {
        return variants[i];
      }
    }
    
    // Fallback in case of rounding errors
    return variants[variants.length - 1];
  }
} 