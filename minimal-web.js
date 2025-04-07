import React from 'react';
import { createRoot } from 'react-dom/client';
import { StyleSheet, Text, View } from 'react-native';

// Minimal app component
function MinimalApp() {
  return (
    <View style={styles.container}>
      <Text style={styles.title}>EcoCart Web Minimal</Text>
      <Text style={styles.subtitle}>Super minimal web version</Text>
    </View>
  );
}

// Styles
const styles = StyleSheet.create({
  container: {
    display: 'flex',
    flexDirection: 'column',
    height: '100vh',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#f0f8ff',
    padding: 20,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 16,
    color: '#2e7d32',
  },
  subtitle: {
    fontSize: 18,
    color: '#333',
    marginBottom: 20,
    textAlign: 'center',
  }
});

// Mount the app when DOM is ready
document.addEventListener('DOMContentLoaded', () => {
  const root = createRoot(document.getElementById('root') || document.createElement('div'));
  root.render(<MinimalApp />);
  
  // Ensure we have a root element
  const rootElement = document.getElementById('root');
  if (!rootElement) {
    const newRoot = document.createElement('div');
    newRoot.id = 'root';
    document.body.appendChild(newRoot);
    const newRootInstance = createRoot(newRoot);
    newRootInstance.render(<MinimalApp />);
  }
}); 