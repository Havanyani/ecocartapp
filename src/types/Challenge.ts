/**
 * Challenge.ts
 * 
 * Type definitions for the community challenges feature.
 */

import { User } from './User';

/**
 * Represents the difficulty level of a challenge
 */
export enum ChallengeDifficulty {
  EASY = 'easy',
  MEDIUM = 'medium',
  HARD = 'hard',
  EXPERT = 'expert',
}

/**
 * Represents the status of a challenge
 */
export enum ChallengeStatus {
  UPCOMING = 'upcoming',
  ACTIVE = 'active',
  COMPLETED = 'completed',
  CANCELED = 'canceled',
}

/**
 * Represents the category of a challenge
 */
export enum ChallengeCategory {
  RECYCLING = 'recycling',
  REDUCTION = 'reduction',
  EDUCATION = 'education',
  COMMUNITY = 'community',
  SPECIAL = 'special',
}

/**
 * Represents the type of goal for a challenge
 */
export enum ChallengeGoalType {
  WEIGHT = 'weight', // Amount of materials recycled by weight
  COUNT = 'count', // Number of items recycled
  DAYS = 'days', // Number of days with recycling activity
  PEOPLE = 'people', // Number of people participating
  ACTIONS = 'actions', // Number of specific actions completed
}

/**
 * Represents a challenge in the system
 */
export interface Challenge {
  id: string;
  title: string;
  description: string;
  category: ChallengeCategory;
  difficulty: ChallengeDifficulty;
  status: ChallengeStatus;
  startDate: string;
  endDate: string;
  goalType: ChallengeGoalType;
  goalTarget: number;
  currentProgress: number;
  participants: number;
  createdBy?: string; // User ID of creator (if user-created challenge)
  rewards?: {
    points: number;
    badges?: string[];
    otherRewards?: string[];
  };
  imageUrl?: string;
  rules?: string[];
  tags?: string[];
}

/**
 * Represents a user's participation in a challenge
 */
export interface ChallengeParticipation {
  id: string;
  userId: string;
  challengeId: string;
  joinedDate: string;
  currentProgress: number;
  completed: boolean;
  completedDate?: string;
  contributions: ChallengeContribution[];
}

/**
 * Represents a specific contribution to a challenge
 */
export interface ChallengeContribution {
  id: string;
  date: string;
  amount: number; // Progress amount contributed
  sourceType: 'collection' | 'manual' | 'social';
  sourceId?: string; // ID of the source (e.g., collection ID)
  notes?: string;
}

/**
 * Represents a leaderboard entry
 */
export interface LeaderboardEntry {
  userId: string;
  user: Partial<User>; // Only include necessary user info like name, avatar
  score: number;
  rank: number;
  progress: number;
  completedDate?: string;
  isCurrentUser: boolean;
}

/**
 * Represents a challenge leaderboard
 */
export interface ChallengeLeaderboard {
  challengeId: string;
  lastUpdated: string;
  entries: LeaderboardEntry[];
  userRank?: number; // Current user's rank if participating
}

/**
 * Interface for challenge filters
 */
export interface ChallengeFilters {
  status?: ChallengeStatus[];
  category?: ChallengeCategory[];
  difficulty?: ChallengeDifficulty[];
  participating?: boolean;
  search?: string;
} 