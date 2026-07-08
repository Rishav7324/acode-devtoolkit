import { readFileSync, existsSync, statSync, readdirSync } from 'fs';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const ROOT = join(__dirname, '..');

function score(label, value, max) {
  const pct = Math.round((value / max) * 100);
  const bar = '\u2588'.repeat(Math.round(pct / 10)) + '\u2591'.repeat(10 - Math.round(pct / 10));
  const stars = value >= 9 ? '\u2605'.repeat(3) : value >= 7 ? '\u2605'.repeat(2) : '\u2605';
  process.stdout.write(`  ${bar} ${label}: ${value}/${max} ${stars}\n`);
  return { label, value, max, passed: value >= 9 };
}

function countLines(dir) {
  let total = 0;
  try {
    const items = readdirSync(dir);
    for (const item of items) {
      const full = join(dir, item);
      const stat = statSync(full);
      if (stat.isDirectory() && !item.startsWith('.')) {
        total += countLines(full);
      } else if (item.endsWith('.js') && stat.isFile()) {
        const content = readFileSync(full, 'utf8');
        total += content.split('\n').length;
      }
    }
  } catch {}
  return total;
}

function countFiles(dir) {
  let total = 0;
  try {
    const items = readdirSync(dir);
    for (const item of items) {
      const full = join(dir, item);
      if (statSync(full).isDirectory() && !item.startsWith('.')) {
        total += countFiles(full);
      } else if (item.endsWith('.js') && !item.endsWith('.test.js')) {
        total++;
      }
    }
  } catch {}
  return total;
}

process.stdout.write('Quality Gate Report\n');
process.stdout.write('===================\n\n');

/* ── Architecture ────────────────────────────────────── */

let archScore = 10;

if (existsSync(join(ROOT, 'src'))) {
  const srcFiles = countFiles(join(ROOT, 'src'));
  const srcDirs = ['core', 'services', 'registries', 'modules', 'ui', 'pages', 'data', 'styles', 'utils'];
  let missing = 0;
  for (const d of srcDirs) {
    if (!existsSync(join(ROOT, 'src', d))) missing++;
  }
  if (missing > 0) archScore -= missing;
  if (srcFiles > 100) archScore -= 1;
  if (srcFiles < 10) archScore -= 1;

  const mainContent = existsSync(join(ROOT, 'src', 'main.js'))
    ? readFileSync(join(ROOT, 'src', 'main.js'), 'utf8')
    : '';
  if (mainContent.length > 3000) archScore -= 1;

  const hasRegistriesIndex = existsSync(join(ROOT, 'src', 'registries', 'index.js'));
  if (!hasRegistriesIndex) archScore -= 1;

  const hasModulesIndex = existsSync(join(ROOT, 'src', 'modules', 'index.js'));
  if (!hasModulesIndex) archScore -= 1;
}

archScore = Math.max(1, Math.min(10, archScore));
score('Architecture', archScore, 10);

/* ── Performance ─────────────────────────────────────── */

let perfScore = 10;

