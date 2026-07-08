import tag from 'html-tag-js';

export function Badge({ text, variant }) {
  const classes = ['dtk-badge'];
  if (variant) classes.push(`dtk-badge-${variant}`);

  const root = tag('span', {
    className: classes.join(' '),
    textContent: text || '',
  });

  return root;
}
