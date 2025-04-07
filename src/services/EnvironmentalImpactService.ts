import { Collection } from '@/types/Collection';
import { CollectionItem } from '@/types/CollectionItem';
import AsyncStorage from '@react-native-async-storage/async-storage';

export interface DetailedEnvironmentalMetrics {
  plasticReduction: {
    totalWeight: number;
    itemsRecycled: number;
    landfillDiverted: number;
  };
  carbonFootprint: {
    totalReduction: number;
    treesEquivalent: number;
    emissionsAvoided: number;
  };
  waterConservation: {
    litersSaved: number;
    householdsImpacted: number;
    waterQualityImprovement: number;
  };
  communityImpact: {
    participationRate: number;
    totalHouseholds: number;
    communityPrograms: number;
  };
}

interface PlasticTypeProperties {
  carbonFootprint: number; // kg CO2 per kg plastic
  waterFootprint: number; // liters per kg plastic
  recyclingEfficiency: number; // percentage
  oceanImpactFactor: number; // scale 1-10
}

interface PlasticType {
  id: string;
  name: string;
  co2PerKg: number;
  recyclingEfficiency: number;
  oceanImpactFactor: number;
}

interface ImpactMetrics {
  plasticSaved: number;
  co2Reduced: number;
  treesEquivalent: number;
  oceanWastePrevented: number;
  energySaved: number;
  waterConserved: number;
  landfillSpaceSaved: number;
}

interface ExtendedPlasticType extends PlasticType {
  recyclability: number;
  energyPerKg: number;
  waterPerKg: number;
  carbonFootprint: {
    production: number;
    recycling: number;
    transportation: number;
  };
  decompositionYears: number;
}

interface ExtendedImpactMetrics extends ImpactMetrics {
  carbonFootprintReduced: {
    production: number;
    recycling: number;
    transportation: number;
  };
  microplasticsReduced: number;
  marineLifeSaved: number;
  recyclingEfficiencyRate: number;
  communityImpact: {
    jobsCreated: number;
    economicBenefit: number;
  };
}

export class EnvironmentalImpactService {
  private static readonly PLASTIC_PROPERTIES: Record<string, PlasticTypeProperties> = {
    PET: {
      carbonFootprint: 2.5,
      waterFootprint: 17.2,
      recyclingEfficiency: 0.85,
      oceanImpactFactor: 8
    },
    HDPE: {
      carbonFootprint: 1.8,
      waterFootprint: 11.5,
      recyclingEfficiency: 0.90,
      oceanImpactFactor: 7
    },
    LDPE: {
      carbonFootprint: 2.1,
      waterFootprint: 13.8,
      recyclingEfficiency: 0.75,
      oceanImpactFactor: 6
    },
    PP: {
      carbonFootprint: 1.9,
      waterFootprint: 12.4,
      recyclingEfficiency: 0.80,
      oceanImpactFactor: 7
    }
  };

  private static readonly PLASTIC_TYPES: PlasticType[] = [
    {
      id: 'PET',
      name: 'Polyethylene Terephthalate',
      co2PerKg: 3.8,
      recyclingEfficiency: 0.95,
      oceanImpactFactor: 1.2
    },
    {
      id: 'HDPE',
      name: 'High-Density Polyethylene',
      co2PerKg: 2.9,
      recyclingEfficiency: 0.90,
      oceanImpactFactor: 1.1
    },
    {
      id: 'LDPE',
      name: 'Low-Density Polyethylene',
      co2PerKg: 3.0,
      recyclingEfficiency: 0.85,
      oceanImpactFactor: 1.0
    },
    {
      id: 'PP',
      name: 'Polypropylene',
      co2PerKg: 3.2,
      recyclingEfficiency: 0.88,
      oceanImpactFactor: 1.15
    }
  ];

