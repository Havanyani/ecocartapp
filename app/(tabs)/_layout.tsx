import { MaterialIcons } from '@expo/vector-icons';
import { Tabs } from 'expo-router';
import { ComponentProps } from 'react';
import { useTheme } from '../../src/contexts/ThemeContext';

interface TabBarIconProps {
  color: string;
  size: number;
}

// Fix type issues by explicitly declaring Tabs with Screen property
type TabsComponentType = typeof Tabs & {
  Screen: React.ComponentType<ComponentProps<typeof Tabs.Screen>>;
};

// Cast Tabs to the correct type
const TypedTabs = Tabs as TabsComponentType;

export default function TabLayout() {
  const { theme } = useTheme();

  return (
    <TypedTabs
      screenOptions={{
        tabBarActiveTintColor: theme.colors.primary,
        tabBarInactiveTintColor: theme.colors.textSecondary,
        tabBarStyle: {
          backgroundColor: theme.colors.surface,
        },
        headerStyle: {
          backgroundColor: theme.colors.surface,
        },
        headerTintColor: theme.colors.text,
      }}
    >
      <TypedTabs.Screen
        name="index"
        options={{
          title: 'Home',
          tabBarIcon: ({ color, size }: TabBarIconProps) => (
            <MaterialIcons name="home" size={size} color={color} />
          ),
        }}
      />
      <TypedTabs.Screen
        name="materials"
        options={{
          title: 'Materials',
          tabBarIcon: ({ color, size }: TabBarIconProps) => (
            <MaterialIcons name="recycling" size={size} color={color} />
          ),
        }}
      />
      <TypedTabs.Screen
        name="collections"
        options={{
          title: 'Collections',
          tabBarIcon: ({ color, size }: TabBarIconProps) => (
            <MaterialIcons name="collections" size={size} color={color} />
          ),
        }}
      />
      <TypedTabs.Screen
        name="community"
        options={{
          title: 'Community',
          tabBarIcon: ({ color, size }: TabBarIconProps) => (
            <MaterialIcons name="people" size={size} color={color} />
          ),
        }}
      />
      <TypedTabs.Screen
        name="profile"
        options={{
          title: 'Profile',
          tabBarIcon: ({ color, size }: TabBarIconProps) => (
            <MaterialIcons name="person" size={size} color={color} />
          ),
        }}
      />
    </TypedTabs>
  );
} 