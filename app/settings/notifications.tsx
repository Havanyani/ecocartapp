import React from 'react';
import { PlaceholderScreen } from '../../src/components/ui/settings/PlaceholderScreen';
import i18n from '../../src/utils/i18n';

export default function NotificationsScreen() {
  return (
    <PlaceholderScreen
      title={i18n.t('settings.notifications')}
      icon="notifications-outline"
      description={i18n.t('settings.notifications.description', { defaultValue: 'Manage your notification preferences and alerts for collections, credits, and important updates.' })}
    />
  );
} 