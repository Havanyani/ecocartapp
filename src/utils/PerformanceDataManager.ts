import * as FileSystem from 'expo-file-system';
import { Platform, Share } from 'react-native';
import { unzip, zip } from 'react-native-zip-archive';
import { performanceOptimizer } from './PerformanceOptimizer';

interface BackupData {
  version: string;
  timestamp: number;
  snapshots: any[];
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

export interface BackupInfo {
  size: number;
  compressionSavings: number;
  timestamp: number;
  metadata: BackupData['metadata'];
}

export class PerformanceDataManager {
  private static instance: PerformanceDataManager;
  private static readonly BACKUP_DIR = `${FileSystem.documentDirectory}performance_backups/`;
  private static readonly BACKUP_FILE_PREFIX = 'performance_backup_';
  private static readonly COMPRESSION_ENABLED = true;

  private constructor() {
    this.initializeBackupDirectory();
  }

  static getInstance(): PerformanceDataManager {
    if (!PerformanceDataManager.instance) {
      PerformanceDataManager.instance = new PerformanceDataManager();
    }
    return PerformanceDataManager.instance;
  }

  private async initializeBackupDirectory(): Promise<void> {
    try {
      const dirInfo = await FileSystem.getInfoAsync(PerformanceDataManager.BACKUP_DIR);
      if (!dirInfo.exists) {
        await FileSystem.makeDirectoryAsync(PerformanceDataManager.BACKUP_DIR, { intermediates: true });
      }
    } catch (error) {
      console.error('Failed to initialize backup directory:', error);
    }
  }

  async createBackup(): Promise<string> {
    try {
      const snapshots = await performanceOptimizer.getSnapshots();
      const backupData: BackupData = {
        version: '1.0',
        timestamp: Date.now(),
        snapshots,
        metadata: {
          deviceInfo: {
            platform: Platform.OS,
            version: Platform.Version.toString(),
          },
          appVersion: '1.0.0', // TODO: Get from app config
          compression: {
            enabled: false,
            algorithm: '',
            originalSize: 0,
            compressedSize: 0,
          },
        },
      };

      const backupFileName = `${PerformanceDataManager.BACKUP_FILE_PREFIX}${new Date().toISOString().replace(/[:.]/g, '-')}`;
      const jsonPath = `${PerformanceDataManager.BACKUP_DIR}${backupFileName}.json`;
      const zipPath = `${PerformanceDataManager.BACKUP_DIR}${backupFileName}.zip`;

      // Write JSON file first
      await FileSystem.writeAsStringAsync(jsonPath, JSON.stringify(backupData, null, 2));

      let finalPath = jsonPath;
      const fileInfo = await FileSystem.getInfoAsync(jsonPath);
      let fileSize = fileInfo.exists ? (fileInfo as FileSystem.FileInfo).size || 0 : 0;

      // Compress if enabled and file is large enough
      if (PerformanceDataManager.COMPRESSION_ENABLED && fileSize > 1024 * 1024) { // Only compress files larger than 1MB
        try {
          await zip(jsonPath, zipPath);
          const zipInfo = await FileSystem.getInfoAsync(zipPath);
          const compressedSize = zipInfo.exists ? (zipInfo as FileSystem.FileInfo).size || 0 : 0;
          
          // Update metadata with compression info
          backupData.metadata.compression = {
            enabled: true,
            algorithm: 'zip',
            originalSize: fileSize,
            compressedSize,
          };

          // Update the zip file with new metadata
          await FileSystem.writeAsStringAsync(jsonPath, JSON.stringify(backupData, null, 2));
          await zip(jsonPath, zipPath);

          // Delete the JSON file and use the zip file
          await FileSystem.deleteAsync(jsonPath);
          finalPath = zipPath;
        } catch (error) {
          console.error('Compression failed, using uncompressed backup:', error);
        }
      }

      // Clean up old backups (keep last 5)
      await this.cleanupOldBackups();

      return finalPath;
    } catch (error) {
      console.error('Failed to create backup:', error);
      throw error;
    }
  }

