import { logger } from '../utils/logger.js';

export class CommandRegistry {
  constructor() {
    this._entries = new Map();
  }

  register(moduleId, descriptor) {
    const { name } = descriptor;
    if (!name) {
      logger.error(`CommandRegistry: command must have a name (module: ${moduleId})`);
      return;
    }

    if (this._entries.has(name)) {
      logger.warn(`Command "${name}" already registered, overwriting`);
    }

    this._entries.set(name, { moduleId, descriptor });

    try {
      const commands = acode.require('commands');
      commands.addCommand(descriptor);
    } catch (error) {
      logger.error(`CommandRegistry: failed to register "${name}":`, error);
    }
  }

  unregisterByModule(moduleId) {
    const toRemove = [];
    for (const [name, entry] of this._entries) {
      if (entry.moduleId === moduleId) {
        toRemove.push(name);
      }
    }
    for (const name of toRemove) {
      this._entries.delete(name);
      try {
        const commands = acode.require('commands');
        commands.removeCommand(name);
      } catch (error) {
        logger.error(`CommandRegistry: failed to remove "${name}":`, error);
      }
    }
  }

  unregister(name) {
    this._entries.delete(name);
    try {
      const commands = acode.require('commands');
      commands.removeCommand(name);
    } catch (error) {
      logger.error(`CommandRegistry: failed to remove "${name}":`, error);
    }
  }

  execute(name, view, args) {
    try {
      const commands = acode.require('commands');
      commands.registry.execute(name, view, args);
    } catch (error) {
      logger.error(`CommandRegistry: failed to execute "${name}":`, error);
    }
  }

  getByModule(moduleId) {
    const result = [];
    for (const [name, entry] of this._entries) {
      if (entry.moduleId === moduleId) {
        result.push(entry.descriptor);
      }
    }
    return result;
  }

  getAll() {
    return Array.from(this._entries.values()).map((e) => e.descriptor);
  }

  clear() {
    const allNames = Array.from(this._entries.keys());
    for (const name of allNames) {
      this.unregister(name);
    }
    this._entries.clear();
  }
}
