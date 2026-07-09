import { logger } from './logger.js';

export function createTool(config) {
  const {
    id,
    slug,
    name,
    description,
    icon,
    category,
    keywords = [],
    version = '1.0.0',
    author = 'DevToolkit Contributors',
    homepage = '',
    permissions = [],
    tags = [],
    experimental = false,
    hidden = false,
    enabled = true,
    show,
    onInit,
    onDestroy,
    onDispose,
    renderSettings,
    customSearch,
    customValidate,
  } = config;

  if (!show) {
    throw new Error(`createTool: "${id}" must provide a "show" function`);
  }

  let _state = 'registered';
  let _context = null;
  let _cleanup = null;

  const tool = {
    id,
    slug: slug || id,
    name,
    description,
    icon,
    category,
    keywords,
    version,
    author,
    homepage,
    permissions,
    tags,
    experimental,
    hidden,
    enabled,

    get state() { return _state; },

    _source: `tool:${id}`,

    async initialize(context) {
      if (_state !== 'registered') return;
      _context = context;
      _state = 'initializing';
      try {
        if (typeof onInit === 'function') {
          await onInit(context);
        }
        _state = 'initialized';
        logger.debug(`Tool "${id}": initialized`);
      } catch (error) {
        _state = 'error';
        logger.error(`Tool "${id}": initialization failed:`, error);
        throw error;
      }
    },

    launch({ editor, settings, container } = {}) {
      if (_state === 'registered') {
        _state = 'initialized';
      }
      _state = 'active';
      const result = show({ editor, settings, container });
      if (typeof result === 'function') {
        _cleanup = result;
      }
      logger.debug(`Tool "${id}": launched`);
      return result;
    },

    render(container) {
      return show({ container });
    },

    destroy() {
      if (typeof _cleanup === 'function') {
        try { _cleanup(); } catch (e) { logger.warn(`Tool "${id}": cleanup error:`, e); }
        _cleanup = null;
      }
      if (typeof onDestroy === 'function') {
        try { onDestroy(); } catch (e) { logger.warn(`Tool "${id}": destroy error:`, e); }
      }
      _state = 'destroyed';
      logger.debug(`Tool "${id}": destroyed`);
    },

    dispose() {
      this.destroy();
      _context = null;
      if (typeof onDispose === 'function') {
        try { onDispose(); } catch (e) { logger.warn(`Tool "${id}": dispose error:`, e); }
      }
      _state = 'disposed';
      logger.debug(`Tool "${id}": disposed`);
    },

    settings() {
      if (typeof renderSettings === 'function') {
        return renderSettings();
      }
      return [];
    },

    search(query) {
      if (typeof customSearch === 'function') {
        return customSearch(query);
      }
      const q = query.toLowerCase();
      const results = [];
      if (name.toLowerCase().includes(q)) results.push({ type: 'tool', id, label: name });
      if (description.toLowerCase().includes(q)) results.push({ type: 'tool', id, label: name });
      for (const kw of keywords) {
        if (kw.toLowerCase().includes(q)) {
          results.push({ type: 'tool', id, label: name, keyword: kw });
          break;
        }
      }
      return results;
    },

    validate() {
      const errors = [];
      if (!id) errors.push('Missing "id"');
      if (!name) errors.push('Missing "name"');
      if (typeof show !== 'function') errors.push('"show" must be a function');
      if (customValidate) {
        try {
          const customErrors = customValidate();
          if (Array.isArray(customErrors)) errors.push(...customErrors);
        } catch (e) {
          errors.push(`Custom validation error: ${e.message}`);
        }
      }
      return errors;
    },
  };

  return tool;
}
