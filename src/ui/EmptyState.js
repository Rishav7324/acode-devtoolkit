import tag from 'html-tag-js';

export function EmptyState({ icon, title, description }) {
  const root = tag('div', { className: 'dtk-empty' }, [
    tag('div', { className: 'dtk-empty-icon', textContent: icon || '\u2610' }),
    tag('h3', { className: 'dtk-empty-title', textContent: title || 'Nothing here' }),
    tag('p', { className: 'dtk-empty-desc', textContent: description || '' }),
  ]);

  return root;
}
