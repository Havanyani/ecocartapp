import { useTheme } from '@/hooks/useTheme';
import type { AppRoutePath } from '@/types/navigation';
import type { Theme } from '@/types/theme';
import { Ionicons } from '@expo/vector-icons';
import { Link, type LinkProps } from 'expo-router';
import React from 'react';
import { StyleSheet, TouchableOpacity, View } from 'react-native';
import Animated, { FadeIn } from 'react-native-reanimated';
import { ThemedText } from '@/components/ui/ThemedText';

export interface SettingsItemProps {
  title: string;
  href?: AppRoutePath;
  onPress?: () => void;
  isLast?: boolean;
  icon: keyof typeof Ionicons.glyphMap;
}

const AnimatedTouchable = Animated.createAnimatedComponent(TouchableOpacity);

export function SettingsItem({ title, href, onPress, isLast, icon }: SettingsItemProps) {
  const theme = useTheme() as Theme;

  const content = (
    <View style={[
      styles.item, 
      isLast ? null : styles.itemBorder,
      { backgroundColor: theme.colors.card }
    ]}>
      <Ionicons 
        name={icon} 
        size={22} 
        color={theme.colors.text.secondary} 
        style={styles.icon} 
      />
      <ThemedText 
        variant="primary" 
        style={[styles.itemText, { color: theme.colors.text.primary }]}
      >
        {title}
      </ThemedText>
      <Ionicons 
        name="chevron-forward" 
        size={20} 
        color={theme.colors.text.secondary} 
      />
    </View>
  );

  if (href) {
    return (
      <Link href={href as unknown as LinkProps['href']} asChild>
        <AnimatedTouchable entering={FadeIn.delay(100)}>{content}</AnimatedTouchable>
      </Link>
    );
  }

  return <AnimatedTouchable entering={FadeIn.delay(100)} onPress={onPress}>{content}</AnimatedTouchable>;
}

const styles = StyleSheet.create({
  item: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 14,
    paddingHorizontal: 16,
  },
  itemBorder: {
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderColor: '#eee',
  },
  icon: {
    marginRight: 12,
    width: 24,
    textAlign: 'center',
  },
  itemText: {
    fontSize: 16,
    flex: 1,
  },
}); 