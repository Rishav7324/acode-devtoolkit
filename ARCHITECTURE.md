# Architecture Guide

This document describes the architectural decisions, subsystem design, and rationale for the Acode DevToolkit platform.

## Architecture Overview

```
┌─────────────────────────────────────────────────────────────┐
│                    KERNEL (Platform Core)                    │
│  ┌──────────┐ ┌──────────┐ ┌──────────┐ ┌──────────────┐  │
│  │  Kernel   │ │  EventBus│ │Services  │ │ ModuleManager │  │
│  │  (Lifecyc)│ │  (Pub/Sub)│ │(DI Cont.)│ │(Lifecycle)   │  │
│  └──────────┘ └──────────┘ └──────────┘ └──────────────┘  │
│                                                             │
│  ┌──────────┐ ┌──────────┐ ┌──────────┐ ┌──────────────┐  │
│  │Navigation│ │   Jobs   │ │  Cache   │ │  State        │  │
│  │ (Router) │ │(Backgrnd)│ │ (Memory) │ │ (Stores)      │  │
│  └──────────┘ └──────────┘ └──────────┘ └──────────────┘  │
│                                                             │
│  ┌──────────┐ ┌──────────┐ ┌──────────┐ ┌──────────────┐  │
│  │ Dialogs  │ │Observabil│ │Accessibil│ │  ErrorHandler │  │
│  │ (Stack)  │ │ (Metrics)│ │ (ARIA)   │ │ (Severities)  │  │
│  └──────────┘ └──────────┘ └──────────┘ └──────────────┘  │
└─────────────────────────────────────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────┐
│                    PLUGIN (Acode Bridge)                     │
│  • Acode lifecycle (setPluginInit/setPluginUnmount)         │
│  • Style injection / theme detection                        │
│  • Registry management (9 subsystems)                       │
│  • Module bootstrapping                                     │
└─────────────────────────────────────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────┐
│                    MODULES (Feature Units)                   │
│  ┌──────────┐ ┌──────────┐ ┌──────────┐ ┌──────────────┐  │
│  │   Home   │ │   Tool   │ │   Tool   │ │   ...Future   │  │
│  │  Module  │ │ Module 1 │ │ Module 2 │ │   Modules     │  │
│  └──────────┘ └──────────┘ └──────────┘ └──────────────┘  │
└─────────────────────────────────────────────────────────────┘
```

## Architectural Decisions

### Why a Kernel separate from Plugin?

The Plugin class is the Acode bridge — it handles `acode.setPluginInit`, style injection, theme detection, and Acode-specific bootstrapping. The Kernel is a pure platform runtime with no Acode dependencies. This separation means:

1. **Testability** — Kernel can be instantiated and tested without Acode
2. **Portability** — Kernel could power non-Acode environments in the future
3. **Stability** — Platform architecture doesn't change when Acode API changes
4. **Clarity** — Each class has one responsibility

### Why 3 Service Lifetimes (Singleton/Scoped/Transient)?

| Lifetime | When to use | Example |
|---|---|---|
| **Singleton** | One instance shared across all consumers | Logger, ConfigManager, EventBus |
| **Scoped** | One instance per scope (e.g., per module, per request) | Per-module data context |
| **Transient** | New instance every injection | Stateless helpers, formatters |

This follows industry-standard DI container patterns (similar to Angular, .NET, and Dagger).

### Why EventBus with Wildcards and Priority?

Wildcard handlers (`*`, `**`) allow modules to observe all events for debugging, analytics, or forwarding. Priority ordering ensures critical handlers (like state persistence) run before UI handlers.

### Why Module-level State instead of Global State?

Each module owns its state via `StateManager.createStore()`. This prevents:
- Accidental cross-module coupling through shared state
- Global state that's hard to reason about
- Memory leaks from uncleaned listeners

### Why a Job Manager instead of raw Promises?

Background tasks (hash generation, diff computation, network requests) need:
- **Cancellation** — User closes tool before computation finishes
- **Progress** — Long operations need UI feedback
- **Retry** — Transient failures should auto-retry
- **Observability** — Admin panel to see running/completed/failed jobs

Raw Promises don't provide any of these capabilities.

### Why a Cache Manager?

Developer tools perform expensive operations (hashing, formatting, parsing). A unified cache with TTL avoids redundant computation while preventing memory leaks. Cache keys are namespaced per module to prevent collisions.

### Why DialogManager instead of direct Modal creation?

When multiple dialogs overlap (e.g., a confirmation dialog opens another modal), the DialogManager manages the stack, restores focus correctly, and ensures proper ARIA live region announcements. Direct Modal creation doesn't handle stacking.

### Why Accessibility as a Core Subsystem?

A platform used by all developers must be accessible. The Accessibility subsystem:
- Manages a single `aria-live` announcer for screen reader messages
- Tracks `prefers-reduced-motion` and `prefers-contrast` media queries
- Provides focus trapping for modals and dialogs
- Centralizes ARIA attribute management

## Subsystem Details

### Kernel (`src/core/Kernel.js`)
- Manages platform lifecycle: `created → booting → ready → stopping → stopped → destroyed`
- Boots all subsystems in dependency order
- Emits lifecycle events: `kernel:ready`, `kernel:stopping`, `kernel:stopped`
- Provides `createModuleContext()` for module startup injection
- Singleton via `container.registerInstance('kernel', this)`

