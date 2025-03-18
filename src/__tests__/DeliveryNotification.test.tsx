import { render, screen } from '@testing-library/react-native';
import React from 'react';
import { DeliveryNotification } from '../components/notifications/DeliveryNotification';

const mockDelivery = {
  id: 'DEL-123',
  status: 'arriving',
  estimatedTime: '14:30',
  driverName: 'John Doe',
  hasPlasticCollection: true
};

describe('DeliveryNotification', () => {
  it('renders delivery status correctly', () => {
    render(<DeliveryNotification delivery={mockDelivery} />);
    
    expect(screen.getByText('Arriving at 14:30')).toBeTruthy();
    expect(screen.getByText('John Doe')).toBeTruthy();
  });

  it('shows plastic collection reminder', () => {
    render(<DeliveryNotification delivery={mockDelivery} />);
    
    expect(screen.getByText(/Please have your plastic waste ready/)).toBeTruthy();
  });
});