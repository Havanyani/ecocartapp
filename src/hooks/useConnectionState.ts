import { useEffect, useState } from 'react';
import { ConnectionStateManager } from '@/utils/ConnectionStateManager';
import { PerformanceMonitor } from '@/utils/PerformanceMonitoring';

interface ConnectionState {
  isConnected: boolean;
  isWebSocketConnected: boolean;
  lastConnected: number;
  latency: number;
}

export function useConnectionState() {
  const [connectionState, setConnectionState] = useState<ConnectionState>({
    ...ConnectionStateManager.currentState,
    latency: 0,
  });

  useEffect(() => {
    try {
      const unsubscribe = ConnectionStateManager.subscribe(setConnectionState);
      
      // Start latency monitoring
      const latencyInterval = setInterval(() => {
        if (connectionState.isConnected) {
          ConnectionStateManager.measureLatency().then(latency => {
            setConnectionState(prev => ({ ...prev, latency }));
          });
        }
      }, 5000);

      return () => {
        unsubscribe();
        clearInterval(latencyInterval);
      };
    } catch (error) {
      PerformanceMonitor.captureError(error);
    }
  }, [connectionState.isConnected]);

  const reconnect = async () => {
    try {
      await ConnectionStateManager.reconnect();
    } catch (error) {
      PerformanceMonitor.captureError(error);
    }
  };

  return {
    ...connectionState,
    reconnect,
  };
} 