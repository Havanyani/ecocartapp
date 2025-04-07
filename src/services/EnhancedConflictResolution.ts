/**
 * EnhancedConflictResolution.ts
 * 
 * Advanced service for resolving data conflicts during synchronization.
 * Features:
 * - Field-level merging strategies
 * - Smart conflict detection
 * - Entity-specific resolution strategies
 * - Conflict visualization
 * - Version history tracking
 */

import { PerformanceMonitor } from '@/utils/PerformanceMonitoring';
import { diffObjects } from '@/utils/objectUtils';
import { ConflictType, ResolutionStrategy } from './ConflictResolution';

// Enhanced conflict data interface
export interface EnhancedConflictData<T> {
  id: string;
  entityType: string;
  localData: T | null;
  remoteData: T | null;
  localTimestamp: number;
  remoteTimestamp: number;
  localVersion?: number;
  remoteVersion?: number;
  conflictType: ConflictType;
  conflictFields?: string[];
  fieldChanges?: {
    localOnly: string[];
    remoteOnly: string[];
    bothChanged: string[];
    identical: string[];
  };
  previousCommonAncestor?: T | null;
}

// Field-level merge strategy
export enum FieldMergeStrategy {
  LOCAL_WINS = 'local_wins',
  REMOTE_WINS = 'remote_wins',
  LATEST_WINS = 'latest_wins',
  CONCATENATE = 'concatenate',
  NUMERIC_ADD = 'numeric_add',
  CUSTOM = 'custom'
}

// Field resolution config
export interface FieldResolutionConfig {
  strategy: FieldMergeStrategy;
  customMerge?: (local: any, remote: any) => any;
}

// Entity resolution config
export interface EntityResolutionConfig {
  defaultStrategy: ResolutionStrategy;
  fieldStrategies?: Record<string, FieldResolutionConfig>;
  versionField?: string;
  timestampField?: string;
  // For array fields, how to handle merging
  arrayMergeStrategy?: 'concat' | 'replace' | 'union' | 'intersection';
}

// Enhanced resolution result
export interface EnhancedResolutionResult<T> {
  resolved: boolean;
  resolvedData: T | null;
  shouldDelete: boolean;
  strategyUsed: ResolutionStrategy;
  fieldStrategiesUsed?: Record<string, FieldMergeStrategy>;
  conflicts?: {
    field: string;
    localValue: any;
    remoteValue: any;
    resolvedValue: any;
  }[];
  needsManualResolution?: boolean;
}

/**
 * Enhanced Conflict Resolution service
 */
export class EnhancedConflictResolution {
  // Maps to store entity-specific resolution configs and merge functions
  private static entityConfigs: Map<string, EntityResolutionConfig> = new Map();
  private static defaultConfig: EntityResolutionConfig = {
    defaultStrategy: ResolutionStrategy.REMOTE_WINS,
    arrayMergeStrategy: 'replace'
  };
  
  /**
   * Register configuration for an entity type
   */
  public static registerEntityConfig(
    entityType: string, 
    config: EntityResolutionConfig
  ): void {
    this.entityConfigs.set(entityType, config);
  }
  
  /**
   * Get configuration for an entity type
   */
  public static getEntityConfig(entityType: string): EntityResolutionConfig {
    return this.entityConfigs.get(entityType) || this.defaultConfig;
  }
  
