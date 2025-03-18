import { EcoComparisonMetric, EcoImpactMetrics, MaterialImpact, RecyclingMaterial, TimeFrame } from '@/types/analytics';
import { EnvironmentalImpactService } from './EnvironmentalImpactService';

/**
 * Enhanced Environmental Impact Service
 * 
 * Extends the base EnvironmentalImpactService with additional features:
 * - Comparative impact analysis (vs average user, community, or global benchmarks)
 * - Predictive impact forecasting
 * - Detailed material-specific environmental metrics
 * - Carbon offset calculations and equivalents
 * - Community impact aggregation
 * - Milestone and achievement tracking
 */
export class EnhancedEcoImpactService {
  private baseService: EnvironmentalImpactService;
  
  // These would typically come from a backend database or API
  private readonly carbonOffsetRates: Record<RecyclingMaterial, number> = {
    plastic: 2.5, // kg CO2 per kg
    paper: 1.2,
    glass: 0.3,
    metal: 4.0,
    electronics: 20.0,
    organic: 0.5,
    textile: 3.5,
    other: 1.0
  };
  
  // Benchmark metrics for comparison
  private readonly benchmarks = {
    average: {
      co2Saved: 25, // kg per month
      waterSaved: 1000, // liters per month
      energySaved: 75, // kWh per month
      treesEquivalent: 1.2 // trees per month
    },
    community: {
      co2Saved: 40,
      waterSaved: 1800,
      energySaved: 120,
      treesEquivalent: 2.5
    },
    global: {
      co2Saved: 15,
      waterSaved: 800,
      energySaved: 50,
      treesEquivalent: 0.8
    }
  };
  
  constructor() {
    this.baseService = new EnvironmentalImpactService();
  }
  
  /**
   * Gets enhanced eco impact metrics with comparative data
   */
  async getEnhancedEcoImpact(userId: string, timeFrame: TimeFrame): Promise<EcoImpactMetrics> {
    // Get base metrics from the original service
    // Using the actual methods available in EnvironmentalImpactService
    const userData = await EnvironmentalImpactService.getUserImpactData(
      this.mapTimeFrame(timeFrame)
    );
    
    // Construct base metrics from the available data
    const baseMetrics = {
      co2Saved: userData.summary.co2Saved,
      waterSaved: userData.summary.waterSaved,
      energySaved: userData.summary.totalWeight * 5.8, // Estimate energy saved based on weight
      treesEquivalent: userData.summary.co2Saved / 22 // Based on CO2 absorption per tree
    };
    
    // Enhance with comparative and additional metrics
    return {
      ...baseMetrics,
      comparisons: this.generateComparisons(baseMetrics),
      materialBreakdown: await this.getMaterialBreakdown(userId, timeFrame),
      milestones: await this.calculateMilestones(userId),
      predictedImpact: await this.predictFutureImpact(userId, timeFrame),
      carbonOffsets: this.calculateCarbonOffsets(baseMetrics.co2Saved),
      communityContribution: await this.getCommunityContribution(userId, timeFrame)
    };
  }
  
  /**
   * Maps our TimeFrame type to the one used by EnvironmentalImpactService
   */
  private mapTimeFrame(timeFrame: TimeFrame): 'week' | 'month' | 'year' {
    switch (timeFrame) {
      case 'day':
      case 'week':
        return 'week';
      case 'month':
        return 'month';
      case 'year':
      case 'all':
        return 'year';
      default:
        return 'month';
    }
  }
  
  /**
   * Generates comparisons against benchmarks
   */
  private generateComparisons(metrics: any): Record<string, EcoComparisonMetric> {
    return {
      averageUser: {
        co2SavedPercentage: (metrics.co2Saved / this.benchmarks.average.co2Saved) * 100,
        waterSavedPercentage: (metrics.waterSaved / this.benchmarks.average.waterSaved) * 100,
        energySavedPercentage: (metrics.energySaved / this.benchmarks.average.energySaved) * 100,
        comparison: metrics.co2Saved > this.benchmarks.average.co2Saved ? 'better' : 'worse'
      },
      community: {
        co2SavedPercentage: (metrics.co2Saved / this.benchmarks.community.co2Saved) * 100,
        waterSavedPercentage: (metrics.waterSaved / this.benchmarks.community.waterSaved) * 100,
        energySavedPercentage: (metrics.energySaved / this.benchmarks.community.energySaved) * 100,
        comparison: metrics.co2Saved > this.benchmarks.community.co2Saved ? 'better' : 'worse'
      },
      global: {
        co2SavedPercentage: (metrics.co2Saved / this.benchmarks.global.co2Saved) * 100,
        waterSavedPercentage: (metrics.waterSaved / this.benchmarks.global.waterSaved) * 100,
        energySavedPercentage: (metrics.energySaved / this.benchmarks.global.energySaved) * 100,
        comparison: metrics.co2Saved > this.benchmarks.global.co2Saved ? 'better' : 'worse'
      }
    };
  }
  
