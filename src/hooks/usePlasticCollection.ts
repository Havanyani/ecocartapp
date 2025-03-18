import { SafeStorage } from '@/utils/storage';
import { useCallback, useEffect, useState } from 'react';
import { Alert } from 'react-native';
import { generateUniqueId } from '@/utils/UniqueIdGenerator';
import { useUser } from './useUser';

export interface Location {
  latitude: number;
  longitude: number;
  address?: string;
}

export type PickupStatus = 'pending' | 'in_progress' | 'completed' | 'cancelled';

export interface Pickup {
  id: string;
  userId: string;
  materialType: string;
  estimatedWeight: number;
  actualWeight?: number;
  status: PickupStatus;
  address: string;
  location?: Location;
  scheduledDateTime: Date;
  completedDateTime?: Date;
  notes?: string;
  contactPhone?: string;
  collectorId?: string;
  credits?: number;
}

export interface PickupRequestData {
  materialType: string;
  estimatedWeight: number;
  address: string;
  notes?: string;
  scheduledDateTime: Date;
  contactPhone?: string;
  location?: Location;
}

/**
 * Hook for managing plastic waste collection pickups
 */
export function usePlasticCollection() {
  const [pickups, setPickups] = useState<Pickup[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<Error | null>(null);
  
  const { user } = useUser();
  
  /**
   * Load pickups from storage
   */
  const loadPickups = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    
    try {
      const storedPickups = await SafeStorage.getItem('pickups');
      if (storedPickups) {
        // Parse and convert date strings to Date objects
        const parsedPickups: Pickup[] = JSON.parse(storedPickups);
        const formattedPickups = parsedPickups.map(pickup => ({
          ...pickup,
          scheduledDateTime: new Date(pickup.scheduledDateTime),
          completedDateTime: pickup.completedDateTime 
            ? new Date(pickup.completedDateTime) 
            : undefined
        }));
        
        setPickups(formattedPickups);
      }
    } catch (err) {
      setError(err instanceof Error ? err : new Error('Failed to load pickups'));
      console.error('Error loading pickups:', err);
    } finally {
      setIsLoading(false);
    }
  }, []);
  
  /**
   * Save pickups to storage
   */
  const savePickups = async (updatedPickups: Pickup[]) => {
    try {
      await SafeStorage.setItem('pickups', JSON.stringify(updatedPickups));
    } catch (err) {
      console.error('Error saving pickups:', err);
      Alert.alert('Error', 'Failed to save pickup data.');
    }
  };
  
  /**
   * Load pickups on component mount
   */
  useEffect(() => {
    loadPickups();
  }, [loadPickups]);
  
  /**
   * Submit a new pickup request
   */
  const submitPickupRequest = async (pickupData: PickupRequestData): Promise<Pickup> => {
    if (!user) {
      throw new Error('User must be logged in to request a pickup');
    }
    
    // Create a new pickup object
    const newPickup: Pickup = {
      id: generateUniqueId(),
      userId: user.id,
      materialType: pickupData.materialType,
      estimatedWeight: pickupData.estimatedWeight,
      status: 'pending',
      address: pickupData.address,
      location: pickupData.location,
      scheduledDateTime: pickupData.scheduledDateTime,
      notes: pickupData.notes,
      contactPhone: pickupData.contactPhone
    };
    
    // Add to state and save to storage
    const updatedPickups = [...pickups, newPickup];
    setPickups(updatedPickups);
    await savePickups(updatedPickups);
    
    return newPickup;
  };
  
  /**
   * Update an existing pickup request
   */
  const updatePickupRequest = async (
    pickupId: string, 
    pickupData: Partial<PickupRequestData>
  ): Promise<Pickup> => {
    const pickupIndex = pickups.findIndex(p => p.id === pickupId);
    
    if (pickupIndex === -1) {
      throw new Error('Pickup not found');
    }
    
    // Create updated pickup
    const updatedPickup: Pickup = {
      ...pickups[pickupIndex],
      ...pickupData
    };
    
    // Update state and save to storage
    const updatedPickups = [...pickups];
    updatedPickups[pickupIndex] = updatedPickup;
    
    setPickups(updatedPickups);
    await savePickups(updatedPickups);
    
    return updatedPickup;
  };
  
  /**
   * Update the status of a pickup
   */
  const updatePickupStatus = async (
    pickupId: string, 
    status: PickupStatus,
    location?: Location
  ): Promise<Pickup> => {
    const pickupIndex = pickups.findIndex(p => p.id === pickupId);
    
    if (pickupIndex === -1) {
      throw new Error('Pickup not found');
    }
    
    // Create a copy of the current pickup
    const updatedPickup: Pickup = { ...pickups[pickupIndex], status };
    
    // Add completed datetime for completed pickups
    if (status === 'completed') {
      updatedPickup.completedDateTime = new Date();
    }
    
    // Update location if provided
    if (location) {
      updatedPickup.location = location;
    }
    
    // Update state and save to storage
    const updatedPickups = [...pickups];
    updatedPickups[pickupIndex] = updatedPickup;
    
    setPickups(updatedPickups);
    await savePickups(updatedPickups);
    
    return updatedPickup;
  };
  
  /**
   * Submit actual weight for a completed pickup
   */
  const submitPickupWeight = async (
    pickupId: string, 
    weight: number
  ): Promise<Pickup> => {
    const pickupIndex = pickups.findIndex(p => p.id === pickupId);
    
    if (pickupIndex === -1) {
      throw new Error('Pickup not found');
    }
    
    // Calculate credits based on weight and material type
    // This could be more sophisticated with different rates per material
    const creditsEarned = Math.round(weight * 10); // Simple calculation: 10 credits per kg
    
    // Create updated pickup with weight and credits
    const updatedPickup: Pickup = {
      ...pickups[pickupIndex],
      actualWeight: weight,
      credits: creditsEarned,
      status: 'completed',
      completedDateTime: new Date()
    };
    
    // Update state and save to storage
    const updatedPickups = [...pickups];
    updatedPickups[pickupIndex] = updatedPickup;
    
    setPickups(updatedPickups);
    await savePickups(updatedPickups);
    
    return updatedPickup;
  };
  
  /**
   * Refresh pickups data
   */
  const refreshPickups = async (): Promise<void> => {
    await loadPickups();
  };
  
  return {
    pickups,
    isLoading,
    error,
    updatePickupStatus,
    submitPickupWeight,
    submitPickupRequest,
    updatePickupRequest,
    refreshPickups
  };
} 