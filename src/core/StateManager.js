import { logger } from '../utils/logger.js';

class Store {
  constructor(name, initialState = {}) {
    this._name = name;
    this._state = { ...initialState };
    this._listeners = new Set();
    this._prevState = null;
  }

  getState() {
    return { ...this._state };
  }

  setState(partial) {
    this._prevState = { ...this._state };
    const changed = {};

    for (const key of Object.keys(partial)) {
      if (this._state[key] !== partial[key]) {
        this._state[key] = partial[key];
        changed[key] = { from: this._prevState[key], to: partial[key] };
      }
    }

    if (Object.keys(changed).length > 0) {
      this._notify(changed);
    }
  }

  subscribe(listener) {
    this._listeners.add(listener);
    return () => this._listeners.delete(listener);
  }

  reset() {
    this._prevState = { ...this._state };
    this._state = {};
    this._notify({});
  }

  _notify(changed) {
    for (const listener of this._listeners) {
      try {
        listener(this.getState(), changed);
      } catch (error) {
        logger.error(`StateManager: store "${this._name}" listener error:`, error);
      }
    }
  }

  get name() {
    return this._name;
  }
}

export class StateManager {
  constructor() {
    this._stores = new Map();
  }

  createStore(name, initialState = {}) {
    if (this._stores.has(name)) {
      logger.warn(`StateManager: store "${name}" already exists, returning existing`);
      return this._stores.get(name);
    }

    const store = new Store(name, initialState);
    this._stores.set(name, store);
    return store;
  }

  getStore(name) {
    return this._stores.get(name) || null;
  }

  hasStore(name) {
    return this._stores.has(name);
  }

  destroy() {
    this._stores.clear();
  }
}
