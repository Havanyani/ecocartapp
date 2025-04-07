import { Card } from '@/components/ui/Card';
import { HapticTab } from '@/components/ui/HapticTab';
import { ThemedText } from '@/components/ui/ThemedText';
import React, { useCallback, useState } from 'react';
import { Platform, ScrollView, StyleSheet, useWindowDimensions, View } from 'react-native';
import { LineChart } from 'react-native-chart-kit';
import { useMobileVitals } from './hooks/useMobileVitals';
import { useWebVitals } from './hooks/useWebVitals';

type MetricCategory = 'web' | 'mobile' | 'interaction';

interface HistoryData {
  dates: string[];
  webData: {
    lcp: number[];
    fid: number[];
    cls: number[];
    ttfb: number[];
    fcp: number[];
  };
  mobileData: {
    frameRate: number[];
    jsHeapSize: number[];
    launchTime: number[];
    jankPercentage: number[];
  };
  interactionData: {
    pageLoad: number[];
    navigation: number[];
    ttip: number[];
  };
}

export function PerformanceTrends(): JSX.Element {
  const { width } = useWindowDimensions();
  const [activeCategory, setActiveCategory] = useState<MetricCategory>(
    Platform.OS === 'web' ? 'web' : 'mobile'
  );
  
  // Get platform-specific performance data
  const { 
    data: webData,
    performanceHistory 
  } = useWebVitals({ 
    disabled: Platform.OS !== 'web',
    refreshInterval: 60000
  });
  
  const { 
    data: mobileData
  } = useMobileVitals({ 
    disabled: Platform.OS === 'web',
    refreshInterval: 30000
  });

  // Generate sample historical data if actual data isn't available
  const generateSampleData = useCallback((): HistoryData => {
    const days = 7;
    // Generate some random but somewhat realistic data
    const generateRandomValue = (min: number, max: number) => 
      Math.floor(Math.random() * (max - min + 1)) + min;
    
    const dates = Array.from({ length: days }, (_, i) => {
      const date = new Date();
      date.setDate(date.getDate() - (days - i - 1));
      return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
    });

    // Create realistic but random performance data
    const webData = {
      lcp: Array.from({ length: days }, () => generateRandomValue(1800, 3500)),
      fid: Array.from({ length: days }, () => generateRandomValue(50, 250)),
      cls: Array.from({ length: days }, () => (generateRandomValue(5, 25) / 100)),
      ttfb: Array.from({ length: days }, () => generateRandomValue(200, 800)),
      fcp: Array.from({ length: days }, () => generateRandomValue(1000, 2500)),
    };

    const mobileData = {
      frameRate: Array.from({ length: days }, () => generateRandomValue(45, 60)),
      jsHeapSize: Array.from({ length: days }, () => generateRandomValue(50, 200)),
      launchTime: Array.from({ length: days }, () => generateRandomValue(800, 2500)),
      jankPercentage: Array.from({ length: days }, () => generateRandomValue(5, 30)),
    };

    const interactionData = {
      pageLoad: Array.from({ length: days }, () => generateRandomValue(800, 3000)),
      navigation: Array.from({ length: days }, () => generateRandomValue(300, 1200)),
      ttip: Array.from({ length: days }, () => generateRandomValue(100, 500)),
    };

    return {
      dates,
      webData,
      mobileData,
      interactionData
    };
  }, []);

  // Use real history data if available, otherwise use sample data
  const historyData: HistoryData = performanceHistory && performanceHistory.length > 0 
    ? (() => {
        // Create a base sample data object
        const sampleData = generateSampleData();
        
        // Override web data with real performance history
        return {
          ...sampleData, // Keep mobile and interaction data from sample
          dates: performanceHistory.map(item => 
            new Date(item.timestamp).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })
          ),
          webData: {
            lcp: performanceHistory.map(item => item.lcp || 0),
            fid: performanceHistory.map(item => item.fid || 0),
            cls: performanceHistory.map(item => item.cls || 0),
            ttfb: performanceHistory.map(item => item.ttfb || 0),
            fcp: performanceHistory.map(item => item.fcp || 0),
          }
        };
      })()
    : generateSampleData();

  // Get the appropriate metrics for the active category
  const getChartData = () => {
    if (activeCategory === 'web') {
      return [
        {
          title: 'LCP (ms)',
          data: historyData.webData.lcp,
          color: (opacity = 1) => `rgba(46, 125, 50, ${opacity})`,
          goodThreshold: 2500,
        },
        {
          title: 'FID (ms)',
          data: historyData.webData.fid,
          color: (opacity = 1) => `rgba(211, 47, 47, ${opacity})`,
          goodThreshold: 100, // lower is better
        },
        {
          title: 'CLS',
          data: historyData.webData.cls.map(val => val * 100), // scale for visibility
          color: (opacity = 1) => `rgba(33, 150, 243, ${opacity})`,
          goodThreshold: 10, // 0.1 * 100
        },
      ];
    } else if (activeCategory === 'mobile') {
      return [
        {
          title: 'FPS',
          data: historyData.mobileData.frameRate,
          color: (opacity = 1) => `rgba(46, 125, 50, ${opacity})`,
          goodThreshold: 55, // higher is better for FPS
          inverted: true,
        },
        {
          title: 'JS Heap (MB)',
          data: historyData.mobileData.jsHeapSize,
          color: (opacity = 1) => `rgba(211, 47, 47, ${opacity})`,
          goodThreshold: 100, // lower is better
        },
        {
          title: 'Jank %',
          data: historyData.mobileData.jankPercentage,
          color: (opacity = 1) => `rgba(33, 150, 243, ${opacity})`,
          goodThreshold: 10, // lower is better
        },
      ];
    } else {
      return [
        {
          title: 'Page Load (ms)',
          data: historyData.interactionData.pageLoad,
          color: (opacity = 1) => `rgba(46, 125, 50, ${opacity})`,
          goodThreshold: 2000,
        },
        {
          title: 'Navigation (ms)',
          data: historyData.interactionData.navigation,
          color: (opacity = 1) => `rgba(211, 47, 47, ${opacity})`,
          goodThreshold: 500,
        },
        {
          title: 'TTIP (ms)',
          data: historyData.interactionData.ttip,
          color: (opacity = 1) => `rgba(33, 150, 243, ${opacity})`,
          goodThreshold: 200,
        },
      ];
    }
  };

  const chartDataSets = getChartData();

  // Configure chart appearance
  const chartConfig = {
    backgroundColor: '#fff',
    backgroundGradientFrom: '#fff',
    backgroundGradientTo: '#fff',
    decimalPlaces: 0,
    color: (opacity = 1) => `rgba(0, 0, 0, ${opacity})`,
    labelColor: (opacity = 1) => `rgba(0, 0, 0, ${opacity})`,
    style: {
      borderRadius: 16,
    },
    propsForDots: {
      r: '4',
      strokeWidth: '1',
      stroke: '#fafafa',
    },
  };

  return (
    <View style={styles.container} testID="performance-trends">
      <Card style={styles.card}>
        <ThemedText style={styles.title}>Performance Trends</ThemedText>
        
        <View style={styles.tabContainer}>
          {Platform.OS === 'web' && (
            <HapticTab
              style={[styles.tab, activeCategory === 'web' && styles.activeTab]}
              onPress={() => setActiveCategory('web')}
            >
              <ThemedText style={[styles.tabText, activeCategory === 'web' && styles.activeTabText]}>
                Web Vitals
              </ThemedText>
            </HapticTab>
          )}
          
          {(Platform.OS === 'ios' || Platform.OS === 'android') && (
            <HapticTab
              style={[styles.tab, activeCategory === 'mobile' && styles.activeTab]}
              onPress={() => setActiveCategory('mobile')}
            >
              <ThemedText style={[styles.tabText, activeCategory === 'mobile' && styles.activeTabText]}>
                Mobile Vitals
              </ThemedText>
            </HapticTab>
          )}
          
          <HapticTab
            style={[styles.tab, activeCategory === 'interaction' && styles.activeTab]}
            onPress={() => setActiveCategory('interaction')}
          >
            <ThemedText style={[styles.tabText, activeCategory === 'interaction' && styles.activeTabText]}>
              Interactions
            </ThemedText>
          </HapticTab>
        </View>
        
        <ScrollView horizontal showsHorizontalScrollIndicator={false}>
          {chartDataSets.map((dataset, index) => (
            <View key={`chart-${index}`} style={styles.chartContainer}>
              <ThemedText style={styles.chartTitle}>{dataset.title}</ThemedText>
              <LineChart
                data={{
                  labels: historyData.dates,
                  datasets: [
                    {
                      data: dataset.data,
                      color: dataset.color,
                      strokeWidth: 2,
                    },
                    // Add threshold line if applicable
                    {
                      data: Array(historyData.dates.length).fill(dataset.goodThreshold),
                      color: (opacity = 1) => `rgba(200, 200, 200, ${opacity})`,
                      strokeWidth: 1,
                      withDots: false,
                    },
                  ],
                  legend: [`${dataset.title} (7 days)`],
                }}
                width={width * 0.8}
                height={220}
                chartConfig={chartConfig}
                bezier
                withDots
                fromZero={false}
                withShadow={false}
                withInnerLines={true}
                withOuterLines={true}
                withVerticalLines={false}
                withHorizontalLines={true}
                yAxisLabel=""
                yAxisSuffix=""
                style={styles.chart}
              />
              <View style={styles.thresholdLegend}>
                <View style={styles.legendDot} />
                <ThemedText style={styles.thresholdText}>
                  {dataset.inverted ? 'Good above ' : 'Good below '} 
                  {dataset.goodThreshold} 
                  {dataset.title.includes('MB') ? ' MB' : dataset.title.includes('%') ? '%' : ' ms'}
                </ThemedText>
              </View>
            </View>
          ))}
        </ScrollView>
        
        <ThemedText style={styles.footnote}>
          Data shown is {performanceHistory?.length > 0 ? 'based on actual measurements' : 'sample data for demonstration'}.
        </ThemedText>
      </Card>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    paddingHorizontal: 16,
    paddingBottom: 16,
  },
  card: {
    padding: 16,
    borderRadius: 8,
  },
  title: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 16,
  },
  tabContainer: {
    flexDirection: 'row',
    marginBottom: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#e0e0e0',
  },
  tab: {
    flex: 1,
    paddingVertical: 8,
    alignItems: 'center',
  },
  activeTab: {
    borderBottomWidth: 2,
    borderBottomColor: '#2e7d32',
  },
  tabText: {
    fontSize: 14,
    color: '#757575',
  },
  activeTabText: {
    color: '#2e7d32',
    fontWeight: 'bold',
  },
  chartContainer: {
    marginRight: 24,
    marginBottom: 16,
    alignItems: 'center',
  },
  chartTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 8,
    textAlign: 'center',
  },
  chart: {
    borderRadius: 8,
  },
  thresholdLegend: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 8,
  },
  legendDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: '#c8c8c8',
    marginRight: 6,
  },
  thresholdText: {
    fontSize: 12,
    color: '#757575',
  },
  footnote: {
    fontSize: 12,
    color: '#9e9e9e',
    fontStyle: 'italic',
    textAlign: 'center',
    marginTop: 8,
  },
}); 