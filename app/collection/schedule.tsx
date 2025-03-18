/**
 * Collection Scheduling Screen
 * 
 * Allows users to schedule collection appointments with
 * one-time or recurring patterns.
 */

import { MaterialSelector } from '@/components/collection/MaterialSelector';
import { RecurrencePatternSelector } from '@/components/collection/RecurrencePatternSelector';
import { Button } from '@/components/ui/Button';
import { IconSymbol } from '@/components/ui/IconSymbol';
import { Input } from '@/components/ui/Input';
import { ThemedText } from '@/components/ui/ThemedText';
import { ThemedView } from '@/components/ui/ThemedView';
import { useTheme } from '@/hooks/useTheme';
import { RecurrenceFrequency, RecurrencePattern, SchedulingService } from '@/services/SchedulingService';
import DateTimePicker from '@react-native-community/datetimepicker';
import { format } from 'date-fns';
import { Stack, useRouter } from 'expo-router';
import React, { useState } from 'react';
import { Alert, KeyboardAvoidingView, Platform, ScrollView, StyleSheet, Switch, TouchableOpacity, View } from 'react-native';

export default function ScheduleCollectionScreen() {
  const router = useRouter();
  const { theme } = useTheme();
  const [isRecurring, setIsRecurring] = useState(false);
  const [schedulingDate, setSchedulingDate] = useState(new Date());
  const [schedulingTime, setSchedulingTime] = useState(new Date());
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [showTimePicker, setShowTimePicker] = useState(false);
  const [notes, setNotes] = useState('');
  const [showRecurrenceSelector, setShowRecurrenceSelector] = useState(false);
  const [selectedMaterials, setSelectedMaterials] = useState<string[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [recurrencePattern, setRecurrencePattern] = useState<RecurrencePattern>({
    frequency: RecurrenceFrequency.WEEKLY,
    dayOfWeek: [schedulingDate.getDay()],
  });

  // Combine date and time into a single Date object
  const getScheduledDateTime = () => {
    const result = new Date(schedulingDate);
    result.setHours(
      schedulingTime.getHours(),
      schedulingTime.getMinutes(),
      0,
      0
    );
    return result;
  };

  // Handle scheduling the collection
  const handleScheduleCollection = async () => {
    if (selectedMaterials.length === 0) {
      Alert.alert('Error', 'Please select at least one material for collection');
      return;
    }

    setIsLoading(true);
    try {
      const dateTime = getScheduledDateTime();

      if (isRecurring) {
        // Schedule recurring collection
        await SchedulingService.scheduleCollection({
          scheduledTime: dateTime.toISOString(),
          materials: selectedMaterials,
          notes,
          recurrencePattern,
        });
      } else {
        // Schedule one-time collection
        await SchedulingService.scheduleCollection({
          scheduledTime: dateTime.toISOString(),
          materials: selectedMaterials,
          notes,
        });
      }

      Alert.alert(
        'Success',
        `Collection ${isRecurring ? 'series' : ''} scheduled successfully!`,
        [
          {
            text: 'OK',
            onPress: () => router.push('/collection'),
          },
        ]
      );
    } catch (error) {
      console.error('Failed to schedule collection:', error);
      Alert.alert(
        'Failed to Schedule',
        'There was an error scheduling your collection. Please try again later.'
      );
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <>
      <Stack.Screen
        options={{
          title: 'Schedule Collection',
          headerBackTitle: 'Back',
        }}
      />

      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={{ flex: 1 }}
      >
        <ScrollView style={styles.container}>
          <ThemedView style={styles.card}>
            <ThemedText style={styles.sectionTitle}>Collection Details</ThemedText>
            
            {/* Date and Time Selection */}
            <View style={styles.dateTimeContainer}>
              <View style={styles.datePickerContainer}>
                <ThemedText style={styles.inputLabel}>Date</ThemedText>
                <TouchableOpacity
                  style={styles.dateTimeButton}
                  onPress={() => setShowDatePicker(true)}
                >
                  <IconSymbol 
                    name="calendar" 
                    size={18} 
                    color={theme.colors.primary}
                    style={styles.dateTimeIcon} 
                  />
                  <ThemedText>{format(schedulingDate, 'MMM d, yyyy')}</ThemedText>
                </TouchableOpacity>
              </View>
              
              <View style={styles.timePickerContainer}>
                <ThemedText style={styles.inputLabel}>Time</ThemedText>
                <TouchableOpacity
                  style={styles.dateTimeButton}
                  onPress={() => setShowTimePicker(true)}
                >
                  <IconSymbol 
                    name="clock" 
                    size={18} 
                    color={theme.colors.primary}
                    style={styles.dateTimeIcon} 
                  />
                  <ThemedText>{format(schedulingTime, 'h:mm a')}</ThemedText>
                </TouchableOpacity>
              </View>
            </View>

            {/* Date Picker */}
            {showDatePicker && (
              <DateTimePicker
                value={schedulingDate}
                mode="date"
                display="default"
                minimumDate={new Date()}
                onChange={(event, selectedDate) => {
                  setShowDatePicker(false);
                  if (selectedDate) {
                    setSchedulingDate(selectedDate);
                  }
                }}
              />
            )}

            {/* Time Picker */}
            {showTimePicker && (
              <DateTimePicker
                value={schedulingTime}
                mode="time"
                display="default"
                onChange={(event, selectedDate) => {
                  setShowTimePicker(false);
                  if (selectedDate) {
                    setSchedulingTime(selectedDate);
                  }
                }}
              />
            )}

            {/* Materials Selection */}
            <View style={styles.materialsContainer}>
              <ThemedText style={styles.inputLabel}>Materials for Collection</ThemedText>
              <MaterialSelector
                selectedMaterials={selectedMaterials}
                onSelectionChange={setSelectedMaterials}
              />
            </View>

            {/* Notes */}
            <View style={styles.notesContainer}>
              <ThemedText style={styles.inputLabel}>Special Instructions</ThemedText>
              <Input
                multiline
                numberOfLines={3}
                style={styles.notesInput}
                value={notes}
                onChangeText={setNotes}
                placeholder="Add any special instructions for the collection..."
              />
            </View>

            {/* Recurring Option */}
            <View style={styles.recurringContainer}>
              <View style={styles.recurringToggle}>
                <ThemedText style={styles.recurringLabel}>Recurring Collection</ThemedText>
                <Switch
                  value={isRecurring}
                  onValueChange={(value) => {
                    setIsRecurring(value);
                    if (value) {
                      setShowRecurrenceSelector(true);
                    }
                  }}
                />
              </View>
              
              {isRecurring && !showRecurrenceSelector && (
                <TouchableOpacity
                  style={styles.editRecurrenceButton}
                  onPress={() => setShowRecurrenceSelector(true)}
                >
                  <ThemedText style={styles.recurrencePreview}>
                    {recurrencePattern.frequency === RecurrenceFrequency.WEEKLY
                      ? 'Weekly'
                      : recurrencePattern.frequency === RecurrenceFrequency.BI_WEEKLY
                      ? 'Every 2 weeks'
                      : recurrencePattern.frequency === RecurrenceFrequency.MONTHLY
                      ? 'Monthly'
                      : 'Custom schedule'}
                  </ThemedText>
                  <ThemedText style={styles.editRecurrenceText}>Edit</ThemedText>
                </TouchableOpacity>
              )}
            </View>
          </ThemedView>

          {/* Schedule Button */}
          <View style={styles.buttonContainer}>
            <Button
              onPress={handleScheduleCollection}
              isLoading={isLoading}
              style={styles.scheduleButton}
            >
              {isRecurring ? 'Schedule Recurring Collection' : 'Schedule Collection'}
            </Button>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>

      {/* Recurrence Pattern Modal */}
      {showRecurrenceSelector && (
        <ThemedView style={styles.modalBackground}>
          <ThemedView style={styles.modalContainer}>
            <RecurrencePatternSelector
              initialPattern={recurrencePattern}
              onChange={setRecurrencePattern}
              onCancel={() => setShowRecurrenceSelector(false)}
            />
            <Button
              onPress={() => setShowRecurrenceSelector(false)}
              style={styles.doneButton}
            >
              Done
            </Button>
          </ThemedView>
        </ThemedView>
      )}
    </>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 16,
  },
  card: {
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 16,
  },
  dateTimeContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 16,
  },
  datePickerContainer: {
    flex: 1,
    marginRight: 8,
  },
  timePickerContainer: {
    flex: 1,
    marginLeft: 8,
  },
  inputLabel: {
    fontSize: 14,
    marginBottom: 8,
    fontWeight: '500',
  },
  dateTimeButton: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#ccc',
    borderRadius: 8,
    padding: 12,
  },
  dateTimeIcon: {
    marginRight: 8,
  },
  materialsContainer: {
    marginBottom: 16,
  },
  notesContainer: {
    marginBottom: 16,
  },
  notesInput: {
    minHeight: 80,
    textAlignVertical: 'top',
  },
  recurringContainer: {
    marginBottom: 16,
  },
  recurringToggle: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  recurringLabel: {
    fontSize: 16,
    fontWeight: '500',
  },
  editRecurrenceButton: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 12,
    paddingHorizontal: 16,
    backgroundColor: '#f0f0f0',
    borderRadius: 8,
    marginTop: 8,
  },
  recurrencePreview: {
    fontSize: 14,
  },
  editRecurrenceText: {
    fontSize: 14,
    color: '#007AFF',
    fontWeight: '500',
  },
  buttonContainer: {
    marginVertical: 24,
  },
  scheduleButton: {
    paddingVertical: 14,
  },
  modalBackground: {
    position: 'absolute',
    top: 0,
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 1000,
  },
  modalContainer: {
    width: '90%',
    maxHeight: '80%',
    borderRadius: 12,
    padding: 16,
  },
  doneButton: {
    marginTop: 16,
  },
}); 