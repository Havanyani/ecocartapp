/**
 * RouteOptimization.ts
 * Consolidated route optimization utilities for the EcoCart app.
 * This file combines functionality from:
 * - RouteOptimizer.ts
 * - DeliveryRouteOptimizer.tsx
 */

// Types and Interfaces
export interface Location {
  id: string;
  latitude: number;
  longitude: number;
  address?: string;
  weight?: number;
  priority?: number;
  timeWindow?: {
    start: number; // timestamp
    end: number; // timestamp
  };
}

export interface OptimizationOptions {
  prioritizeWeight?: boolean;
  respectTimeWindows?: boolean;
  vehicleCapacity?: number;
  maxStops?: number;
  startLocation?: Location;
  endLocation?: Location;
  maxDistance?: number;
  maxDuration?: number;
  avoidTolls?: boolean;
  avoidHighways?: boolean;
  routeType?: 'fastest' | 'shortest' | 'eco';
}

export interface OptimizedRoute {
  stops: Location[];
  totalDistance: number;
  totalWeight: number;
  estimatedTime: number;
  remainingCapacity: number;
}

// Constants
const EARTH_RADIUS_KM = 6371; // Earth's radius in kilometers
const AVG_SPEED_KM_H = 30; // Average speed in km/h for urban areas

/**
 * Calculate the distance between two locations using the Haversine formula
 */
export function calculateDistance(location1: Location, location2: Location): number {
  const lat1 = location1.latitude;
  const lon1 = location1.longitude;
  const lat2 = location2.latitude;
  const lon2 = location2.longitude;

  const dLat = toRadians(lat2 - lat1);
  const dLon = toRadians(lon2 - lon1);

  const a = 
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(toRadians(lat1)) * Math.cos(toRadians(lat2)) * 
    Math.sin(dLon / 2) * Math.sin(dLon / 2);
  
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  const distance = EARTH_RADIUS_KM * c;
  
  return distance;
}

/**
 * Convert degrees to radians
 */
function toRadians(degrees: number): number {
  return degrees * (Math.PI / 180);
}

/**
 * Estimate travel time between two locations based on distance
 */
export function estimateTravelTime(distance: number): number {
  // Return time in minutes
  return (distance / AVG_SPEED_KM_H) * 60;
}

/**
 * Sort locations by priority and weight
 */
export function sortLocationsByPriority(
  locations: Location[],
  prioritizeWeight: boolean = false
): Location[] {
  return [...locations].sort((a, b) => {
    // First sort by priority (higher priority first)
    const priorityA = a.priority || 0;
    const priorityB = b.priority || 0;
    
    if (priorityA !== priorityB) {
      return priorityB - priorityA;
    }
    
    // Then sort by weight if prioritizeWeight is true
    if (prioritizeWeight) {
      const weightA = a.weight || 0;
      const weightB = b.weight || 0;
      return weightB - weightA;
    }
    
    return 0;
  });
}

/**
 * Check if a location's time window is valid for the current time
 */
export function isTimeWindowValid(location: Location, currentTime: number): boolean {
  if (!location.timeWindow) return true;
  
  return currentTime >= location.timeWindow.start && currentTime <= location.timeWindow.end;
}

/**
 * Find the nearest location to a given location
 */
