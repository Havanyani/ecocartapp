/**
 * ChallengeService.ts
 * 
 * Service for managing community challenges and leaderboards.
 */

import {
    Challenge,
    ChallengeCategory,
    ChallengeDifficulty,
    ChallengeFilters,
    ChallengeGoalType,
    ChallengeLeaderboard,
    ChallengeParticipation,
    ChallengeStatus,
    LeaderboardEntry
} from '@/types/Challenge';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { v4 as uuidv4 } from 'uuid';
import { UserService } from './UserService';

// AsyncStorage keys
const CHALLENGES_KEY = 'challenges';
const PARTICIPATIONS_KEY = 'challenge_participations';
const LEADERBOARDS_KEY = 'challenge_leaderboards';

/**
 * Service for managing community challenges and leaderboards
 */
export class ChallengeService {
  /**
   * Get all challenges
   */
  static async getChallenges(filters?: ChallengeFilters): Promise<Challenge[]> {
    try {
      const challengesJson = await AsyncStorage.getItem(CHALLENGES_KEY);
      let challenges: Challenge[] = challengesJson ? JSON.parse(challengesJson) : [];
      
      if (!challenges.length) {
        // Generate some sample challenges if none exist
        challenges = await this.generateSampleChallenges();
      }
      
      // Update challenge statuses based on current date
      challenges = this.updateChallengeStatuses(challenges);
      
      // Apply filters if provided
      if (filters) {
        challenges = this.filterChallenges(challenges, filters);
      }
      
      return challenges;
    } catch (error) {
      console.error('Error getting challenges:', error);
      return [];
    }
  }
  
  /**
   * Get a specific challenge by ID
   */
  static async getChallenge(challengeId: string): Promise<Challenge | null> {
    try {
      const challenges = await this.getChallenges();
      return challenges.find(challenge => challenge.id === challengeId) || null;
    } catch (error) {
      console.error(`Error getting challenge ${challengeId}:`, error);
      return null;
    }
  }
  
  /**
   * Create a new challenge
   */
  static async createChallenge(challenge: Omit<Challenge, 'id' | 'participants' | 'currentProgress'>): Promise<Challenge> {
    try {
      const challenges = await this.getChallenges();
      
      const newChallenge: Challenge = {
        ...challenge,
        id: uuidv4(),
        currentProgress: 0,
        participants: 0,
      };
      
      const updatedChallenges = [...challenges, newChallenge];
      await AsyncStorage.setItem(CHALLENGES_KEY, JSON.stringify(updatedChallenges));
      
      return newChallenge;
    } catch (error) {
      console.error('Error creating challenge:', error);
      throw error;
    }
  }
  
  /**
   * Update an existing challenge
   */
  static async updateChallenge(challengeId: string, updates: Partial<Challenge>): Promise<Challenge> {
    try {
      const challenges = await this.getChallenges();
      const index = challenges.findIndex(c => c.id === challengeId);
      
      if (index === -1) {
        throw new Error(`Challenge with ID ${challengeId} not found`);
      }
      
      const updatedChallenge = { ...challenges[index], ...updates };
      const updatedChallenges = [...challenges];
      updatedChallenges[index] = updatedChallenge;
      
      await AsyncStorage.setItem(CHALLENGES_KEY, JSON.stringify(updatedChallenges));
      
      return updatedChallenge;
    } catch (error) {
      console.error(`Error updating challenge ${challengeId}:`, error);
      throw error;
    }
  }
  
  /**
   * Delete a challenge
   */
  static async deleteChallenge(challengeId: string): Promise<boolean> {
    try {
      const challenges = await this.getChallenges();
      const filteredChallenges = challenges.filter(c => c.id !== challengeId);
      
      await AsyncStorage.setItem(CHALLENGES_KEY, JSON.stringify(filteredChallenges));
      
      // Delete all participations and leaderboard data related to this challenge
      await this.deleteAllChallengeParticipations(challengeId);
      await this.deleteChallengeLeaderboard(challengeId);
      
      return true;
    } catch (error) {
      console.error(`Error deleting challenge ${challengeId}:`, error);
      return false;
    }
  }
  
