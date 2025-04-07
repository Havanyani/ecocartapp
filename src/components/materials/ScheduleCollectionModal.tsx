import { Ionicons } from '@expo/vector-icons';
import DateTimePicker from '@react-native-community/datetimepicker';
import Slider from '@react-native-community/slider';
import React, { useEffect, useState } from 'react';
import {
    ActivityIndicator,
    Alert,
    KeyboardAvoidingView,
    Modal,
    Platform,
    ScrollView,
    StyleSheet,
    TextInput,
    TouchableOpacity,
    View
} from 'react-native';
import { Material } from '../../api/MaterialsApi';
import { useTheme } from '../../contexts/ThemeContext';
import { ThemedText, ThemedView } from '../themed';

interface ScheduleCollectionModalProps {
  visible: boolean;
  material: Material;
  onClose: () => void;
  onSchedule: (scheduleData: ScheduleCollectionData) => Promise<void>;
}

export interface ScheduleCollectionData {
  materialId: string;
  materialName: string;
  scheduledDate: Date;
  estimatedWeight: number;
  notes: string;
  address: string;
}

export default function ScheduleCollectionModal({
  visible,
  material,
  onClose,
  onSchedule
}: ScheduleCollectionModalProps) {
  const { theme } = useTheme();
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  // Form state
  const [date, setDate] = useState(new Date());
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [estimatedWeight, setEstimatedWeight] = useState(1);
  const [notes, setNotes] = useState('');
  const [address, setAddress] = useState('');
  
  // Set default date to tomorrow
  useEffect(() => {
    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);
    tomorrow.setHours(9, 0, 0, 0);
    setDate(tomorrow);
  }, [visible]);
  
  // Weight helper text based on material
  const getWeightHelper = () => {
    if (!material) return "";
    
    switch (material.category) {
      case 'Plastic':
        return `${estimatedWeight}kg is approximately ${Math.round(estimatedWeight * 50)} plastic bottles`;
      case 'Paper':
        return `${estimatedWeight}kg is approximately ${Math.round(estimatedWeight * 100)} sheets of paper`;
      case 'Glass':
        return `${estimatedWeight}kg is approximately ${Math.round(estimatedWeight * 3)} glass bottles`;
      case 'Metal':
        return `${estimatedWeight}kg is approximately ${Math.round(estimatedWeight * 65)} aluminum cans`;
      default:
        return `Estimated weight: ${estimatedWeight}kg`;
    }
  };
  
  const handleDateChange = (event: any, selectedDate?: Date) => {
    setShowDatePicker(Platform.OS === 'ios');
    if (selectedDate) {
      setDate(selectedDate);
    }
  };
  
  const handleSubmit = async () => {
    if (!address.trim()) {
      Alert.alert('Error', 'Please enter your address for collection');
      return;
    }
    
    try {
      setIsSubmitting(true);
      
      const collectionData: ScheduleCollectionData = {
        materialId: material.id,
        materialName: material.name,
        scheduledDate: date,
        estimatedWeight: estimatedWeight,
        notes: notes.trim(),
        address: address.trim()
      };
      
      await onSchedule(collectionData);
      setIsSubmitting(false);
      onClose();
      
      // Reset form state
      setEstimatedWeight(1);
      setNotes('');
      setAddress('');
      
    } catch (error) {
      setIsSubmitting(false);
      Alert.alert(
        'Error',
        'Failed to schedule collection. Please try again later.'
      );
    }
  };
  
  return (
    <Modal
      animationType="slide"
      transparent={true}
      visible={visible}
      onRequestClose={onClose}
    >
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={styles.modalContainer}
      >
        <ThemedView style={styles.modalContent}>
          {/* Header */}
          <View style={styles.modalHeader}>
            <TouchableOpacity onPress={onClose} style={styles.closeButton}>
              <Ionicons name="close" size={24} color={theme.colors.text} />
            </TouchableOpacity>
            <ThemedText style={styles.modalTitle}>
              Schedule {material?.name} Collection
            </ThemedText>
            <View style={styles.headerSpacer} />
          </View>
          
          <ScrollView style={styles.form}>
            {/* Collection Date */}
            <ThemedView style={styles.formGroup}>
              <ThemedText style={styles.label}>Collection Date</ThemedText>
              <TouchableOpacity
                style={[
                  styles.dateInput,
                  { borderColor: theme.colors.border }
                ]}
                onPress={() => setShowDatePicker(true)}
              >
                <Ionicons
                  name="calendar-outline"
                  size={20}
                  color={theme.colors.primary}
                  style={styles.inputIcon}
                />
                <ThemedText>
                  {date.toLocaleDateString(undefined, {
                    weekday: 'long',
                    year: 'numeric',
                    month: 'long',
                    day: 'numeric',
                  })}
                </ThemedText>
              </TouchableOpacity>
              <ThemedText style={styles.helperText}>
                Our drivers collect between 9am-5pm
              </ThemedText>
              
              {showDatePicker && (
                <DateTimePicker
                  value={date}
                  mode="date"
                  display="default"
                  onChange={handleDateChange}
                  minimumDate={new Date()}
                />
              )}
            </ThemedView>
            
            {/* Estimated Weight */}
            <ThemedView style={styles.formGroup}>
              <ThemedText style={styles.label}>
                Estimated Weight ({estimatedWeight}kg)
              </ThemedText>
              <Slider
                style={styles.slider}
                value={estimatedWeight}
                onValueChange={setEstimatedWeight}
                minimumValue={0.5}
                maximumValue={10}
                step={0.5}
                minimumTrackTintColor={theme.colors.primary}
                maximumTrackTintColor={theme.colors.border}
                thumbTintColor={theme.colors.primary}
              />
              <ThemedText style={styles.helperText}>
                {getWeightHelper()}
              </ThemedText>
            </ThemedView>
            
            {/* Address */}
            <ThemedView style={styles.formGroup}>
              <ThemedText style={styles.label}>Collection Address</ThemedText>
              <TextInput
                style={[
                  styles.textInput,
                  {
                    borderColor: theme.colors.border,
                    color: theme.colors.text,
                    backgroundColor: theme.dark
                      ? 'rgba(255, 255, 255, 0.05)'
                      : 'rgba(0, 0, 0, 0.05)',
                  },
                ]}
                value={address}
                onChangeText={setAddress}
                placeholder="Enter your address"
                placeholderTextColor={theme.colors.text + '80'}
                multiline
              />
            </ThemedView>
            
            {/* Notes */}
            <ThemedView style={styles.formGroup}>
              <ThemedText style={styles.label}>Notes (Optional)</ThemedText>
              <TextInput
                style={[
                  styles.textInput,
                  styles.textArea,
                  {
                    borderColor: theme.colors.border,
                    color: theme.colors.text,
                    backgroundColor: theme.dark
                      ? 'rgba(255, 255, 255, 0.05)'
                      : 'rgba(0, 0, 0, 0.05)',
                  },
                ]}
                value={notes}
                onChangeText={setNotes}
                placeholder="Special instructions for the driver"
                placeholderTextColor={theme.colors.text + '80'}
                multiline
                numberOfLines={4}
              />
            </ThemedView>
            
            {/* Info Card */}
            <ThemedView style={[styles.infoCard, { backgroundColor: theme.colors.primary + '20' }]}>
              <Ionicons name="information-circle-outline" size={24} color={theme.colors.primary} style={styles.infoIcon} />
              <ThemedText style={styles.infoText}>
                Our delivery drivers will collect your recyclable {material?.name.toLowerCase()} 
                during their regular route. Make sure to have your items properly prepared 
                according to the recycling tips.
              </ThemedText>
            </ThemedView>
          </ScrollView>
          
          {/* Submit Button */}
          <TouchableOpacity
            style={[
              styles.scheduleButton,
              { backgroundColor: theme.colors.primary },
              isSubmitting && { opacity: 0.7 }
            ]}
            onPress={handleSubmit}
            disabled={isSubmitting}
          >
            {isSubmitting ? (
              <ActivityIndicator color="#fff" size="small" />
            ) : (
              <>
                <Ionicons name="checkmark-circle-outline" size={20} color="#fff" />
                <ThemedText style={styles.scheduleButtonText}>
                  Confirm Collection
                </ThemedText>
              </>
            )}
          </TouchableOpacity>
        </ThemedView>
      </KeyboardAvoidingView>
    </Modal>
  );
}

