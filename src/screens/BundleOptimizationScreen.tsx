import React, { useEffect, useState } from 'react';
import { ActivityIndicator, ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import AssetOptimizer from '../utils/performance/AssetOptimizer';
import BundleAnalyzer, { ComponentType } from '../utils/performance/BundleAnalyzer';
import DependencyOptimizer from '../utils/performance/DependencyOptimizer';
import '../utils/performance/index';

/**
 * Implementation of the performance utility initialization function
 */
async function initializePerformanceUtilities(): Promise<void> {
  // Start analyzing dependencies
  await DependencyOptimizer.scanProjectDependencies();
  
  // Scan assets for optimization opportunities
  await AssetOptimizer.scanAssets();
  
  // Record initial bundle size for tracking
  const bundleSize = await BundleAnalyzer.getCurrentPlatformBundleSize();
  BundleAnalyzer.recordTotalBundleSize(bundleSize);
  
  console.log('Performance utilities initialized successfully');
}

/**
 * Generate a comprehensive performance optimization report
 */
async function generatePerformanceReport(): Promise<{
  bundleAnalysis: Record<string, any>;
  dependencyOptimization: Record<string, any>;
  assetOptimization: Record<string, any>;
  totalPotentialSavings: number;
  recommendations: string[];
}> {
  // Get reports from individual analyzers
  const bundleReport = await BundleAnalyzer.generateReport();
  const dependencyReport = DependencyOptimizer.generateOptimizationReport();
  const assetReport = AssetOptimizer.generateAssetOptimizationReport();
  
  // Calculate total potential savings (in bytes)
  const totalPotentialSavings = 
    dependencyReport.potentialSavings +
    assetReport.potentialSavings;
  
  // Generate overall recommendations
  const recommendations: string[] = [];
  
  // Add top recommendations from each analyzer
  if (dependencyReport.recommendedStrategies.length > 0) {
    const topDependency = dependencyReport.recommendedStrategies[0];
    recommendations.push(
      `Optimize '${topDependency.dependency}' dependency using ${topDependency.strategy} strategy to save approximately ${AssetOptimizer.formatFileSize(topDependency.potentialSavings)}.`
    );
  }
  
  if (assetReport.topRecommendations.length > 0) {
    const topAsset = assetReport.topRecommendations[0];
    recommendations.push(
      `${topAsset.recommendation} This could save approximately ${AssetOptimizer.formatFileSize(topAsset.potentialSavings)}.`
    );
  }
  
  // Add general recommendations
  recommendations.push(
    'Implement code splitting to load components only when needed.',
    'Use dynamic imports for large features and screens.',
    'Consider using a smaller state management solution if applicable.',
    'Optimize SVG assets and consider using them instead of PNG for icons.',
    'Implement tree shaking to remove unused code from the bundle.'
  );
  
  return {
    bundleAnalysis: bundleReport,
    dependencyOptimization: dependencyReport,
    assetOptimization: assetReport,
    totalPotentialSavings,
    recommendations
  };
}

interface OptimizationReport {
  bundleAnalysis: Record<string, any>;
  dependencyOptimization: Record<string, any>;
  assetOptimization: Record<string, any>;
  totalPotentialSavings: number;
  recommendations: string[];
}

const BundleOptimizationScreen: React.FC = () => {
  const [isLoading, setIsLoading] = useState(false);
  const [isInitialized, setIsInitialized] = useState(false);
  const [report, setReport] = useState<OptimizationReport | null>(null);
  const [activeTab, setActiveTab] = useState<'overview' | 'dependencies' | 'assets'>('overview');

  useEffect(() => {
    const initialize = async () => {
      setIsLoading(true);
      try {
        await initializePerformanceUtilities();
        setIsInitialized(true);
        await loadReport();
      } catch (error) {
        console.error('Failed to initialize performance utilities:', error);
      } finally {
        setIsLoading(false);
      }
    };

    initialize();
  }, []);

  const loadReport = async () => {
    setIsLoading(true);
    try {
      const reportData = await generatePerformanceReport();
      setReport(reportData);
    } catch (error) {
      console.error('Failed to generate performance report:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const analyzeBundle = async () => {
    setIsLoading(true);
    try {
      // Record sizes for some mock components
      BundleAnalyzer.recordComponentSize(
        'HomeScreen', 
        ComponentType.SCREEN, 
        450000, 
        { dependencyCount: 12 }
      );
      
      BundleAnalyzer.recordComponentSize(
        'ProductList', 
        ComponentType.COMPONENT, 
        320000, 
        { dependencyCount: 8 }
      );
      
      BundleAnalyzer.recordComponentSize(
        'CartService', 
        ComponentType.SERVICE, 
        180000, 
        { dependencyCount: 5 }
      );

      // Record the current bundle size
      const bundleSize = await BundleAnalyzer.getCurrentPlatformBundleSize();
      BundleAnalyzer.recordTotalBundleSize(bundleSize);
      
      await loadReport();
    } catch (error) {
      console.error('Failed to analyze bundle:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const renderOverviewTab = () => {
    if (!report) return null;
    
    return (
      <View style={styles.tabContent}>
        <View style={styles.infoCard}>
          <Text style={styles.cardTitle}>Bundle Size</Text>
          <Text style={styles.bundleSize}>{report.bundleAnalysis.currentBundleSize}</Text>
          <Text style={styles.bundleTrend}>
            Trend: {report.bundleAnalysis.trend}
          </Text>
        </View>
        
        <View style={styles.infoCard}>
          <Text style={styles.cardTitle}>Potential Savings</Text>
          <Text style={styles.savingsText}>
            {AssetOptimizer.formatFileSize(report.totalPotentialSavings)}
          </Text>
        </View>
        
        <View style={styles.infoCard}>
          <Text style={styles.cardTitle}>Recommendations</Text>
          {report.recommendations.map((recommendation, index) => (
            <Text key={index} style={styles.recommendationText}>
              • {recommendation}
            </Text>
          ))}
        </View>
      </View>
    );
  };

  const renderDependenciesTab = () => {
    if (!report) return null;
    
    return (
      <View style={styles.tabContent}>
        <View style={styles.infoCard}>
          <Text style={styles.cardTitle}>Dependencies Overview</Text>
          <Text style={styles.infoText}>
            Total Dependencies: {report.dependencyOptimization.totalDependencies}
          </Text>
          <Text style={styles.infoText}>
            Total Size: {AssetOptimizer.formatFileSize(report.dependencyOptimization.totalSize)}
          </Text>
        </View>
        
        <View style={styles.infoCard}>
          <Text style={styles.cardTitle}>Largest Dependencies</Text>
          {report.dependencyOptimization.largestDependencies.map((dep: any, index: number) => (
            <View key={index} style={styles.listItem}>
              <Text style={styles.listItemTitle}>{dep.name}</Text>
              <Text style={styles.listItemValue}>{AssetOptimizer.formatFileSize(dep.size)}</Text>
            </View>
          ))}
        </View>
        
        <View style={styles.infoCard}>
          <Text style={styles.cardTitle}>Optimization Strategies</Text>
          {report.dependencyOptimization.recommendedStrategies.map((strategy: any, index: number) => (
            <View key={index} style={styles.listItem}>
              <Text style={styles.listItemTitle}>
                {strategy.dependency} ({strategy.strategy})
              </Text>
              <Text style={styles.listItemValue}>
                {AssetOptimizer.formatFileSize(strategy.potentialSavings)}
              </Text>
            </View>
          ))}
        </View>
      </View>
    );
  };

  const renderAssetsTab = () => {
    if (!report) return null;
    
    return (
      <View style={styles.tabContent}>
        <View style={styles.infoCard}>
          <Text style={styles.cardTitle}>Assets Overview</Text>
          <Text style={styles.infoText}>
            Total Assets: {report.assetOptimization.totalAssets}
          </Text>
          <Text style={styles.infoText}>
            Total Size: {AssetOptimizer.formatFileSize(report.assetOptimization.totalSize)}
          </Text>
          <Text style={styles.infoText}>
            Potential Savings: {AssetOptimizer.formatFileSize(report.assetOptimization.potentialSavings)} ({report.assetOptimization.savingsPercent}%)
          </Text>
        </View>
        
        <View style={styles.infoCard}>
          <Text style={styles.cardTitle}>Optimization Recommendations</Text>
          {report.assetOptimization.topRecommendations.map((rec: any, index: number) => (
            <View key={index} style={styles.listItem}>
              <View style={styles.listItemHeader}>
                <Text style={styles.listItemTitle}>{rec.path.split('/').pop()}</Text>
                <Text style={styles.listItemValue}>
                  {AssetOptimizer.formatFileSize(rec.potentialSavings)}
                </Text>
              </View>
              <Text style={styles.listItemDescription}>{rec.recommendation}</Text>
            </View>
          ))}
        </View>
      </View>
    );
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Bundle Optimization</Text>
      </View>
      
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
          style={[styles.tab, activeTab === 'dependencies' && styles.activeTab]}
          onPress={() => setActiveTab('dependencies')}
        >
          <Text style={[styles.tabText, activeTab === 'dependencies' && styles.activeTabText]}>
            Dependencies
          </Text>
        </TouchableOpacity>
        
        <TouchableOpacity 
          style={[styles.tab, activeTab === 'assets' && styles.activeTab]}
          onPress={() => setActiveTab('assets')}
        >
          <Text style={[styles.tabText, activeTab === 'assets' && styles.activeTabText]}>
            Assets
          </Text>
        </TouchableOpacity>
      </View>
      
      <ScrollView style={styles.content}>
        {isLoading ? (
          <View style={styles.loadingContainer}>
            <ActivityIndicator size="large" color="#0066cc" />
            <Text style={styles.loadingText}>
              {isInitialized ? 'Generating report...' : 'Initializing performance utilities...'}
            </Text>
          </View>
        ) : report ? (
          <>
            {activeTab === 'overview' && renderOverviewTab()}
            {activeTab === 'dependencies' && renderDependenciesTab()}
            {activeTab === 'assets' && renderAssetsTab()}
          </>
        ) : (
          <View style={styles.noDataContainer}>
            <Text style={styles.noDataText}>No optimization data available</Text>
            <Text style={styles.noDataSubtext}>
              Run the bundle analysis to generate optimization recommendations
            </Text>
          </View>
        )}
      </ScrollView>
      
      <View style={styles.footer}>
        <TouchableOpacity 
          style={styles.button}
          onPress={analyzeBundle}
          disabled={isLoading}
        >
          <Text style={styles.buttonText}>
            {isInitialized ? 'Analyze Bundle' : 'Initialize'}
          </Text>
        </TouchableOpacity>
        
        <TouchableOpacity 
          style={[styles.button, styles.secondaryButton]}
          onPress={loadReport}
          disabled={isLoading || !isInitialized}
        >
          <Text style={[styles.buttonText, styles.secondaryButtonText]}>
            Refresh Report
          </Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f7',
  },
  header: {
    padding: 16,
    backgroundColor: '#ffffff',
    borderBottomWidth: 1,
    borderBottomColor: '#e1e1e1',
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#333333',
  },
  tabs: {
    flexDirection: 'row',
    backgroundColor: '#ffffff',
    borderBottomWidth: 1,
    borderBottomColor: '#e1e1e1',
  },
  tab: {
    flex: 1,
    paddingVertical: 12,
    alignItems: 'center',
  },
  activeTab: {
    borderBottomWidth: 2,
    borderBottomColor: '#0066cc',
  },
  tabText: {
    fontSize: 14,
    color: '#666666',
  },
  activeTabText: {
    fontWeight: 'bold',
    color: '#0066cc',
  },
  content: {
    flex: 1,
  },
  tabContent: {
    padding: 16,
  },
  infoCard: {
    backgroundColor: '#ffffff',
    borderRadius: 8,
    padding: 16,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  cardTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 12,
    color: '#333333',
  },
  bundleSize: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#0066cc',
    marginBottom: 4,
  },
  bundleTrend: {
    fontSize: 14,
    color: '#666666',
  },
  savingsText: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#28a745',
  },
  recommendationText: {
    fontSize: 14,
    lineHeight: 20,
    color: '#333333',
    marginBottom: 8,
  },
  infoText: {
    fontSize: 14,
    marginBottom: 8,
    color: '#333333',
  },
  listItem: {
    marginBottom: 12,
    paddingBottom: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  listItemHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  listItemTitle: {
    fontSize: 14,
    fontWeight: '500',
    color: '#333333',
    flex: 1,
  },
  listItemValue: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#28a745',
  },
  listItemDescription: {
    fontSize: 12,
    color: '#666666',
    marginTop: 4,
  },
  loadingContainer: {
    padding: 24,
    alignItems: 'center',
  },
  loadingText: {
    marginTop: 16,
    fontSize: 14,
    color: '#666666',
  },
  noDataContainer: {
    padding: 24,
    alignItems: 'center',
  },
  noDataText: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#666666',
    marginBottom: 8,
  },
  noDataSubtext: {
    fontSize: 14,
    color: '#999999',
    textAlign: 'center',
  },
  footer: {
    flexDirection: 'row',
    padding: 16,
    backgroundColor: '#ffffff',
    borderTopWidth: 1,
    borderTopColor: '#e1e1e1',
  },
  button: {
    flex: 1,
    backgroundColor: '#0066cc',
    borderRadius: 8,
    paddingVertical: 12,
    alignItems: 'center',
    marginHorizontal: 4,
  },
  buttonText: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#ffffff',
  },
  secondaryButton: {
    backgroundColor: '#ffffff',
    borderWidth: 1,
    borderColor: '#0066cc',
  },
  secondaryButtonText: {
    color: '#0066cc',
  }
});

export default BundleOptimizationScreen; 