import { LOG_PREFIX } from './constants.js';

const LOG_LEVELS = {
  error: 0,
  warn: 1,
  info: 2,
  debug: 3,
};

const MODE = {
  PRODUCTION: 'production',
  DEVELOPMENT: 'development',
  SILENT: 'silent',
};

let currentLevel = LOG_LEVELS.info;
let currentMode = MODE.PRODUCTION;

function shouldLog(level) {
  if (currentMode === MODE.SILENT) return false;
  return currentLevel >= LOG_LEVELS[level];
}

function formatMessage(level, message, ...args) {
  const prefix = `${LOG_PREFIX} [${level.toUpperCase()}]`;
  const ts = currentMode === MODE.DEVELOPMENT
    ? `[${new Date().toISOString().slice(11, 23)}]`
    : '';
  const formatted = ts ? `${ts} ${prefix} ${message}` : `${prefix} ${message}`;
  if (args.length > 0) {
    return [formatted, ...args];
  }
  return [formatted];
}

export const logger = {
  setLevel(level) {
    if (level in LOG_LEVELS) {
      currentLevel = LOG_LEVELS[level];
    }
  },

  setMode(mode) {
    if (mode in MODE) {
      currentMode = MODE[mode];
      if (currentMode === MODE.DEVELOPMENT) {
        currentLevel = LOG_LEVELS.debug;
      }
    }
  },

  getMode() {
    const entries = Object.entries(MODE);
    for (const [key, val] of entries) {
      if (val === currentMode) return key;
    }
    return 'PRODUCTION';
  },

  isDev() {
    return currentMode === MODE.DEVELOPMENT;
  },

  error(message, ...args) {
    if (shouldLog('error')) {
      console.error(...formatMessage('error', message, ...args));
    }
  },

  warn(message, ...args) {
    if (shouldLog('warn')) {
      console.warn(...formatMessage('warn', message, ...args));
    }
  },

  info(message, ...args) {
    if (shouldLog('info')) {
      console.info(...formatMessage('info', message, ...args));
    }
  },

  debug(message, ...args) {
    if (shouldLog('debug')) {
      console.log(...formatMessage('debug', message, ...args));
    }
  },

  group(label) {
    if (currentMode !== MODE.SILENT) {
      console.group(label);
    }
  },

  groupEnd() {
    if (currentMode !== MODE.SILENT) {
      console.groupEnd();
    }
  },
};
