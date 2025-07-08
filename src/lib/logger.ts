type LogLevel = 'error' | 'warn' | 'info' | 'debug';

interface LogEntry {
  level: LogLevel;
  message: string;
  timestamp: string;
  context?: any;
}

class ProductionLogger {
  private isDevelopment = process.env.NODE_ENV === 'development';
  private logs: LogEntry[] = [];
  private maxLogs = 100;

  private createLogEntry(level: LogLevel, message: string, context?: any): LogEntry {
    return {
      level,
      message,
      timestamp: new Date().toISOString(),
      context
    };
  }

  private addLog(entry: LogEntry) {
    if (this.isDevelopment) {
      // In development, still use console for immediate feedback
      const consoleMethod = console[entry.level] || console.log;
      consoleMethod(`[${entry.timestamp}] ${entry.message}`, entry.context || '');
    } else {
      // In production, store logs for potential debugging
      this.logs.push(entry);
      if (this.logs.length > this.maxLogs) {
        this.logs.shift(); // Remove oldest log
      }
    }
  }

  error(message: string, context?: any) {
    this.addLog(this.createLogEntry('error', message, context));
  }

  warn(message: string, context?: any) {
    this.addLog(this.createLogEntry('warn', message, context));
  }

  info(message: string, context?: any) {
    this.addLog(this.createLogEntry('info', message, context));
  }

  debug(message: string, context?: any) {
    if (this.isDevelopment) {
      this.addLog(this.createLogEntry('debug', message, context));
    }
  }

  // Get stored logs (useful for error reporting in production)
  getLogs(): LogEntry[] {
    return [...this.logs];
  }

  // Clear stored logs
  clearLogs() {
    this.logs = [];
  }

  // Send error reports to external service (if needed)
  async reportError(error: Error, context?: any) {
    const errorEntry = this.createLogEntry('error', error.message, {
      stack: error.stack,
      name: error.name,
      ...context
    });
    
    this.addLog(errorEntry);

    // In production, you might want to send to an error reporting service
    if (!this.isDevelopment && window.navigator.onLine) {
      try {
        // Example: Send to your error reporting service
        // await fetch('/api/errors', {
        //   method: 'POST',
        //   headers: { 'Content-Type': 'application/json' },
        //   body: JSON.stringify(errorEntry)
        // });
      } catch (reportingError) {
        // Silently fail if error reporting fails
        this.addLog(this.createLogEntry('error', 'Failed to report error', reportingError));
      }
    }
  }
}

// Create singleton instance
export const logger = new ProductionLogger();

// Convenience exports for easier migration from console.*
export const logError = (message: string, context?: any) => logger.error(message, context);
export const logWarn = (message: string, context?: any) => logger.warn(message, context);
export const logInfo = (message: string, context?: any) => logger.info(message, context);
export const logDebug = (message: string, context?: any) => logger.debug(message, context);