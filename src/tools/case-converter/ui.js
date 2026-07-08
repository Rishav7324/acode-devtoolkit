import tag from 'html-tag-js';
import { Modal } from '../../ui/Modal.js';
import { Toast } from '../../ui/Toast.js';

const CASES = [
  { id: 'camel', label: 'camelCase' },
  { id: 'pascal', label: 'PascalCase' },
  { id: 'snake', label: 'snake_case' },
  { id: 'kebab', label: 'kebab-case' },
  { id: 'upper', label: 'UPPER CASE' },
  { id: 'lower', label: 'lower case' },
  { id: 'title', label: 'Title Case' },
  { id: 'constant', label: 'CONSTANT_CASE' },
  { id: 'dot', label: 'dot.case' },
  { id: 'path', label: 'path/case' },
];

export function toWords(str) {
  return str
    .replace(/([a-z])([A-Z])/g, '$1 $2')
    .replace(/[^a-zA-Z0-9]+/g, ' ')
    .trim()
    .split(/\s+/)
    .filter(Boolean);
}

export function convertCase(input, caseId) {
  const words = toWords(input);
  if (words.length === 0) return '';

  switch (caseId) {
    case 'camel':
      return words.map((w, i) => i === 0 ? w.toLowerCase() : w[0].toUpperCase() + w.slice(1).toLowerCase()).join('');
    case 'pascal':
      return words.map(w => w[0].toUpperCase() + w.slice(1).toLowerCase()).join('');
    case 'snake':
      return words.map(w => w.toLowerCase()).join('_');
    case 'kebab':
      return words.map(w => w.toLowerCase()).join('-');
    case 'upper':
      return words.map(w => w.toUpperCase()).join(' ');
    case 'lower':
      return words.map(w => w.toLowerCase()).join(' ');
    case 'title':
      return words.map(w => w[0].toUpperCase() + w.slice(1).toLowerCase()).join(' ');
    case 'constant':
      return words.map(w => w.toUpperCase()).join('_');
    case 'dot':
      return words.map(w => w.toLowerCase()).join('.');
    case 'path':
      return words.map(w => w.toLowerCase()).join('/');
    default:
      return input;
  }
}

export function showCaseConverter({ editor, settings, text } = {}) {
  const input = tag('textarea', {
    className: 'dtk-tool-textarea',
    placeholder: 'Type or paste text to convert...',
    spellcheck: 'false',
  });

  const caseSelect = tag('select', { className: 'dtk-tool-select' });
  CASES.forEach(c => {
    const opt = tag('option', { value: c.id, textContent: c.label });
    caseSelect.appendChild(opt);
  });

  const output = tag('pre', {
    className: 'dtk-tool-output',
  });

  const charCount = tag('span', {
    className: 'dtk-tool-charcount',
    textContent: '0 chars',
  });

  function convert() {
    const raw = input.value;
    if (!raw) {
      output.textContent = '';
      charCount.textContent = '0 chars';
      return;
    }
    const result = convertCase(raw, caseSelect.value);
    output.textContent = result;
    charCount.textContent = `${result.length} chars`;
  }

  if (text) { input.value = text; convert(); }

  input.oninput = convert;
  caseSelect.onchange = convert;

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
    convert();
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
    caseSelect,
    tag('button', {
      className: 'dtk-btn dtk-btn-sm',
      textContent: 'Load from Editor',
      onclick: loadFromEditor,
    }),
  ]);

  const editorBar = tag('div', { className: 'dtk-tool-editor-actions' }, [
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
    title: 'Case Converter',
    body,
  });
}
