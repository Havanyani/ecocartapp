/**
 * DependencyOptimizer.ts
 * 
 * Utility for analyzing and optimizing dependencies in the EcoCart app.
 * This helps identify large dependencies and provides strategies to
 * minimize their impact on bundle size.
 */

import AsyncStorage from '@react-native-async-storage/async-storage';

/**
 * Types of dependency optimization strategies
 */
export enum OptimizationStrategy {
  LAZY_LOADING = 'lazy_loading',
  TREE_SHAKING = 'tree_shaking',
  ALTERNATIVE_LIBRARY = 'alternative_library',
  FEATURE_REDUCTION = 'feature_reduction',
  CODE_SPLITTING = 'code_splitting',
}

/**
 * Dependency information with optimization suggestions
 */
export interface DependencyInfo {
  name: string;
  version: string;
  size: number; // Size in bytes
  gzipSize?: number; // Compressed size in bytes
  isTransitive: boolean;
  importPaths: string[];
  optimizationStrategies: Array<{
    strategy: OptimizationStrategy;
    potentialSavings: number;
    implementation: string;
  }>;
  alternatives?: Array<{
    name: string;
    size: number;
    compatibility: number; // 0-100% compatibility score
    migrationEffort: 'low' | 'medium' | 'high';
  }>;
}

/**
 * Storage key for saved dependency analysis results
 */
const DEPENDENCY_ANALYSIS_STORAGE_KEY = 'dependency_analysis_results';

/**
 * Common large dependencies in React Native apps
 */
const KNOWN_LARGE_DEPENDENCIES = [
  {
    name: 'moment',
    size: 550000,
    alternatives: [
      { name: 'date-fns', size: 85000, compatibility: 90, migrationEffort: 'medium' as const },
      { name: 'dayjs', size: 35000, compatibility: 95, migrationEffort: 'low' as const },
    ]
  },
  {
    name: 'lodash',
    size: 527000,
    alternatives: [
      { name: 'lodash-es', size: 240000, compatibility: 100, migrationEffort: 'low' as const },
      { name: 'individual lodash functions', size: 0, compatibility: 100, migrationEffort: 'medium' as const },
    ]
  },
  {
    name: 'redux',
    size: 150000,
    alternatives: [
      { name: 'zustand', size: 19000, compatibility: 85, migrationEffort: 'high' as const },
      { name: 'jotai', size: 12000, compatibility: 75, migrationEffort: 'high' as const },
    ]
  },
];

/**
 * DependencyOptimizer utility for identifying and minimizing large dependencies
 */
export class DependencyOptimizer {
  private static instance: DependencyOptimizer;
  private dependencies: Record<string, DependencyInfo> = {};
  
  /**
   * Private constructor for singleton pattern
   */
  private constructor() {
    this.loadDependencyAnalysis();
  }
  
  /**
   * Get the DependencyOptimizer instance (singleton)
   */
  public static getInstance(): DependencyOptimizer {
    if (!DependencyOptimizer.instance) {
      DependencyOptimizer.instance = new DependencyOptimizer();
    }
    return DependencyOptimizer.instance;
  }
  
  /**
   * Load previously saved dependency analysis
   */
  private async loadDependencyAnalysis(): Promise<void> {
    try {
      const savedAnalysis = await AsyncStorage.getItem(DEPENDENCY_ANALYSIS_STORAGE_KEY);
      if (savedAnalysis) {
        this.dependencies = JSON.parse(savedAnalysis);
      }
    } catch (error) {
      console.error('Error loading dependency analysis:', error);
    }
  }
  
  /**
   * Save dependency analysis to storage
   */
  private async saveDependencyAnalysis(): Promise<void> {
    try {
      await AsyncStorage.setItem(DEPENDENCY_ANALYSIS_STORAGE_KEY, JSON.stringify(this.dependencies));
    } catch (error) {
      console.error('Error saving dependency analysis:', error);
    }
  }
  