  /**
   * Gets detailed breakdown of environmental impact by material type
   */
  async getMaterialBreakdown(userId: string, timeFrame: TimeFrame): Promise<MaterialImpact[]> {
    // This would normally fetch data from a backend service
    // Simulating some data for demonstration
    const collections = await this.getCollectionsForUser(userId, timeFrame);
    
    // Group collections by material type and calculate impact
    const materialImpacts: Record<RecyclingMaterial, MaterialImpact> = {} as Record<RecyclingMaterial, MaterialImpact>;
    
    for (const collection of collections) {
      const material = collection.material as RecyclingMaterial;
      const weight = collection.weight;
      
      if (!materialImpacts[material]) {
        materialImpacts[material] = {
          material,
          weight: 0,
          co2Saved: 0,
          waterSaved: 0,
          energySaved: 0,
          percentOfTotal: 0
        };
      }
      
      materialImpacts[material].weight += weight;
      materialImpacts[material].co2Saved += weight * this.carbonOffsetRates[material];
      materialImpacts[material].waterSaved += weight * this.getWaterSavingRate(material);
      materialImpacts[material].energySaved += weight * this.getEnergySavingRate(material);
    }
    
    // Calculate percentages
    const totalWeight = Object.values(materialImpacts).reduce((sum, impact) => sum + impact.weight, 0);
    
    return Object.values(materialImpacts).map(impact => ({
      ...impact,
      percentOfTotal: (impact.weight / totalWeight) * 100
    }));
  }
  
  /**
   * Calculates milestone achievements for the user
   */
  async calculateMilestones(userId: string): Promise<any[]> {
    // Get all-time impact metrics
    const userData = await EnvironmentalImpactService.getUserImpactData('year');
    
    // Construct lifetime metrics from the available data
    const lifetimeMetrics = {
      co2Saved: userData.summary.co2Saved * 2, // Multiplier to simulate lifetime data
      waterSaved: userData.summary.waterSaved * 2,
      energySaved: userData.summary.totalWeight * 5.8 * 2,
      treesEquivalent: userData.summary.co2Saved / 22 * 2
    };
    
    // Define milestone thresholds
    const milestones = [
      {
        id: 'co2_10kg',
        title: 'Climate Defender',
        description: 'Save 10kg of CO2 emissions',
        threshold: 10,
        metric: 'co2Saved',
        icon: 'leaf',
        achieved: lifetimeMetrics.co2Saved >= 10,
        progress: Math.min(100, (lifetimeMetrics.co2Saved / 10) * 100)
      },
      {
        id: 'co2_50kg',
        title: 'Climate Champion',
        description: 'Save 50kg of CO2 emissions',
        threshold: 50,
        metric: 'co2Saved',
        icon: 'earth',
        achieved: lifetimeMetrics.co2Saved >= 50,
        progress: Math.min(100, (lifetimeMetrics.co2Saved / 50) * 100)
      },
      {
        id: 'co2_100kg',
        title: 'Climate Hero',
        description: 'Save 100kg of CO2 emissions',
        threshold: 100,
        metric: 'co2Saved',
        icon: 'planet',
        achieved: lifetimeMetrics.co2Saved >= 100,
        progress: Math.min(100, (lifetimeMetrics.co2Saved / 100) * 100)
      },
      {
        id: 'water_1000l',
        title: 'Water Savior',
        description: 'Save 1,000 liters of water',
        threshold: 1000,
        metric: 'waterSaved',
        icon: 'water',
        achieved: lifetimeMetrics.waterSaved >= 1000,
        progress: Math.min(100, (lifetimeMetrics.waterSaved / 1000) * 100)
      },
      {
        id: 'trees_10',
        title: 'Forest Guardian',
        description: 'Save the equivalent of 10 trees',
        threshold: 10,
        metric: 'treesEquivalent',
        icon: 'forest',
        achieved: lifetimeMetrics.treesEquivalent >= 10,
        progress: Math.min(100, (lifetimeMetrics.treesEquivalent / 10) * 100)
      }
    ];
    
    return milestones;
  }
  
