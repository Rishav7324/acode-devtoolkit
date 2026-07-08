import tag from 'html-tag-js';

export function ErrorState({ title, description, onRetry }) {
  const root = tag('div', { className: 'dtk-error' }, [
    tag('div', { className: 'dtk-error-icon', textContent: '\u26a0' }),
    tag('h3', { className: 'dtk-error-title', textContent: title || 'Something went wrong' }),
    tag('p', { className: 'dtk-error-desc', textContent: description || '' }),
  ]);

  if (onRetry) {
    root.append(tag('button', {
      className: 'dtk-error-retry',
      textContent: 'Try Again',
      onclick: onRetry,
    }));
  }

  return root;
}
