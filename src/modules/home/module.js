import { HomePage } from '../../pages/HomePage.js';
import { SettingsPage } from '../../pages/SettingsPage.js';
import { CommandPalette } from '../../ui/CommandPalette.js';
import { Toast } from '../../ui/Toast.js';
import { COMMAND_PREFIX, PLUGIN_NAME } from '../../utils/constants.js';
import { logger } from '../../utils/logger.js';

export default {
  id: 'home',
  version: '1.0.0',
  name: 'Home',
  description: 'DevToolkit home page and settings',
  author: 'DevToolkit Contributors',
  category: 'core',
  icon: '\u2302',
  permissions: [],
  dependencies: { required: [], optional: [] },

  commands: [
    {
      name: `${COMMAND_PREFIX}.settings`,
      description: `Open ${PLUGIN_NAME} Settings`,
    },
  ],

  async startup(context) {
    this._context = context;
    const { services, registries, toolRegistry } = context;

    const palette = CommandPalette({
      toolRegistry,
      commandRegistry: registries.commands,
      searchRegistry: registries.search,
    });

    services.commands.add({
      name: `${COMMAND_PREFIX}.palette`,
      description: 'Open DevToolkit Command Palette',
      exec: () => palette.show(),
    });

    const homeEl = HomePage({
      toolRegistry,
      onLaunchTool: (tool) => {
        if (toolRegistry.hasLaunchHandler(tool.id)) {
          toolRegistry.launch(tool.id);
        } else {
          Toast({ message: `${tool.title} \u2014 coming soon`, type: 'info' });
        }
      },
    });

    if (services.settings) {
      const storedTheme = services.settings.get('home', 'darkMode');
      if (storedTheme !== undefined) {
        document.documentElement.setAttribute('data-theme', storedTheme ? 'dark' : 'light');
      }
    }

    logger.info('Home module ready');
    return homeEl;
  },

  shutdown() {
    if (this._context) {
      const { services } = this._context;
      services.commands.remove(`${COMMAND_PREFIX}.palette`);
    }
    this._context = null;
  },

  cleanup() {
    this._context = null;
  },
};
