/**
 * RouteOptimizer.ts
 * 
 * Utility for optimizing collection routes to minimize travel distance
 * and maximize efficiency of plastic waste collection.
 */

import { useCallback, useState } from 'react';
import { InteractionManager } from 'react-native';

export interface Location {
  id: string;
  latitude: number;
  longitude: number;
  address?: string;
  weight?: number;  // estimated weight in kg
  priority?: number; // 1-5, with 5 being highest priority
  timeWindow?: {
    start: Date;
    end: Date;
  };
}

export interface OptimizationOptions {
  prioritizeWeight?: boolean;  // prioritize heavier collections
  respectTimeWindows?: boolean; // respect time windows
  maxLocationsPerRoute?: number; // maximum locations per route
  startLocation?: Location; // starting point (e.g., recycling center)
  endLocation?: Location; // ending point (usually same as starting point)
  vehicleCapacity?: number; // maximum weight capacity in kg
  maxTravelTime?: number; // maximum travel time in minutes
  avoidHighways?: boolean; // avoid highways in route planning
}

export interface OptimizedRoute {
  locations: Location[];
  totalDistance: number; // in km
  estimatedTime: number; // in minutes
  totalWeight: number; // total weight to be collected in kg
}

/**
 * Calculates the distance between two locations using the Haversine formula
 */
function calculateDistance(location1: Location, location2: Location): number {
  const R = 6371; // Earth's radius in km
  const dLat = toRadians(location2.latitude - location1.latitude);
  const dLon = toRadians(location2.longitude - location1.longitude);
  
  const a = 
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(toRadians(location1.latitude)) * Math.cos(toRadians(location2.latitude)) * 
    Math.sin(dLon / 2) * Math.sin(dLon / 2);
    
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c;
}

/**
 * Convert degrees to radians
 */
function toRadians(degrees: number): number {
  return degrees * (Math.PI / 180);
}

/**
 * Estimates travel time based on distance and average speed
 */
function estimateTravelTime(distance: number, avgSpeed: number = 30): number {
  return (distance / avgSpeed) * 60; // convert to minutes
}

/**
 * Sorts locations by priority and weight
 */
function sortLocationsByPriority(locations: Location[]): Location[] {
  return [...locations].sort((a, b) => {
    // First sort by priority (if defined)
    const priorityA = a.priority || 0;
    const priorityB = b.priority || 0;
    
    if (priorityA !== priorityB) {
      return priorityB - priorityA; // Higher priority first
    }
    
    // Then by weight (if defined)
    const weightA = a.weight || 0;
    const weightB = b.weight || 0;
    return weightB - weightA; // Heavier weight first
  });
}

/**
 * Checks if a location's time window is valid for the current time
 */
function isTimeWindowValid(location: Location, currentTime: Date): boolean {
  if (!location.timeWindow) return true;
  
  return currentTime >= location.timeWindow.start && 
         currentTime <= location.timeWindow.end;
}

/**
 * Find the nearest location to the current location
 */
function findNearestLocation(
  currentLocation: Location, 
  locations: Location[], 
  currentTime: Date,
  respectTimeWindows: boolean
): Location | null {
  if (locations.length === 0) return null;
  
  let nearestLocation: Location | null = null;
  let shortestDistance = Infinity;
  
  for (const location of locations) {
    // Skip if time window is not valid and we're respecting time windows
    if (respectTimeWindows && !isTimeWindowValid(location, currentTime)) {
      continue;
    }
    
    const distance = calculateDistance(currentLocation, location);
    if (distance < shortestDistance) {
      shortestDistance = distance;
      nearestLocation = location;
    }
  }
  
  return nearestLocation;
}

/**
 * Optimize collection route using nearest neighbor algorithm
 */
