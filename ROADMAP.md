# Roadmap

## Current Status: v0.13.0 — Native Editor Tab (Critical)

- DevToolkit opens as a native editor tab via `acode.require('editorFile')` API
- Tab type: `custom` with shadow DOM isolation, same UX as Terminal/Welcome tabs
- `TabManager` service: open, close, toggle, restore lifecycle
- `DevToolkitTab` UI: home page with tool search + inline tool rendering (no modals)
- All 5 tools support dual mode: inline (in tab) and Modal (fallback)
- `ToolRegistry.launch(id, args)` now forwards arguments to launch handler
- `ToolRegistry.registerLaunchHandler(id, fn)` added for late-bound launch handlers
- Removed `SidebarApp` dependency — editor tab is the primary UI
- 134 unit tests (4 new: registerLaunchHandler, args passthrough, null return, TabManager basics)
- Bundle: 117KB, quality gate 9.8/10

---

## Milestone v0.11.0 — Developer Productivity Tools (Medium) ✅

**Theme:** Expand the tool palette with the most-requested mobile dev utilities.

### Tools

| Tool | Priority | Rationale |
|------|----------|-----------|
| Regex Tester | High | Every mobile dev testing patterns on-device — no regex tester exists for Acode |
| Case Converter | High | camelCase/snake_case/kebab-case — instant, zero-config |
| HTML/CSS Minifier | Medium | Complements JSON Formatter; mobile devs optimize bundle size |
| Color Converter | Low | Niche use; many theme plugins already handle colors |

### Non-functional

- Tool launch timing instrumentation
- Keyboard shortcut registry (devtoolkit.addShortcut)
- Tool search in palette includes categories

---

## Milestone v0.12.0 — Editor Integration (Critical) ✅

**Theme:** Deepen editor integration — the tools become part of the editing experience.

### Features

| Feature | Priority | Rationale |
|---------|----------|-----------|
| Editor Selection to Tool | Critical | Select text in editor → send to any tool (format/minify/encode). Highest-requested workflow |
| Tool Output Insert at Cursor | High | Already implemented per-tool, unify into ToolRegistry |
| Selection-aware Format | High | Format selection instead of whole doc (JSON Formatter already supports) |
| Inline Preview | Medium | Show formatted/encoded result as editor overlay |

### Files

- `src/services/EditorBridge.js` — Unified editor read/write abstraction (8 methods)
- `src/ui/ToolPicker.js` — Search-filtered tool list with selection-aware launch
- `src/services/SelectionService.js` — Refactored to use EditorBridge

---

## Milestone v0.13.0 — Advanced Developer Tools (High)

**Theme:** Power tools for serious mobile development.

### Tools

| Tool | Priority | Rationale |
|------|----------|-----------|
| JSON to TypeScript Interface | High | "copy JSON as TS types" is #2 most-requested mobile dev workflow |
| Timestamp Converter | High | Unix ↔ human — every dev uses this constantly |
| UUID Generator | Medium | Already in seed data; implement as real tool |
| Hash Generator | Medium | MD5/SHA — seed data exists; implement UI |
| HTML Preview | Medium | Live HTML render from editor content |

### Non-functional

- Tool plugin API — allow third-party tools to register
- Usage analytics (opt-in) — identify most-used tools

---

## Milestone v0.14.0 — Code Intelligence (Medium)

**Theme:** Make the editor smarter, not just more capable.

### Features

| Feature | Priority | Rationale |
|---------|----------|-----------|
| Code Snippet Manager | Medium | Existing snippets plugins are heavy; lightweight alternative |
| Multi-cursor Helpers | Low | Acode supports multi-cursor natively; no plugin needed |
| Code Statistics | High | Line count, function count, comment ratio — mobile "git stats" |
| JSDoc Generator | Low | Niche; LSP handles most doc needs |

---

## Milestone v0.15.0 — Plugin Ecosystem (Medium)

**Theme:** Transform DevToolkit from a plugin into a platform.

### Features

| Feature | Priority | Rationale |
|---------|----------|-----------|
| Tool Plugin API | High | Other developers can register tools in DevToolkit |
| Tool Marketplace | Medium | Browse/install community tools from within DevToolkit |
| DevToolkit SDK | High | `npm install @devtoolkit/sdk` — build tools with one import |
| Migration Guide | Medium | Document migration from v0.x to v1.0 |

---

## Milestone v0.16.0 — Polish & Performance (High)

**Theme:** Ship a v1.0 that is production-ready for 10k+ users.

### Features

| Feature | Priority | Rationale |
|---------|----------|-----------|
| Accessibility audit | High | WCAG 2.1 AA minimum |
| Bundle optimization | High | Target <80KB |
| Memory leak audit | High | 30min idle test |
| All tool UIs responsive | High | Test on 480px-1440px |
| Error boundary per tool | Medium | One tool crash never takes down others |
| Performance budget | Medium | All tools open in <100ms |

---

## Future (Post v1.0)

| Feature | Priority | Rationale |
|---------|----------|-----------|
| AI Integration (Gemini/Claude) | Low | Acode has AI plugins; avoid overlap |
| Git-integrated tools | Low | Acode has built-in Git |
| Cloud sync of tool config | Low | Separate product concern |
| Theme builder | Low | Acode has theme API already |

---

## Rejected Features

| Feature | Reason |
|---------|--------|
| Custom language server | Acode LSP API already exists; would compete with ecosystem |
| FTP/SFTP client | Acode has built-in FTP/SFTP |
| Terminal emulator | Acode has built-in terminal |
| Code formatter (Prettier) | Acode-plugin-prettier exists and is mature |
| AI code completion | Multiple AI plugins exist in marketplace |

---

## Key Principles

1. **Never duplicate Acode built-in functionality.**
2. **Prefer 80/20 solutions** — a simple tool today beats a perfect tool next month.
3. **Every tool must be usable in <3 taps.**
4. **Editor integration is not optional** — all tools should accept editor selection.
5. **Test before building** — unit tests precede tool implementation.
6. **One tool per PR** — keeps review focused, rollback safe.
