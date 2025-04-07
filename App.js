import React from 'react';
import { Platform, StyleSheet, Text, View } from 'react-native';

// Simple app without Expo Router
export default function App() {
  console.log('Running simple App.js without Expo Router');
  
  return (
    <View style={styles.container}>
      <Text style={styles.title}>EcoCart</Text>
      <Text style={styles.subtitle}>Platform: {Platform.OS}</Text>
      <Text style={styles.message}>
        Basic app is running without Expo Router.
        This confirms that the core app functionality works.
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
    backgroundColor: '#f0f9e8',
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    marginBottom: 10,
    color: '#2a9d8f',
  },
  subtitle: {
    fontSize: 18,
    marginBottom: 20,
    color: '#264653',
  },
  message: {
    fontSize: 16,
    textAlign: 'center',
    lineHeight: 24,
    color: '#333',
  },
}); 