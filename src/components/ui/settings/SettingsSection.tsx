import { useTheme } from '@/hooks/useTheme';
import type { Theme } from '@/types/theme';
import React from 'react';
import { StyleSheet, View } from 'react-native';
import Animated, { FadeIn } from 'react-native-reanimated';
import { ThemedText } from '@/components/ui/ThemedText';

interface SettingsSectionProps {
  title: string;
  children: React.ReactNode;
}

export function SettingsSection({ title, children }: SettingsSectionProps) {
  const theme = useTheme() as Theme;

  return (
    <Animated.View 
      style={[styles.section, { backgroundColor: theme.colors.background }]} 
      entering={FadeIn}
    >
      <ThemedText 
        variant="secondary" 
        style={[styles.sectionTitle, { color: theme.colors.text.secondary }]}
      >
        {title}
      </ThemedText>
      <View style={[
        styles.sectionContent,
        { 
          backgroundColor: theme.colors.card,
          borderColor: theme.colors.border 
        }
      ]}>
        {children}
      </View>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  section: {
    marginTop: 24,
  },
  sectionTitle: {
    fontSize: 14,
    fontWeight: '600',
    marginBottom: 8,
    paddingHorizontal: 16,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  sectionContent: {
    borderTopWidth: StyleSheet.hairlineWidth,
    borderBottomWidth: StyleSheet.hairlineWidth,
  },
}); 