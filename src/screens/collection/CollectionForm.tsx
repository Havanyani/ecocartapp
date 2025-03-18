import { Ionicons } from '@expo/vector-icons';
import DateTimePicker from '@react-native-community/datetimepicker';
import React, { useState } from 'react';
import {
    Alert,
    KeyboardAvoidingView,
    Platform,
    ScrollView,
    StyleSheet,
    TextInput,
    TouchableOpacity,
    View
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { MaterialSelector } from '@/components/collection/MaterialSelector';
import { ThemedText, WeightInput } from '@/components/ui';
import { usePlasticCollection } from '@/hooks/usePlasticCollection';

interface CollectionFormProps {
  onSubmitSuccess?: () => void;
  initialData?: Partial<FormData>;
  mode?: 'create' | 'edit';
  collectionId?: string;
}

interface FormData {
  materialType: string;
  estimatedWeight: string;
  address: string;
  notes: string;
  scheduledDateTime: Date;
  contactPhone?: string;
  location?: {
    latitude: number;
    longitude: number;
    address?: string;
  };
}

interface FormErrors {
  materialType?: string;
  estimatedWeight?: string;
  address?: string;
  scheduledDateTime?: string;
  contactPhone?: string;
}

/**
 * Form for scheduling plastic collection pickups
 */
export default function CollectionForm({ 
  onSubmitSuccess, 
  initialData = {}, 
  mode = 'create',
  collectionId
}: CollectionFormProps) {
  const [formData, setFormData] = useState<FormData>({
    materialType: initialData.materialType || '',
    estimatedWeight: initialData.estimatedWeight || '',
    address: initialData.address || '',
    notes: initialData.notes || '',
    scheduledDateTime: initialData.scheduledDateTime || new Date(),
    contactPhone: initialData.contactPhone || '',
    location: initialData.location
  });
  
  const [formErrors, setFormErrors] = useState<FormErrors>({});
  const [showDatePicker, setShowDatePicker] = useState<boolean>(false);
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  
  const { submitPickupRequest, updatePickupRequest } = usePlasticCollection();
  
  // Set minimum date to tomorrow
  const minDate = new Date();
  minDate.setDate(minDate.getDate() + 1);
  
  /**
   * Validates the form data
   */
  const validateForm = (): boolean => {
    const errors: FormErrors = {};
    let isValid = true;
    
    if (!formData.materialType) {
      errors.materialType = 'Please select a material type';
      isValid = false;
    }
    
    if (!formData.estimatedWeight) {
      errors.estimatedWeight = 'Please enter estimated weight';
      isValid = false;
    } else if (isNaN(parseFloat(formData.estimatedWeight)) || parseFloat(formData.estimatedWeight) <= 0) {
      errors.estimatedWeight = 'Please enter a valid weight';
      isValid = false;
    }
    
    if (!formData.address && !formData.location?.address) {
      errors.address = 'Please enter a collection address';
      isValid = false;
    }
    
    if (!formData.scheduledDateTime) {
      errors.scheduledDateTime = 'Please select a date and time';
      isValid = false;
    } else if (formData.scheduledDateTime < minDate) {
      errors.scheduledDateTime = 'Please select a future date';
      isValid = false;
    }
    
    if (formData.contactPhone && !/^\d{10}$/.test(formData.contactPhone.replace(/[^0-9]/g, ''))) {
      errors.contactPhone = 'Please enter a valid phone number';
      isValid = false;
    }
    
    setFormErrors(errors);
    return isValid;
  };
  
  /**
   * Handles form submission
   */
  const handleSubmit = async () => {
    if (!validateForm()) {
      return;
    }
    
    setIsSubmitting(true);
    
    try {
      const dataToSubmit = {
        ...formData,
        estimatedWeight: parseFloat(formData.estimatedWeight),
      };
      
      if (mode === 'create') {
        await submitPickupRequest(dataToSubmit);
        Alert.alert(
          'Success',
          'Your collection request has been scheduled!',
          [{ text: 'OK', onPress: onSubmitSuccess }]
        );
      } else if (mode === 'edit' && collectionId) {
        await updatePickupRequest(collectionId, dataToSubmit);
        Alert.alert(
          'Success',
          'Your collection request has been updated!',
          [{ text: 'OK', onPress: onSubmitSuccess }]
        );
      }
      
      // Reset form if not navigating away
      if (!onSubmitSuccess) {
        setFormData({
          materialType: '',
          estimatedWeight: '',
          address: '',
          notes: '',
          scheduledDateTime: new Date(),
          contactPhone: '',
          location: undefined
        });
      }
    } catch (error) {
      Alert.alert(
        'Error',
        `Failed to ${mode === 'create' ? 'schedule' : 'update'} collection: ${error instanceof Error ? error.message : 'Unknown error'}`
      );
    } finally {
      setIsSubmitting(false);
    }
  };
  
  /**
   * Handles material type selection
   */
  const handleMaterialChange = (material: string) => {
    setFormData(prev => ({ ...prev, materialType: material }));
    if (formErrors.materialType) {
      setFormErrors(prev => ({ ...prev, materialType: undefined }));
    }
  };
  
  /**
   * Handles weight input change
   */
  const handleWeightChange = (weight: string) => {
    setFormData(prev => ({ ...prev, estimatedWeight: weight }));
    if (formErrors.estimatedWeight) {
      setFormErrors(prev => ({ ...prev, estimatedWeight: undefined }));
    }
  };
  
  /**
   * Handles date/time selection
   */
  const handleDateChange = (event: any, selectedDate?: Date) => {
    setShowDatePicker(false);
    
    if (selectedDate) {
      setFormData(prev => ({ ...prev, scheduledDateTime: selectedDate }));
      if (formErrors.scheduledDateTime) {
        setFormErrors(prev => ({ ...prev, scheduledDateTime: undefined }));
      }
    }
  };
  
  /**
   * Handles location selection
   */
  const handleLocationSelect = (location: { latitude: number; longitude: number; address?: string }) => {
    setFormData(prev => ({ 
      ...prev, 
      location,
      address: location.address || prev.address
    }));
    
    if (formErrors.address) {
      setFormErrors(prev => ({ ...prev, address: undefined }));
    }
  };
  
  return (
    <SafeAreaView style={styles.container}>
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={styles.keyboardAvoidingView}
      >
        <ScrollView contentContainerStyle={styles.scrollContainer}>
          <View style={styles.formContainer}>
            <ThemedText variant="h1" style={styles.title}>
              {mode === 'create' ? 'Schedule Collection' : 'Edit Collection'}
            </ThemedText>
            
            {/* Material Type Selection */}
            <View style={styles.formGroup}>
              <ThemedText variant="label">Material Type*</ThemedText>
              <MaterialSelector
                selectedMaterial={formData.materialType}
                onSelectMaterial={handleMaterialChange}
              />
              {formErrors.materialType && (
                <ThemedText style={styles.errorText}>{formErrors.materialType}</ThemedText>
              )}
            </View>
            
            {/* Estimated Weight */}
            <View style={styles.formGroup}>
              <ThemedText variant="label">Estimated Weight (kg)*</ThemedText>
              <WeightInput
                value={formData.estimatedWeight}
                onChangeText={handleWeightChange}
                placeholder="Enter estimated weight"
              />
              {formErrors.estimatedWeight && (
                <ThemedText style={styles.errorText}>{formErrors.estimatedWeight}</ThemedText>
              )}
            </View>
            
            {/* Collection Address */}
            <View style={styles.formGroup}>
              <ThemedText variant="label">Collection Address*</ThemedText>
              <TextInput
                style={styles.input}
                value={formData.location?.address || formData.address}
                onChangeText={(text) => setFormData(prev => ({ ...prev, address: text }))}
                placeholder="Enter collection address"
                multiline
              />
              <TouchableOpacity 
                style={styles.locationButton}
                onPress={() => {/* Open location picker */}}
              >
                <Ionicons name="location-outline" size={24} color="#4F8EF7" />
                <ThemedText style={styles.locationButtonText}>Use Current Location</ThemedText>
              </TouchableOpacity>
              {formErrors.address && (
                <ThemedText style={styles.errorText}>{formErrors.address}</ThemedText>
              )}
            </View>
            
            {/* Scheduled Date/Time */}
            <View style={styles.formGroup}>
              <ThemedText variant="label">Scheduled Date/Time*</ThemedText>
              <TouchableOpacity 
                style={styles.datePickerButton}
                onPress={() => setShowDatePicker(true)}
              >
                <Ionicons name="calendar-outline" size={24} color="#4F8EF7" />
                <ThemedText>
                  {formData.scheduledDateTime.toLocaleDateString()} {formData.scheduledDateTime.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                </ThemedText>
              </TouchableOpacity>
              {showDatePicker && (
                <DateTimePicker
                  value={formData.scheduledDateTime}
                  mode="datetime"
                  display="default"
                  onChange={handleDateChange}
                  minimumDate={minDate}
                />
              )}
              {formErrors.scheduledDateTime && (
                <ThemedText style={styles.errorText}>{formErrors.scheduledDateTime}</ThemedText>
              )}
            </View>
            
            {/* Contact Phone */}
            <View style={styles.formGroup}>
              <ThemedText variant="label">Contact Phone (optional)</ThemedText>
              <TextInput
                style={styles.input}
                value={formData.contactPhone}
                onChangeText={(text) => setFormData(prev => ({ ...prev, contactPhone: text }))}
                placeholder="Enter contact phone"
                keyboardType="phone-pad"
              />
              {formErrors.contactPhone && (
                <ThemedText style={styles.errorText}>{formErrors.contactPhone}</ThemedText>
              )}
            </View>
            
            {/* Notes */}
            <View style={styles.formGroup}>
              <ThemedText variant="label">Additional Notes (optional)</ThemedText>
              <TextInput
                style={[styles.input, styles.textArea]}
                value={formData.notes}
                onChangeText={(text) => setFormData(prev => ({ ...prev, notes: text }))}
                placeholder="Enter any additional details"
                multiline
                numberOfLines={4}
              />
            </View>
            
            {/* Submit Button */}
            <TouchableOpacity 
              style={[styles.submitButton, isSubmitting && styles.submitButtonDisabled]}
              onPress={handleSubmit}
              disabled={isSubmitting}
            >
              <ThemedText style={styles.submitButtonText}>
                {isSubmitting 
                  ? 'Submitting...' 
                  : mode === 'create' 
                    ? 'Schedule Collection' 
                    : 'Update Collection'}
              </ThemedText>
            </TouchableOpacity>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  keyboardAvoidingView: {
    flex: 1,
  },
  scrollContainer: {
    flexGrow: 1,
    padding: 16,
  },
  formContainer: {
    flex: 1,
  },
  title: {
    marginBottom: 24,
    textAlign: 'center',
  },
  formGroup: {
    marginBottom: 20,
  },
  input: {
    backgroundColor: '#ffffff',
    borderRadius: 8,
    padding: 12,
    fontSize: 16,
    borderWidth: 1,
    borderColor: '#e0e0e0',
    marginTop: 6,
  },
  textArea: {
    minHeight: 100,
    textAlignVertical: 'top',
  },
  datePickerButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#ffffff',
    borderRadius: 8,
    padding: 12,
    borderWidth: 1,
    borderColor: '#e0e0e0',
    marginTop: 6,
    gap: 8,
  },
  locationButton: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 6,
    gap: 4,
  },
  locationButtonText: {
    color: '#4F8EF7',
  },
  errorText: {
    color: '#e53935',
    fontSize: 14,
    marginTop: 4,
  },
  submitButton: {
    backgroundColor: '#4F8EF7',
    borderRadius: 8,
    padding: 16,
    alignItems: 'center',
    marginTop: 16,
  },
  submitButtonDisabled: {
    backgroundColor: '#A5C4FD',
  },
  submitButtonText: {
    color: '#ffffff',
    fontSize: 16,
    fontWeight: '600',
  },
}); 