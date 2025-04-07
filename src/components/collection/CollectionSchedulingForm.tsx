import { CollectionSummary } from '@/components/collection/CollectionSummary';
import { LocationSelector } from '@/components/collection/LocationSelector';
import { MaterialSelector } from '@/components/collection/MaterialSelector';
import { TimeSlotSelector } from '@/components/collection/TimeSlotSelector';
import { WeightEstimator } from '@/components/collection/WeightEstimator';
import { Button } from '@/components/ui/Button';
import { StepIndicator } from '@/components/ui/StepIndicator';
import { ThemedView } from '@/components/ui/ThemedView';
import { collectionService } from '@/services/CollectionService';
import { CollectionLocation, CollectionMaterials } from '@/types/Collection';
import { TimeSlot } from '@/types/collections';
import { useNavigation } from '@react-navigation/native';
import React, { useState } from 'react';
import { Alert, ScrollView, StyleSheet } from 'react-native';

// Default location for testing
const DEFAULT_LOCATION: CollectionLocation = {
  id: '1',
  type: 'home',
  street: '123 Main St',
  city: 'Eco City',
  state: 'EC',
  zipCode: '12345',
};

interface CollectionSchedulingFormProps {
  onSuccess: () => void;
}

export function CollectionSchedulingForm({ onSuccess }: CollectionSchedulingFormProps) {
  const navigation = useNavigation();
  const [currentStep, setCurrentStep] = useState(0);
  const [materials, setMaterials] = useState<CollectionMaterials[]>([]);
  const [estimatedWeight, setEstimatedWeight] = useState(0);
  const [selectedDate, setSelectedDate] = useState<Date>(new Date());
  const [selectedTimeSlot, setSelectedTimeSlot] = useState<TimeSlot | null>(null);
  const [location, setLocation] = useState<CollectionLocation | null>(DEFAULT_LOCATION);
  const [notes, setNotes] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const steps = [
    'Select Materials',
    'Estimate Weight',
    'Choose Time',
    'Confirm Location',
    'Review'
  ];

  // This would typically come from an API
  const availableTimeSlots: TimeSlot[] = [
    { id: '1', startTime: '09:00', endTime: '11:00', available: true },
    { id: '2', startTime: '11:00', endTime: '13:00', available: true },
    { id: '3', startTime: '13:00', endTime: '15:00', available: false },
    { id: '4', startTime: '15:00', endTime: '17:00', available: true },
    { id: '5', startTime: '17:00', endTime: '19:00', available: true },
  ];

  const handleSelectMaterials = (selectedMaterials: CollectionMaterials[]) => {
    setMaterials(selectedMaterials);
  };

  const handleWeightEstimate = (weight: number) => {
    setEstimatedWeight(weight);
  };

  const handleSelectTimeSlot = (timeSlot: TimeSlot) => {
    setSelectedTimeSlot(timeSlot);
  };

  const handleSelectLocation = (selectedLocation: CollectionLocation) => {
    setLocation(selectedLocation);
  };

  const handleNotesChange = (text: string) => {
    setNotes(text);
  };

  const goToNextStep = () => {
    if (currentStep < steps.length - 1) {
      setCurrentStep(currentStep + 1);
    }
  };

  const goToPreviousStep = () => {
    if (currentStep > 0) {
      setCurrentStep(currentStep - 1);
    }
  };

  const handleSubmit = async () => {
    if (!selectedTimeSlot || !location || materials.length === 0) {
      Alert.alert('Error', 'Please complete all required fields before submitting');
      return;
    }

    setIsSubmitting(true);
    
    try {
      if (selectedTimeSlot) {
        // Call the API to schedule the collection using the selected time slot
        await collectionService.scheduleCollection(selectedTimeSlot);
        
        // Store additional data if needed in a separate API call
        // For example, save materials, location, etc.
        
        Alert.alert(
          'Success', 
          'Your collection has been scheduled!',
          [{ text: 'OK', onPress: onSuccess }]
        );
      }
    } catch (error) {
      console.error('Failed to schedule collection:', error);
      Alert.alert('Error', 'Failed to schedule collection. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const renderStepContent = () => {
    switch (currentStep) {
      case 0:
        return (
          <MaterialSelector 
            selectedMaterials={materials}
            onSelect={handleSelectMaterials}
          />
        );
      case 1:
        return (
          <WeightEstimator 
            materials={materials}
            initialWeight={estimatedWeight}
            onEstimate={handleWeightEstimate}
          />
        );
      case 2:
        return (
          <TimeSlotSelector 
            date={selectedDate}
            onDateChange={setSelectedDate}
            availableSlots={availableTimeSlots}
            selectedSlot={selectedTimeSlot}
            onSelectSlot={handleSelectTimeSlot}
          />
        );
      case 3:
        return (
          <LocationSelector
            location={location}
            onSelectLocation={handleSelectLocation}
          />
        );
      case 4:
        return (
          <CollectionSummary
            date={selectedDate}
            timeSlot={selectedTimeSlot}
            materials={materials}
            location={location}
            estimatedWeight={estimatedWeight}
            notes={notes}
            onNotesChange={handleNotesChange}
          />
        );
      default:
        return null;
    }
  };

  const isNextDisabled = () => {
    switch (currentStep) {
      case 0:
        return materials.length === 0;
      case 1:
        return estimatedWeight <= 0;
      case 2:
        return !selectedTimeSlot;
      case 3:
        return !location;
      default:
        return false;
    }
  };

  return (
    <ThemedView style={styles.container}>
      <StepIndicator 
        steps={steps}
        currentStep={currentStep}
        onStepPress={(index: number) => setCurrentStep(index)}
      />
      
      <ScrollView style={styles.content}>
        {renderStepContent()}
      </ScrollView>
      
      <ThemedView style={styles.buttonContainer}>
        {currentStep > 0 && (
          <Button
            style={styles.button}
            variant="outline"
            onPress={goToPreviousStep}
          >
            Back
          </Button>
        )}
        
        {currentStep < steps.length - 1 ? (
          <Button
            style={styles.button}
            onPress={goToNextStep}
            isDisabled={isNextDisabled()}
          >
            Next
          </Button>
        ) : (
          <Button
            style={styles.button}
            onPress={handleSubmit}
            isDisabled={isSubmitting}
            isLoading={isSubmitting}
          >
            Schedule Collection
          </Button>
        )}
      </ThemedView>
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 16,
  },
  content: {
    flex: 1,
    marginVertical: 20,
  },
  buttonContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 16,
    paddingVertical: 16,
    borderTopWidth: 1,
    borderTopColor: 'rgba(0,0,0,0.1)',
  },
  button: {
    flex: 1,
    marginHorizontal: 8,
  },
}); 