import { logger } from '../utils/logger.js';

export class SidebarApp {
  constructor(icon, id, title) {
    this._icon = icon;
    this._id = id;
    this._title = title;
    this._container = null;
    this._initialized = false;
  }

  get id() {
    return this._id;
  }

  get container() {
    return this._container;
  }

  register(onInit, onSelected) {
    try {
      const sidebarApps = acode.require('sidebarApps');
      sidebarApps.add(
        this._icon,
        this._id,
        this._title,
        (container) => {
          this._container = container;
          this._initialized = true;
          if (typeof onInit === 'function') {
            onInit(container);
          }
        },
        false,
        (container) => {
          this._container = container;
          if (typeof onSelected === 'function') {
            onSelected(container);
          }
        }
      );
      logger.debug(`Sidebar app registered: ${this._id}`);
    } catch (error) {
      logger.error('Failed to register sidebar app:', error);
    }
  }

  unregister() {
    try {
      const sidebarApps = acode.require('sidebarApps');
      sidebarApps.remove(this._id);
      this._container = null;
      this._initialized = false;
      logger.debug(`Sidebar app unregistered: ${this._id}`);
    } catch (error) {
      logger.error('Failed to unregister sidebar app:', error);
    }
  }
}
