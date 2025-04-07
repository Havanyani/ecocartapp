/**
 * Gamification type definitions
 * @module types/gamification
 */

/**
 * Achievement type enum
 */
export type AchievementType = 
  | 'FIRST_COLLECTION'
  | 'RECYCLING_MASTER'
  | 'ECO_WARRIOR'
  | 'COMMUNITY_LEADER'
  | 'STREAK_KEEPER';

/**
 * Achievement interface
 */
export interface Achievement {
  id: string;
  type: AchievementType;
  title: string;
  description: string;
  points: number;
  imageUrl?: string;
}

/**
 * Achievement progress interface
 */
export interface AchievementProgress {
  achievementId: string;
  userId: string;
  currentProgress: number;
  targetProgress: number;
  completedAt?: string;
  status: AchievementStatus;
}

/**
 * Achievement status enum
 */
export enum AchievementStatus {
  NOT_STARTED = 'not_started',
  LOCKED = 'locked',
  IN_PROGRESS = 'in_progress',
  COMPLETED = 'completed',
  CLAIMED = 'claimed'
}

/**
 * Reward interface
 */
export interface Reward {
  id: string;
  title: string;
  description: string;
  points: number;
  status: RewardStatus;
  expiresAt?: string;
}

/**
 * Reward status type
 */
export type RewardStatus = 
  | 'AVAILABLE'
  | 'CLAIMED'
  | 'EXPIRED'
  | 'USED';

/**
 * Types for the gamification system
 */

// Achievement Types
export enum AchievementCategory {
  RECYCLING = 'recycling',
  COLLECTION = 'collection',
  IMPACT = 'impact',
  ECO_IMPACT = 'eco_impact',
  COMMUNITY = 'community',
  APP_USAGE = 'app_usage',
}

export interface AchievementRequirement {
  type: string;
  value: number;
  currentValue?: number;
}

export interface Achievement {
  id: string;
  title: string;
  description: string;
  category: AchievementCategory;
  icon: string;
  status: AchievementStatus;
  requirements: AchievementRequirement[];
  reward: Reward;
  isHidden?: boolean;
  unlockedAt?: string;
  progress?: number; // 0-100
  totalRequired?: number; // Total value required to complete
  pointsAwarded?: number; // Points awarded for completion
  iconName?: string; // Icon name for compatibility
  isUnlocked?: boolean; // Whether the achievement is unlocked
}

// Level System
export interface Level {
  level: number;
  title: string;
  requiredPoints: number;
  rewards: Reward[];
  icon?: string;
  color?: string;
  specialPerks?: string[];
}

// Define a separate interface for level definitions
export interface LevelDefinition {
  level: number;
  title: string;
  minPoints: number;
  maxPoints: number;
  perks: string[];
}

// User's current level progress
export interface UserLevel extends Partial<LevelDefinition> {
  currentLevel: number;
  currentPoints: number;
  nextLevelPoints: number;
  progress: number; // 0-100
  lifetimePoints: number;
  lastLevelUpDate?: string;
}

// Badge Level
export enum BadgeLevel {
  BRONZE = 'bronze',
  SILVER = 'silver',
  GOLD = 'gold',
  PLATINUM = 'platinum'
}

// Reward System
export enum RewardType {
  POINTS = 'points',
  BADGE = 'badge',
  DISCOUNT = 'discount',
  DONATION = 'donation',
  FEATURE_UNLOCK = 'feature_unlock',
  PHYSICAL_ITEM = 'physical_item',
}

export interface Reward {
  id: string;
  type: RewardType;
  value: number | string;
  title: string;
  description?: string;
  icon?: string;
  expiresAt?: string;
  isRedeemed?: boolean;
  redeemedAt?: string;
}

export interface Badge {
  id: string;
  name: string;
  description: string;
  icon: string;
  category: AchievementCategory;
  rarity: 'common' | 'uncommon' | 'rare' | 'epic' | 'legendary';
  unlockedAt?: string;
  level?: BadgeLevel | string; // Badge level (bronze, silver, gold, etc.)
  iconName?: string; // Icon name for compatibility
  isUnlocked?: boolean; // Whether the badge is unlocked
}

