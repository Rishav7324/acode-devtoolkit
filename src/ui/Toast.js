import tag from 'html-tag-js';

let container = null;

function getContainer() {
  if (!container) {
    container = tag('div', { className: 'dtk-toast-container' });
    document.body.append(container);
  }
  return container;
}

const ICONS = {
  info: '\u2139',
  success: '\u2713',
  warning: '\u26a0',
  error: '\u2717',
};

export function Toast({ message, type, duration }) {
  const t = type || 'info';
  const toast = tag('div', { className: `dtk-toast dtk-toast-${t}` }, [
    tag('span', { className: 'dtk-toast-icon', textContent: ICONS[t] || ICONS.info }),
    tag('span', { textContent: message }),
  ]);

  getContainer().append(toast);

  const dur = duration || 3000;
  setTimeout(() => {
    toast.remove();
  }, dur);

  return toast;
}
