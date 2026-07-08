import { logger } from '../utils/logger.js';

export function createEditorBridge(editorService) {
  function _getEditor() {
    return editorService ? editorService.getEditor() : null;
  }

  function getContent() {
    const editor = _getEditor();
    if (!editor) return null;
    try {
      return editor.getContent ? editor.getContent() : null;
    } catch (e) {
      logger.warn('EditorBridge: failed to get content:', e);
      return null;
    }
  }

  function setContent(text) {
    const editor = _getEditor();
    if (!editor) return false;
    try {
      if (editor.setContent) {
        editor.setContent(text);
        return true;
      }
      return false;
    } catch (e) {
      logger.warn('EditorBridge: failed to set content:', e);
      return false;
    }
  }

  function getSelection() {
    const editor = _getEditor();
    if (!editor) return null;
    try {
      if (editor.getSelectionRange) {
        const range = editor.getSelectionRange();
        const content = editor.getContent();
        if (!range || !content) return null;
        const lines = content.split('\n');
        const startLine = range.start.row;
        const endLine = range.end.row;
        if (startLine === endLine) {
          return lines[startLine].slice(range.start.column, range.end.column);
        }
        const parts = [lines[startLine].slice(range.start.column)];
        for (let i = startLine + 1; i < endLine; i++) {
          parts.push(lines[i]);
        }
        parts.push(lines[endLine].slice(0, range.end.column));
        return parts.join('\n');
      }
      if (editor.getContent) {
        return editor.getContent();
      }
      return null;
    } catch (e) {
      logger.warn('EditorBridge: failed to get selection:', e);
      return null;
    }
  }

  function replaceSelection(text) {
    const editor = _getEditor();
    if (!editor) return false;
    try {
      if (editor.replaceSelection) {
        editor.replaceSelection(text);
        return true;
      }
      if (editor.insertAtCursor) {
        const selected = getSelection();
        if (selected) {
          const content = editor.getContent();
          if (content) {
            const idx = content.indexOf(selected);
            if (idx !== -1) {
              const before = editor.setContent ? true : false;
              if (before) {
                editor.setContent(content.replace(selected, text));
                return true;
              }
            }
          }
        }
        editor.insertAtCursor(text);
        return true;
      }
      return false;
    } catch (e) {
      logger.warn('EditorBridge: failed to replace selection:', e);
      return false;
    }
  }

  function insertAtCursor(text) {
    const editor = _getEditor();
    if (!editor) return false;
    try {
      if (editor.insertAtCursor) {
        editor.insertAtCursor(text);
        return true;
      }
      return false;
    } catch (e) {
      logger.warn('EditorBridge: failed to insert at cursor:', e);
      return false;
    }
  }

  function getCursorPosition() {
    const editor = _getEditor();
    if (!editor) return null;
    try {
      if (editor.getCursorPosition) {
        return editor.getCursorPosition();
      }
      return null;
    } catch (e) {
      logger.warn('EditorBridge: failed to get cursor position:', e);
      return null;
    }
  }

  function getLineCount() {
    const content = getContent();
    if (!content) return 0;
    return content.split('\n').length;
  }

  function getFileName() {
    const editor = _getEditor();
    if (!editor) return null;
    try {
      if (editor.getFile) {
        const file = editor.getFile();
        return file ? file.name : null;
      }
      return null;
    } catch (e) {
      return null;
    }
  }

  return {
    getContent,
    setContent,
    getSelection,
    replaceSelection,
    insertAtCursor,
    getCursorPosition,
    getLineCount,
    getFileName,
  };
}
