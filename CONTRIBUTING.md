# Contributing

## Quick Start

```bash
git clone https://github.com/Rishav7324/acode-devtoolkit.git
cd acode-devtoolkit
npm install
npm run dev
```

## How to Add a New Tool

1. Create `src/modules/<tool-name>/module.js`
2. Create `src/tools/<tool-name>/ui.js` (following JSON Formatter patterns)
3. Add the tool definition to `src/data/tools.js`
4. Register the module in `src/modules/index.js`
5. Write tests in `tests/`
6. Run `npm test && npm run build`

See `src/tools/json-formatter/ui.js` for the reference pattern.

## Coding Standards

- Single quotes, semicolons, trailing commas
- No `var`, no `eval`, no `debugger`
- All tool UI must be accessible (ARIA labels, focus management)
- All public APIs must have JSDoc-style comments
- Every tool module must implement `startup`, `shutdown`, and `cleanup`

## Pull Request Process

1. One feature per PR
2. Include tests
3. Update CHANGELOG.md
4. Verify with: `npm run verify`
5. Request review from maintainer

## Branch Naming

- `feat/<tool-name>` — new tool
- `fix/<short-description>` — bug fix
- `docs/<short-description>` — documentation
- `chore/<short-description>` — maintenance

## Community

- Feature requests: open an issue with the feature request template
- Bug reports: open an issue with the bug report template
- Questions: start a GitHub Discussion
- Security issues: email maintainer directly (do not open a public issue)
