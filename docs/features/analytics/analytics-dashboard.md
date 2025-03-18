# Analytics Dashboard

## Overview
The Analytics Dashboard provides users with comprehensive insights into their recycling activities and environmental impact. Through interactive visualizations and detailed metrics, users can track their sustainability progress over time, identify patterns in their recycling behavior, and understand their contribution to environmental conservation efforts. The dashboard serves as a motivational tool that makes abstract environmental benefits tangible and measurable.

## User-Facing Functionality
- **Summary Statistics**: Key metrics displaying total recycling volume, number of collections, and impact metrics
- **Time-Based Analysis**: Trends visualization across different time periods (day, week, month, year)
- **Material Breakdown**: Distribution of recycled materials by type and weight
- **Environmental Impact Metrics**: Conversion of recycling activities into environmental impact (CO₂ saved, water conserved, etc.)
- **Goal Tracking**: Progress visualization for personal recycling goals
- **Comparative Analysis**: User performance compared to personal history and community averages
- **Performance Metrics**: App usage statistics and collection efficiency metrics
- **Exportable Reports**: Ability to download or share dashboard data and visualizations

## Technical Implementation

### Architecture
- **Design Pattern(s)**: Strategy Pattern for different metric calculations, Observer Pattern for real-time updates
- **Key Components**: 
  - `AnalyticsService`: Core service for data aggregation and calculations
  - `ChartComponents`: Reusable visualization components for different metrics
  - `MetricsProvider`: Context provider for analytics data
  - `TimeRangeSelector`: Component for time period selection
- **Dependencies**: 
  - React Native Chart Kit for data visualization
  - Async Storage for local metrics caching
  - React Native Share for report sharing
  - Date-fns for time manipulation

### Code Structure
```typescript
// Analytics metrics types
interface AnalyticsData {
  timeRange: TimeRange;
  summary: SummaryMetrics;
  trends: TrendData;
  materials: MaterialData[];
  impact: EnvironmentalImpact;
  goals: GoalProgress[];
  performance: PerformanceMetrics;
}

// Summary metrics
interface SummaryMetrics {
  totalCollections: number;
  totalWeight: number; // in kg
  uniqueMaterials: number;
  averageCollectionSize: number; // in kg
}

// Trend data over time
interface TrendData {
  labels: string[]; // Time period labels
  datasets: {
    label: string;
    data: number[];
    color?: string;
  }[];
}

// Material breakdown
interface MaterialData {
  id: string;
  name: string;
  weight: number;
  percentage: number;
  color: string;
}

// Environmental impact metrics
interface EnvironmentalImpact {
  co2Saved: number; // in kg
  waterSaved: number; // in liters
  energySaved: number; // in kWh
  treesEquivalent: number;
  landfillReduced: number; // in m³
}

// Goal progress tracking
interface GoalProgress {
  id: string;
  name: string;
  target: number;
  current: number;
  unit: string;
  percentage: number;
  deadline?: Date;
}

// Performance metrics
interface PerformanceMetrics {
  averageResponseTime: number; // in ms
  successRate: number; // percentage
  appCrashRate: number; // percentage
  networkErrorRate: number; // percentage
  batteryUsage: number; // percentage
}

// Time range options
type TimeRange = 'day' | 'week' | 'month' | 'year' | 'all';

// Example implementation of the analytics service
class AnalyticsService {
  private static instance: AnalyticsService;
  private cache: Map<string, { data: AnalyticsData; timestamp: number }> = new Map();
  private readonly CACHE_EXPIRY = 15 * 60 * 1000; // 15 minutes in milliseconds
  
  private constructor() {}
  
  static getInstance(): AnalyticsService {
    if (!AnalyticsService.instance) {
      AnalyticsService.instance = new AnalyticsService();
    }
    return AnalyticsService.instance;
  }
  
  async getAnalyticsData(userId: string, timeRange: TimeRange): Promise<AnalyticsData> {
    const cacheKey = `${userId}:${timeRange}`;
    const cachedData = this.cache.get(cacheKey);
    
    // Return cached data if it exists and is not expired
    if (cachedData && (Date.now() - cachedData.timestamp < this.CACHE_EXPIRY)) {
      return cachedData.data;
    }
    
    try {
      // Fetch raw collection data
      const collectionData = await this.fetchUserCollectionData(userId, timeRange);
      
      // Calculate metrics
      const summary = this.calculateSummaryMetrics(collectionData);
      const trends = this.calculateTrends(collectionData, timeRange);
      const materials = this.calculateMaterialBreakdown(collectionData);
      const impact = this.calculateEnvironmentalImpact(collectionData);
      const goals = await this.fetchGoalProgress(userId);
      const performance = await this.fetchPerformanceMetrics();
      
      // Combine into analytics data object
      const analyticsData: AnalyticsData = {
        timeRange,
        summary,
        trends,
        materials,
        impact,
        goals,
        performance
      };
      
      // Cache the results
      this.cache.set(cacheKey, {
        data: analyticsData,
        timestamp: Date.now()
      });
      
      return analyticsData;
    } catch (error) {
      console.error('Error fetching analytics data:', error);
      throw new Error('Failed to fetch analytics data');
    }
  }
  
  async generateReport(userId: string, timeRange: TimeRange): Promise<string> {
    try {
      // Get analytics data
      const analyticsData = await this.getAnalyticsData(userId, timeRange);
      
      // Generate report in desired format (e.g., PDF, CSV)
      const reportUrl = await ReportGenerator.generatePDF(analyticsData);
      
      // Log report generation
      await this.logReportGeneration(userId, timeRange);
      
      return reportUrl;
    } catch (error) {
      console.error('Error generating report:', error);
      throw new Error('Failed to generate report');
    }
  }
  
  // Helper methods omitted for brevity
  private async fetchUserCollectionData(userId: string, timeRange: TimeRange): Promise<any[]> { /* ... */ }
  private calculateSummaryMetrics(collectionData: any[]): SummaryMetrics { /* ... */ }
  private calculateTrends(collectionData: any[], timeRange: TimeRange): TrendData { /* ... */ }
  private calculateMaterialBreakdown(collectionData: any[]): MaterialData[] { /* ... */ }
  private calculateEnvironmentalImpact(collectionData: any[]): EnvironmentalImpact { /* ... */ }
  private async fetchGoalProgress(userId: string): Promise<GoalProgress[]> { /* ... */ }
  private async fetchPerformanceMetrics(): Promise<PerformanceMetrics> { /* ... */ }
  private async logReportGeneration(userId: string, timeRange: TimeRange): Promise<void> { /* ... */ }
}

// Usage example
function AnalyticsDashboardScreen() {
  const [timeRange, setTimeRange] = useState<TimeRange>('month');
  const [analyticsData, setAnalyticsData] = useState<AnalyticsData | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const userId = useSelector(state => state.auth.user.id);
  
  useEffect(() => {
    fetchAnalyticsData();
  }, [timeRange]);
  
  const fetchAnalyticsData = async () => {
    setIsLoading(true);
    try {
      const analyticsService = AnalyticsService.getInstance();
      const data = await analyticsService.getAnalyticsData(userId, timeRange);
      setAnalyticsData(data);
    } catch (error) {
      console.error('Error fetching analytics data:', error);
      // Show error message to user
    } finally {
      setIsLoading(false);
    }
  };
  
  const handleShareReport = async () => {
    try {
      setIsLoading(true);
      const analyticsService = AnalyticsService.getInstance();
      const reportUrl = await analyticsService.generateReport(userId, timeRange);
      
      // Share the report
      await Share.open({
        url: reportUrl,
        title: `EcoCart Recycling Report - ${timeRange}`,
        message: 'Check out my recycling impact!'
      });
    } catch (error) {
      console.error('Error sharing report:', error);
      // Show error message to user
    } finally {
      setIsLoading(false);
    }
  };
  
  // Render dashboard components with analyticsData
  return (
    <ScrollView>
      {isLoading ? (
        <ActivityIndicator size="large" />
      ) : analyticsData ? (
        <>
          <TimeRangeSelector value={timeRange} onChange={setTimeRange} />
          
          <SummaryCards data={analyticsData.summary} />
          
          <ChartSection title="Recycling Trends">
            <LineChart data={analyticsData.trends} />
          </ChartSection>
          
          <ChartSection title="Material Breakdown">
            <PieChart data={analyticsData.materials} />
          </ChartSection>
          
          <ImpactCards data={analyticsData.impact} />
          
          <GoalProgressSection data={analyticsData.goals} />
          
          <PerformanceMetricsSection data={analyticsData.performance} />
          
          <Button title="Share Report" onPress={handleShareReport} />
        </>
      ) : (
        <Text>No data available</Text>
      )}
    </ScrollView>
  );
}
```

