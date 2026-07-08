import tag from 'html-tag-js';

export function List({ items, emptyMessage }) {
  const root = tag('div', { className: 'dtk-list' });

  function render(data) {
    root.textContent = '';
    if (!data || data.length === 0) {
      root.append(tag('p', {
        className: 'dtk-list-empty',
        textContent: emptyMessage || 'No items',
      }));
      return;
    }
    for (const item of data) {
      root.append(tag('div', { className: 'dtk-list-item', textContent: item.title || item }));
    }
  }

  root.render = render;
  if (items) render(items);

  return root;
}
