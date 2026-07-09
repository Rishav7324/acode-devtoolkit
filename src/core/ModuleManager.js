import { logger } from '../utils/logger.js';
import { ModuleError, LifecycleError } from '../utils/errors.js';
import { ModuleLoader } from './ModuleLoader.js';
import { DependencyResolver } from './DependencyResolver.js';
import { ErrorIsolation } from './ErrorIsolation.js';

const STATE = {
  UNLOADED: 'unloaded',
  LOADED: 'loaded',
  ENABLED: 'enabled',
  DISABLED: 'disabled',
  DESTROYED: 'destroyed',
  ERROR: 'error',
};

const VALID_TRANSITIONS = {
  [STATE.UNLOADED]: [STATE.LOADED, STATE.ERROR],
  [STATE.LOADED]: [STATE.ENABLED, STATE.UNLOADED, STATE.DESTROYED, STATE.ERROR],
  [STATE.ENABLED]: [STATE.DISABLED, STATE.DESTROYED, STATE.ERROR],
  [STATE.DISABLED]: [STATE.ENABLED, STATE.UNLOADED, STATE.DESTROYED, STATE.ERROR],
  [STATE.DESTROYED]: [STATE.UNLOADED, STATE.ERROR],
  [STATE.ERROR]: [STATE.UNLOADED, STATE.LOADED],
};

export class ModuleManager {
  constructor(eventBus, registries, options = {}) {
    this._modules = new Map();
    this._depIndex = new Map();
    this._loader = options.loader || new ModuleLoader();
    this._resolver = options.resolver || new DependencyResolver();
    this._isolator = options.isolator || new ErrorIsolation(eventBus);
    this._eventBus = eventBus;
    this._registries = registries;
  }

  _rebuildDepIndex() {
    this._depIndex.clear();
    for (const [id, record] of this._modules) {
      const deps = record.descriptor.dependencies || {};
      const allDeps = [...(deps.required || []), ...(deps.optional || [])];
      for (const depId of allDeps) {
        if (!this._depIndex.has(depId)) {
          this._depIndex.set(depId, []);
        }
        this._depIndex.get(depId).push(id);
      }
    }
  }

  async load(descriptor) {
    const module = this._loader.load(descriptor);
    if (!module) return null;

    if (this._modules.has(module.id)) {
      logger.warn(`ModuleManager: "${module.id}" already loaded, skipping`);
      return this._modules.get(module.id);
    }

    const record = {
      id: module.id,
      descriptor: module,
      state: STATE.UNLOADED,
      error: null,
    };

    this._modules.set(module.id, record);
    this._rebuildDepIndex();
    record.state = STATE.LOADED;

    this._emit('module:loaded', { id: module.id, descriptor: module });
    logger.info(`ModuleManager: loaded "${module.id}" v${module.version}`);
    return record;
  }

  async enable(id, context) {
    const record = this._modules.get(id);
    if (!record) {
      logger.error(`ModuleManager: cannot enable "${id}" - not loaded`);
      return false;
    }

    if (record.state === STATE.ENABLED) return true;

    if (!this._canTransition(record.state, STATE.ENABLED)) {
      throw new LifecycleError(id, record.state, STATE.ENABLED);
    }

    const deps = record.descriptor.dependencies;
    const missingRequired = (deps.required || []).filter(
      (depId) => !this._modules.has(depId) ||
        this._modules.get(depId).state !== STATE.ENABLED
    );

    for (const depId of missingRequired) {
      const depModule = this._modules.get(depId);
      if (depModule) {
        await this.enable(depId, context);
      }
    }

    record.state = STATE.ENABLED;

    const result = await this._isolator.execute(id, async () => {
      if (typeof record.descriptor.startup === 'function') {
        return await record.descriptor.startup(context);
      }
    });

    if (result === null) {
      record.state = STATE.ERROR;
      this._emit('module:error', { id, error: new ModuleError(id, 'Startup failed') });
      return false;
    }
    record._startupResult = result;

    try {
      this._registerModuleAssets(record, context);
    } catch (error) {
      logger.error(`ModuleManager: failed to register assets for "${id}":`, error);
    }

    this._emit('module:enabled', { id: record.id });
    logger.info(`ModuleManager: enabled "${id}"`);
    return true;
  }

  async disable(id) {
    const record = this._modules.get(id);
    if (!record || record.state !== STATE.ENABLED) return;

    if (!this._canTransition(record.state, STATE.DISABLED)) {
      throw new LifecycleError(id, record.state, STATE.DISABLED);
    }

    const dependentModules = this._findDependents(id);
    for (const depId of dependentModules) {
      await this.disable(depId);
    }

    await this._isolator.execute(id, async () => {
      if (typeof record.descriptor.shutdown === 'function') {
        await record.descriptor.shutdown();
      }
      if (typeof record.descriptor.cleanup === 'function') {
        await record.descriptor.cleanup();
      }
    });

    try {
      this._unregisterModuleAssets(record);
    } catch (error) {
      logger.error(`ModuleManager: failed to unregister assets for "${id}":`, error);
    }
    record.state = STATE.DISABLED;
    this._emit('module:disabled', { id: record.id });
    logger.info(`ModuleManager: disabled "${id}"`);
  }

