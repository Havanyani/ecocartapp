import { Ionicons } from '@expo/vector-icons';
import * as FileSystem from 'expo-file-system';
import { Stack } from 'expo-router/stack';
import * as Sharing from 'expo-sharing';
import { StatusBar } from 'expo-status-bar';
import React, { useState } from 'react';
import {
    ActivityIndicator,
    Alert,
    Platform,
    SafeAreaView,
    ScrollView,
    Share,
    StyleSheet,
    Text,
    TouchableOpacity,
    View,
} from 'react-native';

type ReportType = 'collection' | 'environmental' | 'engagement' | 'performance' | 'complete';
type ReportFormat = 'pdf' | 'csv' | 'json';
type TimeFrame = 'week' | 'month' | 'year' | 'all';

interface ReportOption {
  id: ReportType;
  title: string;
  description: string;
  icon: string;
  color: string;
}

/**
 * Report Generation Screen
 * 
 * Allows users to generate and export analytics reports in different formats
 * including collection data, environmental impact, user engagement, and performance metrics
 */
export default function ReportsScreen() {
  const [selectedReport, setSelectedReport] = useState<ReportType | null>(null);
  const [selectedFormat, setSelectedFormat] = useState<ReportFormat>('pdf');
  const [selectedTimeFrame, setSelectedTimeFrame] = useState<TimeFrame>('month');
  const [isGenerating, setIsGenerating] = useState(false);
  
  const reportOptions: ReportOption[] = [
    {
      id: 'collection',
      title: 'Collection Analytics',
      description: 'Material types, weights, locations, and frequency',
      icon: 'cube-outline',
      color: '#2196F3',
    },
    {
      id: 'environmental',
      title: 'Environmental Impact',
      description: 'CO₂ saved, water conserved, energy saved',
      icon: 'leaf-outline',
      color: '#4CAF50',
    },
    {
      id: 'engagement',
      title: 'User Engagement',
      description: 'App usage, feature popularity, retention metrics',
      icon: 'people-outline',
      color: '#007AFF',
    },
    {
      id: 'performance',
      title: 'App Performance',
      description: 'Response times, load times, error rates',
      icon: 'speedometer-outline',
      color: '#FF9800',
    },
    {
      id: 'complete',
      title: 'Complete Report',
      description: 'All analytics data combined in one report',
      icon: 'document-text-outline',
      color: '#9C27B0',
    },
  ];
  
  const handleGenerateReport = async () => {
    if (!selectedReport) {
      Alert.alert('Error', 'Please select a report type');
      return;
    }
    
    setIsGenerating(true);
    
    // Simulate report generation
    setTimeout(async () => {
      try {
        const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
        const fileName = `ecocart-${selectedReport}-report-${timestamp}.${selectedFormat}`;
        const fileUri = `${FileSystem.documentDirectory}${fileName}`;
        
        // Simulate creating a file with dummy content
        await FileSystem.writeAsStringAsync(fileUri, 
          JSON.stringify({
            reportType: selectedReport,
            timeFrame: selectedTimeFrame,
            generatedAt: new Date().toISOString(),
            data: {
              sampleMetric1: 123,
              sampleMetric2: 456,
              sampleArray: [1, 2, 3, 4, 5]
            }
          }, null, 2)
        );
        
        // Share the file
        if (Platform.OS === 'ios') {
          await Sharing.shareAsync(fileUri);
        } else {
          const shareResult = await Share.share({
            title: `EcoCart ${selectedReport.charAt(0).toUpperCase() + selectedReport.slice(1)} Report`,
            message: `Here's your EcoCart ${selectedReport} report for the ${selectedTimeFrame}`,
            url: fileUri,
          });
          
          if (shareResult.action === Share.sharedAction) {
            if (shareResult.activityType) {
              console.log(`Shared via ${shareResult.activityType}`);
            } else {
              console.log('Shared successfully');
            }
          } else if (shareResult.action === Share.dismissedAction) {
            console.log('Share dismissed');
          }
        }
      } catch (error) {
        console.error('Error generating or sharing report:', error);
        Alert.alert('Error', 'Failed to generate or share report');
      } finally {
        setIsGenerating(false);
      }
    }, 2000);
  };
  
  const renderReportOptions = () => (
    <View style={styles.section}>
      <Text style={styles.sectionTitle}>Select Report Type</Text>
      {reportOptions.map((option) => (
        <TouchableOpacity
          key={option.id}
          style={[
            styles.reportOption,
            selectedReport === option.id && styles.reportOptionSelected
          ]}
          onPress={() => setSelectedReport(option.id)}
        >
          <View style={[
            styles.reportIconContainer,
            { backgroundColor: option.color + '20' }
          ]}>
            <Ionicons name={option.icon} size={24} color={option.color} />
          </View>
          <View style={styles.reportInfo}>
            <Text style={styles.reportTitle}>{option.title}</Text>
            <Text style={styles.reportDescription}>{option.description}</Text>
          </View>
          <Ionicons
            name={selectedReport === option.id ? 'checkmark-circle' : 'ellipse-outline'}
            size={24}
            color={selectedReport === option.id ? option.color : '#C7C7CC'}
          />
        </TouchableOpacity>
      ))}
    </View>
  );
  
  const renderFormatOptions = () => (
    <View style={styles.section}>
      <Text style={styles.sectionTitle}>Select Format</Text>
      <View style={styles.formatContainer}>
        <TouchableOpacity
          style={[
            styles.formatOption,
            selectedFormat === 'pdf' && styles.formatOptionSelected
          ]}
          onPress={() => setSelectedFormat('pdf')}
        >
          <Ionicons
            name="document-text"
            size={24}
            color={selectedFormat === 'pdf' ? '#FFFFFF' : '#FF3B30'}
          />
          <Text
            style={[
              styles.formatText,
              selectedFormat === 'pdf' && styles.formatTextSelected
            ]}
          >
            PDF
          </Text>
        </TouchableOpacity>
        
        <TouchableOpacity
          style={[
            styles.formatOption,
            selectedFormat === 'csv' && styles.formatOptionSelected
          ]}
          onPress={() => setSelectedFormat('csv')}
        >
          <Ionicons
            name="list"
            size={24}
            color={selectedFormat === 'csv' ? '#FFFFFF' : '#34C759'}
          />
          <Text
            style={[
              styles.formatText,
              selectedFormat === 'csv' && styles.formatTextSelected
            ]}
          >
            CSV
          </Text>
        </TouchableOpacity>
        
        <TouchableOpacity
          style={[
            styles.formatOption,
            selectedFormat === 'json' && styles.formatOptionSelected
          ]}
          onPress={() => setSelectedFormat('json')}
        >
          <Ionicons
            name="code-slash"
            size={24}
            color={selectedFormat === 'json' ? '#FFFFFF' : '#007AFF'}
          />
          <Text
            style={[
              styles.formatText,
              selectedFormat === 'json' && styles.formatTextSelected
            ]}
          >
            JSON
          </Text>
        </TouchableOpacity>
      </View>
    </View>
  );
  
  const renderTimeFrameOptions = () => (
    <View style={styles.section}>
      <Text style={styles.sectionTitle}>Select Time Frame</Text>
      <View style={styles.timeFrameContainer}>
        <TouchableOpacity
          style={[
            styles.timeFrameOption,
            selectedTimeFrame === 'week' && styles.timeFrameOptionSelected
          ]}
          onPress={() => setSelectedTimeFrame('week')}
        >
          <Text
            style={[
              styles.timeFrameText,
              selectedTimeFrame === 'week' && styles.timeFrameTextSelected
            ]}
          >
            Last Week
          </Text>
        </TouchableOpacity>
        
        <TouchableOpacity
          style={[
            styles.timeFrameOption,
            selectedTimeFrame === 'month' && styles.timeFrameOptionSelected
          ]}
          onPress={() => setSelectedTimeFrame('month')}
        >
          <Text
            style={[
              styles.timeFrameText,
              selectedTimeFrame === 'month' && styles.timeFrameTextSelected
            ]}
          >
            Last Month
          </Text>
        </TouchableOpacity>
        
        <TouchableOpacity
          style={[
            styles.timeFrameOption,
            selectedTimeFrame === 'year' && styles.timeFrameOptionSelected
          ]}
          onPress={() => setSelectedTimeFrame('year')}
        >
          <Text
            style={[
              styles.timeFrameText,
              selectedTimeFrame === 'year' && styles.timeFrameTextSelected
            ]}
          >
            Last Year
          </Text>
        </TouchableOpacity>
        
        <TouchableOpacity
          style={[
            styles.timeFrameOption,
            selectedTimeFrame === 'all' && styles.timeFrameOptionSelected
          ]}
          onPress={() => setSelectedTimeFrame('all')}
        >
          <Text
            style={[
              styles.timeFrameText,
              selectedTimeFrame === 'all' && styles.timeFrameTextSelected
            ]}
          >
            All Time
          </Text>
        </TouchableOpacity>
      </View>
    </View>
  );
  
  return (
    <SafeAreaView style={styles.container}>
      <StatusBar style="auto" />
      <Stack.Screen
        options={{
          title: "Generate Reports",
          headerShown: true,
          headerBackTitle: "Analytics"
        }}
      />
      
      <ScrollView style={styles.content}>
        {renderReportOptions()}
        {renderFormatOptions()}
        {renderTimeFrameOptions()}
        
        <View style={styles.infoContainer}>
          <Ionicons name="information-circle-outline" size={20} color="#8E8E93" />
          <Text style={styles.infoText}>
            Reports will be generated based on your selected criteria and can be shared or saved to your device.
          </Text>
        </View>
      </ScrollView>
      
      <View style={styles.footer}>
        <TouchableOpacity
          style={[
            styles.generateButton,
            (!selectedReport || isGenerating) && styles.generateButtonDisabled
          ]}
          onPress={handleGenerateReport}
          disabled={!selectedReport || isGenerating}
        >
          {isGenerating ? (
            <ActivityIndicator color="#FFFFFF" size="small" />
          ) : (
            <>
              <Ionicons name="download-outline" size={20} color="#FFFFFF" style={styles.generateButtonIcon} />
              <Text style={styles.generateButtonText}>Generate Report</Text>
            </>
          )}
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFFFFF',
  },
  content: {
    flex: 1,
    padding: 16,
  },
  section: {
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    marginBottom: 16,
    color: '#2C3E50',
  },
  reportOption: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    backgroundColor: '#F8F9FA',
    borderRadius: 12,
    marginBottom: 12,
  },
  reportOptionSelected: {
    backgroundColor: '#F2F2F7',
    borderWidth: 1,
    borderColor: '#E5E5EA',
  },
  reportIconContainer: {
    width: 48,
    height: 48,
    borderRadius: 24,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 16,
  },
  reportInfo: {
    flex: 1,
  },
  reportTitle: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 4,
    color: '#2C3E50',
  },
  reportDescription: {
    fontSize: 14,
    color: '#8E8E93',
  },
  formatContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  formatOption: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 16,
    backgroundColor: '#F8F9FA',
    borderRadius: 12,
    marginHorizontal: 4,
  },
  formatOptionSelected: {
    backgroundColor: '#007AFF',
  },
  formatText: {
    fontSize: 14,
    fontWeight: '600',
    marginTop: 8,
  },
  formatTextSelected: {
    color: '#FFFFFF',
  },
  timeFrameContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginHorizontal: -4,
  },
  timeFrameOption: {
    paddingVertical: 8,
    paddingHorizontal: 16,
    backgroundColor: '#F8F9FA',
    borderRadius: 20,
    margin: 4,
  },
  timeFrameOptionSelected: {
    backgroundColor: '#007AFF',
  },
  timeFrameText: {
    fontSize: 14,
    color: '#8E8E93',
  },
  timeFrameTextSelected: {
    color: '#FFFFFF',
    fontWeight: '600',
  },
  infoContainer: {
    flexDirection: 'row',
    backgroundColor: '#F2F2F7',
    borderRadius: 12,
    padding: 16,
    marginBottom: 24,
    alignItems: 'flex-start',
  },
  infoText: {
    fontSize: 14,
    color: '#8E8E93',
    marginLeft: 12,
    flex: 1,
    lineHeight: 20,
  },
  footer: {
    padding: 16,
    borderTopWidth: 1,
    borderTopColor: '#E5E5EA',
  },
  generateButton: {
    backgroundColor: '#007AFF',
    borderRadius: 12,
    padding: 16,
    alignItems: 'center',
    justifyContent: 'center',
    flexDirection: 'row',
  },
  generateButtonDisabled: {
    backgroundColor: '#007AFF80',
  },
  generateButtonIcon: {
    marginRight: 8,
  },
  generateButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#FFFFFF',
  },
}); 