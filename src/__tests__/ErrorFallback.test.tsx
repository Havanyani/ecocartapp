import { fireEvent, render } from '@testing-library/react-native';
import { ErrorFallback } from '../components/notifications/ErrorFallback';
import { AnimationTestRunner, expectSmoothAnimation } from '../components/notifications/test-utils/animation-test';
import { ALERT_PRESETS } from '../components/notifications/utils/animation-presets';

describe('ErrorFallback', () => {
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
    const mockError = new Error('Test error');
    const mockReset = jest.fn();

    it('should render error message correctly', () => {
      const { getByText, getByTestId } = render(
        <ErrorFallback
          error={mockError}
          resetErrorBoundary={mockReset}
          testID="error-fallback"
        />
      );

      expect(getByText('Test error')).toBeTruthy();
      expect(getByTestId('error-icon')).toBeTruthy();
    });

    it('should apply error styles', () => {
      const { getByTestId } = render(
        <ErrorFallback
          error={mockError}
          resetErrorBoundary={mockReset}
          testID="error-fallback"
        />
      );

      const container = getByTestId('error-fallback');
      expect(container.props.style).toMatchObject({
        backgroundColor: expect.any(String),
        borderRadius: expect.any(Number),
      });
    });
  });

  describe('Error Handling', () => {
    it('should handle different error types', () => {
      const errors = [
        new TypeError('Type error'),
        new ReferenceError('Reference error'),
        { message: 'Custom error' },
        'String error',
      ];

      errors.forEach(error => {
        const { getByText } = render(
          <ErrorFallback
            error={error}
            resetErrorBoundary={jest.fn()}
          />
        );

        expect(getByText(error.toString())).toBeTruthy();
      });
    });

    it('should truncate long error messages', () => {
      const longError = new Error('x'.repeat(200));
      const { getByTestId } = render(
        <ErrorFallback
          error={longError}
          resetErrorBoundary={jest.fn()}
          testID="error-fallback"
        />
      );

      const message = getByTestId('error-message');
      expect(message.props.numberOfLines).toBeDefined();
    });
  });

  describe('Interaction Animations', () => {
    it('should animate on appearance', () => {
      render(
        <ErrorFallback
          error={new Error('Test')}
          resetErrorBoundary={jest.fn()}
          testID="error-fallback"
        />
      );

      const opacityValues = animationRunner.runAnimation({
        duration: ALERT_PRESETS.FADE_IN.duration,
        fromValue: 0,
        toValue: 1,
      });

      expectSmoothAnimation(opacityValues);
    });

    it('should animate retry button on press', () => {
      const { getByTestId } = render(
        <ErrorFallback
          error={new Error('Test')}
          resetErrorBoundary={jest.fn()}
          testID="error-fallback"
        />
      );

      const button = getByTestId('retry-button');
      fireEvent.press(button);

      const scaleValues = animationRunner.runAnimation({
        duration: ALERT_PRESETS.SCALE_OUT.duration,
        fromValue: 1,
        toValue: 0.95,
      });

      expectSmoothAnimation(scaleValues);
    });
  });

  describe('Accessibility', () => {
    it('should have correct accessibility properties', () => {
      const { getByTestId } = render(
        <ErrorFallback
          error={new Error('Test')}
          resetErrorBoundary={jest.fn()}
          testID="error-fallback"
        />
      );

      const container = getByTestId('error-fallback');
      const retryButton = getByTestId('retry-button');

      expect(container.props.accessibilityRole).toBe('alert');
      expect(container.props.accessibilityLiveRegion).toBe('assertive');
      expect(retryButton.props.accessibilityLabel).toBe('Retry');
    });
  });

  describe('Error Recovery', () => {
    it('should call resetErrorBoundary on retry', () => {
      const resetMock = jest.fn();
      const { getByTestId } = render(
        <ErrorFallback
          error={new Error('Test')}
          resetErrorBoundary={resetMock}
          testID="error-fallback"
        />
      );

      const retryButton = getByTestId('retry-button');
      fireEvent.press(retryButton);
      expect(resetMock).toHaveBeenCalledTimes(1);
    });

    it('should handle multiple retry attempts', () => {
      const resetMock = jest.fn();
      const { getByTestId } = render(
        <ErrorFallback
          error={new Error('Test')}
          resetErrorBoundary={resetMock}
          testID="error-fallback"
        />
      );

      const retryButton = getByTestId('retry-button');
      fireEvent.press(retryButton);
      fireEvent.press(retryButton);
      fireEvent.press(retryButton);

      expect(resetMock).toHaveBeenCalledTimes(3);
    });
  });

  describe('Performance', () => {
    it('should not re-render on unchanged props', () => {
      const renderSpy = jest.fn();
      const error = new Error('Test');
      const reset = jest.fn();

      const TestWrapper = () => {
        renderSpy();
        return (
          <ErrorFallback
            error={error}
            resetErrorBoundary={reset}
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
  });
}); 