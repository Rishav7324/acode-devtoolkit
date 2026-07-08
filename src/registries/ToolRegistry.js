import { logger } from '../utils/logger.js';

export class ToolRegistry {
  constructor(categories = []) {
    this._tools = new Map();
    this._categories = categories;
  }

  register(tool) {
    if (!tool || !tool.id) {
      logger.warn('ToolRegistry: tool must have an id');
      return;
    }
    const existing = this._tools.get(tool.id);
    this._tools.set(tool.id, {
      id: tool.id,
      icon: tool.icon || '',
      title: tool.title || tool.id,
      description: tool.description || '',
      category: tool.category || 'developer',
      keywords: tool.keywords || [],
      favorite: tool.favorite === true,
      launch: tool.launch || (existing && existing.launch) || null,
    });
  }

  unregister(id) {
    this._tools.delete(id);
  }

  get(id) {
    return this._tools.get(id);
  }

  getAll() {
    return Array.from(this._tools.values());
  }

  getCategories() {
    return this._categories;
  }

  getByCategory() {
    const grouped = {};
    for (const cat of this._categories) {
      grouped[cat.id] = {
        label: cat.label,
        tools: [],
      };
    }
    for (const tool of this._tools.values()) {
      const catId = tool.category;
      if (grouped[catId]) {
        grouped[catId].tools.push(tool);
      }
    }
    return grouped;
  }

  search(query) {
    const q = query.toLowerCase().trim();
    if (!q) return [];
    const results = [];
    for (const tool of this._tools.values()) {
      if (
        tool.title.toLowerCase().includes(q) ||
        tool.description.toLowerCase().includes(q) ||
        tool.category.toLowerCase().includes(q) ||
        tool.keywords.some(k => k.toLowerCase().includes(q))
      ) {
        results.push(tool);
      }
    }
    return results;
  }

  getRecentlyUsed() {
    const all = this.getAll();
    return all.slice(0, 4);
  }

  launch(id) {
    const tool = this._tools.get(id);
    if (tool && typeof tool.launch === 'function') {
      tool.launch();
    } else {
      logger.warn(`ToolRegistry: no launch handler for "${id}"`);
    }
  }

  hasLaunchHandler(id) {
    const tool = this._tools.get(id);
    return tool && typeof tool.launch === 'function';
  }

  clear() {
    this._tools.clear();
  }
}
