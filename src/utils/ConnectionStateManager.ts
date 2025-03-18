import { WebSocketService } from '@/services/WebSocketService';
import NetInfo, { NetInfoState } from '@react-native-community/netinfo';
import { PerformanceMonitor } from './PerformanceMonitoring';

export interface ConnectionState {
  isConnected: boolean;
  isWebSocketConnected: boolean;
  lastConnected: number;
  latency: number;
}

type ConnectionStateListener = (state: ConnectionState) => void;

export class ConnectionStateManager {
  private static listeners = new Set<ConnectionStateListener>();
  private static pingInterval: NodeJS.Timeout | null = null;

  static currentState: ConnectionState = {
    isConnected: true,
    isWebSocketConnected: false,
    lastConnected: Date.now(),
    latency: 0,
  };

  static initialize() {
    // Monitor internet connectivity
    NetInfo.addEventListener((state: NetInfoState) => {
      this.handleConnectivityChange(state.isConnected ?? false);
    });

    // Monitor WebSocket state
    this.startWebSocketMonitoring();
  }

  static handleConnectivityChange(isConnected: boolean) {
    this.currentState = {
      ...this.currentState,
      isConnected,
      lastConnected: isConnected ? Date.now() : this.currentState.lastConnected,
    };
    this.notifyListeners();
  }

  static updateWebSocketState(isConnected: boolean) {
    this.currentState = {
      ...this.currentState,
      isWebSocketConnected: isConnected,
    };
    this.notifyListeners();
  }

  static subscribe(callback: ConnectionStateListener) {
    this.listeners.add(callback);
    callback(this.currentState);

    return () => {
      this.listeners.delete(callback);
    };
  }

  static async measureLatency(): Promise<number> {
    if (!this.currentState.isConnected) return 0;

    const start = Date.now();
    try {
      await fetch('https://api.ecocart.com/ping');
      return Date.now() - start;
    } catch (error) {
      if (error instanceof Error) {
        PerformanceMonitor.captureError(error);
      }
      return 0;
    }
  }

  static async reconnect(): Promise<void> {
    if (!this.currentState.isConnected) {
      const netInfo = await NetInfo.fetch();
      if (!netInfo.isConnected) {
        throw new Error('No internet connection available');
      }
    }

    if (WebSocketService.isConnected()) {
      WebSocketService.disconnect();
    }

    await WebSocketService.connect('wss://api.ecocart.com/ws');
  }

  private static notifyListeners() {
    this.listeners.forEach(listener => {
      try {
        listener(this.currentState);
      } catch (error) {
        if (error instanceof Error) {
          PerformanceMonitor.captureError(error);
        }
      }
    });
  }

  private static startWebSocketMonitoring() {
    setInterval(() => {
      const isConnected = WebSocketService.isConnected();
      if (isConnected !== this.currentState.isWebSocketConnected) {
        this.updateWebSocketState(isConnected);
      }
    }, 5000);
  }
} 