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
import { LineChart } from 'react-native-chart-kit';

export interface EnergyDataPoint {
  time: string;
  value: number;
  comparisonValue?: number;
}

export interface EnergyUsageChartProps {
  title?: string;
  data: EnergyDataPoint[];
  timeframes?: Array<'day' | 'week' | 'month' | 'year'>;
  selectedTimeframe?: 'day' | 'week' | 'month' | 'year';
  onTimeframeChange?: (timeframe: 'day' | 'week' | 'month' | 'year') => void;
  yAxisLabel?: string;
  yAxisSuffix?: string;
  style?: ViewStyle;
  titleStyle?: TextStyle;
  showComparison?: boolean;
  comparisonLabel?: string;
  height?: number;
  loading?: boolean;
  error?: string;
  onRetry?: () => void;
}

const defaultTimeframes = ['day', 'week', 'month', 'year'];

export const EnergyUsageChart: React.FC<EnergyUsageChartProps> = ({
  title = 'Energy Usage',
  data = [],
  timeframes = defaultTimeframes,
  selectedTimeframe = 'day',
  onTimeframeChange,
  yAxisLabel = '',
  yAxisSuffix = ' W',
  style,
  titleStyle,
  showComparison = false,
  comparisonLabel = 'Previous Period',
  height = 220,
  loading = false,
  error,
  onRetry
}) => {
  const { theme } = useTheme();
  const screenWidth = Dimensions.get('window').width;
  const chartWidth = style?.width ? (style.width as number) : screenWidth - 32;
  
  const getChartData = () => {
    const labels = data.map(point => point.time);
    const values = data.map(point => point.value);
    
    const datasets = [
      {
        data: values,
        color: (opacity = 1) => theme.colors.primary,
        strokeWidth: 2
      }
    ];
    
    if (showComparison) {
      const comparisonValues = data.map(point => 
        point.comparisonValue !== undefined ? point.comparisonValue : 0
      );
      
      datasets.push({
        data: comparisonValues,
        color: (opacity = 1) => `rgba(128, 128, 128, ${opacity})`,
        strokeWidth: 2,
        strokeDashArray: [5, 5] // dashed line for comparison
      });
    }
    
    return {
      labels,
      datasets,
      legend: showComparison ? ['Current', comparisonLabel] : undefined
    };
  };
  
  return (
    <View style={[styles.container, style]}>
      <View style={styles.header}>
        {title && (
          <Text style={[styles.title, { color: theme.colors.text }, titleStyle]}>
            {title}
          </Text>
        )}
        
        {timeframes.length > 1 && onTimeframeChange && (
          <View style={styles.timeframeSelector}>
            {timeframes.map(timeframe => (
              <TouchableOpacity
                key={timeframe}
                style={[
                  styles.timeframeButton,
                  selectedTimeframe === timeframe && { 
                    backgroundColor: theme.colors.primary,
                    borderColor: theme.colors.primary
                  }
                ]}
                onPress={() => onTimeframeChange(timeframe)}
              >
                <Text 
                  style={{ 
                    color: selectedTimeframe === timeframe 
                      ? theme.colors.white 
                      : theme.colors.text,
                    fontSize: 12
                  }}
                >
                  {timeframe.charAt(0).toUpperCase() + timeframe.slice(1)}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        )}
      </View>
      
      {loading ? (
        <View style={[styles.placeholderContainer, { height }]}>
          <Ionicons name="hourglass-outline" size={32} color={theme.colors.secondaryText} />
          <Text style={{ color: theme.colors.secondaryText, marginTop: 8 }}>
            Loading...
          </Text>
        </View>
      ) : error ? (
        <View style={[styles.placeholderContainer, { height }]}>
          <Ionicons name="alert-circle-outline" size={32} color={theme.colors.error} />
          <Text style={{ color: theme.colors.error, marginTop: 8 }}>
            {error}
          </Text>
          {onRetry && (
            <TouchableOpacity
              style={[styles.retryButton, { backgroundColor: theme.colors.primary }]}
              onPress={onRetry}
            >
              <Text style={{ color: theme.colors.white }}>
                Retry
              </Text>
            </TouchableOpacity>
          )}
        </View>
      ) : data.length === 0 ? (
        <View style={[styles.placeholderContainer, { height }]}>
          <Ionicons name="analytics-outline" size={32} color={theme.colors.secondaryText} />
          <Text style={{ color: theme.colors.secondaryText, marginTop: 8 }}>
            No data available
          </Text>
        </View>
      ) : (
        <LineChart
          data={getChartData()}
          width={chartWidth}
          height={height}
          yAxisLabel={yAxisLabel}
          yAxisSuffix={yAxisSuffix}
          chartConfig={{
            backgroundColor: theme.colors.card,
            backgroundGradientFrom: theme.colors.card,
            backgroundGradientTo: theme.colors.card,
            decimalPlaces: 1,
            color: (opacity = 1) => `rgba(0, 0, 0, ${opacity})`,
            labelColor: (opacity = 1) => theme.colors.text,
            style: {
              borderRadius: 16,
            },
            propsForDots: {
              r: '4',
              strokeWidth: '2',
              stroke: theme.colors.primary,
            },
            propsForBackgroundLines: {
              strokeDasharray: '',
              stroke: theme.colors.border,
            },
          }}
          bezier
          style={styles.chart}
          withDots={data.length < 20}
          withInnerLines={true}
          withOuterLines={true}
          withVerticalLines={false}
          withHorizontalLines={true}
          withVerticalLabels={true}
          withHorizontalLabels={true}
          fromZero={true}
        />
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    marginVertical: 12,
    padding: 4,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
    paddingHorizontal: 8,
  },
  title: {
    fontSize: 16,
    fontWeight: 'bold',
  },
  timeframeSelector: {
    flexDirection: 'row',
  },
  timeframeButton: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: 'rgba(0, 0, 0, 0.1)',
    marginLeft: 4,
  },
  chart: {
    borderRadius: 12,
    padding: 4,
  },
  placeholderContainer: {
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.05)',
    borderRadius: 12,
    padding: 16,
  },
  retryButton: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 8,
    marginTop: 12,
  },
}); 