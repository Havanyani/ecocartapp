import ConflictResolutionDialog from '@/components/ConflictResolutionDialog';
import ConnectionStatus from '@/components/ConnectionStatus';
import useNetworkStatus from '@/hooks/useNetworkStatus';
import { useOfflineForm } from '@/hooks/useOfflineForm';
import { useTheme } from '@/hooks/useTheme';
import { prepareConflictData } from '@/utils/ConflictResolution';
import { Ionicons } from '@expo/vector-icons';
import DateTimePicker from '@react-native-community/datetimepicker';
import { useRouter } from 'expo-router';
import React, { useState } from 'react';
import {
    Alert,
    ScrollView,
    StyleSheet,
    Text,
    TextInput,
    TouchableOpacity,
    View
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useAppDispatch, useAppSelector } from '../../../src/store';
import { selectMaterials } from '../../../src/store/slices/ecoCartSlice';

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
}

export default function ScheduleCollectionScreen() {
  const router = useRouter();
  const { theme } = useTheme();
  const { isOnline } = useNetworkStatus();
  const dispatch = useAppDispatch();
  const materials = useAppSelector(selectMaterials);
  
  const [formData, setFormData] = useState<FormData>({
    materialType: '',
    estimatedWeight: '',
    address: '',
    notes: '',
    scheduledDateTime: new Date()
  });
  
  const [errors, setErrors] = useState<FormErrors>({});
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [conflictData, setConflictData] = useState<any>(null);
  const [showConflictDialog, setShowConflictDialog] = useState(false);
  
  const { submitForm, isSubmitting, isOfflineSubmit, pendingSubmissions } = useOfflineForm<FormData>({
    formId: 'collection-schedule',
    entityType: 'collection',
    priority: 'high',
    onSuccess: (data) => {
      Alert.alert(
        'Success!',
        isOnline 
          ? 'Your collection has been scheduled.' 
          : 'Your collection has been saved and will be scheduled when you are back online.',
        [{ text: 'OK', onPress: () => router.back() }]
      );
    },
    onError: (error) => {
      Alert.alert('Error', error.message);
    },
    onOfflineSubmit: () => {
      console.log('Saved offline collection schedule');
    }
  });
  
  const validateForm = (): boolean => {
    const newErrors: FormErrors = {};
    
    if (!formData.materialType.trim()) {
      newErrors.materialType = 'Material type is required';
    }
    
    if (!formData.estimatedWeight.trim()) {
      newErrors.estimatedWeight = 'Estimated weight is required';
    } else if (isNaN(parseFloat(formData.estimatedWeight))) {
      newErrors.estimatedWeight = 'Please enter a valid number';
    }
    
    if (!formData.address.trim()) {
      newErrors.address = 'Address is required';
    }
    
    const selectedDate = formData.scheduledDateTime;
    const now = new Date();
    if (selectedDate.getTime() < now.getTime()) {
      newErrors.scheduledDateTime = 'Please select a future date and time';
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };
  
  const handleChange = (field: keyof FormData, value: any) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };
  
  const handleDateChange = (event: any, selectedDate?: Date) => {
    setShowDatePicker(false);
    if (selectedDate) {
      handleChange('scheduledDateTime', selectedDate);
    }
  };
  
  const handleSubmit = async () => {
    if (!validateForm()) {
      return;
    }
    
    // For demonstration, simulate a conflict with server data
    // In a real app, this would come from the server during sync
    if (Math.random() > 0.7 && isOnline) {
      const serverData = {
        ...formData,
        address: formData.address + ' (Updated by admin)',
        scheduledDateTime: new Date(formData.scheduledDateTime.getTime() + 24 * 60 * 60 * 1000) // Next day
      };
      
      const conflict = prepareConflictData(
        serverData,
        formData,
        'collection',
        'new',
        Date.now(),
        Date.now() - 1000 // Client data is "older"
      );
      
      setConflictData(conflict);
      setShowConflictDialog(true);
      return;
    }
    
    try {
      const result = await submitForm(formData, { action: 'create' });
      
      if (result.success) {
        // Handle success (already handled by onSuccess callback)
      }
    } catch (error) {
      console.error('Failed to submit form:', error);
    }
  };
  
  const handleResolveConflict = (resolvedData: FormData) => {
    setShowConflictDialog(false);
    
    // Use the resolved data for submission
    submitForm(resolvedData, { action: 'create' });
  };
  
  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: theme.colors.background }}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
          <Ionicons name="arrow-back" size={24} color={theme.colors.text} />
        </TouchableOpacity>
        <Text style={[styles.title, { color: theme.colors.text }]}>Schedule Collection</Text>
        <View style={{ width: 24 }} />
      </View>
      
      <ConnectionStatus />
      
      {pendingSubmissions > 0 && (
        <View style={[styles.pendingBanner, { backgroundColor: theme.colors.warning + '30' }]}>
          <Ionicons name="time-outline" size={20} color={theme.colors.warning} />
          <Text style={[styles.pendingText, { color: theme.colors.text }]}>
            You have {pendingSubmissions} pending collection request{pendingSubmissions > 1 ? 's' : ''}
          </Text>
        </View>
      )}
      
      <ScrollView 
        style={styles.container} 
        contentContainerStyle={styles.contentContainer}
      >
        <View style={styles.formGroup}>
          <Text style={[styles.label, { color: theme.colors.text }]}>Material Type *</Text>
          <TextInput
            style={[
              styles.input, 
              { 
                color: theme.colors.text,
                borderColor: errors.materialType ? theme.colors.error : theme.colors.text + '40'
              }
            ]}
            value={formData.materialType}
            onChangeText={(value) => handleChange('materialType', value)}
            placeholder="e.g., Plastic, Paper, Glass"
            placeholderTextColor={theme.colors.text + '80'}
          />
          {errors.materialType && (
            <Text style={[styles.errorText, { color: theme.colors.error }]}>
              {errors.materialType}
            </Text>
          )}
        </View>
        
        <View style={styles.formGroup}>
          <Text style={[styles.label, { color: theme.colors.text }]}>Estimated Weight (kg) *</Text>
          <TextInput
            style={[
              styles.input, 
              { 
                color: theme.colors.text,
                borderColor: errors.estimatedWeight ? theme.colors.error : theme.colors.text + '40'
              }
            ]}
            value={formData.estimatedWeight}
            onChangeText={(value) => handleChange('estimatedWeight', value)}
            keyboardType="numeric"
            placeholder="e.g., 5.5"
            placeholderTextColor={theme.colors.text + '80'}
          />
          {errors.estimatedWeight && (
            <Text style={[styles.errorText, { color: theme.colors.error }]}>
              {errors.estimatedWeight}
            </Text>
          )}
        </View>
        
        <View style={styles.formGroup}>
          <Text style={[styles.label, { color: theme.colors.text }]}>Pickup Address *</Text>
          <TextInput
            style={[
              styles.input, 
              { 
                color: theme.colors.text,
                borderColor: errors.address ? theme.colors.error : theme.colors.text + '40'
              }
            ]}
            value={formData.address}
            onChangeText={(value) => handleChange('address', value)}
            placeholder="Enter your full address"
            placeholderTextColor={theme.colors.text + '80'}
            multiline
          />
          {errors.address && (
            <Text style={[styles.errorText, { color: theme.colors.error }]}>
              {errors.address}
            </Text>
          )}
        </View>
        
        <View style={styles.formGroup}>
          <Text style={[styles.label, { color: theme.colors.text }]}>Pickup Date & Time *</Text>
          <TouchableOpacity 
            style={[
              styles.dateInput, 
              { 
                borderColor: errors.scheduledDateTime ? theme.colors.error : theme.colors.text + '40',
                backgroundColor: theme.colors.text + '10'
              }
            ]}
            onPress={() => setShowDatePicker(true)}
          >
            <Text style={{ color: theme.colors.text }}>
              {formData.scheduledDateTime.toLocaleString()}
            </Text>
            <Ionicons name="calendar" size={24} color={theme.colors.text} />
          </TouchableOpacity>
          {errors.scheduledDateTime && (
            <Text style={[styles.errorText, { color: theme.colors.error }]}>
              {errors.scheduledDateTime}
            </Text>
          )}
          {showDatePicker && (
            <DateTimePicker
              value={formData.scheduledDateTime}
              mode="datetime"
              display="default"
              onChange={handleDateChange}
              minimumDate={new Date()}
            />
          )}
        </View>
        
        <View style={styles.formGroup}>
          <Text style={[styles.label, { color: theme.colors.text }]}>Additional Notes</Text>
          <TextInput
            style={[
              styles.input, 
              styles.textArea,
              { 
                color: theme.colors.text,
                borderColor: theme.colors.text + '40'
              }
            ]}
            value={formData.notes}
            onChangeText={(value) => handleChange('notes', value)}
            placeholder="Any special instructions or details about your collection"
            placeholderTextColor={theme.colors.text + '80'}
            multiline
            numberOfLines={4}
            textAlignVertical="top"
          />
        </View>
        
        <TouchableOpacity
          style={[
            styles.submitButton,
            { backgroundColor: theme.colors.primary },
            isSubmitting && { opacity: 0.7 }
          ]}
          onPress={handleSubmit}
          disabled={isSubmitting}
        >
          <Text style={styles.submitButtonText}>
            {isSubmitting ? 'Scheduling...' : 'Schedule Collection'}
          </Text>
        </TouchableOpacity>
      </ScrollView>
      
      {conflictData && (
        <ConflictResolutionDialog
          conflict={conflictData}
          visible={showConflictDialog}
          onResolve={handleResolveConflict}
          onCancel={() => setShowConflictDialog(false)}
          title="Collection Details Conflict"
          loading={isSubmitting}
        />
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
  backButton: {
    padding: 8,
  },
  title: {
    fontSize: 20,
    fontWeight: 'bold',
  },
  container: {
    flex: 1,
  },
  contentContainer: {
    padding: 16,
  },
  pendingBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 10,
    marginHorizontal: 16,
    marginBottom: 8,
    borderRadius: 8,
  },
  pendingText: {
    marginLeft: 8,
    fontSize: 14,
  },
  formGroup: {
    marginBottom: 20,
  },
  label: {
    fontSize: 16,
    marginBottom: 8,
    fontWeight: '500',
  },
  input: {
    height: 48,
    borderWidth: 1,
    borderRadius: 8,
    paddingHorizontal: 12,
    fontSize: 16,
  },
  textArea: {
    height: 100,
    textAlignVertical: 'top',
    paddingTop: 12,
  },
  dateInput: {
    height: 48,
    borderWidth: 1,
    borderRadius: 8,
    paddingHorizontal: 12,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  errorText: {
    fontSize: 14,
    marginTop: 4,
  },
  submitButton: {
    height: 50,
    borderRadius: 8,
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 16,
    marginBottom: 32,
  },
  submitButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: 'bold',
  },
}); 