/**
 * QuestService
 * Manages the quest and mission system for the app, including:
 * - Daily quests & missions
 * - Weekly challenges
 * - Special events/seasonal quests
 * - Quest progression tracking
 * - Reward distribution
 */

import {
    Quest,
    QuestDifficulty,
    QuestProgress,
    QuestReward,
    QuestStatus,
    QuestType
} from '@/types/gamification';
import { SafeStorage } from '@/utils/storage';
import GamificationService from './GamificationService';
import NotificationService from './NotificationService';

class QuestService {
  private static instance: QuestService;
  private gamificationService: GamificationService;
  private notificationService: NotificationService;
  
  private dailyQuests: Quest[] = [];
  private weeklyQuests: Quest[] = [];
  private specialQuests: Quest[] = [];
  private userQuestProgress: Record<string, QuestProgress> = {};
  private userId: string | null = null;
  private refreshTimer: NodeJS.Timeout | null = null;
  
  private constructor() {
    this.gamificationService = GamificationService.getInstance();
    this.notificationService = NotificationService.getInstance();
  }
  
  /**
   * Gets the singleton instance of the QuestService
   */
  public static getInstance(): QuestService {
    if (!QuestService.instance) {
      QuestService.instance = new QuestService();
    }
    return QuestService.instance;
  }
  
  /**
   * Initialize the quest system for a user
   * @param userId User ID to initialize quests for
   */
  public async initialize(userId: string): Promise<void> {
    this.userId = userId;
    
    // Load saved quest progress
    await this.loadQuestProgress();
    
    // Initialize quests
    await this.generateDailyQuests();
    await this.generateWeeklyQuests();
    await this.loadSpecialQuests();
    
    // Set up refresh timer to check for new daily/weekly quests
    this.setupQuestRefreshTimer();
  }
  
  /**
   * Get all active quests for the current user
   */
  public getActiveQuests(): { daily: Quest[], weekly: Quest[], special: Quest[] } {
    return {
      daily: this.dailyQuests,
      weekly: this.weeklyQuests,
      special: this.specialQuests
    };
  }
  
  /**
   * Track progress for a specific activity type
   * @param activityType The type of activity (e.g., 'recycle', 'collection', 'app_open')
   * @param value The amount to increment (default: 1)
   * @param metadata Additional data related to the activity
   */
  public async trackActivity(
    activityType: string, 
    value: number = 1, 
    metadata?: Record<string, any>
  ): Promise<Quest[]> {
    if (!this.userId) {
      console.error('Cannot track activity: user not initialized');
      return [];
    }
    
    const completedQuests: Quest[] = [];
    const allQuests = [...this.dailyQuests, ...this.weeklyQuests, ...this.specialQuests];
    
    // Check each quest to see if this activity contributes to its progress
    for (const quest of allQuests) {
      if (quest.status === QuestStatus.COMPLETED || quest.status === QuestStatus.CLAIMED) {
        continue;
      }
      
      // Check if the quest requires this activity type
      if (quest.activityType === activityType) {
        const questId = quest.id;
        const currentProgress = this.userQuestProgress[questId] || {
          questId,
          userId: this.userId,
          currentValue: 0,
          targetValue: quest.targetValue,
          completedAt: null,
          status: QuestStatus.IN_PROGRESS
        };
        
        // Increment progress
        currentProgress.currentValue += value;
        
        // Check if quest is now complete
        if (currentProgress.currentValue >= currentProgress.targetValue && 
            currentProgress.status !== QuestStatus.COMPLETED) {
          currentProgress.status = QuestStatus.COMPLETED;
          currentProgress.completedAt = new Date().toISOString();
          
          // Update the quest status
          quest.status = QuestStatus.COMPLETED;
          completedQuests.push(quest);
          
          // Notify the user
          await this.notificationService.sendQuestNotification(
            quest.id,
            'Quest Completed!',
            `You've completed the quest: ${quest.title}. Claim your reward!`
          );
        }
        
        // Update progress
        this.userQuestProgress[questId] = currentProgress;
        quest.currentValue = currentProgress.currentValue;
        quest.progress = Math.min(100, Math.round((currentProgress.currentValue / quest.targetValue) * 100));
      }
    }
    
    // Save progress
    await this.saveQuestProgress();
    
    return completedQuests;
  }
  
