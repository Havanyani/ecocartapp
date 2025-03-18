import { makeAutoObservable, runInAction } from 'mobx';
import { CreditService } from '@/services/CreditService';
import { User } from '@/types/User';
import { RootStore } from './RootStore';

type UserMetrics = User['metrics'];

export class UserStore {
  currentUser: User | null = null;
  metrics: UserMetrics = {
    totalPlasticCollected: 0,
    credits: 0,
    carbonFootprintReduced: 0
  };
  credits: number = 0;
  isLoading: boolean = false;
  error: string | null = null;

  constructor(private rootStore: RootStore) {
    makeAutoObservable(this);
  }

  async loadUserCredits() {
    if (!this.currentUser) return;
    
    try {
      this.isLoading = true;
      const credits = await CreditService.getUserCredits(this.currentUser.id);
      runInAction(() => {
        this.credits = credits;
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

  async addCredits(amount: number) {
    if (!this.currentUser) return;
    
    try {
      await CreditService.addCredits(this.currentUser.id, amount);
      await this.loadUserCredits();
    } catch (error) {
      runInAction(() => {
        this.error = error.message;
      });
    }
  }

  updateMetrics(metrics: Partial<UserMetrics>) {
    this.metrics = { ...this.metrics, ...metrics };
  }

  updateUserData(data: User) {
    this.currentUser = data;
    this.metrics = data.metrics;
  }
} 