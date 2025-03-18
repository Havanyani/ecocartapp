import { useTheme } from '@/contexts/ThemeContext';
import { StyleSheet, TextInput, TextInputProps, View } from 'react-native';
import { ThemedText } from './ThemedText';

export interface FormInputProps extends TextInputProps {
  label: string;
  error?: string;
  rightIcon?: React.ReactNode;
}

export function FormInput({ label, error, style, ...props }: FormInputProps) {
  const { theme } = useTheme();

  return (
    <View style={styles.container}>
      <ThemedText variant="body" style={styles.label}>{label}</ThemedText>
      <TextInput
        style={[
          styles.input,
          { 
            backgroundColor: theme.colors.card,
            borderColor: error ? theme.colors.error : theme.colors.border,
            color: theme.colors.text.primary,
          },
          style,
        ]}
        placeholderTextColor={theme.colors.text.secondary}
        {...props}
      />
      {error && (
        <ThemedText 
          variant="body" 
          style={[styles.error, { color: theme.colors.error }]}
        >
          {error}
        </ThemedText>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    marginBottom: 16,
  },
  label: {
    marginBottom: 4,
  },
  input: {
    height: 48,
    borderWidth: 1,
    borderRadius: 8,
    paddingHorizontal: 16,
    fontSize: 16,
  },
  error: {
    marginTop: 4,
  },
}); 