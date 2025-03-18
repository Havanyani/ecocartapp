import { useEffect, useState } from 'react';
import { Migration } from '../services/MigrationService';

/**
 * Hook that handles AsyncStorage migration to the hybrid MMKV+SQLite system.
 * This should be called early in the app lifecycle, typically in App.tsx.
 * 
 * @param options Configuration options for the migration process
 * @returns Migration state information
 */
export function useMigration(options: {
  autoMigrate?: boolean;  // Whether to automatically migrate when needed
  onComplete?: (result: { success: boolean; migratedKeys: number }) => void;  // Callback when migration completes
  onError?: (errors: string[]) => void;  // Callback when migration encounters errors
} = {}) {
  const { 
    autoMigrate = true, 
    onComplete,
    onError 
  } = options;
  
  // Migration state
  const [isMigrationNeeded, setIsMigrationNeeded] = useState<boolean | null>(null);
  const [isMigrating, setIsMigrating] = useState(false);
  const [migrationComplete, setMigrationComplete] = useState(false);
  const [migrationErrors, setMigrationErrors] = useState<string[]>([]);
  
  // Check if migration is needed on mount
  useEffect(() => {
    const checkMigration = async () => {
      try {
        const needed = await Migration.isMigrationNeeded();
        setIsMigrationNeeded(needed);
        
        // Auto-migrate if needed and enabled
        if (needed && autoMigrate) {
          runMigration();
        }
      } catch (error) {
        console.error('Error checking migration status:', error);
        setIsMigrationNeeded(false);
      }
    };
    
    checkMigration();
  }, [autoMigrate]);
  
  // Function to manually trigger migration
  const runMigration = async () => {
    if (isMigrating || migrationComplete) return;
    
    setIsMigrating(true);
    
    try {
      const result = await Migration.migrateData();
      setMigrationComplete(result.success);
      
      if (result.errors.length > 0) {
        setMigrationErrors(result.errors);
        if (onError) {
          onError(result.errors);
        }
      }
      
      if (onComplete) {
        onComplete({
          success: result.success,
          migratedKeys: result.migratedKeys
        });
      }
    } catch (error) {
      console.error('Migration failed:', error);
      setMigrationErrors([error?.toString() || 'Unknown migration error']);
      
      if (onError) {
        onError([error?.toString() || 'Unknown migration error']);
      }
    } finally {
      setIsMigrating(false);
    }
  };
  
  return {
    isMigrationNeeded,
    isMigrating,
    migrationComplete,
    migrationErrors,
    runMigration
  };
}

export default useMigration; 