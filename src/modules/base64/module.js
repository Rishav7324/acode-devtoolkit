import { showBase64Tool } from '../../tools/base64/ui.js';
import { COMMAND_PREFIX, PLUGIN_NAME } from '../../utils/constants.js';
import { logger } from '../../utils/logger.js';

export default {
  id: 'base64',
  version: '1.0.0',
  name: 'Base64',
  description: 'Base64 encoder and decoder tool',
  author: 'DevToolkit Contributors',
  category: 'tool',
  icon: '\ue801',
  permissions: [],
  dependencies: { required: [], optional: [] },

  commands: [
    {
      name: `${COMMAND_PREFIX}.base64`,
      description: `Open ${PLUGIN_NAME} Base64 Encoder/Decoder`,
    },
  ],

  async startup(context) {
    this._context = context;
    const { toolRegistry, services } = context;

    toolRegistry.registerLaunchHandler('base64', ({ editor, settings } = {}) => {
      showBase64Tool({ editor, settings });
    });

    services.commands.add({
      name: `${COMMAND_PREFIX}.base64`,
      description: 'Open DevToolkit Base64 Encoder/Decoder',
      exec: () => {
        const editorService = services.editor;
        const settingsService = services.settings;
        showBase64Tool({
          editor: editorService ? editorService.getEditor() : null,
          settings: settingsService,
        });
      },
    });

    logger.info('Base64 module ready');
  },

  shutdown() {
    if (this._context) {
      const { services } = this._context;
      services.commands.remove(`${COMMAND_PREFIX}.base64`);
    }
    this._context = null;
  },

  cleanup() {
    this._context = null;
  },
};
