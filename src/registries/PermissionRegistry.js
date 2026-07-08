import { logger } from '../utils/logger.js';

const KNOWN_PERMISSIONS = [
  'filesystem',
  'clipboard',
  'network',
  'storage',
  'notifications',
];

export class PermissionRegistry {
  constructor() {
    this._grants = new Map();
  }

  register(moduleId, permissions = []) {
    if (!permissions || permissions.length === 0) return;

    for (const perm of permissions) {
      if (!KNOWN_PERMISSIONS.includes(perm)) {
        logger.warn(`PermissionRegistry: unknown permission "${perm}" requested by "${moduleId}"`);
        continue;
      }
      if (!this._grants.has(moduleId)) {
        this._grants.set(moduleId, new Set());
      }
      this._grants.get(moduleId).add(perm);
    }
  }

  has(moduleId, permission) {
    const grants = this._grants.get(moduleId);
    return grants ? grants.has(permission) : false;
  }

  list(moduleId) {
    const grants = this._grants.get(moduleId);
    return grants ? Array.from(grants) : [];
  }

  revoke(moduleId, permission) {
    const grants = this._grants.get(moduleId);
    if (grants) {
      grants.delete(permission);
    }
  }

  unregisterByModule(moduleId) {
    this._grants.delete(moduleId);
  }

  clear() {
    this._grants.clear();
  }
}
