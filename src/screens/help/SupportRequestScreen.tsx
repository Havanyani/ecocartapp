import { MaterialCommunityIcons } from '@expo/vector-icons';
import * as Haptics from 'expo-haptics';
import * as ImagePicker from 'expo-image-picker';
import React, { useCallback, useEffect, useState } from 'react';
import {
    AccessibilityInfo,
    ActivityIndicator,
    Alert,
    KeyboardAvoidingView,
    Platform,
    ScrollView,
    StyleSheet,
    Text,
    TextInput,
    TouchableOpacity,
    useWindowDimensions,
    View
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useTheme } from '../../contexts/ThemeContext';

interface SupportRequest {
  subject: string;
  description: string;
  category: string;
  attachments: string[];
  priority: 'low' | 'medium' | 'high';
}

const SUPPORT_CATEGORIES = [
  { id: 'technical', label: 'Technical Issue' },
  { id: 'account', label: 'Account & Billing' },
  { id: 'collection', label: 'Collection Service' },
  { id: 'credits', label: 'Eco Credits' },
  { id: 'other', label: 'Other' }
];

export const SupportRequestScreen = ({ navigation }: any) => {
  const { theme } = useTheme();
  const { width } = useWindowDimensions();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [request, setRequest] = useState<SupportRequest>({
    subject: '',
    description: '',
    category: '',
    attachments: [],
    priority: 'medium'
  });
  const [isScreenReaderEnabled, setIsScreenReaderEnabled] = useState(false);

  // Check if screen reader is enabled
  useEffect(() => {
    const checkScreenReader = async () => {
      const isEnabled = await AccessibilityInfo.isScreenReaderEnabled();
      setIsScreenReaderEnabled(isEnabled);
    };
    
    checkScreenReader();
    
    const subscription = AccessibilityInfo.addEventListener(
      'screenReaderChanged',
      setIsScreenReaderEnabled
    );
    
    return () => {
      subscription.remove();
    };
  }, []);

  const handleCategorySelect = useCallback((categoryId: string) => {
    if (Platform.OS === 'ios') {
      Haptics.selectionAsync();
    }
    setRequest(prev => ({ ...prev, category: categoryId }));
  }, []);

  const handlePrioritySelect = useCallback((priority: SupportRequest['priority']) => {
    if (Platform.OS === 'ios') {
      Haptics.selectionAsync();
    }
    setRequest(prev => ({ ...prev, priority }));
  }, []);

  const handleAddAttachment = useCallback(async () => {
    try {
      const permissionResult = await ImagePicker.requestMediaLibraryPermissionsAsync();
      
      if (!permissionResult.granted) {
        Alert.alert(
          'Permission Required',
          'Please allow access to your photo library to attach files.',
          [{ text: 'OK' }]
        );
        return;
      }

      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsEditing: true,
        quality: 0.8,
      });

      if (!result.canceled && result.assets[0].uri) {
        setRequest(prev => ({
          ...prev,
          attachments: [...prev.attachments, result.assets[0].uri]
        }));
      }
    } catch (error) {
      Alert.alert(
        'Error',
        'Failed to add attachment. Please try again.',
        [{ text: 'OK' }]
      );
    }
  }, []);

  const handleRemoveAttachment = useCallback((index: number) => {
    setRequest(prev => ({
      ...prev,
      attachments: prev.attachments.filter((_, i) => i !== index)
    }));
  }, []);

  const handleSubmit = useCallback(async () => {
    if (!request.subject || !request.description || !request.category) {
      Alert.alert(
        'Missing Information',
        'Please fill in all required fields.',
        [{ text: 'OK' }]
      );
      return;
    }

    setIsSubmitting(true);

    try {
      // TODO: Implement API call to submit support request
      await new Promise(resolve => setTimeout(resolve, 1500)); // Simulated API call

      if (Platform.OS === 'ios') {
        Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      }

      Alert.alert(
        'Success',
        'Your support request has been submitted. We will get back to you soon.',
        [
          {
            text: 'OK',
            onPress: () => navigation.goBack()
          }
        ]
      );
    } catch (error) {
      Alert.alert(
        'Error',
        'Failed to submit support request. Please try again.',
        [{ text: 'OK' }]
      );
    } finally {
      setIsSubmitting(false);
    }
  }, [request, navigation]);

  const renderCategoryButton = useCallback((category: typeof SUPPORT_CATEGORIES[0]) => (
    <TouchableOpacity
      key={category.id}
      style={[
        styles.categoryButton,
        {
          backgroundColor:
            request.category === category.id
              ? theme.colors.primary
              : theme.colors.card
        }
      ]}
      onPress={() => handleCategorySelect(category.id)}
      accessible={true}
      accessibilityLabel={`${category.label} category`}
      accessibilityHint={`Select ${category.label} as your support category`}
      accessibilityRole="button"
      accessibilityState={{ selected: request.category === category.id }}
    >
      <Text
        style={[
          styles.categoryButtonText,
          {
            color:
              request.category === category.id
                ? '#FFFFFF'
                : theme.colors.text
          }
        ]}
      >
        {category.label}
      </Text>
    </TouchableOpacity>
  ), [theme, request.category, handleCategorySelect]);

  const renderPriorityButton = useCallback((priority: SupportRequest['priority']) => (
    <TouchableOpacity
      key={priority}
      style={[
        styles.priorityButton,
        {
          backgroundColor:
            request.priority === priority
              ? theme.colors.primary
              : theme.colors.card
        }
      ]}
      onPress={() => handlePrioritySelect(priority)}
      accessible={true}
      accessibilityLabel={`${priority} priority`}
      accessibilityHint={`Set support request priority to ${priority}`}
      accessibilityRole="button"
      accessibilityState={{ selected: request.priority === priority }}
    >
      <Text
        style={[
          styles.priorityButtonText,
          {
            color:
              request.priority === priority
                ? '#FFFFFF'
                : theme.colors.text
          }
        ]}
      >
        {priority.charAt(0).toUpperCase() + priority.slice(1)}
      </Text>
    </TouchableOpacity>
  ), [theme, request.priority, handlePrioritySelect]);

  return (
    <SafeAreaView 
      style={[styles.container, { backgroundColor: theme.colors.background }]}
      accessible={true}
      accessibilityRole="none"
      accessibilityLabel="Support Request Form"
    >
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={styles.keyboardAvoidingView}
        testID="keyboard-avoiding-view"
      >
        <ScrollView
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
          accessible={true}
          accessibilityRole="none"
        >
          <View style={styles.header}>
            <Text style={[styles.title, { color: theme.colors.text }]}>
              Submit Support Request
            </Text>
            <Text style={[styles.subtitle, { color: theme.colors.text }]}>
              We're here to help! Please provide details about your issue.
            </Text>
          </View>

          <View style={styles.form}>
            <Text style={[styles.label, { color: theme.colors.text }]}>
              Category *
            </Text>
            <View style={styles.categoryContainer}>
              {SUPPORT_CATEGORIES.map(renderCategoryButton)}
            </View>

            <Text style={[styles.label, { color: theme.colors.text }]}>
              Subject *
            </Text>
            <TextInput
              style={[
                styles.input,
                {
                  backgroundColor: theme.colors.card,
                  color: theme.colors.text,
                  borderColor: theme.colors.border
                }
              ]}
              placeholder="Brief description of your issue"
              placeholderTextColor={theme.colors.placeholder}
              value={request.subject}
              onChangeText={subject => setRequest(prev => ({ ...prev, subject }))}
              accessible={true}
              accessibilityLabel="Subject input field"
              accessibilityHint="Enter a brief description of your issue"
            />

            <Text style={[styles.label, { color: theme.colors.text }]}>
              Description *
            </Text>
            <TextInput
              style={[
                styles.textArea,
                {
                  backgroundColor: theme.colors.card,
                  color: theme.colors.text,
                  borderColor: theme.colors.border
                }
              ]}
              placeholder="Please provide detailed information about your issue"
              placeholderTextColor={theme.colors.placeholder}
              multiline
              numberOfLines={6}
              value={request.description}
              onChangeText={description =>
                setRequest(prev => ({ ...prev, description }))
              }
              accessible={true}
              accessibilityLabel="Description input field"
              accessibilityHint="Enter detailed information about your issue"
            />

            <Text style={[styles.label, { color: theme.colors.text }]}>
              Priority
            </Text>
            <View style={styles.priorityContainer}>
              {(['low', 'medium', 'high'] as const).map(renderPriorityButton)}
            </View>

            <Text style={[styles.label, { color: theme.colors.text }]}>
              Attachments
            </Text>
            <View style={styles.attachmentsContainer}>
              {request.attachments.map((uri, index) => (
                <View
                  key={index}
                  style={[
                    styles.attachmentPreview,
                    { backgroundColor: theme.colors.card }
                  ]}
                  accessible={true}
                  accessibilityLabel={`Attachment ${index + 1}`}
                  accessibilityRole="image"
                >
                  <MaterialCommunityIcons
                    name="image"
                    size={24}
                    color={theme.colors.text}
                  />
                  <TouchableOpacity
                    style={styles.removeAttachment}
                    onPress={() => handleRemoveAttachment(index)}
                    accessible={true}
                    accessibilityLabel={`Remove attachment ${index + 1}`}
                    accessibilityHint="Removes this attachment from your support request"
                    accessibilityRole="button"
                  >
                    <MaterialCommunityIcons
                      name="close"
                      size={20}
                      color={theme.colors.text}
                    />
                  </TouchableOpacity>
                </View>
              ))}
              <TouchableOpacity
                style={[
                  styles.addAttachment,
                  { backgroundColor: theme.colors.card }
                ]}
                onPress={handleAddAttachment}
                accessible={true}
                accessibilityLabel="Add attachment"
                accessibilityHint="Add an image attachment to your support request"
                accessibilityRole="button"
                testID="add-attachment-button"
              >
                <MaterialCommunityIcons
                  name="plus"
                  size={24}
                  color={theme.colors.text}
                />
              </TouchableOpacity>
            </View>
          </View>

          <TouchableOpacity
            style={[
              styles.submitButton,
              {
                backgroundColor: theme.colors.primary,
                opacity: isSubmitting ? 0.7 : 1
              }
            ]}
            onPress={handleSubmit}
            disabled={isSubmitting}
            accessible={true}
            accessibilityLabel="Submit request button"
            accessibilityHint="Submit your support request"
            accessibilityRole="button"
            accessibilityState={{ disabled: isSubmitting }}
          >
            {isSubmitting ? (
              <ActivityIndicator color="#FFFFFF" />
            ) : (
              <Text style={styles.submitButtonText}>Submit Request</Text>
            )}
          </TouchableOpacity>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  keyboardAvoidingView: {
    flex: 1,
  },
  scrollContent: {
    padding: 16,
  },
  header: {
    marginBottom: 24,
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 16,
    opacity: 0.7,
  },
  form: {
    marginBottom: 24,
  },
  label: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 8,
  },
  categoryContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginBottom: 16,
    gap: 8,
  },
  categoryButton: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    marginRight: 8,
    marginBottom: 8,
  },
  categoryButtonText: {
    fontSize: 14,
    fontWeight: '500',
  },
  input: {
    height: 48,
    borderRadius: 8,
    paddingHorizontal: 16,
    fontSize: 16,
    borderWidth: 1,
    marginBottom: 16,
  },
  textArea: {
    borderRadius: 8,
    paddingHorizontal: 16,
    paddingTop: 12,
    paddingBottom: 12,
    fontSize: 16,
    borderWidth: 1,
    marginBottom: 16,
    textAlignVertical: 'top',
  },
  priorityContainer: {
    flexDirection: 'row',
    marginBottom: 16,
    gap: 8,
  },
  priorityButton: {
    flex: 1,
    height: 40,
    borderRadius: 8,
    justifyContent: 'center',
    alignItems: 'center',
  },
  priorityButtonText: {
    fontSize: 14,
    fontWeight: '500',
  },
  attachmentsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  attachmentPreview: {
    width: 80,
    height: 80,
    borderRadius: 8,
    justifyContent: 'center',
    alignItems: 'center',
  },
  removeAttachment: {
    position: 'absolute',
    top: -8,
    right: -8,
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  addAttachment: {
    width: 80,
    height: 80,
    borderRadius: 8,
    justifyContent: 'center',
    alignItems: 'center',
  },
  submitButton: {
    height: 48,
    borderRadius: 8,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 32,
  },
  submitButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
  },
}); 