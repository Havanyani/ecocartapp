import { useAuth } from '@/contexts/AuthContext';
import useNetworkStatus from '@/hooks/useNetworkStatus';
import { Ionicons } from '@expo/vector-icons';
import { router, useLocalSearchParams } from 'expo-router';
import React, { useEffect, useState } from 'react';
import {
    ActivityIndicator,
    Alert,
    Image,
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

interface FormData {
  password: string;
  confirmPassword: string;
}

interface FormErrors {
  password?: string;
  confirmPassword?: string;
  general?: string;
}

export default function ResetPasswordScreen() {
  // Get auth context
  const { resetPassword, isLoading, error: authError, clearError } = useAuth();
  
  // Get network status
  const { isOnline } = useNetworkStatus();
  
  // Get token from URL params
  const { token } = useLocalSearchParams<{ token: string }>();
  
  // Form state
  const [formData, setFormData] = useState<FormData>({
    password: '',
    confirmPassword: ''
  });
  const [formErrors, setFormErrors] = useState<FormErrors>({});
  const [secureTextEntry, setSecureTextEntry] = useState(true);
  const [confirmSecureTextEntry, setConfirmSecureTextEntry] = useState(true);
  
  // Clear errors when unmounting
  useEffect(() => {
    return () => {
      clearError();
    };
  }, [clearError]);
  
  // Handle form input changes
  const handleChange = (field: keyof FormData, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    
    // Clear field error when typing
    if (formErrors[field]) {
      setFormErrors(prev => ({ ...prev, [field]: undefined }));
    }
  };
  
  // Validate form
  const validateForm = (): boolean => {
    const errors: FormErrors = {};
    let isValid = true;
    
    // Password validation
    if (!formData.password) {
      errors.password = 'Password is required';
      isValid = false;
    } else if (formData.password.length < 6) {
      errors.password = 'Password must be at least 6 characters';
      isValid = false;
    }
    
    // Confirm password validation
    if (!formData.confirmPassword) {
      errors.confirmPassword = 'Please confirm your password';
      isValid = false;
    } else if (formData.password !== formData.confirmPassword) {
      errors.confirmPassword = 'Passwords do not match';
      isValid = false;
    }
    
    setFormErrors(errors);
    return isValid;
  };
  
  // Handle password reset
  const handleResetPassword = async () => {
    if (!isOnline) {
      Alert.alert(
        'Offline Mode',
        'You need an internet connection to reset your password. Please check your connection and try again.'
      );
      return;
    }
    
    if (!validateForm()) {
      return;
    }
    
    try {
      await resetPassword(token, formData.password);
      router.push('/login');
    } catch (error) {
      // Error will be handled in auth context and displayed below
      console.error('Password reset error:', error);
    }
  };
  
  // Navigate back to login
  const handleBackToLogin = () => {
    router.push('/login');
  };
  
  return (
    <SafeAreaView style={styles.safeArea}>
      <KeyboardAvoidingView
        style={styles.container}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        keyboardVerticalOffset={Platform.OS === 'ios' ? 64 : 0}
      >
        <ScrollView
          contentContainerStyle={styles.scrollContent}
          keyboardShouldPersistTaps="handled"
        >
          {/* Back Button */}
          <TouchableOpacity
            style={styles.backButton}
            onPress={handleBackToLogin}
          >
            <Ionicons name="arrow-back" size={24} color="#000000" />
          </TouchableOpacity>
          
          {/* Logo and Header Text */}
          <View style={styles.headerContainer}>
            <View style={styles.logoContainer}>
              <Image
                source={require('@/assets/images/eco-logo.png')}
                style={styles.logo}
                resizeMode="contain"
              />
            </View>
            <Text style={styles.titleText}>Reset Password</Text>
            <Text style={styles.subtitleText}>
              Enter your new password below.
            </Text>
          </View>
          
          {/* Reset Password Form */}
          <View style={styles.formContainer}>
            {/* Network Status Warning */}
            {!isOnline && (
              <View style={styles.offlineWarning}>
                <Ionicons name="cloud-offline" size={20} color="#FFFFFF" />
                <Text style={styles.offlineText}>
                  You are offline. Password reset requires an internet connection.
                </Text>
              </View>
            )}
            
            {/* General Error */}
            {(authError || formErrors.general) && (
              <View style={styles.errorContainer}>
                <Ionicons name="alert-circle" size={20} color="#FFFFFF" />
                <Text style={styles.errorText}>
                  {authError || formErrors.general}
                </Text>
              </View>
            )}
            
            {/* Password Input */}
            <View style={styles.inputGroup}>
              <Text style={styles.label}>New Password</Text>
              <View
                style={[
                  styles.inputContainer,
                  formErrors.password ? styles.inputError : undefined
                ]}
              >
                <Ionicons name="lock-closed-outline" size={20} color="#8E8E93" />
                <TextInput
                  style={styles.input}
                  value={formData.password}
                  onChangeText={value => handleChange('password', value)}
                  placeholder="Enter new password"
                  placeholderTextColor="#8E8E93"
                  secureTextEntry={secureTextEntry}
                  autoCapitalize="none"
                  autoComplete="password-new"
                  returnKeyType="next"
                />
                <TouchableOpacity
                  style={styles.visibilityButton}
                  onPress={() => setSecureTextEntry(!secureTextEntry)}
                >
                  <Ionicons
                    name={secureTextEntry ? 'eye-outline' : 'eye-off-outline'}
                    size={20}
                    color="#8E8E93"
                  />
                </TouchableOpacity>
              </View>
              {formErrors.password && (
                <Text style={styles.errorMessage}>{formErrors.password}</Text>
              )}
            </View>
            
            {/* Confirm Password Input */}
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
                  placeholder="Confirm new password"
                  placeholderTextColor="#8E8E93"
                  secureTextEntry={confirmSecureTextEntry}
                  autoCapitalize="none"
                  autoComplete="password-new"
                  returnKeyType="done"
                />
                <TouchableOpacity
                  style={styles.visibilityButton}
                  onPress={() => setConfirmSecureTextEntry(!confirmSecureTextEntry)}
                >
                  <Ionicons
                    name={confirmSecureTextEntry ? 'eye-outline' : 'eye-off-outline'}
                    size={20}
                    color="#8E8E93"
                  />
                </TouchableOpacity>
              </View>
              {formErrors.confirmPassword && (
                <Text style={styles.errorMessage}>{formErrors.confirmPassword}</Text>
              )}
            </View>
            
            {/* Reset Button */}
            <TouchableOpacity
              style={[styles.resetButton, (!isOnline || isLoading) && styles.resetButtonDisabled]}
              onPress={handleResetPassword}
              disabled={!isOnline || isLoading}
            >
              {isLoading ? (
                <ActivityIndicator size="small" color="#FFFFFF" />
              ) : (
                <Text style={styles.resetButtonText}>Reset Password</Text>
              )}
            </TouchableOpacity>
            
            {/* Back to Login Link */}
            <View style={styles.loginContainer}>
              <Text style={styles.loginText}>Remember your password?</Text>
              <TouchableOpacity onPress={handleBackToLogin}>
                <Text style={styles.loginLink}>Back to Login</Text>
              </TouchableOpacity>
            </View>
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
    paddingHorizontal: 20,
    paddingVertical: 40
  },
  backButton: {
    width: 40,
    height: 40,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 20
  },
  headerContainer: {
    alignItems: 'center',
    marginBottom: 40
  },
  logoContainer: {
    width: 80,
    height: 80,
    backgroundColor: '#F2F2F7',
    borderRadius: 16,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 20
  },
  logo: {
    width: 60,
    height: 60
  },
  titleText: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#000000',
    marginBottom: 12
  },
  subtitleText: {
    fontSize: 16,
    color: '#8E8E93',
    textAlign: 'center',
    maxWidth: '80%',
    lineHeight: 22
  },
  formContainer: {
    width: '100%'
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
  errorContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FF3B30',
    borderRadius: 8,
    padding: 12,
    marginBottom: 16
  },
  errorText: {
    color: '#FFFFFF',
    fontSize: 14,
    marginLeft: 8,
    flex: 1
  },
  inputGroup: {
    marginBottom: 24
  },
  label: {
    fontSize: 16,
    fontWeight: '500',
    color: '#000000',
    marginBottom: 8
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#E5E5EA',
    borderRadius: 8,
    paddingHorizontal: 12,
    height: 50
  },
  inputError: {
    borderColor: '#FF3B30'
  },
  input: {
    flex: 1,
    height: '100%',
    fontSize: 16,
    color: '#000000',
    paddingHorizontal: 8
  },
  visibilityButton: {
    padding: 8
  },
  errorMessage: {
    color: '#FF3B30',
    fontSize: 14,
    marginTop: 4
  },
  resetButton: {
    backgroundColor: '#34C759',
    borderRadius: 8,
    height: 50,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 24
  },
  resetButtonDisabled: {
    backgroundColor: '#8E8E93'
  },
  resetButtonText: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#FFFFFF'
  },
  loginContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center'
  },
  loginText: {
    fontSize: 14,
    color: '#8E8E93'
  },
  loginLink: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#2C76E5',
    marginLeft: 4
  }
}); 