  async restoreFromBackup(backupPath: string): Promise<void> {
    try {
      let backupContent: string;
      const isCompressed = backupPath.endsWith('.zip');

      if (isCompressed) {
        // Extract zip file to temporary directory
        const tempDir = `${FileSystem.cacheDirectory}temp_backup/`;
        await FileSystem.makeDirectoryAsync(tempDir, { intermediates: true });
        await unzip(backupPath, tempDir);
        
        // Read the JSON file from the extracted directory
        const jsonFile = `${tempDir}${backupPath.split('/').pop()?.replace('.zip', '.json')}`;
        backupContent = await FileSystem.readAsStringAsync(jsonFile);
        
        // Clean up temporary directory
        await FileSystem.deleteAsync(tempDir, { idempotent: true });
      } else {
        backupContent = await FileSystem.readAsStringAsync(backupPath);
      }

      const backupData: BackupData = JSON.parse(backupContent);

      // Validate backup data
      if (!this.validateBackupData(backupData)) {
        throw new Error('Invalid backup data format');
      }

      // Clear existing data
      await performanceOptimizer.clearSnapshots();

      // Restore snapshots
      for (const snapshot of backupData.snapshots) {
        await performanceOptimizer.saveSnapshot(snapshot.metrics, snapshot.suggestions);
      }
    } catch (error) {
      console.error('Failed to restore from backup:', error);
      throw error;
    }
  }

  private validateBackupData(data: any): data is BackupData {
    return (
      data &&
      typeof data.version === 'string' &&
      typeof data.timestamp === 'number' &&
      Array.isArray(data.snapshots) &&
      data.metadata &&
      typeof data.metadata.deviceInfo === 'object' &&
      typeof data.metadata.appVersion === 'string' &&
      typeof data.metadata.compression === 'object'
    );
  }

  private async cleanupOldBackups(): Promise<void> {
    try {
      const backupFiles = await FileSystem.readDirectoryAsync(PerformanceDataManager.BACKUP_DIR);
      const backupPaths = backupFiles
        .filter(file => file.startsWith(PerformanceDataManager.BACKUP_FILE_PREFIX))
        .map(file => `${PerformanceDataManager.BACKUP_DIR}${file}`);

      if (backupPaths.length > 5) {
        const sortedBackups = backupPaths.sort((a, b) => {
          const aTime = parseInt(a.split('_').pop()?.split('.')[0] || '0');
          const bTime = parseInt(b.split('_').pop()?.split('.')[0] || '0');
          return bTime - aTime;
        });

        // Delete oldest backups
        for (const backup of sortedBackups.slice(5)) {
          await FileSystem.deleteAsync(backup);
        }
      }
    } catch (error) {
      console.error('Failed to cleanup old backups:', error);
    }
  }

  async getBackupFiles(): Promise<string[]> {
    try {
      const backupFiles = await FileSystem.readDirectoryAsync(PerformanceDataManager.BACKUP_DIR);
      return backupFiles
        .filter(file => file.startsWith(PerformanceDataManager.BACKUP_FILE_PREFIX))
        .map(file => `${PerformanceDataManager.BACKUP_DIR}${file}`);
    } catch (error) {
      console.error('Failed to get backup files:', error);
      return [];
    }
  }

  async shareBackup(backupPath: string): Promise<void> {
    try {
      await Share.share({
        url: backupPath,
        title: 'Performance Data Backup',
      });
    } catch (error) {
      console.error('Failed to share backup:', error);
      throw error;
    }
  }

  async deleteBackup(backupPath: string): Promise<void> {
    try {
      await FileSystem.deleteAsync(backupPath);
    } catch (error) {
      console.error('Failed to delete backup:', error);
      throw error;
    }
  }

  async getBackupInfo(backupPath: string): Promise<BackupInfo> {
    try {
      let backupContent: string;
      const isCompressed = backupPath.endsWith('.zip');

      if (isCompressed) {
        // Extract zip file to temporary directory
        const tempDir = `${FileSystem.cacheDirectory}temp_backup/`;
        await FileSystem.makeDirectoryAsync(tempDir, { intermediates: true });
        await unzip(backupPath, tempDir);
        
        // Read the JSON file from the extracted directory
        const jsonFile = `${tempDir}${backupPath.split('/').pop()?.replace('.zip', '.json')}`;
        backupContent = await FileSystem.readAsStringAsync(jsonFile);
        
        // Clean up temporary directory
        await FileSystem.deleteAsync(tempDir, { idempotent: true });
      } else {
        backupContent = await FileSystem.readAsStringAsync(backupPath);
      }

      const backupData: BackupData = JSON.parse(backupContent);
      const fileInfo = await FileSystem.getInfoAsync(backupPath);
      const size = fileInfo.exists ? (fileInfo as FileSystem.FileInfo).size || 0 : 0;

      return {
        size,
        compressionSavings: backupData.metadata.compression.enabled
          ? backupData.metadata.compression.originalSize - backupData.metadata.compression.compressedSize
          : 0,
        timestamp: backupData.timestamp,
        metadata: backupData.metadata,
      };
    } catch (error) {
      console.error('Failed to get backup info:', error);
      throw error;
    }
  }
}

// Export singleton instance
export const performanceDataManager = PerformanceDataManager.getInstance(); 