import tag from 'html-tag-js';

export function Header({ greeting, subtitle }) {
  const root = tag('div', { className: 'dtk-header' }, [
    tag('h1', { className: 'dtk-header-greeting', textContent: greeting || 'Welcome' }),
    tag('p', { className: 'dtk-header-sub', textContent: subtitle || '' }),
  ]);

  return root;
}
