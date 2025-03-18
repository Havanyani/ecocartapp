import { useTheme } from '@/hooks/useTheme';
import { Stack } from 'expo-router/stack';
import React from 'react';
import { View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

export default function SettingsLayout() {
  const { theme } = useTheme();
  const insets = useSafeAreaInsets();

  return (
    <View
      style={{
        flex: 1,
        backgroundColor: theme.colors.background,
        paddingTop: insets.top,
      }}
    >
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
            title: 'Settings',
          }}
        />
        <Stack.Screen
          name="translations"
          options={{
            title: 'Language & Translations',
          }}
        />
        <Stack.Screen
          name="notifications"
          options={{
            title: 'Notifications',
          }}
        />
        <Stack.Screen
          name="schedule"
          options={{
            title: 'Schedule',
          }}
        />
        <Stack.Screen
          name="reminders"
          options={{
            title: 'Reminders',
          }}
        />
        <Stack.Screen
          name="profile"
          options={{
            title: 'Profile Settings',
          }}
        />
        <Stack.Screen
          name="environmental"
          options={{
            title: 'Environmental Impact',
          }}
        />
        <Stack.Screen
          name="credits"
          options={{
            title: 'EcoCart Credits',
          }}
        />
      </Stack>
    </View>
  );
} 