import { Link, router } from 'expo-router';
import { useState } from 'react';
import { StyleSheet, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Button } from '../../src/components/ui/Button';
import { FormInput } from '../../src/components/ui/FormInput';
import { ThemedText } from '../../src/components/ui/ThemedText';
import { useTheme } from '../../src/contexts/ThemeContext';
import { useAppDispatch } from '../../src/store';
import { setLoading, setToken } from '../../src/store/slices/userSlice';

interface FormData {
  email: string;
  password: string;
}

interface FormErrors {
  email?: string;
  password?: string;
}

export default function SignInScreen() {
  const { theme } = useTheme();
  const dispatch = useAppDispatch();
  const [formData, setFormData] = useState<FormData>({
    email: '',
    password: '',
  });
  const [errors, setErrors] = useState<FormErrors>({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  const validateForm = (): boolean => {
    const newErrors: FormErrors = {};

    if (!formData.email) {
      newErrors.email = 'Email is required';
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      newErrors.email = 'Email is invalid';
    }

    if (!formData.password) {
      newErrors.password = 'Password is required';
    } else if (formData.password.length < 6) {
      newErrors.password = 'Password must be at least 6 characters';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async () => {
    if (!validateForm()) return;

    setIsSubmitting(true);
    dispatch(setLoading(true));

    try {
      // TODO: Implement actual sign in logic
      const mockToken = 'mock_token';
      dispatch(setToken(mockToken));
      router.replace('/(tabs)');
    } catch (error) {
      setErrors({
        email: 'Invalid email or password',
      });
    } finally {
      setIsSubmitting(false);
      dispatch(setLoading(false));
    }
  };

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: theme.colors.background }]}>
      <View style={styles.content}>
        <View style={styles.header}>
          <ThemedText variant="h1">Welcome Back</ThemedText>
          <ThemedText variant="body">Sign in to continue recycling</ThemedText>
        </View>

        <View style={styles.form}>
          <FormInput
            label="Email"
            value={formData.email}
            onChangeText={(text) => setFormData({ ...formData, email: text })}
            error={errors.email}
            keyboardType="email-address"
            autoCapitalize="none"
            autoComplete="email"
          />

          <FormInput
            label="Password"
            value={formData.password}
            onChangeText={(text) => setFormData({ ...formData, password: text })}
            error={errors.password}
            secureTextEntry
            autoComplete="password"
          />

          <Link href="../forgot-password" style={styles.forgotPassword}>
            <ThemedText variant="body-sm" style={{ color: theme.colors.primary }}>
              Forgot Password?
            </ThemedText>
          </Link>

          <Button
            label="Sign In"
            onPress={handleSubmit}
            loading={isSubmitting}
            fullWidth
            style={styles.submitButton}
          />
        </View>

        <View style={styles.footer}>
          <ThemedText variant="body-sm">Don't have an account? </ThemedText>
          <Link href="../signup">
            <ThemedText variant="body-sm" style={{ color: theme.colors.primary }}>
              Sign Up
            </ThemedText>
          </Link>
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
    justifyContent: 'center',
  },
  header: {
    marginBottom: 32,
  },
  form: {
    marginBottom: 24,
  },
  forgotPassword: {
    alignSelf: 'flex-end',
    marginBottom: 24,
  },
  submitButton: {
    marginTop: 8,
  },
  footer: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
  },
}); 