// Impact Metrics
export interface EnvironmentalImpact {
  plasticWeight: number; // in kg
  paperWeight: number; // in kg
  glassWeight: number; // in kg
  metalWeight: number; // in kg
  electronicsWeight: number; // in kg
  otherWeight: number; // in kg
  totalWeight: number; // in kg
  co2Saved: number; // in kg
  waterSaved: number; // in liters
  energySaved: number; // in kWh
  treesEquivalent: number;
  wasteNotLandfilled: number; // in kg
  comparisons: ImpactComparisons;
}

// Simplified version used by GamificationService
export interface EcoImpact {
  co2Saved: number; // in kg
  waterSaved: number; // in liters 
  energySaved: number; // in kWh
  treesEquivalent: number;
  plasticSaved: number; // in kg
  paperSaved: number; // in kg
  wasteNotLandfilled: number; // in kg
}

export interface ImpactComparisons {
  carNotDriven: number; // in km
  showersMissed: number;
  bulbsForYear: number;
  plasticBottlesSaved: number;
}

// Community Challenges
export interface Challenge {
  id: string;
  title: string;
  description: string;
  startDate: string;
  endDate: string;
  goal: number;
  currentProgress: number;
  unit: string;
  rewards: Reward[];
  participants: number;
  userProgress?: number;
  userContribution?: number;
  isCompleted?: boolean;
  userRank?: number;
}

export interface CommunityChallenge {
  id: string;
  title: string;
  description: string;
  startDate: string;
  endDate: string;
  requirementType: string;
  requirementValue: number;
  reward: Reward;
  participants: number;
  imageUrl: string;
  status: 'active' | 'upcoming' | 'completed';
}

export interface LeaderboardEntry {
  userId: string;
  username: string;
  profilePicture?: string;
  profilePictureUrl?: string;
  value?: number;
  score?: number;
  rank: number;
  level?: number;
  unit?: string;
}

// User Gamification Profile
export interface GamificationProfile {
  userId: string;
  username: string;
  level: UserLevel;
  badges: Badge[];
  achievements: {
    completed: number;
    total: number;
    recent: Achievement[];
  };
  impact: EnvironmentalImpact;
  points: {
    available: number;
    lifetime: number;
    thisWeek: number;
    thisMonth: number;
  };
  streakDays: number;
  lastActivityDate: string;
}

// Full user profile for GamificationService
export interface GamifiedUserProfile {
  userId: string;
  username: string;
  totalPoints: number;
  currentPoints: number;
  pointsToNextLevel: number;
  level: number;
  badges: Badge[];
  achievements: Achievement[];
  ecoImpact: EcoImpact;
  lastActiveDate: Date;
  streakDays: number;
  streakStartDate: Date;
  materialStats: {
    plastic: number;
    paper: number;
    glass: number;
    metal: number;
    electronics: number;
    other: number;
  };
  joinedChallenges: string[];
  completedChallenges: string[];
  activityHistory: ActivityEvent[];
  createdAt: Date;
  updatedAt: Date;
}

// Interactions
export interface ActivityEvent {
  type: string;
  value: number;
  metadata?: Record<string, any>;
  timestamp: string;
}

// Quest System
export enum QuestTypeEnum {
  DAILY = 'daily',
  WEEKLY = 'weekly',
  SPECIAL = 'special'
}

export enum QuestStatusEnum {
  LOCKED = 'locked',
  IN_PROGRESS = 'in_progress',
  COMPLETED = 'completed',
  CLAIMED = 'claimed',
  EXPIRED = 'expired'
}

export enum QuestDifficultyEnum {
  EASY = 'easy',
  MEDIUM = 'medium',
  HARD = 'hard'
}

export interface QuestReward {
  points?: number;
  badgeId?: string;
  itemId?: string;
  title: string;
  description?: string;
}

export interface Quest {
  id: string;
  title: string;
  description: string;
  type: QuestTypeEnum;
  category: AchievementCategory;
  activityType: string;
  targetValue: number;
  currentValue: number;
  progress: number; // 0-100
  status: QuestStatusEnum;
  difficulty: QuestDifficultyEnum;
  reward: QuestReward;
  icon: string;
  expiresAt: string;
  createdAt: string;
}

export interface QuestProgress {
  questId: string;
  userId: string;
  currentValue: number;
  targetValue: number;
  completedAt: string | null;
  status: QuestStatusEnum;
} 