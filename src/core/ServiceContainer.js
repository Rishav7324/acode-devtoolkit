import { logger } from '../utils/logger.js';

const LIFETIME = {
  SINGLETON: 'singleton',
  SCOPED: 'scoped',
  TRANSIENT: 'transient',
};

export class ServiceContainer {
  constructor(parent = null) {
    this._parent = parent;
    this._services = new Map();
    this._singletons = new Map();
    this._cleanups = new Map();
    this._resolving = new Set();
  }

  register(name, factory, options = {}) {
    if (this._services.has(name)) {
      logger.warn(`ServiceContainer: "${name}" already registered, overwriting`);
    }

    this._services.set(name, {
      factory: typeof factory === 'function' ? factory : () => factory,
      lifetime: options.lifetime || LIFETIME.SINGLETON,
      dependencies: options.dependencies || [],
      cleanup: options.cleanup || null,
    });
  }

  registerInstance(name, instance) {
    this._singletons.set(name, instance);
    this._services.set(name, {
      factory: () => instance,
      lifetime: LIFETIME.SINGLETON,
      dependencies: [],
      cleanup: null,
    });
  }

  get(name) {
    if (this._resolving.has(name)) {
      throw new Error(`ServiceContainer: circular dependency detected for "${name}"`);
    }

    if (this._singletons.has(name)) {
      return this._singletons.get(name);
    }

    const descriptor = this._services.get(name);
    if (descriptor) {
      if (descriptor.lifetime === LIFETIME.TRANSIENT) {
        return this._createInstance(name, descriptor);
      }
      if (descriptor.lifetime === LIFETIME.SINGLETON && this._singletons.has(name)) {
        return this._singletons.get(name);
      }
      if (descriptor.lifetime === LIFETIME.SINGLETON) {
        const instance = this._createInstance(name, descriptor);
        this._singletons.set(name, instance);
        return instance;
      }
    }

    if (this._parent) {
      return this._parent.get(name);
    }

    throw new Error(`ServiceContainer: "${name}" is not registered`);
  }

  getScoped(name) {
    const descriptor = this._services.get(name);
    if (descriptor && descriptor.lifetime === LIFETIME.SCOPED) {
      return this._createInstance(name, descriptor);
    }
    return this.get(name);
  }

  _createInstance(name, descriptor) {
    this._resolving.add(name);

    try {
      const deps = descriptor.dependencies.map((dep) => this.get(dep));
      const instance = descriptor.factory(...deps);

      if (descriptor.cleanup && descriptor.lifetime !== LIFETIME.TRANSIENT) {
        this._cleanups.set(name, { fn: descriptor.cleanup, instance });
      }

      return instance;
    } finally {
      this._resolving.delete(name);
    }
  }

  has(name) {
    return this._services.has(name) || (this._parent && this._parent.has(name));
  }

  getAll() {
    const services = {};
    for (const name of this._services.keys()) {
      try {
        services[name] = this.get(name);
      } catch (error) {
        logger.warn(`ServiceContainer: failed to resolve "${name}" in getAll():`, error);
      }
    }
    if (this._parent) {
      Object.assign(services, this._parent.getAll());
    }
    return services;
  }

  createScope() {
    return new ServiceContainer(this);
  }

  destroy() {
    for (const [name, { fn, instance }] of this._cleanups) {
      try {
        fn(instance);
      } catch (error) {
        logger.error(`ServiceContainer: cleanup failed for "${name}":`, error);
      }
    }
    this._singletons.clear();
    this._cleanups.clear();
    this._services.clear();
    this._resolving.clear();
  }
}

export { LIFETIME };
