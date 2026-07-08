export const TOOL_CATEGORIES = [
  { id: 'developer', label: 'Developer Utilities' },
  { id: 'formatting', label: 'Formatting Tools' },
  { id: 'security', label: 'Security Tools' },
  { id: 'generators', label: 'Generators' },
  { id: 'converters', label: 'Converters' },
];

const TOOLS = [
  {
    id: 'json-formatter',
    icon: '\ue800',
    title: 'JSON Formatter',
    description: 'Format, validate, and beautify JSON data with syntax highlighting',
    category: 'formatting',
    favorite: false,
  },
  {
    id: 'base64',
    icon: '\ue801',
    title: 'Base64 Encoder',
    description: 'Encode and decode Base64 strings and files instantly',
    category: 'converters',
    favorite: false,
  },
  {
    id: 'hash-generator',
    icon: '\ue802',
    title: 'Hash Generator',
    description: 'Generate MD5, SHA-1, SHA-256, and SHA-512 hashes',
    category: 'security',
    favorite: false,
  },
  {
    id: 'uuid-generator',
    icon: '\ue803',
    title: 'UUID Generator',
    description: 'Generate v4 UUIDs and unique identifiers on demand',
    category: 'generators',
    favorite: false,
  },
  {
    id: 'html-entities',
    icon: '\ue804',
    title: 'HTML Entities',
    description: 'Encode and decode HTML entities and special characters',
    category: 'converters',
    favorite: false,
  },
  {
    id: 'lorem-ipsum',
    icon: '\ue805',
    title: 'Lorem Ipsum',
    description: 'Generate placeholder text in configurable lengths',
    category: 'generators',
    favorite: false,
  },
  {
    id: 'jwt-debugger',
    icon: '\ue806',
    title: 'JWT Debugger',
    description: 'Decode and inspect JSON Web Tokens without sending data',
    category: 'developer',
    favorite: false,
  },
  {
    id: 'regex-tester',
    icon: '\ue807',
    title: 'Regex Tester',
    description: 'Test regular expressions with real-time match highlighting',
    category: 'developer',
    favorite: false,
  },
  {
    id: 'minifier',
    icon: '\ue808',
    title: 'Code Minifier',
    description: 'Minify JavaScript, CSS, and HTML for production use',
    category: 'formatting',
    favorite: false,
  },
  {
    id: 'color-converter',
    icon: '\ue809',
    title: 'Color Converter',
    description: 'Convert between HEX, RGB, HSL, and named CSS colors',
    category: 'converters',
    favorite: false,
  },
  {
    id: 'password-gen',
    icon: '\ue80a',
    title: 'Password Generator',
    description: 'Generate strong random passwords with configurable rules',
    category: 'security',
    favorite: false,
  },
  {
    id: 'diff-checker',
    icon: '\ue80b',
    title: 'Diff Checker',
    description: 'Compare two text blocks and highlight differences',
    category: 'developer',
    favorite: false,
  },
  {
    id: 'sql-formatter',
    icon: '\ue80c',
    title: 'SQL Formatter',
    description: 'Format and beautify SQL queries for better readability',
    category: 'formatting',
    favorite: false,
  },
  {
    id: 'qr-generator',
    icon: '\ue80d',
    title: 'QR Generator',
    description: 'Generate QR codes from text, URLs, and contact data',
    category: 'generators',
    favorite: false,
  },
  {
    id: 'text-diff',
    icon: '\ue80e',
    title: 'Text Statistics',
    description: 'Analyze word count, character count, reading time and more',
    category: 'developer',
    favorite: false,
  },
  {
    id: 'url-parser',
    icon: '\ue80f',
    title: 'URL Parser',
    description: 'Parse, encode, and decode URL components and query strings',
    category: 'converters',
    favorite: false,
  },
];

let _groupedCache = null;

export function getTools() {
  return TOOLS;
}

export function getToolsByCategory() {
  if (_groupedCache) return _groupedCache;

  const grouped = {};
  for (const cat of TOOL_CATEGORIES) {
    grouped[cat.id] = {
      label: cat.label,
      tools: TOOLS.filter((t) => t.category === cat.id),
    };
  }
  _groupedCache = grouped;
  return grouped;
}

export function invalidateCache() {
  _groupedCache = null;
}

export function getFavoriteTools() {
  return TOOLS.filter((t) => t.favorite);
}

export function searchTools(query) {
  const q = query.toLowerCase().trim();
  if (!q) return [];
  return TOOLS.filter(
    (t) =>
      t.title.toLowerCase().includes(q) ||
      t.description.toLowerCase().includes(q) ||
      t.category.toLowerCase().includes(q)
  );
}

export function getRecentlyUsed() {
  return TOOLS.slice(0, 4);
}
