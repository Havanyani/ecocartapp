/**
 * ConflictResolution.ts
 * 
 * Service for handling data conflicts that occur during synchronization.
 * Provides strategies for resolving conflicts between local and remote data.
 */

// Conflict types
export enum ConflictType {
  /** Local and remote data were modified */
  BOTH_MODIFIED = 'both_modified',
  /** Local data was deleted but remote was modified */
  LOCAL_DELETED_REMOTE_MODIFIED = 'local_deleted_remote_modified',
  /** Remote data was deleted but local was modified */
  REMOTE_DELETED_LOCAL_MODIFIED = 'remote_deleted_local_modified',
  /** Both local and remote were deleted */
  BOTH_DELETED = 'both_deleted'
}

// Resolution strategies
export enum ResolutionStrategy {
  /** Always use local data */
  LOCAL_WINS = 'local_wins',
  /** Always use remote data */
  REMOTE_WINS = 'remote_wins',
  /** Use the most recently modified data */
  LATEST_WINS = 'latest_wins',
  /** Merge the data */
  MERGE = 'merge',
  /** Ask the user to resolve the conflict */
  MANUAL = 'manual'
}

// Conflict data
export interface ConflictData<T> {
  /** Type of conflict */
  type: ConflictType;
  /** Item ID */
  id: string;
  /** Local data */
  localData: T | null;
  /** Local last modified timestamp */
  localTimestamp: number;
  /** Remote data */
  remoteData: T | null;
  /** Remote last modified timestamp */
  remoteTimestamp: number;
}

// Result of conflict resolution
export interface ResolutionResult<T> {
  /** Resolved data */
  resolvedData: T | null;
  /** Should delete the item */
  shouldDelete: boolean;
  /** Strategy used to resolve the conflict */
  strategyUsed: ResolutionStrategy;
}

// Custom merge function type
export type MergeFunction<T> = (local: T, remote: T) => T;

// Manual resolution function type
export type ManualResolutionFunction<T> = (
  conflict: ConflictData<T>
) => Promise<ResolutionResult<T>>;

/**
 * Conflict resolution service
 */
export class ConflictResolution {
  // Default strategy
  private static defaultStrategy: ResolutionStrategy = ResolutionStrategy.LATEST_WINS;
  
  // Strategy map for different conflict types
  private static strategyMap: Record<ConflictType, ResolutionStrategy> = {
    [ConflictType.BOTH_MODIFIED]: ResolutionStrategy.LATEST_WINS,
    [ConflictType.LOCAL_DELETED_REMOTE_MODIFIED]: ResolutionStrategy.REMOTE_WINS,
    [ConflictType.REMOTE_DELETED_LOCAL_MODIFIED]: ResolutionStrategy.LOCAL_WINS,
    [ConflictType.BOTH_DELETED]: ResolutionStrategy.REMOTE_WINS
  };
  
  // Custom merge functions
  private static mergeFunctions = new Map<string, MergeFunction<any>>();
  
  // Manual resolution function
  private static manualResolutionFn: ManualResolutionFunction<any> | null = null;

  /**
   * Set the default resolution strategy
   * @param strategy The strategy to use by default
   */
  public static setDefaultStrategy(strategy: ResolutionStrategy): void {
    this.defaultStrategy = strategy;
  }

  /**
   * Set the strategy for a specific conflict type
   * @param conflictType The conflict type
   * @param strategy The strategy to use
   */
  public static setStrategyForConflictType(
    conflictType: ConflictType,
    strategy: ResolutionStrategy
  ): void {
    this.strategyMap[conflictType] = strategy;
  }

  /**
   * Register a custom merge function for a specific data type
   * @param entityType The entity type (e.g., 'collection', 'material')
   * @param mergeFn The function to merge local and remote data
   */
  public static registerMergeFunction<T>(
    entityType: string,
    mergeFn: MergeFunction<T>
  ): void {
    this.mergeFunctions.set(entityType, mergeFn);
  }

  /**
   * Set the manual resolution function
   * @param resolutionFn The function to call for manual conflict resolution
   */
  public static setManualResolutionFunction<T>(
    resolutionFn: ManualResolutionFunction<T>
  ): void {
    this.manualResolutionFn = resolutionFn;
  }

