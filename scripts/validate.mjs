import { readFileSync, existsSync, statSync } from 'fs';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const ROOT = join(__dirname, '..');

let errors = [];
let warnings = [];

function error(msg) { errors.push(msg); }
function warn(msg) { warnings.push(msg); }
function ok(msg) { process.stdout.write(`  \u2713 ${msg}\n`); }

function checkFile(path, label) {
  const full = join(ROOT, path);
  if (!existsSync(full)) {
    error(`Missing ${label}: ${path}`);
    return null;
  }
  const stat = statSync(full);
  if (!stat.isFile()) {
    error(`${label} is not a file: ${path}`);
    return null;
  }
  ok(`${label}: ${path}`);
  return full;
}

function checkDir(path, label) {
  const full = join(ROOT, path);
  if (!existsSync(full)) {
    error(`Missing ${label}: ${path}`);
    return false;
  }
  const stat = statSync(full);
  if (!stat.isDirectory()) {
    error(`${label} is not a directory: ${path}`);
    return false;
  }
  ok(`${label}: ${path}`);
  return true;
}

function readJSON(path) {
  try {
    return JSON.parse(readFileSync(join(ROOT, path), 'utf8'));
  } catch (e) {
    error(`Invalid JSON in ${path}: ${e.message}`);
    return null;
  }
}

function exitWithReport() {
  process.stdout.write('\n');

  if (warnings.length > 0) {
    process.stdout.write(`Warnings (${warnings.length}):\n`);
    for (const w of warnings) process.stdout.write(`  ! ${w}\n`);
    process.stdout.write('\n');
  }

  if (errors.length > 0) {
    process.stdout.write(`Errors (${errors.length}):\n`);
    for (const e of errors) process.stdout.write(`  \u2716 ${e}\n`);
    process.stdout.write('\n');
    process.stdout.write('VALIDATION FAILED\n');
    process.exit(1);
  }

  process.stdout.write('VALIDATION PASSED\n');
  process.exit(0);
}

process.stdout.write('Validating Acode DevToolkit...\n\n');

/* ── Plugin Manifest ─────────────────────────────────── */

const manifest = readJSON('plugin.json');
if (manifest) {
  const required = ['id', 'name', 'main', 'version', 'minVersionCode'];
  for (const field of required) {
    if (!manifest[field]) error(`plugin.json missing required field: "${field}"`);
    else ok(`plugin.json has "${field}"`);
  }

  if (manifest.version && !/^\d+\.\d+\.\d+$/.test(manifest.version)) {
    warn(`plugin.json version "${manifest.version}" is not semver`);
  }

  if (manifest.minVersionCode && (manifest.minVersionCode < 970 || !Number.isInteger(manifest.minVersionCode))) {
    warn(`plugin.json minVersionCode ${manifest.minVersionCode} may be too low; Acode v1.12.6+ uses 970`);
  }

  if (manifest.price === undefined || manifest.price < 0) {
    error('plugin.json must have a non-negative price');
  }

  if (manifest.license !== 'MIT') {
    warn('plugin.json license is not MIT');
  }

  if (existsSync(join(ROOT, 'icon.png'))) {
    const iconSize = statSync(join(ROOT, 'icon.png')).size;
    if (iconSize > 51200) warn(`icon.png is ${(iconSize / 1024).toFixed(1)}KB (max 50KB)`);
    else ok(`icon.png: ${(iconSize / 1024).toFixed(1)}KB`);
  }

  if (manifest.supported_editor) {
    const valid = ['ace', 'cm', 'all'];
    if (!valid.includes(manifest.supported_editor)) {
      warn(`plugin.json supported_editor "${manifest.supported_editor}" should be one of: ${valid.join(', ')}`);
    } else {
      ok(`plugin.json supported_editor: ${manifest.supported_editor}`);
    }
  }
}

/* ── Build Assets ────────────────────────────────────── */

checkDir('dist', 'Build output directory');
checkFile('dist/main.js', 'Bundled entry');
checkFile('icon.png', 'Plugin icon');
checkFile('plugin.zip', 'Plugin ZIP');

if (existsSync(join(ROOT, 'plugin.zip'))) {
  const zipSize = statSync(join(ROOT, 'plugin.zip')).size;
  ok(`plugin.zip: ${(zipSize / 1024).toFixed(1)}KB`);
}

/* ── Documentation ───────────────────────────────────── */

checkFile('README.md', 'README');
checkFile('CHANGELOG.md', 'CHANGELOG');
checkFile('LICENSE', 'License');

/* ── Source Structure ────────────────────────────────── */

checkDir('src', 'Source directory');
checkDir('src/core', 'Core modules');
checkDir('src/services', 'Services');
checkDir('src/registries', 'Registries');
checkDir('src/modules', 'Modules');
checkDir('src/ui', 'UI components');
checkDir('src/pages', 'Pages');
checkDir('src/data', 'Data');
checkDir('src/styles', 'Styles');
checkDir('src/utils', 'Utilities');
checkFile('src/main.js', 'Entry point');

/* ── Config Files ────────────────────────────────────── */

checkFile('package.json', 'Package manifest');
checkFile('tsconfig.json', 'TypeScript config');
checkFile('esbuild.config.mjs', 'Build config');

/* ── Version Consistency (plugin.json only) ──────────── */

if (manifest) {
  const changelogPath = join(ROOT, 'CHANGELOG.md');
  if (existsSync(changelogPath)) {
    const changelog = readFileSync(changelogPath, 'utf8');
    const header = new RegExp(`## \\[${manifest.version.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}\\]`);
    if (!header.test(changelog)) {
      warn(`CHANGELOG.md has no entry for version ${manifest.version}`);
    } else {
      ok(`CHANGELOG.md has entry for v${manifest.version}`);
    }
  }
}

/* ── Report ──────────────────────────────────────────── */

exitWithReport();