  /**
   * Join a challenge as the current user
   */
  static async joinChallenge(challengeId: string, userId: string): Promise<ChallengeParticipation> {
    try {
      // Check if the user is already participating
      const existingParticipation = await this.getUserChallengeParticipation(userId, challengeId);
      if (existingParticipation) {
        return existingParticipation;
      }
      
      // Get the challenge
      const challenge = await this.getChallenge(challengeId);
      if (!challenge) {
        throw new Error(`Challenge with ID ${challengeId} not found`);
      }
      
      // Create a new participation
      const newParticipation: ChallengeParticipation = {
        id: uuidv4(),
        userId,
        challengeId,
        joinedDate: new Date().toISOString(),
        currentProgress: 0,
        completed: false,
        contributions: [],
      };
      
      // Save the participation
      const participations = await this.getAllParticipations();
      await AsyncStorage.setItem(
        PARTICIPATIONS_KEY,
        JSON.stringify([...participations, newParticipation])
      );
      
      // Update the challenge's participant count
      await this.updateChallenge(challengeId, {
        participants: challenge.participants + 1,
      });
      
      // Update the leaderboard with the new participant
      await this.addUserToLeaderboard(challengeId, userId);
      
      return newParticipation;
    } catch (error) {
      console.error(`Error joining challenge ${challengeId}:`, error);
      throw error;
    }
  }
  
  /**
   * Leave a challenge
   */
  static async leaveChallenge(challengeId: string, userId: string): Promise<boolean> {
    try {
      const participations = await this.getAllParticipations();
      const filteredParticipations = participations.filter(
        p => !(p.challengeId === challengeId && p.userId === userId)
      );
      
      if (participations.length === filteredParticipations.length) {
        // No participation found to remove
        return false;
      }
      
      await AsyncStorage.setItem(PARTICIPATIONS_KEY, JSON.stringify(filteredParticipations));
      
      // Update the challenge's participant count
      const challenge = await this.getChallenge(challengeId);
      if (challenge) {
        await this.updateChallenge(challengeId, {
          participants: Math.max(0, challenge.participants - 1),
        });
      }
      
      // Remove the user from the leaderboard
      await this.removeUserFromLeaderboard(challengeId, userId);
      
      return true;
    } catch (error) {
      console.error(`Error leaving challenge ${challengeId}:`, error);
      return false;
    }
  }
  
  /**
   * Get all challenges that a user is participating in
   */
  static async getUserChallenges(userId: string): Promise<Challenge[]> {
    try {
      const participations = await this.getUserParticipations(userId);
      const challengeIds = participations.map(p => p.challengeId);
      
      const challenges = await this.getChallenges();
      return challenges.filter(challenge => challengeIds.includes(challenge.id));
    } catch (error) {
      console.error(`Error getting challenges for user ${userId}:`, error);
      return [];
    }
  }
  
  /**
   * Get all challenge participations for a user
   */
  static async getUserParticipations(userId: string): Promise<ChallengeParticipation[]> {
    try {
      const participations = await this.getAllParticipations();
      return participations.filter(p => p.userId === userId);
    } catch (error) {
      console.error(`Error getting participations for user ${userId}:`, error);
      return [];
    }
  }
  
  /**
   * Get a specific user's participation in a challenge
   */
  static async getUserChallengeParticipation(
    userId: string,
    challengeId: string
  ): Promise<ChallengeParticipation | null> {
    try {
      const participations = await this.getAllParticipations();
      return (
        participations.find(
          p => p.userId === userId && p.challengeId === challengeId
        ) || null
      );
    } catch (error) {
      console.error(
        `Error getting participation for user ${userId} in challenge ${challengeId}:`,
        error
      );
      return null;
    }
  }
  
