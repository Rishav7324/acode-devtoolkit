# Changelog

All notable changes to this project will be documented in this file.

## [0.9.0] - 2026-07-08

### Added

- **Command Palette** (`src/ui/CommandPalette.js`) — Full-screen overlay for searching and launching tools, commands, and actions via keyboard. Features: real-time fuzzy search across ToolRegistry, CommandRegistry, and SearchRegistry; grouped results (Tools / Commands / Actions); arrow key navigation (Up/Down), Enter to execute, Escape to dismiss; ARIA-compliant with `aria-label` and focus management; visual selection highlight with scroll-into-view; backdrop click to close. Accessible via `devtoolkit.palette` command.

### Changed

- **`src/modules/home/module.js`** — Creates a `CommandPalette` instance during startup, passes all three registries (tools, commands, search). Registers `devtoolkit.palette` command with `exec` function bound to `palette.show()`. Cleans up command registration in `shutdown()`.

- **`src/styles/index.css`** — Added palette styles: `.dtk-palette-overlay` (fixed backdrop), `.dtk-palette-panel` (centered card with scale-in animation), `.dtk-palette-input` (border-bottom focus), `.dtk-palette-group` (section headers), `.dtk-palette-item` (44px touch target, hover/selected state), `.dtk-palette-empty` (no results state).

- **`src/ui/CommandPalette.js`** — Created. 140 lines. Pure function returns `{ show, hide, isVisible }`. No DOM until `show()` called. All query logic encapsulated — no external dependencies beyond `html-tag-js` and `acode.require('commands')`.

## [0.8.0] - 2026-07-08

### Added

- **CI/CD Pipeline** (`.github/workflows/ci.yml`) — Automated quality gate on every push and PR: TypeScript check, static analysis, production build, quality scoring, build artifact upload.

- **Release Automation** (`.github/workflows/release.yml`) — Tag-triggered release workflow: validates tag matches `plugin.json` version, runs full quality gate, generates release notes from `CHANGELOG.md`, publishes GitHub Release with `plugin.zip` and `dist/main.js` assets.

- **ESLint Configuration** (`.eslintrc.cjs`) — Comprehensive rules covering: no `var`, no `eval`, no `console.log` (allows `warn`/`error`), no `debugger`, single quotes, semicolons, trailing commas, consistent spacing. Overrides for Node scripts. `acode` global declared read-only.

- **Static Analysis Validator** (`scripts/validate.mjs`) — Pre-release validation covering: `plugin.json` field completeness, semver format, `minVersionCode` ≥ 970, icon ≤ 50KB, `supported_editor` validity, build output existence (dist/main.js, plugin.zip), documentation presence (README, CHANGELOG, LICENSE), source directory structure (all 9 subdirectories), CHANGELOG entry matches version, config file completeness.

- **Quality Gate Scorer** (`scripts/quality-gate.mjs`) — Automated scoring across 5 categories (Architecture, Performance, Security, Maintainability, Documentation). Each category must score ≥ 9/10. Blocks release on failure. Current scores: Architecture 10/10, Performance 9/10, Security 10/10, Maintainability 10/10, Documentation 10/10.

### Changed

- **`package.json`** — Added `engines.node >=18.0.0`. Added `eslint` devDependency. Added scripts: `validate`, `quality`, `prebuild` (runs validate before build), `verify` (full release checklist). Reordered scripts by workflow sequence.

- **`.gitignore`** — Added `coverage`, `.vite`, `*.tgz` patterns for test infrastructure compatibility.

- **`README.md`** — Updated quality commands section with `validate`, `quality`, `verify`. Updated project structure diagram with `.eslintrc.cjs`, `.github/workflows/`, `scripts/` entries.

- **`SettingsPage.js`** — Version string now reads from `plugin.json` dynamically (`plugin.version`) instead of hardcoded string.

## [0.6.2] - 2026-07-08

### Fixed

