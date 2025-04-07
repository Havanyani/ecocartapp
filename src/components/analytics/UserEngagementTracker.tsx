import { useTheme } from '@/theme';
import { TimeFrame } from '@/types/analytics';
import { Ionicons } from '@expo/vector-icons';
import React, { useEffect, useState } from 'react';
import { ActivityIndicator, Dimensions, ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { BarChart, LineChart, PieChart } from 'react-native-chart-kit';

interface UserEngagementMetrics {
  dau: number; // Daily Active Users
  wau: number; // Weekly Active Users
  mau: number; // Monthly Active Users
  retentionRate: number; // User retention rate (percentage)
  churRate: number; // User churn rate (percentage)
  averageSessionLength: number; // Average session length in minutes
  sessionsPerUser: number; // Average sessions per user
  featureUsage: Record<string, number>; // Usage count per feature
  engagementScore: number; // Overall engagement score (0-100)
  userGrowth: Record<string, number>; // User growth over time
  userSegmentation: Record<string, number>; // User count by segment
}

interface UserEngagementTrackerProps {
  timeFrame?: TimeFrame;
  onTimeFrameChange?: (timeFrame: TimeFrame) => void;
  onExportData?: () => void;
  showAllMetrics?: boolean;
}

/**
 * UserEngagementTracker Component
 * 
 * Tracks and visualizes user engagement metrics including active users,
 * retention, feature usage, and session data with filtering capabilities.
 */
export function UserEngagementTracker({
  timeFrame = 'month',
  onTimeFrameChange,
  onExportData,
  showAllMetrics = true
}: UserEngagementTrackerProps) {
  const { colors, typography } = useTheme();
  const [currentTimeFrame, setCurrentTimeFrame] = useState<TimeFrame>(timeFrame);
  const [isLoading, setIsLoading] = useState(true);
  const [metrics, setMetrics] = useState<UserEngagementMetrics | null>(null);
  const [activeMetric, setActiveMetric] = useState<'users' | 'retention' | 'features' | 'sessions'>('users');
  const screenWidth = Dimensions.get('window').width - 40;

  useEffect(() => {
    loadEngagementData();
  }, [currentTimeFrame]);

  const loadEngagementData = async () => {
    setIsLoading(true);
    try {
      // In a real implementation, this would fetch data from your analytics service
      // Here we're simulating the data
      const data = await simulateEngagementData(currentTimeFrame);
      setMetrics(data);
    } catch (error) {
      console.error('Failed to load engagement data:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleTimeFrameChange = (newTimeFrame: TimeFrame) => {
    setCurrentTimeFrame(newTimeFrame);
    if (onTimeFrameChange) {
      onTimeFrameChange(newTimeFrame);
    }
  };

  const getTimeFrameLabel = (tf: TimeFrame): string => {
    switch (tf) {
      case 'day': return 'Today';
      case 'week': return 'This Week';
      case 'month': return 'This Month';
      case 'year': return 'This Year';
      case 'all': return 'All Time';
      default: return 'This Month';
    }
  };

  // Simulates fetching engagement data from an analytics service
  const simulateEngagementData = async (tf: TimeFrame): Promise<UserEngagementMetrics> => {
    // This would normally be an API call to your analytics service
    await new Promise(resolve => setTimeout(resolve, 1000)); // Simulate API delay
    
    // Sample data - in a real app, this would come from your backend
    return {
      dau: tf === 'day' ? 850 : tf === 'week' ? 920 : tf === 'month' ? 1250 : 1500,
      wau: 4200,
      mau: 12500,
      retentionRate: tf === 'day' ? 92 : tf === 'week' ? 85 : tf === 'month' ? 78 : 72,
      churRate: tf === 'day' ? 8 : tf === 'week' ? 15 : tf === 'month' ? 22 : 28,
      averageSessionLength: 8.5,
      sessionsPerUser: 4.2,
      engagementScore: 78,
      featureUsage: {
        'collection_scheduling': 5230,
        'weight_measurement': 4180,
        'credit_redemption': 3650,
        'impact_dashboard': 2890,
        'notifications': 6340
      },
      userGrowth: {
        'week1': 1200,
        'week2': 1350,
        'week3': 1480,
        'week4': 1650
      },
      userSegmentation: {
        'high_engagement': 35,
        'medium_engagement': 45,
        'low_engagement': 20
      }
    };
  };

  if (isLoading || !metrics) {
    return (
      <View style={[styles.loadingContainer, { backgroundColor: colors.background }]}>
        <ActivityIndicator size="large" color={colors.primary} />
        <Text style={[styles.loadingText, { color: colors.primary, fontFamily: typography.fontFamily.medium }]}>
          Loading engagement data...
        </Text>
      </View>
    );
  }

  const renderTimeFrameSelector = () => (
    <View style={styles.timeFrameContainer}>
      {(['day', 'week', 'month', 'year'] as TimeFrame[]).map((tf) => (
        <TouchableOpacity
          key={tf}
          style={[
            styles.timeFrameButton,
            currentTimeFrame === tf && { backgroundColor: colors.primary },
          ]}
          onPress={() => handleTimeFrameChange(tf)}
        >
          <Text
            style={[
              styles.timeFrameText,
              { fontFamily: typography.fontFamily.medium },
              currentTimeFrame === tf
                ? { color: colors.surface }
                : { color: colors.text.primary },
            ]}
          >
            {getTimeFrameLabel(tf)}
          </Text>
        </TouchableOpacity>
      ))}
    </View>
  );

  const renderMetricSelector = () => (
    <View style={styles.metricSelectorContainer}>
      {[
        { id: 'users', label: 'Active Users', icon: 'people' },
        { id: 'retention', label: 'Retention', icon: 'repeat' },
        { id: 'features', label: 'Features', icon: 'apps' },
        { id: 'sessions', label: 'Sessions', icon: 'time' },
      ].map((item) => (
        <TouchableOpacity
          key={item.id}
          style={[
            styles.metricButton,
            activeMetric === item.id && { backgroundColor: colors.primary + '20' },
          ]}
          onPress={() => setActiveMetric(item.id as any)}
        >
          <Ionicons
            name={item.icon as any}
            size={18}
            color={activeMetric === item.id ? colors.primary : colors.text.secondary}
          />
          <Text
            style={[
              styles.metricButtonText,
              { fontFamily: typography.fontFamily.medium },
              activeMetric === item.id
                ? { color: colors.primary }
                : { color: colors.text.secondary },
            ]}
          >
            {item.label}
          </Text>
        </TouchableOpacity>
      ))}
    </View>
  );

  const renderActiveUsersChart = () => {
    const data = {
      labels: ['DAU', 'WAU', 'MAU'],
      datasets: [
        {
          data: [metrics.dau, metrics.wau, metrics.mau],
          color: () => colors.primary,
          strokeWidth: 2,
        },
      ],
    };

    return (
      <View style={styles.chartContainer}>
        <Text style={[styles.chartTitle, { color: colors.text.primary, fontFamily: typography.fontFamily.semiBold }]}>
          Active Users
        </Text>
        <BarChart
          data={data}
          width={screenWidth}
          height={220}
          chartConfig={{
            backgroundGradientFrom: colors.background,
            backgroundGradientTo: colors.background,
            decimalPlaces: 0,
            color: () => colors.primary,
            labelColor: () => colors.text.secondary,
            style: {
              borderRadius: 16,
            },
          }}
          style={styles.chart}
          fromZero
        />
      </View>
    );
  };

  const renderRetentionChart = () => {
    const data = {
      labels: ['Retention', 'Churn'],
      data: [metrics.retentionRate / 100, metrics.churRate / 100],
      colors: [colors.success, colors.error],
      backgroundColors: [colors.success + '80', colors.error + '80'],
    };

    return (
      <View style={styles.chartContainer}>
        <Text style={[styles.chartTitle, { color: colors.text.primary, fontFamily: typography.fontFamily.semiBold }]}>
          User Retention ({metrics.retentionRate}%)
        </Text>
        <PieChart
          data={[
            {
              name: 'Retention',
              value: metrics.retentionRate,
              color: colors.success,
              legendFontColor: colors.text.secondary,
              legendFontSize: 13,
            },
            {
              name: 'Churn',
              value: metrics.churRate,
              color: colors.error,
              legendFontColor: colors.text.secondary,
              legendFontSize: 13,
            },
          ]}
          width={screenWidth}
          height={220}
          chartConfig={{
            backgroundGradientFrom: colors.background,
            backgroundGradientTo: colors.background,
            color: () => colors.primary,
            labelColor: () => colors.text.secondary,
          }}
          accessor="value"
          backgroundColor="transparent"
          paddingLeft="15"
          center={[screenWidth / 4, 0]}
        />
      </View>
    );
  };

  const renderFeatureUsageChart = () => {
    const sortedFeatures = Object.entries(metrics.featureUsage)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 5);

    const data = {
      labels: sortedFeatures.map(([name]) => name.split('_').map(word => word.charAt(0).toUpperCase() + word.slice(1)).join(' ')),
      datasets: [
        {
          data: sortedFeatures.map(([_, value]) => value),
          color: () => colors.primary,
          strokeWidth: 2,
        },
      ],
    };

    return (
      <View style={styles.chartContainer}>
        <Text style={[styles.chartTitle, { color: colors.text.primary, fontFamily: typography.fontFamily.semiBold }]}>
          Top Features Usage
        </Text>
        <BarChart
          data={data}
          width={screenWidth}
          height={220}
          chartConfig={{
            backgroundGradientFrom: colors.background,
            backgroundGradientTo: colors.background,
            decimalPlaces: 0,
            color: () => colors.primary,
            labelColor: () => colors.text.secondary,
            style: {
              borderRadius: 16,
            },
            barPercentage: 0.7,
          }}
          style={styles.chart}
          fromZero
          yAxisLabel=""
          yAxisSuffix=""
          verticalLabelRotation={30}
        />
      </View>
    );
  };

  const renderSessionsChart = () => {
    return (
      <View style={styles.chartContainer}>
        <Text style={[styles.chartTitle, { color: colors.text.primary, fontFamily: typography.fontFamily.semiBold }]}>
          Session Metrics
        </Text>
        <View style={styles.metricsContainer}>
          <View style={[styles.metricCard, { backgroundColor: colors.surface }]}>
            <Text style={[styles.metricValue, { color: colors.primary, fontFamily: typography.fontFamily.bold }]}>
              {metrics.averageSessionLength.toFixed(1)}min
            </Text>
            <Text style={[styles.metricLabel, { color: colors.text.secondary, fontFamily: typography.fontFamily.regular }]}>
              Avg Session Length
            </Text>
          </View>
          
          <View style={[styles.metricCard, { backgroundColor: colors.surface }]}>
            <Text style={[styles.metricValue, { color: colors.primary, fontFamily: typography.fontFamily.bold }]}>
              {metrics.sessionsPerUser.toFixed(1)}
            </Text>
            <Text style={[styles.metricLabel, { color: colors.text.secondary, fontFamily: typography.fontFamily.regular }]}>
              Sessions Per User
            </Text>
          </View>
          
          <View style={[styles.metricCard, { backgroundColor: colors.surface }]}>
            <Text style={[styles.metricValue, { color: colors.primary, fontFamily: typography.fontFamily.bold }]}>
              {metrics.engagementScore}/100
            </Text>
            <Text style={[styles.metricLabel, { color: colors.text.secondary, fontFamily: typography.fontFamily.regular }]}>
              Engagement Score
            </Text>
          </View>
        </View>
      </View>
    );
  };

  const renderUserGrowthChart = () => {
    const data = {
      labels: Object.keys(metrics.userGrowth),
      datasets: [
        {
          data: Object.values(metrics.userGrowth),
          color: () => colors.primary,
          strokeWidth: 2,
        },
      ],
    };

    return (
      <View style={styles.chartContainer}>
        <Text style={[styles.chartTitle, { color: colors.text.primary, fontFamily: typography.fontFamily.semiBold }]}>
          User Growth
        </Text>
        <LineChart
          data={data}
          width={screenWidth}
          height={220}
          chartConfig={{
            backgroundGradientFrom: colors.background,
            backgroundGradientTo: colors.background,
            decimalPlaces: 0,
            color: () => colors.primary,
            labelColor: () => colors.text.secondary,
            style: {
              borderRadius: 16,
            },
            propsForDots: {
              r: '6',
              strokeWidth: '2',
              stroke: colors.primary,
            },
          }}
          style={styles.chart}
          bezier
        />
      </View>
    );
  };

  const renderUserSegmentation = () => {
    const data = {
      labels: Object.keys(metrics.userSegmentation).map(segment => 
        segment.split('_').map(word => word.charAt(0).toUpperCase() + word.slice(1)).join(' ')
      ),
      data: Object.values(metrics.userSegmentation).map(value => value / 100),
      colors: [colors.success, colors.primary, colors.error],
    };

    return (
      <View style={styles.chartContainer}>
        <Text style={[styles.chartTitle, { color: colors.text.primary, fontFamily: typography.fontFamily.semiBold }]}>
          User Segmentation
        </Text>
        <PieChart
          data={Object.entries(metrics.userSegmentation).map(([segment, value], index) => ({
            name: segment.split('_').map(word => word.charAt(0).toUpperCase() + word.slice(1)).join(' '),
            value,
            color: index === 0 ? colors.success : index === 1 ? colors.primary : colors.error,
            legendFontColor: colors.text.secondary,
            legendFontSize: 13,
          }))}
          width={screenWidth}
          height={220}
          chartConfig={{
            backgroundGradientFrom: colors.background,
            backgroundGradientTo: colors.background,
            color: () => colors.primary,
            labelColor: () => colors.text.secondary,
          }}
          accessor="value"
          backgroundColor="transparent"
          paddingLeft="15"
          center={[screenWidth / 4, 0]}
        />
      </View>
    );
  };

  const renderActiveMetricCharts = () => {
    switch (activeMetric) {
      case 'users':
        return (
          <>
            {renderActiveUsersChart()}
            {showAllMetrics && renderUserGrowthChart()}
          </>
        );
      case 'retention':
        return (
          <>
            {renderRetentionChart()}
            {showAllMetrics && renderUserSegmentation()}
          </>
        );
      case 'features':
        return renderFeatureUsageChart();
      case 'sessions':
        return renderSessionsChart();
      default:
        return null;
    }
  };

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <View style={styles.header}>
        <Text style={[styles.title, { color: colors.text.primary, fontFamily: typography.fontFamily.bold }]}>
          User Engagement
        </Text>
        {onExportData && (
          <TouchableOpacity style={styles.exportButton} onPress={onExportData}>
            <Ionicons name="download-outline" size={20} color={colors.primary} />
            <Text style={[styles.exportText, { color: colors.primary, fontFamily: typography.fontFamily.medium }]}>
              Export
            </Text>
          </TouchableOpacity>
        )}
      </View>
      
      {renderTimeFrameSelector()}
      {renderMetricSelector()}
      
      <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
        {renderActiveMetricCharts()}
        
        {showAllMetrics && (
          <View style={styles.summaryContainer}>
            <Text style={[styles.summaryTitle, { color: colors.text.primary, fontFamily: typography.fontFamily.semiBold }]}>
              Engagement Summary
            </Text>
            <Text style={[styles.summaryText, { color: colors.text.secondary, fontFamily: typography.fontFamily.regular }]}>
              User engagement is {metrics.engagementScore >= 75 ? 'strong' : metrics.engagementScore >= 50 ? 'moderate' : 'weak'} 
              with an overall score of {metrics.engagementScore}/100. 
              {metrics.retentionRate > 80 ? ' Retention is excellent at ' : metrics.retentionRate > 70 ? ' Retention is good at ' : ' Retention needs improvement at '}
              {metrics.retentionRate}%.
            </Text>
            <View style={styles.recommendationsContainer}>
              <Text style={[styles.recommendationsTitle, { color: colors.text.primary, fontFamily: typography.fontFamily.semiBold }]}>
                Recommendations:
              </Text>
              <View style={styles.recommendationItem}>
                <Ionicons name="checkmark-circle" size={16} color={colors.success} />
                <Text style={[styles.recommendationText, { color: colors.text.secondary, fontFamily: typography.fontFamily.regular }]}>
                  Focus on improving session length for low engagement users.
                </Text>
              </View>
              <View style={styles.recommendationItem}>
                <Ionicons name="checkmark-circle" size={16} color={colors.success} />
                <Text style={[styles.recommendationText, { color: colors.text.secondary, fontFamily: typography.fontFamily.regular }]}>
                  Encourage more frequent use of the impact dashboard feature.
                </Text>
              </View>
              <View style={styles.recommendationItem}>
                <Ionicons name="checkmark-circle" size={16} color={colors.success} />
                <Text style={[styles.recommendationText, { color: colors.text.secondary, fontFamily: typography.fontFamily.regular }]}>
                  Implement push notification optimizations to re-engage dormant users.
                </Text>
              </View>
            </View>
          </View>
        )}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 16,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  title: {
    fontSize: 20,
  },
  exportButton: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  exportText: {
    marginLeft: 4,
    fontSize: 14,
  },
  timeFrameContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 16,
  },
  timeFrameButton: {
    paddingVertical: 6,
    paddingHorizontal: 12,
    borderRadius: 20,
  },
  timeFrameText: {
    fontSize: 12,
  },
  metricSelectorContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 16,
  },
  metricButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 8,
  },
  metricButtonText: {
    marginLeft: 6,
    fontSize: 12,
  },
  scrollView: {
    flex: 1,
  },
  chartContainer: {
    marginBottom: 24,
  },
  chartTitle: {
    fontSize: 16,
    marginBottom: 12,
  },
  chart: {
    borderRadius: 16,
  },
  metricsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  metricCard: {
    padding: 16,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
    width: '30%',
  },
  metricValue: {
    fontSize: 18,
    marginBottom: 4,
  },
  metricLabel: {
    fontSize: 12,
    textAlign: 'center',
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
  summaryContainer: {
    marginBottom: 24,
  },
  summaryTitle: {
    fontSize: 16,
    marginBottom: 8,
  },
  summaryText: {
    fontSize: 14,
    lineHeight: 20,
    marginBottom: 16,
  },
  recommendationsContainer: {
    marginTop: 8,
  },
  recommendationsTitle: {
    fontSize: 14,
    marginBottom: 8,
  },
  recommendationItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  recommendationText: {
    fontSize: 14,
    marginLeft: 8,
    flex: 1,
  },
}); 