  /**
   * Claim rewards for a completed quest
   * @param questId ID of the quest to claim rewards for
   */
  public async claimQuestReward(questId: string): Promise<QuestReward | null> {
    if (!this.userId) {
      console.error('Cannot claim reward: user not initialized');
      return null;
    }
    
    // Find the quest
    const allQuests = [...this.dailyQuests, ...this.weeklyQuests, ...this.specialQuests];
    const quest = allQuests.find(q => q.id === questId);
    
    if (!quest) {
      console.error(`Quest not found: ${questId}`);
      return null;
    }
    
    if (quest.status !== QuestStatus.COMPLETED) {
      console.error(`Quest ${questId} is not completed`);
      return null;
    }
    
    // Mark as claimed
    quest.status = QuestStatus.CLAIMED;
    const questProgress = this.userQuestProgress[questId];
    if (questProgress) {
      questProgress.status = QuestStatus.CLAIMED;
    }
    
    // Award the rewards
    if (quest.reward.points) {
      await this.gamificationService.addPoints(
        quest.reward.points, 
        `Quest reward: ${quest.title}`
      );
    }
    
    // Handle other reward types here (badges, items, etc.)
    
    // Save progress
    await this.saveQuestProgress();
    
    return quest.reward;
  }
  
  /**
   * Generate a new set of daily quests
   */
  private async generateDailyQuests(): Promise<void> {
    // Check if we've already generated quests for today
    if (this.dailyQuests.length > 0) {
      const lastQuestDate = new Date(this.dailyQuests[0].expiresAt);
      const today = new Date();
      if (
        lastQuestDate.getDate() === today.getDate() &&
        lastQuestDate.getMonth() === today.getMonth() &&
        lastQuestDate.getFullYear() === today.getFullYear()
      ) {
        // Already have today's quests
        return;
      }
    }
    
    // Clear old daily quests
    this.dailyQuests = [];
    
    // Create expiration date (end of today)
    const today = new Date();
    const endOfDay = new Date(today.getFullYear(), today.getMonth(), today.getDate(), 23, 59, 59);
    
    // Generate 3 random daily quests
    const dailyQuestTemplates = this.getDailyQuestTemplates();
    const selectedTemplates = this.getRandomItems(dailyQuestTemplates, 3);
    
    for (let i = 0; i < selectedTemplates.length; i++) {
      const template = selectedTemplates[i];
      const questId = `daily_${today.toISOString().split('T')[0]}_${i}`;
      
      const quest: Quest = {
        id: questId,
        title: template.title,
        description: template.description,
        type: QuestType.DAILY,
        category: template.category,
        activityType: template.activityType,
        targetValue: template.targetValue,
        currentValue: 0,
        progress: 0,
        status: QuestStatus.IN_PROGRESS,
        difficulty: template.difficulty,
        reward: template.reward,
        icon: template.icon,
        createdAt: new Date().toISOString(),
        expiresAt: endOfDay.toISOString()
      };
      
      // Initialize progress entry if not exists
      if (!this.userQuestProgress[questId]) {
        this.userQuestProgress[questId] = {
          questId,
          userId: this.userId!,
          currentValue: 0,
          targetValue: quest.targetValue,
          completedAt: null,
          status: QuestStatus.IN_PROGRESS
        };
      } else {
        // Update quest with saved progress
        const progress = this.userQuestProgress[questId];
        quest.currentValue = progress.currentValue;
        quest.progress = Math.min(100, Math.round((progress.currentValue / quest.targetValue) * 100));
        quest.status = progress.status;
      }
      
      this.dailyQuests.push(quest);
    }
    
    await this.saveQuestProgress();
  }
  
