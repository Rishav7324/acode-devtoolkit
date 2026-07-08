import { HomePage } from '../../pages/HomePage.js';
import { SettingsPage } from '../../pages/SettingsPage.js';
import { Toast } from '../../ui/Toast.js';
import { COMMAND_PREFIX, PLUGIN_NAME, PLUGIN_ID } from '../../utils/constants.js';
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
    const { services, registries, config, errorHandler, toolLauncher } = context;

    const homeEl = HomePage({
      onLaunchTool: (tool) => {
        if (toolLauncher) {
          toolLauncher.launch(tool.id);
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
    this._context = null;
  },

  cleanup() {
    this._context = null;
  },
};
