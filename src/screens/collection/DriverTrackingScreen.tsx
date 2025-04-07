/**
 * DriverTrackingScreen.tsx
 * 
 * Screen for tracking collection drivers in real-time.
 */

import { Button } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';
import { Text } from '@/components/ui/Text';
import { useTheme } from '@/hooks/useTheme';
import { CollectionStackParamList } from '@/navigation/CollectionNavigator';
import { useNavigation, useRoute } from '@react-navigation/native';
import { StackNavigationProp } from '@react-navigation/stack';
import * as Haptics from 'expo-haptics';
import React, { useEffect, useState } from 'react';
import { Alert, Platform, StyleSheet, View } from 'react-native';
import MapView, { Marker, PROVIDER_GOOGLE } from 'react-native-maps';
import { SafeAreaView } from 'react-native-safe-area-context';

type DriverTrackingScreenNavigationProp = StackNavigationProp<
  CollectionStackParamList,
  'DriverTracking'
>;

interface DriverLocation {
  latitude: number;
  longitude: number;
  heading: number;
  lastUpdated: Date;
}

export function DriverTrackingScreen() {
  const navigation = useNavigation<DriverTrackingScreenNavigationProp>();
  const route = useRoute();
  const { theme } = useTheme();
  const [driverLocation, setDriverLocation] = useState<DriverLocation | null>(null);
  const [estimatedArrival, setEstimatedArrival] = useState<string>('');
  const [isLoading, setIsLoading] = useState(true);

  // Mock driver location updates
  useEffect(() => {
    const mockDriverLocation: DriverLocation = {
      latitude: 37.7749,
      longitude: -122.4194,
      heading: 90,
      lastUpdated: new Date(),
    };

    setDriverLocation(mockDriverLocation);
    setEstimatedArrival('10 minutes');
    setIsLoading(false);

    // In a real app, you would subscribe to real-time driver location updates
    const interval = setInterval(() => {
      setDriverLocation(prev => {
        if (!prev) return mockDriverLocation;
        return {
          ...prev,
          latitude: prev.latitude + 0.001,
          lastUpdated: new Date(),
        };
      });
    }, 5000);

    return () => clearInterval(interval);
  }, []);

  const handleContactDriver = () => {
    if (Platform.OS === 'ios') {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    }

    Alert.alert(
      'Contact Driver',
      'Would you like to call or message the driver?',
      [
        {
          text: 'Call',
          onPress: () => {
            // In a real app, you would initiate a call to the driver
            console.log('Calling driver...');
          },
        },
        {
          text: 'Message',
          onPress: () => {
            // In a real app, you would open a messaging interface
            console.log('Opening messaging interface...');
          },
        },
        {
          text: 'Cancel',
          style: 'cancel',
        },
      ]
    );
  };

  if (isLoading) {
    return (
      <SafeAreaView style={styles.container}>
        <Card style={styles.card}>
          <Text>Loading driver location...</Text>
        </Card>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <Card style={styles.card}>
        <Text variant="h2" style={styles.title}>Track Driver</Text>
        
        {driverLocation && (
          <View style={styles.mapContainer}>
            <MapView
              provider={PROVIDER_GOOGLE}
              style={styles.map}
              initialRegion={{
                latitude: driverLocation.latitude,
                longitude: driverLocation.longitude,
                latitudeDelta: 0.01,
                longitudeDelta: 0.01,
              }}
            >
              <Marker
                coordinate={{
                  latitude: driverLocation.latitude,
                  longitude: driverLocation.longitude,
                }}
                title="Driver Location"
              />
            </MapView>
          </View>
        )}
        
        <View style={styles.infoContainer}>
          <Text variant="body">Estimated Arrival: {estimatedArrival}</Text>
          <Text variant="caption" style={styles.lastUpdated}>
            Last Updated: {driverLocation?.lastUpdated.toLocaleTimeString()}
          </Text>
        </View>
        
        <Button
          onPress={handleContactDriver}
          style={styles.contactButton}
        >
          Contact Driver
        </Button>
        
        <Button
          variant="secondary"
          onPress={() => navigation.goBack()}
          style={styles.backButton}
        >
          Back
        </Button>
      </Card>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  card: {
    margin: 16,
    padding: 16,
    flex: 1,
  },
  title: {
    marginBottom: 16,
    textAlign: 'center',
  },
  mapContainer: {
    height: 300,
    marginBottom: 16,
    borderRadius: 8,
    overflow: 'hidden',
  },
  map: {
    flex: 1,
  },
  infoContainer: {
    marginBottom: 16,
  },
  lastUpdated: {
    color: '#666',
    marginTop: 4,
  },
  contactButton: {
    marginBottom: 8,
  },
  backButton: {
    marginTop: 8,
  },
}); 