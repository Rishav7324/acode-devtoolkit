import { logger } from '../utils/logger.js';

export class ServiceRegistry {
  constructor() {
    this._services = new Map();
  }

  register(moduleId, name, service) {
    const key = `${moduleId}:${name}`;
    if (this._services.has(key)) {
      logger.warn(`ServiceRegistry: "${key}" already registered, overwriting`);
    }
    this._services.set(key, service);
  }

  get(moduleId, name) {
    const key = `${moduleId}:${name}`;
    return this._services.get(key) || null;
  }

  getAllFromModule(moduleId) {
    const result = {};
    for (const [key, service] of this._services) {
      if (key.startsWith(`${moduleId}:`)) {
        const name = key.slice(moduleId.length + 1);
        result[name] = service;
      }
    }
    return result;
  }

  unregisterByModule(moduleId) {
    const keysToRemove = [];
    for (const key of this._services.keys()) {
      if (key.startsWith(`${moduleId}:`)) {
        keysToRemove.push(key);
      }
    }
    for (const key of keysToRemove) {
      this._services.delete(key);
    }
  }

  clear() {
    this._services.clear();
  }
}