  private static readonly EXTENDED_PLASTIC_TYPES: ExtendedPlasticType[] = [
    {
      id: 'PET',
      name: 'Polyethylene Terephthalate',
      co2PerKg: 3.8,
      recyclingEfficiency: 0.95,
      oceanImpactFactor: 1.2,
      recyclability: 0.98,
      energyPerKg: 85.9,
      waterPerKg: 17.2,
      carbonFootprint: {
        production: 2.5,
        recycling: 0.45,
        transportation: 0.3
      },
      decompositionYears: 450
    },
    {
      id: 'HDPE',
      name: 'High-Density Polyethylene',
      co2PerKg: 2.9,
      recyclingEfficiency: 0.90,
      oceanImpactFactor: 1.1,
      recyclability: 0.95,
      energyPerKg: 76.7,
      waterPerKg: 15.1,
      carbonFootprint: {
        production: 2.1,
        recycling: 0.38,
        transportation: 0.28
      },
      decompositionYears: 400
    },
    {
      id: 'LDPE',
      name: 'Low-Density Polyethylene',
      co2PerKg: 3.0,
      recyclingEfficiency: 0.85,
      oceanImpactFactor: 1.0,
      recyclability: 0.88,
      energyPerKg: 78.5,
      waterPerKg: 16.2,
      carbonFootprint: {
        production: 2.2,
        recycling: 0.39,
        transportation: 0.29
      },
      decompositionYears: 350
    },
    {
      id: 'PP',
      name: 'Polypropylene',
      co2PerKg: 3.2,
      recyclingEfficiency: 0.88,
      oceanImpactFactor: 1.15,
      recyclability: 0.92,
      energyPerKg: 82.7,
      waterPerKg: 17.5,
      carbonFootprint: {
        production: 2.3,
        recycling: 0.42,
        transportation: 0.31
      },
      decompositionYears: 400
    }
  ];

  private static readonly CONSTANTS = {
    // CO2 absorption per tree per year in kg
    CO2_PER_TREE_YEAR: 22,
    // Energy saved per kg of recycled plastic in kWh
    ENERGY_SAVED_PER_KG: 5.8,
    // Water conserved per kg of recycled plastic in liters
    WATER_SAVED_PER_KG: 16.5,
    // Landfill space saved per kg of plastic in cubic meters
    LANDFILL_SPACE_PER_KG: 0.004
  };

  private static HISTORICAL_DATA_KEY = 'environmentalImpactHistory';
  private static USER_IMPACT_KEY = 'userImpactData';
  private static COMMUNITY_COMPARISON_KEY = 'communityComparisonData';

  static calculateImpact(
    weight: number,
    plasticTypeId: string = 'PET'
  ): ImpactMetrics {
    try {
      const plasticType = this.PLASTIC_TYPES.find(type => type.id === plasticTypeId) 
        || this.PLASTIC_TYPES[0];

      // Calculate base metrics
      const recycledWeight = weight * plasticType.recyclingEfficiency;
      const co2Reduced = recycledWeight * plasticType.co2PerKg;
      const oceanWastePrevented = weight * plasticType.oceanImpactFactor;

      // Calculate tree equivalent (based on annual CO2 absorption)
      const treesEquivalent = co2Reduced / this.CONSTANTS.CO2_PER_TREE_YEAR;

      // Calculate additional environmental benefits
      const energySaved = recycledWeight * this.CONSTANTS.ENERGY_SAVED_PER_KG;
      const waterConserved = recycledWeight * this.CONSTANTS.WATER_SAVED_PER_KG;
      const landfillSpaceSaved = weight * this.CONSTANTS.LANDFILL_SPACE_PER_KG;

      return {
        plasticSaved: recycledWeight,
        co2Reduced,
        treesEquivalent,
        oceanWastePrevented,
        energySaved,
        waterConserved,
        landfillSpaceSaved
      };
    } catch (error) {
      Performance.captureError(error as Error);
      throw new Error('Failed to calculate environmental impact');
    }
  }

  static calculateCumulativeImpact(
    collections: Array<{ weight: number; plasticType: string }>
  ): ImpactMetrics {
    try {
      const initialMetrics: ImpactMetrics = {
        plasticSaved: 0,
        co2Reduced: 0,
        treesEquivalent: 0,
        oceanWastePrevented: 0,
        energySaved: 0,
        waterConserved: 0,
        landfillSpaceSaved: 0
      };

      return collections.reduce((acc, collection) => {
        const impact = this.calculateImpact(collection.weight, collection.plasticType);
        return {
          plasticSaved: acc.plasticSaved + impact.plasticSaved,
          co2Reduced: acc.co2Reduced + impact.co2Reduced,
          treesEquivalent: acc.treesEquivalent + impact.treesEquivalent,
          oceanWastePrevented: acc.oceanWastePrevented + impact.oceanWastePrevented,
          energySaved: acc.energySaved + impact.energySaved,
          waterConserved: acc.waterConserved + impact.waterConserved,
          landfillSpaceSaved: acc.landfillSpaceSaved + impact.landfillSpaceSaved
        };
      }, initialMetrics);
    } catch (error) {
      Performance.captureError(error as Error);
      throw new Error('Failed to calculate cumulative impact');
    }
  }

