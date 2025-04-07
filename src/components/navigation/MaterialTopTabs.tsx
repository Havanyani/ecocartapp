import { createMaterialTopTabNavigator } from '@react-navigation/material-top-tabs';
import React from 'react';
import { useTheme } from '../../contexts/ThemeContext';

const Tab = createMaterialTopTabNavigator();

interface TabScreen {
  name: string;
  component: () => JSX.Element;
}

interface MaterialTopTabsProps {
  screens: TabScreen[];
}

export function MaterialTopTabs({ screens }: MaterialTopTabsProps) {
  const { theme } = useTheme();

  return (
    <Tab.Navigator
      screenOptions={{
        tabBarStyle: {
          backgroundColor: theme.colors.surface,
        },
        tabBarIndicatorStyle: {
          backgroundColor: theme.colors.primary,
        },
        tabBarActiveTintColor: theme.colors.primary,
        tabBarInactiveTintColor: theme.colors.textSecondary,
        tabBarLabelStyle: {
          textTransform: 'none',
          fontSize: 14,
          fontWeight: '600',
        },
      }}
    >
      {screens.map((screen) => (
        <Tab.Screen
          key={screen.name}
          name={screen.name}
          component={screen.component}
        />
      ))}
    </Tab.Navigator>
  );
} 