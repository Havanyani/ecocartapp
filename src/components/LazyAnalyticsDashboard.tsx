/**
 * LazyAnalyticsDashboard.tsx
 * 
 * Example of using BundleSplitter for feature-flagged lazy loading.
 * This demonstrates a more advanced use case where a component is only
 * loaded if a specific feature flag is enabled.
 */

import React from 'react';
import { ActivityIndicator, StyleSheet, Text, View } from 'react-native';
import BundleSplitter from '../utils/performance/BundleSplitter';

// Custom loading component
const AnalyticsLoader = () => (
  <View style={styles.container}>
    <ActivityIndicator size="large" color="#0066cc" />
    <Text style={styles.loadingText}>Loading Analytics Dashboard...</Text>
  </View>
);

// Fallback component when analytics is disabled
const AnalyticsDisabledComponent = () => (
  <View style={styles.container}>
    <Text style={styles.titleText}>Analytics Disabled</Text>
    <Text style={styles.messageText}>
      Analytics features are currently disabled in this version.
      Enable analytics in settings to access this feature.
    </Text>
  </View>
);

// Mock feature flag check - in a real app, this would come from a feature flag service
// or configuration system
const isAnalyticsEnabled = () => {
  // For demo purposes, this is hardcoded to true
  // In a real app, this would check user permissions, subscription status, etc.
  return true;
};

// Create a feature-flagged lazy-loaded version of the Analytics Dashboard
const LazyAnalyticsDashboard = BundleSplitter.createFeatureFlaggedComponent(
  'AnalyticsDashboard',
  () => import('../screens/analytics/AnalyticsDashboard'),
  isAnalyticsEnabled,
  AnalyticsDisabledComponent,
  {
    loadingComponent: <AnalyticsLoader />,
  }
);

// Export the lazy-loaded component
export default LazyAnalyticsDashboard;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
    backgroundColor: '#f5f5f7',
  },
  loadingText: {
    marginTop: 16,
    fontSize: 16,
    color: '#666666',
  },
  titleText: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#333333',
    marginBottom: 12,
  },
  messageText: {
    fontSize: 16,
    color: '#666666',
    textAlign: 'center',
    lineHeight: 24,
  },
}); 