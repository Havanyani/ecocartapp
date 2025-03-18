import { useCallback, useEffect } from 'react';
import { MessageBatchService } from '@/services/MessageBatchService';
import { PerformanceMonitor } from '@/utils/PerformanceMonitoring';
import { PerformanceMonitor } from '@/utils/PerformanceMonitoring';

interface MessageBatchOptions {
  batchSize?: number;
  timeout?: number;
  onBatchSent?: (duration: number) => void;
  onError?: (error: Error) => void;
}

interface MessageBatchHook {
  addMessage: (message: Record<string, any>) => Promise<void>;
  flushBatch: () => Promise<void>;
}

export function useMessageBatch(options: MessageBatchOptions = {}): MessageBatchHook {
  const {
    batchSize = 10,
    timeout = 1000,
    onBatchSent,
    onError
  } = options;

  useEffect(() => {
    try {
      MessageBatchService.setBatchSize(batchSize);
      MessageBatchService.setTimeout(timeout);
    } catch (error) {
      PerformanceMonitor.captureError(error instanceof Error ? error : new Error('Failed to set batch options'));
    }
  }, [batchSize, timeout]);

  const addMessage = useCallback(async (message: Record<string, any>): Promise<void> => {
    try {
      const startTime = performance.now();
      await MessageBatchService.addToBatch(message);
      
      WebSocketPerformance.trackProcessingTime(
        'batch_add',
        performance.now() - startTime
      );
    } catch (error) {
      onError?.(error instanceof Error ? error : new Error('Failed to add message'));
      PerformanceMonitor.captureError(error instanceof Error ? error : new Error('Failed to add message'));
    }
  }, [onError]);

  const flushBatch = useCallback(async (): Promise<void> => {
    try {
      const startTime = performance.now();
      await MessageBatchService.sendBatch();
      
      const duration = performance.now() - startTime;
      WebSocketPerformance.trackProcessingTime('batch_send', duration);
      onBatchSent?.(duration);
    } catch (error) {
      onError?.(error instanceof Error ? error : new Error('Failed to flush batch'));
      PerformanceMonitor.captureError(error instanceof Error ? error : new Error('Failed to flush batch'));
    }
  }, [onBatchSent, onError]);

  return {
    addMessage,
    flushBatch
  };
} 