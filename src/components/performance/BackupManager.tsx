import { IconSymbol } from '@/components/ui/IconSymbol';
import { useTheme } from '@/theme';
import { performanceDataManager } from '@/utils/PerformanceDataManager';
import FileSystem from '@/utils/cross-platform/fileSystem';
import { getSafeTheme } from '@/utils/webFallbacks';
import React, { useEffect, useState } from 'react';
import { ActivityIndicator, Alert, ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';

interface BackupMetadata {
  compression: {
    enabled: boolean;
    algorithm: string;
    originalSize: number;
    compressedSize: number;
  };
}

export const BackupManager: React.FC = () => {
  const themeResult = useTheme();
  const theme = getSafeTheme(themeResult);
  const [backupFiles, setBackupFiles] = useState<string[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [backupMetadata, setBackupMetadata] = useState<Record<string, BackupMetadata>>({});

  useEffect(() => {
    loadBackupFiles();
  }, []);

  const loadBackupFiles = async () => {
    try {
      setIsLoading(true);
      const files = await performanceDataManager.getBackupFiles();
      setBackupFiles(files);
      
      // Load metadata for each backup
      const metadata: Record<string, BackupMetadata> = {};
      for (const file of files) {
        try {
          const content = await FileSystem.readAsStringAsync(file);
          const data = JSON.parse(content);
          if (data.metadata) {
            metadata[file] = { compression: data.metadata.compression };
          }
        } catch (error) {
          console.error('Error loading backup metadata:', error);
        }
      }
      setBackupMetadata(metadata);
    } catch (error) {
      console.error('Error loading backup files:', error);
      Alert.alert('Error', 'Failed to load backup files');
    } finally {
      setIsLoading(false);
    }
  };

  const handleCreateBackup = async () => {
    try {
      setIsLoading(true);
      await performanceDataManager.createBackup();
      await loadBackupFiles();
      Alert.alert('Success', 'Backup created successfully');
    } catch (error) {
      console.error('Error creating backup:', error);
      Alert.alert('Error', 'Failed to create backup');
    } finally {
      setIsLoading(false);
    }
  };

  const handleRestoreBackup = async (backupPath: string) => {
    Alert.alert(
      'Restore Backup',
      'Are you sure you want to restore this backup? This will replace all current performance data.',
      [
        {
          text: 'Cancel',
          style: 'cancel',
        },
        {
          text: 'Restore',
          style: 'destructive',
          onPress: async () => {
            try {
              setIsLoading(true);
              await performanceDataManager.restoreFromBackup(backupPath);
              Alert.alert('Success', 'Backup restored successfully');
            } catch (error) {
              console.error('Error restoring backup:', error);
              Alert.alert('Error', 'Failed to restore backup');
            } finally {
              setIsLoading(false);
            }
          },
        },
      ]
    );
  };

  const handleShareBackup = async (backupPath: string) => {
    try {
      await performanceDataManager.shareBackup(backupPath);
    } catch (error) {
      console.error('Error sharing backup:', error);
      Alert.alert('Error', 'Failed to share backup');
    }
  };

  const handleDeleteBackup = async (backupPath: string) => {
    Alert.alert(
      'Delete Backup',
      'Are you sure you want to delete this backup?',
      [
        {
          text: 'Cancel',
          style: 'cancel',
        },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: async () => {
            try {
              setIsLoading(true);
              await performanceDataManager.deleteBackup(backupPath);
              await loadBackupFiles();
              Alert.alert('Success', 'Backup deleted successfully');
            } catch (error) {
              console.error('Error deleting backup:', error);
              Alert.alert('Error', 'Failed to delete backup');
            } finally {
              setIsLoading(false);
            }
          },
        },
      ]
    );
  };

  const formatBackupDate = (filePath: string): string => {
    const timestamp = filePath.split('_').pop()?.split('.')[0];
    if (!timestamp) return 'Unknown date';
    return new Date(timestamp.replace(/-/g, ':')).toLocaleString();
  };

  const formatFileSize = (bytes: number): string => {
    if (bytes < 1024) return `${bytes} B`;
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
    if (bytes < 1024 * 1024 * 1024) return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
    return `${(bytes / (1024 * 1024 * 1024)).toFixed(1)} GB`;
  };

  const getCompressionRatio = (original: number, compressed: number): string => {
    if (original === 0) return '0%';
    return `${((1 - compressed / original) * 100).toFixed(1)}%`;
  };

  if (isLoading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color={theme.colors.primary} />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Backup Manager</Text>
        <TouchableOpacity
          style={styles.createBackupButton}
          onPress={handleCreateBackup}
        >
          <IconSymbol name="backup" size={20} color="#FFFFFF" />
          <Text style={styles.createBackupButtonText}>Create Backup</Text>
        </TouchableOpacity>
      </View>

      {backupFiles.length === 0 ? (
        <View style={styles.emptyState}>
          <IconSymbol name="backup-restore" size={48} color={theme.colors.primary} />
          <Text style={styles.emptyStateText}>
            No backups available
          </Text>
        </View>
      ) : (
        <ScrollView style={styles.backupList}>
          {backupFiles.map((filePath) => {
            const metadata = backupMetadata[filePath];
            const isCompressed = metadata?.compression.enabled;
            const compressionRatio = metadata?.compression.enabled
              ? getCompressionRatio(metadata.compression.originalSize, metadata.compression.compressedSize)
              : null;

            return (
              <View key={filePath} style={styles.backupItem}>
                <View style={styles.backupInfo}>
                  <Text style={styles.backupDate}>
                    {formatBackupDate(filePath)}
                  </Text>
                  <Text style={styles.backupPath} numberOfLines={1}>
                    {filePath}
                  </Text>
                  {metadata && (
                    <View style={styles.compressionInfo}>
                      <IconSymbol
                        name={isCompressed ? 'zip-box' : 'file-document'}
                        size={16}
                        color={isCompressed ? theme.colors.primary : 'rgba(0,0,0,0.5)'}
                      />
                      <Text style={styles.compressionText}>
                        {isCompressed
                          ? `Compressed (${compressionRatio} smaller)`
                          : 'Uncompressed'}
                      </Text>
                      <Text style={styles.fileSizeText}>
                        {formatFileSize(
                          isCompressed
                            ? metadata.compression.compressedSize
                            : metadata.compression.originalSize
                        )}
                      </Text>
                    </View>
                  )}
                </View>
                <View style={styles.backupActions}>
                  <TouchableOpacity
                    style={styles.actionButton}
                    onPress={() => handleRestoreBackup(filePath)}
                  >
                    <IconSymbol name="restore" size={20} color={theme.colors.primary} />
                  </TouchableOpacity>
                  <TouchableOpacity
                    style={styles.actionButton}
                    onPress={() => handleShareBackup(filePath)}
                  >
                    <IconSymbol name="share" size={20} color={theme.colors.primary} />
                  </TouchableOpacity>
                  <TouchableOpacity
                    style={styles.actionButton}
                    onPress={() => handleDeleteBackup(filePath)}
                  >
                    <IconSymbol name="delete" size={20} color="#FF3B30" />
                  </TouchableOpacity>
                </View>
              </View>
            );
          })}
        </ScrollView>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFFFFF',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(0,0,0,0.1)',
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
  },
  createBackupButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#007AFF',
    padding: 8,
    borderRadius: 8,
    gap: 8,
  },
  createBackupButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
  },
  emptyState: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 32,
  },
  emptyStateText: {
    marginTop: 16,
    fontSize: 16,
    color: 'rgba(0,0,0,0.5)',
  },
  backupList: {
    flex: 1,
  },
  backupItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(0,0,0,0.1)',
  },
  backupInfo: {
    flex: 1,
    marginRight: 16,
  },
  backupDate: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 4,
  },
  backupPath: {
    fontSize: 14,
    color: 'rgba(0,0,0,0.5)',
  },
  backupActions: {
    flexDirection: 'row',
    gap: 8,
  },
  actionButton: {
    padding: 8,
    borderRadius: 8,
    backgroundColor: 'rgba(0,0,0,0.05)',
  },
  compressionInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 4,
    gap: 4,
  },
  compressionText: {
    fontSize: 12,
    color: 'rgba(0,0,0,0.5)',
  },
  fileSizeText: {
    fontSize: 12,
    color: 'rgba(0,0,0,0.5)',
    marginLeft: 'auto',
  },
}); 