/**
 * TwoFactorSetupScreen.tsx
 * 
 * Screen for setting up two-factor authentication, including QR code display
 * and verification code input for confirmation.
 */

import { useAuth } from '@/contexts/AuthContext';
import useNetworkStatus from '@/hooks/useNetworkStatus';
import { TwoFactorSetupData } from '@/types/auth';
import { Ionicons } from '@expo/vector-icons';
import * as Clipboard from 'expo-clipboard';
import React, { useEffect, useState } from 'react';
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
import QRCode from 'react-native-qrcode-svg';
import { SafeAreaView } from 'react-native-safe-area-context';

interface TwoFactorSetupScreenProps {
  navigation: any;
}

export default function TwoFactorSetupScreen({ navigation }: TwoFactorSetupScreenProps) {
  const { user, generateTwoFactorSecret, enableTwoFactor, error: authError } = useAuth();
  const { isOnline } = useNetworkStatus();
  
  // State for QR code and setup
  const [secret, setSecret] = useState<string | null>(null);
  const [verificationCode, setVerificationCode] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isGeneratingSecret, setIsGeneratingSecret] = useState(true);
  const [otpAuthUrl, setOtpAuthUrl] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  
  // Inputs refs for auto-focus
  const inputRefs = React.useRef<Array<TextInput | null>>([]);
  
  // Generate secret on mount
  useEffect(() => {
    async function generateSecret() {
      if (!isOnline) {
        setError('You need to be online to set up two-factor authentication');
        setIsGeneratingSecret(false);
        return;
      }
      
      try {
        const newSecret = await generateTwoFactorSecret();
        setSecret(newSecret);
        
        // Create otpauth URL for QR code
        // Format: otpauth://totp/App:email?secret=SECRET&issuer=AppName
        if (user?.email) {
          const otpauth = `otpauth://totp/EcoCart:${encodeURIComponent(user.email)}?secret=${newSecret}&issuer=EcoCart`;
          setOtpAuthUrl(otpauth);
        }
      } catch (error) {
        setError('Failed to generate secret. Please try again later.');
        console.error('Error generating 2FA secret:', error);
      } finally {
        setIsGeneratingSecret(false);
      }
    }
    
    generateSecret();
  }, [generateTwoFactorSecret, user, isOnline]);
  
  // Handle verification code input changes
  const handleCodeChange = (index: number, value: string) => {
    // Allow only digits
    if (!/^\d*$/.test(value)) return;
    
    // Update verification code
    const newCode = verificationCode.split('');
    newCode[index] = value;
    setVerificationCode(newCode.join(''));
    
    // Auto focus to next input
    if (value && index < 5) {
      inputRefs.current[index + 1]?.focus();
    }
  };
  
  // Handle key press for backspace
  const handleKeyPress = (index: number, e: any) => {
    if (e.nativeEvent.key === 'Backspace' && !verificationCode[index] && index > 0) {
      inputRefs.current[index - 1]?.focus();
    }
  };
  
  // Handle paste
  const handlePaste = async () => {
    try {
      const text = await Clipboard.getStringAsync();
      if (text && /^\d{6}$/.test(text)) {
        setVerificationCode(text);
      }
    } catch (error) {
      console.error('Error pasting code:', error);
    }
  };
  
  // Handle verify
  const handleVerify = async () => {
    if (!isOnline) {
      Alert.alert(
        'Offline Mode',
        'You need to be online to set up two-factor authentication.'
      );
      return;
    }
    
    if (verificationCode.length !== 6) {
      setError('Please enter a 6-digit verification code');
      return;
    }
    
    if (!secret) {
      setError('Secret not generated. Please try again.');
      return;
    }
    
    setIsLoading(true);
    setError(null);
    
    try {
      const setupData: TwoFactorSetupData = {
        secret,
        code: verificationCode
      };
      
      await enableTwoFactor(setupData);
      
      // Show success alert
      Alert.alert(
        'Two-Factor Authentication Enabled',
        'Your account is now protected with two-factor authentication.',
        [
          {
            text: 'OK',
            onPress: () => navigation.goBack()
          }
        ]
      );
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to verify code';
      setError(errorMessage);
    } finally {
      setIsLoading(false);
    }
  };
  
  // Handle cancel
  const handleCancel = () => {
    Alert.alert(
      'Cancel Setup',
      'Are you sure you want to cancel two-factor authentication setup?',
      [
        {
          text: 'No',
          style: 'cancel'
        },
        {
          text: 'Yes',
          style: 'destructive',
          onPress: () => navigation.goBack()
        }
      ]
    );
  };
  
  // Handle copy secret
  const handleCopySecret = async () => {
    if (secret) {
      await Clipboard.setStringAsync(secret);
      Alert.alert('Copied', 'Secret copied to clipboard');
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
            onPress={handleCancel}
          >
            <Ionicons name="close" size={24} color="#2C3E50" />
          </TouchableOpacity>
          <Text style={styles.screenTitle}>Two-Factor Authentication</Text>
          <View style={styles.rightHeaderPlaceholder} />
        </View>
        
        <ScrollView 
          style={styles.scrollView} 
          contentContainerStyle={styles.scrollContent}
          keyboardShouldPersistTaps="handled"
        >
          {/* Error Message */}
          {(error || authError) && (
            <View style={styles.errorContainer}>
              <Ionicons name="alert-circle" size={20} color="#FFFFFF" />
              <Text style={styles.errorText}>
                {error || authError}
              </Text>
            </View>
          )}
          
          {/* Setup Instructions */}
          <View style={styles.card}>
            <Text style={styles.cardTitle}>Set Up Two-Factor Authentication</Text>
            <Text style={styles.description}>
              Two-factor authentication adds an extra layer of security to your account by requiring a code from 
              your authenticator app in addition to your password.
            </Text>
            
            <View style={styles.steps}>
              <View style={styles.step}>
                <View style={styles.stepNumber}>
                  <Text style={styles.stepNumberText}>1</Text>
                </View>
                <Text style={styles.stepText}>
                  Download an authenticator app like Google Authenticator, Microsoft Authenticator, or Authy.
                </Text>
              </View>
              
              <View style={styles.step}>
                <View style={styles.stepNumber}>
                  <Text style={styles.stepNumberText}>2</Text>
                </View>
                <Text style={styles.stepText}>
                  Scan the QR code below with your authenticator app or enter the secret key manually.
                </Text>
              </View>
              
              <View style={styles.step}>
                <View style={styles.stepNumber}>
                  <Text style={styles.stepNumberText}>3</Text>
                </View>
                <Text style={styles.stepText}>
                  Enter the 6-digit verification code from your authenticator app to confirm setup.
                </Text>
              </View>
            </View>
          </View>
          
          {/* QR Code */}
          <View style={styles.card}>
            <Text style={styles.cardTitle}>Scan QR Code</Text>
            <View style={styles.qrContainer}>
              {isGeneratingSecret ? (
                <ActivityIndicator size="large" color="#34C759" />
              ) : otpAuthUrl ? (
                <QRCode
                  value={otpAuthUrl}
                  size={200}
                  color="#2C3E50"
                  backgroundColor="#FFFFFF"
                />
              ) : (
                <View style={styles.qrError}>
                  <Ionicons name="warning" size={48} color="#F39C12" />
                  <Text style={styles.qrErrorText}>Failed to generate QR code</Text>
                </View>
              )}
            </View>
          </View>
          
          {/* Secret Key */}
          {secret && (
            <View style={styles.card}>
              <Text style={styles.cardTitle}>Secret Key</Text>
              <Text style={styles.description}>
                If you can't scan the QR code, enter this secret key manually in your authenticator app:
              </Text>
              <View style={styles.secretContainer}>
                <Text style={styles.secretText}>{secret}</Text>
                <TouchableOpacity 
                  style={styles.copyButton}
                  onPress={handleCopySecret}
                >
                  <Ionicons name="copy-outline" size={20} color="#FFFFFF" />
                </TouchableOpacity>
              </View>
            </View>
          )}
          
          {/* Verification Code */}
          <View style={styles.card}>
            <Text style={styles.cardTitle}>Verification Code</Text>
            <Text style={styles.description}>
              Enter the 6-digit verification code from your authenticator app:
            </Text>
            
            <View style={styles.verificationCodeContainer}>
              {[0, 1, 2, 3, 4, 5].map((index) => (
                <TextInput
                  key={index}
                  ref={(ref) => (inputRefs.current[index] = ref)}
                  style={styles.codeInput}
                  value={verificationCode[index] || ''}
                  onChangeText={(value) => handleCodeChange(index, value)}
                  onKeyPress={(e) => handleKeyPress(index, e)}
                  maxLength={1}
                  keyboardType="number-pad"
                  selectTextOnFocus
                />
              ))}
            </View>
            
            <TouchableOpacity 
              style={styles.pasteButton}
              onPress={handlePaste}
            >
              <Ionicons name="clipboard-outline" size={16} color="#34C759" />
              <Text style={styles.pasteButtonText}>Paste from clipboard</Text>
            </TouchableOpacity>
            
            <TouchableOpacity
              style={[styles.verifyButton, (isLoading || !secret) && styles.verifyButtonDisabled]}
              onPress={handleVerify}
              disabled={isLoading || !secret}
            >
              {isLoading ? (
                <ActivityIndicator size="small" color="#FFFFFF" />
              ) : (
                <Text style={styles.verifyButtonText}>Verify and Enable</Text>
              )}
            </TouchableOpacity>
            
            <TouchableOpacity
              style={styles.cancelButton}
              onPress={handleCancel}
              disabled={isLoading}
            >
              <Text style={styles.cancelButtonText}>Cancel</Text>
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
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    padding: 16,
    paddingBottom: 40,
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
  card: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 3,
    elevation: 2,
  },
  cardTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#2C3E50',
    marginBottom: 12,
  },
  description: {
    fontSize: 14,
    color: '#7F8C8D',
    marginBottom: 16,
    lineHeight: 20,
  },
  steps: {
    marginTop: 8,
  },
  step: {
    flexDirection: 'row',
    marginBottom: 16,
    alignItems: 'flex-start',
  },
  stepNumber: {
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: '#34C759',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
    marginTop: 2,
  },
  stepNumberText: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: 'bold',
  },
  stepText: {
    flex: 1,
    fontSize: 14,
    color: '#34495E',
    lineHeight: 20,
  },
  qrContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    padding: 16,
    height: 250,
  },
  qrError: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  qrErrorText: {
    marginTop: 8,
    color: '#E74C3C',
    fontSize: 14,
  },
  secretContainer: {
    flexDirection: 'row',
    backgroundColor: '#F8F8F8',
    borderRadius: 8,
    padding: 12,
    marginBottom: 16,
    alignItems: 'center',
  },
  secretText: {
    flex: 1,
    fontSize: 16,
    fontFamily: Platform.OS === 'ios' ? 'Menlo' : 'monospace',
    color: '#2C3E50',
    letterSpacing: 1,
  },
  copyButton: {
    backgroundColor: '#34C759',
    padding: 8,
    borderRadius: 8,
    marginLeft: 8,
  },
  verificationCodeContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 16,
  },
  codeInput: {
    backgroundColor: '#F8F8F8',
    borderWidth: 1,
    borderColor: '#E5E5EA',
    borderRadius: 8,
    width: 45,
    height: 55,
    fontSize: 24,
    fontWeight: 'bold',
    textAlign: 'center',
    color: '#2C3E50',
  },
  pasteButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 24,
  },
  pasteButtonText: {
    color: '#34C759',
    fontSize: 14,
    marginLeft: 8,
  },
  verifyButton: {
    backgroundColor: '#34C759',
    height: 50,
    borderRadius: 8,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 12,
  },
  verifyButtonDisabled: {
    backgroundColor: '#8E8E93',
  },
  verifyButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
  },
  cancelButton: {
    height: 50,
    borderRadius: 8,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#E5E5EA',
  },
  cancelButtonText: {
    color: '#E74C3C',
    fontSize: 16,
    fontWeight: '600',
  },
}); 