import tag from 'html-tag-js';

export function SettingsItem({ icon, title, description, value, onClick }) {
  const root = tag('div', {
    className: 'dtk-settings-item',
    onclick: onClick || null,
  }, [
    icon ? tag('div', { className: 'dtk-settings-item-icon', textContent: icon }) : null,
    tag('div', { className: 'dtk-settings-item-content' }, [
      tag('p', { className: 'dtk-settings-item-title', textContent: title }),
      description ? tag('p', { className: 'dtk-settings-item-desc', textContent: description }) : null,
    ]),
    value ? tag('span', { className: 'dtk-settings-item-value', textContent: value }) : null,
  ].filter(Boolean));

  return root;
}
