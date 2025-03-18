import { Button } from '@/components/ui/Button';
import { FormInput } from '@/components/ui/FormInput';
import { PasswordInput } from '@/components/ui/PasswordInput';
import { SocialLogin } from '@/components/ui/SocialLogin';
import { Text } from '@/components/ui/Text';
import { useAuth } from '@/contexts/AuthContext';
import { useFormValidation } from '@/hooks/useFormValidation';
import { useTheme } from '@/hooks/useTheme';
import { LoginFormData, loginSchema } from '@/schemas/auth';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import React, { useEffect, useState } from 'react';
import { StyleSheet, TouchableOpacity, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

export default function LoginScreen() {
  const { theme } = useTheme();
  const {
    signIn,
    signInWithGoogle,
    signInWithApple,
    signInWithFacebook,
    signInWithTwitter,
    signInWithGithub,
    signInWithMicrosoft,
    isBiometricEnabled,
    authenticateWithBiometric,
    isTwoFactorEnabled,
    verifyTwoFactor,
  } = useAuth();
  const router = useRouter();
  const { validate, getFieldError, clearErrors } = useFormValidation(loginSchema);
  const [formData, setFormData] = useState<LoginFormData>({
    email: '',
    password: '',
  });
  const [isLoading, setIsLoading] = useState(false);
  const [showTwoFactor, setShowTwoFactor] = useState(false);
  const [twoFactorCode, setTwoFactorCode] = useState('');

  useEffect(() => {
    if (isBiometricEnabled) {
      handleBiometricLogin();
    }
  }, [isBiometricEnabled]);

  const handleLogin = async () => {
    clearErrors();
    if (!validate(formData)) {
      return;
    }

    setIsLoading(true);

    try {
      await signIn(formData);
      if (isTwoFactorEnabled) {
        setShowTwoFactor(true);
      } else {
        router.replace('/(tabs)');
      }
    } catch (err) {
      console.error('Login failed:', err);
    } finally {
      setIsLoading(false);
    }
  };

  const handleBiometricLogin = async () => {
    try {
      setIsLoading(true);
      await authenticateWithBiometric();
      if (isTwoFactorEnabled) {
        setShowTwoFactor(true);
      } else {
        router.replace('/(tabs)');
      }
    } catch (err) {
      console.error('Biometric login failed:', err);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSocialLogin = async (loginFn: () => Promise<void>) => {
    setIsLoading(true);

    try {
      await loginFn();
      if (isTwoFactorEnabled) {
        setShowTwoFactor(true);
      } else {
        router.replace('/(tabs)');
      }
    } catch (err) {
      console.error('Social login failed:', err);
    } finally {
      setIsLoading(false);
    }
  };

  const handleTwoFactorSubmit = async () => {
    try {
      setIsLoading(true);
      await verifyTwoFactor(twoFactorCode);
      router.replace('/(tabs)');
    } catch (err) {
      console.error('2FA verification failed:', err);
    } finally {
      setIsLoading(false);
    }
  };

  if (showTwoFactor) {
    return (
      <View style={[styles.container, { backgroundColor: theme.colors.background }]}>
        <View style={styles.header}>
          <Text style={[styles.title, { color: theme.colors.text }]}>Two-Factor Authentication</Text>
          <Text style={[styles.subtitle, { color: theme.colors.textSecondary }]}>
            Enter the code from your authenticator app
          </Text>
        </View>

        <FormInput
          label="Verification Code"
          value={twoFactorCode}
          onChangeText={setTwoFactorCode}
          placeholder="Enter 6-digit code"
          keyboardType="number-pad"
          maxLength={6}
          error={getFieldError('twoFactorCode')}
        />

        <Button
          title="Verify"
          onPress={handleTwoFactorSubmit}
          isLoading={isLoading}
          style={styles.button}
        />
      </View>
    );
  }

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: theme.colors.background }]}>
      <View style={styles.content}>
        <View style={styles.header}>
          <Text style={[styles.title, { color: theme.colors.text.primary }]}>Welcome Back</Text>
          <Text style={[styles.subtitle, { color: theme.colors.text.secondary }]}>
            Sign in to continue to EcoCart
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

          <PasswordInput
            label="Password"
            value={formData.password}
            onChangeText={password => setFormData(prev => ({ ...prev, password }))}
            placeholder="Enter your password"
            autoCapitalize="none"
            autoComplete="password"
            error={getFieldError('password')}
          />

          <Button
            onPress={handleLogin}
            isLoading={isLoading}
            disabled={isLoading}
            style={styles.loginButton}
          >
            Sign In
          </Button>

          {isBiometricEnabled && (
            <TouchableOpacity
              onPress={handleBiometricLogin}
              style={styles.biometricButton}
              disabled={isLoading}
            >
              <Ionicons
                name="finger-print"
                size={24}
                color={theme.colors.primary}
              />
            </TouchableOpacity>
          )}

          <SocialLogin
            onGoogleLogin={() => handleSocialLogin(signInWithGoogle)}
            onAppleLogin={() => handleSocialLogin(signInWithApple)}
            onFacebookLogin={() => handleSocialLogin(signInWithFacebook)}
            onTwitterLogin={() => handleSocialLogin(signInWithTwitter)}
            onGithubLogin={() => handleSocialLogin(signInWithGithub)}
            onMicrosoftLogin={() => handleSocialLogin(signInWithMicrosoft)}
            isLoading={isLoading}
          />

          <View style={styles.footer}>
            <Text style={[styles.footerText, { color: theme.colors.text.secondary }]}>
              Don't have an account?{' '}
            </Text>
            <TouchableOpacity onPress={() => router.push('/auth/register')}>
              <Text style={[styles.footerLink, { color: theme.colors.primary }]}>
                Sign Up
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
  actions: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 8,
  },
  forgotPassword: {
    padding: 4,
  },
  forgotPasswordText: {
    fontSize: 14,
  },
  biometricButton: {
    padding: 8,
  },
  loginButton: {
    marginTop: 24,
  },
  footer: {
    flexDirection: 'row',
    justifyContent: 'center',
    marginTop: 24,
  },
  footerText: {
    fontSize: 14,
  },
  footerLink: {
    fontSize: 14,
    fontWeight: '600',
  },
  button: {
    marginTop: 8,
  },
}); 