  /**
   * Resolve a conflict between local and remote data
   */
  public static async resolveConflict<T extends Record<string, any>>(
    conflict: EnhancedConflictData<T>
  ): Promise<EnhancedResolutionResult<T>> {
    try {
      // Start with default result structure
      const result: EnhancedResolutionResult<T> = {
        resolved: false,
        resolvedData: null,
        shouldDelete: false,
        strategyUsed: ResolutionStrategy.REMOTE_WINS,
        fieldStrategiesUsed: {},
        conflicts: []
      };
      
      // Special cases - handle null data
      if (conflict.localData === null && conflict.remoteData === null) {
        return {
          ...result,
          resolved: true,
          shouldDelete: true,
          strategyUsed: ResolutionStrategy.REMOTE_WINS
        };
      }
      
      if (conflict.localData === null) {
        return {
          ...result,
          resolved: true,
          resolvedData: conflict.remoteData,
          strategyUsed: ResolutionStrategy.REMOTE_WINS
        };
      }
      
      if (conflict.remoteData === null) {
        // For remote deletes, follow conflict type
        if (conflict.conflictType === ConflictType.REMOTE_DELETED_LOCAL_MODIFIED) {
          // Complex case - local modified but remote deleted
          // Default to keep local changes unless config specifies otherwise
          const config = this.getEntityConfig(conflict.entityType);
          if (config.defaultStrategy === ResolutionStrategy.REMOTE_WINS) {
            return {
              ...result,
              resolved: true,
              shouldDelete: true,
              strategyUsed: ResolutionStrategy.REMOTE_WINS
            };
          } else {
            return {
              ...result,
              resolved: true,
              resolvedData: conflict.localData,
              strategyUsed: ResolutionStrategy.LOCAL_WINS
            };
          }
        }
        
        return {
          ...result,
          resolved: true,
          resolvedData: conflict.localData,
          strategyUsed: ResolutionStrategy.LOCAL_WINS
        };
      }
      
      // Get entity config
      const config = this.getEntityConfig(conflict.entityType);
      
      // Determine strategy to use
      const strategy = config.defaultStrategy;
      result.strategyUsed = strategy;
      
      switch (strategy) {
        case ResolutionStrategy.LOCAL_WINS:
          return {
            ...result,
            resolved: true,
            resolvedData: conflict.localData
          };
          
        case ResolutionStrategy.REMOTE_WINS:
          return {
            ...result,
            resolved: true,
            resolvedData: conflict.remoteData
          };
          
        case ResolutionStrategy.LATEST_WINS:
          const useLocal = conflict.localTimestamp > conflict.remoteTimestamp;
          return {
            ...result,
            resolved: true,
            resolvedData: useLocal ? conflict.localData : conflict.remoteData
          };
          
        case ResolutionStrategy.SMART_MERGE:
          return await this.performSmartMerge(conflict, config, result);
          
        case ResolutionStrategy.MERGE:
          return await this.performFieldLevelMerge(conflict, config, result);
          
        case ResolutionStrategy.MANUAL:
          return {
            ...result,
            resolved: false,
            needsManualResolution: true,
            conflicts: this.generateConflictDetails(conflict)
          };
          
        default:
          // Default to remote wins
          return {
            ...result,
            resolved: true,
            resolvedData: conflict.remoteData
          };
      }
    } catch (error) {
      PerformanceMonitor.captureError(
        error instanceof Error 
          ? error 
          : new Error(`Failed to resolve conflict for ${conflict.entityType}:${conflict.id}`)
      );
      
      // On error, default to remote data
      return {
        resolved: true,
        resolvedData: conflict.remoteData,
        shouldDelete: false,
        strategyUsed: ResolutionStrategy.REMOTE_WINS
      };
    }
  }
  
  /**
   * Perform field-level merge of data
   */
  private static async performFieldLevelMerge<T extends Record<string, any>>(
    conflict: EnhancedConflictData<T>,
    config: EntityResolutionConfig,
    result: EnhancedResolutionResult<T>
  ): Promise<EnhancedResolutionResult<T>> {
    const { localData, remoteData } = conflict;
    const fieldStrategies = config.fieldStrategies || {};
    const mergedData = { ...remoteData } as T; // Start with remote data
    
    // Calculate field differences
    const fieldChanges = diffObjects(localData, remoteData);
    conflict.fieldChanges = fieldChanges;
    
    // Apply field-level strategies for changed fields
    for (const field of fieldChanges.bothChanged) {
      const fieldConfig = fieldStrategies[field] || { strategy: FieldMergeStrategy.REMOTE_WINS };
      const localValue = localData[field];
      const remoteValue = remoteData[field];
      
      let resolvedValue: any;
      
      switch (fieldConfig.strategy) {
        case FieldMergeStrategy.LOCAL_WINS:
          resolvedValue = localValue;
          break;
          
        case FieldMergeStrategy.REMOTE_WINS:
          resolvedValue = remoteValue;
          break;
          
        case FieldMergeStrategy.LATEST_WINS:
          resolvedValue = conflict.localTimestamp > conflict.remoteTimestamp ? localValue : remoteValue;
          break;
          
        case FieldMergeStrategy.CONCATENATE:
          if (typeof localValue === 'string' && typeof remoteValue === 'string') {
            resolvedValue = `${remoteValue} | ${localValue}`;
          } else {
            resolvedValue = remoteValue;
          }
          break;
          
        case FieldMergeStrategy.NUMERIC_ADD:
          if (typeof localValue === 'number' && typeof remoteValue === 'number') {
            resolvedValue = remoteValue + (localValue - (conflict.previousCommonAncestor?.[field] || 0));
          } else {
            resolvedValue = remoteValue;
          }
          break;
          
        case FieldMergeStrategy.CUSTOM:
          if (fieldConfig.customMerge) {
            resolvedValue = fieldConfig.customMerge(localValue, remoteValue);
          } else {
            resolvedValue = remoteValue;
          }
          break;
          
        default:
          resolvedValue = remoteValue;
      }
      
      // Record resolution
      result.fieldStrategiesUsed![field] = fieldConfig.strategy;
      
      // Add to conflict list
      result.conflicts!.push({
        field,
        localValue,
        remoteValue,
        resolvedValue
      });
      
      // Update merged data
      mergedData[field] = resolvedValue;
    }
    
    // Copy fields that were only changed locally
    for (const field of fieldChanges.localOnly) {
      mergedData[field] = localData[field];
    }
    
    // Handle arrays based on array merge strategy
    if (config.arrayMergeStrategy !== 'replace') {
      this.mergeArrayFields(mergedData, localData, remoteData, config.arrayMergeStrategy || 'concat');
    }
    
    // Update version if using version field
    if (config.versionField) {
      const localVersion = conflict.localVersion ?? localData[config.versionField] ?? 0;
      const remoteVersion = conflict.remoteVersion ?? remoteData[config.versionField] ?? 0;
      mergedData[config.versionField] = Math.max(localVersion, remoteVersion) + 1;
    }
    
    // Update timestamp if using timestamp field
    if (config.timestampField) {
      mergedData[config.timestampField] = Date.now();
    }
    
    return {
      ...result,
      resolved: true,
      resolvedData: mergedData
    };
  }
  
