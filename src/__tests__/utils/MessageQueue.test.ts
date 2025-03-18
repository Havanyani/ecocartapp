import AsyncStorage from '@react-native-async-storage/async-storage';
import { WebSocketService } from '../../services/WebSocketService';
import {  MessageQueue  } from '../../utils/MessageHandling';
import { PerformanceMonitor } from '../../utils/PerformanceMonitoring';

jest.mock('@react-native-async-storage/async-storage');
jest.mock('../../services/WebSocketService');
jest.mock('../../utils/Performance');

interface TestMessage {
  type: string;
  payload: { data: string };
  timestamp: number;
}

describe('MessageQueue', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    MessageQueue.reset();
  });

  it('enqueues messages correctly', async () => {
    const message: TestMessage = { type: 'test', payload: { data: 'test' }, timestamp: Date.now() };
    const mockQueue: TestMessage[] = [];
    (AsyncStorage.getItem as jest.Mock).mockResolvedValue(JSON.stringify(mockQueue));

    await MessageQueue.enqueue(message);

    const queue = await MessageQueue.getQueue();
    expect(queue).toContainEqual(expect.objectContaining({ type: 'test' }));
  });

  it('respects max queue size', async () => {
    const fullQueue = Array(100).fill({ type: 'old' });
    (AsyncStorage.getItem as jest.Mock).mockResolvedValue(JSON.stringify(fullQueue));

    const newMessage: TestMessage = { type: 'new', payload: { data: 'test' }, timestamp: Date.now() };
    await MessageQueue.enqueue(newMessage);

    const queue = await MessageQueue.getQueue();
    expect(queue.length).toBe(100);
    expect(queue[queue.length - 1].type).toBe('new');
  });

  it('processes queue when WebSocket is open', async () => {
    const message: TestMessage = { type: 'test', payload: { data: 'test' }, timestamp: Date.now() };
    await MessageQueue.enqueue(message);

    expect(WebSocketService.sendMessage).toHaveBeenCalledWith(
      'test',
      { data: 'test' }
    );
  });

  it('retries failed messages', async () => {
    const message: TestMessage = { type: 'test', payload: { data: 'test' }, timestamp: Date.now() };
    (WebSocketService.sendMessage as jest.Mock)
      .mockRejectedValueOnce(new Error('Send failed'))
      .mockResolvedValueOnce(true);

    await MessageQueue.enqueue(message);
    const queue = await MessageQueue.getQueue();
    expect(queue).toContainEqual(expect.objectContaining({ type: 'test' }));
    expect(WebSocketService.sendMessage).toHaveBeenCalledTimes(2);
    expect(PerformanceMonitor.captureError).toHaveBeenCalled();
  });

  it('clears queue successfully', async () => {
    await MessageQueue.clearQueue();
    const queue = await MessageQueue.getQueue();
    expect(queue).toHaveLength(0);
  });

  it('handles storage errors gracefully', async () => {
    (AsyncStorage.getItem as jest.Mock).mockRejectedValue(new Error('Storage error'));
    const queue = await MessageQueue.getQueue();
    
    expect(queue).toEqual([]);
    expect(PerformanceMonitor.captureError).toHaveBeenCalled();
  });

  it('handles message processing errors', async () => {
    const message: TestMessage = { type: 'test', payload: { data: 'test' }, timestamp: Date.now() };
    (WebSocketService.sendMessage as jest.Mock).mockRejectedValue(new Error('Send failed'));

    await MessageQueue.enqueue(message);
    const queue = await MessageQueue.getQueue();
    expect(PerformanceMonitor.captureError).toHaveBeenCalledWith(
      expect.any(Error)
    );
    expect(queue).toHaveLength(0);
  });
}); 