import { NotificationPreferences, notificationService } from '@/services/NotificationService';
import { webSocketService } from '@/services/WebSocketService';
import { useEffect, useState } from 'react';

export function useDeliveryNotifications(personnelId: string) {
  const [preferences, setPreferences] = useState<NotificationPreferences>({
    deliveryStatusUpdates: true,
    locationUpdates: false,
    routeChanges: true,
    collectionUpdates: true,
  });

  useEffect(() => {
    // Subscribe to WebSocket updates for this delivery personnel
    webSocketService.subscribeToDeliveryPersonnel(personnelId);

    // Cleanup subscription on unmount
    return () => {
      webSocketService.unsubscribeFromDeliveryPersonnel(personnelId);
    };
  }, [personnelId]);

  const updatePreferences = async (newPreferences: Partial<NotificationPreferences>) => {
    try {
      await notificationService.updatePreferences(newPreferences);
      setPreferences(prev => ({ ...prev, ...newPreferences }));
    } catch (error) {
      console.error('Failed to update notification preferences:', error);
    }
  };

  const togglePreference = async (key: keyof NotificationPreferences) => {
    await updatePreferences({
      [key]: !preferences[key],
    });
  };

  return {
    preferences,
    updatePreferences,
    togglePreference,
  };
} 