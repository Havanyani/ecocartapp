import { IconSymbol } from '@/components/ui/IconSymbol';
import { ThemedText } from '@/components/ui/ThemedText';
import { ThemedView } from '@/components/ui/ThemedView';
import { useTheme } from '@/hooks/useTheme';
import { t } from '@/utils/i18n';
import React from 'react';
import { StyleSheet, View } from 'react-native';

interface Collection {
  date: string;
  weight: number;
  credits: number;
}

interface CreditsSummaryProps {
  summary: {
    totalCredits: number;
    pendingCredits: number;
    lastCollection: Collection;
  };
}

export function CreditsSummary({ summary }: CreditsSummaryProps) {
  const theme = useTheme();

  return (
    <ThemedView style={styles.container}>
      <View style={styles.header}>
        <IconSymbol name="star" size={24} color={theme.colors.primary} />
        <ThemedText style={styles.title}>{t('credits.title')}</ThemedText>
      </View>

      <View style={styles.creditsContainer}>
        <View style={styles.creditItem}>
          <ThemedText style={styles.creditLabel}>{t('credits.total')}</ThemedText>
          <ThemedText style={styles.creditValue}>
            {summary.totalCredits} {t('credits.unit')}
          </ThemedText>
        </View>

        <View style={styles.creditItem}>
          <ThemedText style={styles.creditLabel}>{t('credits.pending')}</ThemedText>
          <ThemedText style={styles.creditValue}>
            {summary.pendingCredits} {t('credits.unit')}
          </ThemedText>
        </View>
      </View>

      <View style={styles.lastCollection}>
        <ThemedText style={styles.lastCollectionTitle}>
          {t('credits.lastCollection')}
        </ThemedText>
        <View style={styles.lastCollectionDetails}>
          <ThemedText>
            {t('credits.weight')}: {summary.lastCollection.weight} kg
          </ThemedText>
          <ThemedText>
            {t('credits.earned')}: {summary.lastCollection.credits} {t('credits.unit')}
          </ThemedText>
        </View>
      </View>
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  container: {
    padding: 16,
    borderRadius: 12,
    marginBottom: 16,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
  },
  title: {
    fontSize: 18,
    fontWeight: 'bold',
    marginLeft: 8,
  },
  creditsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 16,
  },
  creditItem: {
    flex: 1,
  },
  creditLabel: {
    fontSize: 14,
    opacity: 0.8,
  },
  creditValue: {
    fontSize: 24,
    fontWeight: 'bold',
    marginTop: 4,
  },
  lastCollection: {
    borderTopWidth: 1,
    borderTopColor: 'rgba(0,0,0,0.1)',
    paddingTop: 16,
  },
  lastCollectionTitle: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 8,
  },
  lastCollectionDetails: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
}); 