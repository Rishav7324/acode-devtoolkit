import { logger } from '../utils/logger.js';

export function createSelectionService({ toolRegistry, editorBridge, launchService }) {
  function getSelection() {
    if (!editorBridge) return null;
    return editorBridge.getSelection();
  }

  function getContent() {
    if (!editorBridge) return null;
    return editorBridge.getContent();
  }

  function sendToTool(toolId, text) {
    if (!launchService) {
      logger.warn('SelectionService: no launch service available');
      return false;
    }
    return launchService.sendToTool(toolId, text);
  }

  function getAvailableTools() {
    return launchService
      ? launchService.getAvailableTools()
      : [];
  }

  return {
    getSelection,
    getContent,
    sendToTool,
    getAvailableTools,
  };
}