  /**
   * Get the leaderboard for a challenge
   */
  static async getChallengeLeaderboard(
    challengeId: string,
    currentUserId?: string
  ): Promise<ChallengeLeaderboard> {
    try {
      // Try to get existing leaderboard
      const leaderboardsJson = await AsyncStorage.getItem(LEADERBOARDS_KEY);
      const leaderboards: Record<string, ChallengeLeaderboard> = leaderboardsJson 
        ? JSON.parse(leaderboardsJson) 
        : {};
      
      // If leaderboard exists and is recent (within the last hour), return it
      if (leaderboards[challengeId] && 
          new Date().getTime() - new Date(leaderboards[challengeId].lastUpdated).getTime() < 3600000) {
        return this.formatLeaderboardForUser(leaderboards[challengeId], currentUserId);
      }
      
      // Otherwise, generate a new leaderboard
      return await this.generateLeaderboard(challengeId, currentUserId);
    } catch (error) {
      console.error(`Error getting leaderboard for challenge ${challengeId}:`, error);
      return {
        challengeId,
        lastUpdated: new Date().toISOString(),
        entries: [],
      };
    }
  }
  
  /**
   * Record progress for a user in a challenge
   */
  static async recordChallengeProgress(
    challengeId: string,
    userId: string,
    amount: number,
    sourceType: 'collection' | 'manual' | 'social',
    sourceId?: string,
    notes?: string
  ): Promise<ChallengeParticipation> {
    try {
      // Get the user's participation
      const participation = await this.getUserChallengeParticipation(userId, challengeId);
      if (!participation) {
        throw new Error(`User ${userId} is not participating in challenge ${challengeId}`);
      }
      
      // Get the challenge
      const challenge = await this.getChallenge(challengeId);
      if (!challenge) {
        throw new Error(`Challenge with ID ${challengeId} not found`);
      }
      
      // Create a new contribution
      const newContribution = {
        id: uuidv4(),
        date: new Date().toISOString(),
        amount,
        sourceType,
        sourceId,
        notes,
      };
      
      // Update the participation
      const newProgress = participation.currentProgress + amount;
      const completed = newProgress >= challenge.goalTarget;
      
      const updatedParticipation: ChallengeParticipation = {
        ...participation,
        currentProgress: newProgress,
        completed,
        completedDate: completed && !participation.completed ? new Date().toISOString() : participation.completedDate,
        contributions: [...participation.contributions, newContribution],
      };
      
      // Save the updated participation
      const participations = await this.getAllParticipations();
      const updatedParticipations = participations.map(p => 
        p.id === participation.id ? updatedParticipation : p
      );
      
      await AsyncStorage.setItem(PARTICIPATIONS_KEY, JSON.stringify(updatedParticipations));
      
      // Update the challenge's progress
      const totalProgress = updatedParticipations
        .filter(p => p.challengeId === challengeId)
        .reduce((sum, p) => sum + p.currentProgress, 0);
      
      await this.updateChallenge(challengeId, { currentProgress: totalProgress });
      
      // Update the leaderboard
      await this.updateUserInLeaderboard(challengeId, userId, newProgress, completed);
      
      return updatedParticipation;
    } catch (error) {
      console.error(`Error recording progress for challenge ${challengeId}:`, error);
      throw error;
    }
  }
  
  /**
   * Get all challenge participations
   */
  private static async getAllParticipations(): Promise<ChallengeParticipation[]> {
    try {
      const participationsJson = await AsyncStorage.getItem(PARTICIPATIONS_KEY);
      return participationsJson ? JSON.parse(participationsJson) : [];
    } catch (error) {
      console.error('Error getting all participations:', error);
      return [];
    }
  }
  
  /**
   * Delete all participations for a challenge
   */
  private static async deleteAllChallengeParticipations(challengeId: string): Promise<boolean> {
    try {
      const participations = await this.getAllParticipations();
      const filteredParticipations = participations.filter(p => p.challengeId !== challengeId);
      
      await AsyncStorage.setItem(PARTICIPATIONS_KEY, JSON.stringify(filteredParticipations));
      
      return true;
    } catch (error) {
      console.error(`Error deleting participations for challenge ${challengeId}:`, error);
      return false;
    }
  }
  
