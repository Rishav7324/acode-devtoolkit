import tag from 'html-tag-js';

export function Checkbox({ label, checked, onChange }) {
  const root = tag('label', { className: 'dtk-checkbox' }, [
    tag('input', {
      type: 'checkbox',
      checked: checked || false,
      onchange: (e) => {
        if (onChange) onChange(e.target.checked);
      },
    }),
    tag('span', { textContent: label || '' }),
  ]);

  return root;
}