- **ErrorHandler not wired to EventBus** — Kernel created `ErrorHandler` before `EventBus`, so global uncaught errors and unhandled rejections were captured but never emitted on the event bus. Fix: reordered constructor so `EventBus` is created first, then passed to `ErrorHandler` constructor. (`src/core/Kernel.js:31-32`)
- **Stale repository references** — All `anomalyco` URLs replaced with `Rishav7324` across `plugin.json`, `README.md`, `package.json`, and `SettingsPage.js` toast message.
- **SettingsPage version hardcoded** — Version string displayed `0.1.0` instead of `0.6.1`. Updated to match `plugin.json`.
- **Missing focus indicator for search input** — `.dtk-search-input` had `outline: none` without a visible `:focus` replacement. Added `border-color: var(--dtk-primary)` on focus. (`src/styles/index.css:399-401`)

### Added

- **`supported_editor` declaration** — Added `"supported_editor": "all"` to `plugin.json` and `acode.app.supported_editor = 'all'` runtime declaration in `main.js` to comply with Acode's CodeMirror 6 compatibility requirements.
- **Global error propagation** — Kernel now passes `EventBus` to `ErrorHandler`, enabling modules and services to subscribe to `system:error` and `system:panic` events for centralized monitoring.

## [0.6.1] - 2026-07-08

### Fixed

- **Blank screen on plugin load** — Root cause was a detached DOM element. The home module's `startup()` function creates a `.dtk-container` DOM element and returns it, but `ModuleManager.enable()` wrapped the call in an arrow function without a `return` statement (`await fn()` instead of `return await fn()`), discarding the return value. `Plugin._loadModules()` then used `document.querySelector('.dtk-container')` which cannot find detached (unattached) DOM elements — the element was never inserted into the document tree. Fix: (1) `ModuleManager.enable()` now returns the startup result and stores it on the module record as `record._startupResult`; (2) `Plugin._loadModules()` reads the home module's record directly instead of using `querySelector`.

### Changed

- `src/core/ModuleManager.js:105` — Added `return` before `await` to propagate module startup return values
- `src/core/ModuleManager.js:115` — Store startup result as `record._startupResult` for downstream access
- `src/core/Plugin.js:129-130` — Replaced `document.querySelector('.dtk-container')` with `mm.getRecord('home')._startupResult`
- `plugin.json` — Version bumped to 0.6.1

## [0.6.0] - 2026-07-08

### Added

- **JSON Formatter tool** (`src/modules/json-formatter/module.js`) — First real tool module with full lifecycle (startup/shutdown/cleanup), registers a launch function in the tool launcher, defines command (`devtoolkit.json-formatter`) and search entries
- **Tool UI** (`src/tools/json-formatter/ui.js`) — Modal-based JSON formatter with Format, Minify, and Validate actions; supports loading from editor, copying output, and inserting at cursor; character count display; error handling with Toast notifications
- **Tool Launcher** (`src/core/Plugin.js`) — Lightweight registry pattern (`Map`-based) allowing tool modules to register launch functions by tool ID; home module dispatches tool launches through it instead of hardcoded callbacks
- **Tool styles** (`src/styles/index.css`) — Tool-specific CSS classes: `.dtk-tool-body`, `.dtk-tool-textarea`, `.dtk-tool-output`, `.dtk-tool-actions`, `.dtk-tool-editor-actions`, `.dtk-tool-status`, `.dtk-tool-charcount`, `.dtk-tool-label`

### Changed

- `src/modules/home/module.js` — `onLaunchTool` callback now dispatches through `toolLauncher.launch(tool.id)` with fallback to "coming soon" toast
- `src/modules/index.js` — Added JSON Formatter module descriptor to module list
- `plugin.json` — Version bumped to 0.6.0

## [0.5.0] - 2026-07-08

### Added

