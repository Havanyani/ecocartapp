import * as Sentry from '@sentry/react-native';
import { act, fireEvent, render } from '@testing-library/react-native';
import React from 'react';
import { I18nManager, Text } from 'react-native';
import { ErrorBoundary } from '../../../../src/components/ui/ErrorBoundary';
import { useTheme } from '../../../../src/contexts/ThemeContext';
import i18n from '../../../../src/utils/i18n';

// Mock useTheme hook
jest.mock('../../../../src/contexts/ThemeContext', () => ({
  useTheme: jest.fn()
}));

// Mock i18n
jest.mock('../../../../src/utils/i18n', () => ({
  t: (key: string, options?: { count?: number; max?: number }) => ({
    'error.defaultMessage': 'Something went wrong',
    'error.tryAgain': 'Try Again',
    'error.retrying': 'Retrying...',
    'error.tryAgainHint': 'Attempts to recover from the error by resetting the error state',
    'error.multipleErrors': 'Multiple errors occurred',
    'error.multipleErrorsHint': 'The app is experiencing repeated issues. Please try again later.',
    'error.maxRetries': 'Maximum retry attempts reached',
    'error.maxRetriesHint': 'Please try again later or contact support',
    'error.retryCount': `Retry attempt ${options?.count} of ${options?.max}`
  })[key] || key,
  locale: 'en'
}));

// Mock Ionicons
jest.mock('@expo/vector-icons', () => ({
  Ionicons: ({ testID, name, size, color, style }: any) => (
    <Text testID={testID} style={style}>{name}</Text>
  )
}));

// Mock react-native-reanimated
jest.mock('react-native-reanimated', () => {
  const View = require('react-native').View;
  return {
    FadeIn: {
      duration: () => ({
        build: () => ({
          initialValues: {},
          animations: {},
          callback: jest.fn()
        })
      })
    },
    FadeOut: {
      duration: () => ({
        build: () => ({
          initialValues: {},
          animations: {},
          callback: jest.fn()
        })
      })
    },
    SlideInLeft: {
      duration: () => ({
        delay: () => ({
          build: () => ({
            initialValues: {},
            animations: {},
            callback: jest.fn()
          })
        })
      })
    },
    SlideInRight: {
      duration: () => ({
        delay: () => ({
          build: () => ({
            initialValues: {},
            animations: {},
            callback: jest.fn()
          })
        })
      })
    },
    SlideOutLeft: {
      duration: () => ({
        build: () => ({
          initialValues: {},
          animations: {},
          callback: jest.fn()
        })
      })
    },
    SlideOutRight: {
      duration: () => ({
        build: () => ({
          initialValues: {},
          animations: {},
          callback: jest.fn()
        })
      })
    },
    View: View,
    default: {
      createAnimatedComponent: (component: any) => component,
      Value: jest.fn(),
      timing: jest.fn(),
    }
  };
});

// Mock Sentry
jest.mock('@sentry/react-native', () => ({
  withScope: jest.fn((callback) => callback({
    setExtra: jest.fn(),
    setTag: jest.fn()
  })),
  captureException: jest.fn()
}));

const mockTheme = {
  colors: {
    background: '#FFFFFF',
    error: '#FF0000',
    primary: '#0000FF'
  }
};

