import { IconSymbol } from '@/components/ui/IconSymbol';
import { ThemedText } from '@/components/ui/ThemedText';
import { ThemedView } from '@/components/ui/ThemedView';
import type { ProfileScreenProps } from '@/navigation/types';
import { useTheme } from '@/theme';
import React from 'react';
import { StyleSheet, View } from 'react-native';

export function ProfileScreen({ navigation }: ProfileScreenProps) {
  const theme = useTheme();

  return (
    <ThemedView style={styles.container}>
      <View style={styles.header}>
        <IconSymbol name="account-circle" size={64} color={theme.theme.colors.primary} />
        <ThemedText style={styles.title}>Profile</ThemedText>
      </View>
      <ThemedText>Profile Screen (Coming Soon)</ThemedText>
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 16,
  },
  header: {
    alignItems: 'center',
    marginBottom: 24,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginTop: 16,
  },
}); 