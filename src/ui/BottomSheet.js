import tag from 'html-tag-js';

export function BottomSheet({ title, body, onClose }) {
  const bodyEl = typeof body === 'function' ? body() : body;

  const close = () => {
    overlay.remove();
    sheet.remove();
    if (onClose) onClose();
  };

  const overlay = tag('div', {
    className: 'dtk-sheet-overlay',
    onclick: close,
  });

  const sheet = tag('div', { className: 'dtk-sheet' }, [
    tag('div', { className: 'dtk-sheet-handle' }),
    tag('div', { className: 'dtk-sheet-header' }, [
      tag('h3', { className: 'dtk-sheet-title', textContent: title || '' }),
      tag('button', {
        className: 'dtk-modal-close',
        textContent: '\u2715',
        onclick: close,
      }),
    ]),
    tag('div', { className: 'dtk-sheet-body' }, bodyEl),
  ]);

  document.body.append(overlay, sheet);

  return { overlay, sheet, close };
}
