import plugin from '../plugin.json';
import { Plugin } from './core/Plugin.js';
import { PluginError, ErrorSeverity } from './core/ErrorHandler.js';
import styles from './styles/index.css';

function injectStyles() {
  const styleId = `${plugin.id}-styles`;
  if (document.getElementById(styleId)) return;

  const style = document.createElement('style');
  style.id = styleId;
  style.textContent = styles;
  document.head.appendChild(style);
}

function detectTheme() {
  const isDark = !document.querySelector('.app-drawer') ||
    getComputedStyle(document.documentElement).getPropertyValue('--primary-color')?.includes('255,255,255');
  document.documentElement.setAttribute('data-theme', isDark ? 'dark' : 'light');
}

let instance = null;

if (window.acode) {
  instance = new Plugin();

  acode.setPluginInit(plugin.id, async (baseUrl, $page, { cacheFileUrl, cacheFile }) => {
    try {
      if (!baseUrl.endsWith('/')) {
        baseUrl += '/';
      }
      injectStyles();
      detectTheme();
      await instance.init(baseUrl, $page);
    } catch (error) {
      const wrapped = error instanceof PluginError
        ? error
        : new PluginError('INIT_FAILED', 'Plugin initialization failed', {
            cause: error,
            severity: ErrorSeverity.PANIC,
          });
      instance.errorHandler.handle(wrapped.code, wrapped.message, {
        cause: wrapped.cause,
        severity: wrapped.severity,
      });
    }
  });

  acode.setPluginUnmount(plugin.id, () => {
    if (instance) {
      instance.destroy();
      instance = null;
    }
  });
}
