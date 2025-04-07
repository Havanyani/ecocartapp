/**
 * AssetOptimizer.ts
 * 
 * Utility for optimizing assets like images, fonts, and other media files
 * to reduce their impact on bundle size and improve app loading times.
 */

import AsyncStorage from '@react-native-async-storage/async-storage';

/**
 * Types of assets that can be optimized
 */
export enum AssetType {
  IMAGE = 'image',
  FONT = 'font',
  SOUND = 'sound',
  VIDEO = 'video',
  OTHER = 'other'
}

/**
 * Image formats supported
 */
export enum ImageFormat {
  JPEG = 'jpeg',
  PNG = 'png',
  WEBP = 'webp',
  GIF = 'gif',
  SVG = 'svg'
}

/**
 * Asset optimization recommendation
 */
export interface AssetOptimizationRecommendation {
  path: string;
  type: AssetType;
  currentSize: number;
  potentialSize: number;
  savingsPercent: number;
  recommendation: string;
  priority: 'high' | 'medium' | 'low';
}

/**
 * Asset information with optimization details
 */
export interface AssetInfo {
  path: string;
  type: AssetType;
  size: number;
  dimensions?: {
    width: number;
    height: number;
  };
  format?: ImageFormat;
  isOptimized: boolean;
  optimizedPath?: string;
  optimizedSize?: number;
  savingsPercent?: number;
}

/**
 * Storage key for saved asset analysis results
 */
const ASSET_ANALYSIS_STORAGE_KEY = 'asset_analysis_results';

/**
 * AssetOptimizer utility for identifying and optimizing assets
 */
export class AssetOptimizer {
  private static instance: AssetOptimizer;
  private assets: Record<string, AssetInfo> = {};
  private optimizationRecommendations: AssetOptimizationRecommendation[] = [];
  
  /**
   * Private constructor for singleton pattern
   */
  private constructor() {
    this.loadAssetAnalysis();
  }
  
  /**
   * Get the AssetOptimizer instance (singleton)
   */
  public static getInstance(): AssetOptimizer {
    if (!AssetOptimizer.instance) {
      AssetOptimizer.instance = new AssetOptimizer();
    }
    return AssetOptimizer.instance;
  }
  
  /**
   * Load previously saved asset analysis
   */
  private async loadAssetAnalysis(): Promise<void> {
    try {
      const savedAnalysis = await AsyncStorage.getItem(ASSET_ANALYSIS_STORAGE_KEY);
      if (savedAnalysis) {
        const parsed = JSON.parse(savedAnalysis);
        this.assets = parsed.assets || {};
        this.optimizationRecommendations = parsed.recommendations || [];
      }
    } catch (error) {
      console.error('Error loading asset analysis:', error);
    }
  }
  
  /**
   * Save asset analysis to storage
   */
  private async saveAssetAnalysis(): Promise<void> {
    try {
      const dataToSave = {
        assets: this.assets,
        recommendations: this.optimizationRecommendations,
        lastUpdated: Date.now()
      };
      await AsyncStorage.setItem(ASSET_ANALYSIS_STORAGE_KEY, JSON.stringify(dataToSave));
    } catch (error) {
      console.error('Error saving asset analysis:', error);
    }
  }
  
  /**
   * Scan project assets and analyze them
   */
  public async scanAssets(): Promise<void> {
    // This is a mock implementation that adds some example assets
    // In a real implementation, this would scan the project directories
    
    // Example assets - in a real app these would be discovered automatically
    const exampleAssets = [
      { 
        path: 'assets/images/eco-logo.png', 
        type: AssetType.IMAGE, 
        size: 1200000, 
        dimensions: { width: 1024, height: 1024 },
        format: ImageFormat.PNG
      },
      { 
        path: 'assets/images/background.jpg', 
        type: AssetType.IMAGE, 
        size: 3500000, 
        dimensions: { width: 2048, height: 1536 },
        format: ImageFormat.JPEG
      },
      { 
        path: 'assets/images/banner.png', 
        type: AssetType.IMAGE, 
        size: 2100000, 
        dimensions: { width: 1920, height: 800 },
        format: ImageFormat.PNG
      },
      { 
        path: 'assets/fonts/custom-font.ttf', 
        type: AssetType.FONT, 
        size: 850000
      },
      { 
        path: 'assets/sounds/notification.mp3', 
        type: AssetType.SOUND, 
        size: 450000
      },
      { 
        path: 'assets/images/product1.png', 
        type: AssetType.IMAGE, 
        size: 1450000, 
        dimensions: { width: 1200, height: 1200 },
        format: ImageFormat.PNG
      },
      { 
        path: 'assets/images/product2.png', 
        type: AssetType.IMAGE, 
        size: 1350000, 
        dimensions: { width: 1200, height: 1200 },
        format: ImageFormat.PNG
      },
      { 
        path: 'assets/images/icons/cart.png', 
        type: AssetType.IMAGE, 
        size: 120000, 
        dimensions: { width: 256, height: 256 },
        format: ImageFormat.PNG
      },
      { 
        path: 'assets/images/icons/profile.png', 
        type: AssetType.IMAGE, 
        size: 110000, 
        dimensions: { width: 256, height: 256 },
        format: ImageFormat.PNG
      },
      { 
        path: 'assets/videos/tutorial.mp4', 
        type: AssetType.VIDEO, 
        size: 12000000
      },
    ];
    
    // Record each asset
    for (const asset of exampleAssets) {
      this.recordAsset(
        asset.path,
        asset.type,
        asset.size,
        asset.dimensions,
        asset.format as ImageFormat | undefined
      );
    }
    
    // Generate recommendations
    this.generateAssetOptimizationRecommendations();
  }
  
