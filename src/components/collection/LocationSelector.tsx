import { Card } from '@/components/ui/Card';
import { ThemedText } from '@/components/ui/ThemedText';
import { useTheme } from '@/theme';
import { CollectionLocation } from '@/types/Collection';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import React from 'react';
import { StyleSheet, TouchableOpacity, View } from 'react-native';

interface LocationSelectorProps {
  location: CollectionLocation | null;
  onSelectLocation: (location: CollectionLocation) => void;
}

export function LocationSelector({ location, onSelectLocation }: LocationSelectorProps) {
  const navigation = useNavigation();
  const theme = useTheme();

  return (
    <Card style={styles.container}>
      <ThemedText style={styles.title}>Collection Location</ThemedText>
      <ThemedText style={[styles.subtitle, { color: theme.theme.colors.textSecondary }]}>
        Select where you want your materials to be collected from
      </ThemedText>
      
      {location ? (
        <View style={styles.locationDetails}>
          <View style={styles.locationHeader}>
            <Ionicons name="location" size={22} color={theme.theme.colors.primary} />
            <ThemedText style={styles.addressType}>{location.type}</ThemedText>
          </View>
          
          <ThemedText style={styles.addressText}>
            {location.street}
          </ThemedText>
          <ThemedText style={styles.addressText}>
            {location.city}, {location.state} {location.zipCode}
          </ThemedText>
          
          <TouchableOpacity 
            style={[styles.changeButton, { backgroundColor: `${theme.theme.colors.primary}20` }]}
            onPress={() => navigation.navigate('Addresses')}
          >
            <ThemedText style={[styles.changeButtonText, { color: theme.theme.colors.primary }]}>
              Change Location
            </ThemedText>
          </TouchableOpacity>
        </View>
      ) : (
        <TouchableOpacity 
          style={[styles.addButton, { borderColor: theme.theme.colors.border }]}
          onPress={() => navigation.navigate('AddAddress')}
        >
          <Ionicons name="add-circle-outline" size={24} color={theme.theme.colors.primary} />
          <ThemedText style={[styles.addButtonText, { color: theme.theme.colors.primary }]}>
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
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderRadius: 20,
  },
  changeButtonText: {
    fontWeight: '500',
  },
  addButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 24,
    borderWidth: 1,
    borderStyle: 'dashed',
    borderRadius: 8,
  },
  addButtonText: {
    fontWeight: '500',
    marginLeft: 8,
  },
}); 