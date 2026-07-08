# Acode DevToolkit — Research & Planning Report

> **Project:** Acode DevToolkit v0.5.0  
> **Status:** Platform architecture complete, tool implementations pending  
> **Next:** v0.6.0 — First real tool module

---

## Table of Contents

1. [Executive Summary](#executive-summary)
2. [Phase 1 — Official Acode Plugin API Research](#phase-1--official-acode-plugin-api-research)
3. [Phase 2 — Ecosystem Research](#phase-2--ecosystem-research)
4. [Phase 3 — Competitor Research](#phase-3--competitor-research)
5. [Phase 4 — Gap Analysis](#phase-4--gap-analysis)
6. [Phase 5 — Product Strategy](#phase-5--product-strategy)
7. [Phase 6 — Technical Architecture](#phase-6--technical-architecture)
8. [Phase 7 — Risk Analysis](#phase-7--risk-analysis)
9. [Phase 8 — Implementation Roadmap](#phase-8--implementation-roadmap)
10. [Appendix A — Current Project Map](#appendix-a--current-project-map)
11. [Appendix B — Tool Inventory](#appendix-b--tool-inventory)

---

## Executive Summary

**Acode DevToolkit** is the first plugin every Acode developer installs — a platform providing developer utilities, shared infrastructure, and an SDK for building new tools. It transforms Acode from a code editor into an extensible developer platform without requiring any changes to Acode itself.

The project is currently at **v0.5.0** with 65 source files, 4,477 lines, 84KB bundle. It already has a robust foundation: Kernel lifecycle, DI container, 3-lifetime service container, EventBus with wildcards, ModuleManager with 6-state lifecycle, 9 registries, JobManager, CacheManager, StateManager, Navigation, DialogManager, Accessibility, Observability, ErrorHandler, ConfigManager, and a Plugin SDK.

**Key research findings:** Acode is undergoing a major migration from Ace to CodeMirror 6. All plugins must declare editor type (`ace`/`cm`/`both`). The latest stable version code is ~970 (v1.12.x). Plugin API is stable but evolving — the CodeMirror transition introduces breaking changes for theme/language plugins but most plugin APIs remain compatible. Plugin dependency support is not built into Acode. Plugin updates do not clean old files. Plugin loading now uses a quarantine system (15s timeout, 60s background limit).

**Strategic recommendation:** Pause new feature development. Focus on three things: (1) CodeMirror 6 compatibility certification, (2) real tools replacing placeholders, (3) developer documentation and examples. The architectural foundation is ready; now it needs content.

---

## Phase 1 — Official Acode Plugin API Research

### Confirmed API Surface

#### Core Plugin APIs

| API | Method | Status | Notes |
|---|---|---|---|
| `acode.setPluginInit` | `(id, fn, settings?)` | ✅ Stable | Init receives `(baseUrl, $page, { cacheFileUrl, cacheFile, firstInit, ctx })` |
| `acode.setPluginUnmount` | `(id, fn)` | ✅ Stable | Called on disable/uninstall |
| `acode.require` | `(module)` | ✅ Stable | Returns 25+ modules |
| `acode.exec` | `(command, value?)` | ✅ Stable | Execute Acode internal commands |
| `acode.registerFormatter` | `(id, exts, fn, name?)` | ✅ Stable | Code formatter registration |
| `acode.addIcon` | `(name, src, options?)` | ✅ Stable | Custom icon registration |
| `acode.pushNotification` | `(title, msg, opts?)` | ✅ v954+ | Acode notification bar |
| `acode.installPlugin` | `(id, installerPlugin)` | ✅ v954+ | Plugin-to-plugin installation |
| `acode.newEditorFile` | `(name, options?)` | ✅ Stable | Create file in editor |
| `acode.waitForPlugin` | `(id)` | ✅ Stable | Wait for other plugin |
| `acode.clearBrokenPluginMark` | `(id)` | ✅ Stable | Clear broken state |
| `acode.toInternalUrl` | `(url)` | ✅ Stable | Convert to internal URL |

#### Available Modules via `acode.require()`

| Module | Purpose | Status |
|---|---|---|
| `commands` | Add/remove commands, command registry | ✅ Stable |
| `settings` | Settings persistence (`value`, `update()`) | ✅ Stable |
| `page` | Page UI component (`Page(title, opts)`, `appendBody/Outer`, `on/off`, `hide`) | ✅ Stable |
| `actionStack` | Back button management (`push/pop/remove/length/setMark/clearFromMark`) | ✅ Stable (v290+) |
| `sidebarApps` | Sidebar app registration (`add(icon, id, title, init, prepend?, onSelected?)`) | ✅ Stable |
| `sideButton` | Editor side buttons (`show/hide`, `options`) | ✅ Stable (v316+) |
| `fs` | Full file system API | ✅ Stable |
| `terminal` | Terminal integration (`create/createLocal/get/write/clear/close/themes`) | ✅ Stable |
| `lsp` | LSP support (`defineServer/defineBundle/register/upsert`) | ✅ Stable |
| `editorThemes` | Theme registration (`register/apply/unregister/list/get/createTheme`) | ✅ Stable |
| `url` | URL utilities | ✅ Stable |
| `encoding` | Encoding utilities | ✅ Stable |
| `editor` | Editor interaction (Ace — may be deprecated) | ⚠️ Migration |
| `editorManager` | `editor`, `activeFile`, `on/off/emit`, `addNewFile`, `switchFile` | ✅ CodeMirror |
| `addedFolder` | Folder management | ✅ Stable |
| `openFolder` | Open folder | ✅ Stable |
| `projects` | Project management | ✅ Stable |
| `ace` | Ace editor API | ⚠️ Migration |
| `formatter` | Code formatting | ✅ Stable |
| `toast` | Toast notifications | ✅ Stable |
| `alert` | Alert dialog | ✅ Stable |
| `confirm` | Confirm dialog | ✅ Stable |
| `prompt` | Prompt dialog | ✅ Stable |
| `multiPrompt` | Multi-input dialog | ✅ Stable |
| `colorPicker` | Color picker | ✅ Stable |
| `select` | Select dialog | ✅ Stable |
| `loader` | Loading indicator | ✅ Stable |
| `customDialog` | Custom dialog builder | ✅ Stable |
| `tutorial` | Tutorial system | ✅ Stable |
| `selectionMenu` | Selection menu | ✅ Stable |
| `editorLanguages` | Language modes | ⚠️ Migration |
| `editorThemes` | Editor themes | ⚠️ Migration |

#### UI Components via `acode.require()`

| Component | Method |
|---|---|
| `alert` | `alert(message, title?, cb?)` |
| `confirm` | `confirm(message, title?, cb?)` |
| `prompt` | `prompt(message, value?, title?, cb?, type?, options?)` |
| `multiPrompt` | `multiPrompt(questions, title?, cb?)` |
| `colorPicker` | `colorPicker(color, cb?)` |
| `select` | `select(items, title?, cb?)` |
| `loader` | `loader(id, icon?, hideOnError?)` |
| `toast` | `toast(message, position?, delay?)` |
| `customDialog` | `customDialog(options)` |
| `tutorial` | `tutorial(steps, title?)` |
| `selectionMenu` | `selectionMenu(e, options, callback, listManipulation?)` |

### Critical Findings

1. **Editor Type Declaration is now mandatory.** Plugins must declare `supported_editor` on `acode.app` (`ace`/`cm`/`all`). The default is now `"cm"` (CodeMirror). Acode has hard-blocked Ace-only plugins in recent nightlies, then softened to a warning. **Our plugins should declare `"all"` or `"cm"` support.**

2. **Plugin loading uses a quarantine system (v1.12+).** Plugins that time out (>15s) are quarantined, not deleted. After 60s background, if still stuck, they are disabled. **Keep init fast, defer heavy work.**

3. **Plugin update does NOT clean old files.** Files from previous versions persist. **Unique filenames per build or versioned asset paths required.**

4. **No official plugin dependency system.** The `plugin.json` schema does not include `dependencies`. There is no built-in way to declare "this plugin requires Plugin X". **Our Kernel's DI and ModuleManager must manage intra-plugin dependencies within our own ecosystem.**

5. **`firstInit` is provided in init options.** This flag is `true` only on first install. **Use for one-time migrations.** `cacheFile` is a writable File object for persistent storage.

6. **Plugin console logs are mixed.** The community has complained (Issue #1817) that plugin logs are indistinguishable from core logs. **Our logger already prefixes with `[Acode DevToolkit]` — this is correct.**

7. **CodeMirror 6 migration is active.** The migration from Ace to CodeMirror 6 is underway (Discussion #1560, PR #1893). Compatibility shims exist for some Ace APIs (`getSelectionRange`, `scrollToRow`, `ace.require`). Editor theme plugins and language mode plugins are broken — our tool modules don't depend on these, so we are unaffected.

### Plugin Manifest Specification (`plugin.json`)

**Required fields:** `id`, `name`, `main`, `version`, `minVersionCode`

**Important fields:** `readme`, `icon`, `files`, `price`, `license`, `keywords`, `changelogs`, `author`, `contributors`, `repository`

**Constraints:**
- Icon file must be ≤50KB
- Price range: INR 0–10,000
- `main` defaults to `main.js` (Acode currently ignores custom `main` paths — Issue #1026, now fixed)
- `readme` defaults to `readme.md`
- `icon` defaults to `icon.png`

---

## Phase 2 — Ecosystem Research

### Top Plugins & Repositories

| Plugin | Stars | Description |
|---|---|---|
| **AI CLI Assistant** (miscdevstuff) | ~50 | Multi-provider AI, code analysis, project management |
| **Git SCM** (Victozee26/dikidjatar) | 43 | Full Git integration, file decorations, status bar |
| **Runner Plugin** (bajrangCoder) | 15 | Code runner with terminal, 15 languages, auto-install |
| **Rutex AI Agent** (hallofcodes) | 12 | Autonomous AI agent, file system operations, terminal |
| **Eruda Console** (sebastianjnuwu) | Popular | Mobile console for debugging |
| **Color Picker** | — | Color selection tool |
| **Zen** | — | Distraction-free mode |
| **Snippets** | — | Code snippet management |
| **HTML Preview** | — | Live HTML preview |
| **Codex** | — | Code documentation |
| **jQuery** | — | jQuery support |
| **PyPI** | — | Python package browser |

### Community Pain Points (from GitHub Issues)

1. **Plugin disappearance** (Issue #2010) — Fixed via quarantine system
2. **Console log mixing** (Issue #1817) — Need per-plugin log prefixes
3. **Editor hang/flicker** (Issue #1968) — CodeMirror 6 performance issues, LSP-related
4. **Plugin update file pollution** (Issue #1026) — Old files remain after update
5. **No plugin dependencies** (Discussion #784) — Cannot express cross-plugin requirements
6. **CodeMirror migration breaking changes** (Discussion #1560) — Theme/language plugins broken
7. **Plugin management UX** — Multiple reports of plugin blank screens, disappearances

### Missing Features in Ecosystem

1. **No shared UI component library** — Every plugin reinvents buttons, cards, modals, toasts
2. **No cross-plugin communication** — Plugins cannot discover or interoperate with each other
3. **No unified search across tools** — Each plugin has its own search, no global command palette
4. **No standard settings UI** — Each plugin builds its own settings page
5. **No shared caching layer** — Each plugin does its own caching or doesn't cache at all
6. **No plugin SDK** — No standard way to create a well-structured plugin
7. **No background job system** — Heavy operations block the UI thread
8. **No accessibility support** — Most plugins ignore ARIA, screen readers, reduced motion
9. **No observability** — No metrics, performance tracking, or crash diagnostics
10. **No error isolation** — One plugin crash can affect others via uncaught exceptions

---

## Phase 3 — Competitor Research

### VS Code Extension Architecture (Desktop Reference)

| Feature | VS Code | Our Approach |
|---|---|---|
| Process isolation | Extension Host (separate Node process) | In-process with ErrorIsolation sandbox |
| Activation events | Lazy via `activationEvents` in package.json | ModuleManager with dependency ordering |
| Contribution points | `contributes` in package.json (commands, menus, views) | 9 registries (Command, Search, Settings, etc.) |
| Extension API | Scoped context object (`vscode` namespace) | Module context object with `kernel.*` services |
| Dependency resolution | Built-in, extensions declare `extensionDependencies` | DependencyResolver with topological sort |
| Search | Built-in search provider API | SearchRegistry (needs FTS upgrade) |
| Command palette | Built-in with `@` prefix filtering | CommandRegistry (needs UI palette) |
| Settings | Contributed setting schema | SettingsRegistry + SettingsService |

### Key Lessons from VS Code Model

1. **Lazy activation is essential for startup performance.** Our Kernel already supports deferred loading via ModuleManager. Most modules should NOT activate on boot — they should activate on demand (tool opened, command executed, etc.).

2. **Contribution points decouple registration from implementation.** Our 9 registries follow this pattern already. Commands, settings, search entries are contributed during `enable()` and unregistered during `disable()`.

3. **Scoped API surface prevents tight coupling.** The module context is a controlled interface — modules don't access the full ServiceContainer. This is correct.

4. **Event bus for plugin-to-plugin communication.** Our EventBus with wildcard support enables cross-plugin communication without direct coupling. This is correct.

### Mobile IDE Landscape

| Platform | Approach | Relevance |
|---|---|---|
| **Acode** | Lightweight, WebView-based, Cordova | Our target platform |
| **Spck Editor** | Native Android, no plugin system | Acode has no plugin competition |
| **DroidVim** | Vim-based, no JS plugins | Different audience |
| **code-server** | VS Code in browser | Not native mobile UX |

Acode is the only Android code editor with a plugin system. Our competitive advantage is making plugin development so easy that the Acode ecosystem grows. Every plugin developer learns DevToolkit patterns first, then builds on top.

---

## Phase 4 — Gap Analysis

### What Already Exists (v0.5.0)

| Category | Status | Details |
|---|---|---|
| **Kernel lifecycle** | ✅ Complete | 6 phases, subsystem orchestration |
| **DI container** | ✅ Complete | 3 lifetimes, circular detection, scopes |
| **EventBus** | ✅ Complete | Wildcards, priority, sync/async |
| **Module lifecycle** | ✅ Complete | 6 states, 6 transitions, error recovery |
| **Dependency resolution** | ✅ Complete | Topological sort, cycle detection |
| **Error handling** | ✅ Complete | Severity levels, global boundary, history |
| **Module loading** | ✅ Complete | Validation, defaults, batch loading |
| **9 Registries** | ✅ Complete | Commands, Settings, Storage, UI, Theme, Services, Actions, Search, Permissions |
| **4 Services** | ✅ Complete | Commands, Settings, Editor, Notifications |
| **Background jobs** | ✅ Complete | Schedule, cancel, progress, retry |
| **Cache system** | ✅ Complete | TTL, namespaces, prefix clearing |
| **Navigation** | ✅ Complete | Stack-based routing |
| **State management** | ✅ Complete | Module-level stores |
| **Dialog management** | ✅ Complete | Stack-based with focus trap |
| **Accessibility** | ✅ Complete | ARIA, reduced motion, announcements |
| **Observability** | ✅ Complete | Performance marks, counters, gauges |
| **Plugin SDK** | ✅ Complete | createModule, defineCommand, etc. |
| **Localization** | ✅ Complete | Translation infrastructure |
| **20 UI components** | ✅ Complete | Cards, modals, toasts, toggle, search, etc. |
| **Home page** | ✅ Complete | 7 sections, categories, search |
| **Settings page** | ✅ Complete | Dark mode, preferences |
| **16 tool definitions** | ✅ Complete | Tools data model |

### What Is Missing (Highest Impact First)

| # | Gap | Priority | Impact | Effort | Notes |
|---|---|---|---|---|---|
| 1 | **Real tool implementations** | Critical | Highest | High | All 16 tools are "coming soon" placeholders. Until real tools exist, the project is a framework without an app. |
| 2 | **Fuzzy search engine** | High | High | Medium | Current search is basic `includes()`. Needs FTS, ranking, faceted search, history. |
| 3 | **Command palette UI** | High | High | Medium | Need a VS Code-style command palette with fuzzy search, categories, keyboard triggers. |
| 4 | **Tool activation on demand** | High | High | Medium | Loading all 16 tools eagerly is wasteful. Each tool should be a module that activates when opened. |
| 5 | **Sidebar integration** | Medium | Medium | Low | Register as a sidebar app for quick access. |
| 6 | **Context menu integration** | Medium | Medium | Low | Add DevToolkit operations to editor context menu. |
| 7 | **Plugin-to-plugin API** | Medium | Medium | Low | Document and stabilize the cross-plugin communication API. |
| 8 | **Test suite** | Medium | High | High | No tests at all. Need unit tests for Kernel, DI, EventBus, ModuleManager. |
| 9 | **CI/CD pipeline** | Medium | Medium | Low | GitHub Actions for build, lint, test on PR. |
| 10 | **Backup/restore settings** | Low | Medium | Low | Export/import tool settings and favorites. |
| 11 | **Cloud sync (future)** | Low | Low | High | Deferred to v2.0. |
| 12 | **AI integration (future)** | Low | Low | High | Deferred to v2.0 (let AI plugins use our tools). |

### What Should Never Be Built

| Feature | Reason |
|---|---|
| **Editor language support** | Acode already has CodeMirror language modes. Our tool modules operate on text, not languages. |
| **LSP client** | Acode already has a comprehensive LSP API (`acode.require('lsp')`). |
| **File system browser** | Acode's built-in file explorer is excellent. We add tools on top of it. |
| **Terminal emulator** | Acode has `acode.require('terminal')`. We use it for tool execution. |
| **Git integration** | Git SCM plugin already exists. We integrate with it, not replace it. |
| **Theme system** | Acode has `acode.require('editorThemes')`. We build our own design system (CSS variables) for plugin UI only. |
| **Notification system** | Acode has `acode.pushNotification()`. We use our Toast component for in-plugin notifications. |
| **Code formatter** | Acode has `acode.registerFormatter()`. |
| **Authentication/User system** | The plugin is a tool collection, not a SaaS product. |

---

## Phase 5 — Product Strategy

### Mission

Make every Acode developer more productive by providing essential tools, shared infrastructure, and a platform for building and sharing new developer utilities.

### Vision

Acode DevToolkit becomes the first plugin every Acode user installs — the essential toolkit for the Acode ecosystem. It provides tools, APIs, and patterns that raise the quality bar for all Acode plugins.

### Target Users

| Persona | Description | Needs |
|---|---|---|
| **Mobile Developer** | Builds apps on Android using Acode | Quick access to JSON formatting, base64, color conversion, regex testing |
| **Hobbyist Coder** | Codes on phone during commute | Password generation, text analysis, diff checking |
| **Plugin Developer** | Creates Acode plugins | SDK, UI components, reusable services, documentation |
| **Power User** | Uses Acode for multiple projects | Search across tools, favorites, settings, automation |

### Success Metrics

1. **Adoption:** 1,000+ Acode users install DevToolkit
2. **Community:** 10+ external contributions (tools, fixes, docs)
3. **Quality:** 90%+ code coverage, 0 critical bugs
4. **Ecosystem:** 5+ plugins built using DevToolkit SDK

---

## Phase 6 — Technical Architecture

### Current Architecture (v0.5.0)

```
src/
  core/          (17 files) — Kernel, DI, ModuleManager, EventBus, subsystems
  services/      (4 files)  — Acode API wrappers
  registries/    (10 files) — Module asset registries
  modules/       (1 module) — Home page
  ui/            (22 files) — 20 UI components + index + PageFactory + SidebarApp
  pages/         (2 files)  — HomePage, SettingsPage
  data/          (1 file)   — Tool definitions
  styles/        (1 file)   — CSS design system
  utils/         (6 files)  — Constants, DOM, errors, localization, logger, SDK
  1 entry        main.js

Total: ~65 source files, ~4,477 lines, ~84KB bundle
```

### Architecture Principles

1. **Kernel-Plugin separation** ✅ — Kernel has zero Acode dependencies. Plugin bridges Acode.
2. **DI container with lifetimes** ✅ — 3 lifetimes (singleton/scoped/transient), circular detection.
3. **EventBus with wildcards** ✅ — Enables cross-plugin communication without coupling.
4. **Module lifecycle** ✅ — 6 states (unloaded→loaded→enabled→disabled→unloaded→destroyed, error).
5. **Error isolation** ✅ — One module crash never blocks others.
6. **Backward compatibility** ✅ — All v0.4.0 APIs unchanged in v0.5.0.

### Architecture Weaknesses (To Fix)

1. **Tools are data, not modules.** The 16 tools in `src/data/tools.js` are static definitions, not loaded as modules. They have no lifecycle, no startup/shutdown, no dependencies, and no registrations. Each tool should eventually be a proper module in `src/modules/<tool>/module.js`.

2. **Home page is too coupled.** `HomePage.js` directly imports tool data and hardcodes quick actions. It should render from registry data, not hardcoded arrays.

3. **No lazy module loading.** All modules load eagerly on init. For 5-10 modules this is fine; for 100+ it won't scale. ModuleManager needs a deferred activation mechanism.

4. **Acode `.require()` is not abstracted.** Services call `acode.require('commands')` directly. This makes unit testing impossible without patching the global `acode` object. Services should receive Acode modules via constructor injection.

5. **Page lifecycle is not managed.** SettingsPage manually manages `actionStack` push/pop. HomePage mounts via `document.querySelector('.dtk-container')`. Navigation subsystem exists but is not wired to pages yet.

---

## Phase 7 — Risk Analysis

### Technical Risks

| Risk | Probability | Impact | Mitigation |
|---|---|---|---|
| **CodeMirror 6 breakage** | Medium | High | Monitor Acode changelog. Pin `acode-plugin-types` to compatible version. Test against latest nightly. |
| **Acode API deprecations** | Low | Medium | Wrap all `acode.require()` calls in services. Only change the service implementation. |
| **Plugin timeout (15s limit)** | Low | Medium | Keep `init()` lean. Defer heavy tool initialization to first activation. |
| **Android WebView performance** | Medium | Medium | Profile bundle size (84KB is fine). Avoid large DOM trees. Use efficient rendering. |

### Maintenance Risks

| Risk | Probability | Impact | Mitigation |
|---|---|---|---|
| **Single maintainer** | High | High | Document everything. Write clear CONTRIBUTING.md. Lower barrier for PRs. |
| **Dependency drift** | Low | Medium | Pin `html-tag-js` version. esbuild is well-maintained. |
| **Feature creep** | High | Medium | Strict roadmap. "Build when needed, not when imagined." |
| **Plugin ecosystem stalling** | Low | High | DevToolkit is valuable standalone. Not dependent on external plugins. |

### Performance Risks

| Risk | Probability | Impact | Mitigation |
|---|---|---|---|
| **Startup time > 15s** | Low | High | Tool modules activate on demand, not on boot. Only Kernel + HomePage load at startup. |
| **Memory leak from modules** | Medium | Medium | ModuleManager calls `shutdown()` and `cleanup()` on disable. Test with Chrome DevTools memory profiler. |
| **Search performance with 1000+ entries** | Medium | Low | Current search is O(n). Upgrade to prefix trie or FTS when scales demand it. |

### Security Risks

| Risk | Probability | Impact | Mitigation |
|---|---|---|---|
| **XSS via tool input** | Low | High | All existing UI uses `textContent`. Document `safeHtml()` for future tool modules. |
| **Module permissions** | Low | Medium | Implement permission checks in PermissionRegistry before allowing file/network access. |

---

## Phase 8 — Implementation Roadmap

### Milestone Plan

#### Milestone 1: First Real Tool — JSON Formatter (v0.6.0)

**Goal:** Prove the architecture by building one complete tool module.

**Deliverables:**
- `src/modules/json-formatter/module.js` — Full lifecycle, commands, search entries
- `src/tools/json-formatter/ui.js` — Format/validate/minify UI with syntax highlighting
- Editor integration — format selected text, format entire file, clipboard copy
- Settings — indent size, sort keys, minify on copy
- Cache — persist recent documents
- Tests — module lifecycle, formatting logic

**Acceptance:** User can open a JSON file, press a button, get formatted output. The tool can be launched from search, home page grid, and command palette.

#### Milestone 2: Tool Activation System (v0.7.0)

**Goal:** Replace hardcoded tool data with a registry-driven activation system.

**Deliverables:**
- `src/registries/ToolRegistry.js` — Register tool modules with metadata, icon, category
- Home page renders from ToolRegistry, not `data/tools.js`
- Tool activation on demand — tools load when user clicks, not at startup
- Favorites tracking via SettingsService
- Recently used tracking via StateManager

#### Milestone 3: Command Palette (v0.8.0)

**Goal:** Universal command palette for all tools, settings, and actions.

**Deliverables:**
- `src/ui/CommandPalette.js` — Overlay with fuzzy search input
- Integration with SearchRegistry for keyword matching
- Categories, keyboard selection, recent commands
- History persistence via SettingsService

#### Milestone 4: Sidebar & Quick Actions (v0.9.0)

**Goal:** Register DevToolkit as a sidebar app in Acode for one-tap access.

**Deliverables:**
- Sidebar app registration via `acode.require('sidebarApps')`
- Quick action buttons (current tools, favorites, recent)
- Context menu integration (`acode.require('contextMenu')`)
- Side button for quick palette access

#### Milestone 5: Testing & CI (v0.10.0)

**Goal:** Establish quality infrastructure.

**Deliverables:**
- Unit tests for Kernel, ServiceContainer, EventBus, ModuleManager
- GitHub Actions workflow: lint, typecheck, test, build
- JSDoc annotations on all public APIs
- Test coverage report

#### Milestone 6: Documentation & SDK Examples (v0.11.0)

**Goal:** Make it easy for anyone to build a tool.

**Deliverables:**
- Complete tutorial: Build Your First Tool in 10 Minutes
- API reference docs for all subsystems
- Example modules: character counter, text case converter, line sorter

#### Milestone 7: Five Real Tools (v0.12.0)

**Goal:** Replace 5 "coming soon" placeholders with real tools.

**Priority order:** JSON Formatter → Base64 Encoder/Decoder → Hash Generator → UUID Generator → Color Converter

### Git Strategy

- `main` — Stable, releasable. Protected branch.
- `develop` — Integration branch for feature work.
- `feat/<name>` — Feature branches, merged to develop.
- Commits: Conventional Commits (`feat:`, `fix:`, `docs:`, `refactor:`, `test:`)
- Each milestone is a tagged release (`v0.6.0`, `v0.7.0`, etc.)

### Release Strategy

- **Pre-1.0:** Milestone releases every 2–4 weeks. Can be installed manually or via plugin URL.
- **1.0+:** Published on acode.app plugin registry. SemVer strict.
- Each release includes: updated `plugin.json`, `CHANGELOG.md` entry, ZIP archive in releases.

---

## Appendix A — Current Project Map

```
acode-devtoolkit/
├── src/
│   ├── main.js                    # Entry point — Plugin bridge
│   ├── core/
│   │   ├── Kernel.js              # Platform orchestrator (6 lifecycle phases)
│   │   ├── ServiceContainer.js    # DI container (3 lifetimes, circular detection)
│   │   ├── EventBus.js            # Pub/sub (wildcards, priority, async)
│   │   ├── ModuleManager.js       # Module lifecycle (6 states)
│   │   ├── DependencyResolver.js  # Topological sort + cycle detection
│   │   ├── ErrorHandler.js        # PluginError with severity levels
│   │   ├── ConfigManager.js       # Environment detection + defaults
│   │   ├── Navigation.js          # Stack-based page router
│   │   ├── JobManager.js          # Background tasks with state machine
│   │   ├── CacheManager.js        # TTL-based memory cache
│   │   ├── Observability.js       # Performance marks, counters, gauges
│   │   ├── StateManager.js        # Module-level reactive stores
│   │   ├── DialogManager.js       # Stack-based dialog with focus trap
│   │   ├── Accessibility.js       # ARIA, reduced motion, focus cycling
│   │   └── Plugin.js              # Acode bridge → Kernel
│   ├── services/
│   │   ├── CommandService.js      # Wraps acode.require('commands')
│   │   ├── SettingsService.js     # Wraps acode.require('settings')
│   │   ├── EditorService.js       # Wraps window.editorManager
│   │   └── NotificationService.js # Wraps acode.pushNotification()
│   ├── registries/
│   │   ├── CommandRegistry.js
│   │   ├── SettingsRegistry.js
│   │   ├── StorageRegistry.js
│   │   ├── UIRegistry.js
│   │   ├── ThemeRegistry.js
│   │   ├── ServicesRegistry.js
│   │   ├── ActionsRegistry.js
│   │   ├── SearchRegistry.js
│   │   └── PermissionRegistry.js
│   ├── modules/
│   │   └── home/
│   │       └── module.js          # Home page module
│   ├── ui/
│   │   ├── index.js               # UI component exports
│   │   ├── Card.js
│   │   ├── Modal.js
│   │   ├── Toast.js
│   │   ├── Toggle.js
│   │   ├── Badge.js
│   │   ├── Button.js
│   │   ├── SearchBar.js
│   │   ├── Icon.js
│   │   ├── ProgressBar.js
│   │   ├── Tooltip.js
│   │   ├── Dropdown.js
│   │   ├── TabBar.js
│   │   ├── Chip.js
│   │   ├── EmptyState.js
│   │   ├── Spinner.js
│   │   ├── Divider.js
│   │   ├── ButtonGroup.js
│   │   ├── List.js
│   │   ├── Grid.js
│   │   ├── Section.js
│   │   ├── PageFactory.js         # Page creation helper
│   │   └── SidebarApp.js          # Sidebar app registration
│   ├── pages/
│   │   ├── HomePage.js            # Main landing page (7 sections)
│   │   └── SettingsPage.js        # Settings page (dark mode, preferences)
│   ├── data/
│   │   └── tools.js               # 16 tool definitions
│   ├── styles/
│   │   └── main.css               # Design system (40+ CSS tokens)
│   └── utils/
│       ├── constants.js
│       ├── sdk.js                 # Plugin SDK
│       ├── localization.js        # i18n infrastructure
│       ├── logger.js              # Logger with prefixes
│       ├── dom.js                 # DOM utilities
│       └── errors.js              # Error types
├── dist/                          # Build output
├── package.json
├── esbuild.config.mjs
├── plugin.json
├── tsconfig.json
├── icon.png
├── README.md
├── ARCHITECTURE.md
├── DEVELOPER_GUIDE.md
├── CONTRIBUTING.md
├── CHANGELOG.md
├── LICENSE
└── RESEARCH.md                    # ← You are here
```

---

## Appendix B — Tool Inventory

All 16 tools are currently **"coming soon" placeholders**. None have real implementations.

| # | Tool | Category | Description | Priority |
|---|---|---|---|---|
| 1 | **JSON Formatter** | Data | Format, validate, minify JSON | Highest |
| 2 | **Base64 Encoder/Decoder** | Data | Encode/decode base64 strings | High |
| 3 | **Hash Generator** | Crypto | Generate MD5, SHA-1, SHA-256 hashes | High |
| 4 | **UUID Generator** | Data | Generate UUIDs (v4, v7) | High |
| 5 | **Color Converter** | Data | Convert between hex, rgb, hsl | High |
| 6 | **Regex Tester** | Text | Test regular expressions against input | Medium |
| 7 | **Diff Checker** | Text | Side-by-side text comparison | Medium |
| 8 | **HTML Entity Encoder** | Data | Encode/decode HTML entities | Medium |
| 9 | **JWT Decoder** | Data | Decode and inspect JWT tokens | Medium |
| 10 | **Text Case Converter** | Text | Convert between casing styles | Medium |
| 11 | **Lorem Ipsum Generator** | Text | Generate placeholder text | Low |
| 12 | **URL Encoder/Decoder** | Data | Encode/decode URL components | Low |
| 13 | **SQL Formatter** | Data | Format SQL queries | Low |
| 14 | **Timestamp Converter** | Data | Convert between timestamp formats | Low |
| 15 | **String Inspector** | Text | Inspect string properties | Low |
| 16 | **Password Generator** | Crypto | Generate secure passwords | Low |
