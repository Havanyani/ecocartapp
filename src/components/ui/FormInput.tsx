import { useTheme } from '@/theme';
import { getSafeTheme } from '@/utils/webFallbacks';
import { StyleSheet, TextInput, TextInputProps, View } from 'react-native';
import { Text } from './Text';

export interface FormInputProps extends TextInputProps {
  label: string;
  error?: string;
  rightIcon?: React.ReactNode;
}

export function FormInput({ label, error, style, ...props }: FormInputProps) {
  const themeResult = useTheme();
  const theme = getSafeTheme(themeResult);

  return (
    <View style={styles.container}>
      <Text variant="body" style={styles.label}>{label}</Text>
      <TextInput
        style={[
          styles.input,
          { 
            backgroundColor: theme.colors.card || '#ffffff',
            borderColor: error ? theme.colors.error || '#ff0000' : theme.colors.border || '#dddddd',
            color: theme.colors.text || '#000000',
          },
          style,
        ]}
        placeholderTextColor={theme.colors.textSecondary || '#aaaaaa'}
        {...props}
      />
      {error && (
        <Text 
          variant="body" 
          style={[styles.error, { color: theme.colors.error || '#ff0000' }]}
        >
          {error}
        </Text>
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