import { useTheme } from '@/theme';
import { notificationHistoryService } from '@/services/NotificationHistoryService';
import { fireEvent, render, waitFor } from '@testing-library/react-native';
import { NotificationHistory } from '../NotificationHistory';

// Mock the hooks
jest.mock('@/hooks/useTheme', () => ({
  useTheme: jest.fn(),
}));

// Mock the notification history service
jest.mock('@/services/NotificationHistoryService', () => ({
  notificationHistoryService: {
    getNotifications: jest.fn(),
    markAsRead: jest.fn(),
    getStats: jest.fn(),
  },
}));

describe('NotificationHistory', () => {
  const mockTheme = {
    colors: {
      primary: '#007AFF',
    },
  };

  const mockNotifications = [
    {
      id: '1',
      type: 'delivery_status',
      personnelId: '123',
      title: 'Delivery Status Update',
      body: 'Delivery completed successfully',
      timestamp: new Date('2024-03-14T10:00:00Z'),
      read: false,
    },
    {
      id: '2',
      type: 'location_update',
      personnelId: '123',
      title: 'Location Update',
      body: 'Driver is 5 minutes away',
      timestamp: new Date('2024-03-14T09:30:00Z'),
      read: true,
    },
  ];

  const mockStats = {
    total: 2,
    unread: 1,
    byType: {
      delivery_status: 1,
      location_update: 1,
    },
    byDate: {
      '2024-03-14': 2,
    },
  };

  beforeEach(() => {
    (useTheme as jest.Mock).mockReturnValue(mockTheme);
    (notificationHistoryService.getNotifications as jest.Mock).mockReturnValue(mockNotifications);
    (notificationHistoryService.getStats as jest.Mock).mockReturnValue(mockStats);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('renders notification history correctly', () => {
    const { getByText, getAllByTestId } = render(<NotificationHistory />);

    expect(getByText('Notification History')).toBeTruthy();
    expect(getByText('1 unread')).toBeTruthy();
    expect(getAllByTestId('notification-item')).toHaveLength(2);
  });

  it('displays empty state when no notifications', () => {
    (notificationHistoryService.getNotifications as jest.Mock).mockReturnValue([]);
    (notificationHistoryService.getStats as jest.Mock).mockReturnValue({
      total: 0,
      unread: 0,
      byType: {},
      byDate: {},
    });

    const { getByText } = render(<NotificationHistory />);

    expect(getByText('No notifications yet')).toBeTruthy();
  });

  it('marks notification as read when pressed', async () => {
    const { getAllByTestId } = render(<NotificationHistory />);
    const notifications = getAllByTestId('notification-item');

    fireEvent.press(notifications[0]);

    await waitFor(() => {
      expect(notificationHistoryService.markAsRead).toHaveBeenCalledWith('1');
    });
  });

  it('filters notifications by personnelId when provided', () => {
    render(<NotificationHistory personnelId="123" />);

    expect(notificationHistoryService.getNotifications).toHaveBeenCalledWith({
      personnelId: '123',
    });
  });

  it('calls onNotificationPress when notification is pressed', () => {
    const onNotificationPress = jest.fn();
    const { getAllByTestId } = render(
      <NotificationHistory onNotificationPress={onNotificationPress} />
    );

    const notifications = getAllByTestId('notification-item');
    fireEvent.press(notifications[0]);

    expect(onNotificationPress).toHaveBeenCalledWith(mockNotifications[0]);
  });

  it('refreshes notifications on pull to refresh', async () => {
    const { getByTestId } = render(<NotificationHistory />);
    const flatList = getByTestId('notification-list');

    fireEvent.scroll(flatList, {
      nativeEvent: {
        contentOffset: { y: -100 },
        contentSize: { height: 1000, width: 100 },
        layoutMeasurement: { height: 500, width: 100 },
        zoomScale: 1,
        timestamp: 10,
      },
    });

    await waitFor(() => {
      expect(notificationHistoryService.getNotifications).toHaveBeenCalledTimes(2);
    });
  });

  it('displays unread indicator for unread notifications', () => {
    const { getAllByTestId } = render(<NotificationHistory />);
    const unreadIndicators = getAllByTestId('unread-indicator');

    expect(unreadIndicators).toHaveLength(1);
  });
}); 