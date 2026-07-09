import { logger } from '../utils/logger.js';

const REQUIRED_METHODS = ['launch', 'destroy', 'initialize', 'dispose', 'render', 'settings', 'search', 'validate'];
const REQUIRED_FIELDS = ['id', 'slug', 'name', 'description', 'icon', 'category'];
const MAX_RECENT = 10;

export class ToolRegistry {
  constructor(categories = []) {
    this._tools = new Map();
    this._categories = categories;
    this._recent = [];
    this._favorites = new Set();
    this._searchIndex = new Map();
    this._validationErrors = [];
  }

  register(toolDef) {
    const errors = this._validateDefinition(toolDef);
    if (errors.length > 0) {
      this._validationErrors.push({ id: toolDef?.id || 'unknown', errors });
      logger.error(`ToolRegistry: registration failed for "${toolDef?.id || 'unknown'}"`);
      for (const err of errors) {
        logger.error(`  - ${err}`);
      }
      return { success: false, errors };
    }

    const duplicate = this._tools.get(toolDef.id);
    if (duplicate) {
      if (duplicate._source === toolDef._source) {
        logger.debug(`ToolRegistry: "${toolDef.id}" already registered, skipping`);
        return { success: true, existing: true };
      }
      const msg = `Duplicate tool ID "${toolDef.id}" from "${toolDef._source || 'unknown'}", already registered by "${duplicate._source || 'unknown'}"`;
      this._validationErrors.push({ id: toolDef.id, errors: [msg] });
      logger.error(`ToolRegistry: ${msg}`);
      return { success: false, errors: [msg], duplicate: true };
    }

    const tool = this._createToolRecord(toolDef);
    this._tools.set(toolDef.id, tool);
    this._indexSearchTerms(toolDef.id, toolDef);
    logger.info(`ToolRegistry: registered "${toolDef.id}" v${toolDef.version || '1.0.0'}`);
    return { success: true };
  }

  _validateDefinition(def) {
    const errors = [];
    if (!def || typeof def !== 'object') {
      errors.push('Tool definition must be a non-null object');
      return errors;
    }
    for (const field of REQUIRED_FIELDS) {
      if (!def[field] || typeof def[field] !== 'string' || !def[field].trim()) {
        errors.push(`Missing or invalid required field: "${field}"`);
      }
    }
    for (const method of REQUIRED_METHODS) {
      if (method in def && typeof def[method] !== 'function') {
        errors.push(`"${method}" must be a function, got ${typeof def[method]}`);
      }
    }
    if (def.slug && typeof def.slug !== 'string') {
      errors.push('"slug" must be a string');
    }
    if (def.tags && !Array.isArray(def.tags)) {
      errors.push('"tags" must be an array');
    }
    if (def.permissions && !Array.isArray(def.permissions)) {
      errors.push('"permissions" must be an array');
    }
    if (def.keywords && !Array.isArray(def.keywords)) {
      errors.push('"keywords" must be an array');
    }
    if (def.category && !this._categories.some(c => c.id === def.category)) {
      errors.push(`Unknown category "${def.category}". Valid: ${this._categories.map(c => c.id).join(', ')}`);
    }
    return errors;
  }

  _createToolRecord(def) {
    return {
      id: def.id,
      slug: def.slug || def.id,
      name: def.name,
      description: def.description,
      icon: def.icon,
      category: def.category,
      keywords: def.keywords || [],
      version: def.version || '1.0.0',
      author: def.author || '',
      homepage: def.homepage || '',
      permissions: def.permissions || [],
      tags: def.tags || [],
      experimental: def.experimental === true,
      hidden: def.hidden === true,
      enabled: def.enabled !== false,
      favorite: def.favorite === true,
      launch: def.launch,
      destroy: def.destroy,
      initialize: def.initialize,
      dispose: def.dispose,
      render: def.render,
      settings: def.settings,
      search: def.search,
      validate: def.validate,
      _state: 'registered',
      _source: def._source || '',
    };
  }

