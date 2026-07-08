import { logger } from '../utils/logger.js';

export class ActionRegistry {
  constructor() {
    this._actions = new Map();
  }

  register(moduleId, actions) {
    if (!actions || actions.length === 0) return;

    for (const action of actions) {
      const { id, label, icon, handler, category } = action;
      if (!id) {
        logger.error(`ActionRegistry: action must have an id (module: ${moduleId})`);
        continue;
      }

      const key = `${moduleId}:${id}`;
      this._actions.set(key, { moduleId, id, label, icon, handler, category });
    }
  }

  getAll(category = null) {
    const result = [];
    for (const action of this._actions.values()) {
      if (!category || action.category === category) {
        result.push(action);
      }
    }
    return result;
  }

  execute(moduleId, actionId) {
    const key = `${moduleId}:${actionId}`;
    const action = this._actions.get(key);
    if (!action) {
      logger.warn(`ActionRegistry: action "${key}" not found`);
      return;
    }
    if (typeof action.handler === 'function') {
      action.handler();
    }
  }

  getByModule(moduleId) {
    const result = [];
    for (const action of this._actions.values()) {
      if (action.moduleId === moduleId) {
        result.push(action);
      }
    }
    return result;
  }

  unregisterByModule(moduleId) {
    const keysToRemove = [];
    for (const key of this._actions.keys()) {
      if (key.startsWith(`${moduleId}:`)) {
        keysToRemove.push(key);
      }
    }
    for (const key of keysToRemove) {
      this._actions.delete(key);
    }
  }

  clear() {
    this._actions.clear();
  }
}
