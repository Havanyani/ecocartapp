/**
 * tips.tsx
 * 
 * Community recycling tips screen that allows users to view
 * and share recycling tips with the community.
 */

import RecyclingTips from '@/components/community/RecyclingTips';
import { useTheme } from '@/hooks/useTheme';
import React from 'react';
import { StyleSheet } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

export default function CommunityTipsScreen() {
  const { theme } = useTheme();
  
  return (
    <SafeAreaView style={[styles.container, { backgroundColor: theme.colors.background }]}>
      <RecyclingTips />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
}); 