  /**
   * Perform smart merge using 3-way merge when common ancestor is available
   */
  private static async performSmartMerge<T extends Record<string, any>>(
    conflict: EnhancedConflictData<T>,
    config: EntityResolutionConfig,
    result: EnhancedResolutionResult<T>
  ): Promise<EnhancedResolutionResult<T>> {
    // If we don't have common ancestor, fall back to field-level merge
    if (!conflict.previousCommonAncestor) {
      return this.performFieldLevelMerge(conflict, config, result);
    }
    
    const { localData, remoteData, previousCommonAncestor } = conflict;
    
    // Calculate changes from common ancestor to each version
    const localChanges = diffObjects(previousCommonAncestor, localData);
    const remoteChanges = diffObjects(previousCommonAncestor, remoteData);
    
    // Start with common ancestor and apply non-conflicting changes
    const mergedData = { ...previousCommonAncestor } as T;
    
    // Apply remote-only changes
    for (const field of remoteChanges.remoteOnly) {
      mergedData[field] = remoteData[field];
    }
    
    // Apply local-only changes
    for (const field of localChanges.localOnly) {
      mergedData[field] = localData[field];
    }
    
    // Find truly conflicting fields (changed in both but differently)
    const conflictingFields: string[] = [];
    
    for (const field of localChanges.bothChanged) {
      if (remoteChanges.bothChanged.includes(field) && 
          JSON.stringify(localData[field]) !== JSON.stringify(remoteData[field])) {
        conflictingFields.push(field);
      } else {
        // Changed in local but not in remote relative to ancestor
        mergedData[field] = localData[field];
      }
    }
    
    // For conflicting fields, use field-level strategies
    const fieldStrategies = config.fieldStrategies || {};
    
    for (const field of conflictingFields) {
      const fieldConfig = fieldStrategies[field] || { strategy: FieldMergeStrategy.REMOTE_WINS };
      const localValue = localData[field];
      const remoteValue = remoteData[field];
      
      let resolvedValue: any;
      
      switch (fieldConfig.strategy) {
        case FieldMergeStrategy.LOCAL_WINS:
          resolvedValue = localValue;
          break;
          
        case FieldMergeStrategy.REMOTE_WINS:
          resolvedValue = remoteValue;
          break;
          
        case FieldMergeStrategy.LATEST_WINS:
          resolvedValue = conflict.localTimestamp > conflict.remoteTimestamp ? localValue : remoteValue;
          break;
          
        case FieldMergeStrategy.CONCATENATE:
          if (typeof localValue === 'string' && typeof remoteValue === 'string') {
            resolvedValue = `${remoteValue} | ${localValue}`;
          } else {
            resolvedValue = remoteValue;
          }
          break;
          
        case FieldMergeStrategy.NUMERIC_ADD:
          if (typeof localValue === 'number' && typeof remoteValue === 'number') {
            const baseValue = previousCommonAncestor[field] || 0;
            const localDelta = localValue - baseValue;
            const remoteDelta = remoteValue - baseValue;
            resolvedValue = baseValue + localDelta + remoteDelta;
          } else {
            resolvedValue = remoteValue;
          }
          break;
          
        case FieldMergeStrategy.CUSTOM:
          if (fieldConfig.customMerge) {
            resolvedValue = fieldConfig.customMerge(localValue, remoteValue);
          } else {
            resolvedValue = remoteValue;
          }
          break;
          
        default:
          resolvedValue = remoteValue;
      }
      
      // Record resolution
      result.fieldStrategiesUsed![field] = fieldConfig.strategy;
      
      // Add to conflict list
      result.conflicts!.push({
        field,
        localValue,
        remoteValue,
        resolvedValue
      });
      
      // Update merged data
      mergedData[field] = resolvedValue;
    }
    
    // Handle arrays based on array merge strategy
    if (config.arrayMergeStrategy !== 'replace') {
      this.mergeArrayFields(mergedData, localData, remoteData, config.arrayMergeStrategy || 'concat');
    }
    
    // Update version if using version field
    if (config.versionField) {
      const localVersion = conflict.localVersion ?? localData[config.versionField] ?? 0;
      const remoteVersion = conflict.remoteVersion ?? remoteData[config.versionField] ?? 0;
      mergedData[config.versionField] = Math.max(localVersion, remoteVersion) + 1;
    }
    
    // Update timestamp if using timestamp field
    if (config.timestampField) {
      mergedData[config.timestampField] = Date.now();
    }
    
    return {
      ...result,
      resolved: true,
      resolvedData: mergedData
    };
  }
  
