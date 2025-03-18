import { SafeStorage } from '@/utils/storage';
import { PlasticCollection } from '@/types';

export class PlasticCollectionService {
  private static STORAGE_KEY = '@plastic_collections';
  private static CREDIT_RATE = 2; // $2 per kg of plastic

  static async scheduleCollection(
    userId: string,
    weight: number,
    scheduledDate: Date
  ): Promise<PlasticCollection> {
    const collection: PlasticCollection = {
      id: Date.now().toString(),
      userId,
      weight,
      timestamp: scheduledDate,
      status: 'scheduled',
      creditAmount: weight * this.CREDIT_RATE,
    };

    const collections = await this.getCollections();
    collections.push(collection);
    await SafeStorage.setItem(this.STORAGE_KEY, JSON.stringify(collections));

    return collection;
  }

  static async getCollections(): Promise<PlasticCollection[]> {
    const data = await SafeStorage.getItem(this.STORAGE_KEY);
    return data ? JSON.parse(data) : [];
  }

  static async getUserCollections(userId: string): Promise<PlasticCollection[]> {
    const collections = await this.getCollections();
    return collections.filter(c => c.userId === userId);
  }

  static async updateCollectionStatus(
    collectionId: string,
    status: PlasticCollection['status']
  ): Promise<void> {
    const collections = await this.getCollections();
    const index = collections.findIndex(c => c.id === collectionId);
    if (index !== -1) {
      collections[index].status = status;
      await SafeStorage.setItem(this.STORAGE_KEY, JSON.stringify(collections));
    }
  }
} 