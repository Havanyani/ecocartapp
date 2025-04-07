import { Ionicons } from '@expo/vector-icons';
import { Link } from 'expo-router';
import { StyleSheet, View } from 'react-native';
import { useTheme } from '@/contexts/ThemeContext';
import { ThemedText } from '@/components/ui/ThemedText';

interface SettingItemProps {
  icon: keyof typeof Ionicons.glyphMap;
  label: string;
  value?: string;
  href: {
    pathname: string;
    params?: Record<string, string>;
  };
}

export function SettingItem({ icon, label, value, href }: SettingItemProps) {
  const theme = useTheme()()();

  return (
    <Link href={href} asChild>
      <View style={[styles.container, { backgroundColor: theme.colors.surface }]}>
        <View style={styles.content}>
          <View style={[styles.iconContainer, { backgroundColor: theme.colors.primary + '20' }]}>
            <Ionicons name={icon} size={20} color={theme.colors.primary} />
          </View>
          <View style={styles.textContainer}>
            <ThemedText variant="body">{label}</ThemedText>
            {value && (
              <ThemedText variant="body-sm" style={{ color: theme.colors.textSecondary }}>
                {value}
              </ThemedText>
            )}
          </View>
          <Ionicons name="chevron-forward" size={20} color={theme.colors.textSecondary} />
        </View>
      </View>
    </Link>
  );
}

const styles = StyleSheet.create({
  container: {
    borderRadius: 12,
    marginBottom: 8,
  },
  content: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
  },
  iconContainer: {
    width: 36,
    height: 36,
    borderRadius: 18,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  textContainer: {
    flex: 1,
  },
}); 