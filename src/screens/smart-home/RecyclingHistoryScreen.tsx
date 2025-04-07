import { ErrorView } from '@/components/ErrorView';
import { LoadingView } from '@/components/LoadingView';
import { useTheme } from '@/hooks/useTheme';
import { SmartHomeStackParamList } from '@/navigation/types';
import { SmartHomeService } from '@/services/smart-home/SmartHomeService';
import { Ionicons } from '@expo/vector-icons';
import { StackNavigationProp } from '@react-navigation/stack';
import React, { useEffect, useState } from 'react';
import {
    Dimensions,
    ScrollView,
    StyleSheet,
    Text,
    TouchableOpacity,
    View
} from 'react-native';
import { BarChart } from 'react-native-chart-kit';
import { SafeAreaView } from 'react-native-safe-area-context';

type RecyclingHistoryScreenProps = {
  navigation: StackNavigationProp<SmartHomeStackParamList, 'RecyclingHistory'>;
};

interface RecyclingData {
  date: string;
  plasticKg: number;
  paperKg: number;
  glassKg: number;
  metalKg: number;
  compositeKg: number;
  totalKg: number;
  ecoPoints: number;
}

interface RecyclingActivity {
  id: string;
  date: Date;
  type: 'deposit' | 'collection' | 'achievement';
  materialType?: string;
  quantity?: number; // in kg
  binId?: string;
  binName?: string;
  title: string;
  description: string;
  ecoPoints?: number;
}

