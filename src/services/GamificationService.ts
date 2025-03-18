/**
 * GamificationService
 * Manages all aspects of gamification for the app including:
 * - Achievement tracking and unlocking
 * - Badge awards
 * - Point system and leveling
 * - Environmental impact metrics
 */

import { SafeStorage } from '@/utils/storage';
import { Achievement, AchievementCategory, AchievementStatus, Badge, BadgeLevel, EcoImpact, GamifiedUserProfile, LevelDefinition, RewardType } from '@/types/gamification';
import NotificationService from './NotificationService';

class GamificationService {
  private static instance: GamificationService;
  private notificationService: NotificationService;
  
  private userProfile: GamifiedUserProfile | null = null;
  private levels: LevelDefinition[] = [];
  private achievements: Achievement[] = [];
  private badges: Badge[] = [];
  
  private constructor() {
    this.notificationService = NotificationService.getInstance();
    this.initLevels();
    this.initAchievements();
    this.initBadges();
  }
  
  /**
   * Gets the singleton instance of the GamificationService
   */
  public static getInstance(): GamificationService {
    if (!GamificationService.instance) {
      GamificationService.instance = new GamificationService();
    }
    return GamificationService.instance;
  }
  
  /**
   * Initializes or retrieves a user's gamification profile
   * @param userId The ID of the user to initialize
   */
  public async initializeUserProfile(userId: string): Promise<GamifiedUserProfile> {
    try {
      // Check if we have saved profile data
      const savedProfile = await SafeStorage.getItem(`gamification_profile_${userId}`);
      
      if (savedProfile) {
        const parsedProfile = JSON.parse(savedProfile) as GamifiedUserProfile;
        this.userProfile = parsedProfile;
        
        // Convert string dates back to Date objects
        if (this.userProfile) {
          this.userProfile.lastActiveDate = new Date(this.userProfile.lastActiveDate);
          this.userProfile.streakStartDate = new Date(this.userProfile.streakStartDate);
          this.userProfile.createdAt = new Date(this.userProfile.createdAt);
          this.userProfile.updatedAt = new Date(this.userProfile.updatedAt);
          
          // Update streak (if needed)
          await this.updateStreak();
        }
      } else {
        // Create a new profile
        this.userProfile = {
          userId,
          username: '', // This should be set elsewhere
          totalPoints: 0,
          currentPoints: 0,
          pointsToNextLevel: 100, // Level 1 requirement
          level: 1,
          badges: [],
          achievements: [],
          ecoImpact: {
            co2Saved: 0,
            waterSaved: 0,
            energySaved: 0,
            treesEquivalent: 0,
            plasticSaved: 0,
            paperSaved: 0,
            wasteNotLandfilled: 0
          },
          lastActiveDate: new Date(),
          streakDays: 0,
          streakStartDate: new Date(),
          materialStats: {
            plastic: 0,
            paper: 0,
            glass: 0,
            metal: 0,
            electronics: 0,
            other: 0
          },
          joinedChallenges: [],
          completedChallenges: [],
          activityHistory: [],
          createdAt: new Date(),
          updatedAt: new Date()
        };
        
        await this.saveUserProfile();
      }
      
      if (!this.userProfile) {
        throw new Error('Failed to initialize user profile');
      }
      
      return this.userProfile;
    } catch (error) {
      console.error('Error initializing gamification profile:', error);
      throw error;
    }
  }
  
  /**
   * Gets the current user's gamification profile
   */
  public getUserProfile(): GamifiedUserProfile | null {
    return this.userProfile;
  }
  
