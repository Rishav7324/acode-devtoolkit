import { logger } from '../utils/logger.js';

export class UIRegistry {
  constructor() {
    this._sidebarApps = new Map();
    this._pages = new Map();
  }

  registerSidebarApp(moduleId, app) {
    this._sidebarApps.set(moduleId, app);
    try {
      const sidebarApps = acode.require('sidebarApps');
      sidebarApps.add(
        app.icon,
        app.id || moduleId,
        app.title,
        (container) => {
          if (app.onInit) app.onInit(container);
        },
        app.prepend || false,
        (container) => {
          if (app.onSelected) app.onSelected(container);
        }
      );
    } catch (error) {
      logger.error(`UIRegistry: failed to register sidebar app for "${moduleId}":`, error);
    }
  }

  registerPage(moduleId, pageFactory) {
    this._pages.set(moduleId, pageFactory);
  }

  getSidebarApp(moduleId) {
    return this._sidebarApps.get(moduleId) || null;
  }

  getPage(moduleId) {
    return this._pages.get(moduleId) || null;
  }

  unregisterByModule(moduleId) {
    const app = this._sidebarApps.get(moduleId);
    if (app) {
      try {
        const sidebarApps = acode.require('sidebarApps');
        sidebarApps.remove(app.id || moduleId);
      } catch (error) {
        logger.error(`UIRegistry: failed to remove sidebar app for "${moduleId}":`, error);
      }
    }
    this._sidebarApps.delete(moduleId);
    this._pages.delete(moduleId);
  }

  clear() {
    const ids = Array.from(this._sidebarApps.keys());
    for (const id of ids) {
      this.unregisterByModule(id);
    }
    this._sidebarApps.clear();
    this._pages.clear();
  }
}
