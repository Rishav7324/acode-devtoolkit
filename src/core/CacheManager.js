import { logger } from '../utils/logger.js';

export class CacheManager {
  constructor() {
    this._store = new Map();
    this._timers = new Map();
  }

  set(key, value, ttl = 0) {
    this._store.set(key, {
      value,
      expiresAt: ttl > 0 ? Date.now() + ttl : 0,
    });

    if (ttl > 0) {
      const timer = setTimeout(() => {
        this._store.delete(key);
        this._timers.delete(key);
      }, ttl);
      this._timers.set(key, timer);
    }
  }

  get(key) {
    const entry = this._store.get(key);
    if (!entry) return undefined;

    if (entry.expiresAt > 0 && Date.now() > entry.expiresAt) {
      this._store.delete(key);
      this._clearTimer(key);
      return undefined;
    }

    return entry.value;
  }

  has(key) {
    return this.get(key) !== undefined;
  }

  delete(key) {
    this._store.delete(key);
    this._clearTimer(key);
  }

  clearByPrefix(prefix) {
    const toDelete = [];
    for (const key of this._store.keys()) {
      if (key.startsWith(prefix)) {
        toDelete.push(key);
      }
    }
    for (const key of toDelete) {
      this.delete(key);
    }
    return toDelete.length;
  }

  clear() {
    this._store.clear();
    for (const timer of this._timers.values()) {
      clearTimeout(timer);
    }
    this._timers.clear();
  }

  get size() {
    return this._store.size;
  }

  keys() {
    return Array.from(this._store.keys());
  }

  _clearTimer(key) {
    const timer = this._timers.get(key);
    if (timer) {
      clearTimeout(timer);
      this._timers.delete(key);
    }
  }
}
