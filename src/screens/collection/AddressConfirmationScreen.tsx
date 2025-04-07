/**
 * AddressConfirmationScreen.tsx
 * 
 * Screen for confirming collection addresses.
 */

import { Button } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';
import { IconSymbol } from '@/components/ui/IconSymbol';
import { Text } from '@/components/ui/Text';
import { useTheme } from '@/hooks/useTheme';
import { CollectionStackParamList } from '@/navigation/CollectionNavigator';
import { useNavigation, useRoute } from '@react-navigation/native';
import { StackNavigationProp } from '@react-navigation/stack';
import * as Haptics from 'expo-haptics';
import * as Location from 'expo-location';
import React, { useState } from 'react';
import { Alert, Platform, StyleSheet, View } from 'react-native';
import MapView, { Marker } from 'react-native-maps';
import { SafeAreaView } from 'react-native-safe-area-context';

type AddressConfirmationScreenNavigationProp = StackNavigationProp<
  CollectionStackParamList,
  'AddressConfirmation'
>;

export function AddressConfirmationScreen() {
  const navigation = useNavigation<AddressConfirmationScreenNavigationProp>();
  const route = useRoute();
  const { theme } = useTheme();
  const [address, setAddress] = useState<string>(
    route.params?.address || '123 Main St, City, Country'
  );
  const [isConfirmed, setIsConfirmed] = useState(false);
  const [region, setRegion] = useState({
    latitude: 37.78825,
    longitude: -122.4324,
    latitudeDelta: 0.0922,
    longitudeDelta: 0.0421,
  });

  // Handle address confirmation
  const handleConfirmAddress = async () => {
    if (Platform.OS === 'ios') {
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    }

    setIsConfirmed(true);
    Alert.alert(
      'Address Confirmed',
      'Your collection address has been confirmed.',
      [
        {
          text: 'OK',
          onPress: () => navigation.navigate('ScheduleCollection'),
        },
      ]
    );
  };

  // Handle address edit
  const handleEditAddress = () => {
    if (Platform.OS === 'ios') {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    }

    // In a real app, you would open an address editor
    Alert.alert('Edit Address', 'Address editing functionality would be implemented here.');
  };

  // Get current location
  const getCurrentLocation = async () => {
    if (Platform.OS === 'ios') {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    }

    try {
      const { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== 'granted') {
        Alert.alert('Permission Denied', 'Location permission is required to confirm your address.');
        return;
      }

      const location = await Location.getCurrentPositionAsync({});
      setRegion({
        latitude: location.coords.latitude,
        longitude: location.coords.longitude,
        latitudeDelta: 0.0922,
        longitudeDelta: 0.0421,
      });

      // In a real app, you would reverse geocode the coordinates to get the address
      Alert.alert('Location Updated', 'Your current location has been set as the collection address.');
    } catch (error) {
      Alert.alert('Error', 'Failed to get your current location.');
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <Card style={styles.card}>
        <Text variant="h2" style={styles.title}>Confirm Collection Address</Text>
        
        <View style={styles.mapContainer}>
          <MapView
            style={styles.map}
            region={region}
            onRegionChangeComplete={setRegion}
          >
            <Marker
              coordinate={{
                latitude: region.latitude,
                longitude: region.longitude,
              }}
              title="Collection Address"
            />
          </MapView>
        </View>
        
        <View style={styles.addressContainer}>
          <IconSymbol name="map-marker" size={24} color={theme.colors.primary} />
          <Text style={styles.addressText}>{address}</Text>
        </View>
        
        <View style={styles.buttonContainer}>
          <Button
            variant="secondary"
            onPress={handleEditAddress}
            style={styles.editButton}
          >
            Edit Address
          </Button>
          
          <Button
            variant="secondary"
            onPress={getCurrentLocation}
            style={styles.locationButton}
          >
            Use Current Location
          </Button>
        </View>
        
        <Button
          variant="primary"
          onPress={handleConfirmAddress}
          style={styles.confirmButton}
        >
          Confirm Address
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
  },
  title: {
    marginBottom: 16,
    textAlign: 'center',
  },
  mapContainer: {
    height: 200,
    marginBottom: 16,
    borderRadius: 8,
    overflow: 'hidden',
  },
  map: {
    flex: 1,
  },
  addressContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 12,
    backgroundColor: '#f9f9f9',
    borderRadius: 8,
    marginBottom: 16,
  },
  addressText: {
    marginLeft: 8,
    fontSize: 16,
  },
  buttonContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 16,
  },
  editButton: {
    flex: 1,
    marginRight: 8,
  },
  locationButton: {
    flex: 1,
    marginLeft: 8,
  },
  confirmButton: {
    marginTop: 8,
  },
}); 