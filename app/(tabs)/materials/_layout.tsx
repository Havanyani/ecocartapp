import { useTheme } from '@/hooks/useTheme';
import { Stack } from 'expo-router/stack';
import React from 'react';

export default function MaterialsLayout() {
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
          title: 'Materials',
        }}
      />
      <Stack.Screen
        name="categories"
        options={{
          title: 'Categories',
        }}
      />
      <Stack.Screen
        name="search"
        options={{
          title: 'Search Materials',
        }}
      />
      <Stack.Screen
        name="[id]"
        options={{
          title: 'Material Details',
        }}
      />
    </Stack>
  );
} 