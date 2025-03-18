import React from 'react';
import { PlaceholderScreen } from '../../src/components/ui/settings/PlaceholderScreen';
import i18n from '../../src/utils/i18n';

export default function EnvironmentalScreen() {
  return (
    <PlaceholderScreen
      title={i18n.t('settings.environmental')}
      icon="leaf-outline"
      description={i18n.t('settings.environmental.description', { defaultValue: 'Track your environmental impact and view sustainability metrics.' })}
    />
  );
} 