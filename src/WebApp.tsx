import { AuthProvider } from '@/contexts/AuthContext';
import { ThemeProvider } from '@/theme';
import React from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { SafeAreaProvider } from 'react-native-safe-area-context';

/**
 * A simplified web entry point that doesn't use Expo Router
 * This helps diagnose if the issue is with the router system
 */
export default function WebApp() {
  return (
    <SafeAreaProvider>
      <ThemeProvider>
        <AuthProvider>
          <View style={styles.container}>
            <Text style={styles.title}>EcoCart Web Version</Text>
            <Text style={styles.description}>
              This is a simplified web version of the EcoCart app.
            </Text>
            <Text style={styles.info}>
              If you can see this, the basic React Native Web setup is working!
            </Text>
          </View>
        </AuthProvider>
      </ThemeProvider>
    </SafeAreaProvider>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 20,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 20,
  },
  description: {
    fontSize: 18,
    textAlign: 'center',
    marginBottom: 20,
  },
  info: {
    fontSize: 16,
    color: '#666',
    textAlign: 'center',
  },
}); 