import { PerformanceMonitor } from '@/utils/PerformanceMonitoring';

interface AchievementTier {
  level: 'bronze' | 'silver' | 'gold' | 'platinum';
  threshold: number;
  creditMultiplier: number;
}

interface AchievementCategory {
  id: string;
  name: string;
  description: string;
  icon: string;
  tiers: AchievementTier[];
}

export class AchievementService {
  private static readonly ACHIEVEMENT_CATEGORIES: AchievementCategory[] = [
    {
      id: 'plastic_collection',
      name: 'Plastic Warrior',
      description: 'Collect and recycle plastic waste',
      icon: 'recycle',
      tiers: [
        { level: 'bronze', threshold: 10, creditMultiplier: 1.1 },
        { level: 'silver', threshold: 50, creditMultiplier: 1.2 },
        { level: 'gold', threshold: 100, creditMultiplier: 1.3 },
        { level: 'platinum', threshold: 500, creditMultiplier: 1.5 }
      ]
    },
    {
      id: 'consistency',
      name: 'Consistent Recycler',
      description: 'Maintain regular recycling schedule',
      icon: 'calendar-check',
      tiers: [
        { level: 'bronze', threshold: 4, creditMultiplier: 1.1 }, // 4 weeks
        { level: 'silver', threshold: 12, creditMultiplier: 1.2 }, // 3 months
        { level: 'gold', threshold: 26, creditMultiplier: 1.3 }, // 6 months
        { level: 'platinum', threshold: 52, creditMultiplier: 1.5 } // 1 year
      ]
    },
    {
      id: 'community_impact',
      name: 'Community Champion',
      description: 'Inspire others to recycle',
      icon: 'account-group',
      tiers: [
        { level: 'bronze', threshold: 5, creditMultiplier: 1.1 },
        { level: 'silver', threshold: 15, creditMultiplier: 1.2 },
        { level: 'gold', threshold: 30, creditMultiplier: 1.3 },
        { level: 'platinum', threshold: 50, creditMultiplier: 1.5 }
      ]
    },
    {
      id: 'environmental_impact',
      name: 'Earth Guardian',
      description: 'Reduce environmental impact',
      icon: 'earth',
      tiers: [
        { level: 'bronze', threshold: 100, creditMultiplier: 1.1 }, // CO2 reduction in kg
        { level: 'silver', threshold: 500, creditMultiplier: 1.2 },
        { level: 'gold', threshold: 1000, creditMultiplier: 1.3 },
        { level: 'platinum', threshold: 5000, creditMultiplier: 1.5 }
      ]
    }
  ];

  static async calculateAchievements(userId: string): Promise<Achievement[]> {
    try {
      const userStats = await this.getUserStats(userId);
      const achievements: Achievement[] = [];

      for (const category of this.ACHIEVEMENT_CATEGORIES) {
        const progress = this.calculateCategoryProgress(category.id, userStats);
        const currentTier = this.getCurrentTier(category, progress);

        achievements.push({
          id: `${category.id}_${currentTier?.level || 'none'}`,
          title: `${category.name} ${currentTier?.level || ''}`,
          description: category.description,
          icon: category.icon,
          progress,
          target: currentTier?.threshold || 0,
          reward: Math.floor(progress * (currentTier?.creditMultiplier || 1)),
          isUnlocked: !!currentTier && progress >= currentTier.threshold
        });
      }

      return achievements;
    } catch (error) {
      Performance.captureError(error as Error);
      throw new Error('Failed to calculate achievements');
    }
  }

  private static async getUserStats(userId: string) {
    // Implementation to fetch user statistics
    return {
      totalPlasticCollected: 0,
      weeklyStreak: 0,
      referrals: 0,
      co2Reduced: 0
    };
  }

  private static calculateCategoryProgress(
    categoryId: string,
    userStats: any
  ): number {
    switch (categoryId) {
      case 'plastic_collection':
        return userStats.totalPlasticCollected;
      case 'consistency':
        return userStats.weeklyStreak;
      case 'community_impact':
        return userStats.referrals;
      case 'environmental_impact':
        return userStats.co2Reduced;
      default:
        return 0;
    }
  }

  private static getCurrentTier(
    category: AchievementCategory,
    progress: number
  ): AchievementTier | null {
    return category.tiers
      .slice()
      .reverse()
      .find(tier => progress >= tier.threshold) || null;
  }
} 