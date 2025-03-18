import { Alert } from 'react-native';

// Mock hooks
jest.mock('@/hooks/useCollectionSchedule', () => ({
  useCollectionSchedule: jest.fn()
}));

jest.mock('@/hooks/useCredits', () => ({
  useCredits: jest.fn()
}));

jest.mock('@/hooks/useNotifications', () => ({
  useNotifications: jest.fn()
}));

// Mock Alert
jest.spyOn(Alert, 'alert');

const mockAvailableSlots = [
  {
    id: '1',
    date: '2024-03-20',
    timeSlot: '14:00-16:00',
    isAvailable: true
  },
  {
    id: '2',
    date: '2024-03-20',
    timeSlot: '16:00-18:00'
  }
]; 