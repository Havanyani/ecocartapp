import { Animated } from 'react-native';
import { ANIMATION_CONFIG, ANIMATION_PRESETS } from './constants';
import type { CollectionAlertProps, IconName, QueuedAlert } from './types';

// Queue management
let alertQueue: QueuedAlert[] = [];
let currentAlertId: string | null = null;

export function showAlert(props: CollectionAlertProps) {
  const id = Math.random().toString(36).substr(2, 9);
  const alert = { ...props, id };
  
  alertQueue.push(alert);
  if (alertQueue.length > QUEUE_CONFIG.maxAlerts) {
    alertQueue.shift();
  }
  
  if (!currentAlertId) {
    currentAlertId = id;
  }
  
  return id;
}

export function getQueueState() {
  return {
    queue: alertQueue,
    currentId: currentAlertId,
  };
}

// Animation utilities
export function cleanupAnimatedValues(values: Animated.Value[]) {
  values.forEach(value => {
    value.stopAnimation();
    value.removeAllListeners();
  });
}

export function createAnimation(
  value: Animated.Value,
  preset: typeof ANIMATION_PRESETS[keyof typeof ANIMATION_PRESETS],
  config = ANIMATION_CONFIG.spring
) {
  if ('duration' in preset) {
    return Animated.timing(value, {
      toValue: preset.to,
      duration: preset.duration,
      useNativeDriver: true,
    });
  }
  return Animated.spring(value, {
    toValue: preset.to,
    ...config,
  });
}

// Icon utilities
export function getIcon(type: CollectionAlertProps['type']): IconName {
  switch (type) {
    case 'success': return 'check-circle';
    case 'warning': return 'alert';
    case 'error': return 'close-circle';
    default: return 'information';
  }
} 