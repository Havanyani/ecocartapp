import { UserEngagementTracker } from '@/components/analytics/UserEngagementTracker';
import { useTheme } from '@/hooks/useTheme';
import { Ionicons } from '@expo/vector-icons';
import { Stack, useRouter } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import React from 'react';
import { SafeAreaView, StyleSheet, TouchableOpacity } from 'react-native';

/**
 * User Engagement Analytics Screen
 * 
 * Provides detailed analytics on user engagement patterns, retention metrics,
 * feature usage, and session metrics with interactive visualizations.
 */
export default function UserEngagementScreen() {
  const router = useRouter();
  const theme = useTheme();

  const handleExportData = () => {
    // Implementation for exporting data would go here
    console.log('Exporting engagement data...');
  };

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: theme.theme.background }]}>
      <StatusBar style="auto" />
      
      <Stack.Screen 
        options={{
          title: "User Engagement",
          headerShown: true,
          headerBackTitle: "Analytics",
          headerRight: () => (
            <TouchableOpacity 
              style={styles.headerButton}
              onPress={handleExportData}
            >
              <Ionicons name="download-outline" size={22} color={theme.theme.primary} />
            </TouchableOpacity>
          ),
        }}
      />
      
      <UserEngagementTracker 
        timeFrame="month"
        onExportData={handleExportData}
        showAllMetrics={true}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  headerButton: {
    padding: 8,
  }
}); 