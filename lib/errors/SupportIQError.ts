import { logger } from '@/lib/logging/logger';
// Production-ready error handling system for SupportIQ

export class SupportIQError extends Error {
  public readonly code: string;
  public readonly statusCode: number;
  public readonly isOperational: boolean;
  public readonly timestamp: string;
  public readonly context?: Record<string, unknown>;

  constructor(
    message: string,
    code: string,
    statusCode: number = 500,
    isOperational: boolean = true,
    context?: Record<string, unknown>
  ) {
    super(message);
    this.name = 'SupportIQError';
    this.code = code;
    this.statusCode = statusCode;
    this.isOperational = isOperational;
    this.timestamp = new Date().toISOString();
    this.context = context;

    // Ensure the name of this error is the same as the class name
    Object.setPrototypeOf(this, SupportIQError.prototype);
  }

  // Convert to JSON for logging
  toJSON() {
    return {
      name: this.name,
      message: this.message,
      code: this.code,
      statusCode: this.statusCode,
      isOperational: this.isOperational,
      timestamp: this.timestamp,
      context: this.context,
      stack: this.stack,
    };
  }

  // User-friendly error messages
  getUserMessage(): string {
    switch (this.code) {
      case 'INTERCOM_RATE_LIMIT':
        return 'We\'re syncing too quickly. Please wait a moment and try again.';
      case 'INTERCOM_AUTH_FAILED':
        return 'Unable to connect to Intercom. Please reconnect your account.';
      case 'INSUFFICIENT_TICKETS':
        return 'You need more ticket data for this analysis. Try syncing more tickets first.';
      case 'ANALYSIS_QUOTA_EXCEEDED':
        return 'You\'ve reached your analysis limit. Upgrade your plan to continue.';
      case 'PAYMENT_FAILED':
        return 'Payment couldn\'t be processed. Please check your payment method.';
      case 'NETWORK_ERROR':
        return 'Network connection issue. Please check your internet and try again.';
      case 'DATABASE_ERROR':
        return 'Temporary database issue. Our team has been notified.';
      default:
        return this.isOperational 
          ? 'Something went wrong. Please try again or contact support.'
          : 'An unexpected error occurred. Our team has been notified.';
    }
  }

  // Get retry suggestion
  getRetryInfo(): { canRetry: boolean; retryAfter?: number; suggestion: string } {
    switch (this.code) {
      case 'INTERCOM_RATE_LIMIT':
        return {
          canRetry: true,
          retryAfter: 60000, // 1 minute
          suggestion: 'Rate limit exceeded. Retry in 1 minute.',
        };
      case 'NETWORK_ERROR':
        return {
          canRetry: true,
          retryAfter: 5000, // 5 seconds
          suggestion: 'Network issue. Retry in a few seconds.',
        };
      case 'DATABASE_ERROR':
        return {
          canRetry: true,
          retryAfter: 10000, // 10 seconds
          suggestion: 'Database temporarily unavailable. Retry in 10 seconds.',
        };
      case 'INTERCOM_AUTH_FAILED':
        return {
          canRetry: false,
          suggestion: 'Authentication failed. Please reconnect your Intercom account.',
        };
      case 'PAYMENT_FAILED':
        return {
          canRetry: false,
          suggestion: 'Payment failed. Please update your payment method.',
        };
      default:
        return {
          canRetry: this.isOperational,
          suggestion: this.isOperational ? 'Please try again' : 'Contact support if the issue persists',
        };
    }
  }
}

