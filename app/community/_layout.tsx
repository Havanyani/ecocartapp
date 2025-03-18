import { Slot } from 'expo-router';
import React from 'react';
import { StyleSheet, View } from 'react-native';

/**
 * Community Section Layout
 * Provides layout structure for all community-related screens
 */
export default function CommunityLayout() {
  return (
    <View style={styles.container}>
      <Slot />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
}); 