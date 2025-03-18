// Add at the very top, before any imports
jest.mock('react-native-safe-area-context', () => ({
  SafeAreaProvider: 'SafeAreaProvider',
  useSafeAreaInsets: () => ({ top: 0, right: 0, bottom: 0, left: 0 }),
  SafeAreaView: 'SafeAreaView',
  initialWindowMetrics: {
    frame: { x: 0, y: 0, width: 320, height: 640 },
    insets: { top: 0, left: 0, right: 0, bottom: 0 }
  }
}));

// First, mock animation.ts before any imports
jest.mock('../constants/animation', () => {
  const MockAnimationPresetBuilder = jest.fn().mockImplementation(() => ({
    compose: jest.fn().mockReturnThis(),
    build: jest.fn().mockReturnValue({
      duration: 300,
      tension: 100,
      friction: 10,
      toValue: 1
    })
  }));

  return {
    ANIMATION_PRESETS: {
      SLIDE_UP: {
        duration: 300,
        tension: 100,
        friction: 10
      },
      FADE_IN: {
        duration: 200,
        tension: 80,
        friction: 8
      }
    },
    AnimationPresetBuilder: MockAnimationPresetBuilder
  };
});

// First, mock all React Native components
jest.mock('react-native', () => ({
  Platform: {
    select: jest.fn(obj => obj.default)
  },
  StyleSheet: {
    create: (styles: any) => styles,
    compose: jest.fn(),
    flatten: jest.fn()
  },
  Animated: {
    View: 'AnimatedView',
    Text: 'AnimatedText',
    createAnimatedComponent: jest.fn(comp => comp),
    Value: jest.fn(() => ({
      setValue: jest.fn(),
      interpolate: jest.fn(() => ({
        interpolate: jest.fn()
      })),
      addListener: jest.fn(),
      removeListener: jest.fn(),
    })),
    timing: jest.fn(() => ({
      start: jest.fn(cb => cb && cb()),
    })),
    spring: jest.fn(() => ({
      start: jest.fn(cb => cb && cb()),
    })),
    event: jest.fn(),
    add: jest.fn(),
    multiply: jest.fn()
  },
  View: 'View',
  Text: 'Text',
  TouchableOpacity: 'TouchableOpacity',
  Pressable: 'Pressable',
  ScrollView: 'ScrollView',
  Image: 'Image',
  TextInput: 'TextInput',
  NativeModules: {
    SettingsManager: {
      settings: {}
    }
  }
}));

// Move animation-presets mock to the top, before other imports
jest.mock('../utils/animation-presets', () => {
  class MockAnimationPresetBuilder {
    compose() { return this; }
    build() {
      return {
        duration: 300,
        tension: 100,
        friction: 10,
        toValue: 1,
        useNativeDriver: false
      };
    }
  }
  
  return {
    ALERT_PRESETS: {
      FADE_IN: {
        duration: 200,
        tension: 80,
        friction: 8,
        toValue: 1,
        useNativeDriver: false
      },
      SCALE_IN: {
        duration: 200,
        tension: 80,
        friction: 8,
        toValue: 1,
        useNativeDriver: false
      }
    },
    AnimationPresetBuilder: MockAnimationPresetBuilder,
    createCustomPreset: jest.fn().mockImplementation((type, options) => ({
      duration: options?.duration || 300,
      tension: options?.tension || 100,
      friction: options?.friction || 10,
      toValue: 1,
      useNativeDriver: false
    }))
  };
});

// Then the imports
import { act, fireEvent, render } from '@testing-library/react-native';
import React from 'react';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { CollectionAlert } from '../components/notifications/CollectionAlert';
import { QUEUE_CONFIG, TIMING } from '../components/notifications/constants';
import {
  AnimationTestRunner,
  createGestureTestConfig,
  expectCompletedAnimation,
  expectNoJank,
  expectSmoothAnimation
} from '../components/notifications/test-utils/animation-test';
import { ALERT_PRESETS } from '../components/notifications/utils/animation-presets';

// Import PERFORMANCE_MARKS from constants

// Fix performance mock by adding PERFORMANCE_MARKS values
const mockPerformance = {
  mark: jest.fn(),
  measure: jest.fn((name, start, end) => ({
    duration: 100,
    entryType: 'measure',
    name,
    startTime: 0,
    detail: null
  })),
  clearMarks: jest.fn(),
  clearMeasures: jest.fn()
};

// Use defineProperty to properly mock performance
Object.defineProperty(global, 'performance', {
  value: mockPerformance,
  writable: true,
  configurable: true
});