  static generateImpactReport(metrics: ImpactMetrics): string {
    return `Environmental Impact Report:
    - Plastic Saved: ${metrics.plasticSaved.toFixed(2)} kg
    - CO₂ Emissions Reduced: ${metrics.co2Reduced.toFixed(2)} kg
    - Equivalent to ${metrics.treesEquivalent.toFixed(2)} trees planted
    - Ocean Waste Prevented: ${metrics.oceanWastePrevented.toFixed(2)} kg
    - Energy Saved: ${metrics.energySaved.toFixed(2)} kWh
    - Water Conserved: ${metrics.waterConserved.toFixed(2)} L
    - Landfill Space Saved: ${metrics.landfillSpaceSaved.toFixed(4)} m³`;
  }

  static getPlasticTypes(): PlasticType[] {
    return this.PLASTIC_TYPES;
  }

  static calculateExtendedImpact(
    weight: number,
    plasticTypeId: string = 'PET',
    transportDistance: number = 10 // km
  ): ExtendedImpactMetrics {
    const plasticType = this.EXTENDED_PLASTIC_TYPES.find(type => type.id === plasticTypeId)
      || this.EXTENDED_PLASTIC_TYPES[0];

    const baseMetrics = this.calculateImpact(weight, plasticTypeId);
    const recycledWeight = weight * plasticType.recyclingEfficiency;

    // Calculate additional metrics
    const microplasticsReduced = weight * 0.015; // 1.5% of weight in microplastics
    const marineLifeSaved = weight * 0.05; // Estimated marine life saved per kg
    const jobsCreated = weight * 0.001; // Jobs created per ton
    const economicBenefit = weight * 2.5; // Economic benefit per kg

    return {
      ...baseMetrics,
      carbonFootprintReduced: {
        production: recycledWeight * plasticType.carbonFootprint.production,
        recycling: recycledWeight * plasticType.carbonFootprint.recycling,
        transportation: recycledWeight * plasticType.carbonFootprint.transportation * (transportDistance / 10)
      },
      microplasticsReduced,
      marineLifeSaved,
      recyclingEfficiencyRate: plasticType.recyclingEfficiency * 100,
      communityImpact: {
        jobsCreated,
        economicBenefit
      }
    };
  }

  static async calculateDetailedImpact(
    collections: Array<{ type: string; weight: number; distance: number }>,
    communityData: {
      totalHouseholds: number;
      activeHouseholds: number;
      regionalRank: number;
    }
  ): Promise<DetailedEnvironmentalMetrics> {
    try {
      const plasticReduction = this.calculatePlasticReduction(collections);
      const carbonFootprint = this.calculateCarbonFootprint(collections);
      const waterConservation = this.calculateWaterConservation(collections);
      const communityImpact = this.calculateCommunityImpact(collections, communityData);
      const economicBenefits = this.calculateEconomicBenefits(collections);

      return {
        plasticReduction,
        carbonFootprint,
        waterConservation,
        communityImpact,
        economicBenefits
      };
    } catch (error) {
      Performance.captureError(error as Error);
      throw new Error('Failed to calculate detailed environmental impact');
    }
  }

  private static calculatePlasticReduction(
    collections: Array<{ type: string; weight: number }>
  ) {
    const totalWeight = collections.reduce((sum, c) => sum + c.weight, 0);
    const byType = collections.reduce((acc, c) => {
      acc[c.type] = (acc[c.type] || 0) + c.weight;
      return acc;
    }, {} as Record<string, number>);

    const oceanDiversion = collections.reduce((sum, c) => {
      const properties = this.PLASTIC_PROPERTIES[c.type];
      return sum + (c.weight * (properties?.oceanImpactFactor || 5) / 10);
    }, 0);

    const recyclingRate = collections.reduce((sum, c) => {
      const properties = this.PLASTIC_PROPERTIES[c.type];
      return sum + (c.weight * (properties?.recyclingEfficiency || 0.7));
    }, 0) / totalWeight;

    return {
      totalWeight,
      byType,
      oceanDiversion,
      landfillDiversion: totalWeight * 0.9, // Assuming 90% diversion rate
      recyclingRate
    };
  }

