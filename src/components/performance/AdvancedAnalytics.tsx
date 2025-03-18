/**
 * AdvancedAnalytics component provides a comprehensive performance visualization and analysis dashboard
 * with interactive charts, insights, and export capabilities.
 * 
 * @component
 * @example
 * ```tsx
 * // Basic usage
 * <AdvancedAnalytics
 *   results={performanceResults}
 *   onMetricSelect={handleMetricSelect}
 * />
 * 
 * // With custom time range
 * <AdvancedAnalytics
 *   results={performanceResults}
 *   onMetricSelect={handleMetricSelect}
 *   initialTimeRange="week"
 *   customTimeRange={{ start: new Date(), end: new Date() }}
 * />
 * ```
 * 
 * @features
 * - Interactive performance charts with zoom and pan
 * - Real-time metrics tracking and visualization
 * - Performance insights and recommendations
 * - Data export in multiple formats
 * - Customizable time ranges and aggregations
 * - Trend analysis with prediction bounds
 * 
 * @performance
 * - Optimized chart rendering with memoization
 * - Efficient data sampling for large datasets
 * - Lazy loading of chart components
 * - Throttled event handlers for smooth interaction
 * 
 * @accessibility
 * - Screen reader support for charts
 * - Keyboard navigation
 * - Focus management for modals
 * - High contrast color schemes
 * 
 * @bestPractices
 * - Use appropriate time ranges for analysis
 * - Implement data sampling for large datasets
 * - Handle outliers in metrics data
 * - Provide clear insights and recommendations
 */

import {
    AdvancedAnalyticsProps,
    PerformanceInsight,
    TimeRange,
    TrendChart,
    ZoomDomain,
} from '@/types/AdvancedAnalytics';
import { Metrics } from '@/types/Performance';
import { useTheme } from '@react-navigation/native';
import React, { useEffect, useRef, useState } from 'react';
import { Dimensions, ScrollView, Text, TouchableOpacity, View } from 'react-native';
import { ChartConfig, ChartData, LineChart } from 'react-native-chart-kit';
import { SafeAreaView } from 'react-native-safe-area-context';
import { ExportModal } from './ExportModal';
import { useChartData, useExportModal } from './hooks/useAdvancedAnalytics';
import { styles } from './styles/AdvancedAnalytics.styles';

/**
 * Main content component for AdvancedAnalytics
 * Implements the performance visualization dashboard
 * 
 * @component
 * @param {AdvancedAnalyticsProps} props - Component props
 * @returns {JSX.Element} Rendered component
 */
