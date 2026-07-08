import { readFileSync, existsSync, readdirSync, statSync, createWriteStream } from 'fs';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';
import JSZip from 'jszip';

const __dirname = dirname(fileURLToPath(import.meta.url));

const iconFile = join(__dirname, 'icon.png');
const pluginJSON = join(__dirname, 'plugin.json');
const distFolder = join(__dirname, 'dist');
const json = JSON.parse(readFileSync(pluginJSON, 'utf8'));

function resolveFile(candidates) {
  for (const file of candidates) {
    if (existsSync(file)) return file;
  }
  return null;
}

const readme = resolveFile([
  json.readme ? join(__dirname, json.readme) : null,
  join(__dirname, 'readme.md'),
  join(__dirname, 'README.md'),
].filter(Boolean));

const changelogs = resolveFile([
  json.changelogs ? join(__dirname, json.changelogs) : null,
  join(__dirname, 'CHANGELOG.md'),
  join(__dirname, 'changelog.md'),
].filter(Boolean));

const zip = new JSZip();

if (existsSync(iconFile)) {
  zip.file('icon.png', readFileSync(iconFile));
}
zip.file('plugin.json', readFileSync(pluginJSON));

if (readme) {
  zip.file('readme.md', readFileSync(readme));
}

if (changelogs) {
  zip.file('changelog.md', readFileSync(changelogs));
}

function addDirectory(zipFolder, directory) {
  if (!existsSync(directory)) return;

  const items = readdirSync(directory);
  for (const item of items) {
    const itemPath = join(directory, item);
    const stat = statSync(itemPath);

    if (stat.isDirectory()) {
      const childFolder = zipFolder.folder(item);
      addDirectory(childFolder, itemPath);
    } else if (!/LICENSE\.txt/i.test(item)) {
      zipFolder.file(item, readFileSync(itemPath));
    }
  }
}

addDirectory(zip, distFolder);

zip
  .generateNodeStream({ type: 'nodebuffer', streamFiles: true })
  .pipe(createWriteStream(join(__dirname, 'plugin.zip')))
  .on('finish', () => {
    console.log('Plugin plugin.zip written.');
  });
