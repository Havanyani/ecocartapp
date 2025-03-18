import { PerformanceMonitor } from '@/utils/PerformanceMonitoring';
import { DetailedEnvironmentalMetrics } from './EnvironmentalImpactService';

interface ProcessingOptions {
  timeframe: {
    start: Date;
    end: Date;
  };
  aggregation: 'daily' | 'weekly' | 'monthly';
  includeProjections: boolean;
  compareWithPrevious: boolean;
}

interface CollectionData {
  date: string;
  weight: number;
  plasticType: string;
  customerId: string;
  deliveryPersonnelId: string;
  distance: number;
  credits: number;
}

interface CommunityMetrics {
  totalHouseholds: number;
  activeHouseholds: number;
  participationRate: number;
  neighborhoodRanking: number;
}

export class ReportDataProcessor {
  static async processCollectionData(
    collections: CollectionData[],
    options: ProcessingOptions
  ) {
    try {
      const filteredData = this.filterByTimeframe(collections, options.timeframe);
      const aggregatedData = this.aggregateData(filteredData, options.aggregation);
      const trends = this.calculateTrends(aggregatedData);
      const projections = options.includeProjections ? 
        this.calculateProjections(aggregatedData) : null;
      const comparison = options.compareWithPrevious ? 
        this.compareWithPreviousPeriod(collections, options.timeframe) : null;

      return {
        current: aggregatedData,
        trends,
        projections,
        comparison
      };
    } catch (error) {
      Performance.captureError(error as Error);
      throw new Error('Failed to process collection data');
    }
  }

  static async processEnvironmentalImpact(
    metrics: DetailedEnvironmentalMetrics,
    communityMetrics: CommunityMetrics
  ) {
    try {
      const plasticReduction = this.calculatePlasticReduction(metrics);
      const carbonImpact = this.calculateCarbonImpact(metrics);
      const communityImpact = this.calculateCommunityImpact(metrics, communityMetrics);
      const economicBenefits = this.calculateEconomicBenefits(metrics);

      return {
        plasticReduction,
        carbonImpact,
        communityImpact,
        economicBenefits,
        sustainabilityScore: this.calculateSustainabilityScore({
          plasticReduction,
          carbonImpact,
          communityImpact
        })
      };
    } catch (error) {
      Performance.captureError(error as Error);
      throw new Error('Failed to process environmental impact');
    }
  }

  private static filterByTimeframe(
    collections: CollectionData[],
    timeframe: { start: Date; end: Date }
  ): CollectionData[] {
    return collections.filter(collection => {
      const collectionDate = new Date(collection.date);
      return collectionDate >= timeframe.start && collectionDate <= timeframe.end;
    });
  }

  private static aggregateData(
    collections: CollectionData[],
    aggregation: 'daily' | 'weekly' | 'monthly'
  ) {
    const aggregatedData = collections.reduce((acc, collection) => {
      const key = this.getAggregationKey(new Date(collection.date), aggregation);
      if (!acc[key]) {
        acc[key] = {
          totalWeight: 0,
          collections: 0,
          uniqueCustomers: new Set(),
          plasticTypes: {},
          totalCredits: 0,
          totalDistance: 0
        };
      }

      acc[key].totalWeight += collection.weight;
      acc[key].collections += 1;
      acc[key].uniqueCustomers.add(collection.customerId);
      acc[key].plasticTypes[collection.plasticType] = 
        (acc[key].plasticTypes[collection.plasticType] || 0) + collection.weight;
      acc[key].totalCredits += collection.credits;
      acc[key].totalDistance += collection.distance;

      return acc;
    }, {} as Record<string, any>);

    // Convert Sets to counts and calculate averages
    return Object.entries(aggregatedData).map(([date, data]) => ({
      date,
      totalWeight: data.totalWeight,
      collections: data.collections,
      uniqueCustomers: data.uniqueCustomers.size,
      plasticTypes: data.plasticTypes,
      totalCredits: data.totalCredits,
      totalDistance: data.totalDistance,
      averageWeightPerCollection: data.totalWeight / data.collections,
      averageCreditsPerCustomer: data.totalCredits / data.uniqueCustomers.size,
      collectionEfficiency: data.totalWeight / data.totalDistance
    }));
  }

