import { logger } from './logger.js';

export function createModule(descriptor) {
  const defaults = {
    name: descriptor.id || 'unnamed',
    description: '',
    author: '',
    category: 'developer',
    icon: '\u2699',
    permissions: [],
    dependencies: { required: [], optional: [] },
    commands: [],
    settings: [],
    searchEntries: [],
    actions: [],
    startup: null,
    shutdown: null,
    cleanup: null,
  };

  const module = { ...defaults, ...descriptor };

  if (!module.startup && !module.shutdown && !module.cleanup) {
    logger.warn(`SDK: module "${module.id}" has no lifecycle hooks`);
  }

  return module;
}

export function defineCommand(name, options = {}) {
  return {
    name,
    description: options.description || '',
    exec: options.exec || null,
  };
}

export function defineSetting(key, options = {}) {
  return {
    key,
    value: options.default ?? null,
    label: options.label || key,
    description: options.description || '',
    cb: options.onChange || null,
  };
}

export function defineSearchEntry(keywords, options = {}) {
  return {
    keywords: Array.isArray(keywords) ? keywords : [keywords],
    handler: options.handler || null,
    priority: options.priority || 0,
    category: options.category || 'general',
  };
}

export function createLocalizedStore(translations, locale = null) {
  const getLocale = () => locale || (typeof navigator !== 'undefined' ? navigator.language?.split('-')[0] : 'en');

  return {
    t(key, params = {}) {
      const loc = getLocale();
      const table = translations[loc] || translations.en || translations;
      let text = table[key] || key;
      for (const [k, v] of Object.entries(params)) {
        text = text.replace(`{${k}}`, String(v));
      }
      return text;
    },
    setLocale(loc) {
      locale = loc;
    },
    getLocale,
    getAvailableLocales() {
      return Object.keys(translations);
    },
  };
}

export function createTimedCache(ttl = 60000) {
  const store = new Map();
  return {
    get(key) {
      const entry = store.get(key);
      if (!entry) return undefined;
      if (Date.now() > entry.expiresAt) {
        store.delete(key);
        return undefined;
      }
      return entry.value;
    },
    set(key, value) {
      store.set(key, { value, expiresAt: Date.now() + ttl });
    },
    has(key) { return this.get(key) !== undefined; },
    delete(key) { store.delete(key); },
    clear() { store.clear(); },
  };
}
