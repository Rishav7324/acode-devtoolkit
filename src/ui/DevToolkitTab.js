import tag from 'html-tag-js';
import { HomePage } from '../pages/HomePage.js';
import { createLaunchService } from '../services/LaunchService.js';
import { Toast } from '../ui/Toast.js';

export function DevToolkitTab({ container, toolRegistry, selectionService, editorBridge, tabManager }) {
  let currentCleanup = null;
  let currentToolId = null;

  const launchService = createLaunchService({
    toolRegistry,
    editorBridge,
    settingsService: null,
  });

  function cleanupView() {
    if (typeof currentCleanup === 'function') {
      currentCleanup();
      currentCleanup = null;
    }
    currentToolId = null;
  }

  function showHome() {
    const savedId = currentToolId;
    cleanupView();

    container.textContent = '';

    const backBtn = savedId
      ? tag('button', {
          className: 'dtk-tab-back',
          textContent: '\u2190 Tools',
          onclick: () => {
            currentToolId = null;
            showHome();
          },
        })
      : null;

    if (backBtn) container.append(backBtn);

    const homeEl = HomePage({
      toolRegistry,
      launchService,
      onLaunchTool: (tool) => {
        showTool(tool);
      },
    });

    container.append(homeEl);
  }

  function showTool(tool) {
    cleanupView();
    container.textContent = '';

    const header = tag('div', { className: 'dtk-tab-tool-header' }, [
      tag('button', {
        className: 'dtk-tab-back',
        textContent: '\u2190 Back',
        onclick: () => showHome(),
      }),
      tag('span', {
        className: 'dtk-tab-tool-title',
        textContent: tool.name || tool.id,
      }),
    ]);
    container.append(header);

    const body = tag('div', { className: 'dtk-tab-tool-body' });
    container.append(body);

    const cleanup = launchService.launch(tool, body);

    if (typeof cleanup === 'function') {
      currentCleanup = cleanup;
      currentToolId = tool.id;
    }
  }

  showHome();

  return () => {
    cleanupView();
    container.textContent = '';
  };
}
