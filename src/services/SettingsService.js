import { SETTINGS_KEY } from '../utils/constants.js';
import { logger } from '../utils/logger.js';

export class SettingsService {
  constructor() {
    this._handlers = new Map();
    this._defaults = {};
  }

  registerSettings(moduleId, items) {
    if (!items || items.length === 0) return;

    try {
      const settings = acode.require('settings');
      if (!settings.value[SETTINGS_KEY]) {
        settings.value[SETTINGS_KEY] = {};
      }

      for (const item of items) {
        const fullKey = `${moduleId}.${item.key}`;
        settings.value[SETTINGS_KEY][fullKey] =
          settings.value[SETTINGS_KEY][fullKey] ?? item.value;
        this._defaults[fullKey] = item.value;

        if (item.cb) {
          this._handlers.set(fullKey, item.cb);
        }
      }
    } catch (error) {
      logger.error(`SettingsService: failed to register for "${moduleId}":`, error);
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
      logger.error(`SettingsService: failed to set "${fullKey}":`, error);
    }
  }

  destroy() {
    this._handlers.clear();
    this._defaults = {};
  }
}
