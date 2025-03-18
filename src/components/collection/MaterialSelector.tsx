/**
 * MaterialSelector.tsx
 * 
 * A component that allows users to select materials for collection
 * from a predefined list of recyclable material types.
 */

import { IconSymbol } from '@/components/ui/IconSymbol';
import { ThemedText } from '@/components/ui/ThemedText';
import { useTheme } from '@/hooks/useTheme';
import React from 'react';
import { ScrollView, StyleSheet, TouchableOpacity, View } from 'react-native';

export interface MaterialSelectorProps {
  selectedMaterials: string[];
  onSelectionChange: (materials: string[]) => void;
}

interface MaterialType {
  id: string;
  name: string;
  icon: string;
  description: string;
}

// Predefined list of material types
const MATERIAL_TYPES: MaterialType[] = [
  {
    id: 'paper',
    name: 'Paper',
    icon: 'file-text',
    description: 'Newspapers, magazines, office paper, cardboard',
  },
  {
    id: 'plastic',
    name: 'Plastic',
    icon: 'box',
    description: 'Bottles, containers, packaging',
  },
  {
    id: 'glass',
    name: 'Glass',
    icon: 'wine-bottle',
    description: 'Bottles, jars, containers',
  },
  {
    id: 'metal',
    name: 'Metal',
    icon: 'package',
    description: 'Cans, aluminum, steel containers',
  },
  {
    id: 'electronics',
    name: 'Electronics',
    icon: 'cpu',
    description: 'Small electronics, batteries, cables',
  },
  {
    id: 'textiles',
    name: 'Textiles',
    icon: 'scissors',
    description: 'Clothing, fabrics, shoes',
  },
  {
    id: 'organic',
    name: 'Organic',
    icon: 'coffee',
    description: 'Food waste, garden waste, compostables',
  },
  {
    id: 'other',
    name: 'Other',
    icon: 'more-horizontal',
    description: 'Specify in notes',
  },
];

export function MaterialSelector({ selectedMaterials, onSelectionChange }: MaterialSelectorProps) {
  const { theme } = useTheme();
  
  // Toggle a material selection
  const toggleMaterial = (materialId: string) => {
    if (selectedMaterials.includes(materialId)) {
      onSelectionChange(selectedMaterials.filter(id => id !== materialId));
    } else {
      onSelectionChange([...selectedMaterials, materialId]);
    }
  };

  return (
    <View style={styles.container}>
      <ScrollView contentContainerStyle={styles.materialsGrid}>
        {MATERIAL_TYPES.map((material) => {
          const isSelected = selectedMaterials.includes(material.id);
          
          return (
            <TouchableOpacity
              key={material.id}
              style={[
                styles.materialItem,
                isSelected && { ...styles.selectedItem, borderColor: theme.colors.primary },
              ]}
              onPress={() => toggleMaterial(material.id)}
            >
              <View style={[
                styles.iconContainer,
                isSelected && { backgroundColor: theme.colors.primary },
              ]}>
                <IconSymbol
                  name={material.icon}
                  size={24}
                  color={isSelected ? theme.colors.white : theme.colors.primary}
                />
              </View>
              
              <ThemedText style={styles.materialName}>
                {material.name}
              </ThemedText>
              
              <ThemedText style={styles.materialDescription} numberOfLines={2}>
                {material.description}
              </ThemedText>
              
              {isSelected && (
                <View style={[styles.checkmark, { backgroundColor: theme.colors.primary }]}>
                  <IconSymbol name="check" size={14} color={theme.colors.white} />
                </View>
              )}
            </TouchableOpacity>
          );
        })}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    marginVertical: 8,
  },
  materialsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  materialItem: {
    width: '48%',
    marginBottom: 16,
    padding: 12,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#e0e0e0',
    backgroundColor: '#f8f8f8',
  },
  selectedItem: {
    backgroundColor: '#f0f8ff',
  },
  iconContainer: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: '#f0f0f0',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 8,
  },
  materialName: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 4,
  },
  materialDescription: {
    fontSize: 12,
    color: '#666',
    marginBottom: 8,
    height: 32,
  },
  checkmark: {
    position: 'absolute',
    top: 8,
    right: 8,
    width: 20,
    height: 20,
    borderRadius: 10,
    justifyContent: 'center',
    alignItems: 'center',
  },
}); 