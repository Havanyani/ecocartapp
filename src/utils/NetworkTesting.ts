/**
 * NetworkTesting.ts
 * 
 * Utilities for testing offline functionality and simulating
 * different network conditions.
 */

import NetInfo from '@react-native-community/netinfo';

// Network condition presets
export enum NetworkCondition {
  ONLINE = 'online',
  OFFLINE = 'offline',
  INTERMITTENT = 'intermittent',
  SLOW = 'slow',
  VERY_SLOW = 'very_slow'
}

// Network simulation configuration
interface NetworkSimulationConfig {
  /** Should requests succeed or fail */
  shouldSucceed: boolean;
  /** Artificial delay in milliseconds to simulate network latency */
  delay: number;
  /** How often the network should flip between online and offline (ms) */
  flipInterval?: number;
}

// Map of network conditions to configurations
const networkConditionConfigs: Record<NetworkCondition, NetworkSimulationConfig> = {
  [NetworkCondition.ONLINE]: {
    shouldSucceed: true,
    delay: 100 // Fast connection
  },
  [NetworkCondition.OFFLINE]: {
    shouldSucceed: false,
    delay: 0 // Immediate failure
  },
  [NetworkCondition.INTERMITTENT]: {
    shouldSucceed: true,
    delay: 500,
    flipInterval: 5000 // Switch every 5 seconds
  },
  [NetworkCondition.SLOW]: {
    shouldSucceed: true,
    delay: 2000 // 2 second delay
  },
  [NetworkCondition.VERY_SLOW]: {
    shouldSucceed: true,
    delay: 5000 // 5 second delay
  }
};

/**
 * Singleton class for network condition testing
 */
export class NetworkTester {
  private static instance: NetworkTester;
  private currentCondition: NetworkCondition = NetworkCondition.ONLINE;
  private originalFetch: typeof fetch;
  private flipIntervalId: NodeJS.Timeout | null = null;
  private isEnabled: boolean = false;
  private isCurrentlyOnline: boolean = true;

  private constructor() {
    // Save original fetch implementation
    this.originalFetch = global.fetch;
    
    // Save the NetInfo event subscription
    this.setupNetworkFlipping();
  }

  /**
   * Get the NetworkTester instance
   */
  public static getInstance(): NetworkTester {
    if (!NetworkTester.instance) {
      NetworkTester.instance = new NetworkTester();
    }
    return NetworkTester.instance;
  }

  /**
   * Enable network condition simulation
   * @param condition The network condition to simulate
   */
  public enable(condition: NetworkCondition = NetworkCondition.ONLINE): void {
    if (this.isEnabled) {
      this.disable();
    }

    this.isEnabled = true;
    this.currentCondition = condition;
    this.setupNetworkFlipping();
    
    // Override fetch with mocked version
    global.fetch = this.mockFetch.bind(this);
    
    // Log the event
    console.log('[NetworkTester]', 'Network test enabled', { condition });
    
    console.log(`[NetworkTester] Enabled with condition: ${condition}`);
  }

  /**
   * Disable network condition simulation
   */
  public disable(): void {
    this.isEnabled = false;
    
    // Restore original fetch
    global.fetch = this.originalFetch;
    
    // Clear interval if it exists
    if (this.flipIntervalId) {
      clearInterval(this.flipIntervalId);
      this.flipIntervalId = null;
    }
    
    // Log the event
    console.log('[NetworkTester]', 'Network test disabled');
    
    console.log('[NetworkTester] Disabled');
  }

  /**
   * Change the simulated network condition
   * @param condition The new network condition to simulate
   */
  public setCondition(condition: NetworkCondition): void {
    if (this.currentCondition === condition) return;
    
    this.currentCondition = condition;
    this.setupNetworkFlipping();
    
    // Log the event
    console.log('[NetworkTester]', 'Network condition changed', { condition });
    
    console.log(`[NetworkTester] Condition changed to: ${condition}`);
  }

  /**
   * Get the current network condition
   */
  public getCondition(): NetworkCondition {
    return this.currentCondition;
  }

  /**
   * Is the network tester enabled
   */
  public isActive(): boolean {
    return this.isEnabled;
  }

  /**
   * Get the current simulated online status
   */
  public isNetworkOnline(): boolean {
    return this.isCurrentlyOnline;
  }

  /**
   * Set up network flipping for intermittent connection
   */
  private setupNetworkFlipping(): void {
    // Clear existing interval
    if (this.flipIntervalId) {
      clearInterval(this.flipIntervalId);
      this.flipIntervalId = null;
    }
    
    const config = networkConditionConfigs[this.currentCondition];
    
    // Set initial online status based on condition
    this.isCurrentlyOnline = this.currentCondition !== NetworkCondition.OFFLINE;
    
    // Set up flip interval for intermittent conditions
    if (config.flipInterval && this.isEnabled) {
      this.flipIntervalId = setInterval(() => {
        this.isCurrentlyOnline = !this.isCurrentlyOnline;
        
        // Simulate NetInfo change
        NetInfo.fetch().then(() => {
          // @ts-ignore - This is a hack to simulate network changes
          NetInfo.eventEmitter.emit('netInfo.networkStatusChange', {
            isConnected: this.isCurrentlyOnline,
            isInternetReachable: this.isCurrentlyOnline
          });
        });
        
        console.log(`[NetworkTester] Network flipped to: ${this.isCurrentlyOnline ? 'online' : 'offline'}`);
      }, config.flipInterval);
    }
  }

  /**
   * Mock fetch implementation to simulate network conditions
   */
  private async mockFetch(input: RequestInfo | URL, init?: RequestInit): Promise<Response> {
    const config = networkConditionConfigs[this.currentCondition];
    
    // Add artificial delay
    await new Promise(resolve => setTimeout(resolve, config.delay));
    
    // If we shouldn't succeed or we're currently "offline", simulate network error
    if (!config.shouldSucceed || !this.isCurrentlyOnline) {
      throw new TypeError('Failed to fetch: NetworkError when attempting to fetch resource.');
    }
    
    // Otherwise, pass through to original fetch
    return this.originalFetch(input, init);
  }
}

/**
 * Helper function to run a test with a specific network condition
 * @param condition The network condition to test with
 * @param testFn The function to run under the specified network condition
 * @param timeout Optional timeout in milliseconds
 */
export async function runWithNetworkCondition<T>(
  condition: NetworkCondition,
  testFn: () => Promise<T>,
  timeout?: number
): Promise<T> {
  const networkTester = NetworkTester.getInstance();
  
  try {
    // Enable specified network condition
    networkTester.enable(condition);
    
    // Run test function with optional timeout
    if (timeout) {
      const timeoutPromise = new Promise<never>((_, reject) => {
        setTimeout(() => reject(new Error(`Test timed out after ${timeout}ms`)), timeout);
      });
      
      return await Promise.race([testFn(), timeoutPromise]) as T;
    } else {
      return await testFn();
    }
  } finally {
    // Always disable network testing when done
    networkTester.disable();
  }
}

export default NetworkTester.getInstance(); 