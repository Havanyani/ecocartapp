import AsyncStorage from '@react-native-async-storage/async-storage';
import { WebSocketService } from '../../services/WebSocketService';
import {  MessageQueue  } from '../../utils/MessageHandling';
import { PerformanceMonitor } from '../../utils/PerformanceMonitoring';

jest.mock('@react-native-async-storage/async-storage');
jest.mock('../../services/WebSocketService');
jest.mock('../../utils/Performance');

describe('MessageQueue', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    MessageQueue.queue = [];
    MessageQueue.isProcessing = false;
  });

  it('enqueues messages correctly', async () => {
    const message = { type: 'test', payload: { data: 'test' } };
    const mockQueue = [];
    AsyncStorage.getItem.mockResolvedValue(JSON.stringify(mockQueue));

    await MessageQueue.enqueue(message);

    expect(AsyncStorage.setItem).toHaveBeenCalledWith(
      MessageQueue.QUEUE_KEY,
      expect.stringContaining('"type":"test"')
    );
  });

  it('respects max queue size', async () => {
    const fullQueue = Array(MessageQueue.MAX_QUEUE_SIZE).fill({ type: 'old' });
    AsyncStorage.getItem.mockResolvedValue(JSON.stringify(fullQueue));

    const newMessage = { type: 'new', payload: { data: 'test' } };
    await MessageQueue.enqueue(newMessage);

    const setItemCall = AsyncStorage.setItem.mock.calls[0][1];
    const savedQueue = JSON.parse(setItemCall);
    expect(savedQueue.length).toBe(MessageQueue.MAX_QUEUE_SIZE);
    expect(savedQueue[savedQueue.length - 1].type).toBe('new');
  });

  it('processes queue when WebSocket is open', async () => {
    WebSocketService.ws = { readyState: WebSocket.OPEN };
    const message = { type: 'test', payload: { data: 'test' } };

    await MessageQueue.enqueue(message);

    expect(WebSocketService.sendMessage).toHaveBeenCalledWith(
      'test',
      { data: 'test' }
    );
  });

  it('retries failed messages', async () => {
    const message = { type: 'test', payload: { data: 'test' } };
    WebSocketService.sendMessage.mockRejectedValueOnce(new Error('Send failed'))
      .mockResolvedValueOnce(true);

    MessageQueue.queue = [{ ...message, retries: 0 }];
    await MessageQueue._processQueue();

    expect(WebSocketService.sendMessage).toHaveBeenCalledTimes(2);
    expect(PerformanceMonitor.captureError).toHaveBeenCalled();
  });

  it('clears queue successfully', async () => {
    await MessageQueue.clearQueue();
    expect(AsyncStorage.removeItem).toHaveBeenCalledWith(MessageQueue.QUEUE_KEY);
  });

  it('handles storage errors gracefully', async () => {
    AsyncStorage.getItem.mockRejectedValue(new Error('Storage error'));
    const queue = await MessageQueue.getQueue();
    
    expect(queue).toEqual([]);
    expect(PerformanceMonitor.captureError).toHaveBeenCalled();
  });

  it('handles message processing errors', async () => {
    const message = { type: 'test', payload: { data: 'test' } };
    WebSocketService.sendMessage.mockRejectedValue(new Error('Send failed'));

    MessageQueue.queue = [{ ...message, retries: MessageQueue.maxRetries }];
    await MessageQueue._processQueue();

    expect(PerformanceMonitor.captureError).toHaveBeenCalledWith(
      expect.any(Error)
    );
    expect(MessageQueue.queue).toHaveLength(0);
  });
}); 