declare module 'react-native-chart-kit' {
  import { ComponentType } from 'react';
    import { ViewStyle } from 'react-native';

  export interface ChartConfig {
    backgroundColor?: string;
    backgroundGradientFrom?: string;
    backgroundGradientTo?: string;
    decimalPlaces?: number;
    color?: (opacity: number) => string;
    labelColor?: (opacity: number) => string;
    strokeWidth?: number;
    barPercentage?: number;
    useShadowColorFromDataset?: boolean;
    propsForBackgroundLines?: {
      strokeDasharray?: string;
      strokeWidth?: number;
      stroke?: string;
    };
    propsForLabels?: {
      fontSize?: number;
      fontWeight?: string;
    };
    propsForDots?: {
      r?: string;
      strokeWidth?: string;
      stroke?: string;
    };
  }

  export interface ChartData {
    labels: string[];
    datasets: Array<{
      data: number[];
      color?: (opacity: number) => string;
      strokeWidth?: number;
      strokeDasharray?: number[];
      withDots?: boolean;
    }>;
    legend?: string[];
  }

  interface DotContentProps {
    x: number;
    y: number;
    index: number;
    indexData: number;
  }

  interface LineChartProps {
    data: ChartData;
    width: number;
    height: number;
    chartConfig: ChartConfig;
    bezier?: boolean;
    style?: ViewStyle;
    withDots?: boolean;
    withShadow?: boolean;
    withInnerLines?: boolean;
    withOuterLines?: boolean;
    withVerticalLines?: boolean;
    withHorizontalLines?: boolean;
    withVerticalLabels?: boolean;
    withHorizontalLabels?: boolean;
    fromZero?: boolean;
    yAxisInterval?: number;
    yAxisSuffix?: string;
    yAxisLabel?: string;
    segments?: number;
    formatYLabel?: (value: string) => string;
    getDotColor?: (dataPoint: number, datasetIndex: number) => string;
    renderDotContent?: (props: DotContentProps) => JSX.Element | null;
  }

  export const LineChart: ComponentType<LineChartProps>;
} 