export type AlertType = 'success' | 'warning' | 'error' | 'info';
export type IconName = 'check-circle' | 'alert' | 'close-circle' | 'information' | 'close' | 'refresh';

// Move QueuedAlert and QueueState to a new queue.ts file 

export interface QueueConfig {
  readonly maxAlerts: number;
  readonly stackSpacing: number;
  readonly alertHeight: number;
} 