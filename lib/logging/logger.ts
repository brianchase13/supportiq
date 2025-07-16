import { LogEntry } from '@/lib/types';

// Proper logging framework - NO MORE CONSOLE.LOGS
class Logger {
  private isDevelopment = process.env.NODE_ENV === 'development';
  private isProduction = process.env.NODE_ENV === 'production';
  private logLevel: LogEntry['level'] = (process.env.LOG_LEVEL as LogEntry['level']) || 'info';

  private readonly logLevels: Record<LogEntry['level'], number> = {
    debug: 0,
    info: 1,
    warn: 2,
    error: 3,
    fatal: 4,
  };

  private shouldLog(level: LogEntry['level']): boolean {
    return this.logLevels[level] >= this.logLevels[this.logLevel];
  }

  private createLogEntry(
    level: LogEntry['level'],
    message: string,
    context?: Record<string, unknown>,
    error?: Error
  ): LogEntry {
    return {
      level,
      message,
      timestamp: new Date().toISOString(),
      request_id: this.getRequestId(),
      user_id: this.getUserId(),
      session_id: this.getSessionId(),
      context: this.sanitizeContext(context),
      error: error ? this.sanitizeError(error) : undefined,
    };
  }

  private sanitizeContext(context?: Record<string, unknown>): Record<string, unknown> | undefined {
    if (!context) return undefined;

    const sanitized: Record<string, unknown> = {};
    const sensitiveKeys = ['password', 'token', 'key', 'secret', 'credit_card', 'ssn'];

    for (const [key, value] of Object.entries(context)) {
      if (sensitiveKeys.some(sensitive => key.toLowerCase().includes(sensitive))) {
        sanitized[key] = '[REDACTED]';
      } else {
        sanitized[key] = value;
      }
    }

    return sanitized;
  }

  private sanitizeError(error: Error): Error {
    // Remove sensitive information from error messages
    const sanitizedError = new Error(error.message?.replace(/token=([^&\s]+)/g, 'token=[REDACTED]') || 'Unknown error');
    sanitizedError.name = error.name || 'Error';
    sanitizedError.stack = error.stack;
    return sanitizedError;
  }

  private getRequestId(): string | undefined {
    // In a real app, this would come from request context
    return undefined;
  }

  private getUserId(): string | undefined {
    // In a real app, this would come from auth context
    return undefined;
  }

  private getSessionId(): string | undefined {
    // In a real app, this would come from session context
    return undefined;
  }

  private async persistLog(logEntry: LogEntry): Promise<void> {
    try {
      // In production, send to logging service (Sentry, DataDog, etc.)
      if (this.isProduction) {
        await this.sendToLoggingService(logEntry);
      }

      // In development, write to file or console
      if (this.isDevelopment) {
        this.writeToConsole(logEntry);
      }
    } catch (error) {
      // Fallback to console.error if logging fails
      console.error('Logging failed:', error);
      console.error('Original log entry:', logEntry);
    }
  }

