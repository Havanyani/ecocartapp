import React, { useState } from 'react';
import { StyleSheet, TextInput, View } from 'react-native';
import { ThemedText } from '@/components/ui/ThemedText';
import { ThemedView } from '@/components/ui/ThemedView';
import { useFeedback } from '@/hooks/useFeedback';
import { FeedbackFormData } from '@/types/feedback';

interface FeedbackFormProps {
  onSubmit: (feedback: FeedbackFormData) => void;
  testID?: string;
}

export default function FeedbackForm({ onSubmit, testID }: FeedbackFormProps): JSX.Element {
  const [rating, setRating] = useState<number>(0);
  const [comment, setComment] = useState<string>('');
  const { submitFeedback, isLoading, error } = useFeedback();

  const handleSubmit = () => {
    const feedbackData: FeedbackFormData = {
      rating,
      comment,
      category: 'general',
      attachments: []
    };
    
    onSubmit(feedbackData);
  };

  return (
    <ThemedView style={styles.container} testID={testID}>
      <ThemedText style={styles.title}>
        Your Feedback
      </ThemedText>

      <View style={styles.ratingContainer}>
        {[1, 2, 3, 4, 5].map((star) => (
          <View
            key={star}
            style={styles.starButton}
          >
            <TextInput 
              style={[styles.star, star <= rating ? styles.activeStar : {}]}
              onPress={() => setRating(star)}
              value="★"
              editable={false}
            />
          </View>
        ))}
      </View>

      <TextInput
        style={styles.input}
        placeholder="Share your experience..."
        value={comment}
        onChangeText={setComment}
        multiline
      />

      <View
        style={[
          styles.submitButton,
          (!rating || !comment) && styles.disabledButton
        ]}
        onTouchEnd={() => !isLoading && rating > 0 && comment.trim() !== '' && handleSubmit()}
      >
        <ThemedText style={styles.submitText}>
          {isLoading ? 'Submitting...' : 'Submit Feedback'}
        </ThemedText>
      </View>

      {error && (
        <ThemedText style={styles.errorText}>
          {typeof error === 'string' ? error : 'An error occurred while submitting feedback'}
        </ThemedText>
      )}
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
  starButton: {
    padding: 8,
    marginHorizontal: 4,
  },
  star: {
    fontSize: 32,
    color: '#ccc',
  },
  activeStar: {
    color: '#FFD700',
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
  errorText: {
    color: 'red',
    marginTop: 8,
  }
}); 