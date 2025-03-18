import React from 'react';
import { ActivityIndicator, ScrollView, StyleSheet, Text, View } from 'react-native';
import { useMigration } from '../hooks/useMigration';

interface MigrationScreenProps {
  onMigrationComplete?: () => void;
}

/**
 * Component to display during AsyncStorage to MMKV+SQLite migration
 * This should be displayed early in the app lifecycle when migration is needed
 */
export const MigrationScreen: React.FC<MigrationScreenProps> = ({ onMigrationComplete }) => {
  const { 
    isMigrationNeeded, 
    isMigrating, 
    migrationComplete, 
    migrationErrors,
    runMigration 
  } = useMigration({
    autoMigrate: true,
    onComplete: (result) => {
      console.log('Migration completed:', result);
      if (onMigrationComplete) {
        onMigrationComplete();
      }
    }
  });
  
  // If we don't know yet if migration is needed, show loading
  if (isMigrationNeeded === null) {
    return (
      <View style={styles.container}>
        <ActivityIndicator size="large" color="#4CAF50" />
        <Text style={styles.loadingText}>Checking storage status...</Text>
      </View>
    );
  }
  
  // If no migration is needed, inform the user and proceed
  if (isMigrationNeeded === false) {
    // Call the onMigrationComplete callback immediately
    React.useEffect(() => {
      if (onMigrationComplete) {
        onMigrationComplete();
      }
    }, [onMigrationComplete]);
    
    return (
      <View style={styles.container}>
        <Text style={styles.successTitle}>Storage Ready</Text>
        <Text style={styles.message}>App storage is already optimized!</Text>
      </View>
    );
  }
  
  // If migration is in progress, show progress
  if (isMigrating) {
    return (
      <View style={styles.container}>
        <ActivityIndicator size="large" color="#4CAF50" />
        <Text style={styles.title}>Upgrading Storage</Text>
        <Text style={styles.message}>
          We're optimizing EcoCart's storage for better performance.
          This will only happen once and should take just a moment.
        </Text>
      </View>
    );
  }
  
  // If migration completed with errors, show errors
  if (migrationComplete && migrationErrors.length > 0) {
    return (
      <View style={styles.container}>
        <Text style={styles.errorTitle}>Storage Upgrade Issues</Text>
        <Text style={styles.message}>
          There were some issues while upgrading the app storage.
          The app should still work, but you might notice some missing data.
        </Text>
        
        <ScrollView style={styles.errorContainer}>
          {migrationErrors.map((error, index) => (
            <Text key={index} style={styles.errorText}>
              • {error}
            </Text>
          ))}
        </ScrollView>
      </View>
    );
  }
  
  // If migration completed successfully, show success
  if (migrationComplete) {
    return (
      <View style={styles.container}>
        <Text style={styles.successTitle}>Storage Upgraded!</Text>
        <Text style={styles.message}>
          EcoCart's storage has been successfully optimized for better performance.
        </Text>
      </View>
    );
  }
  
  // Default state: Migration needed but not started
  return (
    <View style={styles.container}>
      <Text style={styles.title}>Storage Upgrade Needed</Text>
      <Text style={styles.message}>
        EcoCart needs to upgrade its storage for better performance.
        This will only happen once and should take just a moment.
      </Text>
      
      <ActivityIndicator size="large" color="#4CAF50" style={styles.spinner} />
      <Text style={styles.loadingText}>Starting upgrade...</Text>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
    backgroundColor: '#f5f5f5'
  },
  title: {
    fontSize: 22,
    fontWeight: 'bold',
    marginBottom: 16,
    color: '#2e7d32',
    textAlign: 'center'
  },
  successTitle: {
    fontSize: 22,
    fontWeight: 'bold',
    marginBottom: 16,
    color: '#2e7d32',
    textAlign: 'center'
  },
  errorTitle: {
    fontSize: 22,
    fontWeight: 'bold',
    marginBottom: 16,
    color: '#c62828',
    textAlign: 'center'
  },
  message: {
    fontSize: 16,
    textAlign: 'center',
    marginBottom: 24,
    color: '#555'
  },
  loadingText: {
    marginTop: 12,
    fontSize: 16,
    color: '#555'
  },
  spinner: {
    marginVertical: 24
  },
  errorContainer: {
    maxHeight: 200,
    width: '100%',
    marginTop: 16,
    backgroundColor: '#ffebee',
    borderRadius: 8,
    padding: 12
  },
  errorText: {
    color: '#c62828',
    fontSize: 14,
    marginBottom: 8
  }
});

export default MigrationScreen; 