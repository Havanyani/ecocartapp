import { SafeStorage } from '@/utils/storage';

export class CreditService {
  private static STORAGE_KEY = '@user_credits';

  static async getUserCredits(userId: string): Promise<number> {
    const data = await SafeStorage.getItem(this.STORAGE_KEY);
    const credits = data ? JSON.parse(data) : {};
    return credits[userId] || 0;
  }

  static async addCredits(userId: string, amount: number): Promise<void> {
    const data = await SafeStorage.getItem(this.STORAGE_KEY);
    const credits = data ? JSON.parse(data) : {};
    credits[userId] = (credits[userId] || 0) + amount;
    await SafeStorage.setItem(this.STORAGE_KEY, JSON.stringify(credits));
  }

  static async useCredits(userId: string, amount: number): Promise<boolean> {
    const currentCredits = await this.getUserCredits(userId);
    if (currentCredits < amount) return false;

    const data = await SafeStorage.getItem(this.STORAGE_KEY);
    const credits = data ? JSON.parse(data) : {};
    credits[userId] = currentCredits - amount;
    await SafeStorage.setItem(this.STORAGE_KEY, JSON.stringify(credits));
    return true;
  }
} 