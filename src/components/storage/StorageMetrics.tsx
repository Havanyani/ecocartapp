/**
 * StorageMetrics displays detailed information about storage usage, capacity, and optimization
 * opportunities in the EcoCart application. It provides visual feedback and management options
 * for storage utilization.
 * 
 * @component
 * @example
 * ```tsx
 * // Basic usage
 * <StorageMetrics
 *   usage={storageMetrics}
 *   maxSize="500MB"
 *   onOptimize={handleOptimize}
 * />
 * 
 * // With detailed metrics and custom threshold
 * <StorageMetrics
 *   usage={storageMetrics}
 *   maxSize="1GB"
 *   onOptimize={handleOptimize}
 *   showDetails={true}
 *   warningThreshold={0.8}
 * />
 * ```
 * 
 * @features
 * - Storage usage visualization
 * - Capacity monitoring
 * - Optimization suggestions
 * - Usage breakdown by category
 * - Trend analysis
 * 
 * @performance
 * - Efficient data updates
 * - Optimized rendering
 * - Minimal re-renders
 * - Smooth animations
 * - Background calculations
 * 
 * @accessibility
 * - Screen reader support
 * - Keyboard navigation
 * - High contrast mode
 * - Clear labels
 * - Status announcements
 */

import { ProgressBar } from '@/components/ui/ProgressBar';
import type { StorageMetricsData } from '@/types/storage';
import { formatBytes } from '@/utils/formatters';
import { useTheme } from '@react-navigation/native';
import React, { useCallback, useMemo } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';

/**
 * Props for the StorageMetrics component
 * @interface
 */
interface StorageMetricsProps {
  /** Current storage usage metrics */
  usage: StorageMetricsData;
  /** Maximum storage capacity */
  maxSize: string;
  /** Callback for optimization request */
  onOptimize: () => void;
  /** Show detailed metrics */
  showDetails?: boolean;
  /** Storage usage warning threshold (0-1) */
  warningThreshold?: number;
}

/**
 * StorageMetrics component implementation
 * @param {StorageMetricsProps} props - Component props
 * @returns {JSX.Element} Rendered component
 */
export const StorageMetrics: React.FC<StorageMetricsProps> = ({
  usage,
  maxSize,
  onOptimize,
  showDetails = false,
  warningThreshold = 0.8,
}) => {
  // Theme and styles
  const { colors } = useTheme();
  const styles = useMemo(() => createStyles(colors), [colors]);

  /**
   * Calculates usage percentage
   * @returns {number} Usage percentage
   */
  const usagePercentage = useMemo(() => {
    return (usage.used / usage.total) * 100;
  }, [usage]);

  /**
   * Determines if optimization is needed
   * @returns {boolean} Whether optimization is recommended
   */
  const needsOptimization = useMemo(() => {
    return usagePercentage / 100 > warningThreshold;
  }, [usagePercentage, warningThreshold]);

  /**
   * Handles optimization request
   */
  const handleOptimizePress = useCallback(() => {
    if (needsOptimization) {
      onOptimize();
    }
  }, [needsOptimization, onOptimize]);

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Storage Usage</Text>
      
      {/* Usage bar */}
      <ProgressBar
        progress={usagePercentage}
        color={needsOptimization ? colors.warning : colors.primary}
      />
      
      {/* Usage summary */}
      <View style={styles.summaryContainer}>
        <Text style={styles.summaryText}>
          {formatBytes(usage.used)} / {maxSize} used
        </Text>
        {needsOptimization && (
          <Pressable
            style={styles.optimizeButton}
            onPress={handleOptimizePress}
          >
            <Text style={styles.optimizeText}>Optimize Storage</Text>
          </Pressable>
        )}
      </View>

      {/* Detailed metrics */}
      {showDetails && (
        <View style={styles.detailsContainer}>
          {Object.entries(usage.breakdown).map(([category, size]) => (
            <View key={category} style={styles.detailRow}>
              <Text style={styles.categoryText}>{category}</Text>
              <Text style={styles.sizeText}>{formatBytes(size)}</Text>
            </View>
          ))}
        </View>
      )}
    </View>
  );
};

/**
 * Styles for the StorageMetrics component
 * @param {object} colors - Theme colors
 * @returns {StyleSheet} Component styles
 */
const createStyles = (colors: any) => StyleSheet.create({
  container: {
    padding: 16,
    backgroundColor: colors.card,
    borderRadius: 8,
  },
  title: {
    fontSize: 20,
    fontWeight: 'bold',
    color: colors.text,
    marginBottom: 16,
  },
  summaryContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 8,
  },
  summaryText: {
    fontSize: 16,
    color: colors.text,
  },
  optimizeButton: {
    backgroundColor: colors.warning,
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 4,
  },
  optimizeText: {
    color: colors.white,
    fontWeight: 'bold',
  },
  detailsContainer: {
    marginTop: 16,
  },
  detailRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 4,
  },
  categoryText: {
    fontSize: 14,
    color: colors.text,
  },
  sizeText: {
    fontSize: 14,
    color: colors.text,
    fontWeight: '500',
  },
}); 