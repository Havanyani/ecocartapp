import NetInfo from '@react-native-community/netinfo';
import { useEffect, useState } from 'react';

interface OfflineState {
  isOnline: boolean;
  syncPendingActions: (syncFunction: (action: any) => Promise<void>) => Promise<void>;
  retryFailedActions: (syncFunction: (action: any) => Promise<void>) => Promise<void>;
  pendingActions: any[];
  failedActions: any[];
  failedActionsCount: number;
}

export function useOfflineState(): OfflineState {
  const [isOnline, setIsOnline] = useState(true);
  const [pendingActions, setPendingActions] = useState<any[]>([]);
  const [failedActions, setFailedActions] = useState<any[]>([]);
  const [failedActionsCount, setFailedActionsCount] = useState(0);

  useEffect(() => {
    const unsubscribe = NetInfo.addEventListener(state => {
      setIsOnline(state.isConnected ?? true);
    });

    return () => {
      unsubscribe();
    };
  }, []);

  const syncPendingActions = async (syncFunction: (action: any) => Promise<void>) => {
    if (!isOnline) return;

    const actionsToSync = [...pendingActions];
    setPendingActions([]);

    for (const action of actionsToSync) {
      try {
        await syncFunction(action);
      } catch (error) {
        console.error('Failed to sync action:', error);
        setFailedActions(prev => [...prev, action]);
        setFailedActionsCount(prev => prev + 1);
      }
    }
  };

  const retryFailedActions = async (syncFunction: (action: any) => Promise<void>) => {
    if (!isOnline) return;

    const actionsToRetry = [...failedActions];
    setFailedActions([]);
    setFailedActionsCount(0);

    for (const action of actionsToRetry) {
      try {
        await syncFunction(action);
      } catch (error) {
        console.error('Failed to retry action:', error);
        setFailedActions(prev => [...prev, action]);
        setFailedActionsCount(prev => prev + 1);
      }
    }
  };

  return {
    isOnline,
    syncPendingActions,
    retryFailedActions,
    pendingActions,
    failedActions,
    failedActionsCount,
  };
} 