// Predefined error types
export const ErrorTypes = {
  // Authentication & Authorization
  UNAUTHORIZED: (context?: Record<string, unknown>) => new SupportIQError(
    'Authentication required',
    'UNAUTHORIZED',
    401,
    true,
    context
  ),
  
  FORBIDDEN: (context?: Record<string, unknown>) => new SupportIQError(
    'Access forbidden',
    'FORBIDDEN',
    403,
    true,
    context
  ),

  // Intercom Integration
  INTERCOM_RATE_LIMIT: (context?: Record<string, unknown>) => new SupportIQError(
    'Intercom API rate limit exceeded',
    'INTERCOM_RATE_LIMIT',
    429,
    true,
    context
  ),

  INTERCOM_AUTH_FAILED: (context?: Record<string, unknown>) => new SupportIQError(
    'Intercom authentication failed',
    'INTERCOM_AUTH_FAILED',
    401,
    true,
    context
  ),

  INTERCOM_API_ERROR: (message: string, context?: Record<string, unknown>) => new SupportIQError(
    `Intercom API error: ${message}`,
    'INTERCOM_API_ERROR',
    502,
    true,
    context
  ),

  // Data & Analysis
  INSUFFICIENT_TICKETS: (context?: Record<string, unknown>) => new SupportIQError(
    'Insufficient ticket data for analysis',
    'INSUFFICIENT_TICKETS',
    400,
    true,
    context
  ),

  ANALYSIS_QUOTA_EXCEEDED: (context?: Record<string, unknown>) => new SupportIQError(
    'Analysis quota exceeded',
    'ANALYSIS_QUOTA_EXCEEDED',
    402,
    true,
    context
  ),

  EMBEDDING_GENERATION_FAILED: (context?: Record<string, unknown>) => new SupportIQError(
    'Failed to generate embeddings',
    'EMBEDDING_GENERATION_FAILED',
    500,
    true,
    context
  ),

  // Payment & Billing
  PAYMENT_FAILED: (context?: Record<string, unknown>) => new SupportIQError(
    'Payment processing failed',
    'PAYMENT_FAILED',
    402,
    true,
    context
  ),

  SUBSCRIPTION_EXPIRED: (context?: Record<string, unknown>) => new SupportIQError(
    'Subscription has expired',
    'SUBSCRIPTION_EXPIRED',
    402,
    true,
    context
  ),

  // Technical Errors
  DATABASE_ERROR: (context?: Record<string, unknown>) => new SupportIQError(
    'Database operation failed',
    'DATABASE_ERROR',
    500,
    true,
    context
  ),

  NETWORK_ERROR: (context?: Record<string, unknown>) => new SupportIQError(
    'Network connection error',
    'NETWORK_ERROR',
    503,
    true,
    context
  ),

  VALIDATION_ERROR: (message: string, context?: Record<string, unknown>) => new SupportIQError(
    `Validation error: ${message}`,
    'VALIDATION_ERROR',
    400,
    true,
    context
  ),

  // System Errors
  SYSTEM_ERROR: (message: string, context?: Record<string, unknown>) => new SupportIQError(
    `System error: ${message}`,
    'SYSTEM_ERROR',
    500,
    false,
    context
  ),

  CONFIGURATION_ERROR: (message: string, context?: Record<string, unknown>) => new SupportIQError(
    `Configuration error: ${message}`,
    'CONFIGURATION_ERROR',
    500,
    false,
    context
  ),
};

// Error handling utilities
export class ErrorHandler {
  static async logError(error: Error, context?: Record<string, unknown>) {
    const errorData: Record<string, unknown> = {
      message: error.message,
      stack: error.stack,
      timestamp: new Date().toISOString(),
      context,
    };

    if (error instanceof SupportIQError) {
      errorData.code = error.code;
      errorData.statusCode = error.statusCode;
      errorData.isOperational = error.isOperational;
      errorData.context = { ...errorData.context, ...error.context };
    }

    await logger.error('SupportIQ Error:', errorData);

    // In production, send to monitoring service
    if (process.env.NODE_ENV === 'production') {
      // Sentry, LogRocket, or similar
      // Sentry.captureException(error, { extra: errorData });
    }
  }

  static async handleAPIError(error: Error, context?: Record<string, unknown>) {
    await this.logError(error, context);

    if (error instanceof SupportIQError) {
      return {
        error: error.getUserMessage(),
        code: error.code,
        statusCode: error.statusCode,
        retryInfo: error.getRetryInfo(),
        timestamp: error.timestamp,
      };
    }

    // Handle non-SupportIQ errors
    return {
      error: 'An unexpected error occurred',
      code: 'UNKNOWN_ERROR',
      statusCode: 500,
      retryInfo: {
        canRetry: false,
        suggestion: 'Please contact support if the issue persists',
      },
      timestamp: new Date().toISOString(),
    };
  }

  static async wrapAsync<T>(fn: () => Promise<T>): Promise<T> {
    try {
      return await fn();
    } catch (error) {
      await this.logError(error as Error);
      throw error;
    }
  }
}

// React Error Boundary Hook
export const useErrorHandler = () => {
  const handleError = async (error: Error, errorInfo?: unknown) => {
    await ErrorHandler.logError(error, { errorInfo });
  };

  return { handleError };
};

// Common error patterns
export const withErrorHandling = (handler: Function) => {
  return async (...args: unknown[]) => {
    try {
      return await handler(...args);
    } catch (error) {
      await ErrorHandler.logError(error as Error, { args });
      throw error;
    }
  };
};

// Type guards
export const isSupportIQError = (error: unknown): error is SupportIQError => {
  return error instanceof SupportIQError;
};

export const isOperationalError = (error: any): boolean => {
  return isSupportIQError(error) && error.isOperational;
};

export const isRetryableError = (error: any): boolean => {
  if (!isSupportIQError(error)) return false;
  return error.getRetryInfo().canRetry;
};