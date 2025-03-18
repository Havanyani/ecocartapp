import { RecyclingGoal } from '@/types/analytics';
import { Collection } from '@/types/Collection';
import { SafeStorage } from '@/utils/storage';

interface CollectionMetrics {
  totalCollections: number;
  totalWeight: number;
  totalCredits: number;
  averageWeight: number;
  completionRate: number;
  environmentalImpact: {
    plasticSaved: number;
    co2Reduced: number;
    treesEquivalent: number;
  };
  materialBreakdown?: Array<{
    name: string;
    quantity: number;
    unit: string;
  }>;
  date?: Date;
}

interface CollectionReport {
  period: {
    start: Date;
    end: Date;
  };
  metrics: CollectionMetrics;
  collections: Collection[];
  trends: {
    daily: CollectionMetrics[];
    weekly: CollectionMetrics[];
    monthly: CollectionMetrics[];
  };
}

export class CollectionAnalyticsService {
  private static STORAGE_KEY = '@collection_analytics';
  private static GOALS_STORAGE_KEY = '@recycling_goals';
  private static PLASTIC_TO_CO2_RATIO = 2.5; // kg CO2 per kg of plastic
  private static TREES_PER_TON_CO2 = 50; // trees needed to absorb 1 ton of CO2

  static async generateReport(startDate: Date, endDate: Date): Promise<CollectionReport> {
    const collections = await this.getCollectionsInPeriod(startDate, endDate);
    const metrics = await this.calculateMetrics(collections);
    const trends = await this.calculateTrends(startDate, endDate);

    const report: CollectionReport = {
      period: { start: startDate, end: endDate },
      metrics,
      collections,
      trends,
    };

    await this.saveReport(report);
    return report;
  }

  private static async getCollectionsInPeriod(startDate: Date, endDate: Date): Promise<Collection[]> {
    const collections = await this.getAllCollections();
    return collections.filter(collection => {
      const collectionDate = new Date(collection.scheduledDateTime);
      return collectionDate >= startDate && collectionDate <= endDate;
    });
  }

  private static calculateMetrics(collections: Collection[]): CollectionMetrics {
    const completedCollections = collections.filter(c => c.status === 'completed');
    const totalWeight = completedCollections.reduce((sum, c) => sum + (c.totalWeight || 0), 0);
    const totalCredits = completedCollections.reduce((sum, c) => sum + (c.totalCredits || 0), 0);

    const metrics: CollectionMetrics = {
      totalCollections: collections.length,
      totalWeight,
      totalCredits,
      averageWeight: totalWeight / completedCollections.length || 0,
      completionRate: (completedCollections.length / collections.length) * 100,
      environmentalImpact: {
        plasticSaved: totalWeight,
        co2Reduced: totalWeight * this.PLASTIC_TO_CO2_RATIO,
        treesEquivalent: (totalWeight * this.PLASTIC_TO_CO2_RATIO) / 1000 * this.TREES_PER_TON_CO2,
      },
      materialBreakdown: completedCollections.flatMap(c => 
        c.materials.map(m => ({
          name: m.material.name,
          quantity: m.quantity.quantity,
          unit: 'kg'
        }))
      )
    };

    return metrics;
  }

  private static async calculateTrends(startDate: Date, endDate: Date) {
    const collections = await this.getCollectionsInPeriod(startDate, endDate);
    
    // Group collections by day, week, and month
    const dailyMetrics = this.groupByPeriod(collections, 'day');
    const weeklyMetrics = this.groupByPeriod(collections, 'week');
    const monthlyMetrics = this.groupByPeriod(collections, 'month');

    return {
      daily: dailyMetrics,
      weekly: weeklyMetrics,
      monthly: monthlyMetrics,
    };
  }

  private static groupByPeriod(collections: Collection[], period: 'day' | 'week' | 'month'): CollectionMetrics[] {
    const groupedCollections = collections.reduce((groups, collection) => {
      const date = new Date(collection.scheduledDateTime);
      let key: string;

      switch (period) {
        case 'day':
          key = date.toISOString().split('T')[0];
          break;
        case 'week':
          const weekStart = new Date(date);
          weekStart.setDate(date.getDate() - date.getDay());
          key = weekStart.toISOString().split('T')[0];
          break;
        case 'month':
          key = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;
          break;
      }

      if (!groups[key]) {
        groups[key] = [];
      }
      groups[key].push(collection);
      return groups;
    }, {} as Record<string, Collection[]>);

    return Object.entries(groupedCollections).map(([date, collections]) => {
      const metrics = this.calculateMetrics(collections);
      return {
        ...metrics,
        date: new Date(date),
      };
    });
  }

  private static async getAllCollections(): Promise<Collection[]> {
    const data = await SafeStorage.getItem(this.STORAGE_KEY);
    return data ? JSON.parse(data) : [];
  }

  private static async saveReport(report: CollectionReport): Promise<void> {
    const reports = await this.getReports();
    reports.push(report);
    await SafeStorage.setItem(this.STORAGE_KEY, JSON.stringify(reports));
  }

  private static async getReports(): Promise<CollectionReport[]> {
    const data = await SafeStorage.getItem(this.STORAGE_KEY);
    return data ? JSON.parse(data) : [];
  }

  static async getLatestReport(): Promise<CollectionReport | null> {
    const reports = await this.getReports();
    return reports.length > 0 ? reports[reports.length - 1] : null;
  }

  static async getReportsByDateRange(startDate: Date, endDate: Date): Promise<CollectionReport[]> {
    const reports = await this.getReports();
    return reports.filter(report => 
      report.period.start >= startDate && report.period.end <= endDate
    );
  }

  static async exportData(format: 'pdf' | 'csv'): Promise<string> {
    const report = await this.getLatestReport();
    if (!report) {
      throw new Error('No data available to export');
    }

    // Implementation for data export
    return 'exported_data';
  }

  static async createGoal(goal: RecyclingGoal): Promise<void> {
    const goals = await this.getGoals();
    goals.push(goal);
    await SafeStorage.setItem(this.GOALS_STORAGE_KEY, JSON.stringify(goals));
  }

  static async updateGoal(goalId: string, updates: Partial<RecyclingGoal>): Promise<void> {
    const goals = await this.getGoals();
    const index = goals.findIndex(g => g.id === goalId);
    if (index !== -1) {
      goals[index] = { ...goals[index], ...updates };
      await SafeStorage.setItem(this.GOALS_STORAGE_KEY, JSON.stringify(goals));
    }
  }

  static async deleteGoal(goalId: string): Promise<void> {
    const goals = await this.getGoals();
    const filteredGoals = goals.filter(g => g.id !== goalId);
    await SafeStorage.setItem(this.GOALS_STORAGE_KEY, JSON.stringify(filteredGoals));
  }

  static async getGoals(): Promise<RecyclingGoal[]> {
    const data = await SafeStorage.getItem(this.GOALS_STORAGE_KEY);
    return data ? JSON.parse(data) : [];
  }

  static async getUserAnalytics(userId: string, startDate: Date, endDate: Date): Promise<CollectionReport> {
    const collections = await this.getCollectionsInPeriod(startDate, endDate);
    const userCollections = collections.filter(c => c.userId === userId);
    const metrics = await this.calculateMetrics(userCollections);
    const trends = await this.calculateTrends(startDate, endDate);

    return {
      period: { start: startDate, end: endDate },
      metrics,
      collections: userCollections,
      trends,
    };
  }
} 