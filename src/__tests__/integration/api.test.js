import { mockUserProfile } from '../../services/MockDataService';
import { fetchUserProfile, scheduleCollection } from '../../services/api';
import { AppError, ErrorCodes } from '../../utils/ErrorHandler';

describe('API Integration', () => {
  const mockFetch = jest.fn();
  global.fetch = mockFetch;

  beforeEach(() => {
    mockFetch.mockClear();
  });

  describe('Collection API', () => {
    it('schedules a collection successfully', async () => {
      global.fetch = jest.fn().mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve({ id: 'collection-123' })
      });

      const response = await scheduleCollection({
        date: '2024-03-20',
        timeSlot: '09:00-12:00'
      });

      expect(response.id).toBe('collection-123');
    });

    it('handles scheduling errors', async () => {
      global.fetch = jest.fn().mockResolvedValueOnce({
        ok: false,
        status: 400
      });

      await expect(scheduleCollection({}))
        .rejects
        .toThrow(new AppError(ErrorCodes.SCHEDULING_ERROR));
    });
  });

  describe('User Profile API', () => {
    it('fetches user profile successfully', async () => {
      mockFetch.mockImplementationOnce(() => 
        Promise.resolve({
          ok: true,
          json: () => Promise.resolve(mockUserProfile)
        })
      );

      const profile = await fetchUserProfile('user123');
      expect(profile.stats.plasticCollected).toBe(52.4);
    });
  });
}); 