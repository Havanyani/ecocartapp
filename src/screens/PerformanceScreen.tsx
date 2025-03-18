import { BackupManager } from '@/components/performance/BackupManager';
import { BackupSchedule } from '@/components/performance/BackupSchedule';
import { BackupStatistics } from '@/components/performance/BackupStatistics';
import { HistoricalPerformance } from '@/components/performance/HistoricalPerformance';
import { PerformanceAlerts } from '@/components/performance/PerformanceAlerts';
import { PerformanceAnalytics } from '@/components/performance/PerformanceAnalytics';
import { PerformanceDashboard } from '@/components/performance/PerformanceDashboard';
import { PerformanceProfiler } from '@/components/performance/PerformanceProfiler';
import { PerformanceSuggestions } from '@/components/performance/PerformanceSuggestions';
import { IconSymbol } from '@/components/ui/IconSymbol';
import { ThemedText } from '@/components/ui/ThemedText';
import { useTheme } from '@/hooks/useTheme';
import React from 'react';
import { ScrollView, StyleSheet, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

export const PerformanceScreen: React.FC = () => {
  const { theme } = useTheme();

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <IconSymbol name="chart-line-variant" size={24} color="#2e7d32" />
        <ThemedText style={styles.title}>Performance Monitoring</ThemedText>
      </View>
      
      <ScrollView style={styles.content}>
        <PerformanceAlerts />
        <PerformanceDashboard />
        <PerformanceAnalytics />
        <PerformanceProfiler />
        <HistoricalPerformance />
        <BackupSchedule />
        <BackupStatistics />
        <BackupManager />
        <PerformanceSuggestions />
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F5F5F5',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    backgroundColor: '#FFFFFF',
    borderBottomWidth: 1,
    borderBottomColor: '#E0E0E0',
  },
  title: {
    fontSize: 20,
    fontWeight: 'bold',
    marginLeft: 8,
    color: '#333',
  },
  content: {
    flex: 1,
  },
}); 