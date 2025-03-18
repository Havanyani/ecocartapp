/**
 * app/[...unmatched].tsx
 * 
 * Catch-all route for handling 404 pages and unmatched routes.
 */

import { Link } from 'expo-router';
import React from 'react';
import { StyleSheet, Text, useColorScheme, View } from 'react-native';
import Colors from '../src/constants/Colors';

// Define a separate header for this screen
export function ErrorHeader() {
  return null; // This will be replaced by Expo Router's default header
}

// Set options for the screen
ErrorHeader.navigationOptions = {
  title: 'Page Not Found',
};

export default function NotFoundScreen() {
  const colorScheme = useColorScheme();
  const colors = Colors[colorScheme ?? 'light'];

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <Text style={[styles.title, { color: colors.text }]}>Page Not Found</Text>
      <Text style={[styles.message, { color: colors.tabIconDefault }]}>
        The page you're looking for doesn't exist or has been moved.
      </Text>
      <Link href="/" style={[styles.link, { color: colors.tint }]}>
        Go back to home screen
      </Link>
    </View>
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
    marginBottom: 16,
  },
  message: {
    fontSize: 16,
    marginBottom: 24,
    textAlign: 'center',
  },
  link: {
    fontSize: 16,
    fontWeight: '600',
  },
}); 