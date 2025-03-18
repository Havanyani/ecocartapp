import { CollectionSummary } from '@/components/collection/CollectionSummary';
import { MaterialSelector } from '@/components/collection/MaterialSelector';
import { TimeSlotSelector } from '@/components/collection/TimeSlotSelector';
import { WeightEstimator } from '@/components/collection/WeightEstimator';
import { Button } from '@/components/ui/Button';
import { ThemedText } from '@/components/ui/ThemedText';
import { ThemedView } from '@/components/ui/ThemedView';
import { useCollectionSchedule } from '@/hooks/useCollectionSchedule';
import { useTheme } from '@/hooks/useTheme';
import { CollectionMaterials } from '@/types/Collection';
import { format } from 'date-fns';
import React, { useState } from 'react';
import { ScrollView, StyleSheet, View } from 'react-native';
import { Calendar } from 'react-native-calendars';
import { SafeAreaView } from 'react-native-safe-area-context';

export function ScheduleCollectionScreen() {
  const { theme } = useTheme();
  const { scheduleCollection, availableSlots, isLoading } = useCollectionSchedule();
  
  const [selectedDate, setSelectedDate] = useState('');
  const [selectedTimeSlot, setSelectedTimeSlot] = useState('');
  const [selectedMaterials, setSelectedMaterials] = useState<CollectionMaterials[]>([]);
  const [estimatedWeight, setEstimatedWeight] = useState(0);

  const handleSchedule = async () => {
    try {
      await scheduleCollection({
        date: selectedDate,
        timeSlot: selectedTimeSlot,
        materials: selectedMaterials,
        estimatedWeight,
      });
      // Navigate to confirmation or collection list
    } catch (error) {
      console.error('Failed to schedule collection:', error);
    }
  };

  const isFormValid = selectedDate && selectedTimeSlot && 
    selectedMaterials.length > 0 && estimatedWeight > 0;

  return (
    <SafeAreaView style={styles.safeArea}>
      <ScrollView style={styles.container}>
        <ThemedText style={styles.title}>Schedule Collection</ThemedText>
        
        {/* Calendar */}
        <ThemedView style={styles.calendarContainer}>
          <Calendar
            onDayPress={day => setSelectedDate(day.dateString)}
            markedDates={{
              [selectedDate]: {
                selected: true,
                selectedColor: theme.colors.primary,
              },
            }}
            minDate={format(new Date(), 'yyyy-MM-dd')}
            theme={{
              todayTextColor: theme.colors.primary,
              selectedDayBackgroundColor: theme.colors.primary,
              selectedDayTextColor: '#ffffff',
              arrowColor: theme.colors.primary,
            }}
          />
        </ThemedView>

        {/* Time Slots */}
        {selectedDate && (
          <TimeSlotSelector
            date={selectedDate}
            availableSlots={availableSlots}
            selectedSlot={selectedTimeSlot}
            onSelectSlot={setSelectedTimeSlot}
          />
        )}

        {/* Material Selection */}
        <MaterialSelector
          selectedMaterials={selectedMaterials}
          onSelectMaterials={setSelectedMaterials}
        />

        {/* Weight Estimation */}
        <WeightEstimator
          materials={selectedMaterials}
          onWeightEstimate={setEstimatedWeight}
        />

        {/* Collection Summary */}
        {isFormValid && (
          <CollectionSummary
            date={selectedDate}
            timeSlot={selectedTimeSlot}
            materials={selectedMaterials}
            estimatedWeight={estimatedWeight}
          />
        )}

        {/* Schedule Button */}
        <View style={styles.buttonContainer}>
          <Button
            onPress={handleSchedule}
            isDisabled={!isFormValid || isLoading}
            isLoading={isLoading}
          >
            Schedule Collection
          </Button>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
  },
  container: {
    flex: 1,
    padding: 16,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 20,
  },
  calendarContainer: {
    borderRadius: 12,
    overflow: 'hidden',
    marginBottom: 20,
  },
  buttonContainer: {
    marginTop: 20,
    marginBottom: 40,
  },
}); 