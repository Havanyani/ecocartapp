import { useTheme } from '@/theme';
import { StyleSheet, Text, TextProps } from 'react-native';

interface ThemedTextProps extends TextProps {
  variant?: 'primary' | 'secondary';
}

export function ThemedText({
  style,
  variant = 'primary',
  ...props
}: ThemedTextProps) {
  const theme = useTheme();

  return (
    <Text
      style={[
        styles.text,
        { color: variant === 'primary' ? theme.theme.colors.text : theme.theme.colors.textSecondary },
        style,
      ]}
      {...props}
    />
  );
}

const styles = StyleSheet.create({
  text: {
    fontSize: 16,
  },
}); 