  /**
   * Delete a challenge leaderboard
   */
  private static async deleteChallengeLeaderboard(challengeId: string): Promise<boolean> {
    try {
      const leaderboardsJson = await AsyncStorage.getItem(LEADERBOARDS_KEY);
      const leaderboards: Record<string, ChallengeLeaderboard> = leaderboardsJson 
        ? JSON.parse(leaderboardsJson) 
        : {};
      
      if (leaderboards[challengeId]) {
        delete leaderboards[challengeId];
        await AsyncStorage.setItem(LEADERBOARDS_KEY, JSON.stringify(leaderboards));
      }
      
      return true;
    } catch (error) {
      console.error(`Error deleting leaderboard for challenge ${challengeId}:`, error);
      return false;
    }
  }
  
  /**
   * Generate a leaderboard for a challenge
   */
  private static async generateLeaderboard(
    challengeId: string,
    currentUserId?: string
  ): Promise<ChallengeLeaderboard> {
    try {
      // Get all participations for this challenge
      const participations = await this.getAllParticipations();
      const challengeParticipations = participations.filter(p => p.challengeId === challengeId);
      
      // Get user information for the leaderboard
      const userPromises = challengeParticipations.map(p => UserService.getUser(p.userId));
      const users = await Promise.all(userPromises);
      
      // Create leaderboard entries
      const entries: LeaderboardEntry[] = challengeParticipations.map((p, index) => {
        const user = users[index];
        return {
          userId: p.userId,
          user: user ? {
            id: user.id,
            name: user.name,
            avatar: user.avatar,
          } : { id: p.userId, name: 'Unknown User' },
          score: p.currentProgress,
          rank: 0, // Will be calculated below
          progress: p.currentProgress,
          completedDate: p.completedDate,
          isCurrentUser: p.userId === currentUserId,
        };
      });
      
      // Sort entries by score (highest first)
      entries.sort((a, b) => b.score - a.score);
      
      // Assign ranks
      for (let i = 0; i < entries.length; i++) {
        // If this is the first entry or has a different score than the previous entry,
        // assign the current position (1-based) as the rank
        if (i === 0 || entries[i].score !== entries[i - 1].score) {
          entries[i].rank = i + 1;
        } else {
          // If the score is the same as the previous entry, assign the same rank
          entries[i].rank = entries[i - 1].rank;
        }
      }
      
      // Create the leaderboard
      const leaderboard: ChallengeLeaderboard = {
        challengeId,
        lastUpdated: new Date().toISOString(),
        entries,
        userRank: currentUserId 
          ? entries.find(e => e.userId === currentUserId)?.rank 
          : undefined,
      };
      
      // Save the leaderboard
      const leaderboardsJson = await AsyncStorage.getItem(LEADERBOARDS_KEY);
      const leaderboards: Record<string, ChallengeLeaderboard> = leaderboardsJson 
        ? JSON.parse(leaderboardsJson) 
        : {};
      
      leaderboards[challengeId] = leaderboard;
      await AsyncStorage.setItem(LEADERBOARDS_KEY, JSON.stringify(leaderboards));
      
      return leaderboard;
    } catch (error) {
      console.error(`Error generating leaderboard for challenge ${challengeId}:`, error);
      return {
        challengeId,
        lastUpdated: new Date().toISOString(),
        entries: [],
      };
    }
  }
  
  /**
   * Format a leaderboard for a specific user
   */
  private static formatLeaderboardForUser(
    leaderboard: ChallengeLeaderboard,
    userId?: string
  ): ChallengeLeaderboard {
    if (!userId) return leaderboard;
    
    // Mark the current user's entry
    const entries = leaderboard.entries.map(entry => ({
      ...entry,
      isCurrentUser: entry.userId === userId,
    }));
    
    // Get the user's rank
    const userRank = entries.find(e => e.userId === userId)?.rank;
    
    return {
      ...leaderboard,
      entries,
      userRank,
    };
  }
  
