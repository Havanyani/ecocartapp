import EventEmitter from 'events';
import { useCallback, useEffect, useState } from 'react';
import { Alert } from 'react-native';

// Define mock service with event emitter capabilities
class MockARService extends EventEmitter {
  private static instance: MockARService;
  private scanning = false;
  private recentScans: ContainerData[] = [];

  private constructor() {
    super();
  }

  public static getInstance(): MockARService {
    if (!MockARService.instance) {
      MockARService.instance = new MockARService();
    }
    return MockARService.instance;
  }

  public isReady(): boolean {
    return true;
  }

  public startScanning(): void {
    this.scanning = true;
    console.log('AR scanning started');
    
    // Simulate detection after a delay
    setTimeout(() => {
      if (this.scanning) {
        const mockContainer: ContainerData = {
          id: `container-${Date.now()}`,
          name: 'Plastic Bottle',
          materialType: 'plastic',
          brand: 'EcoBottle',
          ecoPoints: 10,
          weight: 0.35,
          imageUrl: 'https://example.com/bottle.jpg',
          recyclable: true,
          isHazardous: false,
          categories: ['bottle', 'beverage'],
        };
        
        const result: ScanResult = {
          success: true,
          containerData: mockContainer,
          confidence: 0.92,
        };
        
        this.emit('containerDetected', result);
      }
    }, 2000);
  }

  public stopScanning(): void {
    this.scanning = false;
    console.log('AR scanning stopped');
  }

  public getRecentScans(limit: number): ContainerData[] {
    return this.recentScans.slice(0, limit);
  }

  public saveRecentScan(containerData: ContainerData): void {
    // Avoid duplicates
    const exists = this.recentScans.some(item => item.id === containerData.id);
    if (!exists) {
      this.recentScans = [containerData, ...this.recentScans].slice(0, 5);
    }
  }
}

// Mock Recycling Rewards Service
class MockRecyclingRewardsService {
  private static instance: MockRecyclingRewardsService;

  private constructor() {}

  public static getInstance(): MockRecyclingRewardsService {
    if (!MockRecyclingRewardsService.instance) {
      MockRecyclingRewardsService.instance = new MockRecyclingRewardsService();
    }
    return MockRecyclingRewardsService.instance;
  }

  public submitRecyclingActivity(data: {
    materialId: string;
    materialType: string;
    quantity: number;
    condition: string;
    points: number;
    weight: number;
    timestamp: string;
  }): Promise<{ success: boolean; error?: string }> {
    return Promise.resolve({ success: true });
  }
}

// Initialize mock services
const arService = MockARService.getInstance();
const rewardsService = MockRecyclingRewardsService.getInstance();

export interface ContainerData {
  id: string;
  name: string;
  materialType: string;
  brand?: string;
  ecoPoints: number;
  weight: number;
  imageUrl?: string;
  recyclable: boolean;
  isHazardous: boolean;
  disposalInstructions?: string;
  categories: string[];
}

export interface ScanResult {
  success: boolean;
  containerData?: ContainerData;
  confidence: number;
  error?: string;
}

export interface ARContainerRecognitionState {
  isInitialized: boolean;
  isScanning: boolean;
  isCameraReady: boolean;
  containerDetected: boolean;
  scanResult: ScanResult | null;
  recentScans: ContainerData[];
  error: string | null;
}

export interface ARContainerRecognitionHookReturn extends ARContainerRecognitionState {
  initialize: () => Promise<boolean>;
  startScanning: () => void;
  stopScanning: () => void;
  handleCameraReady: () => void;
  resetScan: () => void;
  submitContribution: (
    containerData: ContainerData, 
    quantity: number, 
    condition: string
  ) => Promise<boolean>;
  getDisposalInstructions: (containerData: ContainerData) => Promise<string>;
}

/**
 * Hook for AR container recognition functionality
 */
