import { DeliveryStop, PlasticPickup } from '@/types/delivery';
import { calculateDistance } from '@/utils/distanceCalculator';
import { Location } from 'react-native-maps';

interface OptimizationParams {
  startLocation: Location;
  endLocation: Location;
  maxStops?: number;
  vehicleCapacity?: number; // in kg
  timeWindowConstraints?: boolean;
}

interface RouteStop extends DeliveryStop {
  estimatedArrival: Date;
  estimatedPlasticWeight: number;
  isPickupStop: boolean;
}

interface OptimizedRoute {
  stops: RouteStop[];
  totalDistance: number;
  estimatedDuration: number;
  totalPlasticWeight: number;
  fuelEfficiencyScore: number;
}

export function optimizeDeliveryRoute(
  deliveryStops: DeliveryStop[],
  plasticPickups: PlasticPickup[],
  params: OptimizationParams
): OptimizedRoute {
  const {
    startLocation,
    endLocation,
    maxStops = 15,
    vehicleCapacity = 100,
    timeWindowConstraints = true
  } = params;

  // Combine delivery stops and pickups for optimization
  const allStops: RouteStop[] = [
    ...deliveryStops.map(stop => ({
      ...stop,
      estimatedArrival: new Date(),
      estimatedPlasticWeight: 0,
      isPickupStop: false
    })),
    ...plasticPickups.map(pickup => ({
      ...pickup,
      estimatedArrival: new Date(),
      estimatedPlasticWeight: pickup.estimatedWeight,
      isPickupStop: true
    }))
  ];

  // Sort stops by priority and time windows
  const sortedStops = sortStopsByPriority(allStops, timeWindowConstraints);

  // Apply vehicle capacity constraints
  const feasibleStops = applyCapacityConstraints(sortedStops, vehicleCapacity);

  // Optimize route using nearest neighbor with constraints
  const optimizedStops = optimizeStops(
    feasibleStops,
    startLocation,
    endLocation,
    maxStops
  );

  // Calculate route metrics
  const totalDistance = calculateTotalDistance(optimizedStops);
  const estimatedDuration = calculateEstimatedDuration(optimizedStops);
  const totalPlasticWeight = calculateTotalPlasticWeight(optimizedStops);
  const fuelEfficiencyScore = calculateFuelEfficiency(
    totalDistance,
    totalPlasticWeight
  );

  return {
    stops: optimizedStops,
    totalDistance,
    estimatedDuration,
    totalPlasticWeight,
    fuelEfficiencyScore
  };
}

function sortStopsByPriority(
  stops: RouteStop[],
  considerTimeWindows: boolean
): RouteStop[] {
  return stops.sort((a, b) => {
    // Prioritize time-sensitive deliveries
    if (considerTimeWindows) {
      const aWindow = a.timeWindow?.end || new Date();
      const bWindow = b.timeWindow?.end || new Date();
      if (aWindow.getTime() !== bWindow.getTime()) {
        return aWindow.getTime() - bWindow.getTime();
      }
    }

    // Then prioritize plastic pickups based on estimated weight
    if (a.isPickupStop && b.isPickupStop) {
      return b.estimatedPlasticWeight - a.estimatedPlasticWeight;
    }

    // Prioritize deliveries over pickups when time windows are equal
    return a.isPickupStop ? 1 : -1;
  });
}

function applyCapacityConstraints(
  stops: RouteStop[],
  capacity: number
): RouteStop[] {
  let currentCapacity = 0;
  return stops.filter(stop => {
    if (!stop.isPickupStop) return true;
    
    const newCapacity = currentCapacity + stop.estimatedPlasticWeight;
    if (newCapacity <= capacity) {
      currentCapacity = newCapacity;
      return true;
    }
    return false;
  });
}

function optimizeStops(
  stops: RouteStop[],
  startLocation: Location,
  endLocation: Location,
  maxStops: number
): RouteStop[] {
  let optimizedRoute: RouteStop[] = [];
  let remainingStops = [...stops];
  let currentLocation = startLocation;

  while (remainingStops.length > 0 && optimizedRoute.length < maxStops) {
    const nextStop = findNearestStop(currentLocation, remainingStops);
    if (!nextStop) break;

    // Update estimated arrival time based on distance and traffic
    const estimatedArrival = calculateEstimatedArrival(
      currentLocation,
      nextStop.location
    );
    
    optimizedRoute.push({
      ...nextStop,
      estimatedArrival
    });

    currentLocation = nextStop.location;
    remainingStops = remainingStops.filter(stop => stop.id !== nextStop.id);
  }

  // Add final route to end location if needed
  if (endLocation !== startLocation) {
    const finalLeg = calculateDistance(
      currentLocation.latitude,
      currentLocation.longitude,
      endLocation.latitude,
      endLocation.longitude
    );
    // Update last stop's metrics based on final leg
  }

  return optimizedRoute;
}

function findNearestStop(
  currentLocation: Location,
  stops: RouteStop[]
): RouteStop | null {
  let nearestStop: RouteStop | null = null;
  let shortestDistance = Infinity;

  stops.forEach(stop => {
    const distance = calculateDistance(
      currentLocation.latitude,
      currentLocation.longitude,
      stop.location.latitude,
      stop.location.longitude
    );

    if (distance < shortestDistance) {
      shortestDistance = distance;
      nearestStop = stop;
    }
  });

  return nearestStop;
}

function calculateEstimatedArrival(
  from: Location,
  to: Location
): Date {
  const distance = calculateDistance(
    from.latitude,
    from.longitude,
    to.latitude,
    to.longitude
  );
  
  // Assume average speed of 30km/h in urban areas
  const averageSpeed = 30; // km/h
  const estimatedTimeHours = distance / averageSpeed;
  
  const arrival = new Date();
  arrival.setHours(arrival.getHours() + Math.floor(estimatedTimeHours));
  arrival.setMinutes(
    arrival.getMinutes() + Math.round((estimatedTimeHours % 1) * 60)
  );
  
  return arrival;
}

function calculateTotalDistance(stops: RouteStop[]): number {
  let totalDistance = 0;
  
  for (let i = 0; i < stops.length - 1; i++) {
    totalDistance += calculateDistance(
      stops[i].location.latitude,
      stops[i].location.longitude,
      stops[i + 1].location.latitude,
      stops[i + 1].location.longitude
    );
  }
  
  return totalDistance;
}

function calculateEstimatedDuration(stops: RouteStop[]): number {
  if (stops.length < 2) return 0;
  
  const firstStop = stops[0].estimatedArrival;
  const lastStop = stops[stops.length - 1].estimatedArrival;
  
  return (lastStop.getTime() - firstStop.getTime()) / 1000 / 60; // in minutes
}

function calculateTotalPlasticWeight(stops: RouteStop[]): number {
  return stops.reduce(
    (total, stop) => total + (stop.isPickupStop ? stop.estimatedPlasticWeight : 0),
    0
  );
}

function calculateFuelEfficiency(
  totalDistance: number,
  totalPlasticWeight: number
): number {
  // Calculate efficiency score (0-100)
  // Higher score means better efficiency (more plastic collected per km)
  const efficiency = (totalPlasticWeight / totalDistance) * 10;
  return Math.min(Math.max(efficiency, 0), 100);
} 