  /**
   * Record asset information
   */
  public recordAsset(
    path: string,
    type: AssetType,
    size: number,
    dimensions?: { width: number; height: number },
    format?: ImageFormat
  ): void {
    this.assets[path] = {
      path,
      type,
      size,
      dimensions,
      format,
      isOptimized: false
    };
    
    this.saveAssetAnalysis();
  }
  
  /**
   * Generate recommendations for asset optimization
   */
  private generateAssetOptimizationRecommendations(): void {
    const recommendations: AssetOptimizationRecommendation[] = [];
    
    for (const [path, asset] of Object.entries(this.assets)) {
      if (asset.isOptimized) {
        continue; // Skip already optimized assets
      }
      
      let recommendation = '';
      let potentialSize = asset.size;
      let priority: 'high' | 'medium' | 'low' = 'low';
      
      switch (asset.type) {
        case AssetType.IMAGE:
          // Large PNG images should be converted to WebP or compressed JPEG
          if (asset.format === ImageFormat.PNG && asset.size > 500000) {
            potentialSize = Math.floor(asset.size * 0.3); // 70% reduction
            recommendation = `Convert large PNG image to WebP format for better compression.`;
            priority = 'high';
          } 
          // Large JPEGs should be optimized and resized
          else if (asset.format === ImageFormat.JPEG && asset.size > 1000000) {
            potentialSize = Math.floor(asset.size * 0.5); // 50% reduction
            recommendation = `Compress and resize large JPEG image.`;
            priority = 'high';
          } 
          // Images with large dimensions should be resized based on device needs
          else if (asset.dimensions && (asset.dimensions.width > 1000 || asset.dimensions.height > 1000)) {
            potentialSize = Math.floor(asset.size * 0.6); // 40% reduction
            recommendation = `Resize large image (${asset.dimensions.width}x${asset.dimensions.height}) to appropriate dimensions.`;
            priority = 'medium';
          } 
          // Icon images should be small or use SVGs
          else if (path.includes('icons') && asset.size > 50000) {
            potentialSize = Math.floor(asset.size * 0.4); // 60% reduction
            recommendation = `Convert icon to SVG or optimize PNG for smaller size.`;
            priority = 'medium';
          } 
          // General image optimization
          else if (asset.size > 100000) {
            potentialSize = Math.floor(asset.size * 0.7); // 30% reduction
            recommendation = `Apply general image compression.`;
            priority = 'low';
          }
          break;
          
        case AssetType.FONT:
          // Optimize custom fonts or use system fonts
          potentialSize = Math.floor(asset.size * 0.6); // 40% reduction
          recommendation = `Subset custom font to include only needed characters or consider using system fonts.`;
          priority = asset.size > 500000 ? 'high' : 'medium';
          break;
          
        case AssetType.SOUND:
          // Optimize audio files
          potentialSize = Math.floor(asset.size * 0.7); // 30% reduction
          recommendation = `Compress audio file or use lower bitrate.`;
          priority = asset.size > 1000000 ? 'high' : 'low';
          break;
          
        case AssetType.VIDEO:
          // Optimize video files
          potentialSize = Math.floor(asset.size * 0.5); // 50% reduction
          recommendation = `Compress video, use lower resolution, or stream from external source.`;
          priority = 'high';
          break;
          
        default:
          // General recommendation for other asset types
          potentialSize = Math.floor(asset.size * 0.8); // 20% reduction
          recommendation = `Investigate asset size and optimize if possible.`;
          priority = asset.size > 1000000 ? 'medium' : 'low';
          break;
      }
      
      const savingsPercent = Math.floor(((asset.size - potentialSize) / asset.size) * 100);
      
      if (savingsPercent > 10) { // Only recommend if savings is >10%
        recommendations.push({
          path,
          type: asset.type,
          currentSize: asset.size,
          potentialSize,
          savingsPercent,
          recommendation,
          priority
        });
      }
    }
    
    // Sort by priority (high to low) and then by savings percent
    this.optimizationRecommendations = recommendations.sort((a, b) => {
      const priorityMap = { high: 3, medium: 2, low: 1 };
      const priorityDiff = priorityMap[b.priority] - priorityMap[a.priority];
      if (priorityDiff !== 0) return priorityDiff;
      return b.savingsPercent - a.savingsPercent;
    });
    
    this.saveAssetAnalysis();
  }
  
