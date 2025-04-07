import {
    contributionToContainerType,
    getPendingContributions,
    getUserContributions,
    rejectContribution,
    submitContribution,
    uploadContributionImage,
    verifyContribution
} from '../../services/MaterialsContributionService';

describe('MaterialsContributionService', () => {
  // Reset mocks before each test
  beforeEach(() => {
    // Clear any internal mocked contribution data
    jest.clearAllMocks();
  });

  describe('submitContribution', () => {
    it('should submit a new contribution and return success', async () => {
      const mockContribution = {
        containerName: 'Test Container',
        material: 'plastic',
        isRecyclable: true,
        description: 'A test container',
        instructions: 'Rinse and recycle',
        location: 'Test Location',
        imageUri: 'file://test-image.jpg',
        userId: 'user123'
      };

      const result = await submitContribution(mockContribution);
      
      expect(result.success).toBe(true);
      expect(result.contributionId).toBeDefined();
      expect(result.contribution).toEqual(expect.objectContaining({
        containerName: 'Test Container',
        material: 'plastic',
        isRecyclable: true,
        status: 'pending'
      }));
    });

    it('should handle submission with missing image', async () => {
      const mockContribution = {
        containerName: 'Test Container',
        material: 'plastic',
        isRecyclable: true,
        description: 'A test container',
        instructions: '',
        location: '',
        imageUri: '',
        userId: 'user123'
      };

      await expect(submitContribution(mockContribution)).rejects.toThrow('Image is required');
    });

    it('should handle submission with missing required fields', async () => {
      const mockContribution = {
        containerName: '',
        material: 'plastic',
        isRecyclable: true,
        description: 'A test container',
        instructions: '',
        location: '',
        imageUri: 'file://test-image.jpg',
        userId: 'user123'
      };

      await expect(submitContribution(mockContribution)).rejects.toThrow('Container name is required');
    });
  });

  describe('uploadContributionImage', () => {
    it('should simulate uploading an image and return a URL', async () => {
      const localUri = 'file://test-image.jpg';
      const result = await uploadContributionImage(localUri);
      
      expect(result).toMatch(/^https:\/\/mockserver\.com\/uploads\/[a-zA-Z0-9-]+\.jpg$/);
    });

    it('should handle invalid image URIs', async () => {
      const localUri = '';
      await expect(uploadContributionImage(localUri)).rejects.toThrow('Invalid image URI');
    });
  });

  describe('getPendingContributions', () => {
    it('should return a list of pending contributions', async () => {
      // First submit a test contribution
      await submitContribution({
        containerName: 'Pending Test',
        material: 'glass',
        isRecyclable: true,
        description: 'A test container',
        instructions: '',
        location: '',
        imageUri: 'file://test-image.jpg',
        userId: 'user123'
      });
      
      const pendingContributions = await getPendingContributions();
      
      expect(Array.isArray(pendingContributions)).toBe(true);
      expect(pendingContributions.length).toBeGreaterThan(0);
      expect(pendingContributions[0]).toEqual(expect.objectContaining({
        status: 'pending'
      }));
    });
  });

  describe('getUserContributions', () => {
    it('should return contributions made by a specific user', async () => {
      // First submit a test contribution
      await submitContribution({
        containerName: 'User Test',
        material: 'aluminum',
        isRecyclable: true,
        description: 'A test container',
        instructions: '',
        location: '',
        imageUri: 'file://test-image.jpg',
        userId: 'user456'
      });
      
      const userContributions = await getUserContributions('user456');
      
      expect(Array.isArray(userContributions)).toBe(true);
      expect(userContributions.length).toBeGreaterThan(0);
      expect(userContributions[0]).toEqual(expect.objectContaining({
        uploadedBy: 'user456'
      }));
    });

    it('should return an empty array for a user with no contributions', async () => {
      const userContributions = await getUserContributions('nonexistent-user');
      
      expect(Array.isArray(userContributions)).toBe(true);
      expect(userContributions.length).toBe(0);
    });
  });

  describe('verifyContribution', () => {
    it('should increase the verification count for a contribution', async () => {
      // First submit a test contribution
      const submitted = await submitContribution({
        containerName: 'Verify Test',
        material: 'paper',
        isRecyclable: true,
        description: 'A test container',
        instructions: '',
        location: '',
        imageUri: 'file://test-image.jpg',
        userId: 'user789'
      });
      
      const result = await verifyContribution(submitted.contributionId, 'different-user');
      
      expect(result.success).toBe(true);
      expect(result.contribution.verificationCount).toBe(1);
    });

    it('should not allow a user to verify their own contribution', async () => {
      // First submit a test contribution
      const submitted = await submitContribution({
        containerName: 'Self Verify Test',
        material: 'plastic',
        isRecyclable: true,
        description: 'A test container',
        instructions: '',
        location: '',
        imageUri: 'file://test-image.jpg',
        userId: 'user-self'
      });
      
      await expect(verifyContribution(submitted.contributionId, 'user-self'))
        .rejects.toThrow('Users cannot verify their own contributions');
    });

    it('should auto-approve a contribution after reaching threshold', async () => {
      // First submit a test contribution
      const submitted = await submitContribution({
        containerName: 'Auto Approve Test',
        material: 'plastic',
        isRecyclable: true,
        description: 'A test container',
        instructions: '',
        location: '',
        imageUri: 'file://test-image.jpg',
        userId: 'user-approve'
      });
      
      // Verify multiple times to reach threshold (3 verifications)
      await verifyContribution(submitted.contributionId, 'verifier1');
      await verifyContribution(submitted.contributionId, 'verifier2');
      const result = await verifyContribution(submitted.contributionId, 'verifier3');
      
      expect(result.success).toBe(true);
      expect(result.contribution.status).toBe('approved');
      expect(result.contribution.verificationCount).toBe(3);
    });
  });

  describe('rejectContribution', () => {
    it('should change the status of a contribution to rejected', async () => {
      // First submit a test contribution
      const submitted = await submitContribution({
        containerName: 'Reject Test',
        material: 'glass',
        isRecyclable: true,
        description: 'A test container',
        instructions: '',
        location: '',
        imageUri: 'file://test-image.jpg',
        userId: 'user-reject'
      });
      
      const result = await rejectContribution(submitted.contributionId, 'Admin reason for rejection');
      
      expect(result.success).toBe(true);
      expect(result.contribution.status).toBe('rejected');
      expect(result.contribution.rejectionReason).toBe('Admin reason for rejection');
    });

    it('should require a reason for rejection', async () => {
      // First submit a test contribution
      const submitted = await submitContribution({
        containerName: 'No Reason Reject Test',
        material: 'paper',
        isRecyclable: true,
        description: 'A test container',
        instructions: '',
        location: '',
        imageUri: 'file://test-image.jpg',
        userId: 'user-no-reason'
      });
      
      await expect(rejectContribution(submitted.contributionId, ''))
        .rejects.toThrow('Rejection reason is required');
    });
  });

  describe('contributionToContainerType', () => {
    it('should convert an approved contribution to container type format', () => {
      const mockContribution = {
        id: 'contrib-123',
        containerName: 'Converted Container',
        material: 'plastic',
        isRecyclable: true,
        description: 'A container to convert',
        uploadedBy: 'user-convert',
        uploadedAt: new Date().toISOString(),
        status: 'approved',
        imageUri: 'https://example.com/image.jpg',
        verificationCount: 3,
        environmentalImpact: {
          co2Savings: 2.5,
          waterSavings: 100,
          energyConservation: 5.8
        }
      };
      
      const containerType = contributionToContainerType(mockContribution);
      
      expect(containerType).toEqual({
        id: 'contrib-123',
        name: 'Converted Container',
        material: 'plastic',
        isRecyclable: true,
        description: 'A container to convert',
        imageUrl: 'https://example.com/image.jpg',
        environmentalImpact: {
          co2Savings: 2.5,
          waterSavings: 100,
          energyConservation: 5.8
        }
      });
    });
  });
}); 