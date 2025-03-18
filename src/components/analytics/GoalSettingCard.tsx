import { useTheme } from '@/hooks/useTheme';
import { RecyclingGoal } from '@/types/analytics';
import { Ionicons } from '@expo/vector-icons';
import DateTimePicker from '@react-native-community/datetimepicker';
import React, { useState } from 'react';
import {
    Platform,
    ScrollView,
    StyleSheet,
    Text,
    TextInput,
    TouchableOpacity,
    View
} from 'react-native';

interface GoalSettingCardProps {
  initialData: Omit<RecyclingGoal, 'id' | 'progress'>;
  onSave: (data: Omit<RecyclingGoal, 'id' | 'progress'>) => void;
  onCancel: () => void;
  isEditing?: boolean;
}

export default function GoalSettingCard({
  initialData,
  onSave,
  onCancel,
  isEditing = false
}: GoalSettingCardProps) {
  const { theme } = useTheme();
  const [formData, setFormData] = useState<Omit<RecyclingGoal, 'id' | 'progress'>>(initialData);
  const [showStartDatePicker, setShowStartDatePicker] = useState(false);
  const [showEndDatePicker, setShowEndDatePicker] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});
  
  // Handle text input changes
  const handleChange = (field: keyof Omit<RecyclingGoal, 'id' | 'progress'>, value: any) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    
    // Clear error for this field
    if (errors[field]) {
      setErrors(prev => {
        const newErrors = { ...prev };
        delete newErrors[field];
        return newErrors;
      });
    }
  };
  
  // Handle date changes
  const handleDateChange = (
    field: 'startDate' | 'endDate',
    event: any,
    selectedDate?: Date
  ) => {
    if (Platform.OS === 'android') {
      setShowStartDatePicker(false);
      setShowEndDatePicker(false);
    }
    
    if (selectedDate) {
      setFormData(prev => ({
        ...prev,
        [field]: selectedDate.toISOString()
      }));
    }
  };
  
  // Validate form data
  const validateForm = () => {
    const newErrors: Record<string, string> = {};
    
    // Check required fields
    if (!formData.title.trim()) {
      newErrors.title = 'Title is required';
    }
    
    if (formData.targetValue <= 0) {
      newErrors.targetValue = 'Target must be greater than 0';
    }
    
    // Check date validity
    const startDate = new Date(formData.startDate);
    const endDate = new Date(formData.endDate);
    
    if (endDate <= startDate) {
      newErrors.endDate = 'End date must be after start date';
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };
  
  // Handle save button press
  const handleSave = () => {
    if (validateForm()) {
      onSave(formData);
    }
  };
  
  // Format date for display
  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString();
  };
  
  return (
    <View style={[styles.container, { backgroundColor: theme.colors.background }]}>
      <View style={styles.header}>
        <Text style={[styles.title, { color: theme.colors.text }]}>
          {isEditing ? 'Edit Goal' : 'New Goal'}
        </Text>
        <TouchableOpacity onPress={onCancel} style={styles.closeButton}>
          <Ionicons name="close" size={24} color={theme.colors.text} />
        </TouchableOpacity>
      </View>
      
      <ScrollView style={styles.formContainer}>
        {/* Title input */}
        <View style={styles.formGroup}>
          <Text style={[styles.label, { color: theme.colors.text }]}>Title</Text>
          <TextInput
            style={[
              styles.input,
              { 
                color: theme.colors.text,
                borderColor: errors.title ? theme.colors.error : theme.colors.border
              }
            ]}
            value={formData.title}
            onChangeText={(value) => handleChange('title', value)}
            placeholder="e.g., Monthly Recycling Goal"
            placeholderTextColor={theme.colors.text + '60'}
          />
          {errors.title && (
            <Text style={[styles.errorText, { color: theme.colors.error }]}>
              {errors.title}
            </Text>
          )}
        </View>
        
        {/* Description input */}
        <View style={styles.formGroup}>
          <Text style={[styles.label, { color: theme.colors.text }]}>Description (Optional)</Text>
          <TextInput
            style={[
              styles.input,
              styles.textArea,
              { color: theme.colors.text, borderColor: theme.colors.border }
            ]}
            value={formData.description}
            onChangeText={(value) => handleChange('description', value)}
            placeholder="Describe your goal..."
            placeholderTextColor={theme.colors.text + '60'}
            multiline
            numberOfLines={3}
          />
        </View>
        
        {/* Goal value inputs */}
        <View style={styles.formRow}>
          <View style={[styles.formGroup, { flex: 1, marginRight: 8 }]}>
            <Text style={[styles.label, { color: theme.colors.text }]}>Target</Text>
            <TextInput
              style={[
                styles.input,
                { 
                  color: theme.colors.text,
                  borderColor: errors.targetValue ? theme.colors.error : theme.colors.border
                }
              ]}
              value={formData.targetValue.toString()}
              onChangeText={(value) => handleChange('targetValue', parseFloat(value) || 0)}
              keyboardType="numeric"
              placeholderTextColor={theme.colors.text + '60'}
            />
            {errors.targetValue && (
              <Text style={[styles.errorText, { color: theme.colors.error }]}>
                {errors.targetValue}
              </Text>
            )}
          </View>
          
          <View style={[styles.formGroup, { flex: 1, marginLeft: 8 }]}>
            <Text style={[styles.label, { color: theme.colors.text }]}>Current Value</Text>
            <TextInput
              style={[
                styles.input,
                { color: theme.colors.text, borderColor: theme.colors.border }
              ]}
              value={formData.currentValue.toString()}
              onChangeText={(value) => handleChange('currentValue', parseFloat(value) || 0)}
              keyboardType="numeric"
              placeholderTextColor={theme.colors.text + '60'}
            />
          </View>
        </View>
        
        {/* Unit and Category */}
        <View style={styles.formRow}>
          <View style={[styles.formGroup, { flex: 1, marginRight: 8 }]}>
            <Text style={[styles.label, { color: theme.colors.text }]}>Unit</Text>
            <View style={[styles.pickerContainer, { borderColor: theme.colors.border }]}>
              <TouchableOpacity 
                style={styles.pickerButton}
                onPress={() => {
                  // Toggle through units: kg, items, collections
                  const units = ['kg', 'items', 'collections'];
                  const currentIndex = units.indexOf(formData.unit);
                  const nextIndex = (currentIndex + 1) % units.length;
                  handleChange('unit', units[nextIndex]);
                }}
              >
                <Text style={[styles.pickerButtonText, { color: theme.colors.text }]}>
                  {formData.unit}
                </Text>
                <Ionicons name="chevron-down" size={16} color={theme.colors.text + '80'} />
              </TouchableOpacity>
            </View>
          </View>
          
          <View style={[styles.formGroup, { flex: 1, marginLeft: 8 }]}>
            <Text style={[styles.label, { color: theme.colors.text }]}>Category</Text>
            <View style={[styles.pickerContainer, { borderColor: theme.colors.border }]}>
              <TouchableOpacity 
                style={styles.pickerButton}
                onPress={() => {
                  // Toggle through categories
                  const categories = ['weight', 'collections', 'impact', 'specific_material'];
                  const currentIndex = categories.indexOf(formData.category);
                  const nextIndex = (currentIndex + 1) % categories.length;
                  handleChange('category', categories[nextIndex]);
                }}
              >
                <Text style={[styles.pickerButtonText, { color: theme.colors.text }]}>
                  {formatCategory(formData.category)}
                </Text>
                <Ionicons name="chevron-down" size={16} color={theme.colors.text + '80'} />
              </TouchableOpacity>
            </View>
          </View>
        </View>
        
        {/* Specific Material (only if category is specific_material) */}
        {formData.category === 'specific_material' && (
          <View style={styles.formGroup}>
            <Text style={[styles.label, { color: theme.colors.text }]}>Material Type</Text>
            <View style={[styles.pickerContainer, { borderColor: theme.colors.border }]}>
              <TouchableOpacity 
                style={styles.pickerButton}
                onPress={() => {
                  // Toggle through material types
                  const materials = ['Plastic', 'Paper', 'Glass', 'Metal', 'Electronics', 'Other'];
                  const currentValue = formData.specificMaterial || 'Plastic';
                  const currentIndex = materials.indexOf(currentValue);
                  const nextIndex = (currentIndex + 1) % materials.length;
                  handleChange('specificMaterial', materials[nextIndex]);
                }}
              >
                <Text style={[styles.pickerButtonText, { color: theme.colors.text }]}>
                  {formData.specificMaterial || 'Plastic'}
                </Text>
                <Ionicons name="chevron-down" size={16} color={theme.colors.text + '80'} />
              </TouchableOpacity>
            </View>
          </View>
        )}
        
        {/* Date Range */}
        <View style={styles.formRow}>
          <View style={[styles.formGroup, { flex: 1, marginRight: 8 }]}>
            <Text style={[styles.label, { color: theme.colors.text }]}>Start Date</Text>
            <TouchableOpacity
              style={[styles.dateButton, { borderColor: theme.colors.border }]}
              onPress={() => setShowStartDatePicker(true)}
            >
              <Text style={[styles.dateButtonText, { color: theme.colors.text }]}>
                {formatDate(formData.startDate)}
              </Text>
              <Ionicons name="calendar-outline" size={18} color={theme.colors.primary} />
            </TouchableOpacity>
            
            {showStartDatePicker && (
              <DateTimePicker
                value={new Date(formData.startDate)}
                mode="date"
                display={Platform.OS === 'ios' ? 'spinner' : 'default'}
                onChange={(event, date) => handleDateChange('startDate', event, date)}
              />
            )}
          </View>
          
          <View style={[styles.formGroup, { flex: 1, marginLeft: 8 }]}>
            <Text style={[styles.label, { color: theme.colors.text }]}>End Date</Text>
            <TouchableOpacity
              style={[
                styles.dateButton, 
                { 
                  borderColor: errors.endDate ? theme.colors.error : theme.colors.border 
                }
              ]}
              onPress={() => setShowEndDatePicker(true)}
            >
              <Text style={[styles.dateButtonText, { color: theme.colors.text }]}>
                {formatDate(formData.endDate)}
              </Text>
              <Ionicons name="calendar-outline" size={18} color={theme.colors.primary} />
            </TouchableOpacity>
            
            {showEndDatePicker && (
              <DateTimePicker
                value={new Date(formData.endDate)}
                mode="date"
                minimumDate={new Date(formData.startDate)}
                display={Platform.OS === 'ios' ? 'spinner' : 'default'}
                onChange={(event, date) => handleDateChange('endDate', event, date)}
              />
            )}
            
            {errors.endDate && (
              <Text style={[styles.errorText, { color: theme.colors.error }]}>
                {errors.endDate}
              </Text>
            )}
          </View>
        </View>
      </ScrollView>
      
      <View style={styles.buttonContainer}>
        <TouchableOpacity
          style={[styles.cancelButton, { borderColor: theme.colors.border }]}
          onPress={onCancel}
        >
          <Text style={[styles.cancelButtonText, { color: theme.colors.text }]}>
            Cancel
          </Text>
        </TouchableOpacity>
        
        <TouchableOpacity
          style={[styles.saveButton, { backgroundColor: theme.colors.primary }]}
          onPress={handleSave}
        >
          <Text style={styles.saveButtonText}>
            {isEditing ? 'Update Goal' : 'Create Goal'}
          </Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

// Helper function to format a goal category
function formatCategory(category: string): string {
  switch (category) {
    case 'weight':
      return 'Total Weight';
    case 'collections':
      return 'Collections';
    case 'impact':
      return 'Environmental Impact';
    case 'specific_material':
      return 'Material';
    default:
      return category.charAt(0).toUpperCase() + category.slice(1);
  }
}

const styles = StyleSheet.create({
  container: {
    borderRadius: 12,
    ...Platform.select({
      web: {
        boxShadow: '0px 2px 4px rgba(0, 0, 0, 0.1)',
      },
      default: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
      },
    }),
    elevation: 3,
    marginBottom: 16
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 16,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: '#ccc'
  },
  title: {
    fontSize: 18,
    fontWeight: 'bold'
  },
  closeButton: {
    padding: 4
  },
  formContainer: {
    padding: 16,
    maxHeight: 400
  },
  formGroup: {
    marginBottom: 16
  },
  formRow: {
    flexDirection: 'row',
    marginBottom: 16
  },
  label: {
    marginBottom: 8,
    fontWeight: '500'
  },
  input: {
    borderWidth: 1,
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 10,
    fontSize: 16
  },
  textArea: {
    minHeight: 80,
    textAlignVertical: 'top'
  },
  pickerContainer: {
    borderWidth: 1,
    borderRadius: 8,
    overflow: 'hidden'
  },
  pickerButton: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 12
  },
  pickerButtonText: {
    fontSize: 16
  },
  dateButton: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 12,
    borderWidth: 1,
    borderRadius: 8
  },
  dateButtonText: {
    fontSize: 16
  },
  errorText: {
    marginTop: 4,
    fontSize: 12
  },
  buttonContainer: {
    flexDirection: 'row',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderTopWidth: StyleSheet.hairlineWidth,
    borderTopColor: '#ccc'
  },
  cancelButton: {
    flex: 1,
    paddingVertical: 12,
    borderRadius: 8,
    borderWidth: 1,
    alignItems: 'center',
    marginRight: 8
  },
  cancelButtonText: {
    fontWeight: '600'
  },
  saveButton: {
    flex: 1,
    paddingVertical: 12,
    borderRadius: 8,
    alignItems: 'center',
    marginLeft: 8
  },
  saveButtonText: {
    color: 'white',
    fontWeight: '600'
  }
}); 