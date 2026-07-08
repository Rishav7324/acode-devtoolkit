import tag from 'html-tag-js';
import { Modal } from './Modal.js';
import { Toast } from './Toast.js';
import { logger } from '../utils/logger.js';

export function ToolPicker({ toolRegistry, selectionService, editorBridge }) {
  const tools = selectionService.getAvailableTools();

  if (tools.length === 0) {
    Toast({ message: 'No tools available', type: 'warning' });
    return;
  }

  const selectedText = editorBridge ? editorBridge.getSelection() : null;

  const searchInput = tag('input', {
    className: 'dtk-tool-input',
    placeholder: 'Search tools...',
    spellcheck: 'false',
  });

  const list = tag('div', { className: 'dtk-tool-picker-list' });

  function renderTools(query) {
    list.textContent = '';
    const q = query.toLowerCase().trim();
    const filtered = q
      ? tools.filter(t => t.title.toLowerCase().includes(q) || t.description.toLowerCase().includes(q))
      : tools;

    if (filtered.length === 0) {
      list.append(tag('p', {
        className: 'dtk-tool-picker-empty',
        textContent: 'No matching tools',
      }));
      return;
    }

    for (const tool of filtered) {
      const row = tag('button', {
        className: 'dtk-tool-picker-item',
        onclick: () => launchTool(tool),
      }, [
        tag('span', { className: 'dtk-tool-picker-icon', textContent: tool.icon || '\u2699' }),
        tag('div', { className: 'dtk-tool-picker-info' }, [
          tag('span', { className: 'dtk-tool-picker-title', textContent: tool.title }),
          tag('span', { className: 'dtk-tool-picker-desc', textContent: tool.description }),
        ]),
      ]);
      list.append(row);
    }
  }

  function launchTool(tool) {
    Modal._dismiss();
    const editor = editorBridge ? { getContent: () => editorBridge.getContent(), insertAtCursor: (t) => editorBridge.insertAtCursor(t) } : null;
    const settings = null;
    const launchArgs = { editor, settings };
    if (selectedText) {
      launchArgs.text = selectedText;
    }
    if (typeof tool.launch === 'function') {
      tool.launch(launchArgs);
    }
  }

  searchInput.oninput = () => renderTools(searchInput.value);

  renderTools('');

  const body = tag('div', { className: 'dtk-tool-picker-body' }, [
    searchInput,
    list,
  ]);

  Modal({
    title: selectedText ? 'Send to Tool' : 'Open Tool',
    body,
  });
}
