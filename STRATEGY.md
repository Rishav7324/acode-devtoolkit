# Product Strategy

## Executive Summary

Acode DevToolkit is a plugin for the Acode Android code editor. It provides developer utility tools (formatters, encoders, converters) directly within the editing experience. The project has completed its foundational architecture (v0.1–v0.10) and now enters the growth phase where we expand the tool library while deepening editor integration.

**Current state:** v0.10.0 — 2 tools, 58 tests, 99.7KB bundle, 9.8/10 quality score.

**Strategic direction:** Become the essential developer toolbox for Acode — the first plugin mobile developers install — by providing tools that solve real problems faster than switching to a desktop or web tool.

---

## Research Findings

### Acode Ecosystem (July 2026)

- **383 community plugins** in the marketplace (250+ compatible with CodeMirror 6)
- **Acode v1.12.6+** with full CodeMirror 6 migration, LSP support, terminal, Git
- **Key APIs exposed:** `acode.require("codemirror")` gives plugins access to all CM6 packages: autocomplete, commands, language, lint, search, state, view, lezer
- **Plugin API maturity:** `editorThemes`, `editorManager`, `formatters`, `commands`, `sidebarApps`, `terminal`, `selectionMenu`, `secrets`
- **CodeMirror filtering:** Plugin API now filters by `supported_editor=cm` — only CM-compatible plugins shown

### Community Pain Points (from GitHub Issues & Reddit)

| Pain Point | Frequency | Evidence |
|------------|-----------|----------|
| No regex tester on mobile | High | Reddit threads, GitHub discussions |
| No quick color converter | Medium | Dev workflow gaps |
| No diff viewer | Medium | Feature requests |
| File creation UX (extension dropdown) | Medium | Issue #1089 |
| Cloud backup/sync | High | Issue #1961 — most-voted feature |
| Tab history navigation | Medium | Issue #1819 |
| Bookmark sync (context-aware) | Medium | Issue #1842 |
| AI/agent integration | High | Broader mobile dev trend |
| Search dialog keyboard UX | Low | Issue #1427 (contentious) |
| UI scaling | Low | Issue #1827 |

### What Competitor Plugins Do

| Plugin | Function | Strength | Weakness |
|--------|----------|----------|----------|
| Prettier | Code formatter | 47 stars, mature | Language-specific |
| Bookmark plugins | Line bookmarking | Works | No context awareness |
| Theme plugins | CM6 themes | Many options | One-trick |
| LSP servers | Language intelligence | Deep integration | Heavy install |

### Gap Analysis

Acode DevToolkit occupies a unique niche: **cross-cutting developer utilities** that aren't language-specific and don't duplicate built-in functionality. No other plugin provides a unified toolbox of lightweight developer tools.

---

## Feature Decision Matrix

| Feature | Who needs it | Why | Usage frequency | Existing alternative | Maintenance cost | Priority |
|---------|-------------|-----|-----------------|---------------------|-----------------|----------|
| Regex Tester | All devs | Test patterns on-device without switching to web | High (daily) | None on Acode | Low | **Critical** |
| Editor selection → tool | All devs | Send selected code to any tool | High (daily) | None | Medium | **Critical** |
| JSON → TS Interface | Web devs | API response → TypeScript types instantly | Medium (weekly) | None | Low | **High** |
| UUID Generator | All devs | Generate UUIDs without terminal | Medium (weekly) | Seed data exists | Low | **High** |
| Hash Generator | Security devs | MD5/SHA on-device | Low (monthly) | Seed data exists | Low | **High** |
| Case Converter | All devs | camelCase/snake_case/kebab instantly | Medium (weekly) | None | Low | **High** |
| Timestamp Converter | All devs | Unix ↔ human date | High (weekly) | None | Low | **High** |
| Code Statistics | All devs | LOC, function count, comment ratio | Low (monthly) | None | Medium | **High** |
| Tool Plugin API | Plugin devs | Extend DevToolkit with custom tools | Low (quarterly) | None | High | **Medium** |
| HTML Preview | Web devs | Live HTML render from editor | Medium (weekly) | Acode has built-in preview | Medium | **Medium** |
| HTML/CSS Minifier | Web devs | Quick minification | Low (monthly) | None | Low | **Medium** |
| Color Converter | UI devs | Hex ↔ RGB ↔ HSL | Low (monthly) | Theme plugins | Low | **Low** |
| AI Integration | All devs | Format/transform with AI | Emerging | Multiple AI plugins | High | **Future** |
| Cloud Sync | All devs | Back up tool config | Low (quarterly) | Manual export | High | **Future** |
| Snippet Manager | All devs | Code templates | Medium (weekly) | Existing snippet plugins | High | **Future** |

