import { createSlice, PayloadAction } from '@reduxjs/toolkit';

export interface MaterialType {
  id: string;
  name: string;
  pointsPerKg: number;
  co2OffsetPerKg: number;
}

export interface EcoCartState {
  materials: MaterialType[];
  sustainabilityMetrics: {
    plasticWeight: number;
    bottlesSaved: number;
    treesPlanted: number;
    carbonOffset: number;
    energyEfficiency: number;
    wasteReduction: number;
  };
  performanceMetrics: {
    latency: number;
    throughput: number;
    errorRate: number;
  };
  weightTracking: {
    currentWeight: number;
    weeklyGoal: number;
    monthlyGoal: number;
  };
}

const initialState: EcoCartState = {
  materials: [
    {
      id: '1',
      name: 'Plastic',
      pointsPerKg: 10,
      co2OffsetPerKg: 2.5
    },
    {
      id: '2',
      name: 'Paper',
      pointsPerKg: 5,
      co2OffsetPerKg: 1.5
    },
    {
      id: '3',
      name: 'Glass',
      pointsPerKg: 8,
      co2OffsetPerKg: 2.0
    }
  ],
  sustainabilityMetrics: {
    plasticWeight: 0,
    bottlesSaved: 0,
    treesPlanted: 0,
    carbonOffset: 0,
    energyEfficiency: 0,
    wasteReduction: 0
  },
  performanceMetrics: {
    latency: 0,
    throughput: 0,
    errorRate: 0
  },
  weightTracking: {
    currentWeight: 0,
    weeklyGoal: 0,
    monthlyGoal: 0
  }
};

const ecoCartSlice = createSlice({
  name: 'ecoCart',
  initialState,
  reducers: {
    updateSustainabilityMetrics: (state, action: PayloadAction<Partial<EcoCartState['sustainabilityMetrics']>>) => {
      state.sustainabilityMetrics = { ...state.sustainabilityMetrics, ...action.payload };
    },
    updatePerformanceMetrics: (state, action: PayloadAction<Partial<EcoCartState['performanceMetrics']>>) => {
      state.performanceMetrics = { ...state.performanceMetrics, ...action.payload };
    },
    updateWeightTracking: (state, action: PayloadAction<Partial<EcoCartState['weightTracking']>>) => {
      state.weightTracking = { ...state.weightTracking, ...action.payload };
    }
  }
});

export const { updateSustainabilityMetrics, updatePerformanceMetrics, updateWeightTracking } = ecoCartSlice.actions;
export const ecoCartReducer = ecoCartSlice.reducer;

// Export selectors
export const selectMaterials = (state: { ecoCart: EcoCartState }) => state.ecoCart.materials;
export const selectSustainabilityMetrics = (state: { ecoCart: EcoCartState }) => state.ecoCart.sustainabilityMetrics;
export const selectPerformanceMetrics = (state: { ecoCart: EcoCartState }) => state.ecoCart.performanceMetrics;
export const selectWeightTracking = (state: { ecoCart: EcoCartState }) => state.ecoCart.weightTracking; 