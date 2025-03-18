import { z } from 'zod';

export const NotificationHistorySchema = z.object({
  id: z.string(),
  type: z.enum(['delivery_status', 'location_update', 'route_change', 'collection_update']),
  personnelId: z.string(),
  title: z.string(),
  body: z.string(),
  timestamp: z.date(),
  read: z.boolean(),
  data: z.record(z.any()).optional(),
});

export type NotificationHistory = z.infer<typeof NotificationHistorySchema>;

export interface NotificationHistoryFilters {
  startDate?: Date;
  endDate?: Date;
  type?: NotificationHistory['type'];
  read?: boolean;
  personnelId?: string;
}

export interface NotificationHistoryStats {
  total: number;
  unread: number;
  byType: Record<NotificationHistory['type'], number>;
  byDate: Record<string, number>;
} 