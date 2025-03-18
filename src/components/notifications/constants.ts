export const COLORS = {
  light: {
    success: '#388E3C',
    warning: '#FFA000',
    error: '#D32F2F',
    info: '#1976D2',
    text: '#FFFFFF',
    shadow: 'rgba(0, 0, 0, 0.25)',
  },
  dark: {
    success: '#4CAF50',
    warning: '#FFC107',
    error: '#F44336',
    info: '#2196F3',
    text: '#FFFFFF',
    shadow: 'rgba(0, 0, 0, 0.35)',
  },
} as const;

export const ANIMATION_CONFIG = {
  spring: {
    damping: 20,
    stiffness: 90,
    mass: 0.5,
    useNativeDriver: true,
  },
  gesture: {
    minDistance: 10,
    activeOffsetY: -10,
    dismissThreshold: -50,
    velocityThreshold: 1000,
  },
} as const;

export const QUEUE_CONFIG = {
  maxAlerts: 3,
  stackSpacing: 8,
  alertHeight: 80,
} as const;

export const GESTURE_THRESHOLDS = {
  SWIPE_VELOCITY: 1000,
  SWIPE_DISTANCE: 50,
  SWIPE_DIRECTION: {
    UP: -1,
    DOWN: 1,
  },
} as const;

export const PERFORMANCE_MARKS = {
  MOUNT: 'alert-mount',
  ANIMATION_START: 'alert-animation-start',
  ANIMATION_END: 'alert-animation-end',
} as const;

export const Z_INDEX = {
  alert: 1000,
  error: 1001,
} as const;

export const TIMING = {
  duration: {
    default: 300,
    fast: 200,
    slow: 400,
  },
  delay: {
    short: 100,
    medium: 200,
  },
} as const;

export const ANIMATION_PRESETS = {
  FADE_IN: {
    from: 0,
    to: 1,
    duration: TIMING.duration.default,
  },
  FADE_OUT: {
    from: 1,
    to: 0,
    duration: TIMING.duration.default,
  },
  SCALE_IN: {
    from: 0.9,
    to: 1,
  },
  SCALE_OUT: {
    from: 1,
    to: 0.9,
  },
} as const; 