import { Card } from '@/components/ui/Card';
import { ThemedText } from '@/components/ui/ThemedText';
import { useTheme } from '@/hooks/useTheme';
import { CollectionLocation } from '@/types/Collection';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import React from 'react';
import { StyleSheet, TouchableOpacity, View } from 'react-native';

interface LocationSelectorProps {
  location: CollectionLocation | null;
  onSelectLocation: (location: CollectionLocation) => void;
}

export function LocationSelector({ location, onSelectLocation }: LocationSelectorProps) {
  const router = useRouter();
  const { theme } = useTheme();

  return (
    <Card style={styles.container}>
      <ThemedText style={styles.title}>Collection Location</ThemedText>
      <ThemedText style={styles.subtitle}>
        Select where you want your materials to be collected from
      </ThemedText>
      
      {location ? (
        <View style={styles.locationDetails}>
          <View style={styles.locationHeader}>
            <Ionicons name="location" size={22} color="#2e7d32" />
            <ThemedText style={styles.addressType}>{location.type}</ThemedText>
          </View>
          
          <ThemedText style={styles.addressText}>
            {location.street}
          </ThemedText>
          <ThemedText style={styles.addressText}>
            {location.city}, {location.state} {location.zipCode}
          </ThemedText>
          
          <TouchableOpacity 
            style={styles.changeButton}
            onPress={() => router.push('/profile/addresses')}
          >
            <ThemedText style={styles.changeButtonText}>
              Change Location
            </ThemedText>
          </TouchableOpacity>
        </View>
      ) : (
        <TouchableOpacity 
          style={styles.addButton}
          onPress={() => router.push('/profile/addresses/new')}
        >
          <Ionicons name="add-circle-outline" size={24} color="#2e7d32" />
          <ThemedText style={styles.addButtonText}>
            Add Collection Address
          </ThemedText>
        </TouchableOpacity>
      )}
    </Card>
  );
}

const styles = StyleSheet.create({
  container: {
    padding: 16,
    borderRadius: 12,
    marginBottom: 16,
  },
  title: {
    fontSize: 18,
    fontWeight: '600',
    marginBottom: 4,
  },
  subtitle: {
    fontSize: 14,
    color: '#757575',
    marginBottom: 16,
  },
  locationDetails: {
    backgroundColor: 'rgba(46, 125, 50, 0.05)',
    borderRadius: 8,
    padding: 16,
  },
  locationHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  addressType: {
    fontSize: 16,
    fontWeight: '600',
    marginLeft: 8,
    textTransform: 'capitalize',
  },
  addressText: {
    fontSize: 15,
    marginBottom: 4,
  },
  changeButton: {
    marginTop: 16,
    alignSelf: 'flex-start',
    backgroundColor: 'rgba(46, 125, 50, 0.1)',
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderRadius: 20,
  },
  changeButtonText: {
    color: '#2e7d32',
    fontWeight: '500',
  },
  addButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 24,
    borderWidth: 1,
    borderStyle: 'dashed',
    borderColor: '#bdbdbd',
    borderRadius: 8,
  },
  addButtonText: {
    color: '#2e7d32',
    fontWeight: '500',
    marginLeft: 8,
  },
}); 