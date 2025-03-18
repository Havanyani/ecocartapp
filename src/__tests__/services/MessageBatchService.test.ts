import { MessageBatchService } from '../../services/MessageBatchService';
import { WebSocketService } from '../../services/WebSocketService';
import { PerformanceMonitor } from '../../utils/PerformanceMonitoring';

jest.mock('../../services/WebSocketService');
jest.mock('../../utils/Performance');

describe('MessageBatchService', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    MessageBatchService.clearBatch();
  });

  it('adds messages to batch', () => {
    const message = { type: 'test', payload: { data: 'test' } };
    MessageBatchService.addToBatch(message);

    expect(MessageBatchService.getBatchSize()).toBe(1);
  });

  it('sends batch when full', async () => {
    const messages = Array(MessageBatchService.MAX_BATCH_SIZE)
      .fill(null)
      .map((_, i) => ({ type: 'test', payload: { id: i } }));

    for (const message of messages) {
      await MessageBatchService.addToBatch(message);
    }

    expect(WebSocketService.sendMessage).toHaveBeenCalledWith(
      'batch',
      expect.arrayContaining(messages)
    );
  });

  it('tracks batch metrics', async () => {
    const message = { type: 'test', payload: { data: 'test' } };
    await MessageBatchService.addToBatch(message);

    expect(PerformanceMonitor.trackProcessingTime).toHaveBeenCalledWith(
      'batch_add',
      expect.any(Number)
    );
  });

  it('handles send errors', async () => {
    const error = new Error('Send failed');
    (WebSocketService.sendMessage as jest.Mock).mockRejectedValueOnce(error);

    await MessageBatchService.sendBatch();

    expect(PerformanceMonitor.captureError).toHaveBeenCalledWith(error);
  });

  it('clears batch after sending', async () => {
    const message = { type: 'test', payload: { data: 'test' } };
    await MessageBatchService.addToBatch(message);
    await MessageBatchService.sendBatch();

    expect(MessageBatchService.getBatchSize()).toBe(0);
  });
}); 