import { SETTINGS_KEY } from '../utils/constants.js';
import { logger } from '../utils/logger.js';

export class SettingsRegistry {
  constructor() {
    this._entries = new Map();
    this._handlers = new Map();
    this._defaults = {};
  }

  register(moduleId, items) {
    if (!items || items.length === 0) return;

    this._entries.set(moduleId, items);

    try {
      const settings = acode.require('settings');
      if (!settings.value[SETTINGS_KEY]) {
        settings.value[SETTINGS_KEY] = {};
      }

      for (const item of items) {
        const key = `${moduleId}.${item.key}`;
        settings.value[SETTINGS_KEY][key] =
          settings.value[SETTINGS_KEY][key] ?? item.value;
        this._defaults[key] = item.value;

        if (item.cb) {
          this._handlers.set(key, item.cb);
        }
      }
    } catch (error) {
      logger.error(`SettingsRegistry: failed to register for "${moduleId}":`, error);
    }
  }

  get(moduleId, key) {
    const fullKey = `${moduleId}.${key}`;
    try {
      const settings = acode.require('settings');
      const stored = settings.value[SETTINGS_KEY];
      return stored ? stored[fullKey] : this._defaults[fullKey];
    } catch (error) {
      return this._defaults[fullKey];
    }
  }

  set(moduleId, key, value) {
    const fullKey = `${moduleId}.${key}`;
    try {
      const settings = acode.require('settings');
      if (!settings.value[SETTINGS_KEY]) {
        settings.value[SETTINGS_KEY] = {};
      }
      settings.value[SETTINGS_KEY][fullKey] = value;

      const handler = this._handlers.get(fullKey);
      if (handler) {
        handler(key, value);
      }
    } catch (error) {
      logger.error(`SettingsRegistry: failed to set "${fullKey}":`, error);
    }
  }

  getByModule(moduleId) {
    return this._entries.get(moduleId) || [];
  }

  unregisterByModule(moduleId) {
    this._entries.delete(moduleId);
    const keysToRemove = [];
    for (const key of this._handlers.keys()) {
      if (key.startsWith(`${moduleId}.`)) {
        keysToRemove.push(key);
      }
    }
    for (const key of keysToRemove) {
      this._handlers.delete(key);
      delete this._defaults[key];
    }
  }

  clear() {
    this._entries.clear();
    this._handlers.clear();
    this._defaults = {};
  }
}