  private static calculateCarbonFootprint(
    collections: Array<{ type: string; weight: number; distance: number }>
  ) {
    const transportSavings = collections.reduce(
      (sum, c) => sum + c.distance * 0.2, // 0.2 kg CO2 per km
      0
    );

    const recyclingBenefits = collections.reduce((sum, c) => {
      const properties = this.PLASTIC_PROPERTIES[c.type];
      return sum + (c.weight * (properties?.carbonFootprint || 2) * 0.7);
    }, 0);

    const totalReduction = transportSavings + recyclingBenefits;
    const treesEquivalent = totalReduction / 21.7; // One tree absorbs ~21.7 kg CO2 per year

    return {
      transportSavings,
      recyclingBenefits,
      totalReduction,
      treesEquivalent
    };
  }

  private static calculateWaterConservation(
    collections: Array<{ type: string; weight: number }>
  ) {
    const litersSaved = collections.reduce((sum, c) => {
      const properties = this.PLASTIC_PROPERTIES[c.type];
      return sum + (c.weight * (properties?.waterFootprint || 15));
    }, 0);

    return {
      litersSaved,
      productionWaterSaved: litersSaved * 0.7, // 70% of water savings from production
      oceanPollutionPrevented: litersSaved * 0.3 // 30% of water savings prevent ocean pollution
    };
  }

  private static calculateCommunityImpact(
    collections: Array<{ type: string; weight: number }>,
    communityData: {
      totalHouseholds: number;
      activeHouseholds: number;
      regionalRank: number;
    }
  ) {
    return {
      participationRate: (communityData.activeHouseholds / communityData.totalHouseholds) * 100,
      totalHouseholds: communityData.totalHouseholds,
      neighborhoodRanking: communityData.regionalRank,
      collectionEfficiency: collections.length > 0 ? 
        collections.reduce((sum, c) => sum + c.weight, 0) / collections.length : 0
    };
  }

  private static calculateEconomicBenefits(
    collections: Array<{ type: string; weight: number }>
  ) {
    const recyclingRevenue = collections.reduce((sum, c) => {
      // Average market value per kg of recycled plastic
      const marketValue = {
        PET: 0.3,
        HDPE: 0.35,
        LDPE: 0.25,
        PP: 0.28
      }[c.type] || 0.25;

      return sum + (c.weight * marketValue);
    }, 0);

    return {
      recyclingRevenue,
      costSavings: recyclingRevenue * 1.2, // Including landfill diversion savings
      creditGenerated: recyclingRevenue * 0.8, // 80% of revenue converted to credits
      marketValue: recyclingRevenue * 1.5 // Potential market value including processing
    };
  }