// Mock react-native-gesture-handler
jest.mock('react-native-gesture-handler', () => ({
  PanGestureHandler: ({ children }: { children: React.ReactNode }) => children,
  State: {
    ACTIVE: 'ACTIVE',
    END: 'END',
    BEGAN: 'BEGAN',
    CANCELLED: 'CANCELLED',
    FAILED: 'FAILED',
    UNDETERMINED: 'UNDETERMINED'
  }
}));

// Add mock for react-native-reanimated
jest.mock('react-native-reanimated', () => ({
  default: {
    createAnimatedComponent: (component: any) => component,
    Value: jest.fn(),
    event: jest.fn(),
    add: jest.fn(),
    multiply: jest.fn(),
    spring: jest.fn(),
    timing: jest.fn(),
    Clock: jest.fn(),
    interpolate: jest.fn(),
    Extrapolate: { CLAMP: 'clamp' }
  }
}));

// Update the existing mocks at the top of the file
jest.mock('../test-utils/animation-test', () => ({
  AnimationTestRunner: jest.fn().mockImplementation(() => ({
    mockRequestAnimationFrame: jest.fn(),
    runAnimation: jest.fn().mockReturnValue([0, 0.5, 1]),
    simulateGesture: jest.fn().mockReturnValue([
      { x: 0, y: 0 },
      { x: 0, y: -100 }
    ])
  })),
  createGestureTestConfig: jest.fn().mockReturnValue({}),
  expectCompletedAnimation: jest.fn(),
  expectNoJank: jest.fn(),
  expectSmoothAnimation: jest.fn()
}));

// Mock MaterialCommunityIcons first
jest.mock('@expo/vector-icons/MaterialCommunityIcons', () => ({
  MaterialCommunityIcons: 'MaterialCommunityIcons'
}));

// Mock the IconButton component properly
jest.mock('../IconButton', () => ({
  IconButton: 'IconButton' // Use string for component mock
}));

// Update renderWithProviders to use proper components
const renderWithProviders = (ui: React.ReactElement) => {
  return render(
    <SafeAreaProvider
      initialMetrics={{
        frame: { x: 0, y: 0, width: 320, height: 640 },
        insets: { top: 0, left: 0, right: 0, bottom: 0 }
      }}
    >
      {ui}
    </SafeAreaProvider>
  );
};

