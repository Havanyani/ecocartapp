import React from 'react';
import { Button, SafeAreaView, StatusBar, StyleSheet, Text, View } from 'react-native';

/**
 * A very minimal test app to see if basic React Native functionality works
 */
export default function AppTest() {
  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="dark-content" />
      <View style={styles.content}>
        <Text style={styles.title}>EcoCart Minimal Test</Text>
        <Text style={styles.description}>
          This is a minimal test app with no extra dependencies.
        </Text>
        <View style={styles.buttonContainer}>
          <Button 
            title="Test Button" 
            onPress={() => alert('Button pressed!')} 
          />
        </View>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  content: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 16,
    color: '#2e7d32',
  },
  description: {
    fontSize: 16,
    textAlign: 'center',
    marginBottom: 32,
    color: '#333',
  },
  buttonContainer: {
    width: '100%',
    marginTop: 20,
  },
}); 