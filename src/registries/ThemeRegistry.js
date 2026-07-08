import { logger } from '../utils/logger.js';

export class ThemeRegistry {
  constructor() {
    this._variables = new Map();
  }

  register(moduleId, variables) {
    this._variables.set(moduleId, variables);
    this._apply(variables);
  }

  _apply(variables) {
    const root = document.documentElement;
    for (const [key, value] of Object.entries(variables)) {
      root.style.setProperty(key, value);
    }
  }

  _unapply(moduleId) {
    const variables = this._variables.get(moduleId);
    if (!variables) return;
    const root = document.documentElement;
    for (const key of Object.keys(variables)) {
      root.style.removeProperty(key);
    }
  }

  getByModule(moduleId) {
    return this._variables.get(moduleId) || null;
  }

  unregisterByModule(moduleId) {
    this._unapply(moduleId);
    this._variables.delete(moduleId);
  }

  clear() {
    const ids = Array.from(this._variables.keys());
    for (const id of ids) {
      this._unapply(id);
    }
    this._variables.clear();
  }
}
