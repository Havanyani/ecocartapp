/**
 * Object utility functions for comparing and merging objects
 * Used primarily for conflict resolution during data synchronization
 */

/**
 * Compare two objects and identify differences
 * 
 * @param obj1 First object to compare
 * @param obj2 Second object to compare
 * @returns Object containing arrays of field names that differ between objects
 */
export function diffObjects<T extends Record<string, any>>(
  obj1: T, 
  obj2: T
): {
  localOnly: string[]; // Fields that only exist or were changed in obj1
  remoteOnly: string[]; // Fields that only exist or were changed in obj2
  bothChanged: string[]; // Fields that exist in both but have different values
  identical: string[]; // Fields that exist in both and have identical values
} {
  const result = {
    localOnly: [] as string[],
    remoteOnly: [] as string[],
    bothChanged: [] as string[],
    identical: [] as string[]
  };

  // Get all keys from both objects
  const allKeys = new Set([...Object.keys(obj1), ...Object.keys(obj2)]);

  // Compare each key
  for (const key of allKeys) {
    const hasKey1 = key in obj1;
    const hasKey2 = key in obj2;

    if (hasKey1 && !hasKey2) {
      // Key only exists in obj1
      result.localOnly.push(key);
    } else if (!hasKey1 && hasKey2) {
      // Key only exists in obj2
      result.remoteOnly.push(key);
    } else {
      // Key exists in both objects
      const val1 = obj1[key];
      const val2 = obj2[key];

      // Compare values
      if (deepEqual(val1, val2)) {
        result.identical.push(key);
      } else {
        result.bothChanged.push(key);
      }
    }
  }

  return result;
}

/**
 * Merge two objects with customizable field-level strategies
 * 
 * @param base Base object that will be modified
 * @param overlay Object to merge into base
 * @param strategies Optional strategies for specific fields
 * @returns Merged object (modifies base)
 */
export function mergeObjects<T extends Record<string, any>>(
  base: T,
  overlay: Partial<T>,
  strategies?: Record<string, 'replace' | 'skip' | 'concat' | 'merge'>
): T {
  if (!overlay) return base;
  if (!strategies) strategies = {};

  // Process each field in overlay
  for (const key in overlay) {
    if (!Object.prototype.hasOwnProperty.call(overlay, key)) continue;
    
    const strategy = strategies[key] || 'replace';
    const overlayValue = overlay[key];
    
    switch (strategy) {
      case 'skip':
        // Skip this field
        break;
        
      case 'concat':
        // For arrays, concatenate them
        if (Array.isArray(base[key]) && Array.isArray(overlayValue)) {
          base[key] = [...base[key], ...overlayValue];
        } else {
          // Fall back to replace for non-arrays
          base[key] = overlayValue as any;
        }
        break;
        
      case 'merge':
        // For objects, recursively merge
        if (
          base[key] && 
          typeof base[key] === 'object' && 
          !Array.isArray(base[key]) &&
          overlayValue && 
          typeof overlayValue === 'object' && 
          !Array.isArray(overlayValue)
        ) {
          mergeObjects(base[key], overlayValue);
        } else {
          // Fall back to replace for non-objects
          base[key] = overlayValue as any;
        }
        break;
        
      case 'replace':
      default:
        // Simply replace the value
        base[key] = overlayValue as any;
        break;
    }
  }
  
  return base;
}

/**
 * Deep equality check for two values
 * 
 * @param a First value
 * @param b Second value
 * @returns true if values are deeply equal
 */
export function deepEqual(a: any, b: any): boolean {
  // Simple type comparison
  if (a === b) return true;
  
  // Handle null/undefined cases
  if (a == null || b == null) return a === b;
  
  // Compare types
  if (typeof a !== typeof b) return false;
  
  // Handle array comparison
  if (Array.isArray(a) && Array.isArray(b)) {
    if (a.length !== b.length) return false;
    for (let i = 0; i < a.length; i++) {
      if (!deepEqual(a[i], b[i])) return false;
    }
    return true;
  }
  
  // Handle date comparison
  if (a instanceof Date && b instanceof Date) {
    return a.getTime() === b.getTime();
  }
  
  // Handle object comparison
  if (typeof a === 'object' && typeof b === 'object') {
    const keysA = Object.keys(a);
    const keysB = Object.keys(b);
    
    if (keysA.length !== keysB.length) return false;
    
    for (const key of keysA) {
      if (!keysB.includes(key)) return false;
      if (!deepEqual(a[key], b[key])) return false;
    }
    
    return true;
  }
  
  // Default comparison for other types
  return a === b;
}

/**
 * Get a nested property from an object using a path string
 * 
 * @param obj Object to get property from
 * @param path Path to property (e.g. "user.address.street")
 * @param defaultValue Value to return if path doesn't exist
 * @returns The property value or defaultValue
 */
export function getNestedProperty(obj: any, path: string, defaultValue: any = undefined): any {
  if (!obj || !path) return defaultValue;
  
  const parts = path.split('.');
  let current = obj;
  
  for (const part of parts) {
    if (current === null || current === undefined || typeof current !== 'object') {
      return defaultValue;
    }
    
    current = current[part];
  }
  
  return current === undefined ? defaultValue : current;
}

/**
 * Set a nested property on an object using a path string
 * 
 * @param obj Object to set property on
 * @param path Path to property (e.g. "user.address.street")
 * @param value Value to set
 * @returns Updated object
 */
export function setNestedProperty(obj: any, path: string, value: any): any {
  if (!obj || !path) return obj;
  
  const parts = path.split('.');
  let current = obj;
  
  // Navigate to the parent of the property to set
  for (let i = 0; i < parts.length - 1; i++) {
    const part = parts[i];
    
    if (!(part in current) || current[part] === null) {
      // Create missing object
      current[part] = {};
    }
    
    current = current[part];
  }
  
  // Set the value on the last part
  current[parts[parts.length - 1]] = value;
  
  return obj;
} 