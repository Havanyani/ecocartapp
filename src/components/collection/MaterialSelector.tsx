/**
 * MaterialSelector.tsx
 * 
 * Component for selecting recyclable materials for collection.
 */

import { IconSymbol } from '@/components/ui/IconSymbol';
import { ThemedText } from '@/components/ui/ThemedText';
import { ThemedView } from '@/components/ui/ThemedView';
import { useTheme } from '@/theme';
import { MaterialCategory } from '@/types/Material';
import React, { useState } from 'react';
import { ScrollView, StyleSheet, TouchableOpacity, View } from 'react-native';

interface MaterialSelectorProps {
  selectedMaterials: MaterialCategory[];
  onSelectMaterials: (materials: MaterialCategory[]) => void;
}

// Mock data for materials - in a real app, this would come from an API
const AVAILABLE_MATERIALS: MaterialCategory[] = [
  {
    id: '1',
    name: 'Plastic Bottles',
    icon: 'bottle-water',
    category: 'recyclable',
    creditPerKg: 2.5,
    recyclingGuidelines: 'Rinse and crush bottles before recycling.',
  },
  {
    id: '2',
    name: 'Cardboard',
    icon: 'package-variant',
    category: 'recyclable',
    creditPerKg: 1.0,
    recyclingGuidelines: 'Flatten cardboard boxes before recycling.',
  },
  {
    id: '3',
    name: 'Glass',
    icon: 'glass-fragile',
    category: 'recyclable',
    creditPerKg: 1.5,
    recyclingGuidelines: 'Rinse glass containers before recycling.',
  },
  {
    id: '4',
    name: 'Aluminum Cans',
    icon: 'can',
    category: 'recyclable',
    creditPerKg: 3.0,
    recyclingGuidelines: 'Rinse and crush cans before recycling.',
  },
  {
    id: '5',
    name: 'Paper',
    icon: 'file-document',
    category: 'recyclable',
    creditPerKg: 0.8,
    recyclingGuidelines: 'Keep paper dry and clean.',
  },
  {
    id: '6',
    name: 'Electronics',
    icon: 'laptop',
    category: 'hazardous',
    creditPerKg: 5.0,
    recyclingGuidelines: 'Remove batteries before recycling electronics.',
  },
  {
    id: '7',
    name: 'Batteries',
    icon: 'battery',
    category: 'hazardous',
    creditPerKg: 4.0,
    recyclingGuidelines: 'Do not mix different types of batteries.',
  },
  {
    id: '8',
    name: 'Plastic Bags',
    icon: 'shopping',
    category: 'recyclable',
    creditPerKg: 1.2,
    recyclingGuidelines: 'Clean and dry plastic bags before recycling.',
  },
];

