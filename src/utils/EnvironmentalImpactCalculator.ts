import { PerformanceMonitor } from './PerformanceMonitoring';

interface EnvironmentalMetrics {
  plasticWeight: number;  // in kilograms
  carbonOffset: number;   // in kilograms of CO2
  waterSaved: number;     // in liters
  treesEquivalent: number;
  bottlesSaved: number;
  energySaved: number;    // in kWh
  credits: number;        // in currency units
}

interface MaterialData {
  plasticDensity: number;  // kg/m³
  carbonPerKg: number;     // kg CO2/kg plastic
  waterPerKg: number;      // liters/kg plastic
  treesPerTonCO2: number;  // trees/ton CO2
}

interface CalculationConfig {
  includeIndirect: boolean;
  precisionDecimals: number;
  useMetricUnits: boolean;
  creditMultiplier: number;
}

export class EnvironmentalImpactCalculator {
  // Constants for environmental impact calculations
  private static readonly TREE_CO2_KG_PER_YEAR = 22;    // Average CO2 absorption per tree per year
  private static readonly PLASTIC_CO2_KG_PER_KG = 6;    // CO2 emissions saved per kg of recycled plastic
  private static readonly WATER_LITERS_PER_KG = 17;     // Water saved per kg of recycled plastic
  private static readonly ENERGY_KWH_PER_KG = 5.774;    // Energy saved per kg of recycled plastic
  private static readonly BOTTLES_PER_KG = 25;          // Average number of bottles per kg
  private static readonly BASE_CREDIT_RATE = 5;         // Base rate in currency units per kg

  private static readonly DEFAULT_MATERIAL_DATA: MaterialData = {
    plasticDensity: 920,      // HDPE density
    carbonPerKg: this.PLASTIC_CO2_KG_PER_KG,
    waterPerKg: this.WATER_LITERS_PER_KG,
    treesPerTonCO2: 45        // Trees needed to absorb 1 ton of CO2 annually
  };

  private static readonly DEFAULT_CONFIG: CalculationConfig = {
    includeIndirect: true,
    precisionDecimals: 2,
    useMetricUnits: true,
    creditMultiplier: 1
  };

  static calculateEquivalents(plasticWeight: number): {
    trees: number;
    bottlesSaved: number;
    co2Saved: number;
  } {
    try {
      const co2Saved = plasticWeight * this.PLASTIC_CO2_KG_PER_KG;
      
      return {
        trees: this.roundToDecimal(co2Saved / this.TREE_CO2_KG_PER_YEAR, 1),
        bottlesSaved: Math.round(plasticWeight * this.BOTTLES_PER_KG),
        co2Saved: this.roundToDecimal(co2Saved, 1)
      };
    } catch (error: unknown) {
      PerformanceMonitor.captureError(error instanceof Error ? error : new Error(String(error)));
      throw error;
    }
  }

  static calculateImpact(
    volumeInLiters: number,
    materialData: Partial<MaterialData> = {},
    config: Partial<CalculationConfig> = {}
  ): EnvironmentalMetrics {
    try {
      const finalMaterialData = { ...this.DEFAULT_MATERIAL_DATA, ...materialData };
      const finalConfig = { ...this.DEFAULT_CONFIG, ...config };

      // Convert volume to weight
      const plasticWeight = this.calculatePlasticWeight(
        volumeInLiters,
        finalMaterialData.plasticDensity
      );

      // Calculate direct impacts
      let carbonOffset = this.calculateCarbonOffset(
        plasticWeight,
        finalMaterialData.carbonPerKg
      );

      let waterSaved = this.calculateWaterSaved(
        plasticWeight,
        finalMaterialData.waterPerKg
      );

      let energySaved = this.calculateEnergySaved(plasticWeight);

      // Include indirect impacts if configured
      if (finalConfig.includeIndirect) {
        carbonOffset *= 1.15;  // 15% additional indirect carbon savings
        waterSaved *= 1.1;     // 10% additional indirect water savings
        energySaved *= 1.1;    // 10% additional indirect energy savings
      }

      // Calculate additional metrics
      const treesEquivalent = this.calculateTreesEquivalent(
        carbonOffset,
        finalMaterialData.treesPerTonCO2
      );

      const bottlesSaved = Math.round(plasticWeight * this.BOTTLES_PER_KG);
      const credits = this.calculateCredits(plasticWeight, finalConfig.creditMultiplier);

      // Round results based on configured precision
      const roundedMetrics = {
        plasticWeight: this.roundToDecimal(plasticWeight, finalConfig.precisionDecimals),
        carbonOffset: this.roundToDecimal(carbonOffset, finalConfig.precisionDecimals),
        waterSaved: this.roundToDecimal(waterSaved, finalConfig.precisionDecimals),
        treesEquivalent: this.roundToDecimal(treesEquivalent, finalConfig.precisionDecimals),
        bottlesSaved,
        energySaved: this.roundToDecimal(energySaved, finalConfig.precisionDecimals),
        credits
      };

      // Convert units if needed
      return finalConfig.useMetricUnits ? 
        roundedMetrics : 
        this.convertToImperial(roundedMetrics);

    } catch (error: unknown) {
      PerformanceMonitor.captureError(error instanceof Error ? error : new Error(String(error)));
      throw error;
    }
  }

