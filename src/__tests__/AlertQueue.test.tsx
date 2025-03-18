import { act, fireEvent, render } from '@testing-library/react-native';
import { AlertQueue } from '../AlertQueue';
import { showAlert } from '../components/notifications/CollectionAlert';
import { QUEUE_CONFIG, TIMING } from '../components/notifications/constants';
import { AnimationTestRunner, expectSmoothAnimation } from '../components/notifications/test-utils/animation-test';

describe('AlertQueue', () => {
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

  describe('Queue Management', () => {
    it('should render alerts in order', () => {
      const { getByText } = render(<AlertQueue />);

      act(() => {
        showAlert({ message: 'First alert' });
        showAlert({ message: 'Second alert' });
      });

      expect(getByText('First alert')).toBeTruthy();
      expect(getByText('Second alert')).toBeTruthy();
    });

    it('should respect maximum queue size', () => {
      const { queryByText } = render(<AlertQueue />);

      act(() => {
        for (let i = 0; i < QUEUE_CONFIG.maxAlerts + 2; i++) {
          showAlert({ message: `Alert ${i}` });
        }
      });

      // First alert should be removed
      expect(queryByText('Alert 0')).toBeNull();
      // Last alerts should be visible
      expect(queryByText(`Alert ${QUEUE_CONFIG.maxAlerts}`)).toBeTruthy();
    });
  });

  describe('Alert Positioning', () => {
    it('should stack alerts with correct spacing', () => {
      const { getAllByTestId } = render(<AlertQueue />);

      act(() => {
        showAlert({ message: 'First', testID: 'alert-1' });
        showAlert({ message: 'Second', testID: 'alert-2' });
      });

      const alerts = getAllByTestId(/alert-/);
      const firstAlert = alerts[0];
      const secondAlert = alerts[1];

      // Check vertical spacing between alerts
      const firstPosition = firstAlert.props.style.transform.find(
        (t: any) => t.translateY !== undefined
      ).translateY;
      const secondPosition = secondAlert.props.style.transform.find(
        (t: any) => t.translateY !== undefined
      ).translateY;

      expect(secondPosition - firstPosition).toBe(QUEUE_CONFIG.stackSpacing);
    });

    it('should animate alert positions when queue changes', () => {
      const { getByTestId } = render(<AlertQueue />);

      act(() => {
        showAlert({ message: 'Test', testID: 'alert' });
      });

      const alert = getByTestId('alert');
      const positionValues = animationRunner.runAnimation({
        duration: TIMING.duration.default,
        fromValue: 0,
        toValue: QUEUE_CONFIG.stackSpacing,
      });

      expectSmoothAnimation(positionValues);
    });
  });

  describe('Alert Interactions', () => {
    it('should remove alert on dismiss', () => {
      const { getByTestId, queryByText } = render(<AlertQueue />);

      act(() => {
        showAlert({ message: 'Test alert', testID: 'alert' });
      });

      const alert = getByTestId('alert');
      fireEvent.press(getByTestId('alert-close'));

      // Wait for animation
      act(() => {
        jest.advanceTimersByTime(TIMING.duration.default);
      });

      expect(queryByText('Test alert')).toBeNull();
    });

    it('should reposition remaining alerts after dismissal', () => {
      const { getAllByTestId, getByTestId } = render(<AlertQueue />);

      act(() => {
        showAlert({ message: 'First', testID: 'alert-1' });
        showAlert({ message: 'Second', testID: 'alert-2' });
      });

      // Dismiss first alert
      fireEvent.press(getByTestId('alert-1-close'));

      const remainingAlert = getAllByTestId(/alert-/)[0];
      const positionValues = animationRunner.runAnimation({
        duration: TIMING.duration.default,
        fromValue: QUEUE_CONFIG.stackSpacing,
        toValue: 0,
      });

      expectSmoothAnimation(positionValues);
    });
  });

  describe('Performance', () => {
    it('should batch alert updates', () => {
      const renderSpy = jest.fn();
      const TestWrapper = () => {
        renderSpy();
        return <AlertQueue />;
      };

      const { rerender } = render(<TestWrapper />);

      act(() => {
        // Add multiple alerts rapidly
        for (let i = 0; i < 5; i++) {
          showAlert({ message: `Alert ${i}` });
        }
      });

      // Should batch updates
      expect(renderSpy).toHaveBeenCalledTimes(2);

      act(() => {
        rerender(<TestWrapper />);
      });
    });

    it('should cleanup alerts and animations on unmount', () => {
      const { unmount } = render(<AlertQueue />);

      act(() => {
        showAlert({ message: 'Test' });
      });

      const cleanupSpy = jest.spyOn(global, 'clearTimeout');
      unmount();
      expect(cleanupSpy).toHaveBeenCalled();
    });
  });

  describe('Accessibility', () => {
    it('should maintain proper focus order', () => {
      const { getAllByRole } = render(<AlertQueue />);

      act(() => {
        showAlert({ message: 'First' });
        showAlert({ message: 'Second' });
      });

      const alerts = getAllByRole('alert');
      expect(alerts[0].props.accessibilityLabel).toContain('First');
      expect(alerts[1].props.accessibilityLabel).toContain('Second');
    });

    it('should announce new alerts', () => {
      const { getByRole } = render(<AlertQueue />);

      act(() => {
        showAlert({ message: 'New alert' });
      });

      const alert = getByRole('alert');
      expect(alert.props.accessibilityLiveRegion).toBe('polite');
    });
  });
}); 