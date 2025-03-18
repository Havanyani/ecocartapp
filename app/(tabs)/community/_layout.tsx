import { useTheme } from '@/hooks/useTheme';
import { Stack } from 'expo-router/stack';
import React from 'react';

export default function CommunityLayout() {
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
          title: 'Community',
        }}
      />
      <Stack.Screen
        name="events"
        options={{
          title: 'Events',
        }}
      />
      <Stack.Screen
        name="challenges"
        options={{
          title: 'Challenges',
        }}
      />
      <Stack.Screen
        name="leaderboard"
        options={{
          title: 'Leaderboard',
        }}
      />
      <Stack.Screen
        name="groups"
        options={{
          title: 'Groups',
        }}
      />
      <Stack.Screen
        name="group/[id]"
        options={{
          title: 'Group Details',
        }}
      />
      <Stack.Screen
        name="challenge/[id]"
        options={{
          title: 'Challenge Details',
        }}
      />
      <Stack.Screen
        name="event/[id]"
        options={{
          title: 'Event Details',
        }}
      />
    </Stack>
  );
} 