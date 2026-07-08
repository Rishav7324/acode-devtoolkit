import tag from 'html-tag-js';
import { Modal } from '../../ui/Modal.js';
import { Toast } from '../../ui/Toast.js';
import { logger } from '../../utils/logger.js';

export function minifyJS(code) {
  return code
    .replace(/\/\/.*$/gm, '')
    .replace(/\/\*[\s\S]*?\*\//g, '')
    .replace(/\s+/g, ' ')
    .replace(/\s*([{}();,:])\s*/g, '$1')
    .replace(/;\s*}/g, '}')
    .trim();
}

export function minifyCSS(code) {
  return code
    .replace(/\/\*[\s\S]*?\*\//g, '')
    .replace(/\s+/g, ' ')
    .replace(/\s*([{};,:])\s*/g, '$1')
    .replace(/;}/g, '}')
    .trim();
}

export function minifyHTML(code) {
  return code
    .replace(/<!--[\s\S]*?-->/g, '')
    .replace(/>\s+</g, '><')
    .replace(/\s{2,}/g, ' ')
    .replace(/\n\s*/g, '')
    .trim();
}

export function formatJS(code) {
  let indent = 0;
  return code
    .replace(/[{}]/g, m => m === '{' ? '{\n' + '  '.repeat(++indent) : '\n' + '  '.repeat(--indent) + '}')
    .replace(/;/g, ';\n' + '  '.repeat(indent))
    .replace(/\n\s*\n/g, '\n')
    .trim();
}

export function formatCSS(code) {
  let indent = 0;
  return code
    .replace(/{/g, ' {\n' + '  '.repeat(++indent))
    .replace(/}/g, '\n' + '  '.repeat(--indent) + '}')
    .replace(/;/g, ';\n' + '  '.repeat(indent))
    .replace(/:\s*/g, ': ')
    .replace(/\n\s*\n/g, '\n')
    .trim();
}

export function formatHTML(code) {
  let indent = 0;
  return code
    .replace(/>\s*</g, '>\n<')
    .replace(/<\/(\w+)/g, (m) => {
      indent = Math.max(0, indent - 1);
      return '\n' + '  '.repeat(indent) + '</' + m.slice(2);
    })
    .replace(/<(\w[^>]*)>/g, (m) => {
      const r = '\n' + '  '.repeat(indent) + '<' + m.slice(1);
      if (!m.endsWith('/>')) indent++;
      return r;
    })
    .replace(/\n\s*\n/g, '\n')
    .trim();
}

export function showMinifier({ editor, settings, text } = {}) {
  const input = tag('textarea', {
    className: 'dtk-tool-textarea',
    placeholder: 'Paste JavaScript, CSS, or HTML here...',
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

  function detectType(code) {
    const trimmed = code.trim();
    if (/^[\s\S]*\{[\s\S]*\}$/.test(trimmed) && /[#.]?\w+\s*\{/.test(trimmed)) return 'css';
    if (/^<!DOCTYPE|^<html|^<[a-z]/i.test(trimmed)) return 'html';
    return 'js';
  }

  function minify() {
    try {
      const raw = input.value.trim();
      if (!raw) {
        Toast({ message: 'No input to minify', type: 'warning' });
        return;
      }
      const type = settings ? settings.get('minifier', 'type') : null;
      const lang = type || detectType(raw);
      let result;
      switch (lang) {
        case 'css': result = minifyCSS(raw); break;
        case 'html': result = minifyHTML(raw); break;
        default: result = minifyJS(raw); break;
      }
      output.textContent = result;
      const saved = raw.length - result.length;
      charCount.textContent = `${result.length} chars (saved ${saved})`;
    } catch (e) {
      output.textContent = '';
      Toast({ message: `Minify error: ${e.message}`, type: 'error' });
    }
  }

  function formatCode() {
    try {
      const raw = input.value.trim();
      if (!raw) {
        Toast({ message: 'No input to format', type: 'warning' });
        return;
      }
      const lang = detectType(raw);
      let result;
      switch (lang) {
        case 'css': result = formatCSS(raw); break;
        case 'html': result = formatHTML(raw); break;
        default: result = formatJS(raw); break;
      }
      output.textContent = result;
      charCount.textContent = `${result.length} chars`;
    } catch (e) {
      output.textContent = '';
      Toast({ message: `Format error: ${e.message}`, type: 'error' });
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
    if (output.textContent) output.textContent = '';
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
      textContent: 'Minify',
      onclick: minify,
    }),
    tag('button', {
      className: 'dtk-btn dtk-btn-secondary',
      textContent: 'Format',
      onclick: formatCode,
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
    title: 'Code Minifier',
    body,
  });
}
