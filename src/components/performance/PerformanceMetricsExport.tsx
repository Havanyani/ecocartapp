import { HapticTab } from '@/components/ui/HapticTab';
import { IconSymbol } from '@/components/ui/IconSymbol';
import { ThemedText } from '@/components/ui/ThemedText';
import { ThemedView } from '@/components/ui/ThemedView';
import MaterialCommunityIcons from '@expo/vector-icons/MaterialCommunityIcons';
import React, { useState } from 'react';
import { ActivityIndicator, StyleSheet, View } from 'react-native';

interface ExportFormat {
  id: string;
  label: string;
  description: string;
  icon: keyof typeof MaterialCommunityIcons.glyphMap;
  extension: string;
}

interface ExportOption {
  id: string;
  label: string;
  description: string;
  formats: ExportFormat[];
  category: 'collection' | 'environmental' | 'financial';
}

interface PerformanceMetricsExportProps {
  options: ExportOption[];
  onExport: (optionId: string, formatId: string) => Promise<void>;
  title?: string;
  subtitle?: string;
}

export function PerformanceMetricsExport({
  options,
  onExport,
  title = 'Export Data',
  subtitle,
}: PerformanceMetricsExportProps) {
  const [loading, setLoading] = useState<{ [key: string]: boolean }>({});

  const getCategoryColor = (category: ExportOption['category']) => {
    switch (category) {
      case 'collection': return '#2e7d32';
      case 'environmental': return '#00796b';
      case 'financial': return '#1976d2';
      default: return '#666';
    }
  };

  const handleExport = async (optionId: string, formatId: string) => {
    const key = `${optionId}-${formatId}`;
    setLoading(prev => ({ ...prev, [key]: true }));
    try {
      await onExport(optionId, formatId);
    } finally {
      setLoading(prev => ({ ...prev, [key]: false }));
    }
  };

  return (
    <ThemedView style={styles.container}>
      <View style={styles.header}>
        <ThemedText style={styles.title}>{title}</ThemedText>
        {subtitle && (
          <ThemedText style={styles.subtitle}>{subtitle}</ThemedText>
        )}
      </View>

      <View style={styles.optionsList}>
        {options.map(option => (
          <View key={option.id} style={styles.optionCard}>
            <View style={styles.optionHeader}>
              <IconSymbol
                name={option.formats[0].icon}
                size={24}
                color={getCategoryColor(option.category)}
              />
              <View style={styles.optionInfo}>
                <ThemedText style={styles.optionLabel}>{option.label}</ThemedText>
                <ThemedText style={styles.optionDescription}>
                  {option.description}
                </ThemedText>
              </View>
            </View>

            <View style={styles.formatsList}>
              {option.formats.map(format => {
                const key = `${option.id}-${format.id}`;
                const isLoading = loading[key];

                return (
                  <HapticTab
                    key={format.id}
                    style={[
                      styles.formatButton,
                      isLoading && styles.loadingButton,
                    ]}
                    onPress={() => handleExport(option.id, format.id)}
                    disabled={isLoading}
                  >
                    <View style={styles.formatContent}>
                      <View style={styles.formatInfo}>
                        <IconSymbol
                          name={format.icon}
                          size={20}
                          color={getCategoryColor(option.category)}
                        />
                        <View>
                          <ThemedText style={styles.formatLabel}>
                            {format.label}
                          </ThemedText>
                          <ThemedText style={styles.formatDescription}>
                            {format.description}
                          </ThemedText>
                        </View>
                      </View>
                      {isLoading ? (
                        <ActivityIndicator
                          color={getCategoryColor(option.category)}
                          size="small"
                        />
                      ) : (
                        <ThemedText style={styles.formatExtension}>
                          .{format.extension}
                        </ThemedText>
                      )}
                    </View>
                  </HapticTab>
                );
              })}
            </View>
          </View>
        ))}
      </View>
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  header: {
    marginBottom: 16,
  },
  title: {
    fontSize: 20,
    fontWeight: 'bold',
  },
  subtitle: {
    fontSize: 14,
    color: '#666',
    marginTop: 4,
  },
  optionsList: {
    gap: 16,
  },
  optionCard: {
    backgroundColor: '#f5f5f5',
    borderRadius: 8,
    padding: 16,
    gap: 16,
  },
  optionHeader: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 12,
  },
  optionInfo: {
    flex: 1,
  },
  optionLabel: {
    fontSize: 16,
    fontWeight: '600',
  },
  optionDescription: {
    fontSize: 14,
    color: '#666',
    marginTop: 4,
  },
  formatsList: {
    gap: 8,
  },
  formatButton: {
    backgroundColor: '#fff',
    borderRadius: 8,
    padding: 12,
  },
  loadingButton: {
    opacity: 0.7,
  },
  formatContent: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  formatInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    flex: 1,
  },
  formatLabel: {
    fontSize: 14,
    fontWeight: '600',
  },
  formatDescription: {
    fontSize: 12,
    color: '#666',
  },
  formatExtension: {
    fontSize: 12,
    color: '#666',
    fontWeight: '600',
  },
}); 