import React from 'react';
import { SafeAreaView, StyleSheet } from 'react-native';
import StorageDashboard from '../../../src/components/StorageDashboard';

/**
 * Storage Index Screen
 * 
 * This is the main entry point for the Storage tab.
 * It provides access to various storage tools and displays storage metrics.
 */
export default function StorageIndexScreen() {
  return (
    <SafeAreaView style={styles.container}>
      <StorageDashboard />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
}); 