  /**
   * Add a user to a challenge leaderboard
   */
  private static async addUserToLeaderboard(
    challengeId: string,
    userId: string
  ): Promise<boolean> {
    try {
      // Get the user
      const user = await UserService.getUser(userId);
      if (!user) {
        console.error(`User ${userId} not found`);
        return false;
      }
      
      // Get the leaderboard
      const leaderboardsJson = await AsyncStorage.getItem(LEADERBOARDS_KEY);
      const leaderboards: Record<string, ChallengeLeaderboard> = leaderboardsJson 
        ? JSON.parse(leaderboardsJson) 
        : {};
      
      // If the leaderboard doesn't exist, generate it
      if (!leaderboards[challengeId]) {
        await this.generateLeaderboard(challengeId, userId);
        return true;
      }
      
      // Check if the user is already in the leaderboard
      const leaderboard = leaderboards[challengeId];
      if (leaderboard.entries.some(e => e.userId === userId)) {
        return true;
      }
      
      // Add the user to the leaderboard
      const newEntry: LeaderboardEntry = {
        userId,
        user: {
          id: user.id,
          name: user.name,
          avatar: user.avatar,
        },
        score: 0,
        rank: leaderboard.entries.length + 1, // Temporary rank, will be updated when regenerating the leaderboard
        progress: 0,
        isCurrentUser: false,
      };
      
      leaderboard.entries.push(newEntry);
      leaderboard.lastUpdated = new Date().toISOString();
      
      // Save the updated leaderboard
      leaderboards[challengeId] = leaderboard;
      await AsyncStorage.setItem(LEADERBOARDS_KEY, JSON.stringify(leaderboards));
      
      // Regenerate the leaderboard to ensure correct rankings
      await this.generateLeaderboard(challengeId, userId);
      
      return true;
    } catch (error) {
      console.error(`Error adding user ${userId} to leaderboard for challenge ${challengeId}:`, error);
      return false;
    }
  }
  
  /**
   * Remove a user from a challenge leaderboard
   */
  private static async removeUserFromLeaderboard(
    challengeId: string,
    userId: string
  ): Promise<boolean> {
    try {
      const leaderboardsJson = await AsyncStorage.getItem(LEADERBOARDS_KEY);
      const leaderboards: Record<string, ChallengeLeaderboard> = leaderboardsJson 
        ? JSON.parse(leaderboardsJson) 
        : {};
      
      if (!leaderboards[challengeId]) {
        return true;
      }
      
      // Remove the user from the leaderboard
      const leaderboard = leaderboards[challengeId];
      leaderboard.entries = leaderboard.entries.filter(e => e.userId !== userId);
      leaderboard.lastUpdated = new Date().toISOString();
      
      // Save the updated leaderboard
      leaderboards[challengeId] = leaderboard;
      await AsyncStorage.setItem(LEADERBOARDS_KEY, JSON.stringify(leaderboards));
      
      // Regenerate the leaderboard to ensure correct rankings
      await this.generateLeaderboard(challengeId);
      
      return true;
    } catch (error) {
      console.error(`Error removing user ${userId} from leaderboard for challenge ${challengeId}:`, error);
      return false;
    }
  }
  
