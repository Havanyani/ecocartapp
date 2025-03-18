import React from 'react';
import { PlaceholderScreen } from '../../src/components/ui/settings/PlaceholderScreen';
import i18n from '../../src/utils/i18n';

export default function ScheduleScreen() {
  return (
    <PlaceholderScreen
      title={i18n.t('settings.schedule')}
      icon="calendar-outline"
      description={i18n.t('settings.schedule.description', { defaultValue: 'View and manage your collection schedule and availability.' })}
    />
  );
} 