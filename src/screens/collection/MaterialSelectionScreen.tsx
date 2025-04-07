/**
 * MaterialSelectionScreen.tsx
 * 
 * Screen for selecting recyclable materials for collection.
 */

import { Button } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';
import { IconSymbol } from '@/components/ui/IconSymbol';
import { Text } from '@/components/ui/Text';
import { useTheme } from '@/hooks/useTheme';
import { CollectionStackParamList } from '@/navigation/CollectionNavigator';
import { Material, MaterialCategory } from '@/types/Material';
import { useNavigation } from '@react-navigation/native';
import { StackNavigationProp } from '@react-navigation/stack';
import * as Haptics from 'expo-haptics';
import React, { useState } from 'react';
import { Alert, Platform, ScrollView, StyleSheet, TouchableOpacity, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

type MaterialSelectionScreenNavigationProp = StackNavigationProp<
  CollectionStackParamList,
  'MaterialSelection'
>;

// Mock data for available materials
const AVAILABLE_MATERIALS: Material[] = [
  {
    id: '1',
    name: 'PET Bottles',
    icon: 'bottle',
    category: 'recyclable',
    creditPerKg: 2.5,
    recyclingGuidelines: 'Rinse and crush before recycling',
  },
  {
    id: '2',
    name: 'HDPE Containers',
    icon: 'container',
    category: 'recyclable',
    creditPerKg: 2.0,
    recyclingGuidelines: 'Clean and remove caps',
  },
  {
    id: '3',
    name: 'Aluminum Cans',
    icon: 'can',
    category: 'recyclable',
    creditPerKg: 3.0,
    recyclingGuidelines: 'Rinse and crush',
  },
  {
    id: '4',
    name: 'Glass Bottles',
    icon: 'glass',
    category: 'recyclable',
    creditPerKg: 1.5,
    recyclingGuidelines: 'Rinse and remove caps',
  },
  {
    id: '5',
    name: 'Cardboard',
    icon: 'box',
    category: 'recyclable',
    creditPerKg: 1.0,
    recyclingGuidelines: 'Flatten and remove tape',
  },
  {
    id: '6',
    name: 'Paper',
    icon: 'paper',
    category: 'recyclable',
    creditPerKg: 0.8,
    recyclingGuidelines: 'Keep dry and clean',
  },
  {
    id: '7',
    name: 'Styrofoam',
    icon: 'foam',
    category: 'non_recyclable',
    creditPerKg: 0,
    recyclingGuidelines: 'Not accepted for recycling',
  },
  {
    id: '8',
    name: 'Plastic Bags',
    icon: 'bag',
    category: 'non_recyclable',
    creditPerKg: 0,
    recyclingGuidelines: 'Not accepted for recycling',
  },
  {
    id: '9',
    name: 'Batteries',
    icon: 'battery',
    category: 'hazardous',
    creditPerKg: 5.0,
    recyclingGuidelines: 'Handle with care, do not crush',
  },
  {
    id: '10',
    name: 'Electronics',
    icon: 'electronics',
    category: 'hazardous',
    creditPerKg: 4.0,
    recyclingGuidelines: 'Remove batteries if possible',
  },
];

export function MaterialSelectionScreen() {
  const navigation = useNavigation<MaterialSelectionScreenNavigationProp>();
  const { theme } = useTheme();
  const [selectedMaterials, setSelectedMaterials] = useState<string[]>([]);
  const [filter, setFilter] = useState<MaterialCategory | 'all'>('all');

  // Handle material selection
  const handleMaterialSelect = (materialId: string) => {
    if (Platform.OS === 'ios') {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    }

    if (selectedMaterials.includes(materialId)) {
      setSelectedMaterials(selectedMaterials.filter(id => id !== materialId));
    } else {
      setSelectedMaterials([...selectedMaterials, materialId]);
    }
  };

  // Handle filter change
  const handleFilterChange = (newFilter: MaterialCategory | 'all') => {
    if (Platform.OS === 'ios') {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    }

    setFilter(newFilter);
  };

  // Handle continue
  const handleContinue = () => {
    if (Platform.OS === 'ios') {
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    }

    if (selectedMaterials.length === 0) {
      Alert.alert('No Materials Selected', 'Please select at least one material to continue.');
      return;
    }

    // In a real app, you would pass the selected materials to the next screen
    navigation.navigate('ScheduleCollection');
  };

  // Filter materials based on selected filter
  const filteredMaterials = AVAILABLE_MATERIALS.filter(material => 
    filter === 'all' || material.category === filter
  );

  return (
    <SafeAreaView style={styles.container}>
      <Card style={styles.card}>
        <Text variant="h2" style={styles.title}>Select Materials</Text>
        
        <View style={styles.filterContainer}>
          <TouchableOpacity
            style={[
              styles.filterButton,
              filter === 'all' && { backgroundColor: theme.colors.primary },
            ]}
            onPress={() => handleFilterChange('all')}
          >
            <Text
              style={[
                styles.filterText,
                filter === 'all' && { color: 'white' },
              ]}
            >
              All
            </Text>
          </TouchableOpacity>
          
          <TouchableOpacity
            style={[
              styles.filterButton,
              filter === 'recyclable' && { backgroundColor: theme.colors.primary },
            ]}
            onPress={() => handleFilterChange('recyclable')}
          >
            <Text
              style={[
                styles.filterText,
                filter === 'recyclable' && { color: 'white' },
              ]}
            >
              Recyclable
            </Text>
          </TouchableOpacity>
          
          <TouchableOpacity
            style={[
              styles.filterButton,
              filter === 'non_recyclable' && { backgroundColor: theme.colors.primary },
            ]}
            onPress={() => handleFilterChange('non_recyclable')}
          >
            <Text
              style={[
                styles.filterText,
                filter === 'non_recyclable' && { color: 'white' },
              ]}
            >
              Non-Recyclable
            </Text>
          </TouchableOpacity>
          
          <TouchableOpacity
            style={[
              styles.filterButton,
              filter === 'hazardous' && { backgroundColor: theme.colors.primary },
            ]}
            onPress={() => handleFilterChange('hazardous')}
          >
            <Text
              style={[
                styles.filterText,
                filter === 'hazardous' && { color: 'white' },
              ]}
            >
              Hazardous
            </Text>
          </TouchableOpacity>
        </View>
        
        <ScrollView style={styles.materialsContainer}>
          <View style={styles.materialsGrid}>
            {filteredMaterials.map(material => (
              <TouchableOpacity
                key={material.id}
                style={[
                  styles.materialItem,
                  selectedMaterials.includes(material.id) && {
                    backgroundColor: theme.colors.primary + '20',
                    borderColor: theme.colors.primary,
                  },
                ]}
                onPress={() => handleMaterialSelect(material.id)}
              >
                <IconSymbol
                  name={material.icon}
                  size={32}
                  color={
                    selectedMaterials.includes(material.id)
                      ? theme.colors.primary
                      : theme.colors.text
                  }
                />
                <Text
                  style={[
                    styles.materialName,
                    selectedMaterials.includes(material.id) && {
                      color: theme.colors.primary,
                    },
                  ]}
                >
                  {material.name}
                </Text>
                {material.creditPerKg > 0 && (
                  <Text style={styles.creditText}>
                    {material.creditPerKg} credits/kg
                  </Text>
                )}
              </TouchableOpacity>
            ))}
          </View>
        </ScrollView>
        
        <View style={styles.selectedContainer}>
          <Text style={styles.selectedTitle}>
            Selected Materials ({selectedMaterials.length})
          </Text>
          
          <ScrollView horizontal style={styles.selectedList}>
            {selectedMaterials.map(materialId => {
              const material = AVAILABLE_MATERIALS.find(m => m.id === materialId);
              if (!material) return null;
              
              return (
                <View key={materialId} style={styles.selectedItem}>
                  <IconSymbol
                    name={material.icon}
                    size={20}
                    color={theme.colors.primary}
                  />
                  <Text style={styles.selectedName}>{material.name}</Text>
                  <TouchableOpacity
                    style={styles.removeButton}
                    onPress={() => handleMaterialSelect(materialId)}
                  >
                    <IconSymbol
                      name="close"
                      size={16}
                      color={theme.colors.error}
                    />
                  </TouchableOpacity>
                </View>
              );
            })}
          </ScrollView>
        </View>
        
        <Button
          variant="primary"
          onPress={handleContinue}
          style={styles.continueButton}
          disabled={selectedMaterials.length === 0}
        >
          Continue
        </Button>
      </Card>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  card: {
    margin: 16,
    padding: 16,
    flex: 1,
  },
  title: {
    marginBottom: 16,
    textAlign: 'center',
  },
  filterContainer: {
    flexDirection: 'row',
    marginBottom: 16,
  },
  filterButton: {
    flex: 1,
    paddingVertical: 8,
    paddingHorizontal: 4,
    borderRadius: 4,
    marginHorizontal: 2,
    alignItems: 'center',
    backgroundColor: '#f0f0f0',
  },
  filterText: {
    fontSize: 12,
    fontWeight: '600',
  },
  materialsContainer: {
    flex: 1,
  },
  materialsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  materialItem: {
    width: '48%',
    padding: 16,
    marginBottom: 16,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#f0f0f0',
    alignItems: 'center',
    backgroundColor: 'white',
  },
  materialName: {
    marginTop: 8,
    fontSize: 14,
    fontWeight: '600',
    textAlign: 'center',
  },
  creditText: {
    marginTop: 4,
    fontSize: 12,
    color: '#4CAF50',
  },
  selectedContainer: {
    marginTop: 16,
    marginBottom: 16,
  },
  selectedTitle: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 8,
  },
  selectedList: {
    flexDirection: 'row',
  },
  selectedItem: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#f9f9f9',
    borderRadius: 16,
    paddingVertical: 4,
    paddingHorizontal: 8,
    marginRight: 8,
  },
  selectedName: {
    marginLeft: 4,
    marginRight: 4,
    fontSize: 14,
  },
  removeButton: {
    padding: 2,
  },
  continueButton: {
    marginTop: 8,
  },
}); 