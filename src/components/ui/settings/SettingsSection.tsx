import { ThemedText } from '@/components/ui/ThemedText';
import { useTheme } from '@/theme';
import React from 'react';
import { StyleSheet, View } from 'react-native';
import Animated, { FadeIn } from 'react-native-reanimated';

interface SettingsSectionProps {
  title: string;
  children: React.ReactNode;
}

export function SettingsSection({ title, children }: SettingsSectionProps) {
  const theme = useTheme()()();

  return (
    <Animated.View 
      style={[styles.section, { backgroundColor: theme.colors.background }]} 
      entering={FadeIn}
    >
      <ThemedText 
        variant="secondary" 
        style={[styles.sectionTitle, { color: theme.colors.textSecondary }]}
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