  /**
   * Update a user's entry in a challenge leaderboard
   */
  private static async updateUserInLeaderboard(
    challengeId: string,
    userId: string,
    progress: number,
    completed: boolean
  ): Promise<boolean> {
    try {
      const leaderboardsJson = await AsyncStorage.getItem(LEADERBOARDS_KEY);
      const leaderboards: Record<string, ChallengeLeaderboard> = leaderboardsJson 
        ? JSON.parse(leaderboardsJson) 
        : {};
      
      if (!leaderboards[challengeId]) {
        return await this.addUserToLeaderboard(challengeId, userId);
      }
      
      // Update the user's entry
      const leaderboard = leaderboards[challengeId];
      const entryIndex = leaderboard.entries.findIndex(e => e.userId === userId);
      
      if (entryIndex === -1) {
        return await this.addUserToLeaderboard(challengeId, userId);
      }
      
      leaderboard.entries[entryIndex] = {
        ...leaderboard.entries[entryIndex],
        score: progress,
        progress,
        completedDate: completed ? new Date().toISOString() : leaderboard.entries[entryIndex].completedDate,
      };
      
      leaderboard.lastUpdated = new Date().toISOString();
      
      // Save the updated leaderboard
      leaderboards[challengeId] = leaderboard;
      await AsyncStorage.setItem(LEADERBOARDS_KEY, JSON.stringify(leaderboards));
      
      // Regenerate the leaderboard to ensure correct rankings
      await this.generateLeaderboard(challengeId, userId);
      
      return true;
    } catch (error) {
      console.error(`Error updating user ${userId} in leaderboard for challenge ${challengeId}:`, error);
      return false;
    }
  }
  
  /**
   * Update challenge statuses based on current date
   */
  private static updateChallengeStatuses(challenges: Challenge[]): Challenge[] {
    const now = new Date();
    
    return challenges.map(challenge => {
      const startDate = new Date(challenge.startDate);
      const endDate = new Date(challenge.endDate);
      
      let status = challenge.status;
      
      if (now < startDate) {
        status = ChallengeStatus.UPCOMING;
      } else if (now >= startDate && now <= endDate) {
        status = ChallengeStatus.ACTIVE;
      } else if (now > endDate) {
        status = ChallengeStatus.COMPLETED;
      }
      
      return { ...challenge, status };
    });
  }
  
  /**
   * Filter challenges based on the provided filters
   */
  private static filterChallenges(challenges: Challenge[], filters: ChallengeFilters): Challenge[] {
    return challenges.filter(challenge => {
      // Filter by status
      if (filters.status && filters.status.length > 0) {
        if (!filters.status.includes(challenge.status)) {
          return false;
        }
      }
      
      // Filter by category
      if (filters.category && filters.category.length > 0) {
        if (!filters.category.includes(challenge.category)) {
          return false;
        }
      }
      
      // Filter by difficulty
      if (filters.difficulty && filters.difficulty.length > 0) {
        if (!filters.difficulty.includes(challenge.difficulty)) {
          return false;
        }
      }
      
      // Filter by search
      if (filters.search) {
        const searchLower = filters.search.toLowerCase();
        const titleMatch = challenge.title.toLowerCase().includes(searchLower);
        const descriptionMatch = challenge.description.toLowerCase().includes(searchLower);
        const tagsMatch = challenge.tags?.some(tag => tag.toLowerCase().includes(searchLower));
        
        if (!titleMatch && !descriptionMatch && !tagsMatch) {
          return false;
        }
      }
      
      return true;
    });
  }
  