  /**
   * Generate a new set of weekly quests
   */
  private async generateWeeklyQuests(): Promise<void> {
    // Check if we've already generated quests for this week
    if (this.weeklyQuests.length > 0) {
      const lastQuestDate = new Date(this.weeklyQuests[0].expiresAt);
      const today = new Date();
      const weekStart = this.getStartOfWeek(today);
      const weekEnd = this.getEndOfWeek(today);
      
      if (lastQuestDate >= weekEnd) {
        // Already have this week's quests
        return;
      }
    }
    
    // Clear old weekly quests
    this.weeklyQuests = [];
    
    // Create expiration date (end of week)
    const today = new Date();
    const endOfWeek = this.getEndOfWeek(today);
    
    // Generate 2 random weekly quests
    const weeklyQuestTemplates = this.getWeeklyQuestTemplates();
    const selectedTemplates = this.getRandomItems(weeklyQuestTemplates, 2);
    
    for (let i = 0; i < selectedTemplates.length; i++) {
      const template = selectedTemplates[i];
      const questId = `weekly_${this.getWeekNumber(today)}_${i}`;
      
      const quest: Quest = {
        id: questId,
        title: template.title,
        description: template.description,
        type: QuestType.WEEKLY,
        category: template.category,
        activityType: template.activityType,
        targetValue: template.targetValue,
        currentValue: 0,
        progress: 0,
        status: QuestStatus.IN_PROGRESS,
        difficulty: template.difficulty,
        reward: template.reward,
        icon: template.icon,
        createdAt: new Date().toISOString(),
        expiresAt: endOfWeek.toISOString()
      };
      
      // Initialize progress entry if not exists
      if (!this.userQuestProgress[questId]) {
        this.userQuestProgress[questId] = {
          questId,
          userId: this.userId!,
          currentValue: 0,
          targetValue: quest.targetValue,
          completedAt: null,
          status: QuestStatus.IN_PROGRESS
        };
      } else {
        // Update quest with saved progress
        const progress = this.userQuestProgress[questId];
        quest.currentValue = progress.currentValue;
        quest.progress = Math.min(100, Math.round((progress.currentValue / quest.targetValue) * 100));
        quest.status = progress.status;
      }
      
      this.weeklyQuests.push(quest);
    }
    
    await this.saveQuestProgress();
  }
  
  /**
   * Load special quests from storage or API
   */
  private async loadSpecialQuests(): Promise<void> {
    // In a real implementation, these would come from an API
    // For now, we'll use a static set of special quests
    
    const now = new Date();
    const oneMonthLater = new Date(now);
    oneMonthLater.setMonth(oneMonthLater.getMonth() + 1);
    
    this.specialQuests = [
      {
        id: 'special_earth_day_2025',
        title: 'Earth Day Champion',
        description: 'Recycle 10kg of materials during Earth Week',
        type: QuestType.SPECIAL,
        category: AchievementCategory.RECYCLING,
        activityType: 'recycle',
        targetValue: 10,
        currentValue: 0,
        progress: 0,
        status: QuestStatus.IN_PROGRESS,
        difficulty: QuestDifficulty.MEDIUM,
        reward: {
          points: 500,
          badgeId: 'earth_day_2025',
          title: 'Earth Day 2025 Champion Badge'
        },
        icon: 'earth',
        createdAt: now.toISOString(),
        expiresAt: oneMonthLater.toISOString()
      }
    ];
    
    // Update with stored progress
    for (const quest of this.specialQuests) {
      if (this.userQuestProgress[quest.id]) {
        const progress = this.userQuestProgress[quest.id];
        quest.currentValue = progress.currentValue;
        quest.progress = Math.min(100, Math.round((progress.currentValue / quest.targetValue) * 100));
        quest.status = progress.status;
      } else {
        // Initialize progress
        this.userQuestProgress[quest.id] = {
          questId: quest.id,
          userId: this.userId!,
          currentValue: 0,
          targetValue: quest.targetValue,
          completedAt: null,
          status: QuestStatus.IN_PROGRESS
        };
      }
    }
  }
  
