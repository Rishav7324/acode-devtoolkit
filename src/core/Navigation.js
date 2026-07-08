import { logger } from '../utils/logger.js';

export class Navigation {
  constructor(eventBus, accessibility) {
    this._eventBus = eventBus;
    this._accessibility = accessibility;
    this._routes = new Map();
    this._history = [];
    this._current = null;
  }

  register(name, factory, options = {}) {
    if (this._routes.has(name)) {
      logger.warn(`Navigation: route "${name}" already registered, overwriting`);
    }

    this._routes.set(name, {
      factory: typeof factory === 'function' ? factory : () => factory,
      title: options.title || name,
      icon: options.icon || '',
    });

    this._eventBus.emit('navigation:registered', { name });
  }

  navigate(name, params = {}) {
    const route = this._routes.get(name);
    if (!route) {
      logger.error(`Navigation: route "${name}" not found`);
      return null;
    }

    try {
      const page = route.factory(params);

      if (this._current) {
        this._history.push(this._current);
      }

      this._current = { name, params, page, timestamp: Date.now() };
      this._eventBus.emit('navigation:changed', {
        from: this._history.length > 0 ? this._history[this._history.length - 1]?.name : null,
        to: name,
        params,
      });

      if (this._accessibility) {
        this._accessibility.announce(`Navigated to ${route.title}`);
      }

      return page;
    } catch (error) {
      logger.error(`Navigation: failed to navigate to "${name}":`, error);
      return null;
    }
  }

  back() {
    if (this._history.length === 0) {
      logger.debug('Navigation: no history to go back to');
      return null;
    }

    const previous = this._history.pop();
    this._current = previous;
    this._eventBus.emit('navigation:changed', {
      from: null,
      to: previous.name,
      params: previous.params,
    });

    return previous.page;
  }

  getCurrent() {
    return this._current ? { ...this._current } : null;
  }

  canGoBack() {
    return this._history.length > 0;
  }

  getHistory() {
    return [...this._history];
  }

  getRoute(name) {
    return this._routes.get(name) || null;
  }

  hasRoute(name) {
    return this._routes.has(name);
  }

  clear() {
    this._history = [];
    this._current = null;
  }

  destroy() {
    this.clear();
    this._routes.clear();
    this._eventBus = null;
    this._accessibility = null;
  }
}