  /**
   * Generate sample challenges for demo purposes
   */
  private static async generateSampleChallenges(): Promise<Challenge[]> {
    const now = new Date();
    const nextWeek = new Date(now);
    nextWeek.setDate(now.getDate() + 7);
    
    const nextMonth = new Date(now);
    nextMonth.setMonth(now.getMonth() + 1);
    
    const lastWeek = new Date(now);
    lastWeek.setDate(now.getDate() - 7);
    
    const challenges: Challenge[] = [
      {
        id: uuidv4(),
        title: 'Weekly Recycling Challenge',
        description: 'Recycle at least 5kg of plastic material within a week and earn rewards!',
        category: ChallengeCategory.RECYCLING,
        difficulty: ChallengeDifficulty.EASY,
        status: ChallengeStatus.ACTIVE,
        startDate: lastWeek.toISOString(),
        endDate: nextWeek.toISOString(),
        goalType: ChallengeGoalType.WEIGHT,
        goalTarget: 5,
        currentProgress: 0,
        participants: 0,
        rewards: {
          points: 100,
          badges: ['Weekly Recycler'],
        },
        imageUrl: 'https://example.com/weekly-challenge.jpg',
        rules: [
          'Only plastic materials count towards progress',
          'Must be properly cleaned and sorted',
          'Submit proof of recycling through the app',
        ],
        tags: ['weekly', 'plastic', 'recycling'],
      },
      {
        id: uuidv4(),
        title: 'Community Cleanup Day',
        description: 'Join your local community for a day of cleanup and recycling activities.',
        category: ChallengeCategory.COMMUNITY,
        difficulty: ChallengeDifficulty.MEDIUM,
        status: ChallengeStatus.UPCOMING,
        startDate: nextWeek.toISOString(),
        endDate: nextMonth.toISOString(),
        goalType: ChallengeGoalType.PEOPLE,
        goalTarget: 50,
        currentProgress: 0,
        participants: 0,
        rewards: {
          points: 250,
          badges: ['Community Hero'],
        },
        imageUrl: 'https://example.com/community-cleanup.jpg',
        rules: [
          'Register through the app',
          'Check in at the event',
          'Participate for at least 2 hours',
        ],
        tags: ['community', 'cleanup', 'event'],
      },
      {
        id: uuidv4(),
        title: 'Zero Waste Month',
        description: 'Challenge yourself to produce zero waste for an entire month.',
        category: ChallengeCategory.REDUCTION,
        difficulty: ChallengeDifficulty.HARD,
        status: ChallengeStatus.UPCOMING,
        startDate: nextMonth.toISOString(),
        endDate: new Date(nextMonth.getTime() + 30 * 24 * 60 * 60 * 1000).toISOString(),
        goalType: ChallengeGoalType.DAYS,
        goalTarget: 30,
        currentProgress: 0,
        participants: 0,
        rewards: {
          points: 500,
          badges: ['Zero Waste Champion'],
        },
        imageUrl: 'https://example.com/zero-waste.jpg',
        rules: [
          'Log your waste daily',
          'Share tips and progress with the community',
          'Complete at least 3 zero-waste shopping trips',
        ],
        tags: ['zero-waste', 'reduction', 'lifestyle'],
      },
      {
        id: uuidv4(),
        title: 'Plastic Free July',
        description: 'Avoid single-use plastics for the entire month of July.',
        category: ChallengeCategory.REDUCTION,
        difficulty: ChallengeDifficulty.MEDIUM,
        status: ChallengeStatus.UPCOMING,
        startDate: new Date(now.getFullYear(), 6, 1).toISOString(), // July 1
        endDate: new Date(now.getFullYear(), 6, 31).toISOString(), // July 31
        goalType: ChallengeGoalType.DAYS,
        goalTarget: 31,
        currentProgress: 0,
        participants: 0,
        rewards: {
          points: 300,
          badges: ['Plastic Free Warrior'],
        },
        imageUrl: 'https://example.com/plastic-free.jpg',
        rules: [
          'Log your plastic-free days',
          'Share alternatives to single-use plastics',
          'Participate in weekly check-ins',
        ],
        tags: ['plastic-free', 'july', 'reduction'],
      },
      {
        id: uuidv4(),
        title: 'Recycling Education Challenge',
        description: 'Learn about proper recycling practices and share your knowledge with others.',
        category: ChallengeCategory.EDUCATION,
        difficulty: ChallengeDifficulty.EASY,
        status: ChallengeStatus.ACTIVE,
        startDate: lastWeek.toISOString(),
        endDate: nextMonth.toISOString(),
        goalType: ChallengeGoalType.ACTIONS,
        goalTarget: 10,
        currentProgress: 0,
        participants: 0,
        rewards: {
          points: 150,
          badges: ['Recycling Educator'],
        },
        imageUrl: 'https://example.com/recycling-education.jpg',
        rules: [
          'Complete the in-app recycling quiz',
          'Share educational content on social media',
          'Teach at least 3 friends about proper recycling',
        ],
        tags: ['education', 'awareness', 'knowledge'],
      },
    ];
    
    // Save the sample challenges
    await AsyncStorage.setItem(CHALLENGES_KEY, JSON.stringify(challenges));
    
    return challenges;
  }
} 