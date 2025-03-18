/**
 * RouteOptimizationService
 * 
 * Provides intelligent route optimization for collection routes using various algorithms.
 * Supports different optimization strategies and constraints like time windows, vehicle
 * capacity, and route fairness.
 */

import { SafeStorage } from '@/utils/storage';

// Location coordinates 
interface Coordinates {
  latitude: number;
  longitude: number;
}

// Location with address info
export interface Location extends Coordinates {
  address: string;
  postalCode?: string;
  city?: string;
}

// Collection stop representing a pickup location
export interface CollectionStop {
  id: string;
  location: Location;
  estimatedWeight: number;
  timeWindow?: {
    start: string; // ISO time string
    end: string;   // ISO time string
  };
  serviceDuration: number; // in minutes
  materialTypes: string[];
  priority: number; // 1-5, with 5 being highest priority
  userId: string;
}

// Vehicle capacity and constraints
export interface Vehicle {
  id: string;
  name: string;
  maxCapacity: number; // in kg
  maxStops: number;
  averageSpeed: number; // in km/h
  startLocation: Location;
  endLocation: Location;
  availabilityWindow: {
    start: string; // ISO time string
    end: string;   // ISO time string
  };
}

// Optimized route output
export interface OptimizedRoute {
  vehicleId: string;
  stops: RouteStop[];
  statistics: {
    totalDistance: number; // in km
    totalDuration: number; // in minutes
    totalWeight: number; // in kg
    capacityUtilization: number; // percentage
    startTime: string;
    endTime: string;
    fuelUsage: number; // estimated in liters
    co2Emissions: number; // in kg
  };
  polyline: string; // encoded polyline for map rendering
}

// Route stop with timing and sequence information
export interface RouteStop {
  stopId: string;
  location: Location;
  arrivalTime: string;
  departureTime: string;
  weight: number;
  sequence: number;
  distance: number; // distance from previous stop in km
  duration: number; // travel time from previous stop in minutes
}

// Optimization strategy options
export enum OptimizationStrategy {
  SHORTEST_DISTANCE = 'shortest_distance',
  SHORTEST_TIME = 'shortest_time',
  BALANCED = 'balanced',
  FUEL_EFFICIENT = 'fuel_efficient',
  PRIORITY_FIRST = 'priority_first',
  CAPACITY_OPTIMIZED = 'capacity_optimized',
}

// Optimization request parameters
export interface OptimizationRequest {
  stops: CollectionStop[];
  vehicles: Vehicle[];
  strategy: OptimizationStrategy;
  balanceRoutes?: boolean;
  avoidHighways?: boolean;
  avoidTolls?: boolean;
  considerTraffic?: boolean;
}

class RouteOptimizationService {
  private static instance: RouteOptimizationService;
  private cachedDistances: Record<string, number> = {};
  private cachedDurations: Record<string, number> = {};
  
  private constructor() {
    this.loadCache();
  }
  
  /**
   * Gets the singleton instance of the service
   */
  public static getInstance(): RouteOptimizationService {
    if (!RouteOptimizationService.instance) {
      RouteOptimizationService.instance = new RouteOptimizationService();
    }
    return RouteOptimizationService.instance;
  }
  
