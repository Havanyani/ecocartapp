import { FeedbackForm } from '@/components/feedback/FeedbackForm';
import { fireEvent, render, waitFor } from '@testing-library/react-native';
import * as Haptics from 'expo-haptics';
import React from 'react';
import { useTheme } from '../../hooks/useTheme';

// Mock dependencies
jest.mock('expo-haptics');
jest.mock('@/components/ui/IconSymbol', () => ({
  IconSymbol: () => null
}));
jest.mock('../../hooks/useTheme', () => ({
  useTheme: jest.fn()
}));

describe('FeedbackForm', () => {
  const mockOnSubmit = jest.fn();
  const mockTheme = {
    colors: {
      primary: '#2e7d32',
      text: '#000000',
      background: '#ffffff',
      border: '#cccccc'
    }
  };

  beforeEach(() => {
    jest.clearAllMocks();
    (useTheme as jest.Mock).mockReturnValue(mockTheme);
  });

  it('renders all form elements correctly', () => {
    const { getByText, getByPlaceholderText, getAllByRole } = render(
      <FeedbackForm onSubmit={mockOnSubmit} />
    );

    expect(getByText('Your Feedback')).toBeTruthy();
    expect(getByPlaceholderText('Share your experience...')).toBeTruthy();
    expect(getAllByRole('button')).toHaveLength(6); // 5 stars + submit button
  });

  it('handles star rating selection with haptic feedback', async () => {
    const { getAllByRole } = render(<FeedbackForm onSubmit={mockOnSubmit} />);
    const stars = getAllByRole('button').slice(0, 5);

    await fireEvent.press(stars[3]); // Select 4 stars

    expect(Haptics.selectionAsync).toHaveBeenCalled();
  });

  it('validates form before submission', async () => {
    const { getByTestId, getByText } = render(
      <FeedbackForm onSubmit={mockOnSubmit} />
    );

    // Try to submit without rating or comment
    fireEvent.press(getByTestId('submit-button'));
    expect(getByText('Please provide a rating')).toBeTruthy();

    // Add rating but no comment
    const stars = getByTestId('feedback-form').findAllByRole('button');
    fireEvent.press(stars[0]);
    fireEvent.press(getByTestId('submit-button'));
    expect(getByText('Please enter your feedback')).toBeTruthy();
  });

  it('submits form successfully with valid data', async () => {
    const { getByTestId, getAllByRole, getByPlaceholderText } = render(
      <FeedbackForm onSubmit={mockOnSubmit} />
    );

    const stars = getAllByRole('button').slice(0, 5);
    const input = getByPlaceholderText('Share your experience...');
    const submitButton = getByTestId('submit-button');

    // Fill form
    fireEvent.press(stars[4]); // 5 stars
    fireEvent.changeText(input, 'Great service!');
    
    // Submit form
    await fireEvent.press(submitButton);

    expect(Haptics.notificationAsync).toHaveBeenCalledWith(
      Haptics.NotificationFeedbackType.Success
    );
    expect(mockOnSubmit).toHaveBeenCalledWith({
      rating: 5,
      comment: 'Great service!'
    });
  });

  it('shows character count', () => {
    const { getByText, getByTestId } = render(
      <FeedbackForm onSubmit={mockOnSubmit} />
    );

    const input = getByTestId('feedback-input');
    fireEvent.changeText(input, 'Test comment');

    expect(getByText('11/500')).toBeTruthy();
  });

  it('clears form after successful submission', async () => {
    const { getByTestId, getAllByRole, getByPlaceholderText } = render(
      <FeedbackForm onSubmit={mockOnSubmit} />
    );

    // Fill and submit form
    const stars = getAllByRole('button').slice(0, 5);
    const input = getByPlaceholderText('Share your experience...');
    
    fireEvent.press(stars[4]);
    fireEvent.changeText(input, 'Test feedback');
    await fireEvent.press(getByTestId('submit-button'));

    // Check if form is cleared
    await waitFor(() => {
      expect(input.props.value).toBe('');
      expect(stars[4].props.color).toBe('#ccc');
    });
  });

  it('provides accessible form elements', () => {
    const { getByRole } = render(
      <FeedbackForm onSubmit={mockOnSubmit} />
    );

    const input = getByRole('textbox');
    const submitButton = getByRole('button');

    expect(input.props.accessibilityLabel).toBe('Feedback input field');
    expect(submitButton.props.accessibilityLabel).toBe('Submit feedback form');
    expect(submitButton.props.accessibilityHint).toBe('Double tap to submit your feedback');
  });

  it('applies theme styles', () => {
    const { getByTestId } = render(
      <FeedbackForm onSubmit={mockOnSubmit} />
    );

    const form = getByTestId('feedback-form');
    expect(form).toHaveStyle({
      backgroundColor: mockTheme.colors.background,
      borderColor: mockTheme.colors.border,
      padding: 16
    });
  });
}); 