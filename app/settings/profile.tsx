import React from 'react';
import { PlaceholderScreen } from '../../src/components/ui/settings/PlaceholderScreen';
import i18n from '../../src/utils/i18n';

export default function ProfileScreen() {
  return (
    <PlaceholderScreen
      title={i18n.t('settings.profile')}
      icon="person-outline"
      description={i18n.t('settings.profile.description', { defaultValue: 'Update your personal information and account preferences.' })}
    />
  );
} 