  static async getMetrics(): Promise<DetailedEnvironmentalMetrics> {
    try {
      // In a real app, this would fetch from an API or calculate from user history
      // For now, we'll use placeholder data with some randomness
      
      // Get the total weight from collections
      const collectionsData = await EnvironmentalImpactService.getUserCollectionsData();
      const totalWeight = collectionsData.reduce((sum, collection) => 
        sum + collection.items.reduce((itemSum, item) => itemSum + item.weight, 0), 0);
      
      // Calculate detailed metrics based on the weight
      const metrics: DetailedEnvironmentalMetrics = {
        plasticReduction: {
          totalWeight,
          itemsRecycled: collectionsData.reduce((sum, collection) => sum + collection.items.length, 0),
          landfillDiverted: totalWeight * 1.2, // 20% volume increase for landfill space
        },
        carbonFootprint: {
          totalReduction: totalWeight * EnvironmentalImpactService.PLASTIC_PROPERTIES.PET.carbonFootprint,
          treesEquivalent: Math.round((totalWeight * EnvironmentalImpactService.PLASTIC_PROPERTIES.PET.carbonFootprint) / EnvironmentalImpactService.CONSTANTS.CO2_PER_TREE_YEAR),
          emissionsAvoided: totalWeight * EnvironmentalImpactService.PLASTIC_PROPERTIES.PET.carbonFootprint * 1.5,
        },
        waterConservation: {
          litersSaved: totalWeight * EnvironmentalImpactService.PLASTIC_PROPERTIES.PET.waterFootprint,
          householdsImpacted: Math.round((totalWeight * EnvironmentalImpactService.PLASTIC_PROPERTIES.PET.waterFootprint) / 150), // Average household daily usage
          waterQualityImprovement: 0.05 * totalWeight, // 5% improvement per kg of plastic recycled
        },
        communityImpact: {
          participationRate: 35 + Math.random() * 15, // 35-50% participation
          totalHouseholds: 500 + Math.floor(Math.random() * 500), // 500-1000 households
          communityPrograms: 3 + Math.floor(Math.random() * 5), // 3-8 programs
        },
      };
      
      return metrics;
    } catch (error) {
      console.error('Error getting environmental metrics:', error);
      // Return empty metrics if there's an error
      return EnvironmentalImpactService.getEmptyMetrics();
    }
  }

  static async getHistoricalData(): Promise<Array<{
    date: string;
    plasticWeight: number;
    carbonReduction: number;
    waterSaved: number;
  }>> {
    try {
      // Try to get cached historical data
      const storedData = await AsyncStorage.getItem(EnvironmentalImpactService.HISTORICAL_DATA_KEY);
      if (storedData) {
        return JSON.parse(storedData);
      }
      
      // If no stored data, generate historical data based on collections
      const collectionsData = await EnvironmentalImpactService.getUserCollectionsData();
      
      // Create a map of months to aggregate data
      const monthlyData = new Map<string, {
        plasticWeight: number;
        carbonReduction: number;
        waterSaved: number;
      }>();
      
      // Get the last 6 months
      const dates: string[] = [];
      for (let i = 5; i >= 0; i--) {
        const date = new Date();
        date.setMonth(date.getMonth() - i);
        date.setDate(1); // Start of the month
        date.setHours(0, 0, 0, 0);
        const monthKey = date.toISOString().substring(0, 7); // YYYY-MM format
        dates.push(monthKey);
        monthlyData.set(monthKey, {
          plasticWeight: 0,
          carbonReduction: 0,
          waterSaved: 0,
        });
      }
      
      // Aggregate collection data by month
      collectionsData.forEach(collection => {
        const collectionDate = new Date(collection.completedAt || collection.createdAt);
        const monthKey = collectionDate.toISOString().substring(0, 7);
        
        if (monthlyData.has(monthKey)) {
          const monthData = monthlyData.get(monthKey)!;
          const weight = collection.items.reduce((sum, item) => sum + item.weight, 0);
          
          monthData.plasticWeight += weight;
          monthData.carbonReduction += weight * EnvironmentalImpactService.PLASTIC_PROPERTIES.PET.carbonFootprint;
          monthData.waterSaved += weight * EnvironmentalImpactService.PLASTIC_PROPERTIES.PET.waterFootprint;
        }
      });
      
      // Convert map to array and add some randomness for demo purposes
      const result = dates.map(monthKey => {
        const data = monthlyData.get(monthKey)!;
        // Add some randomness (in a real app this would be real data)
        const randomFactor = 0.7 + Math.random() * 0.6; // 0.7-1.3
        
        return {
          date: `${monthKey}-01T00:00:00.000Z`, // First day of month
          plasticWeight: data.plasticWeight > 0 ? data.plasticWeight : 0.5 + Math.random() * 5 * randomFactor,
          carbonReduction: data.carbonReduction > 0 ? data.carbonReduction : (0.5 + Math.random() * 5) * EnvironmentalImpactService.PLASTIC_PROPERTIES.PET.carbonFootprint * randomFactor,
          waterSaved: data.waterSaved > 0 ? data.waterSaved : (0.5 + Math.random() * 5) * EnvironmentalImpactService.PLASTIC_PROPERTIES.PET.waterFootprint * randomFactor,
        };
      });
      
      // Cache the result
      await AsyncStorage.setItem(EnvironmentalImpactService.HISTORICAL_DATA_KEY, JSON.stringify(result));
      
      return result;
    } catch (error) {
      console.error('Error getting historical data:', error);
      // Return empty data if there's an error
      return EnvironmentalImpactService.getEmptyHistoricalData();
    }
  }

