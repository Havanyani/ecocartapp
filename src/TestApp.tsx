/**
 * TestApp.tsx
 * 
 * Minimal test app without any complex dependencies.
 */

import React, { useState } from 'react';
import { Button, SafeAreaView, StyleSheet, Text, View } from 'react-native';
import { ConsolidatedErrorBoundary } from './components/error/ConsolidatedErrorBoundary';

// Error component
function ErrorButton() {
  const [shouldThrow, setShouldThrow] = useState(false);
  
  if (shouldThrow) {
    throw new Error('Test error');
  }
  
  return (
    <Button 
      title="Throw Error" 
      onPress={() => setShouldThrow(true)}
      color="#e74c3c"
    />
  );
}

// Main app
export default function TestApp() {
  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.content}>
        <Text style={styles.title}>Error Boundary Test</Text>
        
        <ConsolidatedErrorBoundary componentName="ErrorButton">
          <ErrorButton />
        </ConsolidatedErrorBoundary>
        
        <Text style={styles.description}>
          Press the button to test error handling
        </Text>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  content: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 20,
  },
  title: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 30,
  },
  description: {
    marginTop: 20,
    textAlign: 'center',
    color: '#666',
  },
}); 