  /**
   * Record a dependency and its details
   */
  public recordDependency(
    name: string,
    version: string,
    size: number,
    importPaths: string[] = [],
    isTransitive: boolean = false
  ): void {
    // Get existing data or create a new entry
    const existing = this.dependencies[name] || {
      name,
      version,
      size,
      isTransitive,
      importPaths: [],
      optimizationStrategies: [],
    };
    
    // Update with new data
    existing.version = version;
    existing.size = size;
    existing.isTransitive = isTransitive;
    
    // Merge import paths (remove duplicates)
    existing.importPaths = Array.from(new Set([...existing.importPaths, ...importPaths]));
    
    // Generate optimization strategies
    this.generateOptimizationStrategies(existing);
    
    // Store the updated dependency info
    this.dependencies[name] = existing;
    
    // Persist to storage
    this.saveDependencyAnalysis();
  }
  
  /**
   * Generate optimization strategies for a dependency
   */
  private generateOptimizationStrategies(dependency: DependencyInfo): void {
    const strategies: Array<{
      strategy: OptimizationStrategy;
      potentialSavings: number;
      implementation: string;
    }> = [];
    
    // Strategy 1: Lazy loading (if dependency is large)
    if (dependency.size > 100000) {
      strategies.push({
        strategy: OptimizationStrategy.LAZY_LOADING,
        potentialSavings: Math.floor(dependency.size * 0.9), // 90% initial savings
        implementation: `
          // Instead of:
          // import { bigFeature } from '${dependency.name}';
          
          // Use dynamic import:
          const useBigFeature = async () => {
            const { bigFeature } = await import('${dependency.name}');
            // Use bigFeature here
          };
        `
      });
    }
    
    // Strategy 2: Tree shaking / selective imports
    strategies.push({
      strategy: OptimizationStrategy.TREE_SHAKING,
      potentialSavings: Math.floor(dependency.size * 0.6), // 60% estimated savings
      implementation: `
        // Instead of:
        // import { feature1, feature2, /* many more */ } from '${dependency.name}';
        
        // Import only what you need:
        import { feature1 } from '${dependency.name}/feature1';
        import { feature2 } from '${dependency.name}/feature2';
      `
    });
    
    // Strategy 3: Alternative libraries
    const knownDependency = KNOWN_LARGE_DEPENDENCIES.find(d => d.name === dependency.name);
    if (knownDependency?.alternatives) {
      const bestAlternative = knownDependency.alternatives[0];
      const savings = dependency.size - bestAlternative.size;
      
      if (savings > 0) {
        strategies.push({
          strategy: OptimizationStrategy.ALTERNATIVE_LIBRARY,
          potentialSavings: savings,
          implementation: `
            // Replace ${dependency.name} with ${bestAlternative.name}
            // Migration effort: ${bestAlternative.migrationEffort}
            // Compatibility: ${bestAlternative.compatibility}%
          `
        });
      }
      
      // Also store alternatives in the dependency info
      dependency.alternatives = knownDependency.alternatives;
    }
    
    // Sort strategies by potential savings (descending)
    dependency.optimizationStrategies = strategies.sort(
      (a, b) => b.potentialSavings - a.potentialSavings
    );
  }
  
  /**
   * Get information about a specific dependency
   */
  public getDependencyInfo(name: string): DependencyInfo | null {
    return this.dependencies[name] || null;
  }
  
  /**
   * Get all dependencies
   */
  public getAllDependencies(): DependencyInfo[] {
    return Object.values(this.dependencies);
  }
  
  /**
   * Get largest dependencies by size
   */
  public getLargestDependencies(limit: number = 10): DependencyInfo[] {
    return Object.values(this.dependencies)
      .sort((a, b) => b.size - a.size)
      .slice(0, limit);
  }
  
  /**
   * Calculate total size of all dependencies
   */
  public getTotalDependencySize(): number {
    return Object.values(this.dependencies)
      .reduce((total, dep) => total + dep.size, 0);
  }
  
