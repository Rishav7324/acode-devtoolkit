import { logger } from '../utils/logger.js';

export class EditorService {
  get editor() {
    return window.editorManager ? window.editorManager.editor : null;
  }

  get activeFile() {
    return window.editorManager ? window.editorManager.activeFile : null;
  }

  getContent() {
    const view = this.editor;
    if (!view) return '';
    return view.state.doc.toString();
  }

  setContent(text) {
    const view = this.editor;
    if (!view) return;
    view.dispatch({
      changes: {
        from: 0,
        to: view.state.doc.length,
        insert: text,
      },
    });
  }

  getSelection() {
    const view = this.editor;
    if (!view) return '';
    return view.state.sliceDoc(
      view.state.selection.main.from,
      view.state.selection.main.to
    );
  }

  replaceSelection(text) {
    const view = this.editor;
    if (!view) return;
    view.dispatch({
      changes: {
        from: view.state.selection.main.from,
        to: view.state.selection.main.to,
        insert: text,
      },
    });
  }

  insertAtCursor(text) {
    const view = this.editor;
    if (!view) return;
    view.dispatch({
      changes: {
        from: view.state.selection.main.head,
        insert: text,
      },
    });
  }

  getCursorPosition() {
    const view = this.editor;
    if (!view) return { line: 0, ch: 0 };
    const pos = view.state.selection.main.head;
    const line = view.state.doc.lineAt(pos);
    return { line: line.number, ch: pos - line.from };
  }

  on(event, listener) {
    if (window.editorManager) {
      window.editorManager.on(event, listener);
    }
  }

  off(event, listener) {
    if (window.editorManager) {
      window.editorManager.off(event, listener);
    }
  }

  newFile(filename, options) {
    try {
      if (window.editorManager) {
        window.editorManager.addNewFile(filename, options);
      }
    } catch (error) {
      logger.error('Failed to create new file:', error);
    }
  }

  destroy() {
    this._listeners = [];
  }
}
