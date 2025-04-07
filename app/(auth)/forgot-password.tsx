import { useAuth } from '@/contexts/AuthContext';
import useNetworkStatus from '@/hooks/useNetworkStatus';
import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
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
  email: string;
}

interface FormErrors {
  email?: string;
  general?: string;
}

export default function ForgotPasswordScreen() {
  // Get auth context
  const { requestPasswordReset, isLoading, error: authError, clearError } = useAuth();
  
  // Get network status
  const { isOnline } = useNetworkStatus();
  
  // Form state
  const [formData, setFormData] = useState<FormData>({
    email: ''
  });
  const [formErrors, setFormErrors] = useState<FormErrors>({});
  const [isSubmitted, setIsSubmitted] = useState(false);
  
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
    
    // Email validation
    if (!formData.email) {
      errors.email = 'Email is required';
      isValid = false;
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      errors.email = 'Email is invalid';
      isValid = false;
    }
    
    setFormErrors(errors);
    return isValid;
  };
  
  // Handle password reset request
  const handleResetRequest = async () => {
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
      await requestPasswordReset(formData.email);
      setIsSubmitted(true);
    } catch (error) {
      // Error will be handled in auth context and displayed below
      console.error('Password reset request error:', error);
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
            <Text style={styles.titleText}>Forgot Password</Text>
            <Text style={styles.subtitleText}>
              Enter your email address and we'll send you instructions to reset your password.
            </Text>
          </View>
          
          {isSubmitted ? (
            // Success Message
            <View style={styles.successContainer}>
              <View style={styles.successIconContainer}>
                <Ionicons name="checkmark-circle" size={60} color="#34C759" />
              </View>
              <Text style={styles.successTitle}>Email Sent!</Text>
              <Text style={styles.successMessage}>
                We've sent password reset instructions to {formData.email}. Please check your inbox.
              </Text>
              <TouchableOpacity
                style={styles.backToLoginButton}
                onPress={handleBackToLogin}
              >
                <Text style={styles.backToLoginText}>Back to Login</Text>
              </TouchableOpacity>
            </View>
          ) : (
            // Password Reset Form
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
              
              {/* Email Input */}
              <View style={styles.inputGroup}>
                <Text style={styles.label}>Email Address</Text>
                <View
                  style={[
                    styles.inputContainer,
                    formErrors.email ? styles.inputError : undefined
                  ]}
                >
                  <Ionicons name="mail-outline" size={20} color="#8E8E93" />
                  <TextInput
                    style={styles.input}
                    value={formData.email}
                    onChangeText={value => handleChange('email', value)}
                    placeholder="Enter your email"
                    placeholderTextColor="#8E8E93"
                    autoCapitalize="none"
                    keyboardType="email-address"
                    autoComplete="email"
                    returnKeyType="done"
                  />
                </View>
                {formErrors.email && (
                  <Text style={styles.errorMessage}>{formErrors.email}</Text>
                )}
              </View>
              
              {/* Reset Button */}
              <TouchableOpacity
                style={[styles.resetButton, (!isOnline || isLoading) && styles.resetButtonDisabled]}
                onPress={handleResetRequest}
                disabled={!isOnline || isLoading}
              >
                {isLoading ? (
                  <ActivityIndicator size="small" color="#FFFFFF" />
                ) : (
                  <Text style={styles.resetButtonText}>Send Reset Instructions</Text>
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
          )}
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
  },
  successContainer: {
    alignItems: 'center',
    padding: 20
  },
  successIconContainer: {
    marginBottom: 20
  },
  successTitle: {
    fontSize: 22,
    fontWeight: 'bold',
    color: '#000000',
    marginBottom: 12
  },
  successMessage: {
    fontSize: 16,
    color: '#8E8E93',
    textAlign: 'center',
    marginBottom: 30,
    lineHeight: 22
  },
  backToLoginButton: {
    backgroundColor: '#2C76E5',
    borderRadius: 8,
    paddingVertical: 12,
    paddingHorizontal: 24,
    justifyContent: 'center',
    alignItems: 'center'
  },
  backToLoginText: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#FFFFFF'
  }
}); 