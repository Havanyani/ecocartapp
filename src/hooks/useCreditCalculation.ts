import { MaterialCategory } from '@/types/Material';
import { useMemo } from 'react';

interface CreditRate {
  rate: number;
  minWeight: number;
  maxWeight: number;
}

const CREDIT_RATES: Record<MaterialCategory, CreditRate> = {
  plastic: {
    rate: 0.5, // 0.5 credits per kg
    minWeight: 0.1,
    maxWeight: 100,
  },
  paper: {
    rate: 0.3, // 0.3 credits per kg
    minWeight: 0.1,
    maxWeight: 100,
  },
  metal: {
    rate: 1.0, // 1.0 credit per kg
    minWeight: 0.1,
    maxWeight: 50,
  },
  glass: {
    rate: 0.4, // 0.4 credits per kg
    minWeight: 0.1,
    maxWeight: 50,
  },
  electronics: {
    rate: 2.0, // 2.0 credits per kg
    minWeight: 0.1,
    maxWeight: 20,
  },
  organic: {
    rate: 0.2, // 0.2 credits per kg
    minWeight: 0.1,
    maxWeight: 100,
  },
  other: {
    rate: 0.1, // 0.1 credit per kg
    minWeight: 0.1,
    maxWeight: 100,
  },
};

export function useCreditCalculation() {
  const calculateCredit = useMemo(
    () => (materialType: MaterialCategory, weight: number): number => {
      const rate = CREDIT_RATES[materialType];
      
      if (!rate) {
        throw new Error(`Invalid material type: ${materialType}`);
      }

      if (weight < rate.minWeight) {
        return 0;
      }

      if (weight > rate.maxWeight) {
        return rate.maxWeight * rate.rate;
      }

      return weight * rate.rate;
    },
    []
  );

  const getRateInfo = useMemo(
    () => (materialType: MaterialCategory) => {
      const rate = CREDIT_RATES[materialType];
      
      if (!rate) {
        throw new Error(`Invalid material type: ${materialType}`);
      }

      return {
        rate: rate.rate,
        minWeight: rate.minWeight,
        maxWeight: rate.maxWeight,
        unit: 'kg',
      };
    },
    []
  );

  return {
    calculateCredit,
    getRateInfo,
  };
} 