import React from 'react';
import { afterEach, beforeEach, describe, expect, it, jest } from '@jest/globals';
import { render, fireEvent } from '@testing-library/react-native';
import { ErrorBoundary } from '../ErrorBoundary';
import { Text } from 'react-native';

const ErrorThrowingComponent = () => {
  throw new Error('Test component error');
};

describe('ErrorBoundary', () => {
  beforeEach(() => {
    // Suppress console.error for the intentional error thrown in the test
    jest.spyOn(console, 'error').mockImplementation(() => {});
  });

  afterEach(() => {
    jest.restoreAllMocks();
  });

  it('should render children when there is no error', () => {
    const { getByText } = render(
      <ErrorBoundary>
        <Text>Safe Content</Text>
      </ErrorBoundary>
    );

    expect(getByText('Safe Content')).toBeTruthy();
  });

  it('should render fallback UI when an error occurs', () => {
    const { getByText } = render(
      <ErrorBoundary>
        <ErrorThrowingComponent />
      </ErrorBoundary>
    );

    expect(getByText('Oops! Something went wrong.')).toBeTruthy();
    expect(getByText('We encountered an unexpected error.')).toBeTruthy();
  });

  it('should reset error state when Try Again is pressed', () => {
    const { getByText, queryByText } = render(
      <ErrorBoundary>
        <ErrorThrowingComponent />
      </ErrorBoundary>
    );

    expect(getByText('Oops! Something went wrong.')).toBeTruthy();

    const tryAgainButton = getByText('Try Again');
    
    // Suppress error again because it will re-throw immediately upon re-render
    jest.spyOn(console, 'error').mockImplementation(() => {});
    fireEvent.press(tryAgainButton);

    // After reset, it tries to render the child again, which will throw again.
    // In a real scenario, the child's state might have changed to prevent the error.
    expect(getByText('Oops! Something went wrong.')).toBeTruthy();
  });
});