export function optimizeRoute(
  locations: Location[],
  options: OptimizationOptions = {}
): OptimizedRoute {
  const {
    prioritizeWeight = true,
    respectTimeWindows = true,
    maxLocationsPerRoute = 15,
    startLocation,
    endLocation,
    vehicleCapacity = 1000, // default 1000kg
    maxTravelTime,
    avoidHighways
  } = options;
  
  // Make a copy of locations to avoid mutating the original
  let remainingLocations = [...locations];
  
  // Limit the number of locations if specified
  if (maxLocationsPerRoute && maxLocationsPerRoute < remainingLocations.length) {
    // If prioritizing by weight, sort first
    if (prioritizeWeight) {
      remainingLocations = sortLocationsByPriority(remainingLocations);
    }
    remainingLocations = remainingLocations.slice(0, maxLocationsPerRoute);
  }
  
  const optimizedLocations: Location[] = [];
  let totalDistance = 0;
  let totalWeight = 0;
  let currentTime = new Date();
  
  // Use provided start location or first location as starting point
  let currentLocation = startLocation || remainingLocations[0];
  
  if (startLocation) {
    // If we have a specific start location, it's not part of the collection
    optimizedLocations.push(currentLocation);
  } else if (remainingLocations.length > 0) {
    // Otherwise, use the first location as start and remove it from remaining
    currentLocation = remainingLocations[0];
    optimizedLocations.push(currentLocation);
    remainingLocations.splice(0, 1);
    totalWeight += currentLocation.weight || 0;
  }
  
  // Continue until all locations are visited or capacity is reached
  while (remainingLocations.length > 0) {
    // Find the nearest location
    const nearestLocation = findNearestLocation(
      currentLocation,
      remainingLocations,
      currentTime,
      respectTimeWindows
    );
    
    if (!nearestLocation) break;
    
    // Calculate distance to this location
    const distance = calculateDistance(currentLocation, nearestLocation);
    totalDistance += distance;
    
    // Update travel time
    const travelTime = estimateTravelTime(distance);
    currentTime = new Date(currentTime.getTime() + travelTime * 60 * 1000);
    
    // Check if we exceed capacity
    const locationWeight = nearestLocation.weight || 0;
    if (totalWeight + locationWeight > vehicleCapacity) {
      break; // Vehicle capacity exceeded
    }
    
    // Add to optimized route
    optimizedLocations.push(nearestLocation);
    totalWeight += locationWeight;
    
    // Remove from remaining locations
    const index = remainingLocations.findIndex(loc => loc.id === nearestLocation.id);
    if (index !== -1) {
      remainingLocations.splice(index, 1);
    }
    
    // Update current location
    currentLocation = nearestLocation;
  }
  
  // Add end location if provided and different from the last location
  if (endLocation && (optimizedLocations.length === 0 || 
      endLocation.id !== optimizedLocations[optimizedLocations.length - 1].id)) {
    const lastLocation = optimizedLocations[optimizedLocations.length - 1];
    const distance = calculateDistance(lastLocation, endLocation);
    totalDistance += distance;
    optimizedLocations.push(endLocation);
  }
  
  // Calculate estimated time based on total distance
  const estimatedTime = estimateTravelTime(totalDistance);
  
  return {
    locations: optimizedLocations,
    totalDistance,
    estimatedTime,
    totalWeight
  };
}

/**
 * Split a large set of locations into multiple optimized routes
 */
export function createMultipleRoutes(
  locations: Location[],
  options: OptimizationOptions = {}
): OptimizedRoute[] {
  const routes: OptimizedRoute[] = [];
  let remainingLocations = [...locations];
  
  // Keep creating routes until all locations are assigned
  while (remainingLocations.length > 0) {
    const route = optimizeRoute(remainingLocations, options);
    routes.push(route);
    
    // Remove assigned locations from the remaining list
    const assignedLocationIds = new Set(route.locations.map(loc => loc.id));
    remainingLocations = remainingLocations.filter(
      loc => !assignedLocationIds.has(loc.id)
    );
  }
  
  return routes;
}

/**
 * Calculates the most efficient order to visit multiple locations
 * using a basic implementation of the Traveling Salesman Problem
 */
export function calculateOptimalOrder(locations: Location[]): Location[] {
  // For small numbers of locations, use a simple approach - try all permutations
  if (locations.length <= 10) {
    return calculateOptimalOrderExact(locations);
  }
  
  // For larger sets, use a greedy nearest neighbor approach
  return calculateOptimalOrderGreedy(locations);
}

/**
 * Exact solution for the TSP using brute force (only practical for small sets)
 */
