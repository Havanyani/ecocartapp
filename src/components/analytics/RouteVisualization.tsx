import MapView, { Marker, Polyline } from '@/components/ui/MapViewAdapter';
import { useTheme } from '@/theme';
import { Location } from '@/utils/RouteOptimization';
import React from 'react';
import { StyleSheet, View } from 'react-native';
import { ThemedText } from '../ui/ThemedText';
import { ThemedView } from '../ui/ThemedView';

interface Route {
  collections: any[];
  totalDistance: number;
  estimatedDuration: number;
  waypoints: Location[];
  trafficConditions: {
    congestion: 'low' | 'medium' | 'high';
    estimatedDelay: number;
    confidence: number;
  };
  efficiency: {
    score: number;
    factors: {
      distance: number;
      time: number;
      collections: number;
      traffic: number;
      weight: number;
    };
  };
}

interface RouteVisualizationProps {
  route: Route;
  style?: any;
}

interface Coordinate {
  latitude: number;
  longitude: number;
}

export function RouteVisualization({ route, style }: RouteVisualizationProps) {
  const theme = useTheme()()();

  // Calculate map region to fit all waypoints
  const region = React.useMemo(() => {
    const coordinates: Coordinate[] = route.waypoints.map(wp => ({
      latitude: wp.latitude,
      longitude: wp.longitude,
    }));

    const minLat = Math.min(...coordinates.map(c => c.latitude));
    const maxLat = Math.max(...coordinates.map(c => c.latitude));
    const minLng = Math.min(...coordinates.map(c => c.longitude));
    const maxLng = Math.max(...coordinates.map(c => c.longitude));

    return {
      latitude: (minLat + maxLat) / 2,
      longitude: (minLng + maxLng) / 2,
      latitudeDelta: (maxLat - minLat) * 1.5,
      longitudeDelta: (maxLng - minLng) * 1.5,
    };
  }, [route.waypoints]);

  return (
    <ThemedView style={[styles.container, style]}>
      <MapView
        style={styles.map}
        region={region}
        showsUserLocation
        showsMyLocationButton
      >
        {/* Draw route line */}
        <Polyline
          coordinates={route.waypoints.map(wp => ({
            latitude: wp.latitude,
            longitude: wp.longitude,
          }))}
          strokeColor={theme.colors.primary}
          strokeWidth={3}
        />

        {/* Add markers for each waypoint */}
        {route.waypoints.map((waypoint: Location, index: number) => (
          <Marker
            key={waypoint.id}
            coordinate={{
              latitude: waypoint.latitude,
              longitude: waypoint.longitude,
            }}
            title={`Waypoint ${index + 1}`}
            description={waypoint.address || 'No address'}
            pinColor={theme.colors.primary}
          />
        ))}
      </MapView>

      {/* Route metrics */}
      <View style={styles.metricsContainer}>
        <View style={styles.metricRow}>
          <ThemedText style={styles.metricLabel}>Total Distance:</ThemedText>
          <ThemedText style={styles.metricValue}>
            {route.totalDistance.toFixed(1)} km
          </ThemedText>
        </View>
        <View style={styles.metricRow}>
          <ThemedText style={styles.metricLabel}>Estimated Duration:</ThemedText>
          <ThemedText style={styles.metricValue}>
            {Math.round(route.estimatedDuration)} min
          </ThemedText>
        </View>
        <View style={styles.metricRow}>
          <ThemedText style={styles.metricLabel}>Efficiency Score:</ThemedText>
          <ThemedText style={styles.metricValue}>
            {(route.efficiency.score * 100).toFixed(1)}%
          </ThemedText>
        </View>
        <View style={styles.metricRow}>
          <ThemedText style={styles.metricLabel}>Traffic Conditions:</ThemedText>
          <ThemedText style={styles.metricValue}>
            {route.trafficConditions.congestion}
          </ThemedText>
        </View>
      </View>

      {/* Efficiency factors */}
      <View style={styles.factorsContainer}>
        <ThemedText style={styles.factorsTitle}>Efficiency Factors</ThemedText>
        <View style={styles.factorRow}>
          <ThemedText style={styles.factorLabel}>Distance:</ThemedText>
          <View style={styles.factorBarContainer}>
            <View
              style={[
                styles.factorBar,
                {
                  width: `${route.efficiency.factors.distance * 100}%`,
                  backgroundColor: theme.colors.primary,
                },
              ]}
            />
          </View>
          <ThemedText style={styles.factorValue}>
            {(route.efficiency.factors.distance * 100).toFixed(1)}%
          </ThemedText>
        </View>
        <View style={styles.factorRow}>
          <ThemedText style={styles.factorLabel}>Time:</ThemedText>
          <View style={styles.factorBarContainer}>
            <View
              style={[
                styles.factorBar,
                {
                  width: `${route.efficiency.factors.time * 100}%`,
                  backgroundColor: theme.colors.primary,
                },
              ]}
            />
          </View>
          <ThemedText style={styles.factorValue}>
            {(route.efficiency.factors.time * 100).toFixed(1)}%
          </ThemedText>
        </View>
        <View style={styles.factorRow}>
          <ThemedText style={styles.factorLabel}>Collections:</ThemedText>
          <View style={styles.factorBarContainer}>
            <View
              style={[
                styles.factorBar,
                {
                  width: `${route.efficiency.factors.collections * 100}%`,
                  backgroundColor: theme.colors.primary,
                },
              ]}
            />
          </View>
          <ThemedText style={styles.factorValue}>
            {(route.efficiency.factors.collections * 100).toFixed(1)}%
          </ThemedText>
        </View>
        <View style={styles.factorRow}>
          <ThemedText style={styles.factorLabel}>Traffic:</ThemedText>
          <View style={styles.factorBarContainer}>
            <View
              style={[
                styles.factorBar,
                {
                  width: `${route.efficiency.factors.traffic * 100}%`,
                  backgroundColor: theme.colors.primary,
                },
              ]}
            />
          </View>
          <ThemedText style={styles.factorValue}>
            {(route.efficiency.factors.traffic * 100).toFixed(1)}%
          </ThemedText>
        </View>
        <View style={styles.factorRow}>
          <ThemedText style={styles.factorLabel}>Weight:</ThemedText>
          <View style={styles.factorBarContainer}>
            <View
              style={[
                styles.factorBar,
                {
                  width: `${route.efficiency.factors.weight * 100}%`,
                  backgroundColor: theme.colors.primary,
                },
              ]}
            />
          </View>
          <ThemedText style={styles.factorValue}>
            {(route.efficiency.factors.weight * 100).toFixed(1)}%
          </ThemedText>
        </View>
      </View>
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    borderRadius: 12,
    overflow: 'hidden',
  },
  map: {
    height: 300,
    width: '100%',
  },
  metricsContainer: {
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
  },
  metricRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  metricLabel: {
    fontSize: 16,
    fontWeight: '500',
  },
  metricValue: {
    fontSize: 16,
    fontWeight: '600',
  },
  factorsContainer: {
    padding: 16,
  },
  factorsTitle: {
    fontSize: 18,
    fontWeight: '600',
    marginBottom: 16,
  },
  factorRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  factorLabel: {
    width: 100,
    fontSize: 14,
  },
  factorBarContainer: {
    flex: 1,
    height: 8,
    backgroundColor: '#eee',
    borderRadius: 4,
    marginHorizontal: 8,
    overflow: 'hidden',
  },
  factorBar: {
    height: '100%',
    borderRadius: 4,
  },
  factorValue: {
    width: 60,
    fontSize: 14,
    textAlign: 'right',
  },
}); 