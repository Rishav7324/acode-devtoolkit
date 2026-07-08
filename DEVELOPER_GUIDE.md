# Developer Guide

This guide explains how to create modules for the Acode DevToolkit plugin.

## Module Descriptor

Every module is a plain object exported as the default export from `src/modules/<name>/module.js`:

```js
export default {
  id: 'my-tool',              // Unique, lowercase, hyphenated
  version: '1.0.0',           // Semver
  name: 'My Tool',            // Human-readable
  description: 'Does X and Y',
  author: 'Your Name',
  category: 'developer',      // Must match a TOOL_CATEGORIES id
  icon: '\u2699',             // Unicode icon character
  permissions: [],            // Not yet enforced
  dependencies: {
    required: [],              // Module IDs that must be enabled first
    optional: [],              // Module IDs used if available
  },
  commands: [],                // Acode command descriptors
  settings: [],                // Setting definitions with defaults
  searchEntries: [],           // Search index entries
  actions: [],                 // Quick action items

  async startup(context) {
    // Called when module is enabled
    // Return a DOM element to mount, or nothing
  },

  shutdown() {
    // Called when module is disabled
    // Clean up event listeners, timers, etc.
  },

  cleanup() {
    // Called during full plugin teardown
    // Release any remaining resources
  },
};
```

## Startup Context

The `startup(context)` function receives a context object with:

```js
{
  baseUrl: 'file:///.../',    // Plugin installation base URL
  services: {
    commands: CommandService,   // Acode command registration
    settings: SettingsService,  // Namespaced settings
    editor: EditorService,      // Editor interaction
    notifications: NotificationService, // Toast notifications
  },
  eventBus: EventBus,          // Pub/sub event system with wildcards and priority
  registries: {
    commands: CommandRegistry,
    settings: SettingsRegistry,
    storage: StorageRegistry,
    ui: UIRegistry,
    theme: ThemeRegistry,
    services: ServiceRegistry,
    actions: ActionRegistry,
    search: SearchRegistry,
    permissions: PermissionRegistry,
  },
  config: ConfigManager,       // Centralized configuration
  errorHandler: ErrorHandler,  // Error reporting with severity levels
  kernel: Kernel,              // Platform kernel (lifecycle, orchestration)
  cache: CacheManager,         // Memory cache with TTL
  jobs: JobManager,            // Background task scheduler
  state: StateManager,         // Module-level reactive stores
  dialogs: DialogManager,      // Dialog stack management
  navigation: Navigation,      // Page routing with history
  observability: Observability, // Metrics, timing, counters
  accessibility: Accessibility,  // ARIA, focus trap, reduced motion
}
```

## Lifecycle

Modules follow a strict lifecycle:

```
UNLOADED -> LOADED -> ENABLED -> DISABLED -> UNLOADED -> DESTROYED
                   -> ERROR -> LOADED (retry)
```

- `enable` calls `startup(context)` — module becomes active
- `disable` calls `shutdown()` then `cleanup()` — module becomes inactive
- `destory` completely removes the module record
- `restart(id, context)` disables then re-enables with fresh context

## Creating a New Module

1. Create `src/modules/my-tool/module.js` with the descriptor above
2. Add the tool definition to `src/data/tools.js` (for the home page grid)
3. Add the import to `src/modules/index.js`:

```js
import myToolDescriptor from './my-tool/module.js';

export const moduleDescriptors = [
  homeDescriptor,
  myToolDescriptor,
];
```

4. Run `npm run build` to verify

## Using Settings

```js
// Read a setting
const value = services.settings.get('my-tool', 'settingKey');

// Write a setting
services.settings.set('my-tool', 'settingKey', newValue);

// Define settings in the module descriptor
settings: [
  { key: 'settingKey', value: 'default', label: 'Setting Label' },
],
```

## Using the Event Bus

```js
// Subscribe
const unsubscribe = eventBus.on('module:enabled', (data) => {
  console.log(`Module ${data.id} enabled`);
});

// Unsubscribe
unsubscribe();

// One-shot
eventBus.once('module:ready', () => {});

// Emit
eventBus.emit('custom:event', { data: 'value' });
```

## Using the Error Handler

