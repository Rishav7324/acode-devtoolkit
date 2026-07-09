import { createTool } from './createTool.js';
import { logger } from './logger.js';

export function createToolModule(config) {
  const { id, icon, name, description, showFn, permissions = [], category } = config;

  if (!showFn) {
    logger.error(`createToolModule: "${id}" missing showFn`);
    throw new Error(`createToolModule: "${id}" must provide a "showFn" function`);
  }

  const toolDef = createTool({
    id,
    name,
    description,
    icon,
    category: category || 'developer',
    keywords: config.keywords || [],
    version: '1.0.0',
    author: 'DevToolkit Contributors',
    permissions,
    tags: config.tags || [],
    experimental: config.experimental || false,
    hidden: config.hidden || false,
    show: showFn,
  });

  return {
    id: toolDef.id,
    version: toolDef.version,
    name: toolDef.name,
    description: toolDef.description,
    author: toolDef.author,
    category: 'tool',
    icon: toolDef.icon,
    permissions: toolDef.permissions,
    dependencies: { required: [], optional: [] },

    toolDef,

    commands: [
      {
        name: `devtoolkit.${toolDef.id}`,
        description: `Open DevToolkit ${toolDef.name}`,
      },
    ],

    async startup(context) {
      this._context = context;
      const { toolRegistry, services } = context;

      toolRegistry.register(toolDef);

      services.commands.add({
        name: `devtoolkit.${toolDef.id}`,
        description: `Open DevToolkit ${toolDef.name}`,
        exec: () => {
          const editorService = services.editor;
          const launchResult = toolRegistry.launch(toolDef.id, {
            editor: editorService ? editorService.getEditor() : null,
          });
          if (!launchResult.success) {
            logger.warn(`Launch failed for "${toolDef.id}": ${launchResult.message}`);
          }
        },
      });

      if (typeof toolDef.initialize === 'function') {
        await toolDef.initialize({ services, registries: context.registries });
      }

      logger.info(`${toolDef.name} module ready`);
    },

    shutdown() {
      if (typeof toolDef.dispose === 'function') {
        toolDef.dispose();
      }
      if (this._context) {
        const { services } = this._context;
        services.commands.remove(`devtoolkit.${toolDef.id}`);
      }
      this._context = null;
    },

    cleanup() {
      this.shutdown();
    },
  };
}

export default createToolModule;