  /**
   * Optimize collection routes based on the given parameters
   * @param request Optimization request parameters
   */
  public async optimizeRoutes(request: OptimizationRequest): Promise<OptimizedRoute[]> {
    const { stops, vehicles, strategy } = request;
    
    // If no stops or vehicles, return empty array
    if (!stops.length || !vehicles.length) {
      console.warn('No stops or vehicles provided for optimization');
      return [];
    }
    
    console.log(`Optimizing routes for ${stops.length} stops and ${vehicles.length} vehicles using ${strategy} strategy`);
    
    // Choose optimization algorithm based on strategy
    let optimizedRoutes: OptimizedRoute[];
    
    switch (strategy) {
      case OptimizationStrategy.SHORTEST_DISTANCE:
        optimizedRoutes = await this.optimizeForShortestDistance(stops, vehicles, request);
        break;
      case OptimizationStrategy.SHORTEST_TIME:
        optimizedRoutes = await this.optimizeForShortestTime(stops, vehicles, request);
        break;
      case OptimizationStrategy.BALANCED:
        optimizedRoutes = await this.optimizeBalanced(stops, vehicles, request);
        break;
      case OptimizationStrategy.FUEL_EFFICIENT:
        optimizedRoutes = await this.optimizeForFuelEfficiency(stops, vehicles, request);
        break;
      case OptimizationStrategy.PRIORITY_FIRST:
        optimizedRoutes = await this.optimizeForPriority(stops, vehicles, request);
        break;
      case OptimizationStrategy.CAPACITY_OPTIMIZED:
        optimizedRoutes = await this.optimizeForCapacity(stops, vehicles, request);
        break;
      default:
        optimizedRoutes = await this.optimizeBalanced(stops, vehicles, request);
    }
    
    // Save calculated distances and durations to cache
    this.saveCache();
    
    return optimizedRoutes;
  }
  
  /**
   * Optimize for the shortest total distance
   */
  private async optimizeForShortestDistance(
    stops: CollectionStop[],
    vehicles: Vehicle[],
    options: OptimizationRequest
  ): Promise<OptimizedRoute[]> {
    // In this implementation, we'll use a simplified nearest neighbor algorithm
    // A more sophisticated implementation would use algorithms like:
    // - Genetic algorithms
    // - Simulated annealing
    // - Linear programming
    
    // For demonstration, we'll implement a basic nearest neighbor solution
    
    // Clone the stops array to avoid modifying the original
    let remainingStops = [...stops];
    
    // Initialize routes for each vehicle
    const routes: OptimizedRoute[] = vehicles.map(vehicle => ({
      vehicleId: vehicle.id,
      stops: [],
      statistics: {
        totalDistance: 0,
        totalDuration: 0,
        totalWeight: 0,
        capacityUtilization: 0,
        startTime: vehicle.availabilityWindow.start,
        endTime: vehicle.availabilityWindow.start, // Will be updated as we add stops
        fuelUsage: 0,
        co2Emissions: 0,
      },
      polyline: '',
    }));
    
    // Assign stops to vehicles using nearest neighbor heuristic
    for (let i = 0; i < vehicles.length; i++) {
      const vehicle = vehicles[i];
      let route = routes[i];
      let currentLocation = vehicle.startLocation;
      let currentTime = new Date(vehicle.availabilityWindow.start);
      let totalWeight = 0;
      
      // Keep adding stops until we run out of capacity, stops, or time
      while (
        remainingStops.length > 0 && 
        route.stops.length < vehicle.maxStops &&
        totalWeight < vehicle.maxCapacity
      ) {
        // Find nearest unassigned stop
        let nearestStopIndex = -1;
        let shortestDistance = Infinity;
        
        for (let j = 0; j < remainingStops.length; j++) {
          const stop = remainingStops[j];
          
          // Skip if this stop would exceed vehicle capacity
          if (totalWeight + stop.estimatedWeight > vehicle.maxCapacity) {
            continue;
          }
          
          // Calculate distance to this stop
          const distance = await this.getDistance(currentLocation, stop.location);
          
          if (distance < shortestDistance) {
            shortestDistance = distance;
            nearestStopIndex = j;
          }
        }
        
        // If no valid stop found, break the loop
        if (nearestStopIndex === -1) {
          break;
        }
        
        // Get the selected stop and remove from remaining stops
        const selectedStop = remainingStops[nearestStopIndex];
        remainingStops.splice(nearestStopIndex, 1);
        
        // Calculate travel duration to this stop (in minutes)
        const travelDuration = await this.getDuration(currentLocation, selectedStop.location);
        
        // Update current time with travel duration
        currentTime = new Date(currentTime.getTime() + travelDuration * 60 * 1000);
        
        // Check time window if applicable
        if (selectedStop.timeWindow) {
          const windowStart = new Date(selectedStop.timeWindow.start);
          const windowEnd = new Date(selectedStop.timeWindow.end);
          
          // If arrived before window starts, wait until window start
          if (currentTime < windowStart) {
            currentTime = new Date(windowStart);
          }
          
          // If arrived after window ends, skip this stop (add it back)
          if (currentTime > windowEnd) {
            remainingStops.push(selectedStop);
            continue;
          }
        }
        
        // Record arrival time
        const arrivalTime = currentTime.toISOString();
        
        // Add service duration
        currentTime = new Date(currentTime.getTime() + selectedStop.serviceDuration * 60 * 1000);
        
        // Record departure time
        const departureTime = currentTime.toISOString();
        
        // Add stop to route
        route.stops.push({
          stopId: selectedStop.id,
          location: selectedStop.location,
          arrivalTime,
          departureTime,
          weight: selectedStop.estimatedWeight,
          sequence: route.stops.length + 1,
          distance: shortestDistance,
          duration: travelDuration,
        });
        
        // Update totals
        route.statistics.totalDistance += shortestDistance;
        route.statistics.totalDuration += travelDuration + selectedStop.serviceDuration;
        totalWeight += selectedStop.estimatedWeight;
        route.statistics.totalWeight = totalWeight;
        
        // Update current location to the stop we just added
        currentLocation = selectedStop.location;
      }
      
      // Add return to depot
      if (route.stops.length > 0) {
        const lastStop = route.stops[route.stops.length - 1];
        const distanceToDepot = await this.getDistance(lastStop.location, vehicle.endLocation);
        const durationToDepot = await this.getDuration(lastStop.location, vehicle.endLocation);
        
        // Update totals
        route.statistics.totalDistance += distanceToDepot;
        route.statistics.totalDuration += durationToDepot;
        
        // Update end time
        const endTime = new Date(new Date(lastStop.departureTime).getTime() + durationToDepot * 60 * 1000);
        route.statistics.endTime = endTime.toISOString();
        
        // Calculate capacity utilization
        route.statistics.capacityUtilization = (totalWeight / vehicle.maxCapacity) * 100;
        
        // Estimate fuel usage and CO2 emissions (simplified)
        // In a real system, this would consider vehicle type, load, terrain, etc.
        const fuelConsumptionRate = 0.1; // liters per km
        route.statistics.fuelUsage = route.statistics.totalDistance * fuelConsumptionRate;
        route.statistics.co2Emissions = route.statistics.fuelUsage * 2.31; // 2.31 kg CO2 per liter of diesel
        
        // Generate polyline
        route.polyline = this.generateMockPolyline(vehicle.startLocation, route.stops.map(s => s.location), vehicle.endLocation);
      }
    }
    
    // Handle any unassigned stops
    if (remainingStops.length > 0) {
      console.warn(`${remainingStops.length} stops could not be assigned to any vehicle`);
    }
    
    return routes;
  }
  
