
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
    // TODO: Implement actual API call
    return {
      plasticReduction: {
        totalWeight: 1500,
        itemsRecycled: 5000,
        landfillDiverted: 2000,
      },
      carbonFootprint: {
        totalReduction: 2500,
        treesEquivalent: 100,
        emissionsAvoided: 5000,
      },
      waterConservation: {
        litersSaved: 100000,
        householdsImpacted: 500,
        waterQualityImprovement: 75,
      },
      communityImpact: {
        participationRate: 85,
        totalHouseholds: 1000,
        communityPrograms: 5,
      },
    };
  }

  static async getHistoricalData(): Promise<Array<{
    date: string;
    plasticWeight: number;
    carbonReduction: number;
    waterSaved: number;
  }>> {
    // TODO: Implement actual API call
    return [
      { date: '2024-01-01', plasticWeight: 100, carbonReduction: 150, waterSaved: 5000 },
      { date: '2024-01-15', plasticWeight: 150, carbonReduction: 200, waterSaved: 7500 },
      { date: '2024-02-01', plasticWeight: 200, carbonReduction: 250, waterSaved: 10000 },
      { date: '2024-02-15', plasticWeight: 250, carbonReduction: 300, waterSaved: 12500 },
      { date: '2024-03-01', plasticWeight: 300, carbonReduction: 350, waterSaved: 15000 },
    ];
  }

  /**
   * Gets the environmental impact data for the user
   * @param timeRange The time range to get data for ('week', 'month', 'year')
   * @returns The environmental impact data
   */
  static async getUserImpactData(timeRange: 'week' | 'month' | 'year') {
    const mockData = {
      summary: {
        totalItems: Math.floor(Math.random() * 500) + 100,
        totalWeight: Math.floor(Math.random() * 200) + 50,
        co2Saved: Math.floor(Math.random() * 100) + 20,
        waterSaved: Math.floor(Math.random() * 1000) + 200
      },
      trends: {
        week: {
          labels: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'],
          datasets: {
            weight: Array.from({ length: 7 }, () => Math.floor(Math.random() * 10) + 1),
            items: Array.from({ length: 7 }, () => Math.floor(Math.random() * 20) + 5),
            co2: Array.from({ length: 7 }, () => Math.floor(Math.random() * 5) + 1),
            water: Array.from({ length: 7 }, () => Math.floor(Math.random() * 50) + 10)
          }
        },
        month: {
          labels: ['Week 1', 'Week 2', 'Week 3', 'Week 4'],
          datasets: {
            weight: Array.from({ length: 4 }, () => Math.floor(Math.random() * 40) + 10),
            items: Array.from({ length: 4 }, () => Math.floor(Math.random() * 80) + 20),
            co2: Array.from({ length: 4 }, () => Math.floor(Math.random() * 20) + 5),
            water: Array.from({ length: 4 }, () => Math.floor(Math.random() * 200) + 50)
          }
        },
        year: {
          labels: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun'],
          datasets: {
            weight: Array.from({ length: 6 }, () => Math.floor(Math.random() * 100) + 30),
            items: Array.from({ length: 6 }, () => Math.floor(Math.random() * 200) + 50),
            co2: Array.from({ length: 6 }, () => Math.floor(Math.random() * 50) + 10),
            water: Array.from({ length: 6 }, () => Math.floor(Math.random() * 500) + 100)
          }
        }
      },
      materials: [
        { name: 'Plastic', count: Math.floor(Math.random() * 300) + 50, weight: Math.floor(Math.random() * 100) + 20 },
        { name: 'Paper', count: Math.floor(Math.random() * 200) + 30, weight: Math.floor(Math.random() * 50) + 10 },
        { name: 'Glass', count: Math.floor(Math.random() * 100) + 20, weight: Math.floor(Math.random() * 150) + 30 },
        { name: 'Metal', count: Math.floor(Math.random() * 50) + 10, weight: Math.floor(Math.random() * 80) + 15 }
      ]
    };
    
    return mockData;
  }
}