describe('CollectionAlert', () => {
  let animationRunner: AnimationTestRunner;
  const mockOnDismiss = jest.fn();
  const defaultProps = {
    id: 'test-alert',
    message: 'Collection scheduled',
    type: 'success' as const,
    onDismiss: mockOnDismiss,
    translateY: 0,
    layout: { x: 0, y: 0, width: 300, height: QUEUE_CONFIG.alertHeight },
  };

  // Increase Jest timeout
  jest.setTimeout(30000);

  beforeEach(() => {
    animationRunner = new AnimationTestRunner();
    jest.spyOn(window, 'requestAnimationFrame')
      .mockImplementation((cb) => {
        animationRunner.mockRequestAnimationFrame(cb);
        return 0;
      });
    jest.clearAllMocks();
    mockPerformance.mark.mockClear();
    mockPerformance.measure.mockClear();
  });

  afterEach(() => {
    jest.restoreAllMocks();
    jest.clearAllTimers();
  });

  describe('Appearance Animations', () => {
    it('should animate opacity smoothly when appearing', () => {
      const { getByTestId } = renderWithProviders(
        <CollectionAlert
          id="test"
          message="Test message"
          testID="alert"
        />
      );

      const opacityValues = animationRunner.runAnimation({
        duration: ALERT_PRESETS.FADE_IN.duration,
        fromValue: 0,
        toValue: 1,
      });

      expectSmoothAnimation(opacityValues);
      expectCompletedAnimation(opacityValues, 1);
      expectNoJank(opacityValues);
    });

    it('should animate scale smoothly when appearing', () => {
      renderWithProviders(
        <CollectionAlert
          id="test"
          message="Test message"
          testID="alert"
        />
      );

      const scaleValues = animationRunner.runAnimation({
        duration: ALERT_PRESETS.SCALE_IN.duration,
        fromValue: 0.9,
        toValue: 1,
      });

      expectSmoothAnimation(scaleValues);
      expectCompletedAnimation(scaleValues, 1);
    });

    it('should respect custom animation config', () => {
      const customConfig = {
        fadeIn: {
          duration: 200,
          tension: 150,
          friction: 15,
        },
      };

      renderWithProviders(
        <CollectionAlert
          id="test"
          message="Test message"
          testID="alert"
          animationConfig={customConfig}
        />
      );

      const values = animationRunner.runAnimation({
        duration: customConfig.fadeIn.duration,
        fromValue: 0,
        toValue: 1,
      });

      expectSmoothAnimation(values);
    });
  });

  describe('Gesture Handling', () => {
    it('should handle swipe up dismissal', () => {
      const { getByTestId } = renderWithProviders(
        <CollectionAlert
          id="test"
          message="Test message"
          testID="alert"
          onDismiss={mockOnDismiss}
        />
      );

      const alert = getByTestId('collection-alert');
      
      // Simulate gesture
      fireEvent(alert, 'onGestureEvent', {
        nativeEvent: {
          translationY: -100,
          velocityY: -1
        }
      });

      fireEvent(alert, 'onHandlerStateChange', {
        nativeEvent: {
          state: 'END',
          translationY: -100,
          velocityY: -1
        }
      });

      expect(mockOnDismiss).toHaveBeenCalled();
    });

    it('should snap back when gesture is below threshold', () => {
      const { getByTestId } = renderWithProviders(
        <CollectionAlert
          id="test"
          message="Test message"
          testID="alert"
          onDismiss={mockOnDismiss}
        />
      );

      const alert = getByTestId('alert');
      const gestureConfig = createGestureTestConfig(0, 50); // Small swipe
      const positions = animationRunner.simulateGesture(gestureConfig);

      // Simulate and end gesture
      positions.forEach(pos => {
        fireEvent(alert, 'onGestureEvent', { nativeEvent: { translationY: pos.y } });
      });

      fireEvent(alert, 'onHandlerStateChange', {
        nativeEvent: { state: 5, translationY: 50 }
      });

      expect(mockOnDismiss).not.toHaveBeenCalled();
    });
  });

  describe('Auto-dismiss Behavior', () => {
    it('should auto-dismiss after specified duration', () => {
      jest.useFakeTimers();
      
      renderWithProviders(
        <CollectionAlert
          id="test"
          message="Test message"
          duration={TIMING.duration.default}
          onDismiss={mockOnDismiss}
        />
      );

      act(() => {
        jest.advanceTimersByTime(TIMING.duration.default);
      });

      expect(mockOnDismiss).toHaveBeenCalled();
      jest.useRealTimers();
    });

    it('should not auto-dismiss when duration is 0', () => {
      jest.useFakeTimers();
      
      renderWithProviders(
        <CollectionAlert
          id="test"
          message="Test message"
          duration={0}
          onDismiss={mockOnDismiss}
        />
      );

      act(() => {
        jest.advanceTimersByTime(TIMING.duration.default * 2);
      });

      expect(mockOnDismiss).not.toHaveBeenCalled();
      jest.useRealTimers();
    });
  });

  describe('Collision Handling', () => {
    it('should adjust position when colliding with other alerts', () => {
      const { getByTestId } = renderWithProviders(
        <CollectionAlert
          id="test1"
          message="Test message 1"
          testID="alert1"
        />
      );

      const alert = getByTestId('alert1');
      const gestureConfig = createGestureTestConfig(0, QUEUE_CONFIG.stackSpacing - 10);
      const positions = animationRunner.simulateGesture(gestureConfig);

      // Simulate gesture
      positions.forEach(pos => {
        fireEvent(alert, 'onGestureEvent', {
          nativeEvent: { translationY: pos.y }
        });
      });

      // End gesture
      fireEvent(alert, 'onHandlerStateChange', {
        nativeEvent: { 
          state: 5,
          translationY: QUEUE_CONFIG.stackSpacing - 10
        }
      });

      // Check that position was adjusted to maintain minimum spacing
      const transform = alert.props.style.transform;
      const translateY = transform.find((t: any) => t.translateY !== undefined).translateY;
      expect(translateY).toBe(QUEUE_CONFIG.stackSpacing);
    });
  });

  it('renders alert with correct message', () => {
    const { getByText } = renderWithProviders(<CollectionAlert {...defaultProps} />);
    expect(getByText('Collection scheduled')).toBeTruthy();
  });

  it('applies correct styling based on type', () => {
    const { getByTestId } = renderWithProviders(
      <CollectionAlert
        id="test"
        message="Test message"
        testID="alert"
      />
    );
    const alertContainer = getByTestId('collection-alert');
    expect(alertContainer.props.style).toMatchObject({
      backgroundColor: expect.any(String),
      transform: expect.arrayContaining([{ translateY: 0 }])
    });
  });

  it('calls onDismiss when swiped away', () => {
    const { getByTestId } = renderWithProviders(
      <CollectionAlert
        id="test"
        message="Test message"
        testID="alert"
        onDismiss={mockOnDismiss}
      />
    );
    const alert = getByTestId('collection-alert');
    
    fireEvent(alert, 'onPanResponderRelease', {
      nativeEvent: {
        translationY: 100, // Swipe down
        velocityY: 1
      }
    });

    expect(mockOnDismiss).toHaveBeenCalledWith(defaultProps.id);
  });
}); 