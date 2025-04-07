/**
 * components.tsx
 * 
 * Showcase screen for all our cross-platform UI components.
 */

import { Stack } from 'expo-router';
import * as React from 'react';
import { ComponentsShowcase } from '../src/components/ComponentsShowcase';

export default function ComponentsScreen() {
  return (
    <>
      <Stack.Screen 
        options={{ 
          title: 'UI Components',
          headerBackTitle: 'Back',
        }} 
      />
      <ComponentsShowcase />
    </>
  );
} 