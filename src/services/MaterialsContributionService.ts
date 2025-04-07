/**
 * MaterialsContributionService.ts
 * 
 * Service for managing crowdsourced container recognition contributions
 */

import AsyncStorage from '@react-native-async-storage/async-storage';

// Types for container contributions
export interface ContainerContribution {
  id: string;
  containerName: string;
  material: string;
  isRecyclable: boolean;
  description?: string;
  instructions?: string;
  location?: string;
  uploadedBy: string; // user ID
  uploadedAt: Date;
  status: 'pending' | 'approved' | 'rejected';
  imageUri: string;
  verificationCount: number;
  tags?: string[];
  environmentalImpact?: {
    co2Saved?: number;
    waterSaved?: number;
  };
  rejectionReason?: string;
}

export interface ContributionResult {
  success: boolean;
  message: string;
  contributionId?: string;
  error?: any;
}

// Mock API endpoints for development
const UPLOAD_IMAGE = 'https://api.ecocart.app/v1/upload-image';
const SUBMIT_CONTRIBUTION = 'https://api.ecocart.app/v1/contributions';
const GET_PENDING_CONTRIBUTIONS = 'https://api.ecocart.app/v1/contributions/pending';
const VERIFY_CONTRIBUTION = 'https://api.ecocart.app/v1/contributions/:id/verify';
const REJECT_CONTRIBUTION = 'https://api.ecocart.app/v1/contributions/:id/reject';
const GET_USER_CONTRIBUTIONS = 'https://api.ecocart.app/v1/users/:id/contributions';

// Local array to store contributions during development
const MOCK_CONTRIBUTIONS: ContainerContribution[] = [];
const REQUIRED_VERIFICATIONS = 3; // Number of verifications required for auto-approval

/**
 * Service for managing material contributions from users
 */
export class MaterialsContributionService {
  private readonly API_ENDPOINT = 'https://api.ecocart.app/v1/contributions';
  private readonly STORAGE_KEY_CONTRIBUTIONS = '@ecocart:user_contributions';
  private readonly STORAGE_KEY_PENDING = '@ecocart:pending_contributions';
  
