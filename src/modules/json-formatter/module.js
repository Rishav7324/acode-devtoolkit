import { createTool } from '../../utils/createTool.js';
import { showJsonFormatter } from '../../tools/json-formatter/ui.js';
import { COMMAND_PREFIX } from '../../utils/constants.js';
import { logger } from '../../utils/logger.js';

const toolDef = createTool({
  id: 'json-formatter',
  icon: '\ue800',
  name: 'JSON Formatter',
  description: 'Format, validate, and beautify JSON data with syntax highlighting',
  category: 'formatting',
  keywords: ['json', 'format', 'beautify', 'validate', 'minify', 'pretty print'],
  version: '1.0.0',
  author: 'DevToolkit Contributors',
  show: showJsonFormatter,
});

export default {
  id: toolDef.id,
  version: toolDef.version,
  name: toolDef.name,
  description: toolDef.description,
  author: toolDef.author,
  category: 'formatting',
  icon: toolDef.icon,
  permissions: [],
  dependencies: { required: [], optional: [] },

  commands: [
    {
      name: `${COMMAND_PREFIX}.json-formatter`,
      description: 'Open JSON Formatter tool',
    },
  ],

  async startup(context) {
    const { toolRegistry, services } = context;

    toolRegistry.register(toolDef);

    services.commands.add({
      name: `${COMMAND_PREFIX}.json-formatter`,
      description: 'Open JSON Formatter',
      exec: () => {
        const editorService = services.editor;
        toolRegistry.launch(toolDef.id, {
          editor: editorService ? editorService.getEditor() : null,
        });
      },
    });

    logger.info('JSON Formatter module ready');
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