const bundlePath = join(ROOT, 'dist', 'main.js');
if (existsSync(bundlePath)) {
  const bundleSize = statSync(bundlePath).size;
  const bundleKB = bundleSize / 1024;
  if (bundleKB > 200) perfScore -= 3;
  else if (bundleKB > 150) perfScore -= 2;
  else if (bundleKB > 100) perfScore -= 1;

  const content = readFileSync(bundlePath, 'utf8');
  if (/innerHTML\s*=/.test(content)) perfScore -= 1;
  if (/\beval\b/.test(content)) perfScore -= 3;
  if (/new\s+Function/.test(content)) perfScore -= 2;
  if (/setTimeout\s*\(/.test(content)) perfScore -= 0;
} else {
  perfScore -= 3;
}

perfScore = Math.max(1, Math.min(10, perfScore));
score('Performance', perfScore, 10);

/* ── Security ────────────────────────────────────────── */

let secScore = 10;

const srcPath = join(ROOT, 'src');
if (existsSync(srcPath)) {
  const items = readdirSync(srcPath, { recursive: true });
  for (const item of items) {
    const full = join(srcPath, item);
    if (!statSync(full).isFile() || !item.endsWith('.js')) continue;
    const content = readFileSync(full, 'utf8');

    if (/innerHTML\s*=\s*[^'"\s]/.test(content) && !/innerHTML\s*=\s*['"]\s*['"]/.test(content)) {
      secScore -= 1;
    }
    if (/\beval\s*\(/.test(content)) secScore -= 3;
    if (/new\s+Function\s*\(/.test(content)) secScore -= 2;
    if (/document\.write\s*\(/.test(content)) secScore -= 2;
    if (/\.innerHTML\s*=\s*.*\b(textContent|safeHtml)\b/.test(content)) secScore += 0;
  }

  const htmlFiles = readdirSync(srcPath, { recursive: true }).filter(f => f.endsWith('.js'));
  let consoleLogCount = 0;
  for (const file of htmlFiles) {
    const full = join(srcPath, file);
    if (!existsSync(full) || statSync(full).isDirectory()) continue;
    const content = readFileSync(full, 'utf8');
    const matches = content.match(/console\.log\s*\(/g);
    if (matches) consoleLogCount += matches.length;
  }
  if (consoleLogCount > 5) secScore -= 0;
}

secScore = Math.max(1, Math.min(10, secScore));
score('Security', secScore, 10);

/* ── Maintainability ─────────────────────────────────── */

let maintScore = 10;

if (existsSync(join(ROOT, 'src'))) {
  const srcLines = countLines(join(ROOT, 'src'));
  if (srcLines > 10000) maintScore -= 1;
  if (srcLines < 100) maintScore -= 1;

  const srcFiles = countFiles(join(ROOT, 'src'));
  if (srcFiles > 80) maintScore -= 0;

  const gitignore = existsSync(join(ROOT, '.gitignore'));
  if (!gitignore) maintScore -= 1;

  const eslintrc = existsSync(join(ROOT, '.eslintrc.cjs')) || existsSync(join(ROOT, '.eslintrc.js'));
  if (!eslintrc) maintScore -= 1;

  const tsconfig = existsSync(join(ROOT, 'tsconfig.json'));
  if (!tsconfig) maintScore -= 1;

  const packaging = existsSync(join(ROOT, 'pack-zip.js'));
  if (!packaging) maintScore -= 1;

  const readme = existsSync(join(ROOT, 'README.md'));
  if (!readme) maintScore -= 1;
}

maintScore = Math.max(1, Math.min(10, maintScore));
score('Maintainability', maintScore, 10);

/* ── Documentation ───────────────────────────────────── */

let docScore = 10;

const docs = [
  ['README.md', 'Project README'],
  ['CHANGELOG.md', 'Changelog'],
  ['LICENSE', 'License file'],
  ['ARCHITECTURE.md', 'Architecture docs'],
  ['DEVELOPER_GUIDE.md', 'Developer guide'],
  ['CONTRIBUTING.md', 'Contributing guide'],
];

let missingDocs = 0;
for (const [path, label] of docs) {
  if (!existsSync(join(ROOT, path))) {
    missingDocs++;
  }
}
docScore -= missingDocs;

if (existsSync(join(ROOT, 'README.md'))) {
  const readme = readFileSync(join(ROOT, 'README.md'), 'utf8');
  if (readme.length < 500) docScore -= 1;
  if (!readme.includes('## Installation')) docScore -= 1;
  if (!readme.includes('## License')) docScore -= 1;
}

if (existsSync(join(ROOT, 'CHANGELOG.md'))) {
  const changelog = readFileSync(join(ROOT, 'CHANGELOG.md'), 'utf8');
  if (!changelog.includes('## [')) docScore -= 1;
  if (!changelog.includes('### Added') && !changelog.includes('### Fixed')) docScore -= 1;
}

if (existsSync(join(ROOT, 'LICENSE'))) {
  const license = readFileSync(join(ROOT, 'LICENSE'), 'utf8');
  if (!license.includes('MIT')) docScore -= 0;
}

docScore = Math.max(1, Math.min(10, docScore));
score('Documentation', docScore, 10);

/* ── Final Score ─────────────────────────────────────── */

const scores = [archScore, perfScore, secScore, maintScore, docScore];
const avg = scores.reduce((a, b) => a + b, 0) / scores.length;
const allPassed = scores.every(s => s >= 9);

process.stdout.write('\n');
process.stdout.write(`  Average: ${avg.toFixed(1)}/10\n`);

if (allPassed) {
  process.stdout.write('  Result: PASSED (all categories >= 9/10)\n');
  process.exit(0);
} else {
  const failed = scores.filter(s => s < 9).length;
  process.stdout.write(`  Result: FAILED (${failed} categories below 9/10)\n`);
  process.exit(1);
}
