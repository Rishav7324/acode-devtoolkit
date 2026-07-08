import { logger } from '../utils/logger.js';

export class StorageRegistry {
  constructor() {
    this._stores = new Map();
  }

  register(moduleId, storage = {}) {
    if (this._stores.has(moduleId)) {
      logger.warn(`StorageRegistry: storage already exists for "${moduleId}", merging`);
      const existing = this._stores.get(moduleId);
      Object.assign(existing, storage);
    } else {
      this._stores.set(moduleId, { ...storage });
    }
  }

  get(moduleId) {
    if (!this._stores.has(moduleId)) {
      this._stores.set(moduleId, {});
    }
    return this._stores.get(moduleId);
  }

  setItem(moduleId, key, value) {
    const store = this.get(moduleId);
    store[key] = value;
  }

  getItem(moduleId, key) {
    const store = this.get(moduleId);
    return store[key];
  }

  removeItem(moduleId, key) {
    const store = this._stores.get(moduleId);
    if (store) {
      delete store[key];
    }
  }

  unregisterByModule(moduleId) {
    this._stores.delete(moduleId);
  }

  clear() {
    this._stores.clear();
  }
}