  /**
   * Gets user impact data compared to community averages
   * @param timeframe The timeframe to get data for: 'week', 'month', or 'year'
   */
  static async getUserImpactData(timeframe: 'week' | 'month' | 'year' = 'month'): Promise<{
    user: {
      plasticCollected: number;
      co2Reduced: number;
      waterSaved: number;
    };
    localAverage: {
      plasticCollected: number;
      co2Reduced: number;
      waterSaved: number;
    };
    nationalAverage: {
      plasticCollected: number;
      co2Reduced: number;
      waterSaved: number;
    };
    topPerformers: {
      plasticCollected: number;
      co2Reduced: number;
      waterSaved: number;
    };
  }> {
    try {
      // Try to get cached comparison data
      const storedData = await AsyncStorage.getItem(`${EnvironmentalImpactService.COMMUNITY_COMPARISON_KEY}_${timeframe}`);
      if (storedData) {
        return JSON.parse(storedData);
      }
      
      // Get user's collections for the given timeframe
      const collectionsData = await EnvironmentalImpactService.getUserCollectionsData(timeframe);
      
      // Calculate user metrics
      const totalWeight = collectionsData.reduce((sum, collection) => 
        sum + collection.items.reduce((itemSum, item) => itemSum + item.weight, 0), 0);
      
      const userMetrics = {
        plasticCollected: totalWeight,
        co2Reduced: totalWeight * EnvironmentalImpactService.PLASTIC_PROPERTIES.PET.carbonFootprint,
        waterSaved: totalWeight * EnvironmentalImpactService.PLASTIC_PROPERTIES.PET.waterFootprint,
      };
      
      // In a real app, these would come from an API
      // For demo purposes, we'll create realistic comparison data based on the user's data
      
      // Local average is typically lower than active users
      const localAverageFactor = 0.6 + Math.random() * 0.3; // 0.6-0.9x of user's impact
      
      // National average is typically lower than local average
      const nationalAverageFactor = 0.4 + Math.random() * 0.3; // 0.4-0.7x of user's impact
      
      // Top performers are significantly higher than average users
      const topPerformersFactor = 1.5 + Math.random() * 1.0; // 1.5-2.5x of user's impact
      
      const comparisonData = {
        user: userMetrics,
        localAverage: {
          plasticCollected: Math.max(0.5, userMetrics.plasticCollected * localAverageFactor),
          co2Reduced: Math.max(0.5, userMetrics.co2Reduced * localAverageFactor),
          waterSaved: Math.max(100, userMetrics.waterSaved * localAverageFactor),
        },
        nationalAverage: {
          plasticCollected: Math.max(0.3, userMetrics.plasticCollected * nationalAverageFactor),
          co2Reduced: Math.max(0.3, userMetrics.co2Reduced * nationalAverageFactor),
          waterSaved: Math.max(50, userMetrics.waterSaved * nationalAverageFactor),
        },
        topPerformers: {
          plasticCollected: userMetrics.plasticCollected * topPerformersFactor,
          co2Reduced: userMetrics.co2Reduced * topPerformersFactor,
          waterSaved: userMetrics.waterSaved * topPerformersFactor,
        },
      };
      
      // Cache the result
      await AsyncStorage.setItem(`${EnvironmentalImpactService.COMMUNITY_COMPARISON_KEY}_${timeframe}`, JSON.stringify(comparisonData));
      
      return comparisonData;
    } catch (error) {
      console.error('Error getting user impact comparison data:', error);
      // Return placeholder data if there's an error
      return EnvironmentalImpactService.getEmptyComparisonData();
    }
  }

