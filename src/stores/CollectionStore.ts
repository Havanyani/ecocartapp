import { PlasticCollectionService } from '@/services/PlasticCollectionService';
import { Collection } from '@/types/Collection';
import { TimeSlot } from '@/types/collections';
import { makeAutoObservable, runInAction } from 'mobx';
import { RootStore } from './RootStore';

export class CollectionStore {
  collections: Collection[] = [];
  upcomingCollections: Collection[] = [];
  isLoading: boolean = false;
  error: string | null = null;

  constructor(private rootStore: RootStore) {
    makeAutoObservable(this);
  }

  async loadCollections() {
    if (!this.rootStore.userStore.currentUser) return;
    
    try {
      this.isLoading = true;
      const collections = await PlasticCollectionService.getUserCollections(
        this.rootStore.userStore.currentUser.id
      );
      runInAction(() => {
        this.collections = collections;
        this.upcomingCollections = collections.filter(c => c.status === 'scheduled');
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

  async scheduleCollection(slot: TimeSlot, date: Date) {
    try {
      this.isLoading = true;
      const collection: Collection = {
        id: Date.now().toString(), // Temporary ID
        userId: this.rootStore.userStore.currentUser?.id || '',
        slot,
        date,
        status: 'pending'
      };
      
      // API call would go here
      this.collections.push(collection);
      this.error = null;
    } catch (error) {
      this.error = error.message;
    } finally {
      this.isLoading = false;
    }
  }

  getUpcomingCollections() {
    return this.collections.filter(c => 
      c.status === 'pending' || c.status === 'confirmed'
    );
  }

  getCompletedCollections() {
    return this.collections.filter(c => c.status === 'completed');
  }
} 