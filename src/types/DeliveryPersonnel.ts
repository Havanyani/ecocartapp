import { z } from 'zod';

export const DeliveryPersonnelSchema = z.object({
  id: z.string(),
  name: z.string(),
  phoneNumber: z.string(),
  email: z.string().email(),
  status: z.enum(['AVAILABLE', 'ON_DELIVERY', 'OFF_DUTY']),
  currentLocation: z.object({
    latitude: z.number(),
    longitude: z.number(),
    timestamp: z.date(),
  }),
  rating: z.number().min(0).max(5),
  totalDeliveries: z.number(),
  activeDeliveries: z.array(z.string()), // Array of order IDs
  vehicle: z.object({
    type: z.enum(['BIKE', 'SCOOTER', 'CAR', 'VAN', 'TRUCK']),
    registrationNumber: z.string(),
    capacity: z.number(),
  }),
});

export const DeliveryStatusSchema = z.object({
  orderId: z.string(),
  personnelId: z.string(),
  status: z.enum(['PICKED_UP', 'IN_TRANSIT', 'DELIVERED', 'DELAYED']),
  location: z.object({
    latitude: z.number(),
    longitude: z.number(),
    timestamp: z.date(),
  }),
  estimatedDeliveryTime: z.date(),
  actualDeliveryTime: z.date().optional(),
  notes: z.string().optional(),
});

export interface DeliveryPersonnel extends z.infer<typeof DeliveryPersonnelSchema> {}
export interface DeliveryStatus extends z.infer<typeof DeliveryStatusSchema> {}

export interface DeliveryPersonnelSearchParams {
  status?: DeliveryPersonnel['status'];
  rating?: number;
  vehicleType?: DeliveryPersonnel['vehicle']['type'];
  location?: {
    latitude: number;
    longitude: number;
    radius: number; // in kilometers
  };
}

export interface DeliveryStatusUpdateParams {
  orderId: string;
  personnelId: string;
  status: DeliveryStatus['status'];
  location: DeliveryStatus['location'];
  estimatedDeliveryTime?: Date;
  notes?: string;
} 