// ─────────────────────────────────────────────────────────────
// Huxe AI — Global Error Handler
// ─────────────────────────────────────────────────────────────

/**
 * Standardized error handling module.
 * In a production app, this would integrate with Sentry, Crashlytics, etc.
 */

import Toast from 'react-native-toast-message';

export enum ErrorSeverity {
  INFO = 'info',
  WARNING = 'warning',
  ERROR = 'error',
  FATAL = 'fatal',
}

export function logError(
  error: unknown,
  context?: string,
  severity: ErrorSeverity = ErrorSeverity.ERROR
) {
  const timestamp = new Date().toISOString();
  let message = 'Unknown error';

  if (error instanceof Error) {
    message = error.message;
  } else if (typeof error === 'string') {
    message = error;
  } else {
    message = JSON.stringify(error);
  }

  // Console logging with formatting
  if (__DEV__) {
    console.group(`[${timestamp}] ${severity.toUpperCase()} ${context ? `in ${context}` : ''}`);
    console.error(message);
    if (error instanceof Error && error.stack) {
      console.log(error.stack);
    }
    console.groupEnd();
  }

  // Show toast for errors
  if (severity === ErrorSeverity.ERROR || severity === ErrorSeverity.FATAL) {
    Toast.show({
      type: 'error',
      text1: 'Oops! Something went wrong.',
      text2: message.length > 50 ? message.substring(0, 50) + '...' : message,
      position: 'bottom',
    });
  }

  // TODO: Add Crashlytics/Sentry reporting here for production
  // if (!__DEV__) {
  //   Sentry.captureException(error, { tags: { context, severity } });
  // }
}

export function showUserError(message: string, isSuccess: boolean = false) {
  Toast.show({
    type: isSuccess ? 'success' : 'error',
    text1: isSuccess ? 'Success' : 'Error',
    text2: message,
    position: 'bottom',
  });
}

export function reportApiError(apiName: string, error: unknown) {
  logError(error, `API:${apiName}`, ErrorSeverity.WARNING);
}
