/**
 * ConflictResolution utility
 * 
 * This utility helps resolve conflicts between local and server data during synchronization
 * of offline changes. It provides strategies for automatic conflict resolution and 
 * utilities for manual conflict resolution when needed.
 */

export enum ConflictResolutionStrategy {
  SERVER_WINS = 'server_wins',
  CLIENT_WINS = 'client_wins',
  TIMESTAMP_WINS = 'timestamp_wins',
  MERGE = 'merge',
  MANUAL = 'manual'
}

export interface ConflictData<T> {
  serverData: T;
  clientData: T;
  entityType: string;
  entityId: string;
  serverTimestamp?: number;
  clientTimestamp?: number;
  conflictFields?: string[];
}

export interface ConflictResult<T> {
  resolved: boolean;
  strategy: ConflictResolutionStrategy;
  resolvedData?: T;
  conflictFields?: string[];
  requiresManualResolution?: boolean;
}

/**
 * Identifies conflicting fields between server and client data
 */
export function identifyConflicts<T extends Record<string, any>>(serverData: T, clientData: T): string[] {
  const conflictFields: string[] = [];
  
  // Find all keys in both objects
  const allKeys = new Set([...Object.keys(serverData), ...Object.keys(clientData)]);
  
  // Check each key for differences
  for (const key of allKeys) {
    // Skip internal fields that start with underscore
    if (key.startsWith('_')) continue;
    
    // Skip id field
    if (key === 'id') continue;
    
    // If the field exists in both and is different, it's a conflict
    if (
      key in serverData && 
      key in clientData && 
      JSON.stringify(serverData[key]) !== JSON.stringify(clientData[key])
    ) {
      conflictFields.push(key);
    }
  }
  
  return conflictFields;
}

/**
 * Resolves data conflicts using the specified strategy
 */
export function resolveConflict<T extends Record<string, any>>(
  conflict: ConflictData<T>, 
  strategy: ConflictResolutionStrategy = ConflictResolutionStrategy.MERGE
): ConflictResult<T> {
  // Identify conflicting fields if not provided
  const conflictFields = conflict.conflictFields || 
    identifyConflicts(conflict.serverData, conflict.clientData);
  
  // If no conflicts, return the client data (nothing to resolve)
  if (conflictFields.length === 0) {
    return {
      resolved: true,
      strategy,
      resolvedData: { ...conflict.clientData },
      conflictFields: []
    };
  }
  
  // Resolve based on the selected strategy
  switch (strategy) {
    case ConflictResolutionStrategy.SERVER_WINS:
      return {
        resolved: true,
        strategy,
        resolvedData: { ...conflict.serverData },
        conflictFields
      };
      
    case ConflictResolutionStrategy.CLIENT_WINS:
      return {
        resolved: true,
        strategy,
        resolvedData: { ...conflict.clientData },
        conflictFields
      };
      
    case ConflictResolutionStrategy.TIMESTAMP_WINS:
      // Use timestamps to determine which data is more recent
      if (
        conflict.serverTimestamp && 
        conflict.clientTimestamp && 
        conflict.serverTimestamp > conflict.clientTimestamp
      ) {
        return {
          resolved: true,
          strategy,
          resolvedData: { ...conflict.serverData },
          conflictFields
        };
      } else {
        return {
          resolved: true,
          strategy,
          resolvedData: { ...conflict.clientData },
          conflictFields
        };
      }
      
    case ConflictResolutionStrategy.MERGE:
      // Merge data, keeping both changes when possible
      const mergedData = { 
        ...conflict.clientData,
        ...Object.fromEntries(
          // For each conflicting field, use server data
          conflictFields.map(field => [field, conflict.serverData[field]])
        )
      };
      
      return {
        resolved: true,
        strategy,
        resolvedData: mergedData,
        conflictFields
      };
      
    case ConflictResolutionStrategy.MANUAL:
      // Return all data and mark as requiring manual resolution
      return {
        resolved: false,
        strategy,
        conflictFields,
        requiresManualResolution: true
      };
      
    default:
      throw new Error(`Unknown conflict resolution strategy: ${strategy}`);
  }
}

/**
 * Provides a custom merge function for complex conflict resolution
 */
export function customMerge<T extends Record<string, any>>(
  conflict: ConflictData<T>,
  fieldStrategies: Record<string, ConflictResolutionStrategy>
): T {
  // Start with the client data
  const result = { ...conflict.clientData };
  
  // Apply the specific strategies for each field
  for (const [field, strategy] of Object.entries(fieldStrategies)) {
    if (field in conflict.serverData && strategy === ConflictResolutionStrategy.SERVER_WINS) {
      result[field as keyof T] = conflict.serverData[field as keyof T];
    } 
    // For CLIENT_WINS, do nothing as we already have client data
    // Add more custom field merge logic here if needed
  }
  
  return result;
}

/**
 * Returns conflict resolution suggestions based on entity type and field patterns
 */
export function getSuggestedStrategy<T extends Record<string, any>>(
  conflict: ConflictData<T>
): Record<string, ConflictResolutionStrategy> {
  const suggestions: Record<string, ConflictResolutionStrategy> = {};
  const { entityType, conflictFields = [] } = conflict;
  
  for (const field of conflictFields) {
    // Default strategy is MERGE
    let suggestedStrategy = ConflictResolutionStrategy.MERGE;
    
    // Entity-specific logic
    if (entityType === 'collection') {
      // For collections: server wins for status and timestamps
      if (field === 'status' || field.includes('date') || field.includes('time')) {
        suggestedStrategy = ConflictResolutionStrategy.SERVER_WINS;
      } 
      // Client wins for user-entered notes and editable fields
      else if (field === 'notes' || field === 'description') {
        suggestedStrategy = ConflictResolutionStrategy.CLIENT_WINS;
      }
    } 
    else if (entityType === 'user') {
      // For user: server wins for account status, permissions, or roles
      if (field === 'role' || field === 'permissions' || field === 'status') {
        suggestedStrategy = ConflictResolutionStrategy.SERVER_WINS;
      }
      // Client wins for profile info
      else if (field.includes('name') || field === 'email') {
        suggestedStrategy = ConflictResolutionStrategy.CLIENT_WINS;
      }
    }
    
    suggestions[field] = suggestedStrategy;
  }
  
  return suggestions;
}

/**
 * Utility function to prepare a conflict data object
 */
export function prepareConflictData<T extends Record<string, any>>(
  serverData: T,
  clientData: T,
  entityType: string,
  entityId: string,
  serverTimestamp?: number,
  clientTimestamp?: number
): ConflictData<T> {
  return {
    serverData,
    clientData,
    entityType,
    entityId,
    serverTimestamp,
    clientTimestamp,
    conflictFields: identifyConflicts(serverData, clientData)
  };
}

export default {
  resolveConflict,
  identifyConflicts,
  customMerge,
  getSuggestedStrategy,
  prepareConflictData,
  ConflictResolutionStrategy
}; 