  _indexSearchTerms(id, def) {
    const terms = new Set();
    const add = (t) => { if (t && typeof t === 'string') terms.add(t.toLowerCase().trim()); };
    add(def.name);
    add(def.description);
    add(def.slug);
    add(def.category);
    (def.keywords || []).forEach(add);
    (def.tags || []).forEach(add);
    for (const term of terms) {
      if (!this._searchIndex.has(term)) {
        this._searchIndex.set(term, []);
      }
      this._searchIndex.get(term).push(id);
    }
  }

  get(id) {
    return this._tools.get(id) || null;
  }

  getAll() {
    return Array.from(this._tools.values());
  }

  getEnabled() {
    return this.getAll().filter(t => t.enabled && !t.hidden);
  }

  getByCategory() {
    const grouped = {};
    for (const cat of this._categories) {
      grouped[cat.id] = { label: cat.label, tools: [] };
    }
    for (const tool of this._tools.values()) {
      if (tool.hidden) continue;
      const catId = tool.category;
      if (grouped[catId]) {
        grouped[catId].tools.push(tool);
      }
    }
    return grouped;
  }

  getCategories() {
    return this._categories;
  }

  search(query) {
    const q = query.toLowerCase().trim();
    if (!q) return [];
    const scored = new Map();
    for (const [term, ids] of this._searchIndex) {
      if (term.includes(q) || q.includes(term)) {
        for (const id of ids) {
          scored.set(id, (scored.get(id) || 0) + 1);
        }
      }
    }
    const results = Array.from(scored.entries());
    results.sort((a, b) => b[1] - a[1]);
    return results
      .map(([id]) => this._tools.get(id))
      .filter(t => t && !t.hidden && t.enabled);
  }

  markRecent(id) {
    this._recent = this._recent.filter(t => t !== id);
    this._recent.unshift(id);
    if (this._recent.length > MAX_RECENT) {
      this._recent.pop();
    }
  }

  getRecent() {
    return this._recent
      .map(id => this._tools.get(id))
      .filter(t => t && !t.hidden && t.enabled);
  }

  toggleFavorite(id) {
    const tool = this._tools.get(id);
    if (!tool) return false;
    if (this._favorites.has(id)) {
      this._favorites.delete(id);
      tool.favorite = false;
    } else {
      this._favorites.add(id);
      tool.favorite = true;
    }
    return tool.favorite;
  }

  getFavorites() {
    return Array.from(this._favorites)
      .map(id => this._tools.get(id))
      .filter(t => t && !t.hidden && t.enabled);
  }

  isFavorite(id) {
    return this._favorites.has(id);
  }

  launch(id, args = {}) {
    const tool = this._tools.get(id);
    if (!tool) {
      return { success: false, error: 'NOT_FOUND', message: `Tool "${id}" not found` };
    }
    if (!tool.enabled) {
      return { success: false, error: 'DISABLED', message: `Tool "${id}" is disabled` };
    }
    if (typeof tool.launch !== 'function') {
      return {
        success: false,
        error: 'NO_LAUNCH_HANDLER',
        message: `Tool "${tool.name}" has no launch handler`,
        suggestion: 'Ensure the tool definition exports a "launch" function',
        tool: tool.name,
        missingFunction: 'launch',
      };
    }
    try {
      this.markRecent(id);
      const result = tool.launch(args);
      return { success: true, result };
    } catch (error) {
      return {
        success: false,
        error: 'LAUNCH_FAILED',
        message: error.message || 'Unknown launch error',
        stack: error.stack,
        tool: tool.name,
      };
    }
  }

  getValidationErrors() {
    return this._validationErrors;
  }

  clear() {
    this._tools.clear();
    this._recent = [];
    this._favorites.clear();
    this._searchIndex.clear();
    this._validationErrors = [];
  }
}
