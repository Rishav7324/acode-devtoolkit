import { logger } from '../utils/logger.js';

export class KeyboardShortcutRegistry {
  constructor() {
    this._shortcuts = new Map();
  }

  add({ keys, command, description }) {
    if (!keys || !command) {
      logger.warn('KeyboardShortcutRegistry: keys and command are required');
      return;
    }
    if (this._shortcuts.has(keys)) {
      logger.warn(`KeyboardShortcutRegistry: shortcut "${keys}" already registered, overwriting`);
    }
    this._shortcuts.set(keys, { keys, command, description: description || '' });

    try {
      const acodeCommands = window.acode ? window.acode.require('commands') : null;
      if (acodeCommands && acodeCommands.addCommand) {
        acodeCommands.addCommand({
          name: command,
          description: description || '',
          bindKey: { win: keys, mac: keys },
          exec: () => {
            const commands = window.acode ? window.acode.require('commands') : null;
            if (commands && commands.execCommand) {
              commands.execCommand(command);
            }
          },
        });
      }
    } catch (e) {
      logger.warn(`KeyboardShortcutRegistry: failed to register "${keys}" with Acode:`, e);
    }

    logger.debug(`KeyboardShortcutRegistry: registered "${keys}" -> ${command}`);
  }

  remove(keys) {
    this._shortcuts.delete(keys);
  }

  get(keys) {
    return this._shortcuts.get(keys);
  }

  getAll() {
    return Array.from(this._shortcuts.values());
  }

  clear() {
    this._shortcuts.clear();
  }
}
