import { useTheme } from '@/hooks/useTheme';
import { Ionicons } from '@expo/vector-icons';
import DateTimePicker from '@react-native-community/datetimepicker';
import React, { useEffect, useState } from 'react';
import {
    Modal,
    Platform,
    StyleSheet,
    Text,
    TouchableOpacity,
    View,
    ViewStyle
} from 'react-native';

export interface ScheduleTimePickerProps {
  value: Date;
  onChange: (newDate: Date) => void;
  label?: string;
  placeholder?: string;
  disabled?: boolean;
  is24Hour?: boolean;
  minuteInterval?: 1 | 5 | 10 | 15 | 20 | 30;
  style?: ViewStyle;
  error?: string;
  icon?: string;
}

export const ScheduleTimePicker: React.FC<ScheduleTimePickerProps> = ({
  value,
  onChange,
  label,
  placeholder = 'Select time',
  disabled = false,
  is24Hour = false,
  minuteInterval = 5,
  style,
  error,
  icon = 'time-outline'
}) => {
  const { theme } = useTheme();
  const [showPicker, setShowPicker] = useState<boolean>(false);
  const [localValue, setLocalValue] = useState<Date>(value || new Date());
  
  useEffect(() => {
    if (value) {
      setLocalValue(value);
    }
  }, [value]);
  
  const handleChange = (event: any, selectedDate?: Date) => {
    if (Platform.OS === 'android') {
      setShowPicker(false);
    }
    
    if (selectedDate) {
      setLocalValue(selectedDate);
      onChange(selectedDate);
    }
  };
  
  const showTimePicker = () => {
    if (!disabled) {
      setShowPicker(true);
    }
  };
  
  const hideTimePicker = () => {
    setShowPicker(false);
  };
  
  const formatTime = (date: Date) => {
    if (!date) return placeholder;
    
    if (is24Hour) {
      return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', hour12: false });
    } else {
      return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', hour12: true });
    }
  };
  
  return (
    <View style={[styles.container, style]}>
      {label && (
        <Text style={[styles.label, { color: theme.colors.text }]}>
          {label}
        </Text>
      )}
      
      <TouchableOpacity
        style={[
          styles.inputContainer,
          { 
            backgroundColor: theme.colors.card,
            borderColor: error ? theme.colors.error : theme.colors.border,
            opacity: disabled ? 0.6 : 1
          }
        ]}
        onPress={showTimePicker}
        disabled={disabled}
      >
        <Ionicons 
          name={icon} 
          size={20} 
          color={error ? theme.colors.error : theme.colors.primary} 
          style={styles.icon}
        />
        
        <Text 
          style={[
            styles.timeText, 
            { 
              color: localValue ? theme.colors.text : theme.colors.secondaryText 
            }
          ]}
        >
          {formatTime(localValue)}
        </Text>
        
        <Ionicons 
          name="chevron-down" 
          size={16} 
          color={theme.colors.secondaryText} 
        />
      </TouchableOpacity>
      
      {error && (
        <Text style={[styles.errorText, { color: theme.colors.error }]}>
          {error}
        </Text>
      )}
      
      {Platform.OS === 'ios' ? (
        <Modal
          visible={showPicker}
          transparent={true}
          animationType="slide"
        >
          <View style={styles.modalContainer}>
            <View style={[styles.pickerContainer, { backgroundColor: theme.colors.card }]}>
              <View style={styles.pickerHeader}>
                <TouchableOpacity onPress={hideTimePicker}>
                  <Text style={{ color: theme.colors.primary }}>Cancel</Text>
                </TouchableOpacity>
                
                <Text style={[styles.pickerTitle, { color: theme.colors.text }]}>
                  Select Time
                </Text>
                
                <TouchableOpacity onPress={hideTimePicker}>
                  <Text style={{ color: theme.colors.primary }}>Done</Text>
                </TouchableOpacity>
              </View>
              
              <DateTimePicker
                value={localValue || new Date()}
                mode="time"
                display="spinner"
                onChange={handleChange}
                minuteInterval={minuteInterval}
                is24Hour={is24Hour}
                style={styles.picker}
              />
            </View>
          </View>
        </Modal>
      ) : (
        showPicker && (
          <DateTimePicker
            value={localValue || new Date()}
            mode="time"
            display="default"
            onChange={handleChange}
            minuteInterval={minuteInterval}
            is24Hour={is24Hour}
          />
        )
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    marginBottom: 16,
  },
  label: {
    fontSize: 14,
    marginBottom: 6,
    fontWeight: '500',
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 12,
    borderRadius: 8,
    borderWidth: 1,
  },
  icon: {
    marginRight: 8,
  },
  timeText: {
    flex: 1,
    fontSize: 16,
  },
  errorText: {
    fontSize: 12,
    marginTop: 4,
  },
  modalContainer: {
    flex: 1,
    justifyContent: 'flex-end',
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
  },
  pickerContainer: {
    padding: 16,
    borderTopLeftRadius: 16,
    borderTopRightRadius: 16,
  },
  pickerHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  pickerTitle: {
    fontSize: 16,
    fontWeight: 'bold',
  },
  picker: {
    marginBottom: Platform.OS === 'ios' ? 40 : 0,
  },
}); 