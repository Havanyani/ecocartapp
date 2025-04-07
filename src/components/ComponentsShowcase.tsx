/**
 * ComponentsShowcase.tsx
 * 
 * A comprehensive showcase of all our cross-platform UI components.
 * This component demonstrates how our shared component system works across platforms.
 */

import * as React from 'react';
import { ScrollView, StyleSheet, Text, View } from 'react-native';
import { useTheme } from '../contexts/ThemeContext';
import { ButtonShowcase } from './ui/ButtonShowcase';
import { CardShowcase } from './ui/CardShowcase';

export function ComponentsShowcase() {
  const { theme } = useTheme();
  
  return (
    <ScrollView 
      style={[styles.container, { backgroundColor: theme.colors.background }]}
      contentContainerStyle={styles.content}
    >
      <Text style={[styles.title, { color: theme.colors.text }]}>
        Cross-Platform Components
      </Text>
      
      <Text style={[styles.subtitle, { color: theme.colors.textSecondary }]}>
        These components work seamlessly on both mobile and web platforms
      </Text>
      
      <View style={styles.divider} />
      
      <Text style={[styles.sectionTitle, { color: theme.colors.text }]}>Buttons</Text>
      <ButtonShowcase />
      
      <View style={styles.divider} />
      
      <Text style={[styles.sectionTitle, { color: theme.colors.text }]}>Cards</Text>
      <CardShowcase />
      
      <View style={styles.spacer} />
      
      <Text style={[styles.footnote, { color: theme.colors.textSecondary }]}>
        Each component has a shared interface with platform-specific implementations.
        Check out the ARCHITECTURE.md file for more details on our cross-platform approach.
      </Text>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  content: {
    padding: 16,
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 16,
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 22,
    fontWeight: 'bold',
    marginBottom: 16,
  },
  divider: {
    height: 1,
    backgroundColor: '#e0e0e0',
    marginVertical: 32,
  },
  spacer: {
    height: 40,
  },
  footnote: {
    fontSize: 14,
    fontStyle: 'italic',
    textAlign: 'center',
    marginBottom: 20,
  },
}); 