  /**
   * Resolve a data conflict
   * @param conflict The conflict data
   * @param entityType Optional entity type for custom merge functions
   * @param strategy Optional strategy to override the default
   */
  public static async resolveConflict<T>(
    conflict: ConflictData<T>,
    entityType?: string,
    strategy?: ResolutionStrategy
  ): Promise<ResolutionResult<T>> {
    // Determine which strategy to use
    const resolveStrategy = strategy ||
      this.strategyMap[conflict.type] ||
      this.defaultStrategy;
    
    switch (resolveStrategy) {
      case ResolutionStrategy.LOCAL_WINS:
        return this.resolveLocalWins(conflict);
      
      case ResolutionStrategy.REMOTE_WINS:
        return this.resolveRemoteWins(conflict);
      
      case ResolutionStrategy.LATEST_WINS:
        return this.resolveLatestWins(conflict);
      
      case ResolutionStrategy.MERGE:
        return this.resolveMerge(conflict, entityType || 'default');
      
      case ResolutionStrategy.MANUAL:
        return this.resolveManual(conflict);
      
      default:
        // Default to latest wins if no strategy matched
        return this.resolveLatestWins(conflict);
    }
  }

  /**
   * Resolve conflict by using local data
   */
  private static resolveLocalWins<T>(
    conflict: ConflictData<T>
  ): ResolutionResult<T> {
    // If local is deleted, delete the item
    if (conflict.localData === null) {
      return {
        resolvedData: null,
        shouldDelete: true,
        strategyUsed: ResolutionStrategy.LOCAL_WINS
      };
    }
    
    // Otherwise use local data
    return {
      resolvedData: conflict.localData,
      shouldDelete: false,
      strategyUsed: ResolutionStrategy.LOCAL_WINS
    };
  }

  /**
   * Resolve conflict by using remote data
   */
  private static resolveRemoteWins<T>(
    conflict: ConflictData<T>
  ): ResolutionResult<T> {
    // If remote is deleted, delete the item
    if (conflict.remoteData === null) {
      return {
        resolvedData: null,
        shouldDelete: true,
        strategyUsed: ResolutionStrategy.REMOTE_WINS
      };
    }
    
    // Otherwise use remote data
    return {
      resolvedData: conflict.remoteData,
      shouldDelete: false,
      strategyUsed: ResolutionStrategy.REMOTE_WINS
    };
  }

  /**
   * Resolve conflict by using the most recently modified data
   */
  private static resolveLatestWins<T>(
    conflict: ConflictData<T>
  ): ResolutionResult<T> {
    // If both are deleted, delete the item
    if (conflict.localData === null && conflict.remoteData === null) {
      return {
        resolvedData: null,
        shouldDelete: true,
        strategyUsed: ResolutionStrategy.LATEST_WINS
      };
    }
    
    // If local is more recent, use local
    if (conflict.localTimestamp > conflict.remoteTimestamp) {
      return this.resolveLocalWins(conflict);
    }
    
    // Otherwise use remote
    return this.resolveRemoteWins(conflict);
  }

  /**
   * Resolve conflict by merging local and remote data
   */
  private static async resolveMerge<T>(
    conflict: ConflictData<T>,
    entityType: string
  ): Promise<ResolutionResult<T>> {
    // If either is deleted, use the one that's not deleted
    if (conflict.localData === null) {
      return this.resolveRemoteWins(conflict);
    }
    
    if (conflict.remoteData === null) {
      return this.resolveLocalWins(conflict);
    }
    
    // Look up custom merge function
    const mergeFn = this.mergeFunctions.get(entityType);
    
    if (mergeFn) {
      // Use custom merge function
      const mergedData = mergeFn(conflict.localData, conflict.remoteData);
      
      return {
        resolvedData: mergedData,
        shouldDelete: false,
        strategyUsed: ResolutionStrategy.MERGE
      };
    }
    
    // Default merge behavior - use the latest data
    return this.resolveLatestWins(conflict);
  }

  /**
   * Resolve conflict by asking the user
   */
  private static async resolveManual<T>(
    conflict: ConflictData<T>
  ): Promise<ResolutionResult<T>> {
    // If no manual resolution function is set, default to latest wins
    if (!this.manualResolutionFn) {
      console.warn('No manual resolution function set, defaulting to latest wins');
      return this.resolveLatestWins(conflict);
    }
    
    // Call the manual resolution function
    return this.manualResolutionFn(conflict);
  }
}

export default ConflictResolution; 