  /**
   * Gets user collections data for impact calculations
   * @param timeframe Optional timeframe to filter collections: 'week', 'month', or 'year'
   */
  private static async getUserCollectionsData(timeframe?: 'week' | 'month' | 'year'): Promise<Collection[]> {
    try {
      // In a real app, this would come from a CollectionService or API
      // For demo purposes, we'll use placeholder data
      const collectionsJson = await AsyncStorage.getItem('user_collections');
      let collections: Collection[] = collectionsJson ? JSON.parse(collectionsJson) : [];
      
      // If collections are empty, return placeholder data
      if (collections.length === 0) {
        collections = EnvironmentalImpactService.getPlaceholderCollections();
      }
      
      // Filter by timeframe if specified
      if (timeframe) {
        const now = new Date();
        let startDate: Date;
        
        switch (timeframe) {
          case 'week':
            startDate = new Date(now);
            startDate.setDate(now.getDate() - 7);
            break;
          case 'month':
            startDate = new Date(now);
            startDate.setMonth(now.getMonth() - 1);
            break;
          case 'year':
            startDate = new Date(now);
            startDate.setFullYear(now.getFullYear() - 1);
            break;
          default:
            startDate = new Date(0); // Beginning of time
        }
        
        return collections.filter(collection => {
          const collectionDate = new Date(collection.completedAt || collection.createdAt);
          return collectionDate >= startDate && collectionDate <= now;
        });
      }
      
      return collections;
    } catch (error) {
      console.error('Error fetching user collections:', error);
      return EnvironmentalImpactService.getPlaceholderCollections();
    }
  }

  /**
   * Returns placeholder collection data for demo purposes
   */
  private static getPlaceholderCollections(): Collection[] {
    const generateRandomItems = (count: number, minWeight: number, maxWeight: number): CollectionItem[] => {
      return Array(count).fill(0).map((_, index) => ({
        id: `item-${index}`,
        materialId: ['PET', 'HDPE', 'LDPE', 'PP', 'PS'][Math.floor(Math.random() * 5)],
        weight: minWeight + Math.random() * (maxWeight - minWeight),
        count: 1 + Math.floor(Math.random() * 5),
        barcode: `12345${index}`,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      }));
    };
    
    // Generate collections spread out over the last 6 months
    const collections: Collection[] = [];
    for (let i = 0; i < 15; i++) {
      const date = new Date();
      date.setDate(date.getDate() - Math.floor(Math.random() * 180)); // Random date in last 6 months
      
      collections.push({
        id: `coll-${i}`,
        userId: 'current-user',
        scheduledDate: date.toISOString(),
        createdAt: date.toISOString(),
        completedAt: date.toISOString(),
        status: 'completed',
        items: generateRandomItems(2 + Math.floor(Math.random() * 6), 0.1, 2.0),
      });
    }
    
    return collections;
  }

  /**
   * Returns empty metrics for error state
   */
  private static getEmptyMetrics(): DetailedEnvironmentalMetrics {
    return {
      plasticReduction: {
        totalWeight: 0,
        itemsRecycled: 0,
        landfillDiverted: 0,
      },
      carbonFootprint: {
        totalReduction: 0,
        treesEquivalent: 0,
        emissionsAvoided: 0,
      },
      waterConservation: {
        litersSaved: 0,
        householdsImpacted: 0,
        waterQualityImprovement: 0,
      },
      communityImpact: {
        participationRate: 0,
        totalHouseholds: 0,
        communityPrograms: 0,
      },
    };
  }

  /**
   * Returns empty historical data for error state
   */
  private static getEmptyHistoricalData() {
    const dates: Array<{
      date: string;
      plasticWeight: number;
      carbonReduction: number;
      waterSaved: number;
    }> = [];
    
    for (let i = 5; i >= 0; i--) {
      const date = new Date();
      date.setMonth(date.getMonth() - i);
      date.setDate(1);
      
      dates.push({
        date: date.toISOString(),
        plasticWeight: 0,
        carbonReduction: 0,
        waterSaved: 0,
      });
    }
    
    return dates;
  }

  /**
   * Returns empty comparison data for error state
   */
  private static getEmptyComparisonData() {
    return {
      user: {
        plasticCollected: 0,
        co2Reduced: 0,
        waterSaved: 0,
      },
      localAverage: {
        plasticCollected: 0,
        co2Reduced: 0,
        waterSaved: 0,
      },
      nationalAverage: {
        plasticCollected: 0,
        co2Reduced: 0,
        waterSaved: 0,
      },
      topPerformers: {
        plasticCollected: 0,
        co2Reduced: 0,
        waterSaved: 0,
      },
    };
  }
}