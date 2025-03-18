import { useDeliveryNotifications } from '@/hooks/useDeliveryNotifications';
import { useTheme } from '@/hooks/useTheme';
import { fireEvent, render } from '@testing-library/react-native';
import { NotificationPreferences } from '../NotificationPreferences';

// Mock the hooks
jest.mock('@/hooks/useDeliveryNotifications');
jest.mock('@/hooks/useTheme');

describe('NotificationPreferences', () => {
  const mockTogglePreference = jest.fn();
  const mockPreferences = {
    deliveryStatusUpdates: true,
    locationUpdates: false,
    routeChanges: true,
    collectionUpdates: false,
  };

  const mockTheme = {
    colors: {
      primary: '#007AFF',
      background: '#FFFFFF',
      border: '#E5E5EA',
    },
  };

  beforeEach(() => {
    (useDeliveryNotifications as jest.Mock).mockReturnValue({
      preferences: mockPreferences,
      togglePreference: mockTogglePreference,
    });
    (useTheme as jest.Mock).mockReturnValue({ theme: mockTheme });
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('renders notification preferences correctly', () => {
    const { getByText } = render(
      <NotificationPreferences personnelId="test-id" />
    );

    // Check if all preference items are rendered
    expect(getByText('Notification Preferences')).toBeTruthy();
    expect(getByText('Choose which notifications you want to receive')).toBeTruthy();
    expect(getByText('Delivery Status Updates')).toBeTruthy();
    expect(getByText('Location Updates')).toBeTruthy();
    expect(getByText('Route Changes')).toBeTruthy();
    expect(getByText('Collection Updates')).toBeTruthy();
  });

  it('toggles preferences when switch is pressed', async () => {
    const { getAllByRole } = render(
      <NotificationPreferences personnelId="test-id" />
    );

    const switches = getAllByRole('switch');
    
    // Toggle first switch (Delivery Status Updates)
    fireEvent.press(switches[0]);
    expect(mockTogglePreference).toHaveBeenCalledWith('deliveryStatusUpdates');

    // Toggle second switch (Location Updates)
    fireEvent.press(switches[1]);
    expect(mockTogglePreference).toHaveBeenCalledWith('locationUpdates');
  });

  it('toggles preferences when preference item is pressed', async () => {
    const { getByText } = render(
      <NotificationPreferences personnelId="test-id" />
    );

    // Press the Delivery Status Updates item
    fireEvent.press(getByText('Delivery Status Updates'));
    expect(mockTogglePreference).toHaveBeenCalledWith('deliveryStatusUpdates');

    // Press the Location Updates item
    fireEvent.press(getByText('Location Updates'));
    expect(mockTogglePreference).toHaveBeenCalledWith('locationUpdates');
  });

  it('displays correct switch states based on preferences', () => {
    const { getAllByRole } = render(
      <NotificationPreferences personnelId="test-id" />
    );

    const switches = getAllByRole('switch');
    
    // Check initial states
    expect(switches[0].props.value).toBe(true); // deliveryStatusUpdates
    expect(switches[1].props.value).toBe(false); // locationUpdates
    expect(switches[2].props.value).toBe(true); // routeChanges
    expect(switches[3].props.value).toBe(false); // collectionUpdates
  });
}); 