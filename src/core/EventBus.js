import { logger } from '../utils/logger.js';

export class EventBus {
  constructor() {
    this._handlers = new Map();
    this._wildcardHandlers = [];
  }

  on(event, handler, context = null, priority = 0) {
    if (event === '*' || event === '**') {
      this._wildcardHandlers.push({ handler, context, priority, event });
      this._wildcardHandlers.sort((a, b) => b.priority - a.priority);
      return () => this.off(event, handler);
    }

    if (!this._handlers.has(event)) {
      this._handlers.set(event, []);
    }

    const entry = { handler, context, priority };
    const handlers = this._handlers.get(event);
    handlers.push(entry);
    handlers.sort((a, b) => b.priority - a.priority);

    return () => this.off(event, handler);
  }

  once(event, handler, context = null, priority = 0) {
    const wrapper = (data) => {
      this.off(event, wrapper);
      handler.call(context, data);
    };
    return this.on(event, wrapper, context, priority);
  }

  off(event, handler) {
    if (event === '*' || event === '**') {
      this._wildcardHandlers = this._wildcardHandlers.filter(
        (h) => h.handler !== handler
      );
      return;
    }

    const handlers = this._handlers.get(event);
    if (!handlers) return;

    const filtered = handlers.filter((h) => h.handler !== handler);
    if (filtered.length === 0) {
      this._handlers.delete(event);
    } else {
      this._handlers.set(event, filtered);
    }
  }

  emit(event, data = null) {
    const handlers = this._handlers.get(event);
    if (handlers) {
      for (const { handler, context } of handlers) {
        try {
          handler.call(context, data);
        } catch (error) {
          logger.error(`EventBus: error in handler for "${event}":`, error);
        }
      }
    }

    for (const wh of this._wildcardHandlers) {
      try {
        wh.handler.call(wh.context, { event, data });
      } catch (error) {
        logger.error(`EventBus: error in wildcard handler for "${event}":`, error);
      }
    }
  }

  async emitAsync(event, data = null) {
    const promises = [];

    const handlers = this._handlers.get(event);
    if (handlers) {
      for (const { handler, context } of handlers) {
        try {
          promises.push(Promise.resolve(handler.call(context, data)));
        } catch (error) {
          logger.error(`EventBus: async error in handler for "${event}":`, error);
        }
      }
    }

    for (const wh of this._wildcardHandlers) {
      try {
        promises.push(Promise.resolve(wh.handler.call(wh.context, { event, data })));
      } catch (error) {
        logger.error(`EventBus: async error in wildcard handler for "${event}":`, error);
      }
    }

    await Promise.allSettled(promises);
  }

  clear() {
    this._handlers.clear();
    this._wildcardHandlers = [];
  }

  listenerCount(event) {
    const handlers = this._handlers.get(event);
    return handlers ? handlers.length : 0;
  }

  getEvents() {
    return Array.from(this._handlers.keys());
  }
}