  /**
   * Mark an asset as optimized and record the new size
   */
  public markAssetAsOptimized(
    path: string,
    optimizedPath: string,
    optimizedSize: number
  ): void {
    const asset = this.assets[path];
    if (!asset) return;
    
    asset.isOptimized = true;
    asset.optimizedPath = optimizedPath;
    asset.optimizedSize = optimizedSize;
    asset.savingsPercent = Math.floor(((asset.size - optimizedSize) / asset.size) * 100);
    
    // Remove from recommendations
    this.optimizationRecommendations = this.optimizationRecommendations.filter(
      rec => rec.path !== path
    );
    
    this.saveAssetAnalysis();
  }
  
  /**
   * Get all asset optimization recommendations
   */
  public getAssetOptimizationRecommendations(): AssetOptimizationRecommendation[] {
    return [...this.optimizationRecommendations];
  }
  
  /**
   * Get top asset optimization recommendations by priority and savings
   */
  public getTopOptimizationRecommendations(limit: number = 10): AssetOptimizationRecommendation[] {
    return this.optimizationRecommendations.slice(0, limit);
  }
  
  /**
   * Get assets by type
   */
  public getAssetsByType(type: AssetType): AssetInfo[] {
    return Object.values(this.assets).filter(asset => asset.type === type);
  }
  
  /**
   * Get all assets
   */
  public getAllAssets(): AssetInfo[] {
    return Object.values(this.assets);
  }
  
  /**
   * Calculate total size of all assets
   */
  public getTotalAssetSize(): number {
    return Object.values(this.assets).reduce((total, asset) => total + asset.size, 0);
  }
  
  /**
   * Calculate optimized size of all assets (including projected savings)
   */
  public getOptimizedAssetSize(): number {
    return Object.values(this.assets).reduce((total, asset) => {
      if (asset.isOptimized && asset.optimizedSize !== undefined) {
        return total + asset.optimizedSize;
      }
      
      // For non-optimized assets, find if there's a recommendation
      const recommendation = this.optimizationRecommendations.find(rec => rec.path === asset.path);
      if (recommendation) {
        return total + recommendation.potentialSize;
      }
      
      return total + asset.size;
    }, 0);
  }
  
  /**
   * Calculate potential savings from asset optimization
   */
  public getPotentialAssetSavings(): number {
    const currentTotal = this.getTotalAssetSize();
    const optimizedTotal = this.getOptimizedAssetSize();
    return currentTotal - optimizedTotal;
  }
  
  /**
   * Generate asset optimization report
   */
  public generateAssetOptimizationReport(): {
    totalAssets: number;
    totalSize: number;
    optimizedSize: number;
    potentialSavings: number;
    savingsPercent: number;
    recommendationsByType: Record<AssetType, number>;
    topRecommendations: Array<{
      path: string;
      type: AssetType;
      currentSize: number;
      potentialSavings: number;
      recommendation: string;
    }>;
  } {
    const totalSize = this.getTotalAssetSize();
    const optimizedSize = this.getOptimizedAssetSize();
    const potentialSavings = totalSize - optimizedSize;
    const savingsPercent = Math.floor((potentialSavings / totalSize) * 100);
    
    // Count recommendations by type
    const recommendationsByType = Object.values(AssetType).reduce((counts, type) => {
      counts[type] = this.optimizationRecommendations.filter(rec => rec.type === type).length;
      return counts;
    }, {} as Record<AssetType, number>);
    
    // Format top recommendations
    const topRecommendations = this.getTopOptimizationRecommendations(5).map(rec => ({
      path: rec.path,
      type: rec.type,
      currentSize: rec.currentSize,
      potentialSavings: rec.currentSize - rec.potentialSize,
      recommendation: rec.recommendation
    }));
    
    return {
      totalAssets: Object.keys(this.assets).length,
      totalSize,
      optimizedSize,
      potentialSavings,
      savingsPercent,
      recommendationsByType,
      topRecommendations
    };
  }
  
  /**
   * Helper function to format file size to human-readable string
   */
  public formatFileSize(bytes: number): string {
    if (bytes < 1024) return `${bytes} B`;
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(2)} KB`;
    if (bytes < 1024 * 1024 * 1024) return `${(bytes / (1024 * 1024)).toFixed(2)} MB`;
    return `${(bytes / (1024 * 1024 * 1024)).toFixed(2)} GB`;
  }
  
  /**
   * Clear all asset analysis data
   */
  public async clearAnalysisData(): Promise<void> {
    this.assets = {};
    this.optimizationRecommendations = [];
    await AsyncStorage.removeItem(ASSET_ANALYSIS_STORAGE_KEY);
  }
}

// Export singleton instance
export default AssetOptimizer.getInstance(); 