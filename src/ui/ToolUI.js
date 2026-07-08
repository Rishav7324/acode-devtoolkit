import tag from 'html-tag-js';
import { Toast } from './Toast.js';

export function createToolEditorBar({ editor, onCopied, onInserted }) {
  function loadFromEditor(input, onLoaded) {
    if (!editor) {
      Toast({ message: 'No editor available', type: 'warning' });
      return;
    }
    const content = editor.getContent();
    if (!content) {
      Toast({ message: 'Editor is empty', type: 'warning' });
      return;
    }
    if (typeof input === 'function') {
      input(content);
    } else if (input) {
      input.value = content;
    }
    if (onLoaded) onLoaded();
    Toast({ message: 'Loaded from editor', type: 'info' });
  }

  function copyToClipboard(getText) {
    const text = typeof getText === 'function' ? getText() : getText;
    if (!text) {
      Toast({ message: 'Nothing to copy', type: 'warning' });
      return;
    }
    navigator.clipboard.writeText(text).then(() => {
      Toast({ message: 'Copied to clipboard', type: 'success' });
    }).catch(() => {
      Toast({ message: 'Failed to copy', type: 'error' });
    });
  }

  function insertToEditor(getText) {
    const text = typeof getText === 'function' ? getText() : getText;
    if (!text) {
      Toast({ message: 'Nothing to insert', type: 'warning' });
      return;
    }
    if (!editor) {
      Toast({ message: 'No editor available', type: 'warning' });
      return;
    }
    editor.insertAtCursor(text);
    Toast({ message: 'Inserted at cursor', type: 'success' });
  }

  function loadBtn(input, onLoaded) {
    return tag('button', {
      className: 'dtk-btn dtk-btn-sm',
      textContent: 'Load from Editor',
      onclick: () => loadFromEditor(input, onLoaded),
    });
  }

  function copyBtn(getText) {
    return tag('button', {
      className: 'dtk-btn dtk-btn-sm',
      textContent: 'Copy Output',
      onclick: () => copyToClipboard(getText),
    });
  }

  function insertBtn(getText) {
    return tag('button', {
      className: 'dtk-btn dtk-btn-sm',
      textContent: 'Insert to Editor',
      onclick: () => insertToEditor(getText),
    });
  }

  return tag('div', { className: 'dtk-tool-editor-actions' }, [
    loadBtn,
    copyBtn,
    insertBtn,
  ]);
}

export function createStatusBar(countFn) {
  const el = tag('span', {
    className: 'dtk-tool-charcount',
    textContent: '0 chars',
  });

  function update() {
    el.textContent = typeof countFn === 'function' ? countFn() : `${countFn || 0} chars`;
  }

  return {
    el: tag('div', { className: 'dtk-tool-status' }, [el]),
    update,
  };
}
