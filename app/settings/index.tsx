import { SettingsItem } from '@/components/ui/settings/SettingsItem';
import { SettingsSection } from '@/components/ui/settings/SettingsSection';
import { useTheme } from '@/hooks/useTheme';
import i18n from '@/utils/i18n';
import React from 'react';
import { ScrollView, StyleSheet } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

export default function SettingsScreen() {
  const { theme } = useTheme();

  return (
    <SafeAreaView 
      style={[styles.container, { backgroundColor: theme.colors.background }]} 
      edges={['bottom']}
    >
      <ScrollView>
        <SettingsSection title={i18n.t('settings.preferences')}>
          <SettingsItem 
            title={i18n.t('settings.language')} 
            href="/settings/translations"
            icon="language-outline"
          />
          <SettingsItem 
            title={i18n.t('settings.notifications')} 
            href="/settings/notifications"
            icon="notifications-outline"
            isLast 
          />
        </SettingsSection>

        <SettingsSection title={i18n.t('settings.collection')}>
          <SettingsItem 
            title={i18n.t('settings.schedule')} 
            href="/settings/schedule"
            icon="calendar-outline"
          />
          <SettingsItem 
            title={i18n.t('settings.reminders')} 
            href="/settings/reminders"
            icon="alarm-outline"
            isLast 
          />
        </SettingsSection>

        <SettingsSection title={i18n.t('settings.account')}>
          <SettingsItem 
            title={i18n.t('settings.profile')} 
            href="/settings/profile"
            icon="person-outline"
          />
          <SettingsItem 
            title={i18n.t('settings.environmental')} 
            href="/settings/environmental"
            icon="leaf-outline"
          />
          <SettingsItem 
            title={i18n.t('settings.credits')} 
            href="/settings/credits"
            icon="wallet-outline"
            isLast 
          />
        </SettingsSection>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
}); 