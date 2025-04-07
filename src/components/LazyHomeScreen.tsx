/**
 * LazyHomeScreen.tsx
 * 
 * Example of using BundleSplitter for lazy loading the HomeScreen component.
 * This demonstrates how to integrate our bundle optimization utilities.
 */

import React from 'react';
import { ActivityIndicator, StyleSheet, Text, View } from 'react-native';
import BundleSplitter from '../utils/performance/BundleSplitter';

// Custom loading component
const HomeScreenLoader = () => (
  <View style={styles.container}>
    <ActivityIndicator size="large" color="#34C759" />
    <Text style={styles.loadingText}>Loading Home Screen...</Text>
  </View>
);

// Create a lazy-loaded version of the HomeScreen
const LazyHomeScreen = BundleSplitter.registerLazyComponent(
  'HomeScreen',
  () => import('../screens/home/HomeScreen'),
  {
    loadingComponent: <HomeScreenLoader />,
    // Optional: preload the component right away
    // preload: true,
  }
);

// Export the lazy-loaded component for use in navigation
export default LazyHomeScreen;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#f9f9f9',
  },
  loadingText: {
    marginTop: 16,
    fontSize: 16,
    color: '#666666',
  },
}); 