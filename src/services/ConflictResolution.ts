/**
 * ConflictResolution.ts
 * 
 * Service for resolving conflicts between local and remote data
 * when synchronizing offline operations with the server.
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
  BOTH_DELETED = 'both_deleted',
  /** Created in both places independently */
  CONCURRENT_CREATION = 'concurrent_creation'
}

// Resolution strategies for conflict handling
export enum ResolutionStrategy {
  LOCAL_WINS = 'local_wins',      // Always choose local data
  REMOTE_WINS = 'remote_wins',    // Always choose remote data
  LATEST_WINS = 'latest_wins',    // Choose the most recently updated version
  MERGE = 'merge',                // Merge both versions using registered merge function
  SMART_MERGE = 'smart_merge',    // Intelligently merge based on field-level changes
  MANUAL = 'manual',              // Require manual resolution (not handled automatically)
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

// Map of entity types to merge functions
const mergeFunctions = new Map<string, (local: any, remote: any) => any>();

/**
 * ConflictResolution service for handling data conflicts
 */
export class ConflictResolution {
  /**
   * Register a merge function for a specific entity type
   */
  public static registerMergeFunction<T>(
    entityType: string,
    mergeFn: (local: T, remote: T) => T
  ): void {
    mergeFunctions.set(entityType, mergeFn);
  }

  /**
   * Resolve conflict between local and remote data
   */
  public static resolveConflict<T>(
    entityType: string,
    localData: T,
    remoteData: T,
    strategy: ResolutionStrategy = ResolutionStrategy.REMOTE_WINS
  ): T {
    // Early return for null data cases
    if (localData === null && remoteData === null) {
      return null as T;
    }
    
    if (localData === null) {
      return remoteData;
    }
    
    if (remoteData === null) {
      return localData;
    }

    switch (strategy) {
      case ResolutionStrategy.LOCAL_WINS:
        return localData;
        
      case ResolutionStrategy.REMOTE_WINS:
        return remoteData;
        
      case ResolutionStrategy.LATEST_WINS:
        return this.resolveByTimestamp(localData, remoteData);
        
      case ResolutionStrategy.MERGE:
        return this.mergeData(entityType, localData, remoteData);
        
      case ResolutionStrategy.SMART_MERGE:
        return this.smartMergeData(entityType, localData, remoteData);
        
      default:
        // Default to remote wins
        return remoteData;
    }
  }

  /**
   * Resolve conflict based on timestamps
   */
  private static resolveByTimestamp<T>(localData: T, remoteData: T): T {
    // Extract timestamps if available
    const localTimestamp = (localData as any)?.updatedAt || (localData as any)?.timestamp || 0;
    const remoteTimestamp = (remoteData as any)?.updatedAt || (remoteData as any)?.timestamp || 0;
    
    return localTimestamp > remoteTimestamp ? localData : remoteData;
  }

  /**
   * Merge data using the registered merge function for the entity type
   */
  private static mergeData<T>(entityType: string, localData: T, remoteData: T): T {
    const mergeFn = mergeFunctions.get(entityType);
    
    if (mergeFn) {
      return mergeFn(localData, remoteData);
    }
    
    // If no merge function is registered, use the smart merge
    return this.smartMergeData(entityType, localData, remoteData);
  }

