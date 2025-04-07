import { SearchBar } from '@/components/ui/SearchBar';
import { ThemedText } from '@/components/ui/ThemedText';
import { ThemedView } from '@/components/ui/ThemedView';
import { useDeliveryPersonnel } from '@/hooks/useDeliveryPersonnel';
import { useTheme } from '@/theme';
import { DeliveryPersonnel } from '@/types/DeliveryPersonnel';
import React, { useEffect, useState } from 'react';
import { ActivityIndicator, FlatList, StyleSheet, TouchableOpacity } from 'react-native';

interface DeliveryPersonnelListProps {
  onPersonnelSelect?: (personnel: DeliveryPersonnel) => void;
}

export function DeliveryPersonnelList({ onPersonnelSelect }: DeliveryPersonnelListProps) {
  const theme = useTheme()()();
  const { personnel, isLoading, error, searchPersonnel } = useDeliveryPersonnel();
  const [searchQuery, setSearchQuery] = useState('');

  useEffect(() => {
    loadPersonnel();
  }, []);

  const loadPersonnel = async () => {
    await searchPersonnel({});
  };

  const handleSearch = (text: string) => {
    setSearchQuery(text);
    searchPersonnel({ query: text });
  };

  const getStatusColor = (status: DeliveryPersonnel['status']) => {
    switch (status) {
      case 'AVAILABLE':
        return theme.colors.success;
      case 'ON_DELIVERY':
        return theme.colors.warning;
      case 'OFF_DUTY':
        return theme.colors.error;
      default:
        return theme.colors.textSecondary;
    }
  };

  const renderPersonnelItem = ({ item }: { item: DeliveryPersonnel }) => (
    <TouchableOpacity
      style={[styles.personnelItem, { backgroundColor: theme.colors.surface }]}
      onPress={() => onPersonnelSelect?.(item)}
    >
      <ThemedView style={styles.personnelInfo}>
        <ThemedText style={styles.name}>{item.name}</ThemedText>
        <ThemedText style={styles.vehicle}>
          {item.vehicle.type} • {item.vehicle.registrationNumber}
        </ThemedText>
        <ThemedText style={styles.rating}>Rating: {item.rating.toFixed(1)}</ThemedText>
      </ThemedView>
      <ThemedView style={styles.statusContainer}>
        <ThemedText style={[styles.status, { color: getStatusColor(item.status) }]}>
          {item.status.replace('_', ' ')}
        </ThemedText>
        <ThemedText style={styles.deliveries}>
          {item.activeDeliveries.length} active deliveries
        </ThemedText>
      </ThemedView>
    </TouchableOpacity>
  );

  if (isLoading) {
    return (
      <ThemedView style={styles.loadingContainer}>
        <ActivityIndicator size="large" color={theme.colors.primary} />
      </ThemedView>
    );
  }

  if (error) {
    return (
      <ThemedView style={styles.errorContainer}>
        <ThemedText style={styles.errorText}>{error}</ThemedText>
      </ThemedView>
    );
  }

  return (
    <ThemedView style={styles.container}>
      <SearchBar
        placeholder="Search delivery personnel..."
        value={searchQuery}
        onChangeText={handleSearch}
        style={styles.searchBar}
      />
      <FlatList
        data={personnel}
        renderItem={renderPersonnelItem}
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.list}
      />
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  errorText: {
    color: 'red',
    textAlign: 'center',
  },
  searchBar: {
    margin: 16,
  },
  list: {
    padding: 16,
  },
  personnelItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 16,
    borderRadius: 8,
    marginBottom: 12,
  },
  personnelInfo: {
    flex: 1,
  },
  name: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 4,
  },
  vehicle: {
    fontSize: 14,
    marginBottom: 4,
  },
  rating: {
    fontSize: 14,
  },
  statusContainer: {
    alignItems: 'flex-end',
  },
  status: {
    fontSize: 14,
    fontWeight: 'bold',
    marginBottom: 4,
  },
  deliveries: {
    fontSize: 12,
  },
}); 