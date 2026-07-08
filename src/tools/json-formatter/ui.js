import tag from 'html-tag-js';
import { Modal } from '../../ui/Modal.js';
import { Toast } from '../../ui/Toast.js';
import { logger } from '../../utils/logger.js';

export function showJsonFormatter({ editor, settings }) {
  const indentSize = settings
    ? settings.get('json-formatter', 'indentSize') || 2
    : 2;
  const sortKeys = settings
    ? settings.get('json-formatter', 'sortKeys') || false
    : false;

  const input = tag('textarea', {
    className: 'dtk-tool-textarea',
    placeholder: 'Paste JSON here or load from editor...',
    spellcheck: 'false',
  });

  const output = tag('pre', {
    className: 'dtk-tool-output',
  });

  const charCount = tag('span', {
    className: 'dtk-tool-charcount',
    textContent: '0 chars',
  });

  input.oninput = () => {
    charCount.textContent = `${input.value.length} chars`;
  };

  function formatJSON() {
    try {
      const raw = input.value.trim();
      if (!raw) {
        Toast({ message: 'No input to format', type: 'warning' });
        return;
      }
      const parsed = JSON.parse(raw);
      const formatted = JSON.stringify(
        parsed,
        sortKeys ? Object.keys(parsed).sort() : null,
        indentSize
      );
      output.textContent = formatted;
      charCount.textContent = `${formatted.length} chars`;
    } catch (e) {
      output.textContent = '';
      Toast({ message: `Invalid JSON: ${e.message}`, type: 'error' });
    }
  }

  function minifyJSON() {
    try {
      const raw = input.value.trim();
      if (!raw) {
        Toast({ message: 'No input to minify', type: 'warning' });
        return;
      }
      const parsed = JSON.parse(raw);
      const minified = JSON.stringify(parsed);
      output.textContent = minified;
      charCount.textContent = `${minified.length} chars`;
    } catch (e) {
      output.textContent = '';
      Toast({ message: `Invalid JSON: ${e.message}`, type: 'error' });
    }
  }

  function validateJSON() {
    try {
      const raw = input.value.trim();
      if (!raw) {
        Toast({ message: 'No input to validate', type: 'warning' });
        return;
      }
      JSON.parse(raw);
      Toast({ message: 'Valid JSON', type: 'success' });
    } catch (e) {
      Toast({ message: `Invalid JSON: ${e.message}`, type: 'error' });
    }
  }

  function loadFromEditor() {
    if (!editor) {
      Toast({ message: 'No editor available', type: 'warning' });
      return;
    }
    const content = editor.getContent();
    if (!content) {
      Toast({ message: 'Editor is empty', type: 'warning' });
      return;
    }
    input.value = content;
    charCount.textContent = `${content.length} chars`;
    if (output.textContent) {
      output.textContent = '';
    }
    Toast({ message: 'Loaded from editor', type: 'info' });
  }

  function copyToClipboard() {
    const text = output.textContent;
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

  function insertToEditor() {
    const text = output.textContent;
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

  const actionBar = tag('div', { className: 'dtk-tool-actions' }, [
    tag('button', {
      className: 'dtk-btn dtk-btn-primary',
      textContent: 'Format',
      onclick: formatJSON,
    }),
    tag('button', {
      className: 'dtk-btn dtk-btn-secondary',
      textContent: 'Minify',
      onclick: minifyJSON,
    }),
    tag('button', {
      className: 'dtk-btn dtk-btn-secondary',
      textContent: 'Validate',
      onclick: validateJSON,
    }),
  ]);

  const editorBar = tag('div', { className: 'dtk-tool-editor-actions' }, [
    tag('button', {
      className: 'dtk-btn dtk-btn-sm',
      textContent: 'Load from Editor',
      onclick: loadFromEditor,
    }),
    tag('button', {
      className: 'dtk-btn dtk-btn-sm',
      textContent: 'Copy Output',
      onclick: copyToClipboard,
    }),
    tag('button', {
      className: 'dtk-btn dtk-btn-sm',
      textContent: 'Insert to Editor',
      onclick: insertToEditor,
    }),
  ]);

  const statusBar = tag('div', { className: 'dtk-tool-status' }, [
    charCount,
  ]);

  const body = tag('div', { className: 'dtk-tool-body' }, [
    tag('label', { className: 'dtk-tool-label', textContent: 'Input' }),
    input,
    actionBar,
    tag('label', { className: 'dtk-tool-label', textContent: 'Output' }),
    output,
    editorBar,
    statusBar,
  ]);

  Modal({
    title: 'JSON Formatter',
    body,
  });
}
