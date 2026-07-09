import tag from 'html-tag-js';
import { Modal } from '../../ui/Modal.js';
import { Toast } from '../../ui/Toast.js';

const ALGORITHMS = [
  { id: 'MD5', label: 'MD5' },
  { id: 'SHA-1', label: 'SHA-1' },
  { id: 'SHA-256', label: 'SHA-256' },
  { id: 'SHA-384', label: 'SHA-384' },
  { id: 'SHA-512', label: 'SHA-512' },
];

async function hexDigest(algorithm, text) {
  const encoder = new TextEncoder();
  const data = encoder.encode(text);
  const hashBuffer = await crypto.subtle.digest(algorithm, data);
  const hashArray = Array.from(new Uint8Array(hashBuffer));
  return hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
}

function md5(text) {
  let hash = 0;
  for (let i = 0; i < text.length; i++) {
    const byte = text.charCodeAt(i);
    hash = ((hash << 5) - hash) + byte;
    hash = hash & hash;
  }
  const result = new Uint32Array([hash]);
  return Array.from(new Uint8Array(result.buffer))
    .map(b => b.toString(16).padStart(2, '0')).join('');
}

function showHashGenerator({ editor, settings, container }) {
  const input = tag('textarea', {
    className: 'dtk-tool-textarea',
    placeholder: 'Enter text to hash...',
    spellcheck: 'false',
  });

  const algoSelect = tag('select', { className: 'dtk-tool-select' },
    ALGORITHMS.map(a => tag('option', { value: a.id, textContent: a.label }))
  );

  const output = tag('pre', { className: 'dtk-tool-output' });

  async function generate() {
    const raw = input.value;
    if (!raw) {
      Toast({ message: 'No input to hash', type: 'warning' });
      return;
    }
    try {
      const algo = algoSelect.value;
      let hash;
      if (algo === 'MD5') {
        hash = md5(raw);
      } else {
        hash = await hexDigest(algo, raw);
      }
      output.textContent = hash;
    } catch (e) {
      output.textContent = '';
      Toast({ message: `Hash error: ${e.message}`, type: 'error' });
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
      algoSelect,
      tag('button', {
        className: 'dtk-btn dtk-btn-primary',
        textContent: 'Generate Hash',
        onclick: generate,
      }),
    ]),
    tag('label', { className: 'dtk-tool-label', textContent: 'Hash Output' }),
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
    Modal({ title: 'Hash Generator', body });
  }
}

export { showHashGenerator };
