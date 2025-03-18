import { MutableRefObject } from 'react';

// Form Hook Types
export interface UseFormResult<T> {
  values: T;
  errors: Partial<Record<keyof T, string>>;
  touched: Partial<Record<keyof T, boolean>>;
  isValid: boolean;
  isSubmitting: boolean;
  handleChange: (field: keyof T) => (value: any) => void;
  handleBlur: (field: keyof T) => () => void;
  handleSubmit: (onSubmit: (values: T) => Promise<void>) => () => Promise<void>;
  resetForm: () => void;
  setFieldValue: (field: keyof T, value: any) => void;
  setFieldError: (field: keyof T, error: string) => void;
}

// Animation Hook Types
export interface UseAnimationResult {
  animatedValue: MutableRefObject<number>;
  startAnimation: (toValue: number, duration?: number) => void;
  stopAnimation: () => void;
  resetAnimation: () => void;
  interpolate: (input: number[], output: number[]) => number;
}

// Gesture Hook Types
export interface UseGestureResult {
  panResponder: any;
  isActive: boolean;
  position: { x: number; y: number };
  velocity: { x: number; y: number };
  reset: () => void;
}

// Location Hook Types
export interface UseLocationResult {
  location: {
    latitude: number;
    longitude: number;
    accuracy: number;
  } | null;
  error: string | null;
  isLoading: boolean;
  requestPermission: () => Promise<boolean>;
  startWatching: () => void;
  stopWatching: () => void;
}

// Camera Hook Types
export interface UseCameraResult {
  camera: any;
  isReady: boolean;
  hasPermission: boolean;
  type: 'front' | 'back';
  flashMode: 'on' | 'off' | 'auto';
  takePicture: () => Promise<string>;
  switchCamera: () => void;
  toggleFlash: () => void;
}

// Storage Hook Types
export interface UseStorageResult<T> {
  value: T | null;
  setValue: (value: T) => Promise<void>;
  removeValue: () => Promise<void>;
  isLoading: boolean;
  error: string | null;
}

// Network Hook Types
export interface UseNetworkResult {
  isConnected: boolean;
  isInternetReachable: boolean | null;
  type: string | null;
  details: {
    isConnectionExpensive: boolean | null;
    cellularGeneration: string | null;
  } | null;
}

// Biometrics Hook Types
export interface UseBiometricsResult {
  isAvailable: boolean;
  isEnrolled: boolean;
  supportedTypes: string[];
  authenticate: (options?: {
    promptMessage?: string;
    cancelLabel?: string;
    disableDeviceFallback?: boolean;
    fallbackLabel?: string;
  }) => Promise<boolean>;
}

// Theme Hook Types
export interface UseThemeResult {
  theme: Theme;
  isDark: boolean;
  toggleTheme: () => void;
  colors: Colors;
  typography: Typography;
  spacing: Spacing;
  borderRadius: BorderRadius;
  shadows: Shadows;
}

// Modal Hook Types
export interface UseModalResult {
  isVisible: boolean;
  show: () => void;
  hide: () => void;
  toggle: () => void;
}

// Keyboard Hook Types
export interface UseKeyboardResult {
  keyboardHeight: number;
  isKeyboardVisible: boolean;
  keyboardWillShow: (event: any) => void;
  keyboardWillHide: (event: any) => void;
}

// Scroll Hook Types
export interface UseScrollResult {
  scrollY: MutableRefObject<number>;
  scrollX: MutableRefObject<number>;
  scrollTo: (x: number, y: number, animated?: boolean) => void;
  scrollToTop: (animated?: boolean) => void;
  scrollToBottom: (animated?: boolean) => void;
}

// Dimensions Hook Types
export interface UseDimensionsResult {
  width: number;
  height: number;
  scale: number;
  fontScale: number;
  orientation: 'portrait' | 'landscape';
}

// Focus Hook Types
export interface UseFocusResult {
  isFocused: boolean;
  focus: () => void;
  blur: () => void;
}

// Loading Hook Types
export interface UseLoadingResult {
  isLoading: boolean;
  startLoading: () => void;
  stopLoading: () => void;
  withLoading: <T>(promise: Promise<T>) => Promise<T>;
}

// Error Hook Types
export interface UseErrorResult {
  error: string | null;
  setError: (error: string | null) => void;
  clearError: () => void;
  withErrorHandling: <T>(promise: Promise<T>) => Promise<T>;
}

// Validation Hook Types
export interface UseValidationResult<T> {
  validate: (values: T) => Record<keyof T, string>;
  isValid: boolean;
  errors: Record<keyof T, string>;
  touched: Record<keyof T, boolean>;
  setFieldTouched: (field: keyof T) => void;
  setFieldError: (field: keyof T, error: string) => void;
}

// Debounce Hook Types
export interface UseDebounceResult<T> {
  debouncedValue: T;
  setValue: (value: T) => void;
}

// Throttle Hook Types
export interface UseThrottleResult<T> {
  throttledValue: T;
  setValue: (value: T) => void;
}

// Interval Hook Types
export interface UseIntervalResult {
  start: () => void;
  stop: () => void;
  isRunning: boolean;
}

// Timeout Hook Types
export interface UseTimeoutResult {
  start: () => void;
  stop: () => void;
  isRunning: boolean;
}

// Previous Hook Types
export interface UsePreviousResult<T> {
  previousValue: T | undefined;
  currentValue: T;
}

// Mounted Hook Types
export interface UseMountedResult {
  isMounted: boolean;
  unmount: () => void;
}

// Update Effect Hook Types
export interface UseUpdateEffectResult {
  isFirstRender: boolean;
}

// Deep Compare Effect Hook Types
export interface UseDeepCompareEffectResult {
  isEqual: boolean;
}

// Media Query Hook Types
export interface UseMediaQueryResult {
  matches: boolean;
  mediaQuery: string;
}

// Intersection Observer Hook Types
export interface UseIntersectionObserverResult {
  isIntersecting: boolean;
  observerRef: MutableRefObject<IntersectionObserver | null>;
  targetRef: MutableRefObject<Element | null>;
}

// Resize Observer Hook Types
export interface UseResizeObserverResult {
  dimensions: { width: number; height: number };
  observerRef: MutableRefObject<ResizeObserver | null>;
  targetRef: MutableRefObject<Element | null>;
}

// Mutation Observer Hook Types
export interface UseMutationObserverResult {
  mutations: MutationRecord[];
  observerRef: MutableRefObject<MutationObserver | null>;
  targetRef: MutableRefObject<Element | null>;
} 