  async unload(id) {
    const record = this._modules.get(id);
    if (!record) return;

    if (record.state === STATE.ENABLED) {
      await this.disable(id);
    }

    if (!this._canTransition(record.state, STATE.UNLOADED)) {
      throw new LifecycleError(id, record.state, STATE.UNLOADED);
    }

    record.state = STATE.UNLOADED;
    this._emit('module:unloaded', { id: record.id });
    logger.info(`ModuleManager: unloaded "${id}"`);
  }

  async destroy(id) {
    const record = this._modules.get(id);
    if (!record) return;

    await this.unload(id);
    record.state = STATE.DESTROYED;
    this._modules.delete(id);
    this._rebuildDepIndex();
    this._emit('module:destroyed', { id });
    logger.info(`ModuleManager: destroyed "${id}"`);
  }

  async restart(id, context) {
    await this.disable(id);
    const record = this._modules.get(id);
    if (record) {
      record.state = STATE.LOADED;
      await this.enable(id, context);
    }
    this._emit('module:restarted', { id });
    logger.info(`ModuleManager: restarted "${id}"`);
  }

  async enableAll(context) {
    const modules = Array.from(this._modules.values()).map((r) => r.descriptor);
    const cycleErrors = this._resolver.checkCircular(modules);

    for (const cycle of cycleErrors) {
      logger.error(`ModuleManager: circular dependency detected: ${cycle.join(' -> ')}`);
    }

    const order = this._resolver.resolveAll(modules);

    const results = [];
    for (const id of order) {
      const success = await this.enable(id, context);
      results.push({ id, success });
    }
    return results;
  }

  async disableAll() {
    const modules = Array.from(this._modules.values()).map((r) => r.descriptor);
    const order = this._resolver.resolveAll(modules);
    const reversed = [...order].reverse();

    for (const id of reversed) {
      await this.disable(id);
    }
  }

  async destroyAll() {
    await this.disableAll();
    const ids = Array.from(this._modules.keys());
    for (const id of ids) {
      this._modules.delete(id);
      this._emit('module:destroyed', { id });
    }
    this._depIndex.clear();
    logger.info('ModuleManager: all modules destroyed');
  }

  getState(id) {
    const record = this._modules.get(id);
    return record ? record.state : null;
  }

  get(id) {
    const record = this._modules.get(id);
    return record ? record.descriptor : null;
  }

  getRecord(id) {
    return this._modules.get(id) || null;
  }

  list() {
    return Array.from(this._modules.values()).map((r) => ({
      id: r.id,
      version: r.descriptor.version,
      name: r.descriptor.name,
      state: r.state,
      category: r.descriptor.category,
    }));
  }

  listByState(state) {
    return this.list().filter((m) => m.state === state);
  }

  _canTransition(from, to) {
    const allowed = VALID_TRANSITIONS[from];
    return allowed ? allowed.includes(to) : false;
  }

  _findDependents(moduleId) {
    return this._depIndex.get(moduleId) || [];
  }

  _registerModuleAssets(record, context) {
    if (!this._registries) return;

    const { id, descriptor } = record;
    const reg = this._registries;

    if (descriptor.commands && descriptor.commands.length > 0) {
      for (const cmd of descriptor.commands) {
        reg.commands?.register(id, cmd);
      }
    }

    if (descriptor.settings && descriptor.settings.length > 0) {
      reg.settings?.register(id, descriptor.settings);
    }

    if (descriptor.searchEntries && descriptor.searchEntries.length > 0) {
      reg.search?.register(id, descriptor.searchEntries);
    }

    if (descriptor.actions && descriptor.actions.length > 0) {
      reg.actions?.register(id, descriptor.actions);
    }

    if (descriptor.permissions && descriptor.permissions.length > 0) {
      reg.permissions?.register(id, descriptor.permissions);
    }
  }

  _unregisterModuleAssets(record) {
    if (!this._registries) return;

    const { id } = record;
    const reg = this._registries;

    reg.commands?.unregisterByModule(id);
    reg.settings?.unregisterByModule(id);
    reg.search?.unregisterByModule(id);
    reg.actions?.unregisterByModule(id);
    reg.permissions?.unregisterByModule(id);
    reg.storage?.unregisterByModule(id);
    reg.ui?.unregisterByModule(id);
    reg.theme?.unregisterByModule(id);
    reg.services?.unregisterByModule(id);
  }

  _emit(event, data) {
    if (this._eventBus) {
      this._eventBus.emit(event, data);
    }
  }

  clear() {
    this._modules.clear();
    this._depIndex.clear();
  }
}
