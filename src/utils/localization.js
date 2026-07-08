let _locale = 'en';
const _translations = new Map();

export function setLocale(locale) {
  _locale = locale;
}

export function getLocale() {
  return _locale;
}

export function registerTranslations(moduleId, translations) {
  _translations.set(moduleId, translations);
}

export function t(moduleId, key, params = {}) {
  const table = _translations.get(moduleId);
  if (!table) return key;

  const localeTable = table[_locale] || table.en;
  if (!localeTable) return key;

  let text = localeTable[key] || key;
  for (const [k, v] of Object.entries(params)) {
    text = text.replace(`{${k}}`, String(v));
  }
  return text;
}

export function getAvailableLocales(moduleId) {
  const table = _translations.get(moduleId);
  if (!table) return [];
  return Object.keys(table);
}
