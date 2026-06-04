// ─────────────────────────────────────────────────────────────
// Huxe AI — Global Error Handler
// ─────────────────────────────────────────────────────────────

/**
 * Standardized error handling module.
 * In a production app, this would integrate with Sentry, Crashlytics, etc.
 */

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

  // TODO: Add Crashlytics/Sentry reporting here for production
  // if (!__DEV__) {
  //   Sentry.captureException(error, { tags: { context, severity } });
  // }
}

export function reportApiError(apiName: string, error: unknown) {
  logError(error, `API:${apiName}`, ErrorSeverity.WARNING);
}