export function MaterialSelector({
  selectedMaterials,
  onSelectMaterials,
}: MaterialSelectorProps) {
  const { colors } = useTheme();
  const [materials, setMaterials] = useState<MaterialCategory[]>(AVAILABLE_MATERIALS);
  const [filter, setFilter] = useState<'all' | 'recyclable' | 'non-recyclable' | 'hazardous'>('all');

  // Filter materials based on selected filter
  const filteredMaterials = materials.filter(material => {
    if (filter === 'all') return true;
    return material.category === filter;
  });

  // Handle material selection
  const handleMaterialSelect = (material: MaterialCategory) => {
    const isSelected = selectedMaterials.some(m => m.id === material.id);
    
    if (isSelected) {
      // Remove material if already selected
      onSelectMaterials(selectedMaterials.filter(m => m.id !== material.id));
    } else {
      // Add material if not selected
      onSelectMaterials([...selectedMaterials, material]);
    }
  };

  // Check if a material is selected
  const isMaterialSelected = (materialId: string) => {
    return selectedMaterials.some(m => m.id === materialId);
  };

  return (
    <ThemedView style={styles.container}>
      {/* Filter buttons */}
      <ScrollView 
        horizontal 
        showsHorizontalScrollIndicator={false}
        style={styles.filterContainer}
        contentContainerStyle={styles.filterContent}
      >
        <TouchableOpacity
          style={[
            styles.filterButton,
            filter === 'all' && { backgroundColor: colors.primary },
          ]}
          onPress={() => setFilter('all')}
        >
          <ThemedText
            style={[
              styles.filterText,
              filter === 'all' && { color: 'white' },
            ]}
          >
            All
          </ThemedText>
        </TouchableOpacity>
        
        <TouchableOpacity
          style={[
            styles.filterButton,
            filter === 'recyclable' && { backgroundColor: colors.primary },
          ]}
          onPress={() => setFilter('recyclable')}
        >
          <ThemedText
            style={[
              styles.filterText,
              filter === 'recyclable' && { color: 'white' },
            ]}
          >
            Recyclable
          </ThemedText>
        </TouchableOpacity>
        
        <TouchableOpacity
          style={[
            styles.filterButton,
            filter === 'non-recyclable' && { backgroundColor: colors.primary },
          ]}
          onPress={() => setFilter('non-recyclable')}
        >
          <ThemedText
            style={[
              styles.filterText,
              filter === 'non-recyclable' && { color: 'white' },
            ]}
          >
            Non-Recyclable
          </ThemedText>
        </TouchableOpacity>
        
        <TouchableOpacity
          style={[
            styles.filterButton,
            filter === 'hazardous' && { backgroundColor: colors.primary },
          ]}
          onPress={() => setFilter('hazardous')}
        >
          <ThemedText
            style={[
              styles.filterText,
              filter === 'hazardous' && { color: 'white' },
            ]}
          >
            Hazardous
          </ThemedText>
        </TouchableOpacity>
      </ScrollView>
      
      {/* Materials grid */}
      <View style={styles.materialsGrid}>
        {filteredMaterials.map(material => (
          <TouchableOpacity
            key={material.id}
            style={[
              styles.materialItem,
              isMaterialSelected(material.id) && {
                borderColor: colors.primary,
                backgroundColor: `${colors.primary}20`,
              },
            ]}
            onPress={() => handleMaterialSelect(material)}
          >
            <IconSymbol
              name={material.icon}
              size={24}
              color={isMaterialSelected(material.id) ? colors.primary : colors.text}
            />
            <ThemedText
              style={[
                styles.materialName,
                isMaterialSelected(material.id) && { color: colors.primary },
              ]}
            >
              {material.name}
            </ThemedText>
            <ThemedText style={styles.creditRate}>
              {material.creditPerKg} credits/kg
            </ThemedText>
          </TouchableOpacity>
        ))}
      </View>
      
      {selectedMaterials.length > 0 && (
        <ThemedView style={styles.selectedContainer}>
          <ThemedText style={styles.selectedTitle}>
            Selected Materials ({selectedMaterials.length})
          </ThemedText>
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            style={styles.selectedScroll}
          >
            {selectedMaterials.map(material => (
              <View key={material.id} style={styles.selectedItem}>
                <IconSymbol name={material.icon} size={16} color={colors.primary} />
                <ThemedText style={styles.selectedName}>
                  {material.name}
                </ThemedText>
                <TouchableOpacity
                  style={styles.removeButton}
                  onPress={() => handleMaterialSelect(material)}
                >
                  <IconSymbol name="close" size={12} color={colors.error} />
                </TouchableOpacity>
              </View>
            ))}
          </ScrollView>
        </ThemedView>
      )}
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  container: {
    width: '100%',
  },
  filterContainer: {
    marginBottom: 16,
  },
  filterContent: {
    paddingRight: 16,
  },
  filterButton: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    marginRight: 8,
    backgroundColor: '#f0f0f0',
  },
  filterText: {
    fontSize: 14,
    fontWeight: '500',
  },
  materialsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  materialItem: {
    width: '48%',
    padding: 16,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#e0e0e0',
    marginBottom: 16,
    alignItems: 'center',
  },
  materialName: {
    marginTop: 8,
    fontSize: 14,
    fontWeight: '500',
    textAlign: 'center',
  },
  creditRate: {
    marginTop: 4,
    fontSize: 12,
    color: '#4CAF50',
  },
  selectedContainer: {
    marginTop: 16,
    padding: 16,
    borderRadius: 12,
    backgroundColor: '#f9f9f9',
  },
  selectedTitle: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 12,
  },
  selectedScroll: {
    flexDirection: 'row',
  },
  selectedItem: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'white',
    borderRadius: 20,
    paddingHorizontal: 12,
    paddingVertical: 6,
    marginRight: 8,
    borderWidth: 1,
    borderColor: '#e0e0e0',
  },
  selectedName: {
    marginLeft: 6,
    marginRight: 4,
    fontSize: 14,
  },
  removeButton: {
    width: 16,
    height: 16,
    borderRadius: 8,
    backgroundColor: '#f0f0f0',
    justifyContent: 'center',
    alignItems: 'center',
  },
}); 