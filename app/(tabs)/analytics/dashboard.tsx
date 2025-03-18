import GoalSettingCard from '@/components/analytics/GoalSettingCard';
import { RecyclingDashboard } from '@/components/analytics/RecyclingDashboard';
import { RouteVisualization } from '@/components/analytics/RouteVisualization';
import { useAuth } from '@/contexts/AuthContext';
import { useTheme } from '@/contexts/ThemeContext';
import { CollectionAnalyticsService } from '@/services/CollectionAnalyticsService';
import { RouteOptimizationService } from '@/services/RouteOptimizationService';
import { Theme } from '@/theme/types';
import { Collection } from '@/types/Collection';
import {
    AggregatedAnalytics,
    CollectionData,
    MetricType,
    RecyclingGoal,
    TimeFrame
} from '@/types/analytics';
import { Ionicons } from '@expo/vector-icons';
import React, { useEffect, useState } from 'react';
import {
    ActivityIndicator,
    Alert,
    ScrollView,
    StyleSheet,
    Text,
    TouchableOpacity,
    View
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

// Helper function to transform Collection to CollectionData
function transformCollectionToData(collection: Collection): CollectionData {
  return {
    id: collection.id,
    date: collection.scheduledDateTime.toISOString(),
    weight: collection.totalWeight || 0,
    materials: collection.materials.map(m => ({
      name: m.material.name,
      value: m.quantity.quantity,
      color: '#007AFF'
    })),
    location: `${collection.location.street}, ${collection.location.city}, ${collection.location.state}`,
    status: collection.status,
    environmentalImpact: {
      co2Saved: (collection.totalWeight || 0) * 2.5, // kg CO2 per kg of plastic
      waterSaved: (collection.totalWeight || 0) * 100, // liters of water saved per kg
      treesEquivalent: ((collection.totalWeight || 0) * 2.5) / 1000 * 50 // trees per ton of CO2
    }
  };
}

// Helper function to calculate date range based on time frame
function calculateDateRange(timeFrame: TimeFrame): { startDate: Date; endDate: Date } {
  const startDate = new Date();
  const endDate = new Date();
  
  switch (timeFrame) {
    case 'week':
      endDate.setDate(startDate.getDate() + 7);
      break;
    case 'month':
      endDate.setMonth(startDate.getMonth() + 1);
      break;
    case 'year':
      endDate.setFullYear(startDate.getFullYear() + 1);
      break;
  }
  
  return { startDate, endDate };
}

// Helper function to transform report to analytics data
function transformReportToAnalytics(report: {
  metrics: {
    totalWeight: number;
    totalCollections: number;
    environmentalImpact: {
      co2Reduced: number;
      treesEquivalent: number;
    };
    materialBreakdown?: Array<{
      name: string;
      quantity: number;
    }>;
  };
  trends: {
    daily: Array<{ date?: Date; totalWeight: number }>;
    weekly: Array<{ date?: Date; totalWeight: number }>;
    monthly: Array<{ date?: Date; totalWeight: number }>;
  };
  collections: Collection[];
}): AggregatedAnalytics {
  return {
    summary: {
      totalWeight: report.metrics.totalWeight,
      totalCollections: report.metrics.totalCollections,
      co2Saved: report.metrics.environmentalImpact.co2Reduced,
      waterSaved: report.metrics.totalWeight * 100,
      treesEquivalent: report.metrics.environmentalImpact.treesEquivalent,
      energySaved: report.metrics.totalWeight * 5,
      wasteReduced: report.metrics.totalWeight
    },
    materialBreakdown: report.metrics.materialBreakdown?.map((m: { name: string; quantity: number }) => ({
      name: m.name,
      value: m.quantity,
      color: '#007AFF'
    })) || [],
    historyData: {
      day: {
        labels: report.trends.daily.map((t: { date?: Date }) => t.date?.toISOString().split('T')[0] || ''),
        datasets: [{
          data: report.trends.daily.map((t: { totalWeight: number }) => t.totalWeight),
          color: '#007AFF'
        }]
      },
      week: {
        labels: report.trends.weekly.map((t: { date?: Date }) => t.date?.toISOString().split('T')[0] || ''),
        datasets: [{
          data: report.trends.weekly.map((t: { totalWeight: number }) => t.totalWeight),
          color: '#007AFF'
        }]
      },
      month: {
        labels: report.trends.monthly.map((t: { date?: Date }) => t.date?.toISOString().split('T')[0] || ''),
        datasets: [{
          data: report.trends.monthly.map((t: { totalWeight: number }) => t.totalWeight),
          color: '#007AFF'
        }]
      },
      year: {
        labels: [],
        datasets: []
      },
      all: {
        labels: [],
        datasets: []
      }
    },
    goals: [],
    communityComparison: [],
    collections: report.collections.map(transformCollectionToData)
  };
}

// Move styles outside of component
const createStyles = (theme: Theme) => StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: theme.colors.background,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: 'bold'
  },
  tabContainer: {
    flexDirection: 'row',
    borderBottomWidth: 1
  },
  tab: {
    flex: 1,
    padding: 10,
    alignItems: 'center',
    borderRadius: 5,
  },
  activeTab: {
    backgroundColor: theme.colors.primary,
  },
  tabText: {
    color: theme.colors.text.primary,
    fontWeight: '500',
  },
  activeTabText: {
    color: theme.colors.background,
  },
  tabContent: {
    flex: 1,
    padding: 16
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center'
  },
  loadingText: {
    marginTop: 16,
    fontSize: 16
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 16
  },
  goalsHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16
  },
  addGoalButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20
  },
  addGoalButtonText: {
    color: 'white',
    fontWeight: '500',
    marginLeft: 4
  },
  goalsList: {
    marginBottom: 16
  },
  goalCard: {
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2
  },
  goalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 8
  },
  goalTitle: {
    fontSize: 16,
    fontWeight: '600',
    flex: 1
  },
  goalActions: {
    flexDirection: 'row'
  },
  goalActionButton: {
    padding: 4,
    marginLeft: 8
  },
  goalDescription: {
    fontSize: 14,
    marginBottom: 12
  },
  goalProgress: {
    marginBottom: 12
  },
  goalProgressHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 4
  },
  goalProgressText: {
    fontSize: 14,
    fontWeight: '500'
  },
  goalProgressPercent: {
    fontSize: 14,
    fontWeight: '700'
  },
  goalProgressBar: {
    height: 8,
    borderRadius: 4,
    overflow: 'hidden'
  },
  goalProgressFill: {
    height: '100%',
    borderRadius: 4
  },
  goalFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between'
  },
  goalCategory: {
    flexDirection: 'row',
    alignItems: 'center'
  },
  goalCategoryText: {
    fontSize: 12,
    marginLeft: 4
  },
  goalDates: {
    fontSize: 12
  },
  emptyGoalsContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    padding: 32
  },
  emptyGoalsText: {
    fontSize: 18,
    fontWeight: '600',
    marginTop: 16
  },
  emptyGoalsSubtext: {
    fontSize: 14,
    textAlign: 'center',
    marginTop: 8
  },
  exportCard: {
    borderRadius: 12,
    padding: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2
  },
  exportLabel: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 12
  },
  exportOptions: {
    flexDirection: 'row',
    flexWrap: 'wrap'
  },
  exportOption: {
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderRadius: 20,
    marginRight: 8,
    marginBottom: 8
  },
  exportOptionText: {
    fontSize: 14
  },
  exportButtonContainer: {
    marginTop: 24,
    marginBottom: 16
  },
  exportButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 12,
    borderRadius: 8
  },
  exportButtonText: {
    color: 'white',
    fontWeight: '600',
    marginLeft: 8
  },
  exportNote: {
    fontSize: 12,
    textAlign: 'center'
  },
  tabBar: {
    flexDirection: 'row',
    backgroundColor: theme.colors.card,
    padding: 10,
    borderRadius: 10,
    margin: 10,
  },
  routesHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16
  },
  optimizeButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20
  },
  optimizeButtonText: {
    color: 'white',
    fontWeight: '500',
    marginLeft: 4
  },
  emptyRoutesContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    padding: 32
  },
  emptyRoutesText: {
    fontSize: 18,
    fontWeight: '600',
    marginTop: 16
  },
  emptyRoutesSubtext: {
    fontSize: 14,
    textAlign: 'center',
    marginTop: 8
  },
  routesList: {
    marginBottom: 16
  },
  routeCard: {
    marginBottom: 16,
    borderRadius: 12,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2
  }
});