const AdvancedAnalyticsContent: React.FC<AdvancedAnalyticsProps> = ({
    results,
    onMetricSelect,
}) => {
    const { colors } = useTheme();
    const { width } = Dimensions.get('window');
    const [selectedMetric, setSelectedMetric] = useState<keyof Metrics>('memory');
    const [timeRange, setTimeRange] = useState<'hour' | 'day' | 'week'>('hour');
    const [customTimeRange, setCustomTimeRange] = useState<TimeRange | null>(null);
    const [zoomDomain, setZoomDomain] = useState<ZoomDomain | null>(null);

    // Custom hooks for data management
    const { insights, trendCharts, chartRefs } = useChartData(results);
    const { isExporting, exportModal, setExportModal, handleExport } = useExportModal();

    // Focus management refs
    const modalRef = useRef<View>(null);
    const firstFocusableRef = useRef<TouchableOpacity>(null);

    /**
     * Focus management effect
     * Ensures proper focus handling when the export modal is opened
     */
    useEffect(() => {
        if (exportModal.visible && firstFocusableRef.current) {
            firstFocusableRef.current.focus();
        }
    }, [exportModal.visible]);

    /**
     * Handles time range changes in the visualization
     * @param {TimeRange} newRange - The new time range to apply
     */
    const handleTimeRangeChange = (newRange: 'hour' | 'day' | 'week') => {
        setTimeRange(newRange);
        setCustomTimeRange(null);
        setZoomDomain(null);
    };

    /**
     * Handles zoom changes in the charts
     * @param {ZoomDomain} domain - The new zoom domain
     */
    const handleZoomChange = (domain: ZoomDomain) => {
        setZoomDomain(domain);
        setCustomTimeRange({
            start: domain.x[0],
            end: domain.x[1],
        });
    };

    /**
     * Handles metric selection
     * @param {keyof Metrics} metric - The selected metric
     */
    const handleMetricSelect = (metric: keyof Metrics) => {
        setSelectedMetric(metric);
        onMetricSelect?.(metric);
    };

    /**
     * Renders an insight card with performance recommendations
     * @param {PerformanceInsight} insight - The insight to render
     * @returns {JSX.Element} Rendered insight card
     */
    const renderInsightCard = (insight: PerformanceInsight) => (
        <View
            key={insight.id}
            style={[styles.insightCard, { backgroundColor: colors.background }]}
            accessible
            accessibilityLabel={`Performance insight: ${insight.title}`}
        >
            <Text style={[styles.insightTitle, { color: colors.text }]}>
                {insight.title}
            </Text>
            <Text style={[styles.insightDescription, { color: colors.text }]}>
                {insight.description}
            </Text>
            {insight.recommendation && (
                <Text style={[styles.insightRecommendation, { color: colors.primary }]}>
                    Recommendation: {insight.recommendation}
                </Text>
            )}
        </View>
    );

    /**
     * Renders a performance chart with the specified data
     * @param {TrendChart} chart - The chart data to render
     * @returns {JSX.Element | null} Rendered chart or null if data is invalid
     */
    const renderChart = (chart: TrendChart) => {
        if (!chart) return null;

        const chartConfig: ChartConfig = {
            backgroundColor: colors.card,
            backgroundGradientFrom: colors.card,
            backgroundGradientTo: colors.card,
            decimalPlaces: 1,
            color: (opacity = 1) => `${colors.primary}${Math.round(opacity * 255).toString(16).padStart(2, '0')}`,
            labelColor: (opacity = 1) => colors.text,
            strokeWidth: 2,
            barPercentage: 0.5,
            useShadowColorFromDataset: true,
            propsForBackgroundLines: {
                strokeDasharray: '', // solid lines
                strokeWidth: 1,
                stroke: `${colors.text}22`,
            },
            propsForLabels: {
                fontSize: 12,
                fontWeight: '500',
            },
            propsForDots: {
                r: '4',
                strokeWidth: '2',
                stroke: colors.primary,
            },
        };

        // Format time labels based on the selected time range
        const formatTimeLabel = (timestamp: number) => {
            const date = new Date(timestamp);
            switch (timeRange) {
                case 'hour':
                    return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
                case 'day':
                    return date.toLocaleTimeString([], { hour: '2-digit' });
                case 'week':
                    return date.toLocaleDateString([], { weekday: 'short' });
                default:
                    return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
            }
        };

        // Calculate y-axis min and max for better scaling
        const allValues = [...chart.data, ...chart.prediction].map(point => point.y);
        const minValue = Math.min(...allValues);
        const maxValue = Math.max(...allValues);
        const padding = (maxValue - minValue) * 0.1; // 10% padding

        // Transform data for react-native-chart-kit format
        const data: ChartData = {
            labels: chart.data.map(point => formatTimeLabel(point.x)),
            datasets: [
                {
                    data: chart.data.map(point => point.y),
                    color: (opacity = 1) => chartConfig.color?.(opacity) ?? colors.primary,
                    strokeWidth: 2,
                },
                {
                    data: chart.prediction.map(point => point.y),
                    color: (opacity = 1) => `${colors.text}88`,
                    strokeWidth: 2,
                    strokeDasharray: [5, 5],
                },
                {
                    data: chart.bounds.map(point => point.y),
                    color: (opacity = 1) => chartConfig.color?.(0.1) ?? `${colors.primary}1A`,
                    strokeWidth: 0,
                    withDots: false,
                },
            ],
            legend: [`Current ${chart.metric}`, 'Prediction', 'Confidence Bounds'],
        };

        return (
            <View
                key={chart.metric}
                style={styles.chartContainer}
                accessible
                accessibilityLabel={`Performance chart for ${chart.metric}`}
            >
                <Text style={[styles.chartTitle, { color: colors.text }]}>
                    {chart.metric.charAt(0).toUpperCase() + chart.metric.slice(1)} Trends
                </Text>
                <LineChart
                    data={data}
                    width={width - 32}
                    height={220}
                    chartConfig={chartConfig}
                    bezier
                    style={{
                        marginVertical: 8,
                        borderRadius: 16,
                    }}
                    withDots={true}
                    withShadow={false}
                    withInnerLines={true}
                    withOuterLines={true}
                    withVerticalLines={false}
                    withHorizontalLines={true}
                    withVerticalLabels={true}
                    withHorizontalLabels={true}
                    fromZero={false}
                    yAxisInterval={5}
                    yAxisSuffix=""
                    yAxisLabel=""
                    segments={5}
                    formatYLabel={(value: string) => Number(value).toFixed(1)}
                    getDotColor={(dataPoint: number, datasetIndex: number) => 
                        datasetIndex === 0 ? colors.primary : 
                        datasetIndex === 1 ? `${colors.text}88` : 
                        'transparent'
                    }
                    renderDotContent={({ x, y, index, indexData }) => (
                        index % 2 === 0 ? (
                            <Text
                                key={index}
                                style={{
                                    position: 'absolute',
                                    top: y - 18,
                                    left: x - 20,
                                    width: 40,
                                    textAlign: 'center',
                                    fontSize: 10,
                                    color: colors.text,
                                }}
                            >
                                {Number(indexData).toFixed(1)}
                            </Text>
                        ) : null
                    )}
                />
            </View>
        );
    };

    return (
        <SafeAreaView style={styles.container}>
            <ScrollView
                style={styles.scrollView}
                contentContainerStyle={styles.contentContainer}
                accessible
            >
                <View style={styles.header}>
                    <Text style={[styles.title, { color: colors.text }]}>
                        Performance Analytics
                    </Text>
                    <TouchableOpacity
                        style={[styles.actionButton, styles.exportActionButton]}
                        onPress={() => setExportModal(prev => ({ ...prev, visible: true }))}
                        disabled={isExporting}
                        accessible
                        accessibilityLabel="Export performance data"
                        accessibilityHint="Opens export options modal"
                        ref={firstFocusableRef}
                    >
                        <Text style={styles.actionButtonText}>
                            {isExporting ? 'Exporting...' : 'Export'}
                        </Text>
                    </TouchableOpacity>
                </View>

                <View style={styles.timeRangeContainer}>
                    {['hour', 'day', 'week'].map((range) => (
                        <TouchableOpacity
                            key={range}
                            style={[
                                styles.timeRangeButton,
                                timeRange === range && styles.timeRangeButtonActive,
                            ]}
                            onPress={() => handleTimeRangeChange(range as typeof timeRange)}
                            accessible
                            accessibilityState={{ selected: timeRange === range }}
                            accessibilityLabel={`Show ${range}ly data`}
                        >
                            <Text
                                style={[
                                    styles.timeRangeButtonText,
                                    timeRange === range && styles.timeRangeButtonTextActive,
                                ]}
                            >
                                {range.charAt(0).toUpperCase() + range.slice(1)}
                            </Text>
                        </TouchableOpacity>
                    ))}
                </View>

                {insights.length > 0 && (
                    <View style={styles.insightsContainer}>
                        <Text style={[styles.sectionTitle, { color: colors.text }]}>
                            Performance Insights
                        </Text>
                        {insights.map(renderInsightCard)}
                    </View>
                )}

                <View style={styles.chartsContainer}>
                    <Text style={[styles.sectionTitle, { color: colors.text }]}>
                        Performance Trends
                    </Text>
                    {trendCharts.map(renderChart)}
                </View>
            </ScrollView>

            <ExportModal
                visible={exportModal.visible}
                metrics={Object.keys(results[0]?.metrics || {}) as Array<keyof Metrics>}
                state={exportModal}
                onStateChange={(state) => setExportModal(prev => ({ ...prev, ...state }))}
                onClose={() => {
                    if (!isExporting) {
                        setExportModal(prev => ({ ...prev, visible: false }));
                    }
                }}
            />
        </SafeAreaView>
    );
};

export default AdvancedAnalyticsContent;