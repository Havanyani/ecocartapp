import React from 'react';
import { PlaceholderScreen } from '../../src/components/ui/settings/PlaceholderScreen';
import i18n from '../../src/utils/i18n';

export default function RemindersScreen() {
  return (
    <PlaceholderScreen
      title={i18n.t('settings.reminders')}
      icon="alarm-outline"
      description={i18n.t('settings.reminders.description', { defaultValue: 'Set up reminders for collections, credits, and other important events.' })}
    />
  );
} 