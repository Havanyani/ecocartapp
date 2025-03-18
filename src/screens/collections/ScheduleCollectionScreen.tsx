/**
 * ScheduleCollectionScreen.tsx
 * 
 * Screen for scheduling recycling collections with form validation and error handling.
 */

import { Ionicons } from '@expo/vector-icons';
import DateTimePicker from '@react-native-community/datetimepicker';
import React, { useState } from 'react';
import {
    ActivityIndicator,
    Alert,
    KeyboardAvoidingView,
    Platform,
    ScrollView,
    StyleSheet,
    Text,
    TextInput,
    TouchableOpacity,
    View
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useAuth } from '@/contexts/AuthContext';
import useNetworkStatus from '@/hooks/useNetworkStatus';

interface FormData {
  materialType: string;
  estimatedWeight: string;
  address: string;
  notes: string;
  scheduledDateTime: Date;
}

interface FormErrors {
  materialType?: string;
  estimatedWeight?: string;
  address?: string;
  scheduledDateTime?: string;
  notes?: string;
}

interface ScheduleCollectionScreenProps {
  navigation: any;
}

export default function ScheduleCollectionScreen({ navigation }: ScheduleCollectionScreenProps) {
  const { user } = useAuth();
  const { isOnline } = useNetworkStatus();
  
  // Form state
  const [formData, setFormData] = useState<FormData>({
    materialType: '',
    estimatedWeight: '',
    address: '',
    notes: '',
    scheduledDateTime: new Date(Date.now() + 24 * 60 * 60 * 1000) // Tomorrow
  });
  
  const [formErrors, setFormErrors] = useState<FormErrors>({});
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  // Validate form
  const validateForm = (): boolean => {
    const errors: FormErrors = {};
    let isValid = true;
    
    // Material type validation
    if (!formData.materialType) {
      errors.materialType = 'Material type is required';
      isValid = false;
    }
    
    // Estimated weight validation
    if (!formData.estimatedWeight) {
      errors.estimatedWeight = 'Estimated weight is required';
      isValid = false;
    } else if (isNaN(Number(formData.estimatedWeight))) {
      errors.estimatedWeight = 'Weight must be a valid number';
      isValid = false;
    }
    
    // Address validation
    if (!formData.address) {
      errors.address = 'Collection address is required';
      isValid = false;
    }
    
    // Date validation
    if (formData.scheduledDateTime <= new Date()) {
      errors.scheduledDateTime = 'Collection date must be in the future';
      isValid = false;
    }
    
    setFormErrors(errors);
    return isValid;
  };
  
  // Handle form field changes
  const handleChange = (field: keyof FormData, value: any) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    
    // Clear field error when typing
    if (formErrors[field]) {
      setFormErrors(prev => ({ ...prev, [field]: undefined }));
    }
  };
  
  // Handle form submission
  const handleSubmit = async () => {
    if (!isOnline) {
      Alert.alert(
        'Offline Mode',
        'Your collection will be scheduled when you reconnect to the internet.',
        [{ text: 'OK' }]
      );
    }
    
    if (!validateForm()) {
      return;
    }
    
    setIsSubmitting(true);
    
    try {
      // TODO: Implement API call to schedule collection
      // Simulate API call with a timeout
      setTimeout(() => {
        Alert.alert(
          'Collection Scheduled',
          'Your collection has been scheduled successfully!',
          [
            {
              text: 'OK',
              onPress: () => navigation.navigate('Collections')
            }
          ]
        );
        setIsSubmitting(false);
      }, 1500);
    } catch (error) {
      Alert.alert('Error', 'Failed to schedule collection. Please try again.');
      setIsSubmitting(false);
    }
  };
  
  return (
    <SafeAreaView style={styles.safeArea}>
      <KeyboardAvoidingView
        style={styles.container}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        keyboardVerticalOffset={Platform.OS === 'ios' ? 64 : 0}
      >
        <ScrollView contentContainerStyle={styles.scrollContent}>
          <View style={styles.header}>
            <Text style={styles.title}>Schedule Collection</Text>
          </View>
          
          {/* Offline Warning */}
          {!isOnline && (
            <View style={styles.offlineWarning}>
              <Ionicons name="cloud-offline" size={20} color="#FFFFFF" />
              <Text style={styles.offlineText}>
                You're offline. Collection will be scheduled when you reconnect.
              </Text>
            </View>
          )}
          
          <View style={styles.formContainer}>
            {/* Material Type */}
            <View style={styles.formGroup}>
              <Text style={styles.label}>Material Type *</Text>
              <View style={[
                styles.inputContainer,
                formErrors.materialType && styles.inputError
              ]}>
                <TextInput
                  style={styles.input}
                  value={formData.materialType}
                  onChangeText={(text) => handleChange('materialType', text)}
                  placeholder="e.g., Plastic, Paper, Glass"
                  placeholderTextColor="#8E8E93"
                />
              </View>
              {formErrors.materialType && (
                <Text style={styles.errorText}>{formErrors.materialType}</Text>
              )}
            </View>
            
            {/* Estimated Weight */}
            <View style={styles.formGroup}>
              <Text style={styles.label}>Estimated Weight (kg) *</Text>
              <View style={[
                styles.inputContainer,
                formErrors.estimatedWeight && styles.inputError
              ]}>
                <TextInput
                  style={styles.input}
                  value={formData.estimatedWeight}
                  onChangeText={(text) => handleChange('estimatedWeight', text)}
                  placeholder="e.g., 5"
                  placeholderTextColor="#8E8E93"
                  keyboardType="numeric"
                />
              </View>
              {formErrors.estimatedWeight && (
                <Text style={styles.errorText}>{formErrors.estimatedWeight}</Text>
              )}
            </View>
            
            {/* Address */}
            <View style={styles.formGroup}>
              <Text style={styles.label}>Collection Address *</Text>
              <View style={[
                styles.inputContainer,
                formErrors.address && styles.inputError
              ]}>
                <TextInput
                  style={[styles.input, styles.multilineInput]}
                  value={formData.address}
                  onChangeText={(text) => handleChange('address', text)}
                  placeholder="Enter your address"
                  placeholderTextColor="#8E8E93"
                  multiline
                  numberOfLines={3}
                  textAlignVertical="top"
                />
              </View>
              {formErrors.address && (
                <Text style={styles.errorText}>{formErrors.address}</Text>
              )}
            </View>
            
            {/* Collection Date and Time */}
            <View style={styles.formGroup}>
              <Text style={styles.label}>Collection Date & Time *</Text>
              <TouchableOpacity 
                style={[
                  styles.datePickerButton,
                  formErrors.scheduledDateTime && styles.inputError
                ]}
                onPress={() => setShowDatePicker(true)}
              >
                <Text style={styles.dateText}>
                  {formData.scheduledDateTime.toLocaleString()}
                </Text>
                <Ionicons name="calendar-outline" size={24} color="#8E8E93" />
              </TouchableOpacity>
              {showDatePicker && (
                <DateTimePicker
                  value={formData.scheduledDateTime}
                  mode="datetime"
                  display="default"
                  onChange={(event, selectedDate) => {
                    setShowDatePicker(Platform.OS === 'ios'); // Keep open on iOS
                    if (selectedDate) {
                      handleChange('scheduledDateTime', selectedDate);
                    }
                  }}
                  minimumDate={new Date()}
                />
              )}
              {formErrors.scheduledDateTime && (
                <Text style={styles.errorText}>{formErrors.scheduledDateTime}</Text>
              )}
            </View>
            
            {/* Notes */}
            <View style={styles.formGroup}>
              <Text style={styles.label}>Additional Notes</Text>
              <View style={styles.inputContainer}>
                <TextInput
                  style={[styles.input, styles.multilineInput]}
                  value={formData.notes}
                  onChangeText={(text) => handleChange('notes', text)}
                  placeholder="Any special instructions? (optional)"
                  placeholderTextColor="#8E8E93"
                  multiline
                  numberOfLines={4}
                  textAlignVertical="top"
                />
              </View>
            </View>
            
            {/* Submit Button */}
            <TouchableOpacity 
              style={[styles.submitButton, isSubmitting && styles.submitButtonDisabled]}
              onPress={handleSubmit}
              disabled={isSubmitting}
            >
              {isSubmitting ? (
                <ActivityIndicator color="#FFFFFF" />
              ) : (
                <Text style={styles.submitButtonText}>Schedule Collection</Text>
              )}
            </TouchableOpacity>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#FFFFFF'
  },
  container: {
    flex: 1
  },
  scrollContent: {
    flexGrow: 1,
    padding: 16
  },
  header: {
    marginBottom: 24
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#2C3E50'
  },
  offlineWarning: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FF9500',
    borderRadius: 8,
    padding: 12,
    marginBottom: 16
  },
  offlineText: {
    color: '#FFFFFF',
    fontSize: 14,
    marginLeft: 8,
    flex: 1
  },
  formContainer: {
    marginBottom: 24
  },
  formGroup: {
    marginBottom: 20
  },
  label: {
    fontSize: 16,
    fontWeight: '500',
    color: '#2C3E50',
    marginBottom: 8
  },
  inputContainer: {
    borderWidth: 1,
    borderColor: '#E5E5EA',
    borderRadius: 8,
    paddingHorizontal: 12
  },
  inputError: {
    borderColor: '#FF3B30'
  },
  input: {
    height: 48,
    fontSize: 16,
    color: '#2C3E50'
  },
  multilineInput: {
    height: 100,
    paddingTop: 12,
    textAlignVertical: 'top'
  },
  errorText: {
    color: '#FF3B30',
    fontSize: 14,
    marginTop: 4
  },
  datePickerButton: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#E5E5EA',
    borderRadius: 8,
    paddingHorizontal: 12,
    height: 48
  },
  dateText: {
    fontSize: 16,
    color: '#2C3E50'
  },
  submitButton: {
    backgroundColor: '#34C759',
    borderRadius: 8,
    height: 50,
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 16
  },
  submitButtonDisabled: {
    backgroundColor: '#8E8E93'
  },
  submitButtonText: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#FFFFFF'
  }
}); 