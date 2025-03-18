
/**
 * Interface for storage operation metrics
 */
interface StorageMetrics {
  // Operation counts
  mmkvReadCount: number;
  mmkvWriteCount: number;
  mmkvDeleteCount: number;
  sqliteReadCount: number;
  sqliteWriteCount: number;
  
  // Timing in milliseconds
  mmkvReadTime: number;
  mmkvWriteTime: number;
  mmkvDeleteTime: number;
  sqliteReadTime: number;
  sqliteWriteTime: number;
  
  // Sizes in bytes
  mmkvStorageSize: number;
  sqliteStorageSize: number;
  
  // Error counts
  mmkvErrors: number;
  sqliteErrors: number;
  
  // Timestamp for when metrics were last reset
  resetTimestamp: number;
}

/**
 * Storage operation tracking entry
 */
interface StorageOperation {
  type: 'mmkv-read' | 'mmkv-write' | 'mmkv-delete' | 'sqlite-read' | 'sqlite-write';
  key?: string;
  table?: string;
  startTime: number;
  endTime?: number;
  success: boolean;
  error?: string;
  size?: number;
}

/**
 * Utility for monitoring and logging storage operations
 */
export class StorageMonitor {
  private static instance: StorageMonitor;
  
  // Flag to enable/disable monitoring
  private isMonitoring = false;
  
  // Current metrics
  private metrics: StorageMetrics = {
    mmkvReadCount: 0,
    mmkvWriteCount: 0,
    mmkvDeleteCount: 0,
    sqliteReadCount: 0,
    sqliteWriteCount: 0,
    mmkvReadTime: 0,
    mmkvWriteTime: 0,
    mmkvDeleteTime: 0,
    sqliteReadTime: 0,
    sqliteWriteTime: 0,
    mmkvStorageSize: 0,
    sqliteStorageSize: 0,
    mmkvErrors: 0,
    sqliteErrors: 0,
    resetTimestamp: Date.now()
  };
  
  // Queue of recent operations for analysis
  private recentOperations: StorageOperation[] = [];
  private maxRecentOperations = 100;
  
  // Listeners for real-time monitoring
  private listeners: Array<(metrics: StorageMetrics) => void> = [];
  
  private constructor() {
    // Private constructor for singleton pattern
  }
  
  /**
   * Get the singleton instance
   */
  public static getInstance(): StorageMonitor {
    if (!StorageMonitor.instance) {
      StorageMonitor.instance = new StorageMonitor();
    }
    return StorageMonitor.instance;
  }
  
  /**
   * Start monitoring storage operations
   */
  public startMonitoring(): void {
    this.isMonitoring = true;
    this.metrics.resetTimestamp = Date.now();
    console.log('Storage monitoring started');
    
    // Here we would hook into the StorageService to monitor all operations
    // This would involve extending the StorageService with monitoring capability
    // For now, we'll simulate this by providing a wrapper API
  }
  
  /**
   * Stop monitoring storage operations
   */
  public stopMonitoring(): void {
    this.isMonitoring = false;
    console.log('Storage monitoring stopped');
  }
  
  /**
   * Reset all metrics
   */
  public resetMetrics(): void {
    this.metrics = {
      mmkvReadCount: 0,
      mmkvWriteCount: 0,
      mmkvDeleteCount: 0,
      sqliteReadCount: 0,
      sqliteWriteCount: 0,
      mmkvReadTime: 0,
      mmkvWriteTime: 0,
      mmkvDeleteTime: 0,
      sqliteReadTime: 0,
      sqliteWriteTime: 0,
      mmkvStorageSize: 0,
      sqliteStorageSize: 0,
      mmkvErrors: 0,
      sqliteErrors: 0,
      resetTimestamp: Date.now()
    };
    this.recentOperations = [];
    
    // Notify all listeners
    this.notifyListeners();
    
    console.log('Storage metrics reset');
  }
  
  /**
   * Get current storage metrics
   */
  public getMetrics(): StorageMetrics {
    return { ...this.metrics };
  }
  
  /**
   * Get recent operations for analysis
   */
  public getRecentOperations(): StorageOperation[] {
    return [...this.recentOperations];
  }
  
  /**
   * Add a listener for real-time metrics updates
   */
  public addListener(listener: (metrics: StorageMetrics) => void): () => void {
    this.listeners.push(listener);
    
    // Return a function to remove the listener
    return () => {
      this.listeners = this.listeners.filter(l => l !== listener);
    };
  }
  