  /**
   * Optimize for the shortest total time
   */
  private async optimizeForShortestTime(
    stops: CollectionStop[],
    vehicles: Vehicle[],
    options: OptimizationRequest
  ): Promise<OptimizedRoute[]> {
    // Similar to optimizeForShortestDistance but prioritizes time over distance
    // For brevity, we'll use the same base algorithm but modify the selection criteria
    
    // Clone the stops array to avoid modifying the original
    let remainingStops = [...stops];
    
    // Initialize routes for each vehicle
    const routes: OptimizedRoute[] = vehicles.map(vehicle => ({
      vehicleId: vehicle.id,
      stops: [],
      statistics: {
        totalDistance: 0,
        totalDuration: 0,
        totalWeight: 0,
        capacityUtilization: 0,
        startTime: vehicle.availabilityWindow.start,
        endTime: vehicle.availabilityWindow.start,
        fuelUsage: 0,
        co2Emissions: 0,
      },
      polyline: '',
    }));
    
    // Assign stops to vehicles prioritizing minimal time
    for (let i = 0; i < vehicles.length; i++) {
      const vehicle = vehicles[i];
      let route = routes[i];
      let currentLocation = vehicle.startLocation;
      let currentTime = new Date(vehicle.availabilityWindow.start);
      let totalWeight = 0;
      
      while (
        remainingStops.length > 0 && 
        route.stops.length < vehicle.maxStops &&
        totalWeight < vehicle.maxCapacity
      ) {
        // Find stop with shortest travel time
        let bestStopIndex = -1;
        let shortestDuration = Infinity;
        
        for (let j = 0; j < remainingStops.length; j++) {
          const stop = remainingStops[j];
          
          // Skip if this stop would exceed vehicle capacity
          if (totalWeight + stop.estimatedWeight > vehicle.maxCapacity) {
            continue;
          }
          
          // Calculate travel time to this stop
          const duration = await this.getDuration(currentLocation, stop.location);
          
          if (duration < shortestDuration) {
            shortestDuration = duration;
            bestStopIndex = j;
          }
        }
        
        // Rest of implementation similar to optimizeForShortestDistance
        // but prioritizing time-based calculations
        
        // If no valid stop found, break the loop
        if (bestStopIndex === -1) {
          break;
        }
        
        // Get the selected stop and remove from remaining stops
        const selectedStop = remainingStops[bestStopIndex];
        remainingStops.splice(bestStopIndex, 1);
        
        // Calculate distance to this stop
        const distance = await this.getDistance(currentLocation, selectedStop.location);
        
        // Update current time with travel duration
        currentTime = new Date(currentTime.getTime() + shortestDuration * 60 * 1000);
        
        // Check time window if applicable
        if (selectedStop.timeWindow) {
          const windowStart = new Date(selectedStop.timeWindow.start);
          const windowEnd = new Date(selectedStop.timeWindow.end);
          
          // If arrived before window starts, wait until window start
          if (currentTime < windowStart) {
            currentTime = new Date(windowStart);
          }
          
          // If arrived after window ends, skip this stop (add it back)
          if (currentTime > windowEnd) {
            remainingStops.push(selectedStop);
            continue;
          }
        }
        
        // Record arrival time
        const arrivalTime = currentTime.toISOString();
        
        // Add service duration
        currentTime = new Date(currentTime.getTime() + selectedStop.serviceDuration * 60 * 1000);
        
        // Record departure time
        const departureTime = currentTime.toISOString();
        
        // Add stop to route
        route.stops.push({
          stopId: selectedStop.id,
          location: selectedStop.location,
          arrivalTime,
          departureTime,
          weight: selectedStop.estimatedWeight,
          sequence: route.stops.length + 1,
          distance,
          duration: shortestDuration,
        });
        
        // Update totals
        route.statistics.totalDistance += distance;
        route.statistics.totalDuration += shortestDuration + selectedStop.serviceDuration;
        totalWeight += selectedStop.estimatedWeight;
        route.statistics.totalWeight = totalWeight;
        
        // Update current location to the stop we just added
        currentLocation = selectedStop.location;
      }
      
      // Add return to depot and finalize route (similar to previous method)
      if (route.stops.length > 0) {
        const lastStop = route.stops[route.stops.length - 1];
        const distanceToDepot = await this.getDistance(lastStop.location, vehicle.endLocation);
        const durationToDepot = await this.getDuration(lastStop.location, vehicle.endLocation);
        
        // Update totals
        route.statistics.totalDistance += distanceToDepot;
        route.statistics.totalDuration += durationToDepot;
        
        // Update end time
        const endTime = new Date(new Date(lastStop.departureTime).getTime() + durationToDepot * 60 * 1000);
        route.statistics.endTime = endTime.toISOString();
        
        // Calculate capacity utilization
        route.statistics.capacityUtilization = (totalWeight / vehicle.maxCapacity) * 100;
        
        // Estimate fuel usage and CO2 emissions
        const fuelConsumptionRate = 0.1; // liters per km
        route.statistics.fuelUsage = route.statistics.totalDistance * fuelConsumptionRate;
        route.statistics.co2Emissions = route.statistics.fuelUsage * 2.31;
        
        // Generate polyline
        route.polyline = this.generateMockPolyline(vehicle.startLocation, route.stops.map(s => s.location), vehicle.endLocation);
      }
    }
    
    return routes;
  }
  
