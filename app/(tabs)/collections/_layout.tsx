import { useTheme } from '@/hooks/useTheme';
import { Stack } from 'expo-router/stack';
import React from 'react';

export default function CollectionsLayout() {
  const { colors } = useTheme();

  return (
    <Stack
      screenOptions={{
        headerStyle: {
          backgroundColor: colors.background,
        },
        headerTintColor: colors.text.primary,
        headerShadowVisible: false,
        contentStyle: {
          backgroundColor: colors.background,
        },
      }}
    >
      <Stack.Screen
        name="index"
        options={{
          title: 'Collections',
        }}
      />
      <Stack.Screen
        name="schedule"
        options={{
          title: 'Collection Schedule',
        }}
      />
      <Stack.Screen
        name="history"
        options={{
          title: 'Collection History',
        }}
      />
      <Stack.Screen
        name="[id]"
        options={{
          title: 'Collection Details',
        }}
      />
      <Stack.Screen
        name="new"
        options={{
          title: 'New Collection',
        }}
      />
      <Stack.Screen
        name="tracking"
        options={{
          title: 'Track Collection',
        }}
      />
    </Stack>
  );
} 