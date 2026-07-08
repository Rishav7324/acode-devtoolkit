import { logger } from '../utils/logger.js';

export function createSelectionService({ toolRegistry, editorBridge }) {
  function getSelection() {
    if (!editorBridge) return null;
    return editorBridge.getSelection();
  }

  function getContent() {
    if (!editorBridge) return null;
    return editorBridge.getContent();
  }

  function sendToTool(toolId, text) {
    const tool = toolRegistry.get(toolId);
    if (!tool) {
      logger.warn(`SelectionService: tool "${toolId}" not found`);
      return false;
    }
    if (typeof tool.launch === 'function') {
      const editor = editorBridge
        ? { getContent: () => editorBridge.getContent(), insertAtCursor: (t) => editorBridge.insertAtCursor(t) }
        : null;
      tool.launch({ editor, text, settings: null });
      return true;
    }
    logger.warn(`SelectionService: tool "${toolId}" has no launch handler`);
    return false;
  }

  function getAvailableTools() {
    return toolRegistry.getAll().filter(t => typeof t.launch === 'function');
  }

  return {
    getSelection,
    getContent,
    sendToTool,
    getAvailableTools,
  };
}
