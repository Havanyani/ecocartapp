import { z } from 'zod';
import { AlertData } from '@/services/PerformanceAlertService';

const MetricSchema = z.object({
  value: z.number().min(0),
  threshold: z.number().min(0).optional(),
  timestamp: z.number().min(0),
});

const AlertSchema = z.object({
  id: z.string().min(1),
  type: z.enum(['warning', 'error', 'info', 'critical', 'performance', 'security']),
  title: z.string().min(1),
  message: z.string().min(1),
  metric: z.string().optional(),
  value: z.number().optional(),
  threshold: z.number().optional(),
  timestamp: z.number(),
  groupId: z.string().optional(),
  priority: z.number().min(0).max(3),
});

export function validateMetric(data: unknown): boolean {
  try {
    MetricSchema.parse(data);
    return true;
  } catch (error) {
    console.error('Metric validation failed:', error);
    return false;
  }
}

export function validateAlert(data: unknown): data is AlertData {
  try {
    AlertSchema.parse(data);
    return true;
  } catch (error) {
    console.error('Alert validation failed:', error);
    return false;
  }
} 