function calculateOptimalOrderExact(locations: Location[]): Location[] {
  if (locations.length <= 2) return locations;
  
  // Get all permutations and find the one with minimum total distance
  const permutations = getPermutations(locations.slice(1));
  
  let bestRoute: Location[] = [];
  let shortestDistance = Infinity;
  
  for (const permutation of permutations) {
    const route = [locations[0], ...permutation];
    let totalDistance = 0;
    
    for (let i = 0; i < route.length - 1; i++) {
      totalDistance += calculateDistance(route[i], route[i + 1]);
    }
    
    if (totalDistance < shortestDistance) {
      shortestDistance = totalDistance;
      bestRoute = route;
    }
  }
  
  return bestRoute;
}

/**
 * Generate all permutations of an array
 */
function getPermutations<T>(array: T[]): T[][] {
  if (array.length <= 1) return [array];
  
  const result: T[][] = [];
  
  for (let i = 0; i < array.length; i++) {
    const current = array[i];
    const remaining = [...array.slice(0, i), ...array.slice(i + 1)];
    const permutations = getPermutations(remaining);
    
    for (const permutation of permutations) {
      result.push([current, ...permutation]);
    }
  }
  
  return result;
}

/**
 * Greedy approach to TSP using nearest neighbor algorithm
 */
function calculateOptimalOrderGreedy(locations: Location[]): Location[] {
  if (locations.length <= 1) return locations;
  
  const remaining = [...locations.slice(1)];
  const route = [locations[0]];
  
  while (remaining.length > 0) {
    const currentLocation = route[route.length - 1];
    let nearestIndex = 0;
    let shortestDistance = calculateDistance(currentLocation, remaining[0]);
    
    for (let i = 1; i < remaining.length; i++) {
      const distance = calculateDistance(currentLocation, remaining[i]);
      if (distance < shortestDistance) {
        shortestDistance = distance;
        nearestIndex = i;
      }
    }
    
    route.push(remaining[nearestIndex]);
    remaining.splice(nearestIndex, 1);
  }
  
  return route;
}

interface RouteConfig {
  path: string;
  component: () => Promise<{ default: React.ComponentType<any> }>;
  preload?: boolean;
}

class RouteOptimizer {
  private static instance: RouteOptimizer;
  private routeCache: Map<string, React.ComponentType<any>> = new Map();
  private preloadedRoutes: Set<string> = new Set();

  private constructor() {}

  static getInstance(): RouteOptimizer {
    if (!RouteOptimizer.instance) {
      RouteOptimizer.instance = new RouteOptimizer();
    }
    return RouteOptimizer.instance;
  }

  async preloadRoute(route: RouteConfig): Promise<void> {
    if (this.preloadedRoutes.has(route.path)) {
      return;
    }

    try {
      const module = await route.component();
      this.routeCache.set(route.path, module.default);
      this.preloadedRoutes.add(route.path);
    } catch (error) {
      console.error(`Failed to preload route: ${route.path}`, error);
    }
  }

  getCachedComponent(path: string): React.ComponentType<any> | undefined {
    return this.routeCache.get(path);
  }

  clearCache(): void {
    this.routeCache.clear();
    this.preloadedRoutes.clear();
  }
}

export function useRouteOptimization(route: RouteConfig) {
  const [Component, setComponent] = useState<React.ComponentType<any> | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  const loadRoute = useCallback(async () => {
    const optimizer = RouteOptimizer.getInstance();
    const cachedComponent = optimizer.getCachedComponent(route.path);

    if (cachedComponent) {
      setComponent(() => cachedComponent);
      setIsLoading(false);
      return;
    }

    try {
      setIsLoading(true);
      setError(null);

      // Use InteractionManager to defer loading until after interactions
      await InteractionManager.runAfterInteractions();
      
      const module = await route.component();
      setComponent(() => module.default);
      
      // Cache the component for future use
      optimizer.routeCache.set(route.path, module.default);
    } catch (err) {
      setError(err instanceof Error ? err : new Error('Failed to load route'));
    } finally {
      setIsLoading(false);
    }
  }, [route]);

  return {
    Component,
    isLoading,
    error,
    loadRoute,
  };
}

// Export singleton instance
export const routeOptimizer = RouteOptimizer.getInstance();

export default {
  optimizeRoute,
  createMultipleRoutes,
  calculateOptimalOrder,
  calculateDistance
}; 