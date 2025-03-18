import { render, screen } from '@testing-library/react-native';
import React from 'react';
import { DeliveryRouteMap } from './DeliveryRouteMap';

const mockRoute = {
  deliveryPoints: [
    { id: '1', address: '123 Main St', time: '14:00', hasCollection: true },
    { id: '2', address: '456 Oak Ave', time: '14:30', hasCollection: false }
  ],
  optimizedPath: [
    { latitude: -33.9249, longitude: 18.4241 },
    { latitude: -33.9269, longitude: 18.4233 }
  ]
};

describe('DeliveryRouteMap', () => {
  it('renders delivery points on map', () => {
    render(<DeliveryRouteMap route={mockRoute} />);
    
    expect(screen.getByText('123 Main St')).toBeTruthy();
    expect(screen.getByText('14:00')).toBeTruthy();
  });

  it('indicates collection points with icon', () => {
    const { getAllByTestId } = render(<DeliveryRouteMap route={mockRoute} />);
    
    const collectionIcons = getAllByTestId('collection-icon');
    expect(collectionIcons).toHaveLength(1);
  });
}); 