import tag from 'html-tag-js';

export function Modal({ title, body, footer, onClose }) {
  const close = () => {
    overlay.remove();
    modal.remove();
    if (onClose) onClose();
  };

  const children = [tag('div', { className: 'dtk-modal-header' }, [
    tag('h3', { className: 'dtk-modal-title', textContent: title || '' }),
    tag('button', {
      className: 'dtk-modal-close',
      textContent: '\u2715',
      onclick: close,
    }),
  ])];

  children.push(tag('div', { className: 'dtk-modal-body' },
    typeof body === 'function' ? body() : body
  ));

  if (footer) {
    children.push(tag('div', { className: 'dtk-modal-footer' },
      typeof footer === 'function' ? footer(close) : footer
    ));
  }

  const overlay = tag('div', { className: 'dtk-modal-overlay', onclick: close }, [
    tag('div', { className: 'dtk-modal', onclick: (e) => e.stopPropagation() }, children),
  ]);

  document.body.append(overlay);

  return { overlay, modal: overlay.firstChild, close };
}
