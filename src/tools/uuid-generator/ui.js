import tag from 'html-tag-js';
import { Modal } from '../../ui/Modal.js';
import { Toast } from '../../ui/Toast.js';

function generateUuid() {
  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, c => {
    const r = Math.random() * 16 | 0;
    return (c === 'x' ? r : (r & 0x3 | 0x8)).toString(16);
  });
}

function showUuidGenerator({ editor, settings, container }) {
  const output = tag('pre', { className: 'dtk-tool-output dtk-tool-uuid-output' });

  function generate() {
    const uuid = generateUuid();
    output.textContent = uuid;
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

  generate();

  const body = tag('div', { className: 'dtk-tool-body' }, [
    tag('div', { className: 'dtk-tool-uuid-display' }, [
      output,
    ]),
    tag('div', { className: 'dtk-tool-actions dtk-tool-actions-center' }, [
      tag('button', {
        className: 'dtk-btn dtk-btn-primary',
        textContent: 'Generate New UUID',
        onclick: generate,
      }),
    ]),
    tag('div', { className: 'dtk-tool-actions dtk-tool-actions-center' }, [
      tag('button', {
        className: 'dtk-btn dtk-btn-sm',
        textContent: 'Copy to Clipboard',
        onclick: copyOutput,
      }),
      tag('button', {
        className: 'dtk-btn dtk-btn-sm',
        textContent: 'Insert to Editor',
        onclick: insertToEditor,
      }),
    ]),
  ]);

  if (container) {
    container.append(body);
    return () => { body.remove(); };
  } else {
    Modal({ title: 'UUID Generator', body });
  }
}

export { showUuidGenerator };
