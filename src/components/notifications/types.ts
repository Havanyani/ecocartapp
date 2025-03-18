export * from './types/animation';
export * from './types/base';
export * from './types/gesture';
export * from './types/props';
export * from './types/queue';

// Alert Types
export type AlertType = 'success' | 'warning' | 'error' | 'info';

export interface CollectionAlertProps {
  message: string;
  type?: AlertType;
  onDismiss?: () => void;
  duration?: number;
  testID?: string;
  animationDuration?: number;
}

export interface QueuedAlert extends CollectionAlertProps {
  id: string;
}

export interface QueueState {
  queue: QueuedAlert[];
  currentId: string | null;
}

// Gesture Types
export type PanGestureEvent = GestureEvent<PanGestureHandlerEventPayload>;
export type PanGestureStateEvent = PanGestureEvent;

// Animation Types
export interface EndResult {
  finished: boolean;
}

export type EndCallback = (result: EndResult) => void;

export type AnimatedStyleArray = [
  ViewStyle,
  {
    backgroundColor: string;
    paddingTop: number;
    opacity: Animated.Value;
    transform: [
      { translateY: Animated.Value },
      { scale: Animated.Value }
    ];
  }
];

// Component Props
export interface IconButtonProps {
  name: IconName;
  onPress?: () => void;
  testID?: string;
  size?: number;
}

export interface ErrorFallbackProps {
  error: Error;
  resetErrorBoundary: () => void;
}

// Icon Types
export type IconName = 'check-circle' | 'alert' | 'close-circle' | 'information' | 'close' | 'refresh'; 