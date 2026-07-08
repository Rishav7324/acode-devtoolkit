import tag from 'html-tag-js';

export function IconButton({ icon, active, onClick }) {
  const classes = ['dtk-btn-icon'];
  if (active) classes.push('is-favorite');

  const root = tag('button', {
    className: classes.join(' '),
    textContent: icon || '\u2699',
    onclick: onClick || null,
  });

  return root;
}