  /**
   * Merge array fields based on strategy
   */
  private static mergeArrayFields<T extends Record<string, any>>(
    mergedData: T, 
    localData: T, 
    remoteData: T,
    strategy: 'concat' | 'replace' | 'union' | 'intersection'
  ): void {
    // Find array fields in the objects
    for (const field in mergedData) {
      const localValue = localData[field];
      const remoteValue = remoteData[field];
      
      if (Array.isArray(localValue) && Array.isArray(remoteValue)) {
        switch (strategy) {
          case 'concat':
            // Concatenate arrays
            mergedData[field] = [...remoteValue, ...localValue];
            break;
            
          case 'union':
            // Union of arrays (unique items)
            mergedData[field] = Array.from(new Set([...remoteValue, ...localValue]));
            break;
            
          case 'intersection':
            // Intersection of arrays (common items)
            mergedData[field] = remoteValue.filter(item => localValue.includes(item));
            break;
            
          // 'replace' is handled by the default behavior
        }
      }
    }
  }
  
  /**
   * Generate list of conflicts for visualization
   */
  private static generateConflictDetails<T extends Record<string, any>>(
    conflict: EnhancedConflictData<T>
  ): {field: string; localValue: any; remoteValue: any; resolvedValue: any}[] {
    const conflicts: {field: string; localValue: any; remoteValue: any; resolvedValue: any}[] = [];
    
    if (!conflict.localData || !conflict.remoteData) {
      return conflicts;
    }
    
    // Calculate field changes if not already done
    if (!conflict.fieldChanges) {
      conflict.fieldChanges = diffObjects(conflict.localData, conflict.remoteData);
    }
    
    // Create conflict records for fields changed in both versions
    for (const field of conflict.fieldChanges.bothChanged) {
      conflicts.push({
        field,
        localValue: conflict.localData[field],
        remoteValue: conflict.remoteData[field],
        resolvedValue: null // Will be set during resolution
      });
    }
    
    return conflicts;
  }
  
  /**
   * Create enhanced conflict data from local and remote data
   */
  public static createConflictData<T extends Record<string, any>>(
    entityType: string,
    id: string,
    localData: T | null,
    remoteData: T | null,
    localTimestamp: number,
    remoteTimestamp: number,
    previousAncestor: T | null = null
  ): EnhancedConflictData<T> {
    // Determine conflict type
    let conflictType: ConflictType;
    
    if (localData === null && remoteData === null) {
      conflictType = ConflictType.BOTH_DELETED;
    } else if (localData === null && remoteData !== null) {
      conflictType = ConflictType.LOCAL_DELETED_REMOTE_MODIFIED;
    } else if (localData !== null && remoteData === null) {
      conflictType = ConflictType.REMOTE_DELETED_LOCAL_MODIFIED;
    } else {
      conflictType = ConflictType.BOTH_MODIFIED;
    }
    
    // Get entity config to check for version field
    const config = this.getEntityConfig(entityType);
    let localVersion: number | undefined;
    let remoteVersion: number | undefined;
    
    if (config.versionField) {
      localVersion = localData?.[config.versionField];
      remoteVersion = remoteData?.[config.versionField];
    }
    
    // Create conflict data
    const conflictData: EnhancedConflictData<T> = {
      id,
      entityType,
      localData,
      remoteData,
      localTimestamp,
      remoteTimestamp,
      conflictType,
      localVersion,
      remoteVersion,
      previousCommonAncestor: previousAncestor
    };
    
    // Calculate field changes if both data objects exist
    if (localData && remoteData) {
      conflictData.fieldChanges = diffObjects(localData, remoteData);
      conflictData.conflictFields = conflictData.fieldChanges.bothChanged;
    }
    
    return conflictData;
  }
} 