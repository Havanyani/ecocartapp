import { Card } from '@/components/ui/Card';
import { Text } from '@/components/ui/Text';
import { useMaterials } from '@/hooks/useMaterials';
import { useTheme } from '@/hooks/useTheme';
import { Ionicons } from '@expo/vector-icons';
import { useLocalSearchParams } from 'expo-router';
import React from 'react';
import { Image, ScrollView, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

export default function MaterialDetailScreen() {
  const { theme } = useTheme();
  const { id } = useLocalSearchParams<{ id: string }>();
  const { materials, isLoading, error } = useMaterials({});
  const material = materials.find(m => m.id === id);

  if (isLoading) {
    return (
      <SafeAreaView style={{ flex: 1, backgroundColor: theme.colors.background }}>
        <View style={{ padding: theme.spacing.md }}>
          <Text variant="body">Loading material details...</Text>
        </View>
      </SafeAreaView>
    );
  }

  if (error || !material) {
    return (
      <SafeAreaView style={{ flex: 1, backgroundColor: theme.colors.background }}>
        <View style={{ padding: theme.spacing.md }}>
          <Text variant="body" style={{ color: theme.colors.error }}>
            {error?.message || 'Material not found'}
          </Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: theme.colors.background }}>
      <ScrollView contentContainerStyle={{ padding: theme.spacing.md, gap: theme.spacing.md }}>
        <Image
          source={{ uri: material.imageUrl }}
          style={{
            width: '100%',
            height: 200,
            borderRadius: 12,
            backgroundColor: theme.colors.background,
          }}
        />

        <View style={{ gap: theme.spacing.sm }}>
          <Text variant="h2">{material.name}</Text>
          <Text variant="body" style={{ color: theme.colors.textSecondary }}>
            {material.description}
          </Text>
        </View>

        <Card>
          <View style={{ gap: theme.spacing.sm }}>
            <View style={{ flexDirection: 'row', alignItems: 'center', gap: theme.spacing.sm }}>
              <Ionicons name="pricetag" size={24} color={theme.colors.primary} />
              <View>
                <Text variant="subtitle">Value</Text>
                <Text variant="h3">{material.value.toFixed(2)} credits/kg</Text>
              </View>
            </View>

            <View style={{ flexDirection: 'row', alignItems: 'center', gap: theme.spacing.sm }}>
              <Ionicons name="cube" size={24} color={theme.colors.primary} />
              <View>
                <Text variant="subtitle">Category</Text>
                <Text variant="h3">{material.category}</Text>
              </View>
            </View>

            {material.minQuantity && (
              <View style={{ flexDirection: 'row', alignItems: 'center', gap: theme.spacing.sm }}>
                <Ionicons name="scale" size={24} color={theme.colors.primary} />
                <View>
                  <Text variant="subtitle">Minimum Quantity</Text>
                  <Text variant="h3">{material.minQuantity} kg</Text>
                </View>
              </View>
            )}
          </View>
        </Card>

        {material.guidelines && material.guidelines.length > 0 && (
          <Card>
            <View style={{ gap: theme.spacing.sm }}>
              <Text variant="h3">Guidelines</Text>
              {material.guidelines.map((guideline, index) => (
                <View
                  key={index}
                  style={{ flexDirection: 'row', alignItems: 'center', gap: theme.spacing.sm }}
                >
                  <Ionicons name="checkmark-circle" size={24} color={theme.colors.success} />
                  <Text variant="body">{guideline}</Text>
                </View>
              ))}
            </View>
          </Card>
        )}
      </ScrollView>
    </SafeAreaView>
  );
} 