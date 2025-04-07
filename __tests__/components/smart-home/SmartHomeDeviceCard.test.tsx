import { fireEvent, render } from '@testing-library/react-native';
import React from 'react';
import SmartHomeDeviceCard from '../../../src/components/smart-home/SmartHomeDeviceCard';
import { useSmartHome } from '../../../src/hooks/useSmartHome';
import { useTheme } from '../../../src/hooks/useTheme';

// Mock the hooks
jest.mock('../../../src/hooks/useSmartHome');
jest.mock('../../../src/hooks/useTheme');

describe('SmartHomeDeviceCard', () => {
  // Mock device data
  const mockDevice = {
    id: 'device-1',
    name: 'Living Room Light',
    type: 'light',
    isOnline: true,
    isPowered: true,
    energy: {
      current: 10,
      daily: 120,
      weekly: 840
    },
    capabilities: ['power', 'brightness', 'color'],
    settings: {
      brightness: 80,
      color: '#FFFFFF'
    }
  };
  
  // Mock the hooks
  const mockToggleDevice = jest.fn();
  const mockUpdateDeviceSettings = jest.fn();
  
  beforeEach(() => {
    jest.clearAllMocks();
    
    // Mock useSmartHome hook
    (useSmartHome as jest.Mock).mockReturnValue({
      toggleDevice: mockToggleDevice,
      updateDeviceSettings: mockUpdateDeviceSettings,
      isDeviceUpdating: jest.fn().mockReturnValue(false)
    });
    
    // Mock useTheme hook
    (useTheme as jest.Mock).mockReturnValue({
      theme: {
        colors: {
          primary: '#007AFF',
          background: '#FFFFFF',
          card: '#F8F8F8',
          text: '#000000',
          border: '#DDDDDD',
          notification: '#FF3B30',
          success: '#4CD964',
          warning: '#FFCC00',
          error: '#FF3B30'
        },
        spacing: {
          xs: 4,
          sm: 8,
          md: 16,
          lg: 24,
          xl: 32
        },
        roundness: 8
      }
    });
  });
  
  it('renders device information correctly', () => {
    const { getByText, getByTestId } = render(
      <SmartHomeDeviceCard device={mockDevice} />
    );
    
    expect(getByText('Living Room Light')).toBeTruthy();
    expect(getByText('Online')).toBeTruthy();
    expect(getByTestId('device-energy-usage')).toBeTruthy();
    expect(getByTestId('device-power-toggle')).toBeTruthy();
  });
  
  it('shows offline state when device is offline', () => {
    const offlineDevice = { ...mockDevice, isOnline: false };
    
    const { getByText, queryByText } = render(
      <SmartHomeDeviceCard device={offlineDevice} />
    );
    
    expect(getByText('Living Room Light')).toBeTruthy();
    expect(getByText('Offline')).toBeTruthy();
    expect(queryByText('Online')).toBeNull();
  });
  
  it('handles power toggle correctly', () => {
    const { getByTestId } = render(
      <SmartHomeDeviceCard device={mockDevice} />
    );
    
    const powerToggle = getByTestId('device-power-toggle');
    fireEvent.press(powerToggle);
    
    expect(mockToggleDevice).toHaveBeenCalledWith(mockDevice.id);
  });
  
  it('displays loading state when device is updating', () => {
    // Override the mock to show updating state
    (useSmartHome as jest.Mock).mockReturnValue({
      toggleDevice: mockToggleDevice,
      updateDeviceSettings: mockUpdateDeviceSettings,
      isDeviceUpdating: jest.fn().mockReturnValue(true)
    });
    
    const { getByTestId } = render(
      <SmartHomeDeviceCard device={mockDevice} />
    );
    
    expect(getByTestId('device-updating-indicator')).toBeTruthy();
  });
  
  it('renders different icon based on device type', () => {
    // Test light device
    const { getByTestId, rerender } = render(
      <SmartHomeDeviceCard device={mockDevice} />
    );
    
    expect(getByTestId('device-icon-light')).toBeTruthy();
    
    // Test thermostat device
    const thermostatDevice = { ...mockDevice, type: 'thermostat' };
    rerender(<SmartHomeDeviceCard device={thermostatDevice} />);
    
    expect(getByTestId('device-icon-thermostat')).toBeTruthy();
    
    // Test outlet device
    const outletDevice = { ...mockDevice, type: 'outlet' };
    rerender(<SmartHomeDeviceCard device={outletDevice} />);
    
    expect(getByTestId('device-icon-outlet')).toBeTruthy();
  });
  
  it('renders device settings controls based on capabilities', () => {
    const { getByTestId } = render(
      <SmartHomeDeviceCard device={mockDevice} />
    );
    
    // Should render brightness slider for a light with brightness capability
    expect(getByTestId('brightness-control')).toBeTruthy();
    
    // Should render color picker for a light with color capability
    expect(getByTestId('color-control')).toBeTruthy();
    
    // Test device without capabilities
    const basicDevice = { 
      ...mockDevice, 
      capabilities: ['power'] 
    };
    
    const { queryByTestId } = render(
      <SmartHomeDeviceCard device={basicDevice} />
    );
    
    // Should not render advanced controls
    expect(queryByTestId('brightness-control')).toBeNull();
    expect(queryByTestId('color-control')).toBeNull();
  });
  
  it('handles brightness change correctly', () => {
    const { getByTestId } = render(
      <SmartHomeDeviceCard device={mockDevice} />
    );
    
    const brightnessSlider = getByTestId('brightness-slider');
    fireEvent(brightnessSlider, 'valueChange', 50);
    
    expect(mockUpdateDeviceSettings).toHaveBeenCalledWith(
      mockDevice.id, 
      { brightness: 50 }
    );
  });
  
  it('shows energy consumption information', () => {
    const { getByText } = render(
      <SmartHomeDeviceCard device={mockDevice} />
    );
    
    expect(getByText('Current: 10W')).toBeTruthy();
    expect(getByText('Today: 120Wh')).toBeTruthy();
    expect(getByText('Weekly: 840Wh')).toBeTruthy();
  });
}); 