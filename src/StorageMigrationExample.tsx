import React, { useState } from 'react';
import { StyleSheet, View } from 'react-native';
import { MigrationScreen } from './components/MigrationScreen';
import StorageExample from './services/StorageExample';

/**
 * Example component showing how to integrate the AsyncStorage to MMKV+SQLite
 * migration in your app
 */
const StorageMigrationExample: React.FC = () => {
  // State to track if migration is complete
  const [isMigrationComplete, setMigrationComplete] = useState(false);
  
  // Handle migration completion
  const handleMigrationComplete = () => {
    console.log('Migration is complete, proceeding to main app');
    setMigrationComplete(true);
  };
  
  // While migration is in progress or needed, show the migration screen
  if (!isMigrationComplete) {
    return <MigrationScreen onMigrationComplete={handleMigrationComplete} />;
  }
  
  // Once migration is complete, show the main app content
  // In a real app, this would be your main navigation or app component
  return (
    <View style={styles.container}>
      {/* Example of storage service usage */}
      <StorageExample />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
});

export default StorageMigrationExample; 