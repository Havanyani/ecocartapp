import { HapticTab } from '@/components/ui/HapticTab';
import { IconSymbol } from '@/components/ui/IconSymbol';
import { ThemedText } from '@/components/ui/ThemedText';
import { ThemedView } from '@/components/ui/ThemedView';
import React from 'react';
import { StyleSheet, View } from 'react-native';

interface PackagingOption {
  id: string;
  name: string;
  description: string;
  eco_score: 'A+' | 'A' | 'B' | 'C';
  price: number;
  icon: 'shopping' | 'bag-checked' | 'leaf';
}

interface PackagingSelectorProps {
  onSelect: (option: PackagingOption) => void;
  selected?: string;
}

const PACKAGING_OPTIONS: PackagingOption[] = [
  {
    id: '1',
    name: 'Paper Bags',
    description: 'Recyclable paper bags',
    eco_score: 'A',
    price: 2.00,
    icon: 'shopping'
  },
  {
    id: '2',
    name: 'Reusable Bags',
    description: 'Durable cloth bags',
    eco_score: 'A+',
    price: 15.00,
    icon: 'bag-checked'
  },
  {
    id: '3',
    name: 'Biodegradable Bags',
    description: 'Compostable bags',
    eco_score: 'A',
    price: 5.00,
    icon: 'leaf'
  },
];

export function PackagingSelector({ onSelect, selected }: PackagingSelectorProps): JSX.Element {
  return (
    <ThemedView style={styles.container}>
      <ThemedText style={styles.title}>
        <IconSymbol name="recycle" size={24} color="#2e7d32" />
        Choose Eco-Friendly Packaging
      </ThemedText>
      
      {PACKAGING_OPTIONS.map(option => (
        <HapticTab
          key={option.id}
          style={[
            styles.option,
            selected === option.id && styles.selectedOption
          ]}
          onPress={() => onSelect(option)}
          accessibilityLabel={`Select ${option.name}`}
          accessibilityRole="radio"
          accessibilityState={{ selected: selected === option.id }}
        >
          <View style={styles.optionHeader}>
            <IconSymbol
              name={option.icon}
              size={24}
              color={selected === option.id ? '#2e7d32' : '#666'}
            />
            <ThemedText style={styles.ecoScore}>
              Eco-Score: {option.eco_score}
            </ThemedText>
          </View>
          
          <View style={styles.optionInfo}>
            <View>
              <ThemedText style={styles.optionTitle}>{option.name}</ThemedText>
              <ThemedText style={styles.optionDescription}>{option.description}</ThemedText>
            </View>
            <ThemedText style={styles.price}>R {option.price.toFixed(2)}</ThemedText>
          </View>
        </HapticTab>
      ))}
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  container: {
    padding: 16,
  },
  title: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 16,
  },
  option: {
    backgroundColor: '#fff',
    padding: 16,
    borderRadius: 8,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: '#ddd',
  },
  selectedOption: {
    borderColor: '#2e7d32',
    backgroundColor: '#e8f5e9',
  },
  optionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  ecoScore: {
    fontSize: 14,
    color: '#2e7d32',
    fontWeight: '500',
  },
  optionInfo: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  optionTitle: {
    fontSize: 16,
    fontWeight: '500',
    marginBottom: 4,
  },
  optionDescription: {
    color: '#666',
  },
  price: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#2e7d32',
  },
}); 