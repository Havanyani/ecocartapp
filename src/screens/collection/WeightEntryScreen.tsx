/**
 * WeightEntryScreen.tsx
 * 
 * Screen for entering collection weights with platform-specific optimizations.
 */

import { WeightEntryInterface } from '@/components/collection/WeightEntryInterface';
import { Button } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';
import { Text } from '@/components/ui/Text';
import { useTheme } from '@/hooks/useTheme';
import { CollectionStackParamList } from '@/navigation/CollectionNavigator';
import { MaterialWeight } from '@/types/Material';
import { useNavigation, useRoute } from '@react-navigation/native';
import { StackNavigationProp } from '@react-navigation/stack';
import * as Haptics from 'expo-haptics';
import React, { useState } from 'react';
import { Alert, Platform, StyleSheet } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

type WeightEntryScreenNavigationProp = StackNavigationProp<
  CollectionStackParamList,
  'WeightEntry'
>;

export function WeightEntryScreen() {
  const navigation = useNavigation<WeightEntryScreenNavigationProp>();
  const route = useRoute();
  const { theme } = useTheme();
  const [weights, setWeights] = useState<MaterialWeight[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Handle weight submission
  const handleWeightSubmit = async (submittedWeights: MaterialWeight[]) => {
    if (Platform.OS === 'ios') {
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    }

    setIsSubmitting(true);

    try {
      // In a real app, you would submit the weights to your backend
      console.log('Submitting weights:', submittedWeights);
      
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      Alert.alert(
        'Weights Submitted',
        'The collection weights have been successfully recorded.',
        [
          {
            text: 'OK',
            onPress: () => navigation.navigate('CollectionDetails', { 
              collectionId: route.params?.collectionId || '1' 
            }),
          },
        ]
      );
    } catch (error) {
      Alert.alert('Error', 'Failed to submit weights. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <Card style={styles.card}>
        <Text variant="h2" style={styles.title}>Enter Collection Weights</Text>
        
        <WeightEntryInterface
          onWeightSubmit={handleWeightSubmit}
          initialWeights={weights}
        />
        
        <Button
          variant="secondary"
          onPress={() => navigation.goBack()}
          style={styles.cancelButton}
          disabled={isSubmitting}
        >
          Cancel
        </Button>
      </Card>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  card: {
    margin: 16,
    padding: 16,
    flex: 1,
  },
  title: {
    marginBottom: 16,
    textAlign: 'center',
  },
  cancelButton: {
    marginTop: 16,
  },
}); 