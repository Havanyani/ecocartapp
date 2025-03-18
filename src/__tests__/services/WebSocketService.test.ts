import { WebSocketService } from '../../services/WebSocketService';
import { PerformanceMonitor } from '../../utils/PerformanceMonitoring';

jest.mock('../../utils/WebSocketPerformance');

interface TestMessage {
  type: string;
  payload: { data: string };
}

describe('WebSocketService', () => {
  let mockWebSocket: WebSocket;
  const mockUrl = 'ws://test.com';

  beforeEach(() => {
    mockWebSocket = {
      readyState: WebSocket.CONNECTING,
      send: jest.fn(),
      close: jest.fn(),
      addEventListener: jest.fn(),
      removeEventListener: jest.fn(),
      onopen: null,
      onclose: null,
      onerror: null,
      onmessage: null,
      url: mockUrl,
      protocol: '',
      bufferedAmount: 0,
      extensions: '',
      binaryType: 'blob'
    } as unknown as WebSocket;

    global.WebSocket = jest.fn(() => mockWebSocket);
    jest.clearAllMocks();
  });

  describe('connection', () => {
    it('connects successfully', () => {
      WebSocketService.connect(mockUrl);
      expect(global.WebSocket).toHaveBeenCalledWith(mockUrl);
    });

    it('handles connection errors', () => {
      const mockError = new Error('Connection failed');
      (global.WebSocket as jest.Mock).mockImplementation(() => {
        throw mockError;
      });

      expect(() => WebSocketService.connect(mockUrl)).toThrow(mockError);
    });
  });

  describe('message handling', () => {
    it('sends messages correctly', () => {
      const message: TestMessage = { type: 'test', payload: { data: 'test' } };
      WebSocketService.sendMessage(message.type, message.payload);
      expect(mockWebSocket.send).toHaveBeenCalledWith(JSON.stringify(message));
    });

    it('tracks performance metrics', () => {
      const message: TestMessage = { type: 'test', payload: { data: 'test' } };
      WebSocketService.sendMessage(message.type, message.payload);
      expect(WebSocketPerformance.trackMessageLatency).toHaveBeenCalled();
    });

    it('handles message events', () => {
      const mockData = { type: 'response', payload: { data: 'test' } };
      const mockEvent = {
        data: JSON.stringify(mockData)
      };

      WebSocketService.connect(mockUrl);
      const messageHandler = (mockWebSocket.addEventListener as jest.Mock).mock.calls.find(
        call => call[0] === 'message'
      )[1];
      messageHandler(mockEvent);

      expect(WebSocketPerformance.endMessageLatency).toHaveBeenCalled();
    });
  });

  describe('disconnection', () => {
    it('closes connection properly', () => {
      WebSocketService.connect(mockUrl);
      WebSocketService.disconnect();
      expect(mockWebSocket.close).toHaveBeenCalled();
    });

    it('cleans up event listeners', () => {
      WebSocketService.connect(mockUrl);
      WebSocketService.disconnect();
      expect(mockWebSocket.removeEventListener).toHaveBeenCalled();
    });
  });

  describe('reconnection', () => {
    it('attempts to reconnect on connection loss', () => {
      WebSocketService.connect(mockUrl);
      const closeHandler = (mockWebSocket.addEventListener as jest.Mock).mock.calls.find(
        call => call[0] === 'close'
      )[1];
      closeHandler();

      expect(global.WebSocket).toHaveBeenCalledTimes(2);
    });

    it('respects max reconnection attempts', () => {
      WebSocketService.connect(mockUrl);
      for (let i = 0; i < 5; i++) {
        const closeHandler = (mockWebSocket.addEventListener as jest.Mock).mock.calls.find(
          call => call[0] === 'close'
        )[1];
        closeHandler();
      }

      expect(global.WebSocket).toHaveBeenCalledTimes(5);
    });
  });
}); 