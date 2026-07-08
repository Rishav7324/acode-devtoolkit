import { logger } from '../utils/logger.js';
import { PluginError, ErrorSeverity } from './ErrorHandler.js';

export class ErrorIsolation {
  constructor(eventBus) {
    this._eventBus = eventBus;
  }

  async execute(moduleId, fn, context = null) {
    try {
      const result = context ? fn.call(context) : fn();
      if (result instanceof Promise) {
        return await result;
      }
      return result;
    } catch (error) {
      const wrapped = error instanceof PluginError
        ? error
        : new PluginError('MODULE_EXEC', error.message || 'Unknown error', {
            moduleId,
            cause: error,
            severity: ErrorSeverity.RECOVERABLE,
          });

      logger.error(`Module "${moduleId}" execution error:`, wrapped);

      if (this._eventBus) {
        this._eventBus.emit('module:error', {
          moduleId,
          error: wrapped.toJSON(),
          timestamp: Date.now(),
        });
      }

      return null;
    }
  }

  async callModuleMethod(moduleId, method, fn, ...args) {
    if (typeof fn !== 'function') return null;

    try {
      const result = fn(...args);
      if (result instanceof Promise) {
        return await result;
      }
      return result;
    } catch (error) {
      const wrapped = new PluginError('MODULE_METHOD', `Method "${method}" failed: ${error.message}`, {
        moduleId,
        cause: error,
        severity: ErrorSeverity.RECOVERABLE,
      });

      logger.error(`Module "${moduleId}" method "${method}" error:`, wrapped);

      if (this._eventBus) {
        this._eventBus.emit('module:error', {
          moduleId,
          method,
          error: wrapped.toJSON(),
          timestamp: Date.now(),
        });
      }

      return null;
    }
  }
}
