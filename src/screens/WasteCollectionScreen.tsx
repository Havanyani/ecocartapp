import { CreditsSummary } from '@/components/credits/CreditsSummary';
import { Button } from '@/components/ui/Button';
import { FormInput } from '@/components/ui/FormInput';
import { IconSymbol } from '@/components/ui/IconSymbol';
import { ThemedText } from '@/components/ui/ThemedText';
import { ThemedView } from '@/components/ui/ThemedView';
import { isFeatureEnabled } from '@/config/featureFlags';
import { useTheme } from '@/hooks/useTheme';
import { WasteCollectionScreenProps } from '@/navigation/types';
import { t } from '@/utils/i18n';
import React, { useState } from 'react';
import { ScrollView, StyleSheet, TouchableOpacity, View } from 'react-native';

interface CollectionSchedule {
  date: string;
  timeSlot: string;
  wasteType: string;
  estimatedWeight: number;
}

export function WasteCollectionScreen({ navigation }: WasteCollectionScreenProps) {
  const theme = useTheme();
  const [schedule, setSchedule] = useState<CollectionSchedule>({
    date: '',
    timeSlot: '',
    wasteType: '',
    estimatedWeight: 0,
  });

  const handleScheduleCollection = async () => {
    // TODO: Implement collection scheduling logic
    console.log('Scheduling collection:', schedule);
  };

  const navigateToARScanner = () => {
    navigation.navigate('ARContainerScanner');
  };

  return (
    <ThemedView style={styles.container}>
      <ScrollView contentContainerStyle={styles.scrollContent}>
        <View style={styles.header}>
          <IconSymbol name="recycle" size={48} color={theme.colors.primary} />
          <ThemedText style={styles.title}>{t('collection.title')}</ThemedText>
        </View>

        <CreditsSummary
          summary={{
            totalCredits: 500,
            pendingCredits: 100,
            lastCollection: {
              weight: 2.5,
              credits: 50,
            },
          }}
        />

        {/* AR Container Scanner Button - only show if feature is enabled */}
        {isFeatureEnabled('enableARContainerScanner') && (
          <TouchableOpacity 
            style={styles.arScannerButton} 
            onPress={navigateToARScanner}
          >
            <View style={styles.arScannerButtonContent}>
              <IconSymbol name="camera" size={28} color="#ffffff" />
              <ThemedText style={styles.arScannerButtonText}>
                Scan Container with AR
              </ThemedText>
            </View>
          </TouchableOpacity>
        )}

        <View style={styles.form}>
          <FormInput
            label={t('collection.schedule.date')}
            value={schedule.date}
            onChangeText={(text) => setSchedule({ ...schedule, date: text })}
            placeholder="Select date"
            // TODO: Add date picker
          />

          <FormInput
            label={t('collection.schedule.timeSlot')}
            value={schedule.timeSlot}
            onChangeText={(text) => setSchedule({ ...schedule, timeSlot: text })}
            placeholder="Select time slot"
            // TODO: Add time slot picker
          />

          <FormInput
            label={t('collection.schedule.wasteType')}
            value={schedule.wasteType}
            onChangeText={(text) => setSchedule({ ...schedule, wasteType: text })}
            placeholder="Select waste type"
            // TODO: Add waste type selector
          />

          <FormInput
            label={t('collection.schedule.weightEstimate')}
            value={schedule.estimatedWeight.toString()}
            onChangeText={(text) => 
              setSchedule({ 
                ...schedule, 
                estimatedWeight: parseFloat(text) || 0 
              })
            }
            placeholder="Enter estimated weight in kg"
            keyboardType="numeric"
          />

          <Button
            onPress={handleScheduleCollection}
            style={styles.submitButton}
          >
            {t('collection.schedule.submit')}
          </Button>
        </View>
      </ScrollView>
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  scrollContent: {
    padding: 16,
  },
  header: {
    alignItems: 'center',
    marginBottom: 24,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginTop: 16,
  },
  arScannerButton: {
    backgroundColor: '#4CAF50',
    borderRadius: 12,
    padding: 16,
    marginVertical: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  arScannerButtonContent: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  arScannerButtonText: {
    color: '#ffffff',
    fontSize: 18,
    fontWeight: 'bold',
    marginLeft: 12,
  },
  form: {
    gap: 16,
    marginTop: 24,
  },
  submitButton: {
    marginTop: 8,
  },
}); 