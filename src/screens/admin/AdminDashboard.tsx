import { StackNavigationProp } from '@react-navigation/stack';
import React, { useEffect, useState } from 'react';
import { ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { ThemedText } from '@/components/ui';

// Define the navigation param list for admin routes
type AdminStackParamList = {
  UserManagement: undefined;
  DetailedAnalytics: undefined;
  RouteManagement: undefined;
  CreditManagement: undefined;
};

// Type for the navigation prop
type AdminDashboardNavigationProp = StackNavigationProp<AdminStackParamList>;

interface DashboardData {
  totalUsers: number;
  activeUsers: number;
  totalCollections: number;
  totalWeight: number;
  performanceMetrics: {
    date: Date;
    value: number;
  }[];
}

// Interface for the module items
interface AdminModule {
  title: string;
  icon: string;
  route: keyof AdminStackParamList;
}

// Component props interface
interface AdminDashboardProps {
  navigation: AdminDashboardNavigationProp;
}

/**
 * Admin Dashboard component for the EcoCart platform
 */
export default function AdminDashboard({ navigation }: AdminDashboardProps): JSX.Element {
  const [data, setData] = useState<DashboardData | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [selectedTimeFrame, setSelectedTimeFrame] = useState<string>('month');
  
  const modules: AdminModule[] = [
    {
      title: 'User Management',
      icon: '👥',
      route: 'UserManagement',
    },
    {
      title: 'Collection Analytics',
      icon: '📊',
      route: 'DetailedAnalytics',
    },
    {
      title: 'Route Management',
      icon: '🗺️',
      route: 'RouteManagement',
    },
    {
      title: 'Credit System',
      icon: '💰',
      route: 'CreditManagement',
    },
  ];
  
  useEffect(() => {
    fetchDashboardData();
  }, []);
  
  /**
   * Fetches dashboard data from the mock service
   */
  const fetchDashboardData = async () => {
    setIsLoading(true);
    
    try {
      // Simulate API call
      setTimeout(() => {
        const mockData: DashboardData = {
          totalUsers: 1250,
          activeUsers: 870,
          totalCollections: 5320,
          totalWeight: 12450,
          performanceMetrics: Array(12).fill(0).map((_, i) => ({
            date: new Date(2023, i, 1),
            value: Math.round(Math.random() * 1000)
          }))
        };
        
        setData(mockData);
        setIsLoading(false);
      }, 500);
    } catch (error) {
      console.error('Error fetching dashboard data:', error);
      setIsLoading(false);
    }
  };
  
  /**
   * Handles time frame selection
   */
  const handleTimeFrameSelect = (timeFrame: string) => {
    setSelectedTimeFrame(timeFrame);
  };
  
  /**
   * Refreshes dashboard data
   */
  const handleRefresh = () => {
    fetchDashboardData();
  };
  
  if (isLoading) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.loadingContainer}>
          <Text>Loading dashboard data...</Text>
        </View>
      </SafeAreaView>
    );
  }
  
  return (
    <SafeAreaView style={styles.container}>
      <ScrollView contentContainerStyle={styles.scrollContent}>
        <View style={styles.header}>
          <ThemedText variant="h1">Admin Dashboard</ThemedText>
          <TouchableOpacity 
            style={styles.refreshButton} 
            onPress={handleRefresh}
          >
            <Text>Refresh</Text>
          </TouchableOpacity>
        </View>
        
        {/* Time Frame Selector */}
        <View style={styles.timeFrameSelector}>
          {['day', 'week', 'month', 'year'].map(timeFrame => (
            <TouchableOpacity
              key={timeFrame}
              style={[
                styles.timeFrameButton,
                selectedTimeFrame === timeFrame && styles.selectedTimeFrame
              ]}
              onPress={() => handleTimeFrameSelect(timeFrame)}
            >
              <Text style={styles.timeFrameText}>
                {timeFrame.charAt(0).toUpperCase() + timeFrame.slice(1)}
              </Text>
            </TouchableOpacity>
          ))}
        </View>
        
        {/* Stats Cards */}
        {data && (
          <View style={styles.statsContainer}>
            <View style={styles.statCard}>
              <Text style={styles.statLabel}>Total Users</Text>
              <Text style={styles.statValue}>{data.totalUsers}</Text>
            </View>
            
            <View style={styles.statCard}>
              <Text style={styles.statLabel}>Active Users</Text>
              <Text style={styles.statValue}>{data.activeUsers}</Text>
            </View>
            
            <View style={styles.statCard}>
              <Text style={styles.statLabel}>Collections</Text>
              <Text style={styles.statValue}>{data.totalCollections}</Text>
            </View>
            
            <View style={styles.statCard}>
              <Text style={styles.statLabel}>Total Weight</Text>
              <Text style={styles.statValue}>{data.totalWeight} kg</Text>
            </View>
          </View>
        )}
        
        {/* Performance Charts would go here */}
        <View style={styles.chartPlaceholder}>
          <Text style={styles.placeholderText}>Performance Chart</Text>
          <Text>Data visualization would appear here</Text>
        </View>
        
        {/* Recent Activity would go here */}
        <View style={styles.activityPlaceholder}>
          <Text style={styles.placeholderText}>Recent Activity</Text>
          <Text>Table of recent collections and activity would appear here</Text>
        </View>

        <View style={styles.grid}>
          {modules.map((module, index) => (
            <TouchableOpacity
              key={index}
              style={styles.moduleCard}
              onPress={() => navigation.navigate(module.route)}
              accessibilityLabel={`Navigate to ${module.title}`}
              accessibilityRole="button"
            >
              <Text style={styles.moduleIcon}>{module.icon}</Text>
              <Text style={styles.moduleTitle}>{module.title}</Text>
            </TouchableOpacity>
          ))}
        </View>
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
    paddingBottom: 32,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 24,
  },
  refreshButton: {
    backgroundColor: '#e0e0e0',
    padding: 10,
    borderRadius: 4,
  },
  timeFrameSelector: {
    flexDirection: 'row',
    marginBottom: 24,
    backgroundColor: '#e0e0e0',
    borderRadius: 8,
    padding: 4,
  },
  timeFrameButton: {
    flex: 1,
    paddingVertical: 8,
    alignItems: 'center',
    borderRadius: 4,
  },
  selectedTimeFrame: {
    backgroundColor: '#ffffff',
  },
  timeFrameText: {
    fontWeight: '500',
  },
  statsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginBottom: 24,
    gap: 16,
  },
  statCard: {
    flex: 1,
    minWidth: '45%',
    backgroundColor: '#ffffff',
    borderRadius: 8,
    padding: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 10,
    elevation: 2,
  },
  statLabel: {
    fontSize: 16,
    color: '#6b7280',
    marginBottom: 8,
  },
  statValue: {
    fontSize: 24,
    fontWeight: '600',
    color: '#1f2937',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  chartPlaceholder: {
    backgroundColor: '#ffffff',
    borderRadius: 8,
    padding: 16,
    marginBottom: 24,
    alignItems: 'center',
    height: 200,
    justifyContent: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 10,
    elevation: 2,
  },
  activityPlaceholder: {
    backgroundColor: '#ffffff',
    borderRadius: 8,
    padding: 16,
    marginBottom: 24,
    alignItems: 'center',
    height: 200,
    justifyContent: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 10,
    elevation: 2,
  },
  placeholderText: {
    fontSize: 18,
    fontWeight: '500',
    marginBottom: 8,
  },
  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    padding: 8,
  },
  moduleCard: {
    width: '50%',
    padding: 8,
  },
  moduleIcon: {
    fontSize: 32,
    textAlign: 'center',
    marginBottom: 8,
  },
  moduleTitle: {
    fontSize: 16,
    textAlign: 'center',
    fontWeight: '500',
  },
}); 