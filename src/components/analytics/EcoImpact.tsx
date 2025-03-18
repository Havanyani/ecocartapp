import React from 'react';
import { ScrollView, StyleSheet, Text, View } from 'react-native';
import { useAnalytics } from '../../hooks/useAnalytics';
import { useTheme } from '../../hooks/useTheme';

interface EcoImpactProps {
  userId: string;
}

export function EcoImpact({ userId }: EcoImpactProps) {
  const { colors } = useTheme();
  const { impact, isLoading, error } = useAnalytics(userId);

  if (isLoading) {
    return (
      <View style={styles.container}>
        <Text style={[styles.text, { color: colors.text }]}>Loading impact data...</Text>
      </View>
    );
  }

  if (error) {
    return (
      <View style={styles.container}>
        <Text style={[styles.text, { color: colors.error }]}>
          Error loading impact data: {error.message}
        </Text>
      </View>
    );
  }

  return (
    <ScrollView style={styles.container}>
      <View style={styles.section}>
        <Text style={[styles.title, { color: colors.text }]}>Environmental Impact</Text>
        <View style={styles.impactCard}>
          <Text style={[styles.impactValue, { color: colors.primary }]}>
            {impact?.carbonSaved || 0} kg
          </Text>
          <Text style={[styles.impactLabel, { color: colors.text }]}>Carbon Saved</Text>
        </View>
        <View style={styles.impactCard}>
          <Text style={[styles.impactValue, { color: colors.primary }]}>
            {impact?.waterSaved || 0} L
          </Text>
          <Text style={[styles.impactLabel, { color: colors.text }]}>Water Saved</Text>
        </View>
        <View style={styles.impactCard}>
          <Text style={[styles.impactValue, { color: colors.primary }]}>
            {impact?.treesSaved || 0}
          </Text>
          <Text style={[styles.impactLabel, { color: colors.text }]}>Trees Saved</Text>
        </View>
      </View>

      <View style={styles.section}>
        <Text style={[styles.title, { color: colors.text }]}>Impact Breakdown</Text>
        {impact?.breakdown.map((item) => (
          <View key={item.category} style={styles.breakdownItem}>
            <Text style={[styles.category, { color: colors.text }]}>{item.category}</Text>
            <View style={styles.progressContainer}>
              <View
                style={[
                  styles.progressBar,
                  {
                    width: `${item.percentage}%`,
                    backgroundColor: colors.primary,
                  },
                ]}
              />
              <Text style={[styles.percentage, { color: colors.text }]}>
                {item.percentage}%
              </Text>
            </View>
            <Text style={[styles.value, { color: colors.text }]}>{item.value}</Text>
          </View>
        ))}
      </View>

      <View style={styles.section}>
        <Text style={[styles.title, { color: colors.text }]}>Monthly Impact</Text>
        {impact?.monthlyImpact.map((month) => (
          <View key={month.month} style={styles.monthItem}>
            <Text style={[styles.monthLabel, { color: colors.text }]}>
              {new Date(month.month).toLocaleDateString('default', {
                month: 'short',
                year: 'numeric',
              })}
            </Text>
            <View style={styles.monthStats}>
              <Text style={[styles.monthValue, { color: colors.text }]}>
                {month.carbonSaved} kg CO₂
              </Text>
              <Text style={[styles.monthValue, { color: colors.text }]}>
                {month.ecoFriendlyItems} items
              </Text>
            </View>
          </View>
        ))}
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 16,
  },
  section: {
    marginBottom: 24,
  },
  title: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 16,
  },
  impactCard: {
    backgroundColor: 'rgba(0, 0, 0, 0.05)',
    padding: 16,
    borderRadius: 8,
    marginBottom: 12,
    alignItems: 'center',
  },
  impactValue: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 4,
  },
  impactLabel: {
    fontSize: 16,
  },
  breakdownItem: {
    marginBottom: 16,
  },
  category: {
    fontSize: 16,
    marginBottom: 8,
  },
  progressContainer: {
    height: 8,
    backgroundColor: 'rgba(0, 0, 0, 0.1)',
    borderRadius: 4,
    marginBottom: 4,
    overflow: 'hidden',
  },
  progressBar: {
    height: '100%',
    borderRadius: 4,
  },
  percentage: {
    fontSize: 12,
    marginTop: 4,
  },
  value: {
    fontSize: 14,
  },
  monthItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(0, 0, 0, 0.1)',
  },
  monthLabel: {
    fontSize: 16,
  },
  monthStats: {
    flexDirection: 'row',
    gap: 16,
  },
  monthValue: {
    fontSize: 14,
  },
}); 