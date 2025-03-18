import { Tabs } from 'expo-router';
import React from 'react';
import { IconSymbol } from '../../../src/components/ui/IconSymbol';

export default function AnalyticsLayout() {
  return (
    <Tabs
      screenOptions={{
        tabBarStyle: { backgroundColor: '#fff' },
        tabBarLabelStyle: { fontSize: 12, fontWeight: '600' },
      }}
    >
      <Tabs.Screen
        name="index"
        options={{
          title: 'Overview',
          tabBarIcon: ({ color }) => <IconSymbol name="chart-box" color={color} size={24} />,
        }}
      />
      <Tabs.Screen
        name="collection"
        options={{
          title: 'Collection',
          tabBarIcon: ({ color }) => <IconSymbol name="recycle" color={color} size={24} />,
        }}
      />
      <Tabs.Screen
        name="credits"
        options={{
          title: 'Credits',
          tabBarIcon: ({ color }) => <IconSymbol name="cash" color={color} size={24} />,
        }}
      />
      <Tabs.Screen
        name="environmental"
        options={{
          title: 'Environmental',
          tabBarIcon: ({ color }) => <IconSymbol name="leaf" color={color} size={24} />,
        }}
      />
    </Tabs>
  );
} 