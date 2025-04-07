import { ThemedText } from '@/components/ui';
import { IconSymbol } from '@/components/ui/IconSymbol';
import { useTheme } from '@/hooks/useTheme';
import { useRouter } from 'expo-router';
import React from 'react';
import { ScrollView, StyleSheet, TouchableOpacity, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

interface DashboardCard {
  title: string;
  description: string;
  icon: Parameters<typeof IconSymbol>[0]['name'];
  route: string;
  color: string;
}

export default function AnalyticsDashboard() {
  const { theme } = useTheme();
  const router = useRouter();

  const dashboardCards: DashboardCard[] = [
    {
      title: 'Environmental Impact',
      description: 'Track your environmental footprint and sustainability metrics',
      icon: 'leaf',
      route: '/environmental-impact',
      color: '#2e7d32',
    },
    {
      title: 'AI Configuration',
      description: 'Configure AI model settings and parameters',
      icon: 'brain',
      route: '/ai-config',
      color: '#00796b',
    },
    {
      title: 'AI Performance',
      description: 'Monitor AI model performance and accuracy metrics',
      icon: 'chart-line',
      route: '/ai-performance',
      color: '#1976d2',
    },
    {
      title: 'AI Benchmark',
      description: 'Compare AI model performance across versions',
      icon: 'trophy',
      route: '/ai-benchmark',
      color: '#c62828',
    },
    {
      title: 'Bundle Optimization',
      description: 'Analyze and optimize app bundle size',
      icon: 'package',
      route: '/bundle-optimization',
      color: '#6a1b9a',
    },
    {
      title: 'Tree Shaking',
      description: 'Monitor code optimization and dead code elimination',
      icon: 'tree',
      route: '/tree-shaking',
      color: '#f57c00',
    },
  ];

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: theme.colors.background }]}>
      <ScrollView style={styles.scrollView}>
        <View style={styles.content}>
          <ThemedText style={styles.title}>Analytics Dashboard</ThemedText>

          <View style={styles.cardsGrid}>
            {dashboardCards.map((card) => (
              <TouchableOpacity
                key={card.title}
                style={[styles.card, { backgroundColor: theme.colors.cardBackground }]}
                onPress={() => router.push(card.route)}
              >
                <View style={[styles.iconContainer, { backgroundColor: card.color + '20' }]}>
                  <IconSymbol name={card.icon} size={24} color={card.color} />
                </View>
                <ThemedText style={styles.cardTitle}>{card.title}</ThemedText>
                <ThemedText style={styles.cardDescription}>{card.description}</ThemedText>
              </TouchableOpacity>
            ))}
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  scrollView: {
    flex: 1,
  },
  content: {
    padding: 16,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 16,
  },
  cardsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginHorizontal: -8,
  },
  card: {
    width: '50%',
    padding: 16,
    margin: 8,
    borderRadius: 8,
  },
  iconContainer: {
    width: 48,
    height: 48,
    borderRadius: 24,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 12,
  },
  cardTitle: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 4,
  },
  cardDescription: {
    fontSize: 14,
    opacity: 0.7,
  },
}); 