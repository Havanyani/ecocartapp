import React, { useEffect, useState } from 'react';
import { ActivityIndicator, ScrollView, StyleSheet, TouchableOpacity, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { LeaderboardTable } from '@/components/analytics/LeaderboardTable';
import { MaterialBreakdownChart } from '@/components/analytics/MaterialBreakdownChart';
import { StatCard } from '@/components/analytics/StatCard';
import { TimeSeriesChart } from '@/components/analytics/TimeSeriesChart';
import { ThemedText } from '@/components/ui';
import { useAnalytics } from '@/hooks/useAnalytics';

interface TimeRange {
  value: string;
  label: string;
}

interface CollectionStat {
  totalWeight: number;
  collectionCount: number;
  averageWeight: number;
  totalCreditsAwarded: number;
  trend: number;
}

interface TimeSeriesData {
  timestamp: string;
  weight: number;
  collections: number;
}

interface MaterialBreakdown {
  materialType: string;
  weight: number;
  percentage: number;
  color: string;
}

interface LeaderboardUser {
  id: string;
  name: string;
  avatar?: string;
  collectionsCount: number;
  totalWeight: number;
  creditsEarned: number;
}

/**
 * Statistics Screen
 * 
 * Displays collection statistics and analytics including time series charts,
 * material breakdowns, and leaderboards
 */
export default function StatisticsScreen() {
  const [selectedTimeRange, setSelectedTimeRange] = useState<string>('month');
  const [collectionStats, setCollectionStats] = useState<CollectionStat | null>(null);
  const [timeSeriesData, setTimeSeriesData] = useState<TimeSeriesData[]>([]);
  const [materialBreakdown, setMaterialBreakdown] = useState<MaterialBreakdown[]>([]);
  const [leaderboard, setLeaderboard] = useState<LeaderboardUser[]>([]);
  
  const { isLoading, getCollectionStats, getTimeSeriesData, getMaterialBreakdown, getLeaderboard } = useAnalytics();
  
  // Available time ranges for filtering
  const timeRanges: TimeRange[] = [
    { value: 'week', label: 'Week' },
    { value: 'month', label: 'Month' },
    { value: 'year', label: 'Year' },
    { value: 'all', label: 'All Time' }
  ];
  
  useEffect(() => {
    loadAnalyticsData();
  }, [selectedTimeRange]);
  
  /**
   * Loads all analytics data based on selected time range
   */
  const loadAnalyticsData = async () => {
    try {
      // Load collection statistics
      const stats = await getCollectionStats(selectedTimeRange);
      setCollectionStats(stats);
      
      // Load time series data
      const timeSeries = await getTimeSeriesData(selectedTimeRange);
      setTimeSeriesData(timeSeries);
      
      // Load material breakdown
      const materials = await getMaterialBreakdown(selectedTimeRange);
      setMaterialBreakdown(materials);
      
      // Load leaderboard
      const leaders = await getLeaderboard(selectedTimeRange);
      setLeaderboard(leaders);
    } catch (error) {
      console.error('Error loading analytics data:', error);
    }
  };
  
  /**
   * Handles time range selection
   */
  const handleTimeRangeSelect = (range: string) => {
    setSelectedTimeRange(range);
  };
  
  if (isLoading && !collectionStats) {
    return (
      <SafeAreaView style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#4F8EF7" />
        <ThemedText style={styles.loadingText}>Loading statistics...</ThemedText>
      </SafeAreaView>
    );
  }
  
  return (
    <SafeAreaView style={styles.container}>
      <ScrollView contentContainerStyle={styles.scrollContent}>
        <ThemedText variant="h1" style={styles.screenTitle}>Collection Statistics</ThemedText>
        
        {/* Time Range Selector */}
        <View style={styles.timeRangeContainer}>
          {timeRanges.map(range => (
            <TouchableOpacity
              key={range.value}
              style={[
                styles.timeRangeButton,
                selectedTimeRange === range.value && styles.selectedTimeRange
              ]}
              onPress={() => handleTimeRangeSelect(range.value)}
            >
              <ThemedText 
                style={[
                  styles.timeRangeText,
                  selectedTimeRange === range.value && styles.selectedTimeRangeText
                ]}
              >
                {range.label}
              </ThemedText>
            </TouchableOpacity>
          ))}
        </View>
        
        {/* Collection Statistics Cards */}
        {collectionStats && (
          <View style={styles.statsContainer}>
            <StatCard
              title="Total Weight"
              value={`${collectionStats.totalWeight} kg`}
              icon="weight"
              trend={collectionStats.trend}
              color="#4F8EF7"
            />
            <StatCard
              title="Collections"
              value={collectionStats.collectionCount.toString()}
              icon="trash-can"
              trend={collectionStats.trend}
              color="#34D399"
            />
            <StatCard
              title="Avg. Weight"
              value={`${collectionStats.averageWeight} kg`}
              icon="chart-bar"
              trend={0}
              color="#F59E0B"
            />
            <StatCard
              title="Credits Awarded"
              value={collectionStats.totalCreditsAwarded.toString()}
              icon="currency-usd"
              trend={collectionStats.trend}
              color="#8B5CF6"
            />
          </View>
        )}
        
        {/* Time Series Chart */}
        {timeSeriesData.length > 0 && (
          <View style={styles.chartContainer}>
            <ThemedText variant="h2" style={styles.chartTitle}>Collection History</ThemedText>
            <TimeSeriesChart
              data={timeSeriesData}
              timeRange={selectedTimeRange}
              height={220}
            />
          </View>
        )}
        
        {/* Material Breakdown */}
        {materialBreakdown.length > 0 && (
          <View style={styles.chartContainer}>
            <ThemedText variant="h2" style={styles.chartTitle}>Material Breakdown</ThemedText>
            <MaterialBreakdownChart
              data={materialBreakdown}
              height={220}
            />
          </View>
        )}
        
        {/* Leaderboard */}
        {leaderboard.length > 0 && (
          <View style={styles.leaderboardContainer}>
            <ThemedText variant="h2" style={styles.chartTitle}>Top Collectors</ThemedText>
            <LeaderboardTable users={leaderboard} />
            <TouchableOpacity style={styles.viewAllButton}>
              <ThemedText style={styles.viewAllButtonText}>View Full Leaderboard</ThemedText>
            </TouchableOpacity>
          </View>
        )}
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  scrollContent: {
    padding: 16,
    paddingBottom: 24,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    marginTop: 12,
    fontSize: 16,
  },
  screenTitle: {
    marginBottom: 16,
  },
  timeRangeContainer: {
    flexDirection: 'row',
    marginBottom: 16,
    backgroundColor: '#e0e0e0',
    borderRadius: 8,
    padding: 4,
  },
  timeRangeButton: {
    flex: 1,
    paddingVertical: 8,
    alignItems: 'center',
    borderRadius: 4,
  },
  selectedTimeRange: {
    backgroundColor: '#ffffff',
  },
  timeRangeText: {
    fontSize: 14,
    fontWeight: '500',
  },
  selectedTimeRangeText: {
    fontWeight: '600',
    color: '#4F8EF7',
  },
  statsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginBottom: 16,
    gap: 12,
  },
  chartContainer: {
    backgroundColor: '#ffffff',
    borderRadius: 8,
    padding: 16,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 10,
    elevation: 2,
  },
  chartTitle: {
    marginBottom: 16,
  },
  leaderboardContainer: {
    backgroundColor: '#ffffff',
    borderRadius: 8,
    padding: 16,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 10,
    elevation: 2,
  },
  viewAllButton: {
    alignItems: 'center',
    paddingVertical: 12,
    marginTop: 8,
  },
  viewAllButtonText: {
    color: '#4F8EF7',
    fontWeight: '500',
  },
}); 