- **Kernel** (`src/core/Kernel.js`) — Platform kernel with 6-phase lifecycle (created → booting → ready → stopping → stopped → destroyed), subsystem orchestration, module context provisioning, lifecycle events (`kernel:ready`, `kernel:stopping`, `kernel:stopped`)
- **ServiceContainer refactor** — Full Dependency Injection container with 3 lifetimes: `Singleton` (one instance), `Scoped` (one per scope), `Transient` (new per injection); circular dependency detection via `_resolving` Set; parent-child scope chains; cleanup function support; `registerInstance()` for pre-built objects
- **EventBus enhancement** — Wildcard subscriptions (`*`, `'**'`) for cross-cutting concerns; priority-ordered handler execution (higher priority runs first)
- **Navigation** (`src/core/Navigation.js`) — Stack-based page router with `register()`, `navigate()`, `back()`, history management, `navigation:changed` events, accessibility announcements
- **JobManager** (`src/core/JobManager.js`) — Background task execution with full state machine (pending→running→completed/failed/cancelled), progress reporting via callback, automatic retry with configurable max retries, timeout support, 5-minute TTL cleanup, 7 lifecycle events (scheduled/started/progress/completed/failed/cancelled/retry)
- **CacheManager** (`src/core/CacheManager.js`) — In-memory cache with per-entry TTL, namespace-based invalidation via `clearByPrefix()`, `get()/set()/has()/delete()/clear()` API, automatic timer cleanup on expiry
- **Observability** (`src/core/Observability.js`) — Performance API integration (`mark()/measure()`), custom counters (`increment()`), gauges (`gauge()`), automatic function timing (`time()/timeAsync()`), diagnostic snapshot via `report()`, bounded measure history (1000 entries)
- **StateManager** (`src/core/StateManager.js`) — Module-level reactive stores via `createStore(name, initialState)`, store API: `getState()`, `setState(partial)`, `subscribe(listener)`, `reset()`, per-store listener error isolation
- **DialogManager** (`src/core/DialogManager.js`) — Stack-based dialog management with `show()`, `dismiss()`, `dismissAll()`, focus trapping via Accessibility, screen reader announcements
- **Accessibility** (`src/core/Accessibility.js`) — Live `aria-live` announcer (lazy singleton), `prefers-reduced-motion` and `prefers-contrast` media query watchers (live-updating), `setFocusTrap()` with Tab-key cycling, `setAriaLabel()`/`setRole()` helpers
- **Plugin SDK** (`src/utils/sdk.js`) — `createModule()` with defaults and validation, `defineCommand()`, `defineSetting()`, `defineSearchEntry()`, `createLocalizedStore()` for i18n, `createTimedCache()` for local caching
- **Localization infrastructure** (`src/utils/localization.js`) — `setLocale()/getLocale()`, `registerTranslations()`, `t(moduleId, key, params)` with params interpolation, `getAvailableLocales()`
- **ARCHITECTURE.md** — Comprehensive architecture documentation with subsystem design, architectural decisions, migration guide, performance and security considerations

### Changed

- Plugin.js now delegates to Kernel for lifecycle and subsystem management; `kernel`, `errorHandler`, `config` properties exposed for backward-compatible access
- Plugin module context now includes Kernel subsystems: `kernel`, `cache`, `jobs`, `state`, `dialogs`, `navigation`, `observability`, `accessibility`
- ModuleManager constructor accepts optional `options` parameter for dependency injection (resolver/loader/isolator)

### Fixed

- Plugin.js context merge order — Kernel's `_createModuleContext()` is now spread first, ensuring Plugin's `services` and `registries` take precedence

## [0.4.0] - 2026-07-08

### Added

