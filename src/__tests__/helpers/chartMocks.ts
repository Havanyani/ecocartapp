interface ChartData {
  labels: string[];
  datasets: Array<{
    data: number[];
    color?: (opacity: number) => string;
  }>;
}

interface ChartConfig {
  data: ChartData;
  options?: {
    scales?: {
      y?: {
        beginAtZero?: boolean;
        ticks?: {
          stepSize?: number;
        };
      };
    };
  };
}

export const mockLineChartData: ChartData = {
  labels: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun'],
  datasets: [
    {
      data: [20, 45, 28, 80, 99, 43],
      color: (opacity: number) => `rgba(134, 65, 244, ${opacity})`
    }
  ]
};

export const mockBarChartData: ChartData = {
  labels: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'],
  datasets: [
    {
      data: [20, 45, 28, 80, 99, 43, 50],
      color: (opacity: number) => `rgba(46, 204, 113, ${opacity})`
    }
  ]
};

export const mockPieChartData: ChartData = {
  labels: ['Plastic', 'Paper', 'Metal', 'Glass'],
  datasets: [
    {
      data: [35, 25, 20, 20],
      color: (opacity: number) => `rgba(52, 152, 219, ${opacity})`
    }
  ]
};

export const mockChartConfig: ChartConfig = {
  data: mockLineChartData,
  options: {
    scales: {
      y: {
        beginAtZero: true,
        ticks: {
          stepSize: 20
        }
      }
    }
  }
}; 