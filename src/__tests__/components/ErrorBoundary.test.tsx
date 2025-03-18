import { ErrorHandlingService } from '@services/ErrorHandlingService';
import { fireEvent, render } from '@testing-library/react-native';
import React from 'react';
import { ErrorBoundary } from '../../components/ErrorBoundary';

jest.mock('../../services/ErrorHandlingService');

describe('ErrorBoundary', () => {
  const mockError = new Error('Test error');
  const mockErrorInfo = {
    componentStack: '\n    at Component\n    at App',
    digest: 'digest-123'
  };

  // Component that throws an error
  const BuggyComponent = () => {
    throw mockError;
  };

  beforeEach(() => {
    jest.clearAllMocks();
    jest.spyOn(console, 'error').mockImplementation(() => {});
  });

  afterEach(() => {
    (console.error as jest.Mock).mockRestore();
  });

  it('renders children when no error occurs', () => {
    const { getByText } = render(
      <ErrorBoundary>
        <div>Normal content</div>
      </ErrorBoundary>
    );

    expect(getByText('Normal content')).toBeTruthy();
  });

  it('renders fallback UI when error occurs', () => {
    const { getByText } = render(
      <ErrorBoundary>
        <BuggyComponent />
      </ErrorBoundary>
    );

    expect(getByText('Something went wrong')).toBeTruthy();
    expect(getByText('Test error')).toBeTruthy();
  });

  it('logs error to ErrorHandlingService', () => {
    render(
      <ErrorBoundary>
        <BuggyComponent />
      </ErrorBoundary>
    );

    expect(ErrorHandlingService.logError).toHaveBeenCalledWith(
      mockError,
      expect.objectContaining({
        componentStack: expect.any(String)
      })
    );
  });

  it('resets error state when try again is clicked', () => {
    const { getByText, queryByText } = render(
      <ErrorBoundary>
        <div>Normal content</div>
      </ErrorBoundary>
    );

    // Simulate error
    const instance = ErrorBoundary.prototype;
    instance.componentDidCatch(mockError, mockErrorInfo);

    // Click try again
    fireEvent.press(getByText('Try Again'));

    expect(queryByText('Something went wrong')).toBeNull();
    expect(getByText('Normal content')).toBeTruthy();
  });

  it('provides accessible error information', () => {
    const { getByRole } = render(
      <ErrorBoundary>
        <BuggyComponent />
      </ErrorBoundary>
    );

    const errorMessage = getByRole('alert');
    expect(errorMessage.props.accessibilityLabel)
      .toContain('Error occurred');
  });

  it('applies error styling', () => {
    const { getByTestId } = render(
      <ErrorBoundary>
        <BuggyComponent />
      </ErrorBoundary>
    );

    const container = getByTestId('error-boundary-container');
    expect(container).toHaveStyle({
      padding: 16,
      alignItems: 'center',
      justifyContent: 'center'
    });
  });

  it('handles nested errors', () => {
    const NestedBuggyComponent = () => (
      <ErrorBoundary>
        <BuggyComponent />
      </ErrorBoundary>
    );

    const { getAllByText } = render(
      <ErrorBoundary>
        <NestedBuggyComponent />
      </ErrorBoundary>
    );

    // Only the innermost ErrorBoundary should catch the error
    expect(getAllByText('Something went wrong')).toHaveLength(1);
  });
}); 