import { ThemedText } from '@/components/ui/ThemedText';
import { ThemedView } from '@/components/ui/ThemedView';
import { useTheme } from '@/hooks/useTheme';
import { CollectionMaterials } from '@/types/Collection';
import { Ionicons } from '@expo/vector-icons';
import React, { useEffect, useState } from 'react';
import { StyleSheet, TextInput, TouchableOpacity, View } from 'react-native';

interface WeightEstimatorProps {
  materials: CollectionMaterials[];
  onEstimate: (weight: number) => void;
  initialWeight?: number;
}

interface MaterialWeight {
  materialId: string;
  weight: string;
}

export function WeightEstimator({
  materials,
  onEstimate,
  initialWeight = 0,
}: WeightEstimatorProps) {
  const { theme } = useTheme();
  const [weights, setWeights] = useState<MaterialWeight[]>([]);
  const [totalWeight, setTotalWeight] = useState<number>(initialWeight);

  useEffect(() => {
    // Initialize or update weights when materials change
    const newWeights = materials.map(material => ({
      materialId: material.id,
      weight: weights.find(w => w.materialId === material.id)?.weight || '1.0',
    }));
    setWeights(newWeights);
  }, [materials]);

  useEffect(() => {
    // Calculate total weight and notify parent
    const calculatedTotalWeight = weights.reduce((sum, weight) => {
      const numWeight = parseFloat(weight.weight) || 0;
      return sum + numWeight;
    }, 0);
    
    setTotalWeight(calculatedTotalWeight);
    onEstimate(calculatedTotalWeight);
  }, [weights, onEstimate]);

  const handleWeightChange = (materialId: string, value: string) => {
    setWeights(current =>
      current.map(weight =>
        weight.materialId === materialId
          ? { ...weight, weight: value.replace(/[^0-9.]/g, '') }
          : weight
      )
    );
  };

  const incrementWeight = (materialId: string) => {
    setWeights(current =>
      current.map(weight => {
        if (weight.materialId === materialId) {
          const currentValue = parseFloat(weight.weight) || 0;
          return { ...weight, weight: (currentValue + 0.5).toFixed(1) };
        }
        return weight;
      })
    );
  };

  const decrementWeight = (materialId: string) => {
    setWeights(current =>
      current.map(weight => {
        if (weight.materialId === materialId) {
          const currentValue = parseFloat(weight.weight) || 0;
          return { ...weight, weight: Math.max(0, currentValue - 0.5).toFixed(1) };
        }
        return weight;
      })
    );
  };

  if (materials.length === 0) {
    return (
      <ThemedView style={styles.container}>
        <ThemedText style={styles.title}>Estimated Collection Weight</ThemedText>
        <ThemedText style={styles.emptyText}>
          Please select materials in the previous step
        </ThemedText>
      </ThemedView>
    );
  }

  const getCreditEstimate = () => {
    return materials.reduce((total, material, index) => {
      const weight = parseFloat(weights[index]?.weight || '0');
      return total + (weight * material.material.creditPerKg);
    }, 0);
  };

  return (
    <ThemedView style={styles.container}>
      <ThemedText style={styles.title}>Estimated Collection Weight</ThemedText>
      <ThemedText style={styles.subtitle}>
        Adjust the weight for each material you'll be recycling
      </ThemedText>
      
      <View style={styles.weightsContainer}>
        {materials.map(material => {
          const weightObj = weights.find(w => w.materialId === material.id);
          return (
            <View key={material.id} style={styles.weightRow}>
              <View style={styles.materialInfo}>
                <Ionicons
                  name={material.material.icon as any}
                  size={24}
                  color="#2e7d32"
                />
                <View style={styles.materialTextContainer}>
                  <ThemedText style={styles.materialName}>
                    {material.material.name}
                  </ThemedText>
                  <ThemedText style={styles.creditRate}>
                    {material.material.creditPerKg} credits/kg
                  </ThemedText>
                </View>
              </View>
              
              <View style={styles.weightControls}>
                <TouchableOpacity
                  style={styles.weightButton}
                  onPress={() => decrementWeight(material.id)}
                  disabled={parseFloat(weightObj?.weight || '0') <= 0}
                >
                  <Ionicons
                    name="remove"
                    size={20}
                    color={parseFloat(weightObj?.weight || '0') <= 0 ? '#bdbdbd' : '#333333'}
                  />
                </TouchableOpacity>
                
                <View style={styles.inputContainer}>
                  <TextInput
                    style={styles.input}
                    value={weightObj?.weight}
                    onChangeText={(value) => handleWeightChange(material.id, value)}
                    keyboardType="decimal-pad"
                    placeholder="0.0"
                    placeholderTextColor="#757575"
                  />
                  <ThemedText style={styles.unit}>kg</ThemedText>
                </View>
                
                <TouchableOpacity
                  style={styles.weightButton}
                  onPress={() => incrementWeight(material.id)}
                >
                  <Ionicons name="add" size={20} color="#333333" />
                </TouchableOpacity>
              </View>
            </View>
          );
        })}
      </View>
      
      <View style={styles.summaryContainer}>
        <View style={styles.summaryRow}>
          <ThemedText style={styles.summaryLabel}>Total Weight:</ThemedText>
          <ThemedText style={styles.totalWeight}>
            {totalWeight.toFixed(1)} kg
          </ThemedText>
        </View>
        
        <View style={styles.summaryRow}>
          <ThemedText style={styles.summaryLabel}>Estimated Credits:</ThemedText>
          <ThemedText style={styles.totalCredits}>
            {getCreditEstimate().toFixed(0)} credits
          </ThemedText>
        </View>
      </View>
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  container: {
    marginBottom: 20,
  },
  title: {
    fontSize: 18,
    fontWeight: '600',
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 14,
    color: '#757575',
    marginBottom: 16,
  },
  emptyText: {
    textAlign: 'center',
    color: '#757575',
    marginTop: 16,
    marginBottom: 16,
  },
  weightsContainer: {
    gap: 16,
  },
  weightRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: '#f5f5f5',
    borderRadius: 12,
    padding: 12,
  },
  materialInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    flex: 1,
  },
  materialTextContainer: {
    flex: 1,
  },
  materialName: {
    fontSize: 16,
    fontWeight: '500',
  },
  creditRate: {
    fontSize: 12,
    color: '#2e7d32',
    marginTop: 2,
  },
  weightControls: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  weightButton: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: '#e0e0e0',
    alignItems: 'center',
    justifyContent: 'center',
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 2,
  },
  input: {
    width: 50,
    height: 40,
    backgroundColor: 'white',
    borderRadius: 8,
    paddingHorizontal: 8,
    textAlign: 'center',
    fontSize: 16,
    color: '#333333',
  },
  unit: {
    fontSize: 14,
    color: '#757575',
    width: 20,
  },
  summaryContainer: {
    marginTop: 24,
    backgroundColor: '#e8f5e9',
    borderRadius: 12,
    padding: 16,
  },
  summaryRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  summaryLabel: {
    fontSize: 16,
    fontWeight: '500',
  },
  totalWeight: {
    fontSize: 16,
    fontWeight: '600',
  },
  totalCredits: {
    fontSize: 18,
    fontWeight: '700',
    color: '#2e7d32',
  },
}); 