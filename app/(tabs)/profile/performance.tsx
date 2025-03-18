import { PerformanceScreen } from '@/screens/PerformanceScreen';
import { Stack } from 'expo-router/stack';
import React from 'react';

export default function PerformancePage() {
  return (
    <>
      <Stack.Screen
        options={{
          title: 'Performance Monitor',
          headerShown: true,
        }}
      />
      <PerformanceScreen />
    </>
  );
} 