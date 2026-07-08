import tag from 'html-tag-js';

export function Loading({ text }) {
  const root = tag('div', { className: 'dtk-loading' }, [
    tag('div', { className: 'dtk-loading-spinner' }),
    tag('p', { className: 'dtk-loading-text', textContent: text || 'Loading...' }),
  ]);

  return root;
}