describe('ErrorBoundary', () => {
  beforeEach(() => {
    (useTheme as jest.Mock).mockReturnValue({ theme: mockTheme });
    jest.spyOn(console, 'error').mockImplementation(() => {});
    // Reset RTL between tests
    I18nManager.isRTL = false;
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('renders children when there is no error', () => {
    const { getByText } = render(
      <ErrorBoundary>
        <Text>Test Content</Text>
      </ErrorBoundary>
    );

    expect(getByText('Test Content')).toBeDefined();
  });

  it('renders default error UI when there is an error', () => {
    const ThrowError = () => {
      throw new Error('Test error');
    };

    const { getByTestId } = render(
      <ErrorBoundary>
        <ThrowError />
      </ErrorBoundary>
    );

    expect(getByTestId('error-boundary-container')).toBeDefined();
    expect(getByTestId('error-boundary-message')).toBeDefined();
    expect(getByTestId('error-boundary-retry-button')).toBeDefined();
  });

  it('renders custom fallback when provided', () => {
    const CustomFallback = ({ error, resetError }: { error: Error; resetError: () => void }) => (
      <Text testID="custom-fallback">Custom Error: {error.message}</Text>
    );

    const ThrowError = () => {
      throw new Error('Custom test error');
    };

    const { getByTestId, getByText } = render(
      <ErrorBoundary fallback={CustomFallback}>
        <ThrowError />
      </ErrorBoundary>
    );

    expect(getByTestId('custom-fallback')).toBeDefined();
    expect(getByText('Custom Error: Custom test error')).toBeDefined();
  });

  it('resets error state when retry button is pressed', () => {
    const ThrowError = () => {
      throw new Error('Test error');
    };

    const { getByTestId, queryByTestId } = render(
      <ErrorBoundary>
        <ThrowError />
      </ErrorBoundary>
    );

    expect(getByTestId('error-boundary-container')).toBeDefined();

    // Click retry button
    fireEvent.press(getByTestId('error-boundary-retry-button'));

    // Error boundary should try to re-render children
    // Note: In a real app, you might want to prevent the error from happening again
    expect(getByTestId('error-boundary-container')).toBeDefined();
  });

  it('applies theme styles correctly', () => {
    const ThrowError = () => {
      throw new Error('Test error');
    };

    const { getByTestId } = render(
      <ErrorBoundary>
        <ThrowError />
      </ErrorBoundary>
    );

    const container = getByTestId('error-boundary-container');
    const message = getByTestId('error-boundary-message');
    const button = getByTestId('error-boundary-retry-button');

    expect(container.props.style).toContainEqual(
      expect.objectContaining({
        backgroundColor: mockTheme.colors.background
      })
    );

    expect(message.props.style).toContainEqual(
      expect.objectContaining({
        color: mockTheme.colors.error
      })
    );

    expect(button.props.style).toContainEqual(
      expect.objectContaining({
        backgroundColor: mockTheme.colors.primary
      })
    );
  });

  it('handles missing theme gracefully', () => {
    (useTheme as jest.Mock).mockReturnValue({ theme: undefined });

    const ThrowError = () => {
      throw new Error('Test error');
    };

    const { getByTestId } = render(
      <ErrorBoundary>
        <ThrowError />
      </ErrorBoundary>
    );

    // Should render without crashing
    expect(getByTestId('error-boundary-container')).toBeDefined();
  });

  it('displays custom error message when provided', () => {
    const customError = new Error('Custom error message');
    const ThrowError = () => {
      throw customError;
    };

    const { getByTestId, getByText } = render(
      <ErrorBoundary>
        <ThrowError />
      </ErrorBoundary>
    );

    expect(getByText('Custom error message')).toBeDefined();
  });

  it('falls back to default message when error has no message', () => {
    const customError = new Error();
    const ThrowError = () => {
      throw customError;
    };

    const { getByTestId, getByText } = render(
      <ErrorBoundary>
        <ThrowError />
      </ErrorBoundary>
    );

    expect(getByText('Something went wrong')).toBeDefined();
  });

  describe('i18n Support', () => {
    it('uses i18n for default error message', () => {
      const error = new Error();
      const ThrowError = () => {
        throw error;
      };

      const { getByText } = render(
        <ErrorBoundary>
          <ThrowError />
        </ErrorBoundary>
      );

      expect(getByText(i18n.t('error.defaultMessage'))).toBeDefined();
    });

    it('uses i18n for button text', () => {
      const ThrowError = () => {
        throw new Error('Test error');
      };

      const { getByText } = render(
        <ErrorBoundary>
          <ThrowError />
        </ErrorBoundary>
      );

      expect(getByText(i18n.t('error.tryAgain'))).toBeDefined();
    });

    it('uses i18n for accessibility labels', () => {
      const ThrowError = () => {
        throw new Error('Test error');
      };

      const { getByTestId } = render(
        <ErrorBoundary>
          <ThrowError />
        </ErrorBoundary>
      );

      const button = getByTestId('error-boundary-retry-button');
      expect(button.props.accessibilityLabel).toBe(i18n.t('error.tryAgain'));
      expect(button.props.accessibilityHint).toBe(i18n.t('error.tryAgainHint'));
    });
  });

  describe('RTL Support', () => {
    beforeEach(() => {
      I18nManager.isRTL = true;
    });

    afterEach(() => {
      I18nManager.isRTL = false;
    });

    it('applies correct RTL layout direction to container', () => {
      const ThrowError = () => {
        throw new Error('Test error');
      };

      const { getByTestId } = render(
        <ErrorBoundary>
          <ThrowError />
        </ErrorBoundary>
      );

      const container = getByTestId('error-boundary-container');
      expect(container.props.style).toContainEqual(
        expect.objectContaining({
          direction: 'rtl'
        })
      );
    });

    it('applies correct RTL text direction to error message', () => {
      const ThrowError = () => {
        throw new Error('Test error');
      };

      const { getByTestId } = render(
        <ErrorBoundary>
          <ThrowError />
        </ErrorBoundary>
      );

      const message = getByTestId('error-boundary-message');
      expect(message.props.style).toContainEqual(
        expect.objectContaining({
          writingDirection: 'rtl'
        })
      );
    });

    it('applies correct RTL layout to retry button', () => {
      const ThrowError = () => {
        throw new Error('Test error');
      };

      const { getByTestId } = render(
        <ErrorBoundary>
          <ThrowError />
        </ErrorBoundary>
      );

      const button = getByTestId('error-boundary-retry-button');
      expect(button.props.style).toContainEqual(
        expect.objectContaining({
          flexDirection: 'row-reverse'
        })
      );
    });

    it('applies correct RTL text alignment to button text', () => {
      const ThrowError = () => {
        throw new Error('Test error');
      };

      const { getByText } = render(
        <ErrorBoundary>
          <ThrowError />
        </ErrorBoundary>
      );

      const buttonText = getByText('Try Again');
      expect(buttonText.props.style).toContainEqual(
        expect.objectContaining({
          writingDirection: 'rtl',
          textAlign: 'right'
        })
      );
    });

    it('maintains center alignment for error message in RTL', () => {
      const ThrowError = () => {
        throw new Error('Test error');
      };

      const { getByTestId } = render(
        <ErrorBoundary>
          <ThrowError />
        </ErrorBoundary>
      );

      const message = getByTestId('error-boundary-message');
      expect(message.props.style).toContainEqual(
        expect.objectContaining({
          textAlign: 'center'
        })
      );
    });

    it('handles RTL with different error message lengths', () => {
      const longMessage = 'א'.repeat(100); // Hebrew character for RTL test
      const ThrowError = () => {
        throw new Error(longMessage);
      };

      const { getByTestId } = render(
        <ErrorBoundary>
          <ThrowError />
        </ErrorBoundary>
      );

      const message = getByTestId('error-boundary-message');
      expect(message.props.style).toContainEqual(
        expect.objectContaining({
          writingDirection: 'rtl',
          width: '100%'
        })
      );
    });

    it('maintains button centering in RTL mode', () => {
      const ThrowError = () => {
        throw new Error('Test error');
      };

      const { getByTestId } = render(
        <ErrorBoundary>
          <ThrowError />
        </ErrorBoundary>
      );

      const button = getByTestId('error-boundary-retry-button');
      expect(button.props.style).toContainEqual(
        expect.objectContaining({
          alignItems: 'center',
          justifyContent: 'center'
        })
      );
    });
  });

  describe('RTL Support with Icons', () => {
    beforeEach(() => {
      I18nManager.isRTL = true;
    });

    afterEach(() => {
      I18nManager.isRTL = false;
    });

    it('renders error icon with correct RTL transform', () => {
      const ThrowError = () => {
        throw new Error('Test error');
      };

      const { getByTestId } = render(
        <ErrorBoundary>
          <ThrowError />
        </ErrorBoundary>
      );

      const icon = getByTestId('error-icon');
      expect(icon.props.style).toEqual(
        expect.objectContaining({
          transform: [{ scaleX: -1 }]
        })
      );
    });

    it('renders retry icon with correct RTL transform', () => {
      const ThrowError = () => {
        throw new Error('Test error');
      };

      const { getByTestId } = render(
        <ErrorBoundary>
          <ThrowError />
        </ErrorBoundary>
      );

      const button = getByTestId('error-boundary-retry-button');
      const icon = button.findByType('Text'); // Mocked Ionicons renders as Text
      expect(icon.props.style).toContainEqual(
        expect.objectContaining({
          transform: [{ scaleX: -1 }]
        })
      );
    });

    it('applies correct RTL margins to error icon', () => {
      const ThrowError = () => {
        throw new Error('Test error');
      };

      const { getByTestId } = render(
        <ErrorBoundary>
          <ThrowError />
        </ErrorBoundary>
      );

      const iconContainer = getByTestId('error-icon-container');
      expect(iconContainer.props.style).toContainEqual(
        expect.objectContaining({
          marginLeft: 16,
          marginRight: 0
        })
      );
    });
  });

  describe('Animations', () => {
    it('applies correct slide animation based on RTL', () => {
      const ThrowError = () => {
        throw new Error('Test error');
      };

      // Test LTR
      I18nManager.isRTL = false;
      const { getByTestId, rerender } = render(
        <ErrorBoundary>
          <ThrowError />
        </ErrorBoundary>
      );

      const content = getByTestId('error-content');
      expect(content.props.entering.build).toBeDefined();
      expect(content.props.exiting.build).toBeDefined();

      // Test RTL
      I18nManager.isRTL = true;
      rerender(
        <ErrorBoundary>
          <ThrowError />
        </ErrorBoundary>
      );

      const rtlContent = getByTestId('error-content');
      expect(rtlContent.props.entering.build).toBeDefined();
      expect(rtlContent.props.exiting.build).toBeDefined();
    });

    it('configures animation timing correctly', () => {
      const ThrowError = () => {
        throw new Error('Test error');
      };

      const { getByTestId } = render(
        <ErrorBoundary>
          <ThrowError />
        </ErrorBoundary>
      );

      const container = getByTestId('error-boundary-container');
      const content = getByTestId('error-content');

      // Container animations
      expect(container.props.entering.build().duration).toBe(300);
      expect(container.props.exiting.build().duration).toBe(300);

      // Content animations
      expect(content.props.entering.build().duration).toBe(500);
      expect(content.props.entering.build().delay).toBe(150);
      expect(content.props.exiting.build().duration).toBe(300);
    });
  });

  describe('Error State Transitions', () => {
    beforeEach(() => {
      jest.useFakeTimers();
    });

    afterEach(() => {
      jest.useRealTimers();
    });

    it('tracks error count correctly', () => {
      let errorCount = 0;
      const CustomFallback = ({ error, resetError, errorCount: count }: { error: Error; resetError: () => void; errorCount: number }) => {
        errorCount = count;
        return <Text testID="error-count">{count}</Text>;
      };

      const ThrowError = () => {
        throw new Error('Test error');
      };

      const { getByTestId, rerender } = render(
        <ErrorBoundary fallback={CustomFallback}>
          <ThrowError />
        </ErrorBoundary>
      );

      expect(errorCount).toBe(1);

      // Trigger another error
      rerender(
        <ErrorBoundary fallback={CustomFallback}>
          <ThrowError />
        </ErrorBoundary>
      );

      expect(errorCount).toBe(2);
    });

    it('shows warning state for multiple errors', async () => {
      const ThrowError = () => {
        throw new Error('Test error');
      };

      const { getByTestId, rerender } = render(
        <ErrorBoundary>
          <ThrowError />
        </ErrorBoundary>
      );

      // First error
      expect(getByTestId('error-icon')).toHaveTextContent('alert-circle');

      // Trigger retry
      fireEvent.press(getByTestId('error-boundary-retry-button'));
      
      // Wait for retry animation
      await act(async () => {
        jest.advanceTimersByTime(1000);
      });

      // Trigger second error quickly
      rerender(
        <ErrorBoundary>
          <ThrowError />
        </ErrorBoundary>
      );

      expect(getByTestId('error-icon')).toHaveTextContent('warning');
      expect(getByTestId('error-boundary-message')).toHaveTextContent(i18n.t('error.multipleErrors'));
    });

    it('handles retry state correctly', async () => {
      const ThrowError = () => {
        throw new Error('Test error');
      };

      const { getByTestId, getByText } = render(
        <ErrorBoundary>
          <ThrowError />
        </ErrorBoundary>
      );

      const retryButton = getByTestId('error-boundary-retry-button');
      
      // Initial state
      expect(retryButton).not.toBeDisabled();
      expect(getByText(i18n.t('error.tryAgain'))).toBeDefined();

      // Click retry
      fireEvent.press(retryButton);

      // Check retrying state
      expect(retryButton).toBeDisabled();
      expect(getByText(i18n.t('error.retrying'))).toBeDefined();

      // Wait for retry animation
      await act(async () => {
        jest.advanceTimersByTime(1000);
      });

      // Should be back to initial state
      expect(retryButton).not.toBeDisabled();
      expect(getByText(i18n.t('error.tryAgain'))).toBeDefined();
    });

    it('prevents rapid retries', async () => {
      const ThrowError = () => {
        throw new Error('Test error');
      };

      const { getByTestId } = render(
        <ErrorBoundary>
          <ThrowError />
        </ErrorBoundary>
      );

      const retryButton = getByTestId('error-boundary-retry-button');
      
      // First retry
      fireEvent.press(retryButton);
      expect(retryButton).toBeDisabled();

      // Try to retry again immediately
      fireEvent.press(retryButton);
      
      // Should still be disabled
      expect(retryButton).toBeDisabled();

      // Wait for retry animation
      await act(async () => {
        jest.advanceTimersByTime(1000);
      });

      // Should be enabled again
      expect(retryButton).not.toBeDisabled();
    });

    it('shows error subtext for multiple errors', async () => {
      const ThrowError = () => {
        throw new Error('Test error');
      };

      const { getByText, rerender } = render(
        <ErrorBoundary>
          <ThrowError />
        </ErrorBoundary>
      );

      // First error - no subtext
      expect(() => getByText(i18n.t('error.multipleErrorsHint'))).toThrow();

      // Trigger retry
      fireEvent.press(getByText(i18n.t('error.tryAgain')));
      
      await act(async () => {
        jest.advanceTimersByTime(1000);
      });

      // Trigger second error quickly
      rerender(
        <ErrorBoundary>
          <ThrowError />
        </ErrorBoundary>
      );

      // Should show subtext
      expect(getByText(i18n.t('error.multipleErrorsHint'))).toBeDefined();
    });

    it('resets error count after successful recovery', async () => {
      let shouldThrow = true;
      const MaybeThrowError = () => {
        if (shouldThrow) {
          throw new Error('Test error');
        }
        return <Text>Success</Text>;
      };

      const { getByTestId, getByText, rerender } = render(
        <ErrorBoundary>
          <MaybeThrowError />
        </ErrorBoundary>
      );

      // First error
      expect(getByTestId('error-icon')).toHaveTextContent('alert-circle');

      // Stop throwing
      shouldThrow = false;

      // Trigger retry
      fireEvent.press(getByTestId('error-boundary-retry-button'));
      
      await act(async () => {
        jest.advanceTimersByTime(1000);
      });

      // Should show success
      expect(getByText('Success')).toBeDefined();

      // Start throwing again
      shouldThrow = true;
      rerender(
        <ErrorBoundary>
          <MaybeThrowError />
        </ErrorBoundary>
      );

      // Should show normal error state, not warning
      expect(getByTestId('error-icon')).toHaveTextContent('alert-circle');
    });
  });
});

describe('Error Recovery and Logging', () => {
  beforeEach(() => {
    jest.useFakeTimers();
    jest.clearAllMocks();
  });

  afterEach(() => {
    jest.useRealTimers();
  });

  it('implements exponential backoff for retries', async () => {
    const ThrowError = () => {
      throw new Error('Test error');
    };

    const { getByTestId } = render(
      <ErrorBoundary>
        <ThrowError />
      </ErrorBoundary>
    );

    // First retry - 1 second delay
    fireEvent.press(getByTestId('error-boundary-retry-button'));
    expect(getByTestId('error-boundary-retry-button')).toBeDisabled();
    
    await act(async () => {
      jest.advanceTimersByTime(1000); // BASE_RETRY_DELAY
    });

    // Second retry - 2 seconds delay
    fireEvent.press(getByTestId('error-boundary-retry-button'));
    expect(getByTestId('error-boundary-retry-button')).toBeDisabled();
    
    await act(async () => {
      jest.advanceTimersByTime(2000); // BASE_RETRY_DELAY * 2^1
    });

    // Third retry - 4 seconds delay
    fireEvent.press(getByTestId('error-boundary-retry-button'));
    expect(getByTestId('error-boundary-retry-button')).toBeDisabled();
    
    await act(async () => {
      jest.advanceTimersByTime(4000); // BASE_RETRY_DELAY * 2^2
    });

    // Should show max retries message
    expect(getByTestId('error-boundary-message')).toHaveTextContent(i18n.t('error.maxRetries'));
    expect(getByTestId('error-boundary-retry-button')).toBeDisabled();
  });

  it('logs errors to Sentry with correct scope', () => {
    const error = new Error('Test error');
    const ThrowError = () => {
      throw error;
    };

    const mockSetExtra = jest.fn();
    const mockSetTag = jest.fn();
    const mockScope = { setExtra: mockSetExtra, setTag: mockSetTag };
    
    (Sentry.withScope as jest.Mock).mockImplementation((callback) => callback(mockScope));

    render(
      <ErrorBoundary>
        <ThrowError />
      </ErrorBoundary>
    );

    expect(Sentry.withScope).toHaveBeenCalled();
    expect(mockSetExtra).toHaveBeenCalledWith('componentStack', expect.any(String));
    expect(mockSetTag).toHaveBeenCalledWith('errorCount', '1');
    expect(mockSetTag).toHaveBeenCalledWith('retryAttempts', '0');
    expect(Sentry.captureException).toHaveBeenCalledWith(error);
  });

  it('calls custom error handler when provided', () => {
    const error = new Error('Test error');
    const ThrowError = () => {
      throw error;
    };

    const onError = jest.fn();

    render(
      <ErrorBoundary onError={onError}>
        <ThrowError />
      </ErrorBoundary>
    );

    expect(onError).toHaveBeenCalledWith(error, expect.any(Object));
  });

  it('shows retry attempt counter', async () => {
    const ThrowError = () => {
      throw new Error('Test error');
    };

    const { getByText, getByTestId } = render(
      <ErrorBoundary>
        <ThrowError />
      </ErrorBoundary>
    );

    // First retry
    fireEvent.press(getByTestId('error-boundary-retry-button'));
    await act(async () => {
      jest.advanceTimersByTime(1000);
    });

    expect(getByText(i18n.t('error.retryCount', { count: 1, max: 3 }))).toBeDefined();

    // Second retry
    fireEvent.press(getByTestId('error-boundary-retry-button'));
    await act(async () => {
      jest.advanceTimersByTime(2000);
    });

    expect(getByText(i18n.t('error.retryCount', { count: 2, max: 3 }))).toBeDefined();
  });

  it('resets retry count after successful recovery', async () => {
    let shouldThrow = true;
    const MaybeThrowError = () => {
      if (shouldThrow) {
        throw new Error('Test error');
      }
      return <Text>Success</Text>;
    };

    const { getByTestId, getByText, queryByText, rerender } = render(
      <ErrorBoundary>
        <MaybeThrowError />
      </ErrorBoundary>
    );

    // First retry
    fireEvent.press(getByTestId('error-boundary-retry-button'));
    await act(async () => {
      jest.advanceTimersByTime(1000);
    });

    expect(getByText(i18n.t('error.retryCount', { count: 1, max: 3 }))).toBeDefined();

    // Successful recovery
    shouldThrow = false;
    rerender(
      <ErrorBoundary>
        <MaybeThrowError />
      </ErrorBoundary>
    );

    expect(getByText('Success')).toBeDefined();

    // Throw again
    shouldThrow = true;
    rerender(
      <ErrorBoundary>
        <MaybeThrowError />
      </ErrorBoundary>
    );

    // Should start from retry count 0
    expect(queryByText(i18n.t('error.retryCount', { count: 1, max: 3 }))).toBeNull();
  });
});

describe('Enhanced Animations', () => {
  it('applies pulse animation to error icon', () => {
    const ThrowError = () => {
      throw new Error('Test error');
    };

    const { getByTestId } = render(
      <ErrorBoundary>
        <ThrowError />
      </ErrorBoundary>
    );

    const iconContainer = getByTestId('error-icon-container');
    expect(iconContainer.props.style).toBeDefined();
    expect(iconContainer.props.style).toContainEqual(
      expect.objectContaining({
        transform: expect.arrayContaining([
          expect.objectContaining({ scale: expect.any(Number) })
        ])
      })
    );
  });

  it('applies rotation animation during retry', async () => {
    const ThrowError = () => {
      throw new Error('Test error');
    };

    const { getByTestId } = render(
      <ErrorBoundary>
        <ThrowError />
      </ErrorBoundary>
    );

    fireEvent.press(getByTestId('error-boundary-retry-button'));

    const iconContainer = getByTestId('error-icon-container');
    expect(iconContainer.props.style).toBeDefined();
    expect(iconContainer.props.style).toContainEqual(
      expect.objectContaining({
        transform: expect.arrayContaining([
          expect.objectContaining({ rotate: expect.any(String) })
        ])
      })
    );
  });

  it('applies scale animation to container on retry', async () => {
    const ThrowError = () => {
      throw new Error('Test error');
    };

    const { getByTestId } = render(
      <ErrorBoundary>
        <ThrowError />
      </ErrorBoundary>
    );

    fireEvent.press(getByTestId('error-boundary-retry-button'));

    const content = getByTestId('error-content');
    expect(content.props.style).toBeDefined();
    expect(content.props.style).toContainEqual(
      expect.objectContaining({
        transform: expect.arrayContaining([
          expect.objectContaining({ scale: expect.any(Number) })
        ])
      })
    );
  });
}); 