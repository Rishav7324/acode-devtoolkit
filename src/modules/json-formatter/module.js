import { showJsonFormatter } from '../../tools/json-formatter/ui.js';
import { COMMAND_PREFIX } from '../../utils/constants.js';
import { logger } from '../../utils/logger.js';

export default {
  id: 'json-formatter',
  version: '1.0.0',
  name: 'JSON Formatter',
  description: 'Format, validate, and beautify JSON data with syntax highlighting',
  author: 'DevToolkit Contributors',
  category: 'formatting',
  icon: '\ue800',
  permissions: [],
  dependencies: { required: [], optional: [] },

  commands: [
    {
      name: `${COMMAND_PREFIX}.json-formatter`,
      description: 'Open JSON Formatter tool',
    },
  ],

  searchEntries: [
    {
      keywords: ['json', 'format', 'beautify', 'validate', 'minify', 'pretty print'],
      priority: 10,
      category: 'tools',
    },
  ],

  async startup(context) {
    const { services, toolRegistry } = context;

    const launch = () => {
      showJsonFormatter({
        editor: services.editor,
        settings: services.settings,
      });
    };

    toolRegistry.register({
      id: 'json-formatter',
      icon: '\ue800',
      title: 'JSON Formatter',
      description: 'Format, validate, and beautify JSON data with syntax highlighting',
      category: 'formatting',
      keywords: ['json', 'format', 'beautify', 'validate', 'minify', 'pretty print'],
      launch,
    });

    logger.info('JSON Formatter module ready');
  },

  shutdown() {
    logger.info('JSON Formatter module shutdown');
  },

  cleanup() {
    logger.info('JSON Formatter module cleanup');
  },
};
