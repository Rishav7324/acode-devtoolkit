import { PLUGIN_ID } from '../utils/constants.js';
import { logger } from '../utils/logger.js';

const DEFAULTS = {
  env: 'production',
  logLevel: 'info',
  theme: 'auto',
  lazyModules: true,
  maxSearchResults: 50,
  searchDebounceMs: 200,
  toastDurationMs: 3000,
  enableTelemetry: false,
  settingsVersion: 1,
};

let _instance = null;

export class ConfigManager {
  constructor() {
    if (_instance) return _instance;
    this._config = { ...DEFAULTS };
    this._overrides = {};
    this._detectEnv();
    _instance = this;
  }

  _detectEnv() {
    const urlParams = new URLSearchParams(window.location.search);
    const isDev = urlParams.get('dev') === '1' ||
      window.location.hostname === 'localhost' ||
      window.location.hostname === '127.0.0.1' ||
      process.env?.NODE_ENV === 'development';
    this._config.env = isDev ? 'development' : 'production';
    if (isDev) {
      this._config.logLevel = 'debug';
    }
  }

  get(key) {
    if (key in this._overrides) return this._overrides[key];
    return this._config[key];
  }

  set(key, value) {
    this._overrides[key] = value;
  }

  getAll() {
    return { ...this._config, ...this._overrides };
  }

  reset(key) {
    delete this._overrides[key];
  }

  resetAll() {
    this._overrides = {};
  }

  isDev() {
    return this._config.env === 'development';
  }

  isProd() {
    return this._config.env === 'production';
  }

  static getInstance() {
    if (!_instance) {
      _instance = new ConfigManager();
    }
    return _instance;
  }

  static destroy() {
    _instance = null;
  }
}
