# EcoCart Analytics & Reporting Guide

## Overview

This guide documents the analytics and reporting capabilities implemented in the EcoCart application. Effective analytics allows users to track their recycling progress, understand environmental impact, and set meaningful goals. It also enables the organization to make data-driven decisions about app features and user engagement. This document outlines the architecture, components, and best practices for the analytics and reporting system.

## Table of Contents

1. [Analytics Dashboard](#analytics-dashboard)
2. [Export Functionality](#export-functionality)
3. [Goal Setting & Progress Tracking](#goal-setting--progress-tracking)
4. [Historical Data Visualization](#historical-data-visualization)
5. [Admin Reporting Tools](#admin-reporting-tools)
6. [Data Collection & Privacy](#data-collection--privacy)
7. [Best Practices](#best-practices)

## Analytics Dashboard

### Architecture

The analytics dashboard provides users with a consolidated view of their recycling activities and impact:

```
┌─────────────────┐      ┌────────────────┐       ┌─────────────────┐
│                 │      │                │       │                 │
│  Collection     ├─────►│  Analytics     ├──────►│  Dashboard      │
│  Data           │      │  Processor     │       │  Components     │
│                 │      │                │       │                 │
└─────────────────┘      └────────────────┘       └─────────────────┘
                                │                         │
                                │                         │
                                ▼                         ▼
┌─────────────────┐      ┌────────────────┐       ┌─────────────────┐
│                 │      │                │       │                 │
│  User           │      │  Aggregation   │       │  Visualization  │
│  Preferences    │      │  & Analysis    │       │  Rendering      │
│                 │      │                │       │                 │
└─────────────────┘      └────────────────┘       └─────────────────┘
```

### Key Components

- **AnalyticsService** (`src/services/AnalyticsService.ts`): Processes and aggregates collection data
- **AnalyticsDashboard** (`src/screens/analytics/AnalyticsDashboard.tsx`): Main user-facing analytics screen
- **AnalyticsChart** (`src/components/analytics/AnalyticsChart.tsx`): Renders visualizations
- **StatisticCard** (`src/components/analytics/StatisticCard.tsx`): Displays individual metrics

### Dashboard Sections

The dashboard is organized into focused sections:

1. **Summary Statistics**
   - Total weight collected
   - Total collections completed
   - Total environmental impact
   - Credits earned

2. **Time-Based Analysis**
   - Weekly activity
   - Monthly trends
   - Year-over-year comparison
   - Collection frequency

3. **Material Breakdown**
   - Material type distribution
   - Material category comparison
   - Most frequently recycled items
   - Improvement opportunities

4. **Impact Metrics**
   - CO₂ emissions avoided
   - Water conservation equivalent
   - Energy saved
   - Trees equivalent

### Implementation

```typescript
// Example analytics dashboard
import { useAnalytics } from '../hooks/useAnalytics';
import { useUser } from '../hooks/useUser';
import { useCollections } from '../hooks/useCollections';

function AnalyticsDashboard() {
  const { user } = useUser();
  const { collections } = useCollections(user.id);
  const { 
    summaryMetrics,
    timeSeriesData,
    materialBreakdown,
    impactMetrics,
    isLoading
  } = useAnalytics(collections);
  
  if (isLoading) {
    return <AnalyticsDashboardSkeleton />;
  }
  
  return (
    <ScrollView style={styles.container}>
      <Text style={styles.title}>Your Recycling Impact</Text>
      
      {/* Summary Statistics Section */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Summary</Text>
        <View style={styles.statsGrid}>
          <StatisticCard
            title="Total Recycled"
            value={`${summaryMetrics.totalWeight} kg`}
            icon="scale"
            trend={summaryMetrics.weightTrend}
          />
          
          <StatisticCard
            title="Collections"
            value={summaryMetrics.totalCollections}
            icon="truck"
            trend={summaryMetrics.collectionsTrend}
          />
          
          <StatisticCard
            title="Impact"
            value={`${summaryMetrics.totalImpact} kg CO₂`}
            icon="leaf"
            trend={summaryMetrics.impactTrend}
          />
          
          <StatisticCard
            title="Credits"
            value={summaryMetrics.totalCredits}
            icon="coin"
            trend={summaryMetrics.creditsTrend}
          />
        </View>
      </View>
      
      {/* Time Series Analysis */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Activity Over Time</Text>
        <TimeSeriesChart data={timeSeriesData} />
        <TimeRangeSelector 
          onRangeChange={handleRangeChange} 
          currentRange={selectedRange}
        />
      </View>
      
      {/* Material Breakdown */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Material Breakdown</Text>
        <MaterialDistributionChart data={materialBreakdown} />
        <MaterialTypeList 
          materials={materialBreakdown} 
          onSelectMaterial={handleMaterialSelect}
        />
      </View>
      
      {/* Environmental Impact */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Environmental Impact</Text>
        <ImpactVisualization metrics={impactMetrics} />
      </View>
    </ScrollView>
  );
}
```

## Export Functionality

### Architecture

Export functionality allows users to save and share their recycling data:

```
┌─────────────────┐      ┌────────────────┐       ┌─────────────────┐
│                 │      │                │       │                 │
│  User Data      ├─────►│  Export        ├──────►│  Format         │
│  Selection      │      │  Processor     │       │  Conversion     │
│                 │      │                │       │                 │
└─────────────────┘      └────────────────┘       └─────────────────┘
                                                          │
                                                          ▼
┌─────────────────┐      ┌────────────────┐       ┌─────────────────┐
│                 │      │                │       │                 │
│  Sharing        │◄─────┤  File          │◄──────┤  Report         │
│  Options        │      │  Generation    │       │  Customization  │
│                 │      │                │       │                 │
└─────────────────┘      └────────────────┘       └─────────────────┘
```

### Export Formats

Multiple export formats support different use cases:

1. **PDF Reports**
   - Formatted, printer-friendly reports
   - Includes visualizations and analysis
   - Customizable sections

2. **CSV Data**
   - Raw data for spreadsheet analysis
   - Complete collection history
   - Material details and weights

3. **Image Sharing**
   - Shareable graphics for social media
   - Impact visualizations
   - Achievement summaries

4. **Calendar Integration**
   - Collection schedule export
   - iCal format for calendar apps
   - Reminders and alerts

### Implementation

```typescript
// Example export service
class ExportService {
  // Generate PDF report
  async generatePDFReport(userId: string, dateRange: DateRange): Promise<string> {
    // Get user collections within date range
    const collections = await this.getCollectionsForExport(userId, dateRange);
    
    // Generate formatted PDF
    const html = this.generateReportHTML(collections);
    const pdfOptions = {
      html,
      fileName: `ecocart-report-${formatDate(dateRange.from)}-${formatDate(dateRange.to)}`,
      directory: 'Documents',
    };
    
    // Create PDF file
    const { filePath } = await RNHTMLtoPDF.convert(pdfOptions);
    return filePath;
  }
  
  // Export to CSV
  async exportToCSV(userId: string, dateRange: DateRange): Promise<string> {
    // Get user collections within date range
    const collections = await this.getCollectionsForExport(userId, dateRange);
    
    // Convert to CSV format
    const csvData = this.convertToCSV(collections);
    
    // Write to file
    const path = `${RNFS.DocumentDirectoryPath}/ecocart-data-${formatDate(dateRange.from)}-${formatDate(dateRange.to)}.csv`;
    await RNFS.writeFile(path, csvData, 'utf8');
    
    return path;
  }
  
  // Generate shareable image
  async generateShareableImage(userId: string, metric: string): Promise<string> {
    // Implementation details...
  }
  
  // Export to calendar
  async exportScheduleToCalendar(userId: string, scheduledCollections: ScheduledCollection[]): Promise<boolean> {
    // Implementation details...
  }
  
  // Helper methods...
}

// Example export screen
function ExportDataScreen() {
  const { user } = useUser();
  const exportService = new ExportService();
  const [dateRange, setDateRange] = useState(getDefaultDateRange());
  const [isExporting, setIsExporting] = useState(false);
  
  const handleExportPDF = async () => {
    try {
      setIsExporting(true);
      const filePath = await exportService.generatePDFReport(user.id, dateRange);
      
      // Share file
      await Share.open({
        url: `file://${filePath}`,
        type: 'application/pdf',
        title: 'EcoCart Recycling Report'
      });
    } catch (error) {
      // Handle error
    } finally {
      setIsExporting(false);
    }
  };
  
  // Component implementation...
}
```

## Goal Setting & Progress Tracking

### Architecture

Goal-setting features help users establish and achieve recycling targets:

```
┌─────────────────┐      ┌────────────────┐      ┌────────────────┐
│                 │      │                │      │                │
│  Goal           ├─────►│  Goal          ├─────►│  Activity      │
│  Definition     │      │  Storage       │      │  Tracking      │
│                 │      │                │      │                │
└─────────────────┘      └────────────────┘      └────────────────┘
                                                        │
                                                        ▼
┌─────────────────┐      ┌────────────────┐      ┌────────────────┐
│                 │      │                │      │                │
│  Achievement    │◄─────┤  Progress      │◄─────┤  Progress      │
│  Recognition    │      │  Calculation   │      │  Updates       │
│                 │      │                │      │                │
└─────────────────┘      └────────────────┘      └────────────────┘
```

### Goal Types

Various goal types accommodate different user motivations:

1. **Weight-Based Goals**
   - Total kilograms recycled
   - Specific material targets
   - Progressive weight increases

2. **Frequency Goals**
   - Collection count targets
   - Regular schedule adherence
   - Streak-based goals

3. **Impact Goals**
   - CO₂ reduction targets
   - Equivalent impact metrics
   - Community contribution goals

4. **Habit-Building Goals**
   - Consistent weekly recycling
   - Diverse material recycling
   - Educational achievements

### Implementation

```typescript
// Goal types and interfaces
enum GoalType {
  WEIGHT = 'weight',
  FREQUENCY = 'frequency',
  IMPACT = 'impact',
  HABIT = 'habit'
}

enum GoalPeriod {
  WEEKLY = 'weekly',
  MONTHLY = 'monthly',
  QUARTERLY = 'quarterly',
  YEARLY = 'yearly',
  CUSTOM = 'custom'
}

interface Goal {
  id: string;
  userId: string;
  title: string;
  description?: string;
  type: GoalType;
  target: number;
  unit: string;
  startDate: Date;
  endDate: Date;
  period: GoalPeriod;
  progress: number;
  isCompleted: boolean;
  completedDate?: Date;
  materialType?: string;
}

// Example goal service
class GoalService {
  // Create a new goal
  async createGoal(goalData: Omit<Goal, 'id' | 'progress' | 'isCompleted'>): Promise<Goal> {
    // Implementation details...
  }
  
  // Get user goals
  async getUserGoals(userId: string, status?: 'active' | 'completed' | 'all'): Promise<Goal[]> {
    // Implementation details...
  }
  
  // Update goal progress
  async updateGoalProgress(goalId: string, newProgress: number): Promise<Goal> {
    // Implementation details...
  }
  
  // Track collection for goals
  async trackCollectionForGoals(userId: string, collection: Collection): Promise<void> {
    // Get user's active goals
    const activeGoals = await this.getUserGoals(userId, 'active');
    
    // Update progress for each applicable goal
    for (const goal of activeGoals) {
      // Check if collection applies to this goal
      if (this.collectionAppliesToGoal(collection, goal)) {
        // Calculate new progress
        const progressIncrement = this.calculateProgressIncrement(collection, goal);
        const newProgress = Math.min(goal.progress + progressIncrement, goal.target);
        
        // Update goal
        await this.updateGoalProgress(goal.id, newProgress);
        
        // Check if goal completed
        if (newProgress >= goal.target) {
          await this.completeGoal(goal.id);
        }
      }
    }
  }
  
  // Helper methods...
}

// Example goal creation component
function GoalCreationForm() {
  const { user } = useUser();
  const goalService = new GoalService();
  const [formData, setFormData] = useState(getInitialFormState());
  
  const handleSubmit = async () => {
    try {
      const newGoal = await goalService.createGoal({
        userId: user.id,
        title: formData.title,
        description: formData.description,
        type: formData.type,
        target: formData.target,
        unit: formData.unit,
        startDate: formData.startDate,
        endDate: formData.endDate,
        period: formData.period,
        materialType: formData.materialType
      });
      
      // Handle successful creation
    } catch (error) {
      // Handle error
    }
  };
  
  // Form implementation...
}
```

## Historical Data Visualization

### Architecture

Historical data visualization provides insights into long-term recycling patterns:

```
┌─────────────────┐      ┌────────────────┐       ┌─────────────────┐
│                 │      │                │       │                 │
│  Collection     ├─────►│  Aggregation   ├──────►│  Dataset        │
│  History        │      │  Engine        │       │  Preparation    │
│                 │      │                │       │                 │
└─────────────────┘      └────────────────┘       └─────────────────┘
                                                          │
                                                          ▼
┌─────────────────┐      ┌────────────────┐       ┌─────────────────┐
│                 │      │                │       │                 │
│  User           │      │  Visualization │◄──────┤  Chart          │
│  Interaction    │─────►│  Controls      │       │  Rendering      │
│                 │      │                │       │                 │
└─────────────────┘      └────────────────┘       └─────────────────┘
```

### Visualization Types

Multiple visualization types provide different insights:

1. **Time Series Charts**
   - Line charts for trends over time
   - Bar charts for periodic comparisons
   - Area charts for cumulative progress

2. **Distribution Charts**
   - Pie charts for material type breakdown
   - Stacked bar charts for category comparison
   - Heat maps for activity patterns

3. **Comparison Visualizations**
   - Radar charts for multi-metric comparison
   - Parallel coordinates for detailed analysis
   - Before/after comparisons

4. **Map-Based Visualizations**
   - Collection location maps
   - Heatmaps of recycling activity
   - Regional impact comparison

### Implementation

```typescript
// Example visualization service
class VisualizationService {
  // Generate time series data
  generateTimeSeriesData(collections: Collection[], timeUnit: 'day' | 'week' | 'month' | 'year'): ChartDataset {
    // Group collections by time unit
    const groupedData = this.groupCollectionsByTimeUnit(collections, timeUnit);
    
    // Format for charting library
    return {
      labels: groupedData.map(group => group.label),
      datasets: [
        {
          label: 'Weight (kg)',
          data: groupedData.map(group => group.totalWeight),
          borderColor: '#34D399',
          backgroundColor: 'rgba(52, 211, 153, 0.2)',
        }
      ]
    };
  }
  
  // Generate material distribution data
  generateMaterialDistribution(collections: Collection[]): ChartDataset {
    // Group collections by material type
    const groupedByMaterial = this.groupCollectionsByMaterial(collections);
    
    // Format for charting library
    return {
      labels: groupedByMaterial.map(group => group.materialType),
      datasets: [
        {
          data: groupedByMaterial.map(group => group.totalWeight),
          backgroundColor: this.getMaterialColors(),
        }
      ]
    };
  }
  
  // Generate comparison data
  generateComparisonData(userCollections: Collection[], averageData: AverageMetrics): ChartDataset {
    // Implementation details...
  }
  
  // Generate map visualization data
  generateMapVisualizationData(collections: Collection[]): GeoJSON.FeatureCollection {
    // Implementation details...
  }
  
  // Helper methods...
}

// Example historical data component
function HistoricalDataView() {
  const { user } = useUser();
  const { collections } = useCollections(user.id);
  const [timeUnit, setTimeUnit] = useState<'day' | 'week' | 'month' | 'year'>('month');
  const [dateRange, setDateRange] = useState(getDefaultDateRange());
  const [chartType, setChartType] = useState<'line' | 'bar' | 'area'>('line');
  const visualizationService = new VisualizationService();
  
  // Filter collections by date range
  const filteredCollections = useMemo(() => {
    return collections.filter(collection => 
      isWithinDateRange(collection.date, dateRange.from, dateRange.to)
    );
  }, [collections, dateRange]);
  
  // Generate chart data
  const chartData = useMemo(() => {
    return visualizationService.generateTimeSeriesData(filteredCollections, timeUnit);
  }, [filteredCollections, timeUnit]);
  
  return (
    <View style={styles.container}>
      <Text style={styles.title}>Recycling History</Text>
      
      <View style={styles.controls}>
        <DateRangePicker
          range={dateRange}
          onRangeChange={setDateRange}
        />
        
        <TimeUnitSelector
          value={timeUnit}
          onChange={setTimeUnit}
        />
        
        <ChartTypeSelector
          value={chartType}
          onChange={setChartType}
        />
      </View>
      
      <View style={styles.chartContainer}>
        <Chart
          type={chartType}
          data={chartData}
          height={300}
        />
      </View>
      
      <CollectionHistoryTable
        collections={filteredCollections}
        onItemPress={handleCollectionPress}
      />
    </View>
  );
}
```

## Admin Reporting Tools

### Architecture

Admin reporting tools provide organizational insights and management capabilities:

```
┌─────────────────┐      ┌────────────────┐      ┌────────────────┐
│                 │      │                │      │                │
│  User & System  ├─────►│  Analytics     ├─────►│  Aggregation   │
│  Data           │      │  Engine        │      │  & Processing  │
│                 │      │                │      │                │
└─────────────────┘      └────────────────┘      └────────────────┘
                                                       │
                                                       ▼
┌─────────────────┐      ┌────────────────┐      ┌────────────────┐
│                 │      │                │      │                │
│  Admin          │◄─────┤  Dashboard     │◄─────┤  Report        │
│  Actions        │      │  Rendering     │      │  Generation    │
│                 │      │                │      │                │
└─────────────────┘      └────────────────┘      └────────────────┘
```

### Admin Dashboard Sections

The admin dashboard includes multiple sections for comprehensive oversight:

1. **User Analytics**
   - User registration trends
   - User retention metrics
   - User engagement levels
   - Demographic information

2. **Collection Metrics**
   - Total weight collected
   - Collection trends
   - Material type breakdown
   - Regional distribution

3. **Operational Insights**
   - Collection efficiency
   - Route optimization opportunities
   - Scheduled vs. completed collections
   - Service level metrics

4. **Business Intelligence**
   - Credit issuance and redemption
   - Cost and revenue analysis
   - Reward performance
   - Growth projections

### Implementation

```typescript
// Example admin analytics service
class AdminAnalyticsService {
  // User analytics
  async getUserAnalytics(dateRange: DateRange): Promise<UserAnalytics> {
    // Implementation details...
  }
  
  // Collection metrics
  async getCollectionMetrics(dateRange: DateRange, filters: MetricFilters = {}): Promise<CollectionMetrics> {
    const collections = await this.getFilteredCollections(dateRange, filters);
    
    return {
      totalWeight: this.calculateTotalWeight(collections),
      totalCount: collections.length,
      averageWeight: this.calculateAverageWeight(collections),
      materialBreakdown: this.generateMaterialBreakdown(collections),
      regionBreakdown: this.generateRegionalBreakdown(collections),
      weightTrend: this.generateTrend(collections, 'weight', dateRange),
      countTrend: this.generateTrend(collections, 'count', dateRange)
    };
  }
  
  // Operational analytics
  async getOperationalAnalytics(dateRange: DateRange): Promise<OperationalAnalytics> {
    // Implementation details...
  }
  
  // Business analytics
  async getBusinessAnalytics(dateRange: DateRange): Promise<BusinessAnalytics> {
    // Implementation details...
  }
  
  // Helper methods...
}

// Example admin dashboard
function AdminDashboard() {
  const adminAnalyticsService = new AdminAnalyticsService();
  const [dateRange, setDateRange] = useState(getDefaultDateRange());
  const [filters, setFilters] = useState<MetricFilters>({});
  const [view, setView] = useState<'users' | 'collections' | 'operations' | 'business'>('collections');
  
  // Load data based on current view
  const {
    data,
    isLoading,
    error,
    refetch
  } = useQuery(
    ['adminAnalytics', view, dateRange, filters],
    () => fetchAnalyticsData(view, dateRange, filters)
  );
  
  const fetchAnalyticsData = async (view: string, dateRange: DateRange, filters: MetricFilters) => {
    switch(view) {
      case 'users':
        return adminAnalyticsService.getUserAnalytics(dateRange);
      case 'collections':
        return adminAnalyticsService.getCollectionMetrics(dateRange, filters);
      case 'operations':
        return adminAnalyticsService.getOperationalAnalytics(dateRange);
      case 'business':
        return adminAnalyticsService.getBusinessAnalytics(dateRange);
      default:
        throw new Error(`Invalid view: ${view}`);
    }
  };
  
  return (
    <View style={styles.container}>
      <AdminHeader title="Analytics Dashboard" />
      
      <View style={styles.controls}>
        <AdminViewSelector
          value={view}
          onChange={setView}
        />
        
        <DateRangePicker
          range={dateRange}
          onRangeChange={setDateRange}
        />
        
        <FilterButton
          onPress={handleFilterPress}
          hasActiveFilters={Object.keys(filters).length > 0}
        />
      </View>
      
      {isLoading ? (
        <AdminDashboardSkeleton />
      ) : error ? (
        <ErrorState
          message="Failed to load analytics"
          onRetry={refetch}
        />
      ) : (
        <AdminAnalyticsView
          view={view}
          data={data}
          onExport={handleExport}
        />
      )}
    </View>
  );
}
```

## Data Collection & Privacy

### Architecture

Data collection balances analytical needs with user privacy:

```
┌─────────────────┐      ┌────────────────┐      ┌────────────────┐
│                 │      │                │      │                │
│  User           ├─────►│  Privacy       ├─────►│  Data          │
│  Activities     │      │  Controls      │      │  Processing    │
│                 │      │                │      │                │
└─────────────────┘      └────────────────┘      └────────────────┘
                                                       │
                                                       ▼
┌─────────────────┐      ┌────────────────┐      ┌────────────────┐
│                 │      │                │      │                │
│  Reporting      │◄─────┤  Storage       │◄─────┤  Anonymization │
│  & Analytics    │      │  & Security    │      │  & Aggregation │
│                 │      │                │      │                │
└─────────────────┘      └────────────────┘      └────────────────┘
```

### Data Collection Principles

Several principles guide the data collection approach:

1. **Minimal Collection**
   - Only collect necessary data
   - Clearly explain data usage
   - Allow granular permissions

2. **Data Security**
   - Encryption in transit and at rest
   - Secure storage practices
   - Regular security audits

3. **User Control**
   - Clear opt-in/opt-out options
   - Download personal data
   - Request data deletion

4. **Anonymization**
   - Remove identifying information for analytics
   - Aggregate data when possible
   - Establish minimum group sizes

### Implementation

```typescript
// Example privacy manager
class PrivacyManager {
  // Check if user has consented to specific data collection
  async hasUserConsented(userId: string, dataType: DataCollectionType): Promise<boolean> {
    const userPreferences = await this.getUserPreferences(userId);
    return userPreferences.dataCollection[dataType] === true;
  }
  
  // Update user consent settings
  async updateUserConsent(userId: string, dataType: DataCollectionType, isConsented: boolean): Promise<void> {
    // Implementation details...
  }
  
  // Anonymize data for analytics
  anonymizeUserData(userData: UserData): AnonymizedUserData {
    return {
      // Remove identifying information
      // Replace with anonymous ID or aggregated data
      anonymousId: this.generateAnonymousId(userData.id),
      region: this.getRegionFromLocation(userData.location),
      ageRange: this.getAgeRange(userData.birthDate),
      // Include non-identifying data
      collectionCount: userData.collections.length,
      totalWeight: this.calculateTotalWeight(userData.collections),
      materialTypes: this.extractMaterialTypes(userData.collections),
      // etc.
    };
  }
  
  // Generate personal data report
  async generatePersonalDataReport(userId: string): Promise<PersonalDataReport> {
    // Implementation details...
  }
  
  // Delete user data
  async deleteUserData(userId: string): Promise<void> {
    // Implementation details...
  }
  
  // Helper methods...
}

// Example privacy settings screen
function PrivacySettingsScreen() {
  const { user } = useUser();
  const privacyManager = new PrivacyManager();
  const [preferences, setPreferences] = useState<UserPrivacyPreferences | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  
  useEffect(() => {
    loadPreferences();
  }, [user.id]);
  
  const loadPreferences = async () => {
    try {
      setIsLoading(true);
      const userPrefs = await privacyManager.getUserPreferences(user.id);
      setPreferences(userPrefs);
    } catch (error) {
      // Handle error
    } finally {
      setIsLoading(false);
    }
  };
  
  const handleToggleConsent = async (dataType: DataCollectionType) => {
    if (!preferences) return;
    
    try {
      const newValue = !preferences.dataCollection[dataType];
      
      // Update UI immediately for responsiveness
      setPreferences({
        ...preferences,
        dataCollection: {
          ...preferences.dataCollection,
          [dataType]: newValue
        }
      });
      
      // Update in backend
      await privacyManager.updateUserConsent(user.id, dataType, newValue);
    } catch (error) {
      // Handle error and revert UI
      // ...
    }
  };
  
  const handleDataDownload = async () => {
    try {
      const report = await privacyManager.generatePersonalDataReport(user.id);
      // Share or download the report
      // ...
    } catch (error) {
      // Handle error
    }
  };
  
  const handleDataDeletion = async () => {
    // Show confirmation dialog
    // ...
    
    try {
      await privacyManager.deleteUserData(user.id);
      // Navigate to confirmation screen or logout
      // ...
    } catch (error) {
      // Handle error
    }
  };
  
  // Component implementation...
}
```

## Best Practices

### Performance Considerations

- **Efficient Data Processing**: Optimize analytics calculations
- **Background Processing**: Perform heavy calculations in background
- **Data Caching**: Cache analytics results to reduce recalculation
- **Progressive Loading**: Load analytics sections progressively
- **Optimize Visualizations**: Use efficient charting libraries and rendering

### UX Guidelines

- **Meaningful Context**: Provide context for metrics and trends
- **Progressive Disclosure**: Show summary data first, details on demand
- **Consistent Units**: Use consistent units and scales across charts
- **Appropriate Visualizations**: Choose the right chart type for each data set
- **Interactive Elements**: Allow exploration through interactive charts

### Mobile-First Analytics

- **Responsive Design**: Ensure analytics work on all screen sizes
- **Touch-Friendly Controls**: Design for touch interaction
- **Minimize Data Usage**: Optimize data transfer for mobile networks
- **Offline Capabilities**: Enable basic analytics while offline
- **Battery Awareness**: Minimize high-CPU operations on mobile

### Data Integrity

- **Consistent Calculation**: Ensure metrics are calculated consistently
- **Data Validation**: Validate input data before analytics processing
- **Version Tracking**: Track analytics calculation versions
- **Audit Trails**: Maintain logs of data processing
- **Error Handling**: Gracefully handle missing or corrupted data

## References

- [Data Visualization Best Practices](https://www.tableau.com/learn/articles/data-visualization-best-practices)
- [Mobile Analytics Design Patterns](https://www.smashingmagazine.com/2018/02/analytics-design-patterns-mobile-web/)
- [Privacy by Design Framework](https://www.ipc.on.ca/wp-content/uploads/resources/7foundationalprinciples.pdf)
- [React Native Chart Libraries](https://reactnative.dev/docs/next/accessibilityinfo) 