  /**
   * Submit a new material contribution
   * @param contribution The contribution data including image and metadata
   * @returns Result object with success flag and ID or error
   */
  async submitContribution(contribution: {
    imageData: string;
    materialType: string;
    containerType: string;
    notes?: string;
    location?: { latitude: number; longitude: number };
  }): Promise<{ success: boolean; id?: string; error?: string }> {
    // Validate required fields
    if (!contribution.imageData) {
      return { success: false, error: 'Image data is required' };
    }
    
    if (!contribution.materialType) {
      return { success: false, error: 'Material type is required' };
    }
    
    if (!contribution.containerType) {
      return { success: false, error: 'Container type is required' };
    }
    
    try {
      // Attempt to send to server
      const response = await fetch(this.API_ENDPOINT, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          ...contribution,
          timestamp: new Date().toISOString(),
        }),
      });
      
      if (response.ok) {
        const result = await response.json();
        
        // Add to local contributions list
        await this.addToLocalContributions({
          id: result.id,
          materialType: contribution.materialType,
          containerType: contribution.containerType,
          timestamp: new Date().toISOString(),
          status: 'pending',
          notes: contribution.notes || '',
        });
        
        return { success: true, id: result.id };
      } else {
        const errorData = await response.json();
        
        // Store locally for later sync
        await this.addToPendingContributions(contribution);
        
        return { 
          success: false, 
          error: errorData.error || `Server error: ${response.status}`
        };
      }
    } catch (error) {
      // Network or other error, store for later sync
      await this.addToPendingContributions(contribution);
      
      return { 
        success: false, 
        error: error instanceof Error ? error.message : 'Unknown error'
      };
    }
  }
  
  /**
   * Get all contributions made by the current user
   */
  async getUserContributions(): Promise<Array<{
    id: string;
    materialType: string;
    containerType: string;
    timestamp: string;
    status: 'pending' | 'approved' | 'rejected';
    notes: string;
  }>> {
    try {
      const data = await AsyncStorage.getItem(this.STORAGE_KEY_CONTRIBUTIONS);
      
      if (data) {
        return JSON.parse(data);
      }
      
      return [];
    } catch (error) {
      console.error('Error retrieving user contributions:', error);
      return [];
    }
  }
  
  /**
   * Attempt to sync any pending contributions that failed to submit
   */
  async syncPendingContributions(): Promise<{ success: boolean; count: number }> {
    try {
      const pendingData = await AsyncStorage.getItem(this.STORAGE_KEY_PENDING);
      
      if (!pendingData) {
        return { success: true, count: 0 };
      }
      
      const pendingContributions = JSON.parse(pendingData);
      let syncedCount = 0;
      const failed = [];
      
      for (const contribution of pendingContributions) {
        try {
          const result = await this.submitContribution(contribution);
          
          if (result.success) {
            syncedCount++;
          } else {
            failed.push(contribution);
          }
        } catch (error) {
          failed.push(contribution);
        }
      }
      
      // Update the pending list with only failed items
      await AsyncStorage.setItem(this.STORAGE_KEY_PENDING, JSON.stringify(failed));
      
      return {
        success: true,
        count: syncedCount
      };
    } catch (error) {
      console.error('Error syncing pending contributions:', error);
      return { success: false, count: 0 };
    }
  }
  
  /**
   * Verify a contribution (for admin/moderator use)
   */
  async verifyContribution(
    id: string, 
    approved: boolean, 
    feedback: string
  ): Promise<{ success: boolean; error?: string }> {
    try {
      const response = await fetch(`${this.API_ENDPOINT}/${id}/verify`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          approved,
          feedback,
          timestamp: new Date().toISOString(),
        }),
      });
      
      if (response.ok) {
        // Update local status if this was one of our contributions
        await this.updateLocalContributionStatus(id, approved ? 'approved' : 'rejected');
        return { success: true };
      } else {
        const errorData = await response.json();
        return { 
          success: false, 
          error: errorData.error || `Verification failed: ${response.status}`
        };
      }
    } catch (error) {
      return { 
        success: false, 
        error: error instanceof Error ? error.message : 'Unknown error'
      };
    }
  }
  
  /**
   * Add a contribution to the pending list for later sync
   */
  private async addToPendingContributions(contribution: any): Promise<void> {
    try {
      let pendingContributions = [];
      const data = await AsyncStorage.getItem(this.STORAGE_KEY_PENDING);
      
      if (data) {
        pendingContributions = JSON.parse(data);
      }
      
      pendingContributions.push({
        ...contribution,
        localId: `local-${Date.now()}`,
        timestamp: new Date().toISOString(),
      });
      
      await AsyncStorage.setItem(
        this.STORAGE_KEY_PENDING, 
        JSON.stringify(pendingContributions)
      );
    } catch (error) {
      console.error('Error saving pending contribution:', error);
    }
  }
  
  /**
   * Add a contribution to the user's local history
   */
  private async addToLocalContributions(contribution: any): Promise<void> {
    try {
      let contributions = [];
      const data = await AsyncStorage.getItem(this.STORAGE_KEY_CONTRIBUTIONS);
      
      if (data) {
        contributions = JSON.parse(data);
      }
      
      contributions.push(contribution);
      
      await AsyncStorage.setItem(
        this.STORAGE_KEY_CONTRIBUTIONS, 
        JSON.stringify(contributions)
      );
    } catch (error) {
      console.error('Error saving local contribution:', error);
    }
  }
  
  /**
   * Update the status of a local contribution
   */
  private async updateLocalContributionStatus(
    id: string, 
    status: 'pending' | 'approved' | 'rejected'
  ): Promise<void> {
    try {
      const data = await AsyncStorage.getItem(this.STORAGE_KEY_CONTRIBUTIONS);
      
      if (data) {
        const contributions = JSON.parse(data);
        const updated = contributions.map((item: any) => {
          if (item.id === id) {
            return { ...item, status };
          }
          return item;
        });
        
        await AsyncStorage.setItem(
          this.STORAGE_KEY_CONTRIBUTIONS, 
          JSON.stringify(updated)
        );
      }
    } catch (error) {
      console.error('Error updating contribution status:', error);
    }
  }
}

/**
 * Simulate uploading an image to a storage server
 * 
 * @param localImageUri Local URI of the image
 * @returns Remote URL of the uploaded image
 */
export const uploadContributionImage = async (localImageUri: string): Promise<string> => {
  // In a real app, this would upload the image to Firebase Storage or similar
  return new Promise((resolve) => {
    // Simulate network delay
    setTimeout(() => {
      // Return a mock remote URL
      resolve(`https://storage.ecocart.app/contributions/${Date.now()}.jpg`);
    }, 500);
  });
};

/**
 * Get a list of pending contributions for verification
 * 
 * @param excludeUserId Optional user ID to exclude from results (don't show user their own contributions)
 * @returns Array of pending contributions
 */