export default function AnalyticsDashboardScreen() {
  const { user } = useAuth();
  const { theme } = useTheme();
  const styles = createStyles(theme);
  const [analyticsData, setAnalyticsData] = useState<AggregatedAnalytics | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'overview' | 'goals' | 'export' | 'routes'>('overview');
  const [timeFrame, setTimeFrame] = useState<TimeFrame>('month');
  const [metrics, setMetrics] = useState<MetricType[]>(['weight', 'collections', 'impact']);
  const [exportFormat, setExportFormat] = useState<'pdf' | 'csv'>('pdf');
  const [showGoalForm, setShowGoalForm] = useState(false);
  const [selectedGoal, setSelectedGoal] = useState<RecyclingGoal | null>(null);
  const [optimizedRoutes, setOptimizedRoutes] = useState<any[]>([]);
  const [isOptimizing, setIsOptimizing] = useState(false);
  
  // Initialize services
  const routeOptimizationService = RouteOptimizationService.getInstance();
  
  // Fetch analytics data
  useEffect(() => {
    const fetchAnalytics = async () => {
      if (!user?.id) return;
      
      setIsLoading(true);
      try {
        const { startDate, endDate } = calculateDateRange(timeFrame);
        const report = await CollectionAnalyticsService.generateReport(startDate, endDate);
        const analyticsData = transformReportToAnalytics(report);
        setAnalyticsData(analyticsData);
      } catch (error) {
        console.error('Error fetching analytics:', error);
        Alert.alert('Error', 'Failed to load analytics data');
      } finally {
        setIsLoading(false);
      }
    };
    
    fetchAnalytics();
  }, [user?.id, timeFrame]);
  
  // Handle time frame change
  const handleTimeFrameChange = (newTimeFrame: TimeFrame) => {
    setTimeFrame(newTimeFrame);
  };
  
  // Handle metric change
  const handleMetricChange = (newMetric: MetricType) => {
    if (metrics.includes(newMetric)) {
      setMetrics(metrics.filter(m => m !== newMetric));
    } else {
      setMetrics([...metrics, newMetric]);
    }
  };
  
  // Handle export data
  const handleExportData = async () => {
    if (!user?.id || !analyticsData) return;
    
    try {
      await CollectionAnalyticsService.exportData(exportFormat);
    } catch (error) {
      console.error('Error exporting data:', error);
      Alert.alert('Export Error', 'Failed to export data. Please try again.');
    }
  };
  
  // Handle goal creation
  const handleCreateGoal = async (goal: Omit<RecyclingGoal, 'id' | 'progress'>) => {
    if (!user?.id) return;
    
    try {
      const newGoal: RecyclingGoal = {
        ...goal,
        id: Date.now().toString(),
        progress: 0
      };
      
      await CollectionAnalyticsService.createGoal(newGoal);
      
      // Refresh data
      const { startDate, endDate } = calculateDateRange(timeFrame);
      const report = await CollectionAnalyticsService.generateReport(startDate, endDate);
      const analyticsData = transformReportToAnalytics(report);
      setAnalyticsData(analyticsData);
      setShowGoalForm(false);
    } catch (error) {
      console.error('Error creating goal:', error);
      Alert.alert('Error', 'Failed to create goal. Please try again.');
    }
  };
  
  // Handle goal update
  const handleUpdateGoal = async (goalId: string, updatedData: Partial<RecyclingGoal>) => {
    if (!user?.id) return;
    
    try {
      await CollectionAnalyticsService.updateGoal(goalId, updatedData);
      
      // Refresh data
      const { startDate, endDate } = calculateDateRange(timeFrame);
      const report = await CollectionAnalyticsService.generateReport(startDate, endDate);
      const analyticsData = transformReportToAnalytics(report);
      setAnalyticsData(analyticsData);
      setSelectedGoal(null);
    } catch (error) {
      console.error('Error updating goal:', error);
      Alert.alert('Error', 'Failed to update goal. Please try again.');
    }
  };
  
  // Handle goal deletion
  const handleDeleteGoal = async (goalId: string) => {
    if (!user?.id) return;
    
    Alert.alert(
      'Delete Goal',
      'Are you sure you want to delete this goal?',
      [
        {
          text: 'Cancel',
          style: 'cancel'
        },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: async () => {
            try {
              await CollectionAnalyticsService.deleteGoal(goalId);
              
              // Refresh data
              const { startDate, endDate } = calculateDateRange(timeFrame);
              const report = await CollectionAnalyticsService.generateReport(startDate, endDate);
              const analyticsData = transformReportToAnalytics(report);
              setAnalyticsData(analyticsData);
            } catch (error) {
              console.error('Error deleting goal:', error);
              Alert.alert('Error', 'Failed to delete goal. Please try again.');
            }
          }
        }
      ]
    );
  };
  
  // Handle route optimization
  const handleOptimizeRoutes = async () => {
    if (!user?.id) return;
    
    setIsOptimizing(true);
    try {
      const { startDate, endDate } = calculateDateRange(timeFrame);
      const report = await CollectionAnalyticsService.generateReport(startDate, endDate);
      const pendingCollections = report.collections.filter(c => c.status === 'pending');

      if (pendingCollections.length === 0) {
        Alert.alert('No Collections', 'There are no pending collections to optimize.');
        return;
      }

      // Optimize routes
      const routes = await routeOptimizationService.optimizeRoutes(
        pendingCollections,
        {
          startTime: startDate.toISOString(),
          endTime: endDate.toISOString(),
          maxCollections: 10,
          currentCollections: 0
        },
        {
          trafficPrediction: true,
          mlModel: 'simple'
        }
      );

      if (!routes || routes.length === 0) {
        Alert.alert('No Routes', 'No optimized routes were generated.');
        return;
      }

      setOptimizedRoutes(routes);
    } catch (error) {
      console.error('Error optimizing routes:', error);
      Alert.alert(
        'Route Optimization Error',
        'Failed to optimize routes. Please check your internet connection and try again.'
      );
    } finally {
      setIsOptimizing(false);
    }
  };
  
  if (isLoading) {
    return (
      <SafeAreaView style={{ flex: 1, backgroundColor: theme.colors.background }}>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={theme.colors.primary} />
          <Text style={[styles.loadingText, { color: theme.colors.text.primary }]}>
            Loading analytics...
          </Text>
        </View>
      </SafeAreaView>
    );
  }
  
  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: theme.colors.background }}>
      <View style={styles.container}>
        <View style={styles.header}>
          <Text style={[styles.headerTitle, { color: theme.colors.text.primary }]}>
            Recycling Analytics
          </Text>
        </View>
        
        {/* Tabs */}
        <View style={[styles.tabContainer, { borderBottomColor: theme.colors.border }]}>
          <TouchableOpacity
            style={[styles.tab, activeTab === 'overview' && styles.activeTab]}
            onPress={() => setActiveTab('overview')}
          >
            <Text style={[styles.tabText, activeTab === 'overview' && styles.activeTabText]}>
              Overview
            </Text>
          </TouchableOpacity>
          
          <TouchableOpacity
            style={[styles.tab, activeTab === 'goals' && styles.activeTab]}
            onPress={() => setActiveTab('goals')}
          >
            <Text style={[styles.tabText, activeTab === 'goals' && styles.activeTabText]}>
              Goals
            </Text>
          </TouchableOpacity>
          
          <TouchableOpacity
            style={[styles.tab, activeTab === 'export' && styles.activeTab]}
            onPress={() => setActiveTab('export')}
          >
            <Text style={[styles.tabText, activeTab === 'export' && styles.activeTabText]}>
              Export
            </Text>
          </TouchableOpacity>
          
          <TouchableOpacity
            style={[styles.tab, activeTab === 'routes' && styles.activeTab]}
            onPress={() => setActiveTab('routes')}
          >
            <Text style={[styles.tabText, activeTab === 'routes' && styles.activeTabText]}>
              Routes
            </Text>
          </TouchableOpacity>
        </View>
        
        {/* Dashboard Content */}
        {activeTab === 'overview' && analyticsData && (
          <RecyclingDashboard 
            userData={{
              totalWeight: analyticsData.summary.totalWeight,
              totalCollections: analyticsData.summary.totalCollections,
              co2Saved: analyticsData.summary.co2Saved,
              waterSaved: analyticsData.summary.waterSaved,
              treesEquivalent: analyticsData.summary.treesEquivalent,
              materialBreakdown: analyticsData.materialBreakdown,
              historyData: analyticsData.historyData
            }}
            onTimeFrameChange={handleTimeFrameChange}
            onMetricChange={handleMetricChange}
            onExportData={() => setActiveTab('export')}
          />
        )}
        
        {/* Goals Tab */}
        {activeTab === 'goals' && analyticsData && (
          <ScrollView style={styles.tabContent}>
            <View style={styles.goalsHeader}>
              <Text style={[styles.sectionTitle, { color: theme.colors.text.primary }]}>
                Recycling Goals
              </Text>
              <TouchableOpacity 
                style={[styles.addGoalButton, { backgroundColor: theme.colors.primary }]}
                onPress={() => setShowGoalForm(true)}
              >
                <Ionicons name="add" size={20} color="white" />
                <Text style={[styles.addGoalButtonText, { color: theme.colors.text.primary }]}>New Goal</Text>
              </TouchableOpacity>
            </View>
            
            {showGoalForm ? (
              <GoalSettingCard
                onSave={handleCreateGoal}
                onCancel={() => setShowGoalForm(false)}
                initialData={{
                  title: '',
                  description: '',
                  targetValue: 10,
                  currentValue: 0,
                  unit: 'kg',
                  startDate: new Date().toISOString(),
                  endDate: new Date(new Date().setMonth(new Date().getMonth() + 1)).toISOString(),
                  category: 'weight',
                  status: 'active'
                }}
              />
            ) : (
              <>
                {analyticsData.goals.length === 0 ? (
                  <View style={styles.emptyGoalsContainer}>
                    <Ionicons name="flag-outline" size={64} color={theme.colors.text.secondary + '30'} />
                    <Text style={[styles.emptyGoalsText, { color: theme.colors.text.primary }]}>
                      No goals set yet
                    </Text>
                    <Text style={[styles.emptyGoalsSubtext, { color: theme.colors.text.secondary + '99' }]}>
                      Set recycling goals to track your progress
                    </Text>
                  </View>
                ) : (
                  <View style={styles.goalsList}>
                    {analyticsData.goals.map(goal => (
                      <GoalCard
                        key={goal.id}
                        goal={goal}
                        onEdit={() => setSelectedGoal(goal)}
                        onDelete={() => handleDeleteGoal(goal.id)}
                        styles={styles}
                      />
                    ))}
                  </View>
                )}
              </>
            )}
            
            {selectedGoal && (
              <GoalSettingCard
                onSave={(data) => handleUpdateGoal(selectedGoal.id, data)}
                onCancel={() => setSelectedGoal(null)}
                initialData={selectedGoal}
                isEditing
              />
            )}
          </ScrollView>
        )}
        
        {/* Export Tab */}
        {activeTab === 'export' && (
          <ScrollView style={styles.tabContent}>
            <Text style={[styles.sectionTitle, { color: theme.colors.text.primary }]}>
              Export Data
            </Text>
            
            <View style={[styles.exportCard, { backgroundColor: theme.colors.background }]}>
              <Text style={[styles.exportLabel, { color: theme.colors.text.primary }]}>
                Time Frame
              </Text>
              
              <View style={styles.exportOptions}>
                <TouchableOpacity
                  style={[
                    styles.exportOption,
                    timeFrame === 'week' && { backgroundColor: theme.colors.primary + '20' }
                  ]}
                  onPress={() => setTimeFrame('week')}
                >
                  <Text 
                    style={[
                      styles.exportOptionText, 
                      { color: timeFrame === 'week' ? theme.colors.primary : theme.colors.text.secondary + '99' }
                    ]}
                  >
                    Week
                  </Text>
                </TouchableOpacity>
                
                <TouchableOpacity
                  style={[
                    styles.exportOption,
                    timeFrame === 'month' && { backgroundColor: theme.colors.primary + '20' }
                  ]}
                  onPress={() => setTimeFrame('month')}
                >
                  <Text 
                    style={[
                      styles.exportOptionText, 
                      { color: timeFrame === 'month' ? theme.colors.primary : theme.colors.text.secondary + '99' }
                    ]}
                  >
                    Month
                  </Text>
                </TouchableOpacity>
                
                <TouchableOpacity
                  style={[
                    styles.exportOption,
                    timeFrame === 'year' && { backgroundColor: theme.colors.primary + '20' }
                  ]}
                  onPress={() => setTimeFrame('year')}
                >
                  <Text 
                    style={[
                      styles.exportOptionText, 
                      { color: timeFrame === 'year' ? theme.colors.primary : theme.colors.text.secondary + '99' }
                    ]}
                  >
                    Year
                  </Text>
                </TouchableOpacity>
              </View>
              
              <Text style={[styles.exportLabel, { color: theme.colors.text.primary, marginTop: 16 }]}>
                Format
              </Text>
              
              <View style={styles.exportOptions}>
                <TouchableOpacity
                  style={[
                    styles.exportOption,
                    exportFormat === 'pdf' && { backgroundColor: theme.colors.primary + '20' }
                  ]}
                  onPress={() => setExportFormat('pdf')}
                >
                  <Text 
                    style={[
                      styles.exportOptionText, 
                      { color: exportFormat === 'pdf' ? theme.colors.primary : theme.colors.text.secondary + '99' }
                    ]}
                  >
                    PDF
                  </Text>
                </TouchableOpacity>
                
                <TouchableOpacity
                  style={[
                    styles.exportOption,
                    exportFormat === 'csv' && { backgroundColor: theme.colors.primary + '20' }
                  ]}
                  onPress={() => setExportFormat('csv')}
                >
                  <Text 
                    style={[
                      styles.exportOptionText, 
                      { color: exportFormat === 'csv' ? theme.colors.primary : theme.colors.text.secondary + '99' }
                    ]}
                  >
                    CSV
                  </Text>
                </TouchableOpacity>
              </View>
              
              <View style={styles.exportButtonContainer}>
                <TouchableOpacity
                  style={[styles.exportButton, { backgroundColor: theme.colors.primary }]}
                  onPress={handleExportData}
                >
                  <Ionicons name="download-outline" size={20} color="white" />
                  <Text style={[styles.exportButtonText, { color: theme.colors.text.primary }]}>
                    Export {exportFormat.toUpperCase()} Report
                  </Text>
                </TouchableOpacity>
              </View>
              
              <Text style={[styles.exportNote, { color: theme.colors.text.secondary + '99' }]}>
                Your report will include recycling metrics, material breakdown, and environmental impact data.
              </Text>
            </View>
          </ScrollView>
        )}
        
        {/* Routes Tab */}
        {activeTab === 'routes' && (
          <ScrollView style={styles.tabContent}>
            <View style={styles.routesHeader}>
              <Text style={[styles.sectionTitle, { color: theme.colors.text.primary }]}>
                Route Optimization
              </Text>
              <TouchableOpacity
                style={[styles.optimizeButton, { backgroundColor: theme.colors.primary }]}
                onPress={handleOptimizeRoutes}
                disabled={isOptimizing}
              >
                {isOptimizing ? (
                  <ActivityIndicator color="white" size="small" />
                ) : (
                  <>
                    <Ionicons name="map-outline" size={20} color="white" />
                    <Text style={[styles.optimizeButtonText, { color: theme.colors.text.primary }]}>Optimize Routes</Text>
                  </>
                )}
              </TouchableOpacity>
            </View>

            {optimizedRoutes.length === 0 ? (
              <View style={styles.emptyRoutesContainer}>
                <Ionicons name="map-outline" size={64} color={theme.colors.text.secondary + '30'} />
                <Text style={[styles.emptyRoutesText, { color: theme.colors.text.primary }]}>
                  No optimized routes yet
                </Text>
                <Text style={[styles.emptyRoutesSubtext, { color: theme.colors.text.secondary + '99' }]}>
                  Generate optimized routes for your collections
                </Text>
              </View>
            ) : (
              <View style={styles.routesList}>
                {optimizedRoutes.map((route, index) => (
                  <RouteVisualization
                    key={index}
                    route={route}
                    style={styles.routeCard}
                  />
                ))}
              </View>
            )}
          </ScrollView>
        )}
      </View>
    </SafeAreaView>
  );
}

