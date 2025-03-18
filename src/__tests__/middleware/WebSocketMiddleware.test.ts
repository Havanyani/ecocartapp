import { createWebSocketMiddleware } from '../../middleware/WebSocketMiddleware';
import {  MessageCompression  } from '../../utils/MessageHandling';
import {  MessageEncryption  } from '../../utils/MessageHandling';
import {  MessageValidation  } from '../../utils/MessageHandling';

jest.mock('../../utils/MessageCompression');
jest.mock('../../utils/MessageEncryption');
jest.mock('../../utils/MessageValidation');

describe('WebSocketMiddleware', () => {
  const mockStore = {
    dispatch: jest.fn(),
    getState: jest.fn()
  };

  const mockNext = jest.fn();
  const mockConfig = {
    url: 'ws://test.com',
    reconnectInterval: 1000,
    maxReconnectAttempts: 3
  };

  let middleware: ReturnType<typeof createWebSocketMiddleware>;

  beforeEach(() => {
    jest.clearAllMocks();
    middleware = createWebSocketMiddleware(mockConfig);
  });

  it('should process outgoing messages correctly', async () => {
    const mockMessage = {
      type: 'test',
      payload: { data: 'test' }
    };

    (MessageValidation.validateOutgoing as jest.Mock).mockResolvedValue(true);
    (MessageCompression.compress as jest.Mock).mockResolvedValue('compressed');
    (MessageEncryption.encrypt as jest.Mock).mockResolvedValue('encrypted');

    const action = {
      type: 'websocket/send',
      payload: mockMessage
    };

    await middleware(mockStore)(mockNext)(action);

    expect(MessageValidation.validateOutgoing).toHaveBeenCalledWith(mockMessage);
    expect(MessageCompression.compress).toHaveBeenCalled();
    expect(MessageEncryption.encrypt).toHaveBeenCalled();
    expect(mockNext).toHaveBeenCalledWith(action);
  });

  it('should process incoming messages correctly', async () => {
    const mockData = 'encrypted';
    const mockDecrypted = 'decrypted';
    const mockDecompressed = JSON.stringify({
      type: 'test',
      payload: { data: 'test' },
      timestamp: Date.now()
    });

    (MessageEncryption.decrypt as jest.Mock).mockResolvedValue(mockDecrypted);
    (MessageCompression.decompress as jest.Mock).mockResolvedValue(mockDecompressed);
    (MessageValidation.validateIncoming as jest.Mock).mockResolvedValue(true);

    // Create a mock WebSocket message event
    const mockMessageEvent = new MessageEvent('message', {
      data: mockData
    });

    // Simulate WebSocket connection
    const connectAction = { type: 'websocket/connect' };
    await middleware(mockStore)(mockNext)(connectAction);

    // Get the WebSocket instance and trigger onmessage
    const socket = (middleware as any).state?.socket;
    if (socket && socket.onmessage) {
      await socket.onmessage(mockMessageEvent);
    }

    expect(MessageEncryption.decrypt).toHaveBeenCalledWith(mockData);
    expect(MessageCompression.decompress).toHaveBeenCalledWith(mockDecrypted);
    expect(MessageValidation.validateIncoming).toHaveBeenCalled();
  });

  it('should handle connection errors', async () => {
    const connectAction = { type: 'websocket/connect' };
    await middleware(mockStore)(mockNext)(connectAction);

    // Get the WebSocket instance and trigger onerror
    const socket = (middleware as any).state?.socket;
    if (socket && socket.onerror) {
      const mockError = new Error('WebSocket error');
      socket.onerror(mockError);
    }

    expect(mockStore.dispatch).toHaveBeenCalledWith({
      type: 'websocket/error',
      payload: expect.any(Error)
    });
  });

  it('should handle reconnection', async () => {
    const connectAction = { type: 'websocket/connect' };
    await middleware(mockStore)(mockNext)(connectAction);

    // Get the WebSocket instance and trigger onclose
    const socket = (middleware as any).state?.socket;
    if (socket && socket.onclose) {
      socket.onclose();
    }

    expect(mockStore.dispatch).toHaveBeenCalledWith({
      type: 'websocket/disconnected'
    });

    // Wait for reconnect attempt
    await new Promise(resolve => setTimeout(resolve, mockConfig.reconnectInterval));

    expect(mockStore.dispatch).toHaveBeenCalledWith({
      type: 'websocket/connected'
    });
  });
}); 