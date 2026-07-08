import tag from 'html-tag-js';

export function Input({ placeholder, value, type, onChange }) {
  const root = tag('input', {
    className: 'dtk-input',
    type: type || 'text',
    placeholder: placeholder || '',
    value: value || '',
  });

  if (onChange) {
    root.oninput = (e) => onChange(e.target.value);
  }

  return root;
}