  /**
   * Intelligently merge data based on field-level changes
   */
  private static smartMergeData<T>(entityType: string, localData: T, remoteData: T): T {
    // Start with the remote data as the base
    const result = { ...remoteData } as any;
    
    // Special handling for certain entity types
    if (entityType === 'impact') {
      return this.mergeImpactData(localData as any, remoteData as any) as T;
    }
    
    if (entityType === 'collection' || entityType === 'order') {
      return this.mergeCollectionData(localData as any, remoteData as any) as T;
    }
    
    // For objects, merge fields intelligently
    if (typeof localData === 'object' && typeof remoteData === 'object') {
      for (const key in localData) {
        if (Object.prototype.hasOwnProperty.call(localData, key)) {
          // Skip id field
          if (key === 'id') continue;
          
          // Skip metadata fields
          if (['createdAt', 'updatedAt', '__typename'].includes(key)) continue;
          
          // If local value isn't null/undefined
          if (localData[key] !== null && localData[key] !== undefined) {
            // For objects, recursively merge
            if (
              typeof localData[key] === 'object' && 
              !Array.isArray(localData[key]) && 
              localData[key] !== null
            ) {
              if (
                remoteData[key] && 
                typeof remoteData[key] === 'object' && 
                !Array.isArray(remoteData[key])
              ) {
                result[key] = this.smartMergeData(entityType + '.' + key, localData[key], remoteData[key]);
              } else {
                result[key] = localData[key];
              }
            } 
            // For arrays, use remote value (arrays are harder to merge)
            else if (Array.isArray(localData[key])) {
              // For now, prefer remote arrays as merging arrays is complex
              // A more sophisticated approach would detect added/removed items
              result[key] = remoteData[key] || localData[key];
            } 
            // For primitive values
            else {
              const localTimestamp = (localData as any)?.updatedAt || 0;
              const remoteTimestamp = (remoteData as any)?.updatedAt || 0;
              
              // Use local value if it was updated more recently
              if (localTimestamp > remoteTimestamp) {
                result[key] = localData[key];
              }
            }
          }
        }
      }
      
      return result;
    }
    
    // For primitive types, use remote data
    return remoteData;
  }

  /**
   * Merge impact data - sum numeric properties
   */
  private static mergeImpactData(localData: any, remoteData: any): any {
    const result = { ...remoteData };
    
    // For impact data, sum the numeric fields
    const numericFields = ['plasticSaved', 'co2Reduced', 'treesEquivalent', 'wasteRecycled'];
    
    for (const field of numericFields) {
      if (
        typeof localData[field] === 'number' && 
        typeof remoteData[field] === 'number'
      ) {
        result[field] = localData[field] + remoteData[field];
      } else if (typeof localData[field] === 'number') {
        result[field] = localData[field];
      }
    }
    
    return result;
  }

  /**
   * Merge collection or order data - handle line items
   */
  private static mergeCollectionData(localData: any, remoteData: any): any {
    const result = { ...remoteData };
    
    // If local metadata exists and is more recent, use it
    if (
      localData.metadata && 
      (!remoteData.metadata || localData.updatedAt > remoteData.updatedAt)
    ) {
      result.metadata = { ...localData.metadata };
    }
    
    // For collections with items/lineItems, merge them intelligently
    const itemsField = localData.items ? 'items' : 
                      localData.lineItems ? 'lineItems' : null;
    
    if (itemsField && Array.isArray(localData[itemsField])) {
      // Build maps of items by ID for both local and remote
      const localItems = new Map();
      localData[itemsField].forEach((item: any) => {
        if (item.id) {
          localItems.set(item.id, item);
        }
      });
      
      const remoteItems = new Map();
      if (remoteData[itemsField] && Array.isArray(remoteData[itemsField])) {
        remoteData[itemsField].forEach((item: any) => {
          if (item.id) {
            remoteItems.set(item.id, item);
          }
        });
      }
      
      // Merge items from both sources
      const mergedItems: any[] = [];
      
      // Add items from remote, updated with local data when available
      remoteItems.forEach((remoteItem, id) => {
        const localItem = localItems.get(id);
        if (localItem) {
          // For quantities and notes, prefer the local value if it's more recent
          const mergedItem = { ...remoteItem };
          
          if (localItem.updatedAt > remoteItem.updatedAt) {
            // For quantity, use the local value if it's different
            if (
              localItem.quantity !== undefined && 
              localItem.quantity !== remoteItem.quantity
            ) {
              mergedItem.quantity = localItem.quantity;
            }
            
            // For notes, use the local value if it's different
            if (
              localItem.notes !== undefined && 
              localItem.notes !== remoteItem.notes
            ) {
              mergedItem.notes = localItem.notes;
            }
          }
          
          mergedItems.push(mergedItem);
          localItems.delete(id);
        } else {
          mergedItems.push(remoteItem);
        }
      });
      
      // Add remaining local items that weren't in remote
      localItems.forEach(localItem => {
        mergedItems.push(localItem);
      });
      
      result[itemsField] = mergedItems;
    }
    
    return result;
  }
}

export default ConflictResolution; 