  private static getAggregationKey(date: Date, aggregation: string): string {
    switch (aggregation) {
      case 'daily':
        return date.toISOString().split('T')[0];
      case 'weekly':
        const weekStart = new Date(date);
        weekStart.setDate(date.getDate() - date.getDay());
        return weekStart.toISOString().split('T')[0];
      case 'monthly':
        return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;
      default:
        throw new Error('Invalid aggregation period');
    }
  }

  private static calculateTrends(aggregatedData: any[]) {
    if (aggregatedData.length < 2) return null;

    const calculateGrowth = (current: number, previous: number) =>
      previous === 0 ? 0 : ((current - previous) / previous) * 100;

    const periods = aggregatedData.length;
    const halfPeriod = Math.floor(periods / 2);
    
    const firstHalf = aggregatedData.slice(0, halfPeriod);
    const secondHalf = aggregatedData.slice(halfPeriod);

    const averageFirstHalf = this.calculateAverages(firstHalf);
    const averageSecondHalf = this.calculateAverages(secondHalf);

    return {
      weightTrend: calculateGrowth(
        averageSecondHalf.totalWeight,
        averageFirstHalf.totalWeight
      ),
      participationTrend: calculateGrowth(
        averageSecondHalf.uniqueCustomers,
        averageFirstHalf.uniqueCustomers
      ),
      efficiencyTrend: calculateGrowth(
        averageSecondHalf.collectionEfficiency,
        averageFirstHalf.collectionEfficiency
      ),
      creditsTrend: calculateGrowth(
        averageSecondHalf.totalCredits,
        averageFirstHalf.totalCredits
      )
    };
  }

  private static calculateAverages(data: any[]) {
    return data.reduce((acc, period) => ({
      totalWeight: acc.totalWeight + period.totalWeight,
      uniqueCustomers: acc.uniqueCustomers + period.uniqueCustomers,
      collectionEfficiency: acc.collectionEfficiency + period.collectionEfficiency,
      totalCredits: acc.totalCredits + period.totalCredits
    }), {
      totalWeight: 0,
      uniqueCustomers: 0,
      collectionEfficiency: 0,
      totalCredits: 0
    });
  }

  private static calculateProjections(aggregatedData: any[]) {
    const recentTrend = this.calculateTrends(aggregatedData);
    const lastPeriod = aggregatedData[aggregatedData.length - 1];

    return {
      nextMonth: {
        expectedWeight: lastPeriod.totalWeight * (1 + recentTrend.weightTrend / 100),
        expectedParticipation: lastPeriod.uniqueCustomers * 
          (1 + recentTrend.participationTrend / 100),
        expectedCredits: lastPeriod.totalCredits * (1 + recentTrend.creditsTrend / 100)
      },
      nextQuarter: {
        expectedWeight: lastPeriod.totalWeight * 
          Math.pow(1 + recentTrend.weightTrend / 100, 3),
        expectedParticipation: lastPeriod.uniqueCustomers * 
          Math.pow(1 + recentTrend.participationTrend / 100, 3),
        expectedCredits: lastPeriod.totalCredits * 
          Math.pow(1 + recentTrend.creditsTrend / 100, 3)
      }
    };
  }

