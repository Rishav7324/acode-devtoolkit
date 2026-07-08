# Acode DevToolkit

A powerful, open-source developer toolkit plugin for the [Acode editor](https://acode.app). Provides essential development utilities right inside your mobile code editor.

## Features

- **Modular architecture** — Each tool is an independent module with its own lifecycle, dependencies, and registrations
- **Mobile-first** — Optimized for Acode on Android with touch-friendly UI
- **High performance** — Dependency-aware module ordering, O(1) dependency lookups, memoized data queries
- **Dark & Light themes** — Automatic Acode theme detection with manual override
- **20 reusable UI components** — Cards, modals, sheets, toasts, toggles, search, and more
- **9 plugin registries** — Commands, Settings, Storage, UI, Theme, Services, Actions, Search, Permissions
- **Error isolation** — One module crash never blocks others; centralized error handling with severity levels
- **16 developer tools** — JSON formatting, hashing, JWT debugging, regex testing, color conversion, and more

## Installation

1. Open Acode
2. Go to **Settings > Plugins**
3. Search for "Acode DevToolkit"
4. Tap **Install**

### Manual Installation

1. Build the plugin: `npm run build`
2. Use the **Local** option in Acode's plugin manager and select `plugin.zip`

## Development

### Prerequisites

- Node.js 18+
- npm

### Setup

```bash
git clone https://github.com/anomalyco/acode-devtoolkit.git
cd acode-devtoolkit
npm install
```

### Development Server

```bash
npm run dev
```

This starts esbuild in watch mode with a local dev server. In Acode, use the **Remote** install option and enter the server URL. The plugin auto-detects development mode and enables verbose logging.

### Production Build

```bash
npm run build
```

Output will be in `dist/` and packaged as `plugin.zip`.

### Quality Commands

```bash
npm run lint        # ESLint source code
npm run typecheck   # TypeScript type checking
```

## Project Structure

```
acode-devtoolkit/
├── src/
│   ├── core/           # Kernel: Plugin, ModuleManager, EventBus, DependencyResolver,
│   │                   #          ErrorIsolation, ModuleLoader, ServiceContainer,
│   │                   #          ErrorHandler, ConfigManager
│   ├── modules/        # Feature modules (home, and future tools)
│   ├── services/       # Acode API wrappers (commands, settings, editor, notifications)
│   ├── registries/     # 9 independent registries for module assets
│   ├── ui/             # 20 reusable UI components
│   ├── pages/          # Plugin pages (HomePage, SettingsPage)
│   ├── data/           # Tool definitions and data helpers
│   ├── styles/         # CSS design system with dark/light tokens
│   ├── utils/          # Shared utilities (logger, constants, dom, errors)
│   └── main.js         # Plugin entry point, style injection, theme detection
├── plugin.json         # Plugin manifest
├── package.json        # Dependencies and scripts
├── esbuild.config.mjs  # Build configuration
├── pack-zip.js         # ZIP packaging script
├── CONTRIBUTING.md     # Contribution guidelines
├── DEVELOPER_GUIDE.md  # Module development guide
└── README.md
```

## Module Architecture

The plugin uses a descriptor-based module system. Each module is a plain object with:

```js
{
  id: 'my-tool',           // Unique module ID
  version: '1.0.0',        // Semver version
  name: 'My Tool',         // Display name
  description: '...',      // Short description
  category: 'developer',   // Category identifier
  icon: '\u2699',          // Icon character
  permissions: [],         // Required permissions
  dependencies: {          // Dependency declarations
    required: [],
    optional: []
  },
  commands: [],            // Acode commands to register
  settings: [],            // Settings with defaults
  searchEntries: [],       // Search index entries
  actions: [],             // Action items for UI
  startup(context) {},     // Called when module is enabled
  shutdown() {},           // Called when module is disabled
  cleanup() {}             // Called during full teardown
}
```

See `DEVELOPER_GUIDE.md` for complete module development documentation.

## Contributing

Contributions are welcome! Please see `CONTRIBUTING.md` for guidelines.

## License

MIT
