/**
 * LoginScreen.tsx
 * 
 * Screen for user login with form validation and error handling.
 */

import { useAuth } from '@/contexts/AuthContext';
import useNetworkStatus from '@/hooks/useNetworkStatus';
import { FontAwesome, Ionicons } from '@expo/vector-icons';
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
  password: string;
}

interface FormErrors {
  email?: string;
  password?: string;
  general?: string;
}

interface LoginScreenProps {
  navigation: any;
}

export default function LoginScreen({ navigation }: LoginScreenProps) {
  // Get auth context
  const { 
    signIn, 
    signInWithGoogle, 
    signInWithApple, 
    signInWithFacebook, 
    authenticateWithBiometric,
    isBiometricEnabled, 
    isLoading, 
    error: authError, 
    clearError 
  } = useAuth();
  
  // Get network status
  const { isOnline } = useNetworkStatus();
  
  // Form state
  const [formData, setFormData] = useState<FormData>({
    email: '',
    password: ''
  });
  const [formErrors, setFormErrors] = useState<FormErrors>({});
  const [secureTextEntry, setSecureTextEntry] = useState(true);
  
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
    
    // Password validation
    if (!formData.password) {
      errors.password = 'Password is required';
      isValid = false;
    } else if (formData.password.length < 6) {
      errors.password = 'Password must be at least 6 characters';
      isValid = false;
    }
    
    setFormErrors(errors);
    return isValid;
  };
  
  // Handle login
  const handleLogin = async () => {
    if (!isOnline) {
      Alert.alert(
        'Offline Mode',
        'You need an internet connection to log in. Please check your connection and try again.'
      );
      return;
    }
    
    if (!validateForm()) {
      return;
    }
    
    try {
      await signIn({
        email: formData.email,
        password: formData.password
      });
    } catch (error) {
      // Error will be handled in auth context and displayed below
      console.error('Login error:', error);
    }
  };
  
  // Handle biometric authentication
  const handleBiometricLogin = async () => {
    if (!isOnline) {
      Alert.alert(
        'Offline Mode',
        'You need an internet connection to log in. Please check your connection and try again.'
      );
      return;
    }
    
    try {
      await authenticateWithBiometric();
    } catch (error) {
      console.error('Biometric login error:', error);
    }
  };
  
  // Handle social logins
  const handleGoogleLogin = async () => {
    if (!isOnline) {
      Alert.alert(
        'Offline Mode',
        'You need an internet connection to log in. Please check your connection and try again.'
      );
      return;
    }
    
    try {
      await signInWithGoogle();
    } catch (error) {
      console.error('Google login error:', error);
    }
  };
  
  const handleAppleLogin = async () => {
    if (!isOnline) {
      Alert.alert(
        'Offline Mode',
        'You need an internet connection to log in. Please check your connection and try again.'
      );
      return;
    }
    
    try {
      await signInWithApple();
    } catch (error) {
      console.error('Apple login error:', error);
    }
  };
  
  const handleFacebookLogin = async () => {
    if (!isOnline) {
      Alert.alert(
        'Offline Mode',
        'You need an internet connection to log in. Please check your connection and try again.'
      );
      return;
    }
    
    try {
      await signInWithFacebook();
    } catch (error) {
      console.error('Facebook login error:', error);
    }
  };
  
  // Navigate to signup
  const handleSignup = () => {
    navigation.navigate('Signup');
  };
  
  // Navigate to forgot password
  const handleForgotPassword = () => {
    navigation.navigate('ForgotPassword');
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
          {/* Logo and Welcome Text */}
          <View style={styles.headerContainer}>
            {/* Logo placeholder - replace with your actual logo */}
            <View style={styles.logoContainer}>
              <Image
                source={require('@/assets/images/eco-logo.png')}
                style={styles.logo}
                resizeMode="contain"
              />
            </View>
            <Text style={styles.welcomeText}>Welcome to EcoCart</Text>
            <Text style={styles.subtitleText}>Login to your account</Text>
          </View>
          
          {/* Login Form */}
          <View style={styles.formContainer}>
            {/* Network Status Warning */}
            {!isOnline && (
              <View style={styles.offlineWarning}>
                <Ionicons name="cloud-offline" size={20} color="#FFFFFF" />
                <Text style={styles.offlineText}>
                  You are offline. Login requires an internet connection.
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
              <Text style={styles.label}>Email</Text>
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
                  testID="email-input"
                />
              </View>
              {formErrors.email && (
                <Text style={styles.errorText}>{formErrors.email}</Text>
              )}
            </View>
            
            {/* Password Input */}
            <View style={styles.inputGroup}>
              <Text style={styles.label}>Password</Text>
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
                  placeholder="Enter your password"
                  placeholderTextColor="#8E8E93"
                  secureTextEntry={secureTextEntry}
                  autoCapitalize="none"
                  autoComplete="password"
                  testID="password-input"
                />
                <TouchableOpacity
                  onPress={() => setSecureTextEntry(!secureTextEntry)}
                  style={styles.eyeIcon}
                >
                  <Ionicons
                    name={secureTextEntry ? 'eye-outline' : 'eye-off-outline'}
                    size={20}
                    color="#8E8E93"
                  />
                </TouchableOpacity>
              </View>
              {formErrors.password && (
                <Text style={styles.errorText}>{formErrors.password}</Text>
              )}
            </View>
            
            {/* Forgot Password */}
            <TouchableOpacity
              style={styles.forgotPasswordContainer}
              onPress={handleForgotPassword}
              testID="forgot-password-button"
            >
              <Text style={styles.forgotPasswordText}>Forgot Password?</Text>
            </TouchableOpacity>
            
            {/* Login Button */}
            <TouchableOpacity
              style={styles.loginButton}
              onPress={handleLogin}
              disabled={isLoading}
              testID="login-button"
            >
              {isLoading ? (
                <ActivityIndicator color="#FFFFFF" size="small" />
              ) : (
                <Text style={styles.loginButtonText}>Login</Text>
              )}
            </TouchableOpacity>
            
            {/* Biometric Login */}
            {isBiometricEnabled && (
              <TouchableOpacity
                style={styles.biometricButton}
                onPress={handleBiometricLogin}
                testID="biometric-button"
              >
                <Ionicons name="finger-print" size={24} color="#34C759" />
                <Text style={styles.biometricText}>Login with biometrics</Text>
              </TouchableOpacity>
            )}
            
            {/* Divider */}
            <View style={styles.dividerContainer}>
              <View style={styles.divider} />
              <Text style={styles.dividerText}>OR</Text>
              <View style={styles.divider} />
            </View>
            
            {/* Social Login Buttons */}
            <View style={styles.socialButtonsContainer}>
              <TouchableOpacity
                style={[styles.socialButton, styles.googleButton]}
                onPress={handleGoogleLogin}
                testID="google-button"
              >
                <FontAwesome name="google" size={20} color="#FFFFFF" />
                <Text style={styles.socialButtonText}>Google</Text>
              </TouchableOpacity>
              
              {Platform.OS === 'ios' && (
                <TouchableOpacity
                  style={[styles.socialButton, styles.appleButton]}
                  onPress={handleAppleLogin}
                  testID="apple-button"
                >
                  <FontAwesome name="apple" size={20} color="#FFFFFF" />
                  <Text style={styles.socialButtonText}>Apple</Text>
                </TouchableOpacity>
              )}
              
              <TouchableOpacity
                style={[styles.socialButton, styles.facebookButton]}
                onPress={handleFacebookLogin}
                testID="facebook-button"
              >
                <FontAwesome name="facebook" size={20} color="#FFFFFF" />
                <Text style={styles.socialButtonText}>Facebook</Text>
              </TouchableOpacity>
            </View>
          </View>
          
          {/* Signup Link */}
          <View style={styles.signupContainer}>
            <Text style={styles.signupText}>Don't have an account?</Text>
            <TouchableOpacity onPress={handleSignup} testID="signup-link">
              <Text style={styles.signupLink}>Sign Up</Text>
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
    backgroundColor: '#FFFFFF',
  },
  container: {
    flex: 1,
  },
  scrollContent: {
    flexGrow: 1,
    paddingBottom: 24,
  },
  headerContainer: {
    alignItems: 'center',
    marginTop: 20,
    marginBottom: 32,
  },
  logoContainer: {
    width: 120,
    height: 120,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 16,
    borderRadius: 60,
    backgroundColor: '#F0FFF0',
  },
  logo: {
    width: 80,
    height: 80,
  },
  welcomeText: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#2C3E50',
    marginBottom: 8,
  },
  subtitleText: {
    fontSize: 16,
    color: '#7F8C8D',
    marginBottom: 8,
  },
  formContainer: {
    paddingHorizontal: 24,
  },
  offlineWarning: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F39C12',
    padding: 12,
    borderRadius: 8,
    marginBottom: 16,
  },
  offlineText: {
    color: '#FFFFFF',
    marginLeft: 8,
    flex: 1,
  },
  errorContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#E74C3C',
    padding: 12,
    borderRadius: 8,
    marginBottom: 16,
  },
  errorText: {
    color: '#E74C3C',
    fontSize: 12,
    marginTop: 4,
  },
  inputGroup: {
    marginBottom: 16,
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
  eyeIcon: {
    padding: 4,
  },
  forgotPasswordContainer: {
    alignItems: 'flex-end',
    marginBottom: 24,
  },
  forgotPasswordText: {
    color: '#34C759',
    fontSize: 14,
    fontWeight: '600',
  },
  loginButton: {
    backgroundColor: '#34C759',
    height: 50,
    borderRadius: 8,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 16,
  },
  loginButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: 'bold',
  },
  biometricButton: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    height: 44,
    marginBottom: 24,
  },
  biometricText: {
    color: '#34C759',
    fontSize: 14,
    fontWeight: '600',
    marginLeft: 8,
  },
  dividerContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginVertical: 16,
  },
  divider: {
    flex: 1,
    height: 1,
    backgroundColor: '#E5E5EA',
  },
  dividerText: {
    color: '#8E8E93',
    paddingHorizontal: 10,
    fontSize: 14,
  },
  socialButtonsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 24,
  },
  socialButton: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    height: 44,
    borderRadius: 8,
    paddingHorizontal: 12,
    flex: 1,
    marginHorizontal: 4,
  },
  googleButton: {
    backgroundColor: '#DB4437',
  },
  appleButton: {
    backgroundColor: '#000000',
  },
  facebookButton: {
    backgroundColor: '#4267B2',
  },
  socialButtonText: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '600',
    marginLeft: 8,
  },
  signupContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    marginTop: 16,
  },
  signupText: {
    color: '#7F8C8D',
    fontSize: 14,
  },
  signupLink: {
    color: '#34C759',
    fontSize: 14,
    fontWeight: '600',
    marginLeft: 4,
  },
}); 