### ServiceContainer (`src/core/ServiceContainer.js`)
- 3 lifetimes: `singleton`, `scoped`, `transient`
- Constructor injection via `dependencies: ['serviceA', 'serviceB']`
- Circular dependency detection via `_resolving` Set
- Parent-child scopes via `createScope()` (child delegates to parent)
- Cleanup functions called on `destroy()`

### EventBus (`src/core/EventBus.js`)
- `on(event, handler, context, priority)` — subscribe with numeric priority
- `once(event, handler, context, priority)` — one-shot subscription
- `emit(event, data)` — sync dispatch with error isolation per handler
- `emitAsync(event, data)` — async dispatch via `Promise.allSettled`
- Wildcard `'*'` handlers receive `{ event, data }`
- Priority sorting (higher priority runs first)

### Navigation (`src/core/Navigation.js`)
- Stack-based history (not hash-based, not DOM-based)
- `register(name, factory, { title, icon })` — page factory registration
- `navigate(name, params)` — push to history, emit `navigation:changed`
- `back()` — pop history
- Accessibility announcement on navigation

### JobManager (`src/core/JobManager.js`)
- State machine: `pending → running → completed/failed/cancelled`
- Runner receives `{ progress(pct), signal }` for cancellation and progress
- Automatic retry with configurable `maxRetries`
- Timeout support
- Job history cleanup (5 minute TTL after completion)
- Events: `job:scheduled`, `job:started`, `job:progress`, `job:completed`, `job:failed`, `job:cancelled`, `job:retry`

### CacheManager (`src/core/CacheManager.js`)
- In-memory Map with TTL
- `set(key, value, ttlMs)` — optional TTL, auto-cleanup via setTimeout
- `get(key)` — returns undefined if expired
- `clearByPrefix(prefix)` — namespace-based clearing
- `size` getter, `keys()` enumerator

### Observability (`src/core/Observability.js`)
- `performance.mark()` / `performance.measure()` integration
- `increment(counter)` / `gauge(name, value)` — custom metrics
- `time(fn, label)` / `timeAsync(fn, label)` — automatic timing
- `report()` — snapshot of all metrics, counters, gauges, recent 50 measures

### StateManager (`src/core/StateManager.js`)
- Module-level stores via `createStore(name, initialState)`
- `store.getState()`, `store.setState(partial)`, `store.subscribe(listener)`
- `store.reset()` — clear to empty
- Stores are isolated; no cross-store events

### DialogManager (`src/core/DialogManager.js`)
- Stack-based dialog management
- `show(component, { id, title, dismissable })` — push to stack
- `dismiss(id)` — dismiss specific or top
- `dismissAll()` — clear stack
- Focus trapping via Accessibility
- Accessibility announcement on open

### Accessibility (`src/core/Accessibility.js`)
- Single `aria-live` announcer element (lazy-created)
- `announce(message)` — screen reader announcement via `requestAnimationFrame`
- `setFocusTrap(container)` — Tab-key cycling within container
- `prefersReducedMotion()` / `prefersHighContrast()` — media query watchers (live-updating)
- `setAriaLabel(el, label)` / `setRole(el, role)` — convenience setters

## Module Context

Every module receives this context in its `startup()` function:

```js
{
  kernel,          // Kernel instance
  config,          // ConfigManager
  eventBus,        // EventBus
  errorHandler,    // ErrorHandler
  cache,           // CacheManager
  jobs,            // JobManager
  state,           // StateManager
  dialogs,         // DialogManager
  navigation,      // Navigation
  observability,   // Observability
  accessibility,   // Accessibility
  services: {},    // Acode services (commands, settings, editor, notifications)
  registries: {},  // Plugin registries (9 subsystem registries)
  baseUrl,         // Plugin install path
}
```

## Migration Guide (v0.4.0 → v0.5.0)

### Breaking Changes
- None. All existing APIs are fully backward compatible.

### New Module Context Fields
Modules now receive additional context fields: `kernel`, `cache`, `jobs`, `state`, `dialogs`, `navigation`, `observability`, `accessibility`. These are additive and do not affect existing code.

### Optional Improvements
- Replace `logger.setLevel()` with `logger.setMode('DEVELOPMENT')` for dev mode
- Use `Kernel` for new subsystems instead of direct Acode API calls
- Use `ServiceContainer` with `LIFETIME.TRANSIENT` for stateless helpers
- Use `CacheManager` for expensive computed results
- Use `JobManager` for long-running operations
- Use `StateManager.createStore()` for module state instead of local variables

## Performance Considerations

- **EventBus wildcard**: Wildcard handlers run on every event. Use sparingly (e.g., only in dev mode).
- **CacheManager TTL**: Each `set()` with TTL creates a `setTimeout`. Use TTL judiciously — prefer `set()` without TTL and explicit `clearByPrefix()` for batch invalidation.
- **Observability marks**: `performance.mark()` has overhead. Don't mark in hot loops.
- **Accessibility announcements**: Rate-limited by `requestAnimationFrame`. Safe for frequent updates.
- **JobManager**: Each job creates an async function. Cancel stale jobs in module `shutdown()`.

## Security Considerations

- All user input rendered to DOM must use `textContent` (not `innerHTML`). The `safeHtml()` function in `src/utils/dom.js` is available for cases where HTML strings must be used.
- Permissions are tracked by `PermissionRegistry`. Modules should declare required permissions in their descriptors.
- Error information is never exposed to users directly — error details go to the console/log system only.
