import { BackupManager } from '@/components/performance/BackupManager';
import { BackupSchedule } from '@/components/performance/BackupSchedule';
import { HistoricalPerformance } from '@/components/performance/HistoricalPerformance';
import { PerformanceAlerts } from '@/components/performance/PerformanceAlerts';
import { PerformanceAnalytics } from '@/components/performance/PerformanceAnalytics';
import { PerformanceDashboard } from '@/components/performance/PerformanceDashboard';
import { PerformanceProfiler } from '@/components/performance/PerformanceProfiler';
import { PerformanceSuggestions } from '@/components/performance/PerformanceSuggestions';
import { IconSymbol } from '@/components/ui/IconSymbol';
import { ThemedText } from '@/components/ui/ThemedText';
import { useTheme } from '@/theme';
import React from 'react';
import { ScrollView, StyleSheet, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

export const PerformanceScreen: React.FC = () => {
  const theme = useTheme()()();

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: theme.colors.background }]}>
      <View style={[styles.header, { 
        backgroundColor: theme.colors.card,
        borderBottomColor: theme.colors.border 
      }]}>
        <IconSymbol name="chart-line-variant" size={24} color={theme.colors.success} />
        <ThemedText style={[styles.title, { color: theme.colors.text }]}>Performance Monitoring</ThemedText>
      </View>
      
      <ScrollView style={styles.content}>
        <PerformanceAlerts />
        <PerformanceDashboard />
        <PerformanceAnalytics />
        <PerformanceProfiler />
        <HistoricalPerformance />
        <BackupSchedule />
        <BackupManager />
        <PerformanceSuggestions />
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    borderBottomWidth: 1,
  },
  title: {
    fontSize: 20,
    fontWeight: 'bold',
    marginLeft: 8,
  },
  content: {
    flex: 1,
  },
}); 