import tag from 'html-tag-js';

export function Button({ text, variant, size, icon, onClick }) {
  const classes = ['dtk-btn'];
  if (variant === 'primary') classes.push('dtk-btn-primary');
  else if (variant === 'secondary') classes.push('dtk-btn-secondary');
  if (size === 'sm') classes.push('dtk-btn-sm');

  const children = [];
  if (icon) {
    children.push(tag('span', { textContent: icon }));
  }
  if (text) {
    children.push(tag('span', { textContent: text }));
  }

  const root = tag('button', {
    className: classes.join(' '),
    onclick: onClick || null,
  }, children);

  return root;
}