  /**
   * Optimize with balanced priority between distance, time, and capacity
   */
  private async optimizeBalanced(
    stops: CollectionStop[],
    vehicles: Vehicle[],
    options: OptimizationRequest
  ): Promise<OptimizedRoute[]> {
    // For now, we'll reuse the shortest distance algorithm
    // In a real implementation, this would balance multiple factors
    return this.optimizeForShortestDistance(stops, vehicles, options);
  }
  
  /**
   * Optimize for fuel efficiency (minimize environmental impact)
   */
  private async optimizeForFuelEfficiency(
    stops: CollectionStop[],
    vehicles: Vehicle[],
    options: OptimizationRequest
  ): Promise<OptimizedRoute[]> {
    // For now, we'll reuse the shortest distance algorithm
    // In a real implementation, this would consider terrain, traffic, vehicle load, etc.
    return this.optimizeForShortestDistance(stops, vehicles, options);
  }
  
  /**
   * Optimize routes prioritizing high-priority stops
   */
  private async optimizeForPriority(
    stops: CollectionStop[],
    vehicles: Vehicle[],
    options: OptimizationRequest
  ): Promise<OptimizedRoute[]> {
    // Sort stops by priority (highest first)
    const sortedStops = [...stops].sort((a, b) => b.priority - a.priority);
    
    // Then use the standard distance optimization with these prioritized stops
    return this.optimizeForShortestDistance(sortedStops, vehicles, options);
  }
  