  /**
   * Load quest progress from storage
   */
  private async loadQuestProgress(): Promise<void> {
    if (!this.userId) return;
    
    try {
      const savedProgress = await SafeStorage.getItem(`quest_progress_${this.userId}`);
      if (savedProgress) {
        this.userQuestProgress = JSON.parse(savedProgress);
      }
    } catch (error) {
      console.error('Failed to load quest progress:', error);
    }
  }
  
  /**
   * Save quest progress to storage
   */
  private async saveQuestProgress(): Promise<void> {
    if (!this.userId) return;
    
    try {
      await SafeStorage.setItem(
        `quest_progress_${this.userId}`,
        JSON.stringify(this.userQuestProgress)
      );
    } catch (error) {
      console.error('Failed to save quest progress:', error);
    }
  }
  
  /**
   * Setup timer to check for quest refreshes
   */
  private setupQuestRefreshTimer(): void {
    // Clear existing timer if any
    if (this.refreshTimer) {
      clearInterval(this.refreshTimer);
    }
    
    // Check every hour if we need to refresh quests
    this.refreshTimer = setInterval(async () => {
      const now = new Date();
      
      // Check daily quests
      if (this.dailyQuests.length > 0) {
        const expiresAt = new Date(this.dailyQuests[0].expiresAt);
        if (now > expiresAt) {
          await this.generateDailyQuests();
        }
      } else {
        await this.generateDailyQuests();
      }
      
      // Check weekly quests
      if (this.weeklyQuests.length > 0) {
        const expiresAt = new Date(this.weeklyQuests[0].expiresAt);
        if (now > expiresAt) {
          await this.generateWeeklyQuests();
        }
      } else {
        await this.generateWeeklyQuests();
      }
    }, 60 * 60 * 1000); // Check every hour
  }
  
  /**
   * Get a random subset of items from an array
   */
  private getRandomItems<T>(items: T[], count: number): T[] {
    const shuffled = [...items].sort(() => 0.5 - Math.random());
    return shuffled.slice(0, count);
  }
  
  /**
   * Get the start date of the week for a given date
   */
  private getStartOfWeek(date: Date): Date {
    const result = new Date(date);
    const day = result.getDay();
    const diff = result.getDate() - day + (day === 0 ? -6 : 1);
    result.setDate(diff);
    result.setHours(0, 0, 0, 0);
    return result;
  }
  
  /**
   * Get the end date of the week for a given date
   */
  private getEndOfWeek(date: Date): Date {
    const result = new Date(date);
    const day = result.getDay();
    const diff = result.getDate() - day + (day === 0 ? 0 : 7);
    result.setDate(diff);
    result.setHours(23, 59, 59, 999);
    return result;
  }
  
  /**
   * Get the week number for a given date
   */
  private getWeekNumber(date: Date): number {
    const d = new Date(Date.UTC(date.getFullYear(), date.getMonth(), date.getDate()));
    const dayNum = d.getUTCDay() || 7;
    d.setUTCDate(d.getUTCDate() + 4 - dayNum);
    const yearStart = new Date(Date.UTC(d.getUTCFullYear(), 0, 1));
    return Math.ceil((((d.getTime() - yearStart.getTime()) / 86400000) + 1) / 7);
  }
  