  private static compareWithPreviousPeriod(
    collections: CollectionData[],
    currentTimeframe: { start: Date; end: Date }
  ) {
    const periodLength = currentTimeframe.end.getTime() - 
      currentTimeframe.start.getTime();
    const previousTimeframe = {
      start: new Date(currentTimeframe.start.getTime() - periodLength),
      end: new Date(currentTimeframe.end.getTime() - periodLength)
    };

    const previousData = this.filterByTimeframe(collections, previousTimeframe);
    const currentData = this.filterByTimeframe(collections, currentTimeframe);

    return {
      weightChange: this.calculatePercentageChange(
        this.sumWeight(currentData),
        this.sumWeight(previousData)
      ),
      participationChange: this.calculatePercentageChange(
        this.countUniqueCustomers(currentData),
        this.countUniqueCustomers(previousData)
      ),
      efficiencyChange: this.calculatePercentageChange(
        this.calculateEfficiency(currentData),
        this.calculateEfficiency(previousData)
      )
    };
  }

  private static calculatePlasticReduction(metrics: DetailedEnvironmentalMetrics) {
    return {
      totalReduction: metrics.plasticReduction.totalWeight,
      byType: metrics.plasticReduction.byType,
      recyclingRate: metrics.plasticReduction.recyclingRate,
      environmentalImpact: {
        oceanDiversion: metrics.plasticReduction.oceanDiversion,
        landfillDiversion: metrics.plasticReduction.landfillDiversion
      }
    };
  }

  private static calculateCarbonImpact(metrics: DetailedEnvironmentalMetrics) {
    return {
      totalReduction: metrics.carbonFootprint.totalReduction,
      transportSavings: metrics.carbonFootprint.transportSavings,
      recyclingBenefits: metrics.carbonFootprint.recyclingBenefits,
      treesEquivalent: metrics.carbonFootprint.treesEquivalent
    };
  }

  private static calculateCommunityImpact(
    metrics: DetailedEnvironmentalMetrics,
    communityMetrics: CommunityMetrics
  ) {
    return {
      participationRate: communityMetrics.participationRate,
      activeHouseholds: communityMetrics.activeHouseholds,
      ranking: communityMetrics.neighborhoodRanking,
      impact: {
        totalParticipants: communityMetrics.activeHouseholds,
        communityRanking: communityMetrics.neighborhoodRanking,
        engagementScore: (communityMetrics.participationRate / 100) * 
          (1 - communityMetrics.neighborhoodRanking / 100)
      }
    };
  }

  private static calculateEconomicBenefits(metrics: DetailedEnvironmentalMetrics) {
    return {
      totalRevenue: metrics.economicBenefits.recyclingRevenue,
      costSavings: metrics.economicBenefits.costSavings,
      creditsGenerated: metrics.economicBenefits.creditGenerated,
      marketValue: metrics.economicBenefits.marketValue
    };
  }

  private static calculateSustainabilityScore(metrics: any) {
    const weights = {
      plasticReduction: 0.4,
      carbonImpact: 0.3,
      communityImpact: 0.3
    };

    return {
      overall: (
        metrics.plasticReduction.recyclingRate * weights.plasticReduction +
        (metrics.carbonImpact.totalReduction / 1000) * weights.carbonImpact +
        metrics.communityImpact.engagementScore * weights.communityImpact
      ).toFixed(2),
      breakdown: {
        plasticReduction: (metrics.plasticReduction.recyclingRate * 100).toFixed(2),
        carbonImpact: (metrics.carbonImpact.totalReduction / 1000 * 100).toFixed(2),
        communityImpact: (metrics.communityImpact.engagementScore * 100).toFixed(2)
      }
    };
  }

  private static sumWeight(collections: CollectionData[]): number {
    return collections.reduce((sum, collection) => sum + collection.weight, 0);
  }

  private static countUniqueCustomers(collections: CollectionData[]): number {
    return new Set(collections.map(c => c.customerId)).size;
  }

  private static calculateEfficiency(collections: CollectionData[]): number {
    const totalWeight = this.sumWeight(collections);
    const totalDistance = collections.reduce((sum, c) => sum + c.distance, 0);
    return totalWeight / (totalDistance || 1);
  }

  private static calculatePercentageChange(current: number, previous: number): number {
    return previous === 0 ? 0 : ((current - previous) / previous) * 100;
  }
} 