  private static calculatePlasticWeight(
    volumeInLiters: number,
    density: number
  ): number {
    return (volumeInLiters / 1000) * density;  // Convert liters to m³
  }

  private static calculateCarbonOffset(
    plasticWeight: number,
    carbonPerKg: number
  ): number {
    return plasticWeight * carbonPerKg;
  }

  private static calculateWaterSaved(
    plasticWeight: number,
    waterPerKg: number = this.WATER_LITERS_PER_KG
  ): number {
    return plasticWeight * waterPerKg;
  }

  private static calculateEnergySaved(plasticWeight: number): number {
    return plasticWeight * this.ENERGY_KWH_PER_KG;
  }

  private static calculateTreesEquivalent(
    carbonOffset: number,
    treesPerTonCO2: number
  ): number {
    return (carbonOffset / 1000) * treesPerTonCO2;  // Convert kg to tons
  }

  static calculateCredits(plasticWeight: number, multiplier = 1): number {
    return this.roundToDecimal(plasticWeight * this.BASE_CREDIT_RATE * multiplier, 2);
  }

  private static roundToDecimal(value: number, decimals: number): number {
    const factor = Math.pow(10, decimals);
    return Math.round(value * factor) / factor;
  }

  private static convertToImperial(metrics: EnvironmentalMetrics): EnvironmentalMetrics {
    return {
      ...metrics,
      plasticWeight: metrics.plasticWeight * 2.20462,  // kg to lbs
      carbonOffset: metrics.carbonOffset * 2.20462,    // kg to lbs
      waterSaved: metrics.waterSaved * 0.264172,       // liters to gallons
      energySaved: metrics.energySaved * 1,            // kWh remains the same
    };
  }

  static formatMetrics(metrics: EnvironmentalMetrics, useMetricUnits = true): string {
    const units = useMetricUnits ? 
      { weight: 'kg', volume: 'L', energy: 'kWh' } : 
      { weight: 'lbs', volume: 'gal', energy: 'kWh' };

    return [
      `Plastic Recycled: ${this.formatImpact(metrics.plasticWeight, units.weight)}`,
      `CO₂ Emissions Saved: ${this.formatImpact(metrics.carbonOffset, units.weight)}`,
      `Water Saved: ${this.formatImpact(metrics.waterSaved, units.volume)}`,
      `Energy Saved: ${this.formatImpact(metrics.energySaved, units.energy)}`,
      `Equivalent to ${metrics.treesEquivalent.toFixed(1)} trees planted`,
      `Bottles Saved: ${this.formatImpact(metrics.bottlesSaved, 'bottles')}`,
      `Credits Earned: ${metrics.credits.toFixed(2)}`
    ].join('\n');
  }

  static formatImpact(value: number, unit: string): string {
    if (value >= 1000) {
      return `${(value / 1000).toFixed(1)}k ${unit}`;
    }
    return `${Math.round(value)} ${unit}`;
  }
} 