// Goal Card Component
interface GoalCardProps {
  goal: RecyclingGoal;
  onEdit: () => void;
  onDelete: () => void;
  styles: ReturnType<typeof createStyles>;
}

function GoalCard({ goal, onEdit, onDelete, styles }: GoalCardProps) {
  const { theme } = useTheme();
  
  // Get a background color based on progress
  const getProgressColor = () => {
    if (goal.progress >= 100) return theme.colors.success;
    if (goal.progress >= 70) return theme.colors.primary;
    if (goal.progress >= 30) return theme.colors.warning;
    return theme.colors.error;
  };
  
  return (
    <View style={[styles.goalCard, { backgroundColor: theme.colors.background }]}>
      <View style={styles.goalHeader}>
        <Text style={[styles.goalTitle, { color: theme.colors.text.primary }]}>
          {goal.title}
        </Text>
        <View style={styles.goalActions}>
          <TouchableOpacity onPress={onEdit} style={styles.goalActionButton}>
            <Ionicons name="pencil" size={18} color={theme.colors.primary} />
          </TouchableOpacity>
          <TouchableOpacity onPress={onDelete} style={styles.goalActionButton}>
            <Ionicons name="trash-outline" size={18} color={theme.colors.error} />
          </TouchableOpacity>
        </View>
      </View>
      
      {goal.description && (
        <Text style={[styles.goalDescription, { color: theme.colors.text.secondary }]}>
          {goal.description}
        </Text>
      )}
      
      <View style={styles.goalProgress}>
        <View style={styles.goalProgressHeader}>
          <Text style={[styles.goalProgressText, { color: theme.colors.text.primary }]}>
            {goal.currentValue} / {goal.targetValue} {goal.unit}
          </Text>
          <Text style={[styles.goalProgressPercent, { color: getProgressColor() }]}>
            {Math.round(goal.progress)}%
          </Text>
        </View>
        
        <View style={[styles.goalProgressBar, { backgroundColor: theme.colors.border }]}>
          <View 
            style={[
              styles.goalProgressFill, 
              { 
                width: `${Math.min(100, goal.progress)}%`,
                backgroundColor: getProgressColor()
              }
            ]} 
          />
        </View>
      </View>
      
      <View style={styles.goalFooter}>
        <View style={styles.goalCategory}>
          <Ionicons 
            name={getCategoryIcon(goal.category)} 
            size={14} 
            color={theme.colors.text.secondary + '99'} 
          />
          <Text style={[styles.goalCategoryText, { color: theme.colors.text.secondary }]}>
            {formatCategory(goal.category)}
            {goal.specificMaterial ? `: ${goal.specificMaterial}` : ''}
          </Text>
        </View>
        
        <Text style={[styles.goalDates, { color: theme.colors.text.secondary }]}>
          {new Date(goal.startDate).toLocaleDateString()} - {new Date(goal.endDate).toLocaleDateString()}
        </Text>
      </View>
    </View>
  );
}

// Helper function to get an icon for a goal category
function getCategoryIcon(category: string): keyof typeof Ionicons.glyphMap {
  switch (category) {
    case 'weight':
      return 'scale-outline';
    case 'collections':
      return 'calendar-outline';
    case 'impact':
      return 'leaf-outline';
    case 'specific_material':
      return 'cube-outline';
    default:
      return 'flag-outline';
  }
}

// Helper function to format a goal category
function formatCategory(category: string): string {
  switch (category) {
    case 'weight':
      return 'Total Weight';
    case 'collections':
      return 'Collections';
    case 'impact':
      return 'Environmental Impact';
    case 'specific_material':
      return 'Material';
    default:
      return category.charAt(0).toUpperCase() + category.slice(1);
  }
} 