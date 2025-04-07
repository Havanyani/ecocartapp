import { Card } from '@/components/ui/Card';
import { IconSymbol } from '@/components/ui/IconSymbol';
import { ThemedText } from '@/components/ui/ThemedText';
import { ThemedView } from '@/components/ui/ThemedView';
import { useTheme } from '@/hooks/useTheme';
import { MaterialService } from '@/services/MaterialService';
import { MaterialCategory } from '@/types/materials';
import React, { useEffect, useState } from 'react';
import { ScrollView, StyleSheet, TouchableOpacity, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

interface Material {
  id: string;
  name: string;
  category: MaterialCategory;
  description: string;
  recyclingGuidelines: string[];
  creditPerKg: number;
  icon: string;
}

export function MaterialManagementScreen() {
  const { theme } = useTheme();
  const [materials, setMaterials] = useState<Material[]>([]);
  const [selectedCategory, setSelectedCategory] = useState<MaterialCategory | 'all'>('all');
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    loadMaterials();
  }, []);

  const loadMaterials = async () => {
    try {
      setIsLoading(true);
      const materialsData = await MaterialService.getAllMaterials();
      setMaterials(materialsData);
    } catch (error) {
      console.error('Error loading materials:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const filteredMaterials = selectedCategory === 'all'
    ? materials
    : materials.filter(material => material.category === selectedCategory);

  const categories: (MaterialCategory | 'all')[] = ['all', 'recyclable', 'non_recyclable', 'hazardous'];

  if (isLoading) {
    return (
      <SafeAreaView style={styles.container}>
        <ThemedView style={styles.loadingContainer}>
          <ThemedText>Loading materials...</ThemedText>
        </ThemedView>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView>
        <ThemedView style={styles.content}>
          {/* Category Filter */}
          <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.categoryFilter}>
            {categories.map((category) => (
              <TouchableOpacity
                key={category}
                style={[
                  styles.categoryButton,
                  selectedCategory === category && { backgroundColor: theme.colors.primary }
                ]}
                onPress={() => setSelectedCategory(category)}
              >
                <ThemedText
                  style={[
                    styles.categoryButtonText,
                    selectedCategory === category && { color: theme.colors.white }
                  ]}
                >
                  {category === 'all' ? 'All' : category.replace('_', ' ').toUpperCase()}
                </ThemedText>
              </TouchableOpacity>
            ))}
          </ScrollView>

          {/* Materials List */}
          {filteredMaterials.map((material) => (
            <Card key={material.id} style={styles.materialCard}>
              <View style={styles.materialHeader}>
                <IconSymbol name={material.icon} size={24} color={theme.colors.primary} />
                <View style={styles.materialTitleContainer}>
                  <ThemedText style={styles.materialName}>{material.name}</ThemedText>
                  <ThemedText style={styles.materialCategory}>
                    {material.category.replace('_', ' ').toUpperCase()}
                  </ThemedText>
                </View>
                <ThemedText style={styles.creditValue}>
                  {material.creditPerKg} credits/kg
                </ThemedText>
              </View>
              
              <ThemedText style={styles.description}>{material.description}</ThemedText>
              
              <View style={styles.guidelinesContainer}>
                <ThemedText style={styles.guidelinesTitle}>Recycling Guidelines:</ThemedText>
                {material.recyclingGuidelines.map((guideline, index) => (
                  <View key={index} style={styles.guidelineItem}>
                    <IconSymbol name="check-circle" size={16} color={theme.colors.success} />
                    <ThemedText style={styles.guidelineText}>{guideline}</ThemedText>
                  </View>
                ))}
              </View>
            </Card>
          ))}
        </ThemedView>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  content: {
    padding: 16,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  categoryFilter: {
    marginBottom: 16,
  },
  categoryButton: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    marginRight: 8,
    backgroundColor: '#f0f0f0',
  },
  categoryButtonText: {
    fontSize: 14,
    fontWeight: '500',
  },
  materialCard: {
    marginBottom: 16,
    padding: 16,
  },
  materialHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  materialTitleContainer: {
    flex: 1,
    marginLeft: 12,
  },
  materialName: {
    fontSize: 16,
    fontWeight: '600',
  },
  materialCategory: {
    fontSize: 12,
    opacity: 0.7,
  },
  creditValue: {
    fontSize: 14,
    fontWeight: '600',
  },
  description: {
    marginBottom: 12,
    lineHeight: 20,
  },
  guidelinesContainer: {
    marginTop: 8,
  },
  guidelinesTitle: {
    fontSize: 14,
    fontWeight: '600',
    marginBottom: 8,
  },
  guidelineItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 4,
  },
  guidelineText: {
    marginLeft: 8,
    flex: 1,
  },
}); 