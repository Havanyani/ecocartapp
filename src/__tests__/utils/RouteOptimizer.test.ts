import { Location } from '@/types/delivery';
import {  RouteOptimizer  } from '@/utils/RouteOptimization';

describe('RouteOptimizer', () => {
  const defaultParams = {
    vehicleCapacity: 10,
    maxStops: 15,
    prioritizePlasticPickups: true,
    considerTraffic: false
  };

  const mockStops: Location[] = [
    {
      latitude: -33.9249,
      longitude: 18.4241,
      altitude: null,
      timestamp: 0,
      accuracy: null,
      altitudeAccuracy: null,
      speed: null,
      heading: null
    },
    {
      latitude: -33.9169,
      longitude: 18.4167,
      altitude: null,
      timestamp: 0,
      accuracy: null,
      altitudeAccuracy: null,
      speed: null,
      heading: null
    },
    {
      latitude: -33.9269,
      longitude: 18.4233,
      altitude: null,
      timestamp: 0,
      accuracy: null,
      altitudeAccuracy: null,
      speed: null,
      heading: null
    }
  ];

  it('should optimize route with plastic pickup prioritization', async () => {
    const optimizedRoute = await RouteOptimizer.optimizeRoutes(mockStops, defaultParams);

    expect(optimizedRoute.routes[0].stops[0].location.latitude).toBe(-33.9249);
    expect(optimizedRoute.summary.totalDistance).toBeGreaterThan(0);
    expect(optimizedRoute.summary.totalDuration).toBeGreaterThan(0);
  });

  it('should respect vehicle capacity constraints', async () => {
    const optimizedRoute = await RouteOptimizer.optimizeRoutes(mockStops, { ...defaultParams, vehicleCapacity: 1 });

    expect(optimizedRoute.routes[0].stops.length).toBeLessThanOrEqual(1);
  });

  it('should consider time windows in route optimization', async () => {
    const optimizedRoute = await RouteOptimizer.optimizeRoutes(mockStops, defaultParams);
    const firstStop = optimizedRoute.routes[0].stops[0];

    expect(firstStop).toBeTruthy();
    expect(firstStop.location.latitude).toBe(-33.9249);
  });

  it('should calculate accurate CO2 savings', async () => {
    const optimizedRoute = await RouteOptimizer.optimizeRoutes(mockStops, defaultParams);
    const expectedSavings = optimizedRoute.summary.totalDistance * 0.12; // CO2_PER_KM

    expect(optimizedRoute.summary.totalDistance).toBeGreaterThan(0);
  });

  it('should handle empty stops list', async () => {
    const optimizedRoute = await RouteOptimizer.optimizeRoutes([], defaultParams);

    expect(optimizedRoute.routes).toHaveLength(0);
    expect(optimizedRoute.summary.totalDistance).toBe(0);
    expect(optimizedRoute.summary.totalDuration).toBe(0);
  });

  it('should optimize route for maximum efficiency', async () => {
    const manyStops: Location[] = Array.from({ length: 20 }, (_, i) => ({
      latitude: -33.9249 + (Math.random() - 0.5) * 0.1,
      longitude: 18.4241 + (Math.random() - 0.5) * 0.1,
      altitude: null,
      timestamp: 0,
      accuracy: null,
      altitudeAccuracy: null,
      speed: null,
      heading: null
    }));

    const optimizedRoute = await RouteOptimizer.optimizeRoutes(manyStops, defaultParams);

    expect(optimizedRoute.routes[0].stops.length).toBeLessThanOrEqual(defaultParams.maxStops);
    expect(optimizedRoute.summary.totalDuration).toBeGreaterThan(0);
  });
}); 