```js
const { errorHandler } = context;

// Report a recoverable error
errorHandler.handle('MY_ERROR', 'Something went wrong', {
  moduleId: 'my-tool',
  severity: 'recoverable',
});

// Wrap a function for automatic error catching
const safeFn = errorHandler.wrap('my-tool', async () => {
  // Risky code here
});
```

## UI Components

All UI components are in `src/ui/` and use `html-tag-js` for DOM creation:

```js
import tag from 'html-tag-js';
import { Card } from '../../ui/Card.js';

const myCard = Card({
  icon: '\u2699',
  title: 'My Tool',
  description: 'Does something useful',
  category: 'developer',
  onLaunch: () => handleLaunch(),
});
```

Available components: Badge, BottomSheet, Button, Card, Checkbox, EmptyState, ErrorState, Header, IconButton, Input, List, Loading, Modal, PageFactory, SearchBox, SettingsItem, SidebarApp, Tabs, Toast, Toggle, ToolCard.

## Using the Plugin SDK

The SDK (`src/utils/sdk.js`) provides helpers for module creation:

```js
import { createModule, defineCommand, defineSetting, createTimedCache } from '../../utils/sdk.js';

const module = createModule({
  id: 'my-tool',
  version: '1.0.0',
  name: 'My Tool',
  startup: (ctx) => { /* ... */ },
});

// Command helper
const cmd = defineCommand('my-tool.action', {
  description: 'Does something',
  exec: () => {},
});

// Setting helper
const setting = defineSetting('myKey', {
  default: true,
  label: 'Enable Feature',
  onChange: (key, value) => {},
});

// Local cache
const toolCache = createTimedCache(30000); // 30s TTL
```

## Using the Cache System

```js
const { cache } = context;

// Cache expensive results
cache.set('my-key', computedValue, 60000); // 60s TTL

// Retrieve
const value = cache.get('my-key');

// Namespace clearing
cache.clearByPrefix('my-module-');
```

## Using Background Jobs

```js
const { jobs } = context;

const job = jobs.schedule('hash-calculation', async ({ progress, signal }) => {
  for (let i = 0; i < chunks.length; i++) {
    if (signal.cancelled) return null;
    progress((i / chunks.length) * 100);
    // process chunk...
  }
  return finalResult;
}, { retries: 2, timeout: 30000 });

// Check status
const status = jobs.getStatus('hash-calculation');

// Cancel
jobs.cancel('hash-calculation');
```

## Using State Stores

```js
const { state } = context;

// Create store
const store = state.createStore('my-tool', { count: 0, items: [] });

// Subscribe to changes
const unsub = store.subscribe((newState, changed) => {
  console.log('Changed keys:', Object.keys(changed));
});

// Update state
store.setState({ count: store.getState().count + 1 });
```

## Using Navigation

```js
const { navigation } = context;

// Register a page factory
navigation.register('my-tool.page', (params) => {
  return MyPage(params);
}, { title: 'My Tool Page' });

// Navigate
navigation.navigate('my-tool.page', { id: 42 });

// Go back
navigation.back();
```

## Using Dialogs

```js
const { dialogs } = context;

const dialog = dialogs.show(someElement, {
  title: 'Confirm',
  dismissable: true,
});

// Dismiss
dialogs.dismiss(dialog.id);
```

## Accessibility

```js
const { accessibility } = context;

// Announce to screen readers
accessibility.announce('Operation completed');

// Check user preferences
if (accessibility.prefersReducedMotion()) {
  // Disable animations
}

// Set ARIA attributes
accessibility.setAriaLabel(button, 'Close dialog');
accessibility.setRole(nav, 'navigation');
```

## Observability

```js
const { observability } = context;

// Mark timing points
observability.mark('operation:start');
// ... do work ...
observability.mark('operation:end');

// Measure duration
const ms = observability.measure('operation', 'operation:start', 'operation:end');

// Count events
observability.increment('tools.launched');

// Set gauges
observability.gauge('memory.usage', currentMemory);

// Time a function
const result = await observability.timeAsync(() => expensiveFn(), 'expensive:compute');

// Get report
const snapshot = observability.report();
```

## Security Best Practices

- Always use `textContent` (not `innerHTML`) for setting text
- For dynamic content, use `safeHtml(str)` from `src/utils/dom.js`
- Validate all user input
- Never eval or use `new Function()`
- Never log or expose secrets/API keys
