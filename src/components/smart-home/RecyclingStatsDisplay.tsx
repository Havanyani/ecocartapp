import { useTheme } from '@/hooks/useTheme';
import { Ionicons } from '@expo/vector-icons';
import React from 'react';
import {
    Dimensions,
    StyleSheet,
    Text,
    TextStyle,
    TouchableOpacity,
    View,
    ViewStyle
} from 'react-native';
import { PieChart } from 'react-native-chart-kit';

export interface RecyclingStatItem {
  key: string;
  value: number;
  label: string;
  color: string;
  icon?: string;
}

export interface RecyclingStatsDisplayProps {
  title?: string;
  stats: RecyclingStatItem[];
  totalLabel?: string;
  totalValue?: number;
  totalUnit?: string;
  showPieChart?: boolean;
  onItemPress?: (key: string) => void;
  style?: ViewStyle;
  titleStyle?: TextStyle;
  loading?: boolean;
  pieChartSize?: number;
}

export const RecyclingStatsDisplay: React.FC<RecyclingStatsDisplayProps> = ({
  title = 'Recycling Stats',
  stats = [],
  totalLabel = 'Total',
  totalValue,
  totalUnit = 'kg',
  showPieChart = true,
  onItemPress,
  style,
  titleStyle,
  loading = false,
  pieChartSize = 180
}) => {
  const { theme } = useTheme();
  const screenWidth = Dimensions.get('window').width;
  
  const calculateTotal = (): number => {
    if (totalValue !== undefined) return totalValue;
    return stats.reduce((sum, stat) => sum + stat.value, 0);
  };
  
  const calculatePercentage = (value: number): number => {
    const total = calculateTotal();
    if (total === 0) return 0;
    return Math.round((value / total) * 100);
  };
  
  const getChartData = () => {
    return stats.map(stat => ({
      name: stat.label,
      value: stat.value,
      color: stat.color,
      legendFontColor: theme.colors.text,
      legendFontSize: 12,
    }));
  };
  
  const getMaterialIcon = (key: string) => {
    switch (key.toLowerCase()) {
      case 'plastic':
        return 'water-outline';
      case 'paper':
        return 'newspaper-outline';
      case 'glass':
        return 'wine-outline';
      case 'metal':
        return 'hardware-chip-outline';
      case 'composite':
        return 'cube-outline';
      case 'organic':
        return 'leaf-outline';
      case 'electronics':
        return 'tv-outline';
      default:
        return 'ellipse-outline';
    }
  };
  
  return (
    <View style={[styles.container, style]}>
      {title && (
        <Text style={[styles.title, { color: theme.colors.text }, titleStyle]}>
          {title}
        </Text>
      )}
      
      {loading ? (
        <View style={styles.loadingContainer}>
          <Ionicons name="hourglass-outline" size={32} color={theme.colors.secondaryText} />
          <Text style={{ color: theme.colors.secondaryText, marginTop: 8 }}>
            Loading stats...
          </Text>
        </View>
      ) : stats.length === 0 ? (
        <View style={styles.emptyContainer}>
          <Ionicons name="analytics-outline" size={32} color={theme.colors.secondaryText} />
          <Text style={{ color: theme.colors.secondaryText, marginTop: 8 }}>
            No recycling data available
          </Text>
        </View>
      ) : (
        <View style={styles.content}>
          {showPieChart && (
            <View style={styles.chartContainer}>
              <PieChart
                data={getChartData()}
                width={pieChartSize}
                height={pieChartSize}
                chartConfig={{
                  backgroundColor: theme.colors.card,
                  backgroundGradientFrom: theme.colors.card,
                  backgroundGradientTo: theme.colors.card,
                  color: (opacity = 1) => `rgba(0, 0, 0, ${opacity})`,
                  labelColor: (opacity = 1) => theme.colors.text,
                }}
                accessor="value"
                backgroundColor="transparent"
                paddingLeft="0"
                absolute
                hasLegend={false}
              />
              
              <View style={styles.totalContainer}>
                <Text style={[styles.totalValue, { color: theme.colors.text }]}>
                  {calculateTotal().toFixed(1)}
                </Text>
                <Text style={[styles.totalUnit, { color: theme.colors.secondaryText }]}>
                  {totalUnit}
                </Text>
                <Text style={[styles.totalLabel, { color: theme.colors.secondaryText }]}>
                  {totalLabel}
                </Text>
              </View>
            </View>
          )}
          
          <View style={styles.statsListContainer}>
            {stats.map(stat => (
              <TouchableOpacity
                key={stat.key}
                style={styles.statItem}
                onPress={() => onItemPress && onItemPress(stat.key)}
                disabled={!onItemPress}
              >
                <View style={styles.statHeader}>
                  <View style={[styles.statIconContainer, { backgroundColor: stat.color + '30' }]}>
                    <Ionicons 
                      name={stat.icon || getMaterialIcon(stat.key)} 
                      size={20} 
                      color={stat.color} 
                    />
                  </View>
                  
                  <View style={styles.statInfo}>
                    <Text style={[styles.statLabel, { color: theme.colors.text }]}>
                      {stat.label}
                    </Text>
                    <View style={styles.statValueRow}>
                      <Text style={[styles.statValue, { color: theme.colors.text }]}>
                        {stat.value.toFixed(1)} {totalUnit}
                      </Text>
                      <Text style={[styles.statPercent, { color: theme.colors.secondaryText }]}>
                        ({calculatePercentage(stat.value)}%)
                      </Text>
                    </View>
                  </View>
                </View>
                
                <View style={styles.progressContainer}>
                  <View 
                    style={[
                      styles.progressBar, 
                      { 
                        backgroundColor: stat.color,
                        width: `${calculatePercentage(stat.value)}%`
                      }
                    ]}
                  />
                </View>
              </TouchableOpacity>
            ))}
          </View>
        </View>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    borderRadius: 12,
    padding: 16,
    backgroundColor: 'rgba(0, 0, 0, 0.03)',
    margin: 8,
  },
  title: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 16,
  },
  loadingContainer: {
    height: 200,
    justifyContent: 'center',
    alignItems: 'center',
  },
  emptyContainer: {
    height: 200,
    justifyContent: 'center',
    alignItems: 'center',
  },
  content: {
    alignItems: 'center',
  },
  chartContainer: {
    position: 'relative',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 16,
  },
  totalContainer: {
    position: 'absolute',
    alignItems: 'center',
    justifyContent: 'center',
  },
  totalValue: {
    fontSize: 24,
    fontWeight: 'bold',
  },
  totalUnit: {
    fontSize: 14,
  },
  totalLabel: {
    fontSize: 12,
  },
  statsListContainer: {
    width: '100%',
    marginTop: 8,
  },
  statItem: {
    marginBottom: 12,
  },
  statHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 4,
  },
  statIconContainer: {
    width: 36,
    height: 36,
    borderRadius: 18,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  statInfo: {
    flex: 1,
  },
  statLabel: {
    fontSize: 14,
    fontWeight: '500',
  },
  statValueRow: {
    flexDirection: 'row',
    alignItems: 'baseline',
  },
  statValue: {
    fontSize: 16,
    fontWeight: 'bold',
    marginRight: 4,
  },
  statPercent: {
    fontSize: 12,
  },
  progressContainer: {
    height: 6,
    backgroundColor: 'rgba(0, 0, 0, 0.05)',
    borderRadius: 3,
    overflow: 'hidden',
  },
  progressBar: {
    height: '100%',
    borderRadius: 3,
  },
}); 