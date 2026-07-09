import { EmptyState } from '../ui/EmptyState.js';
import { logger } from '../utils/logger.js';

const DEV_MODE = typeof acode !== 'undefined' && acode.app && acode.app.versionCode
  ? acode.app.versionCode >= 970
  : false;

function isDev() {
  return DEV_MODE;
}

export function createLaunchService({ toolRegistry, editorBridge, settingsService }) {
  function getEditorShim() {
    return editorBridge
      ? {
          getContent: () => editorBridge.getContent(),
          insertAtCursor: (t) => editorBridge.insertAtCursor(t),
        }
      : null;
  }

  function launch(tool, container) {
    if (!tool) {
      return renderError(container, {
        title: 'Unknown Tool',
        message: 'No tool data provided',
        suggestion: 'This is a bug. Report it to the developer.',
      });
    }

    if (!tool.enabled) {
      return renderError(container, {
        title: tool.name || tool.id,
        message: `"${tool.name}" is currently disabled`,
        suggestion: 'Enable it in DevToolkit settings.',
      });
    }

    if (typeof tool.launch !== 'function') {
      return renderError(container, {
        title: tool.name || tool.id,
        message: 'This tool has no launch handler',
        suggestion: 'The tool definition is missing a "launch" function. Ensure the tool module exports "launch".',
        missingFunction: 'launch',
        tool: tool.name || tool.id,
      });
    }

    try {
      toolRegistry.markRecent(tool.id);

      const editor = getEditorShim();
      const settings = settingsService || null;

      const cleanup = tool.launch({ editor, settings, container });

      if (typeof tool.initialize === 'function') {
        tool.initialize({ editor, settings });
      }

      return typeof cleanup === 'function' ? cleanup : null;
    } catch (error) {
      logger.error(`LaunchService: error launching "${tool.name}":`, error);
      return renderError(container, {
        title: tool.name || tool.id,
        message: error.message || 'Unknown launch error',
        suggestion: 'Check the console for error details. Ensure all dependencies are available.',
        stack: isDev() ? error.stack : undefined,
        tool: tool.name || tool.id,
      });
    }
  }

  function sendToTool(toolId, text) {
    const tool = toolRegistry.get(toolId);
    if (!tool) {
      logger.warn(`LaunchService: tool "${toolId}" not found`);
      return false;
    }
    if (typeof tool.launch !== 'function') {
      logger.warn(`LaunchService: tool "${toolId}" has no launch handler`);
      return false;
    }
    try {
      const editor = getEditorShim();
      const result = tool.launch({ editor, text, settings: settingsService || null });
      toolRegistry.markRecent(toolId);
      return true;
    } catch (error) {
      logger.error(`LaunchService: error sending to tool "${toolId}":`, error);
      return false;
    }
  }

  function getAvailableTools() {
    return toolRegistry.getEnabled().filter(t => typeof t.launch === 'function');
  }

  return { launch, sendToTool, getAvailableTools };
}

function renderError(container, details) {
  if (!container) return null;

  const sections = [details.message];

  if (details.missingFunction) {
    sections.push(`Missing Function: ${details.missingFunction}()`);
  }

  if (details.suggestion) {
    sections.push(`Suggestion: ${details.suggestion}`);
  }

  if (details.stack && isDev()) {
    sections.push(`Stack Trace:\n${details.stack}`);
  }

  const el = EmptyState({
    icon: '\u26A0',
    title: details.title || 'Tool Error',
    description: sections.join('\n'),
  });

  container.append(el);

  return () => { el.remove(); };
}
