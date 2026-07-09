import { createTool } from '../../utils/createTool.js';
import { showBase64Tool } from '../../tools/base64/ui.js';
import { COMMAND_PREFIX } from '../../utils/constants.js';
import { logger } from '../../utils/logger.js';

const toolDef = createTool({
  id: 'base64',
  icon: '\ue801',
  name: 'Base64 Encoder',
  description: 'Encode and decode Base64 strings and files instantly',
  category: 'converters',
  keywords: ['base64', 'encode', 'decode', 'base-64'],
  version: '1.0.0',
  author: 'DevToolkit Contributors',
  show: showBase64Tool,
});

export default {
  id: toolDef.id,
  version: toolDef.version,
  name: toolDef.name,
  description: toolDef.description,
  author: toolDef.author,
  category: 'converters',
  icon: toolDef.icon,
  permissions: [],
  dependencies: { required: [], optional: [] },

  commands: [
    {
      name: `${COMMAND_PREFIX}.base64`,
      description: 'Open DevToolkit Base64 Encoder/Decoder',
    },
  ],

  async startup(context) {
    const { toolRegistry, services } = context;

    toolRegistry.register(toolDef);

    services.commands.add({
      name: `${COMMAND_PREFIX}.base64`,
      description: 'Open DevToolkit Base64 Encoder/Decoder',
      exec: () => {
        const editorService = services.editor;
        toolRegistry.launch(toolDef.id, {
          editor: editorService ? editorService.getEditor() : null,
        });
      },
    });

    logger.info('Base64 module ready');
  },

  shutdown() {
    if (typeof toolDef.dispose === 'function') {
      toolDef.dispose();
    }
  },

  cleanup() {
    this.shutdown();
  },
};