export function useARContainerRecognition(): ARContainerRecognitionHookReturn {
  // State
  const [isInitialized, setIsInitialized] = useState(true); // Mock is always initialized
  const [isScanning, setIsScanning] = useState(false);
  const [isCameraReady, setIsCameraReady] = useState(false);
  const [containerDetected, setContainerDetected] = useState(false);
  const [scanResult, setScanResult] = useState<ScanResult | null>(null);
  const [recentScans, setRecentScans] = useState<ContainerData[]>([]);
  const [error, setError] = useState<string | null>(null);

  // Initialize AR service
  const initialize = useCallback(async (): Promise<boolean> => {
    try {
      if (isInitialized) return true;
      
      // Load recent scans (mock data)
      const recent = arService.getRecentScans(5);
      setRecentScans(recent);
      
      setIsInitialized(true);
      setError(null);
      return true;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Unknown error initializing AR';
      setError(errorMessage);
      console.error('AR initialization error:', err);
      return false;
    }
  }, [isInitialized]);

  // Initialize on mount
  useEffect(() => {
    initialize();
    
    // Cleanup on unmount
    return () => {
      if (isScanning) {
        arService.stopScanning();
      }
    };
  }, []);

  // Handle container detection events
  useEffect(() => {
    const handleContainerDetected = (data: ScanResult) => {
      setContainerDetected(true);
      setScanResult(data);
      
      if (data.success && data.containerData) {
        // Add to recent scans
        setRecentScans(prev => {
          // Avoid duplicates
          const exists = prev.some(item => item.id === data.containerData!.id);
          if (exists) return prev;
          
          // Add to front, keep only 5 recent items
          return [data.containerData!, ...prev].slice(0, 5);
        });
        
        // Store in service
        arService.saveRecentScan(data.containerData);
        
        // Stop scanning since we've found a container
        stopScanning();
      }
    };

    const handleScanError = (errorMessage: string) => {
      setError(errorMessage);
      setIsScanning(false);
    };
    
    // Add event listeners
    arService.on('containerDetected', handleContainerDetected);
    arService.on('scanError', handleScanError);
    
    // Clean up event listeners
    return () => {
      arService.off('containerDetected', handleContainerDetected);
      arService.off('scanError', handleScanError);
    };
  }, []);

  // Start scanning for containers
  const startScanning = useCallback(() => {
    if (!isCameraReady) {
      console.warn('Camera not ready');
      return;
    }
    
    setIsScanning(true);
    setContainerDetected(false);
    setScanResult(null);
    setError(null);
    
    arService.startScanning();
  }, [isCameraReady]);

  // Stop scanning
  const stopScanning = useCallback(() => {
    if (isScanning) {
      arService.stopScanning();
      setIsScanning(false);
    }
  }, [isScanning]);

  // Handle camera ready event
  const handleCameraReady = useCallback(() => {
    setIsCameraReady(true);
  }, []);

  // Reset scan state
  const resetScan = useCallback(() => {
    setContainerDetected(false);
    setScanResult(null);
    setError(null);
  }, []);

  // Submit container contribution
  const submitContribution = useCallback(async (
    containerData: ContainerData,
    quantity: number,
    condition: string
  ): Promise<boolean> => {
    try {
      // Calculate points based on condition
      let conditionMultiplier = 1.0;
      switch (condition) {
        case 'excellent':
          conditionMultiplier = 1.0;
          break;
        case 'good':
          conditionMultiplier = 0.8;
          break;
        case 'fair':
          conditionMultiplier = 0.6;
          break;
        case 'poor':
          conditionMultiplier = 0.3;
          break;
        default:
          conditionMultiplier = 0.5;
      }
      
      const totalPoints = Math.round(
        containerData.ecoPoints * quantity * conditionMultiplier
      );
      
      // Submit to rewards service
      const result = await rewardsService.submitRecyclingActivity({
        materialId: containerData.id,
        materialType: containerData.materialType,
        quantity,
        condition,
        points: totalPoints,
        weight: containerData.weight * quantity,
        timestamp: new Date().toISOString(),
      });
      
      if (result.success) {
        // Show success message
        Alert.alert(
          'Contribution Submitted',
          `Thank you for recycling! You've earned ${totalPoints} eco points.`,
          [{ text: 'OK' }]
        );
        return true;
      } else {
        Alert.alert(
          'Submission Failed',
          result.error || 'Could not submit your contribution',
          [{ text: 'OK' }]
        );
        return false;
      }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Unknown error';
      console.error('Error submitting contribution:', err);
      Alert.alert('Error', 'Failed to submit your contribution: ' + errorMessage);
      return false;
    }
  }, []);

  // Get disposal instructions
  const getDisposalInstructions = useCallback(async (
    containerData: ContainerData
  ): Promise<string> => {
    try {
      // Try to get specific instructions for this container
      if (containerData.disposalInstructions) {
        return containerData.disposalInstructions;
      }
      
      // Otherwise get generic instructions for this material type
      const materialTypeInstructions: Record<string, string> = {
        plastic: 'Remove labels and caps if possible. Rinse the container and ensure it is empty and dry before recycling.',
        glass: 'Rinse thoroughly. Remove and separate caps and lids if made from different materials.',
        metal: 'Rinse and remove any food residue. Flatten if possible to save space.',
        paper: 'Ensure it\'s clean and dry. Remove any plastic windows or wrappings.',
        cardboard: 'Break down boxes to save space. Remove any tape or shipping labels.',
      };
      
      return materialTypeInstructions[containerData.materialType] || 
        `Recycle this ${containerData.materialType} container by ensuring it's empty, clean, and dry before placing it in your recycling bin.`;
    } catch (err) {
      console.error('Error getting disposal instructions:', err);
      return 'Please check your local recycling guidelines for proper disposal of this item.';
    }
  }, []);

  return {
    // State
    isInitialized,
    isScanning,
    isCameraReady,
    containerDetected,
    scanResult,
    recentScans,
    error,
    
    // Methods
    initialize,
    startScanning,
    stopScanning,
    handleCameraReady,
    resetScan,
    submitContribution,
    getDisposalInstructions,
  };
} 