---

## Priority Table

```
Critical    │ Editor Selection → Tool, Regex Tester
High        │ JSON→TS, UUID, Hash, Case, Timestamp, Code Stats
Medium      │ Tool Plugin API, HTML Preview, HTML/CSS Minifier
Low         │ Color Converter, Multi-cursor Helpers
Future      │ AI Integration, Cloud Sync, Snippet Manager
Rejected    │ LSP server, FTP client, Terminal, Formatter (Prettier competition)
```

---

## Architecture Decisions

### Tool Pattern (Stable — do not change)

Every tool follows the pattern established by `src/tools/json-formatter/ui.js`:
1. Function that receives `{ editor, settings }`
2. Creates DOM via `html-tag-js`
3. Renders in a `Modal`
4. Provides Copy/Insert/Editor-load actions
5. Self-contained — no external state

### Module Pattern (Stable — do not change)

Every module follows `src/modules/json-formatter/module.js`:
1. Default export with `id`, `version`, `name`, `description`, `icon`, `commands`
2. `async startup(context)` registers launch handler and commands
3. `shutdown()` removes commands
4. `cleanup()` nulls references

### Dependency Policy

- **Allowed:** `html-tag-js` (Acode standard), browser APIs (`navigator.clipboard`, `atob`/`btoa`)
- **Avoid:** Additional npm dependencies — every dependency increases bundle and quarantine risk
- **Exception:** If a tool genuinely requires a library (e.g., CodeMirror for preview), use `acode.require("codemirror")` rather than bundling

### Plugin Quarantine

Acode imposes:
- **15 seconds** for plugin initialization
- **60 seconds** for background processing
- Broken plugins are auto-disabled after 2 consecutive failures

DevToolkit must init in <300ms (currently <100ms). This is a hard constraint — no synchronous I/O, no heavy parsing, no network calls during init.

---

## Community Strategy

### Goals

- **5 contributors** by v1.0
- **3 community-submitted tools** by v1.0
- **100 GitHub stars** by v1.0

### Tactics

1. **Issue templates** (added in this milestone) — structured feature requests reduce ambiguity
2. **CONTRIBUTING.md** (updated in this milestone) — clear entry path
3. **Tool Plugin API** (v0.14) — allow third-party tool registration without forking
4. **Good First Issue labels** — curated beginner tasks
5. **Monthly releases** — predictable cadence
6. **Changelog-driven development** — every PR must update CHANGELOG.md

### Recognition

- Contributors listed in `CONTRIBUTORS.md`
- Community-submitted tools get author credit in tool UI
- Top contributors offered maintainer access

---

## Files Updated

| File | Change |
|------|--------|
| `ROADMAP.md` | Created — full roadmap through v1.0 |
| `STRATEGY.md` | Created — this document |
| `CONTRIBUTING.md` | Rewritten — tool creation guide, PR process |
| `.github/ISSUE_TEMPLATE/feature_request.md` | Created |
| `.github/ISSUE_TEMPLATE/bug_report.md` | Created |

---

## Next Milestone

### v0.11.0 — Developer Productivity Tools

**Target:** Expand tool palette with 4 new tools.

**Tools (in order):**

1. **Regex Tester** — Input pattern + test string, show matches in real-time. Use `RegExp.prototype.test()` and `String.prototype.match()`. No external deps. Modal with input, pattern, flags, match list, error display.

2. **Case Converter** — Dropdown (camelCase, snake_case, kebab-case, PascalCase, UPPER, lower). Textarea input, instant preview. Copy result.

3. **HTML/CSS Minifier** — Simple string minification (strip comments, whitespace). Follow JSON Formatter pattern exactly with Format/Minify/Copy.

4. **Editor Selection → Tool** — SelectionService listens for editor selection, context menu "Send to DevToolkit" opens tool picker, forwards selected text.

**Non-functional:**

- Tool launch timing instrumentation
- Keyboard shortcut registry (`devtoolkit.addShortcut`)
- `npm run build` produces <100KB bundle

**Quality gate:** 58 existing tests + 16 new tool tests = 74 total, all passing.
