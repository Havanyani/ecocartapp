import { fireEvent, render, screen } from '@testing-library/react-native';
import React from 'react';
import { CollectionRating } from '../../../src/components/feedback/CollectionRating';

describe('CollectionRating', () => {
  const mockOnSubmit = jest.fn();

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('allows rating collection experience', () => {
    render(
      <CollectionRating 
        collectionId="COL-123"
        onSubmit={mockOnSubmit}
      />
    );

    fireEvent.press(screen.getByTestId('star-5'));
    fireEvent.changeText(
      screen.getByPlaceholderText('Additional comments'),
      'Very efficient collection'
    );
    fireEvent.press(screen.getByText('Submit Rating'));

    expect(mockOnSubmit).toHaveBeenCalledWith({
      collectionId: 'COL-123',
      rating: 5,
      comment: 'Very efficient collection'
    });
  });

  it('validates required rating', () => {
    render(<CollectionRating collectionId="COL-123" onSubmit={mockOnSubmit} />);

    fireEvent.press(screen.getByText('Submit Rating'));

    expect(screen.getByText('Please select a rating')).toBeTruthy();
    expect(mockOnSubmit).not.toHaveBeenCalled();
  });
}); 