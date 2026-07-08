import tag from 'html-tag-js';

export function Toggle({ label, description, checked, onChange }) {
  const thumb = tag('div', { className: 'dtk-toggle-thumb' });

  const toggleBtn = tag('button', {
    className: `dtk-toggle${checked ? ' is-on' : ' is-off'}`,
    onclick: () => {
      const newState = !checked;
      checked = newState;
      toggleBtn.className = `dtk-toggle${newState ? ' is-on' : ' is-off'}`;
      if (onChange) onChange(newState);
    },
  }, [thumb]);

  const root = tag('div', { className: 'dtk-toggle-row' }, [
    tag('div', { className: 'dtk-toggle-info' }, [
      tag('p', { className: 'dtk-toggle-label', textContent: label || '' }),
      description ? tag('p', { className: 'dtk-toggle-desc', textContent: description }) : null,
    ].filter(Boolean)),
    toggleBtn,
  ]);

  root.setChecked = (val) => {
    checked = val;
    toggleBtn.className = `dtk-toggle${val ? ' is-on' : ' is-off'}`;
  };

  root.getChecked = () => checked;

  return root;
}
