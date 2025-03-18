import type { CollectionAlertProps } from './props';

export interface QueuedAlert extends CollectionAlertProps {
  id: string;
}

export interface QueueState {
  queue: QueuedAlert[];
  currentId: string | null;
} 