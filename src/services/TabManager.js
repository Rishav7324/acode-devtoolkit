import dtkStyles from '../styles/index.css';
import { logger } from '../utils/logger.js';
import { DevToolkitTab } from '../ui/DevToolkitTab.js';

function syncTheme(container) {
  const theme = document.documentElement.getAttribute('data-theme') || 'dark';
  container.setAttribute('data-theme', theme);
}

function createThemeObserver(container) {
  syncTheme(container);
  const observer = new MutationObserver(() => syncTheme(container));
  observer.observe(document.documentElement, { attributes: true, attributeFilter: ['data-theme'] });
  return observer;
}

export class TabManager {
  constructor() {
    this._file = null;
    this._isOpen = false;
    this._EditorFile = null;
    this._themeObserver = null;
  }

  get isOpen() {
    return this._isOpen;
  }

  get file() {
    return this._file;
  }

  async open({ toolRegistry, selectionService, editorBridge }) {
    if (this._isOpen && this._file) {
      this._file.makeActive();
      return this._file;
    }

    try {
      this._EditorFile = acode.require('editorFile');
    } catch (e) {
      logger.error('TabManager: EditorFile API not available', e);
      return null;
    }

    const container = document.createElement('div');
    container.className = 'dtk-tab-root';
    syncTheme(container);

    const cleanup = DevToolkitTab({
      container,
      toolRegistry,
      selectionService,
      editorBridge,
      tabManager: this,
    });

    try {
      this._file = new this._EditorFile('\u{1F9E9} DevToolkit', {
        type: 'custom',
        content: container,
        stylesheets: [dtkStyles],
        hideQuickTools: true,
        tabIcon: 'icon-dtk-plugin',
        render: true,
        editable: false,
      });
    } catch (e) {
      logger.error('TabManager: failed to create EditorFile', e);
      cleanup();
      return null;
    }

    this._isOpen = true;
    this._themeObserver = createThemeObserver(container);

    this._file.on('close', () => {
      logger.debug('DevToolkit tab closed');
      this._isOpen = false;
      this._file = null;
      if (this._themeObserver) {
        this._themeObserver.disconnect();
        this._themeObserver = null;
      }
      if (typeof cleanup === 'function') cleanup();
    });

    this._file.on('switch', () => {
      syncTheme(container);
    });

    syncTheme(container);
    logger.info('DevToolkit tab opened');
    return this._file;
  }

  close() {
    if (this._file) {
      try {
        this._file.remove(true);
      } catch (e) {
        logger.warn('TabManager: error closing tab', e);
      }
      this._isOpen = false;
      this._file = null;
    }
    if (this._themeObserver) {
      this._themeObserver.disconnect();
      this._themeObserver = null;
    }
  }

  toggle({ toolRegistry, selectionService, editorBridge }) {
    if (this._isOpen && this._file) {
      this.close();
    } else {
      this.open({ toolRegistry, selectionService, editorBridge });
    }
  }
}
