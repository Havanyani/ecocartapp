import { Text } from '@/components/ui/Text';
import { useMaterials } from '@/hooks/useMaterials';
import { useTheme } from '@/hooks/useTheme';
import React from 'react';
import { FlatList, View } from 'react-native';
import { MaterialListItem } from './MaterialListItem';

export interface MaterialListProps {
  searchQuery: string;
}

export function MaterialList({ searchQuery }: MaterialListProps) {
  const { theme } = useTheme();
  const { materials, isLoading, error } = useMaterials({ searchQuery });

  if (isLoading) {
    return (
      <View style={{ padding: theme.spacing.md }}>
        <Text variant="body">Loading materials...</Text>
      </View>
    );
  }

  if (error) {
    return (
      <View style={{ padding: theme.spacing.md }}>
        <Text variant="body" style={{ color: theme.colors.error }}>
          Error loading materials: {error.message}
        </Text>
      </View>
    );
  }

  if (!materials.length) {
    return (
      <View style={{ padding: theme.spacing.md }}>
        <Text variant="body">No materials found</Text>
      </View>
    );
  }

  return (
    <FlatList
      data={materials}
      renderItem={({ item }) => <MaterialListItem material={item} />}
      keyExtractor={item => item.id}
      contentContainerStyle={{ padding: theme.spacing.md, gap: theme.spacing.sm }}
    />
  );
} 