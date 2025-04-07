import { IconSymbol } from '@/components/ui/IconSymbol';
import { useTheme } from '@/theme';
import { performanceOptimizer } from '@/utils/PerformanceOptimizer';
import React, { useEffect, useState } from 'react';
import { ActivityIndicator, ScrollView, Share, StyleSheet, Text, TouchableOpacity, View } from 'react-native';

interface OptimizationSuggestion {
  id: string;
  title: string;
  description: string;
  impact: 'high' | 'medium' | 'low';
  category: 'memory' | 'network' | 'render' | 'frameRate' | 'interaction';
  action: string;
  timestamp: number;
}

interface PerformanceSnapshot {
  timestamp: number;
  metrics: {
    memoryUsage: number;
    networkLatency: number;
    renderTime: number;
    frameRate: number;
    interactionDelay: number;
  };
  suggestions: OptimizationSuggestion[];
}

export const PerformanceSuggestions: React.FC = () => {
  const theme = useTheme()()();
  const [suggestions, setSuggestions] = useState<OptimizationSuggestion[]>([]);
  const [snapshots, setSnapshots] = useState<PerformanceSnapshot[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      setIsLoading(true);
      const [newSuggestions, historicalSnapshots] = await Promise.all([
        performanceOptimizer.analyzePerformance(),
        performanceOptimizer.getSnapshots(),
      ]);
      setSuggestions(newSuggestions);
      setSnapshots(historicalSnapshots);
    } catch (error) {
      console.error('Error loading performance data:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleExport = async () => {
    try {
      const data = await performanceOptimizer.exportSnapshots();
      await Share.share({
        message: data,
        title: 'Performance Data Export',
      });
    } catch (error) {
      console.error('Error exporting data:', error);
    }
  };

  const getImpactColor = (impact: 'high' | 'medium' | 'low'): string => {
    switch (impact) {
      case 'high':
        return '#FF3B30';
      case 'medium':
        return '#FF9500';
      case 'low':
        return '#34C759';
      default:
        return theme.colors.text;
    }
  };

  const getCategoryIcon = (category: string): string => {
    switch (category) {
      case 'memory':
        return 'memory';
      case 'network':
        return 'network';
      case 'render':
        return 'speed';
      case 'frameRate':
        return 'fps';
      case 'interaction':
        return 'touch';
      default:
        return 'info';
    }
  };

  const filteredSuggestions = selectedCategory
    ? suggestions.filter(s => s.category === selectedCategory)
    : suggestions;

  const categories = Array.from(new Set(suggestions.map(s => s.category)));

  if (isLoading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color={theme.colors.primary} />
      </View>
    );
  }

  return (
    <ScrollView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Performance Suggestions</Text>
        <TouchableOpacity style={styles.exportButton} onPress={handleExport}>
          <IconSymbol name="export" size={20} color={theme.colors.primary} />
          <Text style={styles.exportButtonText}>Export</Text>
        </TouchableOpacity>
      </View>

      <View style={styles.categoryFilter}>
        <TouchableOpacity
          style={[
            styles.categoryButton,
            !selectedCategory && styles.selectedCategory,
          ]}
          onPress={() => setSelectedCategory(null)}
        >
          <Text style={[
            styles.categoryButtonText,
            !selectedCategory && styles.selectedCategoryText,
          ]}>
            All
          </Text>
        </TouchableOpacity>
        {categories.map(category => (
          <TouchableOpacity
            key={category}
            style={[
              styles.categoryButton,
              selectedCategory === category && styles.selectedCategory,
            ]}
            onPress={() => setSelectedCategory(category)}
          >
            <IconSymbol
              name={getCategoryIcon(category)}
              size={16}
              color={selectedCategory === category ? '#FFFFFF' : theme.colors.text}
            />
            <Text style={[
              styles.categoryButtonText,
              selectedCategory === category && styles.selectedCategoryText,
            ]}>
              {category.charAt(0).toUpperCase() + category.slice(1)}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      {filteredSuggestions.length === 0 ? (
        <View style={styles.emptyState}>
          <IconSymbol name="checkmark-circle" size={48} color={theme.colors.primary} />
          <Text style={styles.emptyStateText}>
            No performance issues detected
          </Text>
        </View>
      ) : (
        filteredSuggestions.map(suggestion => (
          <View key={suggestion.id} style={styles.suggestionCard}>
            <View style={styles.suggestionHeader}>
              <View style={styles.suggestionTitleContainer}>
                <IconSymbol
                  name={getCategoryIcon(suggestion.category)}
                  size={20}
                  color={theme.colors.text}
                />
                <Text style={styles.suggestionTitle}>{suggestion.title}</Text>
              </View>
              <View style={[
                styles.impactBadge,
                { backgroundColor: getImpactColor(suggestion.impact) }
              ]}>
                <Text style={styles.impactText}>
                  {suggestion.impact.toUpperCase()}
                </Text>
              </View>
            </View>
            <Text style={styles.suggestionDescription}>
              {suggestion.description}
            </Text>
            <View style={styles.actionContainer}>
              <Text style={styles.actionTitle}>Recommended Actions:</Text>
              <Text style={styles.actionText}>{suggestion.action}</Text>
            </View>
          </View>
        ))
      )}
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFFFFF',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(0,0,0,0.1)',
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
  },
  exportButton: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 8,
    borderRadius: 8,
    backgroundColor: 'rgba(0,0,0,0.05)',
  },
  exportButtonText: {
    marginLeft: 8,
    fontSize: 16,
    fontWeight: '600',
  },
  categoryFilter: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    padding: 16,
    gap: 8,
  },
  categoryButton: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 8,
    borderRadius: 8,
    backgroundColor: 'rgba(0,0,0,0.05)',
    gap: 8,
  },
  selectedCategory: {
    backgroundColor: '#007AFF',
  },
  categoryButtonText: {
    fontSize: 14,
    fontWeight: '500',
  },
  selectedCategoryText: {
    color: '#FFFFFF',
  },
  emptyState: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 32,
  },
  emptyStateText: {
    marginTop: 16,
    fontSize: 16,
    color: 'rgba(0,0,0,0.5)',
  },
  suggestionCard: {
    margin: 16,
    padding: 16,
    borderRadius: 12,
    backgroundColor: 'rgba(0,0,0,0.02)',
  },
  suggestionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  suggestionTitleContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  suggestionTitle: {
    fontSize: 18,
    fontWeight: '600',
  },
  impactBadge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 4,
  },
  impactText: {
    color: '#FFFFFF',
    fontSize: 12,
    fontWeight: '600',
  },
  suggestionDescription: {
    fontSize: 14,
    marginBottom: 16,
    color: 'rgba(0,0,0,0.7)',
  },
  actionContainer: {
    backgroundColor: 'rgba(0,0,0,0.03)',
    padding: 12,
    borderRadius: 8,
  },
  actionTitle: {
    fontSize: 14,
    fontWeight: '600',
    marginBottom: 8,
  },
  actionText: {
    fontSize: 14,
    color: 'rgba(0,0,0,0.7)',
    lineHeight: 20,
  },
}); 