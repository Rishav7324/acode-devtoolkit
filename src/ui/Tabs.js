import tag from 'html-tag-js';

export function Tabs({ tabs, activeTab, onChange }) {
  const tabEls = tabs.map((t, i) => {
    return tag('button', {
      className: `dtk-tab${i === (activeTab || 0) ? ' is-active' : ''}`,
      textContent: t.label || t,
      onclick: () => {
        if (onChange) onChange(t.id || t, i);
      },
    });
  });

  const root = tag('div', { className: 'dtk-tabs' }, tabEls);

  root.setActive = (index) => {
    tabEls.forEach((el, i) => {
      el.classList.toggle('is-active', i === index);
    });
  };

  return root;
}
