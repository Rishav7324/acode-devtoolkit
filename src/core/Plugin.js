import { Kernel } from './Kernel.js';
import { CommandService } from '../services/CommandService.js';
import { SettingsService } from '../services/SettingsService.js';
import { EditorService } from '../services/EditorService.js';
import { NotificationService } from '../services/NotificationService.js';
import {
  CommandRegistry,
  SettingsRegistry,
  StorageRegistry,
  UIRegistry,
  ThemeRegistry,
  ServiceRegistry,
  ActionRegistry,
  SearchRegistry,
  PermissionRegistry,
} from '../registries/index.js';
import { moduleDescriptors } from '../modules/index.js';
import { COMMAND_PREFIX } from '../utils/constants.js';
import { logger } from '../utils/logger.js';

export class Plugin {
  constructor() {
    this.baseUrl = '';
    this.$page = null;
    this.kernel = new Kernel();
    this.errorHandler = this.kernel.errorHandler;
    this.config = this.kernel.config;
    this._registries = this._createRegistries();
    this._initialized = false;
  }

  _createRegistries() {
    return {
      commands: new CommandRegistry(),
      settings: new SettingsRegistry(),
      storage: new StorageRegistry(),
      ui: new UIRegistry(),
      theme: new ThemeRegistry(),
      services: new ServiceRegistry(),
      actions: new ActionRegistry(),
      search: new SearchRegistry(),
      permissions: new PermissionRegistry(),
    };
  }

  async init(baseUrl, $page) {
    if (this._initialized) return;

    this.baseUrl = baseUrl;
    this.$page = $page;

    await this.kernel.boot({
      modules: false,
      moduleContext: { moduleDescriptors, registries: this._registries },
    });

    this._registerServices();
    this._registerCoreCommand();
    await this._loadModules();

    this._initialized = true;
    logger.info('Plugin initialized');
  }

  _registerServices() {
    this.kernel.container.register('commands', () => new CommandService());
    this.kernel.container.register('settings', () => new SettingsService());
    this.kernel.container.register('editor', () => new EditorService());
    this.kernel.container.register('notifications', () => new NotificationService());
  }

  _registerCoreCommand() {
    const commands = this.kernel.container.get('commands');
    commands.add({
      name: `${COMMAND_PREFIX}.open`,
      description: 'Open DevToolkit',
      exec: () => {
        if (this.$page) {
          this.$page.show();
        }
      },
    });
  }

  _createToolLauncher() {
    const registry = new Map();
    return {
      register(toolId, launchFn) {
        registry.set(toolId, launchFn);
      },
      launch(toolId) {
        const fn = registry.get(toolId);
        if (fn) {
          fn();
        } else {
          logger.warn(`Tool "${toolId}" not registered`);
        }
      },
    };
  }

  async _loadModules() {
    const toolLauncher = this._createToolLauncher();

    const moduleContext = {
      ...this.kernel._createModuleContext(),
      baseUrl: this.baseUrl,
      services: {
        commands: this.kernel.container.get('commands'),
        settings: this.kernel.container.get('settings'),
        editor: this.kernel.container.get('editor'),
        notifications: this.kernel.container.get('notifications'),
      },
      registries: this._registries,
      toolLauncher,
    };

    const mm = this.kernel.getModuleManager();
    for (const descriptor of moduleDescriptors) {
      await mm.load(descriptor);
    }

    const results = await mm.enableAll(moduleContext);

    for (const { id } of results) {
      this.kernel.eventBus.emit('module:ready', { id });
    }

    const homeRecord = mm.getRecord('home');
    const homeEl = homeRecord && homeRecord._startupResult;
    if (homeEl && this.$page) {
      this.$page.body.append(homeEl);
    }
  }

  async addModule(descriptor) {
    const mm = this.kernel.getModuleManager();
    const record = await mm.load(descriptor);
    if (!record) return;

    const moduleContext = {
      ...this.kernel._createModuleContext(),
      baseUrl: this.baseUrl,
      services: {
        commands: this.kernel.container.get('commands'),
        settings: this.kernel.container.get('settings'),
        editor: this.kernel.container.get('editor'),
        notifications: this.kernel.container.get('notifications'),
      },
      registries: this._registries,
    };

    await mm.enable(record.id, moduleContext);
  }

  async destroy() {
    await this.kernel.stop();

    const commands = this.kernel.container.get('commands');
    commands.destroy();

    this._registries.commands.clear();
    this._registries.settings.clear();
    this._registries.storage.clear();
    this._registries.ui.clear();
    this._registries.theme.clear();
    this._registries.services.clear();
    this._registries.actions.clear();
    this._registries.search.clear();
    this._registries.permissions.clear();
    this._initialized = false;

    await this.kernel.destroy();
    logger.info('Plugin destroyed');
  }
}
