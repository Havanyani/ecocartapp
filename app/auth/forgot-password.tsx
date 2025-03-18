import { Button } from '@/components/ui/Button';
import { FormInput } from '@/components/ui/FormInput';
import { Text } from '@/components/ui/Text';
import { useAuth } from '@/contexts/AuthContext';
import { useFormValidation } from '@/hooks/useFormValidation';
import { useTheme } from '@/hooks/useTheme';
import { ForgotPasswordFormData, forgotPasswordSchema } from '@/schemas/auth';
import { useRouter } from 'expo-router';
import React, { useState } from 'react';
import { StyleSheet, TouchableOpacity, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

export default function ForgotPasswordScreen() {
  const { theme } = useTheme();
  const { requestPasswordReset } = useAuth();
  const router = useRouter();
  const { validate, getFieldError, clearErrors } = useFormValidation(forgotPasswordSchema);
  const [formData, setFormData] = useState<ForgotPasswordFormData>({
    email: '',
  });
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  const handleResetPassword = async () => {
    clearErrors();
    if (!validate(formData)) {
      return;
    }

    setIsLoading(true);
    setError(null);
    setSuccess(false);

    try {
      await requestPasswordReset(formData.email);
      setSuccess(true);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to request password reset');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: theme.colors.background }]}>
      <View style={styles.content}>
        <View style={styles.header}>
          <Text style={[styles.title, { color: theme.colors.text.primary }]}>Reset Password</Text>
          <Text style={[styles.subtitle, { color: theme.colors.text.secondary }]}>
            Enter your email address and we'll send you instructions to reset your password
          </Text>
        </View>

        <View style={styles.form}>
          <FormInput
            label="Email"
            value={formData.email}
            onChangeText={email => setFormData(prev => ({ ...prev, email }))}
            placeholder="Enter your email"
            keyboardType="email-address"
            autoCapitalize="none"
            autoComplete="email"
            error={getFieldError('email')}
          />

          {error && (
            <Text style={[styles.error, { color: theme.colors.error }]}>
              {error}
            </Text>
          )}

          {success && (
            <Text style={[styles.success, { color: theme.colors.success }]}>
              Password reset instructions have been sent to your email
            </Text>
          )}

          <Button
            onPress={handleResetPassword}
            isLoading={isLoading}
            disabled={isLoading}
            style={styles.resetButton}
          >
            Send Reset Instructions
          </Button>

          <View style={styles.footer}>
            <TouchableOpacity onPress={() => router.back()}>
              <Text style={[styles.backLink, { color: theme.colors.primary }]}>
                Back to Login
              </Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  content: {
    flex: 1,
    padding: 24,
  },
  header: {
    marginTop: 48,
    marginBottom: 32,
  },
  title: {
    fontSize: 32,
    fontWeight: 'bold',
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 16,
  },
  form: {
    gap: 16,
  },
  error: {
    fontSize: 14,
    marginTop: 8,
  },
  success: {
    fontSize: 14,
    marginTop: 8,
  },
  resetButton: {
    marginTop: 24,
  },
  footer: {
    flexDirection: 'row',
    justifyContent: 'center',
    marginTop: 24,
  },
  backLink: {
    fontSize: 14,
    fontWeight: '600',
  },
}); 