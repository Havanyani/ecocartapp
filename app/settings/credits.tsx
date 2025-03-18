import React from 'react';
import { PlaceholderScreen } from '../../src/components/ui/settings/PlaceholderScreen';
import i18n from '../../src/utils/i18n';

export default function CreditsScreen() {
  return (
    <PlaceholderScreen
      title={i18n.t('settings.credits')}
      icon="wallet-outline"
      description={i18n.t('settings.credits.description', { defaultValue: 'Manage your EcoCart credits and view transaction history.' })}
    />
  );
} 