  /**
   * Adds points to the user's account
   * @param points Number of points to add
   * @param reason Reason for adding points (for tracking)
   */
  public async addPoints(points: number, reason: string): Promise<boolean> {
    if (!this.userProfile) {
      console.error('Cannot add points: user profile not initialized');
      return false;
    }
    
    // Update points
    this.userProfile.totalPoints += points;
    this.userProfile.currentPoints += points;
    
    // Add to activity history
    this.userProfile.activityHistory.push({
      type: 'points_earned',
      value: points,
      metadata: { reason },
      timestamp: new Date().toISOString()
    });
    
    // Check for level up
    const nextLevel = this.getNextLevel(this.userProfile.level);
    if (nextLevel && nextLevel.minPoints !== undefined && this.userProfile.totalPoints >= nextLevel.minPoints) {
      if (nextLevel.level !== undefined) {
        this.userProfile.level = nextLevel.level;
      }
      
      // Send level up notification
      if (nextLevel.level !== undefined && nextLevel.title !== undefined) {
        const perksText = nextLevel.perks && nextLevel.perks.length > 0 
          ? nextLevel.perks.join(', ') 
          : '';
          
        await this.notificationService.sendAchievementNotification(
          `level_${nextLevel.level}`,
          `Level ${nextLevel.level} - ${nextLevel.title}`,
          `Congratulations! You've reached level ${nextLevel.level}. ${perksText}`
        );
      }
    }
    
    // Calculate points to next level
    const currentLevel = this.levels.find(l => l.level === (this.userProfile ? this.userProfile.level : -1));
    if (currentLevel && currentLevel.maxPoints !== undefined && this.userProfile) {
      this.userProfile.pointsToNextLevel = currentLevel.maxPoints - this.userProfile.currentPoints;
    }
    
    // Save the updated profile
    await this.saveUserProfile();
    
    return true;
  }
  
  /**
   * Checks if any achievements have been unlocked based on the provided value
   * @param category The category of achievement to check
   * @param value The current value to check against achievement requirements
   * @returns Array of newly unlocked achievements
   */
  public async checkAchievements(category: AchievementCategory, value: number): Promise<Achievement[]> {
    if (!this.userProfile) {
      console.error('Cannot check achievements: user profile not initialized');
      return [];
    }
    
    const unlockedAchievements: Achievement[] = [];
    
    // Find achievements that match the category and aren't already unlocked
    const eligibleAchievements = this.achievements.filter(a => 
      a.category === category && 
      !this.userProfile?.achievements.some((ua: Achievement) => ua.id === a.id)
    );
    
    for (const achievement of eligibleAchievements) {
      if (achievement.totalRequired && value >= achievement.totalRequired) {
        // Unlock the achievement
        const unlockedAchievement = {
          ...achievement,
          isUnlocked: true,
          unlockedAt: new Date().toISOString(),
          status: AchievementStatus.COMPLETED
        };
        
        this.userProfile.achievements.push(unlockedAchievement);
        unlockedAchievements.push(unlockedAchievement);
        
        // Award points
        await this.addPoints(achievement.pointsAwarded || 0, `Achievement: ${achievement.title}`);
        
        // Send notification
        await this.notificationService.sendAchievementNotification(
          achievement.id,
          achievement.title,
          `You've unlocked: ${achievement.title}. ${achievement.description}`
        );
      }
    }
    
    // Check if any badges can be unlocked based on these achievements
    if (unlockedAchievements.length > 0) {
      await this.checkBadges(category);
    }
    
    await this.saveUserProfile();
    return unlockedAchievements;
  }
  
