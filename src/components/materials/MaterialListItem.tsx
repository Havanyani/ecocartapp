import { useTheme } from '@/hooks/useTheme';
import { Material } from '@/types/Material';
import { Ionicons } from '@expo/vector-icons';
import { Link } from 'expo-router';
import React from 'react';
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';

interface MaterialListItemProps {
  material: Material;
}

export function MaterialListItem({ material }: MaterialListItemProps) {
  const { theme } = useTheme();

  return (
    <Link href={`/materials/${material.id}`} asChild>
      <TouchableOpacity
        style={[
          styles.container,
          {
            backgroundColor: theme.colors.card,
            borderColor: theme.colors.border
          }
        ]}
      >
        <View style={styles.content}>
          <View style={styles.textContainer}>
            <Text style={[styles.name, { color: theme.colors.text }]}>
              {material.name}
            </Text>
            <Text
              style={[styles.description, { color: theme.colors.text + '99' }]}
              numberOfLines={2}
            >
              {material.description}
            </Text>
            <View style={styles.metadata}>
              <View style={styles.categoryContainer}>
                <Text
                  style={[styles.category, { color: theme.colors.primary }]}
                >
                  {material.category.charAt(0).toUpperCase() + material.category.slice(1)}
                </Text>
              </View>
              <View style={styles.valueContainer}>
                <Ionicons
                  name="leaf"
                  size={14}
                  color={theme.colors.success}
                  style={styles.valueIcon}
                />
                <Text
                  style={[styles.value, { color: theme.colors.success }]}
                >
                  {material.value} credits/kg
                </Text>
              </View>
            </View>
          </View>
          <Ionicons
            name="chevron-forward"
            size={20}
            color={theme.colors.text}
            style={styles.icon}
          />
        </View>
      </TouchableOpacity>
    </Link>
  );
}

const styles = StyleSheet.create({
  container: {
    borderRadius: 12,
    borderWidth: 1,
    marginBottom: 12,
    overflow: 'hidden',
  },
  content: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
  },
  textContainer: {
    flex: 1,
    marginRight: 16,
  },
  name: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 4,
  },
  description: {
    fontSize: 14,
    lineHeight: 20,
    marginBottom: 8,
  },
  metadata: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  categoryContainer: {
    marginRight: 12,
  },
  category: {
    fontSize: 12,
    fontWeight: '500',
  },
  valueContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  valueIcon: {
    marginRight: 4,
  },
  value: {
    fontSize: 12,
    fontWeight: '500',
  },
  icon: {
    opacity: 0.5,
  },
}); 