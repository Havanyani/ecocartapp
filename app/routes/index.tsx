/**
 * app/routes/index.tsx
 * 
 * Routes management main screen that provides access to all route features.
 */

import { IconSymbol } from '@/components/ui/IconSymbol';
import { RouteOptimizationCard } from '@/components/ui/RouteOptimizationCard';
import { ThemedText } from '@/components/ui/ThemedText';
import { ThemedView } from '@/components/ui/ThemedView';
import { useTheme } from '@/hooks/useTheme';
import { useRouter } from 'expo-router';
import React, { useEffect, useState } from 'react';
import {
    ActivityIndicator,
    Dimensions,
    ScrollView,
    StyleSheet,
    TouchableOpacity,
    View,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

interface RouteStats {
  activeRoutes: number;
  averageDistance: number;
  totalStops: number;
  fuelSaved: number;
  co2Reduced: number;
}

export default function RoutesManagementScreen() {
  const router = useRouter();
  const { theme } = useTheme();
  const insets = useSafeAreaInsets();
  const [isLoading, setIsLoading] = useState(true);
  const [routeStats, setRouteStats] = useState<RouteStats>({
    activeRoutes: 0,
    averageDistance: 0,
    totalStops: 0,
    fuelSaved: 0,
    co2Reduced: 0,
  });
  const [activeRoute, setActiveRoute] = useState<any>(null);

  // Simulate loading route data
  useEffect(() => {
    const loadRouteData = async () => {
      setIsLoading(true);
      try {
        // In a real app, fetch this data from an API or local storage
        await new Promise(resolve => setTimeout(resolve, 1000));
        
        setRouteStats({
          activeRoutes: 3,
          averageDistance: 8.5,
          totalStops: 24,
          fuelSaved: 12.4,
          co2Reduced: 28.7,
        });
        
        setActiveRoute({
          totalDistance: 7.2,
          estimatedTime: 45,
          stops: [
            { id: '1', type: 'pickup', address: '123 Main St', scheduledTime: '09:00 AM' },
            { id: '2', type: 'pickup', address: '456 Oak Ave', scheduledTime: '09:30 AM' },
            { id: '3', type: 'pickup', address: '789 Pine Rd', scheduledTime: '10:15 AM' },
          ]
        });
      } catch (error) {
        console.error('Failed to load route data:', error);
      } finally {
        setIsLoading(false);
      }
    };
    
    loadRouteData();
  }, []);

  const navigateToOptimizationDashboard = () => {
    router.push('/routes/optimization-dashboard');
  };
  
  const navigateToMainTab = () => {
    router.push('/(tabs)');
  };

  if (isLoading) {
    return (
      <ThemedView style={styles.loadingContainer}>
        <ActivityIndicator size="large" color={theme.colors.primary} />
        <ThemedText style={styles.loadingText}>Loading route data...</ThemedText>
      </ThemedView>
    );
  }

  return (
    <ScrollView 
      style={styles.container}
      contentContainerStyle={{ paddingBottom: insets.bottom + 20 }}
    >
      <View style={styles.headerActions}>
        <TouchableOpacity 
          style={styles.headerButton}
          onPress={navigateToMainTab}
        >
          <IconSymbol name="home" size={24} color={theme.colors.primary} />
          <ThemedText style={styles.headerButtonText}>Home</ThemedText>
        </TouchableOpacity>
      </View>
      
      <View style={styles.statsContainer}>
        <ThemedText style={styles.sectionTitle}>Route Overview</ThemedText>
        <View style={styles.statsGrid}>
          <ThemedView style={styles.statItem}>
            <ThemedText style={styles.statValue}>{routeStats.activeRoutes}</ThemedText>
            <ThemedText style={styles.statLabel}>Active Routes</ThemedText>
          </ThemedView>
          <ThemedView style={styles.statItem}>
            <ThemedText style={styles.statValue}>{routeStats.averageDistance.toFixed(1)} km</ThemedText>
            <ThemedText style={styles.statLabel}>Avg Distance</ThemedText>
          </ThemedView>
          <ThemedView style={styles.statItem}>
            <ThemedText style={styles.statValue}>{routeStats.totalStops}</ThemedText>
            <ThemedText style={styles.statLabel}>Total Stops</ThemedText>
          </ThemedView>
          <ThemedView style={styles.statItem}>
            <ThemedText style={styles.statValue}>{routeStats.fuelSaved.toFixed(1)} L</ThemedText>
            <ThemedText style={styles.statLabel}>Fuel Saved</ThemedText>
          </ThemedView>
        </View>
      </View>
      
      <ThemedView style={styles.environmentalStats}>
        <ThemedText style={styles.environmentalTitle}>Environmental Impact</ThemedText>
        <ThemedText style={styles.environmentalValue}>{routeStats.co2Reduced.toFixed(1)} kg CO₂</ThemedText>
        <ThemedText style={styles.environmentalLabel}>Carbon emissions reduced through optimization</ThemedText>
      </ThemedView>
      
      {activeRoute && (
        <RouteOptimizationCard 
          route={activeRoute}
          onRefreshRoute={() => console.log('Refreshing route...')}
          testID="current-route-card"
        />
      )}
      
      <ThemedText style={styles.sectionTitle}>Route Features</ThemedText>
      
      <View style={styles.featureCards}>
        <TouchableOpacity 
          style={[styles.featureCard, { backgroundColor: theme.colors.primary }]} 
          onPress={navigateToOptimizationDashboard}
        >
          <IconSymbol name="route" size={32} color="#FFFFFF" />
          <ThemedText style={styles.featureTitle}>Route Optimization</ThemedText>
          <ThemedText style={styles.featureDescription}>
            Optimize collection routes for efficiency and reduced environmental impact
          </ThemedText>
        </TouchableOpacity>
        
        <TouchableOpacity 
          style={[styles.featureCard, { backgroundColor: theme.colors.secondary }]} 
          onPress={() => console.log('Navigate to live tracking')}
        >
          <IconSymbol name="map-marker" size={32} color="#FFFFFF" />
          <ThemedText style={styles.featureTitle}>Live Tracking</ThemedText>
          <ThemedText style={styles.featureDescription}>
            Real-time tracking of collection vehicles and route progress
          </ThemedText>
        </TouchableOpacity>
        
        <TouchableOpacity 
          style={[styles.featureCard, { backgroundColor: theme.isDark ? '#444' : '#8E8E93' }]} 
          onPress={() => router.push('/routes/route-details?routeId=0')}
        >
          <IconSymbol name="history" size={32} color="#FFFFFF" />
          <ThemedText style={styles.featureTitle}>Route Details</ThemedText>
          <ThemedText style={styles.featureDescription}>
            View detailed route information and collection stops
          </ThemedText>
        </TouchableOpacity>
      </View>
    </ScrollView>
  );
}

const { width } = Dimensions.get('window');

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 16,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    marginTop: 16,
    fontSize: 16,
  },
  headerActions: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    marginBottom: 16,
  },
  headerButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 8,
    backgroundColor: 'rgba(0,0,0,0.05)',
  },
  headerButtonText: {
    fontSize: 14,
    fontWeight: '500',
    marginLeft: 6,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: '600',
    marginBottom: 16,
    marginTop: 24,
  },
  statsContainer: {
    marginBottom: 24,
  },
  statsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  statItem: {
    width: '48%',
    padding: 16,
    marginBottom: 16,
    borderRadius: 8,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  statValue: {
    fontSize: 24,
    fontWeight: '700',
    marginBottom: 8,
  },
  statLabel: {
    fontSize: 14,
    opacity: 0.7,
  },
  environmentalStats: {
    padding: 16,
    borderRadius: 8,
    marginBottom: 24,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  environmentalTitle: {
    fontSize: 18,
    fontWeight: '600',
    marginBottom: 8,
  },
  environmentalValue: {
    fontSize: 32,
    fontWeight: '700',
    marginVertical: 8,
  },
  environmentalLabel: {
    fontSize: 14,
    textAlign: 'center',
    opacity: 0.7,
    marginTop: 8,
  },
  featureCards: {
    marginTop: 8,
    marginBottom: 24,
  },
  featureCard: {
    padding: 20,
    borderRadius: 12,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  featureTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#FFFFFF',
    marginTop: 12,
    marginBottom: 8,
  },
  featureDescription: {
    fontSize: 14,
    color: '#FFFFFF',
    opacity: 0.9,
  },
}); 