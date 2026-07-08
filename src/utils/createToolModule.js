import { logger } from './logger.js';

export function createToolModule(config) {
  const { id, icon, name, description, showFn, permissions = [] } = config;

  return {
    id,
    version: '1.0.0',
    name,
    description,
    author: 'DevToolkit Contributors',
    category: 'tool',
    icon,
    permissions,
    dependencies: { required: [], optional: [] },

    commands: [
      {
        name: `devtoolkit.${id}`,
        description: `Open DevToolkit ${name}`,
      },
    ],

    async startup(context) {
      this._context = context;
      const { toolRegistry, services } = context;

      toolRegistry.register({
        id,
        launch: ({ editor, settings } = {}) => {
          const start = performance.now();
          showFn({ editor, settings });
          logger.debug(`${id} launched in ${(performance.now() - start).toFixed(1)}ms`);
        },
      });

      services.commands.add({
        name: `devtoolkit.${id}`,
        description: `Open DevToolkit ${name}`,
        exec: () => {
          const editorService = services.editor;
          const settingsService = services.settings;
          showFn({
            editor: editorService ? editorService.getEditor() : null,
            settings: settingsService,
          });
        },
      });

      logger.info(`${name} module ready`);
    },

    shutdown() {
      if (this._context) {
        const { services } = this._context;
        services.commands.remove(`devtoolkit.${id}`);
      }
      this._context = null;
    },

    cleanup() {
      this._context = null;
    },
  };
}
