/**
 * TreeShakingScreen.tsx
 * 
 * Screen for analyzing and optimizing tree shaking opportunities
 * in the application code. This screen helps identify unused imports
 * and provides recommendations for optimization.
 */

import { Ionicons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import React, { useEffect, useState } from 'react';
import {
    ActivityIndicator,
    Alert,
    FlatList,
    SafeAreaView,
    ScrollView,
    StyleSheet,
    Text,
    TouchableOpacity,
    View
} from 'react-native';
import { PieChart } from 'react-native-chart-kit';
import TreeShakingOptimizer, { TreeShakingAnalysis } from '../utils/performance/TreeShakingOptimizer';

const TreeShakingScreen: React.FC = () => {
  const [isLoading, setIsLoading] = useState(false);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [analysisResults, setAnalysisResults] = useState<TreeShakingAnalysis | null>(null);
  const [activeTab, setActiveTab] = useState<'overview' | 'libraries' | 'recommendations'>('overview');
  const navigation = useNavigation();
  
  // Load existing analysis results
  useEffect(() => {
    const loadResults = async () => {
      setIsLoading(true);
      const results = TreeShakingOptimizer.getAnalysisResults();
      setAnalysisResults(results);
      setIsLoading(false);
    };
    
    loadResults();
  }, []);
  
  // Run a new analysis
  const runAnalysis = async () => {
    try {
      setIsAnalyzing(true);
      
      // Show alert for long-running operation
      Alert.alert(
        'Starting Analysis',
        'Analyzing project files for tree shaking opportunities. This may take a moment.',
        [{ text: 'OK' }]
      );
      
      // Run analysis on src folder
      const results = await TreeShakingOptimizer.scanProject(['src']);
      setAnalysisResults(results);
      
      // Show completion alert
      Alert.alert(
        'Analysis Complete',
        `Found ${results.imports.length} imports across your project with potential savings of ${TreeShakingOptimizer.formatSize(results.potentialSavings)}.`,
        [{ text: 'OK' }]
      );
    } catch (error) {
      console.error('Error running tree shaking analysis:', error);
      Alert.alert('Error', 'An error occurred while analyzing the project.');
    } finally {
      setIsAnalyzing(false);
    }
  };
  
  // Format a timestamp as a readable date
  const formatDate = (timestamp: number): string => {
    const date = new Date(timestamp);
    return date.toLocaleString();
  };
  
  // Render loading state
  if (isLoading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#0066cc" />
        <Text style={styles.loadingText}>Loading analysis results...</Text>
      </View>
    );
  }
  
  // Prepare chart data for library size breakdown
  const prepareLibraryChartData = () => {
    if (!analysisResults?.topLibraries) return [];
    
    // Get top 5 libraries by size
    const topLibraries = analysisResults.topLibraries
      .sort((a, b) => b.totalSize - a.totalSize)
      .slice(0, 5);
    
    // Calculate "Other" size (sum of all other libraries)
    const topLibrariesSize = topLibraries.reduce((sum, lib) => sum + lib.totalSize, 0);
    const otherSize = analysisResults.topLibraries
      .slice(5)
      .reduce((sum, lib) => sum + lib.totalSize, 0);
    
    // Map to chart data format with colors
    const colors = ['#FF6384', '#36A2EB', '#FFCE56', '#4BC0C0', '#9966FF', '#C9CBCF'];
    
    const chartData = topLibraries.map((lib, index) => ({
      name: lib.library,
      size: lib.totalSize,
      color: colors[index % colors.length],
      legendFontColor: '#7F7F7F',
      legendFontSize: 12
    }));
    
    // Add "Other" category if there are more than 5 libraries
    if (otherSize > 0) {
      chartData.push({
        name: 'Other',
        size: otherSize,
        color: colors[5],
        legendFontColor: '#7F7F7F',
        legendFontSize: 12
      });
    }
    
    return chartData;
  };
  
  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Tree Shaking Optimizer</Text>
        <TouchableOpacity 
          style={styles.runButton}
          onPress={runAnalysis}
          disabled={isAnalyzing}
        >
          {isAnalyzing ? (
            <ActivityIndicator size="small" color="#FFFFFF" />
          ) : (
            <Text style={styles.runButtonText}>Analyze</Text>
          )}
        </TouchableOpacity>
      </View>
      
      {!analysisResults ? (
        <View style={styles.noData}>
          <Ionicons name="leaf-outline" size={60} color="#CCCCCC" />
          <Text style={styles.noDataText}>No analysis data available</Text>
          <Text style={styles.noDataSubtext}>
            Run an analysis to identify tree shaking opportunities.
          </Text>
          <TouchableOpacity 
            style={styles.runButtonLarge}
            onPress={runAnalysis}
            disabled={isAnalyzing}
          >
            {isAnalyzing ? (
              <ActivityIndicator size="small" color="#FFFFFF" />
            ) : (
              <>
                <Ionicons name="scan-outline" size={20} color="#FFFFFF" style={styles.buttonIcon} />
                <Text style={styles.runButtonText}>Run Analysis</Text>
              </>
            )}
          </TouchableOpacity>
        </View>
      ) : (
        <>
          <View style={styles.tabs}>
            <TouchableOpacity 
              style={[styles.tab, activeTab === 'overview' && styles.activeTab]}
              onPress={() => setActiveTab('overview')}
            >
              <Text style={[styles.tabText, activeTab === 'overview' && styles.activeTabText]}>
                Overview
              </Text>
            </TouchableOpacity>
            <TouchableOpacity 
              style={[styles.tab, activeTab === 'libraries' && styles.activeTab]}
              onPress={() => setActiveTab('libraries')}
            >
              <Text style={[styles.tabText, activeTab === 'libraries' && styles.activeTabText]}>
                Libraries
              </Text>
            </TouchableOpacity>
            <TouchableOpacity 
              style={[styles.tab, activeTab === 'recommendations' && styles.activeTab]}
              onPress={() => setActiveTab('recommendations')}
            >
              <Text style={[styles.tabText, activeTab === 'recommendations' && styles.activeTabText]}>
                Recommendations
              </Text>
            </TouchableOpacity>
          </View>
          
          {activeTab === 'overview' && (
            <ScrollView style={styles.tabContent}>
              <View style={styles.card}>
                <Text style={styles.cardTitle}>Analysis Summary</Text>
                <View style={styles.metaRow}>
                  <Text style={styles.metaLabel}>Last analyzed:</Text>
                  <Text style={styles.metaValue}>{formatDate(analysisResults.timestamp)}</Text>
                </View>
                <View style={styles.metaRow}>
                  <Text style={styles.metaLabel}>Total imports analyzed:</Text>
                  <Text style={styles.metaValue}>{analysisResults.imports.length}</Text>
                </View>
                <View style={styles.metaRow}>
                  <Text style={styles.metaLabel}>Libraries detected:</Text>
                  <Text style={styles.metaValue}>{analysisResults.topLibraries.length}</Text>
                </View>
                <View style={styles.metaRow}>
                  <Text style={styles.metaLabel}>Optimization recommendations:</Text>
                  <Text style={styles.metaValue}>{analysisResults.recommendations.length}</Text>
                </View>
                <View style={styles.metaRow}>
                  <Text style={styles.metaLabel}>Potential size reduction:</Text>
                  <Text style={styles.metaValue}>
                    {TreeShakingOptimizer.formatSize(analysisResults.potentialSavings)}
                  </Text>
                </View>
              </View>
              
              <View style={styles.card}>
                <Text style={styles.cardTitle}>Library Size Distribution</Text>
                {analysisResults.topLibraries.length > 0 ? (
                  <PieChart
                    data={prepareLibraryChartData()}
                    width={300}
                    height={200}
                    chartConfig={{
                      color: (opacity = 1) => `rgba(0, 0, 0, ${opacity})`,
                    }}
                    accessor="size"
                    backgroundColor="transparent"
                    paddingLeft="15"
                    absolute
                  />
                ) : (
                  <Text style={styles.noChartData}>No library size data available</Text>
                )}
              </View>
              
              <View style={styles.card}>
                <Text style={styles.cardTitle}>Import Pattern Distribution</Text>
                <View style={styles.statsRow}>
                  <View style={styles.statBox}>
                    <Text style={styles.statValue}>
                      {analysisResults.imports.filter(imp => imp.importPattern === 'named_exports').length}
                    </Text>
                    <Text style={styles.statLabel}>Named Imports</Text>
                  </View>
                  <View style={styles.statBox}>
                    <Text style={styles.statValue}>
                      {analysisResults.imports.filter(imp => imp.importPattern === 'default_import').length}
                    </Text>
                    <Text style={styles.statLabel}>Default Imports</Text>
                  </View>
                  <View style={styles.statBox}>
                    <Text style={styles.statValue}>
                      {analysisResults.imports.filter(imp => imp.importPattern === 'full_library').length}
                    </Text>
                    <Text style={styles.statLabel}>Full Library</Text>
                  </View>
                </View>
              </View>
              
              <View style={styles.card}>
                <Text style={styles.cardTitle}>Next Steps</Text>
                <Text style={styles.cardText}>
                  Review the recommendations in the "Recommendations" tab to optimize your imports.
                  Focus on the suggestions with the highest potential savings.
                </Text>
                <TouchableOpacity 
                  style={styles.nextStepButton}
                  onPress={() => setActiveTab('recommendations')}
                >
                  <Text style={styles.nextStepButtonText}>View Recommendations</Text>
                </TouchableOpacity>
              </View>
            </ScrollView>
          )}
          
          {activeTab === 'libraries' && (
            <FlatList
              style={styles.tabContent}
              data={analysisResults.topLibraries.sort((a, b) => b.totalSize - a.totalSize)}
              keyExtractor={(item) => item.library}
              ListHeaderComponent={
                <View style={styles.listHeader}>
                  <Text style={styles.listHeaderText}>Library</Text>
                  <Text style={styles.listHeaderText}>Usage</Text>
                  <Text style={styles.listHeaderText}>Size</Text>
                </View>
              }
              renderItem={({ item }) => (
                <View style={styles.libraryItem}>
                  <Text style={styles.libraryName} numberOfLines={1} ellipsizeMode="middle">
                    {item.library}
                  </Text>
                  <Text style={styles.libraryCount}>{item.count}×</Text>
                  <Text style={styles.librarySize}>
                    {TreeShakingOptimizer.formatSize(item.totalSize)}
                  </Text>
                </View>
              )}
              ListEmptyComponent={
                <View style={styles.emptyList}>
                  <Text style={styles.emptyListText}>No libraries found</Text>
                </View>
              }
            />
          )}
          
          {activeTab === 'recommendations' && (
            <FlatList
              style={styles.tabContent}
              data={analysisResults.recommendations}
              keyExtractor={(item, index) => `${item.filePath}-${index}`}
              ListHeaderComponent={
                analysisResults.recommendations.length > 0 ? (
                  <View style={styles.recommendationHeader}>
                    <Text style={styles.recommendationHeaderText}>
                      {analysisResults.recommendations.length} Recommendations
                    </Text>
                    <Text style={styles.recommendationSubheader}>
                      Potential savings: {TreeShakingOptimizer.formatSize(analysisResults.potentialSavings)}
                    </Text>
                  </View>
                ) : null
              }
              renderItem={({ item }) => (
                <View style={styles.recommendationItem}>
                  <View style={styles.recommendationHeader}>
                    <Text style={styles.recommendationFile}>{item.filePath}</Text>
                    <Text style={styles.recommendationSavings}>
                      Save {TreeShakingOptimizer.formatSize(item.savings)}
                    </Text>
                  </View>
                  <View style={styles.recommendationContent}>
                    <Text style={styles.recommendationText}>{item.recommendation}</Text>
                  </View>
                </View>
              )}
              ListEmptyComponent={
                <View style={styles.emptyList}>
                  <Text style={styles.emptyListText}>No recommendations available</Text>
                  <Text style={styles.emptyListSubtext}>
                    Your imports look optimized! No tree shaking opportunities found.
                  </Text>
                </View>
              }
            />
          )}
        </>
      )}
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F5F5F7',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: '#FFFFFF',
    borderBottomWidth: 1,
    borderBottomColor: '#E5E5EA',
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#000000',
  },
  runButton: {
    backgroundColor: '#0066CC',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 8,
    flexDirection: 'row',
    alignItems: 'center',
  },
  runButtonText: {
    color: '#FFFFFF',
    fontWeight: '600',
    fontSize: 14,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#F5F5F7',
  },
  loadingText: {
    marginTop: 12,
    fontSize: 16,
    color: '#666666',
  },
  noData: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 24,
  },
  noDataText: {
    fontSize: 18,
    fontWeight: '600',
    color: '#333333',
    marginTop: 16,
  },
  noDataSubtext: {
    fontSize: 14,
    color: '#666666',
    marginTop: 8,
    textAlign: 'center',
  },
  runButtonLarge: {
    backgroundColor: '#0066CC',
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 8,
    marginTop: 24,
    flexDirection: 'row',
    alignItems: 'center',
  },
  buttonIcon: {
    marginRight: 8,
  },
  tabs: {
    flexDirection: 'row',
    backgroundColor: '#FFFFFF',
    marginBottom: 8,
    borderBottomWidth: 1,
    borderBottomColor: '#E5E5EA',
  },
  tab: {
    flex: 1,
    paddingVertical: 12,
    alignItems: 'center',
  },
  activeTab: {
    borderBottomWidth: 2,
    borderBottomColor: '#0066CC',
  },
  tabText: {
    fontSize: 14,
    color: '#666666',
  },
  activeTabText: {
    fontWeight: '600',
    color: '#0066CC',
  },
  tabContent: {
    flex: 1,
    backgroundColor: '#F5F5F7',
  },
  card: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    marginHorizontal: 16,
    marginVertical: 8,
    padding: 16,
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  cardTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333333',
    marginBottom: 12,
  },
  cardText: {
    fontSize: 14,
    color: '#666666',
    lineHeight: 20,
  },
  metaRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 6,
    borderBottomWidth: 1,
    borderBottomColor: '#F0F0F0',
  },
  metaLabel: {
    fontSize: 14,
    color: '#666666',
  },
  metaValue: {
    fontSize: 14,
    fontWeight: '500',
    color: '#333333',
  },
  noChartData: {
    fontSize: 14,
    color: '#999999',
    textAlign: 'center',
    marginVertical: 40,
  },
  statsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginVertical: 8,
  },
  statBox: {
    flex: 1,
    alignItems: 'center',
    padding: 12,
    backgroundColor: '#F9F9F9',
    borderRadius: 8,
    marginHorizontal: 4,
  },
  statValue: {
    fontSize: 20,
    fontWeight: '600',
    color: '#333333',
  },
  statLabel: {
    fontSize: 12,
    color: '#666666',
    marginTop: 4,
  },
  nextStepButton: {
    backgroundColor: '#0066CC',
    paddingVertical: 12,
    borderRadius: 8,
    marginTop: 16,
    alignItems: 'center',
  },
  nextStepButtonText: {
    color: '#FFFFFF',
    fontWeight: '600',
    fontSize: 14,
  },
  listHeader: {
    flexDirection: 'row',
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: '#F5F5F7',
    borderBottomWidth: 1,
    borderBottomColor: '#E5E5EA',
  },
  listHeaderText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#666666',
    textTransform: 'uppercase',
  },
  libraryItem: {
    flexDirection: 'row',
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: '#FFFFFF',
    borderBottomWidth: 1,
    borderBottomColor: '#F0F0F0',
  },
  libraryName: {
    flex: 3,
    fontSize: 14,
    color: '#333333',
  },
  libraryCount: {
    flex: 1,
    fontSize: 14,
    color: '#666666',
    textAlign: 'center',
  },
  librarySize: {
    flex: 1,
    fontSize: 14,
    fontWeight: '500',
    color: '#333333',
    textAlign: 'right',
  },
  emptyList: {
    padding: 24,
    alignItems: 'center',
  },
  emptyListText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#666666',
  },
  emptyListSubtext: {
    fontSize: 14,
    color: '#999999',
    marginTop: 8,
    textAlign: 'center',
  },
  recommendationHeader: {
    padding: 16,
    backgroundColor: '#F5F5F7',
  },
  recommendationHeaderText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333333',
  },
  recommendationSubheader: {
    fontSize: 14,
    color: '#666666',
    marginTop: 4,
  },
  recommendationItem: {
    backgroundColor: '#FFFFFF',
    borderBottomWidth: 1,
    borderBottomColor: '#F0F0F0',
    marginBottom: 8,
  },
  recommendationFile: {
    fontSize: 14,
    fontWeight: '500',
    color: '#0066CC',
  },
  recommendationSavings: {
    fontSize: 12,
    color: '#22BB33',
    fontWeight: '500',
  },
  recommendationContent: {
    padding: 16,
    backgroundColor: '#F9F9F9',
  },
  recommendationText: {
    fontSize: 14,
    color: '#333333',
    fontFamily: 'monospace',
  },
});

export default TreeShakingScreen; 