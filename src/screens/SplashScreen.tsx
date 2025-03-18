/**
 * SplashScreen.tsx
 * 
 * A splash screen displayed during app initialization.
 * Shows the app logo, name, and a loading indicator.
 */

import { StatusBar } from 'expo-status-bar';
import React from 'react';
import { ActivityIndicator, Image, StyleSheet, Text, View } from 'react-native';

export default function SplashScreen() {
  return (
    <View style={styles.container}>
      <StatusBar style="light" />
      
      <View style={styles.logoContainer}>
        <Image
          source={require('@/assets/images/eco-logo.png')}
          style={styles.logo}
          resizeMode="contain"
        />
        <Text style={styles.appName}>EcoCart</Text>
        <Text style={styles.tagline}>Grocery delivery with a purpose</Text>
      </View>
      
      <ActivityIndicator 
        size="large" 
        color="#FFFFFF" 
        style={styles.loader} 
      />
      
      <Text style={styles.loadingText}>Loading...</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#34C759', // Green color for eco-friendly theme
    padding: 20
  },
  logoContainer: {
    alignItems: 'center',
    marginBottom: 40
  },
  logo: {
    width: 120,
    height: 120,
    marginBottom: 16
  },
  appName: {
    fontSize: 32,
    fontWeight: 'bold',
    color: '#FFFFFF',
    marginBottom: 8
  },
  tagline: {
    fontSize: 16,
    color: 'rgba(255, 255, 255, 0.8)',
    textAlign: 'center'
  },
  loader: {
    marginBottom: 16
  },
  loadingText: {
    fontSize: 14,
    color: 'rgba(255, 255, 255, 0.8)'
  }
}); 