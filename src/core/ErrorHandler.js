import { logger } from '../utils/logger.js';

export const ErrorSeverity = {
  RECOVERABLE: 'recoverable',
  FATAL: 'fatal',
  PANIC: 'panic',
};

export class PluginError extends Error {
  constructor(code, message, options = {}) {
    super(message);
    this.name = 'PluginError';
    this.code = code;
    this.severity = options.severity || ErrorSeverity.RECOVERABLE;
    this.moduleId = options.moduleId || null;
    this.cause = options.cause || null;
    this.context = options.context || null;
    this.timestamp = Date.now();
  }

  toJSON() {
    return {
      name: this.name,
      code: this.code,
      message: this.message,
      severity: this.severity,
      moduleId: this.moduleId,
      cause: this.cause ? this.cause.message : null,
      timestamp: this.timestamp,
    };
  }
}

export class ErrorHandler {
  constructor(eventBus = null) {
    this._eventBus = eventBus;
    this._boundary = null;
    this._history = [];
    this._maxHistory = 50;

    this._installGlobalBoundary();
  }

  _installGlobalBoundary() {
    this._boundary = (event) => {
      const error = event.error || event.reason;
      if (!error) return;

      const wrapped = error instanceof PluginError
        ? error
        : new PluginError('UNCAUGHT', error.message || 'Uncaught error', {
            cause: error,
            severity: ErrorSeverity.FATAL,
          });

      this._report(wrapped);
    };

    window.addEventListener('error', this._boundary);
    window.addEventListener('unhandledrejection', this._boundary);
  }

  _report(error) {
    this._history.push(error);
    if (this._history.length > this._maxHistory) {
      this._history.shift();
    }

    if (error.severity === ErrorSeverity.PANIC) {
      logger.error(`[PANIC] ${error.code}: ${error.message}`, error.cause || '');
      if (this._eventBus) {
        this._eventBus.emit('system:panic', error.toJSON());
      }
      return;
    }

    if (error.severity === ErrorSeverity.FATAL) {
      logger.error(`[FATAL] ${error.code}: ${error.message}`, error.cause || '');
    } else {
      logger.warn(`[${error.severity.toUpperCase()}] ${error.code}: ${error.message}`, error.cause || '');
    }

    if (this._eventBus) {
      this._eventBus.emit('system:error', error.toJSON());
    }
  }

  handle(code, message, options = {}) {
    const error = new PluginError(code, message, options);
    this._report(error);
    return error;
  }

  wrap(moduleId, fn, errorCode = 'MODULE_ERROR') {
    return async (...args) => {
      try {
        return await fn(...args);
      } catch (cause) {
        const error = this.handle(errorCode, cause.message || 'Unknown error', {
          moduleId,
          cause,
          severity: ErrorSeverity.RECOVERABLE,
        });
        return null;
      }
    };
  }

  getHistory() {
    return [...this._history];
  }

  clearHistory() {
    this._history = [];
  }

  destroy() {
    if (this._boundary) {
      window.removeEventListener('error', this._boundary);
      window.removeEventListener('unhandledrejection', this._boundary);
    }
    this._eventBus = null;
    this._history = [];
  }
}