- **ErrorHandler** — centralized error handling with severity categorization (recoverable, fatal, panic), global uncaught error/rejection boundary, event bus integration, error history
- **PluginError** — typed error class with code, severity, moduleId, cause, context, timestamp, and JSON serialization
- **ConfigManager** — centralized configuration with environment auto-detection (dev/prod), defaults, runtime overrides, reset
- **DOM utility** (`src/utils/dom.js`) — `safeHtml()` XSS sanitization, `setTextContent()`, `createElement()`
- **Logger modes** — development, production, and silent modes; development mode adds timestamps and auto-sets debug level; `group()`/`groupEnd()` support
- **Dependency index** in ModuleManager — O(1) dependent lookup via Map instead of O(n) full scan
- **Memoized tool category grouping** — `getToolsByCategory()` caches result, `invalidateCache()` for invalidation
- **Service cleanup** — ServiceContainer now supports per-service cleanup functions on destroy
- **CONTRIBUTING.md** — contribution guidelines
- **DEVELOPER_GUIDE.md** — comprehensive module development guide

### Fixed

- **ModuleManager.restart() bug** — missing `const` before `record` variable declaration causing implicit global
- **ModuleManager.destroyAll()** — now clears dependency index
- **DependencyResolver** — replaced `Array.find()` with `Map` for O(1) module lookups in all resolution algorithms

### Changed

- Plugin.js now integrates ErrorHandler and ConfigManager; `init()` signature simplified (removed unused `cacheFile`, `cacheFileUrl` params)
- Plugin.js context now includes `config` and `errorHandler` for module access
- main.js now wraps `setPluginInit` in try/catch with PluginError panic fallback
- Logger maintains backward-compatible API but now internally uses mode-checking
- ErrorIsolation now uses PluginError instead of ModuleError for consistency
- All error-related code now routes through ErrorHandler for unified reporting

### Security

- Added `safeHtml()` input sanitization utility — use for all dynamic content rendered via DOM APIs
- All UI components that accept strings now sanitize through `textContent` (already safe) — documented pattern for future tool UI

## [0.3.0] - 2025-07-08

### Added

- Complete Module Framework architecture
- EventBus with pub/sub, async, context binding, error isolation
- DependencyResolver with topological sort, circular detection, version compatibility
- ErrorIsolation sandbox for safe module execution
- ModuleLoader with validation (required fields, types) and defaults
- ModuleManager with full lifecycle: load, enable, disable, unload, destroy, restart
- 9 independent registries: Command, Settings, Storage, UI, Theme, Service, Action, Search, Permission
- Module descriptor format with metadata, permissions, dependencies, commands, settings, search
- Automatic module asset registration (commands/settings/search/actions register on enable, unregister on disable)
- Dependency-aware module ordering with required/optional dependency support
- Hot reload via `restart(id, context)` method
- Error isolation per module — one module crash never blocks others
- Typed error classes: ModuleError, DependencyError, CircularDependencyError, ValidationError, LifecycleError

### Changed

- Refactored home module to new module descriptor format (`src/modules/home/module.js`)
- Updated Plugin.js to use EventBus, all 9 registries, and ModuleManager
- SettingsService now namespaces keys per module (`moduleId.key`)
- moduleDescriptors manifest replaces old modules array

## [0.2.0] - 2025-07-08

### Added

- Complete UI/UX design system with CSS custom properties
- Dark and Light theme support with automatic Acode theme detection
- Reusable UI component library (20 components)
- Plugin home page with sections (welcome, search, quick actions, tool grid)
- Tool data model with 16 developer tools across 5 categories
- Global search with real-time filtering and result dropdown
- Quick action navigation bar for category jumping
- Settings page with dark mode toggle and about section
- Toast notification system for user feedback
- Modal dialog and bottom sheet components
- Loading, empty, and error state components
- Responsive grid layout (2-col mobile, 3-col tablet+)
- CSS bundled inline via esbuild text loader
- Auto theme detection from Acode app theme

## [0.1.0] - 2025-07-08

### Added

- Project foundation with modular architecture
- Plugin manifest (`plugin.json`) with full metadata
- Build system with esbuild and auto ZIP packaging
- ES module-based entry point with `AcodeDevToolkit` class
- Command registration and cleanup lifecycle
- Type checking support via `tsconfig.json`
- MIT License
- Development and production build scripts