  private async sendToLoggingService(logEntry: LogEntry): Promise<void> {
    // Send to external logging service
    const loggingUrl = process.env.LOGGING_SERVICE_URL;
    if (!loggingUrl) return;

    try {
      await fetch(loggingUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${process.env.LOGGING_SERVICE_KEY}`,
        },
        body: JSON.stringify(logEntry),
      });
    } catch (error) {
      // Don't throw - logging failure shouldn't break the app
      console.error('Failed to send log to service:', error);
    }
  }

  private writeToConsole(logEntry: LogEntry): void {
    const timestamp = new Date(logEntry.timestamp).toLocaleTimeString();
    const prefix = `[${timestamp}] [${logEntry.level.toUpperCase()}]`;
    
    const logData = {
      message: logEntry.message,
      ...(logEntry.context && { context: logEntry.context }),
      ...(logEntry.user_id && { user_id: logEntry.user_id }),
      ...(logEntry.request_id && { request_id: logEntry.request_id }),
    };

    switch (logEntry.level) {
      case 'debug':
        console.debug(prefix, logData);
        break;
      case 'info':
        console.info(prefix, logData);
        break;
      case 'warn':
        console.warn(prefix, logData);
        break;
      case 'error':
      case 'fatal':
        console.error(prefix, logData);
        if (logEntry.error) {
          console.error('Error details:', logEntry.error);
        }
        break;
    }
  }

  // Public logging methods
  async debug(message: string, context?: Record<string, unknown>): Promise<void> {
    if (!this.shouldLog('debug')) return;
    const logEntry = this.createLogEntry('debug', message, context);
    await this.persistLog(logEntry);
  }

  async info(message: string, context?: Record<string, unknown>): Promise<void> {
    if (!this.shouldLog('info')) return;
    const logEntry = this.createLogEntry('info', message, context);
    await this.persistLog(logEntry);
  }

  async warn(message: string, context?: Record<string, unknown>): Promise<void> {
    if (!this.shouldLog('warn')) return;
    const logEntry = this.createLogEntry('warn', message, context);
    await this.persistLog(logEntry);
  }

  async error(message: string, error?: Error, context?: Record<string, unknown>): Promise<void> {
    if (!this.shouldLog('error')) return;
    const logEntry = this.createLogEntry('error', message, context, error);
    await this.persistLog(logEntry);
  }

  async fatal(message: string, error?: Error, context?: Record<string, unknown>): Promise<void> {
    if (!this.shouldLog('fatal')) return;
    const logEntry = this.createLogEntry('fatal', message, context, error);
    await this.persistLog(logEntry);
  }

  // Convenience methods for common scenarios
  async logAPIRequest(method: string, url: string, userId?: string, duration?: number): Promise<void> {
    await this.info('API Request', {
      method,
      url,
      user_id: userId,
      duration_ms: duration,
    });
  }

  async logAPIResponse(method: string, url: string, statusCode: number, duration?: number): Promise<void> {
    await this.info('API Response', {
      method,
      url,
      status_code: statusCode,
      duration_ms: duration,
    });
  }

  async logDeflectionAttempt(ticketId: string, userId: string, success: boolean, confidence?: number): Promise<void> {
    await this.info('Deflection Attempt', {
      ticket_id: ticketId,
      user_id: userId,
      success,
      confidence,
    });
  }

  async logError(error: Error, context?: Record<string, unknown>): Promise<void> {
    await this.error(error.message, error, context);
  }

  async logSecurityEvent(event: string, userId?: string, details?: Record<string, unknown>): Promise<void> {
    await this.warn('Security Event', {
      event,
      user_id: userId,
      ...details,
    });
  }

  async logBusinessEvent(event: string, userId: string, metrics?: Record<string, unknown>): Promise<void> {
    await this.info('Business Event', {
      event,
      user_id: userId,
      ...metrics,
    });
  }
}

// Export singleton instance
export const logger = new Logger();

// Export convenience functions
export const log = {
  debug: (message: string, context?: Record<string, unknown>) => logger.debug(message, context),
  info: (message: string, context?: Record<string, unknown>) => logger.info(message, context),
  warn: (message: string, context?: Record<string, unknown>) => logger.warn(message, context),
  error: (message: string, error?: Error, context?: Record<string, unknown>) => logger.error(message, error, context),
  fatal: (message: string, error?: Error, context?: Record<string, unknown>) => logger.fatal(message, error, context),
  api: {
    request: (method: string, url: string, userId?: string, duration?: number) => logger.logAPIRequest(method, url, userId, duration),
    response: (method: string, url: string, statusCode: number, duration?: number) => logger.logAPIResponse(method, url, statusCode, duration),
  },
  deflection: (ticketId: string, userId: string, success: boolean, confidence?: number) => logger.logDeflectionAttempt(ticketId, userId, success, confidence),
  security: (event: string, userId?: string, details?: Record<string, unknown>) => logger.logSecurityEvent(event, userId, details),
  business: (event: string, userId: string, metrics?: Record<string, unknown>) => logger.logBusinessEvent(event, userId, metrics),
}; 