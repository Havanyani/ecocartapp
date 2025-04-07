/**
 * Web-specific mock for PerformanceDataManager
 * Provides stubs for file operations that aren't available in web
 */

export interface BackupInfo {
  size: number;
  compressionSavings: number;
  timestamp: number;
  metadata: {
    deviceInfo: {
      platform: string;
      version: string;
    };
    appVersion: string;
    compression: {
      enabled: boolean;
      algorithm: string;
      originalSize: number;
      compressedSize: number;
    };
  };
}

export class PerformanceDataManager {
  private static instance: PerformanceDataManager;

  private constructor() {
    console.log('PerformanceDataManager initialized in web environment (limited functionality)');
  }

  static getInstance(): PerformanceDataManager {
    if (!PerformanceDataManager.instance) {
      PerformanceDataManager.instance = new PerformanceDataManager();
    }
    return PerformanceDataManager.instance;
  }

  async createBackup(): Promise<string> {
    console.warn('Backup creation not supported in web environment');
    return 'web-mock-backup-path';
  }

  async restoreFromBackup(backupPath: string): Promise<void> {
    console.warn('Backup restoration not supported in web environment', { backupPath });
    return Promise.resolve();
  }

  async getBackupFiles(): Promise<string[]> {
    console.warn('Backup file listing not supported in web environment');
    return [];
  }

  async shareBackup(backupPath: string): Promise<void> {
    console.warn('Backup sharing not supported in web environment', { backupPath });
    return Promise.resolve();
  }

  async deleteBackup(backupPath: string): Promise<void> {
    console.warn('Backup deletion not supported in web environment', { backupPath });
    return Promise.resolve();
  }

  async getBackupInfo(backupPath: string): Promise<BackupInfo> {
    console.warn('Backup info not available in web environment', { backupPath });
    return {
      size: 0,
      compressionSavings: 0,
      timestamp: Date.now(),
      metadata: {
        deviceInfo: {
          platform: 'web',
          version: 'unknown',
        },
        appVersion: '1.0.0',
        compression: {
          enabled: false,
          algorithm: 'none',
          originalSize: 0,
          compressedSize: 0,
        },
      },
    };
  }
}

export default PerformanceDataManager; 