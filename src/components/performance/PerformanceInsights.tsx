import { useTheme } from '@/theme';
import { HapticTab } from '@components/ui/HapticTab';
import { IconSymbol } from '@components/ui/IconSymbol';
import { ThemedText } from '@components/ui/ThemedText';
import { ThemedView } from '@components/ui/ThemedView';
import React, { useEffect, useState } from 'react';
import { Animated, StyleSheet, View } from 'react-native';

interface Insight {
  id: string;
  title: string;
  description: string;
  impact: number;
  trend: number;
  category: 'collection' | 'engagement' | 'environmental';
}

export function PerformanceInsights() {
  const theme = useTheme()()();
  const [insights, setInsights] = useState<Insight[]>([]);
  const [selectedCategory, setSelectedCategory] = useState<Insight['category']>('collection');

  const fadeAnim = new Animated.Value(0);

  useEffect(() => {
    // Simulated insights data - would come from API in production
    setInsights([
      {
        id: '1',
        title: 'Collection Efficiency',
        description: 'Average collection time reduced by 15%',
        impact: 15,
        trend: 8.5,
        category: 'collection'
      },
      {
        id: '2',
        title: 'User Engagement',
        description: 'Weekly active users increased by 25%',
        impact: 25,
        trend: 12.3,
        category: 'engagement'
      },
      {
        id: '3',
        title: 'Environmental Impact',
        description: 'CO2 emissions reduced by 500kg',
        impact: 500,
        trend: 15.7,
        category: 'environmental'
      }
    ]);

    Animated.timing(fadeAnim, {
      toValue: 1,
      duration: 500,
      useNativeDriver: true,
    }).start();
  }, []);

  const getCategoryIcon = (category: Insight['category']) => {
    switch (category) {
      case 'collection': return 'recycle';
      case 'engagement': return 'account-group';
      case 'environmental': return 'leaf';
    }
  };

  const filteredInsights = insights.filter(insight => insight.category === selectedCategory);

  return (
    <ThemedView style={styles.container}>
      <ThemedText style={styles.title}>
        <IconSymbol name="lightbulb-on" size={24} color={theme.colors.success} />
        Performance Insights
      </ThemedText>

      <View style={styles.categorySelector}>
        {(['collection', 'engagement', 'environmental'] as const).map(category => (
          <HapticTab
            key={category}
            style={[
              styles.categoryButton,
              { backgroundColor: theme.colors.background },
              selectedCategory === category && { 
                backgroundColor: theme.colors.success + '20' 
              }
            ]}
            onPress={() => setSelectedCategory(category)}
          >
            <IconSymbol 
              name={getCategoryIcon(category)} 
              size={20} 
              color={selectedCategory === category ? theme.colors.success : theme.colors.textSecondary} 
            />
            <ThemedText style={styles.categoryText}>
              {category.charAt(0).toUpperCase() + category.slice(1)}
            </ThemedText>
          </HapticTab>
        ))}
      </View>

      <Animated.View style={[styles.insightsContainer, { opacity: fadeAnim }]}>
        {filteredInsights.map(insight => (
          <ThemedView 
            key={insight.id} 
            style={[
              styles.insightCard,
              { 
                backgroundColor: theme.colors.card,
                shadowColor: theme.colors.black,
                borderColor: theme.colors.border 
              }
            ]}
          >
            <View style={styles.insightHeader}>
              <ThemedText style={styles.insightTitle}>{insight.title}</ThemedText>
              <IconSymbol
                name={insight.trend >= 0 ? 'trending-up' : 'trending-down'}
                size={20}
                color={insight.trend >= 0 ? theme.colors.success : theme.colors.error}
              />
            </View>
            <ThemedText style={[styles.insightDescription, { color: theme.colors.textSecondary }]}>
              {insight.description}
            </ThemedText>
            <ThemedText style={[styles.impactText, { color: theme.colors.success }]}>
              Impact: {insight.impact}%
            </ThemedText>
          </ThemedView>
        ))}
      </Animated.View>
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  container: {
    padding: 16,
  },
  title: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 16,
  },
  categorySelector: {
    flexDirection: 'row',
    marginBottom: 16,
  },
  categoryButton: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 12,
    marginRight: 8,
    borderRadius: 8,
  },
  categoryText: {
    marginLeft: 8,
    fontSize: 14,
    fontWeight: '600',
  },
  insightsContainer: {
    marginTop: 8,
  },
  insightCard: {
    padding: 16,
    marginBottom: 12,
    borderRadius: 8,
    borderWidth: 1,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  insightHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  insightTitle: {
    fontSize: 16,
    fontWeight: 'bold',
  },
  insightDescription: {
    fontSize: 14,
    marginBottom: 8,
  },
  impactText: {
    fontSize: 14,
    fontWeight: '600',
  },
}); 