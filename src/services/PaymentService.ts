import { OfflineQueueManager } from '@/utils/OfflineQueueManager';
import { ApiService } from './ApiService';

export interface PaymentMethod {
  id: string;
  type: 'credit_card' | 'debit_card' | 'bank_account';
  last4: string;
  expiryDate?: string;
  bankName?: string;
  accountType?: 'checking' | 'savings';
  isDefault: boolean;
}

export interface CreditBalance {
  available: number;
  pending: number;
  lifetimeEarned: number;
}

export interface PaymentIntent {
  id: string;
  amount: number;
  currency: string;
  status: 'pending' | 'succeeded' | 'failed';
  paymentMethodId?: string;
  createdAt: string;
  updatedAt: string;
}

export class PaymentService {
  private static instance: PaymentService;
  private apiService: ApiService;

  private constructor() {
    this.apiService = ApiService.getInstance();
  }

  public static getInstance(): PaymentService {
    if (!PaymentService.instance) {
      PaymentService.instance = new PaymentService();
    }
    return PaymentService.instance;
  }

  // Payment Methods
  async getPaymentMethods(): Promise<PaymentMethod[]> {
    try {
      const response = await this.apiService.get('/payment-methods');
      return response.data;
    } catch (error) {
      console.error('Error fetching payment methods:', error);
      throw error;
    }
  }

  async addPaymentMethod(paymentMethodData: Omit<PaymentMethod, 'id' | 'isDefault'>): Promise<PaymentMethod> {
    try {
      const response = await this.apiService.post('/payment-methods', paymentMethodData);
      return response.data;
    } catch (error) {
      console.error('Error adding payment method:', error);
      throw error;
    }
  }

  async removePaymentMethod(id: string): Promise<void> {
    try {
      await this.apiService.delete(`/payment-methods/${id}`);
    } catch (error) {
      console.error('Error removing payment method:', error);
      throw error;
    }
  }

  async setDefaultPaymentMethod(id: string): Promise<void> {
    try {
      await this.apiService.put(`/payment-methods/${id}/default`);
    } catch (error) {
      console.error('Error setting default payment method:', error);
      throw error;
    }
  }

  // Credits
  async getCreditBalance(): Promise<CreditBalance> {
    try {
      const response = await this.apiService.get('/credits/balance');
      return response.data;
    } catch (error) {
      console.error('Error fetching credit balance:', error);
      throw error;
    }
  }

  async redeemCredits(amount: number): Promise<CreditBalance> {
    try {
      const response = await this.apiService.post('/credits/redeem', { amount });
      return response.data;
    } catch (error) {
      console.error('Error redeeming credits:', error);
      throw error;
    }
  }

  // Payments
  async createPaymentIntent(amount: number, currency: string = 'USD'): Promise<PaymentIntent> {
    try {
      const response = await this.apiService.post('/payments/intent', { amount, currency });
      return response.data;
    } catch (error) {
      console.error('Error creating payment intent:', error);
      throw error;
    }
  }

  async confirmPayment(paymentIntentId: string, paymentMethodId: string): Promise<PaymentIntent> {
    try {
      const response = await this.apiService.post(`/payments/${paymentIntentId}/confirm`, {
        paymentMethodId
      });
      return response.data;
    } catch (error) {
      console.error('Error confirming payment:', error);
      throw error;
    }
  }

  async getPaymentHistory(): Promise<PaymentIntent[]> {
    try {
      const response = await this.apiService.get('/payments/history');
      return response.data;
    } catch (error) {
      console.error('Error fetching payment history:', error);
      throw error;
    }
  }

  // Offline Support
  async processOfflinePayment(paymentData: {
    amount: number;
    paymentMethodId: string;
  }): Promise<void> {
    await OfflineQueueManager.addToQueue({
      type: 'PROCESS_PAYMENT',
      payload: paymentData,
      timestamp: Date.now()
    });
  }
} 