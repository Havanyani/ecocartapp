import AsyncStorage from '@react-native-async-storage/async-storage';
import { MaterialsContributionService } from '../../src/services/MaterialsContributionService';

// Mock AsyncStorage
jest.mock('@react-native-async-storage/async-storage', () => ({
  getItem: jest.fn(),
  setItem: jest.fn(),
  removeItem: jest.fn(),
  clear: jest.fn(),
}));

// Mock API calls
global.fetch = jest.fn(() =>
  Promise.resolve({
    ok: true,
    json: () => Promise.resolve({ success: true, id: 'test-id' }),
    status: 200,
  })
) as jest.Mock;

describe('MaterialsContributionService', () => {
  let service: MaterialsContributionService;

  beforeEach(() => {
    service = new MaterialsContributionService();
    jest.clearAllMocks();
  });

  describe('submitContribution', () => {
    const validContribution = {
      imageData: 'base64-image-data',
      materialType: 'plastic',
      containerType: 'bottle',
      notes: 'Clear plastic water bottle',
      location: { latitude: 40.7128, longitude: -74.0060 },
    };

    it('should successfully submit a valid contribution', async () => {
      const result = await service.submitContribution(validContribution);
      
      expect(result.success).toBe(true);
      expect(fetch).toHaveBeenCalledTimes(1);
      expect(fetch).toHaveBeenCalledWith(
        expect.any(String),
        expect.objectContaining({
          method: 'POST',
          headers: expect.objectContaining({
            'Content-Type': 'application/json',
          }),
          body: expect.any(String),
        })
      );
    });

    it('should handle API errors gracefully', async () => {
      (global.fetch as jest.Mock).mockImplementationOnce(() =>
        Promise.resolve({
          ok: false,
          status: 500,
          json: () => Promise.resolve({ success: false, error: 'Server error' }),
        })
      );

      const result = await service.submitContribution(validContribution);
      
      expect(result.success).toBe(false);
      expect(result.error).toBeDefined();
    });

    it('should validate required fields', async () => {
      const invalidContribution = { ...validContribution, imageData: '' };
      
      const result = await service.submitContribution(invalidContribution);
      
      expect(result.success).toBe(false);
      expect(result.error).toContain('image');
    });

    it('should save contribution to local pending list on API failure', async () => {
      (global.fetch as jest.Mock).mockImplementationOnce(() => Promise.reject(new Error('Network error')));
      
      const result = await service.submitContribution(validContribution);
      
      expect(result.success).toBe(false);
      expect(AsyncStorage.getItem).toHaveBeenCalled();
      expect(AsyncStorage.setItem).toHaveBeenCalled();
    });
  });

  describe('getUserContributions', () => {
    it('should fetch user contributions from storage', async () => {
      const mockContributions = JSON.stringify([
        { id: '1', materialType: 'plastic', status: 'pending' },
        { id: '2', materialType: 'glass', status: 'approved' },
      ]);
      
      (AsyncStorage.getItem as jest.Mock).mockResolvedValueOnce(mockContributions);
      
      const contributions = await service.getUserContributions();
      
      expect(contributions.length).toBe(2);
      expect(AsyncStorage.getItem).toHaveBeenCalledWith(expect.stringContaining('contributions'));
    });

    it('should return an empty array if no contributions exist', async () => {
      (AsyncStorage.getItem as jest.Mock).mockResolvedValueOnce(null);
      
      const contributions = await service.getUserContributions();
      
      expect(contributions).toEqual([]);
    });
  });

  describe('syncPendingContributions', () => {
    it('should attempt to sync pending contributions', async () => {
      const mockPendingContributions = JSON.stringify([
        { 
          id: 'local-1',
          imageData: 'base64-data',
          materialType: 'plastic',
          status: 'pending'
        }
      ]);
      
      (AsyncStorage.getItem as jest.Mock).mockResolvedValueOnce(mockPendingContributions);
      
      const result = await service.syncPendingContributions();
      
      expect(result.success).toBe(true);
      expect(fetch).toHaveBeenCalled();
      expect(AsyncStorage.setItem).toHaveBeenCalled();
    });
  });

  describe('verifyContribution', () => {
    it('should verify a contribution successfully', async () => {
      const result = await service.verifyContribution('test-id', true, 'Looks good');
      
      expect(result.success).toBe(true);
      expect(fetch).toHaveBeenCalledWith(
        expect.stringContaining('test-id'),
        expect.objectContaining({
          method: 'PUT',
        })
      );
    });

    it('should handle verification errors', async () => {
      (global.fetch as jest.Mock).mockImplementationOnce(() =>
        Promise.resolve({
          ok: false,
          status: 404,
          json: () => Promise.resolve({ success: false, error: 'Not found' }),
        })
      );

      const result = await service.verifyContribution('invalid-id', true, '');
      
      expect(result.success).toBe(false);
    });
  });
}); 