  /**
   * Get all optimization strategies across dependencies
   */
  public getAllOptimizationStrategies(): Array<{
    dependency: string;
    strategy: OptimizationStrategy;
    potentialSavings: number;
    implementation: string;
  }> {
    const allStrategies: Array<{
      dependency: string;
      strategy: OptimizationStrategy;
      potentialSavings: number;
      implementation: string;
    }> = [];
    
    for (const dep of Object.values(this.dependencies)) {
      for (const strategy of dep.optimizationStrategies) {
        allStrategies.push({
          dependency: dep.name,
          ...strategy
        });
      }
    }
    
    // Sort by potential savings
    return allStrategies.sort((a, b) => b.potentialSavings - a.potentialSavings);
  }
  
  /**
   * Get best optimization strategies with highest impact
   */
  public getBestOptimizationStrategies(limit: number = 5): Array<{
    dependency: string;
    strategy: OptimizationStrategy;
    potentialSavings: number;
    implementation: string;
  }> {
    return this.getAllOptimizationStrategies().slice(0, limit);
  }
  
  /**
   * Generate a dependency optimization report
   */
  public generateOptimizationReport(): {
    totalDependencies: number;
    totalSize: number;
    largestDependencies: Array<{ name: string; size: number }>;
    potentialSavings: number;
    recommendedStrategies: Array<{
      dependency: string;
      strategy: OptimizationStrategy;
      potentialSavings: number;
    }>;
  } {
    const largestDeps = this.getLargestDependencies(5);
    const bestStrategies = this.getBestOptimizationStrategies(5);
    
    // Calculate potential savings from all recommended strategies
    // Note: We can't simply sum all savings as strategies might overlap
    // Using a conservative estimate of 70% of the sum
    const totalPotentialSavings = Math.floor(
      bestStrategies.reduce((sum, s) => sum + s.potentialSavings, 0) * 0.7
    );
    
    return {
      totalDependencies: Object.keys(this.dependencies).length,
      totalSize: this.getTotalDependencySize(),
      largestDependencies: largestDeps.map(d => ({
        name: d.name,
        size: d.size
      })),
      potentialSavings: totalPotentialSavings,
      recommendedStrategies: bestStrategies.map(s => ({
        dependency: s.dependency,
        strategy: s.strategy,
        potentialSavings: s.potentialSavings
      }))
    };
  }
  
  /**
   * Clear all dependency analysis data
   */
  public async clearAnalysisData(): Promise<void> {
    this.dependencies = {};
    await AsyncStorage.removeItem(DEPENDENCY_ANALYSIS_STORAGE_KEY);
  }
  
  /**
   * Scan package.json for dependencies (mock implementation)
   * In a real app, this would need to be implemented as a build-time tool
   */
  public async scanProjectDependencies(): Promise<void> {
    // This is a mock implementation that adds some example dependencies
    // In a real implementation, this would parse package.json and analyze the actual bundle
    
    // Example dependencies - in a real app these would be discovered automatically
    const exampleDeps = [
      { name: 'react-native', version: '0.71.8', size: 953000, importPaths: ['app/index.js', 'components/*'] },
      { name: 'expo', version: '48.0.0', size: 2100000, importPaths: ['app/index.js'] },
      { name: 'react-navigation', version: '6.0.0', size: 580000, importPaths: ['app/navigation.js'] },
      { name: 'victory-native', version: '36.6.8', size: 2200000, importPaths: ['screens/StatsScreen.js'] },
      { name: 'moment', version: '2.29.4', size: 550000, importPaths: ['utils/date.js'] },
      { name: 'lodash', version: '4.17.21', size: 527000, importPaths: ['utils/helpers.js', 'services/api.js'] },
      { name: 'axios', version: '1.3.4', size: 372000, importPaths: ['services/api.js'] },
      { name: 'redux', version: '4.2.1', size: 150000, importPaths: ['store/index.js'] },
      { name: 'react-redux', version: '8.0.5', size: 190000, importPaths: ['store/index.js'] },
      { name: 'react-native-reanimated', version: '3.0.2', size: 1200000, importPaths: ['components/animations.js'] },
    ];
    
    // Record each dependency
    for (const dep of exampleDeps) {
      this.recordDependency(dep.name, dep.version, dep.size, dep.importPaths);
    }
  }
}

// Export singleton instance
export default DependencyOptimizer.getInstance(); 