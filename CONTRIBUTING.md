# Contributing to Acode DevToolkit

Thank you for your interest in contributing! This document outlines the process for contributing to the project.

## Code of Conduct

Be respectful, constructive, and inclusive. Harassment and toxic behavior will not be tolerated.

## Getting Started

1. Fork the repository
2. Clone your fork: `git clone https://github.com/YOUR_USERNAME/acode-devtoolkit.git`
3. Install dependencies: `npm install`
4. Create a feature branch: `git checkout -b feat/your-feature`

## Development Workflow

1. Make your changes
2. Run lint: `npm run lint`
3. Run typecheck: `npm run typecheck`
4. Build locally: `npm run build`
5. Test in Acode by installing the generated `plugin.zip`

## Coding Standards

### JavaScript

- Use ES modules (`import`/`export`) throughout
- Use `async/await` over raw promises
- Prefer `const` over `let`; never use `var`
- Use descriptive variable names; avoid abbreviations
- JSDoc comments for all exported functions and classes
- Use single-line comments sparingly and only for non-obvious logic

### Architecture

- **Modules** go in `src/modules/<name>/module.js` using the descriptor format
- **UI components** go in `src/ui/` — each component is a function that returns a DOM element
- **Services** wrap Acode APIs and go in `src/services/`
- **Registries** manage module assets and go in `src/registries/`
- **Utilities** are pure functions in `src/utils/`
- **Styles** go in `src/styles/index.css` using `--dtk-*` custom properties

### Error Handling

- Use `PluginError` (from `src/core/ErrorHandler.js`) for all plugin errors
- Use `ErrorHandler.handle()` for recoverable errors
- Use `ErrorSeverity.RECOVERABLE` for module execution errors
- Use `ErrorSeverity.FATAL` for component initialization failures
- Use `ErrorSeverity.PANIC` for unrecoverable plugin failures
- Never `throw` raw strings or `Error` objects — always use `PluginError`

### Security

- Never use `innerHTML` — always use `textContent` or `safeHtml()` (from `src/utils/dom.js`)
- Validate all user input before processing
- Sanitize any string rendered to the DOM

### Commit Messages

Use conventional commits:

- `feat:` — New feature
- `fix:` — Bug fix
- `refactor:` — Code restructuring
- `perf:` — Performance improvement
- `docs:` — Documentation changes
- `style:` — Code style (formatting, naming)
- `chore:` — Build/config changes
- `security:` — Security fix

## Pull Request Process

1. Update `CHANGELOG.md` with your changes
2. Update `README.md` if needed
3. Ensure the build passes: `npm run build`
4. Open a PR against the `main` branch
5. Reference any related issues

## Questions?

Open an issue on GitHub or reach out to the maintainers.
