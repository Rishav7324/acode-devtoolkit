import { EventBus } from './EventBus.js';
import { ServiceContainer, LIFETIME } from './ServiceContainer.js';
import { ModuleManager } from './ModuleManager.js';
import { ModuleLoader } from './ModuleLoader.js';
import { DependencyResolver } from './DependencyResolver.js';
import { ErrorIsolation } from './ErrorIsolation.js';
import { ErrorHandler } from './ErrorHandler.js';
import { ConfigManager } from './ConfigManager.js';
import { Navigation } from './Navigation.js';
import { JobManager } from './JobManager.js';
import { CacheManager } from './CacheManager.js';
import { DialogManager } from './DialogManager.js';
import { StateManager } from './StateManager.js';
import { Accessibility } from './Accessibility.js';
import { Observability } from './Observability.js';
import { logger } from '../utils/logger.js';

const PHASE = {
  CREATED: 'created',
  BOOTING: 'booting',
  READY: 'ready',
  STOPPING: 'stopping',
  STOPPED: 'stopped',
  DESTROYED: 'destroyed',
};

export class Kernel {
  constructor() {
    this.phase = PHASE.CREATED;
    this.config = new ConfigManager();
    this.eventBus = new EventBus();
    this.errorHandler = new ErrorHandler(this.eventBus);
    this.container = new ServiceContainer();
    this.observability = new Observability();
    this.accessibility = new Accessibility();
    this.cache = new CacheManager();
    this.jobs = new JobManager(this.eventBus);
    this.state = new StateManager();
    this.dialogs = new DialogManager(this.accessibility);
    this.navigation = new Navigation(this.eventBus, this.accessibility);
    this._moduleManager = null;
    this._booted = false;
  }

  async boot(options = {}) {
    if (this._booted) return;
    this.phase = PHASE.BOOTING;

    this.observability.mark('kernel:boot');

    if (this.config.isDev()) {
      logger.setMode('DEVELOPMENT');
      logger.info('Kernel booting in development mode');
    }

    this._registerCoreServices();
    await this._initSubsystems();
    this._registerCoreCommands();

    if (options.modules !== false) {
      await this._bootModules(options.moduleContext || {});
    }

    this._booted = true;
    this.phase = PHASE.READY;
    this.eventBus.emit('kernel:ready', { timestamp: Date.now() });

    this.observability.mark('kernel:booted');
    logger.info('Kernel ready');
  }

  _registerCoreServices() {
    const self = this;

    this.container.registerInstance('kernel', this);
    this.container.registerInstance('config', this.config);
    this.container.registerInstance('eventBus', this.eventBus);
    this.container.registerInstance('errorHandler', this.errorHandler);
    this.container.registerInstance('observability', this.observability);
    this.container.registerInstance('accessibility', this.accessibility);
    this.container.registerInstance('cache', this.cache);
    this.container.registerInstance('jobs', this.jobs);
    this.container.registerInstance('state', this.state);
    this.container.registerInstance('dialogs', this.dialogs);
    this.container.registerInstance('navigation', this.navigation);

    this.container.register('logger', () => logger, { lifetime: LIFETIME.SINGLETON });
  }

  async _initSubsystems() {
    const resolver = new DependencyResolver();
    const loader = new ModuleLoader();
    const isolator = new ErrorIsolation(this.eventBus);
    this._moduleManager = new ModuleManager(this.eventBus, null, {
      resolver,
      loader,
      isolator,
    });

    this.container.registerInstance('moduleManager', this._moduleManager);
  }

  _registerCoreCommands() {
  }

  async _bootModules(context) {
    const { moduleDescriptors = [] } = context;

    for (const descriptor of moduleDescriptors) {
      await this._moduleManager.load(descriptor);
    }

    const kernelContext = this._createModuleContext(context);
    await this._moduleManager.enableAll(kernelContext);
  }

  _createModuleContext(extra = {}) {
    return {
      kernel: this,
      config: this.config,
      eventBus: this.eventBus,
      errorHandler: this.errorHandler,
      cache: this.cache,
      jobs: this.jobs,
      state: this.state,
      dialogs: this.dialogs,
      navigation: this.navigation,
      observability: this.observability,
      accessibility: this.accessibility,
      services: {},
      registries: {},
      ...extra,
    };
  }

  getModuleManager() {
    return this._moduleManager;
  }

  isReady() {
    return this._booted && this.phase === PHASE.READY;
  }

  async stop() {
    if (this.phase !== PHASE.READY) return;
    this.phase = PHASE.STOPPING;

    this.eventBus.emit('kernel:stopping', { timestamp: Date.now() });

    if (this._moduleManager) {
      await this._moduleManager.destroyAll();
    }

    this.jobs.cancelAll();
    this.cache.clear();
    this.state.destroy();
    this.dialogs.dismissAll();

    this.phase = PHASE.STOPPED;
    this.eventBus.emit('kernel:stopped', { timestamp: Date.now() });
    logger.info('Kernel stopped');
  }

  async destroy() {
    await this.stop();

    this.eventBus.clear();
    this.container.destroy();
    this.errorHandler.destroy();
    ConfigManager.destroy();

    this.phase = PHASE.DESTROYED;
    this._booted = false;
    logger.info('Kernel destroyed');
  }
}