  /**
   * Checks if any badges should be unlocked based on achievements in a category
   * @param category The achievement category to check badges for
   * @returns Array of newly unlocked badges
   */
  private async checkBadges(category: AchievementCategory): Promise<Badge[]> {
    if (!this.userProfile) {
      return [];
    }
    
    const unlockedBadges: Badge[] = [];
    
    // Calculate how many achievements the user has in this category
    const achievementsInCategory = this.userProfile.achievements.filter(
      (a: Achievement) => a.category === category
    ).length;
    
    // Get badges in this category that aren't unlocked yet
    const eligibleBadges = this.badges.filter(b => 
      b.category === category && 
      !this.userProfile?.badges.some((ub: Badge) => ub.id === b.id)
    );
    
    // Define the threshold for each badge level
    const thresholds: Record<string, number> = {
      [BadgeLevel.BRONZE]: 3,
      [BadgeLevel.SILVER]: 6,
      [BadgeLevel.GOLD]: 10,
      [BadgeLevel.PLATINUM]: 15
    };
    
    for (const badge of eligibleBadges) {
      const badgeLevel = badge.level as string;
      if (badgeLevel && thresholds[badgeLevel] && achievementsInCategory >= thresholds[badgeLevel]) {
        // Unlock the badge
        const unlockedBadge = {
          ...badge,
          isUnlocked: true,
          unlockedAt: new Date().toISOString()
        };
        
        this.userProfile.badges.push(unlockedBadge);
        unlockedBadges.push(unlockedBadge);
        
        // Award points
        const pointsForBadge = {
          [BadgeLevel.BRONZE]: 50,
          [BadgeLevel.SILVER]: 100,
          [BadgeLevel.GOLD]: 200,
          [BadgeLevel.PLATINUM]: 500
        };
        
        if (badgeLevel in pointsForBadge) {
          await this.addPoints(pointsForBadge[badgeLevel as keyof typeof pointsForBadge], `Badge: ${badge.name}`);
        }
        
        // Send notification
        await this.notificationService.sendAchievementNotification(
          badge.id,
          badge.name,
          `You've earned the ${badge.name} badge! ${badge.description}`
        );
      }
    }
    
    await this.saveUserProfile();
    return unlockedBadges;
  }
  
  /**
   * Updates environmental impact metrics and checks for related achievements
   * @param impact The impact metrics to add
   */
  public async updateEcoImpact(impact: Partial<EcoImpact>): Promise<void> {
    if (!this.userProfile) {
      console.error('Cannot update eco impact: user profile not initialized');
      return;
    }
    
    // Update each impact metric
    if (impact.co2Saved) {
      this.userProfile.ecoImpact.co2Saved += impact.co2Saved;
    }
    
    if (impact.waterSaved) {
      this.userProfile.ecoImpact.waterSaved += impact.waterSaved;
    }
    
    if (impact.energySaved) {
      this.userProfile.ecoImpact.energySaved += impact.energySaved;
    }
    
    if (impact.treesEquivalent) {
      this.userProfile.ecoImpact.treesEquivalent += impact.treesEquivalent;
    }
    
    if (impact.plasticSaved) {
      this.userProfile.ecoImpact.plasticSaved += impact.plasticSaved;
    }
    
    if (impact.paperSaved) {
      this.userProfile.ecoImpact.paperSaved += impact.paperSaved;
    }
    
    if (impact.wasteNotLandfilled) {
      this.userProfile.ecoImpact.wasteNotLandfilled += impact.wasteNotLandfilled;
    }
    
    // Check for achievements related to eco impact
    if (impact.co2Saved) {
      await this.checkAchievements(AchievementCategory.ECO_IMPACT, this.userProfile.ecoImpact.co2Saved);
    }
    
    if (impact.waterSaved) {
      await this.checkAchievements(AchievementCategory.ECO_IMPACT, this.userProfile.ecoImpact.waterSaved);
    }
    
    await this.saveUserProfile();
  }
  
