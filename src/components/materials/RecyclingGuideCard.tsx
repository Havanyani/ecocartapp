/**
 * RecyclingGuideCard.tsx
 * 
 * A component that displays recycling instructions and guidelines for materials.
 */

import { Ionicons } from '@expo/vector-icons';
import React from 'react';
import { StyleSheet, View } from 'react-native';

import { ThemedText } from '@/components/ui/ThemedText';
import { ThemedView } from '@/components/ui/ThemedView';
import { useTheme } from '@/theme';

interface RecyclingGuideCardProps {
  instructions: string[];
  hazardousWarning?: boolean;
  commonUses?: string[];
  additionalNotes?: string;
}

export function RecyclingGuideCard({
  instructions,
  hazardousWarning = false,
  commonUses = [],
  additionalNotes,
}: RecyclingGuideCardProps) {
  const theme = useTheme();

  return (
    <ThemedView style={styles.container}>
      <ThemedText style={styles.title}>Recycling Guide</ThemedText>
      
      {/* Hazardous warning */}
      {hazardousWarning && (
        <View style={[styles.warningContainer, { backgroundColor: '#FF3B3020' }]}>
          <Ionicons name="warning" size={24} color="#FF3B30" />
          <View style={styles.warningTextContainer}>
            <ThemedText style={[styles.warningTitle, { color: '#FF3B30' }]}>
              Hazardous Material Warning
            </ThemedText>
            <ThemedText style={styles.warningText}>
              This material requires special handling. Do not place in regular recycling or trash bins.
              Check with your local hazardous waste facility for proper disposal instructions.
            </ThemedText>
          </View>
        </View>
      )}
      
      {/* Common Uses section */}
      {commonUses.length > 0 && (
        <View style={styles.section}>
          <ThemedText style={styles.sectionTitle}>Common Uses</ThemedText>
          <View style={styles.listContainer}>
            {commonUses.map((use, index) => (
              <View key={`use-${index}`} style={styles.listItem}>
                <Ionicons 
                  name="checkmark-circle" 
                  size={18} 
                  color={theme.theme.colors.primary} 
                  style={styles.listIcon} 
                />
                <ThemedText style={styles.listText}>{use}</ThemedText>
              </View>
            ))}
          </View>
        </View>
      )}
      
      {/* Recycling Instructions section */}
      <View style={styles.section}>
        <ThemedText style={styles.sectionTitle}>Preparation Instructions</ThemedText>
        <View style={styles.listContainer}>
          {instructions.map((instruction, index) => (
            <View key={`instruction-${index}`} style={styles.listItem}>
              <View style={[styles.instructionNumber, { backgroundColor: theme.theme.colors.primary }]}>
                <ThemedText style={[styles.instructionNumberText, { color: '#FFFFFF' }]}>
                  {index + 1}
                </ThemedText>
              </View>
              <ThemedText style={styles.listText}>{instruction}</ThemedText>
            </View>
          ))}
        </View>
      </View>
      
      {/* Additional Notes */}
      {additionalNotes && (
        <View style={styles.notesContainer}>
          <ThemedText style={styles.notesText}>{additionalNotes}</ThemedText>
        </View>
      )}
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  container: {
    borderRadius: 12,
    padding: 16,
    marginTop: 16,
  },
  title: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 16,
  },
  warningContainer: {
    flexDirection: 'row',
    borderRadius: 8,
    padding: 12,
    marginBottom: 16,
    alignItems: 'flex-start',
  },
  warningTextContainer: {
    flex: 1,
    marginLeft: 12,
  },
  warningTitle: {
    fontWeight: 'bold',
    marginBottom: 4,
  },
  warningText: {
    fontSize: 14,
    lineHeight: 20,
  },
  section: {
    marginBottom: 16,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 8,
  },
  listContainer: {
    marginLeft: 4,
  },
  listItem: {
    flexDirection: 'row',
    marginBottom: 12,
    alignItems: 'flex-start',
  },
  listIcon: {
    marginRight: 8,
    marginTop: 2,
  },
  instructionNumber: {
    width: 24,
    height: 24,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 8,
  },
  instructionNumberText: {
    fontSize: 12,
    fontWeight: 'bold',
  },
  listText: {
    flex: 1,
    fontSize: 14,
    lineHeight: 20,
  },
  notesContainer: {
    borderTopWidth: 1,
    borderTopColor: 'rgba(0, 0, 0, 0.1)',
    paddingTop: 12,
  },
  notesText: {
    fontSize: 14,
    fontStyle: 'italic',
    opacity: 0.7,
  },
}); 