  /**
   * Optimize to maximize vehicle capacity utilization
   */
  private async optimizeForCapacity(
    stops: CollectionStop[],
    vehicles: Vehicle[],
    options: OptimizationRequest
  ): Promise<OptimizedRoute[]> {
    // For now, we'll reuse the shortest distance algorithm
    // In a real implementation, this would prioritize maximizing each vehicle's load
    return this.optimizeForShortestDistance(stops, vehicles, options);
  }
  
  /**
   * Calculate driving distance between two locations (in km)
   */
  private async getDistance(from: Location, to: Location): Promise<number> {
    const key = `${from.latitude},${from.longitude}|${to.latitude},${to.longitude}`;
    
    // Check cache first
    if (this.cachedDistances[key]) {
      return this.cachedDistances[key];
    }
    
    // In a real implementation, this would call a routing API like Google Maps, Mapbox, etc.
    // For this example, we'll calculate a simplified straight-line distance
    
    const distance = this.calculateHaversineDistance(
      from.latitude, from.longitude, 
      to.latitude, to.longitude
    );
    
    // Add a small random variation for realistic routes
    const variation = 1 + (Math.random() * 0.3); // 0-30% longer than straight line
    const finalDistance = distance * variation;
    
    // Cache the result
    this.cachedDistances[key] = finalDistance;
    
    return finalDistance;
  }
  
  /**
   * Calculate driving time between two locations (in minutes)
   */
  private async getDuration(from: Location, to: Location): Promise<number> {
    const key = `${from.latitude},${from.longitude}|${to.latitude},${to.longitude}`;
    
    // Check cache first
    if (this.cachedDurations[key]) {
      return this.cachedDurations[key];
    }
    
    // Get the distance
    const distance = await this.getDistance(from, to);
    
    // Assume average driving speed of 40 km/h in urban areas
    // In a real implementation, this would consider traffic, road types, etc.
    const averageSpeed = 40; // km/h
    
    // Calculate duration in minutes
    const duration = (distance / averageSpeed) * 60;
    
    // Add a small random variation for realism
    const variation = 1 + (Math.random() * 0.2); // 0-20% longer than average speed
    const finalDuration = duration * variation;
    
    // Cache the result
    this.cachedDurations[key] = finalDuration;
    
    return finalDuration;
  }
  
