import { logger } from '../utils/logger.js';

export class CommandService {
  constructor() {
    this._registered = [];
  }

  add(descriptor) {
    try {
      const commands = acode.require('commands');
      commands.addCommand(descriptor);
      this._registered.push(descriptor.name);
    } catch (error) {
      logger.error(`Failed to register command "${descriptor.name}":`, error);
    }
  }

  remove(name) {
    try {
      const commands = acode.require('commands');
      commands.removeCommand(name);
      this._registered = this._registered.filter((n) => n !== name);
    } catch (error) {
      logger.error(`Failed to remove command "${name}":`, error);
    }
  }

  execute(name, view, args) {
    try {
      const commands = acode.require('commands');
      commands.registry.execute(name, view, args);
    } catch (error) {
      logger.error(`Failed to execute command "${name}":`, error);
    }
  }

  getRegistered() {
    return [...this._registered];
  }

  destroy() {
    for (const name of [...this._registered]) {
      this.remove(name);
    }
    this._registered = [];
  }
}
