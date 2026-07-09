import tag from 'html-tag-js';
import { Modal } from '../../ui/Modal.js';
import { Toast } from '../../ui/Toast.js';

const ENTITY_MAP = {
  '&': '&amp;',
  '<': '&lt;',
  '>': '&gt;',
  '"': '&quot;',
  "'": '&#39;',
  '/': '&#x2F;',
};

const REVERSE_MAP = Object.fromEntries(
  Object.entries(ENTITY_MAP).map(([k, v]) => [v, k])
);

const ENTITY_REGEX = /&[a-zA-Z0-9#]+;/g;
const CHAR_REGEX = /[&<>"'\/]/g;

function encodeEntities(text) {
  return text.replace(CHAR_REGEX, c => ENTITY_MAP[c] || c);
}

function decodeEntities(text) {
  return text.replace(ENTITY_REGEX, e => {
    if (REVERSE_MAP[e]) return REVERSE_MAP[e];
    if (e.startsWith('&#x')) {
      return String.fromCharCode(parseInt(e.slice(3, -1), 16));
    }
    if (e.startsWith('&#')) {
      return String.fromCharCode(parseInt(e.slice(2, -1), 10));
    }
    return e;
  });
}

function showHtmlEntities({ editor, settings, container }) {
  const input = tag('textarea', {
    className: 'dtk-tool-textarea',
    placeholder: 'Paste HTML or text with special characters...',
    spellcheck: 'false',
  });

  const output = tag('pre', { className: 'dtk-tool-output' });

  function encode() {
    const raw = input.value;
    if (!raw) {
      Toast({ message: 'No input to encode', type: 'warning' });
      return;
    }
    output.textContent = encodeEntities(raw);
  }

  function decode() {
    const raw = input.value;
    if (!raw) {
      Toast({ message: 'No input to decode', type: 'warning' });
      return;
    }
    output.textContent = decodeEntities(raw);
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
  }

  function copyOutput() {
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

  const body = tag('div', { className: 'dtk-tool-body' }, [
    tag('label', { className: 'dtk-tool-label', textContent: 'Input' }),
    input,
    tag('div', { className: 'dtk-tool-actions' }, [
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
    ]),
    tag('label', { className: 'dtk-tool-label', textContent: 'Output' }),
    output,
    tag('div', { className: 'dtk-tool-actions' }, [
      tag('button', {
        className: 'dtk-btn dtk-btn-sm',
        textContent: 'Load from Editor',
        onclick: loadFromEditor,
      }),
      tag('button', {
        className: 'dtk-btn dtk-btn-sm',
        textContent: 'Copy Output',
        onclick: copyOutput,
      }),
    ]),
  ]);

  if (container) {
    container.append(body);
    return () => { body.remove(); };
  } else {
    Modal({ title: 'HTML Entities', body });
  }
}

export { showHtmlEntities };
