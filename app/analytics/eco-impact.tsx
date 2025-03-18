import { EnhancedEcoImpactService } from '@/services/EnhancedEcoImpactService';
import { EcoImpactMetrics, TimeFrame } from '@/types/analytics';
import { Ionicons } from '@expo/vector-icons';
import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import React, { useEffect, useState } from 'react';
import { ActivityIndicator, Dimensions, SafeAreaView, ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { LineChart, PieChart } from 'react-native-chart-kit';

const screenWidth = Dimensions.get('window').width - 40;

/**
 * Environmental Impact Dashboard
 * 
 * Advanced analytics dashboard for tracking and visualizing environmental impact
 * metrics with comparison benchmarks, material breakdowns, and milestone tracking.
 */
export default function EcoImpactDashboardScreen() {
  const [timeFrame, setTimeFrame] = useState<TimeFrame>('month');
  const [isLoading, setIsLoading] = useState(true);
  const [userId, setUserId] = useState('current-user'); // Would normally come from auth
  const [metrics, setMetrics] = useState<EcoImpactMetrics | null>(null);
  const [activeSection, setActiveSection] = useState<'summary' | 'materials' | 'milestones' | 'forecast'>('summary');
  
  const ecoImpactService = new EnhancedEcoImpactService();
  
  useEffect(() => {
    loadImpactData();
  }, [timeFrame]);
  
  const loadImpactData = async () => {
    setIsLoading(true);
    try {
      const impactData = await ecoImpactService.getEnhancedEcoImpact(userId, timeFrame);
      setMetrics(impactData);
    } catch (error) {
      console.error('Failed to load environmental impact data:', error);
    } finally {
      setIsLoading(false);
    }
  };
  
  const formatNumber = (num: number, decimals = 1): string => {
    return num.toFixed(decimals);
  };
  
  const renderTimeFrameSelector = () => (
    <View style={styles.timeFrameSelector}>
      {(['day', 'week', 'month', 'year'] as TimeFrame[]).map((tf) => (
        <TouchableOpacity
          key={tf}
          style={[styles.timeFrameButton, timeFrame === tf && styles.timeFrameButtonActive]}
          onPress={() => setTimeFrame(tf)}
        >
          <Text style={[styles.timeFrameButtonText, timeFrame === tf && styles.timeFrameButtonTextActive]}>
            {tf.charAt(0).toUpperCase() + tf.slice(1)}
          </Text>
        </TouchableOpacity>
      ))}
    </View>
  );
  
  const renderSectionSelector = () => (
    <View style={styles.sectionSelector}>
      {[
        { id: 'summary', label: 'Summary', icon: 'analytics-outline' },
        { id: 'materials', label: 'Materials', icon: 'layers-outline' },
        { id: 'milestones', label: 'Milestones', icon: 'trophy-outline' },
        { id: 'forecast', label: 'Forecast', icon: 'trending-up-outline' }
      ].map((section) => (
        <TouchableOpacity
          key={section.id}
          style={[styles.sectionButton, activeSection === section.id && styles.sectionButtonActive]}
          onPress={() => setActiveSection(section.id as any)}
        >
          <Ionicons 
            name={section.icon as any} 
            size={16} 
            color={activeSection === section.id ? '#FFFFFF' : '#007AFF'} 
          />
          <Text style={[styles.sectionButtonText, activeSection === section.id && styles.sectionButtonTextActive]}>
            {section.label}
          </Text>
        </TouchableOpacity>
      ))}
    </View>
  );
  
  const renderSummaryMetrics = () => {
    if (!metrics) return null;
    
    return (
      <View style={styles.summaryContainer}>
        <View style={styles.metricsRow}>
          <View style={styles.metricCard}>
            <View style={[styles.metricIconContainer, { backgroundColor: '#34C759' + '20' }]}>
              <Ionicons name="leaf-outline" size={24} color="#34C759" />
            </View>
            <Text style={styles.metricValue}>{formatNumber(metrics.co2Saved)} kg</Text>
            <Text style={styles.metricLabel}>CO₂ Saved</Text>
            {metrics.comparisons?.averageUser && (
              <View style={[
                styles.comparisonBadge, 
                metrics.comparisons.averageUser.comparison === 'better' 
                  ? styles.comparisonBadgePositive 
                  : styles.comparisonBadgeNegative
              ]}>
                <Text style={styles.comparisonText}>
                  {formatNumber(metrics.comparisons.averageUser.co2SavedPercentage)}% vs avg
                </Text>
              </View>
            )}
          </View>
          
          <View style={styles.metricCard}>
            <View style={[styles.metricIconContainer, { backgroundColor: '#007AFF' + '20' }]}>
              <Ionicons name="water-outline" size={24} color="#007AFF" />
            </View>
            <Text style={styles.metricValue}>{formatNumber(metrics.waterSaved)} L</Text>
            <Text style={styles.metricLabel}>Water Saved</Text>
            {metrics.comparisons?.averageUser && (
              <View style={[
                styles.comparisonBadge, 
                metrics.comparisons.averageUser.comparison === 'better' 
                  ? styles.comparisonBadgePositive 
                  : styles.comparisonBadgeNegative
              ]}>
                <Text style={styles.comparisonText}>
                  {formatNumber(metrics.comparisons.averageUser.waterSavedPercentage)}% vs avg
                </Text>
              </View>
            )}
          </View>
        </View>
        
        <View style={styles.metricsRow}>
          <View style={styles.metricCard}>
            <View style={[styles.metricIconContainer, { backgroundColor: '#FF9500' + '20' }]}>
              <Ionicons name="flash-outline" size={24} color="#FF9500" />
            </View>
            <Text style={styles.metricValue}>{formatNumber(metrics.energySaved)} kWh</Text>
            <Text style={styles.metricLabel}>Energy Saved</Text>
            {metrics.comparisons?.averageUser && (
              <View style={[
                styles.comparisonBadge, 
                metrics.comparisons.averageUser.comparison === 'better' 
                  ? styles.comparisonBadgePositive 
                  : styles.comparisonBadgeNegative
              ]}>
                <Text style={styles.comparisonText}>
                  {formatNumber(metrics.comparisons.averageUser.energySavedPercentage)}% vs avg
                </Text>
              </View>
            )}
          </View>
          
          <View style={styles.metricCard}>
            <View style={[styles.metricIconContainer, { backgroundColor: '#5856D6' + '20' }]}>
              <Ionicons name="git-branch-outline" size={24} color="#5856D6" />
            </View>
            <Text style={styles.metricValue}>{formatNumber(metrics.treesEquivalent)}</Text>
            <Text style={styles.metricLabel}>Trees Equivalent</Text>
          </View>
        </View>
        
        {metrics.carbonOffsets && (
          <View style={styles.offsetsContainer}>
            <Text style={styles.offsetsTitle}>Your Impact Equals</Text>
            <View style={styles.offsetsList}>
              <View style={styles.offsetItem}>
                <Ionicons name="car-outline" size={20} color="#34C759" />
                <Text style={styles.offsetText}>{formatNumber(metrics.carbonOffsets.carMiles)} miles not driven</Text>
              </View>
              <View style={styles.offsetItem}>
                <Ionicons name="airplane-outline" size={20} color="#34C759" />
                <Text style={styles.offsetText}>{formatNumber(metrics.carbonOffsets.flightMiles)} flight miles saved</Text>
              </View>
              <View style={styles.offsetItem}>
                <Ionicons name="phone-portrait-outline" size={20} color="#34C759" />
                <Text style={styles.offsetText}>{formatNumber(metrics.carbonOffsets.phonesCharged)} phones charged</Text>
              </View>
            </View>
          </View>
        )}
      </View>
    );
  };
  
  const renderMaterialBreakdown = () => {
    if (!metrics || !metrics.materialBreakdown) return null;
    
    // Sort materials by weight
    const sortedMaterials = [...metrics.materialBreakdown].sort((a, b) => b.weight - a.weight);
    
    // Prepare data for pie chart
    const chartData = sortedMaterials.map((item, index) => {
      const colors = ['#FF9500', '#34C759', '#007AFF', '#5856D6', '#FF2D55', '#5AC8FA', '#FFCC00', '#8E8E93'];
      return {
        name: item.material.charAt(0).toUpperCase() + item.material.slice(1),
        value: item.weight,
        color: colors[index % colors.length],
        legendFontColor: '#7F7F7F',
        legendFontSize: 12
      };
    });
    
    return (
      <View style={styles.materialsContainer}>
        <Text style={styles.materialsTitle}>Material Breakdown</Text>
        
        <View style={styles.chartContainer}>
          <PieChart
            data={chartData}
            width={screenWidth}
            height={220}
            chartConfig={{
              backgroundGradientFrom: '#FFFFFF',
              backgroundGradientTo: '#FFFFFF',
              color: (opacity = 1) => `rgba(0, 0, 0, ${opacity})`,
            }}
            accessor="value"
            backgroundColor="transparent"
            paddingLeft="15"
            absolute
          />
        </View>
        
        <View style={styles.materialsList}>
          {sortedMaterials.map((material) => (
            <View key={material.material} style={styles.materialItem}>
              <View style={styles.materialHeader}>
                <Text style={styles.materialName}>
                  {material.material.charAt(0).toUpperCase() + material.material.slice(1)}
                </Text>
                <Text style={styles.materialPercentage}>{formatNumber(material.percentOfTotal)}%</Text>
              </View>
              <View style={styles.materialProgressContainer}>
                <View 
                  style={[
                    styles.materialProgress, 
                    { width: `${material.percentOfTotal}%` }
                  ]} 
                />
              </View>
              <View style={styles.materialMetrics}>
                <Text style={styles.materialMetricText}>
                  {formatNumber(material.weight)} kg
                </Text>
                <Text style={styles.materialMetricText}>
                  {formatNumber(material.co2Saved)} kg CO₂
                </Text>
              </View>
            </View>
          ))}
        </View>
      </View>
    );
  };
  
  const renderMilestones = () => {
    if (!metrics || !metrics.milestones) return null;
    
    return (
      <View style={styles.milestonesContainer}>
        <Text style={styles.milestonesTitle}>Environmental Achievements</Text>
        
        {metrics.milestones.map((milestone) => (
          <View key={milestone.id} style={styles.milestoneCard}>
            <View style={styles.milestoneHeader}>
              <View style={[
                styles.milestoneIconContainer, 
                milestone.achieved ? styles.milestoneAchieved : styles.milestoneInProgress
              ]}>
                <Ionicons 
                  name={milestone.icon as any || 'ribbon-outline'} 
                  size={22} 
                  color={milestone.achieved ? '#FFFFFF' : '#FF9500'} 
                />
              </View>
              <View style={styles.milestoneTitleContainer}>
                <Text style={styles.milestoneTitle}>{milestone.title}</Text>
                <Text style={styles.milestoneDescription}>{milestone.description}</Text>
              </View>
              {milestone.achieved && (
                <Ionicons name="checkmark-circle" size={24} color="#34C759" />
              )}
            </View>
            
            <View style={styles.milestoneProgressContainer}>
              <View style={styles.milestoneProgressBackground}>
                <View 
                  style={[
                    styles.milestoneProgress, 
                    { width: `${milestone.progress}%` },
                    milestone.achieved ? styles.milestoneProgressComplete : null
                  ]} 
                />
              </View>
              <Text style={styles.milestoneProgressText}>
                {formatNumber(milestone.progress)}%
              </Text>
            </View>
          </View>
        ))}
      </View>
    );
  };
  
  const renderImpactForecast = () => {
    if (!metrics || !metrics.predictedImpact) return null;
    
    const chartData = {
      labels: ['Current', '1 Month', '3 Months', '6 Months'],
      datasets: [
        {
          data: [
            metrics.co2Saved,
            metrics.predictedImpact.nextMonth.co2Saved,
            metrics.predictedImpact.threeMonths.co2Saved,
            metrics.predictedImpact.sixMonths.co2Saved
          ],
          color: (opacity = 1) => `rgba(52, 199, 89, ${opacity})`,
          strokeWidth: 2
        }
      ],
      legend: ['CO₂ Saved (kg)']
    };
    
    return (
      <View style={styles.forecastContainer}>
        <Text style={styles.forecastTitle}>Impact Forecast</Text>
        
        <View style={styles.chartContainer}>
          <LineChart
            data={chartData}
            width={screenWidth}
            height={220}
            chartConfig={{
              backgroundGradientFrom: '#FFFFFF',
              backgroundGradientTo: '#FFFFFF',
              decimalPlaces: 1,
              color: (opacity = 1) => `rgba(0, 0, 0, ${opacity})`,
              labelColor: (opacity = 1) => `rgba(0, 0, 0, ${opacity})`,
              style: {
                borderRadius: 16
              },
              propsForDots: {
                r: '6',
                strokeWidth: '2',
                stroke: '#34C759'
              }
            }}
            bezier
            style={{
              marginVertical: 8,
              borderRadius: 16
            }}
          />
        </View>
        
        <View style={styles.forecastCards}>
          <View style={styles.forecastCard}>
            <Text style={styles.forecastLabel}>Next Month</Text>
            <View style={styles.forecastMetrics}>
              <View style={styles.forecastMetric}>
                <Ionicons name="leaf-outline" size={16} color="#34C759" />
                <Text style={styles.forecastValue}>
                  {formatNumber(metrics.predictedImpact.nextMonth.co2Saved)} kg CO₂
                </Text>
              </View>
              <View style={styles.forecastMetric}>
                <Ionicons name="water-outline" size={16} color="#007AFF" />
                <Text style={styles.forecastValue}>
                  {formatNumber(metrics.predictedImpact.nextMonth.waterSaved)} L water
                </Text>
              </View>
            </View>
          </View>
          
          <View style={styles.forecastCard}>
            <Text style={styles.forecastLabel}>3 Months</Text>
            <View style={styles.forecastMetrics}>
              <View style={styles.forecastMetric}>
                <Ionicons name="leaf-outline" size={16} color="#34C759" />
                <Text style={styles.forecastValue}>
                  {formatNumber(metrics.predictedImpact.threeMonths.co2Saved)} kg CO₂
                </Text>
              </View>
              <View style={styles.forecastMetric}>
                <Ionicons name="water-outline" size={16} color="#007AFF" />
                <Text style={styles.forecastValue}>
                  {formatNumber(metrics.predictedImpact.threeMonths.waterSaved)} L water
                </Text>
              </View>
            </View>
          </View>
          
          <View style={styles.forecastCard}>
            <Text style={styles.forecastLabel}>6 Months</Text>
            <View style={styles.forecastMetrics}>
              <View style={styles.forecastMetric}>
                <Ionicons name="leaf-outline" size={16} color="#34C759" />
                <Text style={styles.forecastValue}>
                  {formatNumber(metrics.predictedImpact.sixMonths.co2Saved)} kg CO₂
                </Text>
              </View>
              <View style={styles.forecastMetric}>
                <Ionicons name="water-outline" size={16} color="#007AFF" />
                <Text style={styles.forecastValue}>
                  {formatNumber(metrics.predictedImpact.sixMonths.waterSaved)} L water
                </Text>
              </View>
            </View>
          </View>
        </View>
      </View>
    );
  };
  
  const renderActiveSection = () => {
    switch (activeSection) {
      case 'summary':
        return renderSummaryMetrics();
      case 'materials':
        return renderMaterialBreakdown();
      case 'milestones':
        return renderMilestones();
      case 'forecast':
        return renderImpactForecast();
      default:
        return null;
    }
  };
  
  return (
    <SafeAreaView style={styles.container}>
      <StatusBar style="auto" />
      <Stack.Screen 
        options={{
          title: "Environmental Impact",
          headerShown: true,
          headerBackTitle: "Analytics"
        }}
      />
      
      {renderTimeFrameSelector()}
      {renderSectionSelector()}
      
      {isLoading ? (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#34C759" />
          <Text style={styles.loadingText}>Loading impact data...</Text>
        </View>
      ) : (
        <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
          {renderActiveSection()}
        </ScrollView>
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFFFFF'
  },
  timeFrameSelector: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    paddingVertical: 12,
    paddingHorizontal: 16,
    backgroundColor: '#F2F2F7'
  },
  timeFrameButton: {
    paddingVertical: 6,
    paddingHorizontal: 16,
    borderRadius: 20,
    backgroundColor: '#FFFFFF'
  },
  timeFrameButtonActive: {
    backgroundColor: '#007AFF'
  },
  timeFrameButtonText: {
    fontSize: 14,
    color: '#007AFF'
  },
  timeFrameButtonTextActive: {
    color: '#FFFFFF'
  },
  sectionSelector: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    padding: 8,
    backgroundColor: '#FFFFFF',
    borderBottomWidth: 1,
    borderBottomColor: '#F2F2F7'
  },
  sectionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 6,
    paddingHorizontal: 12,
    borderRadius: 16,
    backgroundColor: '#F2F2F7'
  },
  sectionButtonActive: {
    backgroundColor: '#007AFF'
  },
  sectionButtonText: {
    fontSize: 13,
    marginLeft: 4,
    color: '#007AFF'
  },
  sectionButtonTextActive: {
    color: '#FFFFFF'
  },
  scrollView: {
    flex: 1
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center'
  },
  loadingText: {
    marginTop: 12,
    fontSize: 16,
    color: '#8E8E93'
  },
  summaryContainer: {
    padding: 16
  },
  metricsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 16
  },
  metricCard: {
    width: '48%',
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2
  },
  metricIconContainer: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 8
  },
  metricValue: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 4
  },
  metricLabel: {
    fontSize: 14,
    color: '#8E8E93'
  },
  comparisonBadge: {
    marginTop: 8,
    paddingVertical: 2,
    paddingHorizontal: 6,
    borderRadius: 4,
    alignSelf: 'flex-start'
  },
  comparisonBadgePositive: {
    backgroundColor: '#34C759' + '20'
  },
  comparisonBadgeNegative: {
    backgroundColor: '#FF3B30' + '20'
  },
  comparisonText: {
    fontSize: 12,
    color: '#8E8E93'
  },
  offsetsContainer: {
    marginTop: 16,
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2
  },
  offsetsTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 12
  },
  offsetsList: {
    marginTop: 8
  },
  offsetItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8
  },
  offsetText: {
    marginLeft: 8,
    fontSize: 14
  },
  materialsContainer: {
    padding: 16
  },
  materialsTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 16
  },
  chartContainer: {
    alignItems: 'center',
    marginBottom: 16
  },
  materialsList: {
    marginTop: 8
  },
  materialItem: {
    marginBottom: 16,
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2
  },
  materialHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8
  },
  materialName: {
    fontSize: 16,
    fontWeight: 'bold'
  },
  materialPercentage: {
    fontSize: 14,
    color: '#8E8E93'
  },
  materialProgressContainer: {
    height: 8,
    backgroundColor: '#F2F2F7',
    borderRadius: 4,
    overflow: 'hidden',
    marginBottom: 8
  },
  materialProgress: {
    height: '100%',
    backgroundColor: '#34C759'
  },
  materialMetrics: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 8
  },
  materialMetricText: {
    fontSize: 14,
    color: '#8E8E93'
  },
  milestonesContainer: {
    padding: 16
  },
  milestonesTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 16
  },
  milestoneCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2
  },
  milestoneHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12
  },
  milestoneIconContainer: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center'
  },
  milestoneAchieved: {
    backgroundColor: '#34C759'
  },
  milestoneInProgress: {
    backgroundColor: '#FF9500' + '20'
  },
  milestoneTitleContainer: {
    flex: 1,
    marginLeft: 12
  },
  milestoneTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 2
  },
  milestoneDescription: {
    fontSize: 14,
    color: '#8E8E93'
  },
  milestoneProgressContainer: {
    flexDirection: 'row',
    alignItems: 'center'
  },
  milestoneProgressBackground: {
    flex: 1,
    height: 8,
    backgroundColor: '#F2F2F7',
    borderRadius: 4,
    overflow: 'hidden',
    marginRight: 8
  },
  milestoneProgress: {
    height: '100%',
    backgroundColor: '#FF9500'
  },
  milestoneProgressComplete: {
    backgroundColor: '#34C759'
  },
  milestoneProgressText: {
    fontSize: 14,
    width: 45,
    textAlign: 'right'
  },
  forecastContainer: {
    padding: 16
  },
  forecastTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 16
  },
  forecastCards: {
    marginTop: 16
  },
  forecastCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2
  },
  forecastLabel: {
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 12
  },
  forecastMetrics: {
    marginTop: 8
  },
  forecastMetric: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8
  },
  forecastValue: {
    marginLeft: 8,
    fontSize: 14
  }
}); 