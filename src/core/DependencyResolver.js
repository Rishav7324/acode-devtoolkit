import { logger } from '../utils/logger.js';
import { CircularDependencyError, DependencyError } from '../utils/errors.js';

export class DependencyResolver {
  constructor() {
    this._moduleMap = new Map();
  }

  loadModules(allModules) {
    this._moduleMap.clear();
    for (const mod of allModules) {
      this._moduleMap.set(mod.id, mod);
    }
  }

  resolve(moduleId, allModules, dependencyField = 'dependencies') {
    const visited = new Set();
    const visiting = new Set();
    const order = [];
    const map = new Map(allModules.map((m) => [m.id, m]));

    const visit = (currentId, chain) => {
      if (visiting.has(currentId)) {
        throw new CircularDependencyError(currentId, currentId, [...chain, currentId]);
      }
      if (visited.has(currentId)) return;

      const mod = map.get(currentId);
      if (!mod) return;

      visiting.add(currentId);
      chain.push(currentId);

      const deps = mod[dependencyField];
      if (deps) {
        for (const depId of deps.required || []) {
          if (!map.has(depId)) {
            throw new DependencyError(currentId, depId, `Required dependency not found`);
          }
          visit(depId, chain);
        }

        for (const depId of deps.optional || []) {
          if (map.has(depId)) {
            visit(depId, chain);
          }
        }
      }

      visiting.delete(currentId);
      visited.add(currentId);
      order.push(currentId);
      chain.pop();
    };

    visit(moduleId, []);
    return order;
  }

  resolveAll(allModules, dependencyField = 'dependencies') {
    this.loadModules(allModules);
    const allIds = Array.from(this._moduleMap.keys());
    const visited = new Set();
    const visiting = new Set();
    const order = [];

    const visit = (currentId, chain) => {
      if (visiting.has(currentId)) {
        throw new CircularDependencyError(currentId, currentId, [...chain, currentId]);
      }
      if (visited.has(currentId)) return;

      const mod = this._moduleMap.get(currentId);
      if (!mod) return;

      visiting.add(currentId);
      chain.push(currentId);

      const deps = mod[dependencyField];
      if (deps) {
        for (const depId of deps.required || []) {
          if (!this._moduleMap.has(depId)) {
            logger.warn(`DependencyResolver: required dependency "${depId}" for "${currentId}" not found`);
            continue;
          }
          visit(depId, chain);
        }

        for (const depId of deps.optional || []) {
          if (this._moduleMap.has(depId)) {
            visit(depId, chain);
          }
        }
      }

      visiting.delete(currentId);
      visited.add(currentId);
      order.push(currentId);
      chain.pop();
    };

    for (const id of allIds) {
      if (!visited.has(id)) {
        visit(id, []);
      }
    }

    return order;
  }

  checkCircular(allModules, dependencyField = 'dependencies') {
    const map = new Map(allModules.map((m) => [m.id, m]));
    const allIds = Array.from(map.keys());
    const visiting = new Set();
    const visited = new Set();
    const cycles = [];

    const dfs = (currentId, chain) => {
      if (visiting.has(currentId)) {
        const cycleStart = chain.indexOf(currentId);
        if (cycleStart !== -1) {
          cycles.push([...chain.slice(cycleStart), currentId]);
        }
        return;
      }
      if (visited.has(currentId)) return;

      const mod = map.get(currentId);
      if (!mod) return;

      visiting.add(currentId);
      chain.push(currentId);

      const deps = mod[dependencyField];
      if (deps) {
        const allDepIds = [
          ...(deps.required || []),
          ...(deps.optional || []),
        ];
        for (const depId of allDepIds) {
          if (allIds.includes(depId)) {
            dfs(depId, chain);
          }
        }
      }

      visiting.delete(currentId);
      visited.add(currentId);
      chain.pop();
    };

    for (const id of allIds) {
      dfs(id, []);
    }

    return cycles;
  }
}
