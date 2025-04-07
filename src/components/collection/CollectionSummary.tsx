import { Card } from '@/components/ui/Card';
import { ThemedText } from '@/components/ui/ThemedText';
import { ThemedView } from '@/components/ui/ThemedView';
import { useTheme } from '@/theme';
import { CollectionLocation, CollectionMaterials } from '@/types/Collection';
import { TimeSlot } from '@/types/collections';
import { Ionicons } from '@expo/vector-icons';
import { format } from 'date-fns';
import React, { useMemo } from 'react';
import { StyleSheet, TextInput, View } from 'react-native';

interface CollectionSummaryProps {
  date: Date;
  timeSlot: TimeSlot | null;
  materials: CollectionMaterials[];
  location: CollectionLocation | null;
  estimatedWeight: number;
  notes: string;
  onNotesChange: (notes: string) => void;
}

export function CollectionSummary({
  date,
  timeSlot,
  materials,
  location,
  estimatedWeight,
  notes,
  onNotesChange,
}: CollectionSummaryProps) {
  const theme = useTheme();

  const totalCredits = useMemo(() => {
    if (!materials || materials.length === 0) return 0;
    
    return materials.reduce((sum, material) => {
      const materialWeight = estimatedWeight / materials.length; // Distribute weight evenly
      return sum + ((material.material.creditPerKg || 0) * materialWeight);
    }, 0);
  }, [materials, estimatedWeight]);

  if (!timeSlot || !location) {
    return (
      <ThemedView style={styles.container}>
        <ThemedText style={[styles.errorText, { color: theme.theme.colors.error }]}>
          Missing required information. Please complete all previous steps.
        </ThemedText>
      </ThemedView>
    );
  }

  return (
    <ThemedView style={styles.container}>
      <ThemedText style={styles.title}>Collection Summary</ThemedText>
      <ThemedText style={[styles.subtitle, { color: theme.theme.colors.textSecondary }]}>
        Review your collection details before scheduling
      </ThemedText>

      <Card style={styles.card}>
        <View style={styles.cardHeader}>
          <Ionicons name="calendar-outline" size={22} color={theme.theme.colors.success} />
          <ThemedText style={styles.cardTitle}>Date & Time</ThemedText>
        </View>
        
        <View style={styles.detailRow}>
          <ThemedText style={[styles.label, { color: theme.theme.colors.textSecondary }]}>Date:</ThemedText>
          <ThemedText style={styles.value}>
            {format(date, 'EEEE, MMMM d, yyyy')}
          </ThemedText>
        </View>

        <View style={styles.detailRow}>
          <ThemedText style={[styles.label, { color: theme.theme.colors.textSecondary }]}>Time:</ThemedText>
          <ThemedText style={styles.value}>
            {timeSlot.startTime} - {timeSlot.endTime}
          </ThemedText>
        </View>
      </Card>

      <Card style={styles.card}>
        <View style={styles.cardHeader}>
          <Ionicons name="location-outline" size={22} color={theme.theme.colors.success} />
          <ThemedText style={styles.cardTitle}>Location</ThemedText>
        </View>
        
        <ThemedText style={styles.value}>{location.street}</ThemedText>
        <ThemedText style={styles.value}>
          {location.city}, {location.state} {location.zipCode}
        </ThemedText>
      </Card>

      <Card style={styles.card}>
        <View style={styles.cardHeader}>
          <Ionicons name="cube-outline" size={22} color={theme.theme.colors.success} />
          <ThemedText style={styles.cardTitle}>Materials ({materials.length})</ThemedText>
        </View>
        
        {materials.map(material => (
          <View key={material.id} style={styles.materialRow}>
            <View style={styles.materialInfo}>
              <Ionicons 
                name={(material.material.icon as any) || "cube"} 
                size={18} 
                color={theme.theme.colors.textSecondary} 
              />
              <ThemedText style={styles.materialName}>
                {material.material.name}
              </ThemedText>
            </View>
          </View>
        ))}

        <View style={[styles.divider, { backgroundColor: theme.theme.colors.border }]} />
        
        <View style={styles.detailRow}>
          <ThemedText style={[styles.label, { color: theme.theme.colors.textSecondary }]}>Total Weight:</ThemedText>
          <ThemedText style={styles.value}>
            {estimatedWeight.toFixed(1)} kg
          </ThemedText>
        </View>
      </Card>

      <Card style={styles.card}>
        <View style={styles.cardHeader}>
          <Ionicons name="cash-outline" size={22} color={theme.theme.colors.success} />
          <ThemedText style={styles.cardTitle}>Estimated Credits</ThemedText>
        </View>
        
        <View style={styles.detailRow}>
          <ThemedText style={[styles.creditValue, { color: theme.theme.colors.success }]}>
            {Math.round(totalCredits)} credits
          </ThemedText>
        </View>
      </Card>

      <Card style={styles.card}>
        <View style={styles.cardHeader}>
          <Ionicons name="create-outline" size={22} color={theme.theme.colors.success} />
          <ThemedText style={styles.cardTitle}>Additional Notes</ThemedText>
        </View>
        
        <TextInput
          style={[
            styles.notesInput, 
            { 
              borderColor: theme.theme.colors.border,
              color: theme.theme.colors.text 
            }
          ]}
          value={notes}
          onChangeText={onNotesChange}
          placeholder="Add any special instructions for pickup (optional)"
          placeholderTextColor={theme.theme.colors.textSecondary}
          multiline
          numberOfLines={3}
        />
      </Card>
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
    marginBottom: 4,
  },
  subtitle: {
    fontSize: 14,
    marginBottom: 16,
  },
  card: {
    marginBottom: 16,
    padding: 16,
    borderRadius: 12,
  },
  cardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
    gap: 8,
  },
  cardTitle: {
    fontSize: 16,
    fontWeight: '600',
  },
  detailRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  label: {
    fontSize: 14,
  },
  value: {
    fontSize: 14,
    fontWeight: '500',
  },
  materialRow: {
    marginBottom: 8,
  },
  materialInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  materialName: {
    fontSize: 14,
  },
  creditValue: {
    fontSize: 20,
    fontWeight: '700',
    textAlign: 'center',
  },
  divider: {
    height: 1,
    marginVertical: 12,
  },
  notesInput: {
    borderWidth: 1,
    borderRadius: 8,
    padding: 12,
    fontSize: 14,
    minHeight: 80,
    textAlignVertical: 'top',
  },
  errorText: {
    textAlign: 'center',
    marginVertical: 24,
    fontSize: 16,
  }
}); 