const styles = StyleSheet.create({
  modalContainer: {
    flex: 1,
    justifyContent: 'flex-end',
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
  },
  modalContent: {
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    paddingBottom: Platform.OS === 'ios' ? 34 : 24,
    height: '85%',
  },
  modalHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 16,
    borderBottomWidth: StyleSheet.hairlineWidth,
  },
  closeButton: {
    padding: 4,
  },
  headerSpacer: {
    width: 28,
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: 'bold',
  },
  form: {
    padding: 16,
  },
  formGroup: {
    marginBottom: 20,
  },
  label: {
    fontSize: 16,
    fontWeight: '500',
    marginBottom: 8,
  },
  dateInput: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 12,
  },
  inputIcon: {
    marginRight: 8,
  },
  slider: {
    width: '100%',
    height: 40,
  },
  textInput: {
    borderWidth: 1,
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 10,
    fontSize: 16,
  },
  textArea: {
    minHeight: 100,
    textAlignVertical: 'top',
  },
  helperText: {
    fontSize: 12,
    marginTop: 4,
    opacity: 0.7,
  },
  infoCard: {
    flexDirection: 'row',
    padding: 16,
    borderRadius: 8,
    marginVertical: 16,
  },
  infoIcon: {
    marginRight: 12,
  },
  infoText: {
    flex: 1,
    fontSize: 14,
    lineHeight: 20,
  },
  scheduleButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginHorizontal: 16,
    paddingVertical: 14,
    borderRadius: 8,
  },
  scheduleButtonText: {
    color: '#fff',
    fontWeight: 'bold',
    marginLeft: 8,
    fontSize: 16,
  },
}); 