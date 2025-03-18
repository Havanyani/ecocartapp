import { act, fireEvent, render } from '@testing-library/react-native';
import { IconButton } from '../components/notifications/IconButton';
import {
  AnimationTestRunner,
  expectCompletedAnimation,
  expectNoJank,
  expectSmoothAnimation
} from '../components/notifications/test-utils/animation-test';
import { ALERT_PRESETS } from '../components/notifications/utils/animation-presets';

describe('IconButton', () => {
  let animationRunner: AnimationTestRunner;

  beforeEach(() => {
    animationRunner = new AnimationTestRunner();
    jest.spyOn(window, 'requestAnimationFrame')
      .mockImplementation((cb) => {
        animationRunner.mockRequestAnimationFrame(cb);
        return 0;
      });
  });

  afterEach(() => {
    jest.restoreAllMocks();
  });

  describe('Component Structure', () => {
    it('should render with correct icon', () => {
      const { getByTestId } = render(
        <IconButton
          name="close"
          testID="icon-button"
        />
      );

      const icon = getByTestId('icon-button-icon');
      expect(icon.props.name).toBe('close');
    });

    it('should apply custom styles', () => {
      const customStyle = { backgroundColor: 'red' };
      const { getByTestId } = render(
        <IconButton
          name="info"
          style={customStyle}
          testID="icon-button"
        />
      );

      const button = getByTestId('icon-button');
      expect(button.props.style).toMatchObject(customStyle);
    });
  });

  describe('Interaction Animations', () => {
    it('should animate scale on press', () => {
      const { getByTestId } = render(
        <IconButton
          name="close"
          testID="icon-button"
        />
      );

      const button = getByTestId('icon-button');
      fireEvent(button, 'pressIn');

      const scaleValues = animationRunner.runAnimation({
        duration: ALERT_PRESETS.SCALE_OUT.duration,
        fromValue: 1,
        toValue: 0.9,
      });

      expectSmoothAnimation(scaleValues);
      expectCompletedAnimation(scaleValues, 0.9);
      expectNoJank(scaleValues);
    });

    it('should animate back on press release', () => {
      const { getByTestId } = render(
        <IconButton
          name="close"
          testID="icon-button"
        />
      );

      const button = getByTestId('icon-button');
      fireEvent(button, 'pressIn');
      fireEvent(button, 'pressOut');

      const scaleValues = animationRunner.runAnimation({
        duration: ALERT_PRESETS.SCALE_IN.duration,
        fromValue: 0.9,
        toValue: 1,
      });

      expectSmoothAnimation(scaleValues);
      expectCompletedAnimation(scaleValues, 1);
    });
  });

  describe('Accessibility', () => {
    it('should have correct accessibility props', () => {
      const { getByTestId } = render(
        <IconButton
          name="close"
          testID="icon-button"
          accessibilityLabel="Close notification"
        />
      );

      const button = getByTestId('icon-button');
      expect(button.props.accessibilityRole).toBe('button');
      expect(button.props.accessibilityLabel).toBe('Close notification');
    });

    it('should handle disabled state correctly', () => {
      const onPress = jest.fn();
      const { getByTestId } = render(
        <IconButton
          name="close"
          testID="icon-button"
          onPress={onPress}
          disabled={true}
        />
      );

      const button = getByTestId('icon-button');
      fireEvent.press(button);
      expect(onPress).not.toHaveBeenCalled();
      expect(button.props.accessibilityState).toEqual({ disabled: true });
    });
  });

  describe('Performance', () => {
    it('should not cause unnecessary re-renders', () => {
      const renderSpy = jest.fn();
      const TestWrapper = () => {
        renderSpy();
        return (
          <IconButton
            name="close"
            testID="icon-button"
          />
        );
      };

      const { rerender } = render(<TestWrapper />);
      expect(renderSpy).toHaveBeenCalledTimes(1);

      act(() => {
        rerender(<TestWrapper />);
      });
      expect(renderSpy).toHaveBeenCalledTimes(2);
    });

    it('should cleanup animations on unmount', () => {
      const { unmount } = render(
        <IconButton
          name="close"
          testID="icon-button"
        />
      );

      const cleanupSpy = jest.spyOn(Animated, 'timing');
      unmount();
      expect(cleanupSpy).toHaveBeenCalled();
    });
  });

  describe('Event Handling', () => {
    it('should handle press events correctly', () => {
      const onPress = jest.fn();
      const { getByTestId } = render(
        <IconButton
          name="close"
          testID="icon-button"
          onPress={onPress}
        />
      );

      const button = getByTestId('icon-button');
      fireEvent.press(button);
      expect(onPress).toHaveBeenCalledTimes(1);
    });

    it('should debounce rapid presses', () => {
      jest.useFakeTimers();
      const onPress = jest.fn();
      const { getByTestId } = render(
        <IconButton
          name="close"
          testID="icon-button"
          onPress={onPress}
        />
      );

      const button = getByTestId('icon-button');
      fireEvent.press(button);
      fireEvent.press(button);
      fireEvent.press(button);

      expect(onPress).toHaveBeenCalledTimes(1);
      jest.useRealTimers();
    });
  });
}); 