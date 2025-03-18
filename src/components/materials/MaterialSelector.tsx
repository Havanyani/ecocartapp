import { Ionicons } from '@expo/vector-icons';
import { useState } from 'react';
import { Modal, Pressable, ScrollView, StyleSheet, View } from 'react-native';
import { useTheme } from '@/contexts/ThemeContext';
import { MaterialType } from '@/store/slices/ecoCartSlice';
import { Button } from '@/components/ui/Button';
import { ThemedText } from '@/components/ui/ThemedText';

interface MaterialSelectorProps {
  value?: string;
  onChange: (materialId: string) => void;
  materials: MaterialType[];
  error?: string;
}

export function MaterialSelector({ value, onChange, materials, error }: MaterialSelectorProps) {
  const { theme } = useTheme();
  const [isOpen, setIsOpen] = useState(false);
  const selectedMaterial = materials.find(m => m.id === value);

  return (
    <View>
      <Pressable
        onPress={() => setIsOpen(true)}
        style={[
          styles.selector,
          {
            backgroundColor: theme.colors.surface,
            borderColor: error ? theme.colors.error : theme.colors.border,
          },
        ]}
      >
        {selectedMaterial ? (
          <View style={styles.selectedMaterial}>
            <ThemedText variant="body">{selectedMaterial.name}</ThemedText>
            <View style={styles.stats}>
              <View style={styles.statItem}>
                <Ionicons name="star-outline" size={16} color={theme.colors.primary} />
                <ThemedText variant="body-sm" style={styles.statText}>
                  {selectedMaterial.pointsPerKg} pts/kg
                </ThemedText>
              </View>
              <View style={styles.statItem}>
                <Ionicons name="leaf-outline" size={16} color={theme.colors.success} />
                <ThemedText variant="body-sm" style={styles.statText}>
                  {selectedMaterial.co2OffsetPerKg}kg CO2/kg
                </ThemedText>
              </View>
            </View>
          </View>
        ) : (
          <ThemedText variant="body" style={{ color: theme.colors.textSecondary }}>
            Select material type
          </ThemedText>
        )}
        <Ionicons name="chevron-down" size={20} color={theme.colors.textSecondary} />
      </Pressable>

      {error && (
        <ThemedText
          variant="caption"
          style={[styles.error, { color: theme.colors.error }]}
        >
          {error}
        </ThemedText>
      )}

      <Modal visible={isOpen} animationType="slide" transparent>
        <View style={[styles.modalContainer, { backgroundColor: 'rgba(0, 0, 0, 0.5)' }]}>
          <View style={[styles.modalContent, { backgroundColor: theme.colors.background }]}>
            <View style={styles.modalHeader}>
              <ThemedText variant="h2">Select Material</ThemedText>
              <Button
                variant="ghost"
                label="Close"
                onPress={() => setIsOpen(false)}
              />
            </View>

            <ScrollView style={styles.materialList}>
              {materials.map(material => (
                <Pressable
                  key={material.id}
                  style={[
                    styles.materialItem,
                    {
                      backgroundColor: theme.colors.surface,
                      borderColor:
                        material.id === value
                          ? theme.colors.primary
                          : 'transparent',
                    },
                  ]}
                  onPress={() => {
                    onChange(material.id);
                    setIsOpen(false);
                  }}
                >
                  <View>
                    <ThemedText variant="body">{material.name}</ThemedText>
                    <View style={styles.stats}>
                      <View style={styles.statItem}>
                        <Ionicons name="star-outline" size={16} color={theme.colors.primary} />
                        <ThemedText variant="body-sm" style={styles.statText}>
                          {material.pointsPerKg} pts/kg
                        </ThemedText>
                      </View>
                      <View style={styles.statItem}>
                        <Ionicons name="leaf-outline" size={16} color={theme.colors.success} />
                        <ThemedText variant="body-sm" style={styles.statText}>
                          {material.co2OffsetPerKg}kg CO2/kg
                        </ThemedText>
                      </View>
                    </View>
                  </View>
                  {material.id === value && (
                    <Ionicons name="checkmark-circle" size={20} color={theme.colors.primary} />
                  )}
                </Pressable>
              ))}
            </ScrollView>
          </View>
        </View>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  selector: {
    height: 72,
    borderWidth: 1,
    borderRadius: 8,
    padding: 12,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  selectedMaterial: {
    flex: 1,
  },
  stats: {
    flexDirection: 'row',
    gap: 16,
    marginTop: 4,
  },
  statItem: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  statText: {
    marginLeft: 4,
  },
  error: {
    marginTop: 4,
  },
  modalContainer: {
    flex: 1,
    justifyContent: 'flex-end',
  },
  modalContent: {
    borderTopLeftRadius: 16,
    borderTopRightRadius: 16,
    maxHeight: '80%',
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(0, 0, 0, 0.1)',
  },
  materialList: {
    padding: 16,
  },
  materialItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 16,
    borderRadius: 8,
    marginBottom: 8,
    borderWidth: 2,
  },
}); 