  /**
   * Get daily quest templates
   */
  private getDailyQuestTemplates(): Partial<Quest>[] {
    return [
      {
        title: 'Daily Recycler',
        description: 'Recycle at least 1kg of materials today',
        category: AchievementCategory.RECYCLING,
        activityType: 'recycle',
        targetValue: 1,
        difficulty: QuestDifficulty.EASY,
        reward: { points: 50, title: '50 Points' },
        icon: 'leaf'
      },
      {
        title: 'App Check-in',
        description: 'Open the app and check your stats',
        category: AchievementCategory.APP_USAGE,
        activityType: 'app_open',
        targetValue: 1,
        difficulty: QuestDifficulty.EASY,
        reward: { points: 20, title: '20 Points' },
        icon: 'phone-portrait'
      },
      {
        title: 'Schedule a Collection',
        description: 'Schedule a recycling collection',
        category: AchievementCategory.COLLECTION,
        activityType: 'schedule_collection',
        targetValue: 1,
        difficulty: QuestDifficulty.EASY,
        reward: { points: 40, title: '40 Points' },
        icon: 'calendar'
      },
      {
        title: 'Plastic Saver',
        description: 'Recycle 2kg of plastic materials',
        category: AchievementCategory.RECYCLING,
        activityType: 'recycle_plastic',
        targetValue: 2,
        difficulty: QuestDifficulty.MEDIUM,
        reward: { points: 80, title: '80 Points' },
        icon: 'water'
      },
      {
        title: 'Paper Champion',
        description: 'Recycle 3kg of paper materials',
        category: AchievementCategory.RECYCLING,
        activityType: 'recycle_paper',
        targetValue: 3,
        difficulty: QuestDifficulty.MEDIUM,
        reward: { points: 80, title: '80 Points' },
        icon: 'document'
      },
      {
        title: 'Community Contributor',
        description: 'Share a recycling tip with the community',
        category: AchievementCategory.COMMUNITY,
        activityType: 'share_tip',
        targetValue: 1,
        difficulty: QuestDifficulty.EASY,
        reward: { points: 60, title: '60 Points' },
        icon: 'people'
      },
      {
        title: 'Electronics Savior',
        description: 'Recycle an electronic device',
        category: AchievementCategory.RECYCLING,
        activityType: 'recycle_electronics',
        targetValue: 1,
        difficulty: QuestDifficulty.MEDIUM,
        reward: { points: 100, title: '100 Points' },
        icon: 'hardware-chip'
      }
    ];
  }
  
  /**
   * Get weekly quest templates
   */
  private getWeeklyQuestTemplates(): Partial<Quest>[] {
    return [
      {
        title: 'Weekly Recycling Target',
        description: 'Recycle 10kg of materials this week',
        category: AchievementCategory.RECYCLING,
        activityType: 'recycle',
        targetValue: 10,
        difficulty: QuestDifficulty.MEDIUM,
        reward: { points: 200, title: '200 Points' },
        icon: 'leaf'
      },
      {
        title: 'Consistent Recycler',
        description: 'Recycle materials on 3 different days this week',
        category: AchievementCategory.RECYCLING,
        activityType: 'recycle_days',
        targetValue: 3,
        difficulty: QuestDifficulty.MEDIUM,
        reward: { points: 150, title: '150 Points' },
        icon: 'calendar'
      },
      {
        title: 'Impact Builder',
        description: 'Save 5kg of CO2 through your recycling this week',
        category: AchievementCategory.IMPACT,
        activityType: 'save_co2',
        targetValue: 5,
        difficulty: QuestDifficulty.HARD,
        reward: { points: 250, title: '250 Points' },
        icon: 'cloud'
      },
      {
        title: 'Collection Manager',
        description: 'Schedule 2 recycling collections this week',
        category: AchievementCategory.COLLECTION,
        activityType: 'schedule_collection',
        targetValue: 2,
        difficulty: QuestDifficulty.MEDIUM,
        reward: { points: 180, title: '180 Points' },
        icon: 'calendar'
      },
      {
        title: 'Materials Diversity',
        description: 'Recycle 3 different types of materials this week',
        category: AchievementCategory.RECYCLING,
        activityType: 'recycle_different_materials',
        targetValue: 3,
        difficulty: QuestDifficulty.MEDIUM,
        reward: { points: 200, title: '200 Points' },
        icon: 'apps'
      },
      {
        title: 'Community Engagement',
        description: 'Interact with 5 community posts this week',
        category: AchievementCategory.COMMUNITY,
        activityType: 'community_interaction',
        targetValue: 5,
        difficulty: QuestDifficulty.EASY,
        reward: { points: 120, title: '120 Points' },
        icon: 'people'
      }
    ];
  }
}

export default QuestService; 