  /**
   * Records recycling activity and updates relevant metrics
   * @param materialType The type of material recycled
   * @param weight The weight of the material in kg
   */
  public async trackRecyclingActivity(materialType: string, weight: number): Promise<void> {
    if (!this.userProfile) {
      console.error('Cannot track recycling: user profile not initialized');
      return;
    }
    
    // Update material stats
    if (materialType in this.userProfile.materialStats) {
      this.userProfile.materialStats[materialType as keyof typeof this.userProfile.materialStats] += weight;
    } else {
      this.userProfile.materialStats.other += weight;
    }
    
    // Calculate environmental impact of this recycling
    const impact = this.calculateEcoImpact(materialType, weight);
    await this.updateEcoImpact(impact);
    
    // Award points (10 points per kg)
    await this.addPoints(Math.round(weight * 10), `Recycled ${weight}kg of ${materialType}`);
    
    // Update streak and last active date
    this.userProfile.lastActiveDate = new Date();
    await this.updateStreak();
    
    // Check recycling achievements
    await this.checkAchievements(AchievementCategory.RECYCLING, weight);
  }
  
  /**
   * Records a collection completed by the user
   */
  public async trackCollection(): Promise<void> {
    if (!this.userProfile) {
      console.error('Cannot track collection: user profile not initialized');
      return;
    }
    
    // Count user's collections from achievements or other metrics
    const collectionsCount = this.userProfile.achievements.filter(
      (a: Achievement) => a.category === AchievementCategory.COLLECTION
    ).length + 1;
    
    // Add points
    await this.addPoints(25, `Collection #${collectionsCount} completed`);
    
    // Check collection achievements
    await this.checkAchievements(AchievementCategory.COLLECTION, collectionsCount);
  }
  
  /**
   * Updates the user's streak based on activity date
   */
  private async updateStreak(): Promise<void> {
    if (!this.userProfile) return;
    
    const currentDate = new Date();
    const lastActiveDate = new Date(this.userProfile.lastActiveDate);
    
    // Reset time portion for date comparison
    currentDate.setHours(0, 0, 0, 0);
    lastActiveDate.setHours(0, 0, 0, 0);
    
    // If the user was already active today, no need to update
    if (currentDate.getTime() === lastActiveDate.getTime()) {
      return;
    }
    
    // Calculate the difference in days
    const msPerDay = 24 * 60 * 60 * 1000;
    const dayDiff = Math.round((currentDate.getTime() - lastActiveDate.getTime()) / msPerDay);
    
    if (dayDiff === 1) {
      // User was active yesterday, increment streak
      this.userProfile.streakDays += 1;
      
      // Give streak bonus if divisible by 5
      if (this.userProfile.streakDays % 5 === 0) {
        await this.addPoints(this.userProfile.streakDays * 2, `${this.userProfile.streakDays} day streak bonus!`);
        
        // Send streak achievement notification
        await this.notificationService.sendAchievementNotification(
          `streak_${this.userProfile.streakDays}`,
          `${this.userProfile.streakDays} Day Streak!`,
          `You've used EcoCart for ${this.userProfile.streakDays} days in a row! Keep it up!`
        );
      }
    } else if (dayDiff > 1) {
      // Streak broken, reset it
      this.userProfile.streakDays = 1;
      this.userProfile.streakStartDate = new Date();
    }
    
    // Update last active date
    this.userProfile.lastActiveDate = new Date();
    
    await this.saveUserProfile();
  }
  
  /**
   * Saves the user profile to AsyncStorage
   */
  private async saveUserProfile(): Promise<void> {
    if (!this.userProfile) return;
    
    try {
      this.userProfile.updatedAt = new Date();
      
      // Create a copy to modify dates to strings for storage
      const profileForStorage = {
        ...this.userProfile,
        lastActiveDate: this.userProfile.lastActiveDate.toISOString(),
        streakStartDate: this.userProfile.streakStartDate.toISOString(),
        createdAt: this.userProfile.createdAt.toISOString(),
        updatedAt: this.userProfile.updatedAt.toISOString()
      };
      
      await AsyncStorage.setItem(
        `gamification_profile_${this.userProfile.userId}`,
        JSON.stringify(profileForStorage)
      );
    } catch (error) {
      console.error('Error saving gamification profile:', error);
    }
  }
  
