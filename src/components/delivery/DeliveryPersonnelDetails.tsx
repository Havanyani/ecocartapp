import { IconSymbol } from '@/components/ui/IconSymbol';
import { ThemedText } from '@/components/ui/ThemedText';
import { ThemedView } from '@/components/ui/ThemedView';
import { useDeliveryPersonnel } from '@/hooks/useDeliveryPersonnel';
import { useTheme } from '@/theme';
import { DeliveryPersonnel, DeliveryStatus } from '@/types/DeliveryPersonnel';
import React, { useEffect, useState } from 'react';
import { ScrollView, StyleSheet, TouchableOpacity, View } from 'react-native';
import { NotificationHistory } from './NotificationHistory';
import { NotificationPreferences } from './NotificationPreferences';

interface DeliveryPersonnelDetailsProps {
  personnelId: string;
}

export function DeliveryPersonnelDetails({ personnelId }: DeliveryPersonnelDetailsProps) {
  const theme = useTheme()()();
  const { personnel, isLoading, error } = useDeliveryPersonnel(personnelId);
  const [activeDeliveries, setActiveDeliveries] = useState<DeliveryStatus[]>([]);

  useEffect(() => {
    loadActiveDeliveries();
  }, [personnel.activeDeliveries]);

  const loadActiveDeliveries = async () => {
    setIsLoading(true);
    try {
      const deliveries = await Promise.all(
        personnel.activeDeliveries.map((orderId) => getDeliveryStatus(orderId))
      );
      setActiveDeliveries(deliveries);
    } catch (error) {
      console.error('Failed to load active deliveries:', error);
    } finally {
      setIsLoading(false);
    }
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

  if (isLoading) {
    return (
      <ThemedView style={styles.container}>
        <ThemedText>Loading...</ThemedText>
      </ThemedView>
    );
  }

  if (error || !personnel) {
    return (
      <ThemedView style={styles.container}>
        <ThemedText>Error loading delivery personnel details</ThemedText>
      </ThemedView>
    );
  }

  return (
    <ScrollView style={styles.container}>
      <ThemedView style={styles.section}>
        <View style={styles.header}>
          <ThemedText style={styles.name}>{personnel.name}</ThemedText>
          <View 
            testID="status-indicator"
            style={[styles.statusIndicator, { backgroundColor: getStatusColor(personnel.status) }]} 
          />
        </View>
        <ThemedText style={styles.status}>{personnel.status}</ThemedText>
      </ThemedView>

      <ThemedView style={styles.section}>
        <ThemedText style={styles.sectionTitle}>Vehicle Information</ThemedText>
        <View style={styles.infoRow}>
          <IconSymbol name="truck" size={20} color={theme.colors.primary} />
          <ThemedText style={styles.infoText}>
            {personnel.vehicle.type} - {personnel.vehicle.registrationNumber}
          </ThemedText>
        </View>
        <View style={styles.infoRow}>
          <IconSymbol name="map-marker" size={20} color={theme.colors.primary} />
          <ThemedText style={styles.infoText}>
            {personnel.currentLocation.latitude}, {personnel.currentLocation.longitude}
          </ThemedText>
        </View>
      </ThemedView>

      <ThemedView style={styles.section}>
        <ThemedText style={styles.sectionTitle}>Active Deliveries</ThemedText>
        {activeDeliveries.map((delivery) => (
          <TouchableOpacity
            key={delivery.orderId}
            style={styles.deliveryItem}
          >
            <View style={styles.deliveryInfo}>
              <IconSymbol
                name="package"
                size={24}
                color={theme.colors.primary}
              />
              <View style={styles.deliveryText}>
                <ThemedText style={styles.deliveryTitle}>
                  {delivery.orderId}
                </ThemedText>
                <ThemedText style={styles.deliveryAddress}>
                  {delivery.status.replace('_', ' ')}
                </ThemedText>
              </View>
            </View>
            <ThemedText style={styles.deliveryStatus}>
              {delivery.status.replace('_', ' ')}
            </ThemedText>
          </TouchableOpacity>
        ))}
      </ThemedView>

      <ThemedView style={styles.section}>
        <ThemedText style={styles.sectionTitle}>Notification History</ThemedText>
        <NotificationHistory personnelId={personnelId} />
      </ThemedView>

      <NotificationPreferences personnelId={personnelId} />
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  section: {
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(0, 0, 0, 0.1)',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  name: {
    fontSize: 24,
    fontWeight: 'bold',
    marginRight: 8,
  },
  statusIndicator: {
    width: 12,
    height: 12,
    borderRadius: 6,
  },
  status: {
    fontSize: 16,
    opacity: 0.7,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    marginBottom: 16,
  },
  infoRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  infoText: {
    marginLeft: 8,
    fontSize: 16,
  },
  deliveryItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 12,
    borderRadius: 8,
    backgroundColor: 'rgba(0, 0, 0, 0.02)',
    marginBottom: 8,
  },
  deliveryInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    flex: 1,
  },
  deliveryText: {
    flex: 1,
  },
  deliveryTitle: {
    fontSize: 16,
    fontWeight: '500',
    marginBottom: 4,
  },
  deliveryAddress: {
    fontSize: 14,
    opacity: 0.7,
  },
  deliveryStatus: {
    fontSize: 14,
    textTransform: 'capitalize',
  },
}); 