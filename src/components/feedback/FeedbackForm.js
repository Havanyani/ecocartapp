import { HapticTab } from '@/components/HapticTab';
import { ThemedText } from '@/components/ThemedText';
import { ThemedView } from '@/components/ThemedView';
import { IconSymbol } from '@/components/ui/IconSymbol';
import React, { useState } from 'react';
import { StyleSheet, TextInput, View } from 'react-native';

export default function FeedbackForm({ onSubmit }) {
  const [rating, setRating] = useState(0);
  const [comment, setComment] = useState('');

  return (
    <ThemedView style={styles.container}>
      <ThemedText style={styles.title}>
        <IconSymbol name="message-text" size={24} color="#2e7d32" />
        Your Feedback
      </ThemedText>

      <View style={styles.ratingContainer}>
        {[1, 2, 3, 4, 5].map((star) => (
          <HapticTab
            key={star}
            onPress={() => setRating(star)}
          >
            <IconSymbol
              name={star <= rating ? 'star' : 'star-outline'}
              size={32}
              color={star <= rating ? '#FFD700' : '#ccc'}
            />
          </HapticTab>
        ))}
      </View>

      <TextInput
        style={styles.input}
        placeholder="Share your experience..."
        value={comment}
        onChangeText={setComment}
        multiline
      />

      <HapticTab
        style={[
          styles.submitButton,
          (!rating || !comment) && styles.disabledButton
        ]}
        disabled={!rating || !comment}
        onPress={() => onSubmit({ rating, comment })}
      >
        <ThemedText style={styles.submitText}>Submit Feedback</ThemedText>
      </HapticTab>
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: '#fff',
    padding: 16,
    borderRadius: 8,
    margin: 16,
    alignItems: 'center',
  },
  title: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 16,
    color: '#2e7d32',
  },
  ratingContainer: {
    flexDirection: 'row',
    marginBottom: 16,
  },
  input: {
    width: '100%',
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 8,
    padding: 12,
    marginBottom: 16,
    minHeight: 100,
  },
  submitButton: {
    backgroundColor: '#2e7d32',
    paddingVertical: 12,
    paddingHorizontal: 24,
    borderRadius: 8,
    width: '100%',
    alignItems: 'center',
  },
  disabledButton: {
    backgroundColor: '#ccc',
  },
  submitText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
}); 