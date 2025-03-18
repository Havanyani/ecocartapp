import { useTheme } from '@/hooks/useTheme';
import { Stack } from 'expo-router/stack';
import React from 'react';

export default function RewardsLayout() {
  const { theme } = useTheme();

  return (
    <Stack
      screenOptions={{
        headerStyle: {
          backgroundColor: theme.colors.background,
        },
        headerTintColor: theme.colors.text.primary,
        headerShadowVisible: false,
        contentStyle: {
          backgroundColor: theme.colors.background,
        },
      }}
    >
      <Stack.Screen
        name="index"
        options={{
          title: 'Rewards',
        }}
      />
      <Stack.Screen
        name="shop"
        options={{
          title: 'Rewards Shop',
        }}
      />
      <Stack.Screen
        name="history"
        options={{
          title: 'Rewards History',
        }}
      />
      <Stack.Screen
        name="redeem"
        options={{
          title: 'Redeem Points',
        }}
      />
      <Stack.Screen
        name="points"
        options={{
          title: 'Points Overview',
        }}
      />
      <Stack.Screen
        name="reward/[id]"
        options={{
          title: 'Reward Details',
        }}
      />
    </Stack>
  );
} 