  /**
   * Predicts future environmental impact based on user's recycling patterns
   */
  async predictFutureImpact(userId: string, timeFrame: TimeFrame): Promise<any> {
    const userData = await EnvironmentalImpactService.getUserImpactData(
      this.mapTimeFrame(timeFrame)
    );
    
    const currentMetrics = {
      co2Saved: userData.summary.co2Saved,
      waterSaved: userData.summary.waterSaved,
      energySaved: userData.summary.totalWeight * 5.8,
      treesEquivalent: userData.summary.co2Saved / 22
    };
    
    // Simple linear projection for future impact
    // In a real app, this would use more sophisticated models
    return {
      nextMonth: {
        co2Saved: currentMetrics.co2Saved * 1.1, // Assumes 10% growth
        waterSaved: currentMetrics.waterSaved * 1.1,
        energySaved: currentMetrics.energySaved * 1.1,
        treesEquivalent: currentMetrics.treesEquivalent * 1.1
      },
      threeMonths: {
        co2Saved: currentMetrics.co2Saved * 3.3, // 3 months with 10% growth
        waterSaved: currentMetrics.waterSaved * 3.3,
        energySaved: currentMetrics.energySaved * 3.3,
        treesEquivalent: currentMetrics.treesEquivalent * 3.3
      },
      sixMonths: {
        co2Saved: currentMetrics.co2Saved * 6.6, // 6 months with 10% growth
        waterSaved: currentMetrics.waterSaved * 6.6,
        energySaved: currentMetrics.energySaved * 6.6,
        treesEquivalent: currentMetrics.treesEquivalent * 6.6
      }
    };
  }
  
  /**
   * Calculates real-world equivalents for carbon offsets
   */
  calculateCarbonOffsets(co2Saved: number): any {
    return {
      carMiles: co2Saved * 2.5, // Miles not driven in average car
      flightMiles: co2Saved * 10, // Miles not flown in airplane
      phonesCharged: co2Saved * 121, // Smartphones charged
      lightBulbHours: co2Saved * 33 // Hours of LED light bulb usage
    };
  }
  
  /**
   * Calculates user's contribution to community impact
   */
  async getCommunityContribution(userId: string, timeFrame: TimeFrame): Promise<any> {
    const userData = await EnvironmentalImpactService.getUserImpactData(
      this.mapTimeFrame(timeFrame)
    );
    
    const userMetrics = {
      co2Saved: userData.summary.co2Saved,
      waterSaved: userData.summary.waterSaved,
      energySaved: userData.summary.totalWeight * 5.8,
      treesEquivalent: userData.summary.co2Saved / 22
    };
    
    // This would normally fetch community total from a backend service
    // Simulating for demonstration
    const communityTotal = {
      co2Saved: 5000, // kg
      waterSaved: 200000, // liters
      energySaved: 15000, // kWh
      treesEquivalent: 250
    };
    
    return {
      contributionPercentage: {
        co2: (userMetrics.co2Saved / communityTotal.co2Saved) * 100,
        water: (userMetrics.waterSaved / communityTotal.waterSaved) * 100,
        energy: (userMetrics.energySaved / communityTotal.energySaved) * 100,
        trees: (userMetrics.treesEquivalent / communityTotal.treesEquivalent) * 100
      },
      communityRank: 25, // Would be calculated based on user's position in community
      totalUsers: 150, // Total users in community
      percentile: 83 // User's percentile in community rankings
    };
  }
  
  /**
   * Helper method to simulate fetching user collections
   */
  private async getCollectionsForUser(userId: string, timeFrame: TimeFrame): Promise<any[]> {
    // This would normally fetch data from a backend service
    // Simulating for demonstration purposes
    return [
      { id: '1', material: 'plastic' as RecyclingMaterial, weight: 2.5, date: new Date(), userId },
      { id: '2', material: 'paper' as RecyclingMaterial, weight: 3.2, date: new Date(), userId },
      { id: '3', material: 'glass' as RecyclingMaterial, weight: 4.0, date: new Date(), userId },
      { id: '4', material: 'metal' as RecyclingMaterial, weight: 1.8, date: new Date(), userId },
      { id: '5', material: 'electronics' as RecyclingMaterial, weight: 0.5, date: new Date(), userId },
      { id: '6', material: 'organic' as RecyclingMaterial, weight: 5.3, date: new Date(), userId }
    ];
  }
  
  /**
   * Helper method to get water saving rate by material type
   */
  private getWaterSavingRate(material: RecyclingMaterial): number {
    const waterSavingRates: Record<RecyclingMaterial, number> = {
      plastic: 16.9, // liters per kg
      paper: 60.0,
      glass: 12.5,
      metal: 91.0,
      electronics: 120.0,
      organic: 5.0,
      textile: 70.0,
      other: 20.0
    };
    
    return waterSavingRates[material] || 0;
  }
  
  /**
   * Helper method to get energy saving rate by material type
   */
  private getEnergySavingRate(material: RecyclingMaterial): number {
    const energySavingRates: Record<RecyclingMaterial, number> = {
      plastic: 5.8, // kWh per kg
      paper: 4.3,
      glass: 2.5,
      metal: 14.0,
      electronics: 40.0,
      organic: 1.0,
      textile: 20.0,
      other: 3.0
    };
    
    return energySavingRates[material] || 0;
  }
} 