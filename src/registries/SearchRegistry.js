import { logger } from '../utils/logger.js';

export class SearchRegistry {
  constructor() {
    this._providers = new Map();
  }

  register(moduleId, entries) {
    if (!entries || entries.length === 0) return;

    for (const entry of entries) {
      const { keywords, handler, priority = 0 } = entry;
      if (!keywords || keywords.length === 0) {
        logger.warn(`SearchRegistry: entry without keywords (module: ${moduleId})`);
        continue;
      }

      const key = `${moduleId}:${keywords[0]}`;
      this._providers.set(key, { moduleId, keywords, handler, priority });
    }
  }

  search(query) {
    const q = query.toLowerCase().trim();
    if (!q) return [];

    const results = [];

    for (const entry of this._providers.values()) {
      for (const keyword of entry.keywords) {
        if (keyword.toLowerCase().includes(q)) {
          results.push({
            moduleId: entry.moduleId,
            keyword,
            priority: entry.priority,
            handler: entry.handler,
            score: entry.priority + (keyword.toLowerCase() === q ? 10 : 0),
          });
          break;
        }
      }
    }

    results.sort((a, b) => b.score - a.score);
    return results;
  }

  getByModule(moduleId) {
    const result = [];
    for (const entry of this._providers.values()) {
      if (entry.moduleId === moduleId) {
        result.push(entry);
      }
    }
    return result;
  }

  unregisterByModule(moduleId) {
    const keysToRemove = [];
    for (const key of this._providers.keys()) {
      if (key.startsWith(`${moduleId}:`)) {
        keysToRemove.push(key);
      }
    }
    for (const key of keysToRemove) {
      this._providers.delete(key);
    }
  }

  clear() {
    this._providers.clear();
  }
}