  /**
   * Notify all listeners of metrics update
   */
  private notifyListeners(): void {
    const metrics = this.getMetrics();
    this.listeners.forEach(listener => {
      try {
        listener(metrics);
      } catch (error) {
        console.error('Error in storage metrics listener:', error);
      }
    });
  }
  
  /**
   * Record a storage operation
   */
  private recordOperation(operation: StorageOperation): void {
    if (!this.isMonitoring) return;
    
    // Complete the operation record if endTime is not set
    if (!operation.endTime) {
      operation.endTime = Date.now();
    }
    
    // Calculate duration
    const duration = operation.endTime - operation.startTime;
    
    // Update metrics based on operation type
    switch (operation.type) {
      case 'mmkv-read':
        this.metrics.mmkvReadCount++;
        this.metrics.mmkvReadTime += duration;
        if (!operation.success) this.metrics.mmkvErrors++;
        break;
      
      case 'mmkv-write':
        this.metrics.mmkvWriteCount++;
        this.metrics.mmkvWriteTime += duration;
        if (!operation.success) this.metrics.mmkvErrors++;
        if (operation.size) this.metrics.mmkvStorageSize += operation.size;
        break;
      
      case 'mmkv-delete':
        this.metrics.mmkvDeleteCount++;
        this.metrics.mmkvDeleteTime += duration;
        if (!operation.success) this.metrics.mmkvErrors++;
        break;
      
      case 'sqlite-read':
        this.metrics.sqliteReadCount++;
        this.metrics.sqliteReadTime += duration;
        if (!operation.success) this.metrics.sqliteErrors++;
        break;
      
      case 'sqlite-write':
        this.metrics.sqliteWriteCount++;
        this.metrics.sqliteWriteTime += duration;
        if (!operation.success) this.metrics.sqliteErrors++;
        if (operation.size) this.metrics.sqliteStorageSize += operation.size;
        break;
    }
    
    // Add to recent operations queue
    this.recentOperations.push(operation);
    
    // Trim recent operations if needed
    if (this.recentOperations.length > this.maxRecentOperations) {
      this.recentOperations.shift();
    }
    
    // Notify listeners
    this.notifyListeners();
  }
  
  /**
   * MMKV Read tracking wrapper
   */
  public trackMMKVRead<T>(key: string, operation: () => T): T {
    if (!this.isMonitoring) return operation();
    
    const startTime = Date.now();
    let success = true;
    let result: T;
    let error: Error | undefined;
    
    try {
      result = operation();
      return result;
    } catch (e) {
      success = false;
      error = e as Error;
      throw e;
    } finally {
      this.recordOperation({
        type: 'mmkv-read',
        key,
        startTime,
        endTime: Date.now(),
        success,
        error: error?.message,
      });
    }
  }
  
  /**
   * MMKV Write tracking wrapper
   */
  public trackMMKVWrite<T>(key: string, value: any, operation: () => T): T {
    if (!this.isMonitoring) return operation();
    
    const startTime = Date.now();
    let success = true;
    let result: T;
    let error: Error | undefined;
    
    // Estimate size in bytes
    let size = 0;
    try {
      if (typeof value === 'string') {
        size = value.length * 2; // Rough UTF-16 estimation
      } else {
        size = JSON.stringify(value).length * 2;
      }
    } catch {
      // Ignore size calculation errors
    }
    
    try {
      result = operation();
      return result;
    } catch (e) {
      success = false;
      error = e as Error;
      throw e;
    } finally {
      this.recordOperation({
        type: 'mmkv-write',
        key,
        startTime,
        endTime: Date.now(),
        success,
        error: error?.message,
        size
      });
    }
  }
  
  /**
   * MMKV Delete tracking wrapper
   */
  public trackMMKVDelete(key: string, operation: () => void): void {
    if (!this.isMonitoring) return operation();
    
    const startTime = Date.now();
    let success = true;
    let error: Error | undefined;
    
    try {
      operation();
    } catch (e) {
      success = false;
      error = e as Error;
      throw e;
    } finally {
      this.recordOperation({
        type: 'mmkv-delete',
        key,
        startTime,
        endTime: Date.now(),
        success,
        error: error?.message,
      });
    }
  }
  
