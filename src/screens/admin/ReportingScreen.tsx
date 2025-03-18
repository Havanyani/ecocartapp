import { Ionicons } from '@expo/vector-icons';
import React, { useEffect, useState } from 'react';
import { ActivityIndicator, Alert, ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';

// Define interfaces for data structures
interface DateRange {
  start: Date;
  end: Date;
}

interface Report {
  id: string;
  title: string;
  date: string;
  type: string;
}

interface Metrics {
  totalCollections: number;
  totalWeight: number;
  totalCredits: number;
  activeUsers: number;
}

interface ChartDataPoint {
  date: string;
  value: number;
}

interface ReportFormat {
  id: string;
  name: string;
  icon: string;
}

// Mock report data
const mockReports: Report[] = [
  { id: '1', title: 'Monthly Collection Summary', date: '2023-05-01', type: 'pdf' },
  { id: '2', title: 'User Activity Report', date: '2023-04-15', type: 'excel' },
  { id: '3', title: 'Material Distribution Analysis', date: '2023-04-01', type: 'csv' },
];

export function ReportingScreen(): JSX.Element {
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [reports] = useState<Report[]>(mockReports);
  const [dateRange, setDateRange] = useState<DateRange>({
    start: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000), // Last 7 days
    end: new Date(),
  });

  const [metrics, setMetrics] = useState<Metrics>({
    totalCollections: 1234,
    totalWeight: 5678,
    totalCredits: 28390,
    activeUsers: 456,
  });

  const [chartData, setChartData] = useState<ChartDataPoint[]>([
    { date: 'Mon', value: 20 },
    { date: 'Tue', value: 45 },
    { date: 'Wed', value: 28 },
    { date: 'Thu', value: 80 },
    { date: 'Fri', value: 99 },
    { date: 'Sat', value: 43 },
    { date: 'Sun', value: 50 },
  ]);

  // For date picker, we'll use a state to track which date we're editing
  const [isPickingDate, setIsPickingDate] = useState<boolean>(false);
  const [datePickerMode, setDatePickerMode] = useState<'start' | 'end'>('start');

  // List of available report formats
  const reportFormats: ReportFormat[] = [
    { id: 'pdf', name: 'PDF', icon: 'document-text' },
    { id: 'csv', name: 'CSV', icon: 'document' },
    { id: 'excel', name: 'Excel', icon: 'document' },
  ];

  // Fetch report data when date range changes
  useEffect(() => {
    fetchReportData();
  }, [dateRange]);

  const fetchReportData = async (): Promise<void> => {
    try {
      setIsLoading(true);
      
      // Simulate API call delay
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      // Mock data updated based on date range - in a real app, this would make an API call
      const daysBetween = Math.round((dateRange.end.getTime() - dateRange.start.getTime()) / (24 * 60 * 60 * 1000));
      const newChartData: ChartDataPoint[] = [];
      
      // Generate daily data points
      for (let i = 0; i < daysBetween; i++) {
        const date = new Date(dateRange.start);
        date.setDate(date.getDate() + i);
        
        newChartData.push({
          date: date.toLocaleDateString('en-US', { weekday: 'short' }),
          value: Math.floor(Math.random() * 100) + 10, // Random value between 10-110
        });
      }
      
      // Update chart data and metrics
      setChartData(newChartData);
      setMetrics({
        totalCollections: Math.floor(Math.random() * 1000) + 1000,
        totalWeight: Math.floor(Math.random() * 5000) + 3000,
        totalCredits: Math.floor(Math.random() * 20000) + 15000,
        activeUsers: Math.floor(Math.random() * 300) + 300,
      });
    } catch (error) {
      console.error('Error fetching report data:', error);
      Alert.alert('Error', 'Failed to fetch report data. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleDatePickerOpen = (mode: 'start' | 'end'): void => {
    setDatePickerMode(mode);
    setIsPickingDate(true);
    
    // In a real implementation, you'd show a DatePicker here
    // For simplicity, we'll just show an alert with instructions
    Alert.alert(
      'Date Selection',
      `Select a ${mode === 'start' ? 'start' : 'end'} date`,
      [
        { text: 'Cancel', style: 'cancel' },
        { 
          text: 'Select Today', 
          onPress: () => {
            handleDateChange(new Date());
          } 
        },
      ]
    );
  };

  const handleDateChange = (date: Date | undefined): void => {
    if (!date) return;
    
    setIsPickingDate(false);
    
    if (datePickerMode === 'start') {
      // Ensure start date isn't after end date
      if (date > dateRange.end) {
        Alert.alert('Invalid Date', 'Start date cannot be after end date.');
        return;
      }
      setDateRange(prev => ({ ...prev, start: date }));
    } else {
      // Ensure end date isn't before start date
      if (date < dateRange.start) {
        Alert.alert('Invalid Date', 'End date cannot be before start date.');
        return;
      }
      setDateRange(prev => ({ ...prev, end: date }));
    }
  };

  const handleExportReport = (format: string): void => {
    Alert.alert(
      'Export Report',
      `Report will be exported in ${format.toUpperCase()} format.`,
      [{ text: 'OK' }]
    );
  };

  if (isLoading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#2e7d32" />
        <Text style={styles.loadingText}>Loading reports...</Text>
      </View>
    );
  }

  return (
    <ScrollView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Reporting</Text>
      </View>

      {/* Reports List Section */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Recent Reports</Text>
        <View style={styles.reportsListContainer}>
          {reports.map(report => (
            <TouchableOpacity key={report.id} style={styles.reportItem}>
              <View style={styles.reportItemContent}>
                <Text style={styles.reportTitle}>{report.title}</Text>
                <Text style={styles.reportDate}>{report.date}</Text>
              </View>
              <View style={styles.reportItemIcon}>
                <Ionicons 
                  name={report.type === 'pdf' ? 'document-text' : 'document'} 
                  size={24} 
                  color="#2e7d32" 
                />
              </View>
            </TouchableOpacity>
          ))}
        </View>
      </View>
      
      <View style={styles.dateRangeContainer}>
        <TouchableOpacity 
          style={styles.dateButton}
          onPress={() => handleDatePickerOpen('start')}
        >
          <Ionicons name="calendar-outline" size={18} color="#666" />
          <Text style={styles.dateButtonText}>
            From: {dateRange.start.toLocaleDateString()}
          </Text>
        </TouchableOpacity>
        
        <TouchableOpacity 
          style={styles.dateButton}
          onPress={() => handleDatePickerOpen('end')}
        >
          <Ionicons name="calendar-outline" size={18} color="#666" />
          <Text style={styles.dateButtonText}>
            To: {dateRange.end.toLocaleDateString()}
          </Text>
        </TouchableOpacity>
      </View>

      <View style={styles.metricsGrid}>
        <View style={styles.metricCard}>
          <Text style={styles.metricValue}>{metrics.totalCollections}</Text>
          <Text style={styles.metricLabel}>Collections</Text>
        </View>
        
        <View style={styles.metricCard}>
          <Text style={styles.metricValue}>{metrics.totalWeight}kg</Text>
          <Text style={styles.metricLabel}>Plastic Collected</Text>
        </View>
        
        <View style={styles.metricCard}>
          <Text style={styles.metricValue}>{metrics.totalCredits} pts</Text>
          <Text style={styles.metricLabel}>Credits Issued</Text>
        </View>
        
        <View style={styles.metricCard}>
          <Text style={styles.metricValue}>{metrics.activeUsers}</Text>
          <Text style={styles.metricLabel}>Active Users</Text>
        </View>
      </View>

      <View style={styles.chartContainer}>
        <Text style={styles.chartTitle}>Collection Trends</Text>
        <View style={styles.chartPlaceholder}>
          {chartData.map((point, index) => (
            <View key={index} style={styles.chartBarContainer}>
              <Text style={styles.chartLabel}>{point.date}</Text>
              <View style={[styles.chartBar, { height: point.value }]} />
              <Text style={styles.chartValue}>{point.value}</Text>
            </View>
          ))}
        </View>
      </View>

      <View style={styles.exportContainer}>
        <Text style={styles.exportTitle}>Export Report</Text>
        <View style={styles.exportFormats}>
          {reportFormats.map((format) => (
            <TouchableOpacity
              key={format.id}
              style={styles.exportButton}
              onPress={() => handleExportReport(format.id)}
            >
              <Ionicons name={format.icon as any} size={24} color="#2e7d32" />
              <Text style={styles.exportButtonText}>{format.name}</Text>
            </TouchableOpacity>
          ))}
        </View>
      </View>

      <View style={styles.actionsContainer}>
        <TouchableOpacity 
          style={styles.refreshButton}
          onPress={fetchReportData}
        >
          <Ionicons name="refresh" size={20} color="#fff" />
          <Text style={styles.actionButtonText}>Refresh Data</Text>
        </TouchableOpacity>
        
        <TouchableOpacity style={styles.actionButton}>
          <Ionicons name="share-outline" size={20} color="#fff" />
          <Text style={styles.actionButtonText}>Share Report</Text>
        </TouchableOpacity>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8f8f8',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#f8f8f8',
  },
  loadingText: {
    marginTop: 12,
    fontSize: 16,
    color: '#666',
  },
  header: {
    padding: 16,
    backgroundColor: '#fff',
    marginBottom: 8,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
  },
  section: {
    backgroundColor: '#fff',
    padding: 16,
    marginBottom: 16,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 16,
  },
  reportsListContainer: {
    backgroundColor: '#fff',
  },
  reportItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
  },
  reportItemContent: {
    flex: 1,
  },
  reportItemIcon: {
    marginLeft: 8,
  },
  reportTitle: {
    fontSize: 16,
    fontWeight: '500',
    marginBottom: 4,
  },
  reportDate: {
    fontSize: 14,
    color: '#666',
  },
  dateRangeContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    padding: 16,
    backgroundColor: '#fff',
    marginBottom: 16,
  },
  dateButton: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 8,
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 4,
  },
  dateButtonText: {
    marginLeft: 8,
    color: '#333',
  },
  metricsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    padding: 8,
    backgroundColor: '#fff',
    marginBottom: 16,
  },
  metricCard: {
    width: '50%',
    padding: 12,
  },
  metricValue: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#2e7d32',
  },
  metricLabel: {
    fontSize: 14,
    color: '#666',
    marginTop: 4,
  },
  chartContainer: {
    backgroundColor: '#fff',
    padding: 16,
    marginHorizontal: 16,
    marginBottom: 16,
    borderRadius: 8,
  },
  chartTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 16,
  },
  chartPlaceholder: {
    height: 220,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-end',
    paddingBottom: 20,
    paddingTop: 20,
  },
  chartBarContainer: {
    alignItems: 'center',
    flex: 1,
  },
  chartBar: {
    width: 20,
    backgroundColor: '#2e7d32',
    borderTopLeftRadius: 4,
    borderTopRightRadius: 4,
  },
  chartLabel: {
    fontSize: 12,
    color: '#666',
    marginBottom: 4,
    position: 'absolute',
    bottom: 0,
  },
  chartValue: {
    fontSize: 10,
    color: '#666',
    position: 'absolute',
    top: 0,
  },
  exportContainer: {
    backgroundColor: '#fff',
    padding: 16,
    marginHorizontal: 16,
    marginBottom: 16,
    borderRadius: 8,
  },
  exportTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 16,
  },
  exportFormats: {
    flexDirection: 'row',
    justifyContent: 'space-around',
  },
  exportButton: {
    alignItems: 'center',
    padding: 12,
  },
  exportButtonText: {
    marginTop: 8,
    color: '#333',
  },
  actionsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    padding: 16,
    marginBottom: 20,
  },
  actionButton: {
    backgroundColor: '#2e7d32',
    padding: 12,
    borderRadius: 8,
    minWidth: 150,
    alignItems: 'center',
    flexDirection: 'row',
    justifyContent: 'center',
  },
  refreshButton: {
    backgroundColor: '#1976d2',
    padding: 12,
    borderRadius: 8,
    minWidth: 150,
    alignItems: 'center',
    flexDirection: 'row',
    justifyContent: 'center',
  },
  actionButtonText: {
    color: '#fff',
    fontWeight: 'bold',
    marginLeft: 8,
  },
}); 