export default function RecyclingHistoryScreen({ navigation }: RecyclingHistoryScreenProps) {
  const { theme } = useTheme();
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedTimeframe, setSelectedTimeframe] = useState<'week' | 'month' | 'year'>('month');
  const [recyclingData, setRecyclingData] = useState<RecyclingData[]>([]);
  const [activities, setActivities] = useState<RecyclingActivity[]>([]);
  const [materialsRecycled, setMaterialsRecycled] = useState<{ [key: string]: number }>({});
  const [totalEcoPoints, setTotalEcoPoints] = useState<number>(0);
  
  const screenWidth = Dimensions.get('window').width;
  
  useEffect(() => {
    loadRecyclingHistory();
  }, [selectedTimeframe]);
  
  const loadRecyclingHistory = async () => {
    try {
      setIsLoading(true);
      setError(null);
      
      const smartHomeService = SmartHomeService.getInstance();
      
      // Get recycling history data
      const history = await smartHomeService.getRecyclingHistory(selectedTimeframe);
      setRecyclingData(history.data);
      
      // Get recycling activities
      const activities = await smartHomeService.getRecyclingActivities(selectedTimeframe);
      setActivities(activities);
      
      // Calculate total recycled materials and eco points
      const materials: { [key: string]: number } = {};
      let points = 0;
      
      history.data.forEach(day => {
        materials.plastic = (materials.plastic || 0) + day.plasticKg;
        materials.paper = (materials.paper || 0) + day.paperKg;
        materials.glass = (materials.glass || 0) + day.glassKg;
        materials.metal = (materials.metal || 0) + day.metalKg;
        materials.composite = (materials.composite || 0) + day.compositeKg;
        points += day.ecoPoints;
      });
      
      setMaterialsRecycled(materials);
      setTotalEcoPoints(points);
      
      setIsLoading(false);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load recycling history');
      setIsLoading(false);
    }
  };
  
  const getChartData = () => {
    const labels: string[] = [];
    const plasticData: number[] = [];
    const paperData: number[] = [];
    const glassData: number[] = [];
    const metalData: number[] = [];
    
    // For month and year views, we want to group data
    let dataToShow = recyclingData;
    
    if (selectedTimeframe === 'month' && recyclingData.length > 14) {
      // Group by weeks for month view if we have a lot of data
      dataToShow = groupDataByWeeks(recyclingData);
    } else if (selectedTimeframe === 'year' && recyclingData.length > 12) {
      // Group by months for year view
      dataToShow = groupDataByMonths(recyclingData);
    }
    
    dataToShow.forEach(day => {
      labels.push(day.date);
      plasticData.push(day.plasticKg);
      paperData.push(day.paperKg);
      glassData.push(day.glassKg);
      metalData.push(day.metalKg);
    });
    
    return {
      labels,
      datasets: [
        {
          data: plasticData,
          color: (opacity = 1) => `rgba(233, 30, 99, ${opacity})`, // Pink for plastic
        },
        {
          data: paperData,
          color: (opacity = 1) => `rgba(33, 150, 243, ${opacity})`, // Blue for paper
        },
        {
          data: glassData,
          color: (opacity = 1) => `rgba(0, 150, 136, ${opacity})`, // Teal for glass
        },
        {
          data: metalData,
          color: (opacity = 1) => `rgba(158, 158, 158, ${opacity})`, // Grey for metal
        }
      ],
      legend: ['Plastic', 'Paper', 'Glass', 'Metal']
    };
  };
  
  // Helper function to group data by weeks
  const groupDataByWeeks = (data: RecyclingData[]): RecyclingData[] => {
    const weeks: { [key: string]: RecyclingData } = {};
    
    data.forEach(day => {
      const date = new Date(day.date);
      const weekNum = Math.floor(date.getDate() / 7) + 1;
      const weekKey = `Week ${weekNum}`;
      
      if (!weeks[weekKey]) {
        weeks[weekKey] = {
          date: weekKey,
          plasticKg: 0,
          paperKg: 0,
          glassKg: 0,
          metalKg: 0,
          compositeKg: 0,
          totalKg: 0,
          ecoPoints: 0
        };
      }
      
      weeks[weekKey].plasticKg += day.plasticKg;
      weeks[weekKey].paperKg += day.paperKg;
      weeks[weekKey].glassKg += day.glassKg;
      weeks[weekKey].metalKg += day.metalKg;
      weeks[weekKey].compositeKg += day.compositeKg;
      weeks[weekKey].totalKg += day.totalKg;
      weeks[weekKey].ecoPoints += day.ecoPoints;
    });
    
    return Object.values(weeks);
  };
  
  // Helper function to group data by months
  const groupDataByMonths = (data: RecyclingData[]): RecyclingData[] => {
    const months: { [key: string]: RecyclingData } = {};
    
    data.forEach(day => {
      const date = new Date(day.date);
      const monthNames = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
      const monthKey = monthNames[date.getMonth()];
      
      if (!months[monthKey]) {
        months[monthKey] = {
          date: monthKey,
          plasticKg: 0,
          paperKg: 0,
          glassKg: 0,
          metalKg: 0,
          compositeKg: 0,
          totalKg: 0,
          ecoPoints: 0
        };
      }
      
      months[monthKey].plasticKg += day.plasticKg;
      months[monthKey].paperKg += day.paperKg;
      months[monthKey].glassKg += day.glassKg;
      months[monthKey].metalKg += day.metalKg;
      months[monthKey].compositeKg += day.compositeKg;
      months[monthKey].totalKg += day.totalKg;
      months[monthKey].ecoPoints += day.ecoPoints;
    });
    
    return Object.values(months);
  };
  
  const formatDate = (dateString: string | Date) => {
    const date = new Date(dateString);
    return date.toLocaleDateString(undefined, { 
      year: 'numeric', 
      month: 'short', 
      day: 'numeric' 
    });
  };
  
  const getActivityIcon = (type: string, materialType?: string) => {
    switch (type) {
      case 'deposit':
        if (materialType === 'plastic') return 'water-outline';
        if (materialType === 'paper') return 'newspaper-outline';
        if (materialType === 'glass') return 'wine-outline';
        if (materialType === 'metal') return 'hardware-chip-outline';
        return 'cube-outline';
      case 'collection':
        return 'trash-bin-outline';
      case 'achievement':
        return 'trophy-outline';
      default:
        return 'ellipse-outline';
    }
  };
  
  const getActivityColor = (type: string) => {
    switch (type) {
      case 'deposit':
        return theme.colors.primary;
      case 'collection':
        return theme.colors.info;
      case 'achievement':
        return theme.colors.success;
      default:
        return theme.colors.secondaryText;
    }
  };
  
  const getTotalRecycled = () => {
    let total = 0;
    Object.values(materialsRecycled).forEach(value => {
      total += value;
    });
    return total.toFixed(1);
  };
  
  const getMaterialPercentage = (material: string) => {
    const total = Object.values(materialsRecycled).reduce((sum, value) => sum + value, 0);
    if (total === 0) return 0;
    
    const materialValue = materialsRecycled[material] || 0;
    return Math.round((materialValue / total) * 100);
  };
  
  if (isLoading) {
    return <LoadingView message="Loading recycling history..." />;
  }
  
  if (error) {
    return <ErrorView message={error} onRetry={loadRecyclingHistory} />;
  }
  
  return (
    <SafeAreaView style={[styles.container, { backgroundColor: theme.colors.background }]}>
      <View style={styles.header}>
        <Text style={[styles.title, { color: theme.colors.text }]}>
          Recycling History
        </Text>
      </View>
      
      <View style={styles.timeframeTabs}>
        {['week', 'month', 'year'].map((timeframe) => (
          <TouchableOpacity
            key={timeframe}
            style={[
              styles.timeframeTab,
              selectedTimeframe === timeframe && { 
                backgroundColor: theme.colors.primary,
                borderColor: theme.colors.primary
              }
            ]}
            onPress={() => setSelectedTimeframe(timeframe as any)}
          >
            <Text 
              style={{ 
                color: selectedTimeframe === timeframe ? theme.colors.white : theme.colors.text 
              }}
            >
              {timeframe.charAt(0).toUpperCase() + timeframe.slice(1)}
            </Text>
          </TouchableOpacity>
        ))}
      </View>
      
      <ScrollView style={styles.contentContainer}>
        <View style={styles.summaryCard}>
          <View style={styles.summaryRow}>
            <View style={styles.summaryItem}>
              <Text style={[styles.summaryLabel, { color: theme.colors.secondaryText }]}>
                Total Recycled
              </Text>
              <Text style={[styles.summaryValue, { color: theme.colors.primary }]}>
                {getTotalRecycled()} kg
              </Text>
            </View>
            
            <View style={styles.summaryItem}>
              <Text style={[styles.summaryLabel, { color: theme.colors.secondaryText }]}>
                Eco Points
              </Text>
              <Text style={[styles.summaryValue, { color: theme.colors.success }]}>
                {totalEcoPoints}
              </Text>
            </View>
          </View>
          
          <TouchableOpacity
            style={[styles.impactButton, { backgroundColor: theme.colors.primaryLight }]}
            onPress={() => navigation.navigate('SustainabilityScreen')}
          >
            <Text style={{ color: theme.colors.primary }}>
              View Environmental Impact
            </Text>
          </TouchableOpacity>
        </View>
        
        <View style={styles.chartContainer}>
          <Text style={[styles.sectionTitle, { color: theme.colors.text }]}>
            Materials Breakdown
          </Text>
          
          {recyclingData.length > 0 ? (
            <View>
              <BarChart
                data={getChartData()}
                width={screenWidth - 32}
                height={220}
                chartConfig={{
                  backgroundColor: theme.colors.card,
                  backgroundGradientFrom: theme.colors.card,
                  backgroundGradientTo: theme.colors.card,
                  decimalPlaces: 1,
                  color: (opacity = 1) => `rgba(0, 0, 0, ${opacity})`,
                  labelColor: (opacity = 1) => theme.colors.text,
                  style: {
                    borderRadius: 16,
                  },
                  barPercentage: 0.6,
                }}
                style={styles.chart}
                fromZero
                showValuesOnTopOfBars
              />
              
              <View style={styles.materialsLegend}>
                {[
                  { key: 'plastic', label: 'Plastic', color: 'rgba(233, 30, 99, 1)' },
                  { key: 'paper', label: 'Paper', color: 'rgba(33, 150, 243, 1)' },
                  { key: 'glass', label: 'Glass', color: 'rgba(0, 150, 136, 1)' },
                  { key: 'metal', label: 'Metal', color: 'rgba(158, 158, 158, 1)' }
                ].map(material => (
                  <View key={material.key} style={styles.legendItem}>
                    <View 
                      style={[
                        styles.legendColor, 
                        { backgroundColor: material.color }
                      ]} 
                    />
                    <Text style={{ color: theme.colors.text }}>
                      {material.label} ({getMaterialPercentage(material.key)}%)
                    </Text>
                  </View>
                ))}
              </View>
            </View>
          ) : (
            <View style={styles.emptyChart}>
              <Ionicons 
                name="bar-chart-outline" 
                size={48} 
                color={theme.colors.secondaryText} 
              />
              <Text style={{ color: theme.colors.secondaryText, marginTop: 8 }}>
                No recycling data available for this timeframe
              </Text>
            </View>
          )}
        </View>
        
        <View style={styles.activitiesSection}>
          <Text style={[styles.sectionTitle, { color: theme.colors.text }]}>
            Recent Activities
          </Text>
          
          {activities.length === 0 ? (
            <View style={styles.emptyState}>
              <Text style={{ color: theme.colors.secondaryText }}>
                No recent activities
              </Text>
            </View>
          ) : (
            activities.map(activity => (
              <View 
                key={activity.id} 
                style={[styles.activityItem, { backgroundColor: theme.colors.card }]}
              >
                <View 
                  style={[
                    styles.activityIconContainer, 
                    { backgroundColor: getActivityColor(activity.type) + '20' }
                  ]}
                >
                  <Ionicons 
                    name={getActivityIcon(activity.type, activity.materialType)} 
                    size={24} 
                    color={getActivityColor(activity.type)} 
                  />
                </View>
                
                <View style={styles.activityContent}>
                  <Text style={[styles.activityTitle, { color: theme.colors.text }]}>
                    {activity.title}
                  </Text>
                  <Text style={{ color: theme.colors.secondaryText }}>
                    {activity.description}
                  </Text>
                  <Text style={[styles.activityDate, { color: theme.colors.secondaryText }]}>
                    {formatDate(activity.date)}
                  </Text>
                </View>
                
                {activity.ecoPoints && (
                  <View style={styles.pointsContainer}>
                    <Text style={[styles.pointsValue, { color: theme.colors.success }]}>
                      +{activity.ecoPoints}
                    </Text>
                    <Text style={{ color: theme.colors.secondaryText, fontSize: 10 }}>
                      POINTS
                    </Text>
                  </View>
                )}
              </View>
            ))
          )}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(0, 0, 0, 0.1)',
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
  },
  timeframeTabs: {
    flexDirection: 'row',
    paddingHorizontal: 16,
    paddingVertical: 12,
    justifyContent: 'space-between',
  },
  timeframeTab: {
    flex: 1,
    paddingVertical: 8,
    alignItems: 'center',
    borderRadius: 16,
    borderWidth: 1,
    borderColor: 'rgba(0, 0, 0, 0.1)',
    marginHorizontal: 4,
  },
  contentContainer: {
    flex: 1,
    padding: 16,
  },
  summaryCard: {
    backgroundColor: 'rgba(0, 0, 0, 0.05)',
    borderRadius: 12,
    padding: 16,
    marginBottom: 20,
  },
  summaryRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 16,
  },
  summaryItem: {
    flex: 1,
  },
  summaryLabel: {
    fontSize: 14,
    marginBottom: 4,
  },
  summaryValue: {
    fontSize: 24,
    fontWeight: 'bold',
  },
  impactButton: {
    paddingVertical: 10,
    paddingHorizontal: 16,
    borderRadius: 8,
    alignItems: 'center',
  },
  chartContainer: {
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 12,
  },
  chart: {
    borderRadius: 12,
    marginVertical: 8,
  },
  emptyChart: {
    height: 200,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.05)',
    borderRadius: 12,
  },
  materialsLegend: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    marginTop: 8,
  },
  legendItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginRight: 8,
    marginBottom: 8,
  },
  legendColor: {
    width: 12,
    height: 12,
    borderRadius: 6,
    marginRight: 4,
  },
  activitiesSection: {
    marginBottom: 24,
  },
  emptyState: {
    padding: 40,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.05)',
    borderRadius: 12,
  },
  activityItem: {
    flexDirection: 'row',
    padding: 16,
    borderRadius: 12,
    marginBottom: 8,
  },
  activityIconContainer: {
    width: 48,
    height: 48,
    borderRadius: 24,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  activityContent: {
    flex: 1,
  },
  activityTitle: {
    fontSize: 16,
    fontWeight: '500',
    marginBottom: 4,
  },
  activityDate: {
    fontSize: 12,
    marginTop: 4,
  },
  pointsContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    marginLeft: 8,
  },
  pointsValue: {
    fontSize: 16,
    fontWeight: 'bold',
  },
}); 