### Key Files
- `src/services/AnalyticsService.ts`: Service for analytics data processing
- `src/components/analytics/ChartComponents.tsx`: Reusable chart components
- `src/components/analytics/SummaryCards.tsx`: Dashboard summary metrics
- `src/components/analytics/ImpactVisualization.tsx`: Environmental impact visualizations
- `src/screens/AnalyticsDashboardScreen.tsx`: Main analytics dashboard screen

## Integration Points
- **Related Features**: 
  - Environmental impact sharing
  - Goal setting and tracking
  - Community challenges
- **API Endpoints**: 
  - `GET /api/users/{id}/collections`: Retrieves user's collection data
  - `GET /api/users/{id}/impact`: Retrieves environmental impact data
  - `GET /api/users/{id}/goals`: Retrieves user's goal progress
- **State Management**: 
  - Redux slice for analytics data
  - Context API for sharing analytics across components
  - Local caching for performance optimization

## Performance Considerations
- **Optimization Techniques**: 
  - Data caching to reduce API calls
  - Lazy loading of chart components
  - Pagination for historical data
- **Potential Bottlenecks**: 
  - Chart rendering with large datasets
  - Complex calculations for impact metrics
  - Report generation for long time periods
- **Battery/Resource Impact**: 
  - Reduced refresh frequency when battery is low
  - Optimized SVG rendering for charts
  - Efficient data structures to minimize memory usage

## Testing Strategy
- **Unit Tests**: 
  - Metric calculation accuracy
  - Time range filtering logic
  - Chart data formatting
- **Integration Tests**: 
  - Data flow from services to UI components
  - Time range selection and updates
  - Report generation and sharing
- **Mock Data**: 
  - Sample collection datasets of various sizes
  - Edge cases for material distributions
  - Multiple time periods for trend analysis

## Accessibility
- **Keyboard Navigation**: 
  - Tab focus for interactive chart elements
  - Keyboard shortcuts for time range switching
  - Accessible controls for all interactive elements
- **Screen Reader Compatibility**: 
  - Descriptive text alternatives for charts
  - ARIA labels for dashboard components
  - Announcements for data loading states
- **Color Contrast**: 
  - High-contrast chart colors with patterns
  - Text overlay with sufficient contrast
  - Accessibility settings for color-blind users

## Future Improvements
- Implement predictive analytics for recycling habits
- Add custom report templates and configurations
- Create comparative analytics with similar households
- Develop advanced filtering by material type or collection method
- Integrate with smart home devices for real-time monitoring

## Related Documentation
- [Environmental Impact Sharing](../community/environmental-impact-sharing.md)
- [User Profiles and Achievements](../community/user-profiles-achievements.md)
- [Community Challenges](../community/community-challenges.md) 