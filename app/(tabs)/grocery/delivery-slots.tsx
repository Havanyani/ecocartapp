import { Button } from '@/components/ui/Button';
import { ThemedText } from '@/components/ui/ThemedText';
import { ThemedView } from '@/components/ui/ThemedView';
import { useTheme } from '@/hooks/useTheme';
import { groceryIntegrationService } from '@/services/GroceryIntegrationService';
import { DeliverySlot } from '@/types/GroceryStore';
import { Ionicons } from '@expo/vector-icons';
import { addDays, format, isToday, parseISO } from 'date-fns';
import { useRouter } from 'expo-router';
import React, { useEffect, useState } from 'react';
import { ActivityIndicator, FlatList, ScrollView, StyleSheet, TouchableOpacity, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

export default function DeliverySlotsScreen() {
  const { theme } = useTheme();
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(true);
  const [isSyncing, setIsSyncing] = useState(false);
  const [deliverySlots, setDeliverySlots] = useState<DeliverySlot[]>([]);
  const [groupedSlots, setGroupedSlots] = useState<Record<string, DeliverySlot[]>>({});
  const [selectedDate, setSelectedDate] = useState<string | null>(null);

  useEffect(() => {
    loadDeliverySlots();
  }, []);

  const loadDeliverySlots = async () => {
    try {
      setIsLoading(true);
      const slots = await groceryIntegrationService.getDeliverySlots();
      setDeliverySlots(slots);
      
      // Group slots by date
      const grouped: Record<string, DeliverySlot[]> = {};
      slots.forEach(slot => {
        if (!grouped[slot.date]) {
          grouped[slot.date] = [];
        }
        grouped[slot.date].push(slot);
      });
      
      setGroupedSlots(grouped);
      
      // Select today's date if available, otherwise the earliest date
      const dates = Object.keys(grouped).sort();
      const today = new Date().toISOString().split('T')[0];
      setSelectedDate(dates.includes(today) ? today : dates[0] || null);
    } catch (error) {
      console.error('Error loading delivery slots:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSyncSlots = async () => {
    try {
      setIsSyncing(true);
      await groceryIntegrationService.synchronizeDeliverySlots();
      await loadDeliverySlots();
    } catch (error) {
      console.error('Error syncing delivery slots:', error);
    } finally {
      setIsSyncing(false);
    }
  };

  const handleSelectDate = (date: string) => {
    setSelectedDate(date);
  };

  const handleSelectSlot = (slot: DeliverySlot) => {
    router.push(`/grocery/book-slot?id=${slot.id}`);
  };

  const formatDate = (dateString: string) => {
    try {
      const date = parseISO(dateString);
      if (isToday(date)) {
        return 'Today';
      }
      if (isToday(addDays(date, -1))) {
        return 'Tomorrow';
      }
      return format(date, 'EEE, d MMM');
    } catch (error) {
      return dateString;
    }
  };

  const renderDateTab = (date: string) => {
    const isSelected = date === selectedDate;
    
    return (
      <TouchableOpacity
        key={date}
        style={[
          styles.dateTab,
          isSelected && { backgroundColor: theme.colors.primary }
        ]}
        onPress={() => handleSelectDate(date)}
      >
        <ThemedText
          style={[
            styles.dateTabText,
            isSelected && { color: '#FFFFFF' }
          ]}
        >
          {formatDate(date)}
        </ThemedText>
      </TouchableOpacity>
    );
  };

  if (isLoading) {
    return (
      <ThemedView style={styles.loadingContainer}>
        <ActivityIndicator size="large" color={theme.colors.primary} />
        <ThemedText style={styles.loadingText}>Loading delivery slots...</ThemedText>
      </ThemedView>
    );
  }

  const availableDates = Object.keys(groupedSlots).sort();
  const slotsForSelectedDate = selectedDate ? groupedSlots[selectedDate] || [] : [];

  return (
    <SafeAreaView style={styles.container}>
      <ThemedView style={styles.header}>
        <TouchableOpacity 
          style={styles.backButton} 
          onPress={() => router.back()}
        >
          <Ionicons name="arrow-back" size={24} color={theme.colors.text.primary} />
        </TouchableOpacity>
        <ThemedText style={styles.title}>Delivery Slots</ThemedText>
        <TouchableOpacity 
          style={styles.syncButton}
          onPress={handleSyncSlots}
          disabled={isSyncing}
        >
          <Ionicons 
            name="sync" 
            size={24} 
            color={isSyncing ? theme.colors.text.secondary : theme.colors.primary} 
          />
        </TouchableOpacity>
      </ThemedView>
      
      {availableDates.length === 0 ? (
        <ThemedView style={styles.emptyContainer}>
          <Ionicons name="calendar-outline" size={64} color={theme.colors.text.secondary} />
          <ThemedText style={styles.emptyTitle}>No Delivery Slots Found</ThemedText>
          <ThemedText style={styles.emptyDescription}>
            We couldn't find any available delivery slots. Try syncing to get the latest schedule.
          </ThemedText>
          <Button 
            onPress={handleSyncSlots}
            isLoading={isSyncing}
          >
            Sync Delivery Slots
          </Button>
        </ThemedView>
      ) : (
        <>
          <ScrollView 
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.dateTabs}
          >
            {availableDates.map(renderDateTab)}
          </ScrollView>
          
          <FlatList
            data={slotsForSelectedDate}
            keyExtractor={(item) => item.id}
            renderItem={({ item }) => (
              <TouchableOpacity
                style={[
                  styles.slotCard,
                  !item.available && styles.unavailableSlot
                ]}
                onPress={() => item.available && handleSelectSlot(item)}
                disabled={!item.available}
              >
                <View style={styles.slotInfo}>
                  <ThemedText style={styles.slotTime}>
                    {item.startTime} - {item.endTime}
                  </ThemedText>
                  {item.maxItems && (
                    <ThemedText style={styles.slotDetail}>
                      Max {item.maxItems} items
                    </ThemedText>
                  )}
                </View>
                <View style={styles.slotStatus}>
                  <ThemedText style={styles.slotFee}>
                    R {item.fee.toFixed(2)}
                  </ThemedText>
                  {item.available ? (
                    <Ionicons 
                      name="chevron-forward" 
                      size={20} 
                      color={theme.colors.text.secondary} 
                    />
                  ) : (
                    <ThemedText style={styles.unavailableText}>
                      Unavailable
                    </ThemedText>
                  )}
                </View>
              </TouchableOpacity>
            )}
            ListEmptyComponent={() => (
              <ThemedView style={styles.noSlotsContainer}>
                <ThemedText style={styles.noSlotsText}>
                  No delivery slots available for this date.
                </ThemedText>
              </ThemedView>
            )}
            contentContainerStyle={styles.slotsList}
          />
        </>
      )}
    </SafeAreaView>
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
  loadingText: {
    marginTop: 16,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 16,
  },
  backButton: {
    padding: 4,
  },
  title: {
    fontSize: 20,
    fontWeight: 'bold',
    flex: 1,
    textAlign: 'center',
  },
  syncButton: {
    padding: 4,
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 32,
  },
  emptyTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    marginTop: 24,
    marginBottom: 12,
  },
  emptyDescription: {
    textAlign: 'center',
    marginBottom: 24,
    opacity: 0.7,
  },
  dateTabs: {
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
  dateTab: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    marginRight: 8,
    backgroundColor: 'rgba(0,0,0,0.05)',
    borderRadius: 8,
  },
  dateTabText: {
    fontWeight: '500',
  },
  slotsList: {
    padding: 16,
  },
  slotCard: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 16,
    backgroundColor: 'white',
    borderRadius: 8,
    marginBottom: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  unavailableSlot: {
    opacity: 0.5,
  },
  slotInfo: {
    flex: 1,
  },
  slotTime: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 4,
  },
  slotDetail: {
    fontSize: 12,
    opacity: 0.7,
  },
  slotStatus: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  slotFee: {
    fontSize: 16,
    fontWeight: '500',
    marginRight: 8,
  },
  unavailableText: {
    fontSize: 12,
    color: 'red',
  },
  noSlotsContainer: {
    padding: 32,
    alignItems: 'center',
  },
  noSlotsText: {
    opacity: 0.7,
    textAlign: 'center',
  },
}); 