import { ApiResponse, ApiService } from '@/services/ApiService';
import { Order } from '@/services/OrderService';
import { SafeStorage } from '@/utils/storage';
import NetInfo from '@react-native-community/netinfo';
import { PerformanceMonitor } from './PerformanceMonitoring';

type ActionType = 
  | 'SCHEDULE_COLLECTION'
  | 'UPDATE_WEIGHT'
  | 'SUBMIT_FEEDBACK'
  | 'CREATE_ORDER'
  | 'PROCESS_PAYMENT'
  | 'CREATE_REWARD';

interface QueueAction {
  type: ActionType;
  payload: any;
  timestamp?: number;
  retries?: number;
}

interface CollectionPayload {
  id?: string;
  weight?: number;
  schedule?: {
    date: string;
    timeSlot: string;
  };
}

interface FeedbackPayload {
  rating: number;
  comment?: string;
  collectionId: string;
}

interface OrderPayload extends Omit<Order, 'id' | 'createdAt' | 'updatedAt' | 'status'> {}

interface RewardPayload {
  weight: number;
  source: 'checkers_sixty60' | 'other';
}

interface ProcessedAction {
  success: boolean;
  action: QueueAction;
  error?: Error;
}

export class OfflineQueueManager {
  private static readonly QUEUE_KEY = '@offline_queue';
  private static readonly MAX_RETRIES = 3;
  private static apiService = ApiService.getInstance();

  static async addToQueue(action: QueueAction): Promise<void> {
    try {
      const queue = await this.getQueue();
      queue.push({
        ...action,
        timestamp: Date.now(),
        retries: 0
      });
      await SafeStorage.setItem(this.QUEUE_KEY, JSON.stringify(queue));
    } catch (error) {
      PerformanceMonitor.captureError(error instanceof Error ? error : new Error(String(error)));
    }
  }

  static async processQueue(): Promise<void> {
    const networkState = await NetInfo.fetch();
    if (!networkState.isConnected) return;

    try {
      const queue = await this.getQueue();
      if (!queue.length) return;

      const processedActions: QueueAction[] = [];
      const failedActions: QueueAction[] = [];

      for (const action of queue) {
        try {
          if (action.retries && action.retries >= this.MAX_RETRIES) {
            continue;
          }

          await this.processAction(action);
          processedActions.push(action);
        } catch (error) {
          failedActions.push({
            ...action,
            retries: (action.retries || 0) + 1
          });
          PerformanceMonitor.captureError(error instanceof Error ? error : new Error(String(error)));
        }
      }

      const newQueue = failedActions;
      await SafeStorage.setItem(this.QUEUE_KEY, JSON.stringify(newQueue));
    } catch (error) {
      PerformanceMonitor.captureError(error instanceof Error ? error : new Error(String(error)));
    }
  }

  private static async getQueue(): Promise<QueueAction[]> {
    try {
      const queue = await SafeStorage.getItem(this.QUEUE_KEY);
      return queue ? JSON.parse(queue) : [];
    } catch (error) {
      PerformanceMonitor.captureError(error instanceof Error ? error : new Error(String(error)));
      return [];
    }
  }

  private static async processAction(action: QueueAction): Promise<void> {
    let response: ApiResponse<any>;
    switch (action.type) {
      case 'SCHEDULE_COLLECTION':
        response = await this.apiService.post('/collections/schedule', action.payload as CollectionPayload);
        break;
      case 'UPDATE_WEIGHT':
        const { id, weight } = action.payload as CollectionPayload;
        response = await this.apiService.put(`/collections/${id}/weight`, { weight });
        break;
      case 'SUBMIT_FEEDBACK':
        response = await this.apiService.post('/feedback', action.payload as FeedbackPayload);
        break;
      case 'CREATE_ORDER':
        response = await this.apiService.post('/orders', action.payload as OrderPayload);
        break;
      case 'PROCESS_PAYMENT':
        response = await this.apiService.post('/payments/process', action.payload);
        break;
      case 'CREATE_REWARD':
        response = await this.apiService.post('/recycling-rewards', action.payload as RewardPayload);
        break;
      default:
        throw new Error(`Unknown action type: ${action.type}`);
    }
    return;
  }
} 