  /**
   * SQLite Read tracking wrapper
   */
  public async trackSQLiteRead<T>(table: string, operation: () => Promise<T>): Promise<T> {
    if (!this.isMonitoring) return operation();
    
    const startTime = Date.now();
    let success = true;
    let result: T;
    let error: Error | undefined;
    
    try {
      result = await operation();
      return result;
    } catch (e) {
      success = false;
      error = e as Error;
      throw e;
    } finally {
      this.recordOperation({
        type: 'sqlite-read',
        table,
        startTime,
        endTime: Date.now(),
        success,
        error: error?.message,
      });
    }
  }
  
  /**
   * SQLite Write tracking wrapper
   */
  public async trackSQLiteWrite<T>(table: string, data: any, operation: () => Promise<T>): Promise<T> {
    if (!this.isMonitoring) return operation();
    
    const startTime = Date.now();
    let success = true;
    let result: T;
    let error: Error | undefined;
    
    // Estimate size in bytes
    let size = 0;
    try {
      size = JSON.stringify(data).length;
    } catch {
      // Ignore size calculation errors
    }
    
    try {
      result = await operation();
      return result;
    } catch (e) {
      success = false;
      error = e as Error;
      throw e;
    } finally {
      this.recordOperation({
        type: 'sqlite-write',
        table,
        startTime,
        endTime: Date.now(),
        success,
        error: error?.message,
        size
      });
    }
  }
  
  /**
   * Generate a report of storage metrics
   */
  public generateReport(): string {
    const metrics = this.getMetrics();
    const uptime = Date.now() - metrics.resetTimestamp;
    const uptimeHours = (uptime / (1000 * 60 * 60)).toFixed(2);
    
    let report = `# Storage Monitoring Report\n\n`;
    report += `Monitoring active for ${uptimeHours} hours\n\n`;
    
    report += `## MMKV Operations\n\n`;
    report += `- Read operations: ${metrics.mmkvReadCount}\n`;
    report += `- Write operations: ${metrics.mmkvWriteCount}\n`;
    report += `- Delete operations: ${metrics.mmkvDeleteCount}\n`;
    report += `- Total operations: ${metrics.mmkvReadCount + metrics.mmkvWriteCount + metrics.mmkvDeleteCount}\n`;
    report += `- Average read time: ${metrics.mmkvReadCount > 0 ? (metrics.mmkvReadTime / metrics.mmkvReadCount).toFixed(2) : 0}ms\n`;
    report += `- Average write time: ${metrics.mmkvWriteCount > 0 ? (metrics.mmkvWriteTime / metrics.mmkvWriteCount).toFixed(2) : 0}ms\n`;
    report += `- Errors: ${metrics.mmkvErrors}\n`;
    report += `- Estimated storage size: ${(metrics.mmkvStorageSize / 1024).toFixed(2)} KB\n\n`;
    
    report += `## SQLite Operations\n\n`;
    report += `- Read operations: ${metrics.sqliteReadCount}\n`;
    report += `- Write operations: ${metrics.sqliteWriteCount}\n`;
    report += `- Total operations: ${metrics.sqliteReadCount + metrics.sqliteWriteCount}\n`;
    report += `- Average read time: ${metrics.sqliteReadCount > 0 ? (metrics.sqliteReadTime / metrics.sqliteReadCount).toFixed(2) : 0}ms\n`;
    report += `- Average write time: ${metrics.sqliteWriteCount > 0 ? (metrics.sqliteWriteTime / metrics.sqliteWriteCount).toFixed(2) : 0}ms\n`;
    report += `- Errors: ${metrics.sqliteErrors}\n`;
    report += `- Estimated storage size: ${(metrics.sqliteStorageSize / 1024).toFixed(2)} KB\n\n`;
    
    report += `## Recent Slow Operations\n\n`;
    
    // Find slow operations (more than 100ms)
    const slowOperations = this.recentOperations
      .filter(op => (op.endTime! - op.startTime) > 100)
      .sort((a, b) => (b.endTime! - b.startTime) - (a.endTime! - a.startTime));
    
    if (slowOperations.length > 0) {
      report += `| Type | Key/Table | Duration (ms) |\n`;
      report += `|------|-----------|---------------|\n`;
      
      slowOperations.slice(0, 10).forEach(op => {
        report += `| ${op.type} | ${op.key || op.table || 'Unknown'} | ${op.endTime! - op.startTime} |\n`;
      });
    } else {
      report += 'No slow operations detected (>100ms)\n';
    }
    
    return report;
  }
}

// Export singleton instance
export const StorageMonitorInstance = StorageMonitor.getInstance(); 