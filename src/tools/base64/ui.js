import tag from 'html-tag-js';
import { Modal } from '../../ui/Modal.js';
import { Toast } from '../../ui/Toast.js';
import { logger } from '../../utils/logger.js';

function isValidBase64(str) {
  try {
    return btoa(atob(str)) === str;
  } catch {
    return false;
  }
}

export function showBase64Tool({ editor, settings, text, container } = {}) {
  const input = tag('textarea', {
    className: 'dtk-tool-textarea',
    placeholder: 'Enter text to encode or paste Base64 to decode...',
    spellcheck: 'false',
  });

  const output = tag('pre', {
    className: 'dtk-tool-output',
  });

  const charCount = tag('span', {
    className: 'dtk-tool-charcount',
    textContent: '0 chars',
  });

  if (text) { input.value = text; charCount.textContent = `${text.length} chars`; }

  input.oninput = () => {
    charCount.textContent = `${input.value.length} chars`;
  };

  function encode() {
    try {
      const raw = input.value;
      if (!raw) {
        Toast({ message: 'No input to encode', type: 'warning' });
        return;
      }
      const encoded = btoa(unescape(encodeURIComponent(raw)));
      output.textContent = encoded;
      charCount.textContent = `${encoded.length} chars`;
    } catch (e) {
      output.textContent = '';
      Toast({ message: `Encode error: ${e.message}`, type: 'error' });
    }
  }

  function decode() {
    try {
      const raw = input.value.trim();
      if (!raw) {
        Toast({ message: 'No input to decode', type: 'warning' });
        return;
      }
      if (!isValidBase64(raw)) {
        Toast({ message: 'Input is not valid Base64', type: 'error' });
        return;
      }
      const decoded = decodeURIComponent(escape(atob(raw)));
      output.textContent = decoded;
      charCount.textContent = `${decoded.length} chars`;
    } catch (e) {
      output.textContent = '';
      Toast({ message: `Decode error: ${e.message}`, type: 'error' });
    }
  }

  function swapInputOutput() {
    const result = output.textContent;
    if (!result) {
      Toast({ message: 'No output to swap', type: 'warning' });
      return;
    }
    input.value = result;
    output.textContent = '';
    charCount.textContent = `${result.length} chars`;
  }

  function clearAll() {
    input.value = '';
    output.textContent = '';
    charCount.textContent = '0 chars';
    Toast({ message: 'Cleared', type: 'info' });
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
      textContent: 'Encode \u2192',
      onclick: encode,
    }),
    tag('button', {
      className: 'dtk-btn dtk-btn-secondary',
      textContent: '\u2190 Decode',
      onclick: decode,
    }),
    tag('button', {
      className: 'dtk-btn dtk-btn-sm',
      textContent: '\u21C4 Swap',
      onclick: swapInputOutput,
    }),
    tag('button', {
      className: 'dtk-btn dtk-btn-sm',
      textContent: '\u2716 Clear',
      onclick: clearAll,
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

  if (container) {
    container.append(body);
    return () => { body.remove(); };
  } else {
    Modal({ title: 'Base64 Encoder / Decoder', body });
  }
}
