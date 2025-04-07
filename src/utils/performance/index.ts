/**
 * Performance optimization utilities index
 * 
 * This file exports all the performance optimization utilities for the EcoCart app,
 * including bundle size analysis, code splitting, dependency optimization, and asset optimization.
 */

import AssetOptimizer from './AssetOptimizer';
import BundleAnalyzer from './BundleAnalyzer';
import DependencyOptimizer from './DependencyOptimizer';

export {
    AssetOptimizer, BundleAnalyzer,
    DependencyOptimizer
};

// Export bundle analysis types
    export { ComponentType } from './BundleAnalyzer';
    export type { BundleSizeInfo } from './BundleAnalyzer';

// Export dependency optimization types
export { OptimizationStrategy } from './DependencyOptimizer';
export type { DependencyInfo } from './DependencyOptimizer';

// Export asset optimization types
export { AssetType, ImageFormat } from './AssetOptimizer';
export type { AssetInfo, AssetOptimizationRecommendation } from './AssetOptimizer';

/**
 * Initialize all performance optimization utilities
 * This can be called at app startup to ensure everything is properly initialized
 */
export async function initializePerformanceUtilities(): Promise<void> {
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
 * Combines insights from all optimization utilities
 */
export async function generatePerformanceReport(): Promise<{
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