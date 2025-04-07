/**
 * ButtonShowcase.tsx
 * 
 * A component that showcases the various styles and states of our Button component.
 * This demonstrates how to properly use the shared Button component across platforms.
 */

import { MaterialIcons } from '@expo/vector-icons';
import React, { useState } from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { Button } from './Button';

export function ButtonShowcase() {
  const [counter, setCounter] = useState(0);
  
  // Demo button press handler
  const handleButtonPress = () => {
    setCounter(prev => prev + 1);
  };
  
  return (
    <View style={styles.container}>
      <Text style={styles.title}>Button Showcase</Text>
      <Text style={styles.description}>Demonstrating shared component usage across platforms</Text>
      
      <Text style={styles.counter}>Counter: {counter}</Text>
      
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Variants</Text>
        <View style={styles.row}>
          <Button
            label="Primary"
            variant="primary"
            onPress={handleButtonPress}
          />
          
          <Button
            label="Secondary"
            variant="secondary"
            onPress={handleButtonPress}
          />
          
          <Button
            label="Outline"
            variant="outline"
            onPress={handleButtonPress}
          />
          
          <Button
            label="Text"
            variant="text"
            onPress={handleButtonPress}
          />
        </View>
      </View>
      
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Sizes</Text>
        <View style={styles.row}>
          <Button
            label="Small"
            size="small"
            onPress={handleButtonPress}
          />
          
          <Button
            label="Medium"
            size="medium"
            onPress={handleButtonPress}
          />
          
          <Button
            label="Large"
            size="large"
            onPress={handleButtonPress}
          />
        </View>
      </View>
      
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>States</Text>
        <View style={styles.row}>
          <Button
            label="Default"
            onPress={handleButtonPress}
          />
          
          <Button
            label="Loading"
            isLoading
            onPress={handleButtonPress}
          />
          
          <Button
            label="Disabled"
            disabled
            onPress={handleButtonPress}
          />
        </View>
      </View>
      
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>With Icons</Text>
        <View style={styles.row}>
          <Button
            label="Left Icon"
            leftIcon={<MaterialIcons name="add" size={16} color="white" />}
            onPress={handleButtonPress}
          />
          
          <Button
            label="Right Icon"
            rightIcon={<MaterialIcons name="arrow-forward" size={16} color="white" />}
            onPress={handleButtonPress}
          />
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    padding: 16,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 8,
  },
  description: {
    fontSize: 16,
    marginBottom: 24,
    opacity: 0.7,
  },
  counter: {
    fontSize: 18,
    fontWeight: '500',
    marginBottom: 16,
  },
  section: {
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '500',
    marginBottom: 12,
  },
  row: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
  }
}); 