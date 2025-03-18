import { AnalyticsService } from '../../services/AnalyticsService';
import { WebSocketAnalytics } from '../../services/WebSocketAnalytics';

jest.mock('../../services/AnalyticsService', () => ({
  trackEvent: jest.fn(),
  trackError: jest.fn()
}));

describe('WebSocketAnalytics', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('message tracking', () => {
    it('tracks sent messages correctly', () => {
      const message = {
        type: 'TEST_MESSAGE',
        size: 100
      };

      WebSocketAnalytics.trackMessageSent(message);

      expect(AnalyticsService.trackEvent).toHaveBeenCalledWith(
        'WebSocket',
        'MessageSent',
        message.type,
        message.size
      );
    });

    it('tracks received messages correctly', () => {
      const message = {
        type: 'TEST_MESSAGE',
        size: 150
      };

      WebSocketAnalytics.trackMessageReceived(message);

      expect(AnalyticsService.trackEvent).toHaveBeenCalledWith(
        'WebSocket',
        'MessageReceived',
        message.type,
        message.size
      );
    });

    it('handles messages with missing size', () => {
      const message = {
        type: 'TEST_MESSAGE',
        size: 0
      };

      WebSocketAnalytics.trackMessageSent(message);

      expect(AnalyticsService.trackEvent).toHaveBeenCalledWith(
        'WebSocket',
        'MessageSent',
        message.type,
        0
      );
    });
  });

  describe('connection tracking', () => {
    it('tracks connections', () => {
      WebSocketAnalytics.trackConnection();

      expect(AnalyticsService.trackEvent).toHaveBeenCalledWith(
        'WebSocket',
        'Connected',
        null,
        null
      );
    });

    it('tracks disconnections with reason', () => {
      const reason = 'timeout';
      WebSocketAnalytics.trackDisconnection(reason);

      expect(AnalyticsService.trackEvent).toHaveBeenCalledWith(
        'WebSocket',
        'Disconnected',
        reason,
        null
      );
    });

    it('tracks disconnections without reason', () => {
      WebSocketAnalytics.trackDisconnection();

      expect(AnalyticsService.trackEvent).toHaveBeenCalledWith(
        'WebSocket',
        'Disconnected',
        null,
        null
      );
    });

    it('tracks reconnection attempts', () => {
      const attemptNumber = 3;
      WebSocketAnalytics.trackReconnectAttempt(attemptNumber);

      expect(AnalyticsService.trackEvent).toHaveBeenCalledWith(
        'WebSocket',
        'ReconnectAttempt',
        null,
        attemptNumber
      );
    });
  });

  describe('error handling', () => {
    it('handles analytics service errors gracefully', () => {
      const consoleError = jest.spyOn(console, 'error').mockImplementation();
      (AnalyticsService.trackEvent as jest.Mock).mockImplementation(() => {
        throw new Error('Analytics error');
      });

      expect(() => {
        WebSocketAnalytics.trackConnection();
      }).not.toThrow();

      consoleError.mockRestore();
    });
  });

  describe('edge cases', () => {
    it('handles undefined message type', () => {
      const message = {
        type: undefined as unknown as string,
        size: 100
      };

      WebSocketAnalytics.trackMessageSent(message);

      expect(AnalyticsService.trackEvent).toHaveBeenCalledWith(
        'WebSocket',
        'MessageSent',
        undefined,
        100
      );
    });

    it('handles zero reconnection attempt number', () => {
      WebSocketAnalytics.trackReconnectAttempt(0);

      expect(AnalyticsService.trackEvent).toHaveBeenCalledWith(
        'WebSocket',
        'ReconnectAttempt',
        null,
        0
      );
    });
  });
}); 