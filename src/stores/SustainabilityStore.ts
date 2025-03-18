import { makeAutoObservable, runInAction } from 'mobx';
import { SustainabilityMetrics } from '@/types';
import { RootStore } from './RootStore';

export class SustainabilityStore {
  metrics: SustainabilityMetrics = {
    totalPlasticCollected: 0,
    totalCreditsIssued: 0,
    carbonFootprintReduced: 0,
  };
  isLoading: boolean = false;
  error: string | null = null;

  constructor(private rootStore: RootStore) {
    makeAutoObservable(this);
  }

  async calculateMetrics() {
    try {
      this.isLoading = true;
      const collections = this.rootStore.collectionStore.collections;
      
      const totalPlastic = collections.reduce((sum, c) => sum + c.weight, 0);
      const totalCredits = collections.reduce((sum, c) => sum + c.creditAmount, 0);
      // Assuming 1kg plastic = 2.5kg CO2 reduction
      const carbonReduction = totalPlastic * 2.5;

      runInAction(() => {
        this.metrics = {
          totalPlasticCollected: totalPlastic,
          totalCreditsIssued: totalCredits,
          carbonFootprintReduced: carbonReduction,
        };
        this.error = null;
      });
    } catch (error) {
      runInAction(() => {
        this.error = error.message;
      });
    } finally {
      runInAction(() => {
        this.isLoading = false;
      });
    }
  }
} 