/**
 * App.tsx
 * 
 * Absolutely minimal app with no imports except React.
 */
import AsyncStorage from '@react-native-async-storage/async-storage';
import React, { useEffect, useState } from 'react';
import { Alert, Button, Text, TextInput, View } from 'react-native';

export default function App() {
  const [value, setValue] = useState('');
  const [storedValue, setStoredValue] = useState('');

  useEffect(() => {
    loadStoredValue();
  }, []);

  const loadStoredValue = async () => {
    try {
      const data = await AsyncStorage.getItem('test-key');
      if (data !== null) {
        setStoredValue(data);
      }
    } catch (error) {
      Alert.alert('Error', 'Failed to load from storage');
      console.error('Load error:', error);
    }
  };

  const saveValue = async () => {
    try {
      await AsyncStorage.setItem('test-key', value);
      setStoredValue(value);
      Alert.alert('Success', 'Value stored successfully');
    } catch (error) {
      Alert.alert('Error', 'Failed to save to storage');
      console.error('Save error:', error);
    }
  };

  return (
    <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', padding: 20 }}>
      <Text style={{ fontSize: 24, marginBottom: 20 }}>EcoCart Storage Test</Text>
      
      <Text style={{ marginBottom: 5 }}>Enter a value to store:</Text>
      <TextInput
        style={{ 
          width: '100%', 
          borderWidth: 1, 
          borderColor: '#ccc', 
          padding: 10, 
          marginBottom: 15,
          borderRadius: 5
        }}
        value={value}
        onChangeText={setValue}
        placeholder="Enter text to store"
      />
      
      <Button title="Save to Storage" onPress={saveValue} />
      
      {storedValue ? (
        <View style={{ marginTop: 30, padding: 15, backgroundColor: '#f0f0f0', borderRadius: 5, width: '100%' }}>
          <Text style={{ fontWeight: 'bold' }}>Retrieved from storage:</Text>
          <Text>{storedValue}</Text>
        </View>
      ) : (
        <Text style={{ marginTop: 30, fontStyle: 'italic' }}>No stored value found</Text>
      )}
    </View>
  );
} 