export const getPendingContributions = async (excludeUserId?: string): Promise<ContainerContribution[]> => {
  // In a real app, we'd fetch this from an API
  // For now, we filter our mock array
  
  return new Promise((resolve) => {
    // Simulate network delay
    setTimeout(() => {
      const pendingContributions = MOCK_CONTRIBUTIONS.filter(contribution => {
        return contribution.status === 'pending' && 
               (!excludeUserId || contribution.uploadedBy !== excludeUserId);
      });
      
      resolve(pendingContributions);
    }, 500);
  });
};

/**
 * Get contributions made by a specific user
 * 
 * @param userId ID of the user
 * @returns Array of contributions made by the user
 */
export const getUserContributions = async (userId: string): Promise<ContainerContribution[]> => {
  // In a real app, we'd fetch this from an API
  // For now, we filter our mock array
  
  return new Promise((resolve) => {
    // Simulate network delay
    setTimeout(() => {
      const userContributions = MOCK_CONTRIBUTIONS.filter(contribution => {
        return contribution.uploadedBy === userId;
      });
      
      resolve(userContributions);
    }, 500);
  });
};

/**
 * Verify a contribution, increasing its verification count
 * Auto-approves if enough verifications are reached
 * 
 * @param contributionId ID of the contribution to verify
 * @param verifiedBy ID of the user verifying the contribution
 * @returns ContributionResult object
 */
export const verifyContribution = async (
  contributionId: string,
  verifiedBy: string
): Promise<ContributionResult> => {
  try {
    // Find the contribution in our mock array
    const contributionIndex = MOCK_CONTRIBUTIONS.findIndex(c => c.id === contributionId);
    
    if (contributionIndex === -1) {
      return {
        success: false,
        message: 'Contribution not found',
      };
    }
    
    // Update the verification count
    MOCK_CONTRIBUTIONS[contributionIndex].verificationCount += 1;
    
    // Auto-approve if enough verifications
    if (MOCK_CONTRIBUTIONS[contributionIndex].verificationCount >= REQUIRED_VERIFICATIONS) {
      MOCK_CONTRIBUTIONS[contributionIndex].status = 'approved';
    }
    
    const isApproved = MOCK_CONTRIBUTIONS[contributionIndex].status === 'approved';
    
    return {
      success: true,
      message: isApproved 
        ? 'Contribution verified and approved' 
        : 'Contribution verified',
      contributionId
    };
  } catch (error) {
    console.error('Error verifying contribution:', error);
    return {
      success: false,
      message: 'Failed to verify contribution',
      error
    };
  }
};

/**
 * Reject a contribution
 * 
 * @param contributionId ID of the contribution to reject
 * @param rejectedBy ID of the user rejecting the contribution
 * @param reason Reason for rejection
 * @returns ContributionResult object
 */
export const rejectContribution = async (
  contributionId: string,
  rejectedBy: string,
  reason: string
): Promise<ContributionResult> => {
  try {
    // Find the contribution in our mock array
    const contributionIndex = MOCK_CONTRIBUTIONS.findIndex(c => c.id === contributionId);
    
    if (contributionIndex === -1) {
      return {
        success: false,
        message: 'Contribution not found',
      };
    }
    
    // Update the status
    MOCK_CONTRIBUTIONS[contributionIndex].status = 'rejected';
    MOCK_CONTRIBUTIONS[contributionIndex].rejectionReason = reason;
    
    return {
      success: true,
      message: 'Contribution rejected',
      contributionId
    };
  } catch (error) {
    console.error('Error rejecting contribution:', error);
    return {
      success: false,
      message: 'Failed to reject contribution',
      error
    };
  }
};

/**
 * Convert an approved contribution to a container type format
 * For integration with the container recognition system
 * 
 * @param contributionId ID of the approved contribution
 * @returns Formatted container type object or null if conversion fails
 */
export const contributionToContainerType = (contributionId: string): any | null => {
  const contribution = MOCK_CONTRIBUTIONS.find(c => c.id === contributionId && c.status === 'approved');
  
  if (!contribution) {
    return null;
  }
  
  // Convert to format used by container recognition system
  return {
    id: contribution.id,
    name: contribution.containerName,
    material: contribution.material,
    isRecyclable: contribution.isRecyclable,
    recyclableComponents: [],
    instructions: contribution.instructions || '',
    imageUrl: contribution.imageUri,
    environmentalImpact: contribution.environmentalImpact || {
      co2Saved: 0,
      waterSaved: 0
    },
    tags: contribution.tags || []
  };
};
