import { Todo } from '@/components/Todo';
import { collectionService } from '@/services/CollectionService';
import { fireEvent, render, waitFor } from '@testing-library/react-native';
import React from 'react';
import { Provider } from 'react-redux';
import configureStore from 'redux-mock-store';

// Mock dependencies
jest.mock('@/services/CollectionService', () => ({
  collectionService: {
    getCollectionHistory: jest.fn(),
    updateCollectionStatus: jest.fn(),
  },
}));

// Mock theme hook
jest.mock('@/hooks/useTheme', () => ({
  useTheme: () => ({
    theme: {
      colors: {
        primary: '#2e7d32',
        success: '#4caf50',
        error: '#f44336',
        warning: '#ff9800',
        background: '#ffffff',
        textSecondary: '#757575',
      },
    },
  }),
}));

const mockStore = configureStore([]);

describe('Todo Component', () => {
  let store: any;
  const mockCollections = [
    {
      id: '1234abcd',
      userId: 'user123',
      scheduledDateTime: new Date(Date.now() + 86400000).toISOString(), // tomorrow
      status: 'pending',
      materials: [{ id: 'mat1', material: { name: 'Plastic' }, quantity: 2, condition: 'good' }],
      location: {
        id: 'loc1',
        type: 'home',
        street: '123 Main St',
        city: 'Anytown',
        state: 'CA',
        zipCode: '12345',
      },
      estimatedDuration: 30,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      statusHistory: [],
    },
    {
      id: '5678efgh',
      userId: 'user123',
      scheduledDateTime: new Date(Date.now() - 86400000).toISOString(), // yesterday (overdue)
      status: 'pending',
      materials: [
        { id: 'mat2', material: { name: 'Glass' }, quantity: 1, condition: 'good' },
        { id: 'mat3', material: { name: 'Paper' }, quantity: 3, condition: 'fair' },
      ],
      location: {
        id: 'loc2',
        type: 'home',
        street: '456 Oak St',
        city: 'Somecity',
        state: 'NY',
        zipCode: '54321',
      },
      estimatedDuration: 45,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      statusHistory: [],
    },
  ];

  beforeEach(() => {
    store = mockStore({
      collection: {
        collections: mockCollections,
        isLoading: false,
        error: null,
      },
    });

    (collectionService.getCollectionHistory as jest.Mock).mockResolvedValue(mockCollections);
    (collectionService.updateCollectionStatus as jest.Mock).mockResolvedValue({});
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('renders correctly with collection tasks', async () => {
    const { getByText, getAllByRole, queryByText } = render(
      <Provider store={store}>
        <Todo type="collection" maxItems={5} />
      </Provider>
    );

    await waitFor(() => {
      expect(getByText('Upcoming Tasks')).toBeTruthy();
      expect(getByText('Collection #1234abcd')).toBeTruthy();
      expect(getByText('Collection #5678efgh')).toBeTruthy();
      expect(getByText('Overdue')).toBeTruthy(); // Should show overdue badge
      expect(getAllByRole('button').length).toBeGreaterThan(1); // At least one task card
    });
  });

  it('handles task completion', async () => {
    const onTaskComplete = jest.fn();
    const { getAllByRole } = render(
      <Provider store={store}>
        <Todo type="collection" maxItems={5} onTaskComplete={onTaskComplete} />
      </Provider>
    );

    await waitFor(() => {
      const completeButtons = getAllByRole('button');
      fireEvent.press(completeButtons[1]); // Mark the first task as complete
    });

    await waitFor(() => {
      expect(collectionService.updateCollectionStatus).toHaveBeenCalledWith(expect.any(String), 'completed');
      expect(collectionService.getCollectionHistory).toHaveBeenCalledTimes(2); // Once on mount, once after completion
    });
  });

  it('shows loading state', async () => {
    (collectionService.getCollectionHistory as jest.Mock).mockImplementationOnce(() => {
      return new Promise(resolve => setTimeout(() => resolve(mockCollections), 100));
    });

    const { getByTestId } = render(
      <Provider store={store}>
        <Todo type="collection" maxItems={5} testID="todo-component" />
      </Provider>
    );

    // Initially shows loading
    expect(getByTestId('todo-component-loading')).toBeTruthy();

    // Wait for data to load
    await waitFor(() => {
      expect(collectionService.getCollectionHistory).toHaveBeenCalled();
    });
  });

  it('filters tasks by type', async () => {
    const { getByText, queryByText } = render(
      <Provider store={store}>
        <Todo type="delivery" maxItems={5} />
      </Provider>
    );

    await waitFor(() => {
      // Since we're filtering for "delivery" type and our mock data only has "collection" type,
      // we should see the empty state
      expect(getByText('All tasks completed!')).toBeTruthy();
      expect(queryByText('Collection #1234abcd')).toBeNull();
    });
  });
}); 