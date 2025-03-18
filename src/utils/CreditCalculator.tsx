import { PlasticType } from '@/types/collection';

interface CreditRates {
  [key: string]: number;
  PET: number;
  HDPE: number;
  LDPE: number;
  PP: number;
  PS: number;
  OTHER: number;
}

interface WeightData {
  weight: number;
  plasticType: PlasticType;
  quality: 'clean' | 'mixed' | 'contaminated';
}

interface CreditResult {
  credits: number;
  bonusCredits: number;
  totalCredits: number;
  environmentalImpact: {
    co2Saved: number; // in kg
    waterSaved: number; // in liters
    energySaved: number; // in kWh
  };
}

const BASE_CREDIT_RATES: CreditRates = {
  PET: 2.5,   // R2.50 per kg
  HDPE: 3.0,  // R3.00 per kg
  LDPE: 2.0,  // R2.00 per kg
  PP: 2.8,    // R2.80 per kg
  PS: 1.5,    // R1.50 per kg
  OTHER: 1.0  // R1.00 per kg
};

const QUALITY_MULTIPLIERS = {
  clean: 1.2,        // 20% bonus for clean plastic
  mixed: 1.0,        // Base rate for mixed plastic
  contaminated: 0.8  // 20% reduction for contaminated plastic
};

const ENVIRONMENTAL_IMPACT_RATES = {
  co2PerKg: 2.5,    // kg of CO2 saved per kg of recycled plastic
  waterPerKg: 4.0,  // liters of water saved per kg of recycled plastic
  energyPerKg: 7.0  // kWh of energy saved per kg of recycled plastic
};

export function calculateCredits(weightData: WeightData): CreditResult {
  const { weight, plasticType, quality } = weightData;

  if (weight <= 0) {
    throw new Error('Weight must be greater than 0');
  }

  // Calculate base credits
  const baseRate = BASE_CREDIT_RATES[plasticType] || BASE_CREDIT_RATES.OTHER;
  const qualityMultiplier = QUALITY_MULTIPLIERS[quality];
  const baseCredits = weight * baseRate * qualityMultiplier;

  // Calculate bonus credits based on weight thresholds
  const bonusCredits = calculateBonusCredits(weight, baseCredits);

  // Calculate environmental impact
  const environmentalImpact = calculateEnvironmentalImpact(weight);

  const totalCredits = baseCredits + bonusCredits;

  return {
    credits: Number(baseCredits.toFixed(2)),
    bonusCredits: Number(bonusCredits.toFixed(2)),
    totalCredits: Number(totalCredits.toFixed(2)),
    environmentalImpact
  };
}

function calculateBonusCredits(weight: number, baseCredits: number): number {
  let bonusMultiplier = 0;

  // Bonus tiers based on weight
  if (weight >= 50) {
    bonusMultiplier = 0.2; // 20% bonus for 50kg or more
  } else if (weight >= 25) {
    bonusMultiplier = 0.15; // 15% bonus for 25-49.99kg
  } else if (weight >= 10) {
    bonusMultiplier = 0.1; // 10% bonus for 10-24.99kg
  } else if (weight >= 5) {
    bonusMultiplier = 0.05; // 5% bonus for 5-9.99kg
  }

  return baseCredits * bonusMultiplier;
}

function calculateEnvironmentalImpact(weight: number) {
  return {
    co2Saved: Number((weight * ENVIRONMENTAL_IMPACT_RATES.co2PerKg).toFixed(2)),
    waterSaved: Number((weight * ENVIRONMENTAL_IMPACT_RATES.waterPerKg).toFixed(2)),
    energySaved: Number((weight * ENVIRONMENTAL_IMPACT_RATES.energyPerKg).toFixed(2))
  };
}

export function estimateMonthlyCredits(
  weeklyWeight: number,
  plasticType: PlasticType = 'PET',
  quality: 'clean' | 'mixed' | 'contaminated' = 'mixed'
): number {
  const weeklyCredits = calculateCredits({
    weight: weeklyWeight,
    plasticType,
    quality
  }).totalCredits;

  return Number((weeklyCredits * 4.33).toFixed(2)); // Average weeks per month
}

export function calculateCreditValue(credits: number): number {
  return Number((credits * 1).toFixed(2)); // 1 credit = R1
} 