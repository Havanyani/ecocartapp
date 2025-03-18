import type { AlertType, IconName } from './base';

// Component-specific props
export interface CollectionAlertProps {
  message: string;
  type?: AlertType;
  onDismiss?: () => void;
  duration?: number;
  testID?: string;
  animationDuration?: number;
}

export interface CollectionAlertComponentProps extends CollectionAlertProps {
  id: string;
}

// Subcomponent props
export interface IconButtonProps {
  name: IconName;
  onPress?: () => void;
  testID?: string;
  size?: number;
}

// Error handling props
export interface ErrorFallbackProps {
  error: Error;
  resetErrorBoundary: () => void;
} 