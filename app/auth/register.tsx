import { Button } from '@/components/ui/Button';
import { FormInput } from '@/components/ui/FormInput';
import { PasswordInput } from '@/components/ui/PasswordInput';
import { QRCodeComponent } from '@/components/ui/QRCode';
import { SocialLogin } from '@/components/ui/SocialLogin';
import { Text } from '@/components/ui/Text';
import { useAuth } from '@/contexts/AuthContext';
import { useFormValidation } from '@/hooks/useFormValidation';
import { useTheme } from '@/hooks/useTheme';
import { registerSchema } from '@/schemas/auth';
import { useRouter } from 'expo-router';
import React, { useState } from 'react';
import { StyleSheet, TouchableOpacity, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

export default function RegisterScreen() {
  const router = useRouter();
  const { theme } = useTheme();
  const { signUp, signInWithGoogle, signInWithApple, signInWithFacebook, signInWithTwitter, signInWithGithub, signInWithMicrosoft, enableTwoFactor, generateTwoFactorSecret } = useAuth();
  const { values, errors, handleChange, handleSubmit, resetForm } = useFormValidation(registerSchema);
  const [isLoading, setIsLoading] = useState(false);
  const [showTwoFactorSetup, setShowTwoFactorSetup] = useState(false);
  const [twoFactorCode, setTwoFactorCode] = useState('');
  const [twoFactorSecret, setTwoFactorSecret] = useState<string | null>(null);

  const handleSocialLogin = async (loginFunction: () => Promise<void>) => {
    try {
      setIsLoading(true);
      await loginFunction();
      router.replace('/(tabs)');
    } catch (error) {
      console.error('Social login failed:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleTwoFactorSetup = async () => {
    try {
      setIsLoading(true);
      const secret = await generateTwoFactorSecret();
      setTwoFactorSecret(secret);
      setShowTwoFactorSetup(true);
    } catch (error) {
      console.error('Failed to generate 2FA secret:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleTwoFactorSubmit = async () => {
    try {
      setIsLoading(true);
      await enableTwoFactor({ secret: twoFactorSecret!, code: twoFactorCode });
      router.replace('/(tabs)');
    } catch (error) {
      console.error('2FA setup failed:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const onSubmit = async (data: typeof values) => {
    try {
      setIsLoading(true);
      await signUp(data);
      await handleTwoFactorSetup();
    } catch (error) {
      console.error('Registration failed:', error);
    } finally {
      setIsLoading(false);
    }
  };

  if (showTwoFactorSetup) {
    return (
      <View style={[styles.container, { backgroundColor: theme.colors.background }]}>
        <View style={styles.header}>
          <Text style={[styles.title, { color: theme.colors.text.primary }]}>
            Set Up Two-Factor Authentication
          </Text>
          <Text style={[styles.subtitle, { color: theme.colors.text.secondary }]}>
            Scan the QR code with your authenticator app and enter the code
          </Text>
        </View>

        <View style={styles.qrContainer}>
          <QRCodeComponent
            value={`otpauth://totp/EcoCart:${values.email}?secret=${twoFactorSecret}&issuer=EcoCart`}
            title="Scan this QR code"
          />
          <Text style={[styles.secretText, { color: theme.colors.text.primary }]}>
            Secret: {twoFactorSecret}
          </Text>
        </View>

        <FormInput
          label="Verification Code"
          value={twoFactorCode}
          onChangeText={setTwoFactorCode}
          placeholder="Enter 6-digit code"
          keyboardType="number-pad"
          maxLength={6}
          error={errors.twoFactorCode}
        />

        <Button
          onPress={handleTwoFactorSubmit}
          isLoading={isLoading}
          style={styles.button}
        >
          Verify and Complete Setup
        </Button>
      </View>
    );
  }

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: theme.colors.background }]}>
      <View style={styles.content}>
        <View style={styles.header}>
          <Text style={[styles.title, { color: theme.colors.text.primary }]}>Create Account</Text>
          <Text style={[styles.subtitle, { color: theme.colors.text.secondary }]}>
            Join EcoCart and start your sustainable shopping journey
          </Text>
        </View>

        <View style={styles.form}>
          <FormInput
            label="Name"
            value={values.name}
            onChangeText={handleChange('name')}
            placeholder="Enter your name"
            autoCapitalize="words"
            autoComplete="name"
            error={errors.name}
          />

          <FormInput
            label="Email"
            value={values.email}
            onChangeText={handleChange('email')}
            placeholder="Enter your email"
            keyboardType="email-address"
            autoCapitalize="none"
            autoComplete="email"
            error={errors.email}
          />

          <PasswordInput
            label="Password"
            value={values.password}
            onChangeText={handleChange('password')}
            placeholder="Create a strong password"
            autoCapitalize="none"
            autoComplete="new-password"
            error={errors.password}
            showStrengthIndicator
          />

          <PasswordInput
            label="Confirm Password"
            value={values.confirmPassword}
            onChangeText={handleChange('confirmPassword')}
            placeholder="Confirm your password"
            error={errors.confirmPassword}
          />

          <Button
            onPress={handleSubmit(onSubmit)}
            isLoading={isLoading}
            style={styles.button}
          >
            Sign Up
          </Button>

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
              Already have an account?{' '}
            </Text>
            <TouchableOpacity onPress={() => router.push('/auth/login')}>
              <Text style={[styles.footerLink, { color: theme.colors.primary }]}>
                Sign In
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
  registerButton: {
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
  qrContainer: {
    alignItems: 'center',
    marginVertical: 24,
  },
  secretText: {
    fontSize: 14,
    marginBottom: 16,
  },
  button: {
    marginTop: 8,
  },
}); 