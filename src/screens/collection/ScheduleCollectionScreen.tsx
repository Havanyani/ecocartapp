/**
 * ScheduleCollectionScreen.tsx
 * 
 * Screen for scheduling plastic waste collections.
 * Allows users to select a date, time slot, and estimate the weight of their collection.
 */

import { MaterialSelector } from '@/components/collection/MaterialSelector';
import { WeightEstimator } from '@/components/collection/WeightEstimator';
import { Button } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';
import { IconSymbol } from '@/components/ui/IconSymbol';
import { Text } from '@/components/ui/Text';
import { TextField } from '@/components/ui/TextField';
import { useCollection } from '@/contexts/CollectionContext';
import { useUser } from '@/contexts/UserContext';
import { useLocation } from '@/hooks/useLocation';
import { TimeSlot } from '@/types/collections';
import { MaterialCategory } from '@/types/Material';
import { useNavigation } from '@react-navigation/native';
import { format } from 'date-fns';
import React, { useEffect, useState } from 'react';
import { Alert, ScrollView, StyleSheet, View } from 'react-native';
import { Calendar } from 'react-native-calendars';
import { SafeAreaView } from 'react-native-safe-area-context';

export function ScheduleCollectionScreen() {
  const navigation = useNavigation();
  const { scheduleCollection, getTimeSlots, timeSlots, isLoading, error } = useCollection();
  const { user } = useUser();
  const { getCurrentLocation } = useLocation();
  
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [selectedTimeSlot, setSelectedTimeSlot] = useState<TimeSlot | null>(null);
  const [selectedMaterials, setSelectedMaterials] = useState<MaterialCategory[]>([]);
  const [estimatedWeight, setEstimatedWeight] = useState(0);
  const [notes, setNotes] = useState('');
  const [address, setAddress] = useState('');
  const [isAddressConfirmed, setIsAddressConfirmed] = useState(false);
  
  // Load time slots when date changes
  useEffect(() => {
    getTimeSlots(selectedDate);
  }, [selectedDate]);
  
  // Load user's address when component mounts
  useEffect(() => {
    loadUserAddress();
  }, []);
  
  const loadUserAddress = async () => {
    try {
      if (user?.address) {
        setAddress(user.address);
        setIsAddressConfirmed(true);
      } else {
        const location = await getCurrentLocation();
        if (location) {
          // In a real app, you would use a geocoding service to get the address
          setAddress(`${location.latitude}, ${location.longitude}`);
        }
      }
    } catch (error) {
      console.error('Error loading address:', error);
    }
  };
  
  // Handle date selection
  const handleDateSelect = (date: any) => {
    const newDate = new Date(date.dateString);
    setSelectedDate(newDate);
    setSelectedTimeSlot(null); // Reset time slot when date changes
  };
  
  // Handle time slot selection
  const handleTimeSlotSelect = (slot: TimeSlot) => {
    setSelectedTimeSlot(slot);
  };
  
  // Handle material selection
  const handleMaterialSelect = (materials: MaterialCategory[]) => {
    setSelectedMaterials(materials);
  };
  
  // Handle weight estimation
  const handleWeightEstimate = (weight: number) => {
    setEstimatedWeight(weight);
  };
  
  // Handle form submission
  const handleSubmit = async () => {
    if (!selectedTimeSlot) {
      Alert.alert('Error', 'Please select a time slot');
      return;
    }
    
    if (selectedMaterials.length === 0) {
      Alert.alert('Error', 'Please select at least one material type');
      return;
    }
    
    if (estimatedWeight <= 0) {
      Alert.alert('Error', 'Please estimate the weight of your collection');
      return;
    }
    
    if (!isAddressConfirmed) {
      Alert.alert('Error', 'Please confirm your collection address');
      return;
    }
    
    try {
      await scheduleCollection({
        userId: user!.id,
        scheduledDate: format(selectedDate, 'yyyy-MM-dd'),
        timeSlot: selectedTimeSlot.id,
        materials: selectedMaterials.map(material => ({
          materialId: material.id,
          estimatedWeight: estimatedWeight / selectedMaterials.length, // Distribute weight evenly
        })),
        address: address,
        estimatedWeight: estimatedWeight,
        notes: notes.trim() || undefined,
      });
      
      Alert.alert(
        'Success',
        'Collection scheduled successfully',
        [{ text: 'OK', onPress: () => navigation.goBack() }]
      );
    } catch (err) {
      Alert.alert('Error', 'Failed to schedule collection. Please try again.');
    }
  };
  
  // Format date for calendar
  const formattedDate = format(selectedDate, 'yyyy-MM-dd');
  
  return (
    <SafeAreaView style={styles.container}>
      <ScrollView contentContainerStyle={styles.scrollContent}>
        <Text variant="h1" style={styles.title}>Schedule Collection</Text>
        
        {/* Step indicator */}
        <View style={styles.stepIndicator}>
          <View style={styles.step}>
            <View style={[styles.stepDot, styles.activeStep]}>
              <IconSymbol name="calendar" size={16} color="white" />
            </View>
            <Text style={styles.stepText}>Date & Time</Text>
          </View>
          <View style={styles.stepLine} />
          <View style={styles.step}>
            <View style={[styles.stepDot, selectedMaterials.length > 0 ? styles.activeStep : {}]}>
              <IconSymbol name="recycle" size={16} color={selectedMaterials.length > 0 ? "white" : "#ccc"} />
            </View>
            <Text style={styles.stepText}>Materials</Text>
          </View>
          <View style={styles.stepLine} />
          <View style={styles.step}>
            <View style={[styles.stepDot, isAddressConfirmed ? styles.activeStep : {}]}>
              <IconSymbol name="map-marker" size={16} color={isAddressConfirmed ? "white" : "#ccc"} />
            </View>
            <Text style={styles.stepText}>Address</Text>
          </View>
        </View>
        
        <Card style={styles.card}>
          <Text variant="h2" style={styles.sectionTitle}>Select Date</Text>
          <Calendar
            current={formattedDate}
            onDayPress={handleDateSelect}
            minDate={format(new Date(), 'yyyy-MM-dd')}
            markedDates={{
              [formattedDate]: { selected: true, selectedColor: '#4CAF50' }
            }}
            theme={{
              selectedDayBackgroundColor: '#4CAF50',
              todayTextColor: '#4CAF50',
              arrowColor: '#4CAF50',
            }}
          />
        </Card>
        
        <Card style={styles.card}>
          <Text variant="h2" style={styles.sectionTitle}>Select Time Slot</Text>
          {timeSlots.length > 0 ? (
            <View style={styles.timeSlotContainer}>
              {timeSlots.map((slot) => (
                <Button
                  key={slot.id}
                  variant={selectedTimeSlot?.id === slot.id ? 'primary' : 'outline'}
                  onPress={() => handleTimeSlotSelect(slot)}
                  style={styles.timeSlotButton}
                  disabled={!slot.isAvailable}
                >
                  {slot.startTime} - {slot.endTime}
                </Button>
              ))}
            </View>
          ) : (
            <Text style={styles.noTimeSlots}>
              No time slots available for this date. Please select another date.
            </Text>
          )}
        </Card>
        
        <Card style={styles.card}>
          <Text variant="h2" style={styles.sectionTitle}>Select Materials</Text>
          <MaterialSelector
            selectedMaterials={selectedMaterials}
            onSelectMaterials={handleMaterialSelect}
          />
        </Card>
        
        {selectedMaterials.length > 0 && (
          <Card style={styles.card}>
            <Text variant="h2" style={styles.sectionTitle}>Estimate Weight</Text>
            <WeightEstimator
              materials={selectedMaterials.map(material => ({
                id: material.id,
                material: material,
                estimatedWeight: estimatedWeight / selectedMaterials.length,
              }))}
              onEstimate={handleWeightEstimate}
              initialWeight={estimatedWeight}
            />
          </Card>
        )}
        
        <Card style={styles.card}>
          <Text variant="h2" style={styles.sectionTitle}>Collection Address</Text>
          <View style={styles.addressContainer}>
            <IconSymbol name="map-marker" size={24} color="#4CAF50" />
            <Text style={styles.addressText}>{address}</Text>
          </View>
          
          {!isAddressConfirmed ? (
            <Button
              variant="outline"
              onPress={() => setIsAddressConfirmed(true)}
              style={styles.confirmButton}
            >
              Confirm Address
            </Button>
          ) : (
            <View style={styles.confirmedContainer}>
              <IconSymbol name="check-circle" size={16} color="#4CAF50" />
              <Text style={styles.confirmedText}>Address confirmed</Text>
            </View>
          )}
        </Card>
        
        <Card style={styles.card}>
          <Text variant="h2" style={styles.sectionTitle}>Additional Notes</Text>
          <TextField
            value={notes}
            onChangeText={setNotes}
            placeholder="Any special instructions for collection"
            multiline
            numberOfLines={3}
            style={styles.input}
          />
        </Card>
        
        {error && (
          <Text style={styles.errorText}>{error}</Text>
        )}
        
        <Button
          variant="primary"
          onPress={handleSubmit}
          disabled={isLoading || !selectedTimeSlot || selectedMaterials.length === 0 || !isAddressConfirmed}
          style={styles.submitButton}
        >
          {isLoading ? 'Scheduling...' : 'Schedule Collection'}
        </Button>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  scrollContent: {
    padding: 16,
  },
  title: {
    marginBottom: 16,
    textAlign: 'center',
  },
  stepIndicator: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 24,
    paddingHorizontal: 16,
  },
  step: {
    alignItems: 'center',
  },
  stepDot: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: '#e0e0e0',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 8,
  },
  activeStep: {
    backgroundColor: '#4CAF50',
  },
  stepLine: {
    height: 2,
    backgroundColor: '#e0e0e0',
    flex: 1,
    marginHorizontal: 8,
  },
  stepText: {
    fontSize: 12,
    color: '#666',
  },
  card: {
    marginBottom: 16,
    padding: 16,
  },
  sectionTitle: {
    marginBottom: 12,
  },
  timeSlotContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  timeSlotButton: {
    width: '48%',
    marginBottom: 8,
  },
  noTimeSlots: {
    textAlign: 'center',
    fontStyle: 'italic',
    color: '#666',
  },
  input: {
    marginBottom: 16,
  },
  addressContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
    padding: 12,
    backgroundColor: '#f9f9f9',
    borderRadius: 8,
  },
  addressText: {
    marginLeft: 12,
    flex: 1,
  },
  confirmButton: {
    marginTop: 8,
  },
  confirmedContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 8,
  },
  confirmedText: {
    marginLeft: 8,
    color: '#4CAF50',
  },
  errorText: {
    color: 'red',
    marginBottom: 16,
    textAlign: 'center',
  },
  submitButton: {
    marginTop: 8,
    marginBottom: 24,
  },
}); 