declare module 'victory-native' {
  
  export interface VictoryChartProps {
    theme?: any;
    width?: number;
    height?: number;
    children?: React.ReactNode;
  }

  export interface VictoryAxisProps {
    tickFormat?: (t: any) => string;
    label?: string;
    dependentAxis?: boolean;
    axisLabelComponent?: React.ReactElement;
  }

  export interface VictoryPieProps {
    data: Array<{
      x: string;
      y: number;
      label?: string;
    }>;
    width?: number;
    height?: number;
    colorScale?: string[];
    labels?: (props: { datum: { x: string; y: number } }) => string;
  }

  export interface VictoryBarProps {
    data: Array<{
      x: string;
      y: number;
    }>;
    style?: {
      data?: {
        fill?: string;
      };
    };
  }

  export interface VictoryLineProps {
    data: Array<{
      x: number;
      y: number;
    }>;
    style?: {
      data?: {
        stroke?: string;
      };
    };
  }

  export const VictoryChart: React.FC<VictoryChartProps>;
  export const VictoryAxis: React.FC<VictoryAxisProps>;
  export const VictoryPie: React.FC<VictoryPieProps>;
  export const VictoryBar: React.FC<VictoryBarProps>;
  export const VictoryLine: React.FC<VictoryLineProps>;
  export const VictoryTooltip: React.FC<any>;
  export const VictoryTheme: any;
} 