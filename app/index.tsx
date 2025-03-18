import { useRouter } from 'expo-router';
import React from 'react';
import { Button, StyleSheet, Text, View } from 'react-native';

export default function Page() {
  const router = useRouter();
  
  return (
    <View style={styles.container}>
      <Text style={styles.title}>Welcome to EcoCart</Text>
      <Text style={styles.subtitle}>Your eco-friendly recycling companion</Text>
      
      <View style={styles.buttonContainer}>
        <Button 
          title="Go to Home Tab" 
          onPress={() => router.replace('/(tabs)')} 
        />
        
        <Button 
          title="Materials" 
          onPress={() => router.push('/(tabs)/materials')} 
        />
        
        <Button 
          title="Collections" 
          onPress={() => router.push('/(tabs)/collections')} 
        />
        
        <Button 
          title="Analytics" 
          onPress={() => router.push('/(tabs)/analytics')} 
        />
        
        <Button 
          title="Profile" 
          onPress={() => router.push('/(tabs)/profile')} 
        />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
    backgroundColor: '#f5f5f5'
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 10,
    color: '#1976D2'
  },
  subtitle: {
    fontSize: 16,
    marginBottom: 30,
    color: '#555'
  },
  buttonContainer: {
    width: '100%',
    gap: 15
  }
}); 