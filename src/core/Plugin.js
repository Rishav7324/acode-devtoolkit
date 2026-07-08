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
  ToolRegistry,
} from '../registries/index.js';
import { TOOL_CATEGORIES, seedTools } from '../data/tools.js';
import { moduleDescriptors } from '../modules/index.js';
import { COMMAND_PREFIX, SIDEBAR_APP_ID } from '../utils/constants.js';
import { SidebarApp } from '../ui/SidebarApp.js';
import { createSelectionService } from '../services/SelectionService.js';
import { createEditorBridge } from '../services/EditorBridge.js';
import { KeyboardShortcutRegistry } from '../services/KeyboardShortcutRegistry.js';
import { ToolPicker } from '../ui/ToolPicker.js';
import { logger } from '../utils/logger.js';

export class Plugin {
  constructor() {
    this.baseUrl = '';
    this.$page = null;
    this.kernel = new Kernel();
    this.errorHandler = this.kernel.errorHandler;
    this.config = this.kernel.config;
    this._registries = this._createRegistries();
    this._sidebar = null;
    this._shortcuts = new KeyboardShortcutRegistry();
    this._selectionService = null;
    this._editorBridge = null;
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
      tools: new ToolRegistry(TOOL_CATEGORIES),
    };
  }

  async init(baseUrl, $page) {
    if (this._initialized) return;

    this.baseUrl = baseUrl;
    this.$page = $page;

    seedTools(this._registries.tools);

    await this.kernel.boot({
      modules: false,
      moduleContext: { moduleDescriptors, registries: this._registries },
    });

    this._registerServices();
    this._registerCoreCommand();
    this._initEditorBridge();
    this._initSelectionService();
    await this._loadModules();
    this._registerSidebar();
    this._registerSelectionCommand();

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

  _registerSidebar() {
    this._sidebar = new SidebarApp(
      this.baseUrl + 'icon.png',
      SIDEBAR_APP_ID,
      'DevToolkit'
    );
    this._sidebar.register(
      null,
      () => {
        if (this.$page) {
          this.$page.show();
        }
      }
    );
    logger.debug('Sidebar app registered');
  }

  _initEditorBridge() {
    const editorService = this.kernel.container.get('editor');
    this._editorBridge = createEditorBridge(editorService);
    logger.debug('Editor bridge ready');
  }

  _initSelectionService() {
    this._selectionService = createSelectionService({
      toolRegistry: this._registries.tools,
      editorBridge: this._editorBridge,
    });
    logger.debug('Selection service ready');
  }

  _registerSelectionCommand() {
    const commands = this.kernel.container.get('commands');
    commands.add({
      name: `${COMMAND_PREFIX}.send-to-tool`,
      description: 'Send editor selection to DevToolkit tool',
      exec: () => {
        ToolPicker({
          toolRegistry: this._registries.tools,
          selectionService: this._selectionService,
          editorBridge: this._editorBridge,
        });
      },
    });
    logger.debug('Selection command registered');
  }

  async _loadModules() {
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
      toolRegistry: this._registries.tools,
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
      toolRegistry: this._registries.tools,
    };

    await mm.enable(record.id, moduleContext);
  }

  async destroy() {
    await this.kernel.stop();

    const commands = this.kernel.container.get('commands');
    commands.remove(`${COMMAND_PREFIX}.send-to-tool`);
    commands.destroy();

    if (this._sidebar) {
      this._sidebar.unregister();
      this._sidebar = null;
    }
    if (this._shortcuts) {
      this._shortcuts.clear();
    }
    this._selectionService = null;
    this._editorBridge = null;

    this._registries.commands.clear();
    this._registries.settings.clear();
    this._registries.storage.clear();
    this._registries.ui.clear();
    this._registries.theme.clear();
    this._registries.services.clear();
    this._registries.actions.clear();
    this._registries.search.clear();
    this._registries.permissions.clear();
    this._registries.tools.clear();
    this._initialized = false;

    await this.kernel.destroy();
    logger.info('Plugin destroyed');
  }
}