  /**
   * Calculate the "as-the-crow-flies" distance between two points using the Haversine formula
   */
  private calculateHaversineDistance(lat1: number, lon1: number, lat2: number, lon2: number): number {
    const R = 6371; // Earth radius in km
    const dLat = this.deg2rad(lat2 - lat1);
    const dLon = this.deg2rad(lon2 - lon1);
    
    const a =
      Math.sin(dLat / 2) * Math.sin(dLat / 2) +
      Math.cos(this.deg2rad(lat1)) * Math.cos(this.deg2rad(lat2)) * 
      Math.sin(dLon / 2) * Math.sin(dLon / 2);
      
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    const distance = R * c; // Distance in km
    
    return distance;
  }
  
  /**
   * Convert degrees to radians
   */
  private deg2rad(deg: number): number {
    return deg * (Math.PI / 180);
  }
  
  /**
   * Load cache from storage
   */
  private async loadCache(): Promise<void> {
    try {
      const distancesJson = await SafeStorage.getItem('route_optimization_distances');
      const durationsJson = await SafeStorage.getItem('route_optimization_durations');
      
      if (distancesJson) {
        this.cachedDistances = JSON.parse(distancesJson);
      }
      
      if (durationsJson) {
        this.cachedDurations = JSON.parse(durationsJson);
      }
    } catch (error) {
      console.error('Failed to load route optimization cache:', error);
    }
  }
  
  /**
   * Save cache to storage
   */
  private async saveCache(): Promise<void> {
    try {
      // Limit cache size to prevent excessive storage
      const distanceKeys = Object.keys(this.cachedDistances);
      const durationKeys = Object.keys(this.cachedDurations);
      
      if (distanceKeys.length > 1000) {
        const trimmedDistances: Record<string, number> = {};
        distanceKeys.slice(-1000).forEach(key => {
          trimmedDistances[key] = this.cachedDistances[key];
        });
        this.cachedDistances = trimmedDistances;
      }
      
      if (durationKeys.length > 1000) {
        const trimmedDurations: Record<string, number> = {};
        durationKeys.slice(-1000).forEach(key => {
          trimmedDurations[key] = this.cachedDurations[key];
        });
        this.cachedDurations = trimmedDurations;
      }
      
      await SafeStorage.setItem('route_optimization_distances', JSON.stringify(this.cachedDistances));
      await SafeStorage.setItem('route_optimization_durations', JSON.stringify(this.cachedDurations));
    } catch (error) {
      console.error('Failed to save route optimization cache:', error);
    }
  }
  
  /**
   * Generate a mock polyline for visualization
   * In a real implementation, this would get the actual polyline from a routing API
   */
  private generateMockPolyline(start: Location, stops: Location[], end: Location): string {
    // For simplicity, generate a mock encoded polyline
    // In a real implementation, this would be an encoded Google Maps-style polyline
    return 'mock_polyline_' + Math.random().toString(36).substring(2, 10);
  }
  
  /**
   * Reoptimize a route when conditions change (traffic, cancellations, etc.)
   */
  public async reoptimizeRoute(
    routeId: string,
    updatedStops: CollectionStop[],
    vehicle: Vehicle,
    strategy: OptimizationStrategy
  ): Promise<OptimizedRoute> {
    // In a real implementation, this would reoptimize a single route
    // considering the current vehicle position and remaining stops
    
    const routes = await this.optimizeRoutes({
      stops: updatedStops,
      vehicles: [vehicle],
      strategy,
    });
    
    return routes[0];
  }
  
  /**
   * Validate if a route is feasible given time windows and other constraints
   */
  public validateRoute(route: OptimizedRoute, vehicle: Vehicle): boolean {
    // Check if the route exceeds vehicle capacity
    if (route.statistics.totalWeight > vehicle.maxCapacity) {
      return false;
    }
    
    // Check if the route has too many stops
    if (route.stops.length > vehicle.maxStops) {
      return false;
    }
    
    // Check if the route finishes within the vehicle availability window
    const endTime = new Date(route.statistics.endTime);
    const availabilityEnd = new Date(vehicle.availabilityWindow.end);
    
    if (endTime > availabilityEnd) {
      return false;
    }
    
    // All checks passed
    return true;
  }
}

export default RouteOptimizationService; 