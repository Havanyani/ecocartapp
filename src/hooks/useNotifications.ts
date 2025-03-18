import * as Notifications from 'expo-notifications';
import { useCallback } from 'react';

interface UseNotificationsReturn {
  requestNotificationPermission: () => Promise<boolean>;
}

export function useNotifications(): UseNotificationsReturn {
  const requestNotificationPermission = useCallback(async (): Promise<boolean> => {
    const { status } = await Notifications.requestPermissionsAsync();
    return status === 'granted';
  }, []);

  return {
    requestNotificationPermission,
  };
} 