export function findNearestLocation(
  currentLocation: Location,
  locations: Location[],
  options: {
    respectTimeWindows?: boolean;
    currentTime?: number;
  } = {}
): Location | null {
  if (locations.length === 0) return null;
  
  let nearestLocation: Location | null = null;
  let shortestDistance = Infinity;
  
  for (const location of locations) {
    // Skip if time window is not valid
    if (options.respectTimeWindows && options.currentTime && 
        !isTimeWindowValid(location, options.currentTime)) {
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
 * Optimize a route using a nearest neighbor algorithm
 */
export function optimizeRoute(
  locations: Location[],
  options: OptimizationOptions = {}
): OptimizedRoute {
  if (locations.length === 0) {
    return {
      stops: [],
      totalDistance: 0,
      totalWeight: 0,
      estimatedTime: 0,
      remainingCapacity: options.vehicleCapacity || 0
    };
  }
  
  const mergedOptions: OptimizationOptions = {
    prioritizeWeight: false,
    respectTimeWindows: false,
    vehicleCapacity: Infinity,
    maxStops: Infinity,
    ...options
  };
  
  // Start with the provided start location or the first location
  let currentLocation = mergedOptions.startLocation || locations[0];
  let remainingLocations = [...locations];
  
  // Remove start location from the list if it's included
  if (mergedOptions.startLocation) {
    remainingLocations = remainingLocations.filter(loc => loc.id !== currentLocation.id);
  }
  
  // Sort by priority if needed
  if (mergedOptions.prioritizeWeight) {
    remainingLocations = sortLocationsByPriority(remainingLocations, true);
  }
  
  const route: Location[] = [currentLocation];
  let totalDistance = 0;
  let totalWeight = currentLocation.weight || 0;
  let currentTime = Date.now();
  let remainingCapacity = mergedOptions.vehicleCapacity || Infinity;
  
  // Subtract the weight of the start location if it has one
  if (currentLocation.weight) {
    remainingCapacity -= currentLocation.weight;
  }
  
  // Continue until we've visited all locations or reached constraints
  while (
    remainingLocations.length > 0 && 
    route.length < (mergedOptions.maxStops || Infinity) &&
    remainingCapacity > 0
  ) {
    // Find the nearest valid location
    const nearest = findNearestLocation(currentLocation, remainingLocations, {
      respectTimeWindows: mergedOptions.respectTimeWindows,
      currentTime
    });
    
    if (!nearest) break;
    
    // Check if adding this location would exceed vehicle capacity
    if ((nearest.weight || 0) > remainingCapacity) {
      // Remove this location and try the next nearest
      remainingLocations = remainingLocations.filter(loc => loc.id !== nearest.id);
      continue;
    }
    
    // Add to route
    route.push(nearest);
    
    // Update metrics
    const distance = calculateDistance(currentLocation, nearest);
    totalDistance += distance;
    totalWeight += nearest.weight || 0;
    remainingCapacity -= nearest.weight || 0;
    
    // Update current time based on travel time
    const travelTime = estimateTravelTime(distance);
    currentTime += travelTime * 60 * 1000; // Convert minutes to milliseconds
    
    // Update current location and remove from remaining
    currentLocation = nearest;
    remainingLocations = remainingLocations.filter(loc => loc.id !== nearest.id);
  }
  
  // Add end location if provided
  if (mergedOptions.endLocation && route[route.length - 1].id !== mergedOptions.endLocation.id) {
    const lastLocation = route[route.length - 1];
    const endLocation = mergedOptions.endLocation;
    
    const finalDistance = calculateDistance(lastLocation, endLocation);
    totalDistance += finalDistance;
    
    route.push(endLocation);
  }
  
  // Calculate estimated time in minutes
  const estimatedTime = Math.round((totalDistance / AVG_SPEED_KM_H) * 60);
  
  return {
    stops: route,
    totalDistance,
    totalWeight,
    estimatedTime,
    remainingCapacity
  };
}

/**
 * Create multiple routes for a set of locations
 */
export function createMultipleRoutes(
  locations: Location[],
  options: OptimizationOptions & { numVehicles: number }
): OptimizedRoute[] {
  const { numVehicles, ...routeOptions } = options;
  
  if (locations.length === 0 || numVehicles <= 0) {
    return [];
  }
  
  // If only one vehicle or fewer locations than vehicles, optimize a single route
  if (numVehicles === 1 || locations.length <= numVehicles) {
    return [optimizeRoute(locations, routeOptions)];
  }
  
  // Sort locations by priority and weight
  const sortedLocations = sortLocationsByPriority(locations, routeOptions.prioritizeWeight);
  
  // Split locations into clusters (simple division for now)
  const locationsPerVehicle = Math.ceil(sortedLocations.length / numVehicles);
  const clusters: Location[][] = [];
  
  for (let i = 0; i < numVehicles; i++) {
    const start = i * locationsPerVehicle;
    const end = Math.min(start + locationsPerVehicle, sortedLocations.length);
    
    if (start < sortedLocations.length) {
      clusters.push(sortedLocations.slice(start, end));
    }
  }
  
  // Optimize each cluster
  return clusters.map(cluster => optimizeRoute(cluster, routeOptions));
}

/**
 * Calculate the optimal order to visit a set of locations
 */
export function calculateOptimalOrder(
  locations: Location[],
  options: OptimizationOptions = {}
): Location[] {
  const optimizedRoute = optimizeRoute(locations, options);
  return optimizedRoute.stops;
}

// Export a class for backward compatibility
export class RouteOptimizer {
  /**
   * Optimize routes for a set of locations
   */
  static async optimizeRoutes(
    locations: Location[],
    options: OptimizationOptions = {}
  ): Promise<OptimizedRoute> {
    return optimizeRoute(locations, options);
  }
  
  /**
   * Create multiple routes for a set of locations
   */
  static async createMultipleRoutes(
    locations: Location[],
    options: OptimizationOptions & { numVehicles: number }
  ): Promise<OptimizedRoute[]> {
    return createMultipleRoutes(locations, options);
  }
  
  /**
   * Calculate the distance between two locations
   */
  static calculateDistance(location1: Location, location2: Location): number {
    return calculateDistance(location1, location2);
  }
  
  /**
   * Estimate travel time between two locations
   */
  static estimateTravelTime(distance: number): number {
    return estimateTravelTime(distance);
  }
}

export default RouteOptimizer; 