export type AlertType = 'reminder' | 'update' | 'success';

export interface CollectionAlert {
  id: string;
  type: AlertType;
  message: string;
  scheduledTime: string;
  estimatedCredits: number;
}

export interface DeliveryNotification {
  id: string;
  status: string;
  estimatedTime: string;
  driverName: string;
  hasPlasticCollection: boolean;
} 