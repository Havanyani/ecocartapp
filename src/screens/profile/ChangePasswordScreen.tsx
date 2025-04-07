/**
 * ChangePasswordScreen.tsx
 * 
 * Screen for users to change their password with current password validation
 * and new password strength checking.
 */

import { useAuth } from '@/contexts/AuthContext';
import useNetworkStatus from '@/hooks/useNetworkStatus';
import { Ionicons } from '@expo/vector-icons';
import React, { useState } from 'react';
import {
    ActivityIndicator,
    Alert,
    KeyboardAvoidingView,
    Platform,
    StyleSheet,
    Text,
    TextInput,
    TouchableOpacity,
    View
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

interface ChangePasswordScreenProps {
  navigation: any;
}

interface FormData {
  currentPassword: string;
  newPassword: string;
  confirmPassword: string;
}

interface FormErrors {
  currentPassword?: string;
  newPassword?: string;
  confirmPassword?: string;
  general?: string;
}

export default function ChangePasswordScreen({ navigation }: ChangePasswordScreenProps) {
  const { isLoading, error: authError } = useAuth();
  const { isOnline } = useNetworkStatus();
  
  // State for form data
  const [formData, setFormData] = useState<FormData>({
    currentPassword: '',
    newPassword: '',
    confirmPassword: '',
  });
  
  // State for form errors
  const [formErrors, setFormErrors] = useState<FormErrors>({});
  
  // State for password visibility
  const [showCurrentPassword, setShowCurrentPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  
  // State for form submission
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  // Password strength indicators
  const [passwordStrength, setPasswordStrength] = useState({
    score: 0,
    feedback: '',
    color: '#E5E5EA'
  });
  
  // Handle form input changes
  const handleChange = (field: keyof FormData, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    
    // Clear field error when typing
    if (formErrors[field]) {
      setFormErrors(prev => ({ ...prev, [field]: undefined }));
    }
    
    // Calculate password strength for new password
    if (field === 'newPassword') {
      calculatePasswordStrength(value);
    }
  };
  
  // Calculate password strength
  const calculatePasswordStrength = (password: string) => {
    // Simple password strength calculation
    let score = 0;
    let feedback = 'Password is too weak';
    let color = '#E74C3C'; // Red for weak passwords
    
    if (password.length >= 8) score += 1;
    if (password.length >= 12) score += 1;
    if (/[A-Z]/.test(password)) score += 1;
    if (/[a-z]/.test(password)) score += 1;
    if (/[0-9]/.test(password)) score += 1;
    if (/[^A-Za-z0-9]/.test(password)) score += 1;
    
    if (score >= 6) {
      feedback = 'Very strong password';
      color = '#27AE60'; // Green for strong passwords
    } else if (score >= 4) {
      feedback = 'Strong password';
      color = '#2ECC71'; // Light green for good passwords
    } else if (score >= 3) {
      feedback = 'Moderate password';
      color = '#F39C12'; // Orange for moderate passwords
    } else if (score >= 2) {
      feedback = 'Weak password';
      color = '#E67E22'; // Light orange for weak passwords
    }
    
    setPasswordStrength({ score, feedback, color });
  };
  
  // Validate form
  const validateForm = (): boolean => {
    const errors: FormErrors = {};
    let isValid = true;
    
    // Current password validation
    if (!formData.currentPassword) {
      errors.currentPassword = 'Current password is required';
      isValid = false;
    }
    
    // New password validation
    if (!formData.newPassword) {
      errors.newPassword = 'New password is required';
      isValid = false;
    } else if (formData.newPassword.length < 8) {
      errors.newPassword = 'Password must be at least 8 characters';
      isValid = false;
    } else if (formData.newPassword === formData.currentPassword) {
      errors.newPassword = 'New password must be different from current password';
      isValid = false;
    } else if (passwordStrength.score < 3) {
      errors.newPassword = 'Password is too weak';
      isValid = false;
    }
    
    // Confirm password validation
    if (!formData.confirmPassword) {
      errors.confirmPassword = 'Please confirm your password';
      isValid = false;
    } else if (formData.confirmPassword !== formData.newPassword) {
      errors.confirmPassword = 'Passwords do not match';
      isValid = false;
    }
    
    setFormErrors(errors);
    return isValid;
  };
  
  // Handle change password
  const handleChangePassword = async () => {
    if (!isOnline) {
      Alert.alert(
        'Offline Mode',
        'You need to be online to change your password.'
      );
      return;
    }
    
    if (!validateForm()) {
      return;
    }
    
    setIsSubmitting(true);
    
    try {
      // Mock API call for changing password
      await new Promise<void>((resolve, reject) => {
        setTimeout(() => {
          // In a real app, you would call an API to change the password
          if (Math.random() > 0.2) { // 80% success rate for demo
            resolve();
          } else {
            reject(new Error('Current password is incorrect'));
          }
        }, 1500);
      });
      
      // Reset form
      setFormData({
        currentPassword: '',
        newPassword: '',
        confirmPassword: '',
      });
      
      // Show success message
      Alert.alert(
        'Success',
        'Your password has been changed successfully.',
        [
          {
            text: 'OK',
            onPress: () => navigation.goBack(),
          },
        ]
      );
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to change password';
      setFormErrors({
        ...formErrors,
        general: errorMessage,
      });
    } finally {
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
        {/* Header */}
        <View style={styles.header}>
          <TouchableOpacity
            style={styles.backButton}
            onPress={() => navigation.goBack()}
          >
            <Ionicons name="chevron-back" size={24} color="#2C3E50" />
          </TouchableOpacity>
          <Text style={styles.screenTitle}>Change Password</Text>
          <View style={styles.rightHeaderPlaceholder} />
        </View>
        
        <View style={styles.content}>
          {/* Error Message */}
          {(authError || formErrors.general) && (
            <View style={styles.errorContainer}>
              <Ionicons name="alert-circle" size={20} color="#FFFFFF" />
              <Text style={styles.errorText}>
                {authError || formErrors.general}
              </Text>
            </View>
          )}
          
          {/* Password Form */}
          <View style={styles.formContainer}>
            {/* Current Password */}
            <View style={styles.inputGroup}>
              <Text style={styles.label}>Current Password</Text>
              <View
                style={[
                  styles.inputContainer,
                  formErrors.currentPassword ? styles.inputError : undefined
                ]}
              >
                <Ionicons name="lock-closed-outline" size={20} color="#8E8E93" />
                <TextInput
                  style={styles.input}
                  value={formData.currentPassword}
                  onChangeText={value => handleChange('currentPassword', value)}
                  placeholder="Enter your current password"
                  placeholderTextColor="#8E8E93"
                  secureTextEntry={!showCurrentPassword}
                />
                <TouchableOpacity
                  onPress={() => setShowCurrentPassword(!showCurrentPassword)}
                >
                  <Ionicons
                    name={showCurrentPassword ? "eye-off-outline" : "eye-outline"}
                    size={20}
                    color="#8E8E93"
                  />
                </TouchableOpacity>
              </View>
              {formErrors.currentPassword && (
                <Text style={styles.fieldError}>{formErrors.currentPassword}</Text>
              )}
            </View>
            
            {/* New Password */}
            <View style={styles.inputGroup}>
              <Text style={styles.label}>New Password</Text>
              <View
                style={[
                  styles.inputContainer,
                  formErrors.newPassword ? styles.inputError : undefined
                ]}
              >
                <Ionicons name="lock-closed-outline" size={20} color="#8E8E93" />
                <TextInput
                  style={styles.input}
                  value={formData.newPassword}
                  onChangeText={value => handleChange('newPassword', value)}
                  placeholder="Enter your new password"
                  placeholderTextColor="#8E8E93"
                  secureTextEntry={!showNewPassword}
                />
                <TouchableOpacity
                  onPress={() => setShowNewPassword(!showNewPassword)}
                >
                  <Ionicons
                    name={showNewPassword ? "eye-off-outline" : "eye-outline"}
                    size={20}
                    color="#8E8E93"
                  />
                </TouchableOpacity>
              </View>
              {formErrors.newPassword && (
                <Text style={styles.fieldError}>{formErrors.newPassword}</Text>
              )}
              
              {/* Password Strength Indicator */}
              {formData.newPassword !== '' && (
                <View style={styles.passwordStrengthContainer}>
                  <View style={styles.strengthBarContainer}>
                    <View
                      style={[
                        styles.strengthBar,
                        {
                          width: `${(passwordStrength.score / 6) * 100}%`,
                          backgroundColor: passwordStrength.color
                        }
                      ]}
                    />
                  </View>
                  <Text
                    style={[
                      styles.strengthText,
                      { color: passwordStrength.color }
                    ]}
                  >
                    {passwordStrength.feedback}
                  </Text>
                </View>
              )}
              
              {/* Password Requirements */}
              <View style={styles.passwordRequirements}>
                <Text style={styles.requirementsTitle}>Password must:</Text>
                <View style={styles.requirementItem}>
                  <Ionicons
                    name={formData.newPassword.length >= 8 ? "checkmark-circle" : "close-circle"}
                    size={16}
                    color={formData.newPassword.length >= 8 ? "#4CD964" : "#E5E5EA"}
                  />
                  <Text style={styles.requirementText}>Be at least 8 characters long</Text>
                </View>
                <View style={styles.requirementItem}>
                  <Ionicons
                    name={/[A-Z]/.test(formData.newPassword) ? "checkmark-circle" : "close-circle"}
                    size={16}
                    color={/[A-Z]/.test(formData.newPassword) ? "#4CD964" : "#E5E5EA"}
                  />
                  <Text style={styles.requirementText}>Include at least one uppercase letter</Text>
                </View>
                <View style={styles.requirementItem}>
                  <Ionicons
                    name={/[a-z]/.test(formData.newPassword) ? "checkmark-circle" : "close-circle"}
                    size={16}
                    color={/[a-z]/.test(formData.newPassword) ? "#4CD964" : "#E5E5EA"}
                  />
                  <Text style={styles.requirementText}>Include at least one lowercase letter</Text>
                </View>
                <View style={styles.requirementItem}>
                  <Ionicons
                    name={/[0-9]/.test(formData.newPassword) ? "checkmark-circle" : "close-circle"}
                    size={16}
                    color={/[0-9]/.test(formData.newPassword) ? "#4CD964" : "#E5E5EA"}
                  />
                  <Text style={styles.requirementText}>Include at least one number</Text>
                </View>
                <View style={styles.requirementItem}>
                  <Ionicons
                    name={/[^A-Za-z0-9]/.test(formData.newPassword) ? "checkmark-circle" : "close-circle"}
                    size={16}
                    color={/[^A-Za-z0-9]/.test(formData.newPassword) ? "#4CD964" : "#E5E5EA"}
                  />
                  <Text style={styles.requirementText}>Include at least one special character</Text>
                </View>
              </View>
            </View>
            
            {/* Confirm New Password */}
            <View style={styles.inputGroup}>
              <Text style={styles.label}>Confirm New Password</Text>
              <View
                style={[
                  styles.inputContainer,
                  formErrors.confirmPassword ? styles.inputError : undefined
                ]}
              >
                <Ionicons name="lock-closed-outline" size={20} color="#8E8E93" />
                <TextInput
                  style={styles.input}
                  value={formData.confirmPassword}
                  onChangeText={value => handleChange('confirmPassword', value)}
                  placeholder="Confirm your new password"
                  placeholderTextColor="#8E8E93"
                  secureTextEntry={!showConfirmPassword}
                />
                <TouchableOpacity
                  onPress={() => setShowConfirmPassword(!showConfirmPassword)}
                >
                  <Ionicons
                    name={showConfirmPassword ? "eye-off-outline" : "eye-outline"}
                    size={20}
                    color="#8E8E93"
                  />
                </TouchableOpacity>
              </View>
              {formErrors.confirmPassword && (
                <Text style={styles.fieldError}>{formErrors.confirmPassword}</Text>
              )}
            </View>
            
            {/* Submit Button */}
            <TouchableOpacity
              style={[styles.submitButton, isSubmitting && styles.submitButtonDisabled]}
              onPress={handleChangePassword}
              disabled={isSubmitting}
            >
              {isSubmitting ? (
                <ActivityIndicator size="small" color="#FFFFFF" />
              ) : (
                <Text style={styles.submitButtonText}>Change Password</Text>
              )}
            </TouchableOpacity>
          </View>
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#F9FAFB',
  },
  container: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 16,
    backgroundColor: '#FFFFFF',
    borderBottomWidth: 1,
    borderBottomColor: '#E5E5EA',
  },
  backButton: {
    padding: 8,
  },
  screenTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#2C3E50',
  },
  rightHeaderPlaceholder: {
    width: 40,
  },
  content: {
    flex: 1,
    padding: 16,
  },
  errorContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#E74C3C',
    padding: 12,
    marginBottom: 16,
    borderRadius: 8,
  },
  errorText: {
    color: '#FFFFFF',
    fontSize: 14,
    marginLeft: 8,
    flex: 1,
  },
  formContainer: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 3,
    elevation: 2,
  },
  inputGroup: {
    marginBottom: 24,
  },
  label: {
    fontSize: 14,
    fontWeight: '600',
    color: '#34495E',
    marginBottom: 8,
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#E5E5EA',
    borderRadius: 8,
    paddingHorizontal: 12,
    height: 50,
    backgroundColor: '#F8F8F8',
  },
  inputError: {
    borderColor: '#E74C3C',
  },
  input: {
    flex: 1,
    marginLeft: 8,
    fontSize: 16,
    color: '#2C3E50',
  },
  fieldError: {
    color: '#E74C3C',
    fontSize: 12,
    marginTop: 4,
  },
  passwordStrengthContainer: {
    marginTop: 8,
  },
  strengthBarContainer: {
    height: 4,
    backgroundColor: '#E5E5EA',
    borderRadius: 2,
    overflow: 'hidden',
    marginBottom: 4,
  },
  strengthBar: {
    height: '100%',
  },
  strengthText: {
    fontSize: 12,
    textAlign: 'right',
  },
  passwordRequirements: {
    marginTop: 12,
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: '#E5E5EA',
  },
  requirementsTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: '#2C3E50',
    marginBottom: 8,
  },
  requirementItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 4,
  },
  requirementText: {
    fontSize: 12,
    color: '#7F8C8D',
    marginLeft: 8,
  },
  submitButton: {
    backgroundColor: '#34C759',
    height: 50,
    borderRadius: 8,
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 8,
  },
  submitButtonDisabled: {
    backgroundColor: '#8E8E93',
  },
  submitButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
  },
}); 