  /**
   * Calculates the environmental impact of recycling a material
   * @param materialType The type of material recycled
   * @param weight The weight in kg
   * @returns Environmental impact metrics
   */
  private calculateEcoImpact(materialType: string, weight: number): EcoImpact {
    // Base impact values for 1kg of each material
    // These are approximate and should be adjusted with accurate data
    const impactFactors: Record<string, {
      co2: number; // kg of CO2 saved per kg of material
      water: number; // liters of water saved
      energy: number; // kWh of energy saved
      trees: number; // equivalent trees (fraction)
    }> = {
      plastic: {
        co2: 2.5,
        water: 100,
        energy: 5.0,
        trees: 0.02
      },
      paper: {
        co2: 1.0,
        water: 40,
        energy: 1.5,
        trees: 0.1
      },
      glass: {
        co2: 0.3,
        water: 20,
        energy: 0.8,
        trees: 0.01
      },
      metal: {
        co2: 8.0,
        water: 120,
        energy: 14.0,
        trees: 0.04
      },
      electronics: {
        co2: 20.0,
        water: 200,
        energy: 30.0,
        trees: 0.1
      },
      other: {
        co2: 1.0,
        water: 30,
        energy: 1.0,
        trees: 0.01
      }
    };
    
    // Get the impact factors for this material (or default to 'other')
    const factors = impactFactors[materialType.toLowerCase()] || impactFactors.other;
    
    // Calculate impact
    return {
      co2Saved: weight * factors.co2,
      waterSaved: weight * factors.water,
      energySaved: weight * factors.energy,
      treesEquivalent: weight * factors.trees,
      plasticSaved: materialType.toLowerCase() === 'plastic' ? weight : 0,
      paperSaved: materialType.toLowerCase() === 'paper' ? weight : 0,
      wasteNotLandfilled: weight
    };
  }
  
  /**
   * Gets the next level information
   * @param currentLevel The user's current level
   * @returns The next level or null if at max level
   */
  private getNextLevel(currentLevel: number): LevelDefinition | null {
    return this.levels.find(l => l.level === currentLevel + 1) || null;
  }
  
  /**
   * Initializes the level system
   */
  private initLevels(): void {
    this.levels = [
      {
        level: 1,
        title: 'Eco Novice',
        minPoints: 0,
        maxPoints: 100,
        perks: ['Basic features']
      },
      {
        level: 2,
        title: 'Eco Apprentice',
        minPoints: 100,
        maxPoints: 300,
        perks: ['Access to challenges']
      },
      {
        level: 3,
        title: 'Eco Enthusiast',
        minPoints: 300,
        maxPoints: 700,
        perks: ['Detailed impact insights']
      },
      {
        level: 4,
        title: 'Eco Champion',
        minPoints: 700,
        maxPoints: 1500,
        perks: ['Custom collection scheduling']
      },
      {
        level: 5,
        title: 'Eco Warrior',
        minPoints: 1500,
        maxPoints: 3000,
        perks: ['Partner discounts', 'Monthly impact report']
      },
      {
        level: 6,
        title: 'Eco Master',
        minPoints: 3000,
        maxPoints: 5000,
        perks: ['Priority pickups', 'Custom badges']
      },
      {
        level: 7,
        title: 'Eco Legend',
        minPoints: 5000,
        maxPoints: 8000,
        perks: ['Create community challenges', 'Special events']
      },
      {
        level: 8,
        title: 'Eco Virtuoso',
        minPoints: 8000,
        maxPoints: 12000,
        perks: ['Recognition in community', 'Beta feature access']
      },
      {
        level: 9,
        title: 'Eco Luminary',
        minPoints: 12000,
        maxPoints: 18000,
        perks: ['Premium app themes', 'Donation matching']
      },
      {
        level: 10,
        title: 'Eco Paragon',
        minPoints: 18000,
        maxPoints: 999999,
        perks: ['Ambassadorship opportunity', 'Elite recognition']
      }
    ];
  }
  
  /**
   * Initializes the system achievements
   */
  private initAchievements(): void {
    this.achievements = [
      // Recycling Achievements
      {
        id: 'recycling_1',
        title: 'First Steps',
        description: 'Recycle your first item',
        category: AchievementCategory.RECYCLING,
        iconName: 'leaf',
        pointsAwarded: 10,
        isUnlocked: false,
        totalRequired: 1,
        status: AchievementStatus.LOCKED,
        requirements: [{ type: 'recycle_count', value: 1 }],
        reward: { id: 'r1', type: RewardType.POINTS, value: 10, title: '10 Points' },
        icon: 'leaf'
      },
      {
        id: 'recycling_2',
        title: 'Getting Started',
        description: 'Recycle 10kg of materials',
        category: AchievementCategory.RECYCLING,
        iconName: 'trash',
        pointsAwarded: 25,
        isUnlocked: false,
        totalRequired: 10,
        status: AchievementStatus.LOCKED,
        requirements: [{ type: 'recycle_weight', value: 10 }],
        reward: { id: 'r2', type: RewardType.POINTS, value: 25, title: '25 Points' },
        icon: 'trash'
      },
      {
        id: 'recycling_3',
        title: 'Consistent Recycler',
        description: 'Recycle 50kg of materials',
        category: AchievementCategory.RECYCLING,
        iconName: 'trash',
        pointsAwarded: 50,
        isUnlocked: false,
        totalRequired: 50,
        status: AchievementStatus.LOCKED,
        requirements: [{ type: 'recycle_weight', value: 50 }],
        reward: { id: 'r3', type: RewardType.POINTS, value: 50, title: '50 Points' },
        icon: 'trash'
      },
      {
        id: 'recycling_4',
        title: 'Recycling Enthusiast',
        description: 'Recycle 100kg of materials',
        category: AchievementCategory.RECYCLING,
        iconName: 'trash',
        pointsAwarded: 100,
        isUnlocked: false,
        totalRequired: 100,
        status: AchievementStatus.LOCKED,
        requirements: [{ type: 'recycle_weight', value: 100 }],
        reward: { id: 'r4', type: RewardType.POINTS, value: 100, title: '100 Points' },
        icon: 'trash'
      },
      
      // Collection Achievements
      {
        id: 'collection_1',
        title: 'First Collection',
        description: 'Complete your first collection',
        category: AchievementCategory.COLLECTION,
        iconName: 'cube',
        pointsAwarded: 20,
        isUnlocked: false,
        totalRequired: 1,
        status: AchievementStatus.LOCKED,
        requirements: [{ type: 'collection_count', value: 1 }],
        reward: { id: 'r5', type: RewardType.POINTS, value: 20, title: '20 Points' },
        icon: 'cube'
      },
      {
        id: 'collection_2',
        title: 'Regular Contributor',
        description: 'Complete 5 collections',
        category: AchievementCategory.COLLECTION,
        iconName: 'cube',
        pointsAwarded: 40,
        isUnlocked: false,
        totalRequired: 5,
        status: AchievementStatus.LOCKED,
        requirements: [{ type: 'collection_count', value: 5 }],
        reward: { id: 'r6', type: RewardType.POINTS, value: 40, title: '40 Points' },
        icon: 'cube'
      },
      {
        id: 'collection_3',
        title: 'Dedicated Recycler',
        description: 'Complete 10 collections',
        category: AchievementCategory.COLLECTION,
        iconName: 'cube',
        pointsAwarded: 75,
        isUnlocked: false,
        totalRequired: 10,
        status: AchievementStatus.LOCKED,
        requirements: [{ type: 'collection_count', value: 10 }],
        reward: { id: 'r7', type: RewardType.POINTS, value: 75, title: '75 Points' },
        icon: 'cube'
      },
      
      // Eco Impact Achievements
      {
        id: 'eco_impact_1',
        title: 'Climate Protector',
        description: 'Save 10kg of CO₂ emissions',
        category: AchievementCategory.ECO_IMPACT,
        iconName: 'cloud',
        pointsAwarded: 30,
        isUnlocked: false,
        totalRequired: 10,
        status: AchievementStatus.LOCKED,
        requirements: [{ type: 'co2_saved', value: 10 }],
        reward: { id: 'r8', type: RewardType.POINTS, value: 30, title: '30 Points' },
        icon: 'cloud'
      },
      {
        id: 'eco_impact_2',
        title: 'Water Conserver',
        description: 'Save 100 liters of water',
        category: AchievementCategory.ECO_IMPACT,
        iconName: 'water',
        pointsAwarded: 30,
        isUnlocked: false,
        totalRequired: 100,
        status: AchievementStatus.LOCKED,
        requirements: [{ type: 'water_saved', value: 100 }],
        reward: { id: 'r9', type: RewardType.POINTS, value: 30, title: '30 Points' },
        icon: 'water'
      },
      {
        id: 'eco_impact_3',
        title: 'Energy Saver',
        description: 'Save 100 kWh of energy',
        category: AchievementCategory.ECO_IMPACT,
        iconName: 'flash',
        pointsAwarded: 30,
        isUnlocked: false,
        totalRequired: 100,
        status: AchievementStatus.LOCKED,
        requirements: [{ type: 'energy_saved', value: 100 }],
        reward: { id: 'r10', type: RewardType.POINTS, value: 30, title: '30 Points' },
        icon: 'flash'
      }
    ];
  }
  
  /**
   * Initializes the badge system
   */
  private initBadges(): void {
    this.badges = [
      // Recycling badges
      {
        id: 'badge_recycling_bronze',
        name: 'Recycling Bronze',
        description: 'Earn 3 recycling achievements',
        category: AchievementCategory.RECYCLING,
        level: BadgeLevel.BRONZE,
        iconName: 'medal',
        isUnlocked: false,
        icon: 'medal',
        rarity: 'uncommon'
      },
      {
        id: 'badge_recycling_silver',
        name: 'Recycling Silver',
        description: 'Earn 6 recycling achievements',
        category: AchievementCategory.RECYCLING,
        level: BadgeLevel.SILVER,
        iconName: 'medal',
        isUnlocked: false,
        icon: 'medal',
        rarity: 'rare'
      },
      {
        id: 'badge_recycling_gold',
        name: 'Recycling Gold',
        description: 'Earn 10 recycling achievements',
        category: AchievementCategory.RECYCLING,
        level: BadgeLevel.GOLD,
        iconName: 'medal',
        isUnlocked: false,
        icon: 'medal',
        rarity: 'epic'
      },
      
      // Collection badges
      {
        id: 'badge_collection_bronze',
        name: 'Collection Bronze',
        description: 'Earn 3 collection achievements',
        category: AchievementCategory.COLLECTION,
        level: BadgeLevel.BRONZE,
        iconName: 'ribbon',
        isUnlocked: false,
        icon: 'ribbon',
        rarity: 'uncommon'
      },
      {
        id: 'badge_collection_silver',
        name: 'Collection Silver',
        description: 'Earn 6 collection achievements',
        category: AchievementCategory.COLLECTION,
        level: BadgeLevel.SILVER,
        iconName: 'ribbon',
        isUnlocked: false,
        icon: 'ribbon',
        rarity: 'rare'
      },
      
      // Eco Impact badges
      {
        id: 'badge_eco_impact_bronze',
        name: 'Eco Impact Bronze',
        description: 'Earn 3 eco impact achievements',
        category: AchievementCategory.ECO_IMPACT,
        level: BadgeLevel.BRONZE,
        iconName: 'planet',
        isUnlocked: false,
        icon: 'planet',
        rarity: 'uncommon'
      }
    ];
  }
}

export default GamificationService; 