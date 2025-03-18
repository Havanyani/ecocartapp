import { act, renderHook } from '@testing-library/react-hooks';
import { useMessageBatch } from '../../hooks/useMessageBatch';
import { MessageBatchService } from '../../services/MessageBatchService';
import { PerformanceMonitor } from '../../utils/PerformanceMonitoring';
import { PerformanceMonitor } from '../../utils/PerformanceMonitoring';

jest.mock('../../services/MessageBatchService', () => ({
  MessageBatchService: {
    addToBatch: jest.fn(),
    sendBatch: jest.fn(),
    clearBatch: jest.fn(),
    getBatchSize: jest.fn(),
    setBatchSize: jest.fn(),
    setTimeout: jest.fn(),
    setErrorHandler: jest.fn()
  }
}));

jest.mock('../../utils/WebSocketPerformance', () => ({
  WebSocketPerformance: {
    trackProcessingTime: jest.fn(),
    trackBatchSize: jest.fn(),
    captureError: jest.fn()
  }
}));

jest.mock('../../utils/Performance');

const mockedMessageBatchService = MessageBatchService as jest.Mocked<typeof MessageBatchService & {
  batchQueue: any[];
  errorHandler: (error: Error) => void;
  addToBatch: (message: any) => Promise<void>;
  sendBatch: () => Promise<void>;
  clearBatch: () => void;
  getBatchSize: () => number;
  setBatchSize: (size: number) => void;
  setTimeout: (ms: number) => void;
  setErrorHandler: (handler: (error: Error) => void) => void;
}>;
const mockedWebSocketPerformance = WebSocketPerformance as jest.Mocked<typeof WebSocketPerformance>;

interface TestMessage {
  id: string;
  content: string;
  timestamp: number;
}

describe('useMessageBatch', () => {
  const mockMessages: TestMessage[] = [
    { id: '1', content: 'Message 1', timestamp: Date.now() },
    { id: '2', content: 'Message 2', timestamp: Date.now() + 1000 },
    { id: '3', content: 'Message 3', timestamp: Date.now() + 2000 }
  ];

  beforeEach(() => {
    jest.clearAllMocks();
    jest.useFakeTimers();
  });

  afterEach(() => {
    jest.useRealTimers();
  });

  it('initializes with empty batch', () => {
    const { result } = renderHook(() => useMessageBatch());
    expect(result.current.batch).toEqual([]);
    expect(result.current.isProcessing).toBe(false);
  });

  it('adds messages to batch', () => {
    const { result } = renderHook(() => useMessageBatch());

    act(() => {
      result.current.addToBatch(mockMessages[0]);
    });

    expect(result.current.batch).toHaveLength(1);
    expect(result.current.batch[0]).toEqual(mockMessages[0]);
  });

  it('processes batch when size limit is reached', () => {
    const { result } = renderHook(() => useMessageBatch({ batchSize: 2 }));

    act(() => {
      result.current.addToBatch(mockMessages[0]);
      result.current.addToBatch(mockMessages[1]);
    });

    expect(result.current.isProcessing).toBe(true);
    expect(result.current.batch).toHaveLength(0);
  });

  it('processes batch after timeout', () => {
    const { result } = renderHook(() => useMessageBatch({ timeout: 1000 }));

    act(() => {
      result.current.addToBatch(mockMessages[0]);
    });

    act(() => {
      jest.advanceTimersByTime(1000);
    });

    expect(result.current.isProcessing).toBe(true);
    expect(result.current.batch).toHaveLength(0);
  });

  it('handles processing errors', async () => {
    const mockError = new Error('Processing failed');
    const { result } = renderHook(() => useMessageBatch({
      onProcess: async () => { throw mockError; }
    }));

    act(() => {
      result.current.addToBatch(mockMessages[0]);
    });

    await act(async () => {
      await result.current.processBatch();
    });

    expect(result.current.error).toBe(mockError);
    expect(result.current.isProcessing).toBe(false);
  });

  it('clears batch on unmount', () => {
    const { unmount } = renderHook(() => useMessageBatch());

    act(() => {
      result.current.addToBatch(mockMessages[0]);
    });

    unmount();
    expect(result.current.batch).toHaveLength(0);
  });

  it('adds messages to batch and tracks metrics', async () => {
    const { result } = renderHook(() => useMessageBatch());
    const message = { type: 'test', payload: { data: 'test' } };

    await act(async () => {
      await result.current.addMessage(message);
    });

    expect(mockedMessageBatchService.addToBatch).toHaveBeenCalledWith(message);
    expect(mockedWebSocketPerformance.trackBatchSize).toHaveBeenCalledWith(
      expect.any(Number)
    );
    expect(mockedWebSocketPerformance.trackProcessingTime).toHaveBeenCalledWith(
      'batch_add',
      expect.any(Number)
    );
  });

  it('flushes batch correctly', async () => {
    const { result } = renderHook(() => useMessageBatch());
    const startTime = Date.now();
    jest.setSystemTime(startTime);

    await act(async () => {
      await result.current.flushBatch();
    });

    expect(mockedMessageBatchService.sendBatch).toHaveBeenCalled();
  });

  it('handles batch errors gracefully', async () => {
    const { result } = renderHook(() => useMessageBatch());
    const error = new Error('Batch error');
    mockedMessageBatchService.addToBatch.mockRejectedValue(error);

    await act(async () => {
      await result.current.addMessage({ type: 'test', payload: {} });
    });

    